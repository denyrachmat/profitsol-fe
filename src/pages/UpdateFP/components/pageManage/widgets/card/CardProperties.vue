<template>
  <div>
    <q-input v-model="image" label="Image URL" dense outlined class="q-mb-sm" />
    <q-input v-model="imageHeight" label="Image Height (CSS, e.g. 160px)" dense outlined placeholder="160px" class="q-mb-sm" />
    <IconSelect v-model="icon" label="Overlay Icon (optional)" />
    <q-input v-model="title" label="Title" dense outlined class="q-mb-sm" />
    <q-input v-model="subtitle" label="Subtitle / Description" type="textarea" dense outlined autogrow class="q-mb-sm" />
    <q-input v-model="buttonLabel" label="Button Label (empty = no button)" dense outlined class="q-mb-sm" />
    <q-input v-model="buttonUrl" label="Button / Card Link URL" dense outlined class="q-mb-sm" />
    <ColorPicker v-model="background" label="Background Color" />
    <ColorPicker v-model="textColor" label="Text Color" />
    <q-input v-model="borderRadius" label="Border Radius (CSS, e.g. 16px)" dense outlined class="q-mb-sm" />
    <PaddingControl v-model="padding" label="Content Padding" />
    <q-select v-model="align" :options="[{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}]" label="Text Alignment" dense outlined emit-value map-options />
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
const image = useBlockField(blockRef, "image");
const imageHeight = useBlockField(blockRef, "imageHeight");
const icon = useBlockField(blockRef, "icon");
const title = useBlockField(blockRef, "title");
const subtitle = useBlockField(blockRef, "subtitle");
const buttonLabel = useBlockField(blockRef, "buttonLabel");
const buttonUrl = useBlockField(blockRef, "buttonUrl");
const background = useBlockField(blockRef, "background");
const textColor = useBlockField(blockRef, "textColor");
const borderRadius = useBlockField(blockRef, "borderRadius");
const padding = useBlockField(blockRef, "padding");
const align = useBlockField(blockRef, "align");
</script>
