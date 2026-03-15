

export interface User {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    isVerified: boolean;
    lastSeenAt: Date;
    createdAt: Date;
    updatedAt: Date;
}