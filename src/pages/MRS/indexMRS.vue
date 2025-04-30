<template>
  <div class="q-pa-md">
    <div class="row q-pb-md">
      <div class="col text-right">
        <q-btn-group push>
          <q-btn
            label="Create New"
            color="primary"
            @click="addNewReport"
          ></q-btn>
          <q-btn-dropdown color="teal" label="Settings">
            <q-list>
              <q-item clickable v-close-popup>
                <q-item-section @click="addConnButtonAction">
                  <q-item-label>Add Connection</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section @click="listConnButtonAction">
                  <q-item-label>List Connection</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-btn-group>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <q-table
          title="List Report"
          :rows="rows"
          :columns="columns"
          row-key="mrm_name"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="mrm_name" :props="props">
                {{ props.row.mrm_name }}
              </q-td>
              <q-td key="mrm_url_gen" :props="props">
                {{ props.row.mrm_url_gen }}
              </q-td>
              <q-td key="mdm_host" :props="props">
                {{ props.row.mdm_host }}
              </q-td>
              <q-td key="mrm_db" :props="props">
                {{ props.row.mrm_db }}
              </q-td>
              <q-td key="created_at" :props="props">
                {{
                  date.formatDate(props.row.created_at, "YYYY-MM-DD HH:mm:ss")
                }}
              </q-td>
              <q-td key="action" :props="props">
                <q-btn-group outline>
                  <q-btn
                    icon="edit"
                    color="orange"
                    outline
                    @click="onEditreport(props.row)"
                  >
                    <q-tooltip> Edit your report </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="visibility"
                    color="cyan"
                    outline
                    @click="viewReportAction(props.row.id, props.row.mrm_name)"
                  >
                    <q-tooltip> View Report </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="tab"
                    color="indigo"
                    outline
                    @click="onOpenNewTab(props.row.id)"
                  >
                    <q-tooltip> Open in new tab </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="settings"
                    color="indigo"
                    outline
                    @click="onManageReport(props.row.id)"
                  >
                    <q-tooltip> Manage Report </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="delete"
                    color="red"
                    outline
                    @click="onDelete(props.row.id)"
                  >
                    <q-tooltip> Delete Report </q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import { date } from "quasar";

import addConnectionAction from "./addConnection.vue";
import addReportAction from "./addReport.vue";
import viewReport from "./ActionReport/viewReport.vue";
import manageReport from "./manageReport.vue";

const $q = useQuasar();
const { postData } = apiRequest();

const rows = ref([]);
const columns = ref([
  {
    name: "mrm_name",
    align: "center",
    label: "Report Name",
    field: "mrm_name",
    sortable: true,
  },
  {
    name: "mrm_url_gen",
    align: "center",
    label: "Report Origin",
    field: "mrm_url_gen",
    sortable: true,
  },
  {
    name: "mdm_host",
    align: "center",
    label: "Report Host",
    field: "mdm_host",
    sortable: true,
  },
  {
    name: "mrm_db",
    align: "center",
    label: "Report DB",
    field: "mrm_db",
    sortable: true,
  },
  {
    name: "created_at",
    align: "center",
    label: "Created At",
    field: "created_at",
    sortable: true,
  },
  {
    name: "action",
    align: "center",
    label: "Action",
    sortable: true,
  },
]);

onMounted(() => {
  getDatanya();
});

const addConnButtonAction = () => {
  $q.dialog({
    component: addConnectionAction,
  }).onOk(async (val) => {
    console.log(val);
  });
};

const addNewReport = () => {
  $q.dialog({
    component: addReportAction,
  }).onOk(async (val) => {
    console.log(val);
  });
};

const getDatanya = async () => {
  const data = await postData("get", null, `mrs/report`, false, false, true);

  if (data.status) {
    rows.value = data.data;
    console.log(data);
  }
};

const viewReportAction = (id, title) => {
  console.log([id, title]);
  $q.dialog({
    component: viewReport,
    componentProps: {
      idReport: id,
      TableTitle: title,
    },
  }).onOk(async (val) => {
    console.log(val);
  });
};

const onEditreport = (valData) => {
  $q.dialog({
    component: addReportAction,
    componentProps: {
      dataEdit: valData,
    },
  }).onOk(async (val) => {
    console.log(val);
  });
};

const onOpenNewTab = (id) => {
  $q.dialog({
    title: "Open separated tab",
    message: "Are you sure want to open this report in new tab ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    window.open(window.location.origin + "#/mrsReport/" + id, "_blank").focus();
  });
};

const onDelete = (id) => {
  $q.dialog({
    title: "Delete report",
    message: "Are you sure want to remove this report ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const data = await postData(
      "delete",
      null,
      `mrs/report/${id}`,
      false,
      false,
      true
    );

    if (data.status) {
      getDatanya();
    }
  });
};

const onManageReport = (data) => {
  $q.dialog({
    component: manageReport,
    componentProps: {
      data: data,
    },
  }).onOk(async () => {});
};
</script>
