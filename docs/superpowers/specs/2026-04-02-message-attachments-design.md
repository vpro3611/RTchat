# Design Spec: Message Attachments (Photos, Videos, Files)

## 1. Overview
Integrate the ability to send multiple attachments (photos, videos, files) within messages in the real-time chat application.

## 2. Goals
- Support multiple attachments per message.
- Secure processing: virus scanning (ClamAV), transcoding (FFmpeg), and metadata stripping.
- Efficient storage: Hybrid Metadata/Blob schema in PostgreSQL (bytea).
- Future-proof for S3 migration.

## 3. Architecture

### 3.1 Database Schema
Two new tables to separate metadata from binary data:

#### `attachment_blobs`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `data` | `bytea` | Raw binary data |
| `created_at` | `timestamptz` | Default `now()` |

#### `message_attachments`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `message_id` | `uuid` | FK -> `messages(id)` (CASCADE) |
| `blob_id` | `uuid` | FK -> `attachment_blobs(id)` |
| `type` | `varchar(20)` | 'image', 'video', 'file' |
| `name` | `text` | Original filename |
| `mime_type` | `varchar(100)` | |
| `size` | `integer` | Bytes |
| `created_at` | `timestamptz` | Default `now()` |

### 3.2 Domain Model
- **`Attachment` Entity**: Represents metadata and references the `blob_id`.
- **`Message` Entity**: Updated to include an optional list of `Attachment` objects.
- **Ports**:
    - `AttachmentRepoInterface`: CRUD for metadata.
    - `BlobRepoInterface`: CRUD for binary data.
    - `VirusScannerInterface`: Integration with ClamAV.
    - `MediaProcessorInterface`: Integration with Sharp (images) and FFmpeg (videos).

## 4. Data Flow (Sending a Message)
1. **API**: Receives `multipart/form-data` (text + multiple files).
2. **Validator**: Ensures files are ≤ 10MB.
3. **Scanner**: Runs `clamscan` on every file.
4. **Processor**:
    - **Images**: Resize (max 1200px), convert to WebP, strip EXIF.
    - **Videos**: Transcode/verify with FFmpeg, strip metadata.
    - **Files**: Basic metadata stripping.
5. **Storage**:
    - Save binary to `attachment_blobs`.
    - Save metadata to `message_attachments`.
    - Save message to `messages`.
    - *All wrapped in a database transaction.*

## 5. Security Measures
- **Virus Scanning**: Mandatory ClamAV check for all uploads.
- **Metadata Stripping**: Removal of sensitive info (GPS, author, etc.) from all media.
- **Type Enforcement**: Strict MIME-type validation.
- **Size Limits**: 10MB ceiling per attachment.

## 6. Implementation Plan
1. Create SQL migrations.
2. Implement Domain Entities (`Attachment`) and update `Message`.
3. Implement `AttachmentProcessor` (Sharp, FFmpeg, ClamAV).
4. Implement `AttachmentRepository` (PG realization).
5. Update `MessageRepository` to handle attachments.
6. Update `SendMessageUseCase` and `MessageController`.

## 7. Testing
- Unit tests for `Attachment` and `Message` updates.
- Integration tests for `AttachmentRepository`.
- E2E tests for sending messages with various attachment combinations.
