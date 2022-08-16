<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="q-dialog-plugin">
      <q-bar>
        {{ title }}
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>
      <div>
        <iframe
          v-if="dataProps.includes('http')"
          :src="dataProps"
          class="full-width window-height"
        ></iframe>
        <component :is="dyne" v-else />

        <GoogleSignInButton
          @success="handleLoginSuccess"
          @error="handleLoginError"
        ></GoogleSignInButton>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, defineAsyncComponent, computed } from "vue";
import { useDialogPluginComponent, date } from "quasar";
import { useRouter } from "vue-router";

import { GoogleSignInButton } from "vue3-google-signin";

import DMSUploadDocument from "../DMS/uploadDocument.vue";

const router = useRouter();
const props = defineProps({
  dataProps: String,
  title: String,
  // ...your custom props
});

const url = ref("");

onMounted(async () => {
  url.value = props.dataProps;
});

const dyne = computed(() => {
  const urlCompile = "../" + url.value + ".vue";
  return defineAsyncComponent(() => import("../" + url.value + ".vue"));
});

const handleLoginSuccess = () => {
  const { credential } = response;
  console.log("Access Token", credential);
};
// handle an error event
const handleLoginError = () => {
  console.error("Login failed");
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
  onDialogOK(dataHasil);
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
