# Profiles

User profile management: personal data, photo, signature, and notification/subscription preferences.

## What It Does

Route `/profiles` → `src/pages/Profiles/index.vue` with two tabs: **Personal** and **Settings**.

## Personal — `src/pages/Profiles/setupPersonalProfiles.vue`

- **Profile photo** — hover-to-change avatar with upload
- **Personal data** form — first/last name (required), plus other user-detail fields (`pud_*`)
- Saves via `portal/profiles` API

## Settings — `src/pages/Profiles/setupProfiles.vue`

- **Signature** — free-text signature used in approval documents
- **Subscription Options** — per-category checkbox subscriptions
- **Notification Options** — email notifications, browser notifications; Teams notifications disabled/not implemented
- **Save Settings** button

## Related

- Change password dialog is available from the header settings menu (`src/pages/Dashboards/changePassword.vue`)
- Profile photo + name appear on the portal dashboard (`src/pages/Dashboards/index.vue`) and in the front-page account menu

## Key Files

```
src/pages/Profiles/
├── index.vue                  # tabs: Personal / Settings
├── setupPersonalProfiles.vue  # personal data + photo
└── setupProfiles.vue          # signature + subscription/notification prefs
```