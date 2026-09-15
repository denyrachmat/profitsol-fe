<template>
  <div>
    <q-input v-model="src" label="Image URL" dense outlined class="q-mb-sm" />
    <q-input v-model="alt" label="Alt Text" dense outlined class="q-mb-sm" />
    <q-input v-model="caption" label="Caption" dense outlined class="q-mb-sm" />
    <q-select v-model="width" :options="imgWidthOptions" label="Image Width" dense outlined emit-value map-options class="q-mb-sm" />
    <q-input v-model.number="height" label="Max Height (px)" type="number" dense outlined class="q-mb-sm" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { imgWidthOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const src = useBlockField(blockRef, "src");
const alt = useBlockField(blockRef, "alt");
const caption = useBlockField(blockRef, "caption");
const width = useBlockField(blockRef, "width");
const height = useBlockField(blockRef, "height");
</script>
