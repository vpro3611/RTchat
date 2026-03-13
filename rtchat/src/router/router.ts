import {createRouter, createWebHistory} from "vue-router";
import {AuthStore} from "../stores/auth_store.ts";
import AuthPage from "../pages/AuthPage.vue";
import MainPage from "../pages/MainPage.vue";
import VerifyEmailNotice from "../pages/VerifyEmailNotice.vue";
import EmailVerified from "../pages/EmailVerified.vue";
import Login from "../components/Login.vue";



const routes = [
    { path: "/", redirect: "/main_page" },

    { path: "/home", redirect: "/main_page"},

    {
        path: "/auth",
        component: AuthPage,
    },

    {
        path: "/verify-email",
        component: VerifyEmailNotice,
    },

    {
        path: "/main_page",
        component: MainPage,
    },
    {
        path: "/email-verified",
        component: EmailVerified,
    },
    {
        path: "/login",
        component: Login,
    },
]


export const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, _from, next) => {
    if (AuthStore.isBootstrapping) {
        return next();
    }

    if (to.meta.requireAuth && (!AuthStore.accessToken || !AuthStore.user)) {
        next("/auth");
    } else {
        next();
    }
});