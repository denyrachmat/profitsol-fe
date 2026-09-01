# "Sign Uploaded Doc?" Feature

## What It Does

When **"Sign uploaded doc?"** is enabled (checkbox in Approval Settings), it forces API submitters to:
1. Upload a document with every approval submission
2. Place signature boxes on that document for each approver step
3. Cannot reuse a pre-placed signature box setup — each submission requires its own boxes

This is useful for workflows where the document content changes per submission (e.g., each invoice, contract, or form is unique).

---

## Configuration

### Frontend (Approval Settings)

Two-tier toggle:
1. **"Is document sign?"** (main toggle) — enables signature box feature
2. **"Sign uploaded doc?"** (conditional, shows only if #1 is ON) — requires upload per submission

When **"Sign uploaded doc?"** is ON:
- API submitters **must** upload a document on every approval call
- Backend returns error if file is missing
- Signature boxes must be placed by the submitting app or user

When **"Sign uploaded doc?"** is OFF:
- API submitters can optionally upload a document
- Pre-defined signature boxes (setup once in "Setup Sign Boxes") are reused for all submissions
- Cleaner for static workflow documents

---

## Backend Enforcement

### New Field

**Table:** `ams_apprv_set_det`  
**Column:** `amssd_sign_uploaded_doc` (boolean, default: false)

### Validation in `ApprovalExternalController::initialize()`

```php
if (
    $approval->apprvSet->amssd_is_docsign &&
    $approval->apprvSet->amssd_sign_uploaded_doc
) {
    if (!$request->hasFile('file')) {
        return $this->handleError('This approval requires an uploaded document...');
    }
}
```

If the approval has `amssd_sign_uploaded_doc=1` but no file is attached, the API returns **HTTP 422** with error message.

---

## API Usage

### Scenario 1: Sign Uploaded Doc = OFF (Pre-placed boxes)

Creator setup:
1. Enable "Is document sign?" → ON
2. Enable "Sign uploaded doc?" → OFF
3. Click "Setup Sign Boxes" → place boxes on a sample/template document
4. Boxes saved and reused for all submissions

API submitter:
```bash
POST /api/ams/external/initialize
{
  "amsm_id": 1,
  "username": "john",
  "data": {...},
  # file: OPTIONAL
}
```
→ Uses pre-defined sign boxes for every approval.

### Scenario 2: Sign Uploaded Doc = ON (Per-submission upload)

Creator setup:
1. Enable "Is document sign?" → ON
2. Enable "Sign uploaded doc?" → ON
3. Skip "Setup Sign Boxes" (or it's optional — boxes set per submission)

API submitter:
```bash
POST /api/ams/external/initialize
{
  "amsm_id": 1,
  "username": "john",
  "data": {...},
  "file": <PDF or document>,
  "sign_boxes": [  # submitter provides boxes for THIS document
    {"amsmd_id": 12, "dsbx_page_no": 1, "dsbx_x": 100, "dsbx_y": 200, ...}
  ]
}
```
→ Document and boxes are specific to this submission. Next submission, different document = different boxes.

---

## Database Migration

Migration: `2026_08_12_180000_add_sign_uploaded_doc_to_ams_apprv_set_det.php`

Adds `amssd_sign_uploaded_doc` boolean column to `ams_apprv_set_det` table.

Status: ✅ **Already Migrated**

---

## Files Modified/Created

### Frontend
- `src/pages/AMS/settingsApproval.vue` — added toggle + logic to show/hide based on `amssd_is_docsign`

### Backend
- `database/migrations/2026_08_12_180000_add_sign_uploaded_doc_to_ams_apprv_set_det.php` ✅ migrated
- `app/Models/AMS/ApprovalSetDetail.php` — added `amssd_sign_uploaded_doc` to fillable
- `app/Http/Controllers/API/AMS/ApprovalSettingsController.php` — persist the field
- `app/Http/Controllers/API/AMS/ApprovalExternalController.php` — enforce doc requirement in `initialize()`

---

## Testing

### Backend Test

1. Create an approval with `amssd_is_docsign=1` and `amssd_sign_uploaded_doc=1`
2. Call API without file:
   ```bash
   curl -X POST http://localhost/api/ams/external/initialize \
     -H "X-Api-Key: ams_xyz..." \
     -d '{"amsm_id":1,"username":"john","data":{...}}'
   ```
   → Should return error: "This approval requires an uploaded document"

3. Call API with file:
   ```bash
   curl -X POST http://localhost/api/ams/external/initialize \
     -H "X-Api-Key: ams_xyz..." \
     -F "file=@document.pdf" \
     -F "amsm_id=1" \
     -F "username=john" \
     -F 'data={"key":"value"}'
   ```
   → Should succeed, return approval with sign boxes.

### Frontend Test

1. Go to Approval Settings
2. Toggle "Is document sign?" → ON
3. New toggle "Sign uploaded doc?" should appear
4. Toggle it ON/OFF and verify it saves (click OK → backend persists value)
5. Reload the approval → toggle state should persist

---

## Business Logic Summary

| Config | Behavior |
|--------|----------|
| `amssd_is_docsign=0` | No signatures. Regular approval. |
| `amssd_is_docsign=1`, `amssd_sign_uploaded_doc=0` | Signatures on **template document**. Setup once, reuse always. |
| `amssd_is_docsign=1`, `amssd_sign_uploaded_doc=1` | Signatures on **user-uploaded document**. Setup per submission. |

---

## Future Enhancements

- [ ] Automatic signature box placement (ML/AI to infer box positions from document text)
- [ ] Signature template library (save common box layouts for reuse)
- [ ] Document validation (require specific file types, page count, etc.)
- [ ] Signature verification (digital signature certificates, audit trail)

---

**Status:** ✅ Feature complete and tested.
