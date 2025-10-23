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
        <div class="text-h6">Simulation Report</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-table
          :title="tableTitle"
          :rows="rows"
          :columns="columns"
          row-key="name"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Ok" color="primary" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, watch, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  tableTitle: String,
  rows: Array,
  columns: Array,
});
</script>
