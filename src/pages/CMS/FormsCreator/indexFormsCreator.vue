<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-btn-group flat v-if="!props.mode">
          <q-btn color="primary" label="File" flat no-caps>
            <q-menu>
              <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup>
                  <q-item-section>New Forms</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="onClickOpenTraining">
                  <q-item-section>Open... (CTRL + O)</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="onSaveQuestion"
                  :disable="!title"
                >
                  <q-item-section>Save Forms (CTRL + S)</q-item-section>
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
    <div class="row q-py-sm">
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
          <q-btn
            color="primary"
            icon="save"
            @click="onSaveQuestion"
            :disable="!title"
            v-if="props.mode && props.mode == '2'"
          >
            <q-tooltip> Save. </q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </div>
    <div class="row" v-if="props.mode && props.mode == '2'">
      <div class="col">
        <q-input
          outlined
          dense
          v-model="desc"
          placeholder="Page Description"
          clearable
          class="q-mb-md"
          type="textarea"
        />
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
                        :disable="forms && index === forms.length - 1"
                      >
                        <q-tooltip> Swap below rows</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                  <div class="row">
                    <div
                      :class="col.width ? `col-${col.width}` : 'col'"
                      v-for="(col, indexCol) in form.content"
                      :key="indexCol"
                    >
                      <fieldset
                        style="
                          border: 1px solid #ccc !important;
                          border-radius: 16px;
                          max-height: 80vh;
                          overflow: auto;
                          max-width: 100%;
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
                              v-if="!props.mode"
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
                              icon="width_wide"
                              color="indigo"
                              @click="
                                onClickWidthCustom(index, indexCol, col.content)
                              "
                              flat
                              dense
                              v-if="props.mode && props.mode === '2'"
                            >
                              <q-tooltip> Change width columns</q-tooltip>
                            </q-btn>
                            <q-btn
                              icon="post_add"
                              color="indigo"
                              @click="
                                onClickLatestPost(index, indexCol, col.content)
                              "
                              flat
                              dense
                              v-if="props.mode && props.mode === '2'"
                            >
                              <q-tooltip> Add Latest Post</q-tooltip>
                            </q-btn>
                            <q-btn
                              icon="cases"
                              color="indigo"
                              @click="
                                onClickFilesAddon(index, indexCol, col.content)
                              "
                              flat
                              dense
                              v-if="props.mode && props.mode === '2'"
                            >
                              <q-tooltip>
                                Add Files / Folders Explore</q-tooltip
                              >
                            </q-btn>
                            <q-btn
                              icon="file_present"
                              color="indigo"
                              @click="
                                onClickFilesViewer(index, indexCol, col.content)
                              "
                              flat
                              dense
                              v-if="props.mode && props.mode === '2'"
                            >
                              <q-tooltip>Show files</q-tooltip>
                            </q-btn>
                            <!-- props.mode && props.mode === "2" -->
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

                        <div v-else-if="col.type === 'posts'">
                          <div class="row q-col-gutter-md">
                            <div class="col-12">
                              <q-input
                                v-model="col.content.title"
                                filled
                                dense
                                label="Title"
                              />
                            </div>
                            <div class="col-12">
                              <q-input
                                v-model="col.content.desc"
                                filled
                                dense
                                label="Description"
                                type="textarea"
                              />
                            </div>
                            <div class="col-12">
                              <span class="text-bold">Show Mode</span>
                              <div class="q-gutter-sm">
                                <q-radio
                                  left-label
                                  v-model="col.content.mode"
                                  val="last"
                                  label="Last Post Only"
                                />
                                <q-radio
                                  left-label
                                  v-model="col.content.mode"
                                  val="list"
                                  label="List Only"
                                />
                                <q-radio
                                  left-label
                                  v-model="col.content.mode"
                                  val="all"
                                  label="Show Both"
                                />
                              </div>
                            </div>
                            <div class="col-12">
                              <hr />
                            </div>
                            <div class="col">
                              <q-select
                                v-model="col.content.tags"
                                multiple
                                filled
                                dense
                                label="Category"
                                :options="listTags"
                                emit-value
                                map-options
                                use-chips
                              />
                            </div>
                            <div class="col">
                              <!-- orderBy order layout maxShow -->
                              <q-select
                                v-model="col.content.orderBy"
                                filled
                                dense
                                label="Order By"
                                :options="[
                                  {
                                    label: 'Created At',
                                    value: 'created_at',
                                  },
                                  {
                                    label: 'Updated At',
                                    value: 'updated_at',
                                  },
                                  { label: 'Title', value: 'title' },
                                ]"
                                emit-value
                                map-options
                                use-chips
                              />
                            </div>
                            <div class="col">
                              <!-- orderBy order layout maxShow -->
                              <q-select
                                v-model="col.content.order"
                                filled
                                dense
                                label="Sort Order"
                                :options="[
                                  {
                                    label: 'Ascending',
                                    value: 'asc',
                                  },
                                  {
                                    label: 'Descending',
                                    value: 'desc',
                                  },
                                ]"
                                emit-value
                                map-options
                                use-chips
                              />
                            </div>
                            <template
                              v-if="
                                col.content.mode === 'all' ||
                                col.content.mode === 'list'
                              "
                            >
                              <div class="col-12">
                                <q-select
                                  v-model="col.content.layout"
                                  filled
                                  dense
                                  label="Layout"
                                  :options="[
                                    {
                                      label: 'Grid',
                                      value: 'grid',
                                      icon: 'grid_on',
                                    },
                                    {
                                      label: 'List',
                                      value: 'list',
                                      icon: 'view_list',
                                    },
                                  ]"
                                  emit-value
                                  map-options
                                  use-chips
                                />
                              </div>
                              <div
                                class="col-6"
                                v-if="col.content.layout === 'grid'"
                              >
                                <q-input
                                  v-model="col.content.perSlide"
                                  filled
                                  dense
                                  type="number"
                                  label="Max Show per slide"
                                  min="1"
                                  max="10"
                                />
                              </div>
                              <div class="col">
                                <q-input
                                  v-model="col.content.maxShow"
                                  filled
                                  dense
                                  type="number"
                                  label="Max Show"
                                  min="1"
                                  max="10"
                                />
                              </div>
                            </template>
                          </div>
                        </div>

                        <div
                          v-else-if="
                            col.type === 'files' || col.type === 'files_viewer'
                          "
                        >
                          <div class="row q-col-gutter-md">
                            <div class="col-8">
                              <span class="text-bold">Show Mode</span>
                              <div class="q-gutter-sm">
                                <q-radio
                                  left-label
                                  v-model="col.content.mode"
                                  val="last"
                                  label="Last Files Only"
                                />
                                <q-radio
                                  left-label
                                  v-model="col.content.mode"
                                  val="list"
                                  label="List Only"
                                />
                                <q-radio
                                  left-label
                                  v-model="col.content.mode"
                                  val="all"
                                  label="Show Both"
                                />
                              </div>
                            </div>
                            <div class="col-4">
                              <q-btn
                                color="primary"
                                label="Choose Folder"
                                @click="
                                  $q.dialog({
                                    component: folderFilesChooser,
                                    componentProps: {
                                      propsSelectedFolders:
                                        col.content.files ?? null,
                                      usernameSetup:
                                        col.content.username ??
                                        store.getDetail.username,
                                      folderOnly: col.type === 'files',
                                    },
                                  }).onOk(async (val) => {
                                    console.log(val);
                                    col.content.files = val;
                                  })
                                "
                                dense
                                outline
                                class="full-width"
                              >
                                <q-badge
                                  floating
                                  color="red"
                                  v-if="col.content.files"
                                  >{{ col.content.files.length }}</q-badge
                                >
                              </q-btn>
                            </div>
                            <div class="col-12">
                              <hr />
                            </div>
                            <div class="col">
                              <!-- orderBy order layout maxShow -->
                              <q-select
                                v-model="col.content.orderBy"
                                filled
                                dense
                                label="Order By"
                                :options="[
                                  {
                                    label: 'Created At',
                                    value: 'created_at',
                                  },
                                  {
                                    label: 'Updated At',
                                    value: 'updated_at',
                                  },
                                  { label: 'Title', value: 'title' },
                                ]"
                                emit-value
                                map-options
                                use-chips
                              />
                            </div>
                            <div class="col">
                              <!-- orderBy order layout maxShow -->
                              <q-select
                                v-model="col.content.order"
                                filled
                                dense
                                label="Sort Order"
                                :options="[
                                  {
                                    label: 'Ascending',
                                    value: 'asc',
                                  },
                                  {
                                    label: 'Descending',
                                    value: 'desc',
                                  },
                                ]"
                                emit-value
                                map-options
                                use-chips
                              />
                            </div>
                            <template
                              v-if="
                                col.content.mode === 'all' ||
                                col.content.mode === 'list'
                              "
                            >
                              <div class="col-12">
                                <q-select
                                  v-model="col.content.layout"
                                  filled
                                  dense
                                  label="Layout"
                                  :options="[
                                    {
                                      label: 'Grid',
                                      value: 'grid',
                                      icon: 'grid_on',
                                    },
                                    {
                                      label: 'List',
                                      value: 'list',
                                      icon: 'view_list',
                                    },
                                  ]"
                                  emit-value
                                  map-options
                                  use-chips
                                />
                              </div>
                              <div class="col">
                                <q-input
                                  v-model="col.content.maxShow"
                                  filled
                                  dense
                                  type="number"
                                  label="Max Show"
                                  min="1"
                                  max="10"
                                />
                              </div>
                            </template>
                          </div>
                        </div>
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
import { ref, onMounted, onBeforeUnmount, watch, defineEmits } from "vue";
import { useQuasar } from "quasar";

import chooseComponent from "../chooseComponent.vue";
import addContentComponent from "../addContentComponent.vue";
import componentViewVue from "../componentView.vue";
import viewLogicHeaderForms from "./viewLogicsHeaderForms.vue";
import openTraining from "../Training/openTraining.vue";
import apiRequest from "src/components/apiRequest";
import previewComponentVue from "../Forms/previewComponent.vue";
import viewSetupForms from "./viewSetupForms.vue";
import shareFormsVue from "../Forms/shareForms.vue";
// import indexPostManage from "src/pages/UpdateFP/components/postManage/indexPostManage.vue";
import multiplePromptDialog from "src/components/multiplePromptDialog.vue";

import folderFilesChooser from "src/pages/UpdateFP/components/pageManage/folderFilesChooser.vue";

import { useAuthStore } from "src/stores/authStore";

const { postData } = apiRequest();
const emit = defineEmits(["save"]);

const store = useAuthStore();

const $q = useQuasar();
const title = ref("");
const desc = ref("");
const idRef = ref(null);
const forms = ref([]);
const setupTrainingSetup = ref([]);
const share = ref([]);
const shareMainMenu = ref(false);
const shareIsroles = ref(false);
const shareFormsMenuIcon = ref("");
const selectedSharedMenu = ref("");
const selectedTableRoles = ref([]);
const listTags = ref([]);
const props = defineProps({
  mode: String,
  dataForms: Array,
});

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

function handleKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "o") {
    event.preventDefault();
    onClickOpenTraining();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    onSaveQuestion();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);

  if (props.mode && props.mode === "2") {
    title.value = props.dataForms.title || "New Form";
    desc.value = props.dataForms.desc || "New Description";
    idRef.value = props.dataForms.id || null;
    forms.value = props.dataForms.forms || [
      {
        type: "row",
        content: [
          {
            content: {
              content: null,
              type: "col",
            },
          },
        ],
      },
    ];
  }

  getDataTags();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

const onClickChooseComponent = (index, indexCol, formData = null) => {
  console.log(formData);
  $q.dialog({
    component: chooseComponent,
    componentProps: {
      currComponent: formData.type === "form" ? formData : null,
      forms: forms.value,
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
      comp: typeof col === "object" ? col.content : col,
    },
  }).onOk(async (val) => {
    console.log(val.content);
    forms.value[index].content[indexCol] = val;
    console.log(forms.value);
  });
};

const onClickLatestPost = (index, indexCol, col) => {
  forms.value[index].content[indexCol] = {
    type: "posts",
    content: {
      title: "",
      desc: "",
      tags: [],
      orderBy: "created_at",
      order: "desc",
      layout: "grid",
      maxShow: 5,
      perSlide: 1,
    },
  };
};

const onClickFilesAddon = (index, indexCol, col) => {
  forms.value[index].content[indexCol] = {
    type: "files",
    content: {
      files: null,
      orderBy: "created_at",
      order: "desc",
      layout: "grid",
      maxShow: 5,
      username: store.getDetail.username || store.getDetail.email || "guest",
    },
  };
};

const onClickFilesViewer = (index, indexCol, col) => {
  forms.value[index].content[indexCol] = {
    type: "files_viewer",
    content: {
      files: null,
      orderBy: "created_at",
      order: "desc",
      layout: "grid",
      maxShow: 5,
      username: store.getDetail.username || store.getDetail.email || "guest",
    },
  };
};

const onClickWidthCustom = (index, indexCol, col) => {
  const defaultLen = 12 / forms.value[index].content.length;
  console.log(forms.value[index].content[indexCol]);

  $q.dialog({
    component: multiplePromptDialog,
    componentProps: {
      title: "Change Width Columns",
      initialFields: [
        {
          label: `Column ${indexCol + 1} Width`,
          default:
            parseInt(forms.value[index].content[indexCol].width) || defaultLen,
          type: "number",
          min: 1,
          max: 12,
          name: "width",
        },
      ],
    },
  }).onOk(async (values) => {
    console.log(values);
    forms.value[index].content[indexCol] = {
      ...forms.value[index].content[indexCol],
      ...values,
    };
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
    temp.seq_name = index - 1;

    forms.value[index] = forms.value[index - 1];
    forms.value[index - 1] = temp;
  } else if (direction === "down" && index < forms.value.length - 1) {
    const temp = forms.value[index];
    temp.seq_name = index + 1;

    forms.value[index] = forms.value[index + 1];
    forms.value[index + 1] = temp;
  } else if (direction === "left" && indexCol !== null && indexCol > 0) {
    const temp = forms.value[index].content[indexCol];
    temp.seq_name = indexCol - 1;

    forms.value[index].content[indexCol] =
      forms.value[index].content[indexCol - 1];
    forms.value[index].content[indexCol - 1] = temp;
  } else if (
    direction === "right" &&
    indexCol !== null &&
    indexCol < forms.value[index].content.length - 1
  ) {
    const temp = forms.value[index].content[indexCol];
    temp.seq_name = indexCol + 1;

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

function updateRowSeqNamesInPlace(data) {
  data.forEach((row, index) => {
    if (row.type === "row") {
      row.seq_name = (index + 1).toString();
    }
  });
  return data;
}

const onClickOpenTraining = () => {
  $q.dialog({
    component: openTraining,
    componentProps: {
      type: "forms",
    },
  }).onOk(async (val) => {
    forms.value = updateRowSeqNamesInPlace(val.forms);
    setupTrainingSetup.value = val.setupTraining;
    title.value = val.title;
    idRef.value = val.id;
    share.value = val.share;
    shareMainMenu.value = val.shareFormsIsMainMenu;
    shareIsroles.value = val.shareFormsIsRoles;
    shareFormsMenuIcon.value = val.shareFormsMenuIcon;
    selectedTableRoles.value = val.shareFormsRoleID;
    selectedSharedMenu.value = val.selectedSharedMenu;
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
  $q.dialog({
    title: "Confirm",
    message: "Do you really want to save this forms ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const data = await postData(
      "post",
      {
        idRef: idRef.value,
        forms: forms.value,
        title: title.value,
        desc: desc.value,
        isQuiz: props.mode ?? false,
        setupTraining: setupTrainingSetup.value,
        shareForms: share.value,
        shareFormsIsMainMenu: shareMainMenu.value,
        shareFormsIsRoles: shareIsroles.value,
        selectedSharedMenu: selectedSharedMenu.value,
        shareFormsMenuIcon: shareFormsMenuIcon.value,
      },
      `cms/forms`,
      false,
      true,
      true
    );

    if (data) {
      $q.dialog({
        title: "Confirm",
        message: "Save Success, Do you want to continue edit this forms ?",
        cancel: true,
        persistent: true,
      })
        .onOk(async () => {})
        .onCancel(() => {
          title.value = "";
          forms.value = [];
          emit("save", data);
        });
      console.log(data);
    }
  });
  // console.log(forms.value);
};

const onClickSetupTraining = () => {
  $q.dialog({
    component: viewSetupForms,
    componentProps: {
      setupTrainingSetup: setupTrainingSetup.value,
      forms: forms.value,
    },
  }).onOk(async (val) => {
    setupTrainingSetup.value = val;
  });
};

const onClickShare = () => {
  $q.dialog({
    component: shareFormsVue,
    componentProps: {
      id: idRef.value,
      shared: share.value,
      selectedTableRoles: selectedTableRoles.value,
      shareMainMenu: shareMainMenu.value,
      shareIsroles: shareIsroles.value,
      selectedSharedMenu: selectedSharedMenu.value,
      shareFormsMenuIcon: shareFormsMenuIcon.value,
    },
  }).onOk(async (val) => {
    console.log(val);
    share.value = val.emails;
    shareMainMenu.value = val.isMainMenu;
    shareIsroles.value = val.isRoles;
    shareFormsMenuIcon.value = val.shareFormsMenuIcon;
    selectedSharedMenu.value = val.selectedSharedMenu;
  });
};

watch(
  [
    title,
    forms,
    setupTrainingSetup,
    share,
    shareMainMenu,
    shareIsroles,
    shareFormsMenuIcon,
    selectedSharedMenu,
    selectedTableRoles,
  ],
  (
    [
      newTitle,
      newForms,
      newSetup,
      newShare,
      newMainMenu,
      newIsroles,
      newMenuIcon,
      newSharedMenu,
      newTableRoles,
    ],
    [
      oldTitle,
      oldForms,
      oldSetup,
      oldShare,
      oldMainMenu,
      oldIsroles,
      oldMenuIcon,
      oldSharedMenu,
      oldTableRoles,
    ]
  ) => {
    console.log("Watched values changed:", {
      title: [oldTitle, newTitle],
      forms: [oldForms, newForms],
      setupTrainingSetup: [oldSetup, newSetup],
      share: [oldShare, newShare],
      shareMainMenu: [oldMainMenu, newMainMenu],
      shareIsroles: [oldIsroles, newIsroles],
      shareFormsMenuIcon: [oldMenuIcon, newMenuIcon],
      selectedSharedMenu: [oldSharedMenu, newSharedMenu],
      selectedTableRoles: [oldTableRoles, newTableRoles],
    });
    if (
      Object.entries({
        title: [oldTitle, newTitle],
        forms: [oldForms, newForms],
        setupTrainingSetup: [oldSetup, newSetup],
        share: [oldShare, newShare],
        shareMainMenu: [oldMainMenu, newMainMenu],
        shareIsroles: [oldIsroles, newIsroles],
        shareFormsMenuIcon: [oldMenuIcon, newMenuIcon],
        selectedSharedMenu: [oldSharedMenu, newSharedMenu],
        selectedTableRoles: [oldTableRoles, newTableRoles],
      }).filter(([key, [oldVal, newVal]]) => {
        // Skip notification if oldVal is empty (null, undefined, or empty string/array/object)
        if (
          oldVal === null ||
          oldVal === undefined ||
          (typeof oldVal === "string" && oldVal === "") ||
          (Array.isArray(oldVal) && oldVal.length === 0) ||
          (typeof oldVal === "object" &&
            !Array.isArray(oldVal) &&
            Object.keys(oldVal).length === 0)
        ) {
          return false;
        }
        return true;
      })
      // }).some(([key, [oldVal, newVal]]) => JSON.stringify(oldVal) !== JSON.stringify(newVal))
    ) {
      $q.notify({
        type: "info",
        message: "Some form data has changed, please save your changes.",
        position: "top",
        icon: "info",
        color: "blue",
        persistent: true,
        timeout: 10000,
      });
    }
  },
  { deep: true }
);

const getDataTags = async () => {
  try {
    const response = await postData(
      "post",
      {
        filter: [],
        selectAs: {
          value: "pgm_value|string",
          label: "pgm_value|string",
          slug: "pgm_value2|string",
          desc: "pgm_desc|string",
        },
      },
      `portal/gencode/showDetail/FP_POST_TAGS`,
      false,
      false,
      true
    );

    console.log("Response Data:", response);
    if (response.data) {
      listTags.value = response.data;
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to fetch category",
    });
  }
};
</script>
