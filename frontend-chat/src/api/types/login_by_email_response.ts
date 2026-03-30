import type {User} from "./register_response.ts";

export interface LoginByEmailResponse {
    user: User,
    accessToken: string,
    refreshToken: string,
}