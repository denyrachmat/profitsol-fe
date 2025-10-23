<template>
  <div>Loading authentication...</div>
</template>

<script setup>
import { onMounted } from "vue";
import { authHelper } from "src/components/msHelpers/authHelper";

onMounted(async () => {
  try {
    await authHelper.instance.handleRedirectPromise();
  } catch (e) {
    console.error("Auth popup error:", e);
  }
});
</script>
