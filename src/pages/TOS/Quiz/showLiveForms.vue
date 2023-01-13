<template>
  <div class="q-pa-md">
    <div v-if="hasil">
      <showQuizComponentVue
        :id="hasil.id"
        :data="hasil.forms"
        :setup="hasil.setupTraining"
        :id-det="hasil.ans_id"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

import showComponentVue from "../../CMS/Forms/showComponent.vue";
import showQuizComponentVue from "../../CMS/Forms/showQuizComponent.vue";
import { useFormStore } from "stores/formStore";

const store = useFormStore();
const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  id: String,
  mode: String,
});

const hasil = ref(null);

onMounted(() => {
  getData();
});

const getData = async () => {
  const data = await postData(
    "get",
    null,
    `tos/quizView/${store.getHashForm}`,
    false,
    false,
    true
  );

  if (data && data.status) {
    hasil.value = data.data;
  }
};
</script>
