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
        >
          <template v-slot:top-right>
            <q-input
              borderless
              dense
              debounce="300"
              v-model="filter"
              placeholder="Search"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="action" :props="props">
                <q-toggle
                  v-model="props.row.pud_is_active"
                  checked-icon="check"
                  color="red"
                  unchecked-icon="clear"
                  true-value="1"
                  false-value="0"
                  @update:model-value="
                    (value) => onChangeActive(props.row, value)
                  "
                />
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
                  />
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

import updateUsers from "./updateUsers";

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

onMounted(async () => {
  getUsers();
});

const getUsers = async () => {
  const data = await postData("get", null, "portal/users", false, false, true);
  if (data) {
    rows.value = data.data;
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

const onChangeActive = async (datas, value) => {
  const data = await postData(
    "patch",
    {
      form: {
        pud_is_active: value,
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
</script>
