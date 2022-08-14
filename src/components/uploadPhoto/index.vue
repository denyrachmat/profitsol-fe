<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-dialog ref="dialogRef">
    <div class="bg-white" style="min-width: 500px; min-height: 500px">
      <div class="row full-height">
        <div class="col full-height">
          <q-uploader
            class="full-width"
            style="min-height: 500px"
            :factory="factoryFn"
            :label="title"
            :accept="!accept ? '.jpg, image/*' : accept"
            auto-upload
            :multiple="multiple"
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
              :disable="!result"
            />
          </q-btn-group>
        </div>
      </div>
    </div>
  </q-dialog>
</template>
<script setup>
import { defineComponent, onMounted, ref } from "vue";
import { useDialogPluginComponent } from "quasar";

const props = defineProps({
  title: String,
  accept: String,
  multiple: Boolean,
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

function factoryFn(val) {
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
  reader.onload = function () {
    hasil = reader.result;
    result.value = [...result.value, reader.result];
  };
  reader.onerror = function (error) {
    return `Error: ${error}`;
  };

  return reader;
};

const onOKClick = () => {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK({
    result: props.multiple ? result.value : result.value[0],
  });
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
};
</script>
