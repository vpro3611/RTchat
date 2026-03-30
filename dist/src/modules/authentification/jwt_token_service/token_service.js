"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenServiceJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_errors_1 = require("../errors/token_errors");
const ACCESS_TOKEN_TIME = "15m";
const REFRESH_TOKEN_TIME = "7d";
class TokenServiceJWT {
    checkAccessSecret() {
        const accessToken = process.env.ACCESS_TOKEN_SECRET;
        if (!accessToken) {
            throw new token_errors_1.SecretNotDefinedError("ACCESS_TOKEN_SECRET is not defined");
        }
        return accessToken;
    }
    checkRefreshSecret() {
        const refreshToken = process.env.REFRESH_TOKEN_SECRET;
        if (!refreshToken) {
            throw new token_errors_1.SecretNotDefinedError("REFRESH_TOKEN_SECRET is not defined");
        }
        return refreshToken;
    }
    mapError(error, tokenType) {
        if (error instanceof Error && process.env.NODE_ENV !== "production") {
            throw new token_errors_1.InvalidTokenJWTError(`${error.message} - Invalid ${tokenType} token`);
        }
        throw new token_errors_1.InvalidTokenJWTError(`Invalid ${tokenType} token`);
    }
    generateAccessToken(userId) {
        const accessToken = this.checkAccessSecret();
        return jsonwebtoken_1.default.sign({
            sub: userId
        }, accessToken, {
            expiresIn: ACCESS_TOKEN_TIME
        });
    }
    generateRefreshToken(userId) {
        const refreshToken = this.checkRefreshSecret();
        return jsonwebtoken_1.default.sign({
            sub: userId
        }, refreshToken, {
            expiresIn: REFRESH_TOKEN_TIME
        });
    }
    verifyAccessToken(token) {
        const accessToken = this.checkAccessSecret();
        try {
            return jsonwebtoken_1.default.verify(token, accessToken);
        }
        catch (error) {
            this.mapError(error, "access");
        }
    }
    verifyRefreshToken(token) {
        const refreshToken = this.checkRefreshSecret();
        try {
            return jsonwebtoken_1.default.verify(token, refreshToken);
        }
        catch (error) {
            this.mapError(error, "refresh");
        }
    }
}
exports.TokenServiceJWT = TokenServiceJWT;
