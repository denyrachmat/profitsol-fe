<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="q-dialog-plugin bg-white q-pa-md">
      <q-card-section>
        <div class="text-h6">Open Forms Content</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row q-gutter-md q-mb-md">
          <div class="col">
            <q-select
              outlined
              v-model="filterStatus"
              :options="statusFilterOptions"
              label="Filter by Status"
              emit-value
              map-options
              clearable
              dense
            />
          </div>
          <div class="col">
            <q-input
              outlined
              v-model="filterYear"
              label="Filter by Year"
              type="number"
              dense
              clearable
            />
          </div>
        </div>

        <q-input
          outlined
          dense
          debounce="300"
          v-model="searchText"
          placeholder="Search title"
          clearable
          class="q-mb-sm"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="filteredOptions"
          :columns="columns"
          row-key="label"
          :loading="loading"
          :pagination="pagination"
          dense
          flat
          bordered
          :rows-per-page-options="[5, 10, 20, 0]"
          @row-click="(evt, row) => { choosedData = row.value }"
          no-data-label="No forms found"
        >
          <template v-slot:body="props">
            <q-tr
              :props="props"
              :class="String(choosedData?.id) === String(props.row.value?.id) ? 'bg-blue-1' : ''"
              @click="choosedData = props.row.value"
              style="cursor: pointer"
            >
              <q-td key="label" :props="props">
                <div class="text-weight-medium">{{ props.row.label }}</div>
                <div class="text-caption text-grey">{{ props.row.value?.id }}</div>
              </q-td>
              <q-td key="status" :props="props" class="text-center">
                <q-badge :color="statusColor(props.row.status)">{{ props.row.status || "draft" }}</q-badge>
              </q-td>
              <q-td key="created_at" :props="props" class="text-center">
                {{ props.row.created_at ? new Date(props.row.created_at).toLocaleString() : "-" }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <div v-if="choosedData" class="q-mt-sm text-caption text-grey">Selected: {{ choosedData?.title || listData.find(o=>String(o.value?.id)===String(choosedData?.id))?.label }}</div>
      </q-card-section>

      <q-card-actions align="between">
        <q-btn
          flat
          label="Clone Selected"
          icon="content_copy"
          color="orange"
          :disable="!choosedData"
          @click="onClone"
          :loading="cloning"
        />
        <div>
          <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
          <q-btn label="OK" color="primary" @click="onOKClick" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { postData } = apiRequest();

const listData = ref([]);
const choosedData = ref(null);
const loading = ref(false);
const cloning = ref(false);
const filterStatus = ref(null);
const filterYear = ref(null);
const searchText = ref("");
const columns = ref([
  { name: "label", label: "Title", field: "label", align: "left", sortable: true },
  { name: "status", label: "Status", field: "status", align: "center", sortable: true },
  {
    name: "created_at",
    label: "Created At",
    field: "created_at",
    align: "center",
    sortable: true,
    format: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
  },
]);
const pagination = ref({ page: 1, rowsPerPage: 10, sortBy: "label", descending: false });

const props = defineProps({
  type: String,
});

onMounted(() => {
  getData();
});

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const statusFilterOptions = ref([
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Closed", value: "closed" },
]);

const statusColor = (status) => {
  const map = { draft: "grey", active: "green", closed: "red" };
  return map[status] || "grey";
};

const filteredOptions = computed(() => {
  let opts = listData.value;
  if (filterStatus.value) {
    opts = opts.filter((o) => (o.status || "draft") === filterStatus.value);
  }
  if (filterYear.value) {
    const target = String(filterYear.value);
    opts = opts.filter((o) => {
      const createdYear = o.created_at ? String(new Date(o.created_at).getFullYear()) : "";
      const fallbackYear = String(o.year || "");
      return (createdYear || fallbackYear) === target;
    });
  }
  if (searchText.value) {
    const s = searchText.value.toLowerCase();
    opts = opts.filter((o) => o.label.toLowerCase().includes(s));
  }
  return opts;
});

const onFilter = (val, update) => {
  searchText.value = val;
  update();
};

const getData = async () => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `cms/forms/${props.type}`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    listData.value = (data.data || []).map((item) => ({
      ...item,
      status: item.value?.status || "draft",
      year: item.value?.year || null,
      created_at: item.value?.created_at || item.created_at || null,
    }));
  } else {
    loading.value = false;
  }
};

const onClone = async () => {
  if (!choosedData.value?.id) return;

  const sourceItem = listData.value.find((o) => String(o.value?.id) === String(choosedData.value?.id));
  if (!sourceItem) {
    $q.notify({ type: "negative", message: "Source not found" });
    return;
  }

  $q.dialog({
    title: "Clone Form",
    message: `Clone "${sourceItem.label}"? Enter a new title and year.`,
    prompt: {
      model: sourceItem.label + " (Copy)",
      label: "New Title",
      outlined: true,
    },
    cancel: true,
    persistent: true,
  }).onOk(async (newTitle) => {
    $q.dialog({
      title: "Set Year",
      message: "Enter the year for the cloned form:",
      prompt: {
        model: new Date().getFullYear().toString(),
        label: "Year",
        type: "number",
        outlined: true,
      },
      cancel: true,
      persistent: true,
    }).onOk(async (newYear) => {
      cloning.value = true;
      const result = await postData(
        "post",
        {
          id: sourceItem.value.id,
          title: newTitle,
          year: newYear,
        },
        "cms/cloneForm",
        false,
        false,
        true
      );
      cloning.value = false;

      if (result) {
        $q.notify({ type: "positive", message: "Form cloned successfully!" });
        await getData();
      }
    });
  });
};

function onOKClick() {
  onDialogOK(choosedData.value);
}
</script>
