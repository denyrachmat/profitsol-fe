<template>
  <div class="q-pa-md bg-grey">
    <div class="row">
      <div class="col q-pa-md bg-white" style="border-radius: 10px">
        <div class="row">
          <div class="col-2 text-bold self-center">
            Question {{ nowSeq + 1 }} of {{ props.data.length }}
          </div>
          <div class="col">
            <div class="row">
              <div
                :class="`col-1 q-px-md`"
                style="height: 20px; width: 20px"
                v-for="idx in props.data.length"
                :key="idx"
              >
                <div
                  :class="getUserAnswers[idx - 1] ? 'bg-green' : 'bg-red'"
                  style="height: 20px; width: 20px"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col q-pa-md bg-white text-right" style="border-radius: 10px">
        <b v-if="getNowTimer"
          >{{ String(getNowTimer.hours).padStart(2, "0") }} :
          {{ String(getNowTimer.minutes).padStart(2, "0") }} :
          {{ String(getNowTimer.seconds).padStart(2, "0") }}</b
        >
      </div>
    </div>
    <div class="row q-pt-md">
      <div class="col bg-white" style="border-radius: 10px">
        <componentViewVue
          :type="getNowQuestion.content.component.category"
          :type-input="getNowQuestion.content.component.value.type"
          :comp="getNowQuestion.content.component.value.comp"
          :label="getNowQuestion.content.label"
          :detail="getNowQuestion.content.detail_data"
          :ans="
            !Array.isArray(getUserAnswers[nowSeq]) ? getUserAnswers[nowSeq] : ''
          "
          :ansArr="
            Array.isArray(getUserAnswers[nowSeq]) ? getUserAnswers[nowSeq] : []
          "
          @customChange="getAnswers"
          mode="live"
        />
      </div>
    </div>
    <div class="row q-pt-md">
      <div class="col bg-white q-pa-md" style="border-radius: 10px">
        <q-btn-group spread>
          <q-btn
            color="orange"
            label="Previous"
            :disable="nowSeq === 0"
            @click="onClickPrev()"
          />
          <q-btn
            color="green"
            :label="nowSeq === props.data.length - 1 ? 'Submit' : 'Next'"
            @click="
              nowSeq === props.data.length - 1 ? onClickSubmit() : onClickNext()
            "
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
import showQuizResultVue from "./showQuizResult.vue";

import { useFormStore } from "stores/formStore";

const store = useFormStore();

const $q = useQuasar();
const { postData } = apiRequest();

const nowSeq = ref(0);
const runningTimes = ref({});
const props = defineProps({
  data: Array,
  setup: Object,
});

const getNowQuestion = computed(() => {
  return props.data[nowSeq.value];
});

const getNowTimer = computed(() => {
  return store.getRunningTimers;
});

const getUserAnswers = computed(() => {
  return store.getUsersAnswer;
});

const onClickNext = () => {
  nowSeq.value = nowSeq.value + 1;
};

const onClickPrev = () => {
  nowSeq.value = nowSeq.value - 1;
};

const onClickSubmit = () => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure want to submit this quiz ?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.dialog({
      component: showQuizResultVue,
      componentProps: {
        resShow: parseInt(props.setup.showResult),
        answerShow: parseInt(props.setup.showRightKeysAnswer),
        dataQuiz: props.data,
      },
      persistent: true,
    });
  });
};

const getAnswers = (val) => {
  store.addAnswers(nowSeq.value, val);
};

onMounted(() => {
  store.timeData.hours =
    parseInt(props.setup.hourTimer) > 0 ? parseInt(props.setup.hourTimer) : 0;
  store.timeData.minutes =
    parseInt(props.setup.minTimer) > 0 ? parseInt(props.setup.minTimer) : 0;
  store.timeData.seconds =
    parseInt(props.setup.secTimer) > 0 ? parseInt(props.setup.secTimer) : 0;

  console.log(props.setup);
  if (!store.startTime) {
    store.startCountDown();
  }
});
</script>
