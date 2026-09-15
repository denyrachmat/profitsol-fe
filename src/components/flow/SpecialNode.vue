<script setup>
import { Handle, Position } from "@vue-flow/core";

defineProps({
  data: {
    type: Object,
    default: () => ({ label: "Custom Node" }),
  },
  selected: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="special-node" :class="{ selected }">
    <Handle type="target" :position="Position.Left" />

    <div class="node-header">Custom Node</div>
    <div class="node-title">{{ data.label }}</div>

    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<style scoped>
.special-node {
  min-width: 160px;
  padding: 14px 16px;
  background: white;
  border: 2px solid #42b883;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: 0.2s ease;
}

.special-node.selected {
  box-shadow: 0 0 0 4px rgba(66, 184, 131, 0.15);
}

.node-header {
  font-size: 11px;
  font-weight: 700;
  color: #42b883;
  text-transform: uppercase;
  margin-bottom: 6px;
  letter-spacing: 0.08em;
}

.node-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}
</style>
