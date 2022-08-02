<template>
  <q-list
    bordered
    separator
    class="full-width"
    v-for="(element, idx) in dataProps"
    :key="idx"
  >
    <q-item v-if="element.child_roles.length === 0" clickable>
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
      v-else
    >
      <appListRows :dataProps="element.child_roles" />
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
