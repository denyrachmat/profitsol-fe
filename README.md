# Enterprise Portal

A configurable, unified workplace portal built with Vue 3 and Quasar.

## Documentation Index

Each feature area has its own doc with detailed pages, flows, and API endpoints:

| Doc | Covers |
|-----|--------|
| [`AUTH_USER_MANAGEMENT.md`](AUTH_USER_MANAGEMENT.md) | Login/register, Azure AD (MSAL), Google SSO, role switching |
| [`DMS_DOCUMENT_MANAGEMENT.md`](DMS_DOCUMENT_MANAGEMENT.md) | File explorer, driver roots, SharePoint, sharing |
| [`AMS_APPROVAL_SYSTEM.md`](AMS_APPROVAL_SYSTEM.md) | Approval workflows, history, document signing |
| [`AMS_DOCSIGN_FRONTEND_STATUS.md`](AMS_DOCSIGN_FRONTEND_STATUS.md) | Signature-box designer implementation status |
| [`SIGNATURE_BOXES_DRAG_RESIZE.md`](SIGNATURE_BOXES_DRAG_RESIZE.md) | Signature box drag & resize |
| [`SIGNATURE_BOXES_REALTIME_FIX.md`](SIGNATURE_BOXES_REALTIME_FIX.md) | Real-time overlay-canvas fix |
| [`SIGNATURE_BOX_UPLOAD_REQUIREMENT.md`](SIGNATURE_BOX_UPLOAD_REQUIREMENT.md) | "Sign uploaded doc?" enforcement |
| [`MRS_REPORTING_SYSTEM.md`](MRS_REPORTING_SYSTEM.md) | DB connections, report builder, simulation |
| [`CMS_TRAINING.md`](CMS_TRAINING.md) | Editors, forms/quiz builder, TOS training |
| [`RPA_AUTOMATION.md`](RPA_AUTOMATION.md) | RPA servers, commands, parameters |
| [`NOTIFICATIONS.md`](NOTIFICATIONS.md) | Socket.IO realtime + PWA push |
| [`SETTINGS_ADMINISTRATION.md`](SETTINGS_ADMINISTRATION.md) | Users, roles, apps, domains |
| [`FRONTPAGE_WEBSITE_BUILDER.md`](FRONTPAGE_WEBSITE_BUILDER.md) | Front page + website builder widgets |
| [`MACRO_LIST.md`](MACRO_LIST.md) | Macro file browse/download/distribution |
| [`MOBILE_LABEL_PRINT.md`](MOBILE_LABEL_PRINT.md) | ZPL/SBPL label templates for mobile printing |
| [`PROFILES.md`](PROFILES.md) | Personal data, signature, subscriptions |

## Features

### 1. Authentication & User Management
- Microsoft Azure AD integration (MSAL)
- Google Sign-in support
- Multi-role authentication system with role switching
- User profile management

→ See [`AUTH_USER_MANAGEMENT.md`](AUTH_USER_MANAGEMENT.md)

### 2. Document Management System (DMS)
- Folder structure navigation (tiles and list views)
- File upload/download capabilities
- SharePoint & OneDrive integration
- File/folder sharing functionality
- Delete, rename, move operations

→ See [`DMS_DOCUMENT_MANAGEMENT.md`](DMS_DOCUMENT_MANAGEMENT.md)

### 3. Approval Management System (AMS)
- Approval workflow management
- Approval mapping and configuration
- Approval history tracking
- Approval notes and attachments
- Document signing (signature boxes)

→ See [`AMS_APPROVAL_SYSTEM.md`](AMS_APPROVAL_SYSTEM.md), [`AMS_DOCSIGN_FRONTEND_STATUS.md`](AMS_DOCSIGN_FRONTEND_STATUS.md)

### 4. Modular Reporting System (MRS)
- Database connection management
- Dynamic report generation
- Report scheduling
- View reports in dialog or new tab

→ See [`MRS_REPORTING_SYSTEM.md`](MRS_REPORTING_SYSTEM.md)

### 5. CMS & Training (TOS)
- Content creation with TinyMCE and TipTap editors
- Training courses with timed quizzes
- Historical quiz results tracking

→ See [`CMS_TRAINING.md`](CMS_TRAINING.md)

### 6. Robotic Process Automation (RPA)
- Visual workflow builder for web/desktop automation
- Command step configuration and parameter management

→ See [`RPA_AUTOMATION.md`](RPA_AUTOMATION.md)

### 7. Notifications
- Real-time WebSocket notifications
- PWA push notifications

→ See [`NOTIFICATIONS.md`](NOTIFICATIONS.md)

### 8. Settings / Administration
- User management
- Role management with menu assignments
- Domain/tenant configuration
- Application mapping

→ See [`SETTINGS_ADMINISTRATION.md`](SETTINGS_ADMINISTRATION.md)

## Additional Modules

| Module | Doc |
|--------|-----|
| Dashboard Manager (datasets + rendered dashboards) | src/pages/DashboardManager/, src/components/widgets/dashboard/ |
| Front Page & Website Builder (UpdateFP) | [`FRONTPAGE_WEBSITE_BUILDER.md`](FRONTPAGE_WEBSITE_BUILDER.md) |
| Macro List distribution | [`MACRO_LIST.md`](MACRO_LIST.md) |
| Mobile label print templates | [`MOBILE_LABEL_PRINT.md`](MOBILE_LABEL_PRINT.md) |
| User Profiles | [`PROFILES.md`](PROFILES.md) |

## Deployment Notes

The frontend builds to static files (SPA, with optional PWA mode). There is **no frontend installer**; the `/install` wizard belongs to the Laravel backend (`profitsol-api`).

For each environment:

1. Set `API`, `API_DOWNLOAD`, and `API_DMS` in `quasar.config.js` to the target backend URLs, replacing the example values. These are required bootstrap settings; every other runtime setting is fetched from the backend.
2. Build with `quasar build` (SPA) or `quasar build -m pwa` (PWA). The bootstrap settings are embedded in the build, so rebuild after changing them.
3. Publish the generated `dist/` files to a static web host. Since the app uses Vue Router history mode, configure the host to serve `index.html` for app routes.
4. Configure the host with the correct SPA/PWA caching behavior and enable HTTPS.
5. Configure global runtime settings (branding, Microsoft auth, sockets, keys) in the backend installer or later via the portal admin UI.

Keep secrets out of frontend configuration: values bundled into a browser application are visible to users.

## Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | Vue.js 3 |
| **UI Library** | Quasar Framework 2.x |
| **State Management** | Pinia with persisted state |
| **Routing** | Vue Router 4 |
| **Build Tool** | Vite (via @quasar/app-vite) |
| **Authentication** | @azure/msal-browser (Azure AD) |
| **Real-time** | Socket.IO client |
| **PWA** | Workbox (service worker + push notifications) |
| **Rich Text Editing** | TinyMCE, TipTap |
| **Code Editing** | Monaco Editor, PrismJS |
| **Diagrams** | JointJS, Vue Flow |
| **File Storage** | Azure Blob Storage, SharePoint, OneDrive |
| **Mapping** | Mapbox GL |
| **Realtime/Database** | Firebase 9.x |
| **Printing** | Qz-Tray |
| **Tours/Guides** | Driver.js |

## Project Structure

```
├── src/
│   ├── boot/          # axios, MSAL, Pinia, Socket.IO, prism, mapbox bootstraps
│   ├── components/    # shared components (editors, files, flow, uploads, helpers)
│   ├── layouts/       # MainLayout (header, drawer, notifications)
│   ├── pages/         # feature modules:
│   │   ├── Auth/      #   login, register, forgot/reset password
│   │   ├── Dashboards/#   portal home, app list, events
│   │   ├── DashboardManager/ # dashboard and dataset editor/renderer
│   │   ├── DMS/       #   document management
│   │   ├── AMS/       #   approval management + doc signing
│   │   ├── MRS/       #   modular reporting
│   │   ├── CMS/       #   content, forms & quiz builder
│   │   ├── TOS/       #   training / quiz results
│   │   ├── RPA/       #   robotic process automation setup
│   │   ├── Settings/  #   users, roles, apps, domains
│   │   ├── Frontpage/ #   public front page
│   │   ├── UpdateFP/  #   website builder (nav/page/post/widgets)
│   │   ├── MacroList/ #   macro distribution
│   │   ├── Mobile/    #   label print manager
│   │   └── Profiles/  #   personal profile
│   ├── router/        # Vue Router 4 (history mode)
│   ├── stores/        # Pinia stores (authStore, formStore, dialogStore)
│   ├── tours/         # Driver.js tour definitions
│   └── css/           # global styles (app.scss)
├── src-pwa/           # PWA service worker + manifest (Workbox)
├── public/            # static assets
├── quasar.config.js   # Quasar/Vite config, env, PWA
└── package.json
```

> **Note:** The app menu is **data-driven** — routes/menus come from the backend (`role_app_map` in `src/stores/authStore.js`), so most feature pages are opened as dialog apps rather than being listed in `src/router/routes.js`.

## Prerequisites

- Node.js ≥ 12.22.1 (Yarn ≥ 1.21.1 recommended)
- A running backend API (defaults below are configured in `quasar.config.js`)

## Configuration

The frontend build/host configuration supplies only the API bootstrap endpoints (`API`, `API_DOWNLOAD`, `API_DMS`) in `quasar.config.js`. Replace the example API URLs with the target environment before each build; they are embedded in the bundle and must be available before runtime settings can be fetched. Do not put secrets in frontend build values.

Branding and integration settings are stored in the backend database. During backend installation, configure the global defaults for `APP_NAME`, `APP_LOGO`, `BASE_COLOR`, `MS_CLIENTID`, `MS_AUTHORITY`, `GRAPH_API`, `SHAREPOINT_URL`, `SOCKET_URL`, `INTRANET_URL`, and `VAPID_KEY`. The frontend loads public global defaults from `GET /api/portal/frontend-config` at startup. Per-domain settings override those defaults via `GET /api/domain/{id}/frontend-config` when a user selects a domain.

Portal admins can update per-domain overrides in Settings → Domain → Edit Domain → Frontend Runtime Settings. Saving uses `PUT /api/domain/{id}/frontend-config` with a Sanctum bearer token. The backend must enforce admin authorization; hiding/editing controls in the frontend is not a security boundary. Cleared fields are saved as null values so the domain inherits the global default again. Domain logo (`pd_img`) takes precedence over `APP_LOGO` on the pre-login selector; dashboard branding uses `APP_LOGO`.

If the runtime settings endpoints are unavailable, the app continues with the generic branding and empty optional integration settings. Microsoft login and Socket.IO realtime features require valid global or per-domain settings. The public Microsoft Graph endpoint remains the generic Graph API; tenant-specific SharePoint selection is configured in the backend settings.

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
yarn lint
# or
npm run lint
```

### Format the files
```bash
yarn format
# or
npm run format
```

### Build the app for production
```bash
quasar build
```

### Build with PWA
```bash
quasar build -m pwa
# or in dev:
quasar dev -m pwa
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).
