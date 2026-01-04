<template>
  <q-editor
    ref="editorRef"
    v-model="comment"
    :dense="$q.screen.lt.md"
    :toolbar="toolbarOptions"
    :fonts="{
      arial: 'Arial',
      arial_black: 'Arial Black',
      comic_sans: 'Comic Sans MS',
      courier_new: 'Courier New',
      impact: 'Impact',
      lucida_grande: 'Lucida Grande',
      times_new_roman: 'Times New Roman',
      verdana: 'Verdana',
    }"
    :definitions="definitions"
    @paste.native="onPaste"
    @click="onEditorClick"
    @keydown.ctrl.enter.prevent="onSubmitComment"
    :sanitize="sanitizeHtml"
  />

  <input
    ref="fileInputRef"
    type="file"
    multiple
    accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
    class="hidden"
    @change="onPickFiles"
  />

  <!-- simple resize popup -->
  <q-dialog v-model="resizeDialog">
    <q-card style="min-width: 320px">
      <q-card-section class="text-h6"> Resize Image </q-card-section>

      <q-card-section>
        <div class="q-mb-sm">Width: {{ resizeWidth }}%</div>
        <q-slider
          v-model="resizeWidth"
          :min="10"
          :max="100"
          :step="5"
          label
          @update:model-value="applyResize"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Attachment list -->
  <div v-if="attachments.length" class="q-mt-md">
    <div class="text-subtitle2 q-mb-sm">Attachments</div>
    <q-list bordered separator>
      <q-item v-for="(att, i) in attachments" :key="i">
        <q-item-section avatar>
          <q-icon :name="getFileIcon(att)" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ att.name }}</q-item-label>
          <q-item-label caption
            >{{ att.mime }} • {{ prettySize(att.size) }}</q-item-label
          >
        </q-item-section>

        <q-item-section side>
          <q-btn
            flat
            dense
            icon="open_in_new"
            :href="att.url"
            target="_blank"
          />
          <q-btn
            flat
            dense
            icon="delete"
            color="negative"
            @click="removeAttachment(i)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- Uploading progress -->
  <q-dialog v-model="uploading" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-subtitle1">{{ uploadLabel }}</div>
        <div class="text-caption q-mt-xs">{{ uploadProgress }}%</div>
        <q-linear-progress
          :value="uploadProgress / 100"
          color="primary"
          class="q-mt-sm"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- TABLE PICKER DIALOG -->
  <q-dialog v-model="tableDialog">
    <q-card style="min-width: 350px; max-width: 400px">
      <q-card-section class="text-h6"> Insert Table </q-card-section>

      <q-card-section>
        <!-- GRID PICKER -->
        <div class="text-caption q-mb-sm">Quick select:</div>

        <div class="table-picker">
          <div v-for="r in pickerMaxRows" :key="'r' + r" class="picker-row">
            <div
              v-for="c in pickerMaxCols"
              :key="'c' + c"
              class="picker-cell"
              :class="{ active: r <= pickerHoverRow && c <= pickerHoverCol }"
              @mouseover="hoverPicker(r, c)"
              @click="selectPicker(r, c)"
            ></div>
          </div>
        </div>

        <!-- Preview selected -->
        <div class="text-caption q-mt-sm">
          Selected:
          <strong v-if="pickerHoverRow"
            >{{ pickerHoverRow }} × {{ pickerHoverCol }}</strong
          >
          <span v-else>No selection</span>
        </div>

        <q-separator class="q-my-md" />

        <!-- MANUAL INPUT -->
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model.number="tableRows"
              type="number"
              label="Rows"
              dense
              min="1"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="tableCols"
              type="number"
              label="Columns"
              dense
              min="1"
            />
          </div>
        </div>

        <q-toggle v-model="tableHasHeader" label="Header row" dense />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn color="primary" label="Insert" @click="onInsertTable" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="tableToolsDialog">
    <q-card style="min-width: 260px">
      <q-card-section class="text-h6"> Table tools </q-card-section>
      <q-card-section class="q-gutter-sm">
        <q-btn dense label="Row above" @click="addRowAbove" />
        <q-btn dense label="Row below" @click="addRowBelow" />
        <q-btn dense label="Delete row" color="negative" @click="deleteRow" />

        <q-separator />

        <q-btn dense label="Col left" @click="addColumnLeft" />
        <q-btn dense label="Col right" @click="addColumnRight" />
        <q-btn
          dense
          label="Delete col"
          color="negative"
          @click="deleteColumn"
        />

        <q-separator />

        <q-btn dense label="Merge right" @click="mergeRight" />
        <q-btn dense label="Merge down" @click="mergeDown" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Floating table tools -->
  <div
    v-if="showTableTools"
    class="table-tools-float"
    :style="{
      top: tableToolsPos.top + 'px',
      left: tableToolsPos.left + 'px',
    }"
  >
    <q-btn-group dense unelevated>
      <q-btn
        size="xs"
        icon="border_top"
        @click="addRowAbove"
        :title="'Insert row above'"
      />
      <q-btn
        size="xs"
        icon="border_bottom"
        @click="addRowBelow"
        :title="'Insert row below'"
      />
      <q-btn
        size="xs"
        icon="horizontal_rule"
        color="negative"
        @click="deleteRow"
        :title="'Delete row'"
      />

      <q-separator vertical inset />

      <q-btn
        size="xs"
        icon="border_left"
        @click="addColumnLeft"
        :title="'Insert column left'"
      />
      <q-btn
        size="xs"
        icon="border_right"
        @click="addColumnRight"
        :title="'Insert column right'"
      />
      <q-btn
        size="xs"
        icon="more_vert"
        color="negative"
        @click="deleteColumn"
        :title="'Delete column'"
      />

      <q-separator vertical inset />

      <q-btn
        size="xs"
        icon="call_merge"
        @click="mergeRight"
        :title="'Merge right'"
      />
      <q-btn size="xs" icon="south" @click="mergeDown" :title="'Merge down'" />
    </q-btn-group>
  </div>

  <q-dialog v-model="flowDialog" full-height full-width>
    <JointBoard @cancel="flowDialog = false" @insert="onInsertDiagram" />
  </q-dialog>

  <q-btn
    class="q-mt-md"
    color="primary"
    label="Submit"
    @click="onSubmitComment"
  />
  <q-btn
    class="q-mt-md q-ml-sm"
    color="negative"
    label="Cancel"
    outline
    @click="onCancelComment"
  />
</template>
<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  defineEmits,
  defineProps,
} from "vue";
import apiRequest from "src/components/apiRequest";
import { EmojiButton } from "@joeattardi/emoji-button";
import { useQuasar, dom } from "quasar";
import interact from "interactjs";
import JointBoard from "src/components/JoinBoard.vue";

const { sanitize } = dom;

const sanitizeHtml = (html) => {
  return sanitize(html, {
    // tambahin table-related tags
    allowedTags: [
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "span",
      "div",
      "p",
      "br",
      "b",
      "strong",
      "i",
      "u",
      "img",
      "video",
      "iframe",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      // dsb sesuai kebutuhanmu
    ],
    allowedAttributes: {
      "*": ["style", "class", "data-embed"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "data-embed"],
      video: ["src", "controls", "data-embed"],
      iframe: ["src", "data-embed"],
      table: ["style"],
      td: ["style"],
      th: ["style"],
    },
  });
};
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  initialAttachments: {
    type: Array,
    default: () => [],
  },
});

const $q = useQuasar();
const { postData } = apiRequest();
let picker;

const emit = defineEmits(["submit", "onCancel"]);

const flowDialog = ref(false);
const comment = ref("");
const attachments = ref([]);

const showTableTools = ref(false);
const tableToolsPos = ref({ top: 0, left: 0 });
const currentCellEl = ref(null);
const tableToolsDialog = ref(false);
const resizeDialog = ref(false);
const resizeWidth = ref(100);
const editorRef = ref(null);
const fileInputRef = ref(null);
const toolbarOptions = [
  [
    {
      label: $q.lang.editor.align,
      icon: $q.iconSet.editor.align,
      fixedLabel: true,
      options: ["left", "center", "right", "justify"],
    },
  ],
  ["bold", "italic", "strike", "underline", "subscript", "superscript"],
  ["token", "hr", "link", "custom_btn"],
  ["print", "fullscreen"],
  [
    {
      label: $q.lang.editor.formatting,
      icon: $q.iconSet.editor.formatting,
      list: "no-icons",
      options: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "code"],
    },
    {
      label: $q.lang.editor.fontSize,
      icon: $q.iconSet.editor.fontSize,
      fixedLabel: true,
      fixedIcon: true,
      list: "no-icons",
      options: [
        "size-1",
        "size-2",
        "size-3",
        "size-4",
        "size-5",
        "size-6",
        "size-7",
      ],
    },
    {
      label: $q.lang.editor.defaultFont,
      icon: $q.iconSet.editor.font,
      fixedIcon: true,
      list: "no-icons",
      options: [
        "default_font",
        "arial",
        "arial_black",
        "comic_sans",
        "courier_new",
        "impact",
        "lucida_grande",
        "times_new_roman",
        "verdana",
      ],
    },
    "removeFormat",
  ],
  ["quote", "unordered", "ordered", "outdent", "indent"],

  ["undo", "redo"],
  ["viewsource"],
  ["emoji"],
  ["uploadFile"],
  ["table"],
  ["tableTools"],
  ["flowchart"],
];

const definitions = {
  uploadFile: {
    tip: "Upload file",
    icon: "attach_file",
    handler: () => triggerPicker(),
  },
  emoji: {
    tip: "Insert emoji",
    icon: "insert_emoticon",
    handler: (evt) => openEmojiPicker(evt),
  },
  table: {
    tip: "Insert Table",
    icon: "table_chart",
    handler: () => {
      tableRows.value = 2;
      tableCols.value = 2;
      tableHasHeader.value = true;
      pickerHoverRow.value = 0;
      pickerHoverCol.value = 0;
      tableDialog.value = true;
    },
  },
  tableTools: {
    tip: "Table tools",
    icon: "border_all",
    handler: () => {
      const cell = getCurrentCell();
      if (!cell) {
        $q.notify({ type: "warning", message: "Cursor harus di dalam tabel" });
        return;
      }
      tableToolsDialog.value = true;
    },
  },
  flowchart: {
    tip: "Insert Diagram",
    icon: "schema",
    handler: () => {
      flowDialog.value = true;
    },
  },
};

const uploading = ref(false);
const uploadProgress = ref(0);
const uploadLabel = ref("Uploading...");

const tableDialog = ref(false);

// manual inputs
const tableRows = ref(2);
const tableCols = ref(2);
const tableHasHeader = ref(true);

// grid picker config
const pickerMaxRows = 10;
const pickerMaxCols = 10;
const pickerHoverRow = ref(0);
const pickerHoverCol = ref(0);
const pickerLocked = ref(false);

onMounted(async () => {
  await nextTick();
  const root = getEditor()?.$el?.querySelector(".q-editor__content");
  if (!root) return;

  root.addEventListener("beforepaste", (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.kind === "file") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
    }
  });

  // klik di luar wrapper => unselect
  document.addEventListener("click", (e) => {
    if (activeWrapper && !activeWrapper.contains(e.target)) {
      unselectEmbeddable();
    }
  });

  document.addEventListener("selectionchange", updateTableToolbar);

  picker = new EmojiButton({
    position: "top-start",
    theme: "auto",
    autoHide: true,
  });

  picker.on("emoji", (selection) => {
    // selection.emoji berisi karakter emoji 😀
    insertEmoji(selection.emoji);
  });

  // inisialisasi comment & attachments dari props
  console.log(props.modelValue);
  comment.value = props.modelValue || "";
  attachments.value = Array.isArray(props.initialAttachments)
    ? props.initialAttachments
    : [];
});

onBeforeUnmount(() => {
  document.removeEventListener("selectionchange", updateTableToolbar);
});

// Function Start
function onInsertDiagram(payload) {
  const html = `
    <img src="${payload.url}" 
         style="max-width:100%;width:60%;cursor:pointer;" />
  `;
  insertHtmlAtCursor(html);
  flowDialog.value = false;
}

const onInsertTable = () => {
  const rows = Math.max(1, pickerHoverRow.value || tableRows.value || 1);
  const cols = Math.max(1, pickerHoverCol.value || tableCols.value || 1);

  const html = buildTableHtml(rows, cols, tableHasHeader.value);

  // 👉 langsung append ke v-model, tanpa runCmd
  comment.value = (comment.value || "") + html;

  tableDialog.value = false;
};

function buildTableHtml(rows, cols, hasHeader) {
  let thead = "";
  let tbody = "";

  if (hasHeader) {
    thead += "<thead><tr>";
    for (let c = 0; c < cols; c++) {
      thead += `<th style="border:1px solid #ccc;padding:4px;">Header ${
        c + 1
      }</th>`;
    }
    thead += "</tr></thead>";
  }

  for (let r = 0; r < rows; r++) {
    tbody += "<tr>";
    for (let c = 0; c < cols; c++) {
      tbody += `<td style="border:1px solid #ccc;padding:4px;">&nbsp;</td>`;
    }
    tbody += "</tr>";
  }

  return `
    <table style="border-collapse:collapse;width:100%;max-width:100%;margin:4px 0;">
      ${thead}
      <tbody>${tbody}</tbody>
    </table>
  `;
}

function getContentRoot() {
  const ed = getEditor();
  if (!ed) return null;

  if (typeof ed.getContentEl === "function") {
    return ed.getContentEl();
  }

  return ed.$el?.querySelector(".q-editor__content") || null;
}

function getCurrentCell() {
  const root = getContentRoot();
  if (!root) return null;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  let node = sel.anchorNode;
  if (!node) return null;

  // kalau text node, naik ke parent element dulu
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }

  while (node && node !== root) {
    if (
      node.nodeType === 1 &&
      (node.tagName === "TD" || node.tagName === "TH")
    ) {
      return node;
    }
    node = node.parentNode;
  }

  return null;
}

function syncModelFromDom() {
  const root = getContentRoot();
  if (!root) return;
  comment.value = root.innerHTML;
}

function addRowBelow() {
  const cell = getCurrentCell();
  if (!cell) return;

  const row = cell.closest("tr");
  if (!row) return;

  const tbody = row.parentElement; // bisa tbody atau thead
  const newRow = row.cloneNode(true);

  // kosongkan isi cell
  newRow.querySelectorAll("td, th").forEach((td) => {
    td.innerHTML = "&nbsp;";
  });

  tbody.insertBefore(newRow, row.nextSibling);

  syncModelFromDom();
}

function updateTableToolbar() {
  const cell = getCurrentCell();

  if (!cell) {
    showTableTools.value = false;
    currentCellEl.value = null;
    return;
  }

  currentCellEl.value = cell;

  const rect = cell.getBoundingClientRect();

  tableToolsPos.value = {
    // sedikit naik di atas cell
    top: rect.top - 32, // px
    left: rect.left + rect.width / 2,
  };

  showTableTools.value = true;
}

function addRowAbove() {
  const cell = getCurrentCell();
  if (!cell) return;

  const row = cell.closest("tr");
  if (!row) return;

  const tbody = row.parentElement;
  const newRow = row.cloneNode(true);

  newRow.querySelectorAll("td, th").forEach((td) => {
    td.innerHTML = "&nbsp;";
  });

  tbody.insertBefore(newRow, row);

  syncModelFromDom();
}

function deleteRow() {
  const cell = getCurrentCell();
  if (!cell) return;

  const row = cell.closest("tr");
  if (!row) return;

  const tbody = row.parentElement;
  row.remove();

  // kalau tbody sudah kosong dan table jadi kosong, boleh sekalian hapus table
  if (tbody.children.length === 0) {
    const table = tbody.closest("table");
    table?.remove();
  }

  syncModelFromDom();
}

function addColumnRight() {
  const cell = getCurrentCell();
  if (!cell) return;

  const row = cell.closest("tr");
  const table = row.closest("table");
  if (!table) return;

  const cellIndex = Array.from(row.children).indexOf(cell);

  table.querySelectorAll("tr").forEach((tr) => {
    const refCell = tr.children[cellIndex];
    if (!refCell) return;

    const isHeader = refCell.tagName === "TH";
    const newCell = document.createElement(isHeader ? "th" : "td");

    newCell.style.border = "1px solid #ccc";
    newCell.style.padding = "4px";
    newCell.innerHTML = "&nbsp;";

    // insert setelah kolom aktif
    tr.insertBefore(newCell, refCell.nextSibling);
  });

  syncModelFromDom();
}

function addColumnLeft() {
  const cell = getCurrentCell();
  if (!cell) return;

  const row = cell.closest("tr");
  const table = row.closest("table");
  if (!table) return;

  const cellIndex = Array.from(row.children).indexOf(cell);

  table.querySelectorAll("tr").forEach((tr) => {
    const refCell = tr.children[cellIndex];
    if (!refCell) return;

    const isHeader = refCell.tagName === "TH";
    const newCell = document.createElement(isHeader ? "th" : "td");

    newCell.style.border = "1px solid #ccc";
    newCell.style.padding = "4px";
    newCell.innerHTML = "&nbsp;";

    tr.insertBefore(newCell, refCell);
  });

  syncModelFromDom();
}

function deleteColumn() {
  const cell = getCurrentCell();
  if (!cell) return;

  const row = cell.closest("tr");
  const table = row.closest("table");
  if (!table) return;

  const cellIndex = Array.from(row.children).indexOf(cell);

  table.querySelectorAll("tr").forEach((tr) => {
    const target = tr.children[cellIndex];
    if (target) target.remove();
  });

  syncModelFromDom();
}

function mergeRight() {
  const cell = getCurrentCell();
  if (!cell) return;

  const next = cell.nextElementSibling;
  if (!next || (next.tagName !== "TD" && next.tagName !== "TH")) return;

  const colSpan1 = Number(cell.getAttribute("colspan") || 1);
  const colSpan2 = Number(next.getAttribute("colspan") || 1);

  cell.setAttribute("colspan", colSpan1 + colSpan2);

  // gabung isi
  const text1 = cell.innerHTML.trim();
  const text2 = next.innerHTML.trim();
  cell.innerHTML = (text1 + " " + text2).trim() || "&nbsp;";

  next.remove();

  syncModelFromDom();
}

function mergeDown() {
  const cell = getCurrentCell();
  if (!cell) return;

  const row = cell.closest("tr");
  const table = row.closest("table");
  if (!table) return;

  const cellIndex = Array.from(row.children).indexOf(cell);
  const nextRow = row.nextElementSibling;
  if (!nextRow) return;

  const belowCell = nextRow.children[cellIndex];
  if (!belowCell) return;

  const rowSpan1 = Number(cell.getAttribute("rowspan") || 1);
  const rowSpan2 = Number(belowCell.getAttribute("rowspan") || 1);

  cell.setAttribute("rowspan", rowSpan1 + rowSpan2);

  const text1 = cell.innerHTML.trim();
  const text2 = belowCell.innerHTML.trim();
  cell.innerHTML = (text1 + " " + text2).trim() || "&nbsp;";

  belowCell.remove();

  syncModelFromDom();
}

function hoverPicker(r, c) {
  if (pickerLocked.value) return;
  pickerHoverRow.value = r;
  pickerHoverCol.value = c;
}

function selectPicker(r, c) {
  if (!pickerLocked.value) {
    // Locking mode: set & lock selection
    pickerHoverRow.value = r;
    pickerHoverCol.value = c;
    tableRows.value = r;
    tableCols.value = c;

    pickerLocked.value = true; // 🔒 LOCK
  } else {
    // Unlock mode: klik lagi → buka lock → hover kembali aktif
    pickerLocked.value = false;
  }
}

function triggerPicker() {
  if (fileInputRef.value) return fileInputRef.value.click();

  // fallback kalau ref null
  const tmp = document.createElement("input");
  tmp.type = "file";
  tmp.multiple = true;
  tmp.accept = fileInputRef.value?.accept || "*/*";
  tmp.onchange = onPickFiles;
  tmp.click();
}

function applyResize(val) {
  if (!selectedImgEl.value) return;
  selectedImgEl.value.style.width = `${val}%`;
  selectedImgEl.value.style.maxWidth = "100%";
}

async function insertHtmlAtCursor(html) {
  const ed = getEditor();
  if (!ed) {
    console.warn("QEditor ref tidak ditemukan");
    return;
  }

  await nextTick();

  // cek apakah lagi viewsource (contenteditable dimatiin)
  let contentEl = null;
  if (typeof ed.getContentEl === "function") {
    contentEl = ed.getContentEl();
  } else {
    contentEl = ed.$el?.querySelector(".q-editor__content") || null;
  }

  const isSourceMode =
    contentEl && contentEl.getAttribute("contenteditable") === "false";

  if (isSourceMode) {
    // toggle balik ke mode normal dulu
    ed.runCmd("viewsource");
  }

  console.log("Insert HTML at cursor:", html);

  ed.focus();
  ed.runCmd("insertHTML", html);
}

// ===== Upload handler =====
async function onPickFiles(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  try {
    for (const file of files) {
      const meta = await uploadFile(file); // {url,name,mime,size}

      if (isEmbeddable(meta)) {
        insertEmbed(meta);
      } else {
        attachments.value.push(meta);
      }
    }
  } finally {
    e.target.value = "";
  }
}

async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);

  // const res = await axios.post("/api/upload-file", form, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });

  const res = await postData("post", form, "dms/uploadFiles", true, true);
  // fallback kalau backend gak kirim mime/name/size

  console.log("Upload file response:", res);
  // Parse response if it's arraybuffer
  let responseData = res.data;
  if (
    res.config.responseType === "arraybuffer" &&
    responseData instanceof ArrayBuffer
  ) {
    const text = new TextDecoder().decode(responseData);
    responseData = JSON.parse(text);
  }

  return {
    url: responseData.url || responseData.path || URL.createObjectURL(file),
    name: responseData.name || responseData.filename || file.name,
    mime:
      responseData.mime ||
      responseData.type ||
      file.type ||
      guessMime(file.name),
    size: responseData.size || file.size,
  };
}

function isEmbeddable(meta) {
  const m = meta.mime || "";
  return (
    m.startsWith("image/") || m.startsWith("video/") || m === "application/pdf"
  );
}

// ===== Insert to content editor =====
function insertEmbed(meta) {
  const ed = getEditor();
  if (!ed) return;

  ed.focus();

  if (meta.mime.startsWith("image/")) {
    ed.runCmd(
      "insertHTML",
      `<img src="${meta.url}" data-embed="image"
            style="max-width:100%;width:50%;height:auto;cursor:pointer;" />`
    );
    return;
  }

  if (meta.mime.startsWith("video/")) {
    ed.runCmd(
      "insertHTML",
      `<video src="${meta.url}" data-embed="video" controls
              style="max-width:100%;width:60%;cursor:pointer;"></video>`
    );
    return;
  }

  if (meta.mime === "application/pdf") {
    // embed pdf pakai iframe
    ed.runCmd(
      "insertHTML",
      `<iframe src="${meta.url}" data-embed="pdf"
               style="width:80%;height:400px;max-width:100%;border:1px solid #ddd;cursor:pointer;"></iframe>`
    );
  }
}

// ===== Paste image support =====
let pasteLock = false;
async function onPaste(evt) {
  if (pasteLock) return;
  pasteLock = true;

  try {
    const clipboard = evt.clipboardData;
    if (!clipboard?.items) return;

    for (const item of clipboard.items) {
      // 1) FILE paste (image/png, application/pdf, dll.)
      if (item.kind === "file") {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();

        const file = item.getAsFile();
        if (!file) return;

        await handleSingleFile(file);
        return;
      }

      // 2) RAW IMAGE paste (Google Images, WhatsApp Web, dll.)
      if (item.type.startsWith("image/")) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();

        const file = item.getAsFile();
        if (!file) return;

        const meta = await uploadFile(file);
        insertEmbed(meta);
        return;
      }
    }

    // 3) Jika clipboard **bukan file** dan **bukan raw image**,
    //    maka biarkan browser melakukan default paste (text, html, image blob)
    //    → setelah itu kita normalize
    setTimeout(() => normalizeEmbeds(), 0);
  } finally {
    setTimeout(() => (pasteLock = false), 0);
  }
}

function normalizeEmbeds() {
  const root = getEditor()?.$el?.querySelector(".q-editor__content");
  if (!root) return;

  root.querySelectorAll("img:not([data-embed])").forEach((img) => {
    img.setAttribute("data-embed", "image");
    img.style.maxWidth = "100%";
    img.style.cursor = "pointer";
  });
}

async function handleSingleFile(file) {
  // 1) bikin placeholder text di editor
  const phId = insertPlaceholder(file.name);

  try {
    const meta = await uploadFile(file); // ini yang punya progress

    if (isEmbeddable(meta)) {
      const html = buildEmbedHtml(meta);
      replacePlaceholder(phId, html);
    } else {
      attachments.value.push(meta);
      replacePlaceholder(
        phId,
        `<span style="color:#666">📎 ${meta.name}</span>`
      );
    }
  } catch (err) {
    replacePlaceholder(
      phId,
      `<span style="color:red">❌ Upload failed: ${file.name}</span>`
    );
    throw err;
  }
}

function insertPlaceholder(label) {
  const ed = getEditor();
  if (!ed) return null;

  const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  ed.focus();
  ed.runCmd(
    "insertHTML",
    `<span data-upload-id="${id}"
            style="display:inline-block;padding:6px 10px;border:1px dashed #999;border-radius:6px;color:#666;">
       ⏳ ${label}
     </span>`
  );
  return id;
}

function replacePlaceholder(id, html) {
  const root = getEditor()?.$el?.querySelector(".q-editor__content");
  if (!root) return;

  const node = root.querySelector(`[data-upload-id="${id}"]`);
  if (!node) return;

  node.outerHTML = html;
}

function buildEmbedHtml(meta) {
  if (meta.mime.startsWith("image/")) {
    return `<img src="${meta.url}" data-embed="image"
            style="max-width:100%;width:50%;height:auto;cursor:pointer;" />`;
  }
  if (meta.mime.startsWith("video/")) {
    return `<video src="${meta.url}" data-embed="video" controls
            style="max-width:100%;width:60%;cursor:pointer;"></video>`;
  }
  if (meta.mime === "application/pdf") {
    return `<iframe src="${meta.url}" data-embed="pdf"
            style="width:80%;height:400px;max-width:100%;border:1px solid #ddd;cursor:pointer;"></iframe>`;
  }
  return `<a href="${meta.url}" target="_blank">${meta.name}</a>`;
}

// ===== Resize only for image/video/pdf =====
let activeWrapper = null;

function onEditorClick(evt) {
  const el = evt.target;

  if (el?.tagName === "IMG") {
    evt.stopPropagation(); // <<< ini kunci
    if (!el.getAttribute("data-embed")) {
      el.setAttribute("data-embed", "image");
      el.style.maxWidth = "100%";
      el.style.cursor = "pointer";
    }
    selectEmbeddable(el);
    return;
  }

  if (el?.tagName === "VIDEO") {
    evt.stopPropagation();
    if (!el.getAttribute("data-embed")) {
      el.setAttribute("data-embed", "video");
      el.style.maxWidth = "100%";
      el.style.cursor = "pointer";
    }
    selectEmbeddable(el);
    return;
  }

  if (el?.tagName === "IFRAME") {
    evt.stopPropagation();
    if (!el.getAttribute("data-embed")) {
      el.setAttribute("data-embed", "pdf");
      el.style.maxWidth = "100%";
      el.style.cursor = "pointer";
    }
    selectEmbeddable(el);
    return;
  }

  unselectEmbeddable();
}

function selectEmbeddable(el) {
  unselectEmbeddable();
  if (!el.parentNode) return;

  // ✅ ukur size SEBELUM dibungkus
  const preRect = el.getBoundingClientRect();
  const preWidth = preRect.width || el.offsetWidth || el.naturalWidth || 300;
  const preHeight =
    preRect.height || el.offsetHeight || el.naturalHeight || null;

  // bikin wrapper
  const wrapper = document.createElement("span");
  wrapper.className = "embed-resize-wrapper";
  wrapper.contentEditable = "false";
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.lineHeight = "0";

  // matiin drag bawaan browser
  el.setAttribute("draggable", "false");

  el.style.display = "block";
  el.style.maxWidth = "100%";

  // ✅ set width/height pakai ukuran sebelum wrap
  el.style.width = preWidth + "px";
  if (preHeight && el.tagName !== "IFRAME") {
    el.style.height = "auto"; // jaga ratio utk image/video
  } else if (el.tagName === "IFRAME" && preHeight) {
    el.style.height = preHeight + "px";
  }

  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);

  ["tl", "tr", "bl", "br"].forEach((pos) => {
    const h = document.createElement("span");
    h.className = `resize-handle ${pos}`;
    wrapper.appendChild(h);
  });

  activeWrapper = wrapper;
  enableResize(wrapper, el);
}

function unselectEmbeddable() {
  if (!activeWrapper) return;
  const el = activeWrapper.querySelector("img,video,iframe");
  if (el) activeWrapper.parentNode.insertBefore(el, activeWrapper);
  activeWrapper.remove();
  activeWrapper = null;
}

function enableResize(wrapper, el) {
  const isIframe = el.tagName === "IFRAME";

  // ✅ prevent drag bawaan browser
  el.addEventListener("dragstart", (e) => e.preventDefault());

  interact(wrapper).resizable({
    // ✅ hanya resize kalau drag di handle
    allowFrom: ".resize-handle",

    edges: { left: true, right: true, bottom: true, top: true },
    listeners: {
      move(event) {
        const { width, height } = event.rect;
        el.style.width = width + "px";

        if (isIframe) {
          el.style.height = height + "px";
        } else {
          el.style.height = "auto"; // image/video jaga ratio
        }
      },
    },
    modifiers: [
      interact.modifiers.restrictSize({
        min: { width: 80, height: 80 },
        max: { width: 1200, height: 1200 },
      }),
      ...(isIframe
        ? []
        : [interact.modifiers.aspectRatio({ ratio: "preserve" })]),
    ],
    inertia: true,
  });

  // ✅ handle jangan bikin caret pindah / drag text
  wrapper.querySelectorAll(".resize-handle").forEach((h) => {
    h.addEventListener("mousedown", (e) => e.preventDefault());
  });
}

// helpers
function getEditor() {
  return Array.isArray(editorRef.value) ? editorRef.value[0] : editorRef.value;
}

function guessMime(name = "") {
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "pdf") return "application/pdf";
  return "application/octet-stream";
}

// attachment helpers
function removeAttachment(i) {
  attachments.value.splice(i, 1);
}

function prettySize(bytes = 0) {
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " KB";
  return (kb / 1024).toFixed(1) + " MB";
}

function getFileIcon(att) {
  const m = att.mime || "";
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("video/")) return "movie";
  if (m === "application/pdf") return "picture_as_pdf";
  if (m.includes("sheet") || m.includes("excel")) return "table_chart";
  if (m.includes("word")) return "description";
  return "attach_file";
}

const openEmojiPicker = (evt) => {
  if (!picker) return;
  const anchor = evt?.target?.closest("button") || evt?.target;
  if (anchor) picker.togglePicker(anchor);
};

const insertEmoji = (emojiChar) => {
  // handle kalau ref array (v-for)
  const ed = Array.isArray(editorRef.value)
    ? editorRef.value[0]
    : editorRef.value;

  if (!ed) return;

  ed.focus();
  ed.runCmd("insertText", emojiChar);
};

const onSubmitComment = () => {
  console.log("Submit comment:", comment.value);
  $q.dialog({
    title: "Submit Comment",
    message: "Are you sure you want to submit this comment?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit("submit", {
      comment: comment.value,
      attachments: attachments.value,
    });

    comment.value = "";
    attachments.value = [];
  });
};

const onCancelComment = () => {
  emit("onCancel"); // kirim null untuk cancel
  comment.value = "";
  attachments.value = [];
};
</script>

<style>
.hidden {
  display: none;
}

/* wrapper outline */
.embed-resize-wrapper {
  outline: 2px solid #1976d2;
}
/* handle common */
.embed-resize-wrapper .resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #1976d2;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 10;
}
/* corners */
.embed-resize-wrapper .tl {
  top: -6px;
  left: -6px;
  cursor: nwse-resize;
}
.embed-resize-wrapper .tr {
  top: -6px;
  right: -6px;
  cursor: nesw-resize;
}
.embed-resize-wrapper .bl {
  bottom: -6px;
  left: -6px;
  cursor: nesw-resize;
}
.embed-resize-wrapper .br {
  bottom: -6px;
  right: -6px;
  cursor: nwse-resize;
}

.table-picker {
  display: inline-block;
  padding: 4px;
  border: 1px solid #ddd;
}

.picker-row {
  display: flex;
}

.picker-cell {
  width: 20px;
  height: 20px;
  border: 1px solid #eee;
  margin: 1px;
  background: #fafafa;
  cursor: pointer;
}

.picker-cell.active {
  background: #7ab3ff;
  border-color: #3778ff;
}

.table-tools-float .q-btn-group {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  background: white;
  border-radius: 999px;
}
</style>
