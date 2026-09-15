<template>
  <div>
    <ColorPicker v-model="background" label="Background Color" />
    <q-toggle
      v-model="bgFullWidth"
      label="Full-Width Background (edge to edge)"
      dense
      class="q-mb-sm"
    />
    <PaddingControl v-model="padding" label="Padding" />
    <q-input v-model="borderRadius" label="Border Radius (CSS, e.g. 16px)" dense outlined placeholder="0" class="q-mb-sm" />

    <div class="row q-col-gutter-sm q-mb-sm">
      <div class="col">
        <q-select
          v-model="contentAlign"
          :options="contentAlignOptions"
          label="Content Position (inside)"
          dense
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col">
        <q-select
          v-model="containerAlign"
          :options="containerAlignOptions"
          label="Container Placement"
          dense
          outlined
          emit-value
          map-options
          hint="Centers the container box itself on the page"
        />
      </div>
    </div>
    <q-input
      v-model="maxWidth"
      label="Max Width (e.g. 800px, 60%)"
      dense
      outlined
      placeholder="auto"
      class="q-mb-sm"
    />
    <q-select
      v-model="rowGap"
      :options="[
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ]"
      label="Gap Between Rows (stacked widgets)"
      dense
      outlined
      emit-value
      map-options
      class="q-mb-sm"
    />

    <q-select
      v-model="position"
      :options="positionOptions"
      label="Position"
      dense
      outlined
      emit-value
      map-options
      class="q-mb-sm"
      hint="Use Absolute/Relative + offsets + high Z-Index to overlap other blocks"
    />

    <template v-if="position && position !== 'static'">
      <div class="row q-col-gutter-sm q-mb-sm">
        <div class="col">
          <q-input v-model="top" label="Top (e.g. 0, 20px)" dense outlined placeholder="auto" />
        </div>
        <div class="col">
          <q-input v-model="left" label="Left" dense outlined placeholder="auto" />
        </div>
      </div>
      <div class="row q-col-gutter-sm q-mb-sm">
        <div class="col">
          <q-input v-model="right" label="Right" dense outlined placeholder="auto" />
        </div>
        <div class="col">
          <q-input v-model="bottom" label="Bottom" dense outlined placeholder="auto" />
        </div>
      </div>
      <div class="row q-col-gutter-sm">
        <div class="col">
          <q-input v-model="zIndex" label="Z-Index (e.g. 10)" dense outlined placeholder="auto" />
        </div>
        <div class="col">
          <q-input v-model="width" label="Width (e.g. 100%, 300px)" dense outlined placeholder="auto" />
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { useBlockField } from "../useBlockField.js";
import ColorPicker from "../shared/ColorPicker.vue";
import PaddingControl from "../shared/PaddingControl.vue";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const background = useBlockField(blockRef, "background");
const bgFullWidth = useBlockField(blockRef, "bgFullWidth");
const padding = useBlockField(blockRef, "padding");
const borderRadius = useBlockField(blockRef, "borderRadius");
const contentAlign = useBlockField(blockRef, "contentAlign");
const containerAlign = useBlockField(blockRef, "containerAlign");
const maxWidth = useBlockField(blockRef, "maxWidth");
const rowGap = useBlockField(blockRef, "rowGap");
const position = useBlockField(blockRef, "position");
const top = useBlockField(blockRef, "top");
const left = useBlockField(blockRef, "left");
const right = useBlockField(blockRef, "right");
const bottom = useBlockField(blockRef, "bottom");
const zIndex = useBlockField(blockRef, "zIndex");
const width = useBlockField(blockRef, "width");

const positionOptions = [
  { label: "Default (static)", value: "" },
  { label: "Relative", value: "relative" },
  { label: "Absolute", value: "absolute" },
  { label: "Fixed", value: "fixed" },
  { label: "Sticky", value: "sticky" },
];

const contentAlignOptions = [
  { label: "Stretch (fill)", value: "" },
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const containerAlignOptions = [
  { label: "Stretch (full width)", value: "" },
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];
</script>
