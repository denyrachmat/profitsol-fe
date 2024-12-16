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
            <div class="text-h6">Add Forms Event</div>
          </div>
          <div class="col text-right">
            <q-btn icon="add" flat color="green" @click="onAddTrigger()">
              <q-tooltip>Add Trigger</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row">
          <div class="col">
            <div
              v-for="(val, idx) in listTriggers"
              :key="idx"
              :class="idx === 0 ? 'q-pt-md' : null"
            >
              <fieldset
                style="
                  border: 1px solid #ccc !important;
                  border-radius: 16px;
                  max-height: 80vh;
                  overflow: auto;
                "
              >
                <legend>Create Event here</legend>
                <div class="row q-pt-md">
                  <div class="col">
                    <q-select
                      v-model="val.eventForms"
                      :options="oprEvent"
                      label="Event"
                      dense
                      outlined
                      emit-value
                      map-options
                    >
                    </q-select>
                  </div>
                  <div class="col-1 text-right">
                    <q-btn
                      flat
                      icon="add"
                      color="green"
                      @click="onAddResultEvent(idx)"
                    >
                      <q-tooltip>Add more event</q-tooltip>
                    </q-btn>
                  </div>
                </div>
                <div
                  class="row q-pt-md"
                  v-for="(resDet, idxDet) in val.result"
                  :key="idxDet"
                >
                  <div class="col">
                    <q-select
                      v-model="resDet.trigger"
                      :options="resultOpt"
                      label="Choose Event"
                      dense
                      outlined
                      emit-value
                      map-options
                    >
                    </q-select>
                  </div>

                  <div class="col q-pl-md" v-if="resDet.trigger == 'jump_page'">
                    <q-select
                      v-model="resDet.message"
                      :options="getAllPages"
                      label="Choose Page Label"
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
                      resDet.trigger == 'show_cols' ||
                      resDet.trigger == 'hide_cols' ||
                      resDet.trigger == 'show_rows' ||
                      resDet.trigger == 'hide_rows' ||
                      resDet.trigger == 'disabled' ||
                      resDet.trigger == 'enabled'
                    "
                  >
                    <q-select
                      v-model="resDet.rows"
                      :options="getAllRows"
                      label="Choose Rows"
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
                      resDet.rows !== '' &&
                      (resDet.trigger == 'show_cols' ||
                        resDet.trigger == 'hide_cols' ||
                        resDet.trigger == 'disabled' ||
                        resDet.trigger == 'enabled')
                    "
                  >
                    <q-select
                      v-model="resDet.cols"
                      :options="getNowFields(resDet.rows)"
                      label="Choose Columns"
                      dense
                      outlined
                      emit-value
                      map-options
                    >
                    </q-select>
                  </div>

                  <div class="col q-pl-md" v-if="resDet.trigger == 'notif'">
                    <q-select
                      v-model="resDet.event"
                      :options="notifOpt"
                      label="Notif Type Choose"
                      dense
                      outlined
                    >
                    </q-select>
                  </div>

                  <div
                    class="col q-pl-md"
                    v-if="
                      resDet.trigger === 'alert' ||
                      (resDet.trigger == 'notif' && resDet.event)
                    "
                  >
                    <q-input
                      dense
                      outlined
                      label="Message"
                      v-model="resDet.message"
                    />
                  </div>

                  <div class="col-1 text-right" v-if="idxDet > 0">
                    <q-btn
                      icon="delete"
                      color="red"
                      flat
                      @click="val.result.splice(idxDet, 1)"
                    />
                  </div>
                </div>
              </fieldset>
            </div>
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
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const props = defineProps({
  forms: Array,
  events: Array,
});

const $q = useQuasar();

const opr = ref("");
const modelValue = ref("");
const oprCont = ref("then");
const selPage = ref(1);
const selCols = ref(0);
const listTriggers = ref([]);

const oprEvent = ref([
  {
    label: "On Loaded Form",
    value: "onLoad",
  },
  {
    label: "On Closed Form",
    value: "onClosed",
  },
  {
    label: "On Submited Form",
    value: "onSubmit",
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
    label: "Show Rows",
    value: "show_rows",
  },
  {
    label: "Hide Rows",
    value: "hide_rows",
  },
  {
    label: "Disable Cols",
    value: "disabled",
  },
  {
    label: "Enable Cols",
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
  {
    label: "API (JSON) Access",
    value: "api",
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

const getAllRows = computed(() =>
  props.forms.reduce(
    (acc, val, idx) =>
      (acc = [
        ...acc,
        {
          value: idx,
          label: `Rows - ${idx + 1}`,
        },
      ]),
    []
  )
);

const getAllPages = computed(() =>
  Object.values(
    props.forms.reduce(
      (acc, val, idx) =>
        (acc = {
          ...acc,
          [val.seq_name]: {
            value: val.seq_name,
            label: `Pages - ${val.seq_name}`,
          },
        }),
      []
    )
  )
);

const getNowFields = (pages) =>
  props.forms[pages].content.reduce(
    (acc, val, idx) =>
      (acc = [
        ...acc,
        {
          value: idx,
          label:
            val.type == "form"
              ? `${val.content.label} (Forms)`
              : `${val.content} (HTML)`,
        },
      ]),
    []
  );

onMounted(() => {
  if (props.events && props.events.length > 0) {
    listTriggers.value = props.events;
  } else {
    onAddTrigger();
  }
});

const onAddTrigger = () => {
  listTriggers.value.push({
    eventForms: "",
    result: [
      {
        rows: "",
        cols: "",
        event: "",
        trigger: "",
        message: "",
      },
    ],
  });
};

const onAddResultEvent = (idx) => {
  listTriggers.value[idx].result.push({
    rows: "",
    cols: "",
    event: "",
    trigger: "",
    message: "",
  });
};

const htmlEntities = (str) => {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

function onOKClick() {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure want to add this event ?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    onDialogOK(listTriggers.value);
  });
}
</script>
