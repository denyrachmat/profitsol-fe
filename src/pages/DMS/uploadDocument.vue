<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-input label="Search file / Folder" outlined dense />
      </div>
      <div class="col-2 text-right">
        <q-btn-group spread flat>
          <q-btn flat color="green" icon="upload" />
          <q-btn flat color="accent" icon="visibility" />
          <q-btn flat color="accent" icon="update" />
        </q-btn-group>
      </div>
    </div>
    <div class="row q-pt-md">
      <div class="col">
        <q-breadcrumbs class="text-brown" v-if="rootData">
          <template v-slot:separator>
            <q-icon size="1.5em" name="chevron_right" color="primary" />
          </template>

          <q-breadcrumbs-el
            label="Home"
            icon="home"
            class="cursor-pointer"
            @click="selectedPath = []"
          />
          <q-breadcrumbs-el
            :label="folder.dfm_folder_name"
            icon="folder"
            v-for="(folder, idx) in findChoosedFolder(
              rootData.child_folders,
              selectedPath
            )"
            :key="idx + 'bc'"
            class="cursor-pointer"
            @click="goToNav(idx)"
          />
        </q-breadcrumbs>
        {{ selectedPath }}
      </div>
    </div>
    <div class="row">
      <div class="col">
        <tilesView
          :folders="folders"
          :files="files"
          @onSelectItem="onSelectFiles"
          @onMountedDone="checkMounted"
          :key="refresher"
        />
      </div>
      <div class="absolute text-center full-width">
        <q-spinner-cube color="orange" size="10em" v-if="isLoading" />
        <br />
        <span v-if="isLoading">Please wait...</span>
        <span v-if="!isLoading && folders.length === 0 && files.length === 0"
          >No files found</span
        >
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";

import tilesView from "src/components/folders/tilesView.vue";

const { postData } = apiRequest();
const store = useAuthStore();
const folders = ref([]);
const files = ref([]);
const rootData = ref(null);
const refresher = ref(0);
const selectedPath = ref([]);
const isLoading = ref(false);

onMounted(() => {
  getData();
  getMSOneDriveFolder();
  // findChoosedFolder(folders, selectedPath);
});

watch(
  () => JSON.stringify(selectedPath.value),
  (val) => {
    console.log("masuk sini");
    if (selectedPath.value.length === 0) {
      folders.value = rootData.value.child_folders;
      files.value = rootData.value.doc;
      refresher.value = refresher.value + 1;
    } else {
      // folders.value = rootData.value.child_folders;
      // files.value = rootData.value.doc;
      refresher.value = refresher.value + 1;
    }
  }
);

const getData = async () => {
  isLoading.value = true;
  const data = await postData(
    "get",
    null,
    `dms/documents/${store.authDet.username}`,
    false,
    false,
    true
  );

  if (data) {
    isLoading.value = false;
    folders.value = data.data.child_folders;
    files.value = data.data.doc;
    rootData.value = data.data;
    refresher.value = refresher.value + 1;
  }
};

const onSelectFiles = (val) => {
  if (val.child_folders) {
    isLoading.value = true;
    selectedPath.value = [...selectedPath.value, val.id];
    folders.value = val.child_folders;
    files.value = val.doc;
    refresher.value = refresher.value + 1;
  } else {
    console.log(val);
  }
};

const findChoosedFolder = (arr, id) => {
  return id.length > 0
    ? arr.reduce((r, o) => {
        const children = findChoosedFolder(o.child_folders, id);
        // console.log([id, o.id]);
        if (id.includes(o.id) || children.length > 0) {
          r.push(o, ...children);
        }
        return r;
      }, [])
    : id;
};

const checkMounted = (val) => {
  isLoading.value = false;
  console.log(val);
};

const getMSOneDriveFolder = async () => {
  const data = await postData(
    "get",
    null,
    null,
    false,
    false,
    false,
    process.env.GRAPH_API + `me/drive/root/children`,
    true
  );

  if (data) {
    console.log(data);
  }
};

const goToNav = (idx) => {
  const datanya = selectedPath.value;
  datanya.splice(idx + 1, selectedPath.value.length);
  selectedPath.value = datanya;

  console.log(findChoosedFolder(rootData.value.child_folders, datanya).value);
  folders.value = findChoosedFolder(rootData.value.child_folders, selectedPath);
};
</script>
