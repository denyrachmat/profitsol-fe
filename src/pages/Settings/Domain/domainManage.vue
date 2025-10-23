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

        <fieldset
          style="border: 1px solid #ccc !important; border-radius: 16px"
          class="q-pa-md"
        >
          <legend class="text-bold text-h5">Domain Setup</legend>
          <div class="row q-pt-sm">
            <div class="col">
              <!-- <q-checkbox
                v-model="formnya.pd_is_cms"
                label="Is CMS Domain?"
                dense
                false-value="0"
                true-value="1"
              /> -->
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formnya.pd_is_cms"
                  label="Generate CMS (Using Statami CMS)"
                  dense
                  val="1"
                />
                <q-radio
                  v-model="formnya.pd_is_cms"
                  label="Configure Own CMS"
                  dense
                  val="2"
                />
              </div>
            </div>
            <div class="col" v-if="formnya.pd_is_cms == 1">
              <div class="row">
                <div class="col">
                  <q-btn
                    :label="
                      formnya.CMSState !== '' &&
                      formnya.CMSState !== 'setup_failed' &&
                      formnya.CMSState !== 'setup_admin_done'
                        ? 'Setup on Progress'
                        : formnya.CMSState !== ''
                        ? formnya.CMSState == 'setup_failed'
                          ? 'Failed to Setup CMS'
                          : `CMS Already Set up`
                        : `Setup CMS Now`
                    "
                    :color="
                      formnya.CMSState !== 'setup_failed' ? 'primary' : 'red'
                    "
                    class="full-width"
                    @click="onSetupCmsClick"
                    :disable="
                      formnya.CMSState === 'setup_admin_done' &&
                      formnya.CMSState !== 'setup_failed'
                    "
                    :loading="
                      formnya.CMSState !== '' &&
                      formnya.CMSState !== 'setup_admin_done'
                    "
                  />
                </div>
                <div class="col-1">
                  <q-btn
                    icon="open_in_new"
                    color="primary"
                    flat
                    dense
                    @click="onClickSetupCMS(formnya)"
                    :disable="formnya.CMSState !== 'setup_admin_done'"
                    class="full-width"
                  >
                    <q-tooltip>CMS Setup</q-tooltip>
                  </q-btn>
                </div>
              </div>
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
import apiRequest from "src/components/apiRequest";
import viewApps from "../../Dashboards/viewApps.vue";

const { postData } = apiRequest();
const $q = useQuasar();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  dataEdit: Object,
});

const formnya = ref({
  id: "",
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
  pd_is_cms: 0,
  CMSState: "",
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

const onSetupCmsClick = () => {
  $q.dialog({
    title: "Setup CMS",
    message: `Are you sure want to setup CMS for this domain?`,
    cancel: true,
  }).onOk(async () => {
    // Logic to setup CMS goes here
    await postData(
      `post`,
      null,
      `domain/startSetupCMS/${formnya.value.id}`,
      false,
      true,
      true
    )
      .then((response) => {
        $q.notify({
          type: "positive",
          message: "CMS Setup successful!",
        });
      })
      .catch((error) => {
        $q.notify({
          type: "negative",
          message: "CMS Setup failed!",
        });
      });
  });
};

const onClickSetupCMS = (row) => {
  $q.dialog({
    component: viewApps,

    // props forwarded to your custom component
    componentProps: {
      dataProps: row.urlCMS,
      title: row.pd_desc,
      isRouter: row.pd_is_cms == 1,
      // ...more..props...
    },
  }).onOk(async (val) => {});
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
