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
            <div class="text-h6">Attachment Store Setup</div>
          </div>
          <div class="col text-right">
            <q-btn color="blue" dense icon="add" @click="onAddData()"></q-btn>
          </div>
        </div>

        <template v-if="forms.length > 0">
          <template v-for="(form, idx) in forms" :key="idx">
            <q-separator spaced></q-separator>
            <div class="row">
              <div class="col">
                <div class="row">
                  <div class="col">
                    <q-input
                      label="Storage Name"
                      dense
                      v-model="form.aats_name"
                      outlined
                    />
                  </div>
                </div>
                <div class="row q-pt-sm">
                  <div class="col">
                    <q-select
                      v-model="form.aats_method"
                      :options="['POST', 'GET', 'PUT', 'PATCH', 'DELETE']"
                      label="Methods"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col q-pl-sm">
                    <q-input
                      label="URL"
                      dense
                      outlined
                      v-model="form.aats_host"
                    ></q-input>
                  </div>
                </div>

                <div class="row q-pt-sm">
                  <div class="col">
                    <span class="text-bold"> Header Add </span>
                    <editorCode v-model="form.aats_header" lang="json" />
                  </div>
                  <div
                    class="col q-pl-sm"
                    v-if="
                      form.aats_method != 'GET' && form.aats_method != 'DELETE'
                    "
                  >
                    <span class="text-bold"> Request Param </span>
                    <editorCode v-model="form.aats_param" lang="json" />
                  </div>
                </div>
              </div>
              <div class="col-1 q-pl-sm text-center">
                <q-btn
                  icon="delete"
                  color="red"
                  flat
                  class="full-width full-height"
                  size="lg"
                  @click="onDeleteLines(idx)"
                ></q-btn>
              </div>
            </div>
          </template>
        </template>
        <div class="q-pa-md text-center" v-else>
          <span class="text-h4"
            >No storage set, please add by clicking "+"</span
          >
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onOKClick()" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import editorCode from "../MRS/editorCode.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const { postData } = apiRequest();

const props = defineProps({
  dataExists: Object,
  // ...your custom props
});
const $q = useQuasar();

const forms = ref([]);

onMounted(() => {
  if (props.dataExists && props.dataExists.length > 0) {
    forms.value = props.dataExists;
  }
});

const onAddData = () => {
  forms.value.push({
    aats_name: "",
    aats_method: "",
    aats_host: "",
    aats_header: `{
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "text/plain"
}`,
    aats_param: `{
    "param1":"",
    "param2":"",
    "param3":""
}`,
  });
};

const onDeleteLines = (idx) => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to delete line ${idx + 1} ?`,
    cancel: true,
  }).onOk(async () => {
    forms.value.splice(idx, 1);
  });
};

const onOKClick = () => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to save this settings ?`,
    cancel: true,
  }).onOk(async () => {
    onDialogOK(forms.value);
  });
};
</script>
