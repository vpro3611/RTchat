
export interface EmailVerificationInterface {
    saveToken(token: {id: string, userId: string, tokenHash: string, expiresAt: Date, createdAt: Date, tokenType: string}): Promise<void>;
    findByTokenHash(tokenHash: string): Promise<{userId: string, tokenType: string} | null>;
    deleteByUserId(userId: string): Promise<void>;
    deleteByTokenHash(tokenHash: string): Promise<void>;
    deleteByUserIdAndType(userId: string, tokenType: string): Promise<void>;
}