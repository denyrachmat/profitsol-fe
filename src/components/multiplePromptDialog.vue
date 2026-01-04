<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-card-section>
        <!-- Dynamic Input Fields -->
        <div v-for="(field, index) in fields" :key="index" class="q-mb-sm">
          <q-input
            v-if="field.type !== 'select' && !isFieldVisible(field)"
            v-model="fieldValues[field.name]"
            :label="field.label"
            :type="field.type || 'text'"
            :rules="field.rules || []"
            outlined
            dense
            :min="field.min !== undefined ? field.min : undefined"
            :max="field.max !== undefined ? field.max : undefined"
          />
          <q-select
            v-if="field.type === 'select' && !isFieldVisible(field)"
            v-model="fieldValues[field.name]"
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
          <!-- <template v-if="fields.length > 1" v-slot:append>
              <q-btn
                icon="delete"
                flat
                dense
                @click="removeField(index)"
                v-if="removable"
              />
            </template> -->
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
</template>

<script setup>
import { ref } from "vue";
import { useDialogPluginComponent } from "quasar";

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
});

const { dialogRef, onDialogOK } = useDialogPluginComponent();

const fields = ref([...props.initialFields]);
const fieldValues = ref(
  props.initialFields.reduce((acc, field) => {
    acc[field.name] = field.default || "";
    return acc;
  }, {})
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
    const formsValueModel = fields.value.reduce((acc, f) => {
      acc[f.name] = fieldValues.value[f.name];
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
    onDialogOK({ ...fieldValues.value }); // Emit the payload
  }
};
</script>
