<template>
  <div class="row">
    <div class="col-4 q-pa-sm" v-for="(menu, idx) in listMenu" :key="idx">
      <q-card class="my-card">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ menu.am_app_name }}</div>
          <div class="text-subtitle2">{{ menu.am_app_desc }}</div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat @click="chooseApp(menu.am_app_code)">GO</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, computed } from "vue";
import { useAuthStore } from "stores/authStore";

const props = defineProps({
  mode: Object || null,
  // ...your custom props
});

const store = useAuthStore();

const clickedApp = ref(null);

const listMenu = computed(() => {
  return !clickedApp.value ? store.getChoosedRole.role.role_app_map : [];
});

const chooseApp = (val) => {
  clickedApp.value = val;
};
</script>