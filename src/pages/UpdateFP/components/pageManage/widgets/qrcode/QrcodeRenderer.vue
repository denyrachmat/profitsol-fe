<template>
  <div class="text-center">
    <div v-if="block.content.text" class="qrcode-container inline-block q-pa-md bg-white rounded">
      <img :src="qrCodeUrl" :alt="block.content.text" :style="{ width: (block.content.size || 200) + 'px', height: (block.content.size || 200) + 'px' }" />
    </div>
    <div v-else class="bg-grey-2 rounded q-pa-lg text-center text-grey-5">
      <q-icon name="qr_code" size="48px" />
      <div class="text-caption q-mt-sm">Enter text or URL to generate QR code</div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });
const qrCodeUrl = computed(() => {
  const text = props.block.content?.text || "";
  const size = props.block.content?.size || 200;
  const fg = (props.block.content?.foreground || "#000000").replace("#", "");
  const bg = (props.block.content?.background || "#ffffff").replace("#", "");
  if (!text) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${fg}&bgcolor=${bg}`;
});
</script>
<style scoped>
.qrcode-container { border: 1px solid #e0e0e0; }
.qrcode-container img { display: block; }
</style>
