<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col text-center text-h4">Apps Setup</div>
    </div>
    <div class="row q-py-md">
      <div class="col">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="username"
          title="Apps List"
          :filter="filterData"
          dense
        >
          <template v-slot:top-right>
            <div class="row">
              <div class="col q-pr-sm">
                <q-btn-group>
                  <q-btn
                    color="green"
                    icon="add"
                    outline
                    @click="onUpdatedApps()"
                  />
                  <q-btn
                    color="purple"
                    icon="view_list"
                    outline
                    @click="onMapping()"
                  />
                </q-btn-group>
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
              <q-td key="am_app_code" :props="props">
                {{ props.row.am_app_code }}
              </q-td>
              <q-td key="am_app_name" :props="props">
                {{ props.row.am_app_name }}
              </q-td>
              <q-td key="am_app_desc" :props="props">
                {{ props.row.am_app_desc }}
              </q-td>
              <q-td key="am_app_url" :props="props">
                {{ props.row.am_app_url }}
              </q-td>
              <q-td key="am_app_icon" :props="props">
                <q-icon :name="props.row.am_app_icon" size="30px" />
              </q-td>
              <q-td key="am_is_drawer" :props="props">
                <q-icon
                  :name="
                    props.row.am_is_drawer == 1 ? 'check_circle' : 'cancel'
                  "
                  :color="props.row.am_is_drawer == 1 ? 'green' : 'red'"
                />
              </q-td>
              <q-td key="am_is_files" :props="props">
                <q-icon
                  :name="props.row.am_is_files == 1 ? 'check_circle' : 'cancel'"
                  :color="props.row.am_is_files == 1 ? 'green' : 'red'"
                />
              </q-td>
              <q-td key="am_is_shared" :props="props">
                <q-icon
                  :name="
                    props.row.am_is_shared == 1 ? 'check_circle' : 'cancel'
                  "
                  :color="props.row.am_is_shared == 1 ? 'green' : 'red'"
                />
              </q-td>
              <q-td key="action" :props="props">
                <q-btn-group spread rounded>
                  <q-btn
                    color="green"
                    label="Update"
                    icon="edit"
                    dense
                    @click="onUpdatedApps(false, props.row)"
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
import { ref, onMounted } from "vue";
import apiRequest from "src/components/apiRequest";

import updateApps from "./updateApps.vue";
import mappingApps from "./mappingApps.vue";

import { useQuasar, date } from "quasar";
import { useAuthStore } from "stores/authStore";

const $q = useQuasar();

const { postData } = apiRequest();
const store = useAuthStore();

const rows = ref([]);
const columns = ref([
  {
    name: "am_app_code",
    align: "center",
    label: "App Code",
    field: "am_app_code",
    sortable: true,
  },
  {
    name: "am_app_name",
    align: "center",
    label: "App Name",
    field: "am_app_name",
    sortable: true,
  },
  {
    name: "am_app_desc",
    align: "center",
    label: "App Desc",
    field: "am_app_desc",
    sortable: true,
  },
  {
    name: "am_app_url",
    align: "center",
    label: "App URL",
    field: "am_app_url",
    sortable: true,
  },
  {
    name: "am_app_icon",
    align: "center",
    label: "App Icon",
    field: "am_app_icon",
    sortable: true,
  },
  {
    name: "am_is_drawer",
    align: "center",
    label: "Is On Drawer ?",
    field: "am_is_drawer",
    sortable: true,
  },
  {
    name: "am_is_files",
    align: "center",
    label: "Is Download Files ?",
    field: "am_is_files",
    sortable: true,
  },
  {
    name: "am_is_shared",
    align: "center",
    label: "Is Shared Apps ?",
    field: "am_is_shared",
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
  getApps();
});

const onUpdatedApps = (
  isNew = true,
  data = {
    am_app_code: "",
    am_app_name: "",
    am_app_desc: "",
    am_app_url: "",
    am_app_icon: "",
    am_is_drawer: false,
    am_is_files: false,
    am_is_shared: false,
  }
) => {
  $q.dialog({
    component: updateApps,

    // props forwarded to your custom component
    componentProps: {
      isUpdate: !isNew,
      dataProps: data,
      list_parent: rows.value,
      // ...more..props...
    },
  })
    .onOk(async (val) => {
      const dataSub = await postData(
        isNew ? "post" : "patch",
        {
          ...val.value,
          u_username: store.authDet.username,
        },
        isNew ? `portal/apps` : `portal/apps/${val.value.am_app_code}`,
        false,
        false,
        true
      );

      if (dataSub) {
        console.log(data);
        getApps();
      }
    })
    .onCancel(() => {
      console.log("Cancel");
    })
    .onDismiss(() => {
      console.log("Called on OK or Cancel");
    });
};

const onMapping = () => {
  $q.dialog({
    component: mappingApps,

    // props forwarded to your custom component
    componentProps: {
      dataProps: rows.value,
      // ...more..props...
    },
  })
    .onOk(async (val) => {
      console.log(val.value);

      const data = await postData(
        "post",
        {
          ...val.value,
          u_username: store.authDet.username,
        },
        `portal/apps`,
        false,
        false,
        true
      );

      if (data) {
        console.log(data);
        getApps();
      }
    })
    .onCancel(() => {
      console.log("Cancel");
    })
    .onDismiss(() => {
      console.log("Called on OK or Cancel");
    });
};

const getApps = async () => {
  const data = await postData("get", null, "portal/apps", false, false, true);
  if (data) {
    rows.value = data.data;
  }
};
</script>
