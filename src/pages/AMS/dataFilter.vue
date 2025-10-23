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
        <div class="text-h6">Filter Data</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div v-for="(list, idx) in filterList" :key="idx">
          <div :class="`row ${idx === 0 ? '' : 'q-pt-md'}`">
            <div class="col">
              <q-select
                filled
                v-model="list.cols"
                :options="optionCols"
                dense
                label="Columns need to filtered"
                emit-value
                map-options
                :readonly="isNonEdit"
              ></q-select>
            </div>
            <div class="col q-pl-md">
              <q-select
                v-model="list.param"
                :options="oprOpt"
                label="Operator"
                dense
                outlined
                emit-value
                map-options
                :readonly="isNonEdit"
              >
              </q-select>
            </div>
            <div class="col q-pl-md">
              <q-input label="value" v-model="list.value" filled dense />
            </div>
            <div class="col-1 q-pl-md" v-if="!isNonEdit">
              <q-btn
                :icon="idx === 0 ? 'add' : 'delete'"
                :color="idx === 0 ? 'green' : 'red'"
                @click="idx === 0 ? addFilter() : filterList.splice(idx, 1)"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Search" color="primary" @click="onOKClick" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const props = defineProps({
  colsData: Array,
  filtered: Array,
  nonEdit: Boolean,
});

onMounted(() => {
  if (props.filtered.length > 0) {
    filterList.value = props.filtered;
  }

  console.log(props.nonEdit);
  if (props.nonEdit) {
    isNonEdit.value = props.nonEdit;
  }
});

const isNonEdit = ref(false);

const oprOpt = ref([
  {
    label: "Equal",
    value: "=",
  },
  {
    label: "Not Equal",
    value: "<>",
  },
  {
    label: "Contains",
    value: "like",
  },
  {
    label: "Not Contains",
    value: "not_like",
  },
  {
    label: "Greater Than",
    value: ">",
  },
  {
    label: "Greater Than Equals",
    value: ">=",
  },
  {
    label: "Less Than",
    value: "<",
  },
  {
    label: "Less Than Equals",
    value: "<=",
  },
]);

const filterList = ref([
  {
    cols: "",
    param: "=",
    value: "",
  },
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const optionCols = computed(() => {
  let hasil = [];
  if (props.colsData && props.colsData.length > 0) {
    props.colsData.map((val) => {
      if (val.field) {
        hasil.push({
          value: val.name,
          label: val.label,
        });
      }
    });
  }

  return hasil;
});

const addFilter = () => {
  filterList.value.push({
    cols: "",
    param: "=",
    value: "",
  });
};

function onOKClick() {
  onDialogOK(filterList.value);
}
</script>
