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
        <div class="text-h6">Add Forms Event</div>
      </q-card-section>

      <q-card-section class="q-pa-md"> </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const props = defineProps({
  forms: Array,
});

const $q = useQuasar();

const opr = ref("");
const modelValue = ref("");
const oprCont = ref("then");
const selPage = ref({});

const oprOpt = ref([
  {
    label: "Equal",
    value: "===",
  },
  {
    label: "Not Equal",
    value: "!==",
  },
  {
    label: "Contains",
    value: "like",
    disable:
      props.forms.filter((fil) => fil.seq_name == props.page)[0].content[
        props.colsIdx
      ].content.component.category === "multiple",
  },
  {
    label: "Not Contains",
    value: "not_like",
    disable:
      props.forms.filter((fil) => fil.seq_name == props.page)[0].content[
        props.colsIdx
      ].content.component.category === "multiple",
  },
  {
    label: "Greater Than",
    value: ">",
    disable:
      props.forms.filter((fil) => fil.seq_name == props.page)[0].content[
        props.colsIdx
      ].content.component.category === "multiple",
  },
  {
    label: "Greater Than Equals",
    value: ">=",
    disable:
      props.forms.filter((fil) => fil.seq_name == props.page)[0].content[
        props.colsIdx
      ].content.component.category === "multiple",
  },
  {
    label: "Less Than",
    value: "<",
    disable:
      props.forms.filter((fil) => fil.seq_name == props.page)[0].content[
        props.colsIdx
      ].content.component.category === "multiple",
  },
  {
    label: "Less Than Equals",
    value: "<=",
    disable:
      props.forms.filter((fil) => fil.seq_name == props.page)[0].content[
        props.colsIdx
      ].content.component.category === "multiple",
  },
]);
const oprOptCont = ref([
  {
    label: "Then",
    value: "then",
  },
  {
    label: "And",
    value: "&&",
  },
  {
    label: "Or",
    value: "||",
  },
  {
    label: "Else",
    value: "else",
  },
]);
const resultOpt = ref([
  {
    label: "Skip Page",
    value: "skip_page",
  },
  {
    label: "Jump to Page",
    value: "jump_page",
  },
  {
    label: "Show Column",
    value: "show_cols",
  },
  {
    label: "Hide Column",
    value: "hide_cols",
  },
  {
    label: "Disable Field",
    value: "disabled",
  },
  {
    label: "Enable Field",
    value: "enabled",
  },
  {
    label: "Show Notify",
    value: "notif",
  },
  {
    label: "Show Alert",
    value: "alert",
  },
]);
const rules = ref([
  {
    type: "logics",
    opr: opr.value,
    modelValue: modelValue.value,
    oprCont: oprCont.value,
    result: "",
    resultAction: {},
  },
  {
    type: "results",
    opr: opr.value,
    modelValue: modelValue.value,
    oprCont: oprCont.value,
    result: "",
    resultAction: {},
  },
]);
const notifOpt = ref([
  {
    label: "Error (Red Notify)",
    value: "error",
  },
  {
    label: "Warning (Orange Notify)",
    value: "warning",
  },
  {
    label: "Success (Green Notify)",
    value: "success",
  },
]);

const getNowFields = computed(
  () =>
    props.forms.filter((fil) => fil.seq_name == props.page)[0].content[
      props.colsIdx
    ]
);

const getAllForms = computed(() =>
  props.forms.reduce(
    (acc, val, idx) =>
      (acc = {
        ...acc,
        [idx]: {
          idxRows: idx,
          data: [...val.content.filter((valDet) => valDet.type == "form")],
        },
      }),
    []
  )
);

onMounted(() => {
  console.log(props.forms);
  console.log(getAllForms.value);
});

const onChangeOperator = (val, idx) => {
  if (idx === rules.value.length - 2) {
    if (val.value !== "then") {
      rules.value.splice(idx + 1, rules.value.length);
      rules.value.push(
        {
          type: "logics",
          opr: opr.value,
          modelValue: modelValue.value,
          oprCont: oprCont.value,
          result: "",
          resultAction: {},
        },
        {
          type: "results",
          opr: opr.value,
          modelValue: modelValue.value,
          oprCont: oprCont.value,
          result: "",
          resultAction: {},
        }
      );
    } else {
      rules.value.splice(idx + 1, rules.value.length);
      rules.value.push({
        type: "results",
        opr: opr.value,
        modelValue: modelValue.value,
        oprCont: oprCont.value,
        result: "",
        resultAction: {},
      });
    }
  }
};

const addMoreResult = () => {
  rules.value.push({
    type: "results",
    opr: opr.value,
    modelValue: modelValue.value,
    oprCont: oprCont.value,
    result: "",
    resultAction: {},
  });
};

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

function onOKClick() {
  console.log();
}
</script>
