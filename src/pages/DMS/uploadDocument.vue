<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col" v-if="!isOutsider">
        <q-select
          dense
          filled
          label="Choose Root Name"
          v-model="dudrm_source"
          use-input
          input-debounce="500"
          :options="listRoots"
          @filter="(val, update, abort) => filterFn(val, update, abort, 'root')"
          behavior="dialog"
          option-label="ddrm_desc"
          option-value="ddrm_name"
          map-options
          emit-value
          :loading="isLoading"
          @update:model-value="(value) => onChooseItem(value)"
        />
      </div>
      <div class="col">
        <q-input label="Search file / Folder" outlined dense v-model="search" />
      </div>
      <div class="col-2 text-right" v-if="!isOutsider">
        <q-btn-group spread flat>
          <q-btn flat color="green" icon="upload" @click="uploadExcel">
            <q-tooltip> Upload Items </q-tooltip>
          </q-btn>
          <q-btn
            flat
            color="cyan"
            icon="create_new_folder"
            @click="addFolder()"
          >
            <q-tooltip> New Folder </q-tooltip>
          </q-btn>
          <q-btn :disabled="true" flat color="orange" icon="edit" />
          <q-btn
            :disabled="!(selectedItems.length > 0 || selectedFiles.length > 0)"
            flat
            color="red"
            icon="delete"
            @click="deleteItemsCheck()"
          >
            <q-tooltip> Delete Items </q-tooltip>
          </q-btn>
          <q-btn
            :disabled="true"
            flat
            color="brown"
            icon="open_with"
            @click="moveItems()"
          >
            <q-tooltip> Move Items </q-tooltip>
          </q-btn>
          <q-btn
            flat
            color="primary"
            icon="refresh"
            @click="refreshCurrentPath()"
          >
            <q-tooltip> Refresh </q-tooltip></q-btn
          >
          <q-btn
            flat
            color="purple"
            icon="refresh"
            @click="syncWithRealFolder()"
          >
            <q-tooltip> Re-sync with current folder </q-tooltip></q-btn
          >
          <q-btn
            flat
            color="indigo"
            icon="share"
            @click="onClickShare"
            :disabled="!(selectedItems.length > 0 || selectedFiles.length > 0)"
          >
            <q-tooltip> Share Items </q-tooltip>
          </q-btn>
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
    <div
      class="row"
      style="height: 78vh"
      v-if="(isOutsider && tokenDetail.length > 0) || !isOutsider"
    >
      <div class="col">
        <tilesView
          :folders="folders"
          :files="files"
          @onSelectItem="onSelectFiles"
          @onMountedDone="checkMounted"
          @onSelectedFileFolder="selectedItem"
          @onSelectedFilesCheck="selectedFile"
          @onRightClickItems="rightClickItem"
          :key="refresher"
        >
        </tilesView>

        <q-menu touch-position context-menu @hide="onCloseContext">
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup @click="uploadExcel">
              <q-item-section>Upload Files...</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="addFolder">
              <q-item-section>New Folder</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="refreshCurrentPath">
              <q-item-section>Refresh</q-item-section>
            </q-item>

            <q-separator />

            <q-item
              clickable
              v-close-popup
              @click="onClickShare"
              :disable="
                !(selectedItems.length === 1 || selectedFiles.length === 1)
              "
            >
              <q-item-section>Share</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="addFolder" :disable="true">
              <q-item-section>Move Items</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="renameItems"
              :disable="
                !(selectedItems.length === 1 || selectedFiles.length === 1)
              "
            >
              <q-item-section>Rename</q-item-section>
            </q-item>
            <q-item
              clickable
              @click="deleteItemsCheck()"
              :disable="!(selectedItems.length > 0 || selectedFiles.length > 0)"
            >
              <q-item-section>Delete</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
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
    <error401 v-else />
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";

import uploadPhoto from "../../components/uploadPhoto";

import tilesView from "src/components/folders/tilesView.vue";
import openFiles from "src/components/files/openFiles.vue";
import shareFolderFile from "./shareFolderFile.vue";
import error401 from "../Dashboards/error401.vue";

const $q = useQuasar();
const { postData } = apiRequest();
const store = useAuthStore();
const route = useRoute();

const folders = ref([]);
const files = ref([]);
const rootData = ref([]);
const refresher = ref(0);
const selectedPath = ref([]);
const isLoading = ref(false);
const selectedItems = ref([]);
const selectedFiles = ref([]);
const search = ref("");
const listRoots = ref([]);
const dudrm_source = ref("");

const isOutsider = ref(false);
const tokenDetail = ref([]);

onMounted(async () => {
  console.log(route);
  if (route.fullPath.includes("dms/show")) {
    isOutsider.value = true;
    const checkToken = await checkTokenAccess(
      route.params.token,
      route.params.id
    );
    if (checkToken.length > 0) {
      tokenDetail.value = checkToken;

      folders.value = [];
      files.value = [];

      for (let index = 0; index < tokenDetail.value.length; index++) {
        let IDFolder = tokenDetail.value[index].dfm_id ?? [];
        let IDFiles = tokenDetail.value[index].ddm_id ?? [];
        initProcess(
          tokenDetail.value[index].p_u_username,
          tokenDetail.value[0].folder.dfm_root_mstr,
          IDFolder,
          IDFiles
        );
      }
    }
  } else {
    initProcess();
  }
});

const initProcess = async (
  username = "",
  root = "",
  IDFolder = "",
  IDFiles = []
) => {
  if (username) {
    if (IDFolder) {
      const data = await getData(username, IDFolder, root);
      if (data) {
        rootData.value.push(data.data.child_folders[0]);
        folders.value.push(data.data.child_folders[0]);
      }
    }
  } else {
    await getRoot();

    if (listRoots.value.length > 0) {
      dudrm_source.value = root ? root : listRoots.value[0].ddrm_name;
    }

    const data = await getData();

    if (data) {
      folders.value = data.data.child_folders;
      files.value = data.data.doc;
      rootData.value = data.data;
      refresher.value = refresher.value + 1;
    }
  }
};

const filterFn = (val, update, abort, fun) => {
  update(async () => {
    if (fun === "root") {
      await getRoot(val);
    }
  });
};

const getRoot = async (val = "") => {
  isLoading.value = true;
  const data = await postData(
    "get",
    null,
    `dms/documentsRoots/getRegisteredRoot/${store.authDet.username}`,
    false,
    false,
    true
  );

  if (data) {
    isLoading.value = false;
    listRoots.value = data.data;
  } else {
    isLoading.value = false;
  }
};

const selectedItem = (val) => {
  selectedItems.value = val;
};

const selectedFile = (val) => {
  selectedFiles.value = val;
};

const rightClickItem = (val) => {
  if (val.dfm_folder_name) {
    selectedItems.value = [val.id];
  } else {
    selectedFiles.value = [val.id];
  }
};

const onCloseContext = () => {
  selectedItems.value = [];
  selectedFiles.value = [];
};

const getData = async (username = "", id = "", root = "") => {
  isLoading.value = true;

  let url = `dms/folderList/list/${store.authDet.username}/${dudrm_source.value}`;
  if (username) {
    url = `dms/folderList/list/${username}/${root}/${id}`;
  }
  const data = await postData("get", null, url, false, false, true);

  if (data) {
    isLoading.value = false;
    return data;
  }
};

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
    isLoading.value = true;
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
      isLoading.value = false;
      console.log(getFiles);
      $q.dialog({
        component: openFiles,

        // props forwarded to your custom component
        componentProps: {
          base64File: getFiles.data.base64Files,
          ext: getFiles.data.ext,
          mime: getFiles.data.mime,
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
  console.log(arr);
  console.log(id);
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
  selectedItems.value = [];
  selectedFiles.value = [];
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
    process.env.GRAPH_API + `me/drive/root:/Documents/Kerjaan/`,
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
        dfm_root_mstr: dudrm_source.value,
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
        dfm_root_mstr: dudrm_source.value,
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

    if (foldernya.length > 0) {
      folders.value = foldernya[foldernya.length - 1].child_folders;
      files.value = foldernya[foldernya.length - 1].doc;
    } else {
      folders.value = getDatas.data.child_folders;
      files.value = getDatas.data.doc;
    }
    refresher.value = refresher.value + 1;
  }
};

const deleteItemsCheck = () => {
  $q.dialog({
    title: "Delete Folder",
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

const moveItems = () => {
  console.log(selectedFiles.value);
  console.log(selectedPath.value);
};

const renameItems = () => {
  const cariFolder = findChoosedFolder(
    rootData.value.child_folders,
    selectedFiles.value
  );

  console.log(cariFolder);
  let data = 0;
  let getFiles = null;
  if (selectedItems.value.length === 1) {
    data = cariFolder[0].dfm_folder_name;
  }

  if (selectedFiles.value.length === 1) {
    console.log(cariFolder);
    getFiles = cariFolder[0].doc.filter((fil) => {
      fil.id === selectedFiles.value[0];
    });

    data = getFiles.ddm_doc_real_name;
  }

  $q.dialog({
    title: "Rename Items",
    message: "rename your items",
    prompt: {
      model: data,
      type: "text", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk(async (datas) => {
    console.log(datas);
  });
};

const syncWithRealFolder = () => {
  $q.dialog({
    title: "Confirmation",
    message: "Do you want resync with current folder ?",
    cancel: true,
  }).onOk(async () => {
    isLoading.value = true;
    const data = await postData(
      "get",
      null,
      `dms/documentsRoots/resyncFolderToDB/${store.authDet.username}/${dudrm_source.value}`,
      false,
      false,
      true
    );

    if (data) {
      isLoading.value = false;
      refreshCurrentPath();
    } else {
      isLoading.value = false;
    }
  });
};

const onClickShare = (id, idFiles = []) => {
  console.log(selectedItems.value);
  $q.dialog({
    component: shareFolderFile,
    componentProps: {
      root: dudrm_source.value,
      idFolder: selectedItems.value,
      idFiles: selectedFiles.value,
    },
  })
    .onOk(async (val) => {
      getData();
    })
    .onDismiss(() => {
      getData();
    });
};

const onChooseItem = (val) => {
  refreshCurrentPath();
};

const checkTokenAccess = async (token, id) => {
  isLoading.value = true;
  const data = await postData(
    "get",
    null,
    `dms/documentsRoots/getSharedToken/${token + (id ? "/" + id : "")}`,
    false,
    false,
    true
  );

  if (data) {
    isLoading.value = false;
    return data;
  }
};
</script>
