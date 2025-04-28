<template>
  <div class="q-pa-md bg-grey">
    <div class="row" v-if="doneSubmiting">
      <div class="col text-center">
        <span class="text-h3 text-bold">
          You've already answers the question, click OK for close this dialog
        </span>

        <div class="q-pt-md">
          <q-btn label="Show Result" color="green" @click="showResult()" />
        </div>
      </div>
    </div>
    <div v-else>
      <div class="row bg-grey">
        <div class="col q-pa-sm bg-white" style="border-radius: 10px">
          <div class="row">
            <div class="col-3 text-bold self-center">
              Question {{ nowSeq + 1 }} of
              {{ datanya.length }}
            </div>
            <div class="col">
              <div class="row">
                <div
                  :class="`col-1 q-px-sm`"
                  style="height: 20px; width: 20px"
                  v-for="idx in datanya.length"
                  :key="idx"
                >
                  <div
                    :class="getUserAnswers[idx - 1] ? 'bg-green' : 'bg-red'"
                    style="height: 15px; width: 15px"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="col q-pa-md bg-grey text-right"
          style="border-radius: 10px"
          v-if="
            store.timeData.hours ||
            store.timeData.minutes ||
            store.timeData.seconds
          "
        >
          <b v-if="getNowTimer"
            >{{ String(getNowTimer.hours).padStart(2, "0") }} :
            {{ String(getNowTimer.minutes).padStart(2, "0") }} :
            {{ String(getNowTimer.seconds).padStart(2, "0") }}</b
          >
        </div>
      </div>
      <div v-if="checkAnySameHTML.length > 0">
        <div class="row q-py-sm">
          <div class="col bg-white text-bold q-pa-sm">
            Please read material below, or use option on the right to download
            or view material on the other tab.
          </div>
          <div class="col text-right bg-white">
            <q-btn
              icon="open_in_new"
              flat
              @click="onClickOpenNewTabHTML(props.id, nowSeq)"
            >
              <q-tooltip>Open in new tab</q-tooltip>
            </q-btn>
            <q-btn
              icon="download"
              flat
              @click="onClickDownloadMaterial(props.id)"
            >
              <q-tooltip>Download and view as PDF</q-tooltip>
            </q-btn>
          </div>
        </div>
        <div
          style="border-radius: 10px; padding: 15px"
          class="bg-white q-pt-sm"
        >
          <div style="overflow: auto; max-height: 70vh">
            <div
              class="row"
              v-for="(htmlCont, idxhtm) in checkAnySameHTML"
              :key="idxhtm"
            >
              <div
                class="col bg-white"
                style="border-radius: 10px; padding: 15px"
              >
                <div
                  :ref="(el) => setVideoContainerRef(el, idxhtm)"
                  v-html="htmlCont.content"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row q-pt-md" v-if="getNowQuestion">
        <div
          class="col bg-white"
          style="border-radius: 10px"
          v-if="getNowQuestion.type === 'form'"
        >
          <componentViewVue
            :type="getNowQuestion.content.component.category"
            :type-input="getNowQuestion.content.component.value.type"
            :comp="getNowQuestion.content.component.value.comp"
            :label="getNowQuestion.content.label"
            :detail="getNowQuestion.content.detail_data"
            :is-required="true"
            :ans="
              !Array.isArray(getUserAnswers[nowSeq])
                ? getUserAnswers[nowSeq]
                : ''
            "
            :ansArr="
              Array.isArray(getUserAnswers[nowSeq]) &&
              getUserAnswers[nowSeq].length > 0
                ? getUserAnswers[nowSeq]
                : []
            "
            @customChange="(val) => getAnswers(val)"
            mode="live"
            :key="'liveView'"
          />
        </div>
      </div>
      <div class="absolute-bottom">
        <div class="col bg-white q-pa-md" style="border-radius: 10px">
          <q-btn-group spread>
            <q-btn
              color="orange"
              label="Previous"
              :disable="nowSeq === 0"
              @click="onClickPrev()"
              :loading="loading"
            />
            <q-btn
              color="green"
              :label="nowSeq === datanya.length - 1 ? 'Submit' : 'Next'"
              @click="
                nowSeq === datanya.length - 1
                  ? onClickSubmit(props.idDet)
                  : onClickNext()
              "
              :disable="
                getNowQuestion &&
                getNowQuestion.type === 'html' &&
                props.setup.skipNextButtonMedia &&
                !videoEnded
                  ? true
                  : false
              "
              :loading="loading"
            />
          </q-btn-group>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed, watch, nextTick } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import componentViewVue from "../componentView.vue";
import showQuizResultVue from "./showQuizResult.vue";

import { useFormStore } from "stores/formStore";
import { useRouter, useRoute } from "vue-router";

const route = useRouter();

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

const doneSubmiting = ref(0);
const videoContainer = ref(null); // Reference to the container holding the video
const videoContainers = ref([]);
const videoEnded = ref(false); // State to track if the video has ended
const loading = ref(false);

const setVideoContainerRef = (el, index) => {
  if (el) {
    videoContainers.value[index] = el; // Store the ref in the array
  }
};

onMounted(() => {
  console.log(props);
  // console.log(store.timeData);
  if (
    props.setup &&
    props.setup.setUpTimer
    // && (store.timeData.hours || store.timeData.minutes || store.timeData.seconds)
  ) {
    store.setSetUpTimer = true;
    store.timeData.hours =
      parseInt(props.setup.hourTimer) > 0 ? parseInt(props.setup.hourTimer) : 0;
    store.timeData.minutes =
      parseInt(props.setup.minTimer) > 0 ? parseInt(props.setup.minTimer) : 0;
    store.timeData.seconds =
      parseInt(props.setup.secTimer) > 0 ? parseInt(props.setup.secTimer) : 0;
  }

  if (!store.startTime) {
    store.startCountDown();
  }

  if (props.data.length > 0) {
    dataOri.value = props.data;

    if (props.setup.randomizeQuestion) {
      const dataShuf = shuffle(
        props.data.filter((val) => val.type === "form"),
        true
      );

      const dataHtml = props.data.filter((val) => val.type === "html");
      let shuffledData = [];
      if (props.setup.randomizeQuestion && props.setup.maxQuestionCount > 0) {
        shuffledData = dataShuf[0].slice(0, props.setup.maxQuestionCount);
      }
      datanya.value = [...dataHtml, ...shuffledData];
      console.log(datanya.value);
      listQuestShuff.value = dataShuf[1];
    } else {
      datanya.value = props.data.filter((val) => val.type === "form");
    }
  }

  if (props.setup.skipNextButtonMedia) {
    triggerFindVideo();
  }
});

const triggerFindVideo = () => {
  setTimeout(() => {
    console.log(videoContainers.value);
    videoContainers.value.forEach((container, index) => {
      console.log(container);
      if (container) {
        const videoElement = container.querySelector("video");
        console.log(videoElement);
        if (videoElement) {
          // Attach the "ended" event listener
          videoElement.addEventListener("ended", () => {
            console.log(`Video ${index} done`);
            videoEnded.value = true; // Update state when the video ends
          });
        } else {
          console.error(`Video element not found in container ${index}.`);
          videoEnded.value = true;
        }
      }
    });
  }, 3000);
};

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
  console.log(datanya.value);
  console.log(nowSeq.value);
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

const checkAnySameHTML = computed(() => {
  if (getNowQuestion.value) {
    console.log(getNowQuestion.value.seq_name);
    console.log(
      Object.values(
        props.data.filter(
          (val) =>
            val.type == "html" && val.seq_name == getNowQuestion.value.seq_name
        )
      )
    );
    return Object.values(
      props.data.filter(
        (val) =>
          val.type == "html" && val.seq_name == getNowQuestion.value.seq_name
      )
    );
  }

  return false;
});

const onClickNext = async () => {
  if (props.setup.showRightKeysAnswerLocation === "end") {
    if (datanya.value[nowSeq.value].type === "html") {
      getAnswers("html");
    }

    const getAnsw = getUserAnswers.value[nowSeq.value];
    if (!getAnsw) {
      $q.dialog({
        title: "Confirm",
        message:
          "You're not answering this question, make sure answers before submiting.",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        getAnswers(null);
        nowSeq.value = nowSeq.value + 1;
      });
    } else {
      nowSeq.value = nowSeq.value + 1;
    }
  } else {
    console.log(props.idDet[nowSeq.value]);
    const submiter = await onClickSubmit([props.idDet[nowSeq.value]]);
    if (submiter) {
      console.log(submiter);
    }
    // nowSeq.value = nowSeq.value + 1;
  }

  videoEnded.value = false;
  triggerFindVideo();
};

const onClickPrev = () => {
  nowSeq.value = nowSeq.value - 1;
};

const onClickSubmit = async (questId = [], passConfirm = false) => {
  let idList = [];
  if (questId.length === listQuestShuff.value.length) {
    console.log(listQuestShuff.value);
    datanya.value
      .filter((val) => val.type == "form")
      .map((val) => {
        idList.push(val.id);
      });
  } else {
    datanya.value
      .filter((val) => val.type == "form")
      .map((val) => {
        idList.push(val.id);
      });
    // idList = questId;
  }

  // console.log({
  //   id: props.id,
  //   ans: getUserAnswers.value,
  //   questId: idList,
  // });
  if (passConfirm) {
    store.setFinishQuizState = true;

    const dataAnswers = [...getUserAnswers.value];
    console.log(dataAnswers);
    loading.value = true;
    const data = await postData(
      "post",
      {
        id: props.id,
        ans: dataAnswers,
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

        doneSubmiting.value = 1;
      }

      if (props.setup.showRightKeysAnswerLocation === "question") {
        return data;
      }

      loading.value = false;
    }
  } else {
    $q.dialog({
      title: "Confirm",
      message: "Are you sure want to submit this quiz ?",
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      console.log(dataOri.value);
      loading.value = true;

      let dataAnswers = [...getUserAnswers.value];
      dataAnswers = dataAnswers.filter((fil) => fil !== "html");

      const data = await postData(
        "post",
        {
          id: props.id,
          ans: dataAnswers,
          questId: idList,
        },
        `cms/quiz`,
        false,
        false,
        true
      );

      if (data) {
        loading.value = false;
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

          doneSubmiting.value = 1;
        }

        if (props.setup.showRightKeysAnswerLocation === "question") {
          return data;
        }
      }
    });
  }
};

const showResult = () => {
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
};

const getAnswers = (val) => {
  store.addAnswers(nowSeq.value, val);
};

const onClickOpenNewTabHTML = (idQuiz, pageNumber) => {
  const { href } = route.resolve({
    path: "showHTMLTraining",
    query: {
      data: idQuiz,
    },
  });
  window.open(href, "_blank");
};

const onClickDownloadMaterial = async (idQuiz) => {
  const response = await postData(
    "post",
    null,
    `cms/downloadHTMLMaterial/${idQuiz}`,
    false,
    false,
    true
  );

  if (response) {
    let pdfWindow = window.open("");
    pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='data:application/pdf;base64, " +
        encodeURI(response) +
        "'></iframe>"
    );
  }
};

watch(getNowTimer, (time) => {
  // console.log("watcherr", props.setup.setUpTimer);
  if (props.setup.setUpTimer === true && !getFinishQuizState.value) {
    console.log(props.setup.setUpTimer);
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

    if (time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
      console.log("abis boy waktunya");
      onClickSubmit(props.idDet, true);
      store.finishQuizImmediatelly();
    }
    console.log(time);
  }
});
</script>
