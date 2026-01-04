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
            <div class="text-h6">Mapping Category View</div>
            <div class="text-subtitle2">Mapping categories to be viewed.</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="row q-gutter-md">
          <div class="col-12">
            <q-input
              v-model="mappingLabel"
              label="Mapping Label"
              outlined
              dense
              class="full-width"
            />
          </div>
          <div class="col">
            <q-table
              style="height: 400px"
              flat
              bordered
              :rows="userRows"
              :columns="userCols"
              row-key="u_username"
              virtual-scroll
              :loading="loading"
              v-model:selected="selectedUsers"
              selection="multiple"
              title="Select Users"
              :filter="filterUsers"
              :rows-per-page-options="[0]"
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
                      v-model="filterUsers"
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
                </div>
              </template>
            </q-table>
          </div>
          <div class="col">
            <q-table
              style="height: 400px"
              flat
              bordered
              :rows="catRows"
              :columns="catCols"
              row-key="name"
              virtual-scroll
              :loading="loading"
              v-model:selected="selectedCats"
              selection="multiple"
              title="Select Categories"
              :filter="filterCats"
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
                      v-model="filterCats"
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
                </div>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
          :loading="loading"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="onClickOK()"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();
const $q = useQuasar();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  title: {
    type: String,
    default: "Mapping Category Manage",
  },
  users: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

onMounted(async () => {
  userRows.value = await getActiveAccount();
  await getDataCat();

  if (props.title) {
    mappingLabel.value = props.title;
  }

  if (props.users.length > 0) {
    selectedUsers.value = userRows.value.filter((user) =>
      props.users.includes(user.u_username)
    );
  }

  if (props.categories.length > 0) {
    selectedCats.value = catRows.value.filter((cat) =>
      props.categories.includes(cat.name)
    );
  }
});

const mappingLabel = ref("");

const filterUsers = ref("");
const filterCats = ref("");
const loading = ref(false);
const selectedUsers = ref([]);
const selectedCats = ref([]);
const userRows = ref([]);
const userCols = ref([
  {
    name: "name",
    label: "Name",
    field: (val) => `${val.pud_first_name} ${val.pud_last_name}`,
    align: "left",
  },
  {
    name: "u_username",
    label: "Email",
    field: "u_username",
    align: "left",
  },
]);

const catRows = ref([]);
const catCols = ref([
  { name: "name", label: "Name", field: "name" },
  { name: "desc", label: "Description", field: "desc" },
  { name: "slug", label: "Slug", field: "slug" },
]);

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

const getDataCat = async () => {
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
      catRows.value = response.data;
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to fetch categories",
    });
  }
};

const onClickOK = () => {
  $q.dialog({
    title: "Alert",
    message: "Are you sure want to save mapping?",
    cancel: true,
  }).onOk(async () => {
    // Logic to handle submission
    try {
      loading.value = true;
      const payload = {
        data: {
          pgm_code: "FP_CATEGORY_MAPPING",
          pgm_value: {
            value: [
              mappingLabel.value
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
            ],
            store_separately: true,
          },
          pgm_value3: {
            value: selectedUsers.value.map((item) => item.u_username),
            store_separately: true,
          },
          pgm_value2: {
            value: selectedCats.value.map((item) => item.name),
            store_separately: true,
          },
          pgm_desc: mappingLabel.value,
        },
        keys: {
          pgm_value3: {
            value: selectedUsers.value.map((item) => item.u_username),
            store_separately: true,
          },
          pgm_value2: {
            value: selectedCats.value.map((item) => item.name),
            store_separately: true,
          },
          pgm_value: {
            value: [
              mappingLabel.value
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
            ],
            store_separately: true,
          },
        },
      };

      const response = await postData(
        "post",
        payload,
        "portal/gencode/saveGencode"
      );
      if (response.success) {
        $q.notify({
          type: "positive",
          message: "Mapping saved successfully.",
        });
        onDialogOK();
      } else {
        $q.notify({
          type: "negative",
          message: response.message || "Failed to save mappings.",
        });
      }
    } catch (error) {
      console.error("Error saving mappings:", error);
      $q.notify({
        type: "negative",
        message: "An error occurred while saving mappings.",
      });
    } finally {
      loading.value = false;
    }
  });
};
</script>
