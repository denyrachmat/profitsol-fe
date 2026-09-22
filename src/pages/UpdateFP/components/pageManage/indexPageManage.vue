<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <q-card-section class="q-pa-md">
        <div class="text-h6">Page Manage</div>
        <div class="text-subtitle2">Create and manage your page here.</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <q-table
              style="height: 400px"
              flat
              bordered
              :rows="rows"
              :columns="columns"
              row-key="id"
              selection="multiple"
              v-model:selected="selected"
              virtual-scroll
              v-model:pagination="pagination"
              :rows-per-page-options="[0]"
              :filter="filter"
              :loading="loading"
            >
              <template v-slot:top>
                <div
                  class="row items-center q-gutter-sm justify-end"
                  style="width: 100%"
                >
                  <div class="col-auto">
                    <q-input
                      dense
                      debounce="300"
                      v-model="filter"
                      placeholder="Search"
                      clearable
                      outlined
                      class="q-mr-md"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-auto" v-if="selected.length > 0">
                    <q-btn
                      color="negative"
                      label="Bulk Delete"
                      @click="onClickBulkDelete"
                      icon-right="delete"
                      class="q-mr-sm"
                    />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      color="primary"
                      label="Add Page"
                      @click="onClickAddPage"
                      icon-right="add"
                    />
                  </div>
                </div>
              </template>
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th auto-width>
                    <q-checkbox v-model="props.selected" />
                  </q-th>
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
              <template v-slot:body-cell-index="props">
                <q-td :props="props">
                  {{ props.row.index }}
                </q-td>
              </template>
              <template v-slot:body-cell-name="props">
                <q-td :props="props">
                  <q-icon name="description" />
                  {{ props.row.name }}
                </q-td>
              </template>

              <template v-slot:body-cell-action="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    icon="edit"
                    color="primary"
                    @click="onClickAddPage(props.row)"
                    size="sm"
                    class="q-mr-xs"
                  >
                    <q-tooltip anchor="top middle" self="bottom middle">
                      Edit Page
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    icon="content_copy"
                    color="warning"
                    @click="onClickCopyPage(props.row)"
                    size="sm"
                    class="q-mr-xs"
                  >
                    <q-tooltip anchor="top middle" self="bottom middle">
                      Copy Page
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    @click="onClickDeletePage(props.row)"
                    size="sm"
                  >
                    <q-tooltip anchor="top middle" self="bottom middle">
                      Delete Page
                    </q-tooltip>
                  </q-btn>
                </q-td>
              </template>
              <template v-slot:body-cell-is_main="props">
                <q-td :props="props">
                  <q-toggle
                    v-model="props.row.is_main"
                    color="primary"
                    @update:model-value="
                      (value) => onUpdateMainPage(props.row.id, value)
                    "
                    :true-value="'1'"
                    :false-value="'0'"
                  />
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

import formDialog from "./formCreatorDialog.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const { postData } = apiRequest();

onMounted(() => {
  getData();
});

const $q = useQuasar();
const rows = ref([{ cfmt_title: "Page 1", desc: "Description for Page 1" }]);
const selected = ref([]);
const columns = ref([
  { name: "id", label: "ID", field: "id", align: "left" },
  { name: "cfmt_title", label: "Name", field: "cfmt_title", align: "left" },
  { name: "url", label: "URL", field: "url", align: "left" },
  {
    name: "desc",
    label: "Description",
    field: "desc",
    align: "left",
  },
  { name: "action", label: "Action", field: "action", align: "left" },
  { name: "is_main", label: "Is Main Page", field: "is_main", align: "left" },
]);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: "index",
  descending: false,
  rowsNumber: rows.value.length,
});
const loading = ref(false);

const onClickAddPage = (item) => {
  $q.dialog({
    component: formDialog,
    componentProps: {
      idForm: item ? item.id : null,
    },
    transitionShow: "slide-up",
    transitionHide: "slide-down",
    persistent: true,
  }).onDismiss(() => {
    getData();
  });
};

const getData = async () => {
  loading.value = true;
  const response = await postData("get", null, "cms/forms/page");
  if (response) {
    console.log("Data fetched successfully:", response);
    rows.value = response;
    loading.value = false;
  } else {
    console.error("Error fetching data");
    loading.value = false;
  }
};

const onUpdateMainPage = (id, val) => {
  $q.dialog({
    title: "Update Main Page",
    message: "Are you sure you set this as the main page?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const response = await postData(
      "put",
      null,
      `fpmanager/updateMainPage/${id}/${val}`
    );
    if (response) {
      $q.notify({
        type: "positive",
        message: "Main page updated successfully",
      });
      getData();
    } else {
      $q.notify({
        type: "negative",
        message: "Failed to update main page",
      });
    }
  });
};

const onClickCopyPage = (row) => {
  $q.dialog({
    title: "Copy Page",
    message: `Are you sure you want to copy "${row.cfmt_title}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    try {
      const response = await postData(
        "post",
        {
          id: row.id,
          title: `${row.cfmt_title} (Copy)`,
        },
        "cms/cloneForm"
      );
      if (response && response.status) {
        $q.notify({
          type: "positive",
          message: response.message || "Page copied successfully",
        });
        selected.value = [];
        getData();
      } else {
        $q.notify({
          type: "negative",
          message: "Failed to copy page",
        });
      }
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to copy page",
      });
    } finally {
      loading.value = false;
    }
  });
};

const onClickDeletePage = (row) => {
  $q.dialog({
    title: "Delete Page",
    message: `Are you sure you want to delete "${row.cfmt_title}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    try {
      const response = await postData("delete", null, `cms/forms/${row.id}`);
      if (response) {
        $q.notify({
          type: "positive",
          message: "Page deleted successfully",
        });
        selected.value = [];
        getData();
      } else {
        $q.notify({
          type: "negative",
          message: "Failed to delete page",
        });
      }
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to delete page",
      });
    } finally {
      loading.value = false;
    }
  });
};

const onClickBulkDelete = () => {
  $q.dialog({
    title: "Bulk Delete Pages",
    message: `Are you sure you want to delete ${selected.value.length} selected page(s)?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    try {
      const results = await Promise.all(
        selected.value.map((row) =>
          postData("delete", null, `cms/forms/${row.id}`)
        )
      );
      const failed = results.filter((r) => !r).length;
      if (failed) {
        $q.notify({
          type: "warning",
          message: `${selected.value.length - failed} page(s) deleted, ${failed} failed`,
        });
      } else {
        $q.notify({
          type: "positive",
          message: "Selected pages deleted successfully",
        });
      }
      selected.value = [];
      getData();
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to delete pages",
      });
    } finally {
      loading.value = false;
    }
  });
};
</script>
