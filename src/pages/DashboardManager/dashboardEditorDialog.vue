<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent maximized>
    <q-card class="column full-height">
      <!-- Toolbar -->
      <q-toolbar class="bg-white text-dark shadow-1">
        <q-btn flat round dense icon="close" @click="onCancelClick" />
        <q-separator vertical class="q-mx-sm" />
        <q-input
          v-model="title"
          dense
          outlined
          placeholder="Dashboard Title"
          class="col-3"
          hide-bottom-space
        />
        <q-input
          v-model="code"
          dense
          outlined
          placeholder="code"
          class="q-ml-sm"
          style="width: 180px"
          hide-bottom-space
          :rules="[(v) => /^[a-z0-9][a-z0-9\-_]*$/.test(v) || 'lowercase, - and _']"
        >
          <q-tooltip>Unique code — used by the CMS widget</q-tooltip>
        </q-input>
        <q-select
          v-model="status"
          :options="[
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ]"
          dense
          outlined
          emit-value
          map-options
          class="q-ml-sm"
          style="width: 130px"
        />
        <q-space />
        <q-btn flat round dense icon="tune" color="grey-8" @click="settingsOpen = true">
          <q-tooltip>Dashboard Settings (desc, roles)</q-tooltip>
        </q-btn>
        <q-btn flat no-caps icon="visibility" label="Preview" color="teal" @click="previewOpen = true" />
        <q-btn
          flat
          no-caps
          color="green"
          icon="save"
          label="Save"
          class="q-ml-sm"
          :loading="saving"
          :disable="!title || !code"
          @click="save"
        />
      </q-toolbar>

      <div class="row no-wrap col" style="min-height: 0">
        <!-- Canvas -->
        <div class="col canvas-area">
          <div class="canvas-inner">
            <div v-if="!items.length" class="canvas-empty">
              <q-icon name="insert_chart" size="64px" color="grey-4" />
              <div class="text-h6 text-grey-5 q-mt-md">
                No charts yet
              </div>
              <q-btn
                color="primary"
                icon="add"
                label="Add your first chart"
                no-caps
                unelevated
                class="q-mt-md"
                @click="addItem"
              />
            </div>

            <draggable
              tag="div"
              v-model="items"
              item-key="id"
              handle=".drag-handle"
              ghost-class="ghost-item"
              animation="200"
            >
              <template #item="{ element, index }">
                <div
                  class="chart-card"
                  :class="{ 'chart-card--selected': selectedId === element.id }"
                  @click="selectedId = element.id"
                >
                  <div class="chart-card__toolbar row items-center no-wrap">
                    <q-icon name="drag_indicator" class="drag-handle cursor-move text-grey-6" size="sm" />
                    <q-icon :name="chartTypeIcon(element.type)" size="sm" color="primary" class="q-mx-xs" />
                    <span class="text-caption text-grey-8 ellipsis">
                      {{ element.title || chartTypeLabel(element.type) }}
                    </span>
                    <q-badge outline color="grey-6" class="q-ml-xs">{{ element.datasetCode || "no dataset" }}</q-badge>
                    <q-space />
                    <q-btn flat dense round icon="content_copy" size="xs" color="grey-7" @click.stop="duplicateItem(index)">
                      <q-tooltip>Duplicate</q-tooltip>
                    </q-btn>
                    <q-btn flat dense round icon="arrow_upward" size="xs" color="grey-7" :disable="index === 0" @click.stop="moveItem(index, -1)">
                      <q-tooltip>Move Up</q-tooltip>
                    </q-btn>
                    <q-btn flat dense round icon="arrow_downward" size="xs" color="grey-7" :disable="index === items.length - 1" @click.stop="moveItem(index, 1)">
                      <q-tooltip>Move Down</q-tooltip>
                    </q-btn>
                    <q-btn flat dense round icon="delete" size="xs" color="red" @click.stop="deleteItem(index)">
                      <q-tooltip>Delete</q-tooltip>
                    </q-btn>
                  </div>
                  <div class="chart-card__body">
                    <chartRenderer :chart="element" :show-title="false" />
                  </div>
                </div>
              </template>
            </draggable>

            <div v-if="items.length" class="text-center q-my-md">
              <q-btn outline color="primary" icon="add" label="Add Chart" no-caps @click="addItem" />
            </div>
          </div>
        </div>

        <!-- Properties -->
        <div v-if="selectedItem" class="props-panel bg-white shadow-1">
          <div class="q-pa-sm row items-center bg-grey-1">
            <q-icon :name="chartTypeIcon(selectedItem.type)" color="primary" class="q-mr-sm" />
            <span class="text-subtitle2 text-weight-bold">Chart Properties</span>
            <q-space />
            <q-btn flat dense round icon="close" size="sm" @click="selectedId = null" />
          </div>
          <q-separator />
          <div class="props-content q-pa-sm">
            <q-input v-model="selectedItem.title" label="Title" dense outlined class="q-mb-sm" />

            <q-select
              v-model="selectedItem.type"
              :options="chartTypeOptions"
              label="Chart Type"
              dense
              outlined
              emit-value
              map-options
              class="q-mb-sm"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>{{ scope.opt.label }}</q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              v-model="selectedItem.datasetCode"
              :options="datasetOptions"
              label="Dataset"
              dense
              outlined
              emit-value
              map-options
              class="q-mb-sm"
              @update:model-value="onDatasetChange"
            >
              <template v-slot:append>
                <q-btn flat dense round icon="refresh" size="sm" :loading="columnsLoading" @click.stop="loadColumns">
                  <q-tooltip>Reload columns</q-tooltip>
                </q-btn>
              </template>
            </q-select>

            <!-- Column mapping (not needed for table) -->
            <template v-if="selectedItem.type !== 'table'">
              <q-select
                v-model="selectedItem.mapping.label"
                :options="columnOptions"
                label="Label / Category Column"
                dense
                outlined
                emit-value
                map-options
                clearable
                class="q-mb-sm"
              />

              <!-- Value series: each with its own column, label and color -->
              <div class="row items-center q-mb-xs">
                <div class="text-caption text-grey-7">
                  Value series{{
                    isCircularType ? " (first one used)" : ""
                  }}
                </div>
                <q-space />
                <q-btn
                  flat
                  dense
                  round
                  icon="add"
                  size="sm"
                  color="primary"
                  @click="addValueDef"
                >
                  <q-tooltip>Add value series</q-tooltip>
                </q-btn>
              </div>
              <div
                v-if="!valueDefs.length"
                class="text-caption text-grey-5 q-mb-sm"
              >
                No value series yet — add one to render the chart.
              </div>
              <div
                v-for="(def, i) in valueDefs"
                :key="i"
                class="q-pa-sm q-mb-sm rounded-borders bg-grey-1"
              >
                <div class="row items-center q-mb-xs">
                  <div class="text-caption text-weight-bold">
                    Series {{ i + 1 }}
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    dense
                    round
                    icon="close"
                    size="xs"
                    color="red"
                    @click="removeValueDef(i)"
                  >
                    <q-tooltip>Remove series</q-tooltip>
                  </q-btn>
                </div>
                <q-select
                  v-model="def.column"
                  :options="columnOptions"
                  label="Column"
                  dense
                  outlined
                  emit-value
                  map-options
                  class="q-mb-xs"
                />
                <q-input
                  v-model="def.label"
                  label="Display label"
                  dense
                  outlined
                  class="q-mb-xs"
                  :placeholder="def.column || 'Series label'"
                  hint="Legend & tooltips. Empty = column name."
                  hide-bottom-space
                />
                <ColorPicker
                  v-model="def.color"
                  label="Series color (empty = auto)"
                  class-name="q-mt-xs q-mb-none"
                />
              </div>
            </template>

            <div class="row q-col-gutter-sm q-mb-sm">
              <q-select
                v-model="selectedItem.width"
                :options="widthOptions"
                label="Width"
                dense
                outlined
                emit-value
                map-options
                class="col-6"
              />
              <q-input
                v-model.number="selectedItem.height"
                type="number"
                label="Height (px)"
                dense
                outlined
                class="col-6"
              />
            </div>

            <q-input
              v-model.number="selectedItem.refreshSecs"
              type="number"
              label="Auto-refresh (seconds, 0 = off)"
              dense
              outlined
              class="q-mb-sm"
            />

            <q-toggle
              v-if="!isCircularType && selectedItem.type !== 'kpi' && selectedItem.type !== 'table'"
              v-model="selectedItem.showLegend"
              label="Show Legend"
              class="q-mb-sm"
            />

            <ColorPicker
              v-if="selectedItem.type === 'kpi' || selectedItem.type === 'bar' || selectedItem.type === 'line' || selectedItem.type === 'area'"
              v-model="selectedItem.color"
              label="Main Color"
            />
          </div>
        </div>
      </div>

      <!-- Settings dialog -->
      <q-dialog v-model="settingsOpen">
        <q-card style="min-width: 420px">
          <q-card-section class="text-h6">Dashboard Settings</q-card-section>
          <q-card-section>
            <q-input
              v-model="desc"
              label="Description"
              type="textarea"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-select
              v-model="roles"
              :options="roleOptions"
              label="Visible to Roles"
              hint="Leave empty to show for everyone."
              dense
              outlined
              multiple
              use-chips
              emit-value
              map-options
              option-value="id"
              option-label="rm_role_name"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Done" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Preview dialog -->
      <q-dialog v-model="previewOpen" maximized>
        <q-card class="column full-height">
          <q-card-section class="row items-center q-py-sm bg-grey-2">
            <div class="text-h6">Preview: {{ title }}</div>
            <q-space />
            <q-btn flat round icon="close" v-close-popup />
          </q-card-section>
          <q-separator />
          <q-card-section class="col scroll">
            <dashboardView :layout="{ items }" embedded />
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import draggable from "vuedraggable";
import apiRequest from "src/components/apiRequest";
import chartRenderer from "src/components/charts/chartRenderer.vue";
import { normalizeValueDefs } from "src/components/charts/chartMapping.js";
import dashboardView from "./dashboardView.vue";
import ColorPicker from "../UpdateFP/components/pageManage/widgets/shared/ColorPicker.vue";
import { widthOptions } from "../UpdateFP/components/pageManage/widgets/options.js";

const $q = useQuasar();
const { postData } = apiRequest();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  dashboardId: { type: [Number, String], default: null },
});

const id = ref(props.dashboardId || null);
const title = ref("");
const code = ref("");
const desc = ref("");
const status = ref("draft");
const roles = ref([]);
const items = ref([]);
const selectedId = ref(null);
const previewOpen = ref(false);
const settingsOpen = ref(false);
const roleOptions = ref([]);
const saving = ref(false);

let counter = 0;
const nextId = () => `chart-${Date.now()}-${++counter}`;

const chartTypeOptions = [
  { label: "Bar", value: "bar", icon: "bar_chart" },
  { label: "Horizontal Bar", value: "barH", icon: "align_horizontal_left" },
  { label: "Stacked Bar", value: "stackedBar", icon: "stacked_bar_chart" },
  { label: "Line", value: "line", icon: "show_chart" },
  { label: "Area", value: "area", icon: "area_chart" },
  { label: "Donut", value: "donut", icon: "donut_large" },
  { label: "Pie", value: "pie", icon: "pie_chart" },
  { label: "KPI Number", value: "kpi", icon: "speed" },
  { label: "Table", value: "table", icon: "table_chart" },
];

const chartTypeIcon = (t) =>
  chartTypeOptions.find((o) => o.value === t)?.icon || "insert_chart";
const chartTypeLabel = (t) =>
  chartTypeOptions.find((o) => o.value === t)?.label || t;

const selectedItem = computed(() =>
  items.value.find((i) => i.id === selectedId.value) || null
);

const isCircularType = computed(() =>
  ["donut", "pie"].includes(selectedItem.value?.type)
);

// Stored value-def objects (editable refs). Legacy plain column-name
// strings are converted to objects by the watcher below.
const valueDefs = computed(() => {
  const vals = selectedItem.value?.mapping?.values;
  if (!Array.isArray(vals)) return [];
  return vals.filter((v) => v && typeof v === "object");
});

const addValueDef = () => {
  const m = selectedItem.value?.mapping;
  if (!m) return;
  if (!Array.isArray(m.values)) m.values = [];
  m.values.push({ column: "", label: "", color: "" });
};

const removeValueDef = (i) => {
  selectedItem.value?.mapping?.values?.splice(i, 1);
};

// Normalize legacy string entries (and seed fresh selections) so the
// series editor always works on { column, label, color } objects.
watch(
  () => selectedItem.value,
  (item) => {
    if (item?.mapping && Array.isArray(item.mapping.values)) {
      const fixed = normalizeValueDefs(item.mapping.values);
      if (JSON.stringify(fixed) !== JSON.stringify(item.mapping.values)) {
        item.mapping.values = fixed;
      }
    }
  },
  { immediate: true }
);

/* ---------------- items ---------------- */

const addItem = () => {
  const item = {
    id: nextId(),
    type: "bar",
    title: "",
    datasetCode: "",
    width: 12,
    height: 300,
    refreshSecs: 0,
    showLegend: true,
    color: null,
    params: {},
    mapping: { label: "", values: [] },
  };
  items.value.push(item);
  selectedId.value = item.id;
};

const duplicateItem = (index) => {
  const copy = JSON.parse(JSON.stringify(items.value[index]));
  copy.id = nextId();
  items.value.splice(index + 1, 0, copy);
  selectedId.value = copy.id;
};

const deleteItem = (index) => {
  const gone = items.value[index];
  items.value.splice(index, 1);
  if (selectedId.value === gone.id) selectedId.value = null;
};

const moveItem = (index, dir) => {
  const to = index + dir;
  if (to < 0 || to >= items.value.length) return;
  const tmp = items.value[index];
  items.value[index] = items.value[to];
  items.value[to] = tmp;
};

/* ---------------- datasets + columns ---------------- */

const datasetOptions = ref([]);
const columnOptions = ref([]);
const columnsLoading = ref(false);

const loadDatasets = async () => {
  try {
    const res = await postData("get", null, "cms/datasets", false, false, true);
    datasetOptions.value = (res?.data || [])
      .filter((d) => d.cds_status === "active")
      .map((d) => ({ label: `${d.cds_name} (${d.cds_code})`, value: d.cds_code }));
  } catch {
    datasetOptions.value = [];
  }
};

const loadColumns = async () => {
  if (!selectedItem.value?.datasetCode) {
    columnOptions.value = [];
    return;
  }
  columnsLoading.value = true;
  try {
    const res = await postData(
      "post",
      { params: selectedItem.value.params || {} },
      `cms/datasets/data/${selectedItem.value.datasetCode}`,
      false, false, true
    );
    columnOptions.value = (res?.data?.columns || []).map((c) => ({ label: c, value: c }));
  } catch {
    columnOptions.value = [];
  } finally {
    columnsLoading.value = false;
  }
};

const onDatasetChange = () => {
  if (selectedItem.value) {
    selectedItem.value.mapping = { label: "", values: [] };
  }
  loadColumns();
};

/* ---------------- load / save ---------------- */

const loadDashboard = async () => {
  if (!id.value) return;
  try {
    const res = await postData("get", null, `cms/dashboards/${id.value}`, false, false, true);
    const d = res?.data;
    if (!d) return;
    title.value = d.cdm_title;
    code.value = d.cdm_code;
    desc.value = d.cdm_desc || "";
    status.value = d.cdm_status || "draft";
    try {
      roles.value = JSON.parse(d.cdm_roles || "[]").map(String);
    } catch {
      roles.value = [];
    }
    let layout = { items: [] };
    try {
      layout = JSON.parse(d.cdm_layout || "{}");
    } catch {}
    items.value = (layout.items || []).map((it) => ({
      id: it.id || nextId(),
      type: it.type || "bar",
      title: it.title || "",
      datasetCode: it.datasetCode || "",
      width: it.width || 12,
      height: it.height || 300,
      refreshSecs: it.refreshSecs || 0,
      showLegend: it.showLegend !== false,
      color: it.color || null,
      params: it.params || {},
      mapping: {
        label: it.mapping?.label || "",
        values: normalizeValueDefs(it.mapping?.values),
      },
    }));
  } catch (e) {
    $q.notify({ color: "negative", message: "Failed to load dashboard" });
  }
};

const save = async () => {
  saving.value = true;
  try {
    const res = await postData(
      "post",
      {
        idRef: id.value,
        title: title.value,
        code: code.value,
        desc: desc.value,
        status: status.value,
        roles: roles.value,
        layout: { items: items.value },
      },
      "cms/dashboards",
      false, false, true
    );
    if (res && res.status !== false) {
      $q.notify({ color: "positive", message: "Dashboard saved" });
      onDialogOK(res.data);
    } else {
      $q.notify({ color: "negative", message: res?.message || "Save failed" });
    }
  } finally {
    saving.value = false;
  }
};

const onCancelClick = () => {
  $q.dialog({
    title: "Close Editor",
    message: "Close without saving? Unsaved changes will be lost.",
    cancel: true,
    persistent: true,
  }).onOk(() => onDialogCancel());
};

const loadRoles = async () => {
  try {
    const res = await postData("get", null, "portal/roles", false, false, true);
    roleOptions.value = (res?.data || []).map((r) => ({ ...r, id: String(r.id) }));
  } catch {
    roleOptions.value = [];
  }
};

onMounted(async () => {
  await Promise.all([loadDatasets(), loadDashboard(), loadRoles()]);
  if (selectedItem.value?.datasetCode) loadColumns();
});
</script>

<style scoped>
.canvas-area {
  background: #f5f5f5;
  overflow-y: auto;
}

.canvas-inner {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.canvas-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  border: 2px dashed #ccc;
  border-radius: 12px;
}

.chart-card {
  background: white;
  border: 2px solid transparent;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.chart-card:hover {
  border-color: #90caf9;
}

.chart-card--selected {
  border-color: #1976d2;
  box-shadow: 0 0 0 1px #1976d2;
}

.chart-card__toolbar {
  padding: 4px 8px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 6px 6px 0 0;
}

.chart-card__body {
  padding: 12px;
}

.props-panel {
  width: 320px;
  min-width: 320px;
  overflow-y: auto;
  border-left: 1px solid #e0e0e0;
}

.props-content {
  overflow-y: auto;
}

.ghost-item {
  opacity: 0.4;
}
</style>
