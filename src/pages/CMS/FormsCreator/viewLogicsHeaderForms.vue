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
        <div class="text-h6">Manage Logics</div>
        <div class="text-subtitle2">
          You can add logics for your compoenent here
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col text-right">
            <q-btn
              color="primary"
              icon="add"
              label="Add Logic"
              @click="onClickAddLogic()"
              outline
            />
          </div>
        </div>
        <template v-if="listLogic.length > 0">
          <div
            class="row q-pt-md"
            v-for="(logic, index) in listLogic"
            :key="index"
          >
            <div class="col">
              <q-chip color="green" text-color="white" icon="edit_note">{{
                logic.seq_name
                  ? logic.seq_name
                  : `L-${String(index + 1).padStart(3, "0")}`
              }}</q-chip>
            </div>
            <div class="col">
              <q-chip color="orange" text-color="white" icon="note">{{
                logic.seq_desc
                  ? logic.seq_desc
                  : "Logic Description no added yet !"
              }}</q-chip>
            </div>
            <div class="col">
              <q-chip
                :color="logic.data.length > 0 ? 'green' : 'red'"
                text-color="white"
                icon="edit_note"
                >{{ logic.data.length }} Logics Line</q-chip
              >
            </div>
            <div class="col-1 text-right">
              <q-btn
                color="primary"
                icon="add"
                @click="onClickEditLogic(index)"
                outline
                v-if="logic.data.length === 0"
              >
                <q-tooltip anchor="top middle" self="bottom middle">
                  Add Logic
                </q-tooltip>
              </q-btn>
              <q-btn
                color="orange"
                icon="edit"
                @click="onClickEditLogic(index)"
                outline
                v-else
              >
                <q-tooltip anchor="top middle" self="bottom middle">
                  Edit Logic
                </q-tooltip>
              </q-btn>
              <q-btn
                color="red"
                icon="delete"
                @click="listLogic.splice(index, 1)"
                outline
              />
            </div>
          </div>
        </template>
        <div v-else>
          <div class="text-center q-pt-md">
            Please add logics for your component
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onSubmit" color="primary" label="Submit" />
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import viewLogicForms from "./viewLogicForms.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  comp: Object,
  forms: Array,
  logics: Array,
});

const $q = useQuasar();
const { postData } = apiRequest();
const listLogic = ref([]);

onMounted(() => {
  console.log(props.logics);
  listLogic.value = props.logics.map((logic) => ({
    seq_name: logic.seq_name,
    seq_desc: logic.seq_desc,
    data: logic.data,
  }));
});

const onClickAddLogic = () => {
  listLogic.value.push({
    seq_name: "",
    seq_desc: "",
    data: [],
  });
};

const onClickEditLogic = (index) => {
  const logic = listLogic.value[index];
  $q.dialog({
    component: viewLogicForms,
    componentProps: {
      comp: props.comp,
      forms: props.forms,
      logic: logic,
    },
    persistent: true,
    ok: true,
    cancel: true,
  }).onOk((data) => {
    listLogic.value[index].seq_desc = data.seq_desc;
    listLogic.value[index].data = data.data;
  });
};

const onSubmit = () => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure you want to save the logics?",
    persistent: true,
  }).onOk(() => {
    // Save logic data
    onDialogOK(listLogic.value);
  });
};
</script>
