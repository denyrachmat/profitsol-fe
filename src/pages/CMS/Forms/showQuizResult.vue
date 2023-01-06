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
        <div class="row" v-for="(quiz, idx) in props.dataQuiz" :key="idx">
          <div class="col">
            <componentViewVue
              :type="quiz.content.component.category"
              :type-input="quiz.content.component.value.type"
              :comp="quiz.content.component.value.comp"
              :label="quiz.content.label"
              :detail="quiz.content.detail_data"
              :ans="!Array.isArray(answers[idx]) ? answers[idx] : ''"
              :ansArr="Array.isArray(answers[idx]) ? answers[idx] : []"
              mode="live-read"
            />
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

const answers = ref([]);

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
