<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="q-pa-sm">
    <div class="row q-py-sm">
      <div class="col-12 col-sm-3 q-pa-sm">
        <q-card class="my-card" v-if="store.getDetail">
          <q-img src="https://cdn.quasar.dev/img/chicken-salad.jpg">
            <div class="text-center full-width full-height">
              <q-avatar
                size="150px"
                style="margin: 0 auto; top: 20%"
                v-if="store.getDetail.user_det.pud_photo"
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
                  store.authDet ? store.getDetail.user_det.pud_first_name : ""
                }}
                {{
                  store.authDet ? store.getDetail.user_det.pud_last_name : ""
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
            <div class="text-subtitle1">IT Departement</div>
            <div class="text-caption text-grey">MIS Staff</div>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-btn flat round icon="event" />
            <q-btn flat color="primary" to="/profiles"> Edit Profile </q-btn>
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-12 col-sm-9 q-pa-sm">
        <div class="row bg-grey-3 full-height">
          <div class="col q-py-md">
            <div class="full-height row">
              <div class="col-12 col-md-6">
                <div class="text-center">
                  <strong class="text-h5 text-bold">Meeting Schedule</strong>
                </div>
                <div style="overflow: scroll; max-height: 50em">
                  <eventList
                    :events="mainEvent"
                    v-if="Object.values(store.msLoginDet).length > 0"
                  />
                  <div v-else class="text-center q-pa-md" style="height: 20em">
                    <q-btn
                      icon="ion-logo-windows"
                      label=" Login with Microsoft"
                      @click="SignInMs"
                      color="blue-5"
                      outline
                    ></q-btn>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 q-pl-sm">
                <div class="text-center">
                  <strong class="text-h5 text-bold">Information</strong>
                </div>
                <div style="overflow: scroll; max-height: 50em">
                  <informationList
                    @info-view="(val) => onViewInformation(val)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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
import { defineComponent, ref, onMounted } from "vue";
import { useAuthStore } from "stores/authStore";
import apiRequest from "src/components/apiRequest";
import eventList from "./eventList.vue";
import informationList from "./informationList.vue";
// import {
//   Providers,
//   MgtPerson,
//   MgtAgenda,
//   MgtPeople,
//   MgtTasks,
//   IDynamicPerson,
// } from "@microsoft/mgt";

import appListVue from "./appList.vue";
const store = useAuthStore();
const viewMode = ref("apps");
const mainEvent = ref([]);

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
});

const getMSUserDetail = async () => {
  const data = await postData(
    "get",
    null,
    null,
    false,
    false,
    false,
    process.env.GRAPH_API + "me/calendar/events",
    true
  );

  console.log(process.env.GRAPH_API + store.getMSLogDet.localAccountId);

  if (data) {
    mainEvent.value = data.value;
  }
};

const onViewInformation = (val) => {
  console.log(val);
};

// Providers.globalProvider = new Msal2Provider({
//   clientId: "fad753b2-465c-4663-b44b-50aabeb3a4ed",
// });
</script>
