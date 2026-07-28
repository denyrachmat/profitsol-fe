<template>
  <div>
    <q-tabs v-model="localTab" dense class="text-grey" active-color="primary" indicator-color="primary" narrow-indicator>
      <q-tab v-for="(tab, ti) in (block.content.tabs || [])" :key="ti" :name="ti" :label="tab.title || `Tab ${ti + 1}`" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="localTab" animated>
      <q-tab-panel v-for="(tab, ti) in (block.content.tabs || [])" :key="ti" :name="ti">
        <div v-html="tab.body"></div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
<script setup>
import { ref } from "vue";
defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
const localTab = ref(0);
</script>
