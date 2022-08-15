<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="q-dialog-plugin bg-white q-pa-md">
      <div class="row">
        <div class="col">
          <q-input label="Current Password" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          <q-input label="New Password" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          <q-input label="COnfirm New Password" />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const $q = useQuasar();

const props = defineProps({
  title: String,
});

const current_password = ref("");
const password = ref("");
const password_confirmation = ref("");

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
