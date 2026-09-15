<template>
  <div>
    <q-input v-model.number="slideCount" label="Number of Slides" type="number" dense outlined min="1" max="20" class="q-mb-sm" />
    <q-input v-model="height" label="Carousel Height" dense outlined class="q-mb-sm" hint="e.g. 300px, 40vh, auto" />
    <q-toggle v-model="navigation" label="Navigation Dots" dense class="q-mb-sm" />
    <q-toggle v-model="arrows" label="Arrows" dense class="q-mb-sm" />
    <q-toggle v-model="swipeable" label="Swipeable" dense class="q-mb-sm" />
    <q-toggle v-model="autoplay" label="Autoplay" dense class="q-mb-sm" />
    <q-input v-if="autoplay" v-model.number="autoplaySpeed" label="Autoplay Speed (sec)" type="number" dense outlined min="1" max="30" class="q-mb-sm" />
    <q-toggle v-model="infinite" label="Infinite Loop" dense class="q-mb-sm" />
    <q-select v-model="transition" :options="transitionOptions" label="Transition" dense outlined emit-value map-options class="q-mb-sm" />
    <ColorPicker v-model="slideBackground" label="Slide Background Color" />
  </div>
</template>
<script setup>
import { toRef, watch } from "vue";
import { useBlockField } from "../useBlockField.js";
import ColorPicker from "../shared/ColorPicker.vue";

const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");

const slideCount = useBlockField(blockRef, "slideCount");
const height = useBlockField(blockRef, "height");
const navigation = useBlockField(blockRef, "navigation");
const arrows = useBlockField(blockRef, "arrows");
const swipeable = useBlockField(blockRef, "swipeable");
const autoplay = useBlockField(blockRef, "autoplay");
const autoplaySpeed = useBlockField(blockRef, "autoplaySpeed");
const infinite = useBlockField(blockRef, "infinite");
const transition = useBlockField(blockRef, "transition");
const slideBackground = useBlockField(blockRef, "slideBackground");

const transitionOptions = [
  { label: "Slide Right", value: "slide-right" },
  { label: "Slide Left", value: "slide-left" },
  { label: "Slide Up", value: "slide-up" },
  { label: "Slide Down", value: "slide-down" },
  { label: "Fade", value: "fade" },
  { label: "Scale", value: "scale" },
  { label: "None", value: "none" },
];

let _lastCount = props.block.content.slideCount || 2;
slideCount.value = _lastCount;

watch(slideCount, (newCount) => {
  if (!props.block.content.slides) props.block.content.slides = [];
  const current = props.block.content.slides.length;
  if (newCount > current) {
    for (let i = current; i < newCount; i++) {
      props.block.content.slides.push({ children: [] });
    }
  } else if (newCount < current) {
    props.block.content.slides.splice(newCount);
  }
  if (props.block.content._currentSlide >= newCount) {
    props.block.content._currentSlide = Math.max(0, newCount - 1);
  }
});
</script>
