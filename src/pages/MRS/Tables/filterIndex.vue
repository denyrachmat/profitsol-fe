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
            <div class="col-1 q-pr-md" v-if="idx > 0">
              <q-select
                filled
                v-model="list.conmet"
                :options="optConMet"
                dense
                label="Conn Met"
                map-options
                emit-value
                @update:model-value="list.value.splice(1, 1)"
                :disable="props.propsReports === 'sp'"
              ></q-select>
            </div>
            <div class="col">
              <q-select
                filled
                v-model="list.cols"
                :options="optionCols"
                dense
                label="Columns need to filtered"
                @update:model-value="list.value.splice(1, 1)"
              ></q-select>
            </div>
            <div class="col q-pl-md">
              <q-select
                filled
                v-model="list.opr"
                :options="optMet"
                dense
                label="Operation Method"
                map-options
                emit-value
                @update:model-value="list.value.splice(1, 1)"
                :disable="props.propsReports === 'sp'"
              ></q-select>
            </div>
            <div
              class="col q-pl-md"
              v-if="!(list.opr == '<cols>' || list.opr == '<cols>')"
            >
              <q-input
                label="value"
                v-model="list.value[0]"
                filled
                dense
                :readonly="
                  list.cols.type === 'date' || list.cols.type === 'datetime'
                "
              >
                <template
                  v-slot:prepend
                  v-if="
                    list.cols.type === 'date' || list.cols.type === 'datetime'
                  "
                >
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="list.value[0]"
                        :mask="
                          list.cols.type == 'date'
                            ? 'YYYY-MM-DD'
                            : 'YYYY-MM-DD HH:mm'
                        "
                      >
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

                <template v-slot:append v-if="list.cols.type === 'datetime'">
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-time
                        v-model="list.value[0]"
                        mask="YYYY-MM-DD HH:mm"
                        format24h
                      >
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div
              class="col q-pl-md"
              v-if="list.opr == '<cols>' || list.opr == '<cols>'"
            >
              <q-select
                filled
                v-model="list.value[0]"
                :options="optionCols"
                dense
                label="Columns need to filtered"
                @update:model-value="list.value.splice(1, 1)"
              ></q-select>
            </div>
            <div class="col q-pl-md" v-if="list.opr == 'between'">
              <q-input
                label="value"
                v-model="list.value[1]"
                filled
                dense
                :readonly="
                  list.cols.type === 'date' || list.cols.type === 'datetime'
                "
              >
                <template
                  v-slot:prepend
                  v-if="
                    list.cols.type === 'date' || list.cols.type === 'datetime'
                  "
                >
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="list.value[1]"
                        :mask="
                          list.cols.type == 'date'
                            ? 'YYYY-MM-DD'
                            : 'YYYY-MM-DD HH:mm'
                        "
                      >
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

                <template v-slot:append v-if="list.cols.type === 'datetime'">
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-time
                        v-model="list.value[1]"
                        mask="YYYY-MM-DD HH:mm"
                        format24h
                      >
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-time>
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
        <q-btn
          label="download"
          color="green"
          @click="onOKClick('download')"
          icon="download"
          flat
        />
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
  propsReports: String,
});

onMounted(() => {
  if (props.colsData.filter((col) => col.sortable_def).length > 0) {
    filterList.value = props.colsData
      .filter((col) => col.sortable_def)
      .map((col) => {
        return {
          cols: col.cols,
          value: [""],
          type: col.type,
          opr: "=",
          conmet: "and",
        };
      });
  }
  if (props.filtered.length > 0) {
    console.log(props.filtered);
    filterList.value = props.filtered;
  }
});

const filterList = ref([
  {
    cols: "",
    value: [""],
    type: "",
    opr: "=",
    conmet: "and",
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
          type: val.type,
        });
      }
    });
  }

  return hasil;
});

const addFilter = () => {
  filterList.value.push({
    cols: "",
    value: [""],
    type: "",
    opr: "=",
    conmet: "and",
  });
};

const optMet = ref([
  {
    label: "Exact Value",
    value: "=",
  },
  {
    label: "Contain Value",
    value: "like",
  },
  {
    label: "Range",
    value: "between",
  },
  {
    label: "More Than",
    value: ">",
  },
  {
    label: "More Than Equals",
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
  {
    label: "Not Equals",
    value: "<>",
  },
  {
    label: "Not Equals with other column",
    value: "<cols>",
  },
  {
    label: "Exact value with other column",
    value: "=cols",
  },
]);

const optConMet = ref([
  {
    label: "AND",
    value: "and",
  },
  {
    label: "OR",
    value: "or",
  },
]);

function onOKClick(typeOk = "ok") {
  onDialogOK({ data: filterList.value, type: typeOk });
}
</script>
