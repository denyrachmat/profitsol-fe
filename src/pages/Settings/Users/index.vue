<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col text-center text-h4">Users Setup</div>
    </div>
    <div class="row q-py-md">
      <div class="col">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="username"
          title="User List"
          :filter="filterData"
          dense
          v-model:selected="selectedUsers"
          @update:selected="onSelection"
          selection="multiple"
          :loading="loading"
        >
          <template v-slot:top-right>
            <div class="row">
              <div class="col">
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
              </div>

              <div class="col-2 text-right">
                <q-btn
                  dense
                  outline
                  color="primary"
                  icon="add_task"
                  @click="onManageFP()"
                  :disable="selectedUsers.length === 0"
                >
                  <q-tooltip>{{
                    selectedUsers.length === 0
                      ? "Please select users first"
                      : "Manage Frontpage Users"
                  }}</q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              :class="props.row.pud_is_active !== '1' ? 'bg-grey-5' : ''"
            >
              <q-td>
                <q-checkbox
                  :model-value="
                    props.selected && props.row.pud_is_active === '1'
                  "
                  @update:model-value="(val) => (props.selected = val)"
                  :disable="props.row.pud_is_active !== '1'"
                />
              </q-td>
              <q-td key="action" :props="props">
                <q-toggle
                  v-model="props.row.pud_is_active"
                  checked-icon="check"
                  color="red"
                  unchecked-icon="clear"
                  true-value="1"
                  false-value="0"
                  @update:model-value="
                    (value) => onChangeActive(props.row, 'pud_is_active', value)
                  "
                />
              </q-td>
              <q-td key="mobile" :props="props">
                <q-toggle
                  v-model="props.row.is_mobileacc"
                  checked-icon="check"
                  color="red"
                  unchecked-icon="clear"
                  true-value="1"
                  false-value="0"
                  @update:model-value="
                    (value) => onChangeActive(props.row, 'is_mobileacc', value)
                  "
                  :disable="props.row.pud_is_active !== '1'"
                />
              </q-td>
              <q-td key="ms_login" :props="props">
                <q-toggle
                  v-model="props.row.is_ms_checking"
                  checked-icon="check"
                  color="red"
                  unchecked-icon="clear"
                  true-value="1"
                  false-value="0"
                  @update:model-value="
                    (value) =>
                      onChangeActive(props.row, 'is_ms_checking', value)
                  "
                  :disable="props.row.pud_is_active !== '1'"
                />
              </q-td>

              <q-td key="pud_photo" :props="props">
                <q-avatar
                  size="30px"
                  color="orange"
                  v-if="!props.row.pud_photo"
                  >{{ props.row.username.slice(0, 2).toUpperCase() }}</q-avatar
                >
                <q-avatar size="24px" color="orange" v-else>
                  <img :src="props.row.pud_photo" />
                </q-avatar>
              </q-td>
              <q-td key="username" :props="props">
                {{ props.row.username }}
              </q-td>
              <q-td key="email" :props="props">
                {{ props.row.email }}
              </q-td>
              <q-td key="pud_first_name" :props="props">
                {{ props.row.pud_first_name }}
              </q-td>
              <q-td key="pud_last_name" :props="props">
                {{ props.row.pud_last_name }}
              </q-td>
              <q-td key="email_verified_at" :props="props">
                {{
                  date.formatDate(
                    props.row.email_verified_at,
                    "YYYY-MM-DD HH:mm:ss"
                  )
                }}
              </q-td>
              <q-td key="action" :props="props">
                <q-btn-group spread rounded>
                  <q-btn
                    color="green"
                    label="Update"
                    icon="edit"
                    dense
                    @click="updateUsersAction(props.row)"
                    :disable="props.row.username === store.authDet.username"
                  >
                    <q-tooltip>Edit User Profile</q-tooltip>
                  </q-btn>
                  <q-btn
                    color="orange"
                    label="Update"
                    icon="edit"
                    dense
                    @click="onManageFP(props.row)"
                    :disable="props.row.is_fpconf.length === 0"
                  >
                    <q-tooltip>Manage Frontpage Users</q-tooltip>
                  </q-btn>
                  <q-btn
                    color="red"
                    label="Delete"
                    icon="delete"
                    dense
                    @click="deleteUser(props.row.username)"
                    :disable="props.row.username === store.authDet.username"
                  />
                </q-btn-group>
                {{ props.row.action }}
              </q-td>
            </q-tr>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineComponent, ref, onMounted } from "vue";
import apiRequest from "src/components/apiRequest";
import { useQuasar, date } from "quasar";
import { useAuthStore } from "stores/authStore";

import updateUsers from "./updateUsers.vue";
import mappingUsersFPManage from "./mappingUsersFPManage.vue";

const { postData } = apiRequest();
const $q = useQuasar();
const store = useAuthStore();

const rows = ref([]);
const columns = ref([
  {
    name: "active",
    align: "center",
    label: "Is Active ?",
  },
  {
    name: "mobile",
    align: "center",
    label: "Using Portal Mobile ?",
  },
  {
    name: "ms_login",
    align: "center",
    label: "Force using MS Login ?",
  },
  {
    name: "pud_photo",
    align: "center",
    label: "Ava",
    field: "pud_photo",
    sortable: true,
  },
  {
    name: "username",
    align: "center",
    label: "Username",
    field: "u_username",
    sortable: true,
  },
  {
    name: "email",
    align: "center",
    label: "Email",
    field: "email",
    sortable: true,
  },
  {
    name: "pud_first_name",
    align: "center",
    label: "First Name",
    field: "pud_first_name",
    sortable: true,
  },
  {
    name: "pud_last_name",
    align: "center",
    label: "Last Name",
    field: "pud_last_name",
    sortable: true,
  },
  {
    name: "email_verified_at",
    align: "center",
    label: "Verified Date",
    field: "email_verified_at",
    sortable: true,
  },
  {
    name: "action",
    align: "center",
    label: "Actions",
    field: (row) => row.username,
  },
]);
const filterData = ref("");
const selectedUsers = ref([]);
const loading = ref(false);

onMounted(async () => {
  getUsers();
});

const onSelection = (rows) => {
  // Only include active users in selection
  const activeUsers = rows.filter((row) => row.pud_is_active === "1");
  selectedUsers.value = activeUsers;

  // Prevent default selection behavior to show correct count
};

const getUsers = async () => {
  loading.value = true;
  try {
    const data = await postData(
      "get",
      null,
      "portal/users",
      false,
      false,
      true
    );
    if (data) {
      rows.value = data.data;
    }
  } finally {
    loading.value = false;
  }
};

const updateUsersAction = (data) => {
  console.log(data);
  $q.dialog({
    component: updateUsers,

    // props forwarded to your custom component
    componentProps: {
      dataProps: data,
      // ...more..props...
    },
  })
    .onOk(async (val) => {
      const updateProf = await updateProfile(val.value);
      if (updateProf) {
        getUsers();
      }
    })
    .onCancel(() => {
      console.log("Cancel");
    })
    .onDismiss(() => {
      console.log("Called on OK or Cancel");
    });
};

const deleteUser = (username) => {
  $q.dialog({
    title: "Alert",
    message: "Are you sure want to delete this user ?",
    cancel: true,
  })
    .onOk(async () => {
      const data = await postData(
        "delete",
        null,
        `portal/profiles/${btoa(username)}`,
        false,
        false,
        true
      );

      if (data) {
        console.log(data);
      }
      // console.log('OK')
    })
    .onCancel(() => {});
};

const updateProfile = async (datas) => {
  const data = await postData(
    "patch",
    {
      form: datas,
    },
    `portal/profiles/${btoa(datas.username)}`,
    false,
    false,
    true
  );

  if (data) {
    return data;
  }
};

const onChangeActive = async (datas, col = "pud_is_active", value) => {
  const data = await postData(
    "patch",
    {
      form: {
        [col]: value,
        pud_first_name: datas.pud_first_name,
        pud_last_name: datas.pud_last_name,
      },
    },
    `portal/profiles/${btoa(datas.username)}`,
    false,
    false,
    true
  );

  if (data) {
    getUsers();
  }
};

const onManageFP = (listFPMenu = []) => {
  if (listFPMenu.username) {
    selectedUsers.value = [listFPMenu];
  }

  console.log("Selected Users for FP:", [selectedUsers.value, listFPMenu]);

  $q.dialog({
    component: mappingUsersFPManage,

    // props forwarded to your custom component
    componentProps: {
      selectedUsers: selectedUsers.value,
      selectedFPMenu: listFPMenu.is_fpconf,
      // ...more..props...
    },
    persistent: true,
  })
    .onOk(async (val) => {
      getUsers();
      // console.log("Dialog confirmed with value:", val);
    })
    .onCancel(() => {
      // console.log("Dialog canceled");
    });
};
</script>
