# Message Attachments Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a polished "real messenger" attachment system in the frontend, including gallery grids, a media viewer, and drag-and-drop uploads, while maintaining theme compatibility.

**Architecture:** 
- **Backend Bridge**: Serve files via a new GET endpoint.
- **Frontend Components**: Smart gallery grid, compact file list, and global media viewer.
- **Upload Flow**: Hybrid REST (files) and WebSocket (text-only) strategy.

**Tech Stack:** Vue 3, Quasar, Pinia, TypeScript.

---

### Task 1: Backend Bridge - Attachment Serving

**Files:**
- Create: `src/modules/chat/controllers/message/get_attachment_controller.ts`
- Modify: `src/container.ts`, `src/app.ts`

- [ ] **Step 1: Create GetAttachmentController**
Implement a controller to fetch binary data from `BlobRepositoryPg` and serve it with the correct headers.

- [ ] **Step 2: Register route in app.ts**
Add `GET /private/attachment/:blobId` route.

- [ ] **Step 3: Commit**
```bash
git add src/modules/chat/controllers/message/get_attachment_controller.ts src/container.ts src/app.ts
git commit -m "feat: add backend endpoint to serve attachments"
```

---

### Task 2: Frontend Types and API Integration

**Files:**
- Create: `frontend-chat/src/api/types/attachment.ts`
- Modify: `frontend-chat/src/api/types/message_response.ts`
- Modify: `frontend-chat/src/api/apis/message_api.ts`

- [ ] **Step 1: Define Attachment types**
Create `frontend-chat/src/api/types/attachment.ts` matching the backend DTO.

- [ ] **Step 2: Update Message interface**
Update `src/api/types/message_response.ts` to include `attachments: Attachment[]`.

- [ ] **Step 3: Update MessageApi**
Implement `sendMessageWithFiles(conversationId, content, files)` using `FormData`.

- [ ] **Step 4: Commit**
```bash
git add frontend-chat/src/api/types/ frontend-chat/src/api/apis/message_api.ts
git commit -m "feat: update frontend types and API for attachments"
```

---

### Task 3: Attachment Components (Gallery & Files)

**Files:**
- Create: `frontend-chat/src/components/AttachmentGallery.vue`
- Create: `frontend-chat/src/components/FileAttachment.vue`
- Modify: `frontend-chat/src/components/MessageBubble.vue`

- [ ] **Step 1: Implement AttachmentGallery**
Create a grid component that handles 1-4+ media items with theme-aware placeholders.

- [ ] **Step 2: Implement FileAttachment**
Create a compact row component for non-media files.

- [ ] **Step 3: Update MessageBubble**
Integrate the new components into the bubble layout.

- [ ] **Step 4: Commit**
```bash
git add frontend-chat/src/components/AttachmentGallery.vue frontend-chat/src/components/FileAttachment.vue frontend-chat/src/components/MessageBubble.vue
git commit -m "feat: implement attachment gallery and file components"
```

---

### Task 4: Media Viewer Global Service

**Files:**
- Create: `frontend-chat/src/components/MediaViewer.vue`
- Modify: `frontend-chat/src/pages/ChatPage.vue`

- [ ] **Step 1: Create MediaViewer component**
A full-screen `q-dialog` with image/video navigation.

- [ ] **Step 2: Integrate into ChatPage**
Add the viewer to the page and implement the opening logic.

- [ ] **Step 3: Commit**
```bash
git add frontend-chat/src/components/MediaViewer.vue frontend-chat/src/pages/ChatPage.vue
git commit -m "feat: implement global media viewer"
```

---

### Task 5: Upload UX (Drag-and-Drop & Previews)

**Files:**
- Create: `frontend-chat/src/components/DragAndDropOverlay.vue`
- Create: `frontend-chat/src/components/UploadPreviewBar.vue`
- Modify: `frontend-chat/src/pages/ChatPage.vue`

- [ ] **Step 1: Implement components**
Create the reactive overlay and the horizontal preview bar.

- [ ] **Step 2: Update ChatPage input handling**
Add file selection logic, state management for pending files, and update the `sendMessage` function to handle files.

- [ ] **Step 3: Final styling and theme check**
Ensure all new elements respect dark/light mode.

- [ ] **Step 4: Commit**
```bash
git add frontend-chat/src/components/DragAndDropOverlay.vue frontend-chat/src/components/UploadPreviewBar.vue frontend-chat/src/pages/ChatPage.vue
git commit -m "feat: add drag-and-drop and upload previews to chat"
```
