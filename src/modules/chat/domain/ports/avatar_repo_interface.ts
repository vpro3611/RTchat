import { Avatar } from "../avatar/avatar";

export interface AvatarRepoInterface {
    save(avatar: Avatar): Promise<string>;
    findById(id: string): Promise<Avatar | null>;
    delete(id: string): Promise<void>;
}
