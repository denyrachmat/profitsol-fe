<template>
  <div>
    <prism-editor
      class="my-editor"
      v-model="code"
      :highlight="highlighter"
      line-numbers
    ></prism-editor>
  </div>
</template>
<script setup>
// import Prism Editor
import { ref, watch } from "vue";
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles

const props = defineProps({
  modelValue: String,
});

const code = ref("");
const highlighter = () => highlight(code.value, languages.sql);

const emit = defineEmits(["update:modelValue"]);

watch(props, (val) => {
  console.log(val);
  code.value = val.modelValue;
});

watch(code, (val) => {
  emit("update:modelValue", val);
});
</script>
<style>
/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: #2d2d2d;
  color: #ccc;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>
