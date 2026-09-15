<template>
  <div :class="className">
    <div class="text-caption text-grey-7 q-mb-xs">{{ label }}</div>
    <div class="row q-col-gutter-xs">
      <div class="col-6">
        <q-input v-model="top" label="Top" dense outlined placeholder="0" />
      </div>
      <div class="col-6">
        <q-input v-model="right" label="Right" dense outlined placeholder="0" />
      </div>
      <div class="col-6">
        <q-input v-model="bottom" label="Bottom" dense outlined placeholder="0" />
      </div>
      <div class="col-6">
        <q-input v-model="left" label="Left" dense outlined placeholder="0" />
      </div>
    </div>
    <div class="text-caption text-grey-5 q-mt-xs">
      Accepts CSS values (16px, 1rem, 0). Plain numbers default to px.
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "Padding" },
  className: { type: String, default: "q-mb-sm" },
});
const emit = defineEmits(["update:modelValue"]);

// CSS shorthand -> [top, right, bottom, left]
const parse = (v) => {
  const s = (v || "").trim();
  if (!s) return ["", "", "", ""];
  const p = s.split(/\s+/);
  if (p.length === 1) return [p[0], p[0], p[0], p[0]];
  if (p.length === 2) return [p[0], p[1], p[0], p[1]];
  if (p.length === 3) return [p[0], p[1], p[2], p[1]];
  return [p[0], p[1], p[2], p[3] || ""];
};

const withUnit = (v) => {
  const s = (v || "").trim();
  if (s === "") return "";
  if (/^-?\d*\.?\d+$/.test(s)) return s + "px";
  return s;
};

const compose = () => {
  const vals = [top.value, right.value, bottom.value, left.value].map(withUnit);
  if (vals.every((x) => x === "")) return "";
  return vals.map((x) => (x === "" ? "0" : x)).join(" ");
};

const init = parse(props.modelValue);
const top = ref(init[0]);
const right = ref(init[1]);
const bottom = ref(init[2]);
const left = ref(init[3]);

watch(
  () => props.modelValue,
  (v) => {
    // Skip the echo of our own emit to avoid a feedback loop.
    if ((v || "").trim() === compose().trim()) return;
    const p = parse(v);
    top.value = p[0];
    right.value = p[1];
    bottom.value = p[2];
    left.value = p[3];
  }
);

watch([top, right, bottom, left], () => {
  emit("update:modelValue", compose());
});
</script>
