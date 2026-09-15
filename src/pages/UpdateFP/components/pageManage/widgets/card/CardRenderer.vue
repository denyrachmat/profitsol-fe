<template>
  <div
    class="fp-card-widget cursor-pointer"
    :style="cardStyle"
    @click="handleClick"
  >
    <div v-if="block.content.image" class="fp-card-media" :style="mediaStyle">
      <img :src="block.content.image" :alt="block.content.title || ''" />
    </div>
    <div class="fp-card-body" :style="bodyStyle">
      <q-icon
        v-if="block.content.icon"
        :name="block.content.icon"
        size="40px"
        :style="{ color: block.content.textColor || '#ffffff', opacity: 0.85 }"
        class="q-mb-sm"
      />
      <div v-if="block.content.title" class="fp-card-title">
        {{ block.content.title }}
      </div>
      <div v-if="block.content.subtitle" class="fp-card-subtitle">
        {{ block.content.subtitle }}
      </div>
      <q-btn
        v-if="block.content.buttonLabel"
        :label="block.content.buttonLabel"
        flat
        no-caps
        dense
        class="q-mt-sm"
        :style="{ color: block.content.textColor || '#ffffff', padding: 0, minHeight: 0 }"
        @click.stop="handleClick"
      />
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
  selectedBlockId: String,
});

const router = useRouter();

const cardStyle = computed(() => ({
  background: props.block.content.background || "#0b3d2e",
  color: props.block.content.textColor || "#ffffff",
  borderRadius: props.block.content.borderRadius || "16px",
  overflow: "hidden",
}));

const mediaStyle = computed(() => ({
  height: props.block.content.imageHeight || "160px",
}));

const bodyStyle = computed(() => ({
  padding: props.block.content.padding || "20px 16px",
  textAlign: props.block.content.align || "left",
}));

const handleClick = () => {
  if (props.editMode) return;
  const url = props.block.content.buttonUrl;
  if (!url) return;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    window.open(url, "_blank");
  } else {
    router.push(url);
  }
};
</script>

<style scoped>
.fp-card-widget .fp-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.fp-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
}
.fp-card-subtitle {
  opacity: 0.85;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
