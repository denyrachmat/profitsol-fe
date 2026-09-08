# Profiles

The logged-in user's personal data editor and personal settings (signature, subscriptions, notifications).

## What It Does

Provides two tabs: **Personal** — maintain your own profile (photo, identity, addresses, education, family) with automatic saving; **Settings** — maintain your signature, topic subscriptions, and notification preferences. Data is hydrated from the Pinia auth store (`useAuthStore` → `getDetail`).

## Tab: Personal — `src/pages/Profiles/setupPersonalProfiles.vue`

| Section | Fields / Features |
|---------|-------------------|
| Photo Profile | 150px avatar; hover swaps to a **Change Photo** button → `UploadPhoto` dialog; result stored as `pud_photo` |
| Personal Data | First/Last name (required), Birth place, Birth date (date picker), Phone (masked `(+##) ###-####-####`) |
| ID Type | Radio: **Nationality ID** / **Driving ID** + ID Number |
| ID Address | Country, State/Province, City, District, Sub-District, Detail Locations + **Find place on Maps** (MapView dialog fills the fields and stores lat/lng JSON in `pud_addr2`) |
| Current Address | Same fields as ID Address (`*_rsdn`), plus **Same address as your ID** copy helper and **Find place on Maps** |
| Educations Detail | Repeatable cards: School Level (High School → Doctor Degree), School Name, Major, Minor, Graduate Date (date picker), Grade; add/remove with confirm |
| Families Detail | Repeatable cards: First/Last name, Relation (Father/Mother/Sibling/Grandparent/Spouse/Child), Phone (masked), Birth date; add/remove with confirm |

### Autosave

Deep watchers on `form`, `families`, and `educations` (lodash-debounced **3 s**) call `updateProfile()` → `PATCH portal/profiles/{btoa(username)}` with `{ form, educations, families }`. There is no explicit Save button — changes persist shortly after editing stops.

## Tab: Settings — `src/pages/Profiles/setupProfiles.vue`

| Section | Fields / Features |
|---------|-------------------|
| Signature | Textarea ("Your Signature") — personal signature used elsewhere in the portal |
| Subscription Options | Checkboxes grouped by category; list built from gencode `FP_SUBSCRIBE_POSTS` filtered to the current username or `_ALL` |
| Notification Options | **Email Notifications** checkbox, **Browser Notifications** checkbox, **Teams Notifications** (disabled placeholder, "Not implemented yet") |
| Save Settings | Submit button — `saveProfile()` currently only logs the payload (not yet persisted to an API) |

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| Save personal profile (autosave) | `PATCH portal/profiles/{btoa(username)}` |
| Subscription categories/types | `POST portal/gencode/showDetail/FP_SUBSCRIBE_POSTS` |

## Key Files

```
src/pages/Profiles/
├── index.vue                    # tab shell ("personal" / "settings")
├── setupPersonalProfiles.vue    # personal data + autosave
└── setupProfiles.vue            # signature, subscriptions, notifications
src/components/
├── mapView/index.vue            # "Find place on Maps" dialog
└── uploadPhoto/index.vue        # photo upload dialog
```

## Related Docs

- see AUTH_USER_MANAGEMENT.md — auth store and profile detail source
- see AMS_APPROVAL_SYSTEM.md — where the user signature is consumed (doc-sign)
- see NOTIFICATIONS.md — notification delivery options
