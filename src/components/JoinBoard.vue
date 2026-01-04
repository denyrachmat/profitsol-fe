<template>
  <q-card class="fit column">
    <!-- TOP BAR -->
    <div class="row items-center q-pa-sm bg-grey-3">
      <div class="text-subtitle2">Diagram Editor</div>
      <q-space />

      <q-btn dense flat label="Cancel" @click="$emit('cancel')" />
      <q-btn dense color="primary" label="Insert" @click="exportPng" />
    </div>

    <!-- MAIN AREA -->
    <div class="editor-area row no-wrap">
      <!-- TOOLBAR LEFT -->
      <div class="toolbar column q-pa-sm bg-grey-2">
        <div class="text-subtitle2 q-mb-sm">Shapes</div>

        <q-btn
          v-for="b in shapeButtons"
          :key="b.label"
          dense
          size="sm"
          class="q-mb-sm full-width"
          :label="b.label"
          @click="onToolbarClick(b.type)"
        />

        <q-separator class="q-my-sm" />

        <div class="text-caption q-mb-xs">Line style</div>
        <q-btn-toggle
          v-model="lineStyle"
          :options="lineStyleOptions"
          dense
          unelevated
          rounded
          spread
          toggle-color="primary"
          @update:model-value="onLineStyleChange"
        />

        <q-separator class="q-my-sm" />

        <div class="text-caption q-mb-xs">Arrow</div>
        <q-btn-toggle
          v-model="arrowStyle"
          :options="arrowStyleOptions"
          dense
          unelevated
          rounded
          spread
          toggle-color="primary"
          @update:model-value="onArrowStyleChange"
        />

        <q-separator class="q-my-sm" />

        <q-btn
          dense
          size="sm"
          color="negative"
          class="full-width"
          label="Delete"
          @click="onDeleteClick"
        />
      </div>

      <!-- DIAGRAM CANVAS -->
      <div class="paper-container">
        <div ref="paperContainer" class="paper"></div>
        <div ref="marquee" class="marquee"></div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as joint from "jointjs";

const emit = defineEmits(["cancel", "insert"]);

const paperContainer = ref(null);
const marquee = ref(null);

let graph;
let paper;
let activeToolsView = null;
let selectedCells = [];
let selectedCell = null;
// let ResizeTool = null;

let undoStack = [];
let redoStack = [];
let isRestoring = false;

let isSelecting = false;
let selectStart = { x: 0, y: 0 };

/* ===========================
   UI STATE (TOGGLES)
=========================== */
const lineStyle = ref("straight");
const arrowStyle = ref("end");

const lineStyleOptions = [
  { label: "Straight", value: "straight" },
  { label: "Ortho", value: "ortho" },
  { label: "Curve", value: "curve" },
];

const arrowStyleOptions = [
  { label: "None", value: "none" },
  { label: "←", value: "start" },
  { label: "→", value: "end" },
  { label: "↔", value: "both" },
];

const triangle = {
  type: "path",
  d: "M 10 -5 0 0 10 5 z",
  fill: "#34495e",
  stroke: "#34495e",
};

const emptyMarker = {
  type: "path",
  d: "M 0 0", // path kosong
  fill: "none",
  stroke: "none",
};

const noneMarker = { type: "none" };

/* ===========================
   SHAPE BUTTONS
=========================== */
const shapeButtons = [
  { label: "Start / End", type: "terminator" },
  { label: "Process", type: "process" },
  { label: "Decision", type: "decision" },
  { label: "Input/Output", type: "io" },
  { label: "Note", type: "note" },
  { label: "Circle", type: "circle" },
];

onMounted(() => {
  const namespace = joint.shapes;

  graph = new joint.dia.Graph({}, { cellNamespace: namespace });

  paper = new joint.dia.Paper({
    el: paperContainer.value,
    model: graph,
    width: paperContainer.value.clientWidth || 800,
    height: paperContainer.value.clientHeight || 600,
    gridSize: 10,
    drawGrid: true,
    cellViewNamespace: namespace,

    interactive: (cellView) => {
      if (cellView.model.isLink()) return { linkMove: true, vertexAdd: false };
      return true;
    },

    defaultLink: () => {
      return new joint.dia.Link({
        attrs: {
          line: {
            stroke: "#34495e",
            strokeWidth: 2,
            fill: "none",

            // penting: jangan set targetMarker di sini
            // biar marker diatur 100% dari applyArrowStyle
            // sourceMarker: { type: "none" },
            // targetMarker: { type: "none" },
          },
        },
      });
    },
    linkTools: () => new joint.dia.ToolsView({ tools: [] }),

    snapLinks: { radius: 50 },
    linkPinning: false,
    validateMagnet: (cellView, magnet) => {
      // hanya port yang boleh mulai link
      return magnet && magnet.getAttribute("magnet") === "true";
    },

    validateConnection: (srcView, srcMagnet, tgtView, tgtMagnet) => {
      // allow only port-to-port connection
      const srcOk = srcMagnet && srcMagnet.getAttribute("magnet") === "true";
      const tgtOk = tgtMagnet && tgtMagnet.getAttribute("magnet") === "true";
      return srcOk && tgtOk;
    },
    interactive: (cellView) => {
      // elements draggable, links movable
      if (cellView.model.isLink()) return { linkMove: true };
      return true;
    },
    defaultConnectionPoint: { name: "anchor" },
  });

  /* ===========================
       MARQUEE SELECTION
  ============================ */
  paper.on("element:pointerdown", (elementView, evt) => {
    if (evt.target.closest(".joint-tools")) {
      evt.stopPropagation();
    }
  });

  paper.on("blank:pointerdown", (evt, x, y) => {
    clearTools();

    isSelecting = true;
    selectStart = { x, y };

    Object.assign(marquee.value.style, {
      left: x + "px",
      top: y + "px",
      width: "0px",
      height: "0px",
      display: "block",
    });

    selectedCells = [];
    selectedCell = null;
    highlightCells([]);
  });

  paper.on("blank:pointermove", (evt, x, y) => {
    if (!isSelecting) return;

    const rect = {
      left: Math.min(x, selectStart.x),
      top: Math.min(y, selectStart.y),
      width: Math.abs(x - selectStart.x),
      height: Math.abs(y - selectStart.y),
    };

    Object.assign(marquee.value.style, {
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
    });

    const elements = graph.getElements().filter((cell) => {
      const bbox = paper.findViewByModel(cell).getBBox();
      return (
        bbox.x >= rect.left &&
        bbox.y >= rect.top &&
        bbox.x + bbox.width <= rect.left + rect.width &&
        bbox.y + bbox.height <= rect.top + rect.height
      );
    });

    const links = graph.getLinks().filter((link) => {
      const bbox = paper.findViewByModel(link).getBBox();
      return (
        bbox.x >= rect.left &&
        bbox.y >= rect.top &&
        bbox.x + bbox.width <= rect.left + rect.width &&
        bbox.y + bbox.height <= rect.top + rect.height
      );
    });

    selectedCells = [...elements, ...links];
    highlightCells(selectedCells);
  });

  paper.on("blank:pointerup", () => {
    isSelecting = false;
    marquee.value.style.display = "none";
  });

  /* ===========================
         CLICK / DBLCLICK
  ============================ */
  paper.on("cell:pointerdown", (cellView) => {
    const cell = cellView.model;
    selectedCell = cell;
    selectedCells = [cell];
    highlightCells(selectedCells);

    if (cell.isElement()) showResizeTools(cellView);
    else clearTools();
  });

  paper.on("cell:pointerdblclick", (cellView) => {
    const cell = cellView.model;

    // rename link
    if (cell.isLink()) {
      const current = cell.attr("label/text") || "";
      const updated = prompt("Edit link label:", current);

      if (updated !== null) {
        cell.attr({
          label: {
            text: updated,
            fill: "#000",
            fontSize: 12,
          },
        });
      }
      return;
    }

    // rename shape
    const currentText = cell.attr("label/text") || "";
    const updatedText = prompt("Edit text:", currentText);

    if (updatedText !== null) {
      cell.attr("label/text", updatedText);
    }
  });

  paper.on("link:connect", (lv) => {
    const path = lv.el.querySelector("path.connection");
    console.log(
      "marker-source nodes:",
      lv.el.querySelectorAll(".marker-source").length
    );
    console.log(
      "marker-target nodes:",
      lv.el.querySelectorAll(".marker-target").length
    );
  });
  /* ===========================
        UNDO / REDO STACK
  ============================ */
  graph.on("add remove change", () => {
    if (isRestoring) return;
    const json = JSON.stringify(graph.toJSON());
    undoStack.push(json);
    redoStack = [];
  });

  graph.on("add", (cell) => {
    if (isRestoring) return;
    if (cell.isLink()) {
      applyLinkStyleToNew(cell);
      // applyLinkStyleToCell(cell, lineStyle.value);
      // applyArrowStyleToCell(cell, arrowStyle.value);
    }
  });

  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});

// Custom resize control (JointJS 3.7 OSS)
const ResizeTool = joint.elementTools.Control.extend({
  name: "resize-tool",

  options: {
    ...joint.elementTools.Control.prototype.options,
    action: "resize",
  },

  // simpan rasio saat mulai drag
  onPointerDown(evt) {
    const view = this.paper.findViewByModel(this.model); // model = element
    if (view) {
      const { width, height } = view.model.size();
      this._ratio = width / Math.max(1, height);
    }
    // stop event chain (yang kamu sudah pakai)
    evt.preventDefault?.();
    evt.stopPropagation?.();
    evt.stopImmediatePropagation?.();
    const oe = evt.originalEvent;
    oe?.preventDefault?.();
    oe?.stopPropagation?.();
    oe?.stopImmediatePropagation?.();

    return joint.elementTools.Control.prototype.onPointerDown.call(this, evt);
  },

  getPosition(view) {
    const { width, height } = view.model.size();
    return { x: width, y: height };
  },

  setPosition(view, coordinates) {
    const minW = 40;
    const minH = 30;

    const ratio =
      this._ratio ||
      view.model.size().width / Math.max(1, view.model.size().height);

    // kandidat lebar/tinggi dari drag
    let w = Math.max(minW, Math.round(coordinates.x));
    let h = Math.max(minH, Math.round(coordinates.y));

    // lock aspect: pilih perubahan dominan
    const hFromW = Math.round(w / ratio);
    const wFromH = Math.round(h * ratio);

    if (Math.abs(hFromW - h) < Math.abs(wFromH - w)) {
      h = Math.max(minH, hFromW);
    } else {
      w = Math.max(minW, wFromH);
    }

    view.model.resize(w, h, { ui: true });
  },

  onPointerUp(evt) {
    this._ratio = null;
    evt.preventDefault?.();
    evt.stopPropagation?.();
    evt.stopImmediatePropagation?.();
    const oe = evt.originalEvent;
    oe?.preventDefault?.();
    oe?.stopPropagation?.();
    oe?.stopImmediatePropagation?.();

    return joint.elementTools.Control.prototype.onPointerUp.call(this, evt);
  },
});

function showResizeTools(cellView) {
  clearTools();
  if (!cellView?.model?.isElement?.()) return;

  const tools = new joint.dia.ToolsView({
    tools: [
      new joint.elementTools.Boundary({ padding: 8 }),
      new ResizeTool({
        selector: "body",
        handleAttributes: {
          class: "resize-handle",
          fill: "#1976d2",
          stroke: "#fff",
          "stroke-width": 2,
          cursor: "nwse-resize",
        },
      }),
      new joint.elementTools.Remove({
        x: "100%",
        y: 0,
        offset: { x: -10, y: 10 },
      }),
    ],
  });

  cellView.addTools(tools);
  activeToolsView = tools;
}

function clearTools() {
  if (activeToolsView) {
    activeToolsView.remove();
    activeToolsView = null;
  }
}

function applyLinkStyleToNew(link) {
  // apply line style + arrow style sesuai toggle sekarang

  // selectedCells = [link];
  // applyLinkStyle(lineStyle.value);
  // applyArrowStyle(arrowStyle.value);
  // selectedCells = [];

  applyLinkStyleToCell(link, lineStyle.value);
  applyArrowStyleToCell(link, arrowStyle.value);
}

function normalizeLink(cell) {
  // cell.attr({
  //   "line/fill": "none",
  //   "line/strokeLinejoin": "round",
  //   "line/strokeLinecap": "round",
  // });
  cell.attr({
    line: {
      fill: "none",
      strokeLinejoin: "round",
      strokeLinecap: "round",
    },
  });
}

function applyLinkStyleToCell(link, style) {
  normalizeLink(link);

  if (style === "straight") {
    link.set({ router: { name: "normal" }, connector: { name: "normal" } });
  } else if (style === "ortho") {
    link.set({ router: { name: "orthogonal" }, connector: { name: "normal" } });
  } else if (style === "curve") {
    link.set({ router: { name: "normal" }, connector: { name: "smooth" } });
  }
}

const ARROW_D = "M 10 -5 0 0 10 5 Z";
const EMPTY_D = "M 0 0";

function applyArrowStyleToCell(link, kind) {
  if (!link?.isLink?.()) return;

  const wantSource = kind === "start" || kind === "both";
  const wantTarget = kind === "end" || kind === "both";

  // Simpan per-link biar export bisa re-apply akurat
  link.set("arrowKind", kind);

  link.attr({
    ".marker-source": {
      d: wantSource ? ARROW_D : EMPTY_D,
      fill: wantSource ? "#34495e" : "none",
      stroke: wantSource ? "#34495e" : "none",
      "stroke-width": wantSource ? 1 : 0,
    },
    ".marker-target": {
      d: wantTarget ? ARROW_D : EMPTY_D,
      fill: wantTarget ? "#34495e" : "none",
      stroke: wantTarget ? "#34495e" : "none",
      "stroke-width": wantTarget ? 1 : 0,
    },
    line: { ...(link.attr("line") || {}), fill: "none" },
  });

  paper?.findViewByModel?.(link)?.update?.();
}

/* ===========================
     HIGHLIGHT SELECTION
=========================== */
function highlightCells(cells) {
  [...graph.getElements(), ...graph.getLinks()].forEach((cell) => {
    const view = paper.findViewByModel(cell);
    if (view?.el) view.el.classList.remove("highlighted");
  });

  cells.forEach((cell) => {
    const view = paper.findViewByModel(cell);
    if (view?.el) view.el.classList.add("highlighted");
  });
}

/* ===========================
       KEYBOARD HANDLER
=========================== */
function handleKeydown(e) {
  if (e.key === "Delete" || e.key === "Backspace") {
    if (selectedCells.length) {
      graph.removeCells(selectedCells);
      selectedCells = [];
      selectedCell = null;
      highlightCells([]);
    }
  }

  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    undo();
  }

  if (e.ctrlKey && e.key === "y") {
    e.preventDefault();
    redo();
  }
}

/* ===========================
       TOOLBAR HANDLERS
=========================== */
function onToolbarClick(type) {
  addShape(type);
}

function onDeleteClick() {
  if (selectedCells.length) {
    graph.removeCells(selectedCells);
    selectedCells = [];
    selectedCell = null;
    highlightCells([]);
  }
}

function onLineStyleChange(val) {
  applyLinkStyle(val);
}

function onArrowStyleChange(val) {
  applyArrowStyle(val);
}

/* ===========================
          ADD SHAPES
=========================== */
function addDefaultPorts(el) {
  el.prop("ports", {
    groups: {
      top: {
        position: "top",
        attrs: {
          circle: {
            r: 5,
            magnet: true, // ✅ penting
            fill: "#1976d2",
            stroke: "#fff",
            "stroke-width": 2,
          },
        },
      },
      right: {
        position: "right",
        attrs: {
          circle: {
            r: 5,
            magnet: true,
            fill: "#1976d2",
            stroke: "#fff",
            "stroke-width": 2,
          },
        },
      },
      bottom: {
        position: "bottom",
        attrs: {
          circle: {
            r: 5,
            magnet: true,
            fill: "#1976d2",
            stroke: "#fff",
            "stroke-width": 2,
          },
        },
      },
      left: {
        position: "left",
        attrs: {
          circle: {
            r: 5,
            magnet: true,
            fill: "#1976d2",
            stroke: "#fff",
            "stroke-width": 2,
          },
        },
      },
    },
    items: [
      { id: "p_top", group: "top" },
      { id: "p_right", group: "right" },
      { id: "p_bottom", group: "bottom" },
      { id: "p_left", group: "left" },
    ],
  });
}

function addShape(type) {
  let el;

  switch (type) {
    case "terminator":
      el = new joint.shapes.standard.Rectangle();
      el.resize(130, 45);
      el.attr({
        body: { rx: 22, ry: 22, fill: "#fff", magnet: false },
        label: { text: "Start / End" },
      });
      break;

    case "process":
      el = new joint.shapes.standard.Rectangle();
      el.resize(140, 50);
      el.attr({
        body: { fill: "#fff", magnet: false },
        label: { text: "Process" },
      });
      break;

    case "decision":
      el = new joint.shapes.standard.Polygon();
      el.resize(120, 80);
      el.attr({
        body: {
          refPoints: "0,30 60,0 120,30 60,60",
          fill: "#fff",
          magnet: false,
        },
        label: { text: "Decision" },
      });
      break;

    case "io":
      el = new joint.shapes.standard.Polygon();
      el.resize(140, 60);
      el.attr({
        body: {
          refPoints: "20,0 140,0 120,60 0,60",
          fill: "#fff",
          magnet: false,
        },
        label: { text: "Input / Output" },
      });
      break;

    case "note":
      el = new joint.shapes.standard.Rectangle();
      el.resize(120, 80);
      el.attr({
        body: {
          fill: "#fffa8b",
          stroke: "#c8b800",
          magnet: false,
        },
        label: { text: "Note" },
      });
      break;

    case "circle":
      el = new joint.shapes.standard.Circle();
      el.resize(80, 80);
      el.attr({
        body: { magnet: false },
        label: { text: "Circle" },
      });
      break;

    default:
      return;
  }

  el.position(80, 80);
  addDefaultPorts(el);
  el.addTo(graph);
}

/* ===========================
       LINK STYLE / ARROW
=========================== */
function applyLinkStyle(style) {
  if (!selectedCells.length) return;

  selectedCells.forEach((c) => {
    if (!c?.isLink?.()) return;

    // pastikan line attrs aman (no fill)
    setLineAttrs(c, {});

    if (style === "straight") {
      c.set({ router: { name: "normal" }, connector: { name: "normal" } });
    } else if (style === "ortho") {
      c.set({ router: { name: "orthogonal" }, connector: { name: "normal" } });
    } else if (style === "curve") {
      c.set({ router: { name: "normal" }, connector: { name: "smooth" } });
    }
  });
}

function applyArrowStyle(kind) {
  if (!selectedCells.length) return;
  selectedCells.forEach((c) => c?.isLink?.() && applyArrowStyleToCell(c, kind));
}

function setLineAttrs(link, patch) {
  if (!link?.isLink?.()) return;

  const current = link.attr("line") || {};
  link.attr("line", {
    ...current,
    ...patch,
    fill: "none", // paksa selalu
  });
}

/* ===========================
          UNDO / REDO
=========================== */
function undo() {
  if (undoStack.length < 2) return;

  redoStack.push(undoStack.pop());
  const prev = undoStack[undoStack.length - 1];

  isRestoring = true;
  graph.fromJSON(JSON.parse(prev));
  isRestoring = false;
}

function redo() {
  if (!redoStack.length) return;

  const json = redoStack.pop();
  undoStack.push(json);

  isRestoring = true;
  graph.fromJSON(JSON.parse(json));
  isRestoring = false;
}

/* ===========================
          EXPORT PNG
=========================== */
function cleanupSvgForExport(svgRoot) {
  // hapus semua UI overlay yang mungkin masih nyempil
  svgRoot
    .querySelectorAll(
      ".link-tools, .joint-tools, .marker-vertices, .marker-vertex," +
        " .selection, .selection-box, .selection-wrapper, .halo, .handle," +
        " .joint-halo, .joint-selection"
    )
    .forEach((n) => n.remove());

  // handle biru kadang tidak punya class konsisten, tapi ada style/warna khas
  // hapus circle kecil yang biasanya dipakai sebagai handle (r kecil & fill biru)
  svgRoot.querySelectorAll("circle").forEach((c) => {
    const r = parseFloat(c.getAttribute("r") || "0");
    const fill = (c.getAttribute("fill") || "").toLowerCase();
    if (
      r > 0 &&
      r <= 6 &&
      (fill.includes("#1976d2") || fill.includes("blue"))
    ) {
      c.remove();
    }
  });

  // buang class highlighted biar gak ada stroke/warna selection kebawa
  svgRoot
    .querySelectorAll("g.highlighted")
    .forEach((g) => g.classList.remove("highlighted"));
}

function enforceArrowInSvgClone(svgRoot) {
  // ambil link model -> tentukan arrow kind per link
  graph.getLinks().forEach((link) => {
    const kind = link.get("arrowKind") || arrowStyle.value;

    const view = paper.findViewByModel(link);
    if (!view?.el) return;

    // cari elemen link yg sama di CLONE dengan data-model-id
    const id = link.id;
    const linkEl = svgRoot.querySelector(
      `[model-id="${id}"], g[data-model-id="${id}"], g[model-id="${id}"]`
    );
    if (!linkEl) return;

    const ms = linkEl.querySelector(".marker-source");
    const mt = linkEl.querySelector(".marker-target");

    const wantSource = kind === "start" || kind === "both";
    const wantTarget = kind === "end" || kind === "both";

    // paksa matiin sisi yang off
    if (ms && !wantSource) ms.setAttribute("d", "M 0 0");
    if (ms && !wantSource) {
      ms.setAttribute("fill", "none");
      ms.setAttribute("stroke", "none");
    }

    if (mt && !wantTarget) mt.setAttribute("d", "M 0 0");
    if (mt && !wantTarget) {
      mt.setAttribute("fill", "none");
      mt.setAttribute("stroke", "none");
    }
  });
}

function enforceMarkersInClone(svgRoot) {
  graph.getLinks().forEach((link) => {
    const kind = link.get("arrowKind") || arrowStyle.value; // "start"|"end"|"both"|"none"

    const id = link.id;
    const g = svgRoot.querySelector(`g[model-id="${id}"]`);
    if (!g) return;

    const wantSource = kind === "start" || kind === "both";
    const wantTarget = kind === "end" || kind === "both";

    // marker-source
    g.querySelectorAll(".marker-source").forEach((p) => {
      if (!wantSource) p.remove(); // hapus total
      else {
        p.setAttribute("fill", "#34495e");
        p.setAttribute("stroke", "#34495e");
      }
    });

    // marker-target
    g.querySelectorAll(".marker-target").forEach((p) => {
      if (!wantTarget) p.remove(); // hapus total
      else {
        p.setAttribute("fill", "#34495e");
        p.setAttribute("stroke", "#34495e");
      }
    });

    // BUANG marker tambahan kalau ada (kadang muncul di export)
    g.querySelectorAll(
      ".marker-arrowhead, .marker-vertices, .marker-vertex"
    ).forEach((n) => n.remove());
  });
}

async function exportPng() {
  if (!paper || !graph) return;

  graph.getLinks().forEach((l) => {
    const k = l.get("arrowKind") || arrowStyle.value; // fallback global
    applyArrowStyleToCell(l, k);
  });

  // clear selection state di app kamu
  highlightCells([]);
  selectedCells = [];
  selectedCell = null;

  const wrapper = paperContainer.value?.closest(".paper-container");
  wrapper?.classList.add("exporting");

  // kasih 1 tick supaya DOM sempat apply display:none
  await new Promise((r) => requestAnimationFrame(r));

  const bbox = graph.getBBox(graph.getCells());
  const PADDING = 40;
  const x = Math.floor(bbox.x - PADDING);
  const y = Math.floor(bbox.y - PADDING);
  const w = Math.ceil(bbox.width + PADDING * 2);
  const h = Math.ceil(bbox.height + PADDING * 2);

  const svgEl = paper.el.querySelector("svg");
  if (!svgEl) throw new Error("SVG element not found on paper");

  const clone = svgEl.cloneNode(true);
  console.log(clone.querySelector("g.joint-link")?.outerHTML.slice(0, 300));

  cleanupSvgForExport(clone);
  enforceMarkersInClone(clone);

  // enforceArrowInSvgClone(clone);

  clone.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
  clone.setAttribute("width", `${w}`);
  clone.setAttribute("height", `${h}`);

  // background putih
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x", `${x}`);
  bg.setAttribute("y", `${y}`);
  bg.setAttribute("width", `${w}`);
  bg.setAttribute("height", `${h}`);
  bg.setAttribute("fill", "#ffffff");
  clone.insertBefore(bg, clone.firstChild);

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  const pngDataUrl = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = svgUrl;
  });

  wrapper?.classList.remove("exporting");

  emit("insert", { url: pngDataUrl });
}
</script>

<style>
/* =========================
   LAYOUT
========================= */
.editor-area {
  flex: 1;
  overflow: hidden;
}

.toolbar {
  width: 20%;
  border-right: 1px solid #ddd;
}

.paper-container {
  position: relative;
  flex: 1;
  background: #f4f4f4;
}

.paper {
  width: 100%;
  height: 100%;
}

/* marquee */
.marquee {
  position: absolute;
  border: 1px dashed #4a90e2;
  background: rgba(74, 144, 226, 0.1);
  pointer-events: none;
  display: none;
}

/* =========================
   HIGHLIGHT (SELECTION)
   Jangan target semua "path" supaya icon tool (gear/X) tidak ikut hilang.
========================= */
g.highlighted rect,
g.highlighted circle,
g.highlighted polygon {
  stroke: #1976d2 !important;
  stroke-width: 3px !important;
}

g.highlighted text {
  fill: #1976d2 !important;
  font-weight: bold;
}

/* highlight khusus untuk garis link */
g.highlighted .connection,
g.highlighted path.connection {
  stroke: #1976d2 !important;
  stroke-width: 3px !important;
  fill: none !important;
}

/* =========================
   LINK PATH
========================= */
.joint-link .connection,
.joint-link path.connection {
  fill: none !important;
}

/* area klik link (biar gampang klik) */
.joint-link .connection-wrap {
  fill: none !important;
  pointer-events: stroke;
  stroke: transparent !important;
  stroke-width: 14px;
}

/* =========================
   TOOLS (floating gear & X)
========================= */
/* container tools jangan ganggu drag */
.joint-tools {
  pointer-events: none;
}

/* tapi tombol tertentu boleh diklik */
.joint-tools .tool-remove,
.joint-tools .tool-options,
.joint-tools .tool-vertices,
.joint-tools .tool-segments {
  pointer-events: auto;
}

/* jointjs kadang bungkus link-tools sendiri */
.joint-link .link-tools {
  pointer-events: none;
}
.joint-link .tool-options,
.joint-link .tool-remove {
  pointer-events: auto;
}

/* hilangkan background/rect overlay tool (biar gak ada fill hitam) */
.joint-tools rect,
.joint-link .link-tools rect {
  fill: none !important;
  stroke: none !important;
}

/* pastikan icon gear / X tetap kelihatan (biasanya path/circle) */
.joint-link .tool-remove path,
.joint-link .tool-remove circle,
.joint-link .tool-options path,
.joint-link .tool-options circle {
  fill: #444 !important;
  stroke: #444 !important;
}

/* =========================
   MARKERS / VERTICES
   - Matikan marker bawaan yang bikin fill item aneh
   - Tapi jangan bunuh arrow kamu (marker-source/target)
========================= */

/* arrow kamu (kalau pakai .marker-source/.marker-target) */
.joint-link .marker-source,
.joint-link .marker-target {
  fill: #34495e !important;
  stroke: #34495e !important;
}

/* marker/vertices bawaan (sering bikin fill item nempel) */
.joint-link .marker-vertices,
.joint-link .marker-vertex,
.joint-link .marker-arrowhead {
  fill: none !important;
  stroke: none !important;
}

/* ===== Fix tool button background (gear & X) ===== */

/* Background tombol (circle) */
.joint-link .tool-options circle,
.joint-link .tool-remove circle,
.joint-tools .tool-options circle,
.joint-tools .tool-remove circle {
  fill: #ffffff !important;
  stroke: #444 !important;
  stroke-width: 1.5px !important;
}

/* Ikon di dalamnya (path) */
.joint-link .tool-options path,
.joint-link .tool-remove path,
.joint-tools .tool-options path,
.joint-tools .tool-remove path {
  fill: #444 !important;
  stroke: #444 !important;
}

/* Kalau masih ada “lapisan” hitam lain, biasanya ini */
.joint-link .link-tools .tool-options,
.joint-link .link-tools .tool-remove {
  filter: none !important;
}

.paper-container.exporting .link-tools,
.paper-container.exporting .joint-tools,
.paper-container.exporting .marker-vertices,
.paper-container.exporting .marker-vertex,
.paper-container.exporting .selection,
.paper-container.exporting .selection-box,
.paper-container.exporting .selection-wrapper,
.paper-container.exporting .halo,
.paper-container.exporting .handle,
.paper-container.exporting .joint-halo,
.paper-container.exporting .joint-selection {
  display: none !important;
}

/* container tools boleh klik kalau untuk element tools */
.joint-element .joint-tools,
.joint-element .joint-tools * {
  pointer-events: auto;
}

.resize-handle {
  pointer-events: auto;
}

/* .joint-link .joint-tools {
  pointer-events: none;
} */
</style>
