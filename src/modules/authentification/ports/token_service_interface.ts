import {AccessTokenPayload, RefreshTokenPayload} from "../payloads/payloads";


export interface TokenServiceInterface {
    generateAccessToken(userId: string): string,
    generateRefreshToken(userId: string): string,
    verifyAccessToken(token: string): AccessTokenPayload,
    verifyRefreshToken(token: string): RefreshTokenPayload,
}