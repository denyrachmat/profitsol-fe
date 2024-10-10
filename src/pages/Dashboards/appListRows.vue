<template>
  <q-list
    separator
    class="full-width bg-white"
    v-for="(element, idx) in dataProps"
    :key="idx"
  >
    <q-item
      v-if="element.child_roles.length === 0"
      clickable
      @click="chooseApp(element)"
    >
      <q-item-section avatar>
        <q-avatar :icon="element.apps.am_app_icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ element.apps.am_app_name }}</q-item-label>
        <q-item-label caption>{{ element.apps.am_app_desc }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-expansion-item
      expand-separator
      :icon="element.apps.am_app_icon"
      :label="element.apps.am_app_name"
      :caption="element.apps.am_app_desc"
      :content-inset-level="1"
      default-opened
      v-else
    >
      <appListRows :dataProps="element.child_roles" />
    </q-expansion-item>
  </q-list>
</template>
<script setup>
import draggable from "vuedraggable";
import { ref, onMounted, watch } from "vue";
import { useDialogPluginComponent, date, useQuasar } from "quasar";

import viewApps from "./viewApps.vue";

const $q = useQuasar();
const dataHasil = ref(null);

const props = defineProps({
  dataProps: Object || null,
  // ...your custom props
});

onMounted(() => {
  dataHasil.value = props.dataProps;
});

const chooseApp = (val) => {
  // console.log(val);
  $q.dialog({
    component: viewApps,

    // props forwarded to your custom component
    componentProps: {
      dataProps: val.apps.am_app_url,
      title: val.apps.am_app_name,
      // ...more..props...
    },
  }).onOk(async (val) => {});
};
</script>
