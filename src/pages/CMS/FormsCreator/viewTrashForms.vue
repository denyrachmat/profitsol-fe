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
        <div class="text-h6">Trash</div>
        <div class="text-subtitle2">
          Deleted forms can be restored from here
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md" style="max-height: 65vh; overflow-y: auto">
        <template v-if="localForms.length > 0">
          <div
            v-for="(form, idx) in localForms"
            :key="form.id"
            class="row q-py-sm items-center"
          >
            <div class="col">
              <div class="text-weight-bold">{{ form.cfmt_title }}</div>
              <div class="text-caption text-grey">
                ID: {{ form.id }} | Deleted: {{ form.deleted_at }}
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                color="positive"
                icon="restore"
                label="Restore"
                @click="onRestore(form.id, idx)"
                outline
                dense
              />
            </div>
          </div>
        </template>
        <div v-else class="text-center q-py-xl text-grey">
          <q-icon name="delete_sweep" size="48px" />
          <div class="text-h6 q-mt-sm">Trash is empty</div>
          <div class="text-caption">No deleted forms to restore</div>
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const { postData } = apiRequest();

const props = defineProps({
  forms: { type: Array, default: () => [] },
});

const localForms = ref([...props.forms]);

const onRestore = async (id, idx) => {
  const data = await postData("post", null, `cms/restore/${id}`, false, false, true);
  if (data && data.status) {
    $q.notify({ color: "positive", message: "Form restored", icon: "check" });
    localForms.value.splice(idx, 1);
  } else {
    $q.notify({ color: "negative", message: data?.message || "Restore failed", icon: "warning" });
  }
};
</script>
