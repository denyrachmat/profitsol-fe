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
        <div class="text-h6">Share Forms</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col text-bold">Add manual email</div>
        </div>
        <div class="row q-py-md">
          <div class="col">
            <q-input label="Email" v-model="emailUser" outlined>
              <template v-slot:append>
                <q-btn
                  round
                  dense
                  flat
                  icon="add"
                  class="bg-green text-white"
                  @click="addRecord(emailUser)"
                />
              </template>
            </q-input>
          </div>
        </div>

        <q-separator />

        <div class="row q-pt-md">
          <div class="col text-bold">Add registered portal user</div>
        </div>
        <div class="row q-py-md">
          <div class="col">
            <q-expansion-item
              icon="perm_identity"
              label="Portal Account"
              caption="Registered STXI Portal Account"
            >
              <q-card>
                <q-card-section>
                  <q-table
                    title="Registered Users"
                    :rows="rows"
                    :columns="cols"
                    row-key="email"
                    :filter="filterData"
                    v-model:selected="selectedTable"
                    selection="multiple"
                    dense
                    @update:selected="onSelectData"
                  >
                    <template v-slot:top-right>
                      <q-input
                        borderless
                        dense
                        debounce="300"
                        v-model="filterData"
                        placeholder="Search"
                      >
                        <template v-slot:append>
                          <q-icon name="search" />
                        </template>
                      </q-input>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </div>

        <q-separator />

        <div class="row q-py-md">
          <div class="col text-bold">List Registerd Email</div>
        </div>

        <div class="row">
          <div class="col">
            <q-item
              clickable
              v-ripple
              v-for="(sel, idx) in selected"
              :key="idx"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ sel[0] }}
                </q-avatar>
              </q-item-section>

              <q-item-section>{{ sel }}</q-item-section>
            </q-item>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" @click="onOKClick()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted, watch } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();

const props = defineProps({
  id: String,
  shared: Array,
});

const emailUser = ref("");
const selected = ref([]);
const filterData = ref("");
const rows = ref([]);
const cols = ref([
  {
    name: "username",
    align: "left",
    label: "Username",
    field: "u_username",
    sortable: true,
  },
  {
    name: "email",
    align: "left",
    label: "Email",
    field: "email",
    sortable: true,
  },
  {
    name: "pud_first_name",
    align: "left",
    label: "First Name",
    field: "pud_first_name",
    sortable: true,
  },
  {
    name: "pud_last_name",
    align: "left",
    label: "Last Name",
    field: "pud_last_name",
    sortable: true,
  },
]);

const selectedTable = ref([]);

const addRecord = (val) => {
  selected.value.push(val);
  emailUser.value = "";
};

const onSelectData = (val) => {
  console.log(val);
  const getEmailOnly = val.map((valMap) => valMap.email);
  selected.value = getEmailOnly;
};

onMounted(async () => {
  getUsers();
});

const getUsers = async () => {
  const data = await postData("get", null, "portal/users", false, false, true);
  if (data) {
    rows.value = data.data;

    if (props.shared.length > 0) {
      selected.value = props.shared;
      const checkSelectedTable = rows.value.filter((fil) =>
        props.shared.includes(fil.email)
      );

      selectedTable.value = checkSelectedTable;
      selected.value = props.shared;
    }
  }
};

// watch(
//   () => JSON.stringify(selectedTable.value),
//   (val) => {
//     console.log(JSON.parse(val));
//     const getEmailOnly = JSON.parse(val).map((valMap) => valMap.email);
//     selected.value = getEmailOnly;
//   }
// );

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK(selected.value);
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
