<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          title="RPA Server List"
          dense
          class="my-sticky-header-column-table"
          :loading="loading"
        >
          <template v-slot:top-right>
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

            <div class="q-pl-sm">
              <q-btn color="primary" icon="add" @click="onOpenRPASetupDialog">
                <q-tooltip>Add RPA Server</q-tooltip>
              </q-btn>
            </div>
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
                  v-model="props.row.prm_isactive"
                  @update:model-value="
                    (value) => fetchRPAData() // Update the data after toggle
                  "
                />
              </q-td>
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.value }}
              </q-td>
              <q-td auto-width>
                <q-btn
                  color="orange"
                  icon="edit"
                  flat
                  @click="onOpenRPASetupDialog(props.row)"
                >
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn
                  color="negative"
                  icon="delete"
                  flat
                  @click="() => fetchRPAData()"
                >
                  <q-tooltip>Delete</q-tooltip>
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
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";

import RPASetupManage from "./RPASetupManage.vue";

const { postData } = apiRequest();

const $q = useQuasar();
const loading = ref(false);
const filterData = ref("");
const rows = ref([]);
const columns = ref([
  {
    name: "prm_type",
    label: "Type",
    field: "prm_type",
    align: "left",
    sortable: true,
  },
  {
    name: "prm_host",
    label: "Host / Command",
    field: "prm_host",
    align: "left",
    sortable: true,
  },
  {
    name: "prm_port",
    label: "Port",
    field: "prm_port",
    align: "left",
    sortable: true,
  },
  {
    name: "prm_isactive",
    label: "Is Active",
    field: (row) => Boolean(Number(row.prm_isactive)),
    align: "left",
    sortable: true,
  },
  {
    name: "prm_desc",
    label: "Description",
    field: "prm_desc",
    align: "left",
    sortable: true,
  },
]);

onMounted(() => {
  fetchRPAData();
});

const onOpenRPASetupDialog = (dataEdit) => {
  $q.dialog({
    component: RPASetupManage,
    componentProps: {
      dataEdit: dataEdit || null, // Pass null for new setup
    },
    persistent: true,
    transitionShow: "slide-up",
    transitionHide: "slide-down",
  })
    .onOk(() => {
      // Handle OK action
      console.log("Dialog OK clicked");
      fetchRPAData();
    })
    .onCancel(() => {
      // Handle Cancel action
      console.log("Dialog Cancel clicked");
      fetchRPAData();
    });
};

const fetchRPAData = async () => {
  const authStore = useAuthStore();
  loading.value = true;
  const data = await postData("get", null, `rpa/rpaMaster`, false, false, true);
  if (data) {
    rows.value = data;
    loading.value = false;
  }
};
</script>
