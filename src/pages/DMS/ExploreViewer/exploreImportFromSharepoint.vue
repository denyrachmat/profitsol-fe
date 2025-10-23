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
              color="primary"
            />
            <q-btn
              :color="selectMode ? 'indigo' : 'grey'"
              :flat="!selectMode"
              no-caps
              icon="check_box"
              @click="selectMode = !selectMode"
            >
              <q-tooltip>Toggle Select Mode</q-tooltip>
            </q-btn>
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
                      v-for="(bread, index) in path"
                      :key="index"
                      :label="bread.label"
                      @click="onClickBreadcrumb(bread.id)"
                      class="cursor-pointer"
                    />
                  </q-breadcrumbs>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <exploreTilesView
                    :key="refresher"
                    :folders="folders"
                    :files="files"
                    :activateSelected="false"
                    :select-folder-only="true"
                    @onClick="
                      (value) => {
                        if (value.dfm_folder_name) {
                          openFolder(value.id);

                          path.push({
                            label: value.dfm_folder_name,
                            id: value.id,
                          });
                        } else {
                          openFilesDialog(value, value.downloadUrl);
                        }
                      }
                    "
                    @onRightClick="
                      (e, value) => {
                        openFolder(value.id);
                        if (value.dfm_folder_name) {
                          path.push({
                            label: value.dfm_folder_name,
                            id: value.id,
                          });
                        }
                      }
                    "
                    :activate-selected="selectMode"
                    @onSelectedFilesFolder="
                      (value) => (selectedAllData = value)
                    "
                  />
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
import exploreTilesView from "./exploreTilesView.vue";
import openFiles from "src/components/files/openFiles.vue";

const authStore = useAuthStore();

const { proxy } = getCurrentInstance();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const $q = useQuasar();
const { postData } = apiRequest();
const siteId = ref(null);
const driveId = ref(null);
const loading = ref(false);
const selectedDriveId = ref(null);
const selectedSites = ref([]);
const listSites = ref([]);
const folders = ref([]);
const files = ref([]);
const path = ref([]);
const selectedAllData = ref([]);
const refresher = ref(0);
const selectMode = ref(false);

onMounted(async () => {
  // Ensure logged in
  await authHelper.login(["Sites.ReadWrite.All"]);

  // Get SharePoint site info
  const siteInfo = await sharePointService.getSiteInfo();
  siteId.value = siteInfo.id;
  driveId.value = siteInfo.drive.id;
});

const filterFn = async (val, update, abort) => {
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
  // path.value = [{ name: "Root", id: "root" }]; // Reset path

  openFolder("root");
};

const onClickBreadcrumb = (id) => {
  if (id === 0) {
    path.value = [];
  } else {
    const index = path.value.findIndex((bread) => bread.id === id);
    if (index !== -1) {
      path.value = path.value.slice(0, index + 1);
    }
  }
  openFolder(id === 0 ? "root" : id);
};

const openFolder = async (folderName) => {
  console.log("cek", folderName);
  const getDrives = await sharePointService.getDrives(selectedSites.value.id);

  let driveID = getDrives[0].id; // Default to first drive
  selectedDriveId.value = driveID;

  folders.value = [];
  files.value = [];
  const getFolder = await sharePointService.getFolderContents(
    driveID,
    folderName
  );

  if (getFolder.length > 0) {
    getFolder.forEach((element) => {
      if (element.folder) {
        folders.value.push({
          type: "folder",
          id: element.id,
          dfm_folder_name: element.name,
          url: element.webUrl,
          created_at: element.createdDateTime,
        });
      } else {
        files.value.push({
          type: "files",
          id: element.id,
          ddm_doc_real_name: element.name,
          downloadUrl: element.webUrl,
          shared: element.shared || [],
          created_at: element.createdDateTime,
        });
      }
    });
  }

  refresher.value += 1; // Trigger reactivity
};

const openFilesDialog = async (files, url) => {
  const getFiles = await sharePointService.getFileFromSharePoint(
    files.id,
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
        title: files.ddm_doc_real_name,
        urlFile: url,
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
    data: selectedAllData.value.map((item) => {
      return (
        folders.value.find((f) => f.id === item) ||
        files.value.find((f) => f.id === item)
      );
    }),
  };

  $q.dialog({
    title: "Confirm Import",
    message: `Are you sure you want to import ${dataToShared.data.length} items from SharePoint?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    onDialogOK(dataToShared);
  });
};
</script>
