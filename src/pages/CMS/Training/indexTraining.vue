<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-btn-group flat>
          <q-btn color="primary" label="File" flat no-caps>
            <q-menu>
              <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup @click="onNewQuiz">
                  <q-item-section>New Quiz</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="openTraining">
                  <q-item-section>Open...</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="onSaveQuestion"
                  :disable="!title"
                >
                  <q-item-section>Save Quiz</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn color="primary" label="Action" flat no-caps>
            <q-menu>
              <q-list dense style="min-width: 100px">
                <q-item
                  clickable
                  v-close-popup
                  @click="openPreview"
                  :disable="!idRef"
                >
                  <q-item-section>Test your question</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="onClickSetupTraining"
                  :disable="!idRef"
                >
                  <q-item-section>Setting this question bank</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="onClickShare"
                  :disable="!idRef"
                >
                  <q-item-section>Share this question</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-btn-group>
      </div>
    </div>
    <div class="row q-pt-sm">
      <div class="col q-pr-md">
        <q-input
          outlined
          label="Question Bank Title"
          v-model="title"
          dense
          :loading="loadingUpload"
        />
      </div>
      <div class="col-2 text-right">
        <q-btn-group>
          <q-btn
            color="accent"
            icon="description"
            @click="onClickChooseComponent"
            :disable="!title"
          >
            <q-tooltip> Add more question. </q-tooltip>
          </q-btn>
          <q-btn
            color="cyan"
            icon="html"
            @click="onClickChooseHTML"
            :disable="!title"
          >
            <q-tooltip> Add HTML Rows. </q-tooltip>
          </q-btn>
          <q-btn
            color="orange"
            icon="upload"
            @click="onUploadFile"
            :loading="loadingUpload"
          >
            <q-tooltip> Upload Questions Bank </q-tooltip>
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
                  <!-- <div class="col-1" v-if="col.type !== 'html'">
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
                  </div> -->

                  <div class="col-2" style="display: flex">
                    <div v-if="col.type !== 'html'" class="q-pr-sm">
                      <q-icon
                        name="check"
                        class="text-blue"
                        size="3em"
                        v-if="hasAnswer(getNormalizedAnswerValue(idxCol, col))"
                      />
                      <q-icon
                        name="cancel"
                        class="text-orange"
                        size="3em"
                        v-else
                      />
                    </div>
                    <q-input
                      outlined
                      v-model="col.seq_name"
                      input-class="text-h6"
                      dense
                    >
                      <template v-slot:prepend>
                        <span class="text-h6">Page :</span>
                      </template>
                    </q-input>
                  </div>

                  <div class="col q-px-md text-right">
                    <q-btn
                      dense
                      flat
                      icon="edit"
                      @click="
                        col.type === 'html'
                          ? onClickChooseHTML(idxCol)
                          : onClickChooseComponent(idxCol)
                      "
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

                <div v-if="col.type === 'html'" v-html="col.content"></div>
                <componentViewVue
                  v-else
                  :type="col.content.component.category"
                  :type-input="col.content.component.value.type"
                  :comp="col.content.component.value.comp"
                  :label="col.content.label"
                  :detail="col.content.detail_data"
                  mode="live-ans"
                  @customAnschange="(val) => onChooseValue(val, idxCol)"
                  :key="idxCol + 'color'"
                  :ans="
                    !Array.isArray(getNormalizedAnswerValue(idxCol, col))
                      ? getNormalizedAnswerValue(idxCol, col)
                      : ''
                  "
                  :ansArr="
                    Array.isArray(getNormalizedAnswerValue(idxCol, col))
                      ? getNormalizedAnswerValue(idxCol, col)
                      : []
                  "
                />

                <div
                  class="row"
                  v-if="hasAnswer(getNormalizedAnswerValue(idxCol, col))"
                >
                  <div class="col">
                    <span class="text-bold">Explanation (Optional)</span>
                    <q-editor
                      min-height="5rem"
                      v-model="explainSubmit[idxCol]"
                    />
                  </div>
                </div>
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
import { computed, ref, watch } from "vue";
import { useQuasar } from "quasar";
import componentViewVue from "../componentView.vue";
import chooseComponent from "../chooseComponent.vue";
import addContentComponent from "../addContentComponent.vue";
import UploadFiles from "src/components/uploadFiles/index.vue"; // Import the new component

import apiRequest from "src/components/apiRequest";

import setupTraining from "./setupTraining.vue";
import openTrainingVue from "./openTraining.vue";
import previewComponentVue from "../Forms/previewComponent.vue";
import shareFormsVue from "../Forms/shareForms.vue";

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
  maxQuestionCount: 1,
  skipNextButtonMedia: false,
  showRightKeysAnswer: true,
  showRightKeysAnswerLocation: "end",
  setUpTimer: false,
  timerEveryQuestion: false,
  hourTimer: 0,
  minTimer: 0,
  secTimer: 0,
  minPass: 100,
  startQuiz: "",
  endQuiz: "",
});
const share = ref([]);
const shareMainMenu = ref(0);
const shareIsroles = ref(0);
const shareFormsMenuIcon = ref("");
const loadingUpload = ref(false);

const valueSubmited = ref([]);
const explainSubmit = ref([]);
const idDetForm = ref([]);

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

const getFormsOnly = computed(() =>
  forms.value.filter((fil) => fil.type === "form")
);

const onChooseValue = (val, idx) => {
  console.log([val, idx, val.exp]);
  valueSubmited.value[idx] = val;
  // explainSubmit.value = val.exp;
  forms.value[idx].value = val;
};

const getAnswerValue = (idx, formRow) => {
  const answers = valueSubmited.value;

  if (Array.isArray(answers)) {
    return answers[idx];
  }

  if (answers && typeof answers === "object") {
    if (
      formRow &&
      formRow.id !== undefined &&
      formRow.id !== null &&
      answers[formRow.id] !== undefined
    ) {
      return answers[formRow.id];
    }

    if (answers[idx] !== undefined) {
      return answers[idx];
    }
  }

  return undefined;
};

const normalizeSingleAnswer = (answer, formRow) => {
  const options = formRow?.content?.detail_data || [];

  if (answer === undefined || answer === null || answer === "") {
    return answer;
  }

  if (typeof answer === "object" && !Array.isArray(answer)) {
    const nestedAnswer =
      answer.value ?? answer.ans ?? answer.answer ?? answer.id ?? null;

    if (nestedAnswer !== null) {
      return normalizeSingleAnswer(nestedAnswer, formRow);
    }
  }

  if (!Array.isArray(options) || options.length === 0) {
    return answer;
  }

  const normalized = String(answer).trim().toLowerCase();

  const exactMatch = options.find((opt) => opt?.value === answer);
  if (exactMatch) {
    return exactMatch.value;
  }

  const looseValueMatch = options.find(
    (opt) => String(opt?.value).trim().toLowerCase() === normalized
  );
  if (looseValueMatch) {
    return looseValueMatch.value;
  }

  const labelMatch = options.find(
    (opt) => String(opt?.label).trim().toLowerCase() === normalized
  );
  if (labelMatch) {
    return labelMatch.value;
  }

  if (typeof answer === "string") {
    const firstChar = answer.trim().charAt(0).toUpperCase();
    if (/^[A-Z]$/.test(firstChar)) {
      const idx = firstChar.charCodeAt(0) - 65;
      if (idx >= 0 && idx < options.length) {
        return options[idx].value;
      }
    }
  }

  return answer;
};

const getNormalizedAnswerValue = (idx, formRow) => {
  const answer = getAnswerValue(idx, formRow);

  if (Array.isArray(answer)) {
    return answer.map((item) => normalizeSingleAnswer(item, formRow));
  }

  return normalizeSingleAnswer(answer, formRow);
};

const hasAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return answer !== undefined && answer !== null && answer !== "";
};

const onClickChooseComponent = (idxForm = {}) => {
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
    console.log(val);
    if (forms.value[idxForm] && forms.value[idxForm].content) {
      forms.value[idxForm] = val;
    } else {
      forms.value.push({
        ...val,
        seq_name:
          forms.value.length > 0
            ? parseInt(forms.value[forms.value.length - 1].seq_name) + 1
            : 1,
      });
    }
  });
};

const onClickChooseHTML = (idxForm = {}) => {
  $q.dialog({
    component: addContentComponent,
    componentProps: {
      comp: forms.value[idxForm] ? forms.value[idxForm].content : "",
    },
  }).onOk(async (val) => {
    // console.log(val);
    if (forms.value[idxForm]) {
      forms.value[idxForm] = val;
    } else {
      // console.log(val);
      forms.value.push(val);
    }
  });
};

// Define the options array as a ref to make it reactive
const uploadOptions = ref([
  {
    type: "radio-group",
    name: "uploadMethod", // Key to store the selected value
    label: "Choose Upload Method:",
    required: true,
    value: "template", // Default selected value, now reactive
    choices: [
      {
        value: "template",
        label: "Upload using template",
      },
      { value: "ai", label: "Use AI to scan question bank" },
    ],
  },
]);

// Determine downloadTemplate prop based on the initial default uploadMethod
// Now a computed property to react to changes in uploadOptions.value[0].value
const showDownloadTemplateButton = computed(() => {
  const uploadMethodOption = uploadOptions.value.find(
    (opt) => opt.name === "uploadMethod"
  );
  return uploadMethodOption && uploadMethodOption.value === "template";
});

const onUploadFile = () => {
  $q.dialog({
    component: UploadFiles,
    componentProps: {
      title: "Upload Question Bank",
      accept: ".csv,.txt,.json,.xlsx,.docx",
      multiple: false, // Assuming single file upload for question bank
      options: uploadOptions.value, // Use the .value of the ref
      isDownloadTemplate: {
        enabled: showDownloadTemplateButton.value, // Use the .value of the computed prop
        url: `${process.env.API}cms/downloadQuizTemplate`, // Replace with your actual template URL
      },
      onDownloadTemplate: handleDownloadTemplate, // Pass the function prop
      isBase64: false,
    },
  })
    .onOk(async ({ result, fileName, dynamicOptions }) => {
      console.log("Uploaded file base64:", result);
      console.log("Uploaded file name:", fileName);
      console.log("Chosen upload method:", dynamicOptions); // Access the method from dynamicOptions

      const actualFileName = fileName;
      const method = dynamicOptions.uploadMethod;
      loadingUpload.value = true;

      if (method === "template") {
        $q.notify({
          message: `Uploading "${actualFileName}" using template...`,
          color: "info",
        });

        const formData = new FormData();
        formData.append("file", result);
        if (actualFileName) {
          formData.append("fileName", actualFileName);
        }

        const data = await postData(
          "post",
          formData,
          `cms/uploadQuizTemplate`,
          false,
          false,
          true
        );

        if (data) {
          $q.notify({
            message: `File "${actualFileName}" uploaded successfully!`,
            color: "positive",
          });
          // Handle the response data as needed
          console.log("Response from server:", data);
          title.value = data.title;
          forms.value = data.forms;
          valueSubmited.value = data.ans;
          explainSubmit.value = data.exp;
          loadingUpload.value = false;
        } else {
          $q.notify({
            message: `Failed to upload "${actualFileName}".`,
            color: "negative",
          });
          loadingUpload.value = false;
        }
      } else if (method === "ai") {
        $q.notify({
          message: `Scanning "${actualFileName}" with AI...`,
          color: "info",
        });

        const formData = new FormData();
        formData.append("file", result);
        if (actualFileName) {
          formData.append("fileName", actualFileName);
        }

        const data = await postData(
          "post",
          formData,
          `cms/uploadQuizTemplateAi`,
          false,
          false,
          true
        );

        if (data) {
          $q.notify({
            message: `File "${actualFileName}" uploaded successfully!`,
            color: "positive",
          });
          // Handle the response data as needed
          console.log("Response from server:", data);
          title.value = data.title;
          forms.value = data.forms;
          valueSubmited.value = data.ans;
          explainSubmit.value = data.exp;
          loadingUpload.value = false;
        } else {
          $q.notify({
            message: `Failed to upload "${actualFileName}".`,
            color: "negative",
          });
          loadingUpload.value = false;
        }
      }
    })
    .onCancel(() => {
      $q.notify({
        message: "Upload cancelled.",
        color: "negative",
      });
    });
};

// Define the download handler function
const handleDownloadTemplate = () => {
  $q.notify({
    message: "Downloading template...",
    color: "primary",
  });
  // ponytail: Implement actual template download logic here.
  // For example, trigger a file download or navigate to a template URL.
  // window.open('/path/to/your/template.xlsx', '_blank');
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

const onClickShare = () => {
  $q.dialog({
    component: shareFormsVue,
    componentProps: {
      id: idRef.value,
      shared: share.value,
    },
  }).onOk(async (val) => {
    share.value = val.emails;
    shareMainMenu.value = val.isMainMenu;
    shareIsroles.value = val.isRoles;
    shareFormsMenuIcon.value = val.shareFormsMenuIcon;
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
        exp: explainSubmit.value,
        title: title.value,
        isQuiz: true,
        setupTraining: setupTrainingSetup.value,
        shareForms: share.value,
        shareFormsIsMainMenu: shareMainMenu.value,
        shareFormsIsRoles: shareIsroles.value,
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
    console.log(val.forms);
    setupTrainingSetup.value = null;
    idRef.value = val.id;
    title.value = val.title;
    forms.value = val.forms;
    valueSubmited.value = val.ans;
    explainSubmit.value = val.exp;
    setupTrainingSetup.value = val.setupTraining;
    idDetForm.value = val.ans_id;
    share.value = val.share;
  });
};

const onNewQuiz = () => {
  $q.dialog({
    title: "Confirm",
    message: "Do you really want to create new quiz ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    title.value = "";
    forms.value = [];
    valueSubmited.value = [];
    explainSubmit.value = [];
    setupTrainingSetup.value = {
      defaultTypeChoice: "multiple-radio",
      defaultNumberOfChoice: "1",
      showResult: true,
      randomizeQuestion: true,
      maxQuestionCount: 1,
      skipNextButtonMedia: false,
      showRightKeysAnswer: true,
      showRightKeysAnswerLocation: "end",
      setUpTimer: false,
      timerEveryQuestion: false,
      hourTimer: 0,
      minTimer: 0,
      secTimer: 0,
      minPass: 100,
      startQuiz: "",
      endQuiz: "",
    };
    share.value = [];
    shareMainMenu.value = 0;
    shareIsroles.value = 0;
    shareFormsMenuIcon.value = "";
  });
};

const openPreview = () => {
  $q.dialog({
    component: previewComponentVue,
    componentProps: {
      data: forms.value,
      setup: setupTrainingSetup.value,
      id: idRef.value,
      mode: "quiz",
      idDet: idDetForm.value,
    },
  }).onOk(async (val) => {
    console.log(val);
  });
};

watch(
  () => JSON.stringify(setupTrainingSetup.value),
  (val) => {
    const valParse = JSON.parse(val);
    console.log(valParse);

    if (valParse) {
      initChoice.value.content.component.value.comp =
        valParse.defaultTypeChoice === "multiple-radio"
          ? "q-radio"
          : "q-checkbox";
      initChoice.value.content.component.value.type =
        valParse.defaultTypeChoice;

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
    }
    // refreshDetail.value = refreshDetail.value + 1;
    // emit("onDeleted", JSON.parse(val));
  }
);
</script>
