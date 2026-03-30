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

    setUser(user: User | null) {
        this.user = user;
    },

    setAvatarId(avatarId: string | null) {
        if (this.user) {
            this.user.avatarId = avatarId;
        }
    },

    clearToken() {
        this.accessToken = null;
        this.user = null;
    },

    finishBootstrapping() {
        this.isBootstrapping = false;
    }

})
