<template>
  <q-layout
    view="lhh LpR lff"
    style="height: 500px"
    class="shadow-2 rounded-borders"
  >
    <q-page-container>
      <div class="q-pa-md">
        <div class="row">
          <div class="col text-center">
            <span class="text-bold text-h3">Approval Action</span>
          </div>
        </div>
        <div class="row q-pt-md">
          <div class="col text-center">
            <span class="text-h6">{{ datas ? datas.ams_title : "" }}</span>
          </div>
        </div>

        <div class="row">
          <div class="col text-center" v-if="loading">
            <div class="text-h6 text-center">
              Please wait, data is loading...
            </div>
          </div>
          <div
            class="col-12"
            v-else-if="!loading && datas && datas.apprv_set"
            v-html="datas.apprv_set.amssd_content"
          ></div>
          <div class="col text-center" v-else>
            <q-img src="~assets/401.png" width="30%" />
            <div class="text-h6 text-center">
              Sorry you're doesn't have authorize to approve this approval or
              token is expired
            </div>
          </div>
        </div>
      </div>
    </q-page-container>

    <q-footer class="text-primary bg-white" style="z-index: 1059">
      <div class="row q-pb-md">
        <div class="col">
          <q-btn
            color="primary"
            label="Approve"
            class="full-width"
            @click="actionApprove(1)"
            :loading="loading"
            :disable="!datas.token"
          />
        </div>
        <div class="col q-pl-md">
          <q-btn
            color="red"
            label="Reject"
            class="full-width"
            @click="actionApprove(0)"
            :loading="loading"
            :disable="!datas.token"
          />
        </div>
      </div>
      <q-toolbar>
        <q-toolbar-title> Approval Action </q-toolbar-title>

        <div>v1.0.0</div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>
<script setup>
import { ref, defineProps, onMounted, computed, watch, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import { useRoute } from "vue-router";

import addApprovalMapping from "./addApprovalMapping.vue";

const $q = useQuasar();
const route = useRoute();
const { postData } = apiRequest();

const datas = ref({});
const loading = ref(false);

onMounted(() => {
  getData();
});

const getData = async () => {
  // route.params.username
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `ams/getMasterApprovalByToken/${route.params.token}/${route.params.tokenHist}`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    datas.value = data.data;
  }
};

const actionApprove = (stat) => {
  $q.dialog({
    dark: stat !== 1,
    title: stat === 1 ? "Approve" : "Reject",
    message: `Please add reason to ${
      stat === 1 ? "approve" : "reject"
    } this approval.`,
    prompt: {
      model: "",
      type: "text", // optional
    },
    cancel: true,
    persistent: true,
  })
    .onOk(async (dataRemarks) => {
      // console.log('>>>> OK, received', data)
      // approveAction

      loading.value = true;
      const data = await postData(
        "post",
        {
          username: datas.value.token.hist[0].amshd_username_apprv,
          amsm_id: datas.value.token.hist[0].amsm_id,
          stat: stat,
          remarks: dataRemarks,
          data: JSON.parse(datas.value.token.hist[0].amshd_paramstore),
        },
        `ams/approveAction`,
        false,
        false,
        true
      );

      if (data) {
        loading.value = false;
        let seconds = 5;

        const dialog = $q
          .dialog({
            title: "Alert",
            message: `Autoclosing in ${seconds} seconds.`,
          })
          .onOk(() => {
            // console.log('OK')
          })
          .onCancel(() => {
            // console.log('Cancel')
          })
          .onDismiss(() => {
            clearTimeout(timer);
            window.close();
            // console.log('I am triggered on both OK and Cancel')
          });

        const timer = setInterval(() => {
          seconds--;

          if (seconds > 0) {
            dialog.update({
              message: `Autoclosing in ${seconds} second${
                seconds > 1 ? "s" : ""
              }.`,
            });
          } else {
            clearInterval(timer);
            dialog.hide();
            window.close();
          }
        }, 1000);
      } else {
        loading.value = false;
      }
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
};
</script>
