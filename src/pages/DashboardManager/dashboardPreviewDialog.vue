<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" maximized>
    <q-card class="column full-height">
      <q-card-section class="row items-center q-py-sm bg-grey-2">
        <div class="text-h6">Dashboard Preview</div>
        <q-space />
        <q-btn flat round icon="close" @click="onDialogCancel" />
      </q-card-section>
      <q-separator />
      <q-card-section class="col scroll">
        <dashboardView :code="code" embedded />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from "quasar";
import dashboardView from "./dashboardView.vue";

defineProps({
  code: { type: String, required: true },
});

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();
</script>
