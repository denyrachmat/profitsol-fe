<template>
  <div :class="block.content.customClass || ''">
    <div v-if="block.content.url" :style="wrapperStyle">
      <iframe :src="getEmbedUrl(block.content.url)" :style="iframeStyle" allowfullscreen></iframe>
    </div>
    <div v-else class="bg-grey-2 rounded q-pa-lg text-center text-grey-5" :style="wrapperStyle">
      <q-icon name="picture_in_picture" size="48px" />
      <div class="text-caption q-mt-sm">No embed URL set</div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });

const parseCustomCss = (css) => {
  if (!css || typeof css !== "string") return {};
  const out = {};
  css.split(";").forEach((decl) => {
    const [prop, ...rest] = decl.split(":");
    if (!prop || rest.length === 0) return;
    const k = prop.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const v = rest.join(":").trim();
    if (k && v) out[k] = v;
  });
  return out;
};

const wrapperStyle = computed(() => {
  const c = props.block.content || {};
  const style = { position: "relative", width: "100%", overflow: "hidden", borderRadius: c.borderRadius || "8px" };
  const ratio = c.ratio || "16:9";
  if (c.height) {
    style.height = c.height;
    style.paddingBottom = undefined;
  } else if (ratio === "custom") {
    style.height = c.height || "400px";
  } else if (ratio && ratio.includes(":")) {
    const [w, h] = ratio.split(":").map(Number);
    if (w && h) style.paddingBottom = `${(h / w) * 100}%`;
  }
  // customCss covers the embed div (wrapper)
  Object.assign(style, parseCustomCss(c.customCss));
  return style;
});

const iframeStyle = computed(() => {
  const c = props.block.content || {};
  const s = { border: "none", borderRadius: c.borderRadius || "8px" };
  const hasHeight = !!c.height || c.ratio === "custom";
  if (hasHeight || c.customCss) {
    // cover mode: absolute fill wrapper
    s.position = "absolute";
    s.top = "0";
    s.left = "0";
    s.width = "100%";
    s.height = "100%";
    if (c.objectFit) s.objectFit = c.objectFit;
    // allow customCss to override iframe via same field (objectFit covers)
    const extra = parseCustomCss(c.customCss);
    // only apply relevant iframe props from customCss (objectFit already handled)
    if (extra.objectFit) s.objectFit = extra.objectFit;
  } else {
    s.position = "absolute";
    s.top = "0";
    s.left = "0";
    s.width = "100%";
    s.height = "100%";
    if (c.objectFit) s.objectFit = c.objectFit;
  }
  return s;
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
