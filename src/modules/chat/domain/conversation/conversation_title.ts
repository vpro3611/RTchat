import {InvalidTitleError} from "../../errors/conversation_errors/conversation_errors";


export class ConversationTitle {
    constructor(private readonly value: string) {}

    private static readonly MIN_LENGTH = 1;
    private static readonly MAX_LENGTH = 255;

    private static validate(title: string) {
        const trimmedTitle = title.trim();
        if (trimmedTitle.length < this.MIN_LENGTH) {
            throw new InvalidTitleError(`Title must be at least ${this.MIN_LENGTH} characters long`);
        }
        if (trimmedTitle.length > this.MAX_LENGTH) {
            throw new InvalidTitleError(`Title must be at most ${this.MAX_LENGTH} characters long`);
        }
        return trimmedTitle;
    }

    static create(title: string) {
        this.validate(title);
        return new ConversationTitle(title);
    }

    static empty() {
        return new ConversationTitle('');
    }

    getValue(): string {
        return this.value;
    }
}