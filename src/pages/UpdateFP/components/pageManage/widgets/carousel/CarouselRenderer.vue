<template>
  <div>
    <!-- Edit mode: simple slide navigator without carousel internals -->
    <div v-if="editMode" class="carousel-edit-mode">
      <div class="row items-center q-mb-sm q-gutter-sm">
        <q-btn
          v-for="(slide, si) in slides"
          :key="si"
          :flat="currentSlide !== si"
          :color="currentSlide === si ? 'primary' : 'grey'"
          :outline="currentSlide === si"
          dense
          no-caps
          :label="`Slide ${si + 1}`"
          size="sm"
          @click.stop="currentSlide = si"
        />
        <q-btn flat dense round icon="add" size="sm" color="primary" @click.stop="addSlide">
          <q-tooltip>Add Slide</q-tooltip>
        </q-btn>
      </div>
      <div
        class="carousel-edit-slide rounded-borders"
        :style="{ minHeight: block.content.height || '300px', ...slideStyle }"
      >
        <!-- Rendered blocks (no draggable wrapping) -->
        <div
          v-for="childBlock in currentSlideChildren"
          :key="childBlock.id"
          class="nested-block-wrapper"
          :class="{
            'nested-block-selected': selectedBlockId === childBlock.id,
          }"
          @click.stop="$emit('select-block', childBlock)"
        >
          <div
            class="nested-block-toolbar row items-center no-wrap q-gutter-xs"
          >
            <q-icon
              :name="getBlockMeta(childBlock.type).icon"
              size="xs"
              :color="getBlockMeta(childBlock.type).color"
            />
            <span class="text-caption">{{
              getBlockMeta(childBlock.type).label
            }}</span>
            <q-space />
            <q-btn
              flat
              dense
              round
              icon="delete_outline"
              size="xs"
              color="red"
              @click.stop="
                $emit('delete-child', {
                  slideIndex: currentSlide,
                  blockId: childBlock.id,
                })
              "
            />
          </div>
          <div class="carousel-block-content" @click.stop="$emit('select-block', childBlock)">
            <blockRenderer
              :block="childBlock"
              :preview="true"
              :edit-mode="false"
              :selected-block-id="selectedBlockId"
            />
          </div>
        </div>

        <!-- Empty hint -->
        <div
          v-if="!currentSlideChildren.length"
          class="carousel-empty-hint text-center text-grey-5 text-caption q-pa-md"
        >
          <q-icon name="add" size="18px" />
          <div>Drop widgets here</div>
        </div>

        <!-- Drop zone: receives new widgets from outside -->
        <draggable
          tag="div"
          :list="dropZoneList"
          group="widgets"
          item-key="id"
          ghost-class="ghost-block"
          animation="200"
          class="carousel-drop-target"
          @add="onDrop"
        >
          <template #item><div /></template>
        </draggable>
      </div>
    </div>

    <!-- Preview mode: real carousel -->
    <q-carousel
      v-else
      v-model="currentSlide"
      :transition-prev="block.content.transition || 'slide-right'"
      :transition-next="block.content.transition || 'slide-left'"
      :swipeable="block.content.swipeable !== false"
      animated
      :navigation="block.content.navigation !== false"
      :arrows="block.content.arrows !== false"
      :autoplay="block.content.autoplay ? block.content.autoplaySpeed * 1000 : false"
      :infinite="block.content.infinite !== false"
      :height="block.content.height || '300px'"
      :control-color="block.content.controlColor || 'primary'"
      :padding="block.content.padding !== false"
      class="rounded-borders"
      :class="block.content.class || ''"
    >
      <q-carousel-slide
        v-for="(slide, si) in slides"
        :key="si"
        :name="si"
        :style="slideStyle"
      >
        <div v-for="childBlock in slide.children" :key="childBlock.id">
          <blockRenderer
            :block="childBlock"
            :preview="true"
            :edit-mode="false"
            :selected-block-id="selectedBlockId"
          />
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import draggable from "vuedraggable";
import blockRenderer from "../../blockRenderer.vue";
import widgetRegistry from "../widgetRegistry.js";

const getBlockMeta = (type) =>
  widgetRegistry[type]?.meta || { label: type, icon: "help", color: "grey" };

const props = defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
  selectedBlockId: String,
});

const emit = defineEmits(["select-block", "update:children", "delete-child"]);

const currentSlide = computed({
  get: () => props.block.content._currentSlide || 0,
  set: (val) => {
    props.block.content._currentSlide = val;
  },
});

const slides = computed(() => props.block.content.slides || []);

const currentSlideChildren = computed(() => slides.value[currentSlide.value]?.children || []);

const dropZoneList = ref([]);

const slideStyle = computed(() => {
  const bg = props.block.content.slideBackground;
  if (!bg) return {};
  return { backgroundColor: bg };
});

const onDrop = () => {
  const dropped = [...dropZoneList.value];
  dropZoneList.value = [];
  if (!dropped.length) return;

  const slide = props.block.content.slides[currentSlide.value];
  if (!slide) return;
  if (!slide.children) slide.children = [];

  for (const item of dropped) {
    slide.children.push(item);
  }
  emit("update:children", {
    slideIndex: currentSlide.value,
    children: [...slide.children],
    blockId: props.block.id,
  });
};

const onSlideUpdate = (slideIndex, newChildren) => {
  emit("update:children", {
    slideIndex,
    children: newChildren,
    blockId: props.block.id,
  });
};

const addSlide = () => {
  props.block.content.slides.push({ children: [] });
  props.block.content.slideCount = props.block.content.slides.length;
  currentSlide.value = props.block.content.slides.length - 1;
};
</script>

<style scoped>
.carousel-edit-mode {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.01);
}
.carousel-edit-slide {
  border: 1px dashed #bbb;
  background: rgba(255, 255, 255, 0.5);
  position: relative;
}
.carousel-drop-target {
  min-height: 40px;
  border: 2px dashed transparent;
  border-radius: 4px;
  transition: border-color 0.2s, background 0.2s;
}
.carousel-drop-target:hover {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.04);
}
.carousel-empty-hint {
  border: 1px dashed #bbb;
  border-radius: 6px;
  margin: 8px;
}
.carousel-block-content {
  pointer-events: none;
}
.nested-block-wrapper {
  position: relative;
  cursor: pointer;
  margin-bottom: 4px;
}
.nested-block-wrapper:hover {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}
.nested-block-wrapper.nested-block-selected {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}
.nested-block-toolbar {
  position: relative;
  z-index: 3;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 2px 6px;
  margin-bottom: 2px;
}
</style>
