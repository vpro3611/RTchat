# Design Spec: Frontend Reply to Message

**Date:** 2026-04-05  
**Topic:** Message Replies (Frontend)  
**Status:** Draft

## 1. Overview
Implement the frontend portion of the "Reply to Message" feature, including contract updates, UI components for replying, and rendering of reply context within message bubbles.

## 2. API / Contract Changes
### `src/api/types/message_response.ts`
```typescript
export interface Message {
  // ... existing fields
  replyTo?: {
    id: string;
    snippet: string;
    senderId: string;
  };
}
```

## 3. UI Components
### `MessageBubble.vue`
- **Reply Rendering:** If `message.replyTo` exists, show a block with the parent sender's name and a snippet of their message.
- **Theming:** Use theme-aware classes like `bg-grey-2` (light) and `bg-dark-light` (dark) or similar Quasar utility classes.
- **Actions:** 
    - Add "Reply" to the `q-menu`.
    - Implement `v-touch-swipe.right` to trigger reply.
- **Navigation:** Clicking the reply block emits a `scroll-to-parent` event with the `parentId`.

### `ChatPage.vue`
- **Input Area:** Show a preview of the message being replied to above the text input.
- **State:** `replyingToMessage` (reactive ref).
- **Navigation Logic:** Implement a `scrollToMessage(messageId: string)` function that finds the DOM element and scrolls smoothly, followed by a brief highlight animation.

## 4. Socket & API Integration
- Update `chatSocket.sendMessage` to accept `parentMessageId`.
- Update `MessageApi.sendMessage` and `sendMessageWithFiles` to accept `parentMessageId`.

## 5. Theming
- **Reply Block Background:** `rgba(0,0,0,0.05)` for light mode, `rgba(255,255,255,0.1)` for dark mode.
- **Border Left:** Use `var(--q-primary)` for the accent line.

## 6. Verification Strategy
- **Manual Test:** 
    - Verify reply preview appears in the input bar.
    - Verify reply block appears in the message bubble.
    - Verify "Scroll to Parent" works and highlights the correct message.
    - Verify look and feel in both light and dark themes.
