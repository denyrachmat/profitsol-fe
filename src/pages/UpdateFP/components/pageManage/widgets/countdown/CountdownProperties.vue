<template>
  <div>
    <q-input v-model="label" label="Countdown Label" dense outlined class="q-mb-sm" />
    <q-input v-model="targetDate" label="Target Date" dense outlined class="q-mb-sm" hint="YYYY-MM-DD HH:mm" />
    <q-select v-model="theme" :options="countdownThemeOptions" label="Theme" dense outlined emit-value map-options />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { countdownThemeOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const label = useBlockField(blockRef, "label");
const targetDate = useBlockField(blockRef, "targetDate");
const theme = useBlockField(blockRef, "theme");
</script>
