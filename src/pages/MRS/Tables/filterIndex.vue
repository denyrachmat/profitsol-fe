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
        <template v-for="(list, idx) in filterList" :key="idx">
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
              ></q-select>
            </div>
            <div class="col q-pl-md">
              <q-input label="value" v-model="list.value" filled dense>
                <template
                  v-slot:append
                  v-if="list.cols.toLowerCase().includes('date')"
                >
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="list.value" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-1 q-pl-md">
              <q-btn
                :icon="idx === 0 ? 'add' : 'delete'"
                :color="idx === 0 ? 'green' : 'red'"
                @click="idx === 0 ? addFilter() : filterList.splice(idx, 1)"
              />
            </div>
          </div>
        </template>
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
});

onMounted(() => {
  if (props.filtered.length > 0) {
    filterList.value = props.filtered;
  }
});

const filterList = ref([
  {
    cols: "",
    value: "",
  },
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const optionCols = computed(() => {
  let hasil = [];
  if (props.colsData && props.colsData.length > 0) {
    props.colsData.map((val) => {
      if (val.field && val.filterable) {
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
    value: "",
  });
};

function onOKClick() {
  onDialogOK(filterList.value);
}
</script>
