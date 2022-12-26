<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col q-pr-md">
        <q-input outlined label="Question Bank Title" :v-model="title" dense />
      </div>
      <div class="col-3 text-right">
        <q-btn-group>
          <q-btn color="green" icon="save">
            <q-tooltip> Save question bank. </q-tooltip>
          </q-btn>
          <q-btn color="accent" icon="add" @click="onClickChooseComponent">
            <q-tooltip> Add more question. </q-tooltip>
          </q-btn>
          <q-btn color="primary" icon="search">
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
                  <div class="col q-px-md">
                    <q-btn
                      round
                      dense
                      flat
                      icon="add"
                      @click="addDetail(idxCol)"
                      color="green"
                    />
                  </div>
                </div>

                <componentViewVue
                  :type="col.content.component.category"
                  :type-input="col.content.component.value.type"
                  :comp="col.content.component.value.comp"
                  :label="col.content.label"
                  :detail="col.content.detail_data"
                  mode="live"
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
import { ref } from "vue";
import { useQuasar } from "quasar";
import componentViewVue from "../componentView.vue";
import chooseComponent from "../chooseComponent.vue";

import setupTraining from "./setupTraining.vue";

const $q = useQuasar();

const title = ref("");
const forms = ref([]);
const setupTrainingSetup = ref({
  defaultTypeChoice: "multiple-radio",
  defaultNumberOfChoice: "1",
  showResult: true,
  randomizeQuestion: true,
  showRightKeysAnswer: true,
  showRightKeysAnswerLocation: "end",
});

const chooseOptions = ref([
  {
    label: "Dropdown Select",
    category: "multiple",
    value: {
      type: "multiple-select",
      comp: "q-select",
    },
  },
  {
    label: "Multiple Checkbox",
    category: "multiple",
    value: {
      type: "multiple-checkbox",
      comp: "q-checkbox",
    },
  },
  {
    label: "Multiple Choice",
    category: "multiple",
    value: {
      type: "multiple-radio",
      comp: "q-radio",
    },
  },
]);

const addDetail = (idx) => {
  forms.value[idx].content.detail_data.push({
    col_det_id: "opt-" + forms.value[idx].content.detail_data.length + 1,
    col_det_label: "",
    value: forms.value[idx].content.detail_data.length + 1,
    label: "",
  });
};

const onClickChooseComponent = (idxForm = {}) => {
  $q.dialog({
    component: chooseComponent,
    componentProps: {
      currComponent:
        forms.value[idxForm] && forms.value[idxForm].content
          ? forms.value[idxForm].content
          : {
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
            },
    },
  }).onOk(async (val) => {
    forms.value.push(val);
    // forms.value[idxForm].content = val;
  });
};

const onClickSetupTraining = () => {
  $q.dialog({
    component: setupTraining,
    componentProps: setupTrainingSetup,
  }).onOk(async (val) => {
    console.log(val);
    // forms.value[idxForm].content = val;
  });
};
</script>
