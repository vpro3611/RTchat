import {User} from "../domain/user";

export interface UserToUserBlocksInterface {
    blockSpecificUser(actorId: string, targetId: string): Promise<User>;
    unblockSpecificUser(actorId: string, targetId: string): Promise<User>;
    getFullBlacklist(actorId: string): Promise<User[]>;
    ensureBlockedExists(actorId: string, targetId: string): Promise<boolean>;
    ensureAnyBlocksExists(actorId: string, targetId: string): Promise<boolean>
}

