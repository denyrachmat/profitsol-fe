<template>
  <hr :style="{ border: 'none', borderTop: `${block.content.thickness || 1}px ${block.content.style || 'solid'} ${block.content.color || '#e0e0e0'}`, margin: `${block.content.marginY || 16}px 0` }" />
</template>
<script setup>
defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
</script>
