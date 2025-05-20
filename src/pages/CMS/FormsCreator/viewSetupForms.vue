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
        <div class="text-h6">Setup Forms</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <!-- Preview -->
        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 20vh;
            overflow: auto;
          "
        >
          <legend>Setup Forms Behaviour</legend>
          <div class="row">
            <div class="col">
              <div class="text-bold">
                Wizard Mode ? (It will separate page for each rows)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isWizard"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isWizard"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
          </div>
        </fieldset>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onSubmit" color="primary" label="Submit" />
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const props = defineProps({
  setupTrainingSetup: Object,
});

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

onMounted(() => {
  if (props.setupTrainingSetup) {
    console.log(props.setupTrainingSetup);
    formsSetup.value = props.setupTrainingSetup;
  }
});

const formsSetup = ref({
  isWizard: true,
});

const onSubmit = () => {
  // Emit the formsSetup data to the parent component
  // Close the dialog
  onDialogOK(formsSetup.value);
};
</script>
