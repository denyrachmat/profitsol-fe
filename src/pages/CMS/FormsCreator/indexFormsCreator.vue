<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-btn-group flat>
          <q-btn color="primary" label="File" flat no-caps>
            <q-menu>
              <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup>
                  <q-item-section>New Forms</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="onClickOpenTraining">
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
        <q-input outlined label="Forms Title" v-model="title" dense />
      </div>
      <div class="col-1 text-right">
        <q-btn-group>
          <q-btn
            color="accent"
            icon="add"
            @click="onClickAddRows"
            :disable="!title"
          >
            <q-tooltip> Add Rows. </q-tooltip>
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
            max-height: 73vh;
            overflow: auto;
          "
        >
          <legend>Forms add here</legend>

          <div class="row q-py-md" v-if="forms.length > 0">
            <div class="col">
              <q-card
                v-for="(form, index) in forms"
                :key="index"
                class="q-mb-sm"
              >
                <q-card-section>
                  <div class="row">
                    <div class="col-4">
                      <span class="text-h6">Rows {{ index + 1 }}</span>
                    </div>
                    <div class="col text-right">
                      <q-btn
                        icon="fa fa-table-columns"
                        color="indigo"
                        @click="onClickAddColumns(index)"
                        flat
                        dense
                      >
                        <q-tooltip> Add Columns</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="delete"
                        color="red"
                        @click="onClickDeleteForm(index)"
                        flat
                        dense
                      >
                        <q-tooltip> Delete this rows</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="arrow_upward"
                        color="cyan"
                        @click="onClickSwap(index, 'up')"
                        flat
                        dense
                        :disable="index === 0"
                      >
                        <q-tooltip> Swap above rows</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="arrow_downward"
                        color="cyan"
                        @click="onClickSwap(index, 'down')"
                        flat
                        dense
                        :disable="index === forms.length - 1"
                      >
                        <q-tooltip> Swap below rows</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                  <div class="row">
                    <div
                      class="col"
                      v-for="(col, indexCol) in form.content"
                      :key="indexCol"
                    >
                      <fieldset
                        style="
                          border: 1px solid #ccc !important;
                          border-radius: 16px;
                          max-height: 80vh;
                          overflow: auto;
                        "
                      >
                        <legend>Columns - {{ indexCol + 1 }}</legend>

                        <div class="row">
                          <div class="col text-right">
                            <q-btn
                              icon="fa fa-list-ul"
                              color="cyan"
                              @click="
                                onClickChooseComponent(index, indexCol, col)
                              "
                              flat
                              dense
                            >
                              <q-tooltip> Add Components</q-tooltip>
                            </q-btn>
                            <q-btn
                              icon="html"
                              color="orange"
                              @click="
                                onClickChooseHTML(index, indexCol, col.content)
                              "
                              flat
                              dense
                            >
                              <q-tooltip> Add HTML</q-tooltip>
                            </q-btn>
                            <q-btn
                              icon="delete"
                              color="red"
                              @click="onClickDeleteForm(index, indexCol)"
                              flat
                              dense
                              :disable="indexCol === 0"
                            >
                              <q-tooltip> Delete this column</q-tooltip>
                            </q-btn>
                            <q-btn
                              icon="arrow_back"
                              color="cyan"
                              @click="onClickSwap(index, 'left', indexCol)"
                              flat
                              dense
                              :disable="indexCol === 0"
                            >
                              <q-tooltip> Swap to left</q-tooltip>
                            </q-btn>
                            <q-btn
                              icon="arrow_forward"
                              color="cyan"
                              @click="onClickSwap(index, 'right', indexCol)"
                              flat
                              dense
                              :disable="indexCol === form.content.length - 1"
                            >
                              <q-tooltip> Swap to Right</q-tooltip>
                            </q-btn>
                            <q-btn
                              icon="fa fa-brain"
                              color="purple"
                              @click="onClickLogics(index, indexCol)"
                              flat
                              dense
                              :disable="col.type !== 'form'"
                            >
                              <q-tooltip>
                                Add logic for this component</q-tooltip
                              >
                              <q-badge
                                v-if="col.type === 'form'"
                                color="green"
                                floating
                                align="top right"
                                class="q-mt-xs q-mr-xs"
                                :label="col.logics ? col.logics.length : 0"
                              ></q-badge>
                            </q-btn>
                          </div>
                        </div>

                        <div
                          v-if="col.type === 'html'"
                          v-html="col.content"
                        ></div>
                        <template v-else>
                          <componentViewVue
                            v-if="col.content.component"
                            :type="col.content.component.category"
                            :type-input="col.content.component.value.type"
                            :comp="col.content.component.value.comp"
                            :label="`${col.content.label} ${
                              col.required ? '*' : ''
                            }`"
                            :detail="col.content.detail_data"
                            mode="live-ans"
                            @customAnschange="
                              (val) => onChooseValue(val, index)
                            "
                            :key="index + 'color'"
                          />
                          <template v-else>Not add component yet</template>
                        </template>
                      </fieldset>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <div class="row q-py-md" v-else>
            <div class="col">
              <div class="text-h6 text-center">No forms added yet</div>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";

import chooseComponent from "../chooseComponent.vue";
import addContentComponent from "../addContentComponent.vue";
import componentViewVue from "../componentView.vue";
import viewLogicHeaderForms from "./viewLogicsHeaderForms.vue";
import openTraining from "../Training/openTraining.vue";
import apiRequest from "src/components/apiRequest";
import previewComponentVue from "../Forms/previewComponent.vue";

const { postData } = apiRequest();

const $q = useQuasar();
const title = ref("");
const idRef = ref(null);
const forms = ref([]);
const setupTrainingSetup = ref([]);

const initChoice = ref({
  content: {
    label: "",
    component: {
      label: "Multiple Choice",
      category: "multiple",
      value: { type: "multiple-radio", comp: "q-radio" },
    },
    detail_data: [],
  },
  value: null,
});

const onClickChooseComponent = (index, indexCol, formData = null) => {
  console.log(formData);
  $q.dialog({
    component: chooseComponent,
    componentProps: {
      currComponent: formData.type === "form" ? formData : null,
    },
  }).onOk(async (val) => {
    forms.value[index].content[indexCol] = val;
    console.log(formData);
    console.log(forms.value);
  });
};

const onClickChooseHTML = (index, indexCol, col) => {
  console.log(col);
  $q.dialog({
    component: addContentComponent,
    componentProps: {
      comp: col ? col.content : "",
    },
  }).onOk(async (val) => {
    console.log(val);
    forms.value[index].content[indexCol] = val;
    console.log(forms.value);
  });
};

const onClickAddRows = () => {
  forms.value.push({
    type: "row",
    content: [
      {
        content: {
          content: null,
          type: "col",
        },
      },
    ],
  });
};

const onClickAddColumns = (index) => {
  forms.value[index].content.push({
    content: {
      content: [],
      type: "col",
    },
  });
};

const onClickDeleteForm = (rowIndex, colIndex = null) => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure you want to delete this item?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      if (colIndex === null) {
        // Delete the entire row
        forms.value.splice(rowIndex, 1);
      } else {
        // Delete a specific column within a row
        forms.value[rowIndex].content.splice(colIndex, 1);
      }
    })
    .onCancel(() => {
      // User cancelled the action
    });
};

const onClickSwap = (index, direction, indexCol = null) => {
  if (direction === "up" && index > 0) {
    const temp = forms.value[index];
    forms.value[index] = forms.value[index - 1];
    forms.value[index - 1] = temp;
  } else if (direction === "down" && index < forms.value.length - 1) {
    const temp = forms.value[index];
    forms.value[index] = forms.value[index + 1];
    forms.value[index + 1] = temp;
  } else if (direction === "left" && indexCol !== null && indexCol > 0) {
    const temp = forms.value[index].content[indexCol];
    forms.value[index].content[indexCol] =
      forms.value[index].content[indexCol - 1];
    forms.value[index].content[indexCol - 1] = temp;
  } else if (
    direction === "right" &&
    indexCol !== null &&
    indexCol < forms.value[index].content.length - 1
  ) {
    const temp = forms.value[index].content[indexCol];
    forms.value[index].content[indexCol] =
      forms.value[index].content[indexCol + 1];
    forms.value[index].content[indexCol + 1] = temp;
  }
};

const onClickLogics = (index, indexCol) => {
  $q.dialog({
    component: viewLogicHeaderForms,
    componentProps: {
      comp: forms.value[index].content[indexCol],
      forms: forms.value,
      logics: forms.value[index].content[indexCol].logics,
    },
  }).onOk(async (val) => {
    forms.value[index].content[indexCol].logics = val;
  });
};

const onClickOpenTraining = () => {
  $q.dialog({
    component: openTraining,
    componentProps: {
      type: "forms",
    },
  }).onOk(async (val) => {
    forms.value = val.forms;
    title.value = val.title;
    idRef.value = val.id;
  });
};

const openPreview = () => {
  $q.dialog({
    component: previewComponentVue,
    componentProps: {
      data: forms.value,
      setup: setupTrainingSetup.value,
      id: idRef.value,
      mode: "form",
      idDet: [],
    },
  }).onOk(async (val) => {
    console.log(val);
  });
};

const onSaveQuestion = () => {
  console.log(forms.value);
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
        title: title.value,
        isQuiz: false,
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
</script>
