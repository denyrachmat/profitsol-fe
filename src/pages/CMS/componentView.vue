<template>
  <div>
    <template v-if="props.type === 'normal'">
      <q-input
        v-model="modelData"
        :label="props.label"
        dense
        outlined
        :type="props.typeInput"
        v-if="props.comp === 'q-input'"
        :readonly="isReadonlyLocal || false"
      >
        <template
          v-slot:prepend
          v-if="props.typeInput === 'date' || props.typeInput === 'time'"
        >
          <q-icon
            :name="props.typeInput === 'date' ? 'event' : 'access_time'"
            class="cursor-pointer"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="modelData"
                mask="YYYY-MM-DD"
                v-if="props.typeInput === 'date'"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>

              <q-time v-model="modelData" mask="HH:mm" format24h v-else>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>

        <!-- If Datetime -->
        <template v-slot:prepend v-else-if="props.typeInput === 'datetime'">
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="modelData" mask="YYYY-MM-DD HH:mm">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>

        <template v-slot:append v-if="props.typeInput === 'datetime'">
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time v-model="modelData" mask="YYYY-MM-DD HH:mm" format24h>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>

        <template v-if="props.typeInput === 'pdf'"> </template>
      </q-input>
      <q-file
        outlined
        bottom-slots
        v-model="modelData"
        :label="props.label"
        counter
        max-files="12"
        v-if="props.comp === 'q-file'"
        dense
        :readonly="isReadonlyLocal"
      >
        <template v-slot:before>
          <q-icon name="folder_open" />
        </template>

        <template v-slot:hint> Field hint </template>

        <template v-slot:append>
          <q-btn round dense flat icon="add" @click.stop.prevent />
        </template>
      </q-file>
    </template>
    <template v-else-if="props.comp === 'q-dms'">
      <div v-if="!props.dmsOpt || !props.dmsOpt.root" class="text-grey">
        DMS Folder Picker not configured yet — open Setup Component Forms and
        press the folder button.
      </div>
      <div v-else>
        <span v-html="props.label" />
        <div class="q-gutter-xs q-py-sm" v-if="modelDataArr.length > 0">
          <q-chip
            v-for="(p, idx) in modelDataArr"
            :key="idx"
            removable
            @remove="removeDMSPath(idx)"
            color="primary"
            text-color="white"
            dense
            :disable="isReadonlyLocal || props.mode == 'live-read'"
          >
            {{ p }}
          </q-chip>
        </div>
        <div
          v-else
          class="text-caption text-grey-6 q-py-sm"
        >
          No folder picked yet.
        </div>
        <q-btn
          outline
          color="primary"
          icon="folder_open"
          label="Browse DMS"
          dense
          @click="openDMSBrowser()"
          v-if="!isReadonlyLocal && props.mode !== 'live-read'"
        />
        <div
          v-if="props.mode === 'edit'"
          class="text-caption text-grey-6 q-pt-xs"
        >
          Preview only — picked folders here are not saved.
        </div>
      </div>
    </template>
    <template v-else-if="props.type === 'multiple'">
      <template v-if="props.mode == 'edit'">
        <div style="max-height: 20vh; overflow: auto">
          <div class="row q-pb-md" v-for="(opt, idx) in detailData" :key="idx">
            <div class="col-5">
              <q-input
                label="Value of this options"
                v-model="opt.value"
                outlined
                dense
              />
            </div>
            <div class="col-6 q-pl-md">
              <q-input
                label="Label of this options"
                v-model="opt.label"
                outlined
                dense
              />
            </div>

            <div class="col-1 text-right">
              <q-btn
                icon="delete"
                color="red"
                flat
                @click="onDeleteData(idx)"
              />
            </div>
          </div>
        </div>

        <!-- Preview -->
        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 20vh;
            overflow: auto;
          "
        >
          <legend>Preview component here</legend>
          <div class="row q-pa-md" :key="refreshDetail">
            <div class="col">
              <q-select
                outlined
                v-model="modelData"
                :options="detailData"
                :label="props.label"
                emit-value
                map-options
                v-if="props.comp === 'q-select'"
                :loading="loadingAPI"
                @filter="checkAPIData"
                use-input
                dense
              />

              <template v-else-if="props.comp === 'q-checkbox'">
                <span v-html="props.label" />
                <div class="q-gutter-sm">
                  <q-option-group
                    :options="detailData"
                    type="checkbox"
                    v-model="modelDataArr"
                    :loading="loadingAPI"
                  />
                </div>
              </template>

              <template v-else-if="props.comp === 'q-radio'">
                <span v-html="props.label" />
                <div class="q-gutter-sm">
                  <q-option-group
                    :options="detailData"
                    v-model="modelData"
                    :loading="loadingAPI"
                  />
                </div>
              </template>

              <template v-else-if="props.comp === 'q-table'">
                <span v-html="props.label" />
                <q-input
                  v-model="tableFilter"
                  label="Search"
                  outlined
                  dense
                  clearable
                  class="q-mb-sm"
                />
                <q-table
                  :rows="detailData"
                  :columns="tableColumns"
                  row-key="value"
                  :selection="isTableMulti ? 'multiple' : 'single'"
                  v-model:selected="tableSelected"
                  :loading="loadingAPI"
                  :filter="tableFilter"
                  dense
                  @row-click="onTableRowClick"
                />
              </template>
            </div>
          </div>
        </fieldset>
      </template>
      <template v-else>
        <div>
          <q-select
            outlined
            v-model="modelData"
            :options="detailData"
            :label="props.label"
            emit-value
            map-options
            :readonly="isReadonlyLocal || props.mode == 'live-read'"
            v-if="props.comp === 'q-select'"
            :loading="loadingAPI"
            @filter="checkAPIData"
            use-input
            :input-debounce="1000"
            dense
          />

          <template v-else-if="props.comp === 'q-checkbox'">
            <span v-html="props.label" />
            <div class="q-gutter-sm">
              <q-option-group
                :options="props.detail"
                type="checkbox"
                v-model="modelDataArr"
                :disable="isReadonlyLocal || props.mode == 'live-read'"
              />
            </div>
          </template>

          <template v-else-if="props.comp === 'q-radio'">
            <span v-html="props.label"></span>
            <div class="q-gutter-sm">
              <q-option-group
                :options="props.detail"
                v-model="modelData"
                :disable="isReadonlyLocal || props.mode == 'live-read'"
              />
            </div>
          </template>

          <template v-else-if="props.comp === 'q-table'">
            <span v-html="props.label"></span>
            <q-input
              v-model="tableFilter"
              label="Search"
              outlined
              dense
              clearable
              class="q-mb-sm"
              :readonly="isReadonlyLocal || props.mode == 'live-read'"
            />
            <q-table
              :rows="tableRows"
              :columns="tableColumns"
              row-key="value"
              :selection="
                isReadonlyLocal || props.mode == 'live-read'
                  ? 'none'
                  : isTableMulti
                    ? 'multiple'
                    : 'single'
              "
              v-model:selected="tableSelected"
              :loading="loadingAPI"
              :filter="tableFilter"
              dense
              @row-click="onTableRowClick"
            />
          </template>
        </div>
      </template>
    </template>
  </div>
</template>
<script setup>
import { api } from "src/boot/axios";
import { defineProps, onMounted, ref, watch, computed } from "vue";
import { useQuasar } from "quasar";
import { useFormStore } from "stores/formStore";
import apiRequest from "src/components/apiRequest";
import dmsFolderBrowser from "./dmsFolderBrowser.vue";

const emit = defineEmits(["onDeleted", "customChange"]);

const $q = useQuasar();
const { postData } = apiRequest();

const modelData = ref("");
const refreshDetail = ref(0);
const modelDataArr = ref([]);
const props = defineProps({
  type: String,
  typeInput: String,
  comp: String,
  label: String,
  detail: Array,
  mode: String,
  ans: String,
  ansArr: Array,
  isRequired: Boolean,
  apiOpt: Object,
  dmsOpt: Object,
  readonly: Boolean,
});

const formStore = useFormStore();
const loadingAPI = ref(false);
const detailData = ref([]);

// ---- Table Select (multiple-table / q-table) ----
// Reuses the same detail_data + apiOpt config as the other Choose Answer
// components. Single table answers like radio/select (modelData),
// multi table answers like checkbox (modelDataArr).
const tableFilter = ref("");
const tableSelected = ref([]);

const tableRows = computed(() => {
  if (detailData.value && detailData.value.length > 0)
    return detailData.value;
  return props.detail ?? [];
});

const HIDDEN_TABLE_FIELDS = ["col_det_id", "col_det_label", "id_trees"];

// multiple-table = single choice, multiple-table-multi = multiple choice.
// Derived from typeInput so every existing caller works without changes.
const isTableMulti = computed(
  () => props.comp === "q-table" && props.typeInput === "multiple-table-multi"
);

const tableColumns = computed(() => {
  const rows = tableRows.value ?? [];
  if (rows.length === 0) return [];
  const keys = [];
  rows.forEach((row) => {
    Object.keys(row ?? {}).forEach((k) => {
      if (!HIDDEN_TABLE_FIELDS.includes(k) && !keys.includes(k)) keys.push(k);
    });
  });
  // Keep value/label first, extra API/manual fields after
  keys.sort((a, b) => {
    const order = (k) => (k === "value" ? 0 : k === "label" ? 1 : 2);
    return order(a) - order(b);
  });
  return keys.map((k) => ({
    name: k,
    label: k === "value" ? "Value" : k === "label" ? "Label" : k,
    field: k,
    align: "left",
    sortable: true,
  }));
});

const syncTableSelection = () => {
  const rows = tableRows.value ?? [];
  if (isTableMulti.value) {
    const wanted = new Set(
      (modelDataArr.value ?? []).map((v) => String(v))
    );
    const next = rows.filter((r) => wanted.has(String(r?.value)));
    if (JSON.stringify(tableSelected.value) !== JSON.stringify(next)) {
      tableSelected.value = next;
    }
    return;
  }
  const found = rows.find(
    (r) => String(r?.value) === String(modelData.value)
  );
  const next = found ? [found] : [];
  if (JSON.stringify(tableSelected.value) !== JSON.stringify(next)) {
    tableSelected.value = next;
  }
};

const onTableRowClick = (evt, row) => {
  if (isReadonlyLocal.value || props.mode == "live-read" || !row) return;
  if (isTableMulti.value) {
    const idx = tableSelected.value.findIndex(
      (r) => String(r?.value) === String(row?.value)
    );
    if (idx >= 0) {
      tableSelected.value.splice(idx, 1);
    } else {
      const found = (tableRows.value ?? []).find(
        (r) => String(r?.value) === String(row?.value)
      );
      if (found) tableSelected.value.push(found);
    }
  } else {
    if (JSON.stringify(tableSelected.value) !== JSON.stringify([row])) {
      tableSelected.value = [row];
    }
  }
};

watch(tableSelected, (val) => {
  if (isTableMulti.value) {
    const picked = (val ?? []).map((r) => r?.value ?? "");
    if (JSON.stringify(picked) !== JSON.stringify(modelDataArr.value)) {
      modelDataArr.value = picked;
    }
    return;
  }
  const picked = val && val.length > 0 ? val[0]?.value : "";
  if (picked !== modelData.value) {
    modelData.value = picked ?? "";
  }
});

watch(tableRows, () => {
  syncTableSelection();
});

watch(modelData, () => {
  syncTableSelection();
});

watch(
  () => JSON.stringify(modelDataArr.value),
  () => {
    syncTableSelection();
  }
);

const onDeleteData = (idx) => {
  detailData.value.splice(idx, 1);
  emit("onDeleted", detailData.value);
};

// ---- DMS Folder Picker (multiple-dms / q-dms) ----
const removeDMSPath = (idx) => {
  modelDataArr.value.splice(idx, 1);
};

const openDMSBrowser = () => {
  if (!props.dmsOpt || !props.dmsOpt.root) {
    $q.notify({ type: "negative", message: "DMS picker is not configured." });
    return;
  }
  $q.dialog({
    component: dmsFolderBrowser,
    componentProps: {
      dmsOpt: props.dmsOpt,
      initial: [...(modelDataArr.value ?? [])],
    },
  }).onOk((val) => {
    modelDataArr.value = Array.isArray(val) ? val : [];
  });
};

onMounted(() => {
  // console.log("masuk awalan");

  // if (props.mode && props.mode.includes("live")) {
  //   checkAPIData();
  // }

  if (props.ans !== undefined && props.ans !== null && props.ans !== "") {
    modelData.value = props.ans;
  }

  if (props.ansArr && props.ansArr.length > 0) {
    // console.log(props.ansArr);
    modelDataArr.value = props.ansArr;
  }

  // Seed manual options so the table renders before any change event
  if (
    (!detailData.value || detailData.value.length === 0) &&
    props.detail &&
    props.detail.length > 0
  ) {
    detailData.value = [...props.detail];
  }

  // q-table has no @filter trigger like q-select, so fetch API rows on mount
  if (
    props.comp === "q-table" &&
    props.apiOpt &&
    props.apiOpt.api_url &&
    (!detailData.value || detailData.value.length === 0)
  ) {
    checkAPIData();
  }

  // q-select only loads API options on filter input; on mount (e.g. editing an
  // existing answer) fetch them so the current value can resolve to its label.
  if (
    props.comp === "q-select" &&
    props.apiOpt &&
    props.apiOpt.api_url &&
    (!detailData.value || detailData.value.length === 0)
  ) {
    checkAPIData();
  }

  syncTableSelection();
});

const checkAPIData = async (val, update, abort) => {
  if (val && detailData.value && detailData.value.length > 0) {
    // console.log(detailData.value);
    if (typeof val === "string" || typeof val === "number") {
      if (typeof update === "function") {
        update(() => {
          detailData.value = detailData.value.filter(
            (opt) =>
              (opt.label &&
                opt.label
                  .toLowerCase()
                  .includes(val.toString().toLowerCase())) ||
              (opt.value &&
                opt.value
                  .toString()
                  .toLowerCase()
                  .includes(val.toString().toLowerCase()))
          );
        });
      } else {
        detailData.value = detailData.value.filter(
          (opt) =>
            (opt.label &&
              opt.label.toLowerCase().includes(val.toString().toLowerCase())) ||
            (opt.value &&
              opt.value
                .toString()
                .toLowerCase()
                .includes(val.toString().toLowerCase()))
        );
      }

      return;
    }
  }

  if (props.apiOpt) {
    if (!props.apiOpt.api_url) {
      loadingAPI.value = false;
      return;
    }

    const fetchOptions = {
      method: props.apiOpt.api_method || "GET",
      headers: props.apiOpt.api_headers || {
        "Content-Type": "application/json",
      },
    };

    if (
      fetchOptions.method !== "GET" &&
      fetchOptions.method !== "HEAD" &&
      props.apiOpt.api_params
    ) {
      fetchOptions.body = getParams(JSON.stringify(props.apiOpt.api_params));
    }

    if (!detailData.value || detailData.value.length === 0) {
      loadingAPI.value = true;
      const data = await postData(
        props.apiOpt.api_method?.toLowerCase(),
        fetchOptions.body,
        "",
        false,
        false,
        false,
        props.apiOpt.api_url
      );

      if (data) {
        // console.log(data);
        // console.log("API request aborted");
        loadingAPI.value = false;

        // Navigate through the nested data structure
        let currentData = props.apiOpt.selectedNode.reduce((acc, key) => {
          if (acc === undefined || acc === null) {
            console.error(`Key ${key} not found in response data`);
            throw new Error(`Key ${key} not found`);
          }

          // Handle array case
          if (Array.isArray(acc)) {
            if (typeof key === "number") {
              return props.apiOpt.isExactChoosedKeys ? acc[key] : [...acc];
            }
            return acc.map((item) => item[key]);
          }

          // Handle object case
          return acc[key];
        }, data);

        // Transform the final data into the required format.
        // Table Select may carry extra display columns via apiOpt.selectedColumns.
        const extraColumns = Array.isArray(props.apiOpt.selectedColumns)
          ? props.apiOpt.selectedColumns
          : [];
        console.log("Table API columns:", extraColumns);
        const resultAPI = Array.isArray(currentData)
          ? currentData.map((element, index) => {
              const row = {
                value:
                  element[props.apiOpt.selectedKeys.value] ??
                  element.value ??
                  index + 1,
                label:
                  element[props.apiOpt.selectedKeys.label] ??
                  element.label ??
                  "",
              };
              extraColumns.forEach((col) => {
                if (!(col in row)) row[col] = element[col] ?? "";
              });
              return row;
            })
          : [];

        loadingAPI.value = false;

        if (typeof update === "function") {
          update(() => {
            detailData.value = resultAPI;
          });
        } else {
          detailData.value = resultAPI;
        }
        return;
      } else {
        console.error("API request failed");
        loadingAPI.value = false;
        $q.notify({
          type: "negative",
          message: "Failed to fetch data from API",
        });
        return;
      }
    } else {
      update(() => {
        detailData.value = props.detail;
      });
    }

    // fetch(props.apiOpt.api_url, fetchOptions)
    //   .then((response) => {
    //     if (!response.ok) throw new Error("Network response was not ok");
    //     return response.json();
    //   })
    //   .then((data) => {
    //     // Navigate through the nested data structure
    //     let currentData = props.apiOpt.selectedNode.reduce((acc, key) => {
    //       if (acc === undefined || acc === null) {
    //         console.error(`Key ${key} not found in response data`);
    //         throw new Error(`Key ${key} not found`);
    //       }

    //       // Handle array case
    //       if (Array.isArray(acc)) {
    //         if (typeof key === "number") {
    //           return props.apiOpt.isExactChoosedKeys ? acc[key] : [...acc];
    //         }
    //         return acc.map((item) => item[key]);
    //       }

    //       // Handle object case
    //       return acc[key];
    //     }, data);

    //     // Transform the final data into the required format
    //     const resultAPI = Array.isArray(currentData)
    //       ? currentData.map((element, index) => ({
    //           value:
    //             element[props.apiOpt.selectedKeys.value] ??
    //             element.value ??
    //             index + 1,
    //           label:
    //             element[props.apiOpt.selectedKeys.label] ?? element.label ?? "",
    //         }))
    //       : [];

    //     loadingAPI.value = false;

    //     if (typeof update === "function") {
    //       update(() => {
    //         detailData.value = resultAPI;
    //       });
    //     } else {
    //       detailData.value = resultAPI;
    //     }
    //   })
    //   .catch((err) => {
    //     console.error("API Error:", err);
    //     $q.notify({
    //       type: "negative",
    //       message: "Failed to fetch data from API",
    //     });
    //     loadingAPI.value = false;
    //   });
  } else {
    // console.log("tidak ada apiOpt");
    update(() => {
      detailData.value = props.detail;
    });
  }
};

const onSelectData = (val) => {
  const checkAPI = props.apiOpt && props.apiOpt.api_url;
  if (checkAPI) {
    // console.log("onSelectData", val);
    const selectedOption = detailData.value.find(
      (option) => option.value === val
    );

    detailData.value = [selectedOption];
    // console.log("Selected option:", selectedOption);
  } else {
    // modelData.value = val;
  }
};

const getParams = (params) => {
  // console.log(params);
  // Parse the api_params value if it's a valid JSON string
  if (!params || (typeof params === "string" && params.trim() === ""))
    return {};
  try {
    const parsed = JSON.parse(params);

    if (Array.isArray(parsed)) {
      const result = {};

      parsed.forEach((item) => {
        // Case 1: Simple parameter (no dots)
        if (!item.param_name.includes(".")) {
          const value = item.form_id ?? item.default_value;

          // If the value is a string, split into array of characters
          result[item.param_name] = value;
          return;
        }

        // Case 2: Array-style parameter (filter.[0].cols)
        const arrayMatch = item.param_name.match(/^([^.]+)\.\[(\d+)\]\.(\w+)/);
        if (arrayMatch) {
          const [_, rootKey, index, property] = arrayMatch;

          if (!result[rootKey]) result[rootKey] = [];
          if (!result[rootKey][index]) result[rootKey][index] = {};

          const idForm = Object.values(formStore.getUsersAnswerForm).find(
            (val) => val[item.form_id] !== undefined
          )?.[item.form_id];

          const value = idForm ?? item.default_value;
          result[rootKey][index][property] = value;
          return;
        }

        // Case 3: Object-style parameter (filter.cols)
        const objectMatch = item.param_name.match(/^([^.]+)\.(\w+)$/);
        if (objectMatch) {
          const [_, rootKey, property] = objectMatch;

          if (!result[rootKey]) result[rootKey] = {};

          const value = item.form_id ?? item.default_value;
          result[rootKey][property] = value;
        }
      });

      // Convert array-style objects to proper arrays
      Object.keys(result).forEach((key) => {
        if (typeof result[key] === "object" && !Array.isArray(result[key])) {
          const entries = Object.entries(result[key]);
          if (entries.every(([k]) => !isNaN(k))) {
            result[key] = Object.values(result[key]);
          }
        }
      });

      return result;
    }

    return parsed;
  } catch (e) {
    console.error("Error parsing api_params:", e);
    return {};
  }
};

// Buat status readonly lokal yang reaktif
const isReadonlyLocal = ref(props.readonly || false);

// Pantau perubahan props.readonly dari komponen induk secara realtime
watch(
  () => props.readonly,
  (newVal) => {
    isReadonlyLocal.value = newVal;
  },
  { immediate: true } // <-- WAJIB TAMBAHKAN INI
);

watch(
  () => JSON.stringify(props.detail),
  (val) => {
    // console.log(props);
    detailData.value = JSON.parse(val);

    modelDataArr.value = props.ansArr;
    // refreshDetail.value = refreshDetail.value + 1;
    // emit("onDeleted", JSON.parse(val));
  }
);

watch(
  () => JSON.stringify(detailData.value),
  (val) => {
    detailData.value = JSON.parse(val);

    emit("onDeleted", JSON.parse(val));
    refreshDetail.value = refreshDetail.value + 1;
  }
);

watch(
  () => props.ans,
  (val) => {
    // console.log("masuk cek jawaban 1");
    modelData.value = val;
  }
);

watch(
  () => JSON.stringify(props.ansArr),
  (val) => {
    if (JSON.parse(val).length > 0) {
      // console.log("masuk cek jawaban Array");
      // console.log(JSON.parse(val));
      modelDataArr.value = JSON.parse(val);
    }
  }
);

// JAWABAN YANG DIPILIH (ARRAY / CHECKBOX)
watch(
  () => JSON.stringify(modelDataArr.value),
  (val) => {
    // PENGAMAN: Jika dalam mode readonly, blokir pengiriman data ke parent
    if (isReadonlyLocal.value) return;

    if (modelDataArr.value) {
      if (props.mode == "live-ans") {
        emit("customAnschange", JSON.parse(val));
      } else {
        emit("customChange", JSON.parse(val));
      }
    }
  }
);

// JAWABAN YANG DIPILIH (SINGLE VALUE / INPUT / SELECT / RADIO)
watch(
  () => modelData.value,
  (val, prev) => {
    // PENGAMAN: Jika dalam mode readonly, blokir pengiriman data ke parent
    if (isReadonlyLocal.value) return;

    // Kirim walau nilainya falsy (0 / '' / false), asal benar-benar berubah agar
    // logika (mis. tampilkan komponen jika pilih nilai X) tetap terpicu.
    if (val !== prev) {
      if (props.mode == "live-ans") {
        emit("customAnschange", val);
      } else {
        emit("customChange", val);
      }
    }
  }
);

// Jawaban yang di pilih
// watch(
//   () => JSON.stringify(modelDataArr.value),
//   (val) => {
//     if (modelDataArr.value) {
//       if (props.mode == "live-ans") {
//         emit("customAnschange", JSON.parse(val));
//       } else {
//         emit("customChange", JSON.parse(val));
//       }
//     }
//   }
// );

// watch(
//   () => modelData.value,
//   (val) => {
//     if (modelData.value) {
//       // console.log(props.mode);
//       // console.log(val);
//       if (props.mode == "live-ans") {
//         emit("customAnschange", val);
//       } else {
//         emit("customChange", val);
//       }
//     }
//   }
// );
</script>
