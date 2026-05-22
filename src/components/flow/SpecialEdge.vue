<script setup>
import { computed } from "vue";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@vue-flow/core";

const props = defineProps({
  id: String,
  sourceX: Number,
  sourceY: Number,
  targetX: Number,
  targetY: Number,
  sourcePosition: String,
  targetPosition: String,
  markerEnd: [String, Object],
  style: Object,
  selected: {
    type: Boolean,
    default: false,
  },
});

const edgeData = computed(() =>
  getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  })
);

const edgePath = computed(() => edgeData.value[0]);
const labelX = computed(() => edgeData.value[1]);
const labelY = computed(() => edgeData.value[2]);
</script>

<template>
  <BaseEdge
    :id="id"
    :path="edgePath"
    :marker-end="markerEnd"
    :style="{
      stroke: selected ? '#2563eb' : '#42b883',
      strokeWidth: selected ? 3 : 2,
      ...style,
    }"
  />

  <EdgeLabelRenderer>
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        pointerEvents: 'all',
      }"
      class="edge-label"
    >
      Link
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
.edge-label {
  background: white;
  padding: 4px 8px;
  border: 1px solid #42b883;
  border-radius: 8px;
  font-size: 12px;
  color: #111827;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}
</style>
