<template>
  <div>
    <div v-for="(item, ai) in items" :key="ai" class="q-mb-sm q-pa-sm bg-grey-1 rounded">
      <q-input :model-value="item.title" @update:model-value="(v) => { item.title = v }" :label="`Item ${ai + 1} Title`" dense outlined class="q-mb-xs" />
      <q-input :model-value="item.body" @update:model-value="(v) => { item.body = v }" label="Content" type="textarea" dense outlined class="q-mb-xs" />
      <q-btn flat dense no-caps icon="delete" color="red" label="Remove" size="sm" @click="items.splice(ai, 1)" />
    </div>
    <q-btn flat dense no-caps icon="add" label="Add Item" color="primary" @click="items.push({ title: '', body: '' })" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const items = useBlockField(toRef(props, "block"), "items");
</script>
