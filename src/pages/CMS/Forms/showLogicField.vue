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
        <div class="row q-pt-md">
          <div class="col">
            <span class="text-bold">Rules Logic</span>
          </div>
        </div>
        <template v-for="(rule, idx) in rules" :key="idx">
          <div
            class="q-pt-md"
            v-if="
              rules[idx - 1] &&
              rules[idx - 1].type === 'results' &&
              rule.type === 'logics'
            "
          >
            <q-separator />
          </div>
          <div class="row q-pt-md" v-if="rule.type === 'logics'">
            <div class="col q-pl-md">
              <q-select
                v-model="rule.opr"
                :options="oprOpt"
                label="Operator"
                dense
                outlined
                emit-value
                map-options
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
                emit-value
                map-options
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
                emit-value
                map-options
              >
              </q-select>
            </div>
            <div class="col-1 q-pl-md text-right">
              <q-btn
                icon="add"
                flat
                color="orange"
                @click="addMoreLogics()"
                v-if="idx === 0"
              >
                <q-tooltip>Add more logics</q-tooltip>
              </q-btn>
              <q-btn
                icon="delete"
                flat
                color="red"
                @click="
                  rules.splice(idx + 1, 1);
                  rules.splice(idx, 1);
                "
                v-else
              >
                <q-tooltip>Remove Logics</q-tooltip>
              </q-btn>
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
                emit-value
                map-options
              >
              </q-select>
            </div>

            <!-- IF Choose Notif show type notif-->
            <div class="col q-pl-md" v-if="rule.result === 'notif'">
              <q-select
                v-model="rule.resultAction.notifType"
                :options="notifOpt"
                label="Notif Type Choose"
                dense
                outlined
                emit-value
                map-options
              >
              </q-select>
            </div>

            <div
              class="col q-pl-md"
              v-if="
                rule.result === 'show_rowcols' || rule.result === 'hide_rowcols'
              "
            >
              <q-select
                v-model="rule.resultAction.choosedPage"
                :options="getPage()"
                label="Choose Page"
                dense
                outlined
                map-options
                emit-value
              >
              </q-select>
            </div>

            <div
              class="col q-pl-md"
              v-if="
                (rule.result === 'show_rowcols' ||
                  rule.result === 'hide_rowcols') &&
                rule.resultAction.choosedPage
              "
            >
              <q-select
                v-model="rule.resultAction.choosedCols"
                :options="getPage(rule.resultAction.choosedPage)"
                label="Choose Cols"
                dense
                outlined
                emit-value
                map-options
              >
              </q-select>
            </div>

            <div
              class="col q-pl-md"
              v-if="
                rule.result === 'skip_page' ||
                rule.result === 'jump_page' ||
                rule.result === 'notif'
              "
            >
              <q-input
                v-model="rule.resultAction.action"
                dense
                outlined
                :label="
                  rule.result === 'notif'
                    ? 'Alert message'
                    : `${rule.result.label} number`
                "
              />
            </div>
            <div class="col-1 q-pl-md text-right">
              <!-- addMoreLogics -->
              <q-btn
                icon="add"
                flat
                color="green"
                @click="addMoreResult(idx)"
                v-if="rules[idx - 1] && rules[idx - 1].type === 'logics'"
              >
                <q-tooltip>Add more result</q-tooltip>
              </q-btn>
              <q-btn
                icon="delete"
                flat
                color="red"
                @click="rules.splice(idx, 1)"
                v-if="rules[idx - 1] && rules[idx - 1].type === 'results'"
              >
                <q-tooltip>Remove Result</q-tooltip>
              </q-btn>
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
  page: String,
  colsIdx: Number,
  logics: Array,
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
    label: "Show Rows / Column",
    value: "show_rowcols",
  },
  {
    label: "Hide Rows / Column",
    value: "hide_rowcols",
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

const getPage = (page = "") => {
  let getListCols;
  if (page) {
    getListCols = props.forms.filter((fil) => fil.seq_name === page);
  } else {
    getListCols = props.forms.filter((fil) => fil.seq_name !== props.page);
  }

  let hasil = [];
  getListCols.map((valMap) => {
    if (page) {
      valMap.content.map((valCont, idx) => {
        hasil.push({
          value: valCont.id,
          label: `Columns - ${idx + 1} (Type Form: ${valCont.type})`,
        });
      });
    } else {
      hasil.push({
        value: valMap.seq_name,
        label: `Page - ${valMap.seq_name}`,
      });
    }
  });

  return hasil;
};

onMounted(() => {
  if (props.logics && props.logics.length > 0) {
    console.log(props.logics);
    rules.value = props.logics;
  }
});

const onChangeOperator = (val, idx) => {
  // if (idx === rules.value.length - 2) {

  // }
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
};

const addMoreResult = (idx) => {
  rules.value.splice(idx + 1, 0, {
    type: "results",
    opr: opr.value,
    modelValue: modelValue.value,
    oprCont: oprCont.value,
    result: "",
    resultAction: {},
  });
  // rules.value.push({
  //   type: "results",
  //   opr: opr.value,
  //   modelValue: modelValue.value,
  //   oprCont: oprCont.value,
  //   result: "",
  //   resultAction: {},
  // });
};

const addMoreLogics = () => {
  rules.value.push({
    type: "logics",
    opr: opr.value,
    modelValue: modelValue.value,
    oprCont: oprCont.value,
    result: "",
    resultAction: {},
  });

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
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure want to add this logics to the field ?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    onDialogOK(rules.value);
  });
}
</script>
