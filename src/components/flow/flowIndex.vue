<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { VueFlow, MarkerType, Panel, useVueFlow } from "@vue-flow/core";
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

watch(
  normalizedIncomingNodes,
  (val) => {
    nodes.value = JSON.parse(JSON.stringify(val));
  },
  { immediate: true, deep: true }
);

watch(
  nodes,
  (val) => {
    emit("update:listNodes", JSON.parse(JSON.stringify(val)));
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
  emit("node-click", {
    event: event.event,
    node: event.node,
  });
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
  height: 400px;
  background: #f8fafc;
  border: 1px solid #dbe3ef;
  border-radius: 16px;
  overflow: hidden;
}

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
}

.panel-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  background: #42b883;
  color: white;
  font-weight: 600;
  cursor: pointer;
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
</style>
