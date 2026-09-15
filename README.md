# STX-I Portal v2 (stxi-portal-v2)

STX-I Portal Application - A unified enterprise workplace portal developed for Sumitronics Indonesia.

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
| Front Page & Website Builder (UpdateFP) | [`FRONTPAGE_WEBSITE_BUILDER.md`](FRONTPAGE_WEBSITE_BUILDER.md) |
| Macro List distribution | [`MACRO_LIST.md`](MACRO_LIST.md) |
| Mobile label print templates | [`MOBILE_LABEL_PRINT.md`](MOBILE_LABEL_PRINT.md) |
| User Profiles | [`PROFILES.md`](PROFILES.md) |

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

Environment/build settings live in `quasar.config.js` under `build.env`:

| Variable | Dev default | Purpose |
|----------|-------------|---------|
| `API` | `http://stx-api.test/api/` | Base API endpoint |
| `API_DOWNLOAD` | `http://stx-api.test` | Download base URL |
| `API_DMS` | `http://stx-api.test/api/dms/...` | DMS shared-files endpoint |
| `MS_CLIENTID` | Azure AD app client ID | MSAL authentication |
| `MS_AUTHORITY` | `https://login.microsoftonline.com/<tenant>` | MSAL authority |
| `GRAPH_API` | `https://graph.microsoft.com/v1.0/` | Microsoft Graph |
| `SHAREPOINT_URL` | Graph sites root | SharePoint drive lookup |
| `VAPID_KEY` | Web push VAPID key | PWA push notifications |

Sensitive/override values can also be provided via `.env` (`VITE_MS_CLIENT_ID`, `VITE_MS_AUTHORITY`).

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
