# Authentication & User Management

Portal login, registration, password management, Azure AD / Google SSO, and role switching.

## What It Does

Authenticates users against the portal, provides domain (tenant) selection, supports enterprise single-sign-on, and allows a single user to hold and switch between multiple roles.

## Login / Registration Flow

| Page | File | Purpose |
|------|------|---------|
| Login | `src/pages/Auth/login.vue` | Username + password login |
| Register | `src/pages/Auth/register.vue` | New user registration |
| Forgot Password | `src/pages/Auth/forgotpassword.vue` | Request password reset (email) |
| Reset Password | `src/pages/Auth/resetPassword.vue` | Set new password via token (`/reset-password/:token`) |
| Auth Shell | `src/pages/Auth/index.vue` | Domain selector + swaps login/register/forgot/reset components |
| Auth Popup | `src/pages/AuthPopup.vue` | OAuth popup helper (`/auth-popup`) |

## Single Sign-On (SSO)

- **Azure AD (MSAL)** — `src/boot/msalBoot.js`, `@azure/msal-browser`
  - Config in `src/layouts/MainLayout.vue` (`clientId`, `authority`, redirect URIs)
  - Popup + redirect sign-in, active-account management, MSAL logout that clears the browser session
- **Google Sign-In** — `src/boot/gapiBoot.js`, `vue3-google-signin`
- **Microsoft Graph Toolkit** — `@microsoft/mgt` (Msal2Provider) used for calendar/people data on the dashboard

## Role System

- Users belong to one or more roles (`rolesGroup.roles` in `authStore`)
- **Role switching** from the header roles menu (`MainLayout.vue` `changeRoles()`)
- Choosing a role loads its **app map** (`role_app_map`) which drives the drawer menu and app list
- Role `id === 1` is treated as the setup/admin role that sees the drawer and settings links

## State Management

`src/stores/authStore.js` (Pinia + persisted state) holds:
- `authDet` — user + roles detail
- `getChoosedRole` — currently active role
- `choosedDomain` — selected domain/tenant
- `msLoginDet` / `msTokenDet` — MSAL account + token
- Minimized menu list (`storeMinimizedMenu` / `removeMinimizedMenu`)
- `logoutAction()` — clears all persisted auth state

## Routes

- `/login` — auth shell
- `/reset-password/:token` — password reset
- `/profiles` — user profile / change password (protected by `MainLayout`)

## Related

- Password change dialog: `src/pages/Dashboards/changePassword.vue`
- Profiles / personal data: see `PROFILES.md`
- Role & user administration: see `SETTINGS_ADMINISTRATION.md`

## Security Notes

- `window.onbeforeunload` warns users to log out before leaving (exempts the settings routes)
- MSAL configured with `navigateToLoginRequestUrl: false` and `postLogoutRedirectUri` to avoid redirect loops