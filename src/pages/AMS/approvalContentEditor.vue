<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" full-width allow-focus-outside>
    <q-card class="q-dialog-plugin bg-white">
      <q-card-section class="row items-center">
        <div class="text-h6">Edit Approval Notification Content</div>
        <q-space />
        <q-btn-dropdown
          dense
          flat
          no-icon-animation
          size="sm"
          color="primary"
          label="Insert Variable"
          menu-anchor="bottom left"
          menu-self="top left"
        >
          <q-list dense>
            <template v-for="group in groupedVars" :key="group">
              <q-item-label
                header
                class="text-weight-bold text-grey-6"
                style="min-height: 24px; padding: 2px 16px"
              >
                {{ group }}
              </q-item-label>
              <q-item
                v-for="v in varsByGroup(group)"
                :key="v.name"
                clickable
                v-close-popup
                @click="insertVar(v)"
              >
                <q-item-section>
                  <q-item-label>{{ v.label }}</q-item-label>
                  <q-item-label caption class="text-orange">{{
                    varToken(v.name)
                  }}</q-item-label>
                  <q-item-label caption class="text-grey-6"
                    >Type: {{ typeLabel(v.type) }}</q-item-label
                  >
                </q-item-section>
              </q-item>
              <q-separator />
            </template>
          </q-list>
        </q-btn-dropdown>
      </q-card-section>

      <q-separator />

      <q-tabs v-model="activeTab" dense class="text-primary">
        <q-tab name="content" label="Content" />
        <q-tab name="variables" label="Variables &amp; Types" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="content" class="q-pa-sm">
          <tinyEditorVue ref="editorRef" v-model="content" />
        </q-tab-panel>

        <q-tab-panel name="variables" class="q-pa-md">
          <div class="text-subtitle2 q-mb-sm">
            Built-in Variables (Always Available)
          </div>
          <q-list bordered separator dense>
            <q-item v-for="v in builtinVars" :key="v.name">
              <q-item-section>
                <q-item-label>{{ v.label }}</q-item-label>
                <q-item-label caption
                  >{{ varToken(v.name) }} — {{ v.type }}</q-item-label
                >
              </q-item-section>
            </q-item>
          </q-list>

          <div class="row items-center q-mt-lg q-mb-sm">
            <div class="text-subtitle2">Data Variables (From Submission)</div>
            <q-space />
            <q-btn
              color="primary"
              label="Add Variable"
              icon="add"
              size="sm"
              @click="addVariable"
            />
          </div>

          <template v-if="dataVariables.length > 0">
            <div
              v-for="(v, idx) in dataVariables"
              :key="idx"
              class="q-mb-sm q-pa-md bg-grey-2 rounded-borders"
            >
              <div class="row items-end">
                <div class="col-3 q-pr-sm">
                  <q-input v-model="v.label" label="Label" dense outlined />
                </div>
                <div class="col-3 q-px-sm">
                  <q-input
                    v-model="v.name"
                    label="Variable name (used as {{$name}})"
                    dense
                    outlined
                  />
                </div>
                <div class="col-2 q-px-sm">
                  <q-select
                    v-model="v.type"
                    :options="[
                      'string',
                      'number',
                      'integer',
                      'float',
                      'boolean',
                      'date',
                      'array',
                      'array-loop',
                    ]"
                    label="Data type"
                    dense
                    outlined
                    :option-label="typeLabel"
                  />
                </div>
                <div v-if="v.type === 'array-loop'" class="col-3 q-px-sm">
                  <q-btn
                    outline
                    color="primary"
                    icon="table_rows"
                    label="Add Field"
                    size="sm"
                    @click="addField(v)"
                  />
                </div>
                <div v-else class="col"></div>
                <div class="col-1 q-pl-sm">
                  <q-btn
                    flat
                    round
                    dense
                    color="red"
                    icon="delete"
                    @click="removeVariable(idx)"
                  />
                </div>
              </div>

              <div
                v-if="v.type === 'array-loop'"
                class="q-mt-sm q-pa-sm bg-white rounded-borders"
              >
                <div class="text-caption text-grey-7 q-mb-sm">
                  Field columns (each item in the array):
                </div>
                <div v-if="v.fields && v.fields.length > 0">
                  <div
                    v-for="(f, fi) in v.fields"
                    :key="fi"
                    class="row items-center q-mb-xs"
                  >
                    <div class="col-4 q-pr-xs">
                      <q-input v-model="f.label" label="Label" dense outlined />
                    </div>
                    <div class="col-4 q-px-xs">
                      <q-input v-model="f.name" label="Name" dense outlined />
                    </div>
                    <div class="col-3 q-px-xs">
                      <q-select
                        v-model="f.type"
                        :options="[
                          'string',
                          'number',
                          'integer',
                          'float',
                          'boolean',
                          'date',
                        ]"
                        label="Type"
                        dense
                        outlined
                      />
                    </div>
                    <div class="col-1 q-pl-xs">
                      <q-btn
                        flat
                        round
                        dense
                        color="red"
                        icon="close"
                        @click="removeField(v, fi)"
                      />
                    </div>
                  </div>
                </div>
                <q-btn
                  flat
                  dense
                  color="primary"
                  icon="add"
                  label="Add Field"
                  @click="addField(v)"
                />
              </div>
            </div>
          </template>
          <div v-else class="text-center text-grey-6 q-py-lg">
            No custom variables defined. Add one to map submission data into the
            notification.
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onOKClick" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, onMounted, computed } from "vue";
import { useDialogPluginComponent } from "quasar";
import tinyEditorVue from "src/components/editors/tinyEditor.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  content: String,
  variables: Array,
});

const editorRef = ref(null);
const activeTab = ref("content");
const content = ref("");
const dataVariables = ref([]);

// Built-in variables (implicit, always available, provided by the system)
const builtinVars = [
  {
    name: "recipient_fullname",
    label: "Approver Full Name",
    type: "string",
    group: "Approver",
  },
  {
    name: "fullname",
    label: "Sender Full Name",
    type: "string",
    group: "Sender",
  },
];

const allVariables = computed(() => [...builtinVars, ...dataVariables.value]);
const groupedVars = computed(() => [
  ...new Set(allVariables.value.map((v) => v.group || "Custom")),
]);
const varsByGroup = (group) =>
  allVariables.value.filter((v) => (v.group || "Custom") === group);

const varToken = (name) => `{{\$${name}}}`;

const typeLabel = (val) => {
  const map = {
    string: "string",
    number: "number",
    integer: "integer",
    float: "float",
    boolean: "boolean",
    date: "date",
    array: "array",
    "array-loop": "array (loop)",
  };
  return map[val] || val;
};

const insertVar = (v) => {
  if (!editorRef.value?.insertContent) return;
  // For loop variables, insert a ready-made Blade @foreach block the user can style
  if (v.type === "array-loop" && v.fields && v.fields.length > 0) {
    editorRef.value.insertContent(buildLoopBlock(v));
    return;
  }
  editorRef.value.insertContent(varToken(v.name));
};

// Build a Blade @foreach block for a loop variable, with columns per field
const buildLoopBlock = (v) => {
  const item = "item";
  const thead =
    `<tr>` +
    v.fields.map((f) => `<th>${f.label || f.name}</th>`).join("") +
    `</tr>`;
  const tbody =
    `<tr>` +
    v.fields.map((f) => `<td>{{\$${item}['${f.name}']}}</td>`).join("") +
    `</tr>`;
  return (
    `<div class="loop-block" data-loop="${v.name}">` +
    `<h4>${v.label || v.name} list</h4>` +
    `<table style="width:100%;border-collapse:collapse;">` +
    `<thead>${thead}</thead>` +
    `<tbody>@foreach($${v.name} as $${item})${tbody}@endforeach</tbody>` +
    `</table>` +
    `</div>`
  );
};

const addField = (v) => {
  if (!v.fields) v.fields = [];
  v.fields.push({ name: "", label: "", type: "string" });
};

const removeField = (v, idx) => {
  v.fields.splice(idx, 1);
};

const addVariable = () => {
  dataVariables.value.push({
    name: "",
    label: "",
    type: "string",
    group: "Custom",
    fields: [],
  });
};

const removeVariable = (idx) => {
  dataVariables.value.splice(idx, 1);
};

onMounted(() => {
  if (props.content) content.value = props.content;
  if (props.variables && Array.isArray(props.variables)) {
    const builtinNames = builtinVars.map((b) => b.name);
    dataVariables.value = props.variables
      .filter((v) => !builtinNames.includes(v.name))
      .map((v) => ({
        ...v,
        // Backend stores loop arrays as type "array" + fields; restore the UI loop type
        type:
          v.type === "array" && v.fields && v.fields.length > 0
            ? "array-loop"
            : v.type,
        fields: v.fields || [],
      }));
  }
});

const onOKClick = () => {
  const saved = dataVariables.value
    .filter((v) => v.name && v.type)
    .map((v) => {
      // Normalize: "array-loop" is a frontend-only UI type; backend stores as "array" + fields
      const isLoop = v.type === "array-loop";
      return {
        name: v.name,
        label: v.label,
        type: isLoop ? "array" : v.type,
        group: v.group || "Custom",
        ...(isLoop ? { fields: (v.fields || []).filter((f) => f.name) } : {}),
      };
    });
  onDialogOK({
    type: "html",
    content: content.value,
    variables: saved,
  });
};
</script>
