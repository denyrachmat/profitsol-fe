<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col text-center text-h4">Role Setup</div>
    </div>
    <div class="row q-py-md">
      <div class="col">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          title="Role List"
          :filter="filterData"
          dense
        >
          <template v-slot:top-right>
            <div class="row">
              <div class="col q-pr-sm text-right">
                <q-btn color="green" icon="add" @click="onUpdatedRoles()" />
              </div>
              <div class="col">
                <q-input
                  outlined
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
            </div>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="rm_role_name" :props="props">
                {{ props.row.rm_role_name }}
              </q-td>
              <q-td key="rm_role_desc" :props="props">
                {{ props.row.rm_role_desc }}
              </q-td>
              <q-td key="username" :props="props">
                {{ props.row.u_username }}
              </q-td>
              <q-td key="action" :props="props">
                <q-btn-group spread rounded>
                  <q-btn
                    color="green"
                    icon="edit"
                    dense
                    @click="onUpdatedRoles(false, props.row)"
                  />
                  <q-btn
                    color="cyan"
                    icon="people"
                    dense
                    @click="onUpdatedRoles(false, props.row, assignUsers)"
                  />
                  <q-btn
                    color="purple"
                    icon="list"
                    dense
                    @click="onUpdatedRoles(false, props.row, assignMenus)"
                  />
                  <q-btn
                    color="red"
                    icon="delete"
                    dense
                    @click="deleteRole(props.row.username)"
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

import updateRoles from "./updateRoles";
import assignUsers from "./assignUsers.vue";
import assignMenus from "./assignMenus.vue";

const { postData } = apiRequest();
const $q = useQuasar();
const store = useAuthStore();

const rows = ref([]);
const columns = ref([
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
  {
    name: "action",
    align: "center",
    label: "Actions",
    field: (row) => row.username,
  },
]);
const filterData = ref("");

onMounted(async () => {
  getRoles();
});

const getRoles = async () => {
  const data = await postData("get", null, "portal/roles", false, false, true);
  if (data) {
    rows.value = data.data;
  }
};

const onUpdatedRoles = (
  isNew = true,
  data = {
    id: "",
    rm_role_name: "",
    rm_role_desc: "",
  },
  comp = updateRoles
) => {
  $q.dialog({
    component: comp,

    // props forwarded to your custom component
    componentProps: {
      dataProps: data,
      // ...more..props...
    },
  })
    .onOk(async (val) => {
      console.log(val);
      const dataSub = await postData(
        isNew ? "post" : "patch",
        {
          ...val.value,
          u_username: store.authDet.username,
        },
        isNew ? `portal/roles` : `portal/roles/${val.value.id}`,
        false,
        false,
        true
      );

      if (dataSub) {
        console.log(data);
        getRoles();
      }
    })
    .onCancel(() => {
      console.log("Cancel");
    })
    .onDismiss(() => {
      console.log("Called on OK or Cancel");
    });
};

const deleteRole = (id) => {
  $q.dialog({
    title: "Alert",
    message: "Are you sure want to delete this user ?",
    cancel: true,
  })
    .onOk(async () => {
      const data = await postData(
        "delete",
        null,
        `portal/role/${btoa(id)}`,
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
</script>
