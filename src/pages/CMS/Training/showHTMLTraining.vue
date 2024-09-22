<template>
  <div class="q-pa-md page">
    <div class="q-pa-md bg-grey q-gutter-sm">
      <div class="row" v-for="(htmlCont, idxhtm) in listHTML" :key="idxhtm">
        <div class="col bg-white" style="border-radius: 10px; padding: 15px">
          <div v-html="htmlCont.cfm_content"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed, watch } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

import { useFormStore } from "stores/formStore";
import { useRouter, useRoute } from "vue-router";

const router = useRoute();

const store = useFormStore();

const $q = useQuasar();
const { postData } = apiRequest();

const listHTML = ref([]);

onMounted(async () => {
  const data = await postData(
    "get",
    null,
    `cms/viewHTMLOnlyQuiz/${router.query.data}`,
    false,
    false,
    true
  );

  if (data) {
    listHTML.value = data;
  }
});
</script>
<style scoped>
.page {
  page-break-after: always;
}
</style>
