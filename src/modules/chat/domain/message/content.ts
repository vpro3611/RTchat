import {InvalidMessageError} from "../../errors/message_errors/message_errors";


export class Content {
    constructor(private readonly text: string) {}

    private static MIN_LENGTH = 0;

    private static validateMessage(text: string): string {
        const trimmedMessage = text.trim();
        if (trimmedMessage.length < Content.MIN_LENGTH) {
            throw new InvalidMessageError('Message must be at least 0 characters long');
        }
        return trimmedMessage;
    }

    static create(text: string): Content {
        const msg = Content.validateMessage(text);
        return new Content(msg);
    }

    getContentValue(): string {
        return this.text;
    }
}