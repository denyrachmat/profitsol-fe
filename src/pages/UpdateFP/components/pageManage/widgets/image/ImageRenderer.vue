<template>
  <div class="text-center">
    <img v-if="block.content.src" :src="block.content.src" :alt="block.content.alt || ''" :style="{ width: (block.content.width || 100) + '%', maxHeight: block.content.height ? block.content.height + 'px' : 'none', objectFit: 'contain', borderRadius: '8px' }" />
    <div v-else class="image-placeholder q-pa-lg bg-grey-3 rounded text-grey-6 text-center">
      <q-icon name="image" size="48px" />
      <div class="text-caption q-mt-sm">No image set</div>
    </div>
    <div v-if="block.content.caption" class="text-caption text-grey-7 q-mt-xs">{{ block.content.caption }}</div>
  </div>
</template>
<script setup>
defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
</script>
