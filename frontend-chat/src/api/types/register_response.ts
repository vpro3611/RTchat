

export interface User {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    isVerified: boolean;
    avatarId: string | null;
    lastSeenAt: string;
    createdAt: string;
    updatedAt: string;
}
