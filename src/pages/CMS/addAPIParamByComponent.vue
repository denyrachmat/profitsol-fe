<template>
  <q-dialog
    ref="dialogRef"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white q-pa-md">
      <q-card-section class="text-h6">
        <div class="row">
          <div class="col">Add Param by Component</div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <div class="row">
          <div class="col text-right">
            <q-btn
              label="Add Parameter"
              color="primary"
              outline
              icon="add"
              @click="onClickAddParameter"
            />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <template v-if="listParams.length > 0">
              <q-list dense bordered padding class="rounded-borders">
                <q-item
                  v-for="(item, index) in listParams"
                  :key="index"
                  @click="onDialogOK(item)"
                >
                  <q-item-section>
                    <q-input
                      v-model="item.param_name"
                      label="Parameter Name"
                      dense
                      outlined
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-select
                      filled
                      v-model="item.form_id"
                      :options="props.forms"
                      label="Select Component"
                      emit-value
                      map-options
                      dense
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-input
                      v-model="item.default_value"
                      label="Default Value"
                      dense
                      outlined
                    />
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      icon="delete"
                      color="negative"
                      flat
                      @click.stop="listParams.splice(index, 1)"
                    >
                      <q-tooltip>Delete Parameter</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
            <q-list dense bordered padding class="rounded-borders" v-else>
              <q-item clickable v-ripple>
                <q-item-section> No Data Selected </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="onDialogCancel" :loading="loading" />
        <q-btn
          color="primary"
          label="Save"
          @click="onClickSave()"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";
import { useFormStore } from "src/stores/formStore";

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  listParam: Object,
  forms: Array,
});

const listParams = ref([]);

onMounted(() => {
  if (props.listParam && props.listParam.length > 0) {
    listParams.value = props.listParam;
  } else {
    listParams.value = [
      {
        param_name: "",
        param_type: "text",
        param_default: "",
        id_form: "",
      },
    ];
  }
});

const onClickAddParameter = () => {
  listParams.value.push({
    param_name: "",
    param_type: "text",
    param_default: "",
    id_form: "",
  });
};

const onClickSave = () => {
  if (listParams.value.length > 0) {
    onDialogOK(listParams.value);
  } else {
    $q.notify({
      type: "negative",
      message: "Please add at least one parameter.",
    });
  }
};
</script>
