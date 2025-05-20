<template>
  <div>
    <showComponentVue
      :data="datas.value.forms"
      v-if="datas"
      :id="datas.value.id"
    />

    <!-- Loading state -->
    <div v-else-if="loading" class="loading">
      <q-spinner size="xl" />
    </div>

    <!-- Error state -->
    <div v-else class="error">
      <q-icon name="error" size="xl" />
      <p>Form not found</p>
    </div>
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
const loading = ref(false);

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
