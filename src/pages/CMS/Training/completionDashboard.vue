<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="q-dialog-plugin bg-white q-pa-md">
      <q-card-section>
        <div class="text-h6">Completion Status</div>
        <div class="text-subtitle2 text-grey" v-if="formTitle">
          {{ formTitle }}
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md" v-if="loading">
        <div class="row justify-center q-pa-lg">
          <q-spinner-dots size="40px" color="primary" />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md" v-else-if="completionData">
        <div class="row q-gutter-md q-mb-lg">
          <div class="col">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-primary">
                  {{ completionData.total_assigned }}
                </div>
                <div class="text-caption">Total Assigned</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-green">
                  {{ completionData.total_submitted }}
                </div>
                <div class="text-caption">Submitted</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-orange">
                  {{ completionData.total_assigned - completionData.total_submitted }}
                </div>
                <div class="text-caption">Pending</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-table
          :rows="completionData.users || []"
          :columns="columns"
          row-key="username"
          flat
          dense
          :filter="searchFilter"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:top-right>
            <q-input
              v-model="searchFilter"
              dense
              outlined
              placeholder="Search user..."
              clearable
              class="q-ml-md"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.submitted ? 'green' : 'orange'"
                :label="props.row.submitted ? 'Submitted' : 'Pending'"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Refresh" color="primary" @click="fetchData" :loading="loading" />
        <q-btn flat label="Close" color="grey" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();

const props = defineProps({
  formId: Number,
  formTitle: String,
});

const loading = ref(false);
const completionData = ref(null);
const searchFilter = ref("");

const columns = [
  {
    name: "username",
    required: true,
    label: "Username",
    align: "left",
    field: "username",
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    align: "center",
    field: "submitted",
    sortable: true,
  },
];

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  loading.value = true;
  const result = await postData(
    "get",
    null,
    `cms/completionStatus/${props.formId}`,
    false,
    false,
    true
  );
  loading.value = false;

  if (result) {
    completionData.value = result.data;
  }
};
</script>
