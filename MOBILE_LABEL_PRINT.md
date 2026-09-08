# Mobile — Label Print Manager

Manage label print templates (ZPL/SBPL) consumed by the STX-I mobile apps for barcode/label printing.

## What It Does

Lets administrators create, edit, preview, and delete label templates. Each template stores the raw printer-language layout (ZPL or SBPL) plus a "contract" that defines which fields the mobile operator fills in before printing and which API the mobile app calls to fetch/confirm print data. There is no Barcode Manager module in the portal — barcode printing itself is executed by the mobile apps, which download these templates.

## Template List — `src/pages/Mobile/LabelPrintManager/index.vue`

- Dense `q-table` with columns: **Name**, **Language**, **Description**, **Actions**
- **Search** box filters rows client-side (300 ms debounce)
- **Add** button (green, `+`) opens the editor dialog with no data
- Row actions: **Edit** (green) and **Delete** (red, with confirm dialog)

| Action | Description |
|--------|-------------|
| Search | Client-side filter over name/language/description |
| Add | Opens `editLabel.vue` dialog in "New" mode |
| Edit | Opens `editLabel.vue` dialog in "Edit" mode with row data |
| Delete | Confirm dialog, then `DELETE labelManager/{id}` |

## Template Editor — `src/pages/Mobile/LabelPrintManager/editLabel.vue`

Full-width dialog with header fields and two tabs.

### Header Fields

| Field | Notes |
|-------|-------|
| Template Name | Free text |
| Printer Language | Select: `ZPL` or `SBPL` |
| Description | Free text |

### Tab: Layout (ZPL/SBPL)

- Monospace textarea holding the raw ZPL/SBPL template
- **Available variables** — every `{VAR}` occurrence in the template is parsed and shown as clickable chips; clicking a chip appends `{VAR}` to the template
- **Preview values** — one input per detected variable to fill sample data (defaults: `ITMCD=1234`, `PRINTQTY=10`, `COPIES=1`, `COPYNO=1`, others `Sample`)
- **Preview** — substitutes sample values into the template and renders a PNG via the Labelary API using configurable Label width/height (inches) and DPI (`6`/`8`/`12`/`24` dpmm); preview is downloadable

### Tab: Fields & Data (print contract)

Stored in the template's `config` object:

| Config | Description |
|--------|-------------|
| Form Fields (`filters`) | Repeatable rows: field name, label, type (`text`/`number`/`date`) — the inputs the mobile operator fills before printing |
| Confirmation Send Value | Repeatable rows: field, label, type, **Readonly** flag — values echoed on the print confirmation |
| API Url | Endpoint the mobile app calls for print data |
| Method | `POST` / `GET` / `PUT` |
| Use Confirmation | Toggle; when on, shows a confirmation step before printing |
| Confirmation Message | Text shown on that confirmation (default: "Are you sure you want to print?") |

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| List templates | `GET labelManager` |
| Create template | `POST labelManager` |
| Update template | `PATCH labelManager/{id}` |
| Delete template | `DELETE labelManager/{id}` |
| ZPL preview (external) | `POST https://api.labelary.com/v1/printers/{dpmm}dpmm/labels/{w}x{h}/0/` |

Payload saved per template: `{ id, name, language, description, template, config }`.

## Key Files

```
src/pages/Mobile/
└── LabelPrintManager/
    ├── index.vue     # template list + CRUD actions
    └── editLabel.vue # editor dialog: layout tab + fields & data contract tab
```

## Related Docs

- see SETTINGS_ADMINISTRATION.md — where module access is configured for roles
