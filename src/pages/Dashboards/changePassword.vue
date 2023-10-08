<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="q-dialog-plugin bg-white">
      <q-card-section>
        <div class="row">
          <div class="col">
            <q-input
              label="Current Password"
              type="password"
              v-model="current_password"
            />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <q-input label="New Password" type="password" v-model="password" />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <q-input
              label="Confirm New Password"
              type="password"
              v-model="password_confirmation"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          color="primary"
          label="OK"
          @click="onOKClick"
          :disable="!current_password || !password || !password_confirmation"
        />
        <q-btn color="primary" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { postData } = apiRequest();

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
async function onOKClick() {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure want to change your password ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const datas = await postData(
      "post",
      {
        old_password: current_password.value,
        new_password: password.value,
        confirm_password: password_confirmation.value,
      },
      `portal/change-password`,
      false,
      false,
      true
    );

    if (datas && datas.status) {
      $q.notify({
        color: "success",
        message: `Reset link has sent to your email !!`,
      });
      onDialogOK();
    }
  });
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
