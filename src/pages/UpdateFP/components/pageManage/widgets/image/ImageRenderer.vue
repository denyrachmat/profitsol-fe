<template>
  <div class="text-center">
    <img
      v-if="block.content.src"
      :src="block.content.src"
      :alt="block.content.alt || ''"
      :class="{ 'img-fill-parent': block.content.fillHeight }"
      :style="imgStyle"
    />
    <div
      v-else
      class="image-placeholder q-pa-lg bg-grey-3 rounded text-grey-6 text-center"
    >
      <q-icon name="image" size="48px" />
      <div class="text-caption q-mt-sm">No image set</div>
    </div>
    <div
      v-if="block.content.caption && !block.content.fillHeight"
      class="text-caption text-grey-7 q-mt-xs"
    >
      {{ block.content.caption }}
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
  selectedBlockId: String,
});

// Numeric values are treated as percentages (width) / px (height); strings
// with a unit are passed through so "100%", "40vh", "auto" etc. work.
const toWidth = (w) => {
  if (w === null || w === undefined || w === "") return "100%";
  const s = String(w);
  return /^\d+(\.\d+)?$/.test(s) ? s + "%" : s;
};
const toHeight = (h) => {
  if (h === null || h === undefined || h === "") return null;
  const s = String(h);
  return /^\d+(\.\d+)?$/.test(s) ? s + "px" : s;
};

const imgStyle = computed(() => {
  const c = props.block.content || {};
  const fit = c.fit || "contain";

  // "Fill parent height" = background mode: stretch to the parent box so a
  // pinned image can cover a container. Border radius comes from the
  // container's own overflow, so no radius here.
  if (c.fillHeight) {
    return {
      width: "100%",
      height: "100%",
      objectFit: fit === "contain" ? "cover" : fit,
      objectPosition: c.objectPosition || "center",
      display: "block",
    };
  }

  return {
    width: toWidth(c.width),
    maxHeight: toHeight(c.height) || "none",
    objectFit: fit,
    borderRadius: "8px",
  };
});
</script>
