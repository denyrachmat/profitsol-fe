<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col q-pr-md">
        <q-input outlined label="Question Bank Title" v-model="title" dense />
      </div>
      <div class="col-3 text-right">
        <q-btn-group>
          <q-btn
            color="green"
            icon="save"
            @click="onSaveQuestion"
            :disable="!title || valueSubmited.length !== forms.length"
          >
            <q-tooltip> Save question bank. </q-tooltip>
          </q-btn>
          <q-btn
            color="accent"
            icon="add"
            @click="onClickChooseComponent"
            :disable="!title"
          >
            <q-tooltip> Add more question. </q-tooltip>
          </q-btn>
          <q-btn color="primary" icon="search" @click="openTraining">
            <q-tooltip> Find & Edit saved question bank. </q-tooltip>
          </q-btn>
          <q-btn color="orange" icon="visibility">
            <q-tooltip> Test your question bank. </q-tooltip>
          </q-btn>
          <q-btn color="red" icon="settings" @click="onClickSetupTraining">
            <q-tooltip> Setting this question bank </q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </div>

    <div class="row q-py-md">
      <div class="col">
        <hr />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <fieldset
          style="
            border: 1px solid #ccc !important;
            border-radius: 16px;
            max-height: 80vh;
            overflow: auto;
          "
        >
          <legend>Add question here</legend>

          <!-- Rows Content -->
          <template v-if="forms.length > 0">
            <b>*Don't forget to add answers to each of question.</b>
            <div
              class="row q-pt-md"
              v-for="(col, idxCol) in forms"
              :key="idxCol + 'col'"
            >
              <div
                class="col q-pa-md"
                style="border: 1px dashed #ccc !important; border-radius: 5px"
              >
                <div class="row">
                  <div class="col">
                    <q-icon
                      name="check"
                      class="text-blue"
                      size="2em"
                      v-if="valueSubmited[idxCol]"
                    />
                    <q-icon
                      name="cancel"
                      class="text-orange"
                      size="2em"
                      v-else
                    />
                  </div>

                  <div class="col q-px-md text-right">
                    <q-btn
                      dense
                      flat
                      icon="edit"
                      @click="onClickChooseComponent(idxCol)"
                      color="orange"
                    >
                      <q-tooltip> Edit this question. </q-tooltip>
                    </q-btn>
                    <q-btn
                      dense
                      flat
                      icon="content_copy"
                      color="green"
                      @click="duplicateQuestion(col)"
                    >
                      <q-tooltip> Duplicate this question. </q-tooltip>
                    </q-btn>
                    <q-btn
                      dense
                      flat
                      icon="delete"
                      color="red"
                      @click="deleteQuestion(idxCol)"
                    >
                      <q-tooltip> Delete this question. </q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <componentViewVue
                  :type="col.content.component.category"
                  :type-input="col.content.component.value.type"
                  :comp="col.content.component.value.comp"
                  :label="col.content.label"
                  :detail="col.content.detail_data"
                  mode="live"
                  @custom-change="(val) => onChooseValue(val, idxCol)"
                  :key="idxCol + 'color'"
                  :ans="valueSubmited[idxCol]"
                />
              </div></div
          ></template>
          <div class="row q-pt-md" v-else>
            <div class="col">No question added</div>
          </div>
        </fieldset>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import { useQuasar } from "quasar";
import componentViewVue from "../componentView.vue";
import chooseComponent from "../chooseComponent.vue";
import apiRequest from "src/components/apiRequest";

import setupTraining from "./setupTraining.vue";
import openTrainingVue from "./openTraining.vue";

const $q = useQuasar();
const { postData } = apiRequest();

const idRef = ref("");
const title = ref("");
const forms = ref([]);
const setupTrainingSetup = ref({
  defaultTypeChoice: "multiple-radio",
  defaultNumberOfChoice: "1",
  showResult: true,
  randomizeQuestion: true,
  showRightKeysAnswer: true,
  showRightKeysAnswerLocation: "end",
  setUpTimer: false,
  timerEveryQuestion: false,
  hourTimer: 0,
  minTimer: 0,
  secTimer: 0,
});

const valueSubmited = ref([]);

const initChoice = ref({
  content: {
    label: "",
    component: {
      label: "Multiple Choice",
      category: "multiple",
      value: { type: "multiple-radio", comp: "q-radio" },
    },
    detail_data: [],
    multipleOnly: true,
  },
  value: null,
});

const onChooseValue = (val, idx) => {
  console.log([val, idx]);
  valueSubmited.value[idx] = val;
  // forms.value[idx].value = val;
};

const onClickChooseComponent = (idxForm = {}) => {
  console.log(forms.value[idxForm]);
  $q.dialog({
    component: chooseComponent,
    componentProps: {
      currComponent:
        forms.value[idxForm] && forms.value[idxForm].content
          ? {
              content: {
                ...forms.value[idxForm].content,
                multipleOnly: true,
              },
            }
          : initChoice.value,
    },
  }).onOk(async (val) => {
    if (forms.value[idxForm] && forms.value[idxForm].content) {
      forms.value[idxForm] = val;
    } else {
      forms.value.push(val);
    }
  });
};

const onClickSetupTraining = () => {
  $q.dialog({
    component: setupTraining,
    componentProps: {
      setupTrainingSetup: setupTrainingSetup.value,
    },
  }).onOk(async (val) => {
    setupTrainingSetup.value = val;
    // forms.value[idxForm].content = val;
  });
};

const duplicateQuestion = (data) => {
  console.log(forms.value);
  console.log(data);
  forms.value.push(data);
};

const deleteQuestion = (idx) => {
  forms.value.splice(idx, 1);
  valueSubmited.value.splice(idx, 1);
};

const onSaveQuestion = () => {
  $q.dialog({
    title: "Confirm",
    message: "Do you really want to save this quiz ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const data = await postData(
      "post",
      {
        idRef: idRef.value,
        forms: forms.value,
        ans: valueSubmited.value,
        uname: "",
        title: title.value,
        isQuiz: true,
        setupTraining: setupTrainingSetup.value,
      },
      `cms/forms`,
      false,
      false,
      true
    );

    if (data) {
      $q.dialog({
        title: "Confirm",
        message: "Save Success, Do you want to continue edit this quiz ?",
        cancel: true,
        persistent: true,
      })
        .onOk(async () => {})
        .onCancel(() => {
          title.value = "";
          forms.value = [];
        });
      console.log(data);
    }
  });
  // console.log(forms.value);
};

const openTraining = () => {
  $q.dialog({
    component: openTrainingVue,
    componentProps: {
      type: "quiz",
    },
  }).onOk(async (val) => {
    idRef.value = val.id;
    title.value = val.title;
    forms.value = val.forms;
    valueSubmited.value = val.ans;
    setupTrainingSetup.value = val.setupTraining;
  });
};

watch(
  () => JSON.stringify(setupTrainingSetup.value),
  (val) => {
    console.log(val);
    const valParse = JSON.parse(val);
    initChoice.value.content.component.value.comp =
      valParse.defaultTypeChoice === "multiple-radio"
        ? "q-radio"
        : "q-checkbox";
    initChoice.value.content.component.value.type = valParse.defaultTypeChoice;

    const hasilDetail = [];
    for (let index = 0; index < valParse.defaultNumberOfChoice; index++) {
      hasilDetail.push({
        col_det_id: "opt-" + (index + 1),
        col_det_label: "",
        label: "",
        value: index + 1,
      });
    }

    initChoice.value.content.detail_data = hasilDetail;
    // refreshDetail.value = refreshDetail.value + 1;
    // emit("onDeleted", JSON.parse(val));
  }
);
</script>
