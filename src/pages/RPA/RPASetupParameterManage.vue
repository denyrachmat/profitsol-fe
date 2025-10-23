<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white q-pa-md">
      <q-card-section class="text-h6">
        <div class="row">
          <div class="col">RPA Setup Parameter Management</div>
          <div class="col text-right"></div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <div class="row">
          <div class="col">
            <div class="row">
              <div class="col q-pb-md">
                <q-btn
                  label="Add Parameter"
                  color="primary"
                  outline
                  icon="add"
                  @click="addParam"
                />
              </div>
            </div>
            <q-form>
              <div
                v-for="(param, idx) in params"
                :key="idx"
                class="q-gutter-sm row"
              >
                <div class="col">
                  <q-input
                    v-model="param.prpd_param_name"
                    label="Parameter Name"
                    dense
                    outlined
                    :rules="[
                      (val) => !!val || 'Required',
                      (val) =>
                        /^[A-Za-z0-9_.\[\]]+$/.test(val) ||
                        'No special characters or spaces allowed',
                    ]"
                  />
                </div>
                <div class="col">
                  <q-select
                    v-model="param.prpd_param_required"
                    :options="[
                      {
                        label: 'Yes',
                        value: true,
                      },
                      {
                        label: 'No',
                        value: false,
                      },
                    ]"
                    label="Required"
                    dense
                    outlined
                    emit-value
                    map-options
                  />
                </div>
                <div class="col">
                  <q-select
                    v-model="param.prpd_param_type"
                    :options="['String', 'Number', 'Boolean', 'Date']"
                    label="Type"
                    dense
                    outlined
                    emit-value
                    map-options
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="param.prpd_param_desc"
                    label="Description"
                    dense
                    outlined
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="param.prpd_param_default"
                    label="Default Value"
                    dense
                    outlined
                  />
                </div>
                <div class="col-1 text-right">
                  <q-toggle
                    v-model="param.prpd_isactive"
                    label="Active"
                    left-label
                  />
                </div>
                <div class="col-1 text-right">
                  <q-btn
                    icon="delete"
                    color="negative"
                    flat
                    dense
                    @click="removeParam(idx)"
                    class="q-ml-sm"
                  />
                </div>
                <q-separator spaced />
              </div>
            </q-form>
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn color="primary" label="Save Parameters" @click="onClickSave" />
        <q-btn color="secondary" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  listParam: Array,
});

onMounted(() => {
  if (props.listParam && props.listParam.length > 0) {
    params.value = props.listParam;
  }
});

const params = ref([
  {
    prpd_param_name: "",
    prpd_param_required: true,
    prpd_param_type: "String",
    prpd_param_desc: "",
    prpd_param_default: "",
    prpd_isactive: true,
  },
]);
const addParam = () => {
  params.value.push({
    prpd_param_name: "",
    prpd_param_required: false,
    prpd_param_type: "String",
    prpd_param_desc: "",
    prpd_param_default: "",
    prpd_isactive: true,
  });
};

const removeParam = (index) => {
  params.value.splice(index, 1);
};

const onClickSave = () => {
  if (params.value.length === 0) {
    $q.notify({
      type: "negative",
      message: "Please add at least one parameter.",
    });
    return;
  }
  onDialogOK(params.value);
};
</script>
