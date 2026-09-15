<template>
  <div>
    <q-input v-model="text" label="Text or URL" dense outlined class="q-mb-sm" />
    <q-input v-model.number="size" label="Size (px)" type="number" dense outlined class="q-mb-sm" min="64" max="512" />
    <ColorPicker v-model="foreground" label="Foreground Color" />
    <ColorPicker v-model="background" label="Background Color" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { useBlockField } from "../useBlockField.js";
import ColorPicker from "../shared/ColorPicker.vue";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const text = useBlockField(blockRef, "text");
const size = useBlockField(blockRef, "size");
const foreground = useBlockField(blockRef, "foreground");
const background = useBlockField(blockRef, "background");
</script>
