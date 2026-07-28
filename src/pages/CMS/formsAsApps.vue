<template>
  <div class="q-pa-md">
    <div v-if="blockedMessage" class="flex flex-center" style="min-height: 60vh">
      <q-card flat bordered class="q-pa-xl text-center" style="max-width: 500px">
        <q-icon name="info" size="64px" color="orange" class="q-mb-md" />
        <div class="text-h5 text-weight-bold q-mb-sm">Form Unavailable</div>
        <div class="text-body1 text-grey-7">{{ blockedMessage }}</div>
      </q-card>
    </div>
    <showComponentVue
      v-else-if="!loading && datas.forms"
      :data="datas.forms"
      :id="datas.id"
      :setup="setup"
      :showFormOnly="setup.isHistory != 1"
    />
    <div v-else>
      <span>Loading Forms...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";

import apiRequest from "src/components/apiRequest";
import showComponentVue from "./Forms/showComponent.vue";

const props = defineProps({
  linkID: String,
});

const $q = useQuasar();
const { postData } = apiRequest();

const loading = ref(false);
const datas = ref({ forms: null, id: null });
const setup = ref({});
const blockedMessage = ref(null);

onMounted(async () => {
  await getData();
});

const getData = async () => {
  try {
    const res = await postData(
      "get",
      null,
      `cms/viewByLinkForm/${props.linkID}`,
      false,
      false,
      true
    );

    if (res?.status) {
      loading.value = false;
      datas.value = {
        forms: res.data?.value.forms ?? null,
        id: res.data?.value.id ?? null,
      };
      setup.value = res.data?.value.setupTraining ?? {};
    } else {
      loading.value = false;
      blockedMessage.value = res?.message || "Failed to load form data";
    }
  } catch (err) {
    console.error("Error fetching form data:", err);
    loading.value = false;

    if (err?.response?.status === 403) {
      blockedMessage.value =
        err.response.data?.message || "This form is currently unavailable.";
    } else {
      $q.notify({
        type: "negative",
        message: "Something went wrong",
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>
