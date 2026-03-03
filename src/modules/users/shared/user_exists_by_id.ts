import {UserRepoReader} from "../ports/user_repo_interfaces";
import {UserNotFoundError} from "../errors/use_case_errors";


export async function SHAREDUserExistsById(id: string, userRepo: UserRepoReader)
{
    const user = await userRepo.getUserById(id);
    if (!user) {
        throw new UserNotFoundError(`User not found`);
    }
    return user;
}