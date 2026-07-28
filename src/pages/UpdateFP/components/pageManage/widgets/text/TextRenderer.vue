<template>
  <div v-html="block.content.body"></div>
</template>
<script setup>
defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
</script>
