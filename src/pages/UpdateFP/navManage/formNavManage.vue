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
            <div class="text-h6">Nav Manage</div>
            <div class="text-subtitle2">
              Create and manage your navigation here.
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="row q-gutter-md">
          <div class="col">
            <q-input
              v-model="formData.label"
              label="Nav Name"
              dense
              outlined
              :loading="loading"
            />
          </div>
          <div class="col">
            <q-select
              v-model="formData.icon"
              :options="filteredIconOptions"
              label="Icon"
              dense
              outlined
              use-input
              input-debounce="300"
              @filter="filterIcons"
              :loading="iconLoading"
              emit-value
              map-options
              option-label="name"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    {{ scope.opt.value }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="row q-pt-md">
          <div class="col">
            <q-select
              v-model="formData.parent"
              :options="listNav"
              label="Parent Navigation"
              dense
              outlined
              emit-value
              map-options
              option-value="value"
              option-label="label"
              :loading="loading"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{
                      scope.opt.description
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="row q-gutter-md q-pt-md">
          <div class="col q-gutter-sm">
            <q-radio
              v-model="formData.type"
              :val="'link'"
              inline
              dense
              color="primary"
              label="Link"
              :loading="loading"
            />
            <q-radio
              v-model="formData.type"
              :val="'page'"
              inline
              dense
              color="primary"
              label="Page"
              :loading="loading"
            />
          </div>
        </div>

        <div class="row q-gutter-md q-pt-md" v-if="formData.type === 'page'">
          <div class="col">
            <q-select
              v-model="formData.page"
              :options="pageOptions"
              label="Select Page"
              dense
              outlined
              emit-value
              map-options
              option-value="id"
              option-label="cfmt_title"
              :loading="loading"
            />
          </div>
        </div>

        <div class="row q-gutter-md q-pt-md" v-else>
          <div class="col">
            <q-input v-model="formData.url" label="URL" dense outlined />
          </div>
        </div>

        <div class="row q-gutter-md q-pt-md">
          <div class="col">
            <q-toggle
              v-model="formData.dmsShared"
              label="DMS Shared"
              color="primary"
              left-label
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn
          color="primary"
          label="Save"
          @click="onClickOk(formData)"
          icon-right="save"
        />
        <q-btn
          color="secondary"
          label="Cancel"
          @click="onDialogCancel()"
          icon-right="cancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";

import iconList from "src/assets/icon_list.json";

const $q = useQuasar();
const { postData } = apiRequest();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  idForm: String,
  navData: Object,
});

onMounted(async () => {
  console.log(props.navData);
  if (props.navData) {
    console.log("Form data set from props:", formData.value);
    formData.value = props.navData;
    formData.value.page = props.navData.url ? String(props.navData.url) : "";
    formData.value.url = props.navData.url || "";
    formData.value.parent = props.navData.parent
      ? String(props.navData.parent)
      : null;
    formData.value.dmsShared = props.navData.dmsShared || false;
    console.log("Form data set from props:", formData.value);
  }
  await getPageOptions();
  isLoaded.value = true;
});

const isLoaded = ref(false);
const loading = ref(false);
const formData = ref({
  label: "",
  icon: "",
  url: "",
  page: "",
  type: "link", // default type
  parent: null, // default parent
  dmsShared: false,
});
const pageOptions = ref([]);
const listNav = ref([]);

const getPageOptions = async () => {
  loading.value = true;
  const response = await postData("get", null, "cms/forms/page");
  if (response) {
    console.log("Data fetched successfully:", response);
    pageOptions.value = response;
    loading.value = false;
  } else {
    console.error("Error fetching data");
    loading.value = false;
  }
};

const iconOptions = ref([]);
const filteredIconOptions = ref([]);
const iconLoading = ref(false);

const fetchIconOptions = async () => {
  iconLoading.value = true;
  try {
    if (iconList && Array.isArray(iconList)) {
      console.log(iconList);
      iconOptions.value = iconList
        .filter((icon) => icon.version === 329)
        .map((icon) => ({
          name: icon.name,
          value: icon.name,
          icon: icon.name,
        }));
      filteredIconOptions.value = iconOptions.value;
    } else {
      iconOptions.value = [];
      filteredIconOptions.value = [];
      console.error("iconList.icons is undefined or not an array");
    }
  } catch (error) {
    console.error("Error loading icons:", error);
  } finally {
    iconLoading.value = false;
  }
};

const filterIcons = (val, update) => {
  if (!val) {
    update(() => {
      filteredIconOptions.value = iconOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredIconOptions.value = iconOptions.value.filter((icon) =>
      icon.name.toLowerCase().includes(needle)
    );
  });
};

onMounted(async () => {
  await getPageOptions();
  await fetchIconOptions();
  await getDataNav();
  isLoaded.value = true;
});

const getDataNav = async () => {
  loading.value = true;
  try {
    const response = await postData("get", null, "fpmanager/getNavMenu/1");
    if (response.data) {
      listNav.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching navigation data:", error);
  } finally {
    loading.value = false;
  }
};

const onClickOk = (data) => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure you want to save this navigation item?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    try {
      const response = await postData(
        "post",
        { ...data, ...(props.idForm ? { id: props.idForm } : {}) },
        "fpmanager/saveNavMenu",
        false,
        false,
        true
      );
      if (response) {
        console.log("Navigation item saved successfully:", response);
        $q.notify({
          type: "positive",
          message: "Navigation item saved successfully!",
        });
        onDialogOK(data);
      } else {
        console.error("Error saving navigation item");
        $q.notify({
          type: "negative",
          message: "Error saving navigation item",
        });
      }
    } catch (error) {
      console.error("Error during save operation:", error);
      $q.notify({
        type: "negative",
        message: "Error during save operation",
      });
    } finally {
      loading.value = false;
    }
  });
};
</script>
