import type {User} from "./register_response.ts";


export interface LoginByUsernameResponse {
    user: User,
    accessToken: string,
    refreshToken: string,
}