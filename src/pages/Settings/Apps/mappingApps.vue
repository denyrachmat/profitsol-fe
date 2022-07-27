<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card
      class="q-dialog-plugin q-pt-md"
      style="width: 700px; max-width: 80vw"
    >
      <q-card-section class="q-pt-none">
        <mappingAppsContent
          :dataProps="dataHasil.filter((fil) => !fil.am_app_parent)"
        />
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useDialogPluginComponent, date } from "quasar";
import draggable from "vuedraggable";
import mappingAppsContent from "./mappingAppsContent.vue";

const props = defineProps({
  dataProps: Object || null,
  // ...your custom props
});

const dataHasil = ref(null);
const myArray = ref([
  {
    name: "John",
    id: 0,
  },
  {
    name: "Joao",
    id: 1,
  },
  {
    name: "Jean",
    id: 2,
  },
]);
onMounted(() => {
  dataHasil.value = props.dataProps;
});

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

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
  onDialogOK(dataHasil);
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
