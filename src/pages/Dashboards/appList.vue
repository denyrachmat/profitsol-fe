<template>
  <div class="row">
    <div class="col">
      <div class="row q-pa-sm">
        <div class="col">
          <q-breadcrumbs class="text-brown">
            <template v-slot:separator>
              <q-icon size="1.5em" name="chevron_right" color="primary" />
            </template>

            <q-breadcrumbs-el
              label="Home"
              icon="home"
              class="cursor-pointer"
              @click="clickedApp = []"
            />
            <q-breadcrumbs-el
              :label="menu.am_app_name"
              :icon="menu.am_app_icon"
              v-for="(menu, idx) in findChoosedApps(
                store.getChoosedRole.role.role_app_map,
                clickedApp
              )"
              :key="idx + 'bc'"
              class="cursor-pointer"
              @click="goToNav(idx)"
            />
          </q-breadcrumbs>
        </div>
      </div>
      <div class="row q-pa-sm">
        <div class="col">
          <q-input label="Search App" v-model="searchApp" />
        </div>
      </div>
      <div class="row" v-if="mode === 'apps'">
        <div
          class="col-12 col-md-4 q-pa-sm text-center"
          v-for="(menu, idx) in listMenu"
          :key="idx"
        >
          <q-card style="min-height: 25em" class="relative-position">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">{{ menu.apps.am_app_name }}</div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-md text-center full-height">
              <div class="text-subtitle2">{{ menu.apps.am_app_desc }}</div>
              <q-icon :name="menu.apps.am_app_icon" size="10vh" />
            </q-card-section>

            <q-card-actions
              align="right"
              class="full-width"
              style="position: absolute; bottom: 0"
            >
              <q-btn
                color="cyan"
                icon-right="exit_to_app"
                @click="chooseApp(menu)"
                >GO
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
      <div class="row" v-else>
        <appListRows :dataProps="listMenu" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, computed } from "vue";
import { useAuthStore } from "stores/authStore";
import { useQuasar, date } from "quasar";

import viewApps from "./viewApps.vue";
import appListRows from "./appListRows.vue";

import uploadDocument from "../DMS/uploadDocument.vue";

const $q = useQuasar();

const props = defineProps({
  mode: String,
  // ...your custom props
});

const store = useAuthStore();

const clickedApp = ref([]);
const searchApp = ref("");

const listMenu = computed(() => {
  return clickedApp.value.length === 0
    ? store.getChoosedRole.role.role_app_map
    : findApps(store.getChoosedRole.role.role_app_map, clickedApp.value)[0];
});

const findApps = (arr, id = []) => {
  return arr.reduce((r, o) => {
    const children = findApps(o.child_roles, id);
    // console.log([children, o.am_app_id === id[id.length - 1], o]);
    if (o.am_app_id === id[id.length - 1]) {
      // r.push(o.child_roles, ...children);
      r.push(o.child_roles);
    } else {
      r.push(...children);
    }

    return r;
  }, []);
};

const findChoosedApps = (arr, id) => {
  return arr.reduce((r, o) => {
    const children = findChoosedApps(o.child_roles, id);
    if (id.includes(o.am_app_id) || children.length > 0) {
      r.push(o.apps, ...children);
    }
    return r;
  }, []);
};

const chooseApp = (val) => {
  // console.log(val);
  if (val && val.child_roles.length === 0) {
    $q.dialog({
      component: viewApps,

      // props forwarded to your custom component
      componentProps: {
        dataProps: val.apps.am_app_url,
        title: val.apps.am_app_name,
        // ...more..props...
      },
    }).onOk(async (val) => {});
  } else {
    clickedApp.value = [...clickedApp.value, val.apps.am_app_code];
  }
};

const goToNav = (idx) => {
  const datanya = clickedApp.value;
  datanya.splice(idx + 1, clickedApp.value.length - (idx + 1));

  clickedApp.value = datanya;
};
</script>
