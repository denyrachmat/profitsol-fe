<template>
  <div>
    <showComponentVue
      :data="datas.value.forms"
      v-if="datas"
      :id="datas.value.id"
    />
  </div>
</template>
<!-- route.params.idReport -->
<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import { useRoute } from "vue-router";

import showComponentVue from "./Forms/showComponent.vue";

const $q = useQuasar();
const route = useRoute();
const { postData } = apiRequest();

const datas = ref(null);

onMounted(() => {
  getData();
});

const getData = async () => {
  const data = await postData(
    "get",
    null,
    `cms/viewByLinkForm/${route.params.linkID}`,
    false,
    false,
    true
  );

  if (data && data.status) {
    datas.value = data.data;
  }
};
</script>
