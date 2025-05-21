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
        <div class="text-h6">Setup Forms</div>
      </q-card-section>

      <q-card-section class="q-pa-md q-gutter-md">
        <!-- Preview -->
        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 20vh;
            overflow: auto;
          "
        >
          <legend>Setup Forms View</legend>
          <div class="row">
            <div class="col">
              <div class="text-bold">
                Wizard Mode ? (It will separate page for each rows)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isWizard"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isWizard"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="text-bold">
                View History ? (It will show the history of the forms)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isHistory"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isHistory"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
            <div class="col" v-if="formsSetup.isHistory">
              <div class="text-bold">
                Show only own history ? (It will show only the history of the
                user)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isShowOwnHistory"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isShowOwnHistory"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
            <div
              class="col"
              v-if="formsSetup.isHistory && formsSetup.isShowOwnHistory"
            >
              <div class="text-bold">
                Choose Exception Users (choosed user will be able to see all
                user history)
              </div>
              <div class="q-gutter-sm">
                <q-select
                  v-model="formsSetup.exceptionUsers"
                  :options="optionsUsers"
                  multiple
                  label="Choose Exception Users"
                  emit-value
                  map-options
                  use-chips
                  dense
                  filled
                  @filter="filterFnUsers"
                  :loading="loadingUsers"
                  use-input
                  input-debounce="300"
                />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 20vh;
            overflow: auto;
          "
        >
          <legend>Setup Target Submited</legend>
          <div class="row">
            <div class="col">
              <div class="text-bold">
                Send Approval when submited ? (It will send email to approver)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isApproval"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isApproval"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
            <div class="col" v-if="formsSetup.isApproval">
              <div class="text-bold">Choose Approval Code</div>
              <div class="q-gutter-sm">
                <q-select
                  v-model="formsSetup.approvalCode"
                  :options="optionsApproval"
                  label="Choose Approval Code"
                  emit-value
                  map-options
                  dense
                  filled
                  @filter="filterFnApproval"
                  :loading="loadingApproval"
                  use-input
                  input-debounce="300"
                />
              </div>
            </div>
          </div>
        </fieldset>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onSubmit" color="primary" label="Submit" />
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "stores/authStore";

const store = useAuthStore();

const props = defineProps({
  setupTrainingSetup: Object,
});

const $q = useQuasar();
const { postData } = apiRequest();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

onMounted(() => {
  if (props.setupTrainingSetup) {
    console.log(props.setupTrainingSetup);
    // Create a local copy and convert numeric values to boolean
    const localSetup = { ...props.setupTrainingSetup };
    if (typeof localSetup.isWizard === "number") {
      localSetup.isWizard = !!localSetup.isWizard;
    }
    if (typeof localSetup.isApproval === "number") {
      localSetup.isApproval = !!localSetup.isApproval;
    }
    if (typeof localSetup.isHistory === "number") {
      localSetup.isHistory = !!localSetup.isHistory;
    }
    if (typeof localSetup.isShowOwnHistory === "number") {
      localSetup.isShowOwnHistory = !!localSetup.isShowOwnHistory;
    }
    formsSetup.value = localSetup;
  }
});

const formsSetup = ref({
  isWizard: true,
  isApproval: false,
  approvalCode: "",
});
const optionsUsers = ref([]);
const optionsApproval = ref([]);
const loadingUsers = ref(false);
const loadingApproval = ref(false);

const getUsers = async () => {
  loadingUsers.value = true;
  const data = await postData(
    "get",
    null,
    "portal/users/ActiveOnly",
    false,
    false,
    true
  );
  if (data) {
    loadingUsers.value = false;
    return data.data.map((user) => {
      return {
        label: user.pud_first_name + " " + user.pud_last_name,
        value: user.username,
      };
    });
  }
};

const getDataApproval = async () => {
  loadingApproval.value = true;

  const data = await postData(
    "post",
    {
      filter: [
        {
          cols: "p_u_username",
          param: "=",
          value: store.authDet.username,
        },
        {
          cols: "amshd_stat",
          param: "=",
          value: "sent",
        },
      ],
    },
    `ams/viewListSentApproval`,
    false,
    false,
    true
  );

  if (data) {
    loadingApproval.value = false;

    return data.data.map((user) => {
      return {
        label: user.master.ams_title,
        value: user.master.ams_idapv,
      };
    });
  } else {
    loadingApproval.value = false;
  }
};

const filterFnUsers = (val, update) => {
  if (val === "") {
    update(() => {
      getUsers().then((data) => {
        console.log(data);
        optionsUsers.value = data;
      });
    });
  } else {
    update(() => {
      getUsers().then((data) => {
        optionsUsers.value = data.filter((option) => {
          return option.label.toLowerCase().includes(val.toLowerCase());
        });
      });
    });
  }
};

const filterFnApproval = (val, update) => {
  if (val === "") {
    update(() => {
      getDataApproval().then((data) => {
        console.log(data);
        optionsApproval.value = data;
      });
    });
  } else {
    update(() => {
      getDataApproval().then((data) => {
        optionsApproval.value = data.filter((option) => {
          return option.label.toLowerCase().includes(val.toLowerCase());
        });
      });
    });
  }
};

const onSubmit = () => {
  // Emit the formsSetup data to the parent component
  // Close the dialog
  onDialogOK(formsSetup.value);
};
</script>
