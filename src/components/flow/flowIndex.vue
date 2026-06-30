<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { VueFlow, MarkerType, Panel, useVueFlow, Handle } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import { Background } from "@vue-flow/background";

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/minimap/dist/style.css";
import "@vue-flow/controls/dist/style.css";

import SpecialNode from "./SpecialNode.vue";
import SpecialEdge from "./SpecialEdge.vue";

const props = defineProps({
  listNodes: {
    type: Array,
    default: () => [],
  },
  isEditable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:listNodes",
  "delete-node",
  "node-action",
  "add-node",
  "reset-flow",
  "node-click",
]);

onMounted(() => {
  // Initial setup if needed
  console.log("FlowIndex mounted with nodes:", props.listNodes);
  if (props.listNodes.length > 0) {
    // Normalize incoming nodes if necessary
    const normalizedNodes = props.listNodes.map((node, index) => ({
      id: node.id ?? `${index + 1}`,
      type: node.type ?? "special",
      position: node.position ?? {
        x: 100 + index * 180,
        y: 120 + (index % 2) * 80,
      },
      data: {
        label: node?.data?.label ?? node.label ?? `Node ${index + 1}`,
        children: node?.data?.children || node.prcd_children || [],
        ...node.data,
      },
      ...node,
    }));

    emit("update:listNodes", normalizedNodes);
  }
});

const defaultNodes = [
  {
    id: "1",
    type: "special",
    position: { x: 100, y: 100 },
    data: { label: "Start Node" },
  },
  {
    id: "2",
    type: "special",
    position: { x: 420, y: 220 },
    data: { label: "End Node" },
  },
];

const nodes = ref([]);
const edges = ref([
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "special",
    animated: true,
    markerEnd: MarkerType.ArrowClosed,
  },
]);

const { addEdges, fitView } = useVueFlow();

const normalizedIncomingNodes = computed(() => {
  if (props.listNodes?.length) {
    return props.listNodes.map((node, index) => ({
      id: node.id ?? `${index + 1}`,
      type: node.type ?? "special",
      position: node.position ?? {
        x: 100 + index * 180,
        y: 120 + (index % 2) * 80,
      },
      data: {
        label: node?.data?.label ?? node.label ?? `Node ${index + 1}`,
        children: node?.data?.children || node.prcd_children || [],
        ...node.data,
      },
      ...node,
    }));
  }

  return [];
});

// watch(
//   normalizedIncomingNodes,
//   (val) => {
//     nodes.value = JSON.parse(JSON.stringify(val));
//   },
//   { immediate: true, deep: true }
// );

watch(
  () => props.listNodes,
  (newVal) => {
    // Jalankan kloning hanya jika data lokal masih kosong ATAU jumlah elemennya berubah dari luar
    if (
      newVal &&
      (!nodes.value.length || newVal.length !== nodes.value.length)
    ) {
      nodes.value = JSON.parse(JSON.stringify(normalizedIncomingNodes.value));
    }
  },
  { immediate: true } // Matikan deep: true agar perubahan posisi X/Y tidak memicu reset data
);

watch(
  nodes,
  (val) => {
    // emit("update:listNodes", JSON.parse(JSON.stringify(val)));
    emit("update:listNodes", val);
  },
  { deep: true }
);

const getNextNodeId = () => {
  const ids = nodes.value
    .map((n) => Number(n.id))
    .filter((n) => !Number.isNaN(n));

  return ids.length
    ? String(Math.max(...ids) + 1)
    : String(nodes.value.length + 1);
};

const onConnect = (params) => {
  addEdges([
    {
      ...params,
      id: `e${params.source}-${params.target}-${Date.now()}`,
      type: "special",
      animated: true,
      markerEnd: MarkerType.ArrowClosed,
    },
  ]);
};

const addNode = () => {
  if (!props.isEditable) return;

  const id = getNextNodeId();

  const newNode = {
    id,
    type: "special",
    position: {
      x: 100 + Math.random() * 500,
      y: 100 + Math.random() * 300,
    },
    data: {
      label: `Node ${id}`,
    },
  };

  nodes.value.push(newNode);
  emit("add-node", newNode);
};

const deleteNode = (nodeId) => {
  if (!props.isEditable) return;

  nodes.value = nodes.value.filter((node) => node.id !== nodeId);
  edges.value = edges.value.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId
  );

  emit("delete-node", nodeId);
};

const deleteSelectedElements = () => {
  if (!props.isEditable) return;

  const selectedNodeIds = nodes.value
    .filter((node) => node.selected)
    .map((node) => node.id);

  const selectedEdgesIds = edges.value
    .filter((edge) => edge.selected)
    .map((edge) => edge.id);

  nodes.value = nodes.value.filter(
    (node) => !selectedNodeIds.includes(node.id)
  );

  edges.value = edges.value.filter((edge) => {
    const selectedEdge = selectedEdgesIds.includes(edge.id);
    const connectedToDeletedNode =
      selectedNodeIds.includes(edge.source) ||
      selectedNodeIds.includes(edge.target);

    return !selectedEdge && !connectedToDeletedNode;
  });
};

const handleNodeAction = (payload) => {
  emit("node-action", payload);
};

const handleNodeClick = (event) => {
  const { node } = event;

  emit("node-click", { event: event.event, node });

  const childrenData = node.data?.children || [];
  if (childrenData.length === 0) return;

  const firstChildId = `child-${node.id}-0`;
  const isExpanded = nodes.value.some((n) => n.id === firstChildId);

  if (isExpanded) {
    // ─── LOGIKA COLLAPSE ───
    nodes.value = nodes.value.filter(
      (n) => !n.id.startsWith(`child-${node.id}-`)
    );
    // Hapus semua edge yang terhubung, baik yang bersumber dari parent maupun antar child
    edges.value = edges.value.filter(
      (e) =>
        !e.id.startsWith(`e-${node.id}-`) &&
        !e.target.startsWith(`child-${node.id}-`)
    );
  } else {
    // ─── LOGIKA EXPAND (Urutan Vertikal ke Samping) ───
    const newNodes = [];
    const newEdges = [];

    // Pisahkan data children ke dalam kategori non-logic (proses kiri) dan logic (Decision)
    const normalChildren = childrenData.filter(
      (child) => child.type !== "diamond"
    );
    const decisionChild = childrenData.find(
      (child) => child.type === "diamond"
    );

    // 1. Render seluruh Node Proses (seperti Open Browser, Input Text, dll) lurus ke bawah
    normalChildren.forEach((child, index) => {
      const childId = `child-${node.id}-${index}`;

      const childNode = {
        id: childId,
        type: child.type || "square",
        position: {
          x: node.position.x, // Tetap sejajar horizontal di bawah induknya
          y: node.position.y + 130 + index * 130, // Turun berjenjang ke bawah
        },
        data: {
          label: child.label || child.data?.label || `Step ${index + 1}`,
          children: child.children || [],
        },
      };
      newNodes.push(childNode);

      // Tarik garis berurutan dari atas ke bawah (Tester -> Open Browser -> Input Text 1 -> Input Text 2)
      const prevId = index === 0 ? node.id : `child-${node.id}-${index - 1}`;
      newEdges.push({
        id: `e-${node.id}-${prevId}-${childId}`,
        source: prevId,
        target: childId,
        type: "special",
        animated: true,
        markerEnd: MarkerType.ArrowClosed,
      });
    });

    // 2. Jika di dalam data children terdapat Node Decision (Diamond)
    if (decisionChild) {
      const decisionId = `child-${node.id}-decision`;
      const lastNormalChildId =
        normalChildren.length > 0
          ? `child-${node.id}-${normalChildren.length - 1}`
          : node.id;

      // Ambil posisi Y dari node normal terakhir agar Decision sejajar secara horizontal
      const lastY =
        normalChildren.length > 0
          ? node.position.y + 130 + (normalChildren.length - 1) * 130
          : node.position.y + 130;

      const decisionNode = {
        id: decisionId,
        type: "diamond",
        position: {
          x: node.position.x + 180, // Geser agak ke kanan dari barisan proses
          y: lastY, // Sejajar secara vertikal dengan node proses terakhir
        },
        data: {
          label: decisionChild.label || decisionChild.data?.label || "Decision",
          children: decisionChild.children || [],
        },
      };
      newNodes.push(decisionNode);

      // HUBUNGAN GARIS BARU (Sesuai panah merah di gambar kamu):
      // Menghubungkan node proses terakhir langsung menembak ke atasnya Decision
      newEdges.push({
        id: `e-${node.id}-to-decision`,
        source: lastNormalChildId, // Node proses paling bawah (terakhir)
        target: decisionId, // Masuk ke target handle (Atas) milik Diamond
        type: "smoothstep", // Menggunakan smoothstep agar belok siku-siku rapi
        borderRadius: 8,
        animated: true,
        markerEnd: MarkerType.ArrowClosed,
      });

      // 3. Jika Decision memiliki sub-child lagi di dalam datanya (Misal: Click Doc untuk jalur True)
      if (decisionChild.children && decisionChild.children.length > 0) {
        decisionChild.children.forEach((subChild, subIdx) => {
          const subChildId = `subchild-${decisionId}-${subIdx}`;

          const subNode = {
            id: subChildId,
            type: subChild.type || "square",
            position: {
              x: node.position.x + 180, // Tetap di barisan kanan (di bawah Decision)
              y: lastY + 150, // Turun di bawah node Decision
            },
            data: {
              label: subChild.label || subChild.data?.label || "Click Doc",
              children: subChild.children || [],
            },
          };
          newNodes.push(subNode);

          // Hubungkan dari handle 'true' milik Decision ke sub-node bawahnya
          newEdges.push({
            id: `e-${decisionId}-true-to-${subChildId}`,
            source: decisionId,
            sourceHandle: "true", // Keluar spesifik dari handle bawah (True)
            target: subChildId,
            type: "special",
            animated: true,
            markerEnd: MarkerType.ArrowClosed,
          });
        });
      }
    }

    // Masukkan semua data struktur baru ke state kanvas
    nodes.value.push(...newNodes);
    edges.value.push(...newEdges);
  }
};

const resetFlow = () => {
  nodes.value = JSON.parse(JSON.stringify(normalizedIncomingNodes.value));
  edges.value = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      type: "special",
      animated: true,
      markerEnd: MarkerType.ArrowClosed,
    },
  ];

  emit("reset-flow");

  setTimeout(() => {
    fitView();
  }, 50);
};

const focusFlow = () => {
  fitView();
};

const addSquare = () => {
  if (!props.isEditable) return;

  const id = getNextNodeId();

  const newNode = {
    id,
    type: "square",
    position: {
      x: 100 + Math.random() * 500,
      y: 100 + Math.random() * 300,
    },
    data: {
      label: `Square ${id}`,
    },
  };

  nodes.value.push(newNode);
};

const addDiamond = () => {
  if (!props.isEditable) return;

  const id = getNextNodeId();

  const newNode = {
    id,
    type: "diamond",
    position: {
      x: 100 + Math.random() * 500,
      y: 100 + Math.random() * 300,
    },
    data: {
      label: `Decision`,
    },
  };

  nodes.value.push(newNode);
};
</script>

<template>
  <div class="flow-wrapper">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      fit-view-on-init
      :min-zoom="0.2"
      :max-zoom="2"
      @connect="onConnect"
      @node-click="handleNodeClick"
    >
      <template #node-special="nodeProps">
        <div style="position: relative">
          <SpecialNode
            v-bind="nodeProps"
            :is-editable="isEditable"
            @delete="deleteNode"
            @action="handleNodeAction"
          />
          <q-badge
            v-if="nodeProps.data?.children?.length > 0"
            color="red"
            floating
            rounded
            :label="nodeProps.data.children.length"
          />
        </div>
      </template>

      <template #node-square="nodeProps">
        <div class="custom-flow-node node-square">
          <div class="node-content">{{ nodeProps.data.label }}</div>
          <Handle type="target" position="top" class="flow-handle" />
          <Handle type="source" position="bottom" class="flow-handle" />

          <q-badge
            v-if="nodeProps.data?.children?.length > 0"
            color="red"
            floating
            rounded
            :label="nodeProps.data.children.length"
            style="top: -10px; right: -10px"
          />
        </div>
      </template>

      <template #node-diamond="nodeProps">
        <div class="custom-flow-node node-diamond-container">
          <div class="diamond-shape"></div>

          <div class="node-content diamond-text">
            {{ nodeProps.data.label }}
          </div>

          <Handle type="target" position="top" class="flow-handle diamond-h" />

          <Handle
            type="source"
            position="bottom"
            id="true"
            class="flow-handle diamond-h"
          />
          <span class="handle-label label-true">True</span>

          <Handle
            type="source"
            position="right"
            id="false"
            class="flow-handle diamond-h"
          />
          <span class="handle-label label-false">False</span>
        </div>
      </template>

      <template #edge-special="edgeProps">
        <SpecialEdge v-bind="edgeProps" :is-editable="isEditable" />
      </template>

      <Background :gap="20" :size="1" />
      <MiniMap pannable zoomable />
      <Controls />

      <Panel position="top-left" v-if="props.isEditable">
        <div class="panel-box">
          <div class="panel-title">Flow Menu</div>

          <button v-if="isEditable" class="panel-btn" @click="addNode">
            + Add Node
          </button>

          <button
            v-if="isEditable"
            class="panel-btn square-btn"
            @click="addSquare"
          >
            + Process (Square)
          </button>

          <button
            v-if="isEditable"
            class="panel-btn diamond-btn"
            @click="addDiamond"
          >
            + Decision (Diamond)
          </button>

          <button
            v-if="isEditable"
            class="panel-btn warning"
            @click="deleteSelectedElements"
          >
            Delete Selected
          </button>

          <button class="panel-btn secondary" @click="focusFlow">
            Fit View
          </button>

          <button v-if="isEditable" class="panel-btn danger" @click="resetFlow">
            Reset
          </button>
        </div>
      </Panel>
    </VueFlow>
  </div>
</template>

<style scoped>
.flow-wrapper {
  width: 100%;
  height: 600px; /* Dinaikkan ke 600px agar area kerja flowchart lebih leluasa */
  background: #f8fafc;
  border: 1px solid #dbe3ef;
  border-radius: 16px;
  overflow: hidden;
}

/* Base style untuk custom node */
.custom-flow-node {
  position: relative;
  width: 120px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.node-content {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  padding: 8px;
  z-index: 2;
  color: #1e293b;
  word-break: break-word;
}

/* Square / Process Node */
.node-square {
  background: #e3f2fd;
  border: 2px solid #1976d2;
  border-radius: 4px;
}

/* Diamond / Decision Node Container */
.node-diamond-container {
  width: 100px;
  height: 100px;
}

/* Trik memutar background tanpa memutar Handle & Teks */
.diamond-shape {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff3e0;
  border: 2px solid #f57c00;
  transform: rotate(45deg);
  z-index: 1;
  border-radius: 4px;
}

.diamond-text {
  position: relative;
  z-index: 2;
}

/* Modifikasi Handle agar terlihat lebih rapi dan pas di ujung shape */
.flow-handle {
  width: 10px !important;
  height: 10px !important;
  background: #64748b !important;
  border: 2px solid #ffffff !important;
  z-index: 10 !important;
}

/* Khusus handle diamond agar nempel pas di sudut lancipnya */
.diamond-h.vue-flow__handle-top {
  top: -5px;
}
.diamond-h.vue-flow__handle-bottom {
  bottom: -5px;
}
.diamond-h.vue-flow__handle-left {
  left: -5px;
}
.diamond-h.vue-flow__handle-right {
  right: -5px;
}

/* Panel Styling tambahan untuk variasi warna tombol */
.panel-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 170px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.panel-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  background: #42b883;
  color: white;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.panel-btn:hover {
  opacity: 0.9;
}

.square-btn {
  background: #1976d2;
}
.diamond-btn {
  background: #f57c00;
}
.panel-btn.secondary {
  background: #3b82f6;
}
.panel-btn.warning {
  background: #f59e0b;
}
.panel-btn.danger {
  background: #ef4444;
}

/* Label untuk penanda True / False */
.handle-label {
  position: absolute;
  font-size: 10px;
  font-weight: bold;
  z-index: 5;
}

/* Posisi teks 'True' di atas handle bawah sedikit */
.label-true {
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  color: #2e7d32; /* Hijau */
}

/* Posisi teks 'False' di sebelah kiri handle kanan sedikit */
.label-false {
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #c62828; /* Merah */
}

/* Pastikan z-index teks utama berada di atas background */
.diamond-text {
  position: relative;
  z-index: 2;
  font-size: 11px;
  line-height: 1.2;
}

/* Container utama Diamond */
.node-diamond-container {
  position: relative;
  width: 110px;
  height: 110px;
  display: flex;
  /* Mengubah posisi awal teks ke atas, bukan tepat di tengah vertikal lagi */
  align-items: flex-start;
  justify-content: center;
  box-sizing: border-box;
}

/* Label teks penanda True / False */
.handle-label {
  position: absolute;
  font-size: 11px;
  font-weight: 700;
  z-index: 5;
  pointer-events: none; /* Supaya teks tidak menghalangi klik/drag pada handle */
}

/* Menggeser teks 'True' agak ke atas dari titik bawah */
.label-true {
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  color: #2e7d32; /* Warna Hijau */
}

/* Menggeser teks 'False' agak ke kiri dari titik kanan */
.label-false {
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #c62828; /* Warna Merah */
}

/* Teks utama di tengah-atas diamond */
.diamond-text {
  position: relative;
  z-index: 2;
  font-size: 12px;
  max-width: 75px;
  line-height: 1.2;
  /* Beri jarak dari atas sudut diamond agar teks pas berada di ruang kosong paruh atas */
  padding-top: 25px;
  font-weight: 700;
  color: #1e293b;
}
</style>
