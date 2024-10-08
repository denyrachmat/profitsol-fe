<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col text-right">
        <q-btn-group outline>
          <q-btn outline icon="download" color="green" @click="onClickDownload">
            <q-tooltip>Approval & Notification History</q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </div>

    <div class="row q-pt-md">
      <div class="col">
        <q-table
          flat
          bordered
          :rows="listData"
          :columns="columns"
          row-key="YSPDT_INVNO"
          color="amber"
          :loading="loading"
          title="Approval & Notification History"
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
          <!-- For header -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
              <q-th auto-width> Progress Approval </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.value }}
              </q-td>
              <q-td auto-width>
                <q-circular-progress
                  show-value
                  font-size="12px"
                  :value="props.row.percent"
                  size="35px"
                  :thickness="0.22"
                  color="teal"
                  track-color="grey-3"
                  class="q-ma-md"
                >
                  {{ props.row.percent }}%
                </q-circular-progress>
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
import dataFilter from "./dataFilter.vue";
import { useRoute } from "vue-router";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "stores/authStore";

const $q = useQuasar();
const route = useRoute();
const { postData } = apiRequest();
const store = useAuthStore();

const listData = ref([]);
const columns = ref([
  {
    name: "amstd_token",
    label: "Token Approval",
    field: "amstd_token",
    sortable: true,
    align: "left",
  },
  {
    name: "approval_keys",
    label: "Keys Value",
    field: (row) =>
      JSON.parse(row.amshd_paramstore).data &&
      JSON.parse(row.amshd_paramstore).key
        ? JSON.parse(row.amshd_paramstore).data[
            JSON.parse(row.amshd_paramstore).key
          ]
        : Object.values(JSON.parse(row.amshd_paramstore).data)[0],
    sortable: true,
    align: "left",
  },
  {
    name: "created_at",
    label: "Created Date",
    field: "created_at",
    sortable: true,
    align: "left",
  },
]);
const loading = ref(false);
const filter = ref([]);

onMounted(() => {
  getData();
});

const getData = async () => {
  loading.value = true;

  const data = await postData(
    "post",
    {
      filter: [
        ...filter.value,
        {
          cols: "p_u_username",
          param: "=",
          value: store.authDet.username,
        },
        {
          cols: "amshd_stat",
          param: "=",
          value: "sent",
        },
      ],
    },
    `ams/viewListSentApproval`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    listData.value = data.data;
  } else {
    loading.value = false;
  }
};

const deleteData = (id) => {
  $q.dialog({
    title: "Confirmation",
    message: `Are you sure want to delete this data ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    // loading.value = true;
    // api
    //   .delete(`div/log/HSCode/${id}`)
    //   .then((val) => {
    //     getData();
    //     loading.value = false;
    //   })
    //   .catch((e) => {
    //     loading.value = false;
    //   });
  });
};

const onClickDownload = (id) => {
  $q.dialog({
    title: "Confirmation",
    message: `Are you sure want to download all this data ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    // loading.value = true;
    // const datanya = await api
    //   .post(process.env.API + `div/log/exportData`, {
    //     filter: [
    //       ...filter.value,
    //       {
    //         cols: "HSCD_APRVSTAT",
    //         param: "=",
    //         value: "1",
    //       },
    //     ],
    //   })
    //   .then((val) => {
    //     $q.notify({
    //       color: "green",
    //       message: "Success",
    //     });
    //     return val.data;
    //   })
    //   .catch((e) => {
    //     loading.value = false;
    //   });
    // if (datanya) {
    //   loading.value = false;
    //   console.log(datanya);
    //   window.open(process.env.API_DOWNLOAD + datanya, "_blank").focus();
    //   console.log(datanya);
    // }
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
</script>
