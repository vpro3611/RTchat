import {TokenServiceInterface} from "../ports/token_service_interface";
import jwt from "jsonwebtoken";
import {AccessTokenPayload, RefreshTokenPayload} from "../payloads/payloads";
import {InvalidTokenJWTError, SecretNotDefinedError} from "../errors/token_errors";

const ACCESS_TOKEN_TIME = "15m";
const REFRESH_TOKEN_TIME = "7d";
const REGISTRATION_TOKEN_TIME = "1h";

export class TokenServiceJWT implements TokenServiceInterface {

    private checkAccessSecret(): string {
        const accessToken = process.env.ACCESS_TOKEN_SECRET;
        if (!accessToken) {
            throw new SecretNotDefinedError("ACCESS_TOKEN_SECRET is not defined");
        }
        return accessToken;
    }

    private checkRefreshSecret(): string {
        const refreshToken = process.env.REFRESH_TOKEN_SECRET;
        if (!refreshToken) {
            throw new SecretNotDefinedError("REFRESH_TOKEN_SECRET is not defined");
        }
        return refreshToken;
    }

    private checkRegistrationSecret(): string {
        const secret = process.env.ACCESS_TOKEN_SECRET || "fallback_reg_secret";
        return secret;
    }

    private mapError(error: unknown, tokenType: "access" | "refresh" | "registration"): never {
        if (error instanceof Error && process.env.NODE_ENV !== "production") {
            throw new InvalidTokenJWTError(`${error.message} - Invalid ${tokenType} token`);
        }
        throw new InvalidTokenJWTError(`Invalid ${tokenType} token`);
    }



    generateAccessToken(userId: string): string {
        const accessToken = this.checkAccessSecret();
        return jwt.sign(
            {
                sub: userId
            },
            accessToken,
            {
                expiresIn: ACCESS_TOKEN_TIME
            }
        );
    }
    generateRefreshToken(userId: string): string {
        const refreshToken = this.checkRefreshSecret();
        return jwt.sign(
            {
                sub: userId
            },
            refreshToken,
            {
                expiresIn: REFRESH_TOKEN_TIME
            }
        )
    }
    generateRegistrationToken(email: string): string {
        const secret = this.checkRegistrationSecret();
        return jwt.sign(
            {
                email: email
            },
            secret,
            {
                expiresIn: REGISTRATION_TOKEN_TIME
            }
        );
    }
    verifyAccessToken(token: string): AccessTokenPayload {
        const accessToken = this.checkAccessSecret();
        try {
            return jwt.verify(
                token,
                accessToken
            ) as AccessTokenPayload;
        } catch (error) {
            this.mapError(error, "access");
        }
    }
    verifyRefreshToken(token: string): RefreshTokenPayload {
        const refreshToken = this.checkRefreshSecret();
        try {
            return jwt.verify(
                token,
                refreshToken
            ) as RefreshTokenPayload;
        } catch (error) {
            this.mapError(error, "refresh");
        }
    }
    verifyRegistrationToken(token: string): { email: string; exp: number } {
        const secret = this.checkRegistrationSecret();
        try {
            return jwt.verify(
                token,
                secret
            ) as { email: string; exp: number };
        } catch (error) {
            this.mapError(error, "registration");
        }
    }
}