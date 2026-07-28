<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-dialog ref="dialogRef">
    <div class="bg-white q-pa-md" style="min-width: 500px; min-height: 500px">
      <div class="row">
        <div class="col-10 q-pa-sm">
          <div class="text-h6">{{ props.title }}</div>
        </div>
        <div
          class="col-2 q-pa-sm text-right"
          v-if="props.isDownloadTemplate && props.isDownloadTemplate.enabled"
        >
          <q-btn
            dense
            icon="download"
            color="green"
            @click="onClickDownloadTemplate(props.isDownloadTemplate.url)"
          >
            <q-tooltip>Download Template</q-tooltip>
          </q-btn>
        </div>
      </div>
      <div class="row" v-if="props.options && props.options.length > 0">
        <div
          v-for="(optionGroup, groupIndex) in props.options"
          :key="groupIndex"
          class="col-12 q-pa-sm"
        >
          <div class="text-subtitle1 q-mb-sm" v-if="optionGroup.label">
            {{ optionGroup.label }}
          </div>
          <div v-if="optionGroup.type === 'radio-group'">
            <q-radio
              v-for="(choice, choiceIndex) in optionGroup.choices"
              :key="choiceIndex"
              v-model="dynamicOptionValues[optionGroup.name]"
              :val="choice.value"
              :label="choice.label"
              class="q-mb-sm"
            />
          </div>
          <!-- ponytail: Add other input types (checkbox, text, etc.) here when needed. -->
          <!-- skipped: other input types, add when specific requirements arise. -->
        </div>
      </div>
      <div class="row full-height">
        <div class="col full-height">
          <q-uploader
            class="full-width"
            style="min-height: 500px"
            label="Drag and drop files here or click + to select files"
            :accept="!props.accept ? '.jpg, image/*' : props.accept"
            :multiple="props.multiple"
            @added="onFilesAdded"
          />
        </div>
      </div>
      <div class="row q-pa-sm">
        <div class="col text-right">
          <q-btn-group spread>
            <q-btn color="red" label="Cancel" v-close-popup />
            <q-btn
              label="Ok"
              color="primary"
              @click="onOKClick()"
              :disable="disabledButton"
            />
          </q-btn-group>
        </div>
      </div>
    </div>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref, computed } from "vue";
import { useDialogPluginComponent } from "quasar";

const isUploading = ref(false);
const dynamicOptionValues = ref({});

const onUploaded = () => {
  isUploading.value = false;
};

const props = defineProps({
  title: String,
  accept: String,
  multiple: Boolean,
  options: {
    type: Array,
    default: () => [],
  },
  isDownloadTemplate: {
    type: Object,
    default: () => ({
      enabled: false,
      url: "",
    }),
  },
  isBase64: {
    type: Boolean,
    default: true,
  },
});

onMounted(() => {
  // Initialize dynamicOptionValues with default values from props.options
  props.options.forEach((optionGroup) => {
    if (optionGroup.type === "radio-group" && optionGroup.choices.length > 0) {
      dynamicOptionValues.value[optionGroup.name] =
        optionGroup.choices[0].value;
    }
  });
});

// REQUIRED; must be called inside of setup()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*.../* }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome
const result = ref([]);
const resultFileName = ref([]);

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file as base64."));
    reader.readAsDataURL(file);
  });

const storeSelectedFiles = async (files) => {
  const selectedFiles = Array.isArray(files) ? files : [files];

  const processedFiles = props.isBase64
    ? await Promise.all(selectedFiles.map((file) => readFileAsDataURL(file)))
    : selectedFiles;

  if (props.multiple) {
    result.value = [...result.value, ...processedFiles];
    resultFileName.value = [
      ...resultFileName.value,
      ...selectedFiles.map((file) => file.name),
    ];
  } else {
    result.value = processedFiles;
    resultFileName.value = selectedFiles.map((file) => file.name);
  }

  return props.multiple ? processedFiles : processedFiles[0];
};

const onFilesAdded = async (files) => {
  isUploading.value = true;

  try {
    await storeSelectedFiles(files);
  } finally {
    isUploading.value = false;
  }
};

const onOKClick = () => {
  console.log("Result:", result.value);
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK({
    dynamicOptions: dynamicOptionValues.value,
    result: props.multiple ? result.value : result.value[0],
    fileName: props.multiple ? resultFileName.value : resultFileName.value[0],
  });
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
};

const disabledButton = computed(() => {
  // Check if any required dynamic option is empty
  let emptyRequiredOption = false;
  if (props.options && props.options.length > 0) {
    for (const optionGroup of props.options) {
      if (optionGroup.required) {
        const value = dynamicOptionValues.value[optionGroup.name];
        if (value === undefined || value === null || value === "") {
          emptyRequiredOption = true; // Disable button because a required option is not selected
        }
      }
    }
  }

  console.log("Disabled Button Check:", {
    resultLength: result.value.length,
    isUploading: isUploading.value,
    emptyRequiredOption,
  });
  // Also disable if no file has been uploaded or if upload is in progress
  return result.value.length === 0 || emptyRequiredOption;
});

const onClickDownloadTemplate = (url) => {
  if (!url) {
    console.error("Download template URL is not provided.");
    return;
  }
  // Create a temporary anchor element to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank"; // Open in a new tab/window
  link.download = ""; // Let the server suggest the filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
