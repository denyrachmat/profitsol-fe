<template>
  <div>
    <div v-for="(tab, ti) in tabs" :key="ti" class="q-mb-sm q-pa-sm bg-grey-1 rounded">
      <q-input :model-value="tab.title" @update:model-value="(v) => { tab.title = v }" :label="`Tab ${ti + 1} Title`" dense outlined class="q-mb-xs" />
      <q-input :model-value="tab.body" @update:model-value="(v) => { tab.body = v }" label="Content" type="textarea" dense outlined class="q-mb-xs" />
      <q-btn flat dense no-caps icon="delete" color="red" label="Remove" size="sm" @click="tabs.splice(ti, 1)" />
    </div>
    <q-btn flat dense no-caps icon="add" label="Add Tab" color="primary" @click="tabs.push({ title: 'Tab', body: '' })" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const tabs = useBlockField(toRef(props, "block"), "tabs");
</script>
