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
        <div class="text-h6">
          Create Rule on Object:
          <span class="text-bold">{{ getNowFields.content.label }} </span>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <template v-for="(rule, idx) in rules" :key="idx">
          <div class="row q-pt-md" v-if="rule.type === 'logics'">
            <div class="col q-pl-md">
              <q-select
                v-model="rule.opr"
                :options="oprOpt"
                label="Operator"
                dense
                outlined
              >
              </q-select>
            </div>
            <div class="col q-pl-md">
              <q-select
                v-model="rule.modelValue"
                :options="getNowFields.content.detail_data"
                label="Value"
                dense
                v-if="getNowFields.content.component.category === 'multiple'"
                outlined
              />
              <q-input
                label="Value"
                v-model="rule.modelValue"
                dense
                v-else
                outlined
              />
            </div>
            <div class="col-2 q-pl-md">
              <q-select
                v-model="rule.oprCont"
                :options="oprOptCont"
                label="Operator"
                dense
                @update:model-value="(val) => onChangeOperator(val, idx)"
                outlined
              >
              </q-select>
            </div>
          </div>
          <div class="row q-pt-md" v-if="rule.type === 'results'">
            <div class="col q-pl-md">
              <q-select
                v-model="rule.result"
                :options="resultOpt"
                label="Results"
                dense
                outlined
              >
              </q-select>
            </div>
            <div
              class="col q-pl-md"
              v-if="
                rule.result.value === 'skip_page' ||
                rule.result.value === 'jump_page'
              "
            >
              <q-input dense outlined :label="`${rule.result.label} number`" />
            </div>
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onOKClick()" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const props = defineProps({
  forms: Array,
  page: Number,
  colsIdx: Number,
});

const $q = useQuasar();

const opr = ref("");
const modelValue = ref("");
const oprCont = ref("then");

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

const getNowFields = computed(
  () =>
    props.forms.filter((fil) => fil.seq_name == props.page)[0].content[
      props.colsIdx
    ]
);

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

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {}
</script>
