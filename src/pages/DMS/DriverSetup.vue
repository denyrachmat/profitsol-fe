<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col text-right">
        <q-btn-group>
          <q-btn color="primary" icon="add" @click="onClickManage">
            <q-tooltip>Add new DMS Root</q-tooltip>
          </q-btn>
          <q-btn color="cyan" icon="person_add" @click="onClickMapping">
            <q-tooltip>Mapping to registered users</q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </div>

    <div class="row q-pt-md">
      <div class="col text-right">
        <q-table
          flat
          bordered
          title="Approval List"
          :rows="rows"
          :columns="columns"
          row-key="name"
          :loading="loading"
        >
          <template v-slot:top-right>
            <div class="q-pr-sm">
              <q-btn
                label="Filter Data"
                color="primary"
                flat
                @click="onClickFilter()"
              >
                <q-badge color="red" floating transparent>
                  {{ filter.length }}
                </q-badge>
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
              <q-th auto-width>Action</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.value }}
              </q-td>
              <q-td auto-width>
                <q-btn
                  color="orange"
                  flat
                  dense
                  icon="edit"
                  @click="onClickManage(props.row)"
                >
                  <q-tooltip> Edit Approval </q-tooltip>
                </q-btn>
                <q-btn
                  color="red"
                  flat
                  dense
                  icon="delete"
                  @click="deleteData(props.row.id)"
                >
                  <q-tooltip> Delete Approval </q-tooltip>
                </q-btn>
                <q-btn
                  :color="props.row.config_status ? 'grey' : 'indigo'"
                  flat
                  dense
                  icon="settings"
                  @click="onClickInstallDiskRoot(props.row.id)"
                  :disable="props.row.config_status"
                >
                  <q-tooltip>
                    {{
                      props.row.config_status
                        ? "Disk has been installed"
                        : "Disk not installed yet, Install Disk Root now"
                    }}</q-tooltip
                  >
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed, watch, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";

import dataFilter from "./dataFilter.vue";
import DriverSetupManage from "./DriverSetupManage.vue";
import UserMappingRoot from "./UserMappingRoot.vue";

const $q = useQuasar();
const { postData } = apiRequest();

const loading = ref(false);
const rows = ref([]);
const columns = ref([
  {
    name: "ddrm_name",
    required: true,
    label: "DMS Root Name",
    align: "left",
    field: "ddrm_name",
    sortable: true,
  },
  {
    name: "ddrm_desc",
    align: "center",
    label: "DMS Root Desc",
    field: "ddrm_desc",
    sortable: true,
  },
  {
    name: "ddrm_driver",
    align: "center",
    label: "DMS Root Driver",
    field: "ddrm_driver",
    sortable: true,
  },
  {
    name: "ddrm_root",
    label: "DMS Root Location",
    field: "ddrm_root",
    sortable: true,
  },
]);
const filter = ref([]);

onMounted(() => {
  getData();
});

const getData = async () => {
  loading.value = true;
  const data = await postData(
    "post",
    {
      filter: filter.value,
    },
    `dms/documentsRoots/getDataFilter`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    rows.value = data.data;
  }
};

const onClickFilter = () => {
  $q.dialog({
    component: dataFilter,
    componentProps: {
      colsData: columns.value,
      filtered: filter.value,
    },
  }).onOk(async (val) => {
    // console.log(val)
    filter.value = val;
    getData();
  });
};

const onClickManage = (data = null) => {
  $q.dialog({
    component: DriverSetupManage,
    componentProps: {
      dataEdit: data,
    },
  }).onOk(async (val) => {
    // console.log(val)
    filter.value = val;
    getData();
  });
};

const onClickMapping = (data = null) => {
  $q.dialog({
    component: UserMappingRoot,
    componentProps: {
      dataEdit: data,
    },
  }).onOk(async (val) => {
    // console.log(val)
    getData();
  });
};

const onClickInstallDiskRoot = (val) => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to install this disk Root?`,
    cancel: true,
  }).onOk(async () => {
    loading.value = true;
    const data = await postData(
      "get",
      null,
      `dms/documentsRoots/installDisk/${val}`,
      false,
      false,
      true
    );

    if (data) {
      loading.value = false;
      getData();
    }
  });
};
</script>
