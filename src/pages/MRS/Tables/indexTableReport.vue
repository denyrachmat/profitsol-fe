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
        </q-btn-group>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
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

const $q = useQuasar();
const route = useRoute();
const { postData } = apiRequest();

const props = defineProps({
  idReport: String,
  TableTitle: String,
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

onMounted(async () => {
  if (route.params.idReport) {
    idNya.value = route.params.idReport;
  } else {
    idNya.value = props.idReport;
  }

  const colsnya = await getCols(idNya.value);

  if (colsnya) {
    if (propsReports.value !== "sp") {
      tableRef.value.requestServerInteraction();
    }
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

  if (checkDatanya.status === true) {
    loading.value = false;

    rows.value = checkDatanya.data.data;
    pagination.value.page = checkDatanya.data.page;
    pagination.value.rowsNumber = checkDatanya.data.rowsNumber;
    pagination.value.sortBy = checkDatanya.data.sortBy;
    pagination.value.rowsPerPage = checkDatanya.data.rowsPerPage;
  } else {
    loading.value = false;
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
    filter.value = val;
    tableRef.value.requestServerInteraction();
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

const onExportExcel = () => {
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
