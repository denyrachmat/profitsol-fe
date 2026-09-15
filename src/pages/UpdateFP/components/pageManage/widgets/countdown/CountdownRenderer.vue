<template>
  <div :class="block.content.theme === 'dark' ? 'bg-dark text-white q-pa-md rounded text-center' : 'bg-grey-1 q-pa-md rounded text-center'">
    <div v-if="block.content.label" class="text-subtitle1 q-mb-sm">{{ block.content.label }}</div>
    <div v-if="countdownDisplay" class="row q-gutter-sm justify-center">
      <div v-for="(unit, key) in countdownDisplay" :key="key" class="countdown-unit text-center">
        <div class="text-h4 text-weight-bold">{{ unit }}</div>
        <div class="text-caption">{{ key }}</div>
      </div>
    </div>
    <div v-else class="text-grey-5 text-caption">Set a target date to start countdown</div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
const props = defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
const countdownDisplay = ref(null);
let countdownInterval = null;
const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  const target = props.block.content?.targetDate;
  if (!target) { countdownDisplay.value = null; return; }
  const update = () => {
    const now = new Date().getTime();
    const targetTime = new Date(target).getTime();
    const diff = Math.max(0, targetTime - now);
    if (diff <= 0) {
      countdownDisplay.value = { Days: "00", Hours: "00", Minutes: "00", Seconds: "00" };
    } else {
      countdownDisplay.value = {
        Days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        Hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0"),
        Minutes: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0"),
        Seconds: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0"),
      };
    }
  };
  update();
  countdownInterval = setInterval(update, 1000);
};
watch(() => props.block.content?.targetDate, () => startCountdown(), { immediate: true });
</script>
<style scoped>
.countdown-unit { min-width: 60px; padding: 8px 12px; background: rgba(0, 0, 0, 0.05); border-radius: 8px; }
.bg-dark .countdown-unit { background: rgba(255, 255, 255, 0.1); }
</style>
