import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const CONTEXT_TTL = parseInt(process.env.CONTEXT_TTL || "604800"); // 7 days

// Upstash Redis client
const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

// In-memory store for quick access (session data)
let currentContext = {
  sessionId: null,
  projectPath: null,
  files: {},
  changes: [],
  notes: ""
};

/**
 * Save context to Redis
 */
async function saveContext(sessionId, context) {
  const key = `context:${sessionId}`;
  await redis.set(key, JSON.stringify({ ...context, lastUpdated: new Date().toISOString() }), { ex: CONTEXT_TTL });
  
  // Also update index of all contexts
  await redis.zadd("contexts:index", Date.now(), sessionId);
  
  return { success: true, sessionId };
}

/**
 * Load context from Redis
 */
async function loadContext(sessionId) {
  const key = `context:${sessionId}`;
  const data = await redis.get(key);
  
  if (!data) {
    return { success: false, error: "Context not found" };
  }
  
  return { success: true, context: typeof data === 'string' ? JSON.parse(data) : data };
}

/**
 * List all available contexts
 */
async function listContexts() {
  const sessions = await redis.zrevrange("contexts:index", 0, 9);
  const contexts = [];
  
  for (const sessionId of sessions) {
    const key = `context:${sessionId}`;
    const data = await redis.get(key);
    if (data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      contexts.push({
        sessionId,
        projectPath: parsed.projectPath,
        lastUpdated: parsed.lastUpdated,
        notes: parsed.notes?.substring(0, 100) || ""
      });
    }
  }
  
  return contexts;
}

/**
 * Delete context from Redis
 */
async function deleteContext(sessionId) {
  const key = `context:${sessionId}`;
  await redis.del(key);
  await redis.zrem("contexts:index", sessionId);
  return { success: true };
}

// MCP Server definition
const server = new Server(
  {
    name: "context-memory-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "save_context",
        description: "Save current conversation context (project path, files, changes, notes). Use this when you make significant changes to remember them for future sessions.",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: {
              type: "string",
              description: "Path to the project"
            },
            notes: {
              type: "string",
              description: "Summary of what was done and current state"
            },
            keyFiles: {
              type: "array",
              items: { type: "string" },
              description: "Important files that were modified or created"
            },
            changes: {
              type: "array",
              items: { type: "string" },
              description: "Summary of changes made"
            }
          },
          required: ["projectPath", "notes"]
        }
      },
      {
        name: "load_context",
        description: "Load previously saved context from a session. Returns project path, notes, files, and changes.",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: {
              type: "string",
              description: "Session ID to load (use 'latest' for most recent, or specific ID)"
            }
          },
          required: ["sessionId"]
        }
      },
      {
        name: "list_contexts",
        description: "List all available saved contexts/sessions",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "delete_context",
        description: "Delete a specific context session",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: {
              type: "string",
              description: "Session ID to delete"
            }
          },
          required: ["sessionId"]
        }
      },
      {
        name: "ping_redis",
        description: "Check if Redis connection is working",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "save_context": {
        const sessionId = args.sessionId || currentContext.sessionId || randomUUID();
        
        const context = {
          sessionId,
          projectPath: args.projectPath || currentContext.projectPath,
          notes: args.notes || currentContext.notes,
          keyFiles: args.keyFiles || currentContext.keyFiles || [],
          changes: args.changes || currentContext.changes || [],
          files: currentContext.files,
          lastUpdated: new Date().toISOString()
        };
        
        // Update in-memory context
        currentContext = { ...currentContext, sessionId, ...context };
        
        await saveContext(sessionId, context);
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Context saved!\nSession ID: ${sessionId}\nProject: ${context.projectPath}\nNotes: ${context.notes?.substring(0, 100)}...`
            }
          ]
        };
      }

      case "load_context": {
        let sessionIdToLoad = args.sessionId;
        
        if (sessionIdToLoad === "latest" || !sessionIdToLoad) {
          const sessions = await redis.zrevrange("contexts:index", 0, 0);
          sessionIdToLoad = sessions[0];
          
          if (!sessionIdToLoad) {
            return {
              content: [{ type: "text", text: "No saved contexts found." }]
            };
          }
        }
        
        const result = await loadContext(sessionIdToLoad);
        
        if (!result.success) {
          return {
            content: [{ type: "text", text: `Error: ${result.error}` }]
          };
        }
        
        // Update in-memory context
        currentContext = result.context;
        
        const ctx = result.context;
        const summary = `
📋 Loaded Context
Session ID: ${ctx.sessionId}
Project: ${ctx.projectPath}
Last Updated: ${ctx.lastUpdated}

📝 Notes:
${ctx.notes}

📁 Key Files (${ctx.keyFiles?.length || 0}):
${ctx.keyFiles?.map(f => `  - ${f}`).join("\n") || "  (none)"}

🔄 Changes (${ctx.changes?.length || 0}):
${ctx.changes?.map(c => `  - ${c}`).join("\n") || "  (none)"}
`.trim();
        
        return {
          content: [{ type: "text", text: summary }]
        };
      }

      case "list_contexts": {
        const contexts = await listContexts();
        
        if (contexts.length === 0) {
          return {
            content: [{ type: "text", text: "No saved contexts found." }]
          };
        }
        
        const list = contexts.map((ctx, i) => 
          `${i + 1}. ${ctx.sessionId?.substring(0, 8)}... | ${ctx.projectPath} | ${ctx.lastUpdated}`
        ).join("\n");
        
        return {
          content: [{ type: "text", text: `Available contexts:\n${list}` }]
        };
      }

      case "delete_context": {
        await deleteContext(args.sessionId);
        
        return {
          content: [{ type: "text", text: `Context ${args.sessionId} deleted.` }]
        };
      }

      case "ping_redis": {
        try {
          const pong = await redis.ping();
          return {
            content: [{ type: "text", text: `✅ Redis connection OK: ${pong}` }]
          };
        } catch (e) {
          return {
            content: [{ type: "text", text: `❌ Redis error: ${e.message}` }],
            isError: true
          };
        }
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

// Start server
async function main() {
  // Test Redis connection first
  try {
    await redis.ping();
    console.error("✅ Connected to Upstash Redis");
  } catch (e) {
    console.error("❌ Failed to connect to Redis:", e.message);
    process.exit(1);
  }
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Context MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
