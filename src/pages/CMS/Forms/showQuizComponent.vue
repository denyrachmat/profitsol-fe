<template>
  <div class="q-pa-md bg-grey">
    <div class="row" v-if="doneSubmiting">
      <div class="col window-height-60">
        <showQuizResultVue
          :resShow="props.setup.showResult"
          :answerShow="props.setup.showRightKeysAnswer"
          :dataQuiz="props.data"
          :idQuiz="props.id"
          :is-retry="true"
          class="full-width"
          @on-retry="onRetryClick"
        />
      </div>
    </div>

    <div v-else>
      <!-- Header: status -->
      <div class="row bg-grey q-gutter-sm">
        <!-- Status answers -->
        <div
          class="col q-pa-sm bg-white"
          style="border-radius: 10px"
          v-if="getFormsOnly"
        >
          <div class="row">
            <div class="col-3 text-bold self-center">
              Question
              {{
                (getFormsOnly.findIndex(
                  (form) => form.id === getNowQuestion?.id
                ) ?? -1) + 1
              }}
              of
              {{ getFormsOnly.length }}
            </div>

            <div class="col">
              <div class="row" v-if="getFormAnswers">
                <div
                  :class="`col-1 q-px-sm`"
                  style="height: 20px; width: 20px"
                  v-for="(q, idx) in getFormsOnly"
                  :key="q.id || idx"
                >
                  <div
                    :class="[
                      getFormAnswers[
                        getAllForms.findIndex((form) => form.id === q.id)
                      ]
                        ? 'bg-green'
                        : 'bg-red',
                      getNowQuestion?.id === q.id ? 'glow-effect' : '',
                    ]"
                    style="height: 15px; width: 15px"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timer if enabled -->
        <div
          class="col q-pa-md bg-white text-right"
          style="border-radius: 10px"
          v-if="
            store.timeData.hours ||
            store.timeData.minutes ||
            store.timeData.seconds
          "
        >
          <b v-if="getNowTimer">
            {{ String(getNowTimer.hours).padStart(2, "0") }} :
            {{ String(getNowTimer.minutes).padStart(2, "0") }} :
            {{ String(getNowTimer.seconds).padStart(2, "0") }}
          </b>
        </div>
      </div>

      <!-- HTML Material -->
      <div v-if="getNowHTML.length > 0">
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
          <div style="overflow: auto; max-height: 45vh">
            <div
              class="row"
              v-for="(htmlCont, idxhtm) in getNowHTML"
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

      <!-- Question -->
      <div
        class="row q-pt-md"
        v-if="getNowQuestion"
        style="overflow: auto; max-height: 80vh"
      >
        <div
          class="col bg-white q-pa-md"
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
              !Array.isArray(getFormAnswers[nowFormIndex])
                ? getFormAnswers[nowFormIndex]
                : ''
            "
            :ansArr="
              Array.isArray(getFormAnswers[nowFormIndex]) &&
              getFormAnswers[nowFormIndex]?.length > 0
                ? getFormAnswers[nowFormIndex]
                : []
            "
            @customChange="(val) => getAnswers(val)"
            mode="live"
            :key="'liveView'"
          />
        </div>
      </div>

      <!-- Action buttons -->
      <div class="sticky-bottom q-pt-md">
        <div class="col bg-white q-pa-md" style="border-radius: 10px">
          <q-btn-group spread>
            <q-btn
              color="orange"
              label="Previous"
              :disable="nowSeq === 0 && formsSeq === 0"
              @click="onClickPrev()"
              :loading="loading"
            />

            <q-btn
              color="green"
              :label="
                nowSeq === groupedFormsByPage.length - 1 &&
                formsSeq === groupedFormsByPage[nowSeq].length - 1
                  ? 'Submit'
                  : 'Next'
              "
              @click="
                nowSeq === groupedFormsByPage.length - 1 &&
                formsSeq === groupedFormsByPage[nowSeq].length - 1
                  ? onClickSubmit(props.idDet)
                  : onClickNext()
              "
              :disable="
                getNowData &&
                getNowData.type === 'html' &&
                props.setup &&
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
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

// Stores
import { useFormStore } from "stores/formStore";

// Components
import componentViewVue from "../componentView.vue";
import showQuizResultVue from "./showQuizResult.vue";

// Requests
import apiRequest from "src/components/apiRequest";

const store = useFormStore();
const $q = useQuasar();
const router = useRouter();
const { postData } = apiRequest();

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  setup: {
    type: Object,
    required: true,
  },
  idDet: {
    type: Number,
    required: false,
  },
});

const nowSeq = ref(0);
const formsSeq = ref(0);
const groupedFormsByPage = ref([]);
const groupedHTMLByPage = ref([]);
const groupedBySeq = ref([]);
const videoContainers = ref([]);
const loading = ref(false);
const doneSubmiting = ref(false);
const videoEnded = ref(false);

onMounted(async () => {
  await initializeQuiz();
  await setTimerForQuiz();

  if (props.setup) {
    if (props.setup.randomizeQuestion) {
      const formsOnly = getFormsOnly.value;
      const [shuffledForms, shufIdx] = shuffle(formsOnly);
      // Rebuild groupedFormsByPage with shuffled forms
      let formIndex = 0;
      groupedFormsByPage.value = groupedFormsByPage.value.map((page) => {
        return page.map((form) => {
          if (form.type === "form") {
            return shuffledForms[formIndex++];
          }
          return form;
        });
      });
    }
  }

  console.log(groupedHTMLByPage.value);
});

const getFormsOnly = computed(() =>
  props.data.filter((form) => form.type === "form")
);

const getFormAnswers = computed(() => store.getUsersAnswer || []);

// For Iitialize Start
const initializeQuiz = () => {
  // Group forms by page
  // console.log(props.data);
  doneSubmiting.value = false;
  store.restoreDefault();
  groupedBySeq.value = props.data.reduce((acc, form) => {
    const page = form.seq_name || 1;
    if (!acc[page - 1]) {
      acc[page - 1] = [];
    }
    acc[page - 1].push(form);
    return acc;
  }, []);

  groupedFormsByPage.value = props.data
    .reduce((acc, form) => {
      const page = form.seq_name || 1;
      if (!acc[page - 1]) {
        acc[page - 1] = [];
      }

      if (form.type === "form") acc[page - 1].push(form);
      return acc;
    }, [])
    // .filter((page) => page.length > 0)
    .sort((a, b) => {
      const seqA = a[0]?.seq_name || 1;
      const seqB = b[0]?.seq_name || 1;
      return seqA - seqB;
    });

  groupedHTMLByPage.value = props.data
    .reduce((acc, form) => {
      const page = form.seq_name || 1;
      if (!acc[page - 1]) {
        acc[page - 1] = [];
      }

      if (form.type === "html") acc[page - 1].push(form);
      return acc;
    }, [])
    .filter((page) => page.length > 0)
    .sort((a, b) => {
      const seqA = a[0]?.seq_name || 1;
      const seqB = b[0]?.seq_name || 1;
      return seqA - seqB;
    });

  nowSeq.value = 0;
};

const setTimerForQuiz = () => {
  if (props.setup?.setUpTimer) {
    store.setSetUpTimer = true;
    store.timeData.hours =
      parseInt(props.setup.hourTimer) > 0 ? parseInt(props.setup.hourTimer) : 0;
    store.timeData.minutes =
      parseInt(props.setup.minTimer) > 0 ? parseInt(props.setup.minTimer) : 0;
    store.timeData.seconds =
      parseInt(props.setup.secTimer) > 0 ? parseInt(props.setup.secTimer) : 0;
  }

  console.log(store.timeData);

  if (!store.getStartTimeState) store.startCountDown();
};
// For Iitialize End

// Getters for current question and timer
const getNowQuestion = computed(() => {
  if (groupedFormsByPage.value.length === 0) return null;

  const formsInPage = groupedFormsByPage.value[nowSeq.value] || [];

  return (
    formsInPage.filter((form) => form.type === "form")[formsSeq.value] || null
  );
});

const getNowHTML = computed(() => {
  if (groupedHTMLByPage.value.length === 0) return [];

  const formsInPage = groupedHTMLByPage.value[nowSeq.value] || [];
  return formsInPage.filter((form) => form && form.type === "html") || [];
});

const nowFormIndex = computed(() => {
  const formsInPage = groupedFormsByPage.value[nowSeq.value] || [];
  return props.data
    .filter((form) => form.type === "form")
    .findIndex((form) => form.id === getNowQuestion.value?.id);
});

const getAllForms = computed(
  () => props.data.filter((form) => form.type === "form") || []
);

const getNowData = computed(() => {
  const formsInPage = props.data[nowSeq.value] || [];
  return formsInPage[formsSeq.value] || null;
});

const setVideoContainerRef = (el, index) => {
  if (el) videoContainers.value[index] = el;
};

const onClickPrev = () => {
  if (formsSeq.value === 0) {
    if (nowSeq.value > 0) {
      nowSeq.value -= 1;
      formsSeq.value =
        groupedFormsByPage.value[nowSeq.value].length > 0
          ? groupedFormsByPage.value[nowSeq.value].length - 1
          : 0;
    }
  } else {
    formsSeq.value -= 1;
  }
  videoEnded.value = false;
  triggerFindVideo();
};

const onClickNext = () => {
  if (
    groupedFormsByPage.value[nowSeq.value].length > 0 &&
    !getFormAnswers.value[nowFormIndex.value]
  ) {
    $q.dialog({
      title: "Warning",
      message:
        "You're not answered the question yet, are you sure want to proceed ? (You can always go back to answer it)",
      ok: true,
      cancel: true,
      persistent: false,
    }).onOk(() => {
      toTheNext();
    });

    return;
  } else {
    toTheNext();
  }

  function toTheNext() {
    if (groupedFormsByPage.value[nowSeq.value].length > 0) {
      if (
        formsSeq.value ===
        groupedFormsByPage.value[nowSeq.value].length - 1
      ) {
        formsSeq.value = 0;
        nowSeq.value += 1;
      } else {
        formsSeq.value += 1;
      }
    } else {
      nowSeq.value += 1;
    }
    videoEnded.value = false;
    triggerFindVideo();
  }
};

const onClickSubmit = async (questId = [], passConfirm = false) => {
  let idList = [];
  getAllForms.value.map((val) => {
    idList.push(val.id);
  });

  if (passConfirm) {
    store.setFinishQuizState = true;

    const dataAnswers = [...getFormAnswers.value];

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

        doneSubmiting.value = true;
      }

      if (props.setup.showRightKeysAnswerLocation === "question") {
        return data;
      }

      loading.value = false;
    }
  } else {
    let dataAnswers = [...getFormAnswers.value];
    console.log(dataAnswers);
    $q.dialog({
      title: "Confirm",
      message: "Are you sure want to submit this quiz ?",
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      // console.log(dataOri.value);
      loading.value = true;

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
              dataQuiz: props.data,
              idQuiz: props.id,
            },
            persistent: true,
          });

          doneSubmiting.value = true;
        }

        if (props.setup.showRightKeysAnswerLocation === "question") {
          return data;
        }
      }
    });
  }
};

// ====== Video gating ======
const triggerFindVideo = () => {
  setTimeout(() => {
    videoContainers.value.forEach((container, index) => {
      if (!container) return;

      const videoElement = container.querySelector("video");
      if (videoElement) {
        videoElement.addEventListener("ended", () => {
          videoEnded.value = true;
        });
      } else {
        // If no video, allow next
        videoEnded.value = true;
      }
    });
  }, 600);
};

// ====== Shuffle (fixed) ======
const shuffle = (array) => {
  let currentIndex = array.length;
  let randomIndex;

  const shufIdx = [];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
    shufIdx.push(currentIndex);
  }
  return [array, shufIdx];
};

const getAnswers = (val) => {
  store.setUserAnswerAtIndex(nowFormIndex.value, val);
};

// Retry function
const onRetryClick = () => {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure want to retry this quiz ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    doneSubmiting.value = false;
    store.restoreDefault();
    nowSeq.value = 0;
    formsSeq.value = 0;
  });
};

// ===== Timer Watcher ======
const getNowTimer = computed(() => {
  return store.getRunningTimers;
});

watch(getNowTimer, (time) => {
  console.log("watcherr", props.setup.setUpTimer, store.getFinishQuizState);
  if (props.setup.setUpTimer && !store.getFinishQuizState) {
    // console.log(props.setup.setUpTimer);
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
<style scoped>
.glow-effect {
  border-radius: 50%;
  animation: blink 1s infinite;
}

@keyframes blink {
  0% {
    box-shadow: 0 0 10px 2px rgba(66, 165, 245, 1);
  }
  50% {
    box-shadow: 0 0 10px 2px rgba(66, 165, 245, 0.3);
  }
  100% {
    box-shadow: 0 0 10px 2px rgb(25, 128, 212);
  }
}
</style>
