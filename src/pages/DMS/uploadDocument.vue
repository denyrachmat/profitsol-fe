<template>
  <div class="q-pa-md">
    <div class="row q-gutter-sm">
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
          :disable="isChooseFromOutside"
        />
      </div>
      <div class="col">
        <q-input label="Search file / Folder" outlined dense v-model="search" />
      </div>
      <div class="col-4 text-right" v-if="!isOutsider">
        <q-btn-group spread outline>
          <template v-if="!isChooseFromOutside">
            <q-btn outline color="green" icon="upload" @click="uploadExcel">
              <q-tooltip> Upload Items </q-tooltip>
            </q-btn>
            <q-btn
              outline
              color="cyan"
              icon="create_new_folder"
              @click="addFolder()"
            >
              <q-tooltip> New Folder </q-tooltip>
            </q-btn>
            <q-btn :disabled="true" outline color="orange" icon="edit" />
            <q-btn
              :disabled="
                !(selectedItems.length > 0 || selectedFiles.length > 0)
              "
              outline
              color="red"
              icon="delete"
              @click="deleteItemsCheck()"
            >
              <q-tooltip> Delete Items </q-tooltip>
            </q-btn>
            <q-btn
              :disabled="true"
              outline
              color="brown"
              icon="open_with"
              @click="moveItems()"
            >
              <q-tooltip> Move Items </q-tooltip>
            </q-btn>
            <q-btn
              outline
              color="purple"
              icon="refresh"
              @click="syncWithRealFolder()"
            >
              <q-tooltip> Re-sync with current folder </q-tooltip></q-btn
            >
            <q-btn
              outline
              color="indigo"
              icon="share"
              @click="onClickShare"
              :disabled="
                !(selectedItems.length > 0 || selectedFiles.length > 0)
              "
            >
              <q-tooltip> Share Items </q-tooltip>
            </q-btn>
            <q-btn-dropdown color="primary" icon="download">
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  @click="onClickImportFromSharepoint"
                >
                  <q-item-section avatar>
                    <q-avatar
                      icon="ion-logo-windows"
                      color="blue"
                      text-color="white"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Import from Sharepoint</q-item-label>
                    <q-item-label caption>
                      Import Folder / Files from Sharepoint
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </template>
          <q-btn
            color="primary"
            icon="save"
            @click="saveChoosedFiles()"
            v-if="isChooseFromOutside && !props.propsIsReadOnly"
          >
            <q-tooltip> Save Choosed Files / Folders </q-tooltip></q-btn
          >
          <q-btn
            outline
            color="orange"
            icon="refresh"
            @click="refreshCurrentPath()"
          >
            <q-tooltip> Refresh </q-tooltip></q-btn
          >
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
          v-if="typeView === 'tiles'"
        >
        </tilesView>
        <listView
          :folders="folders"
          :files="files"
          @onSelectItem="onSelectFiles"
          @onMountedDone="checkMounted"
          @onSelectedFileFolder="selectedItem"
          @onSelectedFilesCheck="selectedFile"
          @onRightClickItems="rightClickItem"
          :key="refresher + 'list'"
          v-else
        >
        </listView>

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
import { onMounted, ref, watch, defineEmits } from "vue";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";
import { is, useQuasar } from "quasar";
import { useRoute } from "vue-router";

import uploadPhoto from "../../components/uploadPhoto/index.vue";

import tilesView from "src/components/folders/tilesView.vue";
import listView from "src/components/folders/listView.vue";
import openFiles from "src/components/files/openFiles.vue";
import shareFolderFile from "./shareFolderFile.vue";
import error401 from "../Dashboards/error401.vue";
import importFromSharepoint from "./importFromSharepoint.vue";
import { authHelper, sharePointService } from "@/components/msHelpers";

const emit = defineEmits(["onSubmited"]);

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
const nowData = ref(null);

const isOutsider = ref(false);
const tokenDetail = ref([]);

const isChooseFromOutside = ref(false);
const disablePathBefore = ref(false);
const isReadOnly = ref(false);
const typeView = ref("tiles");
const selectedIdxSharePoint = ref([]);

const props = defineProps({
  propsSelectedFolders: Object,
  propsSelectedPath: Array,
  usernameSetup: {
    type: String,
    default: "",
  },
  propsIsReadOnly: {
    type: Boolean,
    default: false,
  },
  propsIsChoosedOnly: {
    type: Boolean,
    default: false,
  },
  propsViewType: {
    type: String,
    default: "tiles", // or list
  },
});

onMounted(async () => {
  isLoading.value = true;
  console.log(props);
  // route.fullPath.includes("dms/show")
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
        await initProcess(
          tokenDetail.value[index].p_u_username,
          tokenDetail.value[0].folder.dfm_root_mstr,
          IDFolder,
          IDFiles
        );
      }
    }
  } else {
    if (
      props.propsSelectedFolders &&
      Object.values(props.propsSelectedFolders).length > 0
    ) {
      // isLoading.value = true;
      // await initProcess();
      if (props.propsIsReadOnly || props.propsIsChoosedOnly) {
        isChooseFromOutside.value = true;
      }
      // dudrm_source: dudrm_source.value,
      //   selectedFiles: selectedFiles.value,
      //   selectedFolders: selectedItems.value,
      //   selectedPath: selectedPath.value,
      // selectedPath.value = await props.propsSelectedFolders.selectedPath;
      dudrm_source.value = await props.propsSelectedFolders.dudrm_source;
      selectedItems.value = await props.propsSelectedFolders.selectedFolders;
      selectedFiles.value = await props.propsSelectedFolders.selectedFiles;
      selectedPath.value = await [
        ...props.propsSelectedPath,
        ...selectedItems.value,
      ];

      nowData.value = await props.propsSelectedFolders.nowData;

      if (props.propsSelectedFolders.nowData) {
        props.propsSelectedFolders.nowData.map((valMap) => {
          console.log(valMap);
          onSelectFiles(valMap);
        });
      }
      // onSelectFiles(props.propsSelectedFolders.nowData[0]);

      await initProcess(
        "",
        dudrm_source.value,
        selectedPath.value[selectedPath.value.length - 1],
        selectedFiles.value,
        false
      );

      // console.log("Selected folders from outside:", selectedItems.value);
      // isLoading.value = false;
    } else {
      if (props.propsIsReadOnly || props.propsIsChoosedOnly) {
        isChooseFromOutside.value = true;
      }
      await initProcess();
    }
  }

  if (props.propsIsReadOnly) {
    isReadOnly.value = await props.propsIsReadOnly;
  }

  if (props.propsViewType) {
    typeView.value = await props.propsViewType;
  }

  await onChooseItem(dudrm_source.value);

  isLoading.value = false;
});

const initProcess = async (
  username = "",
  root = "",
  IDFolder = "",
  IDFiles = [],
  isLoading = false,
  rootSource = ""
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
    await getRoot("", isLoading);

    if (listRoots.value.length > 0) {
      if (!rootSource) {
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
  }

  return true;
};

const filterFn = (val, update, abort, fun) => {
  update(async () => {
    if (fun === "root") {
      await getRoot(val);
    }
  });
};

const getRoot = async (val = "", isLoadings = true) => {
  if (isLoadings) {
    isLoading.value = true;
  }
  const data = await postData(
    "get",
    null,
    `dms/documentsRoots/getRegisteredRoot/${
      props.usernameSetup ? props.usernameSetup : store.authDet.username
    }`,
    false,
    false,
    true
  );

  if (data && data.status) {
    if (isLoadings) {
      isLoading.value = false;
    }
    listRoots.value = data.data;
  } else {
    console.log("Tidak ada data");
    if (isLoadings) {
      isLoading.value = false;
    }
  }
};

const selectedItem = (val) => {
  // console.log(val);

  // Find the selected item(s) from folders.value by id
  let idObj = [];
  if (Array.isArray(val)) {
    idObj = val.map((item) =>
      typeof item === "object" && item.id
        ? folders.value.find((f) => f.id === item.id) || item
        : folders.value.find((f) => f.id === item) || { id: item }
    );
  } else if (val && val.id) {
    idObj = [folders.value.find((f) => f.id === val.id) || val];
  }

  // console.log(idObj);
  // selectedItems.value = id;
  nowData.value = idObj;
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

  console.log("Fetching data from:", [
    props.usernameSetup,
    store.authDet.username,
    dudrm_source.value,
  ]);

  let url = `dms/folderList/list/${
    props.usernameSetup ? props.usernameSetup : store.authDet.username
  }/${dudrm_source.value}/0/1`;
  if (username) {
    url = `dms/folderList/list/${username}/${root}/${id}/1`;
  }

  console.log(url);
  const data = await postData("get", null, url, false, false, true);

  if (data) {
    isLoading.value = false;
    return data;
  }
};

const saveChoosedFiles = () => {
  $q.dialog({
    title: "Save Choosed Files / Folders",
    message: "Are you sure you want to save the selected files and folders?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit("onSubmited", {
      dudrm_source: dudrm_source.value,
      selectedFiles: selectedFiles.value,
      selectedFolders: selectedItems.value,
      selectedPath: selectedPath.value,
      nowData: nowData.value,
      username: props.usernameSetup
        ? props.usernameSetup
        : store.authDet.username,
    });
  });
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
  // console.log(val);
  if (val.child_folders) {
    // IF Folder was selected
    if (val.from_sharepoint) {
      await authHelper.login(["Sites.ReadWrite.All"]);
      isLoading.value = true;
      let checkData = await sharePointService.getSharedContent(val.url);
      // console.log("Folder index:", folderIndex);
      // console.log(val);

      if (checkData && checkData.length > 0) {
        // Use Promise.all to await all async operations if needed, but here just simulate await forEach
        let listFolders = [];
        let listFiles = [];
        for (const element of checkData)
          if (element.folder && element.folder.childCount >= 0) {
            if (selectedPath.value.length === 0) {
              listFolders.push({
                type: "folder",
                id: element.id,
                dfm_folder_name: element.name,
                url: element.webUrl,
                from_sharepoint: true,
                sites: val.sites,
                child_folders: [],
              });
            } else {
              // Find parent folder by traversing folders.value using the index path in selectedIdxSharePoint.value
              let parentFolder = folders.value;
              for (const idx of selectedIdxSharePoint.value) {
                if (parentFolder && parentFolder[idx]) {
                  parentFolder = parentFolder[idx].child_folders;
                } else {
                  parentFolder = null;
                  break;
                }
              }
              parentFolder =
                parentFolder && parentFolder.length > 0
                  ? parentFolder[0]
                  : null;
              if (parentFolder) {
                listFolders.push({
                  type: "folder",
                  id: element.id,
                  dfm_folder_name: element.name,
                  url: element.webUrl,
                  from_sharepoint: true,
                  sites: val.sites,
                  child_folders: [],
                });
              }
            }
          } else {
            listFiles.push({
              type: "files",
              id: element.id,
              ddm_doc_real_name: element.name,
              downloadUrl: element.webUrl,
              shared: element.shared || [],
              from_sharepoint: true,
              sites: val.sites,
            });
          }

        console.log(checkData);

        folders.value = listFolders;
        files.value = listFiles;
        isLoading.value = false;
      } else {
        folders.value = [];
        files.value = [];
        $q.notify({
          type: "negative",
          message: "No folder / files found",
        });
      }

      const folderIndex = folders.value.findIndex(
        (folder) => folder.id === val.id
      );

      if (folderIndex >= 0) {
        selectedIdxSharePoint.value.push(folderIndex);
      }

      console.log(selectedIdxSharePoint.value);
    } else {
      isLoading.value = true;
      folders.value = val.child_folders;
      files.value = val.doc;
    }

    selectedPath.value = [...selectedPath.value, val.id];
    refresher.value = refresher.value + 1;

    console.log(selectedPath.value);
  } else {
    // If Files selected
    isLoading.value = true;
    let propsForComp = {};

    console.log(val);
    if (val.from_sharepoint && val.from_sharepoint === true) {
      propsForComp = {
        base64File: "",
        ext: "",
        mime: "",
        title: val.ddm_doc_real_name,
        urlFile: val.downloadUrl,
        selectedSites: val.sites,
        isSharepoint: true,
        ids: val.id,
        // ...more..props...
      };
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
        propsForComp = {
          base64File: getFiles.data.base64Files,
          ext: getFiles.data.ext,
          mime: getFiles.data.mime,
          title: val.ddm_doc_real_name,
          // ...more..props...
        };
      }
    }

    if (Object.keys(propsForComp).length > 0) {
      isLoading.value = false;
      // Open dialog with custom component
      $q.dialog({
        component: openFiles,

        // props forwarded to your custom component
        componentProps: propsForComp,
      }).onOk(async (val) => {
        console.log(val);
      });
    } else {
      $q.notify({
        type: "negative",
        message: "Failed to retrieve file details.",
      });
    }
  }
};

const findChoosedFolder = (arr, id) => {
  // console.log(arr);
  // console.log(id);
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
  console.log(props.propsSelectedFolders);
  if (
    !(props.propsSelectedFolders && props.propsSelectedFolders.selectedFolders)
  ) {
    selectedItems.value = [];
    selectedFiles.value = [];
  }
  isLoading.value = false;
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
        p_u_username: props.usernameSetup
          ? props.usernameSetup
          : store.authDet.username,
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
        p_u_username: props.usernameSetup
          ? props.usernameSetup
          : store.authDet.username,
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

const onChooseItem = async (val) => {
  await refreshCurrentPath();

  return true;
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

const onClickImportFromSharepoint = () => {
  const getLatestFolder = selectedPath.value[selectedPath.value.length - 1];
  $q.dialog({
    component: importFromSharepoint,
    componentProps: {
      root: dudrm_source.value,
      getLatestFolder: getLatestFolder,
    },
  }).onOk(async (val) => {
    console.log(val);
    await refreshCurrentPath();
  });
};
</script>
