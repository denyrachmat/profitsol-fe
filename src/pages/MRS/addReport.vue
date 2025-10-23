<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-stepper v-model="step" ref="stepper" color="primary" animated keep-alive>
      <q-step
        :name="1"
        title="Select Database Connection"
        icon="settings"
        :done="step > 1"
      >
        <q-select
          filled
          v-model="mdm_id"
          :options="listConnection"
          label="Choose Connection"
          @update:model-value="onChooseConn"
          :loading="loading"
          emit-value
          map-options
        />
      </q-step>

      <q-step
        :name="2"
        title="Select Database"
        icon="storage"
        :done="step > 2"
        :disable="choosedConnection"
        style="max-height: 80vh; overflow: auto"
      >
        <div class="text-center full-width full-height" v-if="loading">
          <q-spinner-grid color="primary" size="5em" />
          <br />
          <br />
          <span>Generating list</span>
        </div>
        <template v-else>
          <div class="row">
            <div class="col">
              <q-input
                filled
                dense
                v-model="searchQuery"
                label="Search Database"
                @update:model-value="onSearchDB"
                debounce="300"
                clearable
              />
            </div>
          </div>
          <div class="row q-pt-sm">
            <div class="col" style="max-height: 70vh; overflow: auto">
              <q-list bordered dense separator>
                <q-item
                  clickable
                  v-ripple
                  v-for="(db, idx) in listDB"
                  :key="idx"
                  @click="onChooseDB(db)"
                  :active="db == choosedDB"
                  active-class="my-menu-link"
                >
                  <q-item-section avatar>
                    <q-icon color="primary" name="storage" />
                  </q-item-section>

                  <q-item-section>{{ db }}</q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </template>
      </q-step>

      <q-step
        :name="3"
        title="Select Table / View"
        icon="table_view"
        :done="step > 3"
        style="max-height: 70vh; overflow: auto"
        :disable="choosedConnection"
      >
        <div class="text-center full-width full-height" v-if="loading">
          <q-spinner-grid color="primary" size="5em" />
          <br />
          <br />
          <span>Generating list</span>
        </div>
        <template v-else>
          <div class="q-pb-sm row">
            <div class="col">
              <q-option-group
                v-model="methodsReport"
                :options="options"
                color="primary"
              />
            </div>
            <div class="col-8">
              <q-btn-group flat>
                <q-btn
                  :icon="
                    listCols.length === 0
                      ? 'play_arrow'
                      : validQuery
                      ? 'done_all'
                      : 'cancel'
                  "
                  flat
                  :color="
                    listCols.length === 0
                      ? 'orange'
                      : validQuery
                      ? 'green'
                      : 'red'
                  "
                  dense
                  @click="onClickRunning()"
                >
                  <q-tooltip v-if="listCols.length === 0">
                    Validate query
                  </q-tooltip>
                  <template v-else>
                    <q-tooltip v-if="validQuery"
                      >Validation Query Passed</q-tooltip
                    >
                    <q-tooltip v-else
                      >Validation Query Failed, check your query !</q-tooltip
                    >
                  </template>
                </q-btn>
              </q-btn-group>
              <editorCode v-model="code" />
            </div>
          </div>
          <hr />
          <q-list bordered dense separator>
            <q-item
              clickable
              v-ripple
              v-for="(table, idx) in listTables"
              :key="idx"
              @click="onChooseTableView(table)"
              :active="table == choosedTable"
              active-class="my-menu-link"
            >
              <q-item-section avatar>
                <q-icon color="primary" name="table_view" />
              </q-item-section>

              <q-item-section>{{ table }}</q-item-section>
            </q-item>
          </q-list>
        </template>
      </q-step>

      <q-step
        :name="4"
        title="Finish Your Report"
        icon="check"
        :done="step > 4"
        style="max-height: 70vh; overflow: auto"
        :disable="choosedConnection"
      >
        <!-- Loading data -->
        <div class="text-center full-width full-height" v-if="loading">
          <q-spinner-grid color="primary" size="5em" />
          <br />
          <br />
          <span>Generating list</span>
        </div>
        <!-- If data already loaded -->
        <template v-else>
          <div class="row q-pb-md">
            <div class="col">
              <q-input
                label="Report Title"
                filled
                dense
                v-model="reportTitle"
              />
            </div>
          </div>
          <div style="max-height: 50vh; overflow: auto">
            <q-list bordered class="rounded-borders">
              <q-expansion-item
                expand-separator
                icon="tune"
                label="Parameter settings (For Stored Procedure)"
                :disable="methodsReport != 'sp'"
              >
                <q-item
                  clickable
                  v-ripple
                  :active="methodsReport == 'sp'"
                  v-for="(params, idx) in listParamsConverted"
                  :key="idx"
                >
                  <q-item-section class="col-2 gt-sm">
                    <q-item-label lines="1">
                      <q-toggle v-model="params.active" label="Using Field ?" />
                    </q-item-label>
                  </q-item-section>

                  <q-item-section class="col-2 gt-sm">
                    <q-item-label lines="1">
                      <q-toggle
                        v-model="params.filterable"
                        label="Filterable ?"
                        :disable="!params.active"
                      />
                    </q-item-label>
                  </q-item-section>

                  <q-item-section class="col-2 gt-sm">
                    <q-item-label lines="1">{{ params.name }}</q-item-label>
                    <q-item-label caption>Field Name</q-item-label>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label lines="1"
                      ><q-input
                        dense
                        label="Field Label"
                        v-model="params.label"
                        :disable="!params.active"
                        filled
                      ></q-input
                    ></q-item-label>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label lines="1">
                      <q-select
                        v-model="params.type"
                        :options="optType"
                        emit-value
                        map-options
                        dense
                        filled
                        :disable="!params.active"
                      />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-expansion-item>
              <q-expansion-item
                expand-separator
                icon="table_view"
                label="Columns settings"
                caption="Columns & Filter Setup"
              >
                <draggable
                  tag="div"
                  v-model="listCols"
                  class="q-list q-list--bordered q-list--dense q-list--separator"
                >
                  <template #item="{ element }">
                    <q-item
                      clickable
                      v-ripple
                      :active="element.active || methodsReport != 'sp'"
                    >
                      <q-item-section class="col-2 gt-sm">
                        <q-item-label lines="1">
                          <q-toggle
                            v-model="element.active"
                            label="Using Field ?"
                          />
                        </q-item-label>
                      </q-item-section>

                      <q-item-section class="col-2 gt-sm">
                        <q-item-label lines="1">
                          <q-toggle
                            v-model="element.filterable"
                            label="Filterable ?"
                            :disable="!element.active || methodsReport == 'sp'"
                          />
                        </q-item-label>
                      </q-item-section>

                      <q-item-section class="col-2 gt-sm">
                        <q-item-label lines="1">
                          <q-toggle
                            v-model="element.exported"
                            label="Exportable ?"
                            :disable="!element.active || methodsReport == 'sp'"
                          />
                        </q-item-label>
                      </q-item-section>

                      <q-item-section class="col-2 gt-sm">
                        <q-item-label lines="1">{{
                          element.name
                        }}</q-item-label>
                        <q-item-label caption>Field Name</q-item-label>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1"
                          ><q-input
                            dense
                            label="Field Label"
                            v-model="element.label"
                            :disable="!element.active"
                            filled
                          ></q-input
                        ></q-item-label>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">
                          <q-select
                            v-model="element.type"
                            :options="optType"
                            emit-value
                            map-options
                            dense
                            filled
                            :disable="!element.active || methodsReport == 'sp'"
                          />
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </draggable>
              </q-expansion-item>
            </q-list>
          </div>
        </template>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn
            @click="step === 4 ? onFinishTable() : $refs.stepper.next()"
            color="primary"
            :label="
              step === 4 ? 'Finish' : loading ? 'Checking Data...' : 'Continue'
            "
            :disable="nextValidation"
          />
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="$refs.stepper.previous()"
            label="Back"
            class="q-ml-sm"
            :disable="props.dataEdit"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref, computed, watch } from "vue";
import apiRequest from "src/components/apiRequest";
import editorCode from "./editorCode.vue";
import simulationTablesReport from "./Tables/simulationTablesReport.vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import draggable from "vuedraggable";
import { useAuthStore } from "src/stores/authStore";

import manageField from "./Tables/colsManager.vue";
import manageReport from "./manageReport.vue";

const store = useAuthStore();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  dataEdit: Object,
});

onMounted(() => {
  console.log(props.dataEdit);
  if (props.dataEdit) {
    choosedConnection.value = props.dataEdit.mdm_id;
    mdm_id.value = props.dataEdit.mdm_id;
    choosedDB.value = props.dataEdit.mrm_db;
    choosedTable.value = props.dataEdit.mrm_table;
    validQuery.value = true;
    reportTitle.value = props.dataEdit.mrm_name;
    code.value = props.dataEdit.mrm_query;
    listCols.value = props.dataEdit.cols;
    listParamsConverted.value = props.dataEdit.colsParam;
    step.value = 4;
    methodsReport.value = props.dataEdit.mrm_url_gen;
  }
});

const methodsReport = ref("query");
const options = ref([
  {
    label: "Using View Function",
    value: "view",
  },
  {
    label: "Using Store Procedure Function",
    value: "sp",
  },
  {
    label: "Write own query",
    value: "query",
  },
]);
const listConnection = ref([]);
const step = ref(1);
const mdm_id = ref("");
const listDB = ref([]);
const listTables = ref([]);
const choosedConnection = ref("");
const choosedDB = ref("");
const choosedTable = ref("");
const code = ref("");
const listCols = ref([]);
const listParams = ref([]);
const listParamsConverted = ref([]);
const reportTitle = ref("");
const searchQuery = ref("");

const loading = ref(false);
const validQuery = ref(false);
const optType = ref([
  {
    label: "Text",
    value: "text",
  },
  {
    label: "Integer",
    value: "int",
  },
  {
    label: "Float",
    value: "float",
  },
  {
    label: "Date",
    value: "date",
  },
  {
    label: "Datetime",
    value: "datetime",
  },
]);

watch(step, (val) => {
  if (val === 4) {
    listCols.value.map((valMap) => {
      if (valMap.name.toLowerCase().includes("qty")) {
        valMap.type = "int";
      } else if (valMap.name.toLowerCase().includes("date")) {
        valMap.type = "date";
      } else {
        valMap.type = "text";
      }
    });

    if (listParamsConverted.value) {
      listParamsConverted.value.map((valMap) => {
        if (valMap.name.toLowerCase().includes("qty")) {
          valMap.type = "int";
        } else if (valMap.name.toLowerCase().includes("date")) {
          valMap.type = "date";
        } else {
          valMap.type = "text";
        }
      });
    }
  }
});

// =============== Start Function==============
const listColsForDraggable = computed(() => {
  return listCols.value.map((vm, idx) => {
    vm.id = idx;

    return vm;
  });
});
onMounted(() => {
  getListConnection();
});

watch(methodsReport, async (val) => {
  if (choosedConnection.value) {
    const getDatas = await getListTables(
      choosedConnection.value,
      val,
      choosedDB.value
    );
    loading.value = true;

    if (getDatas) {
      loading.value = false;
      listTables.value = getDatas;
    }
  }
});

const emptyLabelCheck = computed(() =>
  listCols.value.filter((fil) => !fil.label)
);
const nextValidation = computed(() =>
  step.value === 1
    ? !choosedConnection.value || loading.value
    : step.value === 2
    ? !choosedDB.value || loading.value
    : step.value === 3
    ? !choosedTable.value || loading.value || !validQuery.value
    : step.value === 4
    ? !choosedTable.value ||
      loading.value ||
      !validQuery.value ||
      !reportTitle.value ||
      emptyLabelCheck.value.length > 0
    : true
);

const getListConnection = async () => {
  const data = await postData("get", null, `mrs/dbconn`, false, false, true);

  loading.value = true;
  if (data) {
    loading.value = false;
    listConnection.value = data.data;
  }
};

const getListTables = async (id, type = "db", db = "master") => {
  console.log(id);
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `mrs/listDB/${id}/${type}/${db}`,
    false,
    false,
    true
  );

  if (data.status) {
    loading.value = false;
    return data.data;
  }
};

const onChooseConn = async (val) => {
  console.log(val);
  choosedConnection.value = val;
  const getDatas = await getListTables(val);
  loading.value = true;

  if (getDatas) {
    loading.value = false;
    listDB.value = getDatas;
  }
};

const onChooseDB = async (val) => {
  console.log(choosedConnection.value);
  choosedDB.value = val;
  const getDatas = await getListTables(choosedConnection.value, "tables", val);
  loading.value = true;

  if (getDatas) {
    loading.value = false;
    listTables.value = getDatas;
  }
};

const onChooseTableView = async (val) => {
  listCols.value = [];
  validQuery.value = false;

  if (methodsReport.value == "sp") {
    const getParam = await getSPParameter(val);
    code.value = `EXEC ${val}`;

    if (getParam) {
      listParams.value = getParam;
      getParam.map((valMap, idx) => {
        code.value = `${code.value} ${idx === 0 ? "" : ","} ${valMap}=''`;
      });
    }
  } else {
    code.value = `SELECT * FROM ${val}`;
  }
  choosedTable.value = val;
};

const getSPParameter = async (table) => {
  const data = await postData(
    "get",
    null,
    `mrs/getParameterSP/${choosedConnection.value}/${choosedDB.value}/${table}`,
    false,
    false,
    true
  );

  if (data.status) {
    return data.data;
  }
};

const onClickRunning = () => {
  $q.dialog({
    title: "Validate Query",
    message:
      "Are you sure want to validate this query ? it will only show latest 20 records.",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    const data = await postData(
      "post",
      {
        id: mdm_id.value,
        dbname: choosedDB.value,
        code: code.value,
        type: methodsReport.value,
        table: choosedTable.value,
        param: listParams.value,
      },
      `mrs/simRunning`,
      false,
      false,
      true
    );

    if (data && data.status) {
      loading.value = false;
      if (data.cols) {
        validQuery.value = true;
        listCols.value = data.cols;
        listParamsConverted.value = data.params;
        $q.dialog({
          component: simulationTablesReport,
          componentProps: {
            title: "Simulation Report",
            columns: data.cols,
            rows: data.data,
          },
        }).onOk(async () => {});
      } else {
        validQuery.value = false;
      }
    } else {
      loading.value = false;
      $q.notify({
        color: "negative",
        message: data.message,
      });
    }
  });
};

const onFinishTable = () => {
  $q.dialog({
    title: "Save Report",
    message: "Are you sure want to save this report ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const data = await postData(
      "post",
      {
        header: {
          id: props.dataEdit ? props.dataEdit.id : "",
          p_u_username: store.authDet.username,
          mdm_id: mdm_id.value,
          mrm_name: reportTitle.value,
          mrm_db: choosedDB.value,
          mrm_table: choosedTable.value,
          mrm_query: code.value,
          mrm_url_gen: methodsReport.value,
        },
        det: listCols.value,
        detParams: listParamsConverted.value,
      },
      `mrs/report`,
      false,
      false,
      true
    );

    if (data.status === true) {
      onDialogOK();
    }
  });
};

const onManageField = (data) => {
  $q.dialog({
    component: manageField,
    componentProps: {
      data: data,
    },
  }).onOk(async () => {});
};

const onManageReport = (data) => {
  $q.dialog({
    component: manageReport,
    componentProps: {
      data: data,
    },
  }).onOk(async () => {});
};

const onSearchDB = (val) => {
  console.log(val);
  if (val) {
    listDB.value = listDB.value.filter((db) =>
      db.toLowerCase().includes(val.toLowerCase())
    );
  } else {
    onChooseConn(choosedConnection.value);
    // getListTables(choosedConnection.value);
  }
};
</script>
<style lang="sass">
.my-menu-link
  color: white
  background: #7863ff
</style>
