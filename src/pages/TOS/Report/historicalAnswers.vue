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
        <div class="text-h6">History Answer of users</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-list bordered class="rounded-borders">
          <q-expansion-item
            expand-separator
            :icon="data.is_pass ? 'done_all' : 'cancel'"
            :header-class="
              data.is_pass ? 'text-white bg-green' : 'text-white bg-red'
            "
            :label="`Time Answers on : ${data.times}`"
            :caption="`Batch ID : ${data.batch}`"
            v-for="(data, idx) in props.datas"
            :key="idx"
          >
            <q-expansion-item
              :header-inset-level="1"
              expand-separator
              icon="receipt"
              :label="childData"
              default-opened
              :key="idx + idx2 + 'child'"
              v-for="(childData, idx2) in getFailedData(data.data)"
            >
            </q-expansion-item>
            <q-card>
              <q-card-section>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Quidem, eius reprehenderit eos corrupti commodi magni quaerat ex
                numquam, dolorum officiis modi facere maiores architecto
                suscipit iste eveniet doloribus ullam aliquid.
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onOKClick()" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const props = defineProps({
  datas: Array,
});

const getFailedData = (dataChild) => {
  return dataChild.filter((fil, keys) => !fil.status);
};

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
  onDialogOK();
}
</script>
