# Avatar Implementation Design

**Date**: 2026-03-28
**Status**: Approved

## 1. Overview
Implementation of a secure, binary-based avatar system for users and group conversations.

## 2. Database Schema

### 2.1 Table: `avatars`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, Default gen_random_uuid() |
| data | BYTEA | NOT NULL |
| mime_type | VARCHAR(50) | NOT NULL (e.g., image/webp) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 2.2 Table Changes
- **users**: Add `avatar_id` (UUID, FK referencing avatars.id, ON DELETE SET NULL)
- **conversations**: Add `avatar_id` (UUID, FK referencing avatars.id, ON DELETE SET NULL)

## 3. Application Logic

### 3.1 Validation & Security
- **Multer**: Limit file size to 2MB.
- **Sharp Processing**:
    - Strip all EXIF/metadata.
    - Resize to max 500x500 (maintain aspect ratio).
    - Convert to WebP format.
- **Format Support**: Accept JPEG, PNG, WebP only.

### 3.2 Use Cases
- **SetAvatarUseCase (User)**: Process image -> Create `avatars` row -> Update `users` -> Delete old `avatars` row.
- **SetAvatarUseCase (Conversation)**: Verify actor is Owner -> Process image -> Create `avatars` row -> Update `conversations` -> Delete old `avatars` row.
- **DeleteAvatarUseCase**: Update reference to NULL -> Delete binary row.

## 4. API Interface

### 4.1 Public
- `GET /public/avatar/:avatarId`: Serves raw binary with correct mime-type and cache headers.

### 4.2 Private
- `POST /private/me/avatar`: Multipart upload for self.
- `DELETE /private/me/avatar`: Remove self avatar.
- `POST /private/conversation/:conversationId/avatar`: Multipart upload for group (Owner only).
- `DELETE /private/conversation/:conversationId/avatar`: Remove group avatar (Owner only).

## 5. Testing Plan
- **Integration**: Verify BYTEA storage and FK cleanup in PostgreSQL.
- **Unit**: Verify sharp integration and permission logic in Use Cases.
- **E2E**: Full multipart upload cycle using supertest.
