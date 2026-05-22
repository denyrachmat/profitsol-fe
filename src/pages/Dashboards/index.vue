<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="q-pa-sm">
    <div class="row">
      <div class="col-12 col-md-4 q-pa-sm">
        <q-card class="my-card" v-if="store.getDetail">
          <q-img src="~assets/sumitronics_OGP.png" height="36vh">
            <div class="text-center full-width full-height">
              <q-avatar
                size="150px"
                style="margin: 0 auto; top: 20%"
                v-if="
                  store.getDetail.user_det && store.getDetail.user_det.pud_photo
                "
              >
                <img
                  :src="store.getDetail.user_det.pud_photo"
                  style="object-fit: cover"
                />
              </q-avatar>
              <q-avatar
                v-else
                size="150px"
                style="margin: 0 auto; top: 20%"
                color="teal"
                text-color="white"
                icon="account_circle"
                font-size="150px"
              />
            </div>
          </q-img>

          <q-card-section>
            <q-btn
              fab
              color="primary"
              icon="place"
              class="absolute"
              style="top: 0; right: 12px; transform: translateY(-50%)"
            />

            <div class="row no-wrap items-center">
              <div class="col text-h6 ellipsis">
                {{
                  store.authDet && store.getDetail.user_det
                    ? store.getDetail.user_det.pud_first_name
                    : ""
                }}
                {{
                  store.authDet && store.getDetail.user_det
                    ? store.getDetail.user_det.pud_last_name
                    : ""
                }}
              </div>
              <div
                class="col-auto text-grey text-caption q-pt-md row no-wrap items-center"
              >
                <q-icon name="place" />
                250 ft
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-subtitle1">
              {{
                store.getChoosedRole && store.getChoosedRole.role.rm_role_desc
              }}
            </div>
            <!-- <div class="text-caption text-grey">MIS Staff</div> -->
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-btn flat round icon="event" />
            <q-btn flat color="primary" to="/profiles"> Edit Profile </q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-4 q-pa-sm">
        <q-card class="bg-grey">
          <q-card-section class="bg-white text-h5 text-bold text-center">
            Meeting Schedule
          </q-card-section>
          <q-card-section style="overflow-x: auto; height: 50vh">
            <event-list
              :events="mainEvent"
              :now-event="true"
              v-if="Object.values(store.msLoginDet).length > 0"
            />
            <div v-else class="text-center q-pa-md" style="height: 20em">
              <q-btn
                icon="ion-logo-windows"
                label=" Login with Microsoft"
                @click="SignInMs"
                color="blue-5"
              ></q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4 q-pa-sm">
        <q-card class="bg-grey">
          <q-card-section class="bg-white text-h5 text-bold text-center">
            Training List
          </q-card-section>
          <q-card-section style="overflow-x: auto; height: 50vh">
            <informationList
              @info-view="(val) => onViewInformation(val)"
              :key="keyInfo"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row">
      <div class="col q-pa-sm">
        <div class="bg-grey-3 q-pa-md">
          <div class="row">
            <div class="col text-center">
              <strong class="text-h5 text-bold">Application List</strong>
            </div>
          </div>
          <div class="row q-px-md">
            <div class="col text-right">
              <q-btn-toggle
                v-model="viewMode"
                class="my-custom-toggle"
                no-caps
                rounded
                unelevated
                toggle-color="primary"
                color="white"
                text-color="primary"
                :options="[
                  { icon: 'apps', value: 'apps' },
                  { icon: 'format_list_numbered', value: 'list' },
                ]"
              />
            </div>
          </div>
          <div class="row q-px-md">
            <div class="col">
              <appListVue :mode="viewMode" v-if="store.getChoosedRole" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/* eslint-disable */
import { defineComponent, ref, onMounted, watch, onUnmounted } from "vue";
import { useAuthStore } from "stores/authStore";
import { useFormStore } from "stores/formStore";
import apiRequest from "src/components/apiRequest";
import eventList from "./eventList.vue";
import informationList from "./informationList.vue";
import viewApps from "./viewApps.vue";
import { date, useQuasar } from "quasar";

import { authHelper, sharePointService } from "@/components/msHelpers";

import appListVue from "./appList.vue";
// import {
//   Providers,
//   MgtPerson,
//   MgtAgenda,
//   MgtPeople,
//   MgtTasks,
//   IDynamicPerson,
// } from "@microsoft/mgt";

const $q = useQuasar();
const store = useAuthStore();
const formStore = useFormStore();
const viewMode = ref("apps");
const mainEvent = ref([]);
const keyInfo = ref(0);
const keyMeeting = ref(0);
const toggleAutoRefreshInfo = ref(1);
const timeoutRefresh = ref(null);

const { postData } = apiRequest();

onMounted(() => {
  console.log(Object.values(store.msLoginDet));
  if (Object.values(store.msLoginDet).length > 0) {
    getMSUserDetail();
  }

  if (!store.authDet) {
    console.log("masuk sini");
    this.$router.push("login");
  }

  if (toggleAutoRefreshInfo.value === 1) {
    clearInterval(timeoutRefresh.value);
    timeoutRefresh.value = setInterval(() => {
      if (store.getIsNotifDone) {
        keyInfo.value = keyInfo.value + 1;
        getMSUserDetail();
      }
    }, 60000);
  } else {
    clearInterval(timeoutRefresh.value);
  }
});

watch(
  () => toggleAutoRefreshInfo.value,
  (val) => {
    console.log(val);
    if (val === 1) {
      clearInterval(timeoutRefresh.value);
      timeoutRefresh.value = setInterval(() => {
        if (store.getIsNotifDone) {
          keyInfo.value = keyInfo.value + 1;
        }
      }, 60000);
    } else {
      clearInterval(timeoutRefresh.value);
    }
  }
);

onUnmounted(() => {
  clearInterval(timeoutRefresh.value);
});

const getMSUserDetail = async () => {
  if (!store.isMsChecking) {
    return;
  }

  const data = await sharePointService.getCalendarEvents(
    store.msTokenDet.accessToken
  );

  if (data) {
    // console.log(data);
    mainEvent.value = data;
  }
};

const onViewInformation = (val) => {
  if (val.shared && val.shared.forms.cfmt_quiz_flag == 1) {
    console.log(val);
    $q.dialog({
      title: "Start Quiz",
      message: "Are you sure want to start this quiz?",
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      formStore.hashFormsUpdate(val.pnm_hash_id_location);
      formStore.setStartDateForm(val.pnm_start_date);
      formStore.setEndDateForm(val.pnm_end_date);

      console.log(
        date.getDateDiff(new Date(val.pnm_end_date), new Date(), "days")
      );
      if (
        date.getDateDiff(new Date(val.pnm_end_date), new Date(), "days") >= 0
      ) {
        console.log(formStore);
        formStore.setStartTimeState(false);
        // formStore.setFinishQuizState(false);

        $q.dialog({
          component: viewApps,

          // props forwarded to your custom component
          componentProps: {
            dataProps: val.pnm_action_url,
            title: val.pnm_title,
            // ...more..props...
          },
        }).onOk(async (val) => {});
      } else {
        $q.notify({
          message: `Sorry this quiz already expired or already answered !!`,
          caption: `Expired on ${date.formatDate(
            val.pnm_end_date,
            "DD MMM YYYY HH:mm:ss"
          )}`,
          color: "red",
        });
      }
    });
  } else {
    formStore.hashFormsUpdate(val.pnm_hash_id_location);
    console.log(val);
    $q.dialog({
      component: viewApps,

      // props forwarded to your custom component
      componentProps: {
        dataProps: val.pnm_action_url,
        title: val.pnm_title,
        // ...more..props...
      },
    }).onOk(async (val) => {});
  }
};

// Providers.globalProvider = new Msal2Provider({
//   clientId: "fad753b2-465c-4663-b44b-50aabeb3a4ed",
// });
</script>
