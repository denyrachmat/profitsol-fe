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
          <div class="col"><div class="text-h6">Share Forms</div></div>
          <div class="col text-right">
            <q-toggle label="Add to Main Menu ?" v-model="shareToMainMenu" />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div
            :class="shareToMainMenu ? 'col' : 'col-8'"
            style="max-height: 70vh; overflow: auto"
          >
            <div class="row">
              <div class="col text-bold">Add manual email</div>
            </div>
            <div class="row q-py-md">
              <div class="col">
                <q-input label="Email" v-model="emailUser" outlined dense>
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
                <q-expansion-item
                  icon="group"
                  label="Portal Roles"
                  caption="Registered STXI Portal Roles"
                >
                  <q-card>
                    <q-card-section>
                      <q-table
                        title="Roles"
                        :rows="rowsRoles"
                        :columns="columnsRoles"
                        row-key="id"
                        :filter="filterDataRoles"
                        v-model:selected="selectedTableRoles"
                        selection="multiple"
                        dense
                        @update:selected="onSelectDataRoles"
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
          </div>

          <div class="col q-pl-md" style="max-height: 70vh; overflow: auto">
            <div class="row q-py-md">
              <div class="col text-bold">List Registered Email</div>
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
          </div>

          <div
            class="col q-pl-md"
            style="max-height: 70vh; overflow: auto"
            v-if="shareToMainMenu"
          >
            <div class="row q-py-md">
              <div class="col text-bold">
                Choose where the forms would be placed
              </div>
            </div>

            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  label="App Icon Name"
                  v-model="shareFormsMenuIcon"
                  dense
                >
                  <template v-slot:before>
                    <q-icon
                      :name="
                        shareFormsMenuIcon ? shareFormsMenuIcon : 'add_reaction'
                      "
                    >
                      <q-tooltip>Icon Preview will be here</q-tooltip>
                    </q-icon>
                  </template>
                  <template v-slot:after>
                    <q-btn icon="open_in_new" flat @click="openLinkIcon">
                      <q-tooltip>Click to find all available icons</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row q-pt-md">
              <div class="col">
                <q-list>
                  <q-item
                    tag="label"
                    v-ripple
                    v-for="(menus, idx) in sharedMenuList"
                    :key="idx"
                  >
                    <q-item-section avatar>
                      <q-radio
                        v-model="selectedSharedMenu"
                        :val="menus.am_app_code"
                        color="orange"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ menus.am_app_name }}</q-item-label>
                      <q-item-label caption>{{
                        menus.am_app_desc
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
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
  shareMainMenu: Boolean,
  shareIsroles: Boolean,
  selectedSharedMenu: String,
  shareFormsMenuIcon: String,
  selectedTableRoles: Array,
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

const filterDataRoles = ref("");
const selectedTableRoles = ref([]);

const rowsRoles = ref([]);
const columnsRoles = ref([
  {
    name: "rm_role_name",
    align: "center",
    label: "Role Name",
    field: "rm_role_name",
    sortable: true,
  },
  {
    name: "rm_role_desc",
    align: "center",
    label: "Role Desc",
    field: "rm_role_desc",
    sortable: true,
  },
  {
    name: "username",
    align: "center",
    label: "Creator",
    field: "u_username",
    sortable: true,
  },
]);

const selectedTable = ref([]);
const shareToMainMenu = ref(false);
const isUsingRoles = ref(false);
const selectedSharedMenu = ref("");
const shareFormsMenuIcon = ref("");

const sharedMenuList = ref([]);

const addRecord = (val) => {
  selected.value.push(val);
  emailUser.value = "";
};

const onSelectData = (val) => {
  isUsingRoles.value = 0;
  const getEmailOnly = val.map((valMap) => valMap.email);
  selected.value = getEmailOnly;
};

const onSelectDataRoles = (val) => {
  selected.value = [];
  val.map((valMap) => {
    console.log(valMap);
    if (valMap.users_map.length > 0) {
      valMap.users_map.map((valUsers) => {
        selected.value.push(valUsers.u_username);
      });
    }
  });

  isUsingRoles.value = 1;
};

onMounted(async () => {
  getUsers();
  getRoles();

  shareToMainMenu.value = props.shareMainMenu;
  isUsingRoles.value = props.shareIsroles;
  selectedSharedMenu.value = props.selectedSharedMenu;
  shareFormsMenuIcon.value = props.shareFormsMenuIcon;
  selectedTableRoles.value = props.selectedTableRoles;
});

const getRoles = async () => {
  const data = await postData("get", null, "portal/roles", false, false, true);
  if (data) {
    rowsRoles.value = data.data;
  }
};

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

const getSharedMenu = async () => {
  const data = await postData("get", null, "portal/apps/1", false, false, true);
  if (data) {
    sharedMenuList.value = data.data;
  }
};

watch(
  () => shareToMainMenu.value,
  (val) => {
    if (val) {
      getSharedMenu();
    }
  }
);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK({
    emails: selected.value,
    isMainMenu: shareToMainMenu.value,
    isRoles: isUsingRoles.value,
    selectedSharedMenu: selectedSharedMenu.value,
    shareFormsMenuIcon: shareFormsMenuIcon.value,
  });
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
