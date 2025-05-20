<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @escape-key="onDialogCancel()"
  >
    <q-card class="q-dialog-plugin">
      <q-bar>
        {{ title }}
        <q-space />
        <q-btn dense flat icon="close" @click="closeProgram">
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>
      <div>
        <iframe
          v-if="url.includes('http')"
          :src="changeParamURL(url)"
          class="full-width window-height"
        ></iframe>
        <template v-else>
          <router-view v-if="isRouter"></router-view>
          <component :is="content" v-else />
        </template>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup>
import {
  ref,
  onMounted,
  defineAsyncComponent,
  computed,
  watch,
  onUnmounted,
} from "vue";
import { useDialogPluginComponent, date, useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useFormStore } from "stores/formStore";
import { useAuthStore } from "stores/authStore";
import error404 from "./error404.vue";
import apiRequest from "src/components/apiRequest";
import axios from "src/boot/axios";

import DMSUploadDocument from "../DMS/uploadDocument.vue";

const $q = useQuasar();
const { postData } = apiRequest();
const router = useRouter();
const formStore = useFormStore();
const authStore = useAuthStore();
const props = defineProps({
  dataProps: String,
  title: String,
  isRouter: Boolean,
  // ...your custom props
});

const url = ref("");
const content = ref(null);

const changeParamURL = (urlNya) =>
  urlNya.replace("{{username}}", authStore.authDet.username);

onMounted(async () => {
  $q.notify({
    message: "Click x button on upper right or press ESC Key to close apps.",
    color: "orange",
    position: "top-left",
    icon: "info",
  });
  if (props.isRouter) {
    url.value = props.dataProps;
    console.log("urlnya", url.value);
    // router.push(url.value);
    content.value = await import(`../${url.value}.vue`);
  } else {
    url.value = props.dataProps;

    if (url.value.includes("http")) {
      // Find Username variable
      const urlNew = url.value.replace(
        "{{username}}",
        authStore.authDet.username
      );

      console.log(urlNew);

      const res = await axios.get(urlNew).then((val) => val);
      const blob = await res.blob();
      const urlObject = URL.createObjectURL(blob);
      document.querySelector("iframe").setAttribute("src", urlObject);

      // const data = await postData(
      //   "get",
      //   null,
      //   `ams/approval`,
      //   false,
      //   false,
      //   true
      // );
      // if (data) {
      //   loading.value = false;
      //   rows.value = data;
      // }
    } else {
      console.log(props);
      content.value = defineAsyncComponent({
        loader: () => import("../" + url.value + ".vue"),
        errorComponent: error404,
      });
    }
  }
});

// const dyne = computed(() => {
//   const urlCompile = "../" + url.value + ".vue";
//   content.value = defineAsyncComponent(() => import("../" + url.value + ".vue"));
// });

const handleLoginSuccess = () => {
  const { credential } = response;
  console.log("Access Token", credential);
};
// handle an error event
const handleLoginError = () => {
  console.error("Login failed");
};

const closeProgram = () => {
  $q.dialog({
    title: "Confirm",
    message: "Would you like to close this program ?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    router.push("/");
    // router.back();
    onDialogCancel();
    // console.log('>>>> OK')
  });
};

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

watch(formStore, (val) => {
  const datanya = formStore;

  console.log("wathc di viewapp", datanya);
  if (
    datanya.getSetUpTimer &&
    datanya.getHashForm !== "" &&
    datanya.getStartTimeState &&
    datanya.getFinishQuizState
  ) {
    onDialogCancel();
  }
  // else {
  //   formStore.setStartTimeState(false);
  //   formStore.setFinishQuizState(false);
  // }
});
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK(dataHasil);
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
