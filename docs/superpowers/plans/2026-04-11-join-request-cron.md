# Join Request Expiration Cron Job Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically set pending join requests to `expired` if they are older than 7 days, running every 5 minutes and at server start.

**Architecture:** Repository-level update for efficiency, wrapped in a transactional service and use case, scheduled by a dedicated cron service using `node-cron`.

**Tech Stack:** Node.js, TypeScript, PostgreSQL, node-cron.

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install node-cron and its types**
Run: `npm install node-cron && npm install -D @types/node-cron`

- [ ] **Step 2: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: install node-cron dependencies"
```

### Task 2: Update Repository Interface

**Files:**
- Modify: `src/modules/chat/domain/ports/conversation_requests_interface.ts`

- [ ] **Step 1: Add expireRequests to the interface**
```typescript
export interface ConversationRequestsInterface {
    // ... existing methods
    expireRequests(): Promise<number>;
}
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/chat/domain/ports/conversation_requests_interface.ts
git commit -m "feat: add expireRequests to ConversationRequestsInterface"
```

### Task 3: Implement Repository Method

**Files:**
- Modify: `src/modules/chat/repositories_pg_realization/conversation_requests_repository_pg.ts`

- [ ] **Step 1: Implement expireRequests**
```typescript
    async expireRequests(): Promise<number> {
        try {
            const query = `
                UPDATE conversation_join_requests
                SET status = 'expired'
                WHERE status = 'pending'
                  AND submitted_at < NOW() - INTERVAL '7 days'
                RETURNING id;
            `;
            const result = await this.pool.query(query);
            return result.rowCount ?? 0;
        } catch (error) {
            throw mapPgError(error);
        }
    }
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/chat/repositories_pg_realization/conversation_requests_repository_pg.ts
git commit -m "feat: implement expireRequests in ConversationRequestsRepositoryPg"
```

### Task 4: Create Transactional Service

**Files:**
- Create: `src/modules/chat/transactional_services/conversation_requests/expire_join_requests_service.ts`

- [ ] **Step 1: Write the service**
```typescript
import { TransactionManager } from "../../infrasctructure/ports/transaction_manager/transaction_manager";
import { EncryptionPort } from "../../infrasctructure/ports/encryption/encryption_port";
import { ConversationRequestsRepositoryPg } from "../../repositories_pg_realization/conversation_requests_repository_pg";

export class ExpireJoinRequestsTxService {
    constructor(
        private readonly txManager: TransactionManager,
        private readonly encryptionService: EncryptionPort
    ) {}

    async run(): Promise<number> {
        return await this.txManager.withTransaction(async (client) => {
            const repo = new ConversationRequestsRepositoryPg(client, this.encryptionService);
            return await repo.expireRequests();
        });
    }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/chat/transactional_services/conversation_requests/expire_join_requests_service.ts
git commit -m "feat: create ExpireJoinRequestsTxService"
```

### Task 5: Create Use Case

**Files:**
- Create: `src/modules/chat/application/conversation_requests/expire_join_requests_use_case.ts`

- [ ] **Step 1: Write the use case**
```typescript
import { ExpireJoinRequestsTxService } from "../../transactional_services/conversation_requests/expire_join_requests_service";

export class ExpireJoinRequestsUseCase {
    constructor(private readonly expireService: ExpireJoinRequestsTxService) {}

    async execute(): Promise<number> {
        return await this.expireService.run();
    }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/chat/application/conversation_requests/expire_join_requests_use_case.ts
git commit -m "feat: create ExpireJoinRequestsUseCase"
```

### Task 6: Create Cron Service

**Files:**
- Create: `src/modules/chat/infrastructure/cron/join_request_cron_service.ts`

- [ ] **Step 1: Write the cron service**
```typescript
import cron from "node-cron";
import { ExpireJoinRequestsUseCase } from "../../application/conversation_requests/expire_join_requests_use_case";

export class JoinRequestCronService {
    constructor(private readonly expireUseCase: ExpireJoinRequestsUseCase) {}

    start() {
        // Run immediately on start
        this.runTask();

        // Schedule every 5 minutes
        cron.schedule("*/5 * * * *", () => {
            this.runTask();
        });
        
        console.log("JoinRequestCronService started: running every 5 minutes.");
    }

    private async runTask() {
        try {
            const expiredCount = await this.expireUseCase.execute();
            if (expiredCount > 0) {
                console.log(`[Cron] Expired ${expiredCount} join requests.`);
            }
        } catch (error) {
            console.error("[Cron] Error expiring join requests:", error);
        }
    }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/chat/infrastructure/cron/join_request_cron_service.ts
git commit -m "feat: create JoinRequestCronService"
```

### Task 7: Integrate in Container

**Files:**
- Modify: `src/container.ts`

- [ ] **Step 1: Register new services in assembleContainer**
```typescript
import { ExpireJoinRequestsService } from "./modules/chat/transactional_services/conversation_requests/expire_join_requests_service";
import { ExpireJoinRequestsUseCase } from "./modules/chat/application/conversation_requests/expire_join_requests_use_case";
import { JoinRequestCronService } from "./modules/chat/infrastructure/cron/join_request_cron_service";

// Inside assembleContainer function:

    // ... after other services
    const expireJoinRequestsService = new ExpireJoinRequestsTxService(txManager, encryptionService);
    const expireJoinRequestsUseCase = new ExpireJoinRequestsUseCase(expireJoinRequestsService);
    const joinRequestCronService = new JoinRequestCronService(expireJoinRequestsUseCase);

    return {
        // ... existing returns
        joinRequestCronService,
    }
```

- [ ] **Step 2: Commit**
```bash
git add src/container.ts
git commit -m "feat: register JoinRequestCronService in container"
```

### Task 8: Start Cron in Server

**Files:**
- Modify: `src/server.ts`

- [ ] **Step 1: Start the cron service**
```typescript
    // Inside startServer function:
    const dependencies = assembleContainer(gateway.getIo());
    
    // Start cron job
    dependencies.joinRequestCronService.start();
```

- [ ] **Step 2: Commit**
```bash
git add src/server.ts
git commit -m "feat: start JoinRequestCronService in startServer"
```

### Task 9: Verification (Tests)

**Files:**
- Create: `__tests__/chat/conversation_requests/expire_join_requests_integration.spec.ts`

- [ ] **Step 1: Write integration test for expiration logic**
```typescript
import { pool } from "../../../src/database";
import { ConversationRequestsRepositoryPg } from "../../../src/modules/chat/repositories_pg_realization/conversation_requests_repository_pg";
import { CryptoEncryptionService } from "../../../src/modules/infrasctructure/crypto_encryption_service";

describe("ExpireJoinRequests Integration", () => {
    const encryptionService = new CryptoEncryptionService();
    const repo = new ConversationRequestsRepositoryPg(pool, encryptionService);

    it("should expire requests older than 7 days", async () => {
        // Cleanup and Setup test data
        // ... (Logic to insert one request with submitted_at = now - 8 days and one with now - 6 days)
        // Call repo.expireRequests()
        // Verify statuses in DB
    });
});
```

- [ ] **Step 2: Run tests**
Run: `npm test __tests__/chat/conversation_requests/expire_join_requests_integration.spec.ts`

- [ ] **Step 3: Commit**
```bash
git add __tests__/chat/conversation_requests/expire_join_requests_integration.spec.ts
git commit -m "test: add integration test for join request expiration"
```
