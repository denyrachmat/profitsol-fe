<template>
  <div class="dashboard-view">
    <div v-if="showHeader && (title || desc)" class="q-mb-md">
      <div v-if="title" class="text-h6">{{ title }}</div>
      <div v-if="desc" class="text-caption text-grey-7">{{ desc }}</div>
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="32px" />
    </div>

    <div v-else-if="error" class="text-center q-pa-xl text-negative">
      <q-icon name="error_outline" size="32px" />
      <div class="text-caption q-mt-sm">{{ error }}</div>
    </div>

    <div v-else-if="!items.length" class="text-center q-pa-xl text-grey-5">
      <q-icon name="insert_chart_outlined" size="32px" />
      <div class="text-caption q-mt-sm">This dashboard has no charts yet.</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="item in items"
        :key="item.id"
        :class="`col-12 ${item.width >= 12 ? '' : 'col-md-' + (item.width || 12)}`"
      >
        <q-card flat bordered class="q-pa-sm">
          <chartRenderer :chart="item" />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiRequest from "src/components/apiRequest";
import chartRenderer from "src/components/charts/chartRenderer.vue";

const { postData } = apiRequest();

const props = defineProps({
  // Fetch by code (live view / CMS widget) ...
  code: { type: String, default: "" },
  // ... or render a given layout directly (editor preview).
  layout: { type: Object, default: null },
  showHeader: { type: Boolean, default: true },
  // Presentational flag — true when nested inside another dialog/page.
  embedded: { type: Boolean, default: false },
});

const fetched = ref(null);
const loading = ref(false);
const error = ref("");

const source = computed(() => {
  if (props.layout) return props.layout;
  return fetched.value?.layout || null;
});

const items = computed(() => source.value?.items || []);
const title = computed(() =>
  props.layout ? "" : fetched.value?.title || ""
);
const desc = computed(() => (props.layout ? "" : fetched.value?.desc || ""));

onMounted(async () => {
  if (!props.code || props.layout) return;
  loading.value = true;
  try {
    const res = await postData(
      "get",
      null,
      `cms/dashboards/viewByCode/${props.code}`,
      false, false, true
    );
    if (res && res.status !== false) {
      fetched.value = res.data;
    } else {
      error.value = res?.message || "Dashboard not found";
    }
  } catch {
    error.value = "Failed to load dashboard";
  } finally {
    loading.value = false;
  }
});
</script>
