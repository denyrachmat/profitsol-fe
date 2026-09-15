<template>
  <q-card class="q-dialog-plugin bg-white q-pa-md">
    <q-card-section>
      <div class="text-h6">Show Result</div>
    </q-card-section>

    <q-card-section class="q-pa-md">
      <template v-if="!loading">
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
          <div class="col text-bold text-center" v-if="isPass">
            You are pass this exam.
          </div>
          <div class="col text-bold text-center" v-else>
            Sorry you do not pass this exam.<br />
            You shall re-do the exam until your all answers correct. Please
            close this page, and back to main page to re-do the exam.<br />
            You will considered finish this online training after all your
            answers correct.
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
                  :dmsOpt="quiz.content.component.dmsOpt"
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
                      <div class="text-bold">
                        <div
                          v-if="
                            answers[idx].ans_value &&
                            answers[idx].ans_value.length > 1
                          "
                          v-html="answers[idx].ans_value.join('<br>')"
                        ></div>
                        <div v-else>
                          {{ answers[idx].ans_value[0] }}
                        </div>
                      </div>
                    </span>

                    <div class="q-pt-sm" v-html="answers[idx].exp"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="row">
          <div class="col text-center justify-center items-center q-pa-md">
            <p>Please wait, we're calculating your results...</p>
            <q-spinner-dots color="primary" size="50px" />
          </div>
        </div>
      </template>
    </q-card-section>

    <q-card-actions align="right">
      <!-- <q-btn flat label="Close Quiz" color="primary" @click="onOKClick" /> -->
      <q-btn
        :label="isPass ? 'Passed' : 'Retry Quiz'"
        color="green"
        @click="onRetryClick"
        v-if="props.isRetry"
        :disable="isPass || loading"
      />
    </q-card-actions>
  </q-card>
</template>
<script setup>
import { ref, defineProps, onMounted, defineEmits } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import componentViewVue from "../componentView.vue";

import { useFormStore } from "stores/formStore";

const emit = defineEmits(["onSubmited", "onRetry"]);

const store = useFormStore();
const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  resShow: Boolean,
  answerShow: Boolean,
  dataQuiz: Array,
  idQuiz: Number,
  isRetry: {
    type: Boolean,
    default: false,
  },
});

const getAnswers = (detail, ans) => {
  const data = detail.filter((fil) => {});
};

const answers = ref([]);
const grade = ref(0);
const isPass = ref(false);
const questions = ref([]);
const loading = ref(false);

onMounted(() => {
  console.log(props);
  getAnswersUsers();
});

const getAnswersUsers = async () => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `cms/quiz/${props.idQuiz}`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    answers.value = data.data;
    grade.value = data.grade;
    isPass.value = data.is_pass;
    questions.value = data.data_ori.filter((fil) => fil.type == "form");
  }
};

// const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
//   useDialogPluginComponent();

function onOKClick() {
  store.restoreDefault();
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  emit("onSubmited");
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}

const onRetryClick = () => {
  store.restoreDefault();
  emit("onRetry");
};
</script>
