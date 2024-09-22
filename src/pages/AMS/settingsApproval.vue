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
            <div class="text-h6">Approval Settings</div>
          </div>
          <div class="col text-right"></div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-sm">
        <div class="row">
          <div class="col col-xs-12 col-sm-12 q-pa-sm">
            <q-input
              label="Quota for using this approval"
              v-model="forms.amssd_quotkn"
              dense
              outlined
            />
          </div>
        </div>

        <q-separator />
        <p class="text-bold q-pa-sm">Notification Settings</p>
        <div class="row">
          <div class="col col-xs-12 col-sm-4 q-pa-sm">
            <q-toggle
              v-model="forms.amssd_isemail"
              checked-icon="check"
              color="primary"
              label="Notif Email ?"
              unchecked-icon="clear"
              :false-value="0"
              :true-value="1"
            />
          </div>
          <div class="col col-xs-12 col-sm-4 q-pa-sm">
            <q-toggle
              v-model="forms.amssd_iswa"
              checked-icon="check"
              color="primary"
              label="Notif Whatsapp ? (If user phone is filled)"
              unchecked-icon="clear"
              :false-value="0"
              :true-value="1"
            />
          </div>
          <div class="col col-xs-12 col-sm-4 q-pa-sm">
            <q-toggle
              v-model="forms.amssd_issms"
              checked-icon="check"
              color="primary"
              label="Notif SMS ? (On Development)"
              unchecked-icon="clear"
              :false-value="0"
              :true-value="1"
              disable
            />
          </div>
        </div>

        <q-separator />
        <p class="text-bold q-pa-sm">Approval Type</p>
        <div class="row">
          <div class="col col-xs-12 col-sm-4 q-pa-sm">
            <q-toggle
              v-model="forms.amssd_is_docsign"
              checked-icon="check"
              color="primary"
              label="Is document sign ?"
              unchecked-icon="clear"
              :false-value="0"
              :true-value="1"
            />
          </div>
        </div>

        <q-separator />
        <p class="text-bold q-pa-sm">Schedule Running</p>
        <div class="row">
          <div class="col col-xs-12 col-sm-6 q-pa-sm">
            <q-toggle
              v-model="forms.amssd_unread_autonotif"
              checked-icon="check"
              color="primary"
              label="Re-notified if notification unread ?"
              unchecked-icon="clear"
              :false-value="0"
              :true-value="1"
            />
          </div>

          <div class="col col-xs-12 col-sm-6 q-pa-sm">
            <q-input
              label="Input timeout each notification"
              v-model="forms.amssd_unread_chktime"
              dense
              outlined
              :disable="!forms.amssd_unread_autonotif"
            />
          </div>
        </div>

        <div class="row">
          <div class="col col-xs-12 col-sm-6 q-pa-sm">
            <q-toggle
              v-model="forms.amssd_autorun"
              checked-icon="check"
              color="primary"
              label="Autorunning workflow ?"
              unchecked-icon="clear"
              :false-value="0"
              :true-value="1"
            />
          </div>

          <div class="col col-xs-12 col-sm-6 q-pa-sm">
            <q-input
              label="Input timeout each run"
              v-model="forms.amssd_autorun_chktime"
              dense
              outlined
              :disable="!forms.amssd_autorun"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onOKClick()" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  dataExists: Object,
  // ...your custom props
});

onMounted(() => {
  if (props.dataExists) {
    forms.value = {
      amssd_quotkn: parseInt(props.dataExists.amssd_quotkn),
      amssd_isemail: parseInt(props.dataExists.amssd_isemail),
      amssd_iswa: parseInt(props.dataExists.amssd_iswa),
      amssd_issms: parseInt(props.dataExists.amssd_issms),
      amssd_is_docsign: parseInt(props.dataExists.amssd_is_docsign),
      amssd_unread_autonotif: parseInt(props.dataExists.amssd_unread_autonotif),
      amssd_unread_chktime: parseInt(props.dataExists.amssd_unread_chktime),
      amssd_autorun: parseInt(props.dataExists.amssd_autorun),
      amssd_autorun_chktime: parseInt(props.dataExists.amssd_autorun_chktime),
    };
  }
});

const $q = useQuasar();
const forms = ref({
  amssd_quotkn: 5,
  amssd_isemail: 0,
  amssd_iswa: 0,
  amssd_issms: 0,
  amssd_is_docsign: 0,
  amssd_unread_autonotif: 0,
  amssd_unread_chktime: 0,
  amssd_autorun: 0,
  amssd_autorun_chktime: 0,
});

const onOKClick = () => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to save this settings ?`,
    cancel: true,
  }).onOk(async () => {
    onDialogOK(forms.value);
  });
};
</script>
