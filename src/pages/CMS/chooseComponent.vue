<!-- eslint-disable vue/no-v-text-v-html-on-component -->
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
        <div class="text-h6">Setup Component Forms</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <div class="row">
              <div class="col">
                <q-toggle
                  v-model="customizeLabel"
                  color="red"
                  label="Customized Label ?"
                  left-label
                />
                *<i><b>Normal Answer</b> label cannot be customized</i>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-editor
                  v-model="label"
                  min-height="5rem"
                  v-if="customizeLabel"
                />
                <q-input dense v-model="label" v-else />
              </div>
            </div>
          </div>
          <div class="col q-pl-sm">
            <div class="row">
              <div class="col">Choose Components</div>
            </div>
            <div class="row q-pt-md">
              <div class="col">
                <q-select
                  rounded
                  outlined
                  v-model="componentChoosed"
                  :options="optComponents"
                  label="Choose Components"
                  behavior="dialog"
                  dense
                >
                  <template v-slot:option="scope">
                    <q-expansion-item
                      expand-separator
                      group="somegroup"
                      :default-opened="hasChild(scope)"
                      header-class="text-weight-bold"
                      :label="scope.opt.label"
                    >
                      <div
                        v-for="child in scope.opt.children"
                        :key="child.label"
                      >
                        <q-item
                          clickable
                          v-ripple
                          v-close-popup
                          @click="componentChoosed = child"
                          :class="{
                            'bg-light-blue-1': componentChoosed === child,
                          }"
                        >
                          <q-item-section>
                            <q-item-label
                              v-html="child.label"
                              class="q-ml-md"
                            ></q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </q-expansion-item>
                  </template>

                  <template
                    v-slot:after
                    v-if="
                      componentChoosed &&
                      componentChoosed.category === 'multiple'
                    "
                  >
                    <q-btn
                      v-if="componentChoosed.value?.comp !== 'q-dms'"
                      round
                      dense
                      flat
                      icon="add"
                      @click="addDetail()"
                      color="green"
                    >
                      <q-tooltip>Add Option</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="componentChoosed.value?.comp !== 'q-dms'"
                      round
                      dense
                      flat
                      icon="integration_instructions"
                      color="orange"
                      @click="addAPIComponent(componentChoosed.apiOpt ?? {})"
                    >
                      <q-tooltip>Add API Data</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="componentChoosed.value?.comp === 'q-dms'"
                      round
                      dense
                      flat
                      icon="folder_open"
                      color="orange"
                      @click="addDMSComponent(componentChoosed.dmsOpt ?? {})"
                    >
                      <q-tooltip>Setup DMS Folder Picker</q-tooltip>
                    </q-btn>
                  </template>
                </q-select>
              </div>
              <div class="col-3">
                <q-toggle
                  v-model="isRequired"
                  color="blue"
                  label="Required ?"
                  left-right
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row q-pt-md">
          <div class="col">
            <template v-if="componentChoosed">
              <componentViewVue
                :type="componentChoosed.category"
                :typeInput="componentChoosed.value.type"
                :comp="componentChoosed.value.comp"
                :label="label"
                :detail="detailData"
                :apiOpt="componentChoosed.apiOpt"
                :dmsOpt="componentChoosed.dmsOpt"
                @onDeleted="onDeleteOpt"
                mode="edit"
                @paste="onPasteData"
              />
            </template>
            <template v-else>
              <span class="text-h6">No component selected !</span>
            </template>
          </div>
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
import { ref, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import inputType from "../../components/inputType.json";
import addAPIComponentOptions from "./addAPIComponentOptions.vue";
import addDMSComponentOptions from "./addDMSComponentOptions.vue";

import componentViewVue from "./componentView.vue";

const $q = useQuasar();

const props = defineProps({
  mode: String,
  currComponent: Object,
  forms: Array,
});

const componentChoosed = ref(null);
const optComponents = ref(inputType);
const label = ref("");
const detailData = ref([]);
const multipleOnly = ref(false);
const isRequired = ref(false);
const customizeLabel = ref(false);

onMounted(() => {
  console.log(props.currComponent);
  if (props.currComponent && props.currComponent.content) {
    componentChoosed.value = props.currComponent.content.component;
    label.value = props.currComponent.content.label;
    detailData.value = Object.values(props.currComponent.content.detail_data);

    if (props.currComponent.content.multipleOnly) {
      multipleOnly.value = true;
    }
  }

  if (multipleOnly.value) {
    optComponents.value = inputType.filter(
      (val) => val.category === "multiple"
    );
  }
});

const onDeleteOpt = (val) => {
  detailData.value = val;
};

const hasChild = (scope) => {
  return scope.opt.children.some((c) => c === componentChoosed.value);
};

const addDetail = () => {
  if (componentChoosed.value && componentChoosed.value.apiOpt) {
    delete componentChoosed.value.apiOpt;
  }

  detailData.value.push({
    col_det_id: "opt-" + (parseInt(detailData.value.length) + 1),
    col_det_label: "",
    value: parseInt(detailData.value.length) + 1,
    label: "",
  });
};

const onPasteData = (event) => {
  event.preventDefault();
  let pasteData = (event.clipboardData || window.clipboardData).getData("text");
  const lines = pasteData.split(/\r?\n/);

  detailData.value[0] = {
    col_det_id: "opt-" + (parseInt(detailData.value.length) + 1),
    col_det_label: lines[0],
    value: 1,
    label: lines[0],
  };

  for (let index = 1; index < lines.length; index++) {
    detailData.value.push({
      col_det_id: "opt-" + (parseInt(detailData.value.length) + 1),
      col_det_label: lines[index],
      value: parseInt(detailData.value.length) + 1,
      label: lines[index],
    });
  }
  console.log(lines);
};

const addAPIComponent = (data) => {  if (!data || Object.keys(data).length === 0) {
    componentChoosed.value.apiOpt = {
      api_url: "",
      api_method: "GET",
      api_params: "",
      api_headers: "",
      api_response: "",
    };
  }

  $q.dialog({
    component: addAPIComponentOptions,
    componentProps: {
      detailData: componentChoosed.value.apiOpt,
      forms: props.forms,
      comp: componentChoosed.value.value?.comp || "",
    },
  })
    .onOk((val) => {
      componentChoosed.value.apiOpt = val;
    })
    .onDismiss(() => {
      console.log("Dialog dismissed");
    });
};

const addDMSComponent = (data) => {
  if (!data || Object.keys(data).length === 0) {
    componentChoosed.value.dmsOpt = {
      root: "",
      start_folder_id: "",
      kind: "both",
    };
  }

  $q.dialog({
    component: addDMSComponentOptions,
    componentProps: {
      detailData: componentChoosed.value.dmsOpt,
    },
  })
    .onOk((val) => {
      componentChoosed.value.dmsOpt = val;
    })
    .onDismiss(() => {
      console.log("Dialog dismissed");
    });
};

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  console.log(componentChoosed.value);
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK({
    type: "form",
    content: {
      component: componentChoosed.value,
      detail_data: detailData.value,
      label: label.value,
    },
    required: isRequired.value,
    logics: [],
  });
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
