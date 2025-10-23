<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <q-card-section class="q-pa-md">
        <div class="text-h6">Choose Category</div>
        <div class="text-subtitle2">Manage Category</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <q-select
              v-model="selectedTags"
              :options="availableTags"
              multiple
              label="Select Tags"
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn flat label="Submit" color="primary" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  idForm: String,
});

const onClickOK = () => {
  onDialogOK();
};
</script>
