# Typing Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real-time typing indicators for both group and private chats.

**Architecture:** Fix backend typing event names, add backend unit tests, update frontend `ChatStore` to manage typing states globally, and add UI components to `ChatPage.vue` for group (discrete line) and private (header status) chats.

**Tech Stack:** Node.js, TypeScript, Socket.io, Vue 3, Pinia (reactive state).

---

### Task 1: Fix Backend Typing Controllers and Event Names

**Files:**
- Modify: `src/modules/chat/web_socket_controllers/typing_controllers/start_typing_controller.ts`
- Modify: `src/modules/chat/web_socket_controllers/typing_controllers/stop_typing_controller.ts`

- [ ] **Step 1: Update StartTypingController to emit 'typing:start'**

```typescript
// Change io.to(conversationId).emit("typing:started", ...) 
// to io.to(conversationId).emit("typing:start", ...)
```

- [ ] **Step 2: Update StopTypingController to emit 'typing:stop'**

```typescript
// Change io.to(conversationId).emit("typing:stopped", ...) 
// to io.to(conversationId).emit("typing:stop", ...)
```

- [ ] **Step 3: Commit changes**

```bash
git add src/modules/chat/web_socket_controllers/typing_controllers/
git commit -m "fix(backend): use correct typing event names in controllers"
```

---

### Task 2: Backend Typing Controller Tests

**Files:**
- Create: `__tests__/chat/typing_controllers.spec.ts`

- [ ] **Step 1: Write tests for typing controllers**

```typescript
import { StartTypingController } from "../../src/modules/chat/web_socket_controllers/typing_controllers/start_typing_controller";
import { StopTypingController } from "../../src/modules/chat/web_socket_controllers/typing_controllers/stop_typing_controller";

describe("Typing Controllers", () => {
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    const socket = { data: { userId: { sub: "user-1" } } };

    it("StartTypingController should emit typing:start", async () => {
        const controller = new StartTypingController();
        await controller.startTypingController(socket as any, "conv-1", io as any);
        expect(io.to).toHaveBeenCalledWith("conv-1");
        expect(io.emit).toHaveBeenCalledWith("typing:start", { userId: "user-1", conversationId: "conv-1" });
    });

    it("StopTypingController should emit typing:stop", async () => {
        const controller = new StopTypingController();
        await controller.stopTypingController(socket as any, "conv-1", io as any);
        expect(io.to).toHaveBeenCalledWith("conv-1");
        expect(io.emit).toHaveBeenCalledWith("typing:stop", { userId: "user-1", conversationId: "conv-1" });
    });
});
```

- [ ] **Step 2: Run tests and verify PASS**

Run: `npm test __tests__/chat/typing_controllers.spec.ts`

- [ ] **Step 3: Commit changes**

```bash
git add __tests__/chat/typing_controllers.spec.ts
git commit -m "test(backend): add typing controller tests"
```

---

### Task 3: Frontend Store Update (ChatStore)

**Files:**
- Modify: `frontend-chat/src/stores/chat_store.ts`

- [ ] **Step 1: Add typingStatuses to ChatStore**

```typescript
// Add:
// typingStatuses: {} as Record<string, Set<string>>,

// Add methods:
// setTyping(conversationId: string, userId: string)
// stopTyping(conversationId: string, userId: string)
// getTypingUsers(conversationId: string): string[]
```

- [ ] **Step 2: Commit changes**

```bash
git add frontend-chat/src/stores/chat_store.ts
git commit -m "feat(frontend): add typing status management to ChatStore"
```

---

### Task 4: Frontend Socket Listener Update

**Files:**
- Modify: `frontend-chat/src/services/chat_socket.ts`

- [ ] **Step 1: Update typing:start and typing:stop listeners**

```typescript
    // In setupEventListeners:
    this.socket.on('typing:start', (data: { conversationId: string; userId: string }) => {
      ChatStore.setTyping(data.conversationId, data.userId);
    });

    this.socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
      ChatStore.stopTyping(data.conversationId, data.userId);
    });
```

- [ ] **Step 2: Commit changes**

```bash
git add frontend-chat/src/services/chat_socket.ts
git commit -m "feat(frontend): update typing socket listeners"
```

---

### Task 5: Frontend UI Implementation (ChatPage.vue)

**Files:**
- Modify: `frontend-chat/src/pages/ChatPage.vue`

- [ ] **Step 1: Implement typing display logic**

Add computed for `typingText` and integrate into template:
- Header (for direct chats): Replace status with "Typing..."
- Above Input (for group chats): Show "X is typing..."

- [ ] **Step 2: Commit changes**

```bash
git add frontend-chat/src/pages/ChatPage.vue
git commit -m "feat(frontend): show typing indicators in UI"
```
