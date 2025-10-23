<template>
  <q-layout
    view="lhh LpR lff"
    style="height: 500px"
    class="shadow-2 rounded-borders"
  >
    <q-page-container>
      <div class="q-pa-lg">
        <div class="row">
          <div class="col text-center">
            <span class="text-bold text-h3"
              >Approval
              {{
                datas.token && datas.token.deleted_at ? "Complete" : "Action"
              }}</span
            >
          </div>
        </div>
        <div class="row q-pt-md">
          <div class="col text-center">
            <span class="text-h6">{{ datas ? datas.ams_title : "" }}</span>
          </div>
        </div>
        <q-separator spaced />
        <div class="row" v-if="datas.token && datas.token.selected_hist">
          <div
            class="col"
            v-for="(attch, idx) in datas.token.selected_hist[1].attch"
            :key="idx"
          >
            <q-btn-dropdown
              :icon="`las ${getIcon(attch.amaad_filename).icon}`"
              :label="attch.amaad_filename"
              outline
              :color="getIcon(attch.amaad_filename).color"
              size="lg"
            >
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  @click="onDownloadAttachment(attch, true)"
                >
                  <q-item-section avatar>
                    <q-avatar
                      icon="open_in_new"
                      color="primary"
                      text-color="white"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Open File</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="onDownloadAttachment(attch)"
                >
                  <q-item-section avatar>
                    <q-avatar
                      icon="download"
                      color="primary"
                      text-color="white"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Download File</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
        <q-separator spaced />
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
          <div class="col text-center" v-else-if="!loading && !datas">
            <q-img src="~assets/401.png" width="30%" />
            <div class="text-h6 text-center">
              Sorry you're doesn't have authorize to view this notification or
              token is expired
            </div>
          </div>
        </div>
      </div>
    </q-page-container>

    <q-footer class="text-primary bg-white" style="z-index: 1059">
      <div
        class="row q-pb-md"
        v-if="
          !(route.params.mode && route.params.mode == 'disp') &&
          !(datas.token && datas.token.deleted_at)
        "
      >
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
import { useRoute, useRouter } from "vue-router";
import extList from "src/components/folders/extList.json";
import { fileTypeFromBuffer } from "file-type";

import addApprovalMapping from "./addApprovalMapping.vue";
import openFiles from "src/components/files/openFiles.vue";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const { postData } = apiRequest();

const datas = ref({});
const loading = ref(false);
const base64Files = ref("");

onMounted(() => {
  if (route.params.mode == "disp") {
    getData(1);
  } else {
    getData();
  }
});

const getData = async (mode) => {
  // route.params.username
  loading.value = true;
  const data = await postData(
    "get",
    null,
    mode
      ? `ams/getMasterApprovalByToken/${route.params.token}/${route.params.tokenHist}/1`
      : `ams/getMasterApprovalByToken/${route.params.token}/${route.params.tokenHist}`,
    false,
    false,
    true,
    null,
    false,
    false,
    true
  );

  if (data.status) {
    loading.value = false;
    datas.value = data.data;
  } else {
    if (
      data.message.includes("Token not found") &&
      !route.fullPath.includes("/disp")
    ) {
      router.push(route.fullPath.concat("/disp"));
      getData(1);
    } else {
      loading.value = false;
      datas.value = false;
    }
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
      loading.value = true;
      const data = await postData(
        "post",
        {
          username: datas.value.token.selected_hist[0].amshd_username_apprv,
          amsm_id: datas.value.token.selected_hist[0].amsm_id,
          stat: stat,
          remarks: dataRemarks,
          token: datas.value.token.selected_hist[1].amshd_token,
          ...JSON.parse(datas.value.token.selected_hist[0].amshd_paramstore),
        },
        `ams/approveAction`,
        false,
        false,
        true
      );

      if (data) {
        loading.value = false;
        let seconds = 5;
        getData();
        setTimeout(window.close, 5000);

        const dialog = $q
          .dialog({
            title: "Success",
            message: `Approval has been sent, Autoclosing in ${seconds} seconds.`,
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
              message: `Approval has been sent, Autoclosing in ${seconds} second${
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

const getIcon = (filename) => {
  const splitter = filename.split(".");
  const getfileIcon = extList.filter(
    (fil) => fil.ext === splitter[splitter.length - 1]
  );

  return getfileIcon[0];
};

const onDownloadAttachment = async (dataAttch, open = false) => {
  const dataFetch = JSON.parse(dataAttch.amaad_dl_link);
  loading.value = true;
  const dataCheck = await postData(
    dataFetch.method,
    dataFetch.param ?? null,
    dataFetch.url,
    false,
    false,
    true,
    dataFetch.url
  );

  if (dataCheck) {
    console.log(dataCheck);
    loading.value = false;
    if (open) {
      $q.dialog({
        component: openFiles,

        // props forwarded to your custom component
        componentProps: {
          base64File: dataCheck.data.base64Files,
          ext: dataCheck.data.ext,
          mime: dataCheck.data.mime,
          title: dataCheck.data.filename,
          // ...more..props...
        },
      }).onOk(async (val) => {
        console.log(val);
      });
    } else {
      const win = window.open();
      win.document.write(
        '<iframe src="' +
          dataCheck.data.base64Files +
          '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
      );
    }
  } else {
    loading.value = false;
  }
};
</script>
