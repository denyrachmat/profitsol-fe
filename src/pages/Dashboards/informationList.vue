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
                    ? 'bg-orange'
                    : 'bg-green'
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
                        {{
                          row.answers.length > 0
                            ? `Already Answered on : ${date.formatDate(
                                row.answers[0].created_at,
                                "DD MMM YYYY HH:mm:ss"
                              )}`
                            : "Not Answered yet"
                        }}
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
import { date } from "quasar";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();
const emit = defineEmits(["infoView"]);

const rows = ref([]);
const loading = ref(false);

onMounted(() => {
  getData();
});

const getData = async () => {
  loading.value = true;
  const data = await postData("get", null, `portal/notif`, false, false, true);

  if (data) {
    setTimeout(() => {
      console.log(data);
    }, 1000);
    loading.value = false;
    rows.value = data.data;
  }
};

const clickView = (link) => {
  emit("infoView", link);
};
</script>
