<template>
  <div>
    <div v-if="block.content.title" class="text-h6 q-mb-sm">{{ block.content.title }}</div>
    <div class="bg-grey-2 rounded q-pa-md text-center text-grey-5">
      <q-icon name="folder_open" size="32px" />
      <div class="text-caption q-mt-xs">Files explorer</div>
    </div>
  </div>
</template>
<script setup>
defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
</script>
