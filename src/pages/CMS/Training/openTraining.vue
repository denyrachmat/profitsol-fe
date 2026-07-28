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

        <q-select
          outlined
          v-model="choosedData"
          :options="filteredOptions"
          label="Choose Data"
          emit-value
          map-options
          :loading="loading"
          use-input
          input-debounce="300"
          @filter="onFilter"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>
                  <q-badge
                    :color="statusColor(scope.opt.status)"
                    class="q-mr-sm"
                  >
                    {{ scope.opt.status || "draft" }}
                  </q-badge>
                  <span v-if="scope.opt.year">Year: {{ scope.opt.year }}</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
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
    opts = opts.filter(
      (o) => String(o.year) === String(filterYear.value)
    );
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
    }));
  } else {
    loading.value = false;
  }
};

const onClone = async () => {
  if (!choosedData.value) return;

  const sourceItem = listData.value.find((o) => o.value?.id === choosedData.value?.id);
  if (!sourceItem) return;

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
