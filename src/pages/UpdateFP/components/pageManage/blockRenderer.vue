<template>
  <div class="block-renderer" :style="{ width: blockWidth }">
    <component
      :is="rendererComponent"
      v-if="rendererComponent"
      :block="block"
      :preview="preview"
      :edit-mode="editMode"
      :selected-block-id="selectedBlockId"
      @select-block="$emit('select-block', $event)"
      @update:children="$emit('update:children', $event)"
      @delete-child="$emit('delete-child', $event)"
    />
    <div v-else class="bg-grey-2 rounded q-pa-md text-center text-grey-5">
      <q-icon name="help_outline" size="32px" />
      <div class="text-caption">Unknown block type: {{ block.type }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import widgetRegistry from "./widgets/widgetRegistry.js";

const props = defineProps({
  block: { type: Object, required: true },
  preview: { type: Boolean, default: false },
  editMode: { type: Boolean, default: false },
  selectedBlockId: { type: String, default: null },
});

defineEmits(["select-block", "update:children", "delete-child"]);

const rendererComponent = computed(() =>
  widgetRegistry[props.block.type]?.RendererComponent || null
);

const blockWidth = computed(() => {
  if (!props.block.width || props.block.width === 12) return "100%";
  return ((props.block.width / 12) * 100) + "%";
});
</script>

<style scoped>
.block-renderer {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
