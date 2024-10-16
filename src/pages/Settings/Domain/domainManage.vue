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
        <div class="text-h6">Manage Domain</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <q-input label="Domain Name" filled v-model="formnya.pd_name" />
          </div>
          <div class="col q-pl-sm">
            <q-input label="Domain Desc" filled v-model="formnya.pd_desc" />
          </div>
          <div class="col q-pl-sm">
            <q-input
              label="Domain Prefix"
              filled
              v-model="formnya.pd_prefix_db"
            />
          </div>
        </div>
        <div class="row q-pt-sm">
          <div class="col">
            <q-file
              filled
              label="Choose Image Domain Logo"
              v-model="img"
              @update:model-value="onUploadImage"
            />
            <q-img
              :src="
                formnya.pd_img
                  ? formnya.pd_img
                  : 'https://cdn.quasar.dev/img/parallax2.jpg'
              "
              height="40vh"
            >
              <div class="absolute-bottom text-subtitle1 text-center">
                {{ formnya.pd_desc }}
              </div>
            </q-img>
          </div>
          <div class="col q-pl-sm">
            <q-input
              filled
              v-model="formnya.pd_base_color"
              class="my-input"
              label="Base Color"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-color v-model="formnya.pd_base_color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <div
              :style="`height:40vh; background-color: ${formnya.pd_base_color};`"
            ></div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Search" color="primary" @click="onOKClick" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  dataEdit: Object,
});

const formnya = ref({
  pd_name: "",
  pd_desc: "",
  pd_prefix_db: "",
  pd_img: "",
  pd_base_color: "",
});
const img = ref("");

onMounted(() => {
  if (props.dataEdit) {
    formnya.value = props.dataEdit;
  }
});

const onUploadImage = async (imgnya) => {
  const hasilnya = await getBase64(imgnya);
  formnya.value.pd_img = hasilnya;
  console.log(hasilnya);
};

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const onOKClick = () => {};
</script>
