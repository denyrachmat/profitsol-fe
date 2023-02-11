<template>
  <div class="q-pa-md bg-grey">
    <div class="row">
      <div class="col q-pa-md bg-white" style="border-radius: 10px">
        <div class="row">
          <div class="col-2 text-bold self-center">
            Question {{ nowSeq + 1 }} of {{ datanya.length }}
          </div>
          <div class="col">
            <div class="row">
              <div
                :class="`col-1 q-px-md`"
                style="height: 20px; width: 20px"
                v-for="idx in datanya.length"
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
    <div class="row q-pt-md" v-if="getNowQuestion">
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
            Array.isArray(getUserAnswers[nowSeq]) &&
            getUserAnswers[nowSeq].length > 0
              ? getUserAnswers[nowSeq]
              : []
          "
          @customChange="(val) => getAnswers(val)"
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
            :label="nowSeq === datanya.length - 1 ? 'Submit' : 'Next'"
            @click="
              nowSeq === datanya.length - 1
                ? onClickSubmit(props.idDet)
                : onClickNext()
            "
          />
        </q-btn-group>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed, watch } from "vue";
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
const datanya = ref([]);
const dataOri = ref([]);
const listQuestShuff = ref([]);
const props = defineProps({
  id: String,
  data: Array,
  setup: Object,
  idDet: Array,
});

onMounted(() => {
  store.timeData.hours =
    parseInt(props.setup.hourTimer) > 0 ? parseInt(props.setup.hourTimer) : 0;
  store.timeData.minutes =
    parseInt(props.setup.minTimer) > 0 ? parseInt(props.setup.minTimer) : 0;
  store.timeData.seconds =
    parseInt(props.setup.secTimer) > 0 ? parseInt(props.setup.secTimer) : 0;

  console.log(props.data);
  if (!store.startTime) {
    store.startCountDown();
  }

  if (props.data.length > 0) {
    dataOri.value = props.data;

    const dataShuf = shuffle(props.data, true);
    console.log(dataShuf);
    datanya.value = dataShuf[0];
    listQuestShuff.value = dataShuf[1];
  }
});

const shuffle = (array, idxOnly = false) => {
  let currentIndex = array.length,
    randomIndex;

  let shufIdx = [];
  let realData = [];
  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    realData.push(array[currentIndex]);
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];

    shufIdx.push(currentIndex);
  }

  if (idxOnly) {
    return [array, shufIdx];
  }
  return array;
};

const getNowQuestion = computed(() => {
  return datanya.value[nowSeq.value];
});

const getNowTimer = computed(() => {
  return store.getRunningTimers;
});

const getStartTimeState = computed(() => {
  return store.getStartTimeState;
});

const getUserAnswers = computed(() => {
  return store.getUsersAnswer;
});

const getFinishQuizState = computed(() => {
  return store.getFinishQuizState;
});

const onClickNext = async () => {
  if (props.setup.showRightKeysAnswerLocation === "end") {
    nowSeq.value = nowSeq.value + 1;
  } else {
    console.log(props.idDet[nowSeq.value]);
    const submiter = await onClickSubmit([props.idDet[nowSeq.value]]);
    if (submiter) {
      console.log(submiter);
    }
    // nowSeq.value = nowSeq.value + 1;
  }
};

const onClickPrev = () => {
  nowSeq.value = nowSeq.value - 1;
};

const onClickSubmit = async (questId = [], passConfirm = false) => {
  let idList = [];
  if (questId.length === listQuestShuff.value.length) {
    console.log(listQuestShuff.value);
    datanya.value.map((val) => {
      idList.push(val.id);
    });
  } else {
    idList = questId;
  }

  console.log({
    id: props.id,
    ans: getUserAnswers.value,
    questId: idList,
  });
  if (passConfirm) {
    const data = await postData(
      "post",
      {
        id: props.id,
        ans: getUserAnswers.value,
        questId: idList,
      },
      `cms/quiz`,
      false,
      false,
      true
    );

    if (data) {
      if (data.status) {
        $q.notify({
          message: data.message,
          color: "green",
        });

        $q.dialog({
          component: showQuizResultVue,
          componentProps: {
            resShow: props.setup.showResult,
            answerShow: props.setup.showRightKeysAnswer,
            dataQuiz: dataOri.value,
            idQuiz: props.id,
          },
          persistent: true,
        });
      }

      if (props.setup.showRightKeysAnswerLocation === "question") {
        return data;
      }
    }
  } else {
    console.log(idList);
    $q.dialog({
      title: "Confirm",
      message: "Are you sure want to submit this quiz ?",
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      console.log(dataOri.value);
      const data = await postData(
        "post",
        {
          id: props.id,
          ans: getUserAnswers.value,
          questId: idList,
        },
        `cms/quiz`,
        false,
        false,
        true
      );

      if (data) {
        if (data.status) {
          store.finishQuizImmediatelly();
          $q.notify({
            message: data.message,
            color: "green",
          });

          $q.dialog({
            component: showQuizResultVue,
            componentProps: {
              resShow: props.setup.showResult,
              answerShow: props.setup.showRightKeysAnswer,
              dataQuiz: dataOri.value,
              idQuiz: props.id,
            },
            persistent: true,
          });
        }

        if (props.setup.showRightKeysAnswerLocation === "question") {
          return data;
        }
      }
    });
  }
};

const getAnswers = (val) => {
  store.addAnswers(nowSeq.value, val);
};

watch(getNowTimer, (time) => {
  if (time.hours === 0 && time.minutes === 1 && time.seconds === 0) {
    $q.notify({
      message: "Your time to finish is 1 minute remaining !",
      color: "orange",
    });
  }

  if (time.hours === 0 && time.minutes === 0 && time.seconds === 30) {
    $q.notify({
      message: "Your time to finish is 30 seconds remaining, hurry up !!",
      color: "orange",
    });
  }

  if (
    !getFinishQuizState.value &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0
  ) {
    onClickSubmit(props.idDet, true);
  }
  console.log(time);
});
</script>
