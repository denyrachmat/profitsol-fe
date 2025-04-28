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
                <q-item clickable v-close-popup @click="openTraining">
                  <q-item-section>Open...</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="onSaveQuestion"
                  :disable="!title || valueSubmited.length !== forms.length"
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
            max-height: 80vh;
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
                              @click="onClickDeleteForm(index, indexCol)"
                              flat
                              dense
                              :disable="indexCol === 0"
                            >
                              <q-tooltip> Swap to left</q-tooltip>
                            </q-btn>
                            <q-btn
                              icon="arrow_forward"
                              color="cyan"
                              @click="onClickDeleteForm(index, indexCol)"
                              flat
                              dense
                              :disable="indexCol === form.content.length - 1"
                            >
                              <q-tooltip> Swap to Right</q-tooltip>
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
                            :label="col.content.label"
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
import { useDialogPluginComponent } from "quasar";

import chooseComponent from "../chooseComponent.vue";
import addContentComponent from "../addContentComponent.vue";
import componentViewVue from "../componentView.vue";

const $q = useQuasar();
const title = ref("");
const idRef = ref(null);
const forms = ref([]);

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
</script>
