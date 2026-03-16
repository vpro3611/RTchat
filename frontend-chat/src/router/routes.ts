import AuthPage from "../pages/AuthPage.vue";
import VerifyEmailNotice from "../pages/VerifyEmailNotice.vue";
import EmailVerified from "../pages/EmailVerified.vue";
import LoginPage from "pages/LoginPage.vue";



const routes = [

  {
    path: '/',
    redirect: '/auth'
  },

  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'auth', component: AuthPage },

      { path: 'login', component: LoginPage },

      { path: 'verify-email', component: VerifyEmailNotice },

      { path: 'email-verified', component: EmailVerified },
    ]
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [

      { path: 'main', component: () => import('pages/MainPage.vue')},

      { path: 'profile', component: () => import('pages/ProfilePage.vue') },

    ]
  }

]


export default routes;
