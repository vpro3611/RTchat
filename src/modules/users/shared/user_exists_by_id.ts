import {UserRepoReader} from "../ports/user_repo_interfaces";
import {UserNotFoundError} from "../errors/use_case_errors";


export class UserLookup {
    constructor(private readonly userRepoReader: UserRepoReader) {}

    async getUserOrThrow(id: string) {
        const user = await this.userRepoReader.getUserById(id);
        if (!user) {
            throw new UserNotFoundError(`User not found`);
        }
        return user;
    }
}
