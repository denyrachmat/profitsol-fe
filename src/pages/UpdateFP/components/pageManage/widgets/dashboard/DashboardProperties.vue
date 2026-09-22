<template>
  <div>
    <q-select
      v-model="dashboardCode"
      :options="dashboardOptions"
      label="Dashboard"
      dense
      outlined
      emit-value
      map-options
      :loading="loading"
      class="q-mb-sm"
      @update:model-value="chartId = ''"
    />

    <q-select
      v-model="mode"
      :options="[
        { label: 'Whole Dashboard', value: 'whole' },
        { label: 'Single Chart', value: 'chart' },
      ]"
      label="Show"
      dense
      outlined
      emit-value
      map-options
      class="q-mb-sm"
    />

    <q-select
      v-if="mode === 'chart'"
      v-model="chartId"
      :options="chartOptions"
      label="Chart"
      dense
      outlined
      emit-value
      map-options
      class="q-mb-sm"
      :disable="!dashboardCode"
    />

    <q-toggle v-model="showTitle" label="Show Chart Titles" />
  </div>
</template>

<script setup>
import { ref, computed, watch, toRef } from "vue";
import apiRequest from "src/components/apiRequest";
import { useBlockField } from "../useBlockField.js";

const { postData } = apiRequest();

const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");

const dashboardCode = useBlockField(blockRef, "dashboardCode");
const mode = useBlockField(blockRef, "mode");
const chartId = useBlockField(blockRef, "chartId");
const showTitle = useBlockField(blockRef, "showTitle");

const dashboards = ref([]);
const loading = ref(false);

const dashboardOptions = computed(() =>
  dashboards.value.map((d) => ({
    label: d.cdm_title,
    value: d.cdm_code,
  }))
);

const chartOptions = computed(() => {
  const d = dashboards.value.find((x) => x.cdm_code === dashboardCode.value);
  if (!d) return [];
  try {
    const layout = JSON.parse(d.cdm_layout || "{}");
    return (layout.items || []).map((it, i) => ({
      label: it.title || `Chart ${i + 1} (${it.type})`,
      value: it.id,
    }));
  } catch {
    return [];
  }
});

const load = async () => {
  loading.value = true;
  try {
    const res = await postData("get", null, "cms/dashboards", false, false, true);
    dashboards.value = res?.data || [];
  } catch {
    dashboards.value = [];
  } finally {
    loading.value = false;
  }
};

watch(dashboardCode, () => {
  if (mode.value === "chart" && !chartOptions.value.some((o) => o.value === chartId.value)) {
    chartId.value = "";
  }
});

load();
</script>
