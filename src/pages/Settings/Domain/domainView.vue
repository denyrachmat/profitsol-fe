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
                  icon="delete"
                  @click="deleteData(props.row.id)"
                >
                  <q-tooltip> Delete </q-tooltip>
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
import { date, useDialogPluginComponent, useQuasar } from "quasar";
import { api } from "src/boot/axios";
import dataFilter from "./dataFilter.vue";
import { useRoute } from "vue-router";
import DomainManage from "./domainManage.vue";
import apiRequest from "src/components/apiRequest";

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

onMounted(() => {
  getData();
});

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
    // console.log(val)
    filter.value = val;
    getData();
  });
};

const onClickSend = () => {
  $q.dialog({
    title: "Confirmation",
    message: `Are you sure want to send all unapprove data ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    const datanya = await api
      .post(process.env.API + `div/log/HSCodeSendApproval`, {
        username: route.params.username,
        data: listData.value,
      })
      .then((val) => {
        loading.value = false;
        $q.notify({
          color: "green",
          message: "Success",
        });

        return val.data;
      })
      .catch((e) => {
        loading.value = false;
      });
  });
};
</script>
