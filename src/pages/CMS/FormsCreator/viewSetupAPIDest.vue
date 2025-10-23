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
        <div class="row">
          <div class="col">
            <div class="text-h6">Manage API</div>
          </div>
          <div class="col text-right">
            <q-btn
              color="primary"
              icon="add"
              class="q-ml-sm"
              @click="addRows()"
            >
              <q-tooltip>Add Column</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md q-gutter-md">
        <q-separator class="q-mb-md" />
        <div class="row" v-for="(item, index) in listAPI" :key="index">
          <div class="col">
            <q-input
              v-model="item.apiUrl"
              label="API URL"
              outlined
              dense
              class="q-mb-md"
            />
          </div>
          <div class="col q-pl-sm">
            <q-select
              v-model="item.method"
              :options="['GET', 'POST', 'PUT', 'DELETE']"
              label="HTTP Method"
              outlined
              dense
              class="q-mb-md"
            />
          </div>
          <div class="col q-pl-sm">
            <q-input
              v-model="item.headers"
              label="Headers (JSON format)"
              outlined
              dense
              class="q-mb-md"
            />
          </div>
          <div class="col-1 q-pl-sm text-right">
            <q-btn
              color="primary"
              icon="checklist"
              class="q-mb-md"
              @click="onAddParams(index)"
            >
              <q-tooltip>Add Parameter</q-tooltip>
            </q-btn>
            <q-btn
              color="negative"
              icon="delete"
              @click="listAPI.splice(index, 1)"
              class="q-mb-md"
            />
          </div>
        </div>
        <div class="row" v-if="listAPI.length === 0">
          <div class="col">
            Add new API destination by clicking the "Add Column" button.
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onSubmit" color="primary" label="Submit" />
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import AddAPIParamByComponent from "../addAPIParamByComponent.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();

const props = defineProps({
  dataEdit: Array,
  forms: Array,
  setup: Object,
});

const listAPI = ref([]);

const addRows = () => {
  listAPI.value.push({
    apiUrl: "",
    method: "GET",
    headers: "",
    params: [],
  });
};

const onAddParams = (idx) => {
  // Open the AddAPIParamByComponent dialog to add parameters
  $q.dialog({
    component: AddAPIParamByComponent,
    componentProps: {
      listParam: listAPI.value,
      forms: props.dataEdit,
    },
    persistent: true,
  }).onOk((params) => {
    // Handle the parameters returned from the dialog
    if (params && params.length > 0) {
      listAPI.value[idx].params.push(...params);
    }
  });
};

const onSubmit = () => {
  // Handle form submission
  onDialogOK(listAPI.value);
  console.log("Submitted API Destinations:", listAPI.value);
};
</script>
