<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <showQuizResult
      :resShow="props.resShow"
      :answerShow="props.answerShow"
      :dataQuiz="props.dataQuiz"
      :idQuiz="props.idQuiz"
      @on-dialog-ok="onOKClick"
      :is-retry="onRetryClick"
      @on-submited="emit('onClose')"
    />
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import componentViewVue from "../componentView.vue";
import showQuizResult from "./showQuizResult.vue";

import { useFormStore } from "stores/formStore";

const emit = defineEmits(["onRetry", "onClose"]);

const store = useFormStore();
const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  resShow: Boolean,
  answerShow: Boolean,
  dataQuiz: Array,
  idQuiz: Number,
  isRetry: {
    type: Boolean,
    default: false,
  },
});

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

function onOKClick() {
  store.restoreDefault();
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK();
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}

const onRetryClick = () => {
  emit("onRetry");
};
</script>
