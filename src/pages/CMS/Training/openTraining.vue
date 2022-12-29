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
        <div class="text-h6">Open Forms Content</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-select
          outlined
          v-model="choosedData"
          :options="listData"
          label="Choose Data"
          emit-value
          map-options
          :loading="loading"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { postData } = apiRequest();

const listData = ref([]);
const choosedData = ref(null);
const loading = ref(false);

const props = defineProps({
  type: String,
});

onMounted(() => {
  getData();
});

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const getData = async () => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `cms/forms/${props.type}`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    listData.value = data.data;
  }
};

function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK(choosedData.value);
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
