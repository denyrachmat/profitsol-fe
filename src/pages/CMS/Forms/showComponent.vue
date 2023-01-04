<template>
  <div class="q-pa-md">
    <template v-if="getNowData.length > 0">
      <div class="row" v-for="(row, idx) in getNowData" :key="idx">
        <div class="col" v-for="(col, idx2) in row['content']" :key="idx2">
          <componentViewVue
            :type="col.content.component.category"
            :type-input="col.content.component.value.type"
            :comp="col.content.component.value.comp"
            :label="col.content.label"
            :detail="col.content.detail_data"
            mode="live"
            @customChange="(val) => getAnswers(idx, idx2, val)"
            :ans="
              getUserAnswers[idx] &&
              !Array.isArray(getUserAnswers[idx] && getUserAnswers[idx][idx2])
                ? getUserAnswers[idx][idx2]
                : ''
            "
            :ansArr="
              Array.isArray(getUserAnswers[idx] && getUserAnswers[idx][idx2])
                ? getUserAnswers[idx][idx2]
                : []
            "
            v-if="col.type === 'form'"
          />
          <div v-html="col.content" v-else-if="col.type === 'html'"></div>
          <div v-else>
            <showQuizComponentVue
              :data="col.content.forms"
              :setup="col.content.setupTraining"
            />
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="row">
        <div class="col">Nothing to show.</div>
      </div>
    </template>
    <div class="row q-pt-md">
      <div class="col">
        <q-btn-group spread>
          <q-btn
            color="accent"
            icon="arrow_back"
            :disable="getNowIdx === 0"
            @click="prevPage"
          />
          <q-btn
            color="green"
            icon="save"
            :disable="getNextData && getNextData.length !== 0"
          />
          <q-btn
            color="accent"
            icon="arrow_forward"
            @click="nextPage"
            :disable="!getNextData || getNextData.length === 0"
          />
        </q-btn-group>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import componentViewVue from "../componentView.vue";
import showQuizComponentVue from "./showQuizComponent.vue";
import { useFormStore } from "stores/formStore";

const store = useFormStore();
const $q = useQuasar();
const { postData } = apiRequest();

const nowSeq = ref(null);
const props = defineProps({
  data: Array,
});

const getNowIdx = computed(() =>
  props.data.findIndex((x) => x.seq_name == nowSeq.value)
);

const getNowData = computed(() =>
  props.data.filter((x) => x.seq_name == nowSeq.value)
);

const getNextData = computed(() =>
  props.data.filter((x) => x.seq_name == parseInt(nowSeq.value) + 1)
);

const getRequired = computed(() =>
  getNowData.value.filter((x) => x.content.filter((y) => y.required).length > 0)
);

const getUserAnswers = computed(() => {
  return store.getUsersAnswerForm;
});

const getAnswers = (row, col, val) => {
  store.addAnswersForm(row, col, val);
};

onMounted(() => {
  nowSeq.value = props.data[0].seq_name;
});

const nextPage = () => {
  nowSeq.value = parseInt(nowSeq.value) + 1;
};

const prevPage = () => {
  nowSeq.value = parseInt(nowSeq.value) - 1;
};
</script>
