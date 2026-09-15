<template>
  <div>
    <q-expansion-item v-for="(item, ai) in (block.content.items || [])" :key="ai" :label="item.title || `Section ${ai + 1}`" header-class="text-weight-bold" class="q-mb-xs bg-grey-1 rounded">
      <div class="q-pa-sm" v-html="item.body"></div>
    </q-expansion-item>
  </div>
</template>
<script setup>
defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
</script>
