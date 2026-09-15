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
                  <q-card v-if="rows.length > 0">
                    <q-card-section>
                      <q-table
                        title="Registered Users"
                        :rows="rows"
                        :columns="cols"
                        row-key="u_username"
                        :filter="filterData"
                        v-model:selected="selectedTable"
                        selection="multiple"
                        dense
                        @update:selected="onSelectData"
                        :loading="loadingUsers"
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
                  <div v-else class="q-pa-md text-center">
                    <q-spinner v-if="loadingUsers" size="2em" />
                    <div v-else>No users available</div>
                  </div>
                </q-expansion-item>
                <q-expansion-item
                  icon="group"
                  label="Portal Roles"
                  caption="Registered STXI Portal Roles"
                >
                  <q-card v-if="rowsRoles.length > 0">
                    <q-card-section>
                      <q-table
                        title="Roles"
                        :rows="rowsRoles"
                        :columns="columnsRoles"
                        row-key="id"
                        :filter="filterDataRoles"
                        v-model:selected="selectedTableRolesS"
                        selection="multiple"
                        dense
                        @update:selected="onSelectDataRoles"
                        :loading="loadingRoles"
                      >
                        <template v-slot:top-right>
                          <q-input
                            borderless
                            dense
                            debounce="300"
                            v-model="filterDataRoles"
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
                  <div v-else class="q-pa-md text-center">
                    <q-spinner v-if="loadingRoles" size="2em" />
                    <div v-else>No roles available</div>
                  </div>
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
                      {{ sel[0]?.toUpperCase() }}
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>{{ sel }}</q-item-section>
                  <q-item-section side>
                    <q-btn
                      icon="delete"
                      flat
                      round
                      dense
                      @click="removeEmail(idx)"
                    />
                  </q-item-section>
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
                  v-model="shareFormsMenuIconS"
                  dense
                >
                  <template v-slot:before>
                    <q-icon
                      :name="
                        shareFormsMenuIconS
                          ? shareFormsMenuIconS
                          : 'add_reaction'
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
                        v-model="selectedSharedMenuS"
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
        <q-btn flat label="Cancel" color="negative" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  id: String,
  shared: Array,
  shareMainMenu: Boolean,
  shareIsroles: Boolean,
  selectedSharedMenu: String,
  shareFormsMenuIcon: String,
  selectedTableRoles: Array,
});

// Form data
const emailUser = ref("");
const selected = ref([]);
const shareToMainMenu = ref(false);
const isUsingRoles = ref(false);
const selectedSharedMenuS = ref("");
const shareFormsMenuIconS = ref("");

// Table data
const filterData = ref("");
const filterDataRoles = ref("");
const rows = ref([]);
const rowsRoles = ref([]);
const sharedMenuList = ref([]);
const loadingUsers = ref(false);
const loadingRoles = ref(false);

// Table selections
const selectedTable = ref([]);
const selectedTableRolesS = ref([]);

// Columns definitions
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

// Methods
const addRecord = (val) => {
  if (val && !selected.value.includes(val)) {
    selected.value.push(val);
    emailUser.value = "";
  }
};

const removeEmail = (index) => {
  selected.value.splice(index, 1);
};

const onSelectData = (val) => {
  isUsingRoles.value = false;
  selected.value = val.map((item) => item.email).filter(Boolean);
};

const onSelectDataRoles = (val) => {
  selected.value = [];
  val.forEach((role) => {
    (role.users_map || []).forEach((user) => {
      if (user.u_username) {
        selected.value.push(user.u_username);
      }
    });
  });
  isUsingRoles.value = true;
};

const openLinkIcon = () => {
  window.open("https://fonts.google.com/icons", "_blank");
};

// Data fetching
const getUsers = async () => {
  try {
    loadingUsers.value = true;
    const data = await postData(
      "get",
      null,
      "portal/users/ActiveOnly",
      false,
      false,
      true
    );

    if (data?.data) {
      rows.value = data.data;

      if (props.shared?.length) {
        selectedTable.value = rows.value.filter((user) =>
          props.shared.includes(user.email)
        );
        selected.value = [...props.shared];
      }
    }
  } catch (error) {
    console.error("Error loading users:", error);
  } finally {
    loadingUsers.value = false;
  }
};

const getRoles = async () => {
  try {
    loadingRoles.value = true;
    const data = await postData(
      "get",
      null,
      "portal/roles",
      false,
      false,
      true
    );
    if (data?.data) {
      rowsRoles.value = data.data;

      if (props.selectedTableRoles?.length) {
        selectedTableRolesS.value = rowsRoles.value.filter((role) =>
          props.selectedTableRoles.includes(role.id)
        );
      }
    }
  } catch (error) {
    console.error("Error loading roles:", error);
  } finally {
    loadingRoles.value = false;
  }
};

const getSharedMenu = async () => {
  try {
    const data = await postData(
      "get",
      null,
      "portal/apps/1",
      false,
      false,
      true
    );
    if (data?.data) {
      sharedMenuList.value = data.data;
    }
    if (props.selectedSharedMenu) {
      const exists = (sharedMenuList.value || []).some((m) => String(m.am_app_code) === String(props.selectedSharedMenu));
      if (!exists) {
        const fallback = await postData("get", null, "portal/apps", false, false, true);
        if (fallback?.data) {
          const found = fallback.data.find((m) => String(m.am_app_code) === String(props.selectedSharedMenu));
          if (found) sharedMenuList.value = [...sharedMenuList.value, found];
        }
      }
    }
  } catch (error) {
    console.error("Error loading shared menu:", error);
  }
};

// Initialization
onMounted(async () => {
  shareToMainMenu.value = props.shareMainMenu ?? false;
  isUsingRoles.value = props.shareIsroles ?? false;
  selectedSharedMenuS.value = props.selectedSharedMenu ?? "";
  shareFormsMenuIconS.value = props.shareFormsMenuIcon ?? "";

  await Promise.all([getUsers(), getRoles()]);

  if (shareToMainMenu.value) {
    await getSharedMenu();
    if (!selectedSharedMenuS.value && props.id) {
      try {
        const fresh = await postData("get", null, `cms/viewByID/${props.id}`, false, true, true);
        const fv = fresh?.data?.value;
        if (fv?.selectedSharedMenu) selectedSharedMenuS.value = fv.selectedSharedMenu;
        else if (fv?.am_app_parent) selectedSharedMenuS.value = fv.am_app_parent;
        console.log("shareForms fallback selectedSharedMenu", selectedSharedMenuS.value, fv);
      } catch (e) {
        console.log("shareForms fallback fetch failed", e);
      }
    }
  }
});

watch(
  () => props.selectedSharedMenu,
  (val) => {
    if (val) selectedSharedMenuS.value = val;
  }
);

watch(shareToMainMenu, async (val) => {
  if (val) {
    await getSharedMenu();
    if (props.selectedSharedMenu) selectedSharedMenuS.value = props.selectedSharedMenu;
  }
});

function onOKClick() {
  onDialogOK({
    emails: selected.value,
    isMainMenu: shareToMainMenu.value,
    isRoles: isUsingRoles.value,
    selectedSharedMenu: selectedSharedMenuS.value,
    shareFormsMenuIcon: shareFormsMenuIconS.value,
    selectedTableRoles: selectedTableRolesS.value.map((r) => r.id),
  });
}
</script>
