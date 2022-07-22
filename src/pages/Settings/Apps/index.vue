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
                <q-btn-group spread>
                  <q-btn
                    color="green"
                    icon="add"
                    outline
                    @click="onUpdatedApps()"
                  />
                  <q-btn color="purple" icon="view_list" outline />
                </q-btn-group>
              </div>
              <div class="col">
                <q-input
                  outlined
                  dense
                  debounce="300"
                  v-model="filter"
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
import { ref, onMounted } from "vue";
import apiRequest from "src/components/apiRequest";
import updateApps from "./updateApps.vue";
import { useQuasar, date } from "quasar";

const $q = useQuasar();

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
  data = {
    am_app_code: "",
    am_app_name: "",
    am_app_desc: "",
    am_app_url: "",
    am_app_icon: "",
    am_is_drawer: false,
  }
) => {
  $q.dialog({
    component: updateApps,

    // props forwarded to your custom component
    componentProps: {
      dataProps: data,
      // ...more..props...
    },
  })
    .onOk(async (val) => {
      console.log(val);
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
