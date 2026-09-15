<template>
  <template v-for="(item, index) in rowNavData" :key="index">
    <div class="row q-gutter-md" v-if="item.config == 'row'">
      <span class="text-h6">{{ item.label }}</span>
    </div>
    <div class="row q-gutter-md" v-if="item.config == 'row'">
      <recurseNavOpt
        :navData="item.children"
        :selected-nav="props.selectedNav"
      />
    </div>

    <div
      class="col q-py-sm"
      v-if="item.config == 'btnconf' || item.config == 'btnedit'"
    >
      <q-btn
        :color="item.color"
        :label="item.label"
        @click="onClickBtn(item)"
        class="full-width"
        :loading="loading"
      >
        <q-badge
          color="red"
          floating
          size="16px"
          v-if="props.selectedNav.tags && item.keys == 'includePost'"
          >{{ JSON.parse(props.selectedNav.tags).length }}</q-badge
        >
      </q-btn>
    </div>
  </template>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import recurseNavOpt from "./recurseNavOpt.vue";

import formNavManage from "./formNavManage.vue";
import multiplePromptDialog from "src/components/multiplePromptDialog.vue";

const $q = useQuasar();
const props = defineProps({
  navData: Array,
  selectedNav: Object,
});
const { postData } = apiRequest();

onMounted(() => {
  console.log("RecurseNavOpt mounted with data:", props.navData);
});

const rowNavData = ref(props.navData || []);
const loading = ref(false);

const onClickBtn = async (item) => {
  console.log("Button clicked:", item);
  console.log("Selected navigation item:", props.selectedNav);
  if (item.keys === "editConf") {
    $q.dialog({
      component: formNavManage,
      componentProps: {
        idForm: props.selectedNav.value,
        navData: props.selectedNav,
      },
    })
      .onOk((data) => {
        console.log("Navigation added:", data);
      })
      .onDismiss(() => {});
  } else if (item.keys === "deleteConf") {
    $q.dialog({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete the navigation for ${item.label}?`,
      ok: "Delete",
      cancel: "Cancel",
    })
      .onOk(async () => {
        const response = await postData(
          "delete",
          null,
          `fpmanager/deleteNavMenu/${props.selectedNav.value}`
        );

        if (response.data) {
          $q.notify({
            type: "positive",
            message: `Configuration for ${item.label} deleted successfully.`,
          });
          // Refresh the navigation data
          rowNavData.value = rowNavData.value.filter(
            (nav) => nav.id != props.selectedNav.value
          );
        } else {
          $q.notify({
            type: "negative",
            message: `Failed to delete configuration for ${item.label}.`,
          });
        }
      })
      .onDismiss(() => {});
  } else if (item.keys === "includePost") {
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

      if (response && response.data) {
        console.log("Tags Data:", response);
        let options = response.data.map((tags) => ({
          label: tags.name + " - " + tags.desc,
          value: tags.name,
        }));

        $q.dialog({
          component: multiplePromptDialog,
          componentProps: {
            title: "Select Tags",
            initialFields: [
              {
                name: "tags",
                label: "Select Tags",
                type: "select",
                options: [
                  { label: "Choose All", value: "_ALL" },
                  { label: "Uncategorized", value: "_BLANK" },
                  ...options,
                ],
                multiple: true,
                default: props.selectedNav.tags
                  ? JSON.parse(props.selectedNav.tags)
                  : [],
                rules: [(val) => !!val || "At least one tag is required"],
              },
            ],
          },
        })
          .onOk(async (selectedTags) => {
            console.log("Selected Tags:", selectedTags);
            const response = await postData(
              "post",
              {
                ...props.selectedNav,
                id: props.selectedNav.idx,
                tags: selectedTags.tags,
              },
              "fpmanager/saveNavMenu",
              false,
              false,
              true
            );
            if (response) {
            }
            // Handle the selected tags
            // You can send them to the server or process them as needed
          })
          .onDismiss(() => {});
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching tags data:", error);
      $q.notify({
        type: "negative",
        message: "Failed to fetch tags data",
      });
    } finally {
      loading.value = false;
    }
  } else {
    $q.notify({
      type: "info",
      message: `Configuration for ${item.keys} is not implemented yet.`,
    });
  }
};
</script>
