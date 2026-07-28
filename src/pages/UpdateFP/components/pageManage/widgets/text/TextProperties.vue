<template>
  <div>
    <div class="text-caption text-grey-7 q-mb-xs">Content</div>
    <tinyEditorVue v-model="body" />
  </div>
</template>
<script setup>
import { toRef } from "vue";
import tinyEditorVue from "src/components/editors/tinyEditor.vue";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const body = useBlockField(toRef(props, "block"), "body");
</script>
