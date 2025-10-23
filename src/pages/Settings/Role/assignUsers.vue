<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">Assign Role to User</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section class="q-pt-none">
        <q-select
          filled
          v-model="selectedUsers"
          multiple
          :options="options"
          label="Search Users"
          :option-label="(val) => val.pud_first_name + ' ' + val.pud_last_name"
          option-value="username"
          emit-value
          map-options
          use-chips
        />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick()" />
        <q-btn flat color="red" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useDialogPluginComponent, date } from "quasar";

import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();

const props = defineProps({
  dataProps: Object || null,
  // ...your custom props
});

const dataHasil = ref(null);
const options = ref([]);
const selectedUsers = ref([]);

onMounted(() => {
  dataHasil.value = props.dataProps;

  props.dataProps.users_map.map((val) => {
    selectedUsers.value.push(val.u_username);
  });
  getUsers();
  // listParent.value = props.list_parent;
});

const getUsers = async () => {
  const data = await postData("get", null, "portal/users", false, false, true);
  if (data) {
    options.value = data.data;
  }
};

const filterUsers = (val, update, abort) => {
  update(() => {});
};

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

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
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  const selectUsers = [];
  selectedUsers.value.map((val) => {
    selectUsers.push({
      u_username: val,
      rm_role_id: dataHasil.value.id,
    });
  });

  onDialogOK(ref({ ...dataHasil.value, users_map: selectUsers }));
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
