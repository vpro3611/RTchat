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
