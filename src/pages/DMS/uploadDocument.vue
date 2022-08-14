<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-input label="Search file / Folder" outlined dense v-model="search" />
      </div>
      <div class="col-2 text-right">
        <q-btn-group spread flat>
          <q-btn flat color="green" icon="upload" @click="uploadExcel" />
          <q-btn
            flat
            color="cyan"
            icon="create_new_folder"
            @click="addFolder()"
          />

          <template v-if="selectedItems.length > 0 || selectedFiles.length > 0">
            <q-btn flat color="orange" icon="edit" />
            <q-btn flat color="red" icon="delete" @click="deleteItemsCheck()" />
          </template>
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
      </div>
    </div>
    <div class="row" style="height: 78vh">
      <div class="col">
        <q-menu touch-position context-menu>
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup @click="uploadExcel">
              <q-item-section>Upload Files...</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="addFolder">
              <q-item-section>New Folder</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
        <tilesView
          :folders="folders"
          :files="files"
          @onSelectItem="onSelectFiles"
          @onMountedDone="checkMounted"
          @onSelectedFileFolder="selectedItem"
          @onSelectedFilesCheck="selectedFile"
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
import { useQuasar } from "quasar";

import uploadPhoto from "../../components/uploadPhoto";

import tilesView from "src/components/folders/tilesView.vue";
import openFiles from "src/components/files/openFiles.vue";

const $q = useQuasar();
const { postData } = apiRequest();
const store = useAuthStore();
const folders = ref([]);
const files = ref([]);
const rootData = ref(null);
const refresher = ref(0);
const selectedPath = ref([]);
const isLoading = ref(false);
const selectedItems = ref([]);
const selectedFiles = ref([]);
const search = ref("");

const selectedItem = (val) => {
  selectedItems.value = val;
};

const selectedFile = (val) => {
  selectedFiles.value = val;
};

const getData = async () => {
  isLoading.value = true;
  const data = await postData(
    "get",
    null,
    `dms/folders/${store.authDet.username}`,
    false,
    false,
    true
  );

  if (data) {
    isLoading.value = false;
    return data;
  }
};

onMounted(async () => {
  const data = await getData();

  if (data) {
    folders.value = data.data.child_folders;
    files.value = data.data.doc;
    rootData.value = data.data;
    refresher.value = refresher.value + 1;
  }

  getMSOneDriveFolder();
  // findChoosedFolder(folders, selectedPath);
});

watch(
  () => JSON.stringify(selectedPath.value),
  (val) => {
    if (selectedPath.value.length === 0) {
      folders.value = rootData.value.child_folders;
      files.value = rootData.value.doc;
      refresher.value = refresher.value + 1;
    } else {
      refresher.value = refresher.value + 1;
    }
  }
);

watch(
  () => search,
  () => {}
);

const onSelectFiles = async (val) => {
  if (val.child_folders) {
    isLoading.value = true;
    selectedPath.value = [...selectedPath.value, val.id];
    folders.value = val.child_folders;
    files.value = val.doc;
    refresher.value = refresher.value + 1;
  } else {
    const getFiles = await postData(
      "get",
      null,
      `dms/documents/${val.id}`,
      false,
      false,
      true
    );

    if (getFiles) {
      console.log(getFiles);
      $q.dialog({
        component: openFiles,

        // props forwarded to your custom component
        componentProps: {
          base64File: getFiles.data,
          title: val.ddm_doc_real_name,
          // ...more..props...
        },
      }).onOk(async (val) => {
        console.log(val);
      });
    }
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

  const foldernya = findChoosedFolder(rootData.value.child_folders, datanya);
  folders.value = foldernya[foldernya.length - 1].child_folders;
  files.value = foldernya[foldernya.length - 1].doc;
};

const uploadExcel = () => {
  $q.dialog({
    component: uploadPhoto,

    // props forwarded to your custom component
    componentProps: {
      title: "Upload Documents",
      accept: "*",
      multiple: true,
      // ...more..props...
    },
  }).onOk(async (val) => {
    console.log(val);
    const stored = await postData(
      "post",
      {
        p_u_username: store.authDet.username,
        dfm_id: selectedPath.value[selectedPath.value.length - 1],
        fileName: val.fileName,
        file_all: val.result,
      },
      `dms/documents`,
      false,
      false,
      true
    );

    if (stored) {
      refreshCurrentPath();
    }
  });
};

const addFolder = () => {
  $q.dialog({
    title: "New Folder",
    message: "New folders name",
    prompt: {
      model: "",
      type: "text", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk(async (data) => {
    isLoading.value = true;

    const getLatestFolder = selectedPath.value[selectedPath.value.length - 1];
    const datas = await postData(
      "post",
      {
        p_u_username: store.authDet.username,
        dfm_folder_name: data,
        dfm_parent_id: getLatestFolder ? getLatestFolder : null,
      },
      `dms/folders`,
      false,
      false,
      true
    );

    if (datas) {
      const getDatas = await getData();

      if (getDatas) {
        refreshCurrentPath();
      }
    }
  });
};

const refreshCurrentPath = async () => {
  const getDatas = await getData();

  if (getDatas) {
    isLoading.value = false;
    rootData.value = getDatas.data;

    const getSelected = selectedPath.value;
    const foldernya = findChoosedFolder(
      rootData.value.child_folders,
      getSelected
    );

    folders.value = foldernya[foldernya.length - 1].child_folders;
    files.value = foldernya[foldernya.length - 1].doc;
    refresher.value = refresher.value + 1;
  }
};

const deleteItemsCheck = () => {
  $q.dialog({
    title: "Delte Folder",
    message: "Are you sure want to delete selected items ?",
    cancel: true,
  }).onOk(() => {
    if (selectedItems.value.length > 0) {
      const getDataFolder = findChoosedFolder(
        rootData.value.child_folders,
        selectedItems.value
      );
      const checkNotEmpty = getDataFolder[getDataFolder.length - 1];
      if (checkNotEmpty.child_folders.length > 0) {
        $q.dialog({
          title: "Confirmation",
          message:
            "One of selected folder is not empty, are you sure want to delete this folder ? (This action irreversible)",
          cancel: true,
        }).onOk(() => {
          deleteItems(selectedItems.value);
        });
      } else {
        deleteItems(selectedItems.value);
      }
    } else {
      deleteItems(
        selectedPath.value[selectedPath.value.length - 1],
        selectedFiles.value
      );
    }
  });
};

const deleteItems = async (id, idFiles = null) => {
  const datas = await postData(
    "delete",
    null,
    !idFiles ? `dms/folders/${btoa(id)}` : `dms/documents/${btoa(idFiles)}`,
    false,
    false,
    true
  );

  if (datas) {
    refreshCurrentPath();
  }
};
</script>
