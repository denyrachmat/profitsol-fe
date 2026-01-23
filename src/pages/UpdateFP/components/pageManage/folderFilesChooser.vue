<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <exploreViewerIndex
        v-if="isLoaded"
        :choose-files-mode="true"
        :activate-select="true"
        :select-folder-only="folderOnly"
        :select-files-only="!folderOnly"
        :multiple-select="false"
        @onSelectedFilesFolder="(value) => onSubmitedData(value)"
        :selectedDataDetail="propsSelectedFolders"
      />
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

import indexFormsCreator from "src/pages/CMS/FormsCreator/indexFormsCreator.vue";
import uploadDocument from "src/pages/DMS/uploadDocument.vue";

import exploreViewerIndex from "src/pages/DMS/ExploreViewer/exploreViewerIndex.vue";

const { postData } = apiRequest();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  idForm: String,
  username: String,
  folderOnly: {
    type: Boolean,
    default: true,
  },
  propsSelectedFolders: {
    type: Array,
    default: () => [],
  },
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

const onSubmitedData = (val) => {
  console.log("Submitted Data: ", val);
  onDialogOK(val);
};

function openDialog() {
  dialogRef.value?.show();
}
</script>
