# AMS Document Signing - Frontend Implementation Status

## ✅ What Was Built

### 1. **Signature Box Designer Component** (`approvalSignSetup.vue`)
**Purpose:** Creator places signature boxes on a PDF for each approver.

**Features:**
- PDF viewer using PDF.js (CDN, no npm install needed — matches existing `PdfEmbedView.vue` pattern)
- Click approver → click document → places a signature box at that position
- Box coordinates scaled to PDF's internal coordinate space (backend receives PDF-native coords)
- Displays existing boxes if editing
- Saves boxes via `POST /api/ams/docsign/save`

**Props:**
- `amsm_id` — approval workflow ID
- `approvers` — array of `{amsmd_id, amsmd_order, amsmd_username, fullname}`
- `existingBoxes` — pre-loaded boxes for editing (optional)
- `documentUrl` — PDF base64 or URL (optional — can upload fresh)

**Usage:**
```vue
$q.dialog({
  component: approvalSignSetup,
  componentProps: {
    amsm_id: "5",
    approvers: [{amsmd_id: 12, amsmd_order: 1, fullname: "John Doe"}, ...],
  },
}).onOk((savedBoxes) => {
  console.log("Boxes saved:", savedBoxes);
});
```

---

### 2. **Integration into Settings** (`settingsApproval.vue`)

**Added:**
- "Setup Sign Boxes" button (shows only if `amssd_is_docsign=1`)
- `onClickSetupSignBoxes()` method — opens `approvalSignSetup` dialog
- Passes approvers list + amsm_id from parent

**Trigger:** Creator configures approval → enables "Is document sign?" toggle → clicks "Setup Sign Boxes" → places boxes → saved to backend.

---

### 3. **Caller Updated** (`addApprovalMapping.vue`)

**Modified `onClickApprovalSet()`:**
- Now passes `approvers` array (from `listApproval`) to `settingsApproval`
- Passes `amsm_id` for the sign-box API call

---

## 📦 Libraries Used

| Library | Source | Purpose |
|---------|--------|---------|
| **PDF.js** | CDN (`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs`) | Render PDF onto canvas |
| **None** | Native canvas API | Draw/overlay signature boxes |

**Zero npm install required** — follows existing pattern in `PdfEmbedView.vue`.

---

## 🚧 What's NOT Built Yet (Next Steps)

### 1. **Approver-Side Signature Capture** (`approvalUpdate.vue`)
The approver opens the token link → sees the document → needs to:
1. Fetch sign_boxes from `GET /api/ams/getMasterApprovalByToken/{token}/{tokenHist}`
2. Render PDF + overlay the boxes (read-only, highlight which is theirs)
3. Capture signature (draw or paste from profile)
4. On "Approve," send `signature_base64`, `signature_x`, `signature_y` to `POST /api/ams/approveAction`

**Required changes to `approvalUpdate.vue`:**
- Add PDF viewer (same PDF.js pattern)
- Add signature pad (either `signature_pad` npm lib or canvas drawing)
- Extend `actionApprove()` to include signature data

### 2. **Backend Request Validation**
`ApprovalRunningApproveActionRequest.php` needs to accept:
```php
'signature_base64' => 'nullable|string',
```

### 3. **Backend Signature Stamping (FPDI)**
The `stampSignatureOnPdf()` method in `ApprovalActionTraits.php` is a stub. Needs:
```bash
composer require setasign/fpdi:^2.0
```
Then implement overlay logic.

### 4. **Fetch Existing Boxes for Edit**
When reopening `approvalSignSetup`, fetch boxes via:
```http
GET /api/ams/docsign/{amsm_id}
```
Pass the result as `existingBoxes` prop.

---

## 🧪 Testing the Creator Flow

### Step 1: Enable Document Sign
1. Go to `/AMS` → click "Settings" on an approval
2. Toggle "Is document sign?" → ON
3. Click "Setup Sign Boxes"

### Step 2: Place Boxes
1. Upload a PDF (or load existing)
2. Click an approver in the left list
3. Click on the document where their signature should go
4. Repeat for each approver
5. Click "Save Boxes"

### Step 3: Verify Backend Stored
Check database:
```sql
SELECT * FROM ams_apprv_docsign_boxes WHERE amsm_id = 5;
```

Or API:
```http
GET /api/ams/docsign/5
```

---

## 🐛 Known Limitations

1. **Single-page PDFs only** — multi-page support needs pagination UI (next/prev page buttons). The `dsbx_page_no` field is ready, but the UI always uses page 1.
2. **No box dragging** — boxes are placed via click, not draggable/resizable (can add vue-draggable-resizable if needed).
3. **No PDF preview in token email** — approver must click the link to see the doc.
4. **Coordinate scaling** — assumes PDF renders at scale 1.5 (matches `PdfEmbedView.vue`). If backend PDF has different dimensions, coordinates may misalign.

---

## 🔧 Configuration

### Backend API Endpoints Used
- `POST /api/ams/docsign/save` — save boxes
- `GET /api/ams/docsign/{amsm_id}` — fetch boxes (for edit mode, not yet wired)
- `GET /api/ams/getMasterApprovalByToken/{token}/{tokenHist}` — returns `sign_boxes` (backend already done)

### Props Passed Down the Chain
```
indexAMS.vue (main approval list)
  → addApprovalMapping.vue (approval workflow editor)
    → settingsApproval.vue (approval settings dialog)
      → approvalSignSetup.vue (signature box designer)
```

---

## ✅ Files Created/Modified

### Created:
- `src/pages/AMS/approvalSignSetup.vue`

### Modified:
- `src/pages/AMS/settingsApproval.vue` (added Setup Sign Boxes button + method)
- `src/pages/AMS/addApprovalMapping.vue` (pass approvers to settingsApproval)

---

## 📝 Next Session To-Do

1. **Fetch existing boxes** when editing:
   ```js
   const getExistingBoxes = async () => {
     const data = await postData("get", null, `ams/docsign/${props.amsm_id}`, false, false, true);
     if (data?.status) {
       boxes.value = data.data;
       redrawBoxes();
     }
   };
   onMounted(getExistingBoxes);
   ```

2. **Build approver signature capture** in `approvalUpdate.vue`:
   - Render PDF + boxes from `datas.value.sign_boxes`
   - Add signature pad (or reuse `setupProfiles.vue` signature)
   - On approve, include `signature_base64` in the API call

3. **Install FPDI** + implement `stampSignatureOnPdf()` for actual PDF overlay.

---

**Status:** ✅ Creator-side (box placement) complete. Approver-side (signing) pending.
