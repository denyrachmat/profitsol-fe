<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col"></div>
      <div class="col-2 text-right">
        <q-btn-group spread flat>
          <q-btn flat color="green" icon="upload" />
          <q-btn flat color="accent" icon="visibility" />
          <q-btn flat color="accent" icon="update" />
        </q-btn-group>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <tilesView :data="folders" :selectFiles="onSelectFiles" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";

import tilesView from "src/components/folders/tilesView.vue";

const { postData } = apiRequest();
const store = useAuthStore();
const folders = ref([]);

onMounted(() => {
  getData();
});

const getData = async () => {
  const data = await postData(
    "get",
    null,
    `dms/documents/${store.authDet.username}`,
    false,
    false,
    true
  );

  if (data) {
    console.log(data.data);
    folders.value = data.data;
  }
};

const onSelectFiles = (val) => {
  console.log(val);
};
</script>
