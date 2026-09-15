<template>
  <q-dialog
    ref="dialogRef"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white q-pa-md">
      <q-card-section class="text-h6">
        <div class="row items-center">
          <div class="col">Choose from DMS</div>
          <div class="col text-right text-caption text-grey-6">
            {{ dmsOpt.root }}
          </div>
        </div>
        <div class="row q-pt-sm">
          <div class="col">
            <q-breadcrumbs class="text-grey" active-color="primary">
              <template v-slot:separator>
                <q-icon size="1.2em" name="arrow_forward" color="primary" />
              </template>
              <q-breadcrumbs-el
                v-for="(crumb, idx) in crumbs"
                :key="idx"
                :label="crumb.label"
                icon="folder"
                class="cursor-pointer"
                @click="goToCrumb(idx)"
              />
            </q-breadcrumbs>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="path"
          selection="multiple"
          v-model:selected="selectedRows"
          :loading="loading"
          dense
          @row-click="onRowClick"
        />
      </q-card-section>

      <q-card-section v-if="selectedPaths.length > 0">
        <div class="text-caption text-grey-6 q-pb-xs">
          Selected ({{ selectedPaths.length }}):
        </div>
        <q-chip
          v-for="p in selectedPaths"
          :key="p"
          removable
          @remove="removePath(p)"
          color="primary"
          text-color="white"
          dense
        >
          {{ p }}
        </q-chip>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="onDialogCancel" />
        <q-btn color="primary" label="Save" @click="onSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import { useAuthStore } from "stores/authStore";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const authStore = useAuthStore();
const { postData } = apiRequest();
const { onDialogCancel, onDialogOK, dialogRef } = useDialogPluginComponent();

const props = defineProps({
  dmsOpt: Object,
  initial: { type: Array, default: () => [] },
});

const columns = [
  {
    name: "label",
    label: "Name",
    field: "label",
    align: "left",
    sortable: true,
  },
  { name: "type", label: "Type", field: "type", align: "left", sortable: true },
  {
    name: "size",
    label: "Size",
    field: "size_human",
    align: "right",
    sortable: true,
  },
];

const rows = ref([]);
const selectedRows = ref([]);
const selectedPaths = ref([...(props.initial || [])]);
const crumbs = ref([{ segment: "", label: "Root" }]);
const loading = ref(false);

const username = () => authStore.authDet?.username || "";

const isPickable = (row) => {
  const kind = props.dmsOpt?.kind || "both";
  if (kind === "folder") return row?.type === "folder";
  if (kind === "file") return row?.type === "file";
  return true;
};

const browseUrl = (segment) =>
  `dms/browse/${encodeURIComponent(username())}/${encodeURIComponent(
    props.dmsOpt.root
  )}${segment ? "/" + encodeURIComponent(segment) : ""}`;

const fetchRows = async (segment) => {
  loading.value = true;
  const res = await postData("get", null, browseUrl(segment));
  loading.value = false;
  if (res && res.status && Array.isArray(res.data)) {
    rows.value = res.data;
  } else {
    rows.value = [];
    if (res === false) {
      $q.notify({ type: "negative", message: "Failed to load DMS folder." });
    }
  }
  // Re-check boxes for paths already picked (kept across navigation)
  selectedRows.value = rows.value.filter(
    (r) => isPickable(r) && selectedPaths.value.includes(r.path)
  );
};

const onRowClick = (evt, row) => {
  if (!row) return;
  if (row.type === "folder") {
    crumbs.value.push({
      segment: row.id ?? row.path,
      label: row.label,
    });
    fetchRows(row.id ?? row.path);
  } else if (isPickable(row)) {
    const idx = selectedRows.value.findIndex((r) => r.path === row.path);
    if (idx >= 0) selectedRows.value.splice(idx, 1);
    else selectedRows.value.push(row);
  }
};

const goToCrumb = (idx) => {
  crumbs.value = crumbs.value.slice(0, idx + 1);
  fetchRows(crumbs.value[crumbs.value.length - 1].segment);
};

const removePath = (p) => {
  selectedPaths.value = selectedPaths.value.filter((x) => x !== p);
  selectedRows.value = selectedRows.value.filter((r) => r.path !== p);
};

// Keep the picked-path list in sync with the checkboxes,
// dropping rows that are not pickable under the current kind.
watch(selectedRows, (val) => {
  const allowed = (val ?? []).filter((r) => isPickable(r));
  if (allowed.length !== (val ?? []).length) {
    selectedRows.value = allowed;
    return;
  }
  const current = new Set((rows.value ?? []).map((r) => r.path));
  const next = new Set(selectedPaths.value);
  allowed.forEach((r) => next.add(r.path));
  (rows.value ?? []).forEach((r) => {
    if (current.has(r.path) && !allowed.some((a) => a.path === r.path)) {
      next.delete(r.path);
    }
  });
  const arr = [...next];
  if (JSON.stringify(arr) !== JSON.stringify(selectedPaths.value)) {
    selectedPaths.value = arr;
  }
});

const onSave = () => {
  onDialogOK([...selectedPaths.value]);
};

onMounted(() => {
  const start = (props.dmsOpt?.start_folder_id || "").toString().trim();
  if (start) {
    crumbs.value = [
      { segment: "", label: "Root" },
      { segment: start, label: "Start" },
    ];
  }
  fetchRows(start);
});
</script>
