<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card style="min-width: 70vw">
      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <div class="text-h6">API Search Token Collection</div>
          </div>
          <!-- <div class="col text-right">
            <q-btn flat round dense icon="add" @click="onAddToken" />
          </div> -->
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md" style="min-height: 40vh">
        <q-list
          bordered
          separator
          v-if="listTokens.filter((fil) => fil.token === 'DRAFT').length > 0"
        >
          <q-item v-for="(item, index) in listTokens" :key="index">
            <q-item-section>
              <q-item-label>Token: {{ item.token }}</q-item-label>
              <q-item-label caption
                >Created At: {{ item.created_at }}</q-item-label
              >
            </q-item-section>
            <q-item-section>
              <q-item-label>
                Filters for {{ item.filter.length }} parameters
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                color="primary"
                label="Copy"
                @click="copyToClipboard(item.token)"
                :disabled="item.token === 'DRAFT'"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-center">No API search tokens found.</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Save" color="primary" @click="onClickSave" />
        <q-btn flat label="Close" color="primary" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";

const { postData } = apiRequest();
const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const authStore = useAuthStore();

const props = defineProps({
  idReport: String,
  colsData: Array,
  maxAPIOpt: {
    type: Number,
    default: 0,
  },
});

const listTokens = ref([]);

onMounted(async () => {
  await getCollectionTokens();

  console.log(props.colsData);
  listTokens.value = [
    ...listTokens.value,
    {
      token: "DRAFT",
      id_report: props.idReport,
      filter: props.colsData,
      created_at: "N/A",
    },
  ];
});

const getCollectionTokens = async () => {
  try {
    const response = await postData(
      "get",
      [],
      "mrs/getListAPIColection/" + props.idReport
    );
    if (response && response.data) {
      //   console.log("API Collection Tokens:", response.data);
      listTokens.value = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching API collection tokens:", error);
  }
};

const copyToClipboard = async (token) => {
  try {
    const text = process.env.API + "mrs/runningReportFromAPI/" + token;
    await navigator.clipboard.writeText(text);
    $q.notify({
      type: "positive",
      message: "Token copied to clipboard!",
    });
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    $q.notify({
      type: "negative",
      message: "Failed to copy token to clipboard.",
    });
  }
};

const onClickSave = async () => {
  let getDraft = listTokens.value.find((item) => item.token === "DRAFT");
  if (!getDraft) {
    $q.notify({
      type: "negative",
      message: "No draft token found to save.",
    });
    return;
  }

  $q.dialog({
    title: "Confirm Save",
    message: "Are you sure you want to save the current draft token?",
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      try {
        const response = await postData(
          "post",
          {
            id_report: props.idReport,
            filter: getDraft.filter,
            max_api_opt: props.maxAPIOpt,
            user_id: authStore.authDet.username,
          },
          "mrs/storeSearchForAPI"
        );
        if (response && response.data) {
          $q.notify({
            type: "positive",
            message: "API Search Token saved successfully!",
          });
          await getCollectionTokens();
        }
      } catch (error) {
        console.error("Error saving API search token:", error);
        $q.notify({
          type: "negative",
          message: "Failed to save API Search Token.",
        });
      }
    })
    .onCancel(() => {
      console.log("Save cancelled");
    });
};
</script>
