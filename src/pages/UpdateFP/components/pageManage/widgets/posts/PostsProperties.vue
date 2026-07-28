<template>
  <div>
    <q-input v-model="title" label="Title" dense outlined class="q-mb-sm" />
    <q-input v-model="desc" label="Description" type="textarea" dense outlined class="q-mb-sm" />
    <q-select v-model="category" :options="categoryOptions" label="Category" dense outlined emit-value map-options class="q-mb-sm" multiple use-chips />
    <q-select v-model="mode" :options="postModeOptions" label="Show Mode" dense outlined emit-value map-options class="q-mb-sm" />
    <q-select v-model="layout" :options="layoutOptions" label="Layout" dense outlined emit-value map-options class="q-mb-sm" />
    <q-select v-model="orderBy" :options="orderByOptions" label="Order By" dense outlined emit-value map-options class="q-mb-sm" />
    <q-select v-model="order" :options="sortOrderOptions" label="Sort Order" dense outlined emit-value map-options class="q-mb-sm" />
    <q-input v-model.number="maxShow" label="Max Show (API Limit)" type="number" dense outlined min="1" max="100" class="q-mb-sm" />
    <q-input v-model.number="pageSize" label="Posts Per Page" type="number" dense outlined min="1" max="50" class="q-mb-sm" hint="Pagination page size. Set equal to Max Show to disable pagination." />
    <q-input v-if="layout === 'grid'" v-model.number="perSlide" label="Per Slide" type="number" dense outlined min="1" max="10" class="q-mb-sm" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { postModeOptions, layoutOptions, orderByOptions, sortOrderOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true }, categoryOptions: { type: Array, default: () => [] } });
const blockRef = toRef(props, "block");
const title = useBlockField(blockRef, "title");
const desc = useBlockField(blockRef, "desc");
const category = useBlockField(blockRef, "category");
const mode = useBlockField(blockRef, "mode");
const layout = useBlockField(blockRef, "layout");
const orderBy = useBlockField(blockRef, "orderBy");
const order = useBlockField(blockRef, "order");
const maxShow = useBlockField(blockRef, "maxShow");
const pageSize = useBlockField(blockRef, "pageSize");
const perSlide = useBlockField(blockRef, "perSlide");
</script>
