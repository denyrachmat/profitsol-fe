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
        <div class="text-h6">Show Result</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div
            :class="`col text-h6 text-bold text-center ${
              isPass ? 'text-green' : 'text-red'
            }`"
          >
            Grade : {{ grade }}
          </div>
        </div>
        <div class="row">
          <div class="col text-bold text-center">
            {{
              isPass
                ? `You are pass this exam.`
                : `Sorry you doesn't pass this exam.`
            }}
          </div>
        </div>
        <div class="row">
          <div class="col" style="overflow: auto; height: 30em">
            <div class="row" v-for="(quiz, idx) in questions" :key="idx">
              <div class="col">
                <componentViewVue
                  :type="quiz.content.component.category"
                  :type-input="quiz.content.component.value.type"
                  :comp="quiz.content.component.value.comp"
                  :label="quiz.content.label"
                  :detail="quiz.content.detail_data"
                  :ans="
                    answers[idx] &&
                    answers[idx].users &&
                    !Array.isArray(answers[idx].users)
                      ? answers[idx].users
                      : ''
                  "
                  :ansArr="
                    answers[idx] &&
                    answers[idx].users &&
                    Array.isArray(answers[idx].users)
                      ? answers[idx].users
                      : []
                  "
                  mode="live-read"
                />

                <div class="row" v-if="answers[idx]">
                  <div
                    :class="`col ${
                      !answers[idx].status ? 'bg-red' : 'bg-green'
                    } text-white q-pa-md`"
                  >
                    {{
                      !answers[idx].status
                        ? "Your answers is wrong !"
                        : "Your answers is right."
                    }}

                    <span
                      v-if="!answers[idx].status && props.answerShow === true"
                    >
                      Right answer is :
                      <span class="text-bold">{{
                        answers[idx].ans_value &&
                        answers[idx].ans_value.length > 1
                          ? answers[idx].ans_value.join(", ")
                          : answers[idx].ans_value[0]
                      }}</span>
                    </span>
                  </div>
                  <div class="col q-pa-md" v-if="answers[idx].exp">
                    <div v-html="answers[idx].exp"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import componentViewVue from "../componentView.vue";

import { useFormStore } from "stores/formStore";

const store = useFormStore();
const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  resShow: Boolean,
  answerShow: Boolean,
  dataQuiz: Array,
  idQuiz: Number,
});

const getAnswers = (detail, ans) => {
  const data = detail.filter((fil) => {});
};

const answers = ref([]);
const grade = ref(0);
const isPass = ref(false);
const questions = ref([]);

onMounted(() => {
  console.log(props);
  getAnswersUsers();
});

const getAnswersUsers = async () => {
  const data = await postData(
    "get",
    null,
    `cms/quiz/${props.idQuiz}`,
    false,
    false,
    true
  );

  if (data) {
    answers.value = data.data;
    grade.value = data.grade;
    isPass.value = data.is_pass;
    questions.value = data.data_ori;
  }
};

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

function onOKClick() {
  store.restoreDefault();
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK();
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
