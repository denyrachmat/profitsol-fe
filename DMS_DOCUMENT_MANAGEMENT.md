# DMS — Document Management System

Browse, upload, organize, share, and integrate documents from local disk roots and SharePoint.

## What It Does

The DMS lets each user manage files/folders on one or more registered **driver roots** (real server folders), browse them in grid or list view, upload files, create folders, import from SharePoint, share items with other users, and push files to the public front page.

## Core Explorer (`src/pages/DMS/ExploreViewer/exploreViewerIndex.vue`)

Reusable, prop-driven explorer component used across the app (also embedded in other modules for file picking).

### View Modes
- **Grid / tiles view** (`exploreTilesView.vue`) and **list view** (`exploreListsView.vue`) via toggle
- Splitter panel: **Shared** (left) and **Your Folder / Files** (right)
- Breadcrumb navigation with home shortcut
- **Select mode** toggle (`Shift + T` keyboard shortcut) to multi-select files/folders
- Live search within the shared panel

### File Menu (per current folder)
- New Folder
- Upload File (`uploadPhoto` / Dropzone uploader)
- Sharepoint Import

### Action Menu
- Re-sync files with server (`dms/documentsRoots/resyncFolderToDB`)
- Rename, Move Files/Folder
- Share Files/Folder (`exploreShareView.vue`)
- Send Files/Folder to Front Page (`exploreSendToFE.vue`)
- Delete (batch, with confirmation)

### Integration Modes
The explorer is configured via props for different use cases:
- `chooseFilesMode` — acts as a file picker; emits `onSelectedFilesFolder`
- `readOnly` — browse only
- `selectFilesOnly` / `selectFolderOnly` / `multipleSelect` — constrain selection
- `sharedOnly` — show only the shared panel
- `deleteable` — allow removing shared items from the list

### SharePoint Integration
- Browse SharePoint sites/folders live via Graph API (`sharePointService.getSharedContentNew`)
- `from_sharepoint` items open directly from SharePoint URLs
- Import from SharePoint into your local root (`exploreImportFromSharepoint.vue`)
- Local folder entries can reference a SharePoint `url`/`sites`

## File Preview

`src/components/files/openFiles.vue` renders uploaded documents (PDF, images, office, etc.) in a dialog from base64/extension/mime, including SharePoint-hosted files (`isSharepoint` mode).

## Driver (Root) Setup — `src/pages/DMS/DriverSetup.vue` + `DriverSetupManage.vue`

- Register/manage DMS driver roots (server paths, display name, description)
- **Install/configure disk root** action (marks `config_status`, triggers root install)
- Map roots to registered users (`UserMappingRoot.vue`)
- Filter data table

## Upload Entry Point — `src/pages/DMS/uploadDocument.vue`

- Public-facing upload route `/dms/show/:token/:id`
- Supports "outsider" (anonymous/token) upload as well as logged-in upload
- Excel import capability (`uploadExcel`)

## Sharing — `src/pages/DMS/shareFolderFile.vue` + `exploreShareView.vue`

- Share selected folders/files with other portal users
- Shared items appear in the "Shared" panel of the explorer

## Import — `src/pages/DMS/importFromSharepoint.vue` + `DMS/dataFilter.vue`

- Reusable data filter dialog used across modules
- Import documents from SharePoint into a local root

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| List registered roots | `dms/documentsRoots/getRegisteredRoot/{username}` |
| List folders/files | `dms/folderList/list/{username}/{root}/{id}` |
| Open document | `dms/documents/{id}` |
| Create folder | `dms/folders` |
| Upload documents | `dms/documents` |
| Delete | `dms/folders/{id}` / `dms/documents/{id}` |
| Resync folder | `dms/documentsRoots/resyncFolderToDB/{username}/{root}` |
| Root management | `dms/documentsRoots` |

## Key Files

```
src/pages/DMS/
├── ExploreViewer/
│   ├── exploreViewerIndex.vue      # main explorer
│   ├── exploreTilesView.vue        # grid view
│   ├── exploreListsView.vue        # list view
│   ├── exploreShareView.vue        # share dialog
│   ├── exploreSendToFE.vue         # send to front page
│   ├── exploreImportFromSharepoint.vue
├── DriverSetup.vue / DriverSetupManage.vue   # root config
├── UserMappingRoot.vue            # root→user mapping
├── importFromSharepoint.vue
├── shareFolderFile.vue
├── uploadDocument.vue             # public upload
├── dataFilter.vue                 # reusable filter dialog
```