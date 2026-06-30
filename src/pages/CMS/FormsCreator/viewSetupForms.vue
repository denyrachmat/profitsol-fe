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
            overflow: auto;
          "
        >
          <legend>Setup Forms View</legend>
          <div class="row q-pt-sm">
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
          <div class="row q-pt-sm">
            <div class="col">
              <div class="text-bold">
                Multiple Form in One Page ? (It will enable setting to set max
                form in one page)
              </div>
              <div
                class="q-gutter-sm"
                style="display: flex; flex-direction: column"
              >
                <q-radio
                  v-model="formsSetup.renderMode"
                  :val="'disabled'"
                  label="Disabled"
                />
                <q-radio
                  v-model="formsSetup.renderMode"
                  :val="'oneByOne'"
                  label="One by One (Each form will show one by one, user need to click next to show next form)"
                />
                <q-radio
                  v-model="formsSetup.renderMode"
                  :val="'multiple'"
                  label="Multiple (All forms will show in one page)"
                />
              </div>
            </div>

            <div
              class="col q-pl-sm"
              v-if="formsSetup.renderMode !== 'disabled'"
            >
              <div class="text-bold">
                Choose specific users to set the forms
              </div>
              <div class="q-italic">
                (Choosed users will be able to settings the max forms in one
                page)
              </div>
              <q-select
                v-model="formsSetup.listSpecificUserRenderMode"
                :options="optionsUsers"
                multiple
                label="Choose specific users"
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
          <div class="row q-pt-sm">
            <div class="col">
              <div class="text-bold">
                Add period to fill the forms ? (It will show the period to fill
                the forms, and user can only fill the forms in that period)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.addPeriod"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.addPeriod"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
            <div class="col" v-if="formsSetup.addPeriod">
              <div class="text-bold">
                Send notification to shared users when period starts ?
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.sendNotifOnPeriod"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.sendNotifOnPeriod"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
          </div>
          <div class="row q-pt-sm" v-if="formsSetup.addPeriod">
            <div class="col">
              <div class="text-bold">
                Set specific users that can fill the forms in the period ?
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.specificUserSetPeriod"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.specificUserSetPeriod"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
            <div class="col" v-if="formsSetup.specificUserSetPeriod">
              <div class="text-bold">Choose specific users</div>
              <div class="q-italic">
                (Choosed users will be able to fill the forms in the period)
              </div>
              <q-select
                v-model="formsSetup.listSpecificUserSetPeriod"
                :options="optionsUsers"
                multiple
                label="Choose specific users"
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
        </fieldset>

        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 50vh;
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
          <div class="row">
            <div class="col">
              <div class="text-bold">
                Running RPA when submited ? (It will run RPA when submited)
              </div>
              <div class="q-gutter-sm">
                <q-radio v-model="formsSetup.isRPA" :val="true" label="Yes" />
                <q-radio v-model="formsSetup.isRPA" :val="false" label="No" />
              </div>
            </div>

            <div class="col" v-if="formsSetup.isRPA">
              <div class="text-bold">Choose RPA</div>
              <div class="q-gutter-sm">
                <q-select
                  v-model="formsSetup.rpaId"
                  :options="optionsRPA"
                  label="Choose RPA"
                  emit-value
                  map-options
                  dense
                  filled
                  @filter="filterFnRPA"
                  :loading="loadingRPA"
                  use-input
                  input-debounce="300"
                  @update:model-value="onChooseRPA"
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="text-bold">Access API when submited ?</div>
              <div class="q-gutter-sm">
                <q-radio v-model="formsSetup.isAPI" :val="true" label="Yes" />
                <q-radio v-model="formsSetup.isAPI" :val="false" label="No" />
              </div>
            </div>
            <div class="col">
              <div class="text-bold">Add API Destination</div>
              <div class="text-italic">
                (When this API fail / error, it will cancel the submited form)
              </div>
              <div class="q-gutter-sm">
                <q-btn
                  @click="onClickListAPI"
                  icon="add"
                  color="primary"
                  label="Add API Destination"
                  class="q-mt-md"
                >
                  <q-badge color="red" floating>{{
                    formsSetup.isAPI ? formsSetup.apiOpt.length : 0
                  }}</q-badge>
                </q-btn>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 40vh;
            overflow: auto;
          "
          v-if="formsSetup.isRPA && formsSetup.rpaId"
        >
          <legend>Fill Parameter for RPA</legend>
          <div class="row">
            <div class="col">
              <div class="q-gutter-sm">
                <q-splitter v-model="splitterModel" style="height: 400px">
                  <template v-slot:before>
                    <div class="q-pa-md">
                      <q-tree
                        :nodes="listNodes"
                        node-key="id"
                        selected-color="primary"
                        @update:selected="onSelectNode"
                        v-model:selected="selectedNode"
                        default-expand-all
                      />
                    </div>
                  </template>

                  <template v-slot:after v-if="selectedNode">
                    <q-toggle
                      v-model="formsSetup.isUsingFormsRPA"
                      checked-icon="check"
                      color="red"
                      label="Choose value from forms field ?"
                      unchecked-icon="clear"
                    />
                    <div class="q-pa-md">
                      <q-input
                        v-model="formsSetup.rpaParams[selectedNode]"
                        label="Parameter Value"
                        v-if="!formsSetup.isUsingFormsRPA"
                        dense
                        outlined
                      />
                      <q-select
                        v-model="formsSetup.rpaParams[selectedNode]"
                        :options="listForms"
                        label="Choose Form Field"
                        v-else
                        emit-value
                        map-options
                        dense
                        outlined
                      />
                    </div>
                  </template>
                </q-splitter>
              </div>
            </div>
          </div>
        </fieldset>

        <!-- History -->
        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            overflow: auto;
          "
        >
          <legend>Setup Forms History</legend>
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
          </div>
          <div class="row" v-if="formsSetup.isHistory">
            <div class="col">
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
            <div class="col q-pl-sm" v-if="formsSetup.isShowOwnHistory">
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

          <div class="row q-pt-sm" v-if="formsSetup.isHistory">
            <div class="col">
              <div class="text-bold">
                Bulk Upload ? (It will allow bulk upload of forms)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isBulkUpload"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isBulkUpload"
                  :val="false"
                  label="No"
                />
              </div>
            </div>

            <div
              class="col q-px-md"
              v-if="formsSetup.isHistory && formsSetup.isBulkUpload"
            >
              <div class="text-bold">
                Define users that can use bulk upload (It will allow specific
                users to use bulk upload, keep blank if you want to allow all
                users)
              </div>
              <div class="q-gutter-sm">
                <q-select
                  v-model="formsSetup.usersBulkUpload"
                  :options="optionsUsers"
                  multiple
                  label="Define users that can use bulk upload"
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

            <div
              class="col"
              v-if="formsSetup.isHistory && formsSetup.isBulkUpload"
            >
              <div class="text-bold">Set keys for Bulk Upload Template</div>
              <div class="text-italic">
                (If you set it then same keys data will be replaced, if not then
                data could be duplicated)
              </div>
              <q-btn
                @click="onClickSetBulkKeys"
                icon="key"
                color="primary"
                label="Set keys"
                class="q-mt-md"
                :disable="!formsSetup.isBulkUpload"
              >
                <q-badge color="red" floating>{{
                  formsSetup.isBulkUpload && formsSetup.bulkKeys
                    ? formsSetup.bulkKeys.length
                    : 0
                }}</q-badge>
              </q-btn>
            </div>
          </div>

          <div class="row q-pt-sm" v-if="formsSetup.isHistory">
            <div class="col">
              <div class="text-bold">
                Allow API Search Data when viewing form ? (It will allow API to
                search data when viewing form)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.allowAPISearchData"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.allowAPISearchData"
                  :val="false"
                  label="No"
                />
              </div>
            </div>

            <div class="col" v-if="formsSetup.allowAPISearchData">
              <div class="text-bold">
                API Search Quota per user (0 = unlimited)
              </div>
              <div class="q-gutter-sm">
                <q-input
                  v-model.number="formsSetup.APISearchQuota"
                  type="number"
                  label="API Search Quota"
                  dense
                  outlined
                />
              </div>
            </div>
          </div>

          <!-- For Edit Data -->
          <div class="row q-pt-sm" v-if="formsSetup.isHistory">
            <div class="col">
              <div class="text-bold">
                Edit data ? (It will allow user to edit the data that already
                submited)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isEditData"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isEditData"
                  :val="false"
                  label="No"
                />
              </div>
            </div>

            <div
              class="col"
              v-if="formsSetup.isHistory && formsSetup.isEditData"
            >
              <div class="text-bold">
                Specific user / roles can set edit data period ? (It will allow
                specific user to set the period to edit the data)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.specificUserSetEditDataPeriod"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.specificUserSetEditDataPeriod"
                  :val="false"
                  label="No"
                />
              </div>
            </div>

            <div
              class="col"
              v-if="
                formsSetup.isHistory && formsSetup.specificUserSetEditDataPeriod
              "
            >
              <div class="text-bold">
                Choose specific users that can set edit data period
              </div>
              <q-select
                v-model="formsSetup.userEdit"
                :options="[
                  { label: 'User', value: 'user' },
                  { label: 'Role', value: 'role' },
                ]"
                label="Choose user or role"
                emit-value
                map-options
                dense
                filled
              />
            </div>

            <div
              class="col q-pl-sm"
              v-if="
                formsSetup.isHistory &&
                formsSetup.specificUserSetEditDataPeriod &&
                formsSetup.userEdit === 'user'
              "
            >
              <div class="text-bold">
                Choose specific users that can set edit data period
              </div>
              <q-select
                v-model="formsSetup.listSpecificUserRoleSetEditDataPeriod"
                :options="optionsUsers"
                multiple
                label="Choose specific users"
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

            <div
              class="col q-pl-sm"
              v-if="
                formsSetup.isHistory &&
                formsSetup.specificUserSetEditDataPeriod &&
                formsSetup.userEdit === 'role'
              "
            >
              <div class="text-bold">
                Choose specific roles that can set edit data period
              </div>
              <q-select
                v-model="formsSetup.listSpecificUserRoleSetEditDataPeriod"
                :options="optionsRoles"
                multiple
                label="Choose specific roles"
                emit-value
                map-options
                use-chips
                dense
                filled
                @filter="filterFnRoles"
                :loading="loadingRoles"
                use-input
                input-debounce="300"
              />
            </div>
          </div>

          <!-- For Delete Data -->
          <div class="row q-pt-sm" v-if="formsSetup.isHistory">
            <div class="col">
              <div class="text-bold">
                Allow user to delete submited data ? (It will allow user to
                delete the data that already submited)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.allowDeleteData"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.allowDeleteData"
                  :val="false"
                  label="No"
                />
              </div>
            </div>

            <div
              class="col"
              v-if="formsSetup.isHistory && formsSetup.allowDeleteData"
            >
              <div class="text-bold">
                Specific user can delete data ? (It will allow specific user to
                delete the data)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.specificUserSetDeleteData"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.specificUserSetDeleteData"
                  :val="false"
                  label="No"
                />
              </div>
            </div>

            <div
              class="col q-pl-sm"
              v-if="
                formsSetup.isHistory &&
                formsSetup.allowDeleteData &&
                formsSetup.specificUserSetDeleteData
              "
            >
              <div class="text-bold">
                Choose specific users that can delete data
              </div>
              <q-select
                v-model="formsSetup.userDelete"
                :options="[
                  { label: 'User', value: 'user' },
                  { label: 'Role', value: 'role' },
                ]"
                label="Choose user or role"
                emit-value
                map-options
                dense
                filled
              />
            </div>

            <div
              class="col q-pl-sm"
              v-if="
                formsSetup.isHistory &&
                formsSetup.specificUserSetDeleteData &&
                formsSetup.userDelete === 'user'
              "
            >
              <div class="text-bold">
                Choose specific users that can delete data
              </div>
              <q-select
                v-model="formsSetup.listSpecificUserRoleSetDeleteDataPeriod"
                :options="optionsUsers"
                multiple
                label="Choose specific users"
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

            <div
              class="col q-pl-sm"
              v-if="
                formsSetup.isHistory &&
                formsSetup.specificUserSetDeleteData &&
                formsSetup.userDelete === 'role'
              "
            >
              <div class="text-bold">
                Choose specific roles that can delete data
              </div>
              <q-select
                v-model="formsSetup.listSpecificUserRoleSetDeleteDataPeriod"
                :options="optionsRoles"
                multiple
                label="Choose specific roles"
                emit-value
                map-options
                use-chips
                dense
                filled
                @filter="filterFnRoles"
                :loading="loadingRoles"
                use-input
                input-debounce="300"
              />
            </div>
          </div>

          <!-- For Filter Data -->
          <div class="row q-pt-sm" v-if="formsSetup.isHistory">
            <div class="col">
              <div class="text-bold">
                Enable default filter data ? (It will filter the data based on
                the user, if the user is not allowed to see other user data, it
                will show only their own data)
              </div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.isFilterByUser"
                  :val="true"
                  label="Yes"
                />
                <q-radio
                  v-model="formsSetup.isFilterByUser"
                  :val="false"
                  label="No"
                />
              </div>
            </div>
            <div class="col q-pl-md" v-if="formsSetup.isFilterByUser">
              <div class="text-bold">Enable for specific users / roles ?</div>
              <div class="q-gutter-sm">
                <q-radio
                  v-model="formsSetup.specificUserSetFilterData"
                  :val="'user'"
                  label="User"
                />
                <q-radio
                  v-model="formsSetup.specificUserSetFilterData"
                  :val="'role'"
                  label="Role"
                />
                <q-radio
                  v-model="formsSetup.specificUserSetFilterData"
                  :val="'all'"
                  label="All"
                />
              </div>
            </div>
            <div class="col q-pl-sm" v-if="formsSetup.isFilterByUser">
              <div class="text-bold">Setup default filter data</div>
              <div class="q-gutter-sm">
                <q-btn
                  @click="onClickSetDefaultFilterData"
                  icon="filter_alt"
                  color="primary"
                  label="Setup Default Filter Data"
                  class="q-mt-md"
                >
                  <q-badge color="red" floating>{{
                    formsSetup.isFilterByUser &&
                    formsSetup.defaultFilterData &&
                    Object.keys(formsSetup.defaultFilterData).length > 0
                      ? Object.keys(formsSetup.defaultFilterData).length
                      : 0
                  }}</q-badge>
                </q-btn>
              </div>
            </div>
          </div>

          <div class="row" v-if="formsSetup.isHistory">
            <div class="col">
              <q-btn
                @click="onClickManageHistory"
                icon="edit_note"
                :color="formsSetup.historyTable ? 'primary' : 'orange'"
                :label="'Manage History Table'"
                class="q-mt-md"
              >
                <q-tooltip>
                  {{
                    formsSetup.historyTable
                      ? "History table is configured"
                      : "History table is not configured"
                  }}
                </q-tooltip>
              </q-btn>
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
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "stores/authStore";
import addReportAction from "../../MRS/addReport.vue";
import viewSetupHistTable from "./viewSetupHistTable.vue";
import viewSetupAPIDest from "./viewSetupAPIDest.vue";
import viewSetupKeysBulk from "./viewSetupKeysBulk.vue";

import multiplePromptDialog from "src/components/multiplePromptDialog.vue";

const store = useAuthStore();

const props = defineProps({
  setupTrainingSetup: Object,
  forms: Object,
});

const $q = useQuasar();
const { postData } = apiRequest();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

// Helper function to convert number to boolean
const convertToBoolean = (value) => {
  if (typeof value === "number") {
    return value !== 0;
  }
  return !!value;
};

onMounted(() => {
  if (props.setupTrainingSetup) {
    console.log(props.setupTrainingSetup);
    // Create a local copy and convert numeric values to boolean
    const localSetup = { ...props.setupTrainingSetup };

    localSetup.isWizard = convertToBoolean(localSetup.isWizard);
    localSetup.isApproval = convertToBoolean(localSetup.isApproval);
    localSetup.isHistory = convertToBoolean(localSetup.isHistory);
    localSetup.isShowOwnHistory = convertToBoolean(localSetup.isShowOwnHistory);
    localSetup.isRPA = convertToBoolean(localSetup.isRPA);
    localSetup.isUsingFormsRPA = convertToBoolean(localSetup.isUsingFormsRPA);
    localSetup.isBulkUpload = convertToBoolean(localSetup.isBulkUpload);
    localSetup.allowAPISearchData = convertToBoolean(
      localSetup.allowAPISearchData
    );
    localSetup.isAPI = convertToBoolean(localSetup.isAPI);
    localSetup.historyTableIsExport = convertToBoolean(
      localSetup.historyTableIsExport
    );
    localSetup.specificUserSetPeriod = convertToBoolean(
      localSetup.specificUserSetPeriod
    );
    localSetup.sendNotifOnPeriod = convertToBoolean(
      localSetup.sendNotifOnPeriod
    );
    localSetup.addPeriod = convertToBoolean(localSetup.addPeriod);
    localSetup.specificUserSetEditDataPeriod = convertToBoolean(
      localSetup.specificUserSetEditDataPeriod
    );
    localSetup.userEdit = localSetup.userEdit || "user";
    localSetup.listSpecificUserSetPeriod =
      localSetup.listSpecificUserSetPeriod || [];
    localSetup.exceptionUsers = localSetup.exceptionUsers || [];
    localSetup.listSpecificUserRoleSetEditDataPeriod =
      localSetup.listSpecificUserRoleSetEditDataPeriod || [];

    localSetup.userDelete = localSetup.userDelete || "user";
    localSetup.specificUserSetDeleteData = convertToBoolean(
      localSetup.specificUserSetDeleteData
    );
    localSetup.listSpecificUserRoleSetDeleteDataPeriod =
      localSetup.listSpecificUserRoleSetDeleteDataPeriod || [];
    localSetup.allowDeleteData = convertToBoolean(localSetup.allowDeleteData);
    localSetup.isEditData = convertToBoolean(localSetup.isEditData);
    localSetup.isFilterByUser = convertToBoolean(localSetup.isFilterByUser);

    localSetup.specificUserSetFilterData =
      localSetup.specificUserSetFilterData || "all";

    if (localSetup.isRPA && localSetup.rpaId) {
      console.log("Fetching RPA data for setup");
      getDataRPA().then((data) => {
        optionsRPA.value = data;
      });

      onChooseRPA(localSetup.rpaId);
    }

    // historyTableIsExport
    if (localSetup.historyTableList && localSetup.historyTableList.length > 0) {
      // listForms.value = localSetup.historyTableList;

      listForms.value = props.forms
        .flatMap((form) => (form.type === "row" ? form.content : form))
        .filter((form) => form.type === "form")
        .map((form) => ({
          value: form.id,
          label: form.content.label,
          name: `CMS_REPORT_${form.id}`,
          align: "center",
          field: `CMS_REPORT_${form.id}`,
          isFiltered: true,
          isSortable: true,
          isVisible: true,
          isExportable: true,
        }));
    } else {
      if (props.forms)
        listForms.value = props.forms
          .flatMap((form) => (form.type === "row" ? form.content : form))
          .filter((form) => form.type === "form")
          .map((form) => ({
            value: form.id,
            label: form.content.label,
            name: `CMS_REPORT_${form.id}`,
            align: "center",
            field: `CMS_REPORT_${form.id}`,
            isFiltered: true,
            isSortable: true,
            isVisible: true,
            isExportable: true,
          }));

      formsSetup.value.historyTableList = listForms.value;
    }

    // isAPI and apiOpt
    if (typeof localSetup.isAPI === "number") {
      localSetup.isAPI = !!localSetup.isAPI ?? false;
    } else {
      localSetup.isAPI = false; // Default to false if undefined
    }

    if (localSetup.apiOpt && localSetup.apiOpt.length > 0) {
      localSetup.apiOpt = localSetup.apiOpt || [];
    } else {
      localSetup.apiOpt = [];
    }

    formsSetup.value = {
      ...formsSetup.value,
      ...localSetup,
    };
  }

  filterFnUsers("", (cb) => {
    getUsers().then((data) => {
      optionsUsers.value = data;
      cb();
    });
  });

  filterFnRoles("", (cb) => {
    getRoles().then((data) => {
      optionsRoles.value = data;
      cb();
    });
  });
});

const formsSetup = ref({
  renderMode: "disabled",
  listSpecificUserRenderMode: [],
  isWizard: true,
  addPeriod: false,
  sendNotifOnPeriod: false,
  specificUserSetPeriod: false,
  listSpecificUserSetPeriod: [],
  isApproval: false,
  approvalCode: "",
  isShowOwnHistory: false,
  exceptionUsers: [],
  isHistory: false,
  historyTable: "",
  historyTableList: [],
  historyTableIsExport: false,
  isRPA: false, // Add isRPA default
  rpaId: "", // Add rpaId default
  rpaParams: {}, // Add rpaParams default
  isUsingFormsRPA: false, // Add isUsingFormsRPA default
  isAPI: false,
  apiOpt: [],
  isBulkUpload: false,
  bulkKeys: [],
  usersBulkUpload: [],
  allowAPISearchData: false,
  APISearchQuota: 0,
  isEditData: false,
  specificUserSetEditDataPeriod: false,
  userEdit: "user",
  listSpecificUserRoleSetEditDataPeriod: [],
  isFilterByUser: false,
  specificUserSetFilterData: "all",
  listSpecificUserRoleSetFilterDataPeriod: [],
});

const splitterModel = ref(50);
const optionsUsers = ref([]);
const optionsApproval = ref([]);
const optionsRPA = ref([]);
const loadingRPA = ref(false);
const loadingUsers = ref(false);
const loadingApproval = ref(false);
const formsTitle = ref("History Table");
const listForms = ref([]);
const listNodes = ref([]);
const selectedNode = ref("");
const optionsRoles = ref([]);
const loadingRoles = ref(false);

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

const getDataRPA = async () => {
  const data = await postData("get", null, "rpa/rpaMaster", false, false, true);
  if (data) {
    return data.map((rpa) => {
      return {
        label: rpa.prm_name,
        value: rpa,
      };
    });
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

const filterFnRPA = (val, update) => {
  if (val === "") {
    update(() => {
      getDataRPA().then((data) => {
        console.log(data);
        optionsRPA.value = data;
      });
    });
  } else {
    update(() => {
      getDataRPA().then((data) => {
        optionsRPA.value = data.filter((option) => {
          return option.label.toLowerCase().includes(val.toLowerCase());
        });
      });
    });
  }
};

const filterFnRoles = (val, update) => {
  if (val === "") {
    update(() => {
      getRoles().then((data) => {
        console.log(data);
        optionsRoles.value = data;
      });
    });
  } else {
    update(() => {
      getRoles().then((data) => {
        optionsRoles.value = data.filter((option) => {
          return option.label.toLowerCase().includes(val.toLowerCase());
        });
      });
    });
  }
};

const getRoles = async () => {
  try {
    loadingRoles.value = true;
    const data = await postData(
      "get",
      null,
      "portal/roles",
      false,
      false,
      true
    );
    if (data?.data) {
      return data.data.map((role) => {
        return {
          label: role.rm_role_name,
          value: role.id,
        };
      });
    }
  } catch (error) {
    console.error("Error loading roles:", error);
    return [];
  } finally {
    loadingRoles.value = false;
  }
};

const onSubmit = () => {
  // Emit the formsSetup data to the parent component
  // Close the dialog
  onDialogOK(formsSetup.value);
};

const onClickManageHistory = () => {
  console.log(listForms.value);
  $q.dialog({
    component: viewSetupHistTable,
    componentProps: {
      dataEdit: listForms.value,
      isExportable: formsSetup.value.historyTableIsExport,
      forms: props.forms,
      setup: formsSetup.value,
    },
  })
    .onOk(async (val) => {
      listForms.value = val.colsData;
      formsSetup.value.historyTableList = val.colsData;
      formsSetup.value.historyTableIsExport = val.isExportable;
      console.log(val);
    })
    .onDismiss(() => {
      // getDataHistory();
    });
};

const onChooseRPA = (val) => {
  console.log("Selected RPA:", val);
  formsSetup.value.rpaId = val;

  formsSetup.value.rpaParams = getParams(
    JSON.stringify(formsSetup.value.rpaId.prm_parameter)
  );

  listNodes.value = fetchListNodes();

  console.log("Updated formsSetup:", listNodes.value);
};

const onSelectNode = (node) => {
  console.log("Selected node:", node);
  // Handle the selection of a node
  // You can update the formsSetup.rpaParams based on the selected node
  if (node && node.data) {
    const paramKey = node.id;
    const paramValue = node.data.value || "";
    formsSetup.value.rpaParams[paramKey] = paramValue;
  }
};

const fetchListNodes = () => {
  const recursKeys = (obj, parentKey = "") => {
    if (!obj || typeof obj !== "object") return [];
    return Object.keys(obj).map((key) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const children = Array.isArray(obj[key])
        ? obj[key].map((item, index) => ({
            id: `${fullKey}.${index}`,
            label: `${item.label}` || `Parameter ${index + 1}`,
            data: item,
          }))
        : recursKeys(obj[key], fullKey);

      return {
        id: fullKey,
        label: key,
        children: children,
      };
    });
  };

  if (
    formsSetup.value.rpaParams &&
    Object.keys(formsSetup.value.rpaParams).length > 0
  ) {
    return recursKeys(formsSetup.value.rpaParams);
  }

  return [];
};

const getParams = (params) => {
  // Parse the api_params value if it's a valid JSON string
  if (!params || (typeof params === "string" && params.trim() === ""))
    return {};
  try {
    const parsed = JSON.parse(params);

    if (Array.isArray(parsed)) {
      const result = {};

      parsed.forEach((item) => {
        // Case 1: Simple parameter (no dots)
        if (!item.prpd_param_name.includes(".")) {
          const value = item.id_form ?? item.prpd_param_default;

          // If the value is a string, split into array of characters
          result[item.prpd_param_name] = value;
          return;
        }

        // Case 2: Array-style parameter (filter.[0].cols)
        const arrayMatch = item.prpd_param_name.match(
          /^([^.]+)\.\[(\d+)\]\.(\w+)/
        );
        if (arrayMatch) {
          const [_, rootKey, index, property] = arrayMatch;

          if (!result[rootKey]) result[rootKey] = [];
          if (!result[rootKey][index]) result[rootKey][index] = {};

          const idForm = Object.values(formStore.getUsersAnswerForm).find(
            (val) => val[item.id_form] !== undefined
          )?.[item.id_form];

          const value = idForm ?? item.prpd_param_default;
          result[rootKey][index][property] = value;
          return;
        }

        // Case 3: Object-style parameter (filter.cols)
        const objectMatch = item.prpd_param_name.match(/^([^.]+)\.(\w+)$/);
        if (objectMatch) {
          const [_, rootKey, property] = objectMatch;

          if (!result[rootKey]) result[rootKey] = {};

          const value = item.id_form ?? item.prpd_param_default;
          result[rootKey][property] = value;
        }
      });

      // Convert array-style objects to proper arrays
      Object.keys(result).forEach((key) => {
        if (typeof result[key] === "object" && !Array.isArray(result[key])) {
          const entries = Object.entries(result[key]);
          if (entries.every(([k]) => !isNaN(k))) {
            result[key] = Object.values(result[key]);
          }
        }
      });

      return result;
    }

    return parsed;
  } catch (e) {
    console.error("Error parsing api_params:", e);
    return {};
  }
};

const onClickListAPI = () => {
  $q.dialog({
    component: viewSetupAPIDest,
    componentProps: {
      dataEdit: formsSetup.value.apiOpt,
      forms: props.forms,
      setup: formsSetup.value,
    },
  })
    .onOk(async (val) => {
      formsSetup.value.apiOpt = val;
      console.log(val);
    })
    .onDismiss(() => {
      // getDataHistory();
    });
};

const onClickSetBulkKeys = () => {
  $q.dialog({
    component: viewSetupKeysBulk,
    componentProps: {
      title: "Set Bulk Upload Template Keys",
      dataEdit: formsSetup.value.bulkKeys,
      forms: props.forms,
    },
    persistent: true,
  })
    .onOk(async (val) => {
      formsSetup.value.bulkKeys = val;
      console.log(val);
    })
    .onDismiss(() => {
      // getDataHistory();
    });
};

const onClickSetDefaultFilterData = () => {
  console.log("Current Default Filter Data:", [
    listForms.value,
    formsSetup.value.specificUserSetFilterData,
    formsSetup.value.listSpecificUserRoleSetFilterDataPeriod,
  ]);
  //   optionsUsers
  // optionsRoles
  $q.dialog({
    component: multiplePromptDialog,
    componentProps: {
      title: "Setup Default Filter Data",
      initialFields: [
        [
          {
            label: `Select ${
              formsSetup.value.specificUserSetFilterData === "user"
                ? "users"
                : formsSetup.value.specificUserSetFilterData === "role"
                ? "roles"
                : "users/roles"
            } to be applied`,
            default:
              formsSetup.value.specificUserSetFilterData === "user"
                ? formsSetup.value.listSpecificUserRoleSetFilterDataPeriod ||
                  null
                : formsSetup.value.specificUserSetFilterData === "role"
                ? formsSetup.value.listSpecificUserRoleSetFilterDataPeriod ||
                  null
                : formsSetup.value.listSpecificUserRoleSetFilterDataPeriod ||
                  [],
            type: "select",
            name: "cols",
            options:
              formsSetup.value.specificUserSetFilterData === "user"
                ? optionsUsers.value
                : formsSetup.value.specificUserSetFilterData === "role"
                ? optionsRoles.value
                : [...optionsUsers.value, ...optionsRoles.value],
            multiple: true,
          },
          {
            label: `Select columns to filter`,
            default: listForms.value.length > 0 ? listForms.value[0].field : "",
            type: "select",
            name: "cols",
            options: listForms.value.map((form) => ({
              label: form.label,
              value: form.field,
            })),
          },
          {
            label: `Disable filter ?`,
            default: true,
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
            name: "disableFilter",
          },
          {
            label: `Assign Default Value ?`,
            default: true,
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
            name: "defaultValue",
          },
          {
            label: `Input filter Value`,
            default: "",
            type: "text",
            name: "filterValue",
          },
        ],
      ],
      size: "full",
    },
    persistent: true,
  })
    .onOk(async (val) => {
      try {
        const parsed = val;
        formsSetup.value.defaultFilterData = parsed;
        console.log("Default Filter Data set to:", parsed);
      } catch (e) {
        console.error("Invalid JSON input for Default Filter Data:", e);
        $q.notify({
          type: "negative",
          message: "Invalid JSON format. Please enter valid JSON.",
        });
      }
    })
    .onDismiss(() => {
      // Handle dismiss if needed
    });
};
</script>
