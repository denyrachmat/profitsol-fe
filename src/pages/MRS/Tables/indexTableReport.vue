<template>
  <div class="q-pa-md">
    <q-table
      :title="TableTitle"
      :rows="rows"
      :columns="columns"
      row-key="batch_id"
      v-model:pagination="pagination"
      @request="onRequest"
      :loading="loading"
      ref="tableRef"
      selection="multiple"
      v-model:selected="selectedRows"
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
          <q-btn-dropdown color="cyan" label="Settings" no-caps>
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="onPeriodClick()"
                :disable="!props.isAddActivePeriod"
              >
                <q-item-section avatar>
                  <q-avatar
                    color="orange"
                    icon="date_range"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Setup Period</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="onMultipleManageClick()"
                :disable="!props.activateMultipleCreate"
              >
                <q-item-section avatar>
                  <q-avatar
                    color="indigo"
                    icon="playlist_add"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Multiple form management</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-list v-if="props.isAPIExport && props.maxAPIOpt > 0">
              <q-item clickable v-close-popup @click="onRefresh()">
                <q-item-section avatar>
                  <q-avatar color="indigo" icon="refresh" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Refresh Data</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item
                v-for="opt in props.maxAPIOpt"
                :key="opt"
                clickable
                v-close-popup
                @click="onExportExcel(true)"
              >
                <q-item-section avatar>
                  <q-avatar color="green" icon="archive" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Export API {{ opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
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
          <q-btn
            v-if="selectedRows.length > 0"
            color="orange"
            icon="edit_note"
            label="Bulk Edit Terpilih"
            no-caps
            @click="onBulkEditSelected"
          />
        </q-btn-group>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width class="text-center">
            <q-checkbox v-model="props.selected" dense />
          </q-td>
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            style="word-break: break-word; white-space: normal"
          >
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
                  :color="
                    (parseInt(props.row.prh_flag) > 0 &&
                      parseInt(props.row.prh_flag) < 3) ||
                    !props.canEdit
                      ? 'grey'
                      : 'orange'
                  "
                  icon="edit"
                  no-caps
                  @click="onEditData(props.row)"
                  outline
                  :disabled="
                    (parseInt(props.row.prh_flag) > 0 &&
                      parseInt(props.row.prh_flag) < 3) ||
                    !props.canEdit
                  "
                />
                <q-btn
                  :color="
                    (parseInt(props.row.prh_flag) > 0 &&
                      parseInt(props.row.prh_flag) < 3) ||
                    !props.canDelete
                      ? 'grey'
                      : 'red'
                  "
                  icon="delete"
                  no-caps
                  @click="onDelete(props.row)"
                  outline
                  :disabled="
                    (parseInt(props.row.prh_flag) > 0 &&
                      parseInt(props.row.prh_flag) < 3) ||
                    !props.canDelete
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

import multiplePromptDialog from "src/components/multiplePromptDialog.vue";

const $q = useQuasar();
const route = useRoute();
const { postData } = apiRequest();
const store = useAuthStore();

const props = defineProps({
  idReport: String,
  TableTitle: String,
  idForms: String,
  isAPIExport: {
    type: Boolean,
    default: false,
  },
  maxAPIOpt: {
    type: Number,
    default: 0,
  },
  isAddActivePeriod: {
    type: Boolean,
    default: false,
  },
  activateMultipleCreate: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
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
const formPeriod = ref({
  from: null,
  to: null,
});
const maxMultipleCreate = ref(0);
const enableMultipleCreate = ref(false);
const enableMultipleEditNewForm = ref(false);
const enableMultipleDeleteNewForm = ref(false);
const selectedRows = ref([]);

onMounted(async () => {
  console.log("props result", props);
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

  console.log("propsReports", propsReports.value);

  getPeriodData();
  getMultipleManageData();
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
      idReport: idNya.value,
      colsData: columnFilter.value,
      filtered: filter.value,
      propsReports: propsReports.value,
      isAPIOpt: props.isAPIExport,
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

const onOpenForms = async (isEdit = false, keyValue = "") => {
  if (formPeriod.value.from || formPeriod.value.to) {
    const today = new Date();
    const fromDate = new Date(formPeriod.value.from);
    const toDate = new Date(formPeriod.value.to + " 23:59:59");

    if (today < fromDate || today > toDate) {
      $q.notify({
        color: "negative",
        message:
          "The form is not active, it will available from " +
          fromDate.toLocaleDateString() +
          " to " +
          toDate.toLocaleDateString(),
        icon: "warning",
      });
      return;
    }
  }

  if (enableMultipleCreate.value) {
  }

  const checkDatanya = await checkFormsByID(idForms.value);
  if (checkDatanya) {
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
        answersKey: isEdit ? keyValue : "",
        isPreview: false,
      },
    })
      .onOk(async (val) => {
        console.log(val);
        tableRef.value.requestServerInteraction();
      })
      .onDismiss(() => {
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
  console.log("Bulk Editing Batch Data:", row);

  // 1. Kosongkan store jawaban terlebih dahulu untuk mencegah sisa data sebelumnya menempel
  formStore.restoreDefault();

  // 2. Loop semua properti kolom data yang dikembalikan oleh server mrs
  for (let index = 0; index < Object.keys(row).length; index++) {
    const idx = Object.keys(row)[index];

    // Deteksi jika field mengandung informasi posisi/indeks baris pengisian
    if (idx.includes("CMS_REPORT_POS")) {
      const idxParts = idx.split("_");
      const fieldId = idxParts[idxParts.length - 1]; // Mengambil ID field asli

      const ans = row[`CMS_REPORT_VAL_${fieldId}`];
      const ansPos = row[`CMS_REPORT_POS_${fieldId}`]; // Berisi array koordinat [rowIdx, colIdx]

      // Ambil index baris (instance) dari database, gunakan fallback 0 jika kosong
      const targetRowIdx =
        ansPos && ansPos[0] !== undefined ? parseInt(ansPos[0]) : 0;

      // 3. Masukkan kembali jawaban lama ke store Pinia sesuai koordinat barisnya!
      if (ans !== undefined && ans !== null) {
        formStore.addAnswersForm(targetRowIdx, fieldId, ans);
      }
    }
  }

  // 4. Buka modal previewComponent dengan flag isEdit (preventClear = true)
  onOpenForms(true, row.batch_id);
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

const onPeriodClick = () => {
  $q.dialog({
    component: multiplePromptDialog,
    componentProps: {
      title: "User Details",
      initialFields: [
        {
          name: "rangePeriod",
          label: "Select Period",
          type: "datetime-range",
          default: formPeriod.value.from
            ? {
                from: formPeriod.value.from,
                to: formPeriod.value.to,
              }
            : null,
          rules: [(val) => !!val || "Field is required"],
        },
      ],
      addable: true,
      removable: true,
    },
    persistent: true,
    ok: true,
    cancel: true,
  }).onOk(async (datas) => {
    if (datas.rangePeriod) {
      const payload = {
        data: {
          pgm_code: "MRS_FORM_PERIOD",
          pgm_value: props.idReport,
          pgm_value2: store.authDet.username,
          pgm_value3: JSON.stringify(datas.rangePeriod),
          pgm_desc: `Period from ${datas.rangePeriod.from} to ${datas.rangePeriod.to}`,
          pgm_parent: null,
        },
        keys: {
          pgm_code: "MRS_FORM_PERIOD",
          pgm_value: props.idReport,
          pgm_value2: store.authDet.username,
        },
      };

      await postGencodeData(payload);
      await getPeriodData();
      $q.notify({
        message: "Period has been updated successfully.",
        color: "green",
        icon: "check_circle",
      });

      formPeriod.value.from = datas.rangePeriod.from;
      formPeriod.value.to = datas.rangePeriod.to;
    }
  });
};

const getPeriodData = async () => {
  const data = await getGencodeData(
    "MRS_FORM_PERIOD",
    {
      reportOpt: "pgm_value",
      userOpt: "pgm_value2",
      periodOpt: "pgm_value3",
    },
    {
      pgm_value: props.idReport,
      pgm_value2: store.authDet.username,
    },
    true
  );

  const periodData = JSON.parse(data.periodOpt);
  formPeriod.value.from = periodData.from;
  formPeriod.value.to = periodData.to;

  console.log("getPeriodData", data);
};

const onMultipleManageClick = () => {
  $q.dialog({
    component: multiplePromptDialog,
    componentProps: {
      title: "User Details",
      initialFields: [
        {
          name: "enableMultipleCreate",
          label: "Enable Multiple Create for new form?",
          type: "radio",
          default: enableMultipleCreate.value ? 1 : 0,
          options: [
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ],
        },
        {
          name: "enableMultipleEditNewForm",
          label: "Enable Multiple Edit?",
          type: "radio",
          default: enableMultipleEditNewForm.value ? 1 : 0,
          options: [
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ],
        },
        {
          name: "enableMultipleDeleteNewForm",
          label: "Enable Multiple Delete?",
          type: "radio",
          default: enableMultipleDeleteNewForm.value ? 1 : 0,
          options: [
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ],
        },
        {
          name: "total",
          label: "Max form to be created for new form (Leave 0 for unlimited)",
          type: "number",
          default: maxMultipleCreate.value,
        },
      ],
    },
    persistent: true,
    ok: true,
    cancel: true,
  }).onOk(async (datas) => {
    const payload = {
      data: {
        pgm_code: "MRS_MULTIPLE_CREATE_OPT",
        pgm_value: {
          value: [
            "enableMultipleCreate",
            "enableMultipleEditNewForm",
            "enableMultipleDeleteNewForm",
            "maxMultipleCreate",
          ],
          store_separately: true,
        },
        pgm_value2: {
          value: [
            datas.enableMultipleCreate,
            datas.enableMultipleEditNewForm,
            datas.enableMultipleDeleteNewForm,
            datas.total,
          ],
          store_separately: true,
        },
        pgm_value3: props.idReport,
        pgm_desc: `Multiple form management with max form to create ${datas.total}`,
        pgm_parent: null,
      },
      keys: {
        pgm_code: "MRS_MULTIPLE_CREATE_OPT",
        pgm_value: {
          value: [
            "enableMultipleCreate",
            "enableMultipleEditNewForm",
            "enableMultipleDeleteNewForm",
            "maxMultipleCreate",
          ],
          store_separately: true,
        },
        pgm_value2: {
          value: [
            datas.enableMultipleCreate,
            datas.enableMultipleEditNewForm,
            datas.enableMultipleDeleteNewForm,
            datas.total,
          ],
          store_separately: true,
        },
        pgm_value3: props.idReport,
      },
    };

    await postGencodeData(payload);
    await getMultipleManageData();
    $q.notify({
      message:
        "Multiple form management settings has been updated successfully.",
      color: "green",
      icon: "check_circle",
    });
  });
};

const getMultipleManageData = async () => {
  const { data } = await postData(
    "post",
    {
      id: "MRS_MULTIPLE_CREATE_OPT",
      selectAs: {
        typeOpt: "pgm_value",
        valueOpt: "pgm_value2|int",
      },
      firstSelect: false,
    },
    `portal/gencode/showDetail/MRS_MULTIPLE_CREATE_OPT`,
    false,
    false,
    false
  );

  data.map((item) => {
    if (item.typeOpt === "enableMultipleCreate") {
      enableMultipleCreate.value = item.valueOpt === 1 ? true : false;
    } else if (item.typeOpt === "enableMultipleEditNewForm") {
      enableMultipleEditNewForm.value = item.valueOpt === 1 ? true : false;
    } else if (item.typeOpt === "enableMultipleDeleteNewForm") {
      enableMultipleDeleteNewForm.value = item.valueOpt === 1 ? true : false;
    } else if (item.typeOpt === "maxMultipleCreate") {
      maxMultipleCreate.value = parseInt(item.valueOpt) || 0;
    }
  });
};

const postGencodeData = async (payload) => {
  return await postData("post", payload, "portal/gencode/saveGencode");
};

const getGencodeData = async (idCode, selectAs, filter, firstSelect) => {
  const { data } = await postData(
    "post",
    {
      id: idCode,
      selectAs: selectAs,
      filter: filter,
      firstSelect: firstSelect,
    },
    `portal/gencode/showDetail/${idCode}`,
    false,
    false,
    false
  );

  if (data) {
    return data;
  }
};

const onBulkEditSelected = () => {
  console.log("Data yang dicentang user:", selectedRows.value);

  // 1. Kosongkan store jawaban lama
  formStore.restoreDefault();

  // 2. Iterasi setiap baris data yang dicentang oleh user
  selectedRows.value.forEach((row, targetRowIdx) => {
    // Bedah field jawaban di dalam baris ini seperti pada fungsi edit single
    for (let index = 0; index < Object.keys(row).length; index++) {
      const idx = Object.keys(row)[index];

      if (idx.includes("CMS_REPORT_POS")) {
        const idxParts = idx.split("_");
        const fieldId = idxParts[idxParts.length - 1];
        const ans = row[`CMS_REPORT_VAL_${fieldId}`];

        // 3. Masukkan ke store berdasarkan urutan baris centangan (targetRowIdx)
        if (ans !== undefined && ans !== null) {
          formStore.addAnswersForm(targetRowIdx, fieldId, ans);
        }
      }
    }
  });

  // 4. Ambil batch_id dari baris pertama sebagai referensi token update ke backend
  const referenceBatchId = selectedRows.value[0]?.batch_id || null;

  // 5. Buka modal spreadsheet
  onOpenForms(true, referenceBatchId);

  // 6. Bersihkan kembali centangan setelah modal dibuka
  selectedRows.value = [];
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
