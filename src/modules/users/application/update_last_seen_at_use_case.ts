import { UserRepoWriterPg } from "../repositories/user_repo_writer_pg";

export class UpdateLastSeenAtUseCase {
    constructor(private userRepo: UserRepoWriterPg) {}

    async execute(userId: string, lastSeenAt: Date): Promise<void> {
        await this.userRepo.updateLastSeenAt(userId, lastSeenAt);
    }
}
