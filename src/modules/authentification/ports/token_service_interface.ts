import {AccessTokenPayload, RefreshTokenPayload} from "../payloads/payloads";


export interface TokenServiceInterface {
    generateAccessToken(userId: string): string,
    generateRefreshToken(userId: string): string,
    generateRegistrationToken(email: string): string,
    verifyAccessToken(token: string): AccessTokenPayload,
    verifyRefreshToken(token: string): RefreshTokenPayload,
    verifyRegistrationToken(token: string): { email: string; exp: number },
}