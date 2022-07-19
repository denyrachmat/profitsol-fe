<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card
      class="q-dialog-plugin q-pt-md"
      style="width: 700px; max-width: 80vw"
    >
      <q-card-section class="q-pt-none">
        <div class="row q-pb-sm">
          <div class="col">
            <q-input outlined label="Username" v-model="dataHasil.username" />
          </div>
        </div>
        <div class="row q-pb-sm">
          <div class="col">
            <q-input outlined label="Email" v-model="dataHasil.email" />
          </div>
        </div>
        <div class="row q-pb-sm">
          <div class="col q-pr-sm">
            <q-input
              outlined
              label="First Name"
              v-model="dataHasil.pud_first_name"
            />
          </div>
          <div class="col q-pl-sm">
            <q-input
              outlined
              label="Last Name"
              v-model="dataHasil.pud_last_name"
            />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-checkbox
              v-model="isVerified"
              label="Is Verified"
              checked-icon="task_alt"
              unchecked-icon="highlight_off"
              :color="isVerified ? 'green' : 'red'"
              keep-color
            />
          </div>
        </div>
      </q-card-section>

      <!-- buttons example -->
      <q-separator />
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn flat color="red" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useDialogPluginComponent, date } from "quasar";

const props = defineProps({
  dataProps: Object,
  // ...your custom props
});

const dataHasil = ref(null);
const isVerified = ref(false);

watch(isVerified, (val) => {
  if (val) {
    dataHasil.value.email_verified_at = date.formatDate(
      Date.now(),
      "YYYY-MM-DDTHH:mm:ss.SSSZ"
    );
  }
});

onMounted(() => {
  dataHasil.value = props.dataProps;
  isVerified.value = props.dataProps.email_verified_at ? true : false;
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
