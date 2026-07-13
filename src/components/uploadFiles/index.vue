<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-dialog ref="dialogRef">
    <div class="bg-white" style="min-width: 500px; min-height: 500px">
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
            :factory="factoryFn"
            :label="props.title"
            :accept="!props.accept ? '.jpg, image/*' : props.accept"
            auto-upload
            :multiple="props.multiple"
            @uploaded="onUploaded"
            :loading="isUploading"
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
import { defineComponent, onMounted, ref, computed } from "vue";
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

function factoryFn(val) {
  isUploading.value = true;
  // result.value = convertBase64(val).result;
  // console.log(convertBase64(val));
  // console.log(val);
  return convertBase64(val).result;
  return new Promise((resolve) => {
    // simulating a delay of 2 seconds
    setTimeout(() => {
      resolve({
        url: "http://localhost:4444/upload",
        data: convertBase64(val).result,
      });
    }, 2000);
  });
}

const convertBase64 = (filenya, callback) => {
  const reader = new FileReader();
  var hasil = "";

  // if (multiple.value) {
  //   reader.readAsDataURL(filenya);
  // } else {
  //   reader.readAsDataURL(filenya[0]);
  // }

  reader.readAsDataURL(filenya[0]);
  reader.onload = function (readerEvt) {
    hasil = reader.result;
    result.value = [...result.value, reader.result];
    resultFileName.value = [...resultFileName.value, filenya[0].name];
  };
  reader.onerror = function (error) {
    return `Error: ${error}`;
  };

  return reader;
};

const onOKClick = () => {
  console.log("Result:", result.value);
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK({
    result: props.multiple ? result.value : result.value[0],
    fileName: props.multiple ? resultFileName.value : resultFileName.value[0],
  });
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
};

const disabledButton = computed(() => {
  // Check if any required dynamic option is empty
  if (props.options && props.options.length > 0) {
    for (const optionGroup of props.options) {
      if (optionGroup.required) {
        const value = dynamicOptionValues.value[optionGroup.name];
        if (value === undefined || value === null || value === "") {
          return true; // Disable button because a required option is not selected
        }
      }
    }
  }
  // Also disable if no file has been uploaded or if upload is in progress
  return result.value.length === 0 || isUploading.value;
});
</script>
