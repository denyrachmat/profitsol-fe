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
          <vue-pdf-embed
            :key="refreshed"
            v-if="getExt() === 'pdf'"
            :source="props.base64File"
            :style="`width: ${zoom * 10 + 100}%;`"
          />
          <img
            :src="props.base64File"
            :style="`width: ${zoom * 10 + 100}%;`"
            v-else-if="
              getExt() === 'png' ||
              getExt() === 'jpg' ||
              getExt() === 'jpeg' ||
              getExt() === 'gif'
            "
          />
          <div v-else>
            <span class="text-h4">Sorry, no viewer for this file :(</span>
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
import { useDialogPluginComponent, date } from "quasar";
import { useAuthStore } from "src/stores/authStore";
import apiRequest from "../apiRequest";

import { GoogleSignInButton } from "vue3-google-signin";

import VuePdfEmbed from "vue-pdf-embed";

const zoom = ref(0);
const refreshed = ref(0);
const openWebFiles = ref("");
const store = useAuthStore();
const { postData } = apiRequest();

const props = defineProps({
  base64File: String,
  ext: String,
  mime: String,
  title: String,
  // ...your custom props
});

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

const getSitesSharePoint = async () => {
  const data = await postData(
    "get",
    null,
    null,
    false,
    false,
    false,
    process.env.GRAPH_API + `me/drive`,
    true
  );

  if (data) {
    // openWebFiles.value = data.webUrl;

    return data.webUrl;
  }
};

const download = () => {
  const win = window.open();
  win.document.write(
    '<iframe src="' +
      props.base64File +
      '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
  );
};

const onOpenSharepoint = async () => {
  const getRootSharePoint = await getSitesSharePoint();

  if (getRootSharePoint) {
    const filename = "forOpenFiles" + "." + props.ext;
    const files = await urltoFile(props.base64File, filename, props.mime);

    if (files) {
      // console.log(files);
      const getDataUpload = await uploadFileToSharepointToRead(
        getRootSharePoint,
        filename,
        files
      );
      if (getDataUpload) {
        window.open(getDataUpload);
      }
    }
  }
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
