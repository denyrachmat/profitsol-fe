<template>
  <div class="chart-renderer">
    <div
      v-if="chart.title && showTitle"
      class="text-subtitle1 text-weight-medium q-mb-xs"
    >
      {{ chart.title }}
    </div>

    <div v-if="!chart.datasetCode" class="chart-empty flex flex-center">
      <div class="text-center text-grey-5">
        <q-icon name="dataset" size="28px" />
        <div class="text-caption">No dataset selected</div>
      </div>
    </div>

    <div v-else-if="loading" class="chart-empty flex flex-center">
      <q-spinner color="primary" size="28px" />
    </div>

    <div v-else-if="error" class="chart-empty flex flex-center">
      <div class="text-center text-negative">
        <q-icon name="error_outline" size="28px" />
        <div class="text-caption">{{ error }}</div>
      </div>
    </div>

    <div v-else-if="!rows.length" class="chart-empty flex flex-center">
      <div class="text-center text-grey-5">
        <q-icon name="inbox" size="28px" />
        <div class="text-caption">No data</div>
      </div>
    </div>

    <!-- KPI number card -->
    <div
      v-else-if="chart.type === 'kpi'"
      class="flex flex-center column text-center"
      :style="{ minHeight: heightPx }"
    >
      <div class="text-h2 text-weight-bold" :style="kpiColorStyle">
        {{ kpiValue }}
      </div>
      <div v-if="kpiLabel" class="text-subtitle2 text-grey-7 q-mt-xs">
        {{ kpiLabel }}
      </div>
    </div>

    <!-- Data table -->
    <q-table
      v-else-if="chart.type === 'table'"
      flat
      bordered
      dense
      :rows="rows"
      :columns="tableColumns"
      row-key="__idx"
      :pagination="{ rowsPerPage: 10 }"
    />

    <!-- ApexCharts (keyed by type+dataset: ApexCharts crashes with
         "w.config[c] is undefined" when the type changes in place,
         so force a remount instead of an in-place options update) -->
    <VueApexCharts
      v-else-if="hasValidSeries"
      :key="apexKey"
      :type="apexType"
      :options="apexOptions"
      :series="apexSeries"
      :height="chart.height || 300"
    />

    <div v-else class="chart-empty flex flex-center">
      <div class="text-center text-grey-5">
        <q-icon name="warning_amber" size="28px" />
        <div class="text-caption">Select a value column for this chart</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import VueApexCharts from "vue3-apexcharts";
import apiRequest from "src/components/apiRequest";
import {
  normalizeValueDefs,
  defLabel,
  APEX_FALLBACK_PALETTE,
} from "./chartMapping.js";

const { postData } = apiRequest();

const props = defineProps({
  // Chart config: { type, datasetCode, title, height, width, params,
  //   mapping: { label, values }, refreshSecs, color }
  chart: { type: Object, required: true },
  showTitle: { type: Boolean, default: true },
  // Optional pre-fetched rows (dataset editor test preview) — skips fetching.
  previewRows: { type: Array, default: null },
});

const rows = ref([]);
const loading = ref(false);
const error = ref("");
let refreshTimer = null;

const heightPx = computed(() => `${props.chart.height || 300}px`);

const fetchData = async () => {
  if (!props.chart.datasetCode) return;
  loading.value = true;
  error.value = "";
  try {
    const res = await postData("post", { params: props.chart.params || {} },
      `cms/datasets/data/${props.chart.datasetCode}`,
      false, false, true
    );
    if (res && res.status !== false) {
      rows.value = res?.data?.rows || [];
      if (!rows.value.length) error.value = "";
    } else {
      error.value = res?.message || "Failed to load data";
      rows.value = [];
    }
  } catch (e) {
    error.value = "Failed to load data";
    rows.value = [];
  } finally {
    loading.value = false;
  }
};

const setupRefresh = () => {
  clearInterval(refreshTimer);
  refreshTimer = null;
  const secs = Number(props.chart.refreshSecs) || 0;
  if (secs >= 5) {
    refreshTimer = setInterval(fetchData, secs * 1000);
  }
};

onMounted(() => {
  if (props.previewRows) {
    rows.value = props.previewRows;
  } else {
    fetchData();
    setupRefresh();
  }
});

onBeforeUnmount(() => clearInterval(refreshTimer));

watch(
  () => [props.chart.datasetCode, JSON.stringify(props.chart.params || {})],
  () => {
    if (!props.previewRows) {
      fetchData();
      setupRefresh();
    }
  }
);

watch(
  () => props.previewRows,
  (val) => {
    if (val) rows.value = val;
  }
);

/* ---------------- data shaping ---------------- */

const labelCol = computed(() => props.chart.mapping?.label || "");

// Normalized per-series defs: [{ column, label, color }]. Legacy plain
// column-name strings are converted on the fly.
const valueDefs = computed(() =>
  normalizeValueDefs(props.chart.mapping?.values)
);
const valueCols = computed(() => valueDefs.value.map((d) => d.column));
const valueLabels = computed(() => valueDefs.value.map(defLabel));

const categories = computed(() =>
  rows.value.map((r) => {
    const v = labelCol.value ? r[labelCol.value] : "";
    return v === null || v === undefined ? "" : String(v);
  })
);

const toNum = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

const isCircular = computed(() =>
  ["donut", "pie", "radialBar"].includes(props.chart.type)
);

// Key the ApexCharts instance by type + dataset so a type switch (or a
// dataset with different columns) remounts the chart instead of crashing
// ApexCharts' in-place update ("w.config[c] is undefined").
const apexKey = computed(
  () => `${props.chart.type}::${props.chart.datasetCode || ""}`
);

const hasValidSeries = computed(
  () => rows.value.length > 0 && valueCols.value.length > 0
);

const apexType = computed(() => {
  const t = props.chart.type;
  if (t === "stackedBar") return "bar";
  if (t === "area") return "area";
  if (t === "line") return "line";
  if (t === "donut") return "donut";
  if (t === "pie") return "pie";
  return "bar";
});

const apexSeries = computed(() => {
  if (isCircular.value) {
    const col = valueCols.value[0];
    return col ? rows.value.map((r) => toNum(r[col])) : [];
  }
  return valueDefs.value.map((def) => ({
    name: defLabel(def),
    data: rows.value.map((r) => toNum(r[def.column])),
  }));
});

// Per-series colors. A single "main" color keeps the old behavior (one
// color for the whole chart). When any series has its own color, build a
// full array in series order, filling gaps with the main color (or the
// standard Apex palette position so uncolored series look untouched).
const seriesColors = computed(() => {
  const defs = valueDefs.value;
  if (!defs.length) return undefined;
  if (isCircular.value) {
    return props.chart.color ? [props.chart.color] : undefined;
  }
  if (!defs.some((d) => d.color)) {
    return props.chart.color ? [props.chart.color] : undefined;
  }
  return defs.map(
    (d, i) =>
      d.color ||
      props.chart.color ||
      APEX_FALLBACK_PALETTE[i % APEX_FALLBACK_PALETTE.length]
  );
});

const apexOptions = computed(() => {
  // NOTE: never put explicit `undefined` values in here. ApexCharts v7
  // deep-merges options over its defaults, and an explicit `fill: undefined`
  // / `stroke: undefined` / `colors: undefined` wipes the default object —
  // then setDefaultColors() crashes with "w.config[c] is undefined".
  const opts = {
    chart: {
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { enabled: true },
    },
    dataLabels: { enabled: false },
    legend: { show: props.chart.showLegend !== false, position: "bottom" },
    tooltip: { enabled: true },
  };

  const customColors = seriesColors.value;
  if (customColors) {
    opts.colors = customColors;
  }

  if (isCircular.value) {
    opts.labels = categories.value;
    opts.stroke = { width: 1 };
    return opts;
  }

  opts.xaxis = {
    categories: categories.value,
    labels: { rotate: -45, hideOverlappingLabels: true },
  };
  opts.yaxis = {
    labels: {
      formatter: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v),
    },
  };
  opts.plotOptions = {
    bar: {
      horizontal: props.chart.type === "barH",
      borderRadius: 3,
      columnWidth: "60%",
    },
  };
  opts.chart = {
    ...opts.chart,
    stacked: props.chart.type === "stackedBar",
  };

  if (props.chart.type === "line" || props.chart.type === "area") {
    opts.stroke = { curve: "smooth", width: 2 };
  }
  if (props.chart.type === "area") {
    opts.fill = {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0.05 },
    };
  }

  return opts;
});

/* ---------------- KPI ---------------- */

const kpiValue = computed(() => {
  if (!rows.value.length || !valueCols.value.length) return "—";
  const raw = rows.value[0][valueCols.value[0]];
  const n = parseFloat(raw);
  return isNaN(n) ? String(raw ?? "—") : n.toLocaleString();
});

const kpiLabel = computed(() => {
  if (!rows.value.length) return "";
  if (labelCol.value) {
    const v = rows.value[0][labelCol.value];
    if (v !== null && v !== undefined && v !== "") return String(v);
  }
  return valueCols.value[0] || "";
});

const kpiColorStyle = computed(() => {
  const c = valueDefs.value[0]?.color || props.chart.color;
  return c ? { color: c } : {};
});

/* ---------------- table ---------------- */

const tableColumns = computed(() => {
  if (!rows.value.length) return [];
  return Object.keys(rows.value[0]).map((k) => ({
    name: k,
    label: k,
    field: k,
    align: "left",
    sortable: true,
  }));
});
</script>

<style scoped>
.chart-empty {
  min-height: 120px;
  height: v-bind(heightPx);
  border: 1px dashed #e0e0e0;
  border-radius: 6px;
}
</style>
