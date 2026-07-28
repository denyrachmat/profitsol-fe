<template>
  <q-dialog
    :style="`width: ${
      props.size === 'small'
        ? '300px'
        : props.size === 'large'
        ? '800px'
        : '500px'
    };  max-width: ${props.size === 'medium' ? '80vw' : '90vw'};`"
    ref="dialogRef"
    persistent
    v-if="props.isDialog"
    :full-width="props.size === 'full'"
  >
    <q-card
      :style="`min-width: ${
        props.size === 'small'
          ? '300px'
          : props.size === 'large'
          ? '800px'
          : '500px'
      }`"
    >
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">{{ title }}</div>
          </div>
          <div class="col text-right" v-if="removable">
            <q-btn
              icon="add"
              flat
              color="primary"
              @click="onAddField"
              v-if="props.removable"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Dynamic Input Fields -->
        <div v-for="(field, index) in fields" :key="index" class="q-mb-sm">
          <div
            v-if="Array.isArray(field)"
            class="row q-col-gutter-md flex items-center justify-center"
          >
            <div
              v-for="(f, idx) in field"
              :key="idx"
              :class="
                f.colLength && f.colLength <= 12 ? `col-${f.colLength}` : 'col'
              "
            >
              <multiplePromptDialog
                :initialFields="[f]"
                @ok="onChildFieldUpdate"
                @change="onChildFieldUpdate"
                :isDialog="false"
              >
              </multiplePromptDialog>
            </div>
            <div
              v-if="removable && index > 0"
              class="col-1 flex items-center justify-center"
            >
              <q-btn
                icon="delete"
                flat
                color="negative"
                @click="removeField(index)"
              />
            </div>
          </div>
          <template v-else>
            <div
              v-if="field.type === 'datetime-range' && !isFieldVisible(field)"
            >
              <div class="text-caption text-grey-7">{{ field.label }}</div>
              <div class="text-body2">
                <span
                  v-if="fieldValues[field.name] && fieldValues[field.name].from"
                  class="text-bold"
                >
                  from: {{ formatDate(fieldValues[field.name].from) }} <br />To:
                  {{ formatDate(fieldValues[field.name].to) }}
                </span>
                <span v-else class="text-grey-6">No date range selected</span>
              </div>
              <q-date
                v-model="fieldValues[field.name]"
                mask="YYYY-MM-DD HH:mm"
                :range="field.type === 'datetime-range'"
                class="full-width"
              >
              </q-date>
            </div>

            <q-input
              v-if="
                (field.type == 'text' ||
                  field.type == 'number' ||
                  field.type == 'date' ||
                  field.type == 'datetime') &&
                !isFieldVisible(field)
              "
              v-model="fieldValues[field.name]"
              :label="field.label"
              :type="field.type || 'text'"
              :rules="field.rules || []"
              outlined
              dense
              :min="field.min !== undefined ? field.min : undefined"
              :max="field.max !== undefined ? field.max : undefined"
              :value="fieldValues[field.name]"
            >
              <template
                v-slot:prepend
                v-if="
                  field.type === 'date' ||
                  field.type === 'datetime' ||
                  field.type === 'datetime-range'
                "
              >
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="fieldValues[field.name]"
                      mask="YYYY-MM-DD HH:mm"
                      :range="field.type === 'datetime-range'"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template
                v-slot:append
                v-if="field.type === 'time' || field.type === 'datetime'"
              >
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="fieldValues[field.name]"
                      mask="YYYY-MM-DD HH:mm"
                      format24h
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-select
              v-if="field.type === 'select' && !isFieldVisible(field)"
              :model-value="
                field.multiple
                  ? Array.isArray(fieldValues[field.name])
                    ? fieldValues[field.name]
                    : fieldValues[field.name] == null
                    ? []
                    : [fieldValues[field.name]]
                  : fieldValues[field.name]
              "
              :options="
                (field.options || []).map((opt) => {
                  const o =
                    typeof opt === 'object'
                      ? opt
                      : { label: String(opt), value: opt };
                  const sel = fieldValues[field.name];
                  const allSelected = Array.isArray(sel)
                    ? sel.includes('_ALL')
                    : sel === '_ALL';
                  return { ...o, disable: allSelected && o.value !== '_ALL' };
                })
              "
              :label="field.label"
              outlined
              dense
              emit-value
              map-options
              :rules="field.rules || []"
              :multiple="field.multiple || false"
              use-chips
              stack-label
              @update:model-value="
                (val) => {
                  if (field.multiple) {
                    const v = Array.isArray(val)
                      ? val
                      : val == null
                      ? []
                      : [val];
                    if (v.includes('_ALL')) {
                      fieldValues[field.name] = ['_ALL'];
                    } else {
                      fieldValues[field.name] = v.filter((x) => x !== '_ALL');
                    }
                  } else {
                    fieldValues[field.name] = val;
                  }
                }
              "
            />

            <div
              v-if="field.type === 'radio' && !isFieldVisible(field)"
              class="q-mt-sm"
            >
              <div class="text-caption text-grey-7">{{ field.label }}</div>
              <q-option-group
                v-model="fieldValues[field.name]"
                :options="field.options"
                :rules="field.rules || []"
                inline
              />
            </div>
          </template>
        </div>

        <!-- Add New Field Button (commented out in your original) -->
        <!-- <q-btn
          icon="add"
          label="Add Field"
          flat
          color="primary"
          @click="addField"
          v-if="addable"
        /> -->
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn flat label="Submit" color="primary" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <template v-else>
    <div v-for="(field, index) in fields" :key="index" class="q-mb-sm">
      <div v-if="Array.isArray(field)" class="row q-col-gutter-md">
        <template v-for="(f, idx) in field" :key="idx">
          <multiplePromptDialog
            :initialFields="[f]"
            @ok="onChildFieldUpdate"
            @change="onChildFieldUpdate"
          >
          </multiplePromptDialog>
        </template>
      </div>
      <template v-else>
        <div v-if="field.type === 'datetime-range' && !isFieldVisible(field)">
          <div class="text-caption text-grey-7">{{ field.label }}</div>
          <div class="text-body2">
            <span
              v-if="fieldValues[field.name] && fieldValues[field.name].from"
              class="text-bold"
            >
              from: {{ formatDate(fieldValues[field.name].from) }} <br />To:
              {{ formatDate(fieldValues[field.name].to) }}
            </span>
            <span v-else class="text-grey-6">No date range selected</span>
          </div>
          <q-date
            v-model="fieldValues[field.name]"
            mask="YYYY-MM-DD HH:mm"
            :range="field.type === 'datetime-range'"
            class="full-width"
          >
          </q-date>
        </div>

        <q-input
          v-if="
            (field.type == 'text' ||
              field.type == 'number' ||
              field.type == 'date' ||
              field.type == 'datetime') &&
            !isFieldVisible(field)
          "
          v-model="fieldValues[field.name]"
          :label="field.label"
          :type="field.type || 'text'"
          :rules="field.rules || []"
          outlined
          dense
          :min="field.min !== undefined ? field.min : undefined"
          :max="field.max !== undefined ? field.max : undefined"
          :value="fieldValues[field.name]"
        >
          <template
            v-slot:prepend
            v-if="
              field.type === 'date' ||
              field.type === 'datetime' ||
              field.type === 'datetime-range'
            "
          >
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="fieldValues[field.name]"
                  mask="YYYY-MM-DD HH:mm"
                  :range="field.type === 'datetime-range'"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template
            v-slot:append
            v-if="field.type === 'time' || field.type === 'datetime'"
          >
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time
                  v-model="fieldValues[field.name]"
                  mask="YYYY-MM-DD HH:mm"
                  format24h
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-select
          v-if="field.type === 'select' && !isFieldVisible(field)"
          :model-value="
            field.multiple
              ? Array.isArray(fieldValues[field.name])
                ? fieldValues[field.name]
                : fieldValues[field.name] == null
                ? []
                : [fieldValues[field.name]]
              : fieldValues[field.name]
          "
          :options="
            (field.options || []).map((opt) => {
              const o =
                typeof opt === 'object'
                  ? opt
                  : { label: String(opt), value: opt };
              const sel = fieldValues[field.name];
              const allSelected = Array.isArray(sel)
                ? sel.includes('_ALL')
                : sel === '_ALL';
              return { ...o, disable: allSelected && o.value !== '_ALL' };
            })
          "
          :label="field.label"
          outlined
          dense
          emit-value
          map-options
          :rules="field.rules || []"
          :multiple="field.multiple || false"
          use-chips
          stack-label
          @update:model-value="
            (val) => {
              if (field.multiple) {
                const v = Array.isArray(val) ? val : val == null ? [] : [val];
                if (v.includes('_ALL')) {
                  fieldValues[field.name] = ['_ALL'];
                } else {
                  fieldValues[field.name] = v.filter((x) => x !== '_ALL');
                }
              } else {
                fieldValues[field.name] = val;
              }
            }
          "
        />

        <div
          v-if="field.type === 'radio' && !isFieldVisible(field)"
          class="q-mt-sm"
        >
          <div class="text-caption text-grey-7">{{ field.label }}</div>
          <q-option-group
            v-model="fieldValues[field.name]"
            :options="field.options"
            :rules="field.rules || []"
            inline
          />
        </div>
      </template>
    </div>
  </template>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useDialogPluginComponent } from "quasar";
import multiplePromptDialog from "src/components/multiplePromptDialog.vue";

const emit = defineEmits([...useDialogPluginComponent.emits, "ok", "change"]);

const flattenFields = (inputFields = []) =>
  inputFields.flatMap((item) => (Array.isArray(item) ? item : [item]));

const getDefaultFieldValue = (field) => {
  if (field.default !== undefined) {
    return field.default;
  }

  if (field.type === "select" && field.multiple) {
    return [];
  }

  if (field.type === "datetime-range") {
    return null;
  }

  return "";
};

const props = defineProps({
  title: {
    type: String,
    default: "Dynamic Form",
  },
  initialFields: {
    type: Array,
    default: () => [
      {
        name: "field1",
        label: "Field 1",
        type: "text",
        rules: [(val) => !!val || "Field is required"],
      },
    ],
  },
  addable: {
    type: Boolean,
    default: false, // Disabled since you commented out the button
  },
  removable: {
    type: Boolean,
    default: true,
  },
  isDialog: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: "medium",
  },
});

onMounted(() => {
  console.log("Initial fields:", props.initialFields);
  fields.value = props.initialFields;
  currentField.value = Array.isArray(props.initialFields)
    ? props.initialFields
    : [];
});

const { dialogRef, onDialogOK } = useDialogPluginComponent();

const fields = ref([]);
const currentField = ref([]);

const fieldValues = ref(
  flattenFields(props.initialFields).reduce((acc, field) => {
    if (field?.name) {
      acc[field.name] = getDefaultFieldValue(field);
    }
    return acc;
  }, {})
);

const onChildFieldUpdate = (data) => {
  if (data && typeof data === "object") {
    Object.assign(fieldValues.value, data);
  }
};

watch(
  fieldValues,
  (newValues) => {
    if (!props.isDialog) {
      const payload = { ...newValues };
      emit("change", payload);
      emit("ok", payload);
    }
  },
  { deep: true }
);

const removeField = (index) => {
  const removedField = fields.value.splice(index, 1)[0];
  delete fieldValues.value[removedField.name];
};

const isFieldVisible = (field) => {
  if (!field.hidden) {
    return false;
  }

  if (typeof field.hidden === "function") {
    const formsValueModel = flattenFields(fields.value).reduce((acc, f) => {
      if (f?.name) {
        acc[f.name] = fieldValues.value[f.name];
      }
      return acc;
    }, {});

    // console.log("Checking visibility for field:", field.name, formsValueModel);

    return field.hidden(formsValueModel);
  }

  return !field.hidden;
};

const onSubmit = () => {
  // Validate before submitting
  const isValid = fields.value.every((field) => {
    if (field.rules) {
      return field.rules.every(
        (rule) => rule(fieldValues.value[field.name]) === true
      );
    }
    return true;
  });

  if (isValid) {
    console.log("Form submitted with values:", [
      fieldValues.value,
      fields.value,
      isValid,
    ]);
    onDialogOK(fieldValues.value); // Emit the payload
  }
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const onAddField = () => {
  // const newFieldName = `field${fields.value.length + 1}`;
  console.log("Adding new field based on initialFields:", props.initialFields);

  if (props.isDialog) {
    fields.value.push(...currentField.value); // Add a new field based on the first field's structure
    flattenFields(currentField.value).forEach((field) => {
      if (field?.name && fieldValues.value[field.name] === undefined) {
        fieldValues.value[field.name] = getDefaultFieldValue(field);
      }
    });
  }
  // fieldValues.value[newFieldName] = "";
};
</script>
