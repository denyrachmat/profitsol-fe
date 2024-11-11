<template>
  <div>
    <prism-editor
      class="my-editor height-200"
      v-model="code"
      :highlight="highlighter"
      line-numbers
    ></prism-editor>
  </div>
</template>
<script setup>
// import Prism Editor
import { onMounted, ref, watch } from "vue";
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles

const props = defineProps({
  modelValue: String,
  lang: String,
});

const code = ref(props.modelValue);
const highlighter = ref(() => highlight(code.value, languages["sql"]));

const emit = defineEmits(["update:modelValue"]);

onMounted(() => {
  if (props.lang === "json") {
    highlighter.value = () => highlight(code.value, languages["json"]);
  }
});

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

.height-200 {
  height: 150px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>
