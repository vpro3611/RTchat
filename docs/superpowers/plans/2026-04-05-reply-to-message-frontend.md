# Frontend Reply to Message Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the frontend "Reply to Message" feature with contract updates, UI components for replying, and theme-aware rendering.

**Architecture:** Update the `Message` type and API/Socket services to support `parentMessageId`. Implement the reply UI in `MessageBubble.vue` and `ChatPage.vue`, using Quasar's dynamic variables for theme compatibility.

**Tech Stack:** Vue 3, Quasar Framework, TypeScript, Socket.io.

---

### Task 1: Update API Types and Services

**Files:**
- Modify: `frontend-chat/src/api/types/message_response.ts`
- Modify: `frontend-chat/src/api/apis/message_api.ts`
- Modify: `frontend-chat/src/services/chat_socket.ts`

- [ ] **Step 1: Update the Message interface**

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

- [ ] **Step 2: Update MessageApi methods**

```typescript
  sendMessage(conversationId: string, content: string, parentMessageId?: string) {
    return fetchJson<SendMessageResponse>(
      `${BaseUrl.apiBaseUrl}/private/conversation/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthStore.accessToken}`
        },
        body: JSON.stringify({content, parentMessageId}),
      }
    );
  },

  sendMessageWithFiles(conversationId: string, content: string, files: File[], parentMessageId?: string) {
    const formData = new FormData();
    formData.append('content', content);
    if (parentMessageId) {
      formData.append('parentMessageId', parentMessageId);
    }
    files.forEach(file => {
      formData.append('files', file);
    });
    // ... rest of logic
  }
```

- [ ] **Step 3: Update ChatSocketService**

```typescript
  sendMessage(conversationId: string, content: string, parentMessageId?: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('message:send', { conversationId, content, parentMessageId });
  }
```

- [ ] **Step 4: Commit**

```bash
git add frontend-chat/src/api/types/message_response.ts frontend-chat/src/api/apis/message_api.ts frontend-chat/src/services/chat_socket.ts
git commit -m "feat(frontend): update types and services for message replies"
```

---

### Task 2: Enhance MessageBubble.vue

**Files:**
- Modify: `frontend-chat/src/components/MessageBubble.vue`

- [ ] **Step 1: Add reply rendering block**

```vue
<!-- Add this inside the message bubble, above content -->
<div 
  v-if="message.replyTo" 
  class="reply-context q-mb-xs rounded-borders cursor-pointer"
  @click="emit('scroll-to-parent', message.replyTo.id)"
>
  <div class="row items-center no-wrap q-gutter-x-xs">
    <div class="reply-accent-line bg-primary" />
    <div class="col overflow-hidden">
      <div class="text-weight-bold text-primary" style="font-size: 11px;">
        {{ UserCacheStore.getUsername(message.replyTo.senderId) || 'User' }}
      </div>
      <div class="text-caption ellipsis" :class="isOwn ? 'text-white' : 'text-grey-7'" style="font-size: 11px; opacity: 0.9;">
        {{ message.replyTo.snippet }}
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add CSS for reply-context (theme-aware)**

```css
.reply-context {
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px 4px 0;
  border-radius: 4px;
  overflow: hidden;
}

.body--dark .reply-context {
  background: rgba(255, 255, 255, 0.1);
}

.reply-accent-line {
  width: 3px;
  height: 100%;
  min-height: 24px;
  border-radius: 2px;
}
```

- [ ] **Step 3: Add "Reply" option to context menu and emit event**

- [ ] **Step 4: Commit**

```bash
git add frontend-chat/src/components/MessageBubble.vue
git commit -m "feat(frontend): render reply context in MessageBubble"
```

---

### Task 3: Update ChatPage.vue (State & Interaction)

**Files:**
- Modify: `frontend-chat/src/pages/ChatPage.vue`

- [ ] **Step 1: Add reply-related state and logic**

```typescript
const replyingToMessage = ref<Message | null>(null);

function startReply(msg: Message) {
  replyingToMessage.value = msg;
  isEditing.value = false; // Cancel edit if replying
  focusInput();
}

function cancelReply() {
  replyingToMessage.value = null;
}
```

- [ ] **Step 2: Update sendMessage logic to include parentMessageId**

```typescript
async function sendMessage() {
  // ...
  const parentId = replyingToMessage.value?.id;
  
  if (hasFiles) {
    await MessageApi.sendMessageWithFiles(conversationId.value, content, pendingFiles.value, parentId);
  } else {
    chatSocket.sendMessage(conversationId.value, content, parentId);
  }
  
  cancelReply();
  // ...
}
```

- [ ] **Step 3: Implement "Scroll to Parent" logic**

```typescript
function scrollToMessage(messageId: string) {
  const el = document.getElementById(`msg-${messageId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('highlight-message');
    setTimeout(() => el.classList.remove('highlight-message'), 2000);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend-chat/src/pages/ChatPage.vue
git commit -m "feat(frontend): implement reply logic and scroll-to-parent in ChatPage"
```

---

### Task 4: UI Refinement (Input Bar & Styles)

**Files:**
- Modify: `frontend-chat/src/pages/ChatPage.vue`

- [ ] **Step 1: Add the Reply Preview Bar above the input field**

```vue
<div v-if="replyingToMessage" class="reply-preview-bar row items-center q-pa-sm q-mb-sm rounded-borders">
  <div class="col">
    <div class="text-primary text-weight-bold" style="font-size: 11px;">
      Replying to {{ UserCacheStore.getUsername(replyingToMessage.senderId) }}
    </div>
    <div class="text-caption ellipsis text-grey-7" style="font-size: 11px;">
      {{ replyingToMessage.content }}
    </div>
  </div>
  <q-btn flat round dense icon="close" size="sm" @click="cancelReply" />
</div>
```

- [ ] **Step 2: Add highlight animation CSS**

```css
@keyframes highlight-flash {
  0% { background-color: rgba(var(--q-primary), 0.2); }
  100% { background-color: transparent; }
}
.highlight-message {
  animation: highlight-flash 2s ease-out;
}
```

- [ ] **Step 3: Verify the feature in both light and dark themes**

- [ ] **Step 4: Commit**

```bash
git add frontend-chat/src/pages/ChatPage.vue
git commit -m "feat(frontend): add reply preview bar and highlight animation"
```
