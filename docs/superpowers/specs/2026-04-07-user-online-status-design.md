# Design: Online/Offline User Status Indicator

## Purpose
Show real-time user online/offline status in the RTchat application to improve the user experience and show activity within group conversations and private chats.

## Architecture

### Backend Changes
1.  **Repository:** Add `updateLastSeenAt(userId: string, date: Date)` to `UserWriterRepoPG`.
2.  **Use Case:** Create `UpdateLastSeenAtUseCase` in `src/modules/users/application`.
3.  **Socket Gateway (`ChatGateway`):**
    *   Inject `UpdateLastSeenAtUseCase`.
    *   On disconnect (when `ONLINE_USERS` entry is removed), call `UpdateLastSeenAtUseCase` to persist the current time to the database.
    *   Emit `user:online` and `user:offline` events as already implemented.

### Frontend Changes
1.  **State (`UserCacheStore`):**
    *   Add `isOnline: Record<string, boolean>` to track status in memory.
    *   Add `lastSeenAt: Record<string, string>` to track the last seen time.
2.  **Socket Listener (`chat_socket.ts`):**
    *   Listen for `user:online` and set `isOnline[userId] = true`.
    *   Listen for `user:offline` and set `isOnline[userId] = false`, updating `lastSeenAt[userId]` to the current time.
3.  **UI Components:**
    *   `AppAvatar.vue`: Add an `isOnline` prop to show a green dot (Option A).
    *   `ChatPage.vue` (Header): Display "Online" or "Last seen [formatted time]" below the name for private chats (Option B).
    *   `ParticipantListDialog.vue`: Pass the `isOnline` prop to the avatars in the list.

## Data Flow
1.  User connects -> Backend emits `user:online` -> Frontend updates `UserCacheStore`.
2.  User disconnects -> Backend updates DB with `lastSeenAt` -> Backend emits `user:offline` -> Frontend updates `UserCacheStore`.

## Error Handling
*   If the database update for `lastSeenAt` fails, the `user:offline` event should still be emitted to ensure UI consistency.

## Testing Strategy
1.  **Unit Tests:** Verify `UpdateLastSeenAtUseCase`.
2.  **Integration Tests:** Check that `ChatGateway` correctly emits status events and calls the use case on disconnect.
3.  **Manual Testing:** Open the app in two tabs/browsers, log in with different users, and observe the status indicators appearing/disappearing.
