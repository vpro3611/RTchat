import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";

const redis = new Redis({
  url: "https://easy-termite-36651.upstash.io",
  token: "AY8rAAIncDFlODBmMmYxMjVjZDM0ZWQ0YmQzOWU0ZTVjNzMyZTNhZnAxMzY2NTE",
});

const sessionId = randomUUID();

const context = {
  sessionId,
  projectPath: "/home/vpro3611",
  projectName: "RTchat",
  description: "Чат-приложение (full-stack)",
  
  techStack: {
    backend: "Node.js + Express + TypeScript 5.x",
    database: "PostgreSQL",
    cache: "Redis (Upstash)",
    realtime: "Socket.io",
    auth: "JWT",
    frontend: "Vue 3 + Quasar Framework"
  },
  
  notes: `Работали над функционалом блокировки пользователей (user-to-user blocks).
Создали 51 новый тест для функций block_specific_user, unblock_specific_user, get_full_black_list.
Исправили название таблицы с user_to_user_blocks на user_blocks (как в миграции).
Улучшили pg_error_mapper для обработки ошибок новых версий pg.
Исправили 2 старых фейлящихся теста.
Создали MCP-сервер для сохранения контекста между сессиями.`,
  
  keyFiles: [
    "src/modules/users/repositories/user_to_user_blocks_pg.ts",
    "src/modules/users/application/block_specific_user_use_case.ts",
    "src/modules/users/application/unblock_specific_user_use_case.ts",
    "src/modules/users/application/get_full_black_list_use_case.ts",
    "src/modules/users/controllers/block_specific_user_controller.ts",
    "src/modules/users/controllers/unblock_specific_user_controller.ts",
    "src/modules/users/controllers/get_full_black_list_controller.ts",
    "src/modules/error_mapper/pg_error_mapper.ts",
    "context-mcp-server/src/index.js"
  ],
  
  tests: {
    integration: [
      "__tests__/users/integration_tests/user_to_user_blocks_pg.spec.ts"
    ],
    unit_use_cases: [
      "__tests__/users/application_tests/block_specific_user_use_case.spec.ts",
      "__tests__/users/application_tests/unblock_specific_user_use_case.spec.ts",
      "__tests__/users/application_tests/get_full_black_list_use_case.spec.ts"
    ],
    e2e_controllers: [
      "__tests__/users/controller_tests/block_specific_user_controller.spec.ts",
      "__tests__/users/controller_tests/unblock_specific_user_controller.spec.ts",
      "__tests__/users/controller_tests/get_full_black_list_controller.spec.ts"
    ],
    fixed: [
      "__tests__/users/integration_tests/users_writer_integration.tests.spec.ts",
      "__tests__/chat/participant/application/get_specific_participant_use_case.spec.ts"
    ]
  },
  
  bugsFixed: [
    "Название таблицы: user_to_user_blocks -> user_blocks",
    "pg_error_mapper - улучшена обработка ошибок pg",
    "blockSpecificUser/unblockSpecificUser - добавлен запрос user data после INSERT/DELETE",
    "users_writer_integration - добавлена очистка FK таблиц",
    "get_specific_participant_use_case - моки с полными данными"
  ],
  
  apiEndpoints: [
    "PATCH /user/:targetId/block_user",
    "PATCH /user/:targetId/unblock_user", 
    "GET /user/black_list"
  ],
  
  mcpServer: {
    path: "context-mcp-server/",
    tools: ["save_context", "load_context", "list_contexts", "delete_context", "ping_redis"]
  },
  
  lastUpdated: new Date().toISOString()
};

async function save() {
  // Save context
  await redis.set(`context:${sessionId}`, JSON.stringify(context), { ex: 604800 });
  
  // Add to index
  await redis.zadd("contexts:index", { score: Date.now(), member: sessionId });
  
  console.log("✅ Context saved!");
  console.log("Session ID:", sessionId);
  console.log("Project:", context.projectPath);
}

save();
