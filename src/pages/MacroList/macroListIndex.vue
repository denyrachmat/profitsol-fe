<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-breadcrumbs>
          <q-breadcrumbs-el
            label="Home"
            icon="home"
            @click="
              paths = [];
              getData();
            "
            to="/"
          />
          <q-breadcrumbs-el
            :label="path.split('/')[path.split('/').length - 1]"
            icon="folder"
            v-for="(path, idxP) in paths"
            :key="idxP"
            @click="backAction(path, idxP)"
            to="/"
          />
        </q-breadcrumbs>
      </div>
    </div>
    <div class="row q-pt-md">
      <div class="col"></div>
    </div>
    <q-list bordered separator style="height: 80vh; overflow: auto">
      <template v-if="lists.length > 0">
        <q-item
          clickable
          v-ripple
          :active="active"
          v-for="(list, idx) in lists"
          :key="idx"
          @click="list.icon === 'folder' ? onClickFolders(list.path) : '#'"
        >
          <q-item-section avatar>
            <q-icon :name="list.icon" />
          </q-item-section>
          <q-item-section>{{ list.filename }}</q-item-section>
          <q-item-section side>
            <q-btn
              icon="download"
              flat
              color="green"
              v-if="list.icon !== 'folder'"
            />
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </div>
</template>
<script setup>
import { ref, defineProps, computed, onMounted } from "vue";
import { date, useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { postData } = apiRequest();

const lists = ref([]);
const loading = ref(false);
const paths = ref([]);

onMounted(() => {
  getData();
});

const getData = async (subFold = "") => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    subFold ? `macro/list/${btoa(subFold)}` : "macro/list",
    false,
    false,
    true
  );

  if (data) {
    setTimeout(() => {
      console.log(data);
    }, 1000);
    loading.value = false;
    lists.value = data.data;
  }
};

const onClickFolders = (folder) => {
  paths.value.push(folder);
  getData(folder);
};

const onClickFiles = (files) => {};

const backAction = (path, idx) => {
  paths.value.splice((paths.value.length - (idx + 1)) * -1);
  console.log(paths.value);
  getData(path);
};
</script>
