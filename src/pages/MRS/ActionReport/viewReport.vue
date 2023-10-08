<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <TableReport :idReport="props.idReport" :TableTitle="props.TableTitle" />
  </q-dialog>
</template>
<script setup>
import { ref } from "vue";
import { useAuthStore } from "src/stores/authStore";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

import TableReport from "../Tables/indexTableReport.vue";

const props = defineProps({
  idReport: String,
  TableTitle: String,
});

const $q = useQuasar();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>
