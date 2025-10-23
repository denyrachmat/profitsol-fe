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
        <div class="text-h6">Manage Field Column</div>
      </q-card-section>

      <hr />
      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <span class="text-h6">Type Field</span>
            <q-option-group
              v-model="groupType"
              :options="optType"
              color="primary"
            />
          </div>
          <div class="col">
            <span class="text-h6">Filter Method</span>
            <q-option-group
              v-model="metType"
              :options="optMet"
              color="primary"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Search" color="primary" @click="onOKClick" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const props = defineProps({
  fieldName: String,
  typeField: String,
  filterMethod: String,
});

const groupType = ref("text");
const metType = ref("=");
const optType = ref([
  {
    label: "Text",
    value: "text",
  },
  {
    label: "Integer",
    value: "int",
  },
  {
    label: "Float",
    value: "float",
  },
  {
    label: "Date",
    value: "date",
  },
  {
    label: "Datetime",
    value: "datetime",
  },
]);
const optMet = ref([
  {
    label: "Exact Value",
    value: "=",
  },
  {
    label: "Contain Value",
    value: "like",
  },
  {
    label: "Range",
    value: "between",
  },
]);

onMounted(() => {
  console.log(props.data);
});

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const onOKClick = () => {
  onDialogOK(filterList.value);
};
</script>
