<template>
  <q-list bordered separator v-for="(element, idx) in dataProps" :key="idx">
    <q-item v-if="element.child_apps.length === 0" clickable>
      <q-item-section avatar>
        <q-avatar :icon="element.am_app_icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ element.am_app_name }}</q-item-label>
        <q-item-label caption>App Name</q-item-label>
      </q-item-section>
    </q-item>
    <q-expansion-item
      expand-separator
      :icon="element.am_app_icon"
      :label="element.am_app_name"
      v-else
    >
      <mappingAppsContent :dataProps="element.child_apps" />
    </q-expansion-item>
  </q-list>
</template>
<script setup>
import draggable from "vuedraggable";
import { ref, onMounted, watch } from "vue";
import { useDialogPluginComponent, date } from "quasar";

const dataHasil = ref(null);

const props = defineProps({
  dataProps: Object || null,
  // ...your custom props
});

onMounted(() => {
  dataHasil.value = props.dataProps;
});
</script>
