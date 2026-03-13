import {TokenDto} from "../DTO/token_dto";


export interface RefreshTokenRepoInterface {
    create(data: {id: string, userId: string, tokenHash: string, expiresAt: Date}): Promise<void>;
    findValidByHash(tokenHash: string): Promise<TokenDto | null>;
    revoke(id: string) : Promise<void>;
    revokeByHash(tokenHash: string) : Promise<void>;
    findByHash(tokenHash: string): Promise<TokenDto | null>
}