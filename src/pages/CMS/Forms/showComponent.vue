<template>
  <div>
    <template v-if="getNowData.length > 0">
      <div class="row q-gutter-md" v-for="(row, idx) in getNowData" :key="idx">
        <template v-for="(col, idx2) in row['content']">
          <div class="col q-pt-md" :key="idx2" v-if="!col.hidden">
            <componentViewVue
              :type="col.content.component.category"
              :type-input="col.content.component.value.type"
              :comp="col.content.component.value.comp"
              :label="
                col.required ? `${col.content.label} *` : col.content.label
              "
              :detail="col.content.detail_data"
              :is-required="col.required"
              mode="live"
              @customChange="(val) => getAnswers(idx, idx2, val, col.id)"
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
                :id="col.content.id"
              />
            </div>
          </div>
        </template>
      </div>
    </template>
    <template v-else>
      <div class="row">
        <div class="col">Nothing to show.</div>
      </div>
    </template>
    <div class="row q-pt-md">
      <div class="col absolute-bottom">
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
            v-if="isFormsExists.length > 0"
            @click="onSubmitData"
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
  id: String,
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

const isFormsExists = computed(() =>
  props.data.filter((x) =>
    x.content.length > 0
      ? x.content.filter((y) => y.type === "form").length > 0
      : []
  )
);

const formItems = computed(() => {
  const result = [];

  // Recursive function to find all form items
  function findForms(items) {
    items.forEach((item) => {
      if (item.type === "form") {
        result.push(item);
      }
      if (item.content && Array.isArray(item.content)) {
        findForms(item.content);
      }
    });
  }

  // Start with the root data array
  findForms(props.data);

  return result;
});

const getUserAnswers = computed(() => {
  return store.getUsersAnswerForm;
});

const getAllLogics = computed(() => {
  return formItems.value.flatMap((item) =>
    (item.logics || []).map((logic) => ({ ...logic, id: item.id }))
  );
});

onMounted(() => {
  nowSeq.value = props.data[0].seq_name;

  logicsChecker("onMounted");
  console.log(getAllLogics.value);
});

const logicsChecker = (valLogics, id = "") => {
  const getLogicsList = id
    ? getAllLogics.value.filter((val) => val.id == id)
    : getAllLogics.value;

  getLogicsList.map((val) => {
    let logicResult = false;
    let lastOperation = "||";
    val.data.some((valLogic, idx) => {
      if (valLogic.cfld_opr_ctrl !== valLogics) {
        if (valLogic.cfld_actions === "logic") {
          const compare = new Function("a", "b", `return a ${lastOperation} b`);

          logicResult = compare(
            logicResult,
            logicsConditionalChecker(val.id, valLogic)
          );
        } else {
          logicResult = true;
        }

        if (valLogic.cfld_actions === "logic_only") {
          lastOperation = valLogic.cfld_opr;
        }

        if (logicResult && valLogic.cfld_actions === "result") {
          console.log("result", valLogic);
          modifyComponent(val.id, valLogic.cfld_res, valLogic.cfld_val);
        }
      }
    });
  });

  console.log(formItems.value);
};

const logicsConditionalChecker = (idComp, data) => {
  const getAnswersofComp = Object.values(getUserAnswers.value).find(
    (val) => val[idComp] !== undefined
  )?.[idComp];

  let valueComparation;
  if (data.cfld_opr_ctrl === "value") {
    valueComparation = data.cfld_val;
  } else {
    valueComparation = getUserAnswers.value.find(
      (val) => val[data.cfld_val] !== undefined
    );
  }

  const compare = new Function("a", "b", `return a ${data.cfld_opr} b`);
  return compare(getAnswersofComp, valueComparation);
};

const getQuizData = (data, key = 0, hasil = []) => {
  if (data[key]) {
    if (data[key].type == "quiz") {
      hasil.push(data[key]);
    } else {
      if (data[key].type === "row") {
        getQuizData(data[key].content, 0, hasil);
      } else {
        getQuizData(data, key + 1, hasil);
      }
    }

    if (data[key + 1]) {
      getQuizData(data, key + 1, hasil);
    } else {
      return hasil;
    }
  }

  return hasil;
};

const getRequiredForm = (data, key = 0, rows = 0, hasil = []) => {
  if (data[key]) {
    if (data[key].type == "form" && data[key].required === true) {
      hasil.push({
        data: data[key],
        answers: getUserAnswers.value[rows]
          ? getUserAnswers.value[rows][key]
          : "",
      });
    } else {
      if (data[key].type === "row") {
        getRequiredForm(data[key].content, 0, key, hasil);
      } else {
        getRequiredForm(data, key + 1, rows, hasil);
      }
    }

    // console.log(data[key + 1]);
    if (data[key + 1]) {
      getRequiredForm(data, key + 1, rows, hasil);
    }
  }

  return hasil;
};

const getAnswers = (row, col, val, idDiv) => {
  console.log([row, col, val, idDiv]);
  store.addAnswersForm(row, idDiv, val);
  logicsChecker("onInput", idDiv);
};

const nextPage = () => {
  if (
    getRequiredForm(getNowData.value).filter((val) => val.answers === "")
      .length > 0
  ) {
    getRequiredForm(getNowData.value).map((valMap) => {
      console.log(valMap);
      $q.notify({
        message: `<b>${valMap.data.content.label}</b> is still empty, please fill this field`,
        color: "red",
        html: true,
      });
    });
  } else {
    if (getQuizData(getNextData.value).length > 0) {
      $q.dialog({
        title: "Quiz Start",
        message:
          "If you click ok, quiz will be started immediately, do you want to continue ?",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        nowSeq.value = parseInt(nowSeq.value) + 1;
      });
    } else {
      nowSeq.value = parseInt(nowSeq.value) + 1;
    }
  }
};

const onSubmitData = () => {
  const getRequiredFormData = formItems.value.filter(
    (val) => val.required === true && val.type === "form"
  );

  // Check if any required form data is empty
  // If so, show a notification for each empty field
  // and return false to prevent submission
  if (getRequiredFormData.length > 0) {
    const flattenedAnswers = computed(() => {
      return Object.assign({}, ...getUserAnswers.value);
    });

    let resultReq = [];
    getRequiredFormData.map((valMap) => {
      const listIDAnswer = Object.keys(flattenedAnswers.value);

      if (!listIDAnswer.includes(valMap.id)) {
        resultReq.push({
          id: valMap.id,
          ans: flattenedAnswers.value[valMap.id],
        });

        $q.notify({
          message: `<b>${valMap.content.label}</b> is still empty, please fill this field`,
          color: "red",
          html: true,
        });
      }
    });

    if (resultReq.length > 0) {
      return false;
    }
  }

  $q.dialog({
    title: "Confirm",
    message: "Would you like to submit this form ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const data = await postData(
      "post",
      {
        id: props.id,
        ans: getUserAnswers.value,
      },
      `cms/storeAnswers`,
      false,
      true,
      true
    );

    if (data) {
      store.restoreDefault();
    }
  });
};

const prevPage = () => {
  nowSeq.value = parseInt(nowSeq.value) - 1;
};

const modifyComponent = (idComp, modifData, targetModifID = 0) => {
  const getCompByID = formItems.value.find((val) => val.id == idComp) || {};
  const getCompByTargetID =
    formItems.value.find((val) => val.id == targetModifID) || {};

  console.log(targetModifID);
  console.log(getCompByTargetID);
  if (modifData === "hide_this_comp") {
    getCompByID.hidden = true;
  } else if (modifData === "show_this_comp") {
    getCompByID.hidden = false;
  } else if (modifData === "hide_comp") {
    getCompByTargetID.hidden = true;
  } else if (modifData === "show_comp") {
    getCompByTargetID.hidden = false;
  }

  const index = formItems.value.findIndex((val) => val.id === idComp);
  if (index !== -1) {
    formItems.value[index] = { ...getCompByID, ...getCompByTargetID };
  }
};
</script>
