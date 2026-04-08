# Design: Typing Indicator

## Purpose
Show real-time typing status in the RTchat application to enhance the interactive experience. The indicator will show who is typing in group chats and private conversations.

## Architecture

### Backend Status
*   Backend already supports `typing:start` and `typing:stop` events via Socket.io.
*   Frontend `chatSocket` service already emits these events but needs to be updated to handle incoming ones.

### Frontend Changes

#### State (`ChatStore`)
*   Add `typingStatuses: Record<string, Set<string>>` where the key is `conversationId` and the value is a set of `userIds` currently typing.
*   Add methods `setTyping(conversationId, userId)` and `stopTyping(conversationId, userId)`.

#### Socket Listener (`chat_socket.ts`)
*   Update `onTyping` listener to update the `ChatStore` typing statuses instead of relying on callbacks in `ChatPage.vue`. This ensures the state is globally consistent.

#### UI Components (`ChatPage.vue`)
*   **Group Conversations (Option A):** Show "User1, User2 are typing..." in a small text line just above the message input field.
*   **Private Conversations (Option C):** Replace the "Online" status in the chat header with "Typing..." when the other user is typing.

## Data Flow
1.  User types in input field -> `handleTyping` (with debounce/timeout) calls `chatSocket.startTyping`.
2.  Backend receives and broadcasts `typing:start`.
3.  Other clients receive `typing:start` -> Update `ChatStore.typingStatuses[conversationId]`.
4.  UI reacts to store changes and displays the indicator based on conversation type.
5.  After 2 seconds of inactivity or user stops typing -> `chatSocket.stopTyping` called -> Backend broadcasts `typing:stop` -> Clients clear status.

## Error Handling
*   Add a local 5-second fallback timeout for each typing user on the frontend to clear the status if a `typing:stop` event is missed.

## Testing Strategy
1.  **Manual Testing:** Open multiple browsers, type in one, and verify the indicator appears in the others in both group and private chat scenarios.
2.  **Edge Case:** Verify that the indicator disappears when the user stops typing or sends the message.
