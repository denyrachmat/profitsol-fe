<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <q-card-section class="q-pa-md">
        <div class="text-h6">Review All Logics</div>
        <div class="text-subtitle2">
          Overview of all logic assignments across all form fields
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md" style="max-height: 65vh; overflow-y: auto">
        <template v-if="groupedLogics.length > 0">
          <div
            v-for="(group, gIdx) in groupedLogics"
            :key="gIdx"
            class="q-mb-lg"
          >
            <div class="text-h6 text-primary q-mb-sm">
              {{ group.fieldLabel }}
              <q-badge color="primary" outline>{{ group.logics.length }} logic(s)</q-badge>
            </div>
            <q-separator class="q-mb-sm" />
            <div
              v-for="(logic, lIdx) in group.logics"
              :key="lIdx"
              class="row q-py-sm items-center"
            >
              <div class="col">
                <q-chip color="green" text-color="white" icon="edit_note">
                  {{ logic.seq_name || `L-${String(lIdx + 1).padStart(3, "0")}` }}
                </q-chip>
              </div>
              <div class="col-3">
                <q-chip color="orange" text-color="white" icon="note">
                  {{ logic.seq_desc || "No description" }}
                </q-chip>
              </div>
              <div class="col-2">
                <q-chip
                  :color="logic.data.length > 0 ? 'green' : 'red'"
                  text-color="white"
                >
                  {{ logic.data.length }} rule(s)
                </q-chip>
              </div>
              <div class="col-1 text-right">
                <q-btn
                  color="orange"
                  icon="edit"
                  @click="onEditLogic(gIdx, lIdx)"
                  outline
                  dense
                >
                  <q-tooltip>Edit Logic</q-tooltip>
                </q-btn>
                <q-btn
                  color="red"
                  icon="delete"
                  @click="onDeleteLogic(gIdx, lIdx)"
                  outline
                  dense
                  class="q-ml-sm"
                >
                  <q-tooltip>Delete Logic</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="text-center q-py-xl text-grey">
          <q-icon name="info" size="48px" />
          <div class="text-h6 q-mt-sm">No logics assigned</div>
          <div class="text-caption">
            No field has any logic rules yet. Use the brain button on each field to add logics.
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onSubmit" color="primary" label="Save Changes" />
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import viewLogicForms from "./viewLogicForms.vue";

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  forms: { type: Array, default: () => [] },
});

const groupedLogics = ref([]);

onMounted(() => {
  buildGroupedLogics();
});

const buildGroupedLogics = () => {
  const groups = [];
  props.forms.forEach((row, rowIdx) => {
    const content = row.type === "row" ? row.content : [row];
    content.forEach((col, colIdx) => {
      if (col.type === "form" && col.logics && col.logics.length > 0) {
        groups.push({
          rowIdx,
          colIdx,
          fieldLabel: col.content?.label || col.label || `Field #${col.id}`,
          fieldId: col.id,
          logics: col.logics.map((l) => ({
            seq_name: l.seq_name,
            seq_desc: l.seq_desc,
            data: l.data ? [...l.data] : [],
          })),
        });
      }
    });
  });
  groupedLogics.value = groups;
};

const onEditLogic = (gIdx, lIdx) => {
  const group = groupedLogics.value[gIdx];
  const logic = group.logics[lIdx];

  const content = props.forms[group.rowIdx].type === "row"
    ? props.forms[group.rowIdx].content
    : [props.forms[group.rowIdx]];

  $q.dialog({
    component: viewLogicForms,
    componentProps: {
      comp: content[group.colIdx],
      forms: props.forms,
      logic: logic,
    },
    persistent: true,
  }).onOk((data) => {
    group.logics[lIdx].seq_desc = data.seq_desc;
    group.logics[lIdx].data = data.data;
  });
};

const onDeleteLogic = (gIdx, lIdx) => {
  $q.dialog({
    title: "Confirm Delete",
    message: "Are you sure you want to delete this logic?",
    persistent: true,
    cancel: true,
  }).onOk(() => {
    groupedLogics.value[gIdx].logics.splice(lIdx, 1);
    if (groupedLogics.value[gIdx].logics.length === 0) {
      groupedLogics.value.splice(gIdx, 1);
    }
  });
};

const onSubmit = () => {
  const changes = groupedLogics.value.map((g) => ({
    rowIdx: g.rowIdx,
    colIdx: g.colIdx,
    logics: g.logics,
  }));
  onDialogOK(changes);
};
</script>
