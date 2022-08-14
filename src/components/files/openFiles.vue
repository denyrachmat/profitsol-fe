<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="q-dialog-plugin full-height q-pa-lg">
      <div class="q-pb-md" style="height: 90%; overflow: auto">
        <div>
          <vue-pdf-embed
            :key="refreshed"
            v-if="getExt() === 'pdf'"
            :source="props.base64File"
            :style="`width: ${zoom * 10 + 100}%;`"
          />
          <div v-else>
            <span class="text-h4">Sorry, no viewer for this file :(</span>
          </div>
        </div>
      </div>
      <div class="row bg-white text-center q-pt-md" style="bottom: 0">
        <div class="col-5 text-right">
          <q-btn dense icon="zoom_out" @click="zoom = zoom - 10" />
        </div>
        <div class="col q-px-lg">
          <q-slider v-model="zoom" :min="0" :max="100" style="width: 50%" />
        </div>
        <div class="col-5">
          <div class="row">
            <div class="col text-left">
              <q-btn dense icon="zoom_in" @click="zoom = zoom + 10" />
            </div>
            <div class="col text-right">
              <q-btn
                label="Download"
                color="primary"
                @click="download()"
                icon="download"
              />
              <q-btn label="Close" flat color="red" @click="onOKClick()" />
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, defineAsyncComponent, computed, watch } from "vue";
import { useDialogPluginComponent, date } from "quasar";

import VuePdfEmbed from "vue-pdf-embed";

const zoom = ref(0);
const refreshed = ref(0);

const props = defineProps({
  base64File: String,
  title: String,
  // ...your custom props
});

watch(
  () => zoom.value,
  (val) => {
    refreshed.value = refreshed.value + 1;
  }
);

const getExt = () => {
  const exp = props.title.split(".");

  return exp[exp.length - 1];
};

const download = () => {
  const win = window.open();
  win.document.write(
    '<iframe src="' +
      props.base64File +
      '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
  );
};

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK();
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
