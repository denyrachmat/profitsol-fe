<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <!-- <indexFormsCreator
        mode="2"
        :data-forms="dataForms"
        v-if="isLoaded"
        @save="onDialogOK()"
      /> -->
      <CMSPageCreator
        v-if="isLoaded"
        :mode="idForm ? 'edit' : 'new'"
        :page-id="idForm || null"
        :data-page="dataForms"
        @save="onDialogOK()"
      />
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

import indexFormsCreator from "src/pages/CMS/FormsCreator/indexFormsCreator.vue";

import CMSPageCreator from "./CMSPageCreator.vue";

const { postData } = apiRequest();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  idForm: [String, Number],
});

const isLoaded = ref(false);

onMounted(async () => {
  if (props.idForm) {
    await getData();
    isLoaded.value = true;
  } else {
    console.error("idForm is not provided");
    isLoaded.value = true;
  }
});

const dataForms = ref([]);

const getData = async () => {
  try {
    const response = await postData(
      "get",
      null,
      `cms/viewByID/${props.idForm}`
    );
    if (response) {
      console.log("Data fetched successfully:", response);
      dataForms.value = response.data.value;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

function openDialog() {
  dialogRef.value?.show();
}
</script>
