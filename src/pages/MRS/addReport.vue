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
        style="max-height: 70vh; overflow: auto"
        :disable="choosedConnection"
      >
        <div class="text-center full-width full-height" v-if="loading">
          <q-spinner-grid color="primary" size="5em" />
          <br />
          <br />
          <span>Generating list</span>
        </div>
        <q-list bordered dense separator v-else>
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
              <editorCode
                v-if="methodsReport == 'query' || methodsReport == 'view'"
                v-model="code"
              />
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
        <div class="text-center full-width full-height" v-if="loading">
          <q-spinner-grid color="primary" size="5em" />
          <br />
          <br />
          <span>Generating list</span>
        </div>
        <template v-else>
          <div class="q-pb-md">
            <q-input label="Report Title" filled dense v-model="reportTitle" />
          </div>
          <draggable
            tag="div"
            v-model="listCols"
            class="q-list q-list--bordered q-list--dense q-list--separator"
          >
            <template #item="{ element }">
              <q-item clickable v-ripple :active="element.active">
                <q-item-section class="col-2 gt-sm">
                  <q-item-label lines="1">
                    <q-toggle v-model="element.active" label="Using Field ?" />
                  </q-item-label>
                </q-item-section>

                <q-item-section class="col-2 gt-sm">
                  <q-item-label lines="1">
                    <q-toggle
                      v-model="element.filterable"
                      label="Filterable ?"
                      :disable="!element.active"
                    />
                  </q-item-label>
                </q-item-section>

                <q-item-section class="col-2 gt-sm">
                  <q-item-label lines="1">
                    <q-toggle
                      v-model="element.exported"
                      label="Exportable ?"
                      :disable="!element.active"
                    />
                  </q-item-label>
                </q-item-section>

                <q-item-section class="col-2 gt-sm">
                  <q-item-label lines="1">{{ element.name }}</q-item-label>
                  <q-item-label caption>Field Name</q-item-label>
                </q-item-section>

                <q-item-section>
                  <q-item-label lines="1"
                    ><q-input
                      dense
                      label="Field Label"
                      v-model="element.label"
                      :disable="!element.active"
                    ></q-input
                  ></q-item-label>
                </q-item-section>

                <q-item-section class="col-1">
                  <q-item-label lines="1" class="text-right">
                    <q-btn
                      flat
                      icon="manage_search"
                      :color="
                        !element.active || !element.filterable
                          ? 'grey'
                          : 'orange'
                      "
                      :disable="!element.active || !element.filterable"
                      @click="onManageField(element)"
                    >
                      <q-tooltip> Manage field column </q-tooltip>
                    </q-btn>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </draggable>
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

const store = useAuthStore();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  dataEdit: Object,
});

onMounted(() => {
  if (props.dataEdit) {
    choosedConnection.value = props.dataEdit.mdm_id;
    mdm_id.value = props.dataEdit.mdm_id;
    choosedDB.value = props.dataEdit.mrm_db;
    choosedTable.value = props.dataEdit.mrm_table;
    validQuery.value = true;
    reportTitle.value = props.dataEdit.mrm_name;
    code.value = props.dataEdit.mrm_query;
    listCols.value = props.dataEdit.cols;
    step.value = 4;
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
const reportTitle = ref("");

const loading = ref(false);
const validQuery = ref(false);

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
  console.log(val);
  const getDatas = await getListTables(
    choosedConnection.value,
    val === "view" ? "view" : "tables",
    choosedDB.value
  );
  loading.value = true;

  if (getDatas) {
    loading.value = false;
    listTables.value = getDatas;
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
    console.log(data);
  }
};

const getListTables = async (id, type = "db", db = "master") => {
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
  choosedConnection.value = val;
  const getDatas = await getListTables(val.value);
  loading.value = true;

  if (getDatas) {
    loading.value = false;
    listDB.value = getDatas;
  }
};

const onChooseDB = async (val) => {
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

  code.value = `SELECT * FROM ${val}`;
  choosedTable.value = val;
};

const checkQuery = async () => {
  return await postData(
    "post",
    {
      id: mdm_id.value,
      dbname: choosedDB.value,
      code: code.value,
    },
    `mrs/simRunning`,
    false,
    false,
    true
  );
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
      },
      `mrs/simRunning`,
      false,
      false,
      true
    );

    if (data) {
      loading.value = false;
      if (data.cols) {
        validQuery.value = true;
        listCols.value = data.cols;
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
        },
        det: listCols.value,
      },
      `mrs/report`,
      false,
      false,
      true
    );

    if (data.status) {
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
</script>
<style lang="sass">
.my-menu-link
  color: white
  background: #7863ff
</style>
