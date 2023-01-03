<template>
  <div class="q-pa-md">
    {{ getNowQuestion }}
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { postData } = apiRequest();

const nowSeq = ref(0);
const props = defineProps({
  data: Array,
  setup: Object,
});

const getNowQuestion = computed(() => {
  return props.data[nowSeq.value];
});

onMounted(() => {
  console.log(props.data);
  console.log(props.setup);
});
</script>
