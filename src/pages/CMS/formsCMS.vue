<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-input label="Form Title" dense outlined v-model="formTitle" />
      </div>
      <div class="col-2 text-right">
        <q-btn-group>
          <q-btn color="green" icon="save" @click="onAddRows">
            <q-tooltip>Save this forms</q-tooltip>
          </q-btn>
          <q-btn color="purple" icon="add" @click="onAddRows">
            <q-tooltip>Add rows </q-tooltip>
          </q-btn>
          <q-btn color="cyan" icon="search">
            <q-tooltip>Open created forms</q-tooltip>
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
              borderless
              class="q-ml-md"
              v-model="form.rows_seq_name"
              input-class="text-h6"
            ></q-input>
            <!-- <div class="col text-h4 text-bold">Rows 1</div> -->
            <div class="col text-right">
              <q-btn-group outline>
                <q-btn
                  color="green"
                  icon="add"
                  @click="onAddCols(idxForm)"
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
              class="col text-center q-pa-md"
              style="border: 1px dashed #ccc !important; border-radius: 5px"
              v-for="(col, idxCol) in form.cols"
              :key="idxCol + 'col'"
            >
              <div>
                <q-btn-group flat>
                  <q-btn
                    color="green"
                    icon="list_alt"
                    flat
                    @click="onClickChooseComponent(idxForm, idxCol)"
                  >
                    <q-tooltip>Add forms component here</q-tooltip>
                  </q-btn>
                  <q-btn
                    color="cyan"
                    icon="integration_instructions"
                    flat
                    @click="onClickAddContent(idxForm, idxCol)"
                  >
                    <q-tooltip>Add HTML content here</q-tooltip>
                  </q-btn>
                  <q-btn
                    color="red"
                    icon="delete"
                    flat
                    @click="form.cols.splice(idxCol, 1)"
                  >
                    <q-tooltip>Delete this column</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </div>
              <template v-if="!col.type">
                <div class="q-pt-md text-italic">Add form component here</div>
              </template>

              <template v-if="col.type === 'form'">
                <componentViewVue
                  :type="col.content.component.answer"
                  :comp="col.content.component.value.comp"
                  :label="col.content.label"
                  :detail="col.content.detail_data"
                  :mode="live"
                />
              </template>
              <div v-if="col.type === 'html'" v-html="col.content"></div>
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

const $q = useQuasar();

const formTitle = ref("");
const forms = ref([]);
const formsInit = {
  rows_seq_name: "",
  cols: [],
};

const onAddRows = () => {
  // formsInit.rows_seq_name = `Rows ${forms.value.length + 1}`;
  forms.value.push({
    rows_seq_name: `${forms.value.length + 1}`,
    cols: [
      {
        type: "",
        content: {},
      },
    ],
  });
};

const onAddCols = (idx) => {
  forms.value[idx].cols.push({
    content: {},
  });
};

const onClickChooseComponent = (idxForm, idxCol) => {
  $q.dialog({
    component: chooseComponent,
  }).onOk(async (val) => {
    console.log(val);
    forms.value[idxForm].cols[idxCol] = val;
  });
};

const onClickAddContent = (idxForm, idxCol) => {
  $q.dialog({
    component: addContentComponent,
  }).onOk(async (val) => {
    console.log(val);
    forms.value[idxForm].cols[idxCol] = val;
  });
};
</script>
