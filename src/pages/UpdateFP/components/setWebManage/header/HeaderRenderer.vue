<template>
  <q-header v-if="config && config.enabled" :elevated="!!config.elevated">
    <HeaderBar :config="config" />
  </q-header>
</template>
<script setup>
import HeaderBar from "./HeaderBar.vue";

defineProps({
  config: { type: Object, default: null },
});
</script>
