<template>
  <div :class="className">
    <div class="text-caption text-grey-7 q-mb-xs">{{ label }}</div>
    <div class="row q-gutter-xs items-center no-wrap">
      <div
        v-for="opt in presets"
        :key="opt.value"
        class="color-dot"
        :class="{ active: modelValue === opt.value }"
        :style="{ backgroundColor: opt.hex }"
        @click="pick(opt.value)"
      >
        <q-tooltip>{{ opt.label || opt.value }}</q-tooltip>
      </div>
      <q-separator vertical class="q-mx-xs" />
      <label class="color-pick-wrapper">
        <input
          type="color"
          :value="colorInputValue"
          @input="pick($event.target.value)"
          class="color-pick-input"
        />
        <q-icon name="palette" size="xs" class="cursor-pointer" />
      </label>
      <q-btn
        v-if="modelValue"
        flat
        dense
        round
        icon="close"
        size="xs"
        @click="pick('')"
      />
      <q-input
        :model-value="modelValue"
        @update:model-value="pick"
        dense
        outlined
        placeholder="or type (white, rgba(...))"
        class="col"
      />
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "Color" },
  className: { type: String, default: "q-mb-sm" },
});
const emit = defineEmits(["update:modelValue"]);

const presets = [
  { label: "White", value: "#ffffff", hex: "#ffffff" },
  { label: "Black", value: "#000000", hex: "#000000" },
  { label: "Dark Green", value: "#0b3d2e", hex: "#0b3d2e" },
  { label: "Primary", value: "#1976d2", hex: "#1976d2" },
  { label: "Positive", value: "#21ba45", hex: "#21ba45" },
  { label: "Negative", value: "#c10015", hex: "#c10015" },
  { label: "Warning", value: "#f2c037", hex: "#f2c037" },
  { label: "Grey", value: "#9e9e9e", hex: "#9e9e9e" },
];

const pick = (v) => emit("update:modelValue", v ?? "");

// Native <input type="color"> only accepts #rrggbb.
const colorInputValue = computed(() => {
  const v = props.modelValue;
  if (v && /^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (v && /^#[0-9a-fA-F]{3}$/.test(v)) {
    return "#" + v.slice(1).split("").map((c) => c + c).join("");
  }
  return "#000000";
});
</script>
<style scoped>
.color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.15s, transform 0.15s;
}
.color-dot:hover {
  transform: scale(1.15);
}
.color-dot.active {
  border-color: #333;
  transform: scale(1.15);
}
.color-pick-wrapper {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.color-pick-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
