<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col text-center text-h4">Label Print Templates</div>
    </div>
    <div class="row q-py-md">
      <div class="col">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          title="List of Label Templates"
          :filter="filterData"
          dense
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
            <q-btn color="green" icon="add" outline @click="onEditLabel()" />
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="name" :props="props">{{ props.row.name }}</q-td>
              <q-td key="language" :props="props">
                {{ props.row.language }}
              </q-td>
              <q-td key="description" :props="props">
                {{ props.row.description }}
              </q-td>
              <q-td key="action" :props="props">
                <q-btn-group spread rounded>
                  <q-btn
                    color="green"
                    icon="edit"
                    dense
                    @click="onEditLabel(props.row)"
                  />
                  <q-btn
                    color="red"
                    icon="delete"
                    dense
                    @click="onDelete(props.row)"
                  />
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
import { ref, onMounted } from "vue";
import apiRequest from "src/components/apiRequest";
import editLabel from "./editLabel.vue";
import { useQuasar } from "quasar";

const $q = useQuasar();
const { postData } = apiRequest();

const rows = ref([]);
const filterData = ref("");
const columns = ref([
  {
    name: "name",
    align: "center",
    label: "Name",
    field: "name",
    sortable: true,
  },
  {
    name: "language",
    align: "center",
    label: "Language",
    field: "language",
    sortable: true,
  },
  {
    name: "description",
    align: "center",
    label: "Description",
    field: "description",
  },
  { name: "action", align: "center", label: "Actions", field: "id" },
]);

onMounted(() => {
  getData();
});

const getData = async () => {
  const res = await postData("get", null, "labelManager", false, false, true);
  rows.value = res?.data || [];
};

const resolveRowId = (row) => row?.id ?? row?.ID ?? row?._id ?? row?.pk ?? null;

const onEditLabel = (data = null) => {
  const originalId = resolveRowId(data);
  $q.dialog({
    component: editLabel,
    componentProps: {
      isUpdate: !!data,
      dataProps: data,
    },
  }).onOk(async (val) => {
    // val.value.id may be null if editLabel.vue didn't map ID correctly, fallback to original
    const dialogId = val.value?.id ?? val.value?.ID ?? null;
    const effectiveId = dialogId ?? originalId;
    const isUpdate = !!effectiveId;
    const payload = {
      ...(isUpdate ? { id: effectiveId } : {}),
      name: val.value.name,
      language: val.value.language,
      description: val.value.description,
      template: val.value.template,
      config: val.value.config,
    };
    // Backend may expect PATCH or PUT - try PATCH first, fallback to PUT on failure
    let res = null;
    if (isUpdate) {
      res = await postData("patch", payload, `labelManager/${effectiveId}`, false, false, true);
      if (!res?.status) {
        // fallback to PUT if PATCH not supported
        res = await postData("put", payload, `labelManager/${effectiveId}`, false, false, true);
      }
    } else {
      res = await postData("post", payload, "labelManager", false, false, true);
    }
    if (res?.status) {
      $q.notify({ type: "positive", message: res.message || "Saved" });
      getData();
    } else if (res === false) {
      // postData returns false on error and already notified via apiRequest
      console.warn("Save failed, response false", payload);
    }
  });
};

const onDelete = (row) => {
  const delId = resolveRowId(row);
  if (!delId) {
    $q.notify({ type: "negative", message: "Cannot delete: missing id" });
    return;
  }
  $q.dialog({
    title: "Confirm Delete",
    message: `Delete template "${row.name}"?`,
    persistent: true,
    cancel: true,
    color: "negative",
  }).onOk(async () => {
    const res = await postData("delete", null, `labelManager/${delId}`, false, false, true);
    if (res?.status) {
      $q.notify({ type: "positive", message: "Deleted" });
      getData();
    } else if (res === false) {
      console.warn("Delete failed for id", delId);
    }
  });
};
</script>
