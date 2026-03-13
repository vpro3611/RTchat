import {BaseUrl} from "../../base_url/base_url.ts";
import type {User} from "../types/register_response.ts";
import {fetchJson, fetchJsonNoError} from "../fetch/generinc_fetcher.ts";
import type {LoginByEmailResponse} from "../types/login_by_email_response.ts";
import type {LoginByUsernameResponse} from "../types/login_by_username_response.ts";


export const AuthApi = {
    register(username: string, email: string, password: string) {
        return fetchJson<User>(`${BaseUrl.apiBaseUrl}/public/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({username, email, password}),
        })
    },
    // verifyEmail(token: string) {
    //     return fetchJson<{message: string}>(`${BaseUrl.apiBaseUrl}/public/verify-email?token=${token}`, {
    //         method: "GET",
    //     })
    // },
    loginByEmail(email: string, password: string) {
        return fetchJson<LoginByEmailResponse>(`${BaseUrl.apiBaseUrl}/public/login-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({email, password}),
        })
    },
    loginByUsername(username: string, password: string) {
        return fetchJson<LoginByUsernameResponse>(`${BaseUrl.apiBaseUrl}/public/login-username`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({username, password}),
        })
    },
    refresh() {
        return fetchJsonNoError<{accessToken: string}>(`${BaseUrl.apiBaseUrl}/public/refresh`, {
            method: "POST",
            credentials: "include",
        })
    },
    me() {
        return fetchJson<User>(`${BaseUrl.apiBaseUrl}/private/me`, {
            method: "GET",
        })
    }
}