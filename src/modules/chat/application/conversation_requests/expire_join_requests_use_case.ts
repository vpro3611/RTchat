import { ExpireJoinRequestsTxService } from "../../transactional_services/conversation_requests/expire_join_requests_service";

export class ExpireJoinRequestsUseCase {
    constructor(private readonly expireService: ExpireJoinRequestsTxService) {}

    async execute(): Promise<number> {
        return await this.expireService.run();
    }
}
