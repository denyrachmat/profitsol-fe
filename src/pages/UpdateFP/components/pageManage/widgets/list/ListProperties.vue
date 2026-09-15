<template>
  <div>
    <div v-for="(item, li) in items" :key="li" class="q-mb-sm q-pa-sm bg-grey-1 rounded">
      <IconSelect
        :model-value="item.icon"
        @update:model-value="(v) => { item.icon = v }"
        :label="`Item ${li + 1} Icon`"
        class="q-mb-xs"
      />
      <q-input :model-value="item.title" @update:model-value="(v) => { item.title = v }" :label="`Item ${li + 1} Title`" dense outlined class="q-mb-xs" />
      <q-input :model-value="item.desc" @update:model-value="(v) => { item.desc = v }" label="Description" dense outlined class="q-mb-xs" />
      <q-input :model-value="item.url" @update:model-value="(v) => { item.url = v }" label="Link URL (optional)" dense outlined class="q-mb-xs" />
      <q-btn flat dense no-caps icon="delete" color="red" label="Remove" size="sm" @click="items.splice(li, 1)" />
    </div>
    <q-btn flat dense no-caps icon="add" label="Add Item" color="primary" @click="items.push({ icon: '', title: '', desc: '', url: '' })" class="q-mb-sm" />

    <q-toggle v-model="dividers" label="Separators" dense class="q-mb-sm" />
    <q-toggle v-model="showIcon" label="Show Icons" dense />

    <q-separator class="q-my-sm" />
    <div class="text-subtitle2 text-grey-7 q-mb-xs">Colors</div>
    <ColorPicker v-model="bgColor" label="Background" />
    <ColorPicker v-model="iconColor" label="Icon Color" />
    <ColorPicker v-model="titleColor" label="Title Color" />
    <ColorPicker v-model="descColor" label="Description Color" />

    <q-separator class="q-my-sm" />
    <div class="text-subtitle2 text-grey-7 q-mb-xs">Quasar List Options</div>
    <q-toggle v-model="dense" label="Dense" dense class="q-mb-sm" />
    <q-toggle v-model="bordered" label="Bordered" dense class="q-mb-sm" />
    <q-toggle v-model="padding" label="List Padding (top &amp; bottom)" dense class="q-mb-sm" />
    <q-toggle v-model="striped" label="Striped" dense class="q-mb-sm" />
    <q-toggle v-model="dark" label="Dark" dense class="q-mb-sm" />
    <q-toggle v-model="clickable" label="Clickable Items" dense class="q-mb-sm" />
    <q-toggle v-model="highlight" label="Highlight Items on Hover" dense class="q-mb-sm" />
    <PaddingControl v-model="itemPadding" label="Item Padding (each row)" className="q-mb-sm" />
    <q-select
      v-model="lines"
      :options="[
        { label: 'Default', value: null },
        { label: '1 line', value: 1 },
        { label: '2 lines', value: 2 },
        { label: '3 lines', value: 3 },
      ]"
      label="Item Lines"
      dense
      outlined
      emit-value
      map-options
    />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { useBlockField } from "../useBlockField.js";
import IconSelect from "../shared/IconSelect.vue";
import ColorPicker from "../shared/ColorPicker.vue";
import PaddingControl from "../shared/PaddingControl.vue";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const items = useBlockField(blockRef, "items");
const dividers = useBlockField(blockRef, "dividers");
const showIcon = useBlockField(blockRef, "showIcon");
const bgColor = useBlockField(blockRef, "bgColor");
const iconColor = useBlockField(blockRef, "iconColor");
const titleColor = useBlockField(blockRef, "titleColor");
const descColor = useBlockField(blockRef, "descColor");
const dense = useBlockField(blockRef, "dense");
const bordered = useBlockField(blockRef, "bordered");
const padding = useBlockField(blockRef, "padding");
const striped = useBlockField(blockRef, "striped");
const dark = useBlockField(blockRef, "dark");
const clickable = useBlockField(blockRef, "clickable");
const highlight = useBlockField(blockRef, "highlight");
const itemPadding = useBlockField(blockRef, "itemPadding");
const lines = useBlockField(blockRef, "lines");
</script>
