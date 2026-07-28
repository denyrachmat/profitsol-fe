<template>
  <div v-html="resolvedBody"></div>
</template>
<script setup>
import { computed } from "vue";
import { useAuthStore } from "stores/authStore";
import { resolveVariables } from "./variables.js";

const props = defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });

const authStore = useAuthStore();
const resolvedBody = computed(() => resolveVariables(props.block.content.body, authStore));
</script>
