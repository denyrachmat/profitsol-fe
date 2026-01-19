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
        <div class="text-h6">
          {{ props.isPreview ? "Preview Content" : "Form Content" }}
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md" style="min-height: 40vh">
        <showComponentVue
          :data="props.data"
          v-if="props.mode === 'form'"
          :setup="props.setup"
          :id="props.id"
          :showFormOnly="isShowFormOnlyValue"
          :preventClear="props.preventClear"
          :batchID="props.answersKey"
        />
        <showQuizComponentVue
          :id="props.id"
          :data="props.data"
          :setup="props.setup"
          :idDet="props.idDet"
          v-else
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

import showComponentVue from "./showComponent.vue";
import showQuizComponentVue from "./showQuizComponent.vue";
import { useFormStore } from "stores/formStore";

const store = useFormStore();
const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  id: String,
  idDet: Array,
  data: Array,
  setup: Object,
  mode: String,
  showFormOnly: Boolean,
  preventClear: {
    type: Boolean,
    default: false,
  },
  answersKey: {
    type: String,
    default: "",
  },
  isPreview: {
    type: Boolean,
    default: true,
  },
});

const isShowFormOnlyValue = ref(true);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

onMounted(async () => {
  console.log("props", props);

  if (props.setup && props.setup.isHistory) {
    if (props.setup.isHistory == 1) {
      isShowFormOnlyValue.value = false;
    } else {
      isShowFormOnlyValue.value = true;
    }
  } else {
    isShowFormOnlyValue.value = true;
  }

  isShowFormOnlyValue.value = props.showFormOnly;

  console.log("isShowFormOnlyValue", isShowFormOnlyValue.value);
});

function onOKClick() {
  // store.restoreDefault();
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK();
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
