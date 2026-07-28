<template>
  <div :style="{ height: (block.content.height || 40) + 'px' }"></div>
</template>
<script setup>
defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
</script>
