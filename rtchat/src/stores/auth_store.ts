import {reactive} from "vue";
import type {User} from "../api/types/register_response.ts";


export const AuthStore = reactive({
    accessToken: null as string | null,
    user: null as User | null,
    isBootstrapping: true,

    setToken(token: string, user: User | null) {
        this.accessToken = token;
        if (user) {
            this.user = user;
        }
    },

    setUser(user: User) {
        this.user = user;
    },

    clearToken() {
        this.accessToken = null;
        this.user = null;
    },

    finishBootstrapping() {
        this.isBootstrapping = false;
    }

})