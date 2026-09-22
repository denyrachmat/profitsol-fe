<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black" style="width: 100%; max-width: 1400px">
      <q-card-section class="row items-center q-pa-md">
        <div>
          <div class="text-h6">
            {{ persist ? "Frontpage Header Setup" : "Page Header Setup" }}
          </div>
          <div class="text-subtitle2">
            {{
              persist
                ? "Customize the per-domain header (left / center / right)"
                : "Custom header for this page only"
            }}
          </div>
        </div>
        <q-space />
        <q-btn flat label="Cancel" color="secondary" @click="onDialogCancel" />
        <q-btn
          v-if="persist"
          flat
          label="Reset to default"
          color="negative"
          icon="restart_alt"
          class="q-ml-sm"
          @click="onReset"
        />
        <q-btn
          color="primary"
          label="Save Header"
          icon="save"
          class="q-ml-sm"
          :loading="saving"
          @click="onSave"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md scroll" style="max-height: 72vh">
        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="2em" />
          <div class="text-caption q-mt-sm">Loading header configuration…</div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <!-- Main column -->
          <div :class="showPropsPanel ? 'col-12 col-md-8' : 'col-12'">
            <!-- Variant switch -->
            <div class="row items-center q-col-gutter-sm q-mb-md">
              <div class="col-auto">
                <q-btn-toggle
                  v-model="editingScrolled"
                  toggle-color="primary"
                  dense
                  no-caps
                  :options="[
                    { label: 'Normal', value: false },
                    { label: 'On scroll', value: true },
                  ]"
                />
              </div>
              <div class="col-auto" v-if="editingScrolled">
                <q-toggle
                  v-model="config.scrolled.enabled"
                  label="Enable on-scroll variant"
                  color="primary"
                  dense
                />
              </div>
              <div class="col-auto" v-if="editingScrolled">
                <q-input
                  v-model.number="config.scrolled.threshold"
                  type="number"
                  label="Scroll threshold (px)"
                  dense
                  outlined
                  style="width: 190px"
                />
              </div>
            </div>

            <!-- Bar settings -->
            <div class="row q-col-gutter-md q-mb-md">
              <div
                v-if="persist && !editingScrolled"
                class="col-12 col-sm-6 col-md-3"
              >
                <q-toggle
                  v-model="config.enabled"
                  label="Use custom header"
                  color="primary"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-toggle
                  v-model="activeConfig.sticky"
                  label="Sticky"
                  color="primary"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-toggle
                  v-model="activeConfig.elevated"
                  label="Shadow"
                  color="primary"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="activeConfig.height"
                  label="Height (e.g. 64px, 4rem, 10vh, auto)"
                  dense
                  outlined
                  debounce="300"
                  @blur="activeConfig.height = cssSize(activeConfig.height)"
                />
              </div>
              <div class="col-12 col-sm-6">
                <ColorPicker v-model="activeConfig.background" label="Background" />
              </div>
              <div class="col-12 col-sm-6">
                <ColorPicker v-model="activeConfig.textColor" label="Text Color" />
              </div>
              <div class="col-12">
                <q-input
                  v-model="activeConfig.maxWidth"
                  label="Max width (empty = full)"
                  dense
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="activeConfig.padding"
                  label="Content padding (e.g. 0 12px)"
                  dense
                  outlined
                  placeholder="0 12px"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="activeConfig.transition"
                  :options="transitionOptions"
                  label="Transition"
                  dense
                  outlined
                  emit-value
                  map-options
                />
              </div>
            </div>

            <!-- Default (built-in) buttons -->
            <div class="text-caption text-grey-7 q-mt-sm q-mb-xs">
              Default buttons
            </div>
            <div class="row q-col-gutter-sm q-mb-md items-center">
              <div class="col-auto">
                <q-toggle
                  v-model="activeConfig.defaultButtons.menu"
                  label="Menu"
                  color="primary"
                  dense
                />
              </div>
              <div class="col-auto">
                <q-toggle
                  v-model="activeConfig.defaultButtons.account"
                  label="Account"
                  color="primary"
                  dense
                />
              </div>
              <div class="col-auto">
                <q-toggle
                  v-model="activeConfig.defaultButtons.notifications"
                  label="Notifications"
                  color="primary"
                  dense
                />
              </div>
              <div class="col-auto">
                <q-toggle
                  v-model="activeConfig.defaultButtons.help"
                  label="Help"
                  color="primary"
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <ColorPicker
                  v-model="activeConfig.defaultButtonsColor"
                  label="Default buttons color (empty = white)"
                />
              </div>
            </div>

            <!-- Preview -->
            <div class="text-caption text-grey-7 q-mb-xs">Preview</div>
            <div class="header-builder__preview rounded-borders q-mb-md">
              <div
                class="header-builder__bar row items-center no-wrap"
                :style="barStyle"
              >
                <div
                  v-if="activeConfig.slots.background.length"
                  class="header-builder__bg-layer"
                >
                  <HeaderSlot :blocks="activeConfig.slots.background" justify="center" />
                </div>
                <HeaderSlot
                  :blocks="activeConfig.slots.left"
                  justify="start"
                  class="col header-builder__fg"
                />
                <HeaderSlot
                  :blocks="activeConfig.slots.center"
                  justify="center"
                  class="col-auto header-builder__fg"
                />
                <HeaderSlot
                  :blocks="activeConfig.slots.right"
                  justify="end"
                  class="col header-builder__fg"
                />
              </div>
            </div>

            <!-- Slot editors -->
            <div v-for="slot in HEADER_EDITOR_SLOTS" :key="slot" class="q-mb-md">
              <div class="row items-center q-mb-sm">
                <div class="text-subtitle2">{{ slotLabel(slot) }}</div>
                <q-space />
                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  icon="add"
                  :label="`Add ${slotLabel(slot).toLowerCase()} widget`"
                >
                  <q-menu @before-show="widgetSearch = ''">
                    <div class="q-pa-sm" style="min-width: 240px">
                      <q-input
                        v-model="widgetSearch"
                        dense
                        outlined
                        clearable
                        autofocus
                        debounce="0"
                        placeholder="Search widget…"
                      >
                        <template v-slot:prepend>
                          <q-icon name="search" />
                        </template>
                      </q-input>
                    </div>
                    <q-separator />
                    <q-list dense style="min-width: 240px; max-height: 320px" class="scroll">
                      <q-item
                        v-for="w in filteredCatalog"
                        :key="w.type"
                        clickable
                        v-close-popup
                        @click="addWidget(slot, w.type)"
                      >
                        <q-item-section avatar>
                          <q-icon :name="w.icon" :color="w.color" />
                        </q-item-section>
                        <q-item-section>{{ w.label }}</q-item-section>
                      </q-item>
                      <q-item v-if="filteredCatalog.length === 0">
                        <q-item-section class="text-grey-6 text-caption"
                          >No widget found</q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <q-list bordered separator v-if="activeConfig.slots[slot].length">
                <q-item v-for="(block, idx) in activeConfig.slots[slot]" :key="block.id">
                  <q-item-section avatar>
                    <q-icon
                      :name="meta(block.type).icon"
                      :color="meta(block.type).color"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ meta(block.type).label }}</q-item-label>
                    <q-item-label caption>{{ describe(block) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row no-wrap q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        icon="arrow_upward"
                        size="sm"
                        :disable="idx === 0"
                        @click="move(slot, idx, -1)"
                      >
                        <q-tooltip>Move up</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        icon="arrow_downward"
                        size="sm"
                        :disable="idx === activeConfig.slots[slot].length - 1"
                        @click="move(slot, idx, 1)"
                      >
                        <q-tooltip>Move down</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        icon="settings"
                        size="sm"
                        color="primary"
                        @click="openProps(block)"
                      >
                        <q-tooltip>Edit properties</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        icon="content_copy"
                        size="sm"
                        @click="duplicate(slot, idx)"
                      >
                        <q-tooltip>Duplicate</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        size="sm"
                        color="negative"
                        @click="remove(slot, idx)"
                      >
                        <q-tooltip>Remove</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-caption text-grey-5 q-ml-sm">
                Empty — add a widget to get started.
              </div>
            </div>
          </div>

          <!-- Properties column -->
          <div class="col-12 col-md-4" v-if="showPropsPanel">
            <q-card flat bordered class="sticky-props">
              <q-card-section class="row items-center bg-grey-1">
                <q-icon
                  :name="meta(selected.type).icon"
                  :color="meta(selected.type).color"
                  class="q-mr-sm"
                />
                <span class="text-subtitle2 text-weight-bold"
                  >{{ meta(selected.type).label }} Properties</span
                >
                <q-space />
                <q-btn
                  flat
                  dense
                  round
                  icon="close"
                  size="sm"
                  @click="closeProps"
                />
              </q-card-section>
              <q-separator />
              <q-card-section>
                <component
                  :is="propsComponent"
                  v-if="propsComponent"
                  :block="selected"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { computed, onMounted, ref } from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import widgetRegistry from "../../pageManage/widgets/widgetRegistry.js";
import ColorPicker from "../../pageManage/widgets/shared/ColorPicker.vue";
import HeaderSlot from "./HeaderSlot.vue";
import {
  HEADER_EDITOR_SLOTS,
  HEADER_WIDGETS,
  defaultHeaderConfig,
  normalizeHeaderConfig,
  cssSize,
} from "./useHeaderConf.js";

const { postData } = apiRequest();
const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  // Optional starting config. When provided, no domain config is loaded.
  initialConfig: { type: Object, default: null },
  // When false, saving only returns the config (no domain API call).
  persist: { type: Boolean, default: true },
});

const config = ref(defaultHeaderConfig());
const loading = ref(false);
const saving = ref(false);

// Which variant the settings/slots editors are editing.
const editingScrolled = ref(false);
const activeConfig = computed(() =>
  editingScrolled.value ? config.value.scrolled.config : config.value
);

let idCounter = 0;
const nextId = () => `header-${Date.now()}-${++idCounter}`;

const propsOpen = ref(false);
const selected = ref(null);
const widgetSearch = ref("");

const showPropsPanel = computed(() => propsOpen.value && !!selected.value);

const catalog = computed(() =>
  HEADER_WIDGETS.filter((t) => widgetRegistry[t])
    .map((type) => ({ type, ...widgetRegistry[type].meta }))
    .sort((a, b) => (a.label || a.type).localeCompare(b.label || b.type))
);

const filteredCatalog = computed(() => {
  const query = widgetSearch.value.trim().toLowerCase();
  if (!query) return catalog.value;
  return catalog.value.filter((w) =>
    (w.label || w.type).toLowerCase().includes(query)
  );
});

const meta = (type) =>
  widgetRegistry[type]?.meta || { label: type, icon: "help", color: "grey" };

const propsComponent = computed(() =>
  selected.value
    ? widgetRegistry[selected.value.type]?.PropertiesComponent || null
    : null
);

const barStyle = computed(() => ({
  minHeight: cssSize(activeConfig.value.height) || "64px",
  background: activeConfig.value.background || "#ffffff",
  color: activeConfig.value.textColor || "#000000",
  padding: activeConfig.value.padding || "0 12px",
  transition: activeConfig.value.transition
    ? `background-color ${activeConfig.value.transition}, color ${activeConfig.value.transition}, min-height ${activeConfig.value.transition}`
    : "none",
}));

const transitionOptions = [
  { label: "None", value: "" },
  { label: "Fast (0.15s)", value: "0.15s ease" },
  { label: "Normal (0.25s)", value: "0.25s ease" },
  { label: "Slow (0.4s)", value: "0.4s ease" },
];

const slotLabel = (slot) =>
  slot === "background"
    ? "Background layer"
    : `${slot.charAt(0).toUpperCase()}${slot.slice(1)} slot`;

const describe = (block) => {
  const c = block.content || {};
  switch (block.type) {
    case "html":
    case "text":
      return (
        (c.body || "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 60) || "—"
      );
    case "button":
      return `${c.label || "Button"} → ${c.url || "#"}`;
    case "image":
      return c.src ? c.alt || c.src.slice(0, 50) : "no image";
    case "spacer":
      return `${c.height ?? 40}px`;
    case "divider":
      return c.style || "solid";
    default:
      return "";
  }
};

const addWidget = (slot, type) => {
  const block = {
    id: nextId(),
    type,
    width: 12,
    content: JSON.parse(
      JSON.stringify(widgetRegistry[type]?.defaultContent?.() || {})
    ),
  };
  activeConfig.value.slots[slot].push(block);
  selected.value = block;
  propsOpen.value = true;
};

const move = (slot, idx, delta) => {
  const list = activeConfig.value.slots[slot];
  const to = idx + delta;
  if (to < 0 || to >= list.length) return;
  [list[idx], list[to]] = [list[to], list[idx]];
};

const remove = (slot, idx) => {
  const gone = activeConfig.value.slots[slot].splice(idx, 1)[0];
  if (selected.value?.id === gone?.id) {
    closeProps();
  }
};

const duplicate = (slot, idx) => {
  const copy = JSON.parse(JSON.stringify(activeConfig.value.slots[slot][idx]));
  copy.id = nextId();
  activeConfig.value.slots[slot].splice(idx + 1, 0, copy);
};

const openProps = (block) => {
  selected.value = block;
  propsOpen.value = true;
};

const closeProps = () => {
  selected.value = null;
  propsOpen.value = false;
};

const loadConfig = async () => {
  loading.value = true;
  try {
    const res = await postData("get", null, "fpmanager/getHeaderConf");
    config.value = normalizeHeaderConfig(res?.data ?? null);
  } catch (e) {
    config.value = defaultHeaderConfig();
  } finally {
    loading.value = false;
  }
};

const onReset = () => {
  $q.dialog({
    title: "Reset header",
    message: props.persist
      ? "Remove the custom header and revert to the default one? This applies to all pages of this domain."
      : "Clear this page's custom header?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    config.value = { ...defaultHeaderConfig(), enabled: false };
    selected.value = null;
    propsOpen.value = false;
    onSave();
  });
};

const onSave = async () => {
  if (!props.persist) {
    onDialogOK(normalizeHeaderConfig(config.value));
    return;
  }

  saving.value = true;
  try {
    const res = await postData(
      "post",
      { config: config.value },
      "fpmanager/saveHeaderConf"
    );
    if (res && res.status !== false) {
      $q.notify({ type: "positive", message: "Header saved" });
      onDialogOK(normalizeHeaderConfig(res?.data ?? config.value));
    } else {
      $q.notify({ type: "negative", message: "Failed to save header" });
    }
  } catch (e) {
    $q.notify({ type: "negative", message: "Failed to save header" });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (props.initialConfig) {
    config.value = normalizeHeaderConfig(props.initialConfig);
  } else if (props.persist) {
    loadConfig();
    return;
  }
  // Page-scoped headers are always enabled (the page mode decides inherit/custom).
  if (!props.persist) {
    config.value.enabled = true;
  }
});
</script>
<style scoped>
.header-builder__preview {
  border: 1px dashed #bdbdbd;
  overflow: hidden;
}
.header-builder__bar {
  gap: 8px;
  position: relative;
}
.header-builder__bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
}
.header-builder__bg-layer :deep(.header-slot) {
  width: 100%;
  height: 100%;
  margin: 0 !important;
}
.header-builder__bg-layer :deep(.header-slot__item) {
  width: 100%;
  height: 100%;
  margin: 0 !important;
}
.header-builder__fg {
  position: relative;
  z-index: 1;
}
.sticky-props {
  position: sticky;
  top: 0;
}
</style>
