<template>
  <div :style="{ textAlign: block.content.align || 'left' }">
    <!-- Dropdown mode: renders when menu items exist -->
    <q-btn-dropdown
      v-if="hasMenu"
      :label="block.content.label || 'Menu'"
      :color="block.content.customColor || block.content.labelColor ? undefined : (block.content.color || 'primary')"
      :style="btnStyle"
      :class="btnClass"
      :flat="block.content.variant === 'flat'"
      :outline="block.content.variant === 'outline'"
      :unelevated="block.content.variant === 'unelevated'"
      :push="block.content.variant === 'push'"
      :size="block.content.size || 'md'"
      :icon="block.content.icon || undefined"
      no-caps
    >
      <q-list style="min-width: 200px">
        <q-item
          v-for="(item, i) in block.content.menuItems"
          :key="i"
          clickable
          @click="onMenuItemClick(item)"
        >
          <q-item-section v-if="item.icon" avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.label || "Menu item" }}</q-item-label>
            <q-item-label v-if="item.type === 'portalApp'" caption>
              Portal app
            </q-item-label>
            <q-item-label v-else-if="item.type === 'section'" caption>
              Section
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <!-- Tooltip mode: icon-only with tooltip -->
    <q-btn
      v-else-if="block.content.labelDisplay === 'tooltip'"
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
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/authStore";
import apiRequest from "src/components/apiRequest";
import viewApps from "src/pages/Dashboards/viewApps.vue";
import { scrollToSection } from "src/components/scrollToSection.js";

const props = defineProps({ block: { type: Object, required: true }, preview: Boolean, editMode: Boolean, selectedBlockId: String });

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const { postData } = apiRequest();

const hasMenu = computed(() => {
  const items = props.block.content.menuItems;
  return Array.isArray(items) && items.length > 0;
});

const viewerRoleId = computed(() =>
  String(authStore.getChoosedRole?.role?.id || "")
);

const viewerRoleIds = computed(() => {
  const store = authStore.getChoosedRole;
  const ids = [];
  if (store?.role?.id !== undefined && store?.role?.id !== null) {
    ids.push(String(store.role.id));
  }
  const groups = store?.rolesGroup?.roles || store?.roles || [];
  (Array.isArray(groups) ? groups : []).forEach((r) => {
    const id = r?.role?.id ?? r?.id ?? r;
    if (id !== undefined && id !== null && id !== "") ids.push(String(id));
  });
  return [...new Set(ids)];
});

const roleCheckCache = new Map();

const viewerCanOpenPortalApp = async (item) => {
  if (!item?.appCode) return true;
  const viewerIds = viewerRoleIds.value;
  if (viewerIds.length === 0) return false;

  let ownerIds = roleCheckCache.get(item.appCode);
  if (ownerIds === undefined) {
    try {
      const res = await postData(
        "get",
        null,
        `portal/apps/${item.appCode}/roles`,
        false,
        false,
        true
      );
      ownerIds = (res?.data || []).map(String);
    } catch (e) {
      return false;
    }
    roleCheckCache.set(item.appCode, ownerIds);
  }

  if (ownerIds.length === 0) return true;
  return viewerIds.some((id) => ownerIds.includes(id));
};

const openExternal = (url) => {
  window.open(url, "_blank", "noopener");
};

const openInternal = (url) => {
  if (url.startsWith("/")) router.push(url);
  else router.push(url);
};

const openUrl = (url) => {
  if (!url) return;
  if (url.startsWith("#")) {
    scrollToSection(url);
    return;
  }
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:")
  ) {
    openExternal(url);
  } else {
    openInternal(url);
  }
};

const openPortalApp = async (item) => {
  // Author-time selection is only a convenience; the real gate is the current
  // role->app assignment fetched right now, so later changes take effect.
  if (!(await viewerCanOpenPortalApp(item))) {
    $q.notify({
      color: "negative",
      message: "You do not have access to this menu.",
    });
    return;
  }

  const url = item.url || item.appUrl;
  if (url) {
    openUrl(url);
    return;
  }

  // Fallback: resolve the URL from the viewer's own role map.
  try {
    const data = await postData(
      "get",
      null,
      `portal/roles/${viewerRoleId.value}`,
      false,
      false,
      true
    );
    const maps = data?.data?.role_app_map || [];
    const match = maps.find(
      (m) =>
        m.am_app_id === item.appCode ||
        m.apps?.am_app_code === item.appCode
    );
    const app = match?.apps;
    if (app?.am_app_url) {
      $q.dialog({
        component: viewApps,
        componentProps: {
          dataProps: app.am_app_url,
          title: app.am_app_name || item.label,
          isRouter: app.am_local_form == 1,
        },
      });
    } else {
      $q.notify({ color: "negative", message: "Portal app not found." });
    }
  } catch (e) {
    $q.notify({ color: "negative", message: "Failed to open portal app." });
  }
};

const onMenuItemClick = (item) => {
  if (props.editMode) return;
  if (item.type === "portalApp") {
    openPortalApp(item);
  } else if (item.type === "section") {
    scrollToSection(item.sectionId || item.url);
  } else {
    openUrl(item.url);
  }
};

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
  // External links are handled by the :href attribute; everything else
  // (internal routes, "#section" anchors) goes through openUrl.
  if (isExternal.value) return;
  openUrl(props.block.content.url);
};

const resolveColor = (val) => {
  if (!val) return undefined;
  if (val.startsWith("#") || val.startsWith("rgb")) return val;
  return QUASAR_COLOR_MAP[val] || val;
};

const iconSize = computed(() => {  const c = props.block.content;
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

// Parses "prop: value; ..." into a style object. Custom CSS wins (applied last).
const parseCustomCss = (css) => {
  const s = {};
  if (!css || typeof css !== "string") return s;
  css.split(";").forEach((decl) => {
    const idx = decl.indexOf(":");
    if (idx === -1) return;
    const prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) return;
    // kebab-case -> camelCase for Vue style binding
    const key = prop.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
    s[key] = val;
  });
  return s;
};

const extraStyle = (c) => {
  const s = {};
  if (c.padding) s.padding = c.padding;
  if (c.borderRadius) s.borderRadius = c.borderRadius;
  return { ...s, ...parseCustomCss(c.customCss) };
};

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
  return { ...s, ...extraStyle(c) };
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
  return { ...s, ...extraStyle(c) };
});
</script>
