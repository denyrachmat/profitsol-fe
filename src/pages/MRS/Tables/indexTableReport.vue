<template>
  <div class="q-pa-md">
    <q-table
      :title="TableTitle"
      :rows="rows"
      :columns="columns"
      row-key="mrm_name"
      v-model:pagination="pagination"
      @request="onRequest"
      :loading="loading"
      ref="tableRef"
      class="my-sticky-header-table"
    >
      <template v-slot:top-left>
        {{ TableTitle }}
      </template>
      <template v-slot:top-right>
        <q-btn-group push>
          <q-btn
            color="green"
            icon-right="archive"
            label="Export to excel"
            no-caps
            @click="onExportExcel()"
          />
          <q-btn
            color="primary"
            icon-right="search"
            label="Filter"
            no-caps
            @click="filterDatas"
          >
            <q-badge color="red" floating>{{ filter.length }}</q-badge>
          </q-btn>
          <q-btn color="red" icon-right="delete" no-caps @click="clearFilter">
            <q-tooltip>Reset Filter</q-tooltip>
          </q-btn>
          <q-btn color="orange" icon-right="refresh" no-caps @click="onRefresh">
            <q-tooltip>Refresh Data</q-tooltip>
          </q-btn>
          <q-btn
            color="indigo"
            icon-right="add"
            no-caps
            @click="onOpenForms"
            v-if="
              propsReports &&
              (propsReports.includes('cms') || propsReports.includes('rpa'))
            "
          >
            <q-tooltip>Add Data</q-tooltip>
          </q-btn>
        </q-btn-group>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <div
              v-if="
                col.name !== 'action' &&
                String(props.row[col.name]).startsWith('file:')
              "
            >
              <q-btn
                color="primary"
                icon="download"
                no-caps
                @click="downloadFile(props.row[col.name])"
                outline
                label="Download File"
              />
            </div>
            <div v-else-if="col.name === 'action'">
              <q-btn-group outline>
                <q-btn
                  color="primary"
                  icon="send"
                  no-caps
                  @click="onSendData(props.row)"
                  outline
                  :disabled="
                    parseInt(props.row.prh_flag) > 0 &&
                    parseInt(props.row.prh_flag) < 3
                  "
                  v-if="propsReports.includes('rpa')"
                />
                <q-btn
                  color="primary"
                  icon="send"
                  no-caps
                  @click="onSendApproval(props.row)"
                  outline
                  :disabled="
                    parseInt(props.row.prh_flag) > 0 &&
                    parseInt(props.row.prh_flag) < 3
                  "
                  v-if="propsReports.includes('approval')"
                />
                <q-btn
                  color="orange"
                  icon="edit"
                  no-caps
                  @click="onEditData(props.row)"
                  outline
                  :disabled="
                    parseInt(props.row.prh_flag) > 0 &&
                    parseInt(props.row.prh_flag) < 3
                  "
                />
                <q-btn
                  color="red"
                  icon="delete"
                  no-caps
                  @click="onDelete(props.row)"
                  outline
                  :disabled="
                    parseInt(props.row.prh_flag) > 0 &&
                    parseInt(props.row.prh_flag) < 3
                  "
                />
              </q-btn-group>
            </div>
            <span v-else>
              {{ props.row[col.name] }}
            </span>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import filterData from "./filterIndex.vue";
import { useRoute } from "vue-router";
import previewComponent from "src/pages/CMS/Forms/previewComponent.vue";
import { socket } from "src/boot/socket";
import { useFormStore } from "stores/formStore";
import { useAuthStore } from "stores/authStore";

const $q = useQuasar();
const route = useRoute();
const { postData } = apiRequest();
const store = useAuthStore();

const props = defineProps({
  idReport: String,
  TableTitle: String,
  idForms: String,
});

const TableTitle = ref(props.TableTitle);
const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
});
const loading = ref(false);
const columns = ref([]);
const columnFilter = ref([]);
const rows = ref([]);
const tableRef = ref(null);
const filter = ref([]);
const idNya = ref("");
const propsReports = ref("");
const isFilterFirst = ref(false);
const idForms = ref(props.idForms || null);
const formStore = useFormStore();

onMounted(async () => {
  if (route.params.idReport) {
    idNya.value = route.params.idReport;
  } else {
    idNya.value = props.idReport;
  }

  const colsnya = await getCols(idNya.value);

  if (colsnya) {
    if (isFilterFirst.value) {
      filterDatas();
    } else {
      if (propsReports.value !== "sp") {
        tableRef.value.requestServerInteraction();
      } else {
        filterDatas();
      }
    }
  }
});

socket.on("server-stxi", (data) => {
  console.log(data);
  if (data.app === "rpa") {
    if (propsReports.value === "rpa") {
      tableRef.value.requestServerInteraction();
    }
    // console.log("Received data from server-stxi", data);
  }
});

const getCols = async (id) => {
  loading.value = true;

  const checkDatanya = await postData(
    "get",
    null,
    `mrs/reportCols/${id}`,
    false,
    false,
    true
  );

  if (checkDatanya.status === true) {
    TableTitle.value = checkDatanya.data.title;
    pagination.value.sortBy = checkDatanya.data.cols[0].name;
    loading.value = false;
    columns.value = checkDatanya.data.cols;
    propsReports.value = checkDatanya.data.props;
    isFilterFirst.value = checkDatanya.data.filterFirst;

    if (checkDatanya.data.props === "sp") {
      columnFilter.value = checkDatanya.data.colsParam;
      filter.value = checkDatanya.data.colsParam;
    } else {
      columnFilter.value = checkDatanya.data.cols;
    }

    return true;
  }
};

const onRequest = async (propsTab) => {
  const { page, rowsPerPage, sortBy, descending } = propsTab.pagination;

  loading.value = true;

  const checkDatanya = await postData(
    "post",
    {
      pagination: propsTab.pagination,
      filter: filter.value,
    },
    `mrs/runningReport/${idNya.value}`,
    false,
    false,
    true
  );

  if (checkDatanya && checkDatanya.status === true) {
    loading.value = false;

    rows.value = checkDatanya.data.data;
    pagination.value.page = checkDatanya.data.page;
    pagination.value.rowsNumber = checkDatanya.data.rowsNumber;
    pagination.value.sortBy = checkDatanya.data.sortBy;
    pagination.value.rowsPerPage = checkDatanya.data.rowsPerPage;
  } else {
    loading.value = false;
    $q.notify({
      color: "negative",
      message: "Failed to load data",
      icon: "warning",
    });
  }
};

const filterDatas = () => {
  $q.dialog({
    component: filterData,
    componentProps: {
      colsData: columnFilter.value,
      filtered: filter.value,
      propsReports: propsReports.value,
    },
  }).onOk(async (val) => {
    filter.value = val.data;

    if (val.type === "download") {
      onExportExcel(true);
    } else {
      tableRef.value.requestServerInteraction();
    }
  });
};

const clearFilter = () => {
  filter.value = [];
  tableRef.value.requestServerInteraction();
};

const onRefresh = () => {
  pagination.value.page = 1;
  pagination.value.rowsPerPage = 10;
  pagination.value.rowsNumber = 10;
  tableRef.value.requestServerInteraction();
};

const onExportExcel = async (bypass = false) => {
  if (!bypass) {
    $q.dialog({
      title: "Save Report",
      message: "Are you sure want to export this report ?",
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      loading.value = true;
      const checkDatanya = await postData(
        "post",
        {
          filter: filter.value,
        },
        `mrs/exportReport/${idNya.value}`,
        false,
        false,
        true
      );

      if (checkDatanya && checkDatanya.status === true) {
        loading.value = false;
        window
          .open(process.env.API_DOWNLOAD + checkDatanya.path, "_blank")
          .focus();
      } else {
        loading.value = false;
      }
    });
  } else {
    loading.value = true;
    const checkDatanya = await postData(
      "post",
      {
        filter: filter.value,
      },
      `mrs/exportReport/${idNya.value}`,
      false,
      false,
      true
    );

    if (checkDatanya && checkDatanya.status === true) {
      loading.value = false;
      window
        .open(process.env.API_DOWNLOAD + checkDatanya.path, "_blank")
        .focus();
    } else {
      loading.value = false;
    }
  }
};

const onOpenForms = async (isEdit = false) => {
  const checkDatanya = await checkFormsByID(idForms.value);
  if (checkDatanya) {
    console.log("checkDatanya", checkDatanya);
    $q.dialog({
      component: previewComponent,
      componentProps: {
        data: checkDatanya.value.forms,
        mode: "form",
        id: idForms.value,
        isShowFormOnly: true,
        setup: checkDatanya.value.setupTraining,
        showFormOnly: true,
        preventClear: isEdit,
      },
    }).onOk(async (val) => {
      console.log(val);
      tableRef.value.requestServerInteraction();
    });
  } else {
    return;
  }
};

const checkFormsByID = async (id) => {
  const checkDatanya = await postData(
    "get",
    null,
    `cms/viewByID/${id}`,
    false,
    true,
    true
  );

  if (checkDatanya && checkDatanya.status === true) {
    return checkDatanya.data;
  } else {
    $q.notify({
      color: "negative",
      message: "Failed to load data",
      icon: "warning",
    });
  }
};

// Send RPA
const onSendData = (row) => {
  console.log("onSendData", row);
  $q.dialog({
    title: "Send Data",
    message: `Are you sure want to send this data ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    const checkDatanya = await postData(
      "post",
      row,
      `rpa/rpaHist`,
      false,
      false,
      true
    );

    if (checkDatanya && checkDatanya.status === true) {
      loading.value = false;
      $q.notify({
        color: "positive",
        message: "Data sent successfully",
        icon: "check_circle",
      });
      tableRef.value.requestServerInteraction();
    } else {
      loading.value = false;
      $q.notify({
        color: "negative",
        message: "Failed to send data",
        icon: "warning",
      });
    }
  });
};

const onSendApproval = (row) => {
  console.log("onSendApproval", row);
  $q.dialog({
    title: "Send Approval",
    message: `Are you sure want to send this data for approval ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    const checkDatanya = await postData(
      "post",
      {
        idRef: row.form_id,
        username: store.authDet.username,
        batch_id: row.batch_id,
      },
      `cms/sendApproval`,
      false,
      false,
      true
    );

    if (checkDatanya && checkDatanya.status === true) {
      loading.value = false;
      $q.notify({
        color: "positive",
        message: "Data sent for approval successfully",
        icon: "check_circle",
      });
      tableRef.value.requestServerInteraction();
    } else {
      loading.value = false;
      $q.notify({
        color: "negative",
        message: "Failed to send data for approval",
        icon: "warning",
      });
    }
  });
};

const onEditData = (row) => {
  console.log("onEdit", row);
  const listForms = [];

  for (let index = 0; index < Object.keys(row).length; index++) {
    const idx = Object.keys(row)[index];
    if (idx.includes("CMS_REPORT_POS")) {
      // listForms.push()
      const idxParts = idx.split("_");
      console.log(
        "idxParts",
        row[`CMS_REPORT_${idxParts[idxParts.length - 1]}`]
      );

      const ans = row[`CMS_REPORT_VAL_${idxParts[idxParts.length - 1]}`];
      const ansPos = row[`CMS_REPORT_POS_${idxParts[idxParts.length - 1]}`];

      console.log("ansPos", ansPos);
      console.log("answers", [ansPos[0], idxParts[idxParts.length - 1], ans]);
      formStore.addAnswersForm(ansPos[0], idxParts[idxParts.length - 1], ans);
    }
  }

  onOpenForms(true);
};

const onDelete = (row) => {
  console.log("onDelete", row);
  $q.dialog({
    title: "Delete Data",
    message: `Are you sure want to delete this data ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    const checkDatanya = await postData(
      "delete",
      null,
      `cms/deleteAnswers/${row.form_id}/${row.batch_id}`,
      false,
      false,
      true
    );

    if (checkDatanya && checkDatanya.status === true) {
      loading.value = false;
      $q.notify({
        color: "positive",
        message: "Data deleted successfully",
        icon: "check_circle",
      });
      tableRef.value.requestServerInteraction();
    } else {
      loading.value = false;
      $q.notify({
        color: "negative",
        message: "Failed to delete data",
        icon: "warning",
      });
    }
  });
};
</script>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 80vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #00b4ff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
