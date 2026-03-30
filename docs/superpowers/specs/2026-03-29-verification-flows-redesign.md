# Design Spec: Generic Verification Flows (Vibrant & Block-based)

This spec defines the frontend implementation for Registration, Email Change, and Password Restoration flows, mirroring the backend's granular token management.

## 1. Goal
Create a unified, robust, and visually striking UI for all verification processes using the "Vibrant & Block-based" design system.

## 2. Components & Pages

### 2.1 AuthPage.vue Refactor
- **States**: `login`, `register`, `forgot-password`.
- **Transitions**: The Login card will allow toggling to a `ForgotPasswordForm` component.
- **Forgot Password Form**:
    - Fields: `email`, `newPassword`.
    - Action: Calls `AuthApi.restoreForgottenPassword`.
    - Success: Redirects to `VerifyEmailNotice?type=reset-pass&email=...`.

### 2.2 Generic VerifyEmailNotice.vue
- **Prop/Query**: `type` ('register' | 'change' | 'reset-pass').
- **Dynamic Content**:
    - `register`: "Verify your account" / "Resend registration email".
    - `change`: "Confirm email change" / "Resend confirmation email".
    - `reset-pass`: "Confirm password reset" / "Resend reset email".
- **API Logic**: `handleResend` will switch between `resendVerificationRegister`, `resendChangeEmailVerification`, and `resendResetPassword`.

### 2.3 Generic EmailVerified.vue
- **States**: `success` | `error`.
- **Flows**: `register` | `change` | `reset-pass`.
- **Messaging**:
    - `reset-pass` Success: "Password updated! You can now log in with your new credentials."
    - `reset-pass` Error: "Reset link expired or used. Please request a new one."

## 3. UI/UX (Vibrant & Block-based)
- **Palette**: Primary Rose (#E11D48), Accent Blue (#2563EB), Dark Text (#881337).
- **Styling**: 
    - 2px solid borders on cards.
    - Large, bold headers.
    - Fira Sans typography.
    - Smooth 200ms transitions for state toggles.

## 4. Implementation Plan
1. Update `AuthApi.ts` (Done).
2. Create `ForgotPasswordForm.vue` component.
3. Refactor `AuthPage.vue` to include forgot password logic.
4. Refactor `VerifyEmailNotice.vue` into a generic flow handler.
5. Refactor `EmailVerified.vue` to handle the `reset-pass` flow.
6. Verify all flows with end-to-end testing.
