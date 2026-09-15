<template>
  <q-input v-model.number="height" label="Height (px)" type="number" dense outlined min="10" max="500" />
</template>
<script setup>
import { toRef } from "vue";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const height = useBlockField(toRef(props, "block"), "height");
</script>
