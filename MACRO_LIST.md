# Macro List

Browse, download, and distribute macro (Excel) files to portal groups.

## What It Does

Lets users navigate a folder tree of macro files, download individual macros, and send selected macros to portal user groups so they appear in the STX-I web system.

## Main List — `src/pages/MacroList/macroListIndex.vue`

- **Breadcrumb navigation** of macro folders (`macro/list/{btoa(path)}`)
- Items show a file icon, filename; folders navigate deeper; files can be downloaded
- Files already sent to the portal show a green "done_all" badge (`AppRole` set)
- **Check All / Uncheck All** selection helper
- **Send to Group** button → opens `sendToPortalGroup.vue` with the selected file paths

## Actions

| Action | Description |
|--------|-------------|
| Open folder | Navigates into a subfolder |
| Download macro | `macro/download/{btoa(path)}`, saved as `.xls` blob |
| Send to Group | Opens group picker dialog to distribute selected macros |
| Check All | Select / deselect all selectable files |

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| List files/folders | `macro/list` / `macro/list/{btoa(path)}` |
| Download macro | `macro/download/{btoa(path)}` |
| Send to portal group | via `sendToPortalGroup.vue` |

## Key Files

```
src/pages/MacroList/
├── macroListIndex.vue      # browse/download/send
└── sendToPortalGroup.vue   # group distribution dialog
```