<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col text-center text-h4">Domain Setup</div>
    </div>
    <div class="row q-py-md">
      <div class="col">
        <q-table
          flat
          bordered
          :rows="listData"
          :columns="columns"
          row-key="id"
          color="amber"
          :loading="loading"
          title="Domain List"
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
            <q-btn
              flat
              icon="add"
              color="primary"
              @click="onClickAdd()"
              :loading="loading"
            >
              <q-tooltip>Send All Unapprove HS Code</q-tooltip>
            </q-btn>
          </template>
          <!-- For header -->
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
                  @click="editData(props.row)"
                >
                  <q-tooltip> Edit Domain </q-tooltip>
                </q-btn>
                <q-btn
                  color="red"
                  flat
                  dense
                  icon="delete"
                  @click="deleteData(props.row.id)"
                >
                  <q-tooltip> Delete </q-tooltip>
                </q-btn>
                <q-btn
                  :color="getStatusDB(props.row.checkCoreDB).colors"
                  flat
                  dense
                  icon="download_done"
                  @click="installData(props.row.id)"
                  :disable="getStatusDB(props.row.checkCoreDB).status"
                >
                  <q-tooltip>
                    {{ getStatusDB(props.row.checkCoreDB).message }}
                  </q-tooltip>
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
import { colors, date, useDialogPluginComponent, useQuasar } from "quasar";
import { api } from "src/boot/axios";
import dataFilter from "./dataFilter.vue";
import { useRoute } from "vue-router";
import DomainManage from "./domainManage.vue";
import apiRequest from "src/components/apiRequest";
import { socket } from "src/boot/socket";

const { postData } = apiRequest();
const $q = useQuasar();
const route = useRoute();

const listData = ref([]);
const columns = ref([
  {
    name: "pd_name",
    label: "Domain Name",
    field: "pd_name",
    sortable: true,
    align: "left",
  },
  {
    name: "pd_desc",
    label: "Domain Desc",
    field: "pd_desc",
    sortable: true,
    align: "left",
  },
  {
    name: "pd_prefix_db",
    label: "Domain Prefix",
    field: "pd_prefix_db",
    sortable: true,
    align: "left",
  },
]);
const loading = ref(false);
const filter = ref([]);

socket.on("server-stxi", (data) => {
  if (data.app == "domain") {
    $q.notify({
      type: data.type,
      message: data.message,
      position: "top",
      timeout: 3000,
    });
    getData();
  }
});

onMounted(() => {
  getData();
});

const getStatusDB = (data) => {
  let checkFailedDB = data.filter((fil) => !fil.status);

  return {
    colors:
      checkFailedDB.length > data.length
        ? "orange"
        : checkFailedDB.length === 0
        ? "grey"
        : "red",
    status: checkFailedDB.length === 0,
    message:
      checkFailedDB.length > data.length
        ? "Some Core DB not created yet"
        : checkFailedDB.length === 0
        ? "All Core DB Already created"
        : "All Core DB not created yet",
  };
};

const onClickAdd = () => {
  $q.dialog({
    component: DomainManage,
    // persistent: true,
  }).onOk(async (val) => {
    getData();
  });
};

const getData = async () => {
  let hasil = await postData("get", null, "domain", false, true);

  if (hasil) {
    listData.value = [];
    hasil.data.map((val) => {
      listData.value.push(val);
    });
  }
};

const deleteData = (id) => {
  $q.dialog({
    title: "Confirmation",
    message: `Are you sure want to delete this data ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    api
      .delete(`div/log/HSCode/${id}`)
      .then((val) => {
        getData();
        loading.value = false;
      })
      .catch((e) => {
        loading.value = false;
      });
  });
};

const onClickFilter = () => {
  $q.dialog({
    component: dataFilter,
    componentProps: {
      colsData: columns.value,
      filtered: filter.value,
    },
  }).onOk(async (val) => {
    console.log(val);
    filter.value = val;
    getData();
  });
};

const editData = (val) => {
  $q.dialog({
    component: DomainManage,
    componentProps: {
      dataEdit: val,
    },
    // persistent: true,
  }).onOk(async (val) => {
    console.log(val);

    let hasil = await postData(
      "put",
      val,
      `domain/${val.id}`,
      false,
      true,
      false,
      null,
      false,
      true
    );

    if (hasil) {
      getData();
    }
  });
};

const submitData = () => {};
</script>
