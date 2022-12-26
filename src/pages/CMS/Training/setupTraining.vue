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
        <div class="text-h6">Setup Question Bank</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <div class="text-bold">Default Type of Choice</div>
            <q-option-group
              v-model="defaultTypeChoice"
              :options="defaultTypeChoiceOpt"
              color="primary"
            />
          </div>
          <div class="col">
            <q-input
              label="Number of choice"
              v-model="defaultNumberOfChoice"
              type="number"
            />
          </div>
        </div>
        <div class="row q-pt-md">
          <div class="col">
            <div class="text-bold">Show Result ?</div>
            <div class="q-gutter-sm">
              <q-radio v-model="showResult" :val="true" label="Yes" />
              <q-radio v-model="showResult" :val="false" label="No" />
            </div>
          </div>
          <div class="col">
            <div class="text-bold">Randomize Question ?</div>
            <div class="q-gutter-sm">
              <q-radio v-model="randomizeQuestion" :val="true" label="Yes" />
              <q-radio v-model="randomizeQuestion" :val="false" label="No" />
            </div>
          </div>
        </div>
        <div class="row q-pt-md">
          <div class="col">
            <div class="text-bold">Shows Right Answers ?</div>
            <div class="q-gutter-sm">
              <q-radio v-model="showRightKeysAnswer" :val="true" label="Yes" />
              <q-radio v-model="showRightKeysAnswer" :val="false" label="No" />
            </div>
          </div>
          <div class="col">
            <div class="text-bold">Right Answers Location</div>
            <div class="q-gutter-sm">
              <q-radio
                v-model="showRightKeysAnswerLocation"
                val="end"
                label="On the end of question"
              />
              <q-radio
                v-model="showRightKeysAnswerLocation"
                val="question"
                label="On every answers question"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onOKClick()" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
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
const defaultTypeChoice = ref("multiple-radio");
const defaultNumberOfChoice = ref(0);
const showResult = ref(true);
const randomizeQuestion = ref(false);
const showRightKeysAnswer = ref(true);
const showRightKeysAnswerLocation = ref("end");

onMounted(() => {
  console.log(props.setupTrainingSetup);
});

const defaultTypeChoiceOpt = ref([
  {
    label: "Single Answer",
    value: "multiple-radio",
  },
  {
    label: "Multiple Answer",
    value: "multiple-checkbox",
  },
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
  onDialogOK({
    defaultTypeChoice: defaultTypeChoice.value,
    defaultNumberOfChoice: defaultNumberOfChoice.value,
    showResult: showResult.value,
    randomizeQuestion: randomizeQuestion.value,
    showRightKeysAnswer: showRightKeysAnswer.value,
    showRightKeysAnswerLocation: showRightKeysAnswerLocation.value,
  });
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
