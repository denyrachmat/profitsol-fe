<template>
  <div>
    <q-input v-model="url" label="Embed URL" dense outlined class="q-mb-sm" hint="YouTube, Vimeo, Google Maps, etc." />
    <q-select v-model="ratio" :options="ratioOptions" label="Aspect Ratio" dense outlined emit-value map-options class="q-mb-sm" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { ratioOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const url = useBlockField(blockRef, "url");
const ratio = useBlockField(blockRef, "ratio");
</script>
