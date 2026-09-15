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
          row-key="id"
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

          <!-- For body with full row progress bar -->
          <template v-slot:body="props">
            <q-tr :props="props" class="progress-row">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.value }}
              </q-td>
              <q-td auto-width class="text-center">
                <span v-if="props.row.percent < 100">
                  {{ props.row.percent }}%
                </span>
                <q-icon
                  v-else
                  name="done_all"
                  size="15px"
                  color="cyan"
                ></q-icon>
              </q-td>
              <q-linear-progress
                :value="props.row.percent / 100"
                color="primary"
                track-color="grey-3"
                height="100%"
                class="full-row-progress"
              />
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
const formatKeys = (row) => {
  const dk = row.dataKey || {};
  const parts = [];
  if (dk.form_id) parts.push(`Form #${dk.form_id} • Batch ${dk.batch_id || "-"}`);
  const cmsVals = Object.entries(dk)
    .filter(([k]) => k.startsWith("CMS_REPORT_") && !k.includes("_POS") && !k.includes("_VAL") && !["form_id", "batch_id", "progress", "progress_detail", "created_by", "created_at", "prh_id", "prh_flag"].includes(k))
    .map(([, v]) => String(v ?? "").trim())
    .filter(Boolean);
  if (cmsVals.length) parts.push(cmsVals.join(" | "));
  if (dk.created_by) parts.push(`by ${dk.created_by}`);
  return parts.join(" — ") || JSON.stringify(dk);
};
const columns = ref([
  {
    name: "approval_title",
    label: "Title",
    field: (row) => row.master.ams_title,
    sortable: true,
    align: "left",
    style: "max-width:220px; white-space:normal; word-break:break-word",
  },
  {
    name: "approval_keys",
    label: "Leave / Keys",
    field: (row) => formatKeys(row),
    sortable: true,
    align: "left",
    style: "max-width:380px; white-space:normal; word-break:break-word",
  },
  {
    name: "approver",
    label: "Approver",
    field: (row) => row.data?.amshd_username_apprv || row.mapdet?.amsmd_username || "-",
    sortable: true,
    align: "left",
  },
  {
    name: "remarks",
    label: "Remarks",
    field: (row) => row.data?.amshd_remarks || "-",
    sortable: false,
    align: "left",
    style: "max-width:200px; white-space:normal",
  },
  {
    name: "created_at",
    label: "Created",
    field: (row) => date.formatDate(row.created_at, "D MMM YYYY HH:mm"),
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
<style>
.progress-row {
  position: relative;
  overflow: hidden;
}

.full-row-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
}

.progress-row q-td,
.progress-row q-th {
  position: relative;
  z-index: 2;
}
</style>
