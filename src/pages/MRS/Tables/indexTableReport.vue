<template>
  <q-table
    :title="TableTitle"
    :rows="rows"
    :columns="columns"
    row-key="mrm_name"
    v-model:pagination="pagination"
    @request="onRequest"
    :loading="loading"
    ref="tableRef"
  >
  </q-table>
</template>
<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  idReport: String,
});

const TableTitle = ref("");
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

onMounted(async () => {
  const colsnya = await getCols(props.idReport);

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
</script>
