<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="q-dialog-plugin bg-white q-pa-md">
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">Manage History Table</div>
          </div>
          <div class="col text-right">
            <q-toggle
              v-model="isExportable"
              color="primary"
              label="Is Data Exportable ?"
            />
            <q-btn color="primary" icon="add" class="q-ml-sm">
              <q-tooltip>Add Column</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md q-gutter-md">
        <div class="row">
          <div class="col">
            <q-list bordered>
              <draggable
                tag="div"
                v-model="tableData"
                class="q-list q-list--bordered q-list--dense q-list--separator"
              >
                <template #item="{ element }">
                  <q-item
                    clickable
                    v-ripple
                    :key="element.value"
                    :active="element.active"
                  >
                    <q-item-section>
                      <q-item-label>
                        <q-input
                          v-model="element.label"
                          :placeholder="`Column Label for ${element.value}`"
                          dense
                          class="q-mb-xs"
                          outlined
                        />
                      </q-item-label>
                      <q-item-label caption>{{ element.name }}</q-item-label>
                    </q-item-section>
                    <q-item-section
                      v-if="
                        element.forms &&
                        element.forms.content.component?.category === 'multiple'
                      "
                    >
                      <q-item-label>
                        <q-select
                          v-model="element.showAs"
                          :options="['label', 'value']"
                          dense
                          outlined
                          class="q-mb-xs"
                          :placeholder="`Select ${element.forms.content.component.label}`"
                        />
                      </q-item-label>
                      <q-item-label caption>Show as</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle
                        v-model="element.isVisible"
                        color="primary"
                        :label="
                          element.value === 'action'
                            ? 'Activate action columns ?'
                            : 'Is Visible ?'
                        "
                      />
                    </q-item-section>
                    <q-item-section side v-if="element.value !== 'action'">
                      <q-toggle
                        v-model="element.isFiltered"
                        color="primary"
                        label="Is Filtered ?"
                      />
                    </q-item-section>
                    <q-item-section side v-if="element.value !== 'action'">
                      <q-toggle
                        v-model="element.isSortable"
                        color="primary"
                        label="Is Sortable ?"
                      />
                    </q-item-section>
                    <q-item-section side v-if="element.value !== 'action'">
                      <q-toggle
                        v-model="element.isExportable"
                        color="primary"
                        label="Is Exportable ?"
                      />
                    </q-item-section>
                    <q-item-section side v-if="element.value === 'action'">
                      <q-toggle
                        v-model="element.isEditable"
                        color="primary"
                        label="Edit Button ?"
                      />
                    </q-item-section>
                    <q-item-section side v-if="element.value === 'action'">
                      <q-toggle
                        v-model="element.isDeletable"
                        color="primary"
                        label="Delete Button ?"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </draggable>
            </q-list>
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          color="primary"
          label="Save"
          @click="onClickSave"
          :disable="!tableData.length"
        />
        <q-btn color="secondary" label="Cancel" @click="onClickCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref, computed, watch } from "vue";
import apiRequest from "src/components/apiRequest";
import { useQuasar, useDialogPluginComponent } from "quasar";
import draggable from "vuedraggable";
import { useAuthStore } from "src/stores/authStore";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  dataEdit: Array,
  isExportable: Boolean,
  forms: Array,
  setup: Object,
});
const $q = useQuasar();

const tableData = ref([]);
const isExportable = ref(
  typeof props.isExportable === "number"
    ? Boolean(props.isExportable)
    : !!props.isExportable
);

onMounted(() => {
  // Fetch the table data and columns when the component is mounted
  console.log(props);
  if (props.dataEdit && props.dataEdit.length > 0) {
    tableData.value = [
      ...props.dataEdit,
      ...(!props.dataEdit.some((col) => col.value === "created_by")
        ? [
            {
              label: "Creator",
              name: "created_by",
              value: "created_by",
              isVisible: true,
              isFiltered: false,
              isSortable: false,
              isEditable: false,
              isDeletable: false,
              isExportable: true,
            },
          ]
        : []),
      ...(!props.dataEdit.some((col) => col.value === "progress") &&
      props.setup?.isRPA
        ? [
            {
              label: "Progress RPA",
              name: "progress",
              value: "progress",
              isVisible: true,
              isFiltered: false,
              isSortable: false,
              isEditable: false,
              isDeletable: false,
              isExportable: false,
            },
          ]
        : []),
      ...(!props.dataEdit.some((col) => col.value === "progress_apprv") &&
      props.setup?.isApproval
        ? [
            {
              label: "Progress Approval",
              name: "progress_apprv",
              value: "progress_apprv",
              isVisible: true,
              isFiltered: false,
              isSortable: false,
              isEditable: false,
              isDeletable: false,
              isExportable: false,
            },
          ]
        : []),
      ...(!props.dataEdit.some((col) => col.value === "action")
        ? [
            {
              label: "Action",
              name: "action",
              value: "action",
              isVisible: true,
              isFiltered: false,
              isSortable: false,
              isEditable: false,
              isDeletable: false,
              isExportable: false,
            },
          ]
        : []),
    ];

    tableData.value.map((valTable) => {
      valTable.forms = findFormsContentWithID(valTable.value);
    });
  } else {
    $q.notify({
      type: "negative",
      message: "No data available to display.",
    });
  }
});
const authStore = useAuthStore();

const onClickSave = () => {
  onDialogOK({
    colsData: tableData.value,
    isExportable: isExportable.value,
  });
};

const findFormsContentWithID = (id) => {
  if (!props.forms) return null;
  const findById = (forms, id) => {
    if (!Array.isArray(forms)) return null;
    for (const form of forms) {
      if (form.id === id) return form;
      if (form.content && form.content.length) {
        const found = findById(form.content, id);
        if (found) return found;
      }
    }
    return null;
  };
  return findById(props.forms, id);
};

const onClickCancel = () => {
  onDialogCancel();
};
</script>
