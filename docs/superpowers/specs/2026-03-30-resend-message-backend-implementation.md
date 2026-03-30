# Design Spec: Resend Message Implementation (Backend)

Implement a secure and traceable "Resend Message" feature that allows users to copy a message from one conversation to another, while maintaining a reference to the original sender.

## 1. Goal
Provide a way for users to resend messages across conversations while preserving provenance (who originally sent it).

## 2. Changes

### 2.1 Database Schema (Verified)
The `messages` table already has the necessary columns via migration `1774815000000`:
- `original_sender_id`: UUID, references `users(id)`, nullable.
- `is_resent`: BOOLEAN, default `false`.

### 2.2 Domain Layer
Update `Message` entity in `src/modules/chat/domain/message/message.ts`:
- Add `originalSenderId?: string`.
- Add `isResent: boolean`.
- Update `restore` method to include these fields.
- Add `createResent` static method:
  ```typescript
  static createResent(
      targetConversationId: string,
      actorId: string,
      content: Content,
      originalSenderId: string
  ) {
      return new Message(
          crypto.randomUUID(),
          targetConversationId,
          actorId,
          content,
          false, // isEdited
          false, // isDeleted
          new Date(),
          new Date(),
          originalSenderId,
          true // isResent
      );
  }
  ```

### 2.3 DTO & Mapping
Update `MessageDTO` in `src/modules/chat/DTO/message_dto.ts`:
- Add `originalSenderId?: string`.
- Add `isResent: boolean`.

Update `MapToMessage` in `src/modules/chat/shared/map_to_message.ts`:
- Map `originalSenderId` and `isResent` to the DTO.

### 2.4 Repository Layer
Update `MessageRepositoryPg` in `src/modules/chat/repositories_pg_realization/message_repository_pg.ts`:
- `mapToMessage`: Extract `original_sender_id` and `is_resent` from DB row.
- `create`: Include `original_sender_id` and `is_resent` in the `INSERT` query.
- `findById` & `findByConversationId`: Ensure these columns are selected (using `SELECT *` already handles this, but `mapToMessage` needs the update).

### 2.5 Application Layer (Verified)
The `ResendMessageUseCase` in `src/modules/chat/application/message/resend_message_use_case.ts` is already implemented but requires the `Message.createResent` method and `originalSenderId` / `isResent` getters.

### 2.6 Transactional Service
The `ResendMessageTxService` in `src/modules/chat/transactional_services/message/resend_message_service.ts` is implemented but needs registration.

### 2.7 API Layer
Update `ResendMessageController` in `src/modules/chat/controllers/message/resend_message_controller.ts`:
- Ensure it uses the registered `ResendMessageTxService`.
- Emit `message:new` event via Socket.io to the target conversation.

### 2.8 Dependency Injection & Routing
Update `src/container.ts`:
- Instantiate `ResendMessageTxService`.
- Instantiate `ResendMessageController`.
- Add them to the returned container object.

Update `src/app.ts`:
- Add route: `POST /private/conversation/:conversationId/messages/:messageId/resend`
- Apply `validateParams` and `validateBody` middlewares.

## 3. Testing Plan
- **Unit Test**: Create `__tests__/chat/application/resend_message_use_case.spec.ts` (if not exists) to test permissions and blocking logic.
- **Integration Test**: Update `__tests__/chat/integration/resend_message_e2e.spec.ts` to verify the full flow and DB persistence.
