<template>
  <div class="q-pa-md">
    <showComponentVue
      v-if="!loading && datas.forms"
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
import { useRoute } from "vue-router";

import apiRequest from "src/components/apiRequest";
import showComponentVue from "./Forms/showComponent.vue";

const props = defineProps({
  linkID: String, // match the parameter name
});

const $q = useQuasar();
const { postData } = apiRequest();

const loading = ref(false);
// ✅ Default to empty object, not null
const datas = ref({ forms: null, id: null });
const setup = ref({});
onMounted(async () => {
  console.log("linkID", props.linkID);
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
      console.log("res", res);
      loading.value = false;
      datas.value = {
        forms: res.data?.value.forms ?? null,
        id: res.data?.value.id ?? null,
      };
      setup.value = res.data?.value.setupTraining ?? {};
      console.log("datas", datas.value);
    } else {
      loading.value = false;
      $q.notify({
        type: "negative",
        message: "Failed to load form data",
      });
    }
  } catch (err) {
    console.error("Error fetching form data:", err);
    $q.notify({
      type: "negative",
      message: "Something went wrong",
    });
  } finally {
    loading.value = false;
  }
};
</script>
