<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-list class="bg-white">
          <q-item v-for="(row, idx) in rows" :key="idx">
            <q-item-section>
              <q-item-label
                ><strong>{{ row.pnm_title }}</strong></q-item-label
              >
              <q-item-label caption lines="3">
                <div v-html="row.pnm_content"></div>
                <div
                  v-if="row.pnm_start_date"
                  class="q-pt-sm text-bold text-h6"
                >
                  Start date: {{ row.pnm_start_date }}
                </div>
                <div v-if="row.pnm_end_date" class="text-bold text-h6">
                  End date: {{ row.pnm_end_date }}
                </div>
              </q-item-label>
            </q-item-section>

            <q-item-section side class="relative-position">
              <q-btn
                icon="visibility"
                outline
                round
                dense
                color="green"
                @click="clickView(row.pnm_action_url)"
              />
            </q-item-section>
          </q-item>
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
