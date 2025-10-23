<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-select
          outlined
          v-model="choosedData"
          :options="listData"
          label="Choose Training Title"
          emit-value
          map-options
          :loading="loading"
          dense
          @update:model-value="onChooseData"
          :readonly="loading"
        />
      </div>
      <div class="col text-right">
        <q-btn
          color="primary"
          label="Export to excel"
          icon="download"
          :disabled="!choosedData"
        >
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item
                clickable
                v-close-popup
                @click="exportToExcel(choosedData.id)"
              >
                <q-item-section>Export Users Answer Result</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="exportToExcelAnalytyic(choosedData.id)"
              >
                <q-item-section>Export Questioner Analytics</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <!-- <q-btn-group push>
          <q-btn
            push
            label="export to excel"
            icon="download"
            color="green"
            @click="exportToExcel(choosedData.id)"
            :disabled="!choosedData"
          />
        </q-btn-group> -->
      </div>
    </div>

    <div class="row q-pt-md">
      <div class="col">
        <q-table
          style="height: 60vh"
          flat
          bordered
          title="List of registered Users Training"
          :rows="rows"
          :columns="columns"
          row-key="index"
          virtual-scroll
          dense
          :loading="loading"
          loading-label="Please wait..."
        >
          <template v-slot:body="props">
            <q-tr :props="props" :key="`m_${props.row.index}`">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <q-chip
                  :color="col.value === 'PASSED' ? 'primary' : 'red'"
                  text-color="white"
                  v-if="col.name === 'status'"
                >
                  {{ col.value }}
                </q-chip>
                <template v-else-if="col.name === 'action'">
                  <q-btn
                    flat
                    icon="visibility"
                    color="cyan"
                    @click="showHistory(props.row.email, choosedData.id)"
                  >
                    <q-tooltip>Show Historical Answers</q-tooltip>
                  </q-btn>
                </template>
                <template v-else>
                  {{ col.value }}
                </template>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
    <div class="row q-pt-md">
      <div class="col">
        <span class="text-h3">
          <q-linear-progress
            :value="progress"
            :buffer="buffer"
            color="secondary"
            class="q-mt-sm"
            size="20px"
            track-color="orange"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                color="white"
                text-color="accent"
                :label="`${
                  progress ? Math.round(progress * 100) : 0
                }% Passed, ${buffer ? Math.round(buffer * 100) : 0}% Answered `"
              />
            </div>
          </q-linear-progress>
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed, watch, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import historicalAnswers from "./Report/historicalAnswers.vue";

const $q = useQuasar();
const { postData } = apiRequest();

const listData = ref([]);
const choosedData = ref(null);
const loading = ref(false);
const rows = ref([]);
const columns = ref([
  {
    name: "email",
    label: "Email",
    field: "email",
    sortable: true,
    align: "left",
  },
  {
    name: "fullname",
    label: "Full Name",
    field: "fullname",
    sortable: true,
    align: "left",
  },
  {
    name: "rm_role_desc",
    label: "Dept",
    field: "rm_role_desc",
    sortable: true,
    align: "left",
  },
  {
    name: "first_time_answer",
    label: "First Time Answers",
    field: "first_time_answer",
    align: "left",
    sortable: true,
  },
  {
    name: "last_time_answer",
    label: "Last Time Answers",
    field: "last_time_answer",
    align: "left",
    sortable: true,
  },
  {
    name: "learn_time",
    label: "Learn Times",
    field: "learn_time",
    align: "right",
    sortable: true,
  },
  {
    name: "grade",
    label: "Grade",
    field: "grade",
    align: "right",
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    field: "status",
    align: "center",
    sortable: true,
  },
  {
    name: "action",
    label: "Action",
    align: "center",
    sortable: true,
  },
]);
const intervalTable = ref(null);
// const progress = ref(0.0)
// const buffer = ref(0.0);

const props = defineProps({
  type: String,
});

onMounted(() => {
  getData();
});

const progress = computed(
  () =>
    rows.value.filter((fil) => fil.status === "PASSED").length /
    rows.value.length
);

const buffer = computed(
  () =>
    rows.value.filter((fil) => fil.learn_time > 0).length / rows.value.length
);

const getData = async () => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `cms/forms/quiz`,
    false,
    false,
    true
  );

  if (data) {
    setTimeout(() => {
      console.log(data);
    }, 1000);
    loading.value = false;
    listData.value = data.data;
  }
};

const onChooseData = async (val) => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `tos/trainingList/${val.id}`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    rows.value = data.data;
  }
};

const exportToExcel = (id) => {
  $q.dialog({
    title: "Confirmation",
    message: `Do you want to export this data ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    const data = await postData(
      "get",
      null,
      `tos/trainingListExport/${id}`,
      false,
      false,
      true
    );
    if (data) {
      loading.value = false;
      window.open(process.env.API_DOWNLOAD + data, "_blank").focus();
    }
  });
};

const exportToExcelAnalytyic = (id) => {
  console.log(id);
  $q.dialog({
    title: "Confirmation",
    message: `Do you want to export this data ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    const data = await postData(
      "get",
      null,
      `tos/exportAnalyticsQuestion/${id}`,
      false,
      false,
      true
    );
    if (data) {
      loading.value = false;
      window.open(process.env.API_DOWNLOAD + data, "_blank").focus();
    }
  });
};

const showHistory = async (email, id) => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `tos/showHistoryPerUser/${email}/${id}`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    $q.dialog({
      component: historicalAnswers,
      componentProps: {
        datas: data.data,
      },
      persistent: true,
    });
  }
};

watch(
  () => choosedData.value,
  (val) => {
    if (val.id && rows.value.length > 0) {
      clearInterval(intervalTable.value);
      intervalTable.value = setInterval(() => {
        onChooseData(val);
      }, 30000);
    } else {
      clearInterval(intervalTable.value);
    }
  }
);

onUnmounted(() => {
  clearInterval(intervalTable.value);
});
</script>
