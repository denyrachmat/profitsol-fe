<template>
  <div>
    <div
      class="row bg-blue-2 q-pa-md"
      v-for="(child, idxChild) in commands"
      :key="idxChild"
    >
      <div class="col-6">
        <div class="text-h6">Step {{ idxChild + 1 }}</div>
      </div>
      <div class="col-6 text-right">
        <q-toggle
          v-model="child.prcd_isactive"
          label="Active ?"
          color="green"
          dense
          outlined
        />
      </div>
      <div class="col-12 q-pb-md">
        <q-btn-toggle
          v-model="child.type"
          label="Active ?"
          toggle-color="green"
          color="white"
          text-color="black"
          dense
          spread
          :options="[
            { label: 'Actions', value: 'action' },
            { label: 'Logics', value: 'logics' },
          ]"
          @update:model-value="
            if (child.prcd_action) child.prcd_action.defaultValue = '';
          "
        >
        </q-btn-toggle>
      </div>

      <!-- Choose Action or Logic -->
      <div class="col-11 q-pa-sm">
        <q-select
          v-model="child.prcd_action"
          :options="listActions"
          label="Action"
          dense
          outlined
          map-options
          emit-value
          @update:model-value="handleActionChange(idxChild, child.type, $event)"
          v-if="child.type === 'action'"
        />
        <q-select
          v-model="child.prcd_action"
          :options="listLogics"
          label="Logic"
          dense
          outlined
          map-options
          emit-value
          @update:model-value="handleActionChange(idxChild, child.type, $event)"
          v-else-if="child.type === 'logics'"
        />
      </div>

      <div class="col text-right">
        <q-btn
          icon="delete"
          dense
          color="negative"
          @click="commands.splice(idxChild, 1)"
        />
      </div>

      <!-- If Action has children -->
      <template v-if="child.prcd_action?.children">
        <template
          v-for="(childAction, idxChildAction) in child.prcd_action.children"
          :key="idxChildAction"
        >
          <div
            class="col-12 col-md-6"
            style="padding: 8px"
            v-if="
              childAction.type.split('|')[0] == 'input' &&
              checkValidationParam(childAction.type, child.prcd_action.children)
            "
          >
            <q-input
              v-model="childAction.defaultValue"
              :label="childAction.label"
              dense
              outlined
            />
          </div>
          <div
            class="col-12 col-md-6"
            style="padding: 8px"
            v-else-if="
              childAction.type.split('|')[0] == 'select' &&
              checkValidationParam(childAction.type, child.prcd_action.children)
            "
          >
            <q-select
              v-model="childAction.defaultValue"
              :options="childAction.optValue"
              :label="childAction.label"
              dense
              outlined
              emit-value
              map-options
            />
          </div>

          <div
            class="col-12 col-md-6"
            style="padding: 8px"
            v-else-if="
              childAction.type.includes('select_parameter') &&
              checkValidationParam(childAction.type, child.prcd_action.children)
            "
          >
            <q-select
              v-model="childAction.defaultValue"
              :options="props.listParam"
              :label="childAction.label"
              dense
              outlined
              emit-value
              map-options
              option-value="prpd_param_name"
              option-label="prpd_param_desc"
            />
          </div>
          <div
            class="col-12 col-md-6"
            style="padding: 8px"
            v-else-if="
              childAction.type.includes('select_step') &&
              checkValidationParam(childAction.type, child.prcd_action.children)
            "
          >
            <q-select
              v-model="childAction.defaultValue"
              :options="
                commands.value.reduce((arr, c, idx) => {
                  if (c.type !== 'logics') {
                    arr.push({
                      value: c.prcd_action.idx,
                      label: `Step ${idx + 1} - (${c.prcd_action.label})`,
                    });
                  }
                  return arr;
                }, [])
              "
              :label="childAction.label"
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div
            class="col-12 col-md-6"
            style="padding: 8px"
            v-else-if="
              childAction.type.split('|')[0] == 'select_var' &&
              checkValidationParam(childAction.type, child.prcd_action.children)
            "
          >
            <q-select
              v-model="childAction.defaultValue"
              :options="getListVariableFromLogic"
              :label="childAction.label"
              dense
              outlined
              emit-value
              map-options
              option-value="prpd_param_name"
              option-label="prpd_param_desc"
            />
          </div>
          <div
            class="col-12 col-md-6"
            style="padding: 8px"
            v-else-if="childAction.type === 'radio'"
          >
            <span class="text-bold">{{ childAction.label }}</span>
            <q-option-group
              v-model="childAction.defaultValue"
              :options="childAction.optValue"
              color="primary"
            />
          </div>
        </template>
      </template>
      <template v-else>
        <div class="col-12 q-pa-sm">
          <i>No parameters needed for this action/logic</i>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();
const props = defineProps({
  selectedCommand: Array,
  listParam: Array,
  rpaType: String,
});

const commands = ref([]);

onMounted(() => {
  getListActions().then((actions) => {
    listActions.value = actions;
  });

  getListLogics().then((logics) => {
    listLogics.value = logics;
  });

  commands.value = props.selectedCommand;
});

const listActions = ref([]);
const listLogics = ref([]);

const getListVariableFromLogic = computed(() => {
  const variables = [];
  commands.value.forEach((cmd) => {
    cmd.prcd_children.forEach((child) => {
      if (child.type === "logics" && child.prcd_action?.value === "set_var") {
        let dataChild = child.prcd_action.children.find(
          (c) => c.value === "var_name"
        );
        variables.push({
          label: dataChild?.label + " = " + dataChild?.defaultValue,
          value: dataChild?.defaultValue,
        });
      }
    });
  });
  return variables;
});

const checkValidationParam = (typeCheck, listGencode) => {
  const paramType = typeCheck.split("|");
  if (paramType.length > 1) {
    const id = paramType[1];
    const param = listGencode.find((p) => p.idx === id);
    const valueComp = paramType[2] || "parameter";
    return param && param.defaultValue === valueComp;
  }

  return true;
};

const handleActionChange = (idxChild, typeAction, newValue) => {
  console.log([commands.value, idxChild, typeAction, newValue]);
  const selectedAction =
    typeAction === "action"
      ? listActions.value.find((action) => action.value === newValue)
      : listLogics.value.find((logic) => logic.value === newValue);

  if (selectedAction) {
    console.log("Selected Action/Logic:", selectedAction);
    // commands.value[idxChild].prcd_action = selectedAction;
    commands.value[idxChild].prcd_action = JSON.parse(
      JSON.stringify(selectedAction)
    );
  }
};

const getListActions = async () => {
  try {
    const { data } = await postData(
      "post",
      {
        id: "RPA_ACTION_LIST",
        selectAs: {
          idx: "id",
          value: "pgm_value2|string",
          defaultValue: "pgm_value3|string",
          label: "pgm_desc",
          optValue: "pgm_desc2|array",
          type: "pgm_desc3",
          children: "children",
        },
        filter: {
          pgm_value: props.rpaType,
        },
        withParents: true,
      },
      `portal/gencode/showDetail/RPA_ACTION_LIST`,
      false,
      false,
      true
    );

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error fetching subscription types:", error);
  }
};

const getListLogics = async () => {
  try {
    const { data } = await postData(
      "post",
      {
        id: "RPA_ACTION_LIST",
        selectAs: {
          idx: "id",
          value: "pgm_value2|string",
          defaultValue: "pgm_value3|string",
          label: "pgm_desc",
          optValue: "pgm_desc2|array",
          type: "pgm_desc3",
          children: "children",
        },
        filter: {
          pgm_value: "logic",
        },
        withParents: true,
      },
      `portal/gencode/showDetail/RPA_ACTION_LIST`,
      false,
      false,
      true
    );

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error fetching logic types:", error);
  }
};
</script>
