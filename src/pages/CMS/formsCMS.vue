<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col q-pr-md">
        <q-input label="Form Title" dense outlined v-model="title" />
      </div>
      <div class="col-4 text-right">
        <q-btn-group>
          <q-btn
            color="green"
            icon="save"
            @click="onClickSave"
            :disable="!title"
          >
            <q-tooltip>Save this forms</q-tooltip>
          </q-btn>
          <q-btn color="purple" icon="add" @click="onAddRows" :disable="!title">
            <q-tooltip>Add rows </q-tooltip>
          </q-btn>
          <q-btn
            color="blue"
            icon="psychology"
            @click="onClickLogicForms"
            :disable="!title"
          >
            <q-tooltip>Add forms event</q-tooltip>
          </q-btn>
          <q-btn color="cyan" icon="search" @click="openTraining">
            <q-tooltip>Open created forms</q-tooltip>
          </q-btn>
          <q-btn
            color="orange"
            icon="visibility"
            :disable="!title || forms.length === 0"
            @click="openPreview"
          >
            <q-tooltip>Preview Forms</q-tooltip>
          </q-btn>
          <q-btn color="red" icon="settings" @click="onClickSetupTraining">
            <q-tooltip> Setting Form </q-tooltip>
          </q-btn>
          <q-btn
            color="cyan"
            icon="share"
            @click="onClickShare"
            :disable="!idRef"
          >
            <q-tooltip> Share this form </q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </div>
    <hr />
    <fieldset
      style="
        border: 1px solid #ccc !important;
        border-radius: 16px;
        max-height: 80vh;
        overflow: auto;
      "
    >
      <legend>Create forms here</legend>
      <template v-if="forms.length > 0">
        <template v-for="(form, idxForm) in forms" :key="idxForm">
          <div class="row q-pt-md">
            <q-input
              outlined
              v-model="form.seq_name"
              input-class="text-h6"
              dense
            >
              <template v-slot:prepend>
                <span class="text-h6">Page :</span>
              </template>
            </q-input>
            <!-- <div class="col text-h4 text-bold">Rows 1</div> -->
            <div class="col text-right">
              <q-btn-group outline>
                <q-btn
                  color="green"
                  icon="add"
                  @click="onAddcontent(idxForm)"
                  outline
                >
                  <q-tooltip>Add columns </q-tooltip>
                </q-btn>
                <q-btn
                  color="red"
                  icon="delete"
                  @click="forms.splice(idxForm, 1)"
                  outline
                >
                  <q-tooltip>Remove this rows </q-tooltip>
                </q-btn>
              </q-btn-group>
            </div>
          </div>

          <!-- Rows Content -->
          <div class="row q-pt-md">
            <div
              class="col q-pa-md"
              style="border: 1px dashed #ccc !important; border-radius: 5px"
              v-for="(col, idxCol) in form.content"
              :key="idxCol + 'col'"
            >
              <div class="text-center">
                <q-btn-group flat>
                  <q-btn
                    :color="!col.type ? 'green' : 'orange'"
                    icon="list_alt"
                    flat
                    @click="onClickChooseComponent(col.type, idxForm, idxCol)"
                  >
                    <q-tooltip>{{
                      !col.type ? "Add forms component here" : "Edit this form"
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    color="indigo"
                    icon="integration_instructions"
                    flat
                    @click="onClickAddContent(col.type, idxForm, idxCol)"
                  >
                    <q-tooltip>Add HTML content here</q-tooltip>
                  </q-btn>
                  <q-btn
                    color="cyan"
                    icon="quiz"
                    flat
                    @click="onClickChooseQuiz(idxForm, idxCol)"
                  >
                    <q-tooltip>Add Quiz content here</q-tooltip>
                  </q-btn>
                  <q-btn
                    color="blue"
                    icon="psychology"
                    flat
                    :disable="col.type != 'form'"
                    @click="onClickLogicField(form.seq_name, idxCol)"
                  >
                    <q-tooltip>Add logic this field</q-tooltip>
                  </q-btn>
                  <q-btn
                    color="red"
                    icon="delete"
                    flat
                    @click="form.content.splice(idxCol, 1)"
                    :disable="idxCol === 0"
                  >
                    <q-tooltip>Delete this column</q-tooltip>
                  </q-btn>
                </q-btn-group>
                <q-toggle
                  v-model="col.required"
                  color="red"
                  label="Is Required ?"
                  right-label
                  v-if="col.type === 'form'"
                  disable
                />
              </div>
              <template v-if="!col.type || col.type === ''">
                <div class="q-pt-md text-italic text-center">
                  Add form component here
                </div>
              </template>

              <template v-if="col.type === 'form'">
                <componentViewVue
                  :type="col.content.component.category"
                  :type-input="col.content.component.value.type"
                  :comp="col.content.component.value.comp"
                  :label="col.content.label"
                  :detail="col.content.detail_data"
                  mode="live"
                />
              </template>
              <div v-if="col.type === 'html'" v-html="col.content"></div>
              <div v-if="col.type === 'quiz'">
                {{ col.content.title }} quiz will be show here.
              </div>
            </div>
          </div>
        </template>
      </template>
      <div class="text-center" v-else>
        <span class="text-h6">No Rows added</span>
      </div>
    </fieldset>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";

import chooseComponent from "./chooseComponent.vue";
import addContentComponent from "./addContentComponent.vue";
import componentViewVue from "./componentView.vue";
import apiRequest from "src/components/apiRequest";
import openTrainingVue from "./Training/openTraining.vue";
import PreviewComponent from "./Forms/previewComponent.vue";
import shareFormsVue from "./Forms/shareForms.vue";
import setupTraining from "./Training/setupTraining.vue";
import showLogicField from "./Forms/showLogicField.vue";
import showLogicForms from "./Forms/showLogicForms.vue";

const { postData } = apiRequest();

const $q = useQuasar();

const idRef = ref("");
const title = ref("");
const forms = ref([]);
const formsInit = {
  seq_name: "",
  content: [],
};
const share = ref([]);
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
  minPass: 100,
  startQuiz: "",
  endQuiz: "",
  rowsPageMethods: "multi-page",
});
const shareMainMenu = ref(0);
const shareIsroles = ref(0);
const selectedSharedMenu = ref("");
const shareFormsMenuIcon = ref("");
const selectedTableRoles = ref("");
const logicsFields = ref([]);
const formEvents = ref([]);

const onAddRows = () => {
  // formsInit.seq_name = `Rows ${forms.value.length + 1}`;
  forms.value.push({
    type: "row",
    seq_name: `${
      forms.value.length === 0
        ? 1
        : setupTrainingSetup.value.rowsPageMethods === "multi-page"
        ? parseInt(forms.value[forms.value.length - 1].seq_name) + 1
        : parseInt(forms.value[forms.value.length - 1].seq_name)
    }`,
    content: [
      {
        type: "",
        seq_name: "",
        content: {},
      },
    ],
  });
};

const onAddcontent = (idx) => {
  forms.value[idx].content.push({
    content: {},
  });
};

const onClickChooseComponent = (type, idxForm, idxCol) => {
  if (!type) {
    $q.dialog({
      component: chooseComponent,
    }).onOk(async (val) => {
      console.log(val);
      forms.value[idxForm].content[idxCol] = val;
    });
  } else {
    if (type !== "form") {
      $q.dialog({
        title: "Confirm",
        message:
          "This action will replace your current Content with Forms, do you want to continue ?",
        cancel: true,
        persistent: true,
      }).onOk(() => {
        $q.dialog({
          component: chooseComponent,
        }).onOk(async (val) => {
          console.log(val);
          forms.value[idxForm].content[idxCol] = val;
        });
      });
    } else {
      $q.dialog({
        component: chooseComponent,
        componentProps: {
          currComponent: forms.value[idxForm].content[idxCol],
        },
      }).onOk(async (val) => {
        console.log(val);
        forms.value[idxForm].content[idxCol] = val;
      });
    }
  }
};

const onClickAddContent = (type, idxForm, idxCol) => {
  if (!type) {
    $q.dialog({
      component: addContentComponent,
    }).onOk(async (val) => {
      if (val.content) {
        forms.value[idxForm].content[idxCol] = val;
      }
    });
  } else {
    if (type !== "html") {
      $q.dialog({
        title: "Confirm",
        message:
          "This action will replace your current Forms with Content, do you want to continue ?",
        cancel: true,
        persistent: true,
      }).onOk(() => {
        $q.dialog({
          component: addContentComponent,
        }).onOk(async (val) => {
          if (val.content) {
            forms.value[idxForm].content[idxCol] = val;
          }
        });
      });
    } else {
      $q.dialog({
        component: addContentComponent,
      }).onOk(async (val) => {
        if (val.content) {
          forms.value[idxForm].content[idxCol] = val;
        }
      });
    }
  }
};

const onClickSave = () => {
  $q.dialog({
    title: "Confirm",
    message: "Do you really want to save this content ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const data = await postData(
      "post",
      {
        idRef: idRef.value,
        forms: forms.value,
        ans: [],
        title: title.value,
        isQuiz: false,
        shareForms: share.value,
        shareFormsIsMainMenu: shareMainMenu.value,
        shareFormsIsRoles: shareIsroles.value,
        selectedSharedMenu: selectedSharedMenu.value,
        shareFormsMenuIcon: shareFormsMenuIcon.value,
        logicsFields: logicsFields.value,
        formEvents: formEvents.value,
      },
      `cms/forms`,
      false,
      false,
      true
    );

    if (data) {
      $q.dialog({
        title: "Confirm",
        message: "Save Success, Do you want to continue edit this content ?",
        cancel: true,
        persistent: true,
      })
        .onOk(async () => {})
        .onCancel(() => {
          title.value = "";
          forms.value = [];
        });
    }
  });
};

const openTraining = () => {
  $q.dialog({
    component: openTrainingVue,
    componentProps: {
      type: "form",
    },
  }).onOk(async (val) => {
    // console.log(val);
    idRef.value = val.id;
    title.value = val.title;
    forms.value = val.forms;
    share.value = val.share;
    shareMainMenu.value = val.shareFormsIsMainMenu;
    shareIsroles.value = val.shareIsroles;
    selectedSharedMenu.value = val.selectedSharedMenu;
    shareFormsMenuIcon.value = val.shareFormsMenuIcon;
    selectedTableRoles.value = val.shareFormsRoleID;
    logicsFields.value = val.logicsFields;
    formEvents.value = val.formEvents;
    // forms.value[idxForm].content = val;
  });
};

const openPreview = () => {
  $q.dialog({
    component: PreviewComponent,
    componentProps: {
      data: forms.value,
      mode: "form",
    },
  }).onOk(async (val) => {
    console.log(val);
  });
};

const onClickChooseQuiz = (idxForm, idxCol) => {
  $q.dialog({
    component: openTrainingVue,
    componentProps: {
      type: "quiz",
    },
  }).onOk(async (val) => {
    forms.value[idxForm].content[idxCol] = {
      type: "quiz",
      content: val,
    };
  });
};

const onClickShare = () => {
  console.log(shareMainMenu.value);
  $q.dialog({
    component: shareFormsVue,
    componentProps: {
      id: idRef.value,
      shared: share.value,
      shareMainMenu: shareMainMenu.value,
      shareIsroles: shareIsroles.value,
      selectedSharedMenu: selectedSharedMenu.value,
      shareFormsMenuIcon: shareFormsMenuIcon.value,
      selectedTableRoles: selectedTableRoles.value,
    },
  }).onOk(async (val) => {
    share.value = val.emails;
    shareMainMenu.value = val.isMainMenu;
    shareIsroles.value = val.isRoles;
    selectedSharedMenu.value = val.selectedSharedMenu;
    shareFormsMenuIcon.value = val.shareFormsMenuIcon;
  });
};

const onClickSetupTraining = () => {
  $q.dialog({
    component: setupTraining,
    componentProps: {
      isForm: true,
      setupTrainingSetup: setupTrainingSetup.value,
    },
  }).onOk(async (val) => {
    setupTrainingSetup.value = val;
    // forms.value[idxForm].content = val;
  });
};

const onClickLogicField = (pageSel, colSel) => {
  $q.dialog({
    component: showLogicField,
    componentProps: {
      forms: forms.value,
      page: pageSel,
      colsIdx: colSel,
      logics: logicsFields.value,
    },
  }).onOk(async (val) => {
    const idRows = forms.value.findIndex((fi) => fi.seq_name == pageSel);

    forms.value[idRows].content[colSel].logics = val;
    // logicsFields.value = val;
  });
};

const onClickLogicForms = () => {
  $q.dialog({
    component: showLogicForms,
    componentProps: {
      forms: forms.value,
      events: formEvents.value,
    },
  }).onOk(async (val) => {
    formEvents.value = val;
  });
};
</script>
