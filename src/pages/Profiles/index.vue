<template>
  <div class="q-gutter-md q-pa-lg bg-grey-2">
    <div class="row q-py-md">
      <div class="col text-center">
        <b class="text-h4">Profiles</b>
      </div>
    </div>

    <q-card>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="personal" label="Personal" icon="person" />
        <q-tab name="settings" label="Settings" icon="settings" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="personal">
          <setupPersonalProfilesVue />
        </q-tab-panel>
        <q-tab-panel name="settings">
          <setupProfilesVue />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>
<script setup>
/* eslint-disable */
import { defineComponent, ref, watch } from "vue";
import { useAuthStore } from "stores/authStore";
import _ from "lodash";
import setupPersonalProfilesVue from "./setupPersonalProfiles.vue";
import setupProfilesVue from "./setupProfiles.vue";

const tab = ref("personal");
const store = useAuthStore();
</script>
