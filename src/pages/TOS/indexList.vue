<template>
  <div class="q-pa-md">
    <q-table
      title="All Training"
      :rows="rows"
      :columns="columns"
      row-key="name"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <div>
            <q-badge
              :color="props.value === 'PASSED' ? 'green' : 'red'"
              :label="props.value"
            />
          </div>
          <div class="my-table-details">
            {{ props.row.details }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-btn
            @click="viewResult(props.row.id, props.row.forms)"
            icon="visibility"
            color="blue"
            flat
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import showQuizResultVue from "../CMS/Forms/showQuizResultDialog.vue";

const $q = useQuasar();
const { postData } = apiRequest();

const rows = ref([]);
const columns = ref([
  {
    name: "cfmt_title",
    required: true,
    label: "Training Title",
    align: "left",
    field: (row) => row.cfmt_title,
    sortable: true,
  },
  {
    name: "cfsd_start_quiz",
    required: true,
    label: "Quiz Start",
    align: "left",
    field: (row) => row.cfsd_start_quiz,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "cfsd_end_quiz",
    required: true,
    label: "Quiz End",
    align: "left",
    field: (row) => row.cfsd_end_quiz,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "last_answers",
    required: true,
    label: "Last Answers",
    align: "left",
    field: (row) => row.last_answers,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "tot_try",
    required: true,
    label: "Total Learning",
    align: "left",
    field: (row) => row.tot_try,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "cfm_val",
    required: true,
    label: "Grade",
    align: "left",
    field: (row) => row.cfm_val,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "status",
    required: true,
    label: "Grade Status",
    align: "left",
    field: (row) => row.status,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "action",
    required: true,
    label: "Grade Status",
    align: "left",
    field: (row) => row.id,
    sortable: true,
  },
]);

onMounted(() => {
  getData();
});

const getData = async () => {
  const data = await postData("get", null, `tos/training`, false, false, true);

  if (data && data.status) {
    rows.value = data.data;
  }
};

const viewResult = async (id, dataForms) => {
  $q.dialog({
    component: showQuizResultVue,
    componentProps: {
      resShow: 1,
      answerShow: 1,
      dataQuiz: dataForms,
      idQuiz: id,
    },
    persistent: true,
  }).onClose(() => {
    console.log("closed");
    // getData();
  });
};
</script>
