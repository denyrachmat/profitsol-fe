<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-select
          outlined
          v-model="choosedData"
          :options="listData"
          label="Choose Forms"
          emit-value
          map-options
          :loading="loading"
          dense
          @update:model-value="onChooseData"
          :readonly="loading"
        />
      </div>
      <div class="col text-right"></div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed, watch, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { postData } = apiRequest();

const listData = ref([]);
const choosedData = ref(null);
const loading = ref(false);

onMounted(() => {
  getData();
});

const getData = async () => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `cms/forms/form`,
    false,
    false,
    true
  );

  if (data) {
    setTimeout(() => {
      console.log(data);
    }, 1000);
    loading.value = false;
    listData.value = data.data;
  }
};
</script>
