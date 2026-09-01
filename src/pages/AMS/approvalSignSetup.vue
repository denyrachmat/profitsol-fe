<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    max-width
  >
    <q-card
      class="q-dialog-plugin bg-white"
      style="min-width: 1000px; max-width: 1200px"
    >
      <q-card-section class="row items-center">
        <div class="text-h6">Signature Box Designer</div>
        <q-space />
        <q-btn
          v-if="!pdfLoaded"
          outline
          color="primary"
          icon="upload_file"
          label="Load PDF"
          @click="openFilePicker"
        />
        <q-btn
          v-else
          flat
          color="warning"
          icon="refresh"
          label="Reload Document"
          @click="openFilePicker"
        />
      </q-card-section>

      <q-card-section class="q-pa-sm">
        <div class="row q-pb-sm justify-end">
          <q-badge color="info"
            >Add box: click an approver below, then click on the
            document</q-badge
          >
        </div>

        <div class="row" style="gap: 12px">
          <div class="col-12">
            <q-list
              bordered
              separator
              class="rounded-borders"
              style="max-height: 60vh; overflow: auto"
            >
              <q-item
                v-for="(apprv, idx) in approvers"
                :key="apprv.amsmd_id"
                clickable
                @click="selectedApprover = apprv"
              >
                <q-item-section>
                  <q-item-label>
                    <q-badge
                      :color="
                        selectedApprover &&
                        selectedApprover.amsmd_id === apprv.amsmd_id
                          ? 'primary'
                          : 'grey'
                      "
                    >
                      Order {{ apprv.amsmd_order }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption>{{
                    apprv.fullname || apprv.amsmd_username
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    color="red"
                    icon="delete"
                    size="sm"
                    @click.stop="removeBoxForApprover(apprv.amsmd_id, idx)"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <q-input
              v-model="labelInput"
              label="Box label (optional)"
              dense
              outlined
              class="q-mt-sm"
              placeholder="e.g. CFO Sign Here"
            />
          </div>

          <div class="col-12">
            <div
              ref="pdfContainer"
              class="pdf-container full-width"
              @click="placeBoxAt"
              @mousedown="onMouseDown"
              @mousemove="onMouseMove"
              @mouseup="onMouseUp"
              @mouseleave="onMouseUp"
            >
              <canvas
                ref="pdfCanvas"
                v-show="pdfLoaded"
                style="cursor: crosshair"
              ></canvas>
              <canvas
                ref="overlayCanvas"
                v-show="pdfLoaded"
                class="overlay-canvas"
                style="cursor: crosshair"
              ></canvas>
              <div v-if="!pdfLoaded" class="pdf-placeholder text-grey-6">
                Upload a PDF to start placing signature boxes
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <input
        ref="fileInput"
        type="file"
        accept="application/pdf"
        style="display: none"
        @change="onFileSelected"
      />

      <q-card-actions align="right">
        <q-btn
          label="Save Boxes"
          color="primary"
          :loading="saving"
          :disable="boxes.length === 0"
          @click="saveBoxes"
        />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  amsm_id: String,
  approvers: Array, // [{amsmd_id, amsmd_order, amsmd_username, fullname}]
  existingBoxes: Array, // pre-loaded boxes for edit
  documentUrl: String, // base64 or downloadable URL for existing doc
});

const pdfCanvas = ref(null);
const overlayCanvas = ref(null);
const pdfContainer = ref(null);
const fileInput = ref(null);

const pdfLoaded = ref(false);
const saving = ref(false);
const labelInput = ref("");
const selectedApprover = ref(null);
const boxes = ref([]); // {amsmd_id, dsbx_* , label, img coordinate}

const SCALE = 1.5; // match PdfEmbedView rendering scale
let currentPdf = null;
let pageCount = 1;
let currentPage = 1;
let boxScaleX = 1;
let boxScaleY = 1;
let dragIndex = -1;
let resizeIndex = -1; // active resize box index, -1 = none
let dragOffset = { x: 0, y: 0 }; // in PDF coords
let resizeCorner = ""; // ne | nw | se | sw
let mouseDown = false;
let lastOverIndex = -1; // box index under cursor while dragging
const RESIZE_HANDLE = 24; // size of draggable corner handle (larger = easier to grab)

onMounted(async () => {
  if (props.existingBoxes && props.existingBoxes.length > 0) {
    boxes.value = props.existingBoxes.map((b) => ({
      amsmd_id: b.amsmd_id,
      dsbx_page_no: b.dsbx_page_no,
      dsbx_x: b.dsbx_x,
      dsbx_y: b.dsbx_y,
      dsbx_width: b.dsbx_width,
      dsbx_height: b.dsbx_height,
      dsbx_label: b.dsbx_label,
    }));
  }
  if (props.documentUrl) {
    await loadPdf(props.documentUrl);
  }
});

const openFilePicker = () => fileInput.value.click();

const onFileSelected = (e) => {
  const file = e.target.files[0];
  if (file && file.type === "application/pdf") {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      await loadPdf(ev.target.result);
    };
    reader.readAsDataURL(file);
  }
  e.target.value = "";
};

const loadPdf = async (dataUrl) => {
  try {
    $q.loading.show();
    const pdfjsLib = await import(
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs"
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

    currentPdf = await pdfjsLib.getDocument(dataUrl).promise;
    pageCount = currentPdf.numPages;
    await renderPage(currentPage);
    pdfLoaded.value = true;
  } catch (err) {
    console.error("PDF load error:", err);
    $q.notify({
      type: "negative",
      message: "Failed to load PDF: " + err.message,
    });
  } finally {
    $q.loading.hide();
  }
};

const renderPage = async (pageNo) => {
  const page = await currentPdf.getPage(pageNo);
  const viewport = page.getViewport({ scale: SCALE });
  const canvas = pdfCanvas.value;
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;

  // Match the overlay canvas size to the PDF canvas
  const overlay = overlayCanvas.value;
  overlay.width = canvas.width;
  overlay.height = canvas.height;

  // PDF renders at 1.5x scale; used to convert canvas-relative coords to PDF scale-1 on save
  boxScaleX = SCALE;
  boxScaleY = SCALE;

  drawBoxes();
};

const placeBoxAt = (e) => {
  if (!pdfLoaded.value || !selectedApprover.value) {
    if (pdfLoaded.value && !selectedApprover.value) {
      $q.notify({
        type: "warning",
        message: "Select an approver first (left list)",
      });
    }
    return;
  }

  // If clicking on an existing box, don't place a new one here (handled by drag/resize)
  if (hitTest(e) !== -1) return;

  const canvas = pdfCanvas.value;
  const rect = canvas.getBoundingClientRect();
  // Click in CSS pixels → canvas internal pixels
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (e.clientX - rect.left) * scaleX;
  const canvasY = (e.clientY - rect.top) * scaleY;

  // Box stored in canvas pixel space
  const idx = boxes.value.findIndex(
    (b) => b.amsmd_id === selectedApprover.value.amsmd_id
  );
  const newBox = {
    amsmd_id: selectedApprover.value.amsmd_id,
    dsbx_page_no: currentPage,
    dsbx_x: canvasX - 75, // center box on click (150/2 = 75)
    dsbx_y: canvasY - 25, // (50/2 = 25)
    dsbx_width: 150,
    dsbx_height: 50,
    dsbx_label:
      labelInput.value ||
      selectedApprover.value.fullname ||
      selectedApprover.value.amsmd_username,
  };

  if (idx !== -1) {
    boxes.value.splice(idx, 1, newBox);
  } else {
    boxes.value.push(newBox);
  }
  drawBoxes();
};

const removeBoxForApprover = (amsmd_id) => {
  const idx = boxes.value.findIndex((b) => b.amsmd_id === amsmd_id);
  if (idx !== -1) {
    boxes.value.splice(idx, 1);
    drawBoxes();
  }
  if (selectedApprover.value && selectedApprover.value.amsmd_id === amsmd_id) {
    selectedApprover.value = null;
  }
};

// Get the box index under the pointer (in display px), -1 if none
// Convert a mouse event to canvas INTERNAL pixel coordinates
const toCanvasCoords = (e) => {
  const canvas = pdfCanvas.value;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
};

const hitTest = (e) => {
  const m = toCanvasCoords(e);
  for (let i = boxes.value.length - 1; i >= 0; i--) {
    const b = boxes.value[i];
    if (b.dsbx_page_no !== currentPage) continue;
    const x = b.dsbx_x;
    const y = b.dsbx_y;
    const w = b.dsbx_width;
    const h = b.dsbx_height;
    if (m.x >= x && m.x <= x + w && m.y >= y && m.y <= y + h) {
      return i;
    }
  }
  return -1;
};

const onMouseDown = (e) => {
  if (!pdfLoaded.value) return;
  e.preventDefault();
  const idx = hitTest(e);
  if (idx === -1) return;
  mouseDown = true;

  const m = toCanvasCoords(e);
  const b = boxes.value[idx];

  const x = b.dsbx_x;
  const y = b.dsbx_y;
  const w = b.dsbx_width;
  const h = b.dsbx_height;

  // Check if on a resize handle (corners)
  const corner = getResizeCorner(m, x, y, w, h);
  if (corner) {
    resizeIndex = idx;
    resizeCorner = corner;
    dragIndex = idx;
    dragOffset = { x: m.x - x, y: m.y - y };
  } else {
    dragIndex = idx;
    dragOffset = { x: m.x - x, y: m.y - y };
    resizeIndex = -1;
  }
};

const getResizeCorner = (m, x, y, w, h) => {
  // Generous grab area at the box corners (in canvas px) — handles are easier to hit
  const s = 20;
  const near = (mx, my, cx, cy) =>
    Math.abs(mx - cx) <= s && Math.abs(my - cy) <= s;
  if (near(m.x, m.y, x, y)) return "nw";
  if (near(m.x, m.y, x + w, y)) return "ne";
  if (near(m.x, m.y, x, y + h)) return "sw";
  if (near(m.x, m.y, x + w, y + h)) return "se";
  return "";
};

const onMouseMove = (e) => {
  if (!mouseDown || dragIndex === -1) return;
  e.preventDefault();
  const m = toCanvasCoords(e);

  const b = boxes.value[dragIndex];
  if (!b || b.dsbx_page_no !== currentPage) return;

  if (resizeIndex !== -1) {
    // Resize: adjust width/height based on corner, keep other corner fixed
    const x = b.dsbx_x;
    const y = b.dsbx_y;
    let w = b.dsbx_width;
    let h = b.dsbx_height;

    if (resizeCorner.includes("e")) {
      w = Math.max(30, m.x - x);
    } else if (resizeCorner.includes("w")) {
      const newX = Math.min(m.x, x + w - 30);
      w = x + w - newX;
      b.dsbx_x = newX;
    }
    if (resizeCorner.includes("s")) {
      h = Math.max(20, m.y - y);
    } else if (resizeCorner.includes("n")) {
      const newY = Math.min(m.y, y + h - 20);
      h = y + h - newY;
      b.dsbx_y = newY;
    }

    b.dsbx_width = w;
    b.dsbx_height = h;
  } else {
    // Drag: move box by offset
    b.dsbx_x = m.x - dragOffset.x;
    b.dsbx_y = m.y - dragOffset.y;
  }

  drawBoxes();
};

const onMouseUp = () => {
  mouseDown = false;
  dragIndex = -1;
  resizeIndex = -1;
  resizeCorner = "";
};

// Synchronous, cheap — draws boxes only on the overlay canvas (real-time during drag/resize)
const drawBoxes = () => {
  const overlay = overlayCanvas.value;
  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  boxes.value.forEach((box) => {
    if (box.dsbx_page_no !== currentPage) return;
    const x = box.dsbx_x;
    const y = box.dsbx_y;
    const w = box.dsbx_width;
    const h = box.dsbx_height;

    ctx.fillStyle = "rgba(255, 152, 0, 0.3)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#ff6d00";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#424242";
    ctx.font = "bold 12px sans-serif";
    ctx.textBaseline = "top";
    const approver = props.approvers.find((a) => a.amsmd_id === box.amsmd_id);
    ctx.fillText(
      box.dsbx_label || (approver ? approver.fullname : ""),
      x + 4,
      y + 2
    );

    // Resize handles at corners
    const s = RESIZE_HANDLE / 2;
    ctx.fillStyle = "#1976d2";
    [
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h],
    ].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, s, 0, 2 * Math.PI);
      ctx.fill();
    });
  });
};

const saveBoxes = async () => {
  saving.value = true;
  const data = await postData(
    "post",
    {
      amsm_id: props.amsm_id,
      boxes: boxes.value.map((b) => ({
        amsmd_id: b.amsmd_id,
        dsbx_page_no: b.dsbx_page_no,
        dsbx_x: Math.round((b.dsbx_x / boxScaleX) * 100) / 100,
        dsbx_y: Math.round((b.dsbx_y / boxScaleY) * 100) / 100,
        dsbx_width: Math.round((b.dsbx_width / boxScaleX) * 100) / 100,
        dsbx_height: Math.round((b.dsbx_height / boxScaleY) * 100) / 100,
        dsbx_label: b.dsbx_label || "",
      })),
    },
    `ams/docsign/save`,
    false,
    false,
    true
  );

  saving.value = false;

  if (data) {
    $q.notify({ color: "positive", message: "Signature boxes saved" });
    onDialogOK(boxes.value);
  }
};
</script>

<style scoped>
.pdf-container {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: auto;
  max-height: 60vh;
  background: #f5f5f5;
}
.pdf-container canvas {
  display: block;
  max-width: 100%;
  height: auto;
}
.pdf-container .overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  max-width: 100%;
  height: auto;
}
.pdf-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  border: 2px dashed #ccc;
}
</style>
