<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Upload Question Bank</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-file
          v-model="selectedFile"
          label="Pick a file"
          filled
          counter
          clearable
          class="q-mb-md"
          accept=".csv,.txt,.json,.xlsx,.docx"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

        <div class="q-mt-md">
          <div class="text-subtitle1 q-mb-sm">Choose Upload Method:</div>
          <q-radio v-model="uploadMethod" val="template" label="Upload using template" class="q-mb-sm" />
          <q-radio v-model="uploadMethod" val="ai" label="Use AI to scan question bank" />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="red" label="Cancel" @click="onDialogCancel" />
        <q-btn
          label="Upload"
          color="primary"
          @click="onOKClick()"
          :disable="!selectedFile || !uploadMethod"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref } from "vue";
import { useDialogPluginComponent } from "quasar";

const selectedFile = ref(null);
const uploadMethod = ref(null); // Will be 'template' or 'ai'

// REQUIRED; must be called inside of setup()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const onOKClick = () => {
  if (selectedFile.value && uploadMethod.value) {
    onDialogOK({
      file: selectedFile.value,
      method: uploadMethod.value,
    });
  }
};
</script>
