# Design: Join Request Expiration Cron Job

## Goal
Automatically set the status of pending join requests to `expired` if they were submitted more than 7 days ago.

## Architecture
The implementation follows the established patterns in the project:
1.  **Repository Layer**: `ConversationRequestsRepositoryPg` will implement the data update logic.
2.  **Application Layer**: `ExpireJoinRequestsUseCase` will coordinate the logic, and `ExpireJoinRequestsTxService` will manage transactions.
3.  **Infrastructure Layer**: `JoinRequestCronService` will handle the scheduling using `node-cron`.
4.  **Integration**: The service will be initialized in `assembleContainer` and started in `startServer`.

## Components

### 1. Repository & Interface
- **`ConversationRequestsInterface`**: Add `expireRequests(): Promise<number>`.
- **`ConversationRequestsRepositoryPg`**: Implement `expireRequests()` using a single SQL query:
  ```sql
  UPDATE conversation_join_requests
  SET status = 'expired'
  WHERE status = 'pending'
    AND submitted_at < NOW() - INTERVAL '7 days'
  RETURNING id;
  ```

### 2. Application Layer
- **`ExpireJoinRequestsUseCase`**:
  - Purpose: Expire all eligible requests.
  - Output: The count of expired requests.
- **`ExpireJoinRequestsTxService`**:
  - Purpose: Wrap the expiration logic in a database transaction.

### 3. Cron Service
- **`JoinRequestCronService`**:
  - Dependencies: `ExpireJoinRequestsUseCase`.
  - Schedule: `*/5 * * * *` (Every 5 minutes).
  - Initialization: Run once immediately upon start, then schedule.
  - Error Handling: Catch and log errors without interrupting the main application.

## Data Flow
1. `node-cron` triggers the task every 5 minutes.
2. `JoinRequestCronService.run()` is executed.
3. Calls `ExpireJoinRequestsUseCase.execute()`.
4. Calls `ExpireJoinRequestsTxService.run()`.
5. Executes the `UPDATE` query via the repository.
6. Returns the count of updated rows.
7. Logs the result (e.g., "Expired 5 join requests").

## Testing Strategy
1. **Repository Integration Test**:
   - Create pending requests with `submitted_at` set to:
     - 6 days ago (should NOT expire).
     - 8 days ago (should expire).
   - Call `expireRequests()`.
   - Assert that only the 8-day-old request is now `expired`.
2. **Use Case Unit Test**:
   - Mock the repository/service and verify it's called.
3. **Cron Service Verification**:
   - Verify that `node-cron.schedule` is called with the correct pattern.

## Docker
- `node-cron` will be added to `package.json`.
- No environment changes are required.
