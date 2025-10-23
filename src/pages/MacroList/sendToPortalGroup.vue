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
        <div class="text-h6">Send to STX-I Web System Group</div>
      </q-card-section>

      <hr />
      <q-card-section class="q-pa-md">
        <q-select
          filled
          v-model="menuChoose"
          use-input
          input-debounce="0"
          label="Choose Category"
          :options="optionsFiltered"
          @filter="filterFn"
          emit-value
          map-options
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No results </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onOKClick()" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar, useDialogPluginComponent } from "quasar";
import { onMounted, ref } from "vue";
import { useAuthStore } from "src/stores/authStore";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { postData } = apiRequest();
const store = useAuthStore();

const props = defineProps({
  selected: Array,
});

const options = ref([]);
const optionsFiltered = ref([]);
const menuChoose = ref("");

onMounted(async () => {
  const data = await getListFolder();

  if (data) {
    options.value = data;
    optionsFiltered.value = options.value;
  }
});

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const filterFn = (val, update) => {
  if (val === "") {
    update(() => {
      optionsFiltered.value = options.value;

      // here you have access to "ref" which
      // is the Vue reference of the QSelect
    });
    return;
  }

  update(async () => {
    const needle = val.toLowerCase();
    optionsFiltered.value = options.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};

const getListFolder = async () => {
  const data = await postData("get", null, "macro/listRole", false, true);

  if (data.status) {
    return data.data;
  }
};

const onOKClick = () => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure want to assign macro to this category ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const data = await postData(
      "post",
      {
        selectedMacro: props.selected,
        u_username: store.authDet.username,
        idMenu: menuChoose.value,
      },
      "macro/list",
      false,
      true
    );

    if (data.status) {
      $q.notify({
        message: `${data.message}`,
        color: "success",
      });

      console.log("masuk sini");
      console.log(props.selected);
      onDialogOK();
    }
  });
};
</script>
