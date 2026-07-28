<template>
  <div>
    <div v-if="block.content.url" :style="embedRatioStyle">
      <iframe :src="getEmbedUrl(block.content.url)" :style="{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }" allowfullscreen></iframe>
    </div>
    <div v-else class="bg-grey-2 rounded q-pa-lg text-center text-grey-5">
      <q-icon name="picture_in_picture" size="48px" />
      <div class="text-caption q-mt-sm">No embed URL set</div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
const embedRatioStyle = computed(() => {
  const ratio = props.block.content?.ratio || "16:9";
  const [w, h] = ratio.split(":").map(Number);
  return { position: "relative", width: "100%", paddingBottom: `${(h / w) * 100}%` };
});
const getEmbedUrl = (url) => {
  if (!url) return "";
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.match(/(?:v=|youtu\.be\/)([^&?]+)/);
    if (videoId) return `https://www.youtube.com/embed/${videoId[1]}`;
  }
  if (url.includes("vimeo.com")) {
    const vimeoId = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoId) return `https://player.vimeo.com/video/${vimeoId[1]}`;
  }
  return url;
};
</script>
