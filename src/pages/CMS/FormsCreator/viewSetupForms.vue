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
        <div class="text-h6">Setup Forms</div>
      </q-card-section>

      <q-card-section class="q-pa-md q-gutter-md">
        <!-- Preview -->
        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 20vh;
            overflow: auto;
          "
        >
          <legend>Setup Forms View</legend>
          <div class="row">
            <div class="col">
              <div class="text-bold">
                Wizard Mode ? (It will separate page for each rows)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isWizard"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isWizard"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 50vh;
            overflow: auto;
          "
        >
          <legend>Setup Target Submited</legend>
          <div class="row">
            <div class="col">
              <div class="text-bold">
                Send Approval when submited ? (It will send email to approver)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isApproval"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isApproval"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
            <div class="col" v-if="formsSetup.isApproval">
              <div class="text-bold">Choose Approval Code</div>
              <div class="q-gutter-sm">
                <q-select
                  v-model="formsSetup.approvalCode"
                  :options="optionsApproval"
                  label="Choose Approval Code"
                  emit-value
                  map-options
                  dense
                  filled
                  @filter="filterFnApproval"
                  :loading="loadingApproval"
                  use-input
                  input-debounce="300"
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="text-bold">
                Running RPA when submited ? (It will run RPA when submited)
              </div>
              <div class="q-gutter-sm">
                <q-radio v-model="formsSetup.isRPA" :val="true" label="Yes" />
                <q-radio v-model="formsSetup.isRPA" :val="false" label="No" />
              </div>
            </div>

            <div class="col" v-if="formsSetup.isRPA">
              <div class="text-bold">Choose RPA</div>
              <div class="q-gutter-sm">
                <q-select
                  v-model="formsSetup.rpaId"
                  :options="optionsRPA"
                  label="Choose RPA"
                  emit-value
                  map-options
                  dense
                  filled
                  @filter="filterFnRPA"
                  :loading="loadingRPA"
                  use-input
                  input-debounce="300"
                  @update:model-value="onChooseRPA"
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="text-bold">Access API when submited ?</div>
              <div class="q-gutter-sm">
                <q-radio v-model="formsSetup.isAPI" :val="true" label="Yes" />
                <q-radio v-model="formsSetup.isAPI" :val="false" label="No" />
              </div>
            </div>
            <div class="col">
              <div class="text-bold">Add API Destination</div>
              <div class="text-italic">
                (When this API fail / error, it will cancel the submited form)
              </div>
              <div class="q-gutter-sm">
                <q-btn
                  @click="onClickListAPI"
                  icon="add"
                  color="primary"
                  label="Add API Destination"
                  class="q-mt-md"
                />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 40vh;
            overflow: auto;
          "
          v-if="formsSetup.isRPA && formsSetup.rpaId"
        >
          <legend>Fill Parameter for RPA</legend>
          <div class="row">
            <div class="col">
              <div class="q-gutter-sm">
                <q-splitter v-model="splitterModel" style="height: 400px">
                  <template v-slot:before>
                    <div class="q-pa-md">
                      <q-tree
                        :nodes="listNodes"
                        node-key="id"
                        selected-color="primary"
                        @update:selected="onSelectNode"
                        v-model:selected="selectedNode"
                        default-expand-all
                      />
                    </div>
                  </template>

                  <template v-slot:after v-if="selectedNode">
                    <q-toggle
                      v-model="formsSetup.isUsingFormsRPA"
                      checked-icon="check"
                      color="red"
                      label="Choose value from forms field ?"
                      unchecked-icon="clear"
                    />
                    <div class="q-pa-md">
                      <q-input
                        v-model="formsSetup.rpaParams[selectedNode]"
                        label="Parameter Value"
                        v-if="!formsSetup.isUsingFormsRPA"
                        dense
                        outlined
                      />
                      <q-select
                        v-model="formsSetup.rpaParams[selectedNode]"
                        :options="listForms"
                        label="Choose Form Field"
                        v-else
                        emit-value
                        map-options
                        dense
                        outlined
                      />
                    </div>
                  </template>
                </q-splitter>
              </div>
            </div>
          </div>
        </fieldset>

        <!-- History -->
        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            overflow: auto;
          "
        >
          <legend>Setup Forms History</legend>
          <div class="row">
            <div class="col">
              <div class="text-bold">
                View History ? (It will show the history of the forms)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isHistory"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isHistory"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
          </div>
          <div class="row" v-if="formsSetup.isHistory">
            <div class="col">
              <div class="text-bold">
                Show only own history ? (It will show only the history of the
                user)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isShowOwnHistory"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isShowOwnHistory"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
            <div class="col" v-if="formsSetup.isShowOwnHistory">
              <div class="text-bold">
                Choose Exception Users (choosed user will be able to see all
                user history)
              </div>
              <div class="q-gutter-sm">
                <q-select
                  v-model="formsSetup.exceptionUsers"
                  :options="optionsUsers"
                  multiple
                  label="Choose Exception Users"
                  emit-value
                  map-options
                  use-chips
                  dense
                  filled
                  @filter="filterFnUsers"
                  :loading="loadingUsers"
                  use-input
                  input-debounce="300"
                />
              </div>
            </div>
          </div>

          <div class="row" v-if="formsSetup.isHistory">
            <div class="col">
              <q-btn
                @click="onClickManageHistory"
                icon="edit_note"
                :color="formsSetup.historyTable ? 'primary' : 'orange'"
                :label="'Manage History Table'"
                class="q-mt-md"
              >
                <q-tooltip>
                  {{
                    formsSetup.historyTable
                      ? "History table is configured"
                      : "History table is not configured"
                  }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </fieldset>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onSubmit" color="primary" label="Submit" />
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "stores/authStore";
import addReportAction from "../../MRS/addReport.vue";
import viewSetupHistTable from "./viewSetupHistTable.vue";
import viewSetupAPIDest from "./viewSetupAPIDest.vue";

const store = useAuthStore();

const props = defineProps({
  setupTrainingSetup: Object,
  forms: Object,
});

const $q = useQuasar();
const { postData } = apiRequest();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

onMounted(() => {
  if (props.setupTrainingSetup) {
    console.log(props.setupTrainingSetup);
    // Create a local copy and convert numeric values to boolean
    const localSetup = { ...props.setupTrainingSetup };
    if (typeof localSetup.isWizard === "number") {
      localSetup.isWizard = !!localSetup.isWizard ?? false;
    } else {
      localSetup.isWizard = false; // Default to false if undefined
    }

    if (typeof localSetup.isApproval === "number") {
      localSetup.isApproval = !!localSetup.isApproval ?? false;
    } else {
      localSetup.isApproval = false; // Default to false if undefined
    }

    if (typeof localSetup.isHistory === "number") {
      localSetup.isHistory = !!localSetup.isHistory ?? false;
    }
    if (typeof localSetup.isShowOwnHistory === "number") {
      localSetup.isShowOwnHistory = !!localSetup.isShowOwnHistory ?? false;
    }
    // Ensure isRPA exists and is boolean

    if (typeof localSetup.isRPA === "number") {
      localSetup.isRPA = !!localSetup.isRPA ?? false;
    }

    if (localSetup.isRPA && localSetup.rpaId) {
      console.log("Fetching RPA data for setup");
      getDataRPA().then((data) => {
        optionsRPA.value = data;
      });

      onChooseRPA(localSetup.rpaId);
    }

    // Ensure isUsingFormsRPA exists and is boolean
    if (typeof localSetup.isUsingFormsRPA === "undefined") {
      localSetup.isUsingFormsRPA = false;
    } else if (typeof localSetup.isUsingFormsRPA === "number") {
      localSetup.isUsingFormsRPA = !!localSetup.isUsingFormsRPA ?? false;
    }

    if (localSetup.historyTableIsExport) {
      formsSetup.value.historyTableIsExport =
        !!localSetup.historyTableIsExport ?? false;
    } else {
      formsSetup.value.historyTableIsExport = false; // Default to false if undefined
    }

    // historyTableIsExport
    if (localSetup.historyTableList && localSetup.historyTableList.length > 0) {
      listForms.value = localSetup.historyTableList;
    } else {
      if (props.forms)
        listForms.value = props.forms
          .flatMap((form) => (form.type === "row" ? form.content : form))
          .filter((form) => form.type === "form")
          .map((form) => ({
            value: form.id,
            label: form.content.label,
            name: `CMS_REPORT_${form.id}`,
            align: "center",
            field: `CMS_REPORT_${form.id}`,
            isFiltered: true,
            isSortable: true,
            isVisible: true,
            isExportable: true,
          }));

      formsSetup.value.historyTableList = listForms.value;
    }

    if (localSetup.isAPI && localSetup.apiOpt) {
      console.log("Fetching API data for setup");
      formsSetup.value.isAPI = !!localSetup.isAPI ?? false;
      formsSetup.value.apiOpt = localSetup.apiOpt || [];
    } else {
      formsSetup.value.isAPI = false; // Default to false if undefined
      formsSetup.value.apiOpt = [];
    }

    formsSetup.value = localSetup;

    console.log(listForms.value);
  }
});

const formsSetup = ref({
  isWizard: true,
  isApproval: false,
  approvalCode: "",
  isShowOwnHistory: false,
  exceptionUsers: [],
  isHistory: false,
  historyTable: "",
  historyTableList: [],
  historyTableIsExport: false,
  isRPA: false, // Add isRPA default
  rpaId: "", // Add rpaId default
  rpaParams: {}, // Add rpaParams default
  isUsingFormsRPA: false, // Add isUsingFormsRPA default
  isAPI: false,
  apiOpt: [],
});
const splitterModel = ref(50);
const optionsUsers = ref([]);
const optionsApproval = ref([]);
const optionsRPA = ref([]);
const loadingRPA = ref(false);
const loadingUsers = ref(false);
const loadingApproval = ref(false);
const formsTitle = ref("History Table");
const listForms = ref([]);
const listNodes = ref([]);
const selectedNode = ref("");

const getUsers = async () => {
  loadingUsers.value = true;
  const data = await postData(
    "get",
    null,
    "portal/users/ActiveOnly",
    false,
    false,
    true
  );
  if (data) {
    loadingUsers.value = false;
    return data.data.map((user) => {
      return {
        label: user.pud_first_name + " " + user.pud_last_name,
        value: user.username,
      };
    });
  }
};

const getDataApproval = async () => {
  loadingApproval.value = true;

  const data = await postData(
    "post",
    {
      filter: [
        {
          cols: "p_u_username",
          param: "=",
          value: store.authDet.username,
        },
        {
          cols: "amshd_stat",
          param: "=",
          value: "sent",
        },
      ],
    },
    `ams/viewListSentApproval`,
    false,
    false,
    true
  );

  if (data) {
    loadingApproval.value = false;

    return data.data.map((user) => {
      return {
        label: user.master.ams_title,
        value: user.master.ams_idapv,
      };
    });
  } else {
    loadingApproval.value = false;
  }
};

const getDataRPA = async () => {
  const data = await postData("get", null, "rpa/rpaMaster", false, false, true);
  if (data) {
    return data.map((rpa) => {
      return {
        label: rpa.prm_name,
        value: rpa,
      };
    });
  }
};

const filterFnUsers = (val, update) => {
  if (val === "") {
    update(() => {
      getUsers().then((data) => {
        console.log(data);
        optionsUsers.value = data;
      });
    });
  } else {
    update(() => {
      getUsers().then((data) => {
        optionsUsers.value = data.filter((option) => {
          return option.label.toLowerCase().includes(val.toLowerCase());
        });
      });
    });
  }
};

const filterFnApproval = (val, update) => {
  if (val === "") {
    update(() => {
      getDataApproval().then((data) => {
        console.log(data);
        optionsApproval.value = data;
      });
    });
  } else {
    update(() => {
      getDataApproval().then((data) => {
        optionsApproval.value = data.filter((option) => {
          return option.label.toLowerCase().includes(val.toLowerCase());
        });
      });
    });
  }
};

const filterFnRPA = (val, update) => {
  if (val === "") {
    update(() => {
      getDataRPA().then((data) => {
        console.log(data);
        optionsRPA.value = data;
      });
    });
  } else {
    update(() => {
      getDataRPA().then((data) => {
        optionsRPA.value = data.filter((option) => {
          return option.label.toLowerCase().includes(val.toLowerCase());
        });
      });
    });
  }
};

const onSubmit = () => {
  // Emit the formsSetup data to the parent component
  // Close the dialog
  onDialogOK(formsSetup.value);
};

const onClickManageHistory = () => {
  $q.dialog({
    component: viewSetupHistTable,
    componentProps: {
      dataEdit: listForms.value,
      isExportable: formsSetup.value.historyTableIsExport,
      forms: props.forms,
      setup: formsSetup.value,
    },
  })
    .onOk(async (val) => {
      listForms.value = val.colsData;
      formsSetup.value.historyTableList = val.colsData;
      formsSetup.value.historyTableIsExport = val.isExportable;
      console.log(val);
    })
    .onDismiss(() => {
      // getDataHistory();
    });
};

const onChooseRPA = (val) => {
  console.log("Selected RPA:", val);
  formsSetup.value.rpaId = val;

  formsSetup.value.rpaParams = getParams(
    JSON.stringify(formsSetup.value.rpaId.prm_parameter)
  );

  listNodes.value = fetchListNodes();

  console.log("Updated formsSetup:", listNodes.value);
};

const onSelectNode = (node) => {
  console.log("Selected node:", node);
  // Handle the selection of a node
  // You can update the formsSetup.rpaParams based on the selected node
  if (node && node.data) {
    const paramKey = node.id;
    const paramValue = node.data.value || "";
    formsSetup.value.rpaParams[paramKey] = paramValue;
  }
};

const fetchListNodes = () => {
  const recursKeys = (obj, parentKey = "") => {
    if (!obj || typeof obj !== "object") return [];
    return Object.keys(obj).map((key) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const children = Array.isArray(obj[key])
        ? obj[key].map((item, index) => ({
            id: `${fullKey}.${index}`,
            label: `${item.label}` || `Parameter ${index + 1}`,
            data: item,
          }))
        : recursKeys(obj[key], fullKey);

      return {
        id: fullKey,
        label: key,
        children: children,
      };
    });
  };

  if (
    formsSetup.value.rpaParams &&
    Object.keys(formsSetup.value.rpaParams).length > 0
  ) {
    return recursKeys(formsSetup.value.rpaParams);
  }

  return [];
};

const getParams = (params) => {
  // Parse the api_params value if it's a valid JSON string
  if (!params || (typeof params === "string" && params.trim() === ""))
    return {};
  try {
    const parsed = JSON.parse(params);

    if (Array.isArray(parsed)) {
      const result = {};

      parsed.forEach((item) => {
        // Case 1: Simple parameter (no dots)
        if (!item.prpd_param_name.includes(".")) {
          const value = item.id_form ?? item.prpd_param_default;

          // If the value is a string, split into array of characters
          result[item.prpd_param_name] = value;
          return;
        }

        // Case 2: Array-style parameter (filter.[0].cols)
        const arrayMatch = item.prpd_param_name.match(
          /^([^.]+)\.\[(\d+)\]\.(\w+)/
        );
        if (arrayMatch) {
          const [_, rootKey, index, property] = arrayMatch;

          if (!result[rootKey]) result[rootKey] = [];
          if (!result[rootKey][index]) result[rootKey][index] = {};

          const idForm = Object.values(formStore.getUsersAnswerForm).find(
            (val) => val[item.id_form] !== undefined
          )?.[item.id_form];

          const value = idForm ?? item.prpd_param_default;
          result[rootKey][index][property] = value;
          return;
        }

        // Case 3: Object-style parameter (filter.cols)
        const objectMatch = item.prpd_param_name.match(/^([^.]+)\.(\w+)$/);
        if (objectMatch) {
          const [_, rootKey, property] = objectMatch;

          if (!result[rootKey]) result[rootKey] = {};

          const value = item.id_form ?? item.prpd_param_default;
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

const onClickListAPI = () => {
  $q.dialog({
    component: viewSetupAPIDest,
    componentProps: {
      dataEdit: listForms.value,
      forms: props.forms,
      setup: formsSetup.value,
    },
  })
    .onOk(async (val) => {
      formsSetup.value.apiOpt = val;
      console.log(val);
    })
    .onDismiss(() => {
      // getDataHistory();
    });
};
</script>
