<template>
  <div class="fp-header-bar row items-center no-wrap" :style="barStyle">
    <div v-if="hasBackground" class="fp-header-bar__bg">
      <HeaderSlot :blocks="config.slots.background" justify="center" />
    </div>
    <HeaderSlot
      :blocks="config.slots.left"
      justify="start"
      class="col fp-header-bar__fg"
    />
    <HeaderSlot
      :blocks="config.slots.center"
      justify="center"
      class="col-auto fp-header-bar__fg"
    />
    <HeaderSlot
      :blocks="config.slots.right"
      justify="end"
      class="col fp-header-bar__fg"
    />
  </div>
</template>
<script setup>
import { computed } from "vue";
import HeaderSlot from "./HeaderSlot.vue";
import { cssSize } from "./useHeaderConf.js";

const props = defineProps({
  config: { type: Object, required: true },
});

const hasBackground = computed(
  () => (props.config?.slots?.background?.length || 0) > 0
);

const barStyle = computed(() => {
  const cfg = props.config || {};
  const style = {
    minHeight: cssSize(cfg.height) || "64px",
    background: cfg.background || "#ffffff",
    color: cfg.textColor || "#000000",
    gap: "8px",
    position: "relative",
    width: "100%",
    padding: cfg.padding || "0 12px",
  };
  if (cfg.transition) {
    style.transition = `background-color ${cfg.transition}, color ${cfg.transition}, min-height ${cfg.transition}`;
  }
  if (cfg.maxWidth) {
    style.maxWidth = cfg.maxWidth;
    style.margin = "0 auto";
  }
  return style;
});
</script>
<style scoped>
.fp-header-bar__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
}
.fp-header-bar__fg {
  position: relative;
  z-index: 1;
}
.fp-header-bar__bg :deep(.header-slot) {
  width: 100%;
  height: 100%;
  margin: 0 !important;
}
.fp-header-bar__bg :deep(.header-slot__item) {
  width: 100%;
  height: 100%;
  margin: 0 !important;
}
</style>
