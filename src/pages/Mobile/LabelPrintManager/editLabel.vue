<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" full-width>
    <q-card class="q-dialog-plugin">
      <q-card-section class="q-pt-none">
        <div class="row items-center q-py-sm">
          <div class="col text-h6">
            {{ isUpdate ? "Edit" : "New" }} Label Template
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input outlined label="Template Name" v-model="dataHasil.name" />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              outlined
              label="Printer Language"
              v-model="dataHasil.language"
              :options="['ZPL', 'SBPL']"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              outlined
              label="Description"
              v-model="dataHasil.description"
            />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <q-tabs v-model="tab" dense class="text-primary">
          <q-tab name="layout" icon="wrap_text" label="Layout (ZPL/SBPL)" />
          <q-tab name="contract" icon="table_rows" label="Fields & Data" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated>
          <!-- ================= TAB: LAYOUT / ZPL ================= -->
          <q-tab-panel name="layout">
            <div class="row q-mb-sm items-center">
              <div class="col text-subtitle2">Available variables</div>
            </div>
            <div class="row q-mb-sm q-gutter-xs">
              <q-chip
                v-for="v in availableVars"
                :key="v"
                clickable
                color="primary"
                text-color="white"
                @click="insertVar(v)"
              >
                {<b>{{ v }}</b
                >}
              </q-chip>
            </div>

            <q-input
              outlined
              type="textarea"
              v-model="dataHasil.template"
              label="ZPL template"
              :input-style="{ fontFamily: 'monospace', minHeight: '220px' }"
              stack-label
            />

            <!-- sample values for preview -->
            <div class="row q-mt-md items-center">
              <div class="col text-subtitle2">
                Preview values (fill to render)
              </div>
            </div>
            <div class="row q-my-sm q-gutter-sm">
              <q-input
                v-for="v in availableVars"
                :key="v"
                outlined
                dense
                :label="v"
                :model-value="sampleValues[v] || ''"
                @update:model-value="(val) => (sampleValues[v] = val)"
                style="width: 160px"
              />
            </div>

            <div class="row q-mt-sm q-gutter-sm">
              <q-input
                outlined
                dense
                label="Label width (in)"
                v-model.number="labelWidth"
                style="width: 120px"
              />
              <q-input
                outlined
                dense
                label="Label height (in)"
                v-model.number="labelHeight"
                style="width: 120px"
              />
              <q-select
                outlined
                dense
                v-model="dpmm"
                :options="['6', '8', '12', '24']"
                label="DPI (dpmm)"
                style="width: 120px"
              />
              <q-btn
                color="primary"
                icon="visibility"
                label="Preview"
                :loading="previewLoading"
                @click="onPreview"
              />
            </div>

            <div v-if="previewUrl" class="row q-mt-md justify-center">
              <img
                :src="previewUrl"
                alt="label preview"
                class="label-preview"
              />
              <div class="col-12 text-center q-mt-sm">
                <a :href="previewUrl" target="_blank" download="label.png"
                  >Download preview</a
                >
              </div>
            </div>
          </q-tab-panel>

          <!-- ================= TAB: FIELDS & DATA ================= -->
          <q-tab-panel name="contract">
            <div class="row items-center q-mb-sm">
              <div class="col text-subtitle2">Form Fields (operator input)</div>
              <q-btn
                color="green"
                icon="add"
                label="Add Field"
                @click="addField"
              />
            </div>
            <div
              v-for="(f, i) in dataHasil.config.filters"
              :key="'f' + i"
              class="row q-col-gutter-sm q-mb-sm items-center"
            >
              <div class="col-3">
                <q-input outlined dense v-model="f.field" label="Field" />
              </div>
              <div class="col-4">
                <q-input outlined dense v-model="f.label" label="Label" />
              </div>
              <div class="col-3">
                <q-select
                  outlined
                  dense
                  v-model="f.type"
                  :options="['text', 'number', 'date']"
                  label="Type"
                />
              </div>
              <div class="col-2">
                <q-btn
                  dense
                  flat
                  color="red"
                  icon="delete"
                  @click="dataHasil.config.filters.splice(i, 1)"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="row items-center q-mb-sm">
              <div class="col text-subtitle2">Confirmation Send Value</div>
              <q-btn
                color="green"
                icon="add"
                label="Add Field"
                @click="addConfirmField"
              />
            </div>
            <div
              v-for="(f, i) in dataHasil.config.confirmationSendValue"
              :key="'c' + i"
              class="row q-col-gutter-sm q-mb-sm items-center"
            >
              <div class="col-3">
                <q-input outlined dense v-model="f.field" label="Field" />
              </div>
              <div class="col-4">
                <q-input outlined dense v-model="f.label" label="Label" />
              </div>
              <div class="col-2">
                <q-select
                  outlined
                  dense
                  v-model="f.type"
                  :options="['text', 'number', 'date']"
                  label="Type"
                />
              </div>
              <div class="col-2">
                <q-checkbox
                  dense
                  v-model="f.readonly"
                  label="Readonly"
                  :true-value="true"
                  :false-value="false"
                />
              </div>
              <div class="col-1">
                <q-btn
                  dense
                  flat
                  color="red"
                  icon="delete"
                  @click="dataHasil.config.confirmationSendValue.splice(i, 1)"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  label="API Url"
                  v-model="dataHasil.config.apiUrl"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  outlined
                  v-model="dataHasil.config.method"
                  :options="['POST', 'GET', 'PUT']"
                  label="Method"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-toggle
                  v-model="dataHasil.config.useConfirmation"
                  label="Use Confirmation"
                />
              </div>
            </div>

            <div class="row q-mt-sm">
              <div class="col">
                <q-input
                  outlined
                  label="Confirmation Message"
                  v-model="dataHasil.config.confirmationMessage"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn color="primary" label="Save" @click="onOKClick" />
        <q-btn flat color="red" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  isUpdate: Boolean,
  dataProps: Object || null,
});

const tab = ref("layout");
const previewUrl = ref("");
const previewLoading = ref(false);
const labelWidth = ref(4);
const labelHeight = ref(6);
const dpmm = ref("8");

const sampleValues = ref({});

const baseContract = () => ({
  apiUrl: "",
  method: "POST",
  headers: {},
  filters: [],
  useConfirmation: true,
  confirmationMessage: "Are you sure you want to print?",
  confirmationSendValue: [],
});

const dataHasil = ref({
  id: props.dataProps?.id || null,
  name: props.dataProps?.name || "",
  language: props.dataProps?.language || props.dataProps?.contract || "ZPL",
  description: props.dataProps?.description || "",
  template: props.dataProps?.template || "",
  config: Object.assign(baseContract(), props.dataProps?.config || {}, {
    filters: Array.isArray(props.dataProps?.config?.filters)
      ? props.dataProps.config.filters
      : [],
    confirmationSendValue: Array.isArray(
      props.dataProps?.config?.confirmationSendValue
    )
      ? props.dataProps.config.confirmationSendValue
      : [],
  }),
});

const availableVars = computed(() => {
  const vars = [];
  const tpl = String(dataHasil.value.template || "");
  const re = /\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(tpl))) {
    if (!vars.includes(m[1])) vars.push(m[1]);
  }
  return vars;
});

const insertVar = (v) => {
  const t = String(dataHasil.value.template || "");
  dataHasil.value.template = t + "{" + v + "}";
};

// ---- build ZPL with sample values, then call labelary ----
const onPreview = async () => {
  try {
    previewLoading.value = true;
    const tpl = String(dataHasil.value.template || "");
    let zpl = tpl;
    Object.keys(sampleValues.value).forEach((k) => {
      zpl = zpl.split("{" + k + "}").join(String(sampleValues.value[k] || ""));
    });

    const url = `https://api.labelary.com/v1/printers/${dpmm.value}dpmm/labels/${labelWidth.value}x${labelHeight.value}/0/`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "image/png",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: zpl,
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Labelary error: ${res.status} ${msg || res.statusText}`);
    }

    const blob = await res.blob();
    previewUrl.value = URL.createObjectURL(blob);
  } catch (e) {
    $q.notify({ type: "negative", message: e.message });
  } finally {
    previewLoading.value = false;
  }
};

const addField = () =>
  dataHasil.value.config.filters.push({ field: "", label: "", type: "text" });
const addConfirmField = () =>
  dataHasil.value.config.confirmationSendValue.push({
    field: "",
    label: "",
    type: "text",
    readonly: false,
  });

const onOKClick = () => onDialogOK({ value: dataHasil.value });

onMounted(() => {
  sampleValues.value = {};
  availableVars.value.forEach((v) => {
    // default sample values per known var
    if (v === "ITMCD") sampleValues.value[v] = "1234";
    else if (v === "PRINTQTY") sampleValues.value[v] = "10";
    else if (v === "COPIES") sampleValues.value[v] = "1";
    else if (v === "COPYNO") sampleValues.value[v] = "1";
    else sampleValues.value[v] = "Sample";
  });
});
</script>
<style scoped>
.label-preview {
  border: 1px solid #ddd;
  max-width: 100%;
  max-height: 70vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
