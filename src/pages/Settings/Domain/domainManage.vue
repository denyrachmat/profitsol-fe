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
        <fieldset
          style="border: 1px solid #ccc !important; border-radius: 16px"
          class="q-pa-md"
        >
          <legend class="text-bold text-h5">Detail Domain</legend>
          <div class="row">
            <div class="col">
              <q-input
                label="Domain Name"
                filled
                v-model="formnya.pd_name"
                dense
              />
            </div>
            <div class="col q-pl-sm">
              <q-input
                label="Domain Desc"
                filled
                v-model="formnya.pd_desc"
                dense
              />
            </div>
            <div class="col q-pl-sm">
              <q-input
                label="Domain Prefix"
                filled
                v-model="formnya.pd_prefix_db"
                dense
              />
            </div>
          </div>
        </fieldset>
        <fieldset
          style="border: 1px solid #ccc !important; border-radius: 16px"
          class="q-pa-md"
        >
          <legend class="text-bold text-h5">DB Domain Detail</legend>
          <div class="row q-pt-sm">
            <div class="col">
              <q-select
                v-model="formnya.pd_dbtype"
                :options="listDB"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                use-chips
                dense
                filled
              >
              </q-select>
            </div>
            <div class="col q-pl-sm">
              <q-input label="Host DB" filled v-model="formnya.pd_host" dense />
            </div>
          </div>
          <div class="row q-pt-sm">
            <div class="col">
              <q-input
                label="Username"
                filled
                v-model="formnya.pd_username"
                dense
              />
            </div>
            <div class="col q-pl-sm">
              <q-input
                label="Password"
                filled
                v-model="formnya.pd_password"
                dense
                :type="viewPass ? 'text' : 'password'"
              >
                <template v-slot:append>
                  <q-btn
                    round
                    dense
                    flat
                    :icon="viewPass ? 'visibility' : 'visibility_off'"
                    @click="viewPass = !viewPass"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </fieldset>
        <fieldset
          style="border: 1px solid #ccc !important; border-radius: 16px"
          class="q-pa-md"
        >
          <legend class="text-bold text-h5">Domain Styling</legend>
          <div class="row q-pt-sm">
            <div class="col">
              <q-file
                filled
                label="Choose Image Domain Logo"
                v-model="img"
                @update:model-value="onUploadImage"
                dense
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
                dense
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
        </fieldset>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Save" color="primary" @click="onOKClick" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const $q = useQuasar();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  dataEdit: Object,
});

const formnya = ref({
  pd_name: "",
  pd_desc: "",
  pd_prefix_db: "",
  pd_dbtype: "",
  pd_host: "",
  pd_port: "",
  pd_username: "",
  pd_password: "",
  pd_img: "",
  pd_base_color: "",
});
const img = ref("");
const viewPass = ref(false);
const listDB = ref([
  {
    label: "SQL Server",
    value: "sqlsrv",
    icon: "fa-database",
  },
  {
    label: "My SQL",
    value: "mysql",
    icon: "fa-database",
  },
  {
    label: "Postgree SQL",
    value: "pgsql",
    icon: "fa-database",
  },
  {
    label: "SQL Lite",
    value: "sqlite",
    icon: "fa-database",
  },
]);

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

const filterFn = (val, update) => {
  update(() => {
    const needle = val.toLowerCase();
    this.options = this.options.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
};

const onOKClick = () => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to save this domain?`,
    cancel: true,
  }).onOk(async () => {
    onDialogOK(formnya.value);
  });
};
</script>
