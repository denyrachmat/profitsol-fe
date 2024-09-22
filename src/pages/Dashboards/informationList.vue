<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-list class="bg-white">
          <template v-if="rows.length > 0">
            <template v-for="(row, idx) in rows" :key="idx">
              <div
                :class="`row full-width ${
                  row.shared.forms.cfmt_quiz_flag == 0
                    ? 'bg-cyan'
                    : row.answers.length === 0
                    ? 'bg-red'
                    : row.listHasil.status === 'PASSED'
                    ? 'bg-green'
                    : 'bg-orange'
                }`"
                style="height: 10px"
              ></div>
              <q-item class="q-pb-md">
                <q-item-section>
                  <q-item-label
                    >{{ row.pnm_title }}:
                    <strong>{{
                      row.shared.forms.cfmt_title
                    }}</strong></q-item-label
                  >
                  <q-item-label caption lines="5">
                    <div v-html="row.pnm_content"></div>

                    <template v-if="row.shared.forms.cfmt_quiz_flag == 1">
                      <div v-if="row.pnm_start_date" class="q-pt-sm text-bold">
                        Start date:
                        {{
                          date.formatDate(
                            row.pnm_start_date,
                            "DD MMM YYYY HH:mm:ss"
                          )
                        }}
                      </div>
                      <div v-if="row.pnm_end_date" class="text-bold">
                        End date:
                        {{
                          date.formatDate(
                            row.pnm_end_date,
                            "DD MMM YYYY HH:mm:ss"
                          )
                        }}
                      </div>
                      <div class="q-pt-sm text-bold" style="font-size: 15px">
                        <div class="row">
                          <div class="col">
                            {{
                              row.answers.length > 0
                                ? `Already Answered on : ${date.formatDate(
                                    row.answers[0].created_at,
                                    "DD MMM YYYY HH:mm:ss"
                                  )}`
                                : "Not Answered yet"
                            }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </q-item-label>
                </q-item-section>

                <q-item-section side class="relative-position">
                  <q-btn
                    icon="visibility"
                    outline
                    round
                    dense
                    color="green"
                    @click="clickView(row)"
                    flat
                    :disable="
                      row.shared.forms.cfmt_quiz_flag == 1 &&
                      row.listHasil.status === 'PASSED'
                    "
                  />
                  <q-btn
                    icon="delete"
                    outline
                    round
                    dense
                    color="red"
                    @click="deleteNotif(row)"
                    flat
                    v-if="row.shared.forms.cfmt_quiz_flag == 0"
                  />
                </q-item-section>
              </q-item>
            </template>
          </template>
          <template v-else>
            <q-item>
              <q-item-label class="text-center">
                <strong>No new information</strong>
              </q-item-label>
            </q-item>
          </template>
        </q-list>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, computed, onMounted } from "vue";
import { date, useQuasar } from "quasar";
import { useAuthStore } from "src/stores/authStore";
import apiRequest from "src/components/apiRequest";

const store = useAuthStore();

const $q = useQuasar();
const { postData } = apiRequest();
const emit = defineEmits(["infoView"]);

const rows = ref([]);
const loading = ref(false);

onMounted(async () => {
  rows.value = store.getInformationList;

  getData();
});

const getData = async () => {
  loading.value = true;
  const data = await postData("get", null, `portal/notif`, false, false, true);

  if (data) {
    loading.value = false;
    rows.value = data.data;

    store.storeInformationList(rows.value);
  }
};

const clickView = (link) => {
  emit("infoView", link);
};

const deleteNotif = (row) => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure want to remove this notification ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const data = await postData(
      "delete",
      null,
      `portal/notif/${row.id}`,
      false,
      false,
      true
    );
    // console.log('>>>> OK')

    if (data) {
      getData();
    }
  });
};
</script>
