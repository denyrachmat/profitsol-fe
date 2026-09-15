<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      title="Approval List"
      :rows="rows"
      :columns="columns"
      row-key="id"
      :filter="filter"
      :loading="loading"
    >
      <template v-slot:top-right>
        <div class="q-pr-sm">
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
        </div>
        <q-btn
          icon="settings"
          flat
          color="primary"
          @click="openMappingMaintenance"
        >
          <q-tooltip>Approval Mapping Maintenance</q-tooltip>
        </q-btn>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width>Is Active ?</q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
          <q-th auto-width>Action</q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-toggle
              v-model="props.row.ams_active"
              false-value="0"
              true-value="1"
              @update:model-value="
                (value, evt) => onChangeActive(props.row, value)
              "
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
          <q-td auto-width>
            <q-btn
              color="orange"
              flat
              dense
              icon="edit"
              @click="openMappingMaintenance(props.row)"
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
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed, watch, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";

import addApprovalMapping from "./addApprovalMapping.vue";

const $q = useQuasar();
const { postData } = apiRequest();

const listData = ref([]);
const choosedData = ref(null);
const approvalName = ref("");
const loading = ref(false);
const rows = ref([]);
const columns = ref([
  {
    name: "ams_idapv",
    required: true,
    label: "ID Approval",
    align: "left",
    field: "ams_idapv",
    sortable: true,
  },
  {
    name: "ams_title",
    align: "center",
    label: "Approval Title",
    field: "ams_title",
    sortable: true,
  },
  {
    name: "created_at",
    label: "Created At",
    field: "created_at",
    sortable: true,
  },
]);
const filter = ref("");

onMounted(() => {
  getData();
});

const getData = async () => {
  loading.value = true;
  const data = await postData("get", null, `ams/approval`, false, false, true);

  if (data) {
    loading.value = false;
    rows.value = data;
  }
};

const openMappingMaintenance = (datas = null) => {
  $q.dialog({
    component: addApprovalMapping,
    componentProps: {
      dataUpdated: datas,
    },
  })
    .onOk(async (val) => {
      getData();
    })
    .onDismiss(() => {
      getData();
    });
};

const deleteData = (id) => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to delete this approval ? This action cannot reversed !`,
    cancel: true,
  }).onOk(async () => {
    loading.value = true;
    const data = await postData(
      "delete",
      null,
      `ams/approval/${id}`,
      false,
      false,
      true
    );

    if (data) {
      getData();
    }
  });
};

const onChangeActive = async (datas, val) => {
  loading.value = true;
  const data = await postData(
    "patch",
    {
      updateHead: {
        ams_active: val,
      },
      det: datas.det,
    },
    `ams/approval/${datas.id}`,
    false,
    false,
    true
  );

  if (data) {
    getData();
  }
};
</script>
