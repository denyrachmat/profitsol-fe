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
        <div class="text-h6">Add database connection</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row q-pb-md">
          <div class="col">
            <q-input label="Connection Name" filled v-model="mdm_name" />
          </div>
        </div>
        <div class="row q-pb-md">
          <div class="col">
            <q-input label="Connection Host" filled v-model="mdm_host" />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-input
              label="Connection Username"
              filled
              v-model="mdm_username"
            />
          </div>
          <div class="col q-pl-md">
            <q-input
              label="Connection Password"
              filled
              v-model="mdm_password"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <div class="row full-width">
          <div class="col">
            <q-btn
              label="Test Connection"
              color="orange"
              @click="testConnection"
            />
          </div>
          <div class="col text-right">
            <q-btn flat label="Save" color="primary" @click="onClickSave" />
            <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
          </div>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref } from "vue";
import { useAuthStore } from "src/stores/authStore";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const store = useAuthStore();
const { postData } = apiRequest();

const p_u_username = ref(store.authDet.username);
const mdm_host = ref("");
const mdm_name = ref("");
const mdm_username = ref("");
const mdm_password = ref("");
const isLoading = ref(false);

const onClickSave = () => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure want to save this connection ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    isLoading.value = true;
    const data = await postData(
      "post",
      {
        p_u_username: p_u_username.value,
        mdm_host: mdm_host.value,
        mdm_name: mdm_name.value,
        mdm_username: mdm_username.value,
        mdm_password: mdm_password.value,
      },
      `mrs/dbconn`,
      false,
      false,
      true
    );

    if (data) {
      $q.notify({
        message: data.message,
        color: "green",
      });
      isLoading.value = false;
      clearForm();
    }
  });
};

const clearForm = () => {
  mdm_host.value = "";
  mdm_name.value = "";
  mdm_username.value = "";
  mdm_password.value = "";
};

const testConnection = async () => {
  isLoading.value = true;
  const data = await postData(
    "post",
    {
      host: mdm_host.value,
      username: mdm_username.value,
      password: mdm_password.value,
    },
    `mrs/checkConnection`,
    false,
    false,
    true
  );

  if (data.status !== 500) {
    console.log(data);
    $q.notify({
      message: data.message,
      color: "green",
    });
    isLoading.value = false;
  }
};
</script>
