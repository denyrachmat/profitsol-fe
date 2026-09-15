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
            <div class="text-h6">Set Keys for Bulk Upload Template</div>
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
        <template v-if="listKeys.length > 0">
          <div class="row" v-for="(keys, index) in listKeys" :key="index">
            <div class="col">
              <q-select
                filled
                v-model="keys.keys"
                :options="getAllForms"
                label="Select Component"
                emit-value
                map-options
                dense
              />
            </div>
            <div class="col-1 text-right">
              <q-btn
                color="negative"
                icon="delete"
                @click="listKeys.splice(index, 1)"
              />
            </div>
          </div>
        </template>
        <div v-else>
          <div class="text-subtitle2">
            No Keys has been added yet. Please click on "Add Column" button to
            add keys.
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="Submit" color="primary" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();
const listKeys = ref([]);

const props = defineProps({
  dataEdit: Array,
  forms: Array,
});

onMounted(() => {
  if (props.dataEdit && props.dataEdit.length > 0) {
    listKeys.value = JSON.parse(JSON.stringify(props.dataEdit));
  }
});

const addRows = () => {
  listKeys.value.push({
    keys: "",
  });
};

const getAllForms = computed(() =>
  props.forms
    .flatMap((form) => (form.type === "row" ? form.content : form))
    .filter((form) => form.type === "form")
    .map((form) => ({
      value: form.id,
      label: form.content.label,
      disable: listKeys.value.some((item) => item.keys === form.id),
    }))
);

const onSubmit = () => {
  // Handle form submission
  onDialogOK(listKeys.value);
};
</script>
