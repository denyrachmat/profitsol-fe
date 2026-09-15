# Mobile Modules

Label printing (ZPL/SBPL) template management, served as mobile apps in the portal.

> Apps with code prefix `MBL_APP` are filtered out of the desktop drawer and shown as mobile apps.

## Label Print Manager — `src/pages/Mobile/LabelPrintManager/`

Manages label printer templates used to print barcode/label stickers from mobile devices.

### List — `index.vue`
- Table of label templates: Name, Language, Description + search
- **Add / Edit** opens `editLabel.vue`; **Delete** removes a template
- Data source: `labelManager`

### Editor — `editLabel.vue`
- Fields: template name, **printer language** (ZPL or SBPL), description
- Two tabs:
  - **Layout (ZPL/SBPL)** — write the raw printer command template; insert available variables (`{var}`) via clickable chips
  - **Fields & Data** — configure the data fields bound to the template
- Saves via POST/PATCH `labelManager` / `labelManager/{id}`

## Barcode Manager — `src/pages/Mobile/BarcodeManager/`

- Placeholder directory (no components implemented yet)

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| List templates | `labelManager` |
| Create / update template | `labelManager` / `labelManager/{id}` |
| Delete template | `labelManager/{id}` |

## Related

- `qz-tray` is listed in dependencies for raw printer / socket printing support

## Key Files

```
src/pages/Mobile/
├── LabelPrintManager/
│   ├── index.vue      # template list + CRUD
│   └── editLabel.vue  # ZPL/SBPL template editor
└── BarcodeManager/    # (empty placeholder)
```