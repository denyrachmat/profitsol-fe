<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="q-dialog-plugin bg-white q-pa-md">
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">Import from Sharepoint</div>
          </div>
          <div class="col text-right">
            <q-btn
              label="Import"
              icon="download"
              @click="onImportSharepoint"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col-12 col md-4 q-pa-sm">
            <div class="row">
              <div class="col">
                <q-select
                  v-model="selectedSites"
                  :options="listSites"
                  option-label="displayName"
                  option-value="name"
                  label="Select SharePoint Site"
                  @update:model-value="onSiteChange"
                  @filter="filterFn"
                  input-debounce="1000"
                  use-input
                  hide-selected
                  fill-input
                  outlined
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <template v-if="selectedSites && selectedSites.id">
              <div class="row" style="overflow: auto">
                <div class="col">
                  <q-breadcrumbs>
                    <q-breadcrumbs-el
                      v-for="(item, index) in path"
                      :key="index"
                      :label="item.name"
                      @click="navigateTo(index)"
                      class="cursor-pointer"
                    />
                  </q-breadcrumbs>
                </div>
              </div>
              <div class="row q-pt-sm" style="height: 78vh">
                <div class="col">
                  {{ selectedFolder }}
                  <tilesView
                    :folders="folders"
                    :files="files"
                    @onSelectItem="onSelectFiles"
                    @onMountedDone="checkMounted"
                    @onSelectedFileFolder="selectedFolder"
                    @onSelectedFilesCheck="selectedFiles"
                    @onRightClickItems="rightClickItem"
                    @onSelected="selectedDatas"
                    :key="refresher"
                    :selectedSites="selectedSites"
                  >
                  </tilesView>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="text-center text-grey">
                <p>Select a SharePoint site to view its contents.</p>
              </div>
            </template>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed, getCurrentInstance } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";
import { authHelper, sharePointService } from "@/components/msHelpers";
import openFiles from "src/components/files/openFiles.vue";

import tilesView from "src/components/folders/tilesView.vue";
import multiplePromptDialog from "src/components/multiplePromptDialog.vue";

const authStore = useAuthStore();

const { proxy } = getCurrentInstance();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const $q = useQuasar();
const { postData } = apiRequest();
const showPicker = ref(false);
const path = ref([{ name: "Root", id: "root" }]);
const currentFolder = ref(null);
const siteId = ref(null);
const driveId = ref(null);
const loading = ref(false);
const selectedDriveId = ref(null);
const selectedSites = ref([]);
const listSites = ref([]);
const files = ref([]);
const folders = ref([]);
const selectedFiles = ref([]);
const selectedFolder = ref([]);
const selectedAllData = ref([]);
const refresher = ref(0);

const selectedDatas = (data) => {
  console.log("Selected datas:", data);
  selectedAllData.value = data;
};

const props = defineProps({
  root: String,
  getLatestFolder: [String, Number],
});

// Emits
const emit = defineEmits(["folder-selected"]);

onMounted(async () => {
  // Initialize MSAL

  // Ensure logged in
  await authHelper.login(["Sites.ReadWrite.All"]);

  // Get SharePoint site info
  const siteInfo = await sharePointService.getSiteInfo();
  siteId.value = siteInfo.id;
  driveId.value = siteInfo.drive.id;

  const getSharedSites = await sharePointService.getSharedThroughOneDrive();
  console.log("Shared Sites:", getSharedSites);
  // const getSiteDetails = await sharePointService.getSiteDetails(siteId.value);
  // console.log("Site Details:", getSiteDetails);

  // const getDrives = sharePointService.getDrives(siteId.value);

  // console.log("Drives:", getDrives);
});

const filterFn = async (val, update, abort) => {
  // call abort() at any time if you can't retrieve data somehow

  if (val === "") {
    update(() => {
      listSites.value = [];
      selectedDriveId.value = null; // Reset drive selection
    });
    return;
  }

  const siteList = await sharePointService.getMySites(val ?? "*");
  if (siteList && siteList.length > 0) {
    update(() => {
      listSites.value = siteList;
    });
  } else {
    $q.notify({
      type: "negative",
      message: "No SharePoint sites found.",
    });
  }
};

const onSiteChange = async (val) => {
  console.log("Selected site:", val);
  folders.value = [];
  files.value = [];
  path.value = [{ name: "Root", id: "root" }]; // Reset path

  openFolder("root");
};

const openFolder = async (folderName) => {
  console.log("cek");
  const getDrives = await sharePointService.getDrives(selectedSites.value.id);

  let driveID = getDrives[0].id; // Default to first drive
  selectedDriveId.value = driveID;

  folders.value = [];
  files.value = [];
  const getFolder = await sharePointService.getFolderContents(
    driveID,
    folderName
  );

  console.log("Folder contents:", getFolder);

  if (getFolder.length > 0) {
    getFolder.forEach((element) => {
      if (element.folder) {
        folders.value.push({
          type: "folder",
          id: element.id,
          dfm_folder_name: element.name,
          url: element.webUrl,
        });
      } else {
        files.value.push({
          type: "files",
          id: element.id,
          ddm_doc_real_name: element.name,
          downloadUrl: element.webUrl,
          shared: element.shared || [],
        });
      }
    });
  }

  refresher.value += 1; // Trigger reactivity
};

const onSelectFiles = async (selected) => {
  console.log("Selected files:", selected);
  // Update path.value to include the selected folder
  if (selected.type === "folder") {
    path.value.push({
      name: selected.dfm_folder_name,
      id: selected.id,
    });
    openFolder(selected.id);
  } else {
    // Handle file selection if needed
    const getFiles = await sharePointService.getFileFromSharePoint(
      selected.id,
      selectedDriveId.value
    );
    if (getFiles) {
      $q.dialog({
        component: openFiles,

        // props forwarded to your custom component
        componentProps: {
          base64File: getFiles.base64File,
          ext: getFiles.ext,
          mime: getFiles.mime,
          title: selected.ddm_doc_real_name,
          urlFile: selected.downloadUrl,
          selectedSites: selectedSites.value,
          // ...more..props...
        },
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
  // emit("folder-selected", selected);
};

const navigateTo = (index) => {
  if (index === 0) {
    path.value = [{ name: "Root", id: "root" }];
    openFolder("root");
    return;
  }
  const selectedPath = path.value.slice(0, index + 1);
  path.value = selectedPath;
  const folderName = selectedPath[selectedPath.length - 1].id;
  openFolder(folderName);
};

const onImportSharepoint = async () => {
  // Implement the import logic here
  if (selectedAllData.value.length === 0) {
    $q.notify({
      type: "negative",
      message: "No data selected for import.",
    });

    return false;
  }

  let dataToShared = {
    sites: selectedSites.value,
    data: selectedAllData.value,
  };

  console.log("Data to be shared:", dataToShared);
  loading.value = true;
  // $q.dialog({
  //   title: "Confirm Import",
  //   message: `Are you sure you want to import the selected data from SharePoint?`,
  //   cancel: true,
  // }).onOk(async () => {
  //   const getusers = await getUsers();

  //   let options = [];
  //   if (getusers) {
  //     options = getusers.map((user) => ({
  //       label: user.pud_first_name + " " + user.pud_last_name,
  //       value: user.username,
  //     }));
  //   }
  //   // options

  //   $q.dialog({
  //     component: multiplePromptDialog,
  //     componentProps: {
  //       title: "Select Username",
  //       initialFields: [
  //         {
  //           name: "username",
  //           label: "Select Username to be shared",
  //           type: "select",
  //           options: [{ label: "Public", value: "_ALL" }, ...options],
  //           multiple: true,
  //           default: [],
  //           rules: [(val) => !!val || "At least one username is required"],
  //         },
  //       ],
  //     },
  //   }).onOk(async (selectedusers) => {
  //     dataToShared.data.map(async (val) => {
  //       let recipients = selectedusers.username
  //         .filter((fil) => fil !== "_ALL")
  //         .map((username) => ({
  //           email: username,
  //         }));

  //       let scoped = "organization";
  //       if (selectedusers.username.includes("_ALL")) {
  //         scoped = "anonymous";
  //       }

  //       let link = null;
  //       if (scoped === "anonymous") {
  //         link = await sharePointService.createAnonymousLink(
  //           selectedSites.value.id,
  //           selectedDriveId.value,
  //           val.id
  //         );
  //       } else {
  //         link = await sharePointService.createOrganizationLink(
  //           selectedSites.value.id,
  //           selectedDriveId.value,
  //           val.id
  //         );
  //       }

  //       if (link) {
  //         console.log("Tautan untuk folder:", link);
  //       }

  //       // const datas = await postData(
  //       //   "post",
  //       //   {
  //       //     p_u_username: authStore.authDet.username,
  //       //     dfm_folder_name: val.ddm_doc_real_name ?? val.dfm_folder_name,
  //       //     dfm_parent_id: props.getLatestFolder ? props.getLatestFolder : null,
  //       //     dfm_root_mstr: props.root,
  //       //     from_sharepoint: true,
  //       //     sites: dataToShared.sites,
  //       //   },
  //       //   `dms/folders`,
  //       //   false,
  //       //   false,
  //       //   true
  //       // );

  //       // if (datas) {
  //       //   $q.notify({
  //       //     type: "positive",
  //       //     message: "Import successful!",
  //       //   });
  //       //   onDialogOK();
  //       // } else {
  //       //   $q.notify({
  //       //     type: "negative",
  //       //     message: "Import failed. Please try again.",
  //       //   });
  //       // }
  //     });
  //   });
  // });

  await Promise.all(
    dataToShared.data.map(async (val) => {
      // let recipients = selectedusers.username
      //   .filter((fil) => fil !== "_ALL")
      //   .map((username) => ({
      //     email: username,
      //   }));
      // let scoped = "organization";
      // if (selectedusers.username.includes("_ALL")) {
      //   scoped = "anonymous";
      // }
      // let link = null;
      // if (scoped === "anonymous") {
      //   link = await sharePointService.createAnonymousLink(
      //     selectedSites.value.id,
      //     selectedDriveId.value,
      //     val.id
      //   );
      // } else {
      //   link = await sharePointService.createOrganizationLink(
      //     selectedSites.value.id,
      //     selectedDriveId.value,
      //     val.id
      //   );
      // }
      // if (link) {
      //   console.log("Tautan untuk folder:", link);
      // }

      const datas = await postData(
        "post",
        {
          p_u_username: authStore.authDet.username,
          dfm_folder_name: val.ddm_doc_real_name ?? val.dfm_folder_name,
          dfm_parent_id: props.getLatestFolder ? props.getLatestFolder : null,
          dfm_root_mstr: props.root,
          from_sharepoint: true,
          sites: dataToShared.sites,
          url: val.url,
        },
        `dms/folders`,
        false,
        false,
        true
      );
      if (datas) {
        $q.notify({
          type: "positive",
          message: "Import successful!",
        });
        loading.value = false;
        onDialogOK();
      } else {
        $q.notify({
          type: "negative",
          message: "Import failed. Please try again.",
        });
        loading.value = false;
      }
    })
  );

  // const getLatestFolder = selectedPath.value[selectedPath.value.length - 1];
  //   const datas = await postData(
  //     "post",
  //     {
  //       p_u_username: store.authDet.username,
  //       dfm_folder_name: data,
  //       dfm_parent_id: getLatestFolder ? getLatestFolder : null,
  //       dfm_root_mstr: dudrm_source.value,
  //     },
  //     `dms/folders`,
  //     false,
  //     false,
  //     true
  //   );

  //   if (datas) {
  //     const getDatas = await getData();

  //     if (getDatas) {
  //       refreshCurrentPath();
  //     }
  //   }
};

const getUsers = async () => {
  try {
    const data = await postData(
      "get",
      null,
      "portal/users/ActiveOnly",
      false,
      false,
      true
    );

    if (data?.data) {
      return data.data;
    }
  } catch (error) {
    console.error("Error loading users:", error);
  }
};
</script>
