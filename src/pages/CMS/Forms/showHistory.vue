<template>
  <div class="q-pa-md">
    
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed, onBeforeUnmount } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import componentViewVue from "../componentView.vue";
import showQuizComponentVue from "./showQuizComponent.vue";
import { useFormStore } from "stores/formStore";

const store = useFormStore();
const $q = useQuasar();
const { postData } = apiRequest();

const nowSeq = ref(null);
const refreshKeys = ref(0);
const props = defineProps({
  id: String,
  data: Array,
  setup: Object,
});

onMounted(() => {
  if (props.data && props.data.length > 0) {
    nowSeq.value = props.data[0].seq;
  }
});
</script>
