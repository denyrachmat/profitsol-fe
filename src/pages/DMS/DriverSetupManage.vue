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
        <div class="text-h6">Manage DMS Root</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col-12 col-md-4 q-pa-sm">
            <q-input
              label="Root Name"
              filled
              v-model="formnya.ddrm_name"
              dense
            />
          </div>
          <div class="col-12 col-md-8 q-pa-sm">
            <q-input
              label="Root Desc"
              filled
              v-model="formnya.ddrm_desc"
              dense
            />
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-md-6 q-pa-sm">
            <q-select
              filled
              v-model="formnya.ddrm_driver"
              :options="['local', 'ftp', 'sftp']"
              label="Filled"
              dense
            />
          </div>
          <div class="col-12 col-md-6 q-pa-sm">
            <q-input
              label="Root Folder"
              filled
              v-model="formnya.ddrm_root"
              dense
            />
          </div>
        </div>

        <template v-if="formnya.ddrm_driver && formnya.ddrm_driver !== 'local'">
          <q-separator spaced />
          <div class="row">
            <div class="col-12 col-md-6 q-pa-sm">
              <q-input label="Host" filled v-model="formnya.ddrm_host" dense />
            </div>
          </div>
          <div class="row">
            <div class="col-12 q-pa-sm">
              <q-input
                label="Username"
                filled
                v-model="formnya.ddrm_username"
                dense
              />
            </div>
            <div class="col-12 col-md-6 q-pa-sm">
              <q-input
                label="Password"
                filled
                v-model="formnya.ddrm_password"
                dense
                type="password"
              />
            </div>
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="OK"
          color="primary"
          @click="onOKClick()"
          :loading="loading"
        />
        <q-btn
          flat
          label="Cancel"
          color="red"
          @click="onDialogCancel"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  dataEdit: Object,
});

const formnya = ref({
  ddrm_name: "",
  ddrm_driver: "",
  ddrm_root: "",
  ddrm_desc: "",
  ddrm_host: "",
  ddrm_username: "",
  ddrm_password: "",
  ddrm_url: "",
});
const loading = ref(false);

const onOKClick = () => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to save this Root?`,
    cancel: true,
  }).onOk(async () => {
    loading.value = true;
    const data = await postData(
      "post",
      formnya.value,
      `dms/documentsRoot`,
      false,
      false,
      true
    );

    if (data) {
      loading.value = false;
      onDialogOK();
    }
  });
};
</script>
