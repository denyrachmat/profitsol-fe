<template>
  <div>
    <q-select v-model="style" :options="dividerStyleOptions" label="Style" dense outlined emit-value map-options class="q-mb-sm" />
    <q-input v-model.number="thickness" label="Thickness (px)" type="number" dense outlined class="q-mb-sm" />
    <q-input v-model="color" label="Color" dense outlined class="q-mb-sm" />
    <q-input v-model.number="marginY" label="Vertical Margin (px)" type="number" dense outlined class="q-mb-sm" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { dividerStyleOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const style = useBlockField(blockRef, "style");
const thickness = useBlockField(blockRef, "thickness");
const color = useBlockField(blockRef, "color");
const marginY = useBlockField(blockRef, "marginY");
</script>
