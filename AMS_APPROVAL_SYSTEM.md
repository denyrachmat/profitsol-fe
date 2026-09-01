# AMS — Approval Management System

Approval workflow definition, mapping, history, notifications, and document signing.

> **Related docs (document signing only):**
> - `AMS_DOCSIGN_FRONTEND_STATUS.md` — signature-box designer + status
> - `SIGNATURE_BOXES_DRAG_RESIZE.md` — drag & resize of signature boxes
> - `SIGNATURE_BOXES_REALTIME_FIX.md` — real-time overlay-canvas performance fix
> - `SIGNATURE_BOX_UPLOAD_REQUIREMENT.md` — "Sign uploaded doc?" enforcement

## What It Does

Lets administrators define approval workflows (masters), configure multi-step approvers, run approvals (internal + external API), track history, and — when document signing is enabled — place signature boxes on documents that approvers sign.

## Approval List — `src/pages/AMS/indexAMS.vue`

- Searchable table of approvals (ID, Title, Created At)
- **Is Active** toggle per approval
- Edit (opens workflow editor) / Delete actions
- "Approval Mapping Maintenance" button

## Workflow Editor — `src/pages/AMS/addApprovalMapping.vue`

- Create/edit an approval master with its detail steps
- Entry point to the approval settings dialog and the document-sign setup
- Passes the approvers list + `amsm_id` down to `settingsApproval`

## Approval Settings — `src/pages/AMS/settingsApproval.vue`

- Per-approval configuration
- **"Is document sign?"** — enables the signature feature
- **"Sign uploaded doc?"** — (visible only when doc-sign is on) requires a document upload + per-submission signature boxes; when OFF, a pre-placed template signature setup is reused for all submissions (see `SIGNATURE_BOX_UPLOAD_REQUIREMENT.md`)
- **"Setup Sign Boxes"** button → opens the signature box designer

## Signature Box Designer — `src/pages/AMS/approvalSignSetup.vue`

- PDF.js viewer (CDN) with click-to-place, drag-to-move, and corner-handle resize
- Dual-canvas overlay architecture for real-time redraws
- Boxes saved via `POST /api/ams/docsign/save`
- See `AMS_DOCSIGN_FRONTEND_STATUS.md` and the SIGNATURE_BOXES_*.md files for details

## Approval Action (Approver side) — `src/pages/AMS/approvalUpdate.vue`

- Route `/ams/approvalAction/:token/:tokenHist/:mode`
- Approve / reject a pending approval reached from notification or token link
- Intent is to render the PDF + signature boxes and capture the approver signature (see "Not built yet" section of `AMS_DOCSIGN_FRONTEND_STATUS.md`)

## Supporting Views

| Feature | File |
|---------|------|
| History / status tracking | `approvalHist.vue`, `approvalProgress.vue` |
| Notification view | `approvalNotifView.vue` |
| Content editor for approval body | `approvalContentEditor.vue` |
| Attachments | `approvalAttachmentSet.vue` |
| Data filter dialog | `dataFilter.vue` |

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| List approvals | `ams/approval` |
| Update / delete approval | `ams/approval/{id}` |
| Approval history / notifications | `ams/approveHist` |
| Mark all notifications read | `ams/readAllNotif` |
| Save signature boxes | `ams/docsign/save` |
| Fetch signature boxes | `ams/docsign/{amsm_id}` |
| Approval by token | `ams/getMasterApprovalByToken/{token}/{tokenHist}` |

## Key Files

```
src/pages/AMS/
├── indexAMS.vue
├── addApprovalMapping.vue
├── settingsApproval.vue
├── approvalSignSetup.vue
├── approvalUpdate.vue
├── approvalHist.vue / approvalProgress.vue
├── approvalNotifView.vue
├── approvalContentEditor.vue
├── approvalAttachmentSet.vue
└── dataFilter.vue
```