<template>
  <div>
    <q-input v-model="title" label="Title" dense outlined class="q-mb-sm" />
    <q-select v-model="layout" :options="layoutOptions" label="Layout" dense outlined emit-value map-options class="q-mb-sm" />
    <q-select v-model="orderBy" :options="orderByOptions" label="Order By" dense outlined emit-value map-options class="q-mb-sm" />
    <q-select v-model="order" :options="sortOrderOptions" label="Sort Order" dense outlined emit-value map-options class="q-mb-sm" />
    <q-input v-model.number="maxShow" label="Max Show" type="number" dense outlined min="1" max="20" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { layoutOptions, orderByOptions, sortOrderOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const title = useBlockField(blockRef, "title");
const layout = useBlockField(blockRef, "layout");
const orderBy = useBlockField(blockRef, "orderBy");
const order = useBlockField(blockRef, "order");
const maxShow = useBlockField(blockRef, "maxShow");
</script>
