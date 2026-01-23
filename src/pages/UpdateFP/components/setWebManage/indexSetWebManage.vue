<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <q-card-section class="q-pa-md">
        <div class="text-h6">Frontpage Setup</div>
        <div class="text-subtitle2">Setting your frontpage here</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <recurse-web-opt :rowNavData="data" v-if="!loading" />
        <span v-else>Please wait, setup being populated</span>
      </q-card-section>

      <q-separator />
      <q-card-actions class="q-pa-md">
        <q-btn
          color="primary"
          label="Save Changes"
          @click="onClickSave"
          :loading="loading"
        />
        <q-btn
          color="secondary"
          label="Cancel"
          @click="onDialogCancel"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";

import recurseWebOpt from "./recurseWebOpt.vue";

const { postData } = apiRequest();
const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const props = defineProps({
  idForm: String,
});
const isLoaded = ref(false);
const loading = ref(false);
const data = ref([]);

onMounted(async () => {
  await getData();
  isLoaded.value = true;
});

const getData = async () => {
  try {
    loading.value = true;
    const response = await postData("get", null, `fpmanager/getMainConf`);
    if (response) {
      console.log("Data fetched successfully:", response);
      data.value = response.data;
      loading.value = false;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const onClickSave = async () => {
  try {
    console.log("Saving data:", data.value);
    $q.dialog({
      title: "Confirm Save",
      message: "Are you sure you want to save the changes?",
      cancel: true,
      persistent: true,
    })
      .onOk(async () => {
        loading.value = true;
        const response = await postData(
          "post",
          {
            data: data.value,
          },
          `fpmanager/saveMainConf`
        );
        if (response) {
          console.log("Changes saved successfully:", response);
          $q.notify({
            type: "positive",
            message: "Changes saved successfully!",
          });
          onDialogOK();
        }
      })
      .onDismiss(() => {
        loading.value = false;
      });
    // const response = await postData("put", data.value, `fpmanager/updateMainPage/${props.idForm}`);
    // if (response) {
    //   console.log("Changes saved successfully:", response);
    //   $q.notify({
    //     type: "positive",
    //     message: "Changes saved successfully!",
    //   });
    //   onDialogOK();
    // }
  } catch (error) {
    console.error("Error saving changes:", error);
    $q.notify({
      type: "negative",
      message: "Failed to save changes.",
    });
  }
};
</script>
