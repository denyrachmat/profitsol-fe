<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="q-dialog-plugin full-height q-pa-lg">
      <div class="q-pb-md" style="height: 90%; overflow: auto">
        <div>
          <div>
            <div class="text-center" v-if="isLoading">
              <q-spinner size="50px" class="q-mt-xl" />
              <div class="text-h6 q-mt-md">
                Populating your files, please wait...
              </div>
            </div>
            <iframe
              :src="officeViewerUrl"
              width="100%"
              frameborder="0"
              style="border: 0; height: 80vh"
              v-else
            ></iframe>

            <!-- <span class="text-h4">Sorry, no viewer for this file :(</span> -->
          </div>
        </div>
      </div>
      <div class="row bg-white q-pt-md" style="bottom: 0">
        <div class="col-2">
          <q-btn
            label="Open on Sharepoint"
            color="blue-5"
            icon="open_in_new"
            @click="onOpenSharepoint()"
            :disable="
              Object.values(store.msLoginDet).length === 0 ||
              store.msLoginDet.username !== store.authDet.username
            "
          />
        </div>
        <div class="col-3">
          <div class="row">
            <div class="col text-right">
              <q-btn dense icon="zoom_out" @click="zoom = zoom - 10" />
            </div>
          </div>
        </div>
        <div class="col q-px-lg">
          <q-slider v-model="zoom" :min="0" :max="100" style="width: 50%" />
        </div>
        <div class="col-5">
          <div class="row">
            <div class="col text-left">
              <q-btn dense icon="zoom_in" @click="zoom = zoom + 10" />
            </div>
            <div class="col text-right">
              <q-btn
                label="Download"
                color="primary"
                @click="download()"
                icon="download"
              />
              <q-btn label="Close" flat color="red" @click="onOKClick()" />
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, defineAsyncComponent, computed, watch } from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";
import { useAuthStore } from "src/stores/authStore";
import apiRequest from "../apiRequest";
import { authHelper, sharePointService } from "@/components/msHelpers";

import { GoogleSignInButton } from "vue3-google-signin";

import VuePdfEmbed from "vue-pdf-embed";

const zoom = ref(0);
const refreshed = ref(0);
const openWebFiles = ref("");
const isLoading = ref(false);
const officeViewerUrl = ref("");
const store = useAuthStore();
const { postData } = apiRequest();

const $q = useQuasar();

const props = defineProps({
  base64File: String,
  ext: String,
  mime: String,
  title: String,
  urlFile: String,
  selectedSites: Object,
  isSharepoint: Boolean,
  ids: String,
  // ...your custom props
});

onMounted(() => {
  if (props.isSharepoint) {
    getOfficeViewerUrl();
  } else {
    console.log(props.urlFile, props.title, props.mime);
    openUsingSharepoint(props.urlFile, props.title, props.mime);
  }
});

const openUsingSharepoint = async (urlFile, title, mime) => {
  isLoading.value = true;
  const fileNya = await urltoFile(props.base64File, title, mime);

  let driveItems;
  try {
    driveItems = await sharePointService.uploadToTempAndOpen(fileNya, title);
  } catch (error) {
    // If no active account or upload fails, show dialog for direct download
    $q.dialog({
      title: "No Active Account",
      message:
        "Unable to preview file through SharePoint. Would you like to download the file directly?",
      cancel: true,
      persistent: true,
    })
      .onOk(() => {
        // Direct download
        const link = document.createElement("a");
        link.href = props.base64File;
        link.download = title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .onCancel(() => {
        isLoading.value = false;
      });
    return;
  }

  if (driveItems) {
    console.log(driveItems);
    // Use the proper Office Online viewer URL format
    // Check if driveItems has the expected preview URL structure
    if (driveItems.getUrl) {
      // For SharePoint files, construct the Office Online viewer URL
      officeViewerUrl.value = driveItems.getUrl;
    } else if (driveItems.previewUrl) {
      officeViewerUrl.value = driveItems.previewUrl.includes("?")
        ? driveItems.previewUrl + "&action=embedview&wdStartOn=1"
        : driveItems.previewUrl + "?action=embedview&wdStartOn=1";
    } else {
      console.error("No preview URL available for this item");
    }
    isLoading.value = false;
  } else {
    isLoading.value = false;
    $q.notify({
      color: "negative",
      message: "Failed to retrieve drives",
      icon: "error",
    });
  }
};

const urltoFile = async (url, filename, mime) => {
  const getRealFileName = filename;

  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new File([buf], getRealFileName, { type: mime });
};

watch(
  () => zoom.value,
  (val) => {
    refreshed.value = refreshed.value + 1;
  }
);

const getExt = () => {
  const exp = props.title.split(".");

  return exp[exp.length - 1];
};

const download = async () => {
  let files;
  if (!props.isSharepoint) {
    files = props.base64File;

    const win = window.open();
    win.document.write(
      '<iframe src="' +
        files +
        '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
    );
  } else {
    files = officeViewerUrl.value;

    const getDrives = await sharePointService.getDrives(props.selectedSites.id);

    if (getDrives) {
      const driveItems = await sharePointService.getFileFromSharePoint(
        props.ids,
        getDrives[0].id,
        "content"
      );

      if (driveItems) {
        const win = window.open();
        win.document.write(
          '<iframe src="' +
            driveItems.base64File +
            "#" +
            driveItems.fileName +
            '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
        );
      } else {
        $q.notify({
          color: "negative",
          message: "Failed to retrieve drives",
          icon: "error",
        });
      }
    }
  }
};

const onOpenSharepoint = async () => {
  // const getRootSharePoint = await getSitesSharePoint();

  if (props.selectedSites) {
    const filename = "forOpenFiles" + "." + props.ext;
    const files = await urltoFile(props.base64File, filename, props.mime);

    if (files) {
      // console.log(files);
      const getDataUpload = await uploadFileToSharepointToRead(
        props.selectedSites.webUrl,
        filename,
        files
      );
      if (getDataUpload) {
        window.open(getDataUpload);
      }
    }
  }
};

const uploadFileToSharepointToRead = async (rootUrl, fileName, files) => {
  const formData = new FormData();
  formData.append("file", files[0]);
  const data = await postData(
    "put",
    files,
    null,
    true,
    false,
    false,
    process.env.GRAPH_API + `me/drive/root:/Graph API/${fileName}:/content`,
    true
  );

  if (data) {
    const urlOpen = `${rootUrl}/Graph API/${fileName}?web=1`;
    return urlOpen;
  }
};

// New function to handle the core logic
const getOfficeViewerUrl = async () => {
  isLoading.value = true;
  let finalUrl = "";

  const getDrives = await sharePointService.getDrives(props.selectedSites.id);

  if (getDrives) {
    const driveItems = await sharePointService.getFileFromSharePoint(
      props.ids,
      getDrives[0].id,
      "preview"
    );

    if (driveItems) {
      finalUrl = driveItems.getUrl;
    } else {
      $q.notify({
        color: "negative",
        message: "Failed to retrieve drives",
        icon: "error",
      });
    }
  }

  officeViewerUrl.value = finalUrl;
  isLoading.value = false;
};

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK();
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
