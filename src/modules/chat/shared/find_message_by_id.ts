import {MessageRepoInterface} from "../domain/ports/message_repo_interface";


export class FindMessageById {
    constructor(private readonly messageRepo: MessageRepoInterface) {}

    async findMessageById(id: string) {
        const message =  await this.messageRepo.findById(id);
        if (!message) {
            throw new Error("Message not found");
        }
        return message;
    }
}