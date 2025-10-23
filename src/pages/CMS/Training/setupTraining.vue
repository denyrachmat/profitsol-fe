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
        <div class="text-h6">
          {{ props.isForm ? "Setup Forms" : "Setup Question Bank" }}
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <template v-if="!isForm">
          <!-- Choice Type -->
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
                outlined
              />
            </div>
          </div>

          <!-- Result Setup -->
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
          <div class="row q-pt-md" v-if="randomizeQuestion">
            <div class="col"></div>
            <div class="col">
              <div class="text-bold">Max of question</div>
              <div class="q-gutter-sm">
                <!-- maxQuestionCount -->
                <q-input
                  label="How much question will be provided"
                  type="number"
                  v-model="maxQuestionCount"
                  dense
                  outlined
                />
              </div>
            </div>
          </div>
          <!-- skipNextButtonMedia -->
          <div class="row q-pt-md">
            <div class="col">
              <div class="text-bold">
                Disable next button when media (Video / Audio) is playing ?
              </div>
              <q-radio v-model="skipNextButtonMedia" :val="true" label="Yes" />
              <q-radio v-model="skipNextButtonMedia" :val="false" label="No" />
            </div>
          </div>
          <div class="row q-pt-md">
            <div class="col">
              <div class="text-bold">Shows Right Answers ?</div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="showRightKeysAnswer"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="showRightKeysAnswer"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
            <div class="col" v-if="showRightKeysAnswer">
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

          <q-separator />

          <!-- Timer Setup -->
          <div class="row q-pt-md">
            <div class="col">
              <div class="text-bold">Using Timer ?</div>
              <div class="q-gutter-sm">
                <q-radio v-model="setUpTimer" :val="true" label="Yes" />
                <q-radio v-model="setUpTimer" :val="false" label="No" />
              </div>
            </div>
          </div>
          <template v-if="setUpTimer">
            <div class="row q-pt-md">
              <div class="col">
                <div class="text-bold">Using timer on every question ?</div>
                <div class="q-gutter-sm">
                  <q-radio
                    v-model="timerEveryQuestion"
                    :val="true"
                    label="Yes"
                  />
                  <q-radio
                    v-model="timerEveryQuestion"
                    :val="false"
                    label="No"
                  />
                </div>
              </div>
            </div>

            <div class="row q-pt-md">
              <div class="col">
                <q-input
                  label="Hours"
                  type="number"
                  v-model="hourTimer"
                  dense
                  outlined
                />
              </div>
              <div class="col q-pl-md">
                <q-input
                  label="Minutes"
                  type="number"
                  v-model="minTimer"
                  dense
                  outlined
                />
              </div>
              <div class="col q-pl-md">
                <q-input
                  label="Seconds"
                  type="number"
                  v-model="secTimer"
                  dense
                  outlined
                />
              </div>
            </div>
          </template>

          <!-- Grade Setup -->
          <div class="row q-py-md">
            <div class="col">
              <div class="text-bold">Grade Setup</div>
              <q-input
                label="Min grade to pass"
                v-model="minPass"
                type="number"
                :max="100"
                :min="0"
                outlined
                dense
              />
            </div>
          </div>

          <q-separator />
        </template>

        <div class="text-bold">
          {{ props.isForm ? "Form Active Setup" : "Quiz Active Setup" }}
        </div>
        <div class="row q-pt-md">
          <div class="col q-pr-md">
            <q-input
              v-model="startQuiz"
              outlined
              dense
              label="Start Date & Time"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="startQuiz" mask="YYYY-MM-DD HH:mm">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="startQuiz"
                      mask="YYYY-MM-DD HH:mm"
                      format24h
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col">
            <q-input v-model="endQuiz" outlined dense label="End Date & Time">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="endQuiz" mask="YYYY-MM-DD HH:mm">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time v-model="endQuiz" mask="YYYY-MM-DD HH:mm" format24h>
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-pt-md" v-if="props.isForm">
          <div class="col">
            <q-option-group
              v-model="rowsPageMethods"
              :options="rowsPageMethodsOpt"
              color="primary"
            />
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
  isForm: Boolean,
  setupTrainingSetup: Object,
});

const $q = useQuasar();
const defaultTypeChoice = ref("multiple-radio");
const defaultNumberOfChoice = ref(0);
const showResult = ref(true);
const randomizeQuestion = ref(false);
const maxQuestionCount = ref(0);
const showRightKeysAnswer = ref(true);
const showRightKeysAnswerLocation = ref("end");
const setUpTimer = ref(false);
const timerEveryQuestion = ref(false);
const hourTimer = ref(0);
const minTimer = ref(0);
const secTimer = ref(0);
const minPass = ref(100);
const startQuiz = ref("");
const endQuiz = ref("");
const rowsPageMethods = ref("multi-page");
const rowsPageMethodsOpt = ref([
  {
    label: "Multi page when add rows",
    value: "multi-page",
  },
  {
    label: "Same page when add rows",
    value: "one-page",
  },
]);
const skipNextButtonMedia = ref(false);

onMounted(() => {
  if (props.setupTrainingSetup) {
    defaultTypeChoice.value = props.setupTrainingSetup.defaultTypeChoice;
    defaultNumberOfChoice.value =
      props.setupTrainingSetup.defaultNumberOfChoice;
    showResult.value = props.setupTrainingSetup.showResult;
    randomizeQuestion.value = props.setupTrainingSetup.randomizeQuestion;
    maxQuestionCount.value = parseInt(
      props.setupTrainingSetup.maxQuestionCount
    );
    showRightKeysAnswer.value = props.setupTrainingSetup.showRightKeysAnswer;
    showRightKeysAnswerLocation.value =
      props.setupTrainingSetup.showRightKeysAnswerLocation;
    skipNextButtonMedia.value = props.setupTrainingSetup.skipNextButtonMedia;
    setUpTimer.value = props.setupTrainingSetup.setUpTimer;
    timerEveryQuestion.value = props.setupTrainingSetup.timerEveryQuestion;
    hourTimer.value = props.setupTrainingSetup.hourTimer;
    minTimer.value = props.setupTrainingSetup.minTimer;
    secTimer.value = props.setupTrainingSetup.secTimer;
    minPass.value = props.setupTrainingSetup.minPass;
    startQuiz.value = props.setupTrainingSetup.startQuiz;
    endQuiz.value = props.setupTrainingSetup.endQuiz;
  }
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
    maxQuestionCount: parseInt(maxQuestionCount.value),
    skipNextButtonMedia: skipNextButtonMedia.value,
    showRightKeysAnswer: showRightKeysAnswer.value,
    showRightKeysAnswerLocation: showRightKeysAnswerLocation.value,
    setUpTimer: setUpTimer.value,
    timerEveryQuestion: timerEveryQuestion.value,
    hourTimer: hourTimer.value,
    minTimer: minTimer.value,
    secTimer: secTimer.value,
    minPass: minPass.value,
    startQuiz: startQuiz.value,
    endQuiz: endQuiz.value,
    rowsPageMethods: rowsPageMethods.value,
  });
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
