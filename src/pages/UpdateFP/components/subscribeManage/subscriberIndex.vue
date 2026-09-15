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
        <div class="text-h6">Subscribe</div>
        <div class="text-subtitle2">Setting your frontpage here</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Search and Filters -->
            <div class="col-12">
              <q-card class="q-pa-md">
                <div class="row q-gutter-sm items-center">
                  <q-input
                    v-model="searchText"
                    outlined
                    dense
                    placeholder="Search subscribers..."
                    class="col-md-4 col-sm-6 col-xs-12"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                  <q-select
                    v-model="statusFilter"
                    :options="statusOptions"
                    outlined
                    dense
                    placeholder="Status"
                    class="col-md-2 col-sm-3 col-xs-12"
                  />
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Add Subscriber"
                    @click="onClickAddSubscriber()"
                    :loading="loading"
                  />
                </div>
              </q-card>
            </div>

            <!-- Subscribers Table -->
            <div class="col-12">
              <q-table
                :rows="filteredSubscribers"
                :columns="columns"
                row-key="id"
                :pagination="pagination"
                :loading="loading"
              >
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-chip
                      :color="getStatusColor(props.value)"
                      text-color="white"
                      :label="getStatusLabel(props.value)"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-val="props">
                  <q-td :props="props">
                    <div
                      style="
                        max-width: 300px;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 4px;
                      "
                    >
                      <q-chip
                        :color="getStatusColor(valueVal)"
                        text-color="white"
                        :label="valueVal"
                        v-for="(valueVal, idx) in props.value"
                        :key="idx"
                      />
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      icon="edit"
                      color="primary"
                      size="sm"
                      @click="onClickAddSubscriber(props.row)"
                      :loading="loading"
                    >
                      <q-tooltip>Edit Subscriber</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      icon="edit"
                      color="orange"
                      size="sm"
                      @click="onClickEditByListCategories(props.row)"
                      :loading="loading"
                    >
                      <q-tooltip>Edit By Categories</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      icon="delete"
                      color="negative"
                      size="sm"
                      :loading="loading"
                      @click="onDeleteSubscriber(props.row)"
                    />
                  </q-td>
                </template>
              </q-table>
            </div>

            <!-- Quick Stats Cards -->
            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-card class="text-center q-pa-md bg-primary text-white">
                <div class="text-h6">Total Subscribers</div>
                <div class="text-h4">{{ subscribers.length }}</div>
              </q-card>
            </div>

            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-card class="text-center q-pa-md bg-positive text-white">
                <div class="text-h6">Active</div>
                <div class="text-h4">
                  {{ subscribers.filter((sub) => sub.status == 1).length }}
                </div>
              </q-card>
            </div>

            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-card class="text-center q-pa-md bg-warning text-white">
                <div class="text-h6">Pending</div>
                <div class="text-h4">
                  {{ subscribers.filter((sub) => sub.status == 0).length }}
                </div>
              </q-card>
            </div>

            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-card class="text-center q-pa-md bg-negative text-white">
                <div class="text-h6">Inactive</div>
                <div class="text-h4">
                  {{ subscribers.filter((sub) => sub.status == 2).length }}
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";

import subscribeManage from "./subscribeManage.vue";

import multiplePromptDialog from "src/components/multiplePromptDialog.vue";
import { name } from "@azure/msal-browser/dist/packageMetadata";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();

const { postData } = apiRequest();
// Reactive data
const searchText = ref("");
const statusFilter = ref("All");
const loading = ref(false);

// Status options for filter
const statusOptions = ["All", "Active", "Inactive", "Pending"];

// Table pagination
const pagination = ref({
  rowsPerPage: 10,
});

onMounted(() => {
  getListSubscriber();
});

// Sample subscribers data
const subscribers = ref([
  {
    id: 1,
    email: "john@example.com",
    status: "Active",
    type: "users",
    subscriptionDate: "2023-01-15",
  },
]);

// Table columns
const columns = [
  {
    name: "email",
    label: "Email",
    field: "email",
    align: "left",
    format: (val) => (val === "_ALL" ? "All registered users" : val),
  },
  {
    name: "status",
    label: "Status",
    field: "status",
    align: "center",
    format: (val) =>
      val === "1" ? "Active" : val === "2" ? "Inactive" : "Pending",
  },
  {
    name: "type",
    label: "Type",
    field: "type",
    align: "center",
  },
  {
    name: "val",
    label: "Value Type",
    field: "val",
    align: "center",
  },
  {
    name: "subscriptionDate",
    label: "Subscription Date",
    field: "subscriptionDate",
    align: "center",
    format: (val) => {
      if (!val) return "";
      const date = new Date(val);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
  {
    name: "actions",
    label: "Actions",
    field: "actions",
    align: "center",
  },
];

// Method to get status color
const getStatusLabel = (status) => {
  if (status === "1" || status === 1 || status === "Active") return "Active";
  if (status === "2" || status === 2 || status === "Inactive") return "Inactive";
  if (status === "0" || status === 0 || status === "Pending") return "Pending";
  return String(status || "Pending");
};

const getStatusColor = (status) => {
  switch (getStatusLabel(status)) {
    case "Active":
      return "positive";
    case "Inactive":
      return "negative";
    case "Pending":
      return "warning";
    default:
      return "indigo";
  }
};

const filteredSubscribers = computed(() => {
  const keyword = searchText.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  return subscribers.value.filter((sub) => {
    const statusLabel = getStatusLabel(sub.status);
    const valText = Array.isArray(sub.val)
      ? sub.val.join(" ").toLowerCase()
      : String(sub.val || "").toLowerCase();

    const matchesSearch =
      !keyword ||
      String(sub.email || "").toLowerCase().includes(keyword) ||
      String(sub.type || "").toLowerCase().includes(keyword) ||
      statusLabel.toLowerCase().includes(keyword) ||
      valText.includes(keyword);

    const matchesStatus =
      !selectedStatus ||
      selectedStatus === "All" ||
      statusLabel === selectedStatus;

    return matchesSearch && matchesStatus;
  });
});

const getListSubscriber = async () => {
  loading.value = true;

  try {
    const { data } = await postData(
      "post",
      {
        id: "FP_SUBSCRIBE_POSTS",
        selectAs: {
          idx: "id|array|grouped",
          email: "pgm_value3|string|grouped",
          status: "pgm_desc2|string|grouped",
          type: "pgm_value|string|grouped",
          subscriptionDate: "created_at|date:max|grouped",
          val: "pgm_value2|array|grouped",
        },
      },
      `portal/gencode/showDetail/FP_SUBSCRIBE_POSTS`,
      false,
      false,
      true
    );

    if (data) {
      console.log(data);
      subscribers.value = data;
    }
  } finally {
    loading.value = false;
  }
};

const getListCategories = async () => {
  loading.value = true;

  try {
    const { data } = await postData(
      "post",
      {
        id: "FP_POST_TAGS",
        selectAs: {
          name: "pgm_value|string",
          slug: "pgm_value2|string",
          desc: "pgm_desc|string",
        },
      },
      `portal/gencode/showDetail/FP_POST_TAGS`,
      false,
      false,
      true
    );

    return data || [];
  } finally {
    loading.value = false;
  }
};

const getListHashtags = async () => {
  loading.value = true;

  try {
    const { data } = await postData(
      "post",
      {
        id: "FP_POST_HASHTAGS",
        selectAs: {
          name: "pgm_value|string",
          slug: "pgm_value2|string",
          desc: "pgm_desc|string",
        },
      },
      `portal/gencode/showDetail/FP_POST_HASHTAGS`,
      false,
      false,
      true
    );

    return data || [];
  } finally {
    loading.value = false;
  }
};

const getActiveAccount = async () => {
  loading.value = true;
  // ActiveOnly
  const { data } = await postData(
    "get",
    null,
    "portal/users/ActiveOnly",
    false,
    false,
    true
  );

  loading.value = false;

  return data || [];
};

const getListAuthor = async () => {
  loading.value = true;

  try {
    const { data } = await postData(
      "post",
      {
        id: "UPDATE_FP",
        selectAs: {
          name: "pgm_value",
        },
        groupBy: ["name"],
      },
      `portal/gencode/showDetail/UPDATE_FP`,
      false,
      false,
      true
    );

    return data || [];
  } finally {
    loading.value = false;
  }
};

const onClickAddSubscriber = async (data = null) => {
  console.log(data);
  const getActiveAccountSubscribers = await getActiveAccount();
  const getCategories = await getListCategories();
  const getAuthors = await getListAuthor();
  const getHashtags = await getListHashtags();

  let listAccountOptions = getActiveAccountSubscribers.map((acc) => ({
    label: acc.email + " - " + acc.pud_first_name + " " + acc.pud_last_name,
    value: acc.email,
  }));

  let listCategoriesOptions = getCategories.map((cat) => ({
    label: cat.name + " - " + cat.desc,
    value: cat.name,
  }));

  let listAuthorOptions = getAuthors.map((auth) => ({
    label: auth.name,
    value: auth.name,
  }));

  let listHashtagsOptions = getHashtags.map((tag) => ({
    label: tag.name + " - " + tag.desc,
    value: tag.name,
  }));

  $q.dialog({
    component: multiplePromptDialog,
    componentProps: {
      title: "Manage Subscriber",
      initialFields: [
        {
          name: "email",
          label: "Select Email",
          type: "select",
          options: [
            { label: "Choose All", value: "_ALL" },
            ...listAccountOptions,
          ],
          multiple: true,
          default: [data?.email] ?? [],
          rules: [(val) => !!val || "At least one tag is required"],
        },
        {
          name: "status",
          label: "Select Status",
          type: "select",
          options: [
            { label: "Active", value: 1 },
            { label: "Pending", value: 0 },
            { label: "Inactive", value: 2 },
          ],
          default: parseInt(data?.status) ?? 1,
          rules: [(val) => !!val || "Status is required"],
        },
        {
          name: "type",
          label: "Select Type",
          type: "select",
          options: [
            { label: "Categories", value: "categories" },
            { label: "Users", value: "users" },
            { label: "Hashtags", value: "tags" },
          ],
          default: data?.type ?? "categories",
          rules: [(val) => !!val || "Type is required"],
        },
        {
          name: "valCategories",
          label: "Select Category Type",
          type: "select",
          options: [
            { label: "Choose All", value: "_ALL" },
            ...listCategoriesOptions,
          ],
          multiple: true,
          default: data?.val ?? [],
          hidden: (fields) => {
            return fields.type !== "categories";
          },
        },
        {
          name: "valAuthor",
          label: "Select Author",
          type: "select",
          options: [
            { label: "Choose All", value: "_ALL" },
            ...listAuthorOptions,
          ],
          multiple: true,
          default: data?.val ?? [],
          hidden: (fields) => {
            return fields.type !== "users";
          },
        },
        {
          name: "valHashtags",
          label: "Select Hashtags",
          type: "select",
          options: [
            { label: "Choose All", value: "_ALL" },
            ...listHashtagsOptions,
          ],
          multiple: true,
          default: data?.val ?? [],
          hidden: (fields) => {
            return fields.type !== "tags";
          },
        },
      ],
    },
  })
    .onOk(async (datas) => {
      console.log("Dialog confirmed", datas);

      loading.value = true;
      try {
        const { data } = await postData(
          "post",
          {
            email: datas.email,
            status: datas.status,
            type: datas.type,
            valCategories: datas.valCategories,
            valAuthor: datas.valAuthor,
            valHashtags: datas.valHashtags,
          },
          `fpmanager/saveSubscriber`,
          false,
          false,
          true
        );

        if (data) {
          $q.notify({
            color: "positive",
            message: "Subscriber saved successfully",
          });
        }
      } finally {
        loading.value = false;
        getListSubscriber();
      }
    })
    .onCancel(() => {
      console.log("Dialog canceled");
    });
};

const onClickEditByListCategories = async (data) => {
  const getCategories = await getListCategories();
  const getActiveAccountSubscribers = await getActiveAccount();
  const getAuthors = await getListAuthor();
  const getHashtags = await getListHashtags();

  let listAccountOptions = getActiveAccountSubscribers.map((acc) => ({
    label: acc.email + " - " + acc.pud_first_name + " " + acc.pud_last_name,
    value: acc.email,
  }));

  let listAuthorOptions = getAuthors.map((auth) => ({
    label: auth.name,
    value: auth.name,
  }));

  let listHashtagsOptions = getHashtags.map((tag) => ({
    label: tag.name + " - " + tag.desc,
    value: tag.name,
  }));

  let listCategoriesOptions = getCategories
    .map((cat) => ({
      label: cat.name + " - " + cat.desc,
      value: cat.name,
    }))
    .filter((cat) => data.val.includes(cat.value)); // Filter out the "_ALL" option

  const getSubscriber = await postData(
    "post",
    {
      id: "FP_SUBSCRIBE_POSTS",
      selectAs: {
        idx: "id|array|grouped",
        email: "pgm_value3|string|grouped",
        status: "pgm_desc2|string|grouped",
        type: "pgm_value|string|grouped",
        subscriptionDate: "created_at|date:max|grouped",
        val: "pgm_value2|array|grouped",
      },
      filter: {
        pgm_value2: listCategoriesOptions.map((cat) => cat.value),
      },
    },
    `portal/gencode/showDetail/FP_SUBSCRIBE_POSTS`,
    false,
    false,
    true
  );

  const subscriberData =
    getSubscriber?.data.map((item) => ({
      value: item.email,
      label: item.email,
    })) || null;

  $q.dialog({
    component: multiplePromptDialog,
    componentProps: {
      title: "Manage Subscriber",
      initialFields: [
        {
          name: "email",
          label: "Select Email",
          type: "select",
          options: [
            { label: "Choose All", value: "_ALL" },
            ...listAccountOptions,
          ],
          multiple: true,
          default: subscriberData ?? [],
          rules: [(val) => !!val || "At least one tag is required"],
        },
        {
          name: "status",
          label: "Select Status",
          type: "select",
          options: [
            { label: "Active", value: 1 },
            { label: "Pending", value: 0 },
            { label: "Inactive", value: 2 },
          ],
          default: parseInt(data?.status) ?? 1,
          rules: [(val) => !!val || "Status is required"],
        },
        {
          name: "type",
          label: "Select Type",
          type: "select",
          options: [
            { label: "Categories", value: "categories" },
            { label: "Users", value: "users" },
            { label: "Hashtags", value: "tags" },
          ],
          default: data?.type ?? "categories",
          rules: [(val) => !!val || "Type is required"],
        },
        {
          name: "valCategories",
          label: "Select Category Type",
          type: "select",
          options: [
            { label: "Choose All", value: "_ALL" },
            ...listCategoriesOptions,
          ],
          multiple: true,
          default: data?.val ?? [],
          hidden: (fields) => {
            return fields.type !== "categories";
          },
        },
        {
          name: "valAuthor",
          label: "Select Author",
          type: "select",
          options: [
            { label: "Choose All", value: "_ALL" },
            ...listAuthorOptions,
          ],
          multiple: true,
          default: data?.val ?? [],
          hidden: (fields) => {
            return fields.type !== "users";
          },
        },
        {
          name: "valHashtags",
          label: "Select Hashtags",
          type: "select",
          options: [
            { label: "Choose All", value: "_ALL" },
            ...listHashtagsOptions,
          ],
          multiple: true,
          default: data?.val ?? [],
          hidden: (fields) => {
            return fields.type !== "tags";
          },
        },
      ],
    },
  })
    .onOk(async (datas) => {
      console.log("Dialog confirmed", datas);

      loading.value = true;
      try {
        const { data } = await postData(
          "post",
          {
            email: datas.email,
            status: datas.status,
            type: datas.type,
            valCategories: datas.valCategories,
            valAuthor: datas.valAuthor,
            valHashtags: datas.valHashtags,
          },
          `fpmanager/saveSubscriber`,
          false,
          false,
          true
        );

        if (data) {
          $q.notify({
            color: "positive",
            message: "Subscriber saved successfully",
          });
        }
      } finally {
        loading.value = false;
        getListSubscriber();
      }
    })
    .onCancel(() => {
      console.log("Dialog canceled");
    });
};

const onDeleteSubscriber = async (data) => {
  console.log("Delete subscriber", data);

  $q.dialog({
    title: "Confirm Deletion",
    message: `Are you sure you want to delete subscriber with email: ${data.email}?`,
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      loading.value = true;
      try {
        const { data: resData } = await postData(
          "post",
          {
            ids: data.idx,
          },
          `portal/gencode/deleteDetailGroup/FP_SUBSCRIBE_POSTS`,
          false,
          false,
          true
        );

        if (resData) {
          $q.notify({
            color: "positive",
            message: "Subscriber deleted successfully",
          });
        }
      } finally {
        loading.value = false;
        getListSubscriber();
      }
    })
    .onCancel(() => {
      console.log("Deletion canceled");
    });
};
</script>
