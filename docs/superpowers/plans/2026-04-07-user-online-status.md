# User Online Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show real-time user online/offline status in the RTchat application.

**Architecture:** Use Socket.io events (`user:online`, `user:offline`) for real-time updates and persist `lastSeenAt` to the database on disconnect. Update the frontend store to track online status and show visual indicators in avatars and chat headers.

**Tech Stack:** Node.js, TypeScript, PostgreSQL, Socket.io, Vue 3, Pinia (reactive state).

---

### Task 1: Backend Repository Update

**Files:**
- Modify: `src/modules/users/repositories/user_repo_writer_pg.ts`

- [ ] **Step 1: Add updateLastSeenAt method to UserWriterRepoPG**

```typescript
    async updateLastSeenAt(userId: string, lastSeenAt: Date): Promise<void> {
        try {
            const query = `
                UPDATE users
                SET last_seen_at = $1, updated_at = NOW()
                WHERE id = $2
            `;
            await this.pool.query(query, [lastSeenAt, userId]);
        } catch (error: any) {
            this.mapSaveError(error);
        }
    }
```

- [ ] **Step 2: Commit changes**

```bash
git add src/modules/users/repositories/user_repo_writer_pg.ts
git commit -m "feat(backend): add updateLastSeenAt to user repository"
```

---

### Task 2: Backend Use Case Creation

**Files:**
- Create: `src/modules/users/application/update_last_seen_at_use_case.ts`
- Test: `__tests__/users/application_tests/update_last_seen_at_use_case.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { UpdateLastSeenAtUseCase } from "../../../src/modules/users/application/update_last_seen_at_use_case";

describe("UpdateLastSeenAtUseCase", () => {
    it("should update last seen at for a user", async () => {
        const repo = { updateLastSeenAt: jest.fn() };
        const useCase = new UpdateLastSeenAtUseCase(repo as any);
        const date = new Date();
        await useCase.execute("user-id", date);
        expect(repo.updateLastSeenAt).toHaveBeenCalledWith("user-id", date);
    });
});
```

- [ ] **Step 2: Create the use case**

```typescript
import { UserWriterRepoPG } from "../repositories/user_repo_writer_pg";

export class UpdateLastSeenAtUseCase {
    constructor(private userRepo: UserWriterRepoPG) {}

    async execute(userId: string, lastSeenAt: Date): Promise<void> {
        await this.userRepo.updateLastSeenAt(userId, lastSeenAt);
    }
}
```

- [ ] **Step 3: Run tests and verify PASS**

Run: `npm test __tests__/users/application_tests/update_last_seen_at_use_case.spec.ts`

- [ ] **Step 4: Commit changes**

```bash
git add src/modules/users/application/update_last_seen_at_use_case.ts __tests__/users/application_tests/update_last_seen_at_use_case.spec.ts
git commit -m "feat(backend): add UpdateLastSeenAtUseCase"
```

---

### Task 3: Backend Dependency Injection and Gateway Integration

**Files:**
- Modify: `src/container.ts`
- Modify: `src/modules/chat/web_socket/chat_gateway.ts`

- [ ] **Step 1: Register Use Case in container.ts**

Update `container.ts` to include `UpdateLastSeenAtUseCase`.

- [ ] **Step 2: Update ChatGateway to use the use case**

Modify `ChatGateway` constructor and `handleDisconnect`.

```typescript
// In ChatGateway
    private handleDisconnect = async (socket: AuthSocket) => {
        const userId = this.extractUserIdSocket(socket);
        const sockets = this.ONLINE_USERS.get(userId.sub);
        if (!sockets) return;

        sockets.delete(socket.id);

        if (sockets.size === 0) {
            this.ONLINE_USERS.delete(userId.sub);
            this.io.emit("user:online", { userId: userId.sub, isOnline: false }); // existing line may vary
            this.io.emit("user:offline", { userId: userId.sub });
            
            // Persist to DB
            await this.updateLastSeenAtUseCase.execute(userId.sub, new Date());
        }
    }
```

- [ ] **Step 3: Commit changes**

```bash
git add src/container.ts src/modules/chat/web_socket/chat_gateway.ts
git commit -m "feat(backend): integrate UpdateLastSeenAtUseCase into ChatGateway"
```

---

### Task 4: Frontend Store Update

**Files:**
- Modify: `frontend-chat/src/stores/user_cache_store.ts`

- [ ] **Step 1: Add isOnline and lastSeenAt to UserCacheStore**

```typescript
export const UserCacheStore = reactive({
  byId: {} as UserById,
  isOnline: {} as Record<string, boolean>,
  lastSeenAt: {} as Record<string, string>,
  loading: new Set<string>(),

  // ...
  
  setStatus(userId: string, isOnline: boolean, lastSeenAt?: string) {
    this.isOnline[userId] = isOnline;
    if (lastSeenAt) {
      this.lastSeenAt[userId] = lastSeenAt;
    } else if (!isOnline) {
      this.lastSeenAt[userId] = new Date().toISOString();
    }
  },

  async ensureUser(userId: string | null | undefined) {
    // ... existing logic ...
    try {
      const user = await UserApi.getSpecificUser(userId)
      this.byId[userId] = user
      // Initialize status from user data
      this.lastSeenAt[userId] = user.lastSeenAt;
    } catch (e) {
      // ...
    }
  }
})
```

- [ ] **Step 2: Commit changes**

```bash
git add frontend-chat/src/stores/user_cache_store.ts
git commit -m "feat(frontend): update UserCacheStore to track online status"
```

---

### Task 5: Frontend Socket Listener

**Files:**
- Modify: `frontend-chat/src/services/chat_socket.ts`

- [ ] **Step 1: Listen for user:online and user:offline**

```typescript
    // In setupEventListeners
    this.socket.on('user:online', (data: { userId: string }) => {
      UserCacheStore.setStatus(data.userId, true);
    });

    this.socket.on('user:offline', (data: { userId: string }) => {
      UserCacheStore.setStatus(data.userId, false);
    });
```

- [ ] **Step 2: Commit changes**

```bash
git add frontend-chat/src/services/chat_socket.ts
git commit -m "feat(frontend): add online/offline socket listeners"
```

---

### Task 6: Frontend UI Components (Avatar Dot)

**Files:**
- Modify: `frontend-chat/src/components/AppAvatar.vue`
- Modify: `frontend-chat/src/components/ParticipantListDialog.vue`

- [ ] **Step 1: Add isOnline prop and dot to AppAvatar.vue**

```vue
<script setup lang="ts">
// ...
const props = defineProps<{
  avatarId?: string | null | undefined;
  name?: string | undefined;
  size?: string;
  square?: boolean;
  isOnline?: boolean; // New prop
}>();
// ...
</script>

<template>
  <q-avatar ...>
    <!-- ... -->
    <div v-if="isOnline" class="online-indicator"></div>
  </q-avatar>
</template>

<style scoped>
/* ... */
.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background-color: #4caf50;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 1;
}
</style>
```

- [ ] **Step 2: Pass isOnline in ParticipantListDialog.vue**

Update usages of `AppAvatar` in `ParticipantListDialog.vue` to pass `UserCacheStore.isOnline[participant.userId]`.

- [ ] **Step 3: Commit changes**

```bash
git add frontend-chat/src/components/AppAvatar.vue frontend-chat/src/components/ParticipantListDialog.vue
git commit -m "feat(frontend): show online indicator on avatars"
```

---

### Task 7: Frontend UI Components (Chat Header)

**Files:**
- Modify: `frontend-chat/src/pages/ChatPage.vue`

- [ ] **Step 1: Update header to show online status**

Find the chat header section and add a status line. Use `date.formatTime` or similar if available for `lastSeenAt`.

- [ ] **Step 2: Commit changes**

```bash
git add frontend-chat/src/pages/ChatPage.vue
git commit -m "feat(frontend): show online status in chat header"
```
