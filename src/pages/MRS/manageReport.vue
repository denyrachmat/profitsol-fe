<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <q-card-section class="q-pa-md">
        <div class="text-h6">Setting Report</div>
        <div class="text-subtitle2">Please select the item to print</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <fieldset
          style="
            border: 1px solid #ccc !important;
            border-radius: 16px;
            max-height: 73vh;
            overflow: auto;
          "
        >
          <legend>Report Settings</legend>
          <div class="row">
            <div class="col">
              <q-checkbox
                label="View report filter on start report?"
                v-model="header.mrm_filter_flg"
              />
            </div>
            <div class="col">
              <q-checkbox
                label="Distinct same data on Export ?"
                v-model="header.mrm_dist_exp_flag"
              />
            </div>
          </div>
        </fieldset>
        <br />
        <fieldset
          style="
            border: 1px solid #ccc !important;
            border-radius: 16px;
            max-height: 73vh;
            overflow: auto;
          "
        >
          <legend>Action Button</legend>
          <div class="row">
            <div class="col">
              <q-toggle
                label="Activate Action Button ?"
                v-model="activateAction"
              />
            </div>
            <div class="col text-right">
              <q-btn
                color="primary"
                icon="add"
                @click="addAction"
                dense
                outline
                :disable="activateAction === false"
              >
                <q-tooltip>Add Action menu</q-tooltip>
              </q-btn>
            </div>
          </div>

          <template v-if="listAction.length > 0">
            <div
              class="row q-gutter-sm q-pt-sm"
              v-for="(action, index) in listAction"
              :key="index"
            >
              <div class="col">
                <q-select
                  v-model="action.mrad_action"
                  :options="actionOption"
                  label="Select Action"
                  emit-value
                  map-options
                  dense
                  filled
                />
              </div>
              <div class="col">
                <q-input
                  v-model="action.mrad_label"
                  label="Action Label"
                  filled
                  dense
                />
              </div>
              <div class="col">
                <q-input
                  v-model="action.mrad_url"
                  label="Action URL"
                  filled
                  dense
                />
              </div>
              <div class="col">
                <q-select
                  v-model="action.mrad_target"
                  :options="actionTarget"
                  label="Action Target"
                  emit-value
                  map-options
                  dense
                  filled=""
                />
              </div>
              <div class="col">
                <q-input
                  v-model="action.mrad_icon"
                  label="Action Icon"
                  filled
                  dense
                />
              </div>
              <div class="col-1 text-right">
                <q-btn
                  outline
                  icon="delete"
                  color="red"
                  @click="listAction.splice(index, 1)"
                />
              </div>
            </div>
          </template>
          <div v-else class="q-pa-md text-center">
            {{
              !activateAction
                ? "Action Button is not activated"
                : listAction.length === 0
                ? "Add action by click + button above"
                : ""
            }}
          </div>
        </fieldset>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onPrint" color="primary" label="Submit" />
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref, computed, watch } from "vue";
import simulationTablesReport from "./Tables/simulationTablesReport.vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const props = defineProps({
  msrsID: Number,
});

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();
const { postData } = apiRequest();

onMounted(() => {});

const actionOption = [
  { label: "Open Link", value: "openlink" },
  { label: "Open CMS Forms", value: "opencms" },
];
const actionTarget = [
  { label: "New Tab", value: "new_tab" },
  { label: "Open Modal", value: "dialog" },
];
const listAction = ref([]);
const header = ref({
  mrm_filter_flg: false,
  mrm_dist_exp_flag: false,
});
const activateAction = ref(false);

const addAction = () => {
  listAction.value.push({
    mrad_action: "",
    mrad_label: "",
    mrad_url: "",
    mrad_target: "",
    mrad_icon: "",
  });
};
</script>
