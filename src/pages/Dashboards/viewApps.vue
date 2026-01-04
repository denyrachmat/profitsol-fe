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
        <q-btn dense flat icon="minimize" @click="onClickMinimize">
          <q-tooltip class="bg-white text-primary">Minimize Program</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="close" @click="closeProgram">
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>

      <div>
        <!-- For full external URLs -->
        <iframe
          v-if="url.includes('http')"
          :src="changeParamURL(url)"
          class="full-width window-height"
        ></iframe>

        <!-- For internal router routes like /forms/:id -->
        <template v-else-if="props.isRouter">
          <template v-if="content">
            <component :is="content" v-bind="query" />
          </template>
          <template v-else>
            <div>Loading component...</div>
          </template>
        </template>

        <!-- For local Vue components (e.g. '../DMS/uploadDocument.vue') -->
        <template v-else>
          <component :is="content" />
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
  watch,
  nextTick,
  getCurrentInstance,
} from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import { useFormStore } from "stores/formStore";
import { useAuthStore } from "stores/authStore";
import error404 from "./error404.vue";
import axios from "src/boot/axios";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const formStore = useFormStore();
const authStore = useAuthStore();
const props = defineProps({
  dataProps: String,
  title: String,
  isRouter: Boolean,
});

const url = ref("");
const content = ref(null);
const query = ref({});
const { proxy } = getCurrentInstance();

const changeParamURL = (urlNya) =>
  urlNya.replace("{{username}}", authStore.authDet.username);

const viewModules = import.meta.glob("../**/*.vue"); // relative ke file ini
const loadVue = (relativeNoExt) => {
  // relativeNoExt contoh: '../UpdateFP/UpdateFPIndex'
  const key = `${relativeNoExt}.vue`;
  const importer = viewModules[key];
  if (!importer) {
    // fallback: coba normalisasi double slash, dll
    throw new Error(`Component not found for key: ${key}`);
  }
  return importer();
};

onMounted(async () => {
  $q.notify({
    message: "Click x button on upper right or press ESC Key to close apps.",
    color: "orange",
    position: "top-left",
    icon: "info",
  });

  url.value = props.dataProps;

  if (props.isRouter) {
    // remove leading slash and query parameters
    const cleanPath = url.value.replace(/^\//, "").split("?")[0];
    console.log("Loading dynamic component at:", cleanPath);

    content.value = defineAsyncComponent({
      loader: () => loadVue(`../${cleanPath}`),
      errorComponent: error404,
    });

    // OPTIONAL: Parse query parameters like ?id=123
    const queryString = url.value.split("?")[1];
    if (queryString) {
      const params = new URLSearchParams(queryString);
      query.value = Object.fromEntries(params);
      console.log("Query params:", Object.fromEntries(params));
      // You could pass these as props if needed
    }
  } else if (url.value.includes("http")) {
    // Remote HTTP content handling (convert to blob and inject into iframe)
    const urlNew = changeParamURL(url.value);
    const res = await axios.get(urlNew);
    const blob = await res.blob();
    const urlObject = URL.createObjectURL(blob);
    document.querySelector("iframe").setAttribute("src", urlObject);
  } else {
    console.log("Loading dynamic component at:", url.value);
    // Local component loader
    content.value = defineAsyncComponent({
      loader: () => loadVue(`../${url.value}`),
      errorComponent: error404,
    });
  }
});

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const closeProgram = () => {
  $q.dialog({
    title: "Confirm",
    message: "Would you like to close this program?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    router.push("/portal");
    onDialogCancel();
  });
};

const onClickMinimize = () => {
  authStore.storeMinimizedMenu(authStore.getChoosedMenu);

  onDialogHide();
};

// Optional: Watch formStore to close dialog on quiz finish
watch(formStore, (val) => {
  const datanya = formStore;
  if (
    datanya.getSetUpTimer &&
    datanya.getHashForm !== "" &&
    datanya.getStartTimeState &&
    datanya.getFinishQuizState
  ) {
    onDialogCancel();
  }
});

// Watch content ref to see when the component is loaded
watch(content, (newVal) => {
  if (newVal) {
    console.log("Rendered component:", newVal);
    // Optionally call methods from newVal
    // e.g., newVal.someInitMethod()
  }
});

// Optional: If you want to always reload on same route
watch(
  () => proxy.$route.fullPath,
  () => {
    nextTick(() => {
      console.log("Router view reloaded. Component:", content.value);
    });
  }
);
</script>
