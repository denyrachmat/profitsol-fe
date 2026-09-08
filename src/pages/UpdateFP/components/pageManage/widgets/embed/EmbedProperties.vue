<template>
  <div>
    <q-input v-model="url" label="Embed URL" dense outlined class="q-mb-sm" hint="YouTube, Vimeo, Google Maps, etc." />
    <q-select v-model="ratio" :options="ratioOptions" label="Aspect Ratio" dense outlined emit-value map-options class="q-mb-sm" />
    <q-input v-model="height" label="Custom Height (e.g. 400px, 50vh, 100%)" dense outlined class="q-mb-sm" hint="Leave empty to use ratio; 'custom' ratio requires height" />
    <q-select v-model="objectFit" :options="objectFitOptions" label="Object Fit (cover)" dense outlined emit-value map-options class="q-mb-sm" />
    <q-input v-model="borderRadius" label="Border Radius" dense outlined class="q-mb-sm" hint="e.g. 8px, 0, 12px" />
    <q-input v-model="customClass" label="Custom CSS Class" dense outlined class="q-mb-sm" hint="e.g. my-embed-cover" />
    <q-input v-model="customCss" label="Custom CSS (covers embed div)" type="textarea" dense outlined autogrow class="q-mb-sm" hint="e.g. border: 2px solid #1976d2; box-shadow: 0 4px 12px rgba(0,0,0,.15); object-fit: cover;" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { ratioOptions, objectFitOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const url = useBlockField(blockRef, "url");
const ratio = useBlockField(blockRef, "ratio");
const height = useBlockField(blockRef, "height");
const objectFit = useBlockField(blockRef, "objectFit");
const borderRadius = useBlockField(blockRef, "borderRadius");
const customCss = useBlockField(blockRef, "customCss");
const customClass = useBlockField(blockRef, "customClass");
</script>
