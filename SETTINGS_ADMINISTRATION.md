# Settings / Administration

Users, roles (with menu assignment), apps (menu), and domain/tenant configuration.

> The Settings pages are the role-1 ("Setup Apps") area. Routes: `/settings/users`, `/settings/menu`, `/settings/role`. The drawer in `MainLayout.vue` links these three.

## Users — `src/pages/Settings/Users/index.vue`

- User list table (username, name, etc.)
- Create / update via `updateUsers.vue`
- Choose users dialog (`chooseUsers.vue`)
- Map users to Front Page management (`mappingUsersFPManage.vue`)

## Roles — `src/pages/Settings/Role/index.vue`

- Role list (name, description, creator) + search
- Create / edit role (`updateRoles.vue`)
- **Assign Users** to a role (`assignUsers.vue`)
- **Assign Menus** (per-role app/menu map) (`assignMenus.vue`)
- Delete role (`portal/role/{id}`)

## Apps (Menu) — `src/pages/Settings/Apps/index.vue`

- Apps list table: App Code, Name, Description, URL, Icon, and flags:
  - **Is On Drawer?** (`am_is_drawer`) — shown in the left drawer
  - **Is Download Files?** (`am_is_files`)
  - **Is Shared Apps?** (`am_is_shared`)
- Add / edit app (`updateApps.vue`)
- **Mapping apps** (`mappingApps.vue` / `mappingAppsContent.vue`) — build the app/role menu tree

Apps are the building blocks of the menu: each app has a code, URL (dialog or internal route), icon, and permission flags; roles reference them through `role_app_map`.

## Domain / Tenant — `src/pages/Settings/Domain/domainManage.vue` + `domainView.vue`

- Manage portal domains (tenants): description, image/logo, base color, and CMS flags:
  - `pd_is_cms` — 1 = external intranet URL (`urlCMS`), 2 = internal front page
- Reusable data filter (`dataFilter.vue`)
- Login page and layout header render per-domain branding (logo, color)

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| Users | `portal/users` |
| Roles list | `portal/roles` |
| Role CRUD | `portal/roles`, `portal/roles/{id}`, `portal/role/{id}` |
| Apps | `portal/apps` |
| Role detail + app map | `portal/roles/{id}` |
| Domains | `domain` |

## Key Files

```
src/pages/Settings/
├── Users/    (index, updateUsers, chooseUsers, mappingUsersFPManage)
├── Role/     (index, updateRoles, assignUsers, assignMenus)
├── Apps/     (index, updateApps, mappingApps, mappingAppsContent)
└── Domain/   (domainManage, domainView, dataFilter)
```