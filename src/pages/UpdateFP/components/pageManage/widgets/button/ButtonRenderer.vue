<template>
  <div :style="{ textAlign: block.content.align || 'left' }">
    <!-- Tooltip mode: icon-only with tooltip -->
    <q-btn
      v-if="block.content.labelDisplay === 'tooltip'"
      :color="block.content.customColor ? undefined : (block.content.color || 'primary')"
      :style="tooltipBtnStyle"
      :class="btnClass"
      :flat="block.content.variant === 'flat'"
      :outline="block.content.variant === 'outline'"
      :unelevated="block.content.variant === 'unelevated'"
      :push="block.content.variant === 'push'"
      :size="block.content.size || 'md'"
      :round="block.content.shape === 'round'"
      :square="block.content.shape === 'square'"
      :href="!editMode && isExternal ? (block.content.url || '#') : undefined"
      @click="handleClick"
      no-caps
    >
      <q-icon :name="block.content.icon || 'info'" :size="iconSize" />
      <q-tooltip>{{ block.content.label || 'Button' }}</q-tooltip>
    </q-btn>

    <!-- Label mode with top/bottom icon -->
    <q-btn
      v-else-if="block.content.icon && (block.content.iconPosition === 'top' || block.content.iconPosition === 'bottom')"
      :color="block.content.customColor ? undefined : (block.content.color || 'primary')"
      :style="btnStyle"
      :class="btnClass"
      :flat="block.content.variant === 'flat'"
      :outline="block.content.variant === 'outline'"
      :unelevated="block.content.variant === 'unelevated'"
      :push="block.content.variant === 'push'"
      :size="block.content.size || 'md'"
      :round="block.content.shape === 'round'"
      :square="block.content.shape === 'square'"
      :href="!editMode && isExternal ? (block.content.url || '#') : undefined"
      @click="handleClick"
      no-caps
    >
      <div :class="block.content.iconPosition === 'bottom' ? 'column reverse items-center' : 'column items-center'">
        <q-icon :name="block.content.icon" :size="iconSize" :style="labelColorStyle" />
        <span :style="labelColorStyle">{{ block.content.label || 'Button' }}</span>
      </div>
    </q-btn>

    <!-- Label mode: standard q-btn -->
    <q-btn
      v-else
      :label="block.content.label || 'Button'"
      :color="block.content.customColor || block.content.labelColor ? undefined : (block.content.color || 'primary')"
      :style="btnStyle"
      :class="btnClass"
      :flat="block.content.variant === 'flat'"
      :outline="block.content.variant === 'outline'"
      :unelevated="block.content.variant === 'unelevated'"
      :push="block.content.variant === 'push'"
      :size="block.content.size || 'md'"
      :round="block.content.shape === 'round'"
      :square="block.content.shape === 'square'"
      :href="!editMode && isExternal ? (block.content.url || '#') : undefined"
      @click="handleClick"
      :icon="block.content.icon && block.content.iconPosition === 'left' ? block.content.icon : undefined"
      :icon-right="block.content.icon && block.content.iconPosition === 'right' ? block.content.icon : undefined"
      no-caps
    />
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });

const router = useRouter();

const SIZE_MAP = { sm: "14px", md: "18px", lg: "22px", xl: "28px" };

const QUASAR_COLOR_MAP = {
  primary: "#1976d2",
  secondary: "#26a69a",
  accent: "#9c27b0",
  positive: "#21ba45",
  negative: "#c10015",
  warning: "#f2c037",
  info: "#31ccec",
  dark: "#1d1d1d",
  grey: "#9e9e9e",
  white: "#ffffff",
  black: "#000000",
  "grey-7": "#616161",
};

const isExternal = computed(() => {
  const url = props.block.content.url || "";
  if (!url || url === "#") return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:");
});

const handleClick = () => {
  if (props.editMode) return;
  const url = props.block.content.url;
  if (!url || url === "#") return;
  if (isExternal.value) return;
  router.push(url);
};

const resolveColor = (val) => {
  if (!val) return undefined;
  if (val.startsWith("#") || val.startsWith("rgb")) return val;
  return QUASAR_COLOR_MAP[val] || val;
};

const iconSize = computed(() => {
  const c = props.block.content;
  if (c.customHeight) {
    const px = Math.max(14, Math.round(c.customHeight * 0.45));
    return px + "px";
  }
  return SIZE_MAP[c.size] || "18px";
});

const resolvedLabelColor = computed(() => {
  const c = props.block.content;
  if (c.customLabelColor) return c.customLabelColor;
  if (c.labelColor) return resolveColor(c.labelColor);
  return undefined;
});

const btnStyle = computed(() => {
  const c = props.block.content;
  const s = {};
  if (c.btnWidth === "cover") s.width = "100%";
  if (c.customWidth) s.width = c.customWidth + "px";
  if (c.customHeight) s.height = c.customHeight + "px";
  if (c.customColor) {
    s.backgroundColor = c.customColor;
  }
  if (c.variant === "outline") {
    const borderColor = c.customColor || resolveColor(c.color) || "#1976d2";
    s.border = "1px solid " + borderColor;
    s.backgroundColor = "transparent";
  }
  if (resolvedLabelColor.value) {
    s.color = resolvedLabelColor.value;
  }
  return s;
});

const labelColorStyle = computed(() => {
  if (!resolvedLabelColor.value) return undefined;
  return { color: resolvedLabelColor.value };
});

const btnClass = computed(() => {
  return props.block.content.btnWidth === "cover" ? "full-width" : undefined;
});

const tooltipBtnStyle = computed(() => {
  const c = props.block.content;
  const s = {};
  if (c.customWidth) s.width = c.customWidth + "px";
  if (c.customHeight) s.height = c.customHeight + "px";
  if (c.customColor) {
    s.backgroundColor = c.customColor;
  }
  if (c.variant === "outline") {
    const borderColor = c.customColor || resolveColor(c.color) || "#1976d2";
    s.border = "1px solid " + borderColor;
    s.backgroundColor = "transparent";
  }
  if (resolvedLabelColor.value) {
    s.color = resolvedLabelColor.value;
  }
  return s;
});
</script>
