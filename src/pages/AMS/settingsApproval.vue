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
        <div class="row">
          <div class="col col-xs-12 col-sm-4 q-pa-sm">
            <q-btn
              outline
              :color="forms.amssd_content ? 'orange' : 'cyan'"
              icon="integration_instructions"
              :label="forms.amssd_content ? 'Update Content' : 'Create Content'"
              @click="onClickChangeContent()"
            >
              <q-tooltip>{{
                forms.amssd_content
                  ? "Content already created, click to edit."
                  : "Create notification content for approval page"
              }}</q-tooltip>
            </q-btn>
          </div>
        </div>

        <q-separator />
        <p class="text-bold q-pa-sm">Approval Type</p>
        <div class="row">
          <div class="col col-xs-12 col-sm-6 q-pa-sm">
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
          <div class="col col-xs-12 col-sm-3 q-pa-sm" v-if="forms.amssd_is_docsign">
            <q-toggle
              v-model="forms.amssd_sign_uploaded_doc"
              checked-icon="check"
              color="warning"
              label="Sign uploaded doc ?"
              unchecked-icon="clear"
              :false-value="0"
              :true-value="1"
            />
            <q-tooltip>If enabled, API submitters must upload the document and place sign boxes for every approval submission</q-tooltip>
          </div>
          <div class="col col-xs-12 col-sm-3 q-pa-sm" v-if="forms.amssd_is_docsign && !forms.amssd_sign_uploaded_doc">
            <q-btn
              outline
              color="deep-orange"
              icon="draw"
              label="Setup Sign Boxes"
              @click="onClickSetupSignBoxes()"
              :disable="!props.dataExists || !props.dataExists.id"
            >
              <q-tooltip>Place signature boxes on the fixed document (not applicable when submitters upload their own document)</q-tooltip>
            </q-btn>
          </div>
        </div>
        <div class="row">
          <div class="col col-xs-12 col-sm-6 q-pa-sm">
            <q-toggle
              v-model="forms.amssd_attachment"
              checked-icon="check"
              color="primary"
              label="Use attachment ?"
              unchecked-icon="clear"
              :false-value="0"
              :true-value="1"
            />
          </div>
          <div
            class="col col-xs-12 col-sm-4 q-pa-sm"
            v-if="forms.amssd_attachment"
          >
            <q-btn
              outline
              :color="forms.attch.length > 0 ? 'orange' : 'cyan'"
              icon="attach_file"
              :label="
                forms.attch.length > 0
                  ? 'Update Attachment Store Setup'
                  : 'Create Attachment Store Setup'
              "
              @click="onClickAddAttachmentStorage()"
            >
              <q-tooltip>{{
                forms.attch.length > 0
                  ? "Attachment Store Setup already create, click again to edit."
                  : "Create attachment Store Setup for approval page"
              }}</q-tooltip>
            </q-btn>
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
import approvalAttachmentSet from "./approvalAttachmentSet.vue";
import approvalSignSetup from "./approvalSignSetup.vue";
import approvalContentEditor from "./approvalContentEditor.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  dataExists: Object,
  approvers: {
    type: Array,
    default: () => [],
  },
  // ...your custom props
});

onMounted(() => {
  console.log(props.dataExists);
  if (props.dataExists) {
    forms.value = {
      amssd_quotkn: parseInt(props.dataExists.amssd_quotkn),
      amssd_isemail: parseInt(props.dataExists.amssd_isemail),
      amssd_iswa: parseInt(props.dataExists.amssd_iswa),
      amssd_issms: parseInt(props.dataExists.amssd_issms),
      amssd_is_docsign: parseInt(props.dataExists.amssd_is_docsign),
      amssd_sign_uploaded_doc: parseInt(props.dataExists.amssd_sign_uploaded_doc),
      amssd_unread_autonotif: parseInt(props.dataExists.amssd_unread_autonotif),
      amssd_unread_chktime: parseInt(props.dataExists.amssd_unread_chktime),
      amssd_autorun: parseInt(props.dataExists.amssd_autorun),
      amssd_autorun_chktime: parseInt(props.dataExists.amssd_autorun_chktime),
      amssd_content: props.dataExists.amssd_content,
      amssd_content_variables: props.dataExists.amssd_content_variables,
      amssd_attachment: parseInt(props.dataExists.amssd_attachment),
      attch: props.dataExists.attch,
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
  amssd_sign_uploaded_doc: 0,
  amssd_unread_autonotif: 0,
  amssd_unread_chktime: 0,
  amssd_autorun: 0,
  amssd_autorun_chktime: 0,
  amssd_content: "",
  amssd_content_variables: [],
  amssd_attachment: 0,
  attch: [],
});

const onClickChangeContent = () => {
  $q.dialog({
    component: approvalContentEditor,
    componentProps: {
      content: forms.value.amssd_content,
      variables: forms.value.amssd_content_variables || [],
    },
  }).onOk((val) => {
    if (val.content) {
      forms.value.amssd_content = val.content;
    }
    if (val.variables) {
      forms.value.amssd_content_variables = val.variables;
    }
  });
};

const onOKClick = () => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to save this settings ?`,
    cancel: true,
  }).onOk(async () => {
    onDialogOK(forms.value);
  });
};

const onClickAddAttachmentStorage = () => {
  console.log(forms.value.attch);
  $q.dialog({
    component: approvalAttachmentSet,
    componentProps: {
      dataExists: forms.value.attch,
    },
  }).onOk((val) => {
    forms.value.attch = val;
  });
};

const onClickSetupSignBoxes = () => {
  const amsmId = props.dataExists.id;
  const signBoxApprovers = props.approvers.map((a) => ({
    amsmd_id: a.amsmd_id,
    amsmd_order: a.amsmd_order,
    amsmd_username: a.amsmd_username,
    fullname: a.fullname || a.user_det?.fullname,
  }));

  $q.dialog({
    component: approvalSignSetup,
    componentProps: {
      amsm_id: String(amsmId),
      approvers: signBoxApprovers,
      existingBoxes: props.dataExists.sign_boxes || [],
      documentUrl: props.dataExists.doc_url || "",
    },
  }).onOk((val) => {
    console.log("sign boxes saved", val);
  });
};
</script>
