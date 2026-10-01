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
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">Setup Default Filter Data</div>
            <div class="text-caption">
              Each setup applies to its roles. Entries without roles apply to
              everyone.
            </div>
          </div>
          <div class="col-auto">
            <q-toggle
              v-model="readOnly"
              label="Read-only (disable filter)"
              dense
            />
            <q-btn
              icon="add"
              color="primary"
              dense
              label="Add setup"
              class="q-ml-md"
              @click="addSetup"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div v-if="setups.length === 0" class="text-italic text-grey">
          No filter setups. Add one to filter rows for specific roles.
        </div>
        <q-card
          v-for="(setup, sIdx) in setups"
          :key="sIdx"
          flat
          bordered
          class="q-mb-md"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-sm">
              <div class="col">
                <q-select
                  v-model="setup.roles"
                  :options="roleOptions"
                  label="Roles to be applied"
                  emit-value
                  map-options
                  multiple
                  use-chips
                  dense
                  filled
                  clearable
                  hint="Empty = applies to everyone"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  icon="delete"
                  color="negative"
                  flat
                  dense
                  @click="setups.splice(sIdx, 1)"
                >
                  <q-tooltip>Delete this setup</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div
              v-for="(row, rIdx) in setup.rows"
              :key="rIdx"
              class="row q-gutter-sm q-mt-sm items-center"
            >
              <div class="col" v-if="rIdx > 0" style="max-width: 110px">
                <q-select
                  v-model="row.conmet"
                  :options="conmetOptions"
                  label="Conn"
                  emit-value
                  map-options
                  dense
                  filled
                />
              </div>
              <div class="col">
                <q-select
                  v-model="row.cols"
                  :options="colOptions"
                  label="Column to filter"
                  emit-value
                  map-options
                  dense
                  filled
                  @update:model-value="(val) => onPickColumn(setup, row, val)"
                />
              </div>
              <div class="col" style="max-width: 170px">
                <q-select
                  v-model="row.opr"
                  :options="oprOptions"
                  label="Operation"
                  emit-value
                  map-options
                  dense
                  filled
                />
              </div>
              <div
                class="col"
                style="max-width: 220px"
                v-if="!['isnull', 'isnotnull'].includes(row.opr)"
              >
                <q-input
                  v-model="row.filterValue"
                  label="Filter value"
                  dense
                  filled
                />
              </div>
              <div class="col-auto">
                <q-btn
                  :icon="rIdx === 0 ? 'add' : 'delete'"
                  :color="rIdx === 0 ? 'green' : 'red'"
                  flat
                  dense
                  @click="
                    rIdx === 0 ? setup.rows.push(newRow()) : setup.rows.splice(rIdx, 1)
                  "
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="text-caption text-grey">
          Applies to: {{ applyToLabel }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" @click="onDialogCancel" />
        <q-btn label="Submit" color="primary" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useDialogPluginComponent } from "quasar";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  applyToLabel: { type: String, default: "roles" },
  roleOptions: { type: Array, default: () => [] },
  colOptions: { type: Array, default: () => [] },
  initialSetups: { type: Array, default: () => [] },
  initialReadOnly: { type: Boolean, default: false },
});

const conmetOptions = [
  { label: "AND", value: "and" },
  { label: "OR", value: "or" },
];

const oprOptions = [
  { label: "Exact Value", value: "=" },
  { label: "Contain Value", value: "like" },
  { label: "Range", value: "between" },
  { label: "More Than", value: ">" },
  { label: "More Than Equals", value: ">=" },
  { label: "Less Than", value: "<" },
  { label: "Less Than Equals", value: "<=" },
  { label: "Not Equals", value: "<>" },
  { label: "Is Null", value: "isnull" },
  { label: "Is Not Null", value: "isnotnull" },
];

const newRow = () => ({
  cols: props.colOptions.length > 0 ? props.colOptions[0].value : "",
  colLabel:
    props.colOptions.length > 0
      ? props.colOptions[0].label || props.colOptions[0].value
      : "",
  colType: props.colOptions.length > 0 ? props.colOptions[0].type || "" : "",
  opr: "=",
  conmet: "and",
  filterValue: "",
});

const normalizeInitial = () => {
  if (!Array.isArray(props.initialSetups) || props.initialSetups.length === 0) {
    return [];
  }
  return props.initialSetups.map((entry) => {
    const rowsSource = Array.isArray(entry.rows) ? entry.rows : [entry];
    return {
      roles: Array.isArray(entry.roles) ? [...entry.roles] : [],
      rows: rowsSource.map((r) => ({
        cols: r.cols?.value || r.cols || "",
        colLabel: r.cols?.label || r.cols?.value || r.cols || "",
        colType: r.cols?.type || r.type || "",
        opr: r.opr || "=",
        conmet: r.conmet || "and",
        filterValue: Array.isArray(r.value) ? r.value[0] ?? "" : r.value ?? "",
      })),
    };
  });
};

const setups = ref(normalizeInitial());
const readOnly = ref(props.initialReadOnly === true);

const addSetup = () => {
  setups.value.push({ roles: [], rows: [newRow()] });
};

const onPickColumn = (setup, row, val) => {
  const opt = props.colOptions.find((o) => o.value === val);
  if (opt) {
    row.colLabel = opt.label || opt.value;
    row.colType = opt.type || "";
  }
};

const onSubmit = () => {
  const filterData = [];
  setups.value.forEach((setup) => {
    const roles = Array.isArray(setup.roles) ? setup.roles : [];
    setup.rows.forEach((row) => {
      if (!row.cols) return;
      filterData.push({
        roles,
        cols: {
          value: row.cols,
          label: row.colLabel || row.cols,
          type: row.colType || "",
        },
        value: [row.filterValue ?? ""],
        type: row.colType || "",
        opr: row.opr || "=",
        conmet: row.conmet || "and",
      });
    });
  });

  onDialogOK({ filterData, readOnly: readOnly.value === true });
};
</script>
