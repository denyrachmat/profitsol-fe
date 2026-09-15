<template>
  <q-dialog
    ref="dialogRef"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white q-pa-md">
      <q-card-section class="text-h6">
        <div class="row">
          <div class="col">Setup DMS Folder Picker</div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <div class="row">
          <div class="col">
            <q-input
              v-model="root"
              outlined
              dense
              label="DMS Root"
              placeholder="e.g. ems2_yeid_root"
              :rules="[(val) => !!val || 'Root is required']"
            />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-input
              v-model="startFolderId"
              outlined
              dense
              label="Start Folder ID (empty = root level)"
              hint="Numeric DMS folder id where browsing starts"
            />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-select
              v-model="kind"
              :options="[
                { label: 'Folders and files', value: 'both' },
                { label: 'Folders only', value: 'folder' },
                { label: 'Files only', value: 'file' },
              ]"
              outlined
              dense
              label="What can be picked"
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row items-center">
          <div class="col text-caption text-grey-6">
            Tested as user: {{ testUsername || "-" }}
          </div>
          <div class="col text-right">
            <q-btn
              color="primary"
              outline
              label="Test Browse"
              icon="search"
              :loading="testing"
              @click="onTest"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="onDialogCancel" :loading="testing" />
        <q-btn
          color="primary"
          label="Save"
          @click="saveOptions()"
          :loading="testing"
          :disable="!root"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import { useAuthStore } from "stores/authStore";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const authStore = useAuthStore();
const { postData } = apiRequest();
const { onDialogCancel, onDialogOK, dialogRef } = useDialogPluginComponent();

const props = defineProps({
  detailData: Object,
});

const root = ref("");
const startFolderId = ref("");
const kind = ref("both");
const testing = ref(false);

const testUsername = computed(() => authStore.authDet?.username || "");

onMounted(() => {
  if (props.detailData) {
    root.value = props.detailData.root || "";
    startFolderId.value = props.detailData.start_folder_id || "";
    kind.value = props.detailData.kind || "both";
  }
});

const buildUrl = (username) => {
  const seg = (startFolderId.value || "").toString().trim();
  return `dms/browse/${encodeURIComponent(username)}/${encodeURIComponent(
    root.value.trim()
  )}${seg ? "/" + encodeURIComponent(seg) : ""}`;
};

const onTest = async () => {
  if (!root.value.trim()) {
    $q.notify({ type: "negative", message: "Root is required." });
    return;
  }
  if (!testUsername.value) {
    $q.notify({ type: "negative", message: "No logged-in user found." });
    return;
  }
  testing.value = true;
  const res = await postData("get", null, buildUrl(testUsername.value));
  testing.value = false;
  if (res && res.status && Array.isArray(res.data)) {
    $q.notify({
      type: "positive",
      message: `OK — ${res.data.length} item(s) found.`,
    });
  } else if (!res) {
    $q.notify({ type: "negative", message: "Browse request failed." });
  }
};

const saveOptions = () => {
  onDialogOK({
    root: root.value.trim(),
    start_folder_id: (startFolderId.value || "").toString().trim(),
    kind: kind.value || "both",
  });
};
</script>
