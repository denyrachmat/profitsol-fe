<template>
  <div class="block-renderer" :style="blockStyle">
    <component
      :is="rendererComponent"
      v-if="rendererComponent"
      :block="block"
      :preview="preview"
      :edit-mode="editMode"
      :selected-block-id="selectedBlockId"
      :responsive="responsive"
      @select-block="$emit('select-block', $event)"
      @update:children="$emit('update:children', $event)"
      @delete-child="$emit('delete-child', $event)"
      @duplicate-child="$emit('duplicate-child', $event)"
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
  responsive: { type: Boolean, default: false },
});

defineEmits(["select-block", "update:children", "delete-child", "duplicate-child"]);

const rendererComponent = computed(() =>
  widgetRegistry[props.block.type]?.RendererComponent || null
);

const blockWidth = computed(() => {
  if (!props.block.width || props.block.width === 12) return "100%";
  return ((props.block.width / 12) * 100) + "%";
});

// Container blocks can center their own box on the page. Because the block's
// Column Width sizes THIS element, the margin must live here (not inside the
// container) for centering to have any room to work.
const blockStyle = computed(() => {
  const c = props.block.content || {};
  const s = {};
  // Full-width background: the block box spans the page so the container's
  // background reaches the edges, while its content keeps its column width.
  const fullBg = props.block.type === "container" && !!c.bgFullWidth;
  s.width = fullBg ? "100%" : blockWidth.value;

  if (fullBg) {
    if (c.background) s.background = c.background;
    return s;
  }

  const a = c.containerAlign;
  if (a === "center") {
    s.marginLeft = "auto";
    s.marginRight = "auto";
  } else if (a === "right") {
    s.marginLeft = "auto";
  } else if (a === "left") {
    s.marginRight = "auto";
  }
  return s;
});
</script>

<style scoped>
.block-renderer {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
