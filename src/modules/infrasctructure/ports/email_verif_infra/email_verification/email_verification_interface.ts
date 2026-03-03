

export interface EmailVerificationInterface {
    saveToken(token: {id: string, userId: string, tokenHash: string, expiresAt: Date, createdAt: Date}): Promise<void>;
    findByTokenHash(tokenHash: string): Promise<{userId: string} | null>;
    deleteByUserId(userId: string): Promise<void>;
}