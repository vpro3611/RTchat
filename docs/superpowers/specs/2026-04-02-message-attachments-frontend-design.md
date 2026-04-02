# Design Spec: Message Attachments Frontend (Photos, Videos, Files)

## 1. Overview
Implement a comprehensive "real messenger" attachment system in the frontend, allowing users to send and view multiple photos, videos, and files with a gallery-style interface.

## 2. Goals
- Support multiple attachments per message with a smart gallery grid.
- Full-screen media viewer for images and videos.
- Seamless "Drag-and-Drop" and "Paperclip" upload experience.
- REST-based upload for files (FormData) while maintaining WebSocket for text-only.
- Visual upload feedback and error handling (10MB limit, virus scanning).

## 3. Architecture

### 3.1 Data Model Integration
- **Types**: Update `Message` interface to include `Attachment[]`.
- **API**: Implement `MessageApi.sendMessageWithFiles(conversationId, content, files)` using `FormData`.

### 3.2 Key Components
- **`AttachmentGallery.vue`**:
    - Smart grid for 1-4+ media items.
    - Video overlays (play icon, duration).
- **`FileAttachment.vue`**:
    - Compact row for non-media files (icon, name, size).
- **`MediaViewer.vue`**:
    - Global full-screen modal service.
    - Image zoom/pan and video playback.
- **`UploadPreviewBar.vue`**:
    - Thumbnails of pending files above the input field.
- **`DragAndDropOverlay.vue`**:
    - Reactive full-chat drop zone.

## 4. Interaction Flow
1. **Selection**: User clicks paperclip or drops files.
2. **Preview**: Files appear in `UploadPreviewBar`.
3. **Submission**:
    - If files present: REST API (`FormData`) call.
    - If text only: WebSocket message.
4. **Display**: Message appears with attachments; gallery grid renders for media.
5. **Viewing**: Clicking a gallery item opens `MediaViewer`.

## 5. UI/UX (ui-ux-pro-max)
- **Transitions**: Smooth `ease-out` for drop overlay and previews.
- **Dark Mode**: Fully themed for OLED Dark Mode.
- **Feedback**: Progress indicators during upload; Quasar notifications for errors.
- **Cursors**: `cursor-pointer` on all interactive thumbnails.

## 6. Implementation Plan
1. Update types and API fetcher.
2. Create `FileAttachment` and `AttachmentGallery` components.
3. Integrate components into `MessageBubble`.
4. Implement `MediaViewer` global service.
5. Implement `DragAndDropOverlay` and `UploadPreviewBar` in `ChatPage`.
6. Add file upload logic to `ChatPage` input handling.

## 7. Verification
- Test sending 1, 2, 3, 4, and 5+ photos (ensure grid works).
- Test sending videos (ensure playback works).
- Test sending non-media files (ensure download works).
- Test Drag-and-Drop activation.
- Verify 10MB limit rejection and notification.
