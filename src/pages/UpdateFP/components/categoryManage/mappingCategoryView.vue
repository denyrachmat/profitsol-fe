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
        <div class="row">
          <div class="col">
            <div class="text-h6">Mapping Category</div>
            <div class="text-subtitle2">Mapping your categories here.</div>
          </div>
          <div class="col text-right"></div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-md">
        <q-table
          style="height: 400px"
          flat
          bordered
          :rows="rows"
          :columns="columns"
          row-key="index"
          virtual-scroll
          :loading="loading"
        >
          <template v-slot:top>
            <div
              class="row items-center q-gutter-sm justify-end"
              style="width: 100%"
            >
              <div class="col-auto">
                <q-btn
                  color="primary"
                  label="Mapping Category"
                  @click="onClickAddCategory"
                  icon-right="add"
                  :loading="loading"
                />
              </div>
            </div>
          </template>

          <template v-slot:body-cell-email="props">
            <q-td :props="props">
              <q-btn outline dense color="primary" :label="`View Emails`">
                <q-badge color="red" floating>{{
                  props.row.email?.length || 0
                }}</q-badge>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell-category="props">
            <q-td :props="props">
              <q-btn outline dense color="primary" :label="`View Categories`">
                <q-badge color="red" floating>{{
                  props.row.category?.length || 0
                }}</q-badge>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell-action="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                color="primary"
                icon="edit"
                @click="onClickEdit(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="delete"
                @click="onClickDelete(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import mappingCategoryManage from "./mappingCategoryManage.vue";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();

const $q = useQuasar();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  mode: Number,
});

onMounted(() => {
  getListMappingCategory();
});

const modes = ref(props.mode || 1);
const rows = ref([]);
const columns = ref([
  { name: "idx", label: "ID Mapping", field: "idx", align: "left" },
  { name: "name", label: "Description", field: "name", align: "left" },
  {
    name: "email",
    label: "Email",
    field: "email",
    format: (val) => val,
    slot: true,
    align: "center",
  },
  {
    name: "category",
    label: "Category",
    field: "category",
    format: (val) => val,
    slot: true,
    align: "center",
  },
  {
    name: "action",
    label: "Action",
    field: "action",
    slot: true,
    align: "center",
  },
]);
const loading = ref(false);

const getListMappingCategory = async () => {
  loading.value = true;

  try {
    const { data } = await postData(
      "post",
      {
        id: "FP_CATEGORY_MAPPING",
        selectAs: {
          idx: "pgm_value|string",
          email: "pgm_value3|array|grouped",
          category: "pgm_value2|array|grouped",
          name: "pgm_desc|string",
        },
      },
      `portal/gencode/showDetail/FP_CATEGORY_MAPPING`,
      false,
      false,
      true
    );

    if (data) {
      console.log(data);
      rows.value = data;
      // subscribers.value = data;
    }
  } finally {
    loading.value = false;
  }
};

const onClickAddCategory = () => {
  $q.dialog({
    component: mappingCategoryManage,
    persistent: true,
    width: "600px",
  }).onOk(() => {
    getListMappingCategory();
  });
};

const onClickEdit = (row) => {
  $q.dialog({
    component: mappingCategoryManage,
    persistent: true,
    width: "600px",
    componentProps: {
      title: row.name,
      users: row.email,
      categories: row.category,
    },
  }).onOk(() => {
    getListMappingCategory();
  });
};
</script>
