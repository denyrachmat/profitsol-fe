<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card>
      <q-card-section class="text-h6">
        <div class="col">RPA Setup Management</div>
        <div class="col text-right">
          <q-btn
            color="primary"
            icon="filter_list"
            @click="onClickAddParameter"
          >
            <q-tooltip>Add Parameter</q-tooltip>
            <q-badge color="red" floating align="top right" class="q-mr-sm">
              {{ parameterList.length }}
            </q-badge>
          </q-btn>
          <q-btn color="orange" icon="code" @click="onClickCreateCommandRPA">
            <q-tooltip>Create Command RPA</q-tooltip>
            <q-badge color="red" floating align="top right" class="q-mr-sm">
              {{ commandRPAList.length }}
            </q-badge>
          </q-btn>
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <div class="row">
          <div class="col">
            <q-input v-model="RPAName" outlined dense label="RPA Name" />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-select
              v-model="selectedType"
              :options="typeOptions"
              label="Select RPA Type"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-input
              v-model="hostRPA"
              outlined
              dense
              :label="selectedType == 'api' ? 'Host URL RPA' : 'Command RPA'"
            />
          </div>
          <div class="col q-pl-md" v-if="selectedType == 'api'">
            <q-input v-model="portRPA" outlined dense label="Port RPA" />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-input
              v-model="descRPA"
              outlined
              dense
              label="Description RPA"
              type="textarea"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          color="primary"
          label="OK"
          @click="
            onClickSave({
              RPAName,
              selectedType,
              hostRPA,
              portRPA,
              descRPA,
            })
          "
          :disable="!selectedType || !hostRPA || !descRPA"
          :loading="loading"
        />
        <q-btn
          color="secondary"
          label="Cancel"
          @click="onDialogCancel"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";
import RPASetupParameterManage from "./RPASetupParameterManage.vue";
import RPASetupCommandManage from "./RPASetupCommandManage.vue";

const props = defineProps({
  dataEdit: Object,
});

onMounted(() => {
  if (props.dataEdit) {
    selectedType.value = props.dataEdit.prm_type;
    hostRPA.value = props.dataEdit.prm_host;
    portRPA.value = props.dataEdit.prm_port;
    descRPA.value = props.dataEdit.prm_desc;
    RPAName.value = props.dataEdit.prm_name;
    idRPA.value = props.dataEdit.id;
    parameterList.value = props.dataEdit.prm_parameter || [];
    commandRPAList.value = props.dataEdit.prm_command || [];
  }
});

const $q = useQuasar();
const selectedType = ref(null);
const loading = ref(false);
const idRPA = ref("");
const typeOptions = ref([
  { label: "Web RPA Integration", value: "web" },
  { label: "Desktop RPA Integration", value: "desktop" },
]);
const hostRPA = ref("");
const portRPA = ref("");
const descRPA = ref("");
const RPAName = ref("");
const parameterList = ref([]);
const commandRPAList = ref([]);

const authStore = useAuthStore();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const { postData } = apiRequest();

const onClickSave = async (data) => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure you want to save this RPA connection?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    saveRPAConnection(data);
  });
};

const saveRPAConnection = async (data) => {
  loading.value = true;
  const authStore = useAuthStore();
  const response = await postData(
    idRPA.value ? "put" : "post",
    {
      prm_name: data.RPAName,
      prm_type: data.selectedType,
      prm_host: data.hostRPA,
      prm_port: data.portRPA,
      prm_desc: data.descRPA,
      prm_isactive: true,
      prm_parameter: parameterList.value,
      prm_command: commandRPAList.value,
    },
    idRPA.value ? `rpa/rpaMaster/${idRPA.value}` : `rpa/rpaMaster`,
    false,
    false,
    true
  );

  if (response) {
    loading.value = false;
    $q.notify({
      message: response.message,
      color: "green",
    });
    onDialogOK();
  }
};

const onClickAddParameter = () => {
  $q.dialog({
    component: RPASetupParameterManage,
    componentProps: {
      listParam: parameterList.value,
    },
  }).onOk((newParameter) => {
    parameterList.value = newParameter;
  });
};

const onClickCreateCommandRPA = () => {
  $q.dialog({
    component: RPASetupCommandManage,
    componentProps: {
      listCommandRPA: commandRPAList.value,
      rpaType: selectedType.value,
      listParam: parameterList.value,
    },
    persistent: true,
  }).onOk((newCommandRPA) => {
    commandRPAList.value = newCommandRPA;
  });
};
</script>
