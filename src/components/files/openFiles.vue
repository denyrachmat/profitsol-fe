<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="q-dialog-plugin">
      <VuePdfEmbed v-if="getExt === 'pdf'" />
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, defineAsyncComponent, computed } from "vue";
import { useDialogPluginComponent, date } from "quasar";

import VuePdfEmbed from "vue-pdf-embed";

const props = defineProps({
  base64File: String,
  title: String,
  // ...your custom props
});

const getExt = () => {
  const exp = props.title.split(".");

  return exp[exp.length - 1];
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
