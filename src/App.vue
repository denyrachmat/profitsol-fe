<template>
  <router-view />
</template>

<script>
window.onbeforeunload = function (e) {
  return "Please press the Logout button to logout.";
};

import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>
