<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white q-pa-md">
      <q-card-section class="text-h6">
        <div class="row">
          <div class="col">RPA Setup Command Management</div>
          <div class="col text-right"></div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <div class="row">
          <div class="col">
            <flow-index
              :list-nodes="parseNodesFromCommands"
              :is-editable="true"
              @node-click="handleNodeClick"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="row">
              <div class="col q-pb-md">
                <q-btn
                  label="Add Command"
                  color="primary"
                  outline
                  icon="add"
                  @click="addCommands"
                />
              </div>
            </div>
            <q-form :key="refreshForm">
              <div
                v-for="(command, idx) in commands"
                :key="idx"
                class="q-pa-md"
              >
                <div class="row">
                  <div class="col text-left text-h6">
                    ID: {{ command.id || "New Command" }}
                  </div>
                </div>
                <div class="row bg-cyan q-pa-md">
                  <div class="col-10">
                    <q-input
                      v-model="command.prcd_name"
                      label="Command Name"
                      dense
                      outlined
                      class="bg-white"
                    />
                  </div>
                  <div class="col-2 text-right">
                    <q-btn
                      icon="add"
                      color="primary"
                      @click="onAddChildCommand(idx)"
                      outline
                    />
                    <q-btn
                      icon="delete"
                      color="negative"
                      @click="commands.splice(idx, 1)"
                      outline
                    />
                  </div>
                </div>
                <RPACompRecursive
                  :selected-command="command.prcd_children"
                  :list-param="props.listParam"
                  :rpa-type="props.rpaType"
                />
              </div>
            </q-form>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col text-left">
            <q-btn
              color="red"
              label="Delete Commands"
              @click="onDeleteCommands(commands)"
              outline
              v-if="isEditing"
            />
            <q-btn
              color="primary"
              label="Insert Commands"
              @click="onClickInsert()"
              outline
              :disabled="
                commands.length === 0 ||
                commands.some(
                  (cmd) => !cmd.prcd_children || cmd.prcd_children.length === 0
                )
              "
            />
            <q-btn
              color="secondary"
              label="Cancel"
              @click="
                () => {
                  commands = [];
                  refreshForm += 1; // Trigger form refresh
                  addCommands();
                }
              "
              outline
            />
          </div>
          <div class="col text-right">
            <q-btn
              color="primary"
              label="Save Commands"
              @click="onDialogOK(commandBulk)"
              :disabled="commandBulk.length === 0"
            />
            <q-btn color="secondary" label="Cancel" @click="onDialogCancel" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref, computed } from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";

import flowIndex from "@/components/flow/flowIndex.vue";
import RPACompRecursive from "./RPACompRecursive.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();

const props = defineProps({
  listCommandRPA: Array,
  listParam: Array,
  rpaType: {
    type: String,
    default: "web",
  },
});

const commandBulk = ref([]);
const commands = ref([]);
const listLogics = ref([]);
const isEditing = ref(false);
const refreshForm = ref(0);

onMounted(() => {
  if (props.listCommandRPA && props.listCommandRPA.length > 0) {
    commands.value = JSON.parse(JSON.stringify(props.listCommandRPA));
  }

  addCommands();
});

const parseNodesFromCommands = computed(() => {
  const dataNodes = (lists) =>
    lists.map((cmd) => ({
      id: cmd.id || Date.now() + Math.random(), // Unique ID for each node
      type: "square",
      position: {
        x: 100 + cmd.prcd_order * 180,
        y: 120 + (cmd.prcd_order % 2) * 80,
      },
      data: {
        label: cmd.prcd_name || cmd.prcd_action?.label || "Unnamed Command",
        children:
          cmd.prcd_children && cmd.prcd_children.length > 0
            ? dataNodes(cmd.prcd_children)
            : [],
        ...cmd,
      },
    }));

  console.log("Parsing commands into nodes:", dataNodes(commandBulk.value));

  return dataNodes(commandBulk.value);
});

const addCommands = () => {
  commands.value.push({
    prcd_name: "",
    prcd_params: 0,
    prcd_isactive: true,
    prcd_order: commands.value.length + 1,
    prcd_action: "",
    prcd_children: [],
  });
};

const onAddChildCommand = (idx) => {
  commands.value[idx].prcd_children.push({
    prcd_action: "",
    prcd_params: 0,
    prcd_isactive: true,
    type: "action",
  });
};

const onClickInsert = () => {
  console.log("Inserting commands:", commands.value);

  const latestOrder =
    commandBulk.value.length > 0
      ? Math.max(...commandBulk.value.map((cmd) => cmd.prcd_order))
      : 0;

  commands.value.forEach((cmd, idx) => {
    const newCommand = {
      id: cmd.id ?? Date.now() + idx, // Unique ID for each command
      prcd_name: cmd.prcd_name,
      prcd_params: JSON.stringify(cmd.prcd_action?.children || []),
      prcd_isactive: cmd.prcd_isactive,
      prcd_order: latestOrder + idx + 1,
      prcd_action: cmd.prcd_action?.value || "",
      prcd_children: cmd.prcd_children || [],
    };

    if (cmd.id) {
      // Update existing command
      const existingIdx = commandBulk.value.findIndex((c) => c.id === cmd.id);
      if (existingIdx !== -1) {
        commandBulk.value[existingIdx] = newCommand;
      }
    } else {
      // Add new command
      commandBulk.value.push(newCommand);
    }
  });

  console.log("Command bulk after insertion:", commandBulk.value);

  commands.value = [];
  refreshForm.value += 1; // Trigger form refresh
  addCommands();
};

const handleNodeClick = (nodeData) => {
  console.log("Clicked node data:", nodeData);
  const dataSelected = nodeData.node.data;
  commands.value = [
    {
      id: dataSelected.id,
      prcd_name: dataSelected.prcd_name,
      prcd_params: JSON.parse(dataSelected.prcd_params || "[]"),
      prcd_isactive: dataSelected.prcd_isactive,
      prcd_order: parseInt(nodeData.id),
      prcd_action: dataSelected.prcd_action,
      prcd_children: dataSelected.prcd_children || [],
    },
  ];

  refreshForm.value += 1;

  // handleActionChange(0, dataSelected.prcd_action || "");

  isEditing.value = true;
};

const onDeleteCommands = (order) => {
  if (isEditing.value) {
    $q.dialog({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this command?",
      cancel: true,
      persistent: true,
    }).onOk(() => {
      console.log("Deleting command with order:", order);
      commandBulk.value = commandBulk.value.filter((cmd) => cmd.id !== order);

      console.log(commandBulk.value);

      commands.value = [];
      addCommands();
      isEditing.value = false;
    });
  }
};
</script>
