<template>
  <div
    class="header-slot row items-center q-gutter-sm"
    :class="`justify-${justify}`"
  >
    <component
      :is="rendererFor(block.type)"
      v-for="block in blocks"
      :key="block.id"
      :block="block"
      :preview="true"
      class="header-slot__item"
    />
  </div>
</template>
<script setup>
import widgetRegistry from "../../pageManage/widgets/widgetRegistry.js";

defineProps({
  blocks: { type: Array, default: () => [] },
  justify: { type: String, default: "start" },
});

const rendererFor = (type) => widgetRegistry[type]?.RendererComponent || null;
</script>
<style scoped>
.header-slot {
  flex-wrap: nowrap;
  min-width: 0;
}
.header-slot__item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}
</style>
