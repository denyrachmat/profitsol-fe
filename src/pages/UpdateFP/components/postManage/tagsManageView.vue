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
        <div class="text-h6">
          {{ modes !== 2 ? "Category Manage" : "Choose Category" }}
        </div>
        <div class="text-subtitle2">
          {{
            modes !== 2
              ? "Create and manage your categories here."
              : "Choose categories that you want."
          }}
        </div>
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
              row-key="index"
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
                  <div class="col-auto" v-if="props.mode !== 2">
                    <q-btn
                      color="primary"
                      label="Add New Category"
                      @click="onClickAddTags"
                      icon-right="add"
                      :loading="loading"
                    />
                  </div>
                </div>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" @click="onRowClick(props.row)">
                  <q-td
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    <span v-if="col.name !== 'tags' && col.name !== 'action'">
                      {{ props.row[col.field] }}
                    </span>

                    <template v-if="col.name === 'action' && modes !== 2">
                      <q-btn
                        flat
                        round
                        icon="edit"
                        :color="
                          props.row.creator === authStore.authDet.username ||
                          authStore.getChoosedRole.role.id === 1
                            ? 'primary'
                            : 'grey-6'
                        "
                        @click="onClickAddTags(props.row)"
                        size="sm"
                        class="q-mr-xs"
                        :disable="
                          props.row.creator !== authStore.authDet.username &&
                          authStore.getChoosedRole.role.id !== 1
                        "
                      />
                      <q-btn
                        flat
                        round
                        icon="delete"
                        :color="
                          props.row.creator === authStore.authDet.username ||
                          authStore.getChoosedRole.role.id === 1
                            ? 'red'
                            : 'grey-6'
                        "
                        @click="onClickDeleteTags(props.row.name)"
                        size="sm"
                        :disable="
                          props.row.creator !== authStore.authDet.username &&
                          authStore.getChoosedRole.role.id !== 1
                        "
                      />
                    </template>
                  </q-td>
                  <slot name="body-cell-tags" :props="props" />
                  <slot name="body-cell-is_main" :props="props" />
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import multiplePromptDialog from "src/components/multiplePromptDialog.vue";

import { useAuthStore } from "src/stores/authStore";

const authStore = useAuthStore();
const $q = useQuasar();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  mode: Number,
});

const modes = ref(props.mode || 1);
const rows = ref([]);
const columns = ref([
  { name: "name", label: "Name", field: "name" },
  { name: "desc", label: "Description", field: "desc" },
  { name: "slug", label: "Slug", field: "slug" },
  { name: "creator", label: "Creator", field: "creator" },
  { name: "action", label: "Action", field: "action" },
]);
const loading = ref(false);

const { postData } = apiRequest();

onMounted(() => {
  getData();
});

const getData = async () => {
  loading.value = true;
  try {
    const response = await postData(
      "post",
      {
        filter: [],
        selectAs: {
          name: "pgm_value|string",
          slug: "pgm_value2|string",
          desc: "pgm_desc|string",
          creator: "pgm_created_by|string",
        },
      },
      `portal/gencode/showDetail/FP_POST_TAGS`,
      false,
      false,
      true
    );

    console.log("Response Data:", response);
    if (response.data) {
      loading.value = false;
      rows.value = response.data;
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to fetch categories",
    });
  }
};

const onClickAddTags = async (row) => {
  $q.dialog({
    component: multiplePromptDialog,
    componentProps: {
      title: "User Details",
      initialFields: [
        {
          name: "name",
          label: "Category Name",
          type: "text",
          default: row ? row.name : "",
          rules: [
            (val) => !!val || "Field is required",
            (val) =>
              /^[A-Za-z0-9]+$/.test(val) ||
              "No spaces or special characters allowed",
          ],
        },
        {
          name: "slug",
          label: "Slug",
          type: "text",
          default: row ? row.slug : "",
          rules: [
            (val) =>
              /^[a-z0-9-]+$/.test(val) ||
              "Only lowercase letters, numbers, and hyphens allowed",
          ],
        },
        {
          name: "desc",
          label: "Description",
          type: "text",
          default: row ? row.desc : "",
        },
      ],
      addable: true,
      removable: true,
    },
  }).onOk(async (payload) => {
    loading.value = true;
    try {
      const response = await postData(
        "post",
        {
          pgm_code: "FP_POST_TAGS",
          pgm_value: payload.name,
          pgm_value2: payload.slug,
          pgm_desc: payload.desc || "",
        },
        `portal/gencode`,
        false,
        false,
        true
      );
      if (response.status) {
        $q.notify({
          type: "positive",
          message: "Category added successfully",
        });
        await getData();
      } else {
        $q.notify({
          type: "negative",
          message: "Failed to add category",
        });
      }
    } finally {
      loading.value = false;
    }
  });
};

const onClickDeleteTags = async (id) => {
  $q.dialog({
    title: "Delete Category",
    message: "Are you sure you want to delete this category?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    try {
      const response = await postData(
        "post",
        {
          filter: [
            {
              column: "pgm_value",
              operator: "=",
              value: id,
            },
          ],
        },
        `portal/gencode/deleteDetail/FP_POST_TAGS`,
        false,
        false,
        true
      );
      if (response.status) {
        $q.notify({
          type: "positive",
          message: "Category deleted successfully",
        });
        await getData();
      } else {
        $q.notify({
          type: "negative",
          message: "Failed to delete category",
        });
      }
    } finally {
      loading.value = false;
    }
  });
};
</script>
<!-- Ensure all template tags are properly closed above this line -->
