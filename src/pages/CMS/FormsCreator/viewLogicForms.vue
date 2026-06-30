<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <q-card-section class="q-pa-md">
        <div class="text-h6">Add Logics</div>
        <div class="text-subtitle2">
          You can add logics for your compoenent here
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row q-pb-md">
          <div class="col">
            <q-input
              filled
              v-model="title"
              label="Logics ID"
              type="text"
              dense
              disable
            />
          </div>
        </div>
        <div class="row q-pb-md">
          <div class="col">
            <q-input
              filled
              v-model="desc"
              label="Logics Description"
              type="text"
              dense
            />
          </div>
        </div>
        <fieldset
          style="
            border: 1px solid #ccc !important;
            border-radius: 16px;
            max-height: 73vh;
            overflow: auto;
          "
        >
          <legend>List Logics</legend>
          <div class="row">
            <div class="col">
              <span>
                When
                <q-chip color="green" text-color="white" icon="edit_note">{{
                  props.comp ? props.comp.content.label : ""
                }}</q-chip>
              </span>
            </div>
            <div class="col text-right">
              <q-btn
                color="orange"
                icon="add"
                label="Add Trigger"
                @click="onAddLogic('trigger')"
                outline
                :disable="listLogic.length > 0"
              />
              <q-btn
                color="primary"
                icon="add"
                label="Add Logic"
                @click="
                  onAddLogic(
                    listLogic[listLogic.length - 1]?.cfld_actions !== 'logic'
                      ? 'logic'
                      : 'logic_only'
                  )
                "
                outline
              />
              <q-btn
                color="green"
                icon="add"
                label="Add Action"
                outline
                @click="onAddLogic('result')"
                :disable="
                  listLogic.length === 0 ||
                  listLogic[listLogic.length - 1]?.cfld_actions === 'logic_only'
                "
              />
            </div>
          </div>
          <div v-if="listLogic.length === 0" class="q-pa-md text-center">
            Add logic by click + button above
          </div>
          <template v-else>
            <div
              class="row q-gutter-sm q-pt-sm"
              v-for="(item, index) in listLogic"
              :key="index"
            >
              <template v-if="item.cfld_actions === 'trigger'">
                <div class="col">
                  <q-select
                    filled
                    v-model="item.cfld_opr_ctrl"
                    :options="lisTrigger"
                    option-label="pgm_desc"
                    option-value="pgm_value"
                    label="Select Trigger"
                    emit-value
                    map-options
                    dense
                  />
                </div>
              </template>

              <template v-if="item.cfld_actions === 'logic_only'">
                <div class="col">
                  <q-select
                    filled
                    v-model="item.cfld_opr"
                    :options="listAction"
                    option-label="pgm_desc"
                    option-value="pgm_value"
                    label="Select Logic"
                    emit-value
                    map-options
                    dense
                  />
                </div>
              </template>

              <template v-if="item.cfld_actions === 'logic'">
                <div class="col">
                  <q-select
                    filled
                    v-model="item.cfld_opr"
                    :options="listAction"
                    option-label="pgm_desc"
                    option-value="pgm_value"
                    label="Select Logic"
                    emit-value
                    map-options
                    dense
                  />
                </div>

                <div class="col">
                  <q-select
                    filled
                    v-model="item.cfld_opr_ctrl"
                    :options="listActType"
                    option-label="pgm_desc"
                    option-value="pgm_value"
                    label="Select Type Action"
                    emit-value
                    map-options
                    dense
                  />
                </div>

                <div
                  class="col"
                  v-if="item.cfld_opr_ctrl && item.cfld_opr_ctrl !== 'null'"
                >
                  <template v-if="item.cfld_opr_ctrl === 'value'">
                    <q-input
                      filled
                      v-model="item.cfld_val"
                      label="Value"
                      type="text"
                      dense
                      v-if="
                        props.comp.content.component.category !== 'multiple'
                      "
                    />
                    <q-select
                      v-else
                      filled
                      v-model="item.cfld_val"
                      :options="props.comp.content.detail_data"
                      label="Select Value"
                      emit-value
                      map-options
                      dense
                    />
                  </template>
                  <q-select
                    v-else-if="item.cfld_opr_ctrl === 'comp'"
                    filled
                    v-model="item.cfld_val"
                    :options="listForms"
                    label="Select Component"
                    emit-value
                    map-options
                    dense
                  />
                  <q-select
                    v-else-if="item.cfld_opr_ctrl === 'user'"
                    v-model="item.cfld_val"
                    :options="optionsUsers"
                    multiple
                    label="Choose Users"
                    emit-value
                    map-options
                    use-chips
                    dense
                    filled
                    @filter="filterFnUsers"
                    :loading="loadingUsers"
                    use-input
                    input-debounce="300"
                  />
                  <q-select
                    v-else-if="item.cfld_opr_ctrl === 'role'"
                    v-model="item.cfld_val"
                    :options="optionsRoles"
                    multiple
                    label="Choose Roles"
                    emit-value
                    map-options
                    use-chips
                    dense
                    filled
                    @filter="filterFnRoles"
                    :loading="loadingRoles"
                    use-input
                    input-debounce="300"
                  />
                </div>
              </template>

              <template v-if="item.cfld_actions === 'result'">
                <div class="col">
                  <q-select
                    filled
                    v-model="item.cfld_res"
                    :options="listResultAct"
                    option-label="pgm_desc"
                    option-value="pgm_value"
                    label="Select Result Action"
                    emit-value
                    map-options
                    dense
                  />
                </div>
                <div class="col" v-if="item.cfld_res.includes('notif')">
                  <q-input
                    filled
                    v-model="item.cfld_val"
                    label="Value"
                    type="text"
                    dense
                  />
                </div>

                <div
                  class="col"
                  v-if="
                    item.cfld_res === 'show_comp' ||
                    item.cfld_res === 'hide_comp'
                  "
                >
                  <q-select
                    filled
                    v-model="item.cfld_val"
                    :options="listForms"
                    label="Select Component"
                    emit-value
                    map-options
                    dense
                  />
                </div>
              </template>

              <div class="col-1 text-right">
                <q-btn
                  color="red"
                  icon="delete"
                  @click="listLogic.splice(index, 1)"
                  outline
                >
                </q-btn>
              </div>
            </div>
            <q-separator spaced />
          </template>
        </fieldset>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onSubmit" color="primary" label="Submit" />
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  comp: Object,
  forms: Array,
  logic: Object,
});

const $q = useQuasar();
const { postData } = apiRequest();

const title = ref("");
const desc = ref("");
const lisTrigger = ref([]);
const listAction = ref([]);
const listLogic = ref([]);

const listForms = ref([]);
const listActType = ref([]);
const listResultAct = ref([]);
const optionsUsers = ref([]);
const optionsRoles = ref([]);
const loadingUsers = ref(false);
const loadingRoles = ref(false);

const getDefaultCfldValByCtrl = (ctrl) => {
  return ctrl === "user" ? [] : "";
};

const normalizeCfldVal = (ctrl, value) => {
  if (ctrl === "user" || ctrl === "role") {
    if (Array.isArray(value)) return value;
    if (value === "" || value == null) return [];
    return [value];
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const parseCfldValFromJson = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const toJsonString = (value) => {
  return JSON.stringify(value ?? "");
};

onMounted(async () => {
  listForms.value = props.forms
    .flatMap((form) => (form.type === "row" ? form.content : form))
    .filter((form) => form.type === "form")
    .map((form) => ({
      value: form.id,
      label: form.content.label,
    }));

  if (props.logic.data.length > 0) {
    title.value = props.logic.seq_name;
    desc.value = props.logic.seq_desc;
    listLogic.value = props.logic.data.map((item) => ({
      cfld_opr: item.cfld_opr,
      cfld_val: normalizeCfldVal(
        item.cfld_opr_ctrl,
        parseCfldValFromJson(item.cfld_val)
      ),
      cfld_opr_ctrl: item.cfld_opr_ctrl,
      cfld_res: item.cfld_res,
      cfld_actions: item.cfld_actions,
    }));
  }

  getListAction();
  getListActType();
  getListtrigger();
  getListResult();
});

const getListAction = async () => {
  const { data } = await postData(
    "get",
    null,
    `portal/gencode/MRS_LOGIC_OPR_LIST`,
    false,
    false,
    true
  );

  if (data) {
    console.log(data);
    listAction.value = data;
  }
};

const getListActType = async () => {
  const { data } = await postData(
    "get",
    null,
    `portal/gencode/MRS_LOGIC_OPR_ACTTYPE_LIST`,
    false,
    false,
    true
  );

  if (data) {
    console.log(data);
    listActType.value = data;
  }
};

const getListtrigger = async () => {
  const { data } = await postData(
    "get",
    null,
    `portal/gencode/MRS_LOGIC_TRIGGERS`,
    false,
    false,
    true
  );

  if (data) {
    console.log(data);
    lisTrigger.value = data;
  }
};

const getListResult = async () => {
  const { data } = await postData(
    "get",
    null,
    `portal/gencode/MRS_LOGIC_ACTION_COLS`,
    false,
    false,
    true
  );

  if (data) {
    console.log(data);
    listResultAct.value = data;
  }
};

const onAddLogic = async (type) => {
  listLogic.value.push({
    cfld_opr: "",
    cfld_val: getDefaultCfldValByCtrl(""),
    cfld_opr_ctrl: "",
    cfld_res: "",
    cfld_actions: type,
  });
};

watch(
  listLogic,
  (items) => {
    items.forEach((item) => {
      item.cfld_val = normalizeCfldVal(item.cfld_opr_ctrl, item.cfld_val);
    });
  },
  { deep: true }
);

const onSubmit = () => {
  if (listLogic.value.length === 0) {
    $q.notify({
      type: "negative",
      message: "Please add logics for your component",
    });
    return;
  }

  onDialogOK({
    seq_name: title.value,
    seq_desc: desc.value,
    data: listLogic.value.map((item) => ({
      ...item,
      cfld_val: toJsonString(item.cfld_val),
    })),
  });
};

const filterFnUsers = (val, update) => {
  if (val === "") {
    update(() => {
      getUsers().then((data) => {
        console.log(data);
        optionsUsers.value = data;
      });
    });
  } else {
    update(() => {
      getUsers().then((data) => {
        optionsUsers.value = data.filter((option) => {
          return option.label.toLowerCase().includes(val.toLowerCase());
        });
      });
    });
  }
};

const filterFnRoles = (val, update) => {
  if (val === "") {
    update(() => {
      getRoles().then((data) => {
        console.log(data);
        optionsRoles.value = data;
      });
    });
  } else {
    update(() => {
      getRoles().then((data) => {
        optionsRoles.value = data.filter((option) => {
          return option.label.toLowerCase().includes(val.toLowerCase());
        });
      });
    });
  }
};

const getUsers = async () => {
  try {
    loadingUsers.value = true;
    const data = await postData(
      "get",
      null,
      "portal/users/ActiveOnly",
      false,
      false,
      true
    );
    if (data?.data) {
      return data.data.map((user) => {
        return {
          label: user.pud_first_name + " " + user.pud_last_name,
          value: user.username,
        };
      });
    }
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  } finally {
    loadingUsers.value = false;
  }
};

const getRoles = async () => {
  try {
    loadingRoles.value = true;
    const data = await postData(
      "get",
      null,
      "portal/roles",
      false,
      false,
      true
    );
    if (data?.data) {
      return data.data.map((role) => {
        return {
          label: role.rm_role_name,
          value: role.id,
        };
      });
    }
  } catch (error) {
    console.error("Error loading roles:", error);
    return [];
  } finally {
    loadingRoles.value = false;
  }
};
</script>
