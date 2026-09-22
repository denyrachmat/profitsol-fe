<template>
  <div class="dashboard-widget">
    <div
      v-if="!block.content.dashboardCode"
      class="widget-placeholder text-center q-pa-lg"
    >
      <q-icon name="insert_chart_outlined" size="32px" color="grey-4" />
      <div class="text-caption text-grey-5 q-mt-xs">
        Select a dashboard in the properties panel
      </div>
    </div>

    <div v-else-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="28px" />
    </div>

    <div v-else-if="error" class="text-center q-pa-md text-grey-6">
      <q-icon name="lock" size="24px" />
      <div class="text-caption q-mt-xs">{{ error }}</div>
    </div>

    <!-- Single chart mode -->
    <template v-else-if="isChartMode">
      <chartRenderer
        v-if="singleChart"
        :chart="singleChart"
        :show-title="block.content.showTitle !== false"
      />
      <div v-else class="text-center q-pa-md text-grey-5 text-caption">
        Chart not found in this dashboard — re-select it in the properties
        panel.
      </div>
    </template>

    <!-- Whole dashboard mode -->
    <dashboardView
      v-else
      :layout="layout"
      :show-header="false"
      embedded
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import apiRequest from "src/components/apiRequest";
import chartRenderer from "src/components/charts/chartRenderer.vue";
import dashboardView from "src/pages/DashboardManager/dashboardView.vue";

const { postData } = apiRequest();

const props = defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
});

const layout = ref(null);
const loading = ref(false);
const error = ref("");

const isChartMode = computed(() => props.block.content.mode === "chart");

const singleChart = computed(() => {
  if (!isChartMode.value || !layout.value) return null;
  return (
    (layout.value.items || []).find(
      (it) => it.id === props.block.content.chartId
    ) || null
  );
});

const load = async () => {
  const code = props.block.content.dashboardCode;
  if (!code) {
    layout.value = null;
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    const res = await postData(
      "get",
      null,
      `cms/dashboards/viewByCode/${code}`,
      false, false, true
    );
    if (res && res.status !== false) {
      layout.value = res.data?.layout || { items: [] };
    } else {
      layout.value = null;
      error.value = res?.message || "Dashboard unavailable";
    }
  } catch {
    layout.value = null;
    error.value = "Dashboard unavailable";
  } finally {
    loading.value = false;
  }
};

watch(() => props.block.content.dashboardCode, load);
onMounted(load);
</script>

<style scoped>
.widget-placeholder {
  border: 1px dashed #e0e0e0;
  border-radius: 6px;
}
</style>
