<template>
  <q-table
    :title="props.TableTitle"
    :rows="rows"
    :columns="columns"
    row-key="mrm_name"
    v-model:pagination="pagination"
    @request="onRequest"
    :loading="loading"
    ref="tableRef"
  >
    <template v-slot:top-left>
      {{ props.TableTitle }}
    </template>
    <template v-slot:top-right>
      <q-btn-group push>
        <q-btn
          color="green"
          icon-right="archive"
          label="Export to excel"
          no-caps
          @click="exportTable"
        />
        <q-btn
          color="primary"
          icon-right="search"
          label="Filter"
          no-caps
          @click="filterDatas"
        />
      </q-btn-group>
    </template>
  </q-table>
</template>
<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import filterData from "./filterIndex.vue";

const $q = useQuasar();
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
const rows = ref([]);
const tableRef = ref(null);
const filter = ref([]);

onMounted(async () => {
  const colsnya = await getCols(props.idReport);

  console.log(props);
  if (colsnya) {
    tableRef.value.requestServerInteraction();
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
    pagination.value.sortBy = checkDatanya.data[0].name;
    loading.value = false;
    columns.value = checkDatanya.data;

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
    },
    `mrs/runningReport/${props.idReport}`,
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
  }
};

const exportTable = () => {};

const filterDatas = () => {
  $q.dialog({
    component: filterData,
    componentProps: {
      colsData: columns.value,
      filtered: filter.value,
    },
  }).onOk(async (val) => {
    filter.value = val;

    console.log(val);
    // onRequest({ pagination: pagination.value, filter: filter.value });
  });
};
</script>
