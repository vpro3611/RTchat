import { CookieOptions } from "express";

export function getCookieOptions(): CookieOptions {
    const isProd = process.env.NODE_ENV === "production";
    
    // Support customized sameSite option (lax, strict, none)
    let sameSite: "lax" | "strict" | "none" = isProd ? "strict" : "lax";
    if (process.env.COOKIE_SAME_SITE) {
        const val = process.env.COOKIE_SAME_SITE.toLowerCase();
        if (val === "lax" || val === "strict" || val === "none") {
            sameSite = val as "lax" | "strict" | "none";
        }
    }
    
    // Support customized secure option
    let secure = isProd;
    if (process.env.COOKIE_SECURE) {
        secure = process.env.COOKIE_SECURE === "true";
    } else if (sameSite === "none") {
        // secure must be true if sameSite is none
        secure = true;
    }

    return {
        httpOnly: true,
        secure,
        sameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    };
}
