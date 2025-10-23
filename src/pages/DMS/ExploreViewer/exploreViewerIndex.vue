<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="row">
      <div class="col" v-if="!chooseFilesMode && !props.readOnly">
        <q-btn-group flat>
          <q-btn color="primary" flat label="File" no-caps>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item
                  clickable
                  v-close-popup
                  v-for="(item, index) in listFilesMenu"
                  :key="index"
                  @click="item.onClick"
                  :disable="root === '' || item.disable"
                >
                  <q-item-section avatar>
                    <q-icon :name="item.icon" />
                  </q-item-section>
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn color="primary" flat label="Action" no-caps>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item
                  clickable
                  v-close-popup
                  v-for="(action, index) in listActionMenu"
                  :key="index"
                  @click="action.onClick"
                  :disable="root === '' || action.disable"
                >
                  <q-item-section avatar>
                    <q-icon :name="action.icon" />
                  </q-item-section>
                  <q-item-section>{{ action.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-btn-group>
      </div>
      <div class="col text-right">
        <q-btn-toggle
          v-model="viewMode"
          no-caps
          toggle-color="primary"
          color="white"
          text-color="black"
          :options="[
            { label: 'Grid View', value: 'tiles', slot: 'one' },
            { label: 'List View', value: 'list', slot: 'two' },
          ]"
          flat
        >
          <template v-slot:one>
            <div class="row items-center no-wrap">
              <q-icon right name="grid_view" />
            </div>
          </template>
          <template v-slot:two>
            <div class="row items-center no-wrap">
              <q-icon right name="view_list" />
            </div>
          </template>
        </q-btn-toggle>
        <q-btn
          color="primary"
          flat
          no-caps
          icon="refresh"
          @click="
            onClickBreadcrumb(getLatestFolderID, getLatestBreadcrumb.shared)
          "
        >
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>
        <q-btn
          :color="activateSelect ? 'indigo' : 'grey'"
          :flat="!activateSelect"
          no-caps
          icon="check_box"
          @click="activateSelect = !activateSelect"
          :disable="root === ''"
          v-if="!props.readOnly"
        >
          <q-tooltip>Toggle Select Mode</q-tooltip>
        </q-btn>
        <q-btn
          color="primary"
          flat
          no-caps
          icon="save"
          @click="onClickSave()"
          v-if="props.chooseFilesMode"
          :disable="selectedData.length === 0"
        >
          <q-tooltip>Save</q-tooltip>
        </q-btn>
      </div>
    </div>
    <div class="row" v-if="!props.readOnly">
      <div class="col">
        <q-select
          dense
          filled
          label="Choose Driver Root Name"
          v-model="root"
          use-input
          input-debounce="500"
          :options="listRoots"
          behavior="dialog"
          option-label="ddrm_desc"
          option-value="ddrm_name"
          map-options
          emit-value
          :loading="isLoading"
          @update:model-value="(value) => onChooseRoots(value)"
          :disable="choosedRoot !== ''"
        />
      </div>
    </div>

    <div class="row bg-grey-2 q-pa-md q-gutter-sm">
      <div class="col" style="height: 70vh; overflow: auto">
        <div class="row" v-if="isLoading">
          <div class="col text-center absolute-center" style="z-index: 99999">
            <q-spinner color="primary" size="50px" />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-breadcrumbs
              class="text-grey"
              separator=">"
              active-color="black"
              inactive-color="grey"
            >
              <q-breadcrumbs-el
                icon="home"
                label="Home"
                @click="onClickBreadcrumb(0)"
                class="cursor-pointer"
              />
              <q-breadcrumbs-el
                v-for="(bread, index) in breadCrumbsList"
                :key="index"
                :label="bread.label"
                @click="onClickBreadcrumb(bread.id, bread.shared)"
                class="cursor-pointer"
              />
            </q-breadcrumbs>
          </div>
        </div>
        <q-splitter
          v-model="splitterModel"
          :horizontal="false"
          style="height: 90%"
        >
          <!-- Shared List -->
          <template v-slot:before>
            <div class="q-pa-md">
              <span class="text-h5 text-bold" v-if="!props.sharedOnly"
                >Shared</span
              >
              <div class="row">
                <div class="col">
                  <q-input
                    dense
                    outlined
                    v-model="searchShared"
                    placeholder="Search Shared Files / Folders"
                    clearable
                    debounce="500"
                    :disable="sharedList.length === 0"
                    class="q-mb-md"
                    :loading="isLoading"
                  />
                </div>
              </div>
              <div
                class="row"
                v-if="listSharedFiltered.length > 0"
                style="max-height: 56vh; overflow: auto"
              >
                <div class="col">
                  <exploreTilesView
                    v-if="viewMode === 'tiles'"
                    :folders="
                      listSharedFiltered.filter((val) => val.type === 'folder')
                    "
                    :files="
                      listSharedFiltered.filter((val) => val.type === 'file')
                    "
                    :activate-selected="activateSelect"
                    :select-files-only="props.selectFilesOnly"
                    :select-folder-only="props.selectFolderOnly"
                    :multiple-select="props.multipleSelect"
                    :deleteable="deleteable"
                    @onClick="(val) => clickedFolderFiles(val, true)"
                    @onSelectedFilesFolder="(value) => (selectedData = value)"
                    @onDelete="(value) => onDeleteShared(value)"
                  />
                  <exploreListsView
                    v-else
                    :folders="
                      listSharedFiltered.filter((val) => val.type === 'folder')
                    "
                    :files="
                      listSharedFiltered.filter((val) => val.type === 'file')
                    "
                    :activate-selected="activateSelect"
                    :select-files-only="props.selectFilesOnly"
                    :select-folder-only="props.selectFolderOnly"
                    :multiple-select="props.multipleSelect"
                    :deleteable="deleteable"
                    @onClick="(val) => clickedFolderFiles(val, true)"
                    @onSelectedFilesFolder="(value) => (selectedData = value)"
                    @onDelete="(value) => onDeleteShared(value)"
                  />
                </div>
              </div>
              <template v-else>
                <div class="text-center q-pa-md">
                  <q-icon name="folder_open" size="5em" color="grey" />
                  <div class="text-h6 text-grey">No Files or Folders</div>
                </div>
              </template>
            </div>
          </template>

          <template v-slot:after v-if="!props.sharedOnly">
            <!-- Own Folder / Files -->
            <div class="q-pa-md">
              <span class="text-h5 text-bold">Your Folder / Files</span>
              <div class="row" style="max-height: 56vh; overflow: auto">
                <div class="col">
                  <template
                    v-if="folderList.length > 0 || filesList.length > 0"
                  >
                    <exploreTilesView
                      v-if="viewMode === 'tiles'"
                      :folders="folderList"
                      :files="filesList"
                      :activate-selected="activateSelect"
                      :select-files-only="props.selectFilesOnly"
                      :select-folder-only="props.selectFolderOnly"
                      :multiple-select="props.multipleSelect"
                      @onClick="(val) => clickedFolderFiles(val)"
                      @onSelectedFilesFolder="(value) => (selectedData = value)"
                    />
                    <exploreListsView
                      v-else
                      :folders="folderList"
                      :files="filesList"
                      :activate-selected="activateSelect"
                      :select-files-only="props.selectFilesOnly"
                      :select-folder-only="props.selectFolderOnly"
                      :multiple-select="props.multipleSelect"
                      @onClick="(val) => clickedFolderFiles(val)"
                      @onSelectedFilesFolder="(value) => (selectedData = value)"
                    />
                  </template>
                  <template v-else>
                    <div class="text-center q-pa-md">
                      <q-icon name="folder_open" size="5em" color="grey" />
                      <div class="text-h6 text-grey">No Files or Folders</div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </q-splitter>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, computed, defineEmits, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import exploreTilesView from "./exploreTilesView.vue";
import exploreListsView from "./exploreListsView.vue";
import { useAuthStore } from "src/stores/authStore";
import openFiles from "src/components/files/openFiles.vue";
import uploadPhoto from "src/components/uploadPhoto";
import exploreImportFromSharepoint from "./exploreImportFromSharepoint.vue";
import { authHelper, sharePointService } from "@/components/msHelpers";
import exploreShareView from "./exploreShareView.vue";
import exploreSendToFE from "./exploreSendToFE.vue";

const { postData } = apiRequest();
const store = useAuthStore();
const $q = useQuasar();

const emit = defineEmits(["onSelectedFilesFolder"]);

// Start Ref
const root = ref("");
const listRoots = ref([]);
const viewMode = ref("list");
const isLoading = ref(true);
const activateSelect = ref(false);
const usernameRef = ref("");
const sharedList = ref([]);
const folderList = ref([]);
const filesList = ref([]);
const breadCrumbsList = ref([]);
const selectedData = ref([]);
const selectedSitesForSharepoint = ref([]);
const listFilesMenu = ref([
  {
    icon: "create_new_folder",
    label: "New Folder",
    onClick: () => {
      addFolder();
    },
    disable: false,
  },
  {
    icon: "upload",
    label: "Upload File",
    onClick: () => {
      uploadFiles();
    },
    disable: false,
  },
  {
    icon: "ion-logo-windows",
    label: "Sharepoint Import",
    onClick: () => {
      importFromSharepoint();
    },
    disable: false,
  },
]);
const listActionMenu = ref([
  {
    icon: "autorenew",
    label: "Re-sync files with server",
    onClick: () => {
      syncWithRealFolder();
    },
    disable: false,
  },
  {
    icon: "edit",
    label: "Rename",
  },
  {
    icon: "move_down",
    label: "Move Files/Folder",
  },
  {
    icon: "share",
    label: "Share Files/Folder",
    onClick: () => {
      openShareView(true);
    },
    disable: false,
  },
  {
    icon: "send",
    label: "Send Files/Folder to Front Page",
    onClick: () => {
      openExploreSendToFE(true);
    },
    disable: false,
  },
]);
const splitterModel = ref(50);
const searchShared = ref("");
// End Ref

const handleKeydown = (event) => {
  if (
    event.shiftKey &&
    event.key.toLowerCase() === "t" &&
    !props.readOnly &&
    root.value !== ""
  ) {
    activateSelect.value = !activateSelect.value;

    $q.notify({
      message: `Toggle Shortcuts (Shift+T) has been pressed, Select Mode ${
        activateSelect.value ? "Activated" : "Deactivated"
      }`,
      color: activateSelect.value ? "indigo" : "grey",
      position: "top",
      timeout: 1000,
    });
  }
};

const props = defineProps({
  choosedRoot: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
  selectedDataDetail: {
    type: Array,
    default: () => [],
  },
  chooseFilesMode: {
    type: Boolean,
    default: false,
  },
  multipleSelect: {
    type: Boolean,
    default: true,
  },
  selectFilesOnly: {
    type: Boolean,
    default: false,
  },
  selectFolderOnly: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  deleteable: {
    type: Boolean,
    default: false,
  },
  sharedOnly: {
    type: Boolean,
    default: false,
  },
});

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  usernameRef.value = props.username || store.getDetail.username;
  getRoot(true);

  sharedList.value = props.selectedDataDetail;

  if (props.sharedOnly) {
    splitterModel.value = 100;
  }
  // if (props.selectedDataDetail) {
  //   fetchFoldersAndFilesonProps();
  // }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});

const listSharedFiltered = computed(() => {
  if (searchShared.value.trim() === "") {
    return sharedList.value;
  } else {
    const searchTerm = searchShared.value.toLowerCase();
    return sharedList.value.filter((item) => {
      if (item.type === "folder") {
        return item.dfm_folder_name.toLowerCase().includes(searchTerm);
      } else if (item.type === "file") {
        return item.ddm_doc_real_name.toLowerCase().includes(searchTerm);
      }
      return false;
    });
  }
});

const getRoot = async (isLoadings = true) => {
  if (isLoadings) {
    isLoading.value = true;
  }
  const data = await postData(
    "get",
    null,
    `dms/documentsRoots/getRegisteredRoot/${usernameRef.value}`,
    false,
    false,
    true
  );

  if (data && data.status) {
    if (isLoadings) {
      isLoading.value = false;
    }
    listRoots.value = data.data;
    console.log(data.data);
    // getFoldersFiles(data.data);
  } else {
    console.log("Tidak ada data");
    if (isLoadings) {
      isLoading.value = false;
    }
  }
};

const onChooseRoots = (val) => {
  getFoldersFiles(val);
};

const getFoldersFiles = async (root = "", id = "0", shared = false) => {
  sharedList.value = [];
  folderList.value = [];
  filesList.value = [];
  isLoading.value = true;
  const data = await postData(
    "get",
    null,
    `dms/folderList/list/${usernameRef.value}/${root}/${id}`,
    false,
    false,
    true
  );
  if (data && data.status) {
    isLoading.value = false;

    if (id == "0") {
      folderList.value = data.data.child_folders.filter(
        (val) => val.shared && val.shared.length === 0
      );
      filesList.value = data.data.doc.filter(
        (val) => val.shared && val.shared.length === 0
      );
      sharedList.value = [
        ...data.data.child_folders.filter(
          (val) => val.shared && val.shared.length > 0
        ),
        ...data.data.doc.filter((val) => val.shared && val.shared.length > 0),
      ];
    } else {
      if (shared) {
        sharedList.value = [
          ...data.data.child_folders.filter(
            (val) => val.shared && val.shared.length > 0
          ),
          ...data.data.doc.filter((val) => val.shared && val.shared.length > 0),
          ...data.data.child_folders.filter(
            (val) => val.shared && val.shared.length === 0
          ),
          ...data.data.doc.filter(
            (val) => val.shared && val.shared.length === 0
          ),
        ];
      } else {
        folderList.value = data.data.child_folders.filter(
          (val) => val.shared && val.shared.length === 0
        );
        filesList.value = data.data.doc.filter(
          (val) => val.shared && val.shared.length === 0
        );
      }
    }
  } else {
    console.log("Tidak ada data");
    isLoading.value = false;
  }
};

const clickedFolderFiles = async (val, shared = false) => {
  if (val.type === "folder") {
    if (val.from_sharepoint) {
      let openSharepoints = await openSharepointFolders(val, shared);

      if (openSharepoints) {
        breadCrumbsList.value.push({
          label: val.dfm_folder_name,
          sharepoint: true,
          id: val.url,
          url: val.url,
          shared: shared,
        });
      }

      return;
    }

    breadCrumbsList.value.push({
      label: val.dfm_folder_name,
      sharepoint: false,
      id: val.id,
      url: val.url,
      shared: shared,
    });

    getFoldersFiles(root.value, val.id, shared);
  } else if (val.type === "file") {
    if (val.from_sharepoint) {
      openFilesonSharepoint(val, shared);
      return;
    }

    openFilesDoc(val);
    console.log("File clicked:", val);
  }
};

const openFilesDoc = async (val) => {
  // window.open(url, "_blank");
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
    isLoading.value = false;
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
  } else {
    isLoading.value = false;
    console.log("Tidak ada data");
  }
};

const openFilesonSharepoint = async (val, shared = false) => {
  try {
    $q.dialog({
      component: openFiles,

      // props forwarded to your custom component
      componentProps: {
        base64File: "",
        ext: "",
        mime: "",
        title: val.ddm_doc_real_name,
        urlFile: val.url,
        selectedSites: val.sites,
        isSharepoint: true,
        ids: val.id,
        // ...more..props...
      },
    }).onOk(async (val) => {
      console.log(val);
    });
  } catch (error) {
    console.error("Error ensuring access token:", error);
    return;
  }
};

const openSharepointFolders = async (val, shared = false) => {
  if (val.sites) {
    selectedSitesForSharepoint.value = val.sites;
  }

  isLoading.value = true;
  const getFolder = await sharePointService.getSharedContentNew(val.url);
  const sites = val.sites ? val.sites : selectedSitesForSharepoint.value;

  if (getFolder && getFolder.length > 0) {
    sharedList.value = [];
    folderList.value = [];
    filesList.value = [];
    getFolder.forEach((element) => {
      if (element.folder) {
        if (shared) {
          sharedList.value.push({
            type: "folder",
            id: element.id,
            dfm_folder_name: element.name,
            url: element.webUrl,
            created_at: element.createdDateTime,
            from_sharepoint: true,
            sites: sites,
            url: element.webUrl,
            type: "folder",
          });
        } else {
          folderList.value.push({
            type: "folder",
            id: element.id,
            dfm_folder_name: element.name,
            url: element.webUrl,
            created_at: element.createdDateTime,
            from_sharepoint: true,
            sites: sites,
            url: element.webUrl,
            type: "folder",
          });
        }
      } else {
        if (shared) {
          sharedList.value.push({
            type: "files",
            id: element.id,
            ddm_doc_real_name: element.name,
            downloadUrl: element.webUrl,
            shared: element.shared || [],
            created_at: element.createdDateTime,
            from_sharepoint: true,
            sites: sites,
            url: element.webUrl,
            type: "file",
          });
        } else {
          filesList.value.push({
            type: "files",
            id: element.id,
            ddm_doc_real_name: element.name,
            downloadUrl: element.webUrl,
            shared: element.shared || [],
            created_at: element.createdDateTime,
            from_sharepoint: true,
            sites: sites,
            url: element.webUrl,
            type: "file",
          });
        }
      }
    });
    isLoading.value = false;

    return true;
  } else {
    isLoading.value = false;
    $q.notify({
      type: "warning",
      message:
        "No Files / Folders or you don't have access in this Sharepoint Folder",
    });

    return false;
  }
};

const onClickBreadcrumb = (id, shared = false) => {
  console.log(id);
  if (id == 0) {
    breadCrumbsList.value = [];

    if (props.selectedDataDetail.length > 0) {
      sharedList.value = props.selectedDataDetail;

      return;
    }
    console.log(props.selectedDataDetail);
  } else {
    const index = breadCrumbsList.value.findIndex((bread) => bread.id === id);
    if (index !== -1) {
      breadCrumbsList.value = breadCrumbsList.value.slice(0, index + 1);
    }
  }

  const bread = breadCrumbsList.value.find((bread) => bread.id === id);
  if (bread && bread.sharepoint) {
    openSharepointFolders(bread, shared);
    return;
  }

  getFoldersFiles(root.value, id, shared);
};

const onClickSave = () => {
  $q.dialog({
    title: "Confirmation",
    message: "Do you want to save the selected items?",
    cancel: true,
  }).onOk(() => {
    let dataSelected = selectedData.value.map((item) => {
      return (
        folderList.value.find((f) => f.id === item) ||
        filesList.value.find((f) => f.id === item)
      );
    });

    if (props.multipleSelect) {
      // Merge dataSelected with sharedList.value, avoiding duplicates by id
      const merged = [...sharedList.value, ...dataSelected];
      emit("onSelectedFilesFolder", merged);
    } else {
      if (dataSelected.length > 0) {
        // Merge dataSelected[0] with sharedList.value, avoiding duplicates by id
        const merged = [
          ...sharedList.value.filter((item) => item.id !== dataSelected[0].id),
          dataSelected[0],
        ];
        emit("onSelectedFilesFolder", merged);
      } else {
        $q.notify({
          type: "warning",
          message: "Please select a file or folder",
        });
      }
    }
  });
};

const onDeleteShared = (val) => {
  console.log(val);
  $q.dialog({
    title: "Confirmation",
    message: "Do you want to remove the selected items from shared list?",
    cancel: true,
  }).onOk(() => {
    sharedList.value = sharedList.value.filter(
      (item) => !val.includes(item.id)
    );
    selectedData.value = selectedData.value.filter(
      (item) => !val.includes(item)
    );
    emit("onSelectedFilesFolder", sharedList.value);
  });
};
// Start Computed
const getLatestFolderID = computed(() => {
  return breadCrumbsList.value.length
    ? breadCrumbsList.value[breadCrumbsList.value.length - 1].id
    : "0";
});

const getLatestBreadcrumb = computed(() => {
  return breadCrumbsList.value.length
    ? breadCrumbsList.value[breadCrumbsList.value.length - 1]
    : "0";
});
//End Computed

// Start Options Click
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
        dfm_parent_id:
          getLatestFolderID.value != 0 ? getLatestFolderID.value : null,
        dfm_root_mstr: root.value,
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

const uploadFiles = () => {
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
        p_u_username: usernameRef.value,
        dfm_id: getLatestFolderID.value,
        fileName: val.fileName,
        file_all: val.result,
        dfm_root_mstr: root.value,
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

const refreshCurrentPath = () => {
  onClickBreadcrumb(getLatestFolderID.value, getLatestBreadcrumb.value.shared);
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
      `dms/documentsRoots/resyncFolderToDB/${usernameRef.value}/${root.value}`,
      false,
      false,
      true
    );

    if (data) {
      isLoading.value = false;
      onClickBreadcrumb(0);
    } else {
      isLoading.value = false;
    }
  });
};

const importFromSharepoint = () => {
  $q.dialog({
    component: exploreImportFromSharepoint,

    // props forwarded to your custom component
    componentProps: {
      username: usernameRef.value,
      rootName: root.value,
      // ...more..props...
    },
  })
    .onOk(async (val) => {
      for await (const item of val.data) {
        const datas = await postData(
          "post",
          {
            p_u_username: store.authDet.username,
            dfm_folder_name: item.ddm_doc_real_name ?? item.dfm_folder_name,
            dfm_parent_id:
              getLatestFolderID.value != 0 ? getLatestFolderID.value : null,
            dfm_root_mstr: root.value,
            from_sharepoint: true,
            sites: val.sites,
            url: item.url,
          },
          `dms/folders`,
          false,
          false,
          true
        );
      }

      onClickBreadcrumb(getLatestFolderID.value);
    })
    .onCancel(() => {
      console.log("Import Cancel");
    });
};

const openShareView = (useList = false) => {
  console.log(selectedData.value);
  let dataSelected = selectedData.value
    .map((item) => {
      return (
        folderList.value.find((f) => f.id === item) ||
        filesList.value.find((f) => f.id === item)
      );
    })
    .filter((item) => item !== undefined);

  console.log(dataSelected);

  // if (dataSelected.length === 0) {
  //   $q.notify({
  //     type: "warning",
  //     message: "Please select at least one of your folder / files to share",
  //   });
  //   return;
  // }

  $q.dialog({
    component: exploreShareView,

    // props forwarded to your custom component
    componentProps: {
      root: root.value,
      idParent: getLatestFolderID.value,
      idFolder: dataSelected
        .filter((item) => item.type === "folder")
        .map((item) => item.id),
      idFiles: dataSelected
        .filter((item) => item.type === "file")
        .map((item) => item.id),
      // ...more..props...
    },
  })
    .onOk(async (val) => {
      console.log(val);
    })
    .onCancel(() => {
      console.log("Import Cancel");
    });
};

const openExploreSendToFE = () => {
  console.log(selectedData.value);
  console.log(sharedList.value);
  let dataSelected = selectedData.value
    .map((item) => {
      return sharedList.value.find((f) => f.id === item);
    })
    .filter((item) => item !== undefined);

  // if (dataSelected.length === 0) {
  //   $q.notify({
  //     type: "warning",
  //     message: "Please select at least one shared folder / file to send",
  //   });
  //   return;
  // }

  $q.dialog({
    component: exploreSendToFE,

    // props forwarded to your custom component
    componentProps: {
      root: root.value,
      listSharedData: dataSelected,
      // ...more..props...
    },
  })
    .onOk(async (val) => {
      console.log(val);
    })
    .onCancel(() => {
      console.log("Import Cancel");
    });
};
// End Options Click
</script>
