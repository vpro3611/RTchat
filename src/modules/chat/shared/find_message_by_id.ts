import {MessageRepoInterface} from "../domain/ports/message_repo_interface";
import {MessageNotFoundError} from "../application/errors/message_errors/message_errors";


export class FindMessageById {
    constructor(private readonly messageRepo: MessageRepoInterface) {}

    async findMessageById(id: string) {
        const message =  await this.messageRepo.findById(id);
        if (!message) {
            throw new MessageNotFoundError("Message not found");
        }
        return message;
    }
}