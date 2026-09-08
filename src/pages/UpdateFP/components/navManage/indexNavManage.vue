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
          <div class="col text-right">
            <q-btn
              color="primary"
              label="Add Navigation"
              @click="onClickAddNav"
              icon-right="add"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <q-splitter v-model="splitterModel" style="height: 400px">
              <template v-slot:before>
                <template v-if="loading">
                  <div
                    class="row items-center justify-center"
                    style="height: 100%"
                  >
                    <q-spinner color="primary" size="50px" />
                  </div>
                </template>
                <q-tree
                  :nodes="simple"
                  node-key="value"
                  v-model:selected="selected"
                  v-else
                />
              </template>
              <template v-slot:after>
                <div class="q-pa-md">
                  <div v-if="selected">
                    <div class="row">
                      <div class="col">
                        <span class="text-h3">{{
                          findNode(simple, selected).label
                        }}</span>
                        <div
                          class="text-grey-7 q-mb-md"
                          v-if="findNode(simple, selected).pages"
                        >
                          {{ findNode(simple, selected).pages.desc }}
                        </div>
                      </div>
                      <div class="col text-right">
                        <q-btn-group outline>
                          <q-btn
                            :color="
                              findNode(simple, selected).order === 1
                                ? 'grey'
                                : 'primary'
                            "
                            icon="arrow_upward"
                            outline
                            :disable="findNode(simple, selected).order === 1"
                            @click="
                              onClickChangePosition(
                                findNode(simple, selected),
                                findNode(simple, selected).order - 1
                              )
                            "
                          >
                            <q-tooltip>Move Up Navigation</q-tooltip>
                          </q-btn>
                          <q-btn
                            :color="
                              findNode(simple, selected).order === simple.length
                                ? 'grey'
                                : 'orange'
                            "
                            icon="arrow_downward"
                            outline
                            :disable="
                              findNode(simple, selected).order === simple.length
                            "
                            @click="
                              onClickChangePosition(
                                findNode(simple, selected),
                                findNode(simple, selected).order + 1
                              )
                            "
                          >
                            <q-tooltip>Move Down Navigation</q-tooltip>
                          </q-btn>
                          <q-input
                            v-model="findNode(simple, selected).order"
                            type="number"
                            dense
                            outlined
                            style="width: 60px"
                            @update:model-value="
                              (value) => {
                                if (value < simple.length && value > 0) {
                                  onClickChangePosition(
                                    findNode(simple, selected),
                                    parseInt(value)
                                  );
                                } else {
                                  $q.notify({
                                    type: 'negative',
                                    message: 'Invalid position value',
                                  });
                                }
                              }
                            "
                            min="1"
                            :max="simple.length"
                          ></q-input>
                        </q-btn-group>
                      </div>
                    </div>
                    <q-separator class="q-my-md" />
                    <recurse-nav-opt
                      :navData="listConf"
                      :selectedNav="findNode(simple, selected)"
                    />
                  </div>
                  <div v-else>Please select a navigation item.</div>
                </div>
              </template>
            </q-splitter>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import draggable from "vuedraggable";

import formNavManage from "./formNavManage.vue";
import recurseNavOpt from "./recurseNavOpt.vue";

const $q = useQuasar();
const { postData } = apiRequest();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const props = defineProps({
  idForm: [String, Number],
});
const isLoaded = ref(false);
const loading = ref(false);
const splitterModel = ref(50);
const selected = ref("");
const setupList = ref([]);

const simple = ref([]);
const listConf = ref([]);

onMounted(() => {
  getData();
  getConvList();
});

const onClickAddNav = (row) => {
  $q.dialog({
    component: formNavManage,
    componentProps: {
      idForm: row.id,
    },
  })
    .onOk((data) => {
      console.log("Navigation added:", data);
    })
    .onDismiss(() => {
      getData();
    });
};

const getData = async (isLoading = true) => {
  try {
    if (isLoading) loading.value = true;
    const response = await postData("get", null, "fpmanager/getNavMenu");
    if (response.data) {
      simple.value = response.data;

      if (isLoading) loading.value = false;
    }
  } catch (error) {
    console.error("Error fetching navigation data:", error);
  } finally {
    if (isLoading) loading.value = false;
  }
};

const getConvList = async (id = "") => {
  const response = await postData(
    "get",
    null,
    id ? `fpmanager/getNavConf/${id}` : "fpmanager/getNavConf"
  );
  if (response) {
    console.log(response);
    listConf.value = response.data || [];
    // Process the response data as needed
  }
};

function findNode(nodes, value) {
  for (const node of nodes) {
    if (node.value === value) return node;
    if (node.children) {
      const found = findNode(node.children, value);
      if (found) return found;
    }
  }
  return null;
}

const selectedNode = computed(() => {
  return findNode(
    Array.isArray(simple.value) ? simple.value : [],
    selected.value
  );
});

const onClickConfirm = (item) => {
  if (item.config === "btnconf") {
    $q.dialog({
      title: "Confirm Action",
      message: `Are you sure you want to perform the action: ${item.label}?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      const response = await postData(
        item.method,
        item.url.includes("{")
          ? item.url.replace(/\{([^}]+)\}/g, (_, key) => item[key] ?? "")
          : item.url,
        "fpmanager/performAction"
      );
      // Perform the action here
    });
  }
};

const onClickChangePosition = async (item, newPosition) => {
  console.log(item, newPosition);
  if (!item || !item.idx || newPosition < 1) return;

  try {
    const response = await postData(
      "post",
      {
        id: item.idx,
        order: newPosition,
        parentID: item.parent || null,
      },
      "fpmanager/updateOrderNavMenu"
    );
    if (response && response.status) {
      $q.notify({
        type: "positive",
        message: "Navigation position updated successfully",
      });
      getData(true); // Refresh the navigation list
    } else {
      $q.notify({
        type: "negative",
        message: "Failed to update navigation position",
      });
    }
  } catch (error) {
    console.error("Error updating navigation position:", error);
    $q.notify({
      type: "negative",
      message: "An error occurred while updating position",
    });
  }
};
</script>
