<template>
  <div class="dashboard-manager q-pa-md">
    <div class="row items-center q-mb-md">
      <q-icon name="dashboard" size="md" color="primary" class="q-mr-sm" />
      <div class="text-h5">Dashboard Manager</div>
      <q-space />
      <q-btn
        v-if="tab === 'dashboards'"
        color="primary"
        icon="add"
        label="New Dashboard"
        no-caps
        unelevated
        @click="openEditor(null)"
      />
      <q-btn
        v-else
        color="primary"
        icon="add"
        label="New Dataset"
        no-caps
        unelevated
        @click="openDatasetEditor(null)"
      />
    </div>

    <q-tabs
      v-model="tab"
      dense
      no-caps
      class="text-grey-7 q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="dashboards" icon="dashboard" label="Dashboards" />
      <q-tab name="datasets" icon="storage" label="Datasets" />
    </q-tabs>

    <!-- ==================== Dashboards ==================== -->
    <q-table
      v-if="tab === 'dashboards'"
      :rows="dashboards"
      :columns="dashboardCols"
      row-key="id"
      flat
      bordered
      :loading="loadingDashboards"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.cdm_status === 'published' ? 'green' : 'grey'"
            :label="props.row.cdm_status"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-charts="props">
        <q-td :props="props">
          {{ chartCount(props.row) }}
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="edit" size="sm" color="primary" @click="openEditor(props.row)">
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="visibility" size="sm" color="teal" @click="previewDashboard(props.row)">
            <q-tooltip>Preview</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="delete" size="sm" color="red" @click="deleteDashboard(props.row)">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width text-center text-grey-5 q-pa-lg">
          <q-icon name="dashboard" size="48px" />
          <div class="q-mt-sm">No dashboards yet. Create your first one.</div>
        </div>
      </template>
    </q-table>

    <!-- ==================== Datasets ==================== -->
    <q-table
      v-else
      :rows="datasets"
      :columns="datasetCols"
      row-key="id"
      flat
      bordered
      :loading="loadingDatasets"
    >
      <template v-slot:body-cell-cds_type="props">
        <q-td :props="props">
          <q-badge
            :color="typeColor(props.row.cds_type)"
            :label="typeLabel(props.row.cds_type)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-cds_status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.cds_status === 'active' ? 'green' : 'grey'"
            :label="props.row.cds_status"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="edit" size="sm" color="primary" @click="openDatasetEditor(props.row)">
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="delete" size="sm" color="red" @click="deleteDataset(props.row)">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width text-center text-grey-5 q-pa-lg">
          <q-icon name="storage" size="48px" />
          <div class="q-mt-sm">
            No datasets yet. Datasets feed your dashboard charts.
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import datasetEditorDialog from "./datasetEditorDialog.vue";
import dashboardEditorDialog from "./dashboardEditorDialog.vue";
import dashboardPreviewDialog from "./dashboardPreviewDialog.vue";

const $q = useQuasar();
const { postData } = apiRequest();

const tab = ref("dashboards");

/* ---------------- dashboards ---------------- */

const dashboards = ref([]);
const loadingDashboards = ref(false);

const dashboardCols = [
  { name: "cdm_title", label: "Title", field: "cdm_title", align: "left", sortable: true },
  { name: "cdm_code", label: "Code", field: "cdm_code", align: "left", sortable: true },
  { name: "charts", label: "Charts", field: "id", align: "center" },
  { name: "status", label: "Status", field: "cdm_status", align: "center" },
  { name: "updated_at", label: "Updated", field: "updated_at", align: "left", sortable: true,
    format: (v) => (v ? new Date(v).toLocaleString() : "") },
  { name: "actions", label: "", field: "id", align: "center" },
];

const chartCount = (row) => {
  try {
    const layout = JSON.parse(row.cdm_layout || "{}");
    return layout.items?.length || 0;
  } catch {
    return 0;
  }
};

const loadDashboards = async () => {
  loadingDashboards.value = true;
  try {
    const res = await postData("get", null, "cms/dashboards", false, false, true);
    dashboards.value = res?.data || [];
  } catch {
    dashboards.value = [];
  } finally {
    loadingDashboards.value = false;
  }
};

const openEditor = (row) => {
  $q.dialog({
    component: dashboardEditorDialog,
    componentProps: { dashboardId: row?.id || null },
    maximized: true,
  }).onOk(() => loadDashboards());
};

const previewDashboard = (row) => {
  $q.dialog({
    component: dashboardPreviewDialog,
    componentProps: { code: row.cdm_code },
  });
};

const deleteDashboard = (row) => {
  $q.dialog({
    title: "Delete Dashboard",
    message: `Delete "${row.cdm_title}"? This cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const res = await postData("delete", null, `cms/dashboards/${row.id}`, false, false, true);
    if (res && res.status !== false) {
      $q.notify({ color: "positive", message: "Dashboard deleted" });
      loadDashboards();
    } else {
      $q.notify({ color: "negative", message: res?.message || "Delete failed" });
    }
  });
};

/* ---------------- datasets ---------------- */

const datasets = ref([]);
const loadingDatasets = ref(false);

const datasetCols = [
  { name: "cds_name", label: "Name", field: "cds_name", align: "left", sortable: true },
  { name: "cds_code", label: "Code", field: "cds_code", align: "left", sortable: true },
  { name: "cds_type", label: "Type", field: "cds_type", align: "center" },
  { name: "cds_connection", label: "Source", field: "cds_connection", align: "left",
    format: (v, row) => (row.cds_type === "sql" ? v : row.cds_endpoint || "") },
  { name: "cds_status", label: "Status", field: "cds_status", align: "center" },
  { name: "actions", label: "", field: "id", align: "center" },
];

const typeLabel = (t) =>
  ({ sql: "SQL", api: "INTERNAL API", api_ext: "EXTERNAL API" }[t] || t);
const typeColor = (t) =>
  ({ sql: "indigo", api: "orange", api_ext: "deep-orange" }[t] || "grey");

const loadDatasets = async () => {  loadingDatasets.value = true;
  try {
    const res = await postData("get", null, "cms/datasets", false, false, true);
    datasets.value = res?.data || [];
  } catch {
    datasets.value = [];
  } finally {
    loadingDatasets.value = false;
  }
};

const openDatasetEditor = (row) => {
  $q.dialog({
    component: datasetEditorDialog,
    componentProps: { dataset: row || null },
  }).onOk(() => loadDatasets());
};

const deleteDataset = (row) => {
  $q.dialog({
    title: "Delete Dataset",
    message: `Delete "${row.cds_name}"? Dashboards using it will stop loading.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const res = await postData("delete", null, `cms/datasets/${row.id}`, false, false, true);
    if (res && res.status !== false) {
      $q.notify({ color: "positive", message: "Dataset deleted" });
      loadDatasets();
    } else {
      $q.notify({ color: "negative", message: res?.message || "Delete failed" });
    }
  });
};

onMounted(() => {
  loadDashboards();
  loadDatasets();
});
</script>
