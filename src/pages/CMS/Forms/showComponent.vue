<template>
  <div>
    <div v-if="getNowData.length > 0">
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
                !Array.isArray(
                  getUserAnswers[idx] && getUserAnswers[idx][col.id]
                )
                  ? typeof getUserAnswers[idx][col.id] === 'string' &&
                    getUserAnswers[idx][col.id].startsWith('data:')
                    ? base64ToFile(
                        getUserAnswers[idx][col.id],
                        getFileNamefromBase64(getUserAnswers[idx][col.id])
                      )
                    : getUserAnswers[idx][col.id]
                  : ''
              "
              :ansArr="
                Array.isArray(
                  getUserAnswers[idx] && getUserAnswers[idx][col.id]
                )
                  ? getUserAnswers[idx][col.id]
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
    </div>
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
const refreshKeys = ref(0);
const props = defineProps({
  id: String,
  data: Array,
  setup: Object,
});

const forms = ref([]);
const isMountedTriggered = ref(false);

const getNowIdx = computed(() =>
  forms.value.findIndex((x) => x.seq_name == nowSeq.value)
);

const getNowData = computed(() =>
  forms.value.filter((x) => x.seq_name == nowSeq.value)
);

const getNextData = computed(() =>
  forms.value.filter((x) => x.seq_name == parseInt(nowSeq.value) + 1)
);

const getRequired = computed(() =>
  getNowData.value.filter((x) => x.content.filter((y) => y.required).length > 0)
);

const isFormsExists = computed(() =>
  forms.value.filter((x) =>
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
  findForms(forms.value);

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
  forms.value = props.data;
  if (props.setup && props.setup.isWizard) {
    nowSeq.value = forms.value[0].seq_name;
  } else {
    forms.value = updateRowSeqNames(forms.value, false);
    nowSeq.value = forms.value[0].seq_name;
  }

  store.restoreDefault();
  // console.log(getUserAnswers.value);

  logicsChecker("onMounted");
});

const base64ToFile = (base64, filename) => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const updateRowSeqNames = (data, add = false) => {
  return data.map((row, index) => {
    // Only modify if it's a row
    if (row.type === "row") {
      return {
        ...row, // Spread all existing properties
        seq_name: add ? (index + 1).toString() : "1", // Update seq_name based on index
      };
    }
    return row; // Return unchanged if not a row
  });
};

const logicsChecker = (valLogics, id = "") => {
  // console.log(getAllLogics.value);
  const getLogicsList = id
    ? getAllLogics.value.filter((val) => val.id == id)
    : getAllLogics.value.filter(
        (val) =>
          val.data.filter((x) => x.cfld_opr_ctrl === valLogics).length > 0
      );

  // console.log(getLogicsList);
  getLogicsList.map((val) => {
    let logicResult = false;
    let lastOperation = "||";
    val.data.some((valLogic, idx) => {
      if (
        valLogic.cfld_actions === "trigger" &&
        valLogic.cfld_opr_ctrl === "onMounted" &&
        isMountedTriggered.value === false
      ) {
        logicResult = true;
        isMountedTriggered.value = true;
      }

      if (valLogic.cfld_opr_ctrl !== valLogics) {
        if (valLogic.cfld_actions === "logic") {
          const compare = new Function("a", "b", `return a ${lastOperation} b`);

          logicResult = compare(
            logicResult,
            logicsConditionalChecker(val.id, valLogic)
          );
        }

        if (valLogic.cfld_actions === "logic_only") {
          lastOperation = valLogic.cfld_opr;
        }

        if (logicResult === true && valLogic.cfld_actions === "result") {
          console.log(
            "logicResult",
            logicResult,
            valLogic.cfld_opr_ctrl,
            valLogic.cfld_opr,
            valLogic.cfld_val
          );
          // console.log("result", valLogic);
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
  const prevVal = getUserAnswers.value[row]
    ? (() => {
        const ans = getUserAnswers.value[row][idDiv];
        if (typeof ans === "string" && ans.startsWith("data:")) {
          return base64ToFile(ans, getFileNamefromBase64(ans)).name;
        }
        // If both are File, compare by filename
        if (ans instanceof File) {
          return ans.name;
        }

        return ans;
      })()
    : undefined;

  const currVal = val instanceof File ? val.name : val;

  if (prevVal == currVal) {
    return;
  }

  if (val instanceof File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Get the original filename if available, otherwise fallback to val.name
      let filename = val && val.name ? val.name : "file";
      // If the base64 string contains a filename, extract it
      const base64 = e.target.result;
      const match = base64.match(/filename=([^;]+);?/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
      // Append filename to base64 string if not present
      let base64WithFilename = base64;
      if (!/filename=/.test(base64)) {
        // Insert filename before the base64 data
        base64WithFilename = base64.replace(
          /^data:([^;]+);/,
          `data:$1;filename=${encodeURIComponent(filename)};`
        );
      }

      store.addAnswersForm(row, idDiv, base64WithFilename);
      logicsChecker("onInput", idDiv);
    };

    reader.readAsDataURL(val);
    return;
  } else {
    store.addAnswersForm(row, idDiv, val);
    logicsChecker("onInput", idDiv);
  }

  // store.addAnswersForm(row, idDiv, val);
  // logicsChecker("onInput", idDiv);
};

const getFileNamefromBase64 = (base64) => {
  const match = base64.match(/filename=([^;]+);?/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  return "file";
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
      const listIDAnswer = Object.keys(flattenedAnswers.value).map(Number);

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

    console.log(resultReq);
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
      $q.notify({
        message: data.message,
        color: "green",
        icon: "check",
      });
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
  if (modifData === "hide_this_comp") {
    getCompByID.hidden = true;
  } else if (modifData === "show_this_comp") {
    getCompByID.hidden = false;
  } else if (modifData === "hide_comp") {
    getCompByTargetID.hidden = true;
  } else if (modifData === "show_comp") {
    getCompByTargetID.hidden = false;
  }

  // refreshKeys.value = refreshKeys.value + 1;

  const index = forms.value.findIndex((row) =>
    row.content && Array.isArray(row.content)
      ? row.content.some((item) => item.id === idComp)
      : false
  );
  if (index !== -1) {
    const row = forms.value[index];
    const updatedContent = row.content.map((item) => {
      if (item.id === idComp) {
        return { ...item, ...getCompByID };
      }
      if (item.id === targetModifID) {
        return { ...item, ...getCompByTargetID };
      }
      return item;
    });
    forms.value[index] = { ...row, content: updatedContent };
  }
};
</script>
