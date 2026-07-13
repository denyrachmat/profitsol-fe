<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" style="min-width: 700px">
    <q-card class="q-dialog-plugin" style="min-width: 700px">
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">{{ props.title || "Upload File" }}</div>
          </div>

          <div class="col text-right" v-if="props.downloadTemplate">
            <q-btn
              label="Download Template"
              icon="download"
              color="green"
              @click="onDownloadTemplate"
            ></q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-uploader
          class="full-width"
          :factory="factoryFn"
          :accept="props.accept || '.jpg, image/*'"
          :multiple="props.multiple"
          @uploaded="onUploaded"
          :loading="isUploading"
          hide-upload-btn
          ref="uploaderRef"
          style="min-height: 200px"
        >
          <template>
            <div class="full-width full-height column flex-center">
              <q-icon name="cloud_upload" size="xl" color="grey-6" />
              <div class="text-h6 text-grey-6 q-mt-sm">
                Drop files here or click +
              </div>
            </div>
          </template>
        </q-uploader>
      </q-card-section>

      <q-card-section v-if="props.options && props.options.length > 0">
        <div
          v-for="(optionGroup, groupIndex) in props.options"
          :key="groupIndex"
        >
          <div class="text-subtitle1 q-mb-sm" v-if="optionGroup.label">
            {{ optionGroup.label }}
          </div>
          <div v-if="optionGroup.type === 'radio-group'">
            <q-radio
              v-for="(choice, choiceIndex) in optionGroup.choices"
              :key="choiceIndex"
              v-model="radioValues[optionGroup.name]"
              :val="choice.value"
              :label="choice.label"
              class="q-mb-sm"
            />
          </div>
          <!-- ponytail: Add other input types (checkbox, text, etc.) here when needed. -->
          <!-- skipped: other input types, add when specific requirements arise. -->
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="red" label="Cancel" @click="onDialogCancel" />
        <q-btn
          label="Ok"
          color="primary"
          @click="onOKClick()"
          :disable="!canProceed"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, computed, reactive } from "vue";
import { useDialogPluginComponent } from "quasar";

const isUploading = ref(false);
const result = ref([]);
const resultFileName = ref([]);

// Use reactive object instead of ref for better reactivity with dynamic properties
const radioValues = reactive({});

const props = defineProps({
  title: String,
  accept: String,
  multiple: Boolean,
  options: Array, // New prop for custom form elements
  downloadTemplate: {
    type: Boolean,
    default: false,
  },
  onDownloadTemplate: {
    type: Function,
    default: null,
  },
});

// REQUIRED; must be called inside of setup()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

// Initialize radioValues synchronously from props.options
if (props.options) {
  props.options.forEach((optionGroup) => {
    if (optionGroup.name) {
      radioValues[optionGroup.name] =
        optionGroup.value !== undefined ? optionGroup.value : null;
    }
  });
}

function factoryFn(files) {
  isUploading.value = true;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (readerEvt) {
      const base64String = readerEvt.target.result;
      result.value = props.multiple
        ? [...result.value, base64String]
        : [base64String];
      resultFileName.value = props.multiple
        ? [...resultFileName.value, files[0].name]
        : [files[0].name];
      isUploading.value = false;
      resolve({
        url: "http://localhost:4444/upload", // Placeholder URL, q-uploader expects one
        data: {
          base64: base64String,
          filename: files[0].name,
        },
      });
    };
    reader.onerror = function (error) {
      isUploading.value = false;
      reject(`Error: ${error}`);
    };
    reader.readAsDataURL(files[0]);
  });
}

const onUploaded = () => {
  // isUploading.value is already set to false in factoryFn's resolve/reject
  // This handler can be used for additional post-upload logic if needed.
};

const canProceed = computed(() => {
  // Check if all required dynamic options are selected
  if (props.options) {
    for (const optionGroup of props.options) {
      if (optionGroup.required && !radioValues[optionGroup.name]) {
        return false; // A required option is missing
      }
    }
  }
  // No file requirement; OK button is enabled as long as required options are filled
  return true;
});

const onDownloadTemplate = () => {
  if (props.onDownloadTemplate) {
    props.onDownloadTemplate();
  }
};

const onOKClick = () => {
  if (canProceed.value) {
    onDialogOK({
      result: props.multiple ? result.value : result.value[0],
      fileName: props.multiple ? resultFileName.value : resultFileName.value[0],
      dynamicOptions: { ...radioValues }, // Pass a copy of the reactive object
    });
  }
};
</script>
