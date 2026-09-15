<template>
  <q-dialog
    ref="dialogRef"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white q-pa-md">
      <q-card-section class="text-h6">
        <div class="row">
          <div class="col">Add API Component Options</div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-form @submit="onClickGetData">
          <div class="row">
            <div class="col">
              <q-input
                v-model="api_url"
                outlined
                dense
                label="API URL"
                :rules="[
                  (val) => !!val || 'API URL is required',
                  (val) => /^(https?:\/\/)/.test(val) || 'Enter a valid URL',
                ]"
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-select
                v-model="api_method"
                :options="['GET', 'POST', 'PUT', 'DELETE', 'PATCH']"
                outlined
                dense
                label="API Method"
                emit-value
                map-options
                :rules="[(val) => !!val || 'API Method is required']"
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-input
                v-model="api_params"
                outlined
                dense
                label="API Params"
                :rules="[
                  (val) => {
                    if (!val || val.length === 0) return true;
                    try {
                      JSON.parse(val);
                      return true;
                    } catch (e) {
                      return 'Params must be valid JSON';
                    }
                  },
                ]"
              />
            </div>
            <div class="col-1 text-right">
              <q-btn
                color="primary"
                outline
                icon="filter_list"
                @click="onClickAddAPIParam"
              >
                <q-tooltip>Get param from other fields</q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-input
                v-model="api_headers"
                outlined
                dense
                label="API Headers"
                placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                hint="Enter headers as JSON object"
                :rules="[
                  (val) => {
                    if (!val || val.length === 0) return true;
                    try {
                      JSON.parse(val);
                      return true;
                    } catch (e) {
                      return 'Headers must be valid JSON';
                    }
                  },
                ]"
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-breadcrumbs class="text-grey" active-color="purple">
                <template v-slot:separator>
                  <q-icon size="1.2em" name="arrow_forward" color="purple" />
                </template>

                <q-breadcrumbs-el
                  :label="String(node)"
                  :icon="node === 'Array' ? 'list' : 'folder'"
                  v-for="(node, idx) in selectedNode"
                  :key="idx"
                />
              </q-breadcrumbs>
            </div>
            <div class="col">
              <q-input
                v-model="cutArrayTotal"
                outlined
                dense
                label="Cut Array Total (Max Array Length if array is found, set as 0 for no limit)"
                :rules="[
                  (val) => !isNaN(val) || 'Must be a number',
                  (val) => val >= 0 || 'Must be 0 or greater',
                ]"
                type="number"
                min="0"
              />
            </div>
            <div class="col text-right">
              <q-btn
                color="primary"
                outline
                label="Get Data"
                icon="download"
                type="submit"
                :loading="loading"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-splitter v-model="splitterModel" style="height: 400px">
        <template v-slot:before>
          <div class="q-pa-md q-gutter-sm" style="overflow: auto">
            <template v-if="listKeys && listKeys.length > 0">
              <q-tree
                :nodes="listKeys"
                node-key="id_trees"
                selected-color="primary"
                @update:selected="onSelectedData"
                v-model:selected="selectedNodeModel"
              />
            </template>
            <template v-else>
              <q-item clickable v-ripple>
                <q-item-section>No object found</q-item-section>
              </q-item>
            </template>
          </div>
        </template>

        <template v-slot:after>
          <div class="row items-center q-gutter-sm">
            <div class="col">
              <q-toggle
                v-model="isExactChoosedKeys"
                checked-icon="check"
                color="red"
                label="Exact Choosed Keys ?"
                unchecked-icon="clear"
                :disable="selectedData.length === 0"
              />
            </div>
          </div>
          <div class="q-pa-md" v-if="isTable">
            <q-select
              v-model="selectedColumns"
              :options="columnOptions"
              multiple
              use-chips
              emit-value
              map-options
              outlined
              dense
              label="Extra table columns"
              hint="Value & Label are always shown. Pick more API fields as table columns."
            />
          </div>
          <div class="q-pa-md" style="overflow: auto">
            <template v-if="selectedData && selectedData.length > 0">
              <q-list
                dense
                bordered
                padding
                class="rounded-borders"
                v-for="(item, idx) in selectedData.filter(
                  (item) => item.label !== 'id_trees'
                )"
                :key="idx"
              >
                <q-item clickable v-ripple>
                  <q-item-section>
                    <q-item-label>{{ item.label }} </q-item-label>
                    <q-item-label caption lines="1">Keys</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{
                        item.ex_value &&
                        JSON.stringify(item.ex_value).length > 25
                          ? typeof item.ex_value === "object"
                            ? JSON.stringify(item.ex_value).slice(0, 25) + "..."
                            : String(item.ex_value).slice(0, 25) + "..."
                          : item.ex_value
                      }}
                    </q-item-label>
                    <q-item-label caption lines="1"
                      >Example Value {{
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section top side>
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn
                        color="green"
                        icon="content_copy"
                        flat
                        dense
                        @click="() => onClickCopyValue(item.ex_value)"
                      >
                        <q-tooltip>Copy Value</q-tooltip>
                      </q-btn>
                      <q-btn-toggle
                        v-model="item.stateAs"
                        class="my-custom-toggle"
                        dense
                        no-caps
                        rounded
                        unelevated
                        toggle-color="primary"
                        color="white"
                        text-color="primary"
                        multiple
                        :options="[
                          {
                            value: 'value',
                            slot: 'one',
                          },
                          {
                            value: 'label',
                            slot: 'two',
                          },
                        ]"
                        :disable="
                          selectedKeys.label !== '' && selectedKeys.value !== ''
                        "
                        @update:model-value="
                          (val) => {
                            if (val === 'value') {
                              selectedKeys.value = val;
                            } else if (val === 'label') {
                              selectedKeys.label = val;
                            }
                          }
                        "
                      >
                        <template v-slot:one>
                          <div class="row items-center no-wrap">
                            <q-icon right name="check" />
                          </div>
                          <q-tooltip>Mark As Value</q-tooltip>
                        </template>

                        <template v-slot:two>
                          <div class="row items-center no-wrap">
                            <q-icon right name="label" />
                          </div>
                          <q-tooltip>Mark As Label</q-tooltip>
                        </template>
                      </q-btn-toggle>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
            <q-list dense bordered padding class="rounded-borders" v-else>
              <q-item clickable v-ripple>
                <q-item-section> No Data Selected </q-item-section>
              </q-item>
            </q-list>
          </div>
        </template>
      </q-splitter>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="onDialogCancel" :loading="loading" />
        <q-btn
          color="primary"
          label="Save"
          @click="saveOptions()"
          :loading="loading"
          :disable="selectedKeys.label === '' || selectedKeys.value === ''"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

import addAPIParamByComponent from "./addAPIParamByComponent.vue";

const api_url = ref("http://localhost/STX/stx-api/public/api/cms/forms/forms");
const api_method = ref("GET");
const api_params = ref("");
const api_headers = ref("");
const api_data = ref([]); // To store fetched API data
const listKeys = ref([]); // To store keys from the fetched data
const selectedData = ref([]);
const splitterModel = ref(50); // Initial splitter position
const selectedNodeModel = ref([]);
const selectedNode = ref([]);
const loading = ref(false);
const isExactChoosedKeys = ref(false); // Toggle for exact chosen keys
const cutArrayTotal = ref(10); // Total number of items in the array
const refreshedKey = ref(0); // Key to force re-render of the tree
const selectedKeys = ref({
  label: "",
  value: "",
}); // To store selected keys from the tree

const selectedPath = ref([]);

const $q = useQuasar();
const { onDialogCancel, onDialogOK, dialogRef } = useDialogPluginComponent();

const props = defineProps({
  detailData: Object,
  forms: Array,
  comp: { type: String, default: "" },
});

const isTable = computed(() => props.comp === "q-table");
const selectedColumns = ref([]);
const columnOptions = computed(() =>
  (Array.isArray(selectedData.value) ? selectedData.value : [])
    .map((item) => item.label)
    .filter((label) => label && label !== "id_trees")
);

// Re-apply previously saved value/label/column marks onto freshly
// fetched key lists (e.g. when reopening an existing API config).
const applySavedMarks = () => {
  if (!Array.isArray(selectedData.value)) selectedData.value = [];
  const vk = selectedKeys.value?.value || "";
  const lk = selectedKeys.value?.label || "";
  selectedData.value.forEach((item) => {
    if (vk && item.label === vk) item.stateAs = "value";
    else if (lk && item.label === lk) item.stateAs = "label";
  });
  const available = selectedData.value.map((i) => i.label);
  selectedColumns.value = (selectedColumns.value || []).filter(
    (c) => available.includes(c) && c !== vk && c !== lk
  );
};

onMounted(() => {
  console.log(getAllForms.value);
  // Initialize the component with default values or props
  if (props.detailData) {
    api_url.value = props.detailData.api_url || api_url.value;
    api_method.value = props.detailData.api_method || api_method.value;
    api_params.value = props.detailData.api_params
      ? JSON.stringify(props.detailData.api_params)
      : "";
    api_headers.value = props.detailData.api_headers
      ? JSON.stringify(props.detailData.api_headers)
      : "";
    selectedNode.value = props.detailData.selectedNode || [];
    isExactChoosedKeys.value = props.detailData.isExactChoosedKeys || false;
    // NOTE: selectedData must stay an array of { label, ex_value, stateAs } —
    // never assign selectedKeys ({ value, label }) here, it breaks .map/.filter.
    selectedKeys.value = {
      label: props.detailData.selectedKeys?.label || "",
      value: props.detailData.selectedKeys?.value || "",
    };
    selectedColumns.value = Array.isArray(props.detailData.selectedColumns)
      ? [...props.detailData.selectedColumns]
      : [];

    onClickGetData(); // Fetch data on component mount
  }
});

const getAllForms = computed(() =>
  props.forms
    .flatMap((form) => (form.type === "row" ? form.content : form))
    .filter((form) => form.type === "form")
    .map((form) => ({
      value: form.id,
      label: form.content.label,
    }))
);

const getParams = computed(() => {
  if (!api_params.value || api_params.value.trim() === "") return {};

  try {
    const parsed = JSON.parse(api_params.value);

    if (Array.isArray(parsed)) {
      const result = {};

      parsed.forEach((item) => {
        // Case 1: Simple parameter (no dots)
        if (!item.param_name.includes(".")) {
          const value = item.id_form ?? item.default_value;

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

          const value = item.id_form ?? item.default_value;
          result[rootKey][index][property] = value;
          return;
        }

        // Case 3: Object-style parameter (filter.cols)
        const objectMatch = item.param_name.match(/^([^.]+)\.(\w+)$/);
        if (objectMatch) {
          const [_, rootKey, property] = objectMatch;

          if (!result[rootKey]) result[rootKey] = {};

          const value = item.id_form ?? item.default_value;
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
});

const onClickGetData = () => {
  // Logic to fetch data from the API using the provided URL, method, params, and headers
  const url = api_url.value;
  const method = api_method.value;
  const params =
    api_params.value &&
    typeof api_params.value === "string" &&
    api_params.value.trim() !== ""
      ? getParams.value
      : [];
  const headers =
    api_headers.value &&
    typeof api_headers.value === "string" &&
    api_headers.value.trim() !== ""
      ? JSON.parse(api_headers.value)
      : {};

  loading.value = true; // Set loading state
  // Example API request (you can replace this with your actual API call)
  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: method !== "GET" ? JSON.stringify(params) : null,
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("API Data:", data);
      // Recursively add id_trees for each level of array/object
      function addIds(obj) {
        if (Array.isArray(obj)) {
          // If cutArrayTotal.value > 0, limit the array length
          const arr =
            cutArrayTotal.value > 0 ? obj.slice(0, cutArrayTotal.value) : obj;
          return arr.map((item) => addIds(item));
        } else if (typeof obj === "object" && obj !== null) {
          // Only add id_trees if it's a plain object (not an array)
          const newObj = {};
          for (const key in obj) {
            newObj[key] = addIds(obj[key]);
          }
          if (Object.prototype.toString.call(obj) === "[object Object]") {
            newObj.id_trees = crypto.randomUUID();
          }
          return newObj;
        }
        return obj;
      }

      api_data.value = addIds(data); // Store the fetched data with ids

      console.log("Processed API Data:", api_data.value);

      listKeys.value = []; // Clear previous data
      if (Array.isArray(data)) {
        // If data is an array, show indices as keys
        selectedData.value = [];
        Object.keys(data[0]).forEach((item, index) => {
          selectedData.value.push({
            label: item,
            ex_value: data[0][item],
            stateAs: "",
          });
        });
        applySavedMarks();
      } else if (typeof data === "object" && data !== null) {
        // If data is an object, show its keys
        Object.keys(api_data.value).forEach((key) => {
          const valueChild = api_data.value[key];
          const node = {
            id_trees: valueChild?.id_trees || crypto.randomUUID(),
            label: key,
          };

          if (
            valueChild &&
            typeof valueChild === "object" &&
            Object.keys(valueChild).length > 0
          ) {
            node.children = recurseFetchData(valueChild);
          }

          listKeys.value.push(node);
        });
      } else {
        // For primitive types, just show the value
        listKeys.value.push({
          label: data?.toString() ?? "",
        });
      }

      $q.notify({
        type: "positive",
        message: "API data fetched successfully.",
      });

      loading.value = false; // Reset loading state
    })
    .catch((error) => {
      console.error("Error fetching API data:", error);
      $q.notify({
        type: "negative",
        message: "Failed to fetch API data.",
      });

      loading.value = false; // Reset loading state
    });
};

const recurseFetchData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      id_trees: item.id_trees || crypto.randomUUID(),
      label: `Array Item [${index}]`,
      children: recurseFetchData(item),
    }));
  } else if (typeof data === "object" && data !== null) {
    return Object.keys(data).map((key) => ({
      id_trees: data[key]?.id_trees || crypto.randomUUID(),
      label: `${key}`,
      children: recurseFetchData(data[key]),
    }));
  } else {
    return [{ label: data?.toString() ?? "" }];
  }
};

const onSelectedData = (selected) => {
  console.log("Selected Node:", selected);
  if (selected) {
    selectedNode.value = findNodePath(api_data.value, selected); // Update selected node

    console.log("Selected Node Path:", selectedNode.value);
    // Convert selectedNode.value (array of keys/indices) to a path for nested access
    let tempData = api_data.value;
    for (const key of selectedNode.value) {
      tempData = tempData?.[key];
      if (tempData === undefined) break;
    }

    console.log(tempData);

    console.log(selectedNode.value.join("."));

    if (Array.isArray(tempData)) {
      selectedData.value = [];

      if (tempData[0]) {
        Object.keys(tempData[0]).forEach((key) => {
          selectedData.value.push({
            label: key,
            ex_value: tempData[0][key],
            stateAs: "",
          });
        });
        console.log("Selected Data:", selectedData.value);
      }
    } else {
      selectedData.value = [];

      Object.keys(tempData).forEach((key) => {
        selectedData.value.push({
          label: key,
          ex_value: tempData[key],
          stateAs: "",
        });
      });
    }

    applySavedMarks();
    refreshedKey.value += 1; // Force re-render of the tree
  }
};

// Find the path to a node in the data tree by its unique id_trees
const findNodePath = (data, selectedId) => {
  const path = [];

  function helper(current, currentPath) {
    if (Array.isArray(current)) {
      for (let i = 0; i < current.length; i++) {
        // if (current[i] && typeof current[i] === "object") {
        //   path.push(...[...currentPath, i]);
        //   return true;
        // }
        if (helper(current[i], [...currentPath, i])) {
          // path.push(...[...currentPath, i]);
          return true;
        }
      }
    } else if (typeof current === "object" && current !== null) {
      if (current.id_trees === selectedId) {
        path.push(...currentPath);
        return true;
      }
      for (const key of Object.keys(current)) {
        if (key === "id_trees") continue; // Skip id_trees property itself
        if (helper(current[key], [...currentPath, key])) {
          return true;
        }
      }
    }
    return false;
  }

  helper(data, []);
  return path;
};

const onClickCopyValue = (value) => {
  const Cpdata = JSON.stringify(value);

  navigator.clipboard
    .writeText(Cpdata)
    .then(() => {
      $q.notify({
        type: "positive",
        message: "Value copied to clipboard.",
      });
    })
    .catch((err) => {
      console.error("Failed to copy value:", err);
      $q.notify({
        type: "negative",
        message: "Failed to copy value.",
      });
    });
};

const onClickAddAPIParam = () => {
  $q.dialog({
    component: addAPIParamByComponent,
    componentProps: {
      forms: getAllForms.value,
      listParam:
        typeof api_params.value === "string" && api_params.value.trim() !== ""
          ? (() => {
              try {
                return JSON.parse(api_params.value);
              } catch (e) {
                return [];
              }
            })()
          : [], // Pass existing params if available
      selectedNode: selectedNode.value,
      selectedData: selectedData.value,
    },
    persistent: true,
  })
    .onOk((data) => {
      console.log("Selected Data from API Param:", data);
      // Add the selected data to the existing selectedData
      api_params.value = JSON.stringify(data);

      // api_params.value = JSON.stringify(getParams.value); // Update api_params with the new params
    })
    .onCancel(() => {
      console.log("Add API Param dialog cancelled.");
    });
};

const saveOptions = () => {
  // Logic to save the options
  const dialogSave = () => {
    $q.dialog({
      title: "Confirm Save",
      message: "Are you sure you want to save these options?",
      cancel: true,
      persistent: true,
    })
      .onOk(() => {
        // Perform save operation here
        const keysMap = selectedData.value
          .filter(
            (item) => item.stateAs === "value" || item.stateAs === "label"
          )
          .reduce((acc, item) => {
            if (item.stateAs === "value") {
              acc.value = item.label;
            } else if (item.stateAs === "label") {
              acc.label = item.label;
            }
            return acc;
          }, {});

        const createArray = {
          api_url: api_url.value,
          api_method: api_method.value,
          api_params: api_params.value ? JSON.parse(api_params.value) : "",
          api_headers: api_headers.value ? JSON.parse(api_headers.value) : "",
          selectedNode: selectedNode.value,
          isExactChoosedKeys: isExactChoosedKeys.value,
          selectedKeys: keysMap,
          selectedColumns: (selectedColumns.value || []).filter(
            (col) => col !== keysMap.value && col !== keysMap.label
          ),
        };

        console.log("Options saved:", createArray);

        onDialogOK(createArray); // Close the dialog
      })
      .onCancel(() => {
        console.log("Save operation cancelled.");
      });
  };

  if (!Array.isArray(selectedNode.value)) {
    $q.notify({
      type: "negative",
      message:
        "Please select a valid path from the tree, make sure it is an array.",
    });
    return;
  }

  if (isExactChoosedKeys.value) {
    const hasArrayKey = selectedNode.value.some(
      (key) => typeof key === "number"
    );
    if (hasArrayKey) {
      $q.dialog({
        title: "Path Warning",
        message:
          "Selected path contains array keys. Are you sure you want to save with exact keys?",
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          dialogSave();
          // Logic to save the options with exact chosen keys
          console.log("Exact keys will be saved:", selectedData.value);
        })
        .onCancel(() => {
          console.log("Save operation cancelled.");
        });
      return;
    }
  } else {
    dialogSave();
  }
};
</script>
