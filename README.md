# STX-I Portal v2 (stxi-portal-v2)

STX-I Portal Application - A unified enterprise workplace portal developed for Sumitronics Indonesia.

## Features

### 1. Authentication & User Management
- Microsoft Azure AD integration (MSAL)
- Google Sign-in support
- Multi-role authentication system with role switching
- User profile management

### 2. Document Management System (DMS)
- Folder structure navigation (tiles and list views)
- File upload/download capabilities
- SharePoint & OneDrive integration
- File/folder sharing functionality
- Delete, rename, move operations

### 3. Approval Management System (AMS)
- Approval workflow management
- Approval mapping and configuration
- Approval history tracking
- Approval notes and attachments

### 4. Modular Reporting System (MRS)
- Database connection management
- Dynamic report generation
- Report scheduling
- View reports in dialog or new tab

### 5. CMS & Training (TOS)
- Content creation with TinyMCE and TipTap editors
- Training courses with timed quizzes
- Historical quiz results tracking

### 6. Robotic Process Automation (RPA)
- Visual workflow builder for web/desktop automation
- Command step configuration and parameter management

### 7. Notifications
- Real-time WebSocket notifications
- PWA push notifications

### 8. Settings / Administration
- User management
- Role management with menu assignments
- Domain/tenant configuration
- Application mapping

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

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).
