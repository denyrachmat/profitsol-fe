<template>
  <div>
    <q-input v-model="label" label="Button Label" dense outlined class="q-mb-sm" />
    <q-select v-model="labelDisplay" :options="labelDisplayOptions" label="Label Display" dense outlined emit-value map-options class="q-mb-sm" />
    <q-select v-model="shape" :options="buttonShapeOptions" label="Shape" dense outlined emit-value map-options class="q-mb-sm" />
    <q-input v-model="url" label="Link URL" dense outlined class="q-mb-sm" />

    <!-- Dropdown menu items -->
    <q-expansion-item
      icon="menu"
      label="Dropdown Menu (optional)"
      caption="When items exist, the button becomes a dropdown."
      dense
      header-class="text-primary"
      class="q-mb-sm"
    >
      <div class="q-pt-sm">
        <div
          v-for="(item, idx) in safeMenuItems"
          :key="idx"
          class="q-pa-sm q-mb-sm"
          style="border: 1px solid #e0e0e0; border-radius: 8px"
        >
          <div class="row items-center">
            <div class="col text-caption text-grey-7">Item {{ idx + 1 }}</div>
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="removeMenuItem(idx)"
            />
          </div>
          <q-select
            v-model="item.type"
            :options="menuTypeOptions"
            label="Type"
            dense
            outlined
            emit-value
            map-options
            class="q-mb-xs"
          />
          <q-input
            v-model="item.label"
            label="Label"
            dense
            outlined
            class="q-mb-xs"
          />
          <q-input
            v-model="item.icon"
            label="Icon (optional)"
            dense
            outlined
            class="q-mb-xs"
          />
          <q-select
            v-if="item.type === 'portalApp'"
            :model-value="item.appCode"
            :options="portalAppOptions"
            label="Portal Menu"
            dense
            outlined
            emit-value
            map-options
            option-value="code"
            option-label="label"
            class="q-mb-xs"
            @update:model-value="(val) => onPickPortalApp(item, val)"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon || 'apps'" />
                </q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input
            v-else-if="item.type === 'section'"
            :model-value="item.sectionId || ''"
            @update:model-value="(val) => onPickSection(item, val)"
            label="Section ID"
            hint="Matches a block's Section ID on this page"
            dense
            outlined
            class="q-mb-xs"
          />
          <q-input
            v-else
            v-model="item.url"
            label="URL"
            dense
            outlined
            class="q-mb-xs"
          />
        </div>
        <q-btn
          outline
          color="primary"
          icon="add"
          label="Add Menu Item"
          size="sm"
          @click="addMenuItem"
        />
      </div>
    </q-expansion-item>

    <!-- Color -->
    <div class="q-mb-sm">
      <div class="text-caption text-grey-7 q-mb-xs">Background Color</div>
      <div class="row q-gutter-xs items-center">
        <div
          v-for="opt in colorOptions"
          :key="opt.value"
          class="color-dot"
          :class="{ active: color === opt.value && !customColor }"
          :style="{ backgroundColor: colorHexMap[opt.value] || '#999' }"
          @click="pickPreset(opt.value)"
        />
        <q-separator vertical class="q-mx-xs" />
        <label class="color-pick-wrapper">
          <input type="color" :value="customColor || '#000000'" @input="pickCustom($event.target.value)" class="color-pick-input" />
          <q-icon name="palette" size="xs" class="cursor-pointer" />
        </label>
        <q-btn
          v-if="customColor"
          flat dense round icon="close"
          size="xs" class="q-ml-xs"
          @click="clearCustomColor"
        />
      </div>
      <div v-if="customColor" class="text-caption text-grey-5 q-mt-xs">
        Custom: {{ customColor }}
      </div>
    </div>

    <!-- Label Color -->
    <div class="q-mb-sm">
      <div class="text-caption text-grey-7 q-mb-xs">Label Color</div>
      <div class="row q-gutter-xs items-center">
        <div
          v-for="opt in labelColorPresets"
          :key="opt.value"
          class="color-dot"
          :class="{ active: labelColor === opt.value && !customLabelColor }"
          :style="{ backgroundColor: opt.hex }"
          @click="pickLabelPreset(opt.value)"
        />
        <q-separator vertical class="q-mx-xs" />
        <label class="color-pick-wrapper">
          <input type="color" :value="customLabelColor || '#000000'" @input="pickLabelCustom($event.target.value)" class="color-pick-input" />
          <q-icon name="palette" size="xs" class="cursor-pointer" />
        </label>
        <q-btn
          v-if="customLabelColor"
          flat dense round icon="close"
          size="xs" class="q-ml-xs"
          @click="clearLabelColor"
        />
      </div>
      <div v-if="customLabelColor" class="text-caption text-grey-5 q-mt-xs">
        Custom: {{ customLabelColor }}
      </div>
    </div>

    <q-select v-model="variant" :options="variantOptions" label="Variant" dense outlined emit-value map-options class="q-mb-sm" />
    <q-select v-model="size" :options="sizeOptions" label="Size" dense outlined emit-value map-options class="q-mb-sm" />
    <q-select v-model="align" :options="alignOptions" label="Alignment" dense outlined emit-value map-options class="q-mb-sm" />
    <q-select v-model="btnWidth" :options="buttonWidthOptions" label="Width" dense outlined emit-value map-options class="q-mb-sm" />
    <q-input v-model.number="customWidth" label="Custom Width (px)" type="number" dense outlined min="0" class="q-mb-sm" />
    <q-input v-model.number="customHeight" label="Custom Height (px)" type="number" dense outlined min="0" class="q-mb-sm" />
    <q-select
      v-model="icon"
      :options="filteredIconOptions"
      label="Icon"
      dense
      outlined
      use-input
      input-debounce="300"
      @filter="filterIcons"
      clearable
      emit-value
      map-options
      option-label="name"
      class="q-mb-sm"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon :name="scope.opt.icon" color="primary" />
          </q-item-section>
          <q-item-section>
            {{ scope.opt.name }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-select v-if="icon" v-model="iconPosition" :options="iconPositionOptions" label="Icon Position" dense outlined emit-value map-options class="q-mb-sm" />
    <PaddingControl v-model="padding" label="Padding" />
    <q-input v-model="borderRadius" label="Border Radius (CSS, e.g. 16px)" dense outlined placeholder="default" class="q-mb-sm" />
    <q-input v-model="customCss" label="Custom CSS (e.g. margin-top: -40px; z-index: 2;)" type="textarea" dense outlined autogrow placeholder="property: value;" class="q-mb-sm" />
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { toRef } from "vue";
import { colorOptions, variantOptions, sizeOptions, alignOptions, buttonWidthOptions, iconPositionOptions, labelDisplayOptions, buttonShapeOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";
import PaddingControl from "../shared/PaddingControl.vue";
import iconList from "src/assets/icon_list.json";
import { useAuthStore } from "src/stores/authStore";

const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const label = useBlockField(blockRef, "label");
const labelDisplay = useBlockField(blockRef, "labelDisplay");
const shape = useBlockField(blockRef, "shape");
const url = useBlockField(blockRef, "url");
const color = useBlockField(blockRef, "color");
const variant = useBlockField(blockRef, "variant");
const size = useBlockField(blockRef, "size");
const align = useBlockField(blockRef, "align");
const btnWidth = useBlockField(blockRef, "btnWidth");
const customWidth = useBlockField(blockRef, "customWidth");
const customHeight = useBlockField(blockRef, "customHeight");
const icon = useBlockField(blockRef, "icon");
const iconPosition = useBlockField(blockRef, "iconPosition");
const customColor = useBlockField(blockRef, "customColor");
const labelColor = useBlockField(blockRef, "labelColor");
const customLabelColor = useBlockField(blockRef, "customLabelColor");
const padding = useBlockField(blockRef, "padding");
const borderRadius = useBlockField(blockRef, "borderRadius");
const customCss = useBlockField(blockRef, "customCss");
const menuItems = useBlockField(blockRef, "menuItems");

const authStore = useAuthStore();

const menuTypeOptions = [
  { label: "Custom URL", value: "url" },
  { label: "Section (scroll in page)", value: "section" },
  { label: "Portal Menu", value: "portalApp" },
];

const safeMenuItems = computed(() =>
  Array.isArray(menuItems.value) ? menuItems.value : []
);

// The author picks from their own role's portal menus. At render time each
// item is re-checked against the viewer's role, so this list is only a helper.
const portalAppOptions = computed(() => {
  const map = authStore.getChoosedRole?.role?.role_app_map || [];
  return map
    .filter((entry) => entry.apps)
    .map((entry) => ({
      code: entry.apps.am_app_code || entry.am_app_id,
      label: entry.apps.am_app_name || entry.am_app_id,
      icon: entry.apps.am_app_icon || "apps",
      url: entry.apps.am_app_url || "",
    }));
});

const onPickPortalApp = (item, code) => {
  item.appCode = code;
  const opt = portalAppOptions.value.find((o) => o.code === code);
  if (opt) {
    if (!item.label) item.label = opt.label;
    if (!item.icon) item.icon = opt.icon;
    item.url = opt.url || item.url;
  }
};

const onPickSection = (item, val) => {
  const clean = String(val || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+/, "");
  const sectionId = /^[a-z]/.test(clean) ? clean : "";
  item.sectionId = sectionId;
  item.url = sectionId ? `#${sectionId}` : "";
};

const addMenuItem = () => {
  const items = Array.isArray(menuItems.value) ? menuItems.value.slice() : [];
  items.push({
    type: "url",
    label: "",
    icon: "",
    url: "",
    appCode: "",
    sectionId: "",
  });
  menuItems.value = items;
};

const removeMenuItem = (idx) => {
  const items = Array.isArray(menuItems.value) ? menuItems.value.slice() : [];
  items.splice(idx, 1);
  menuItems.value = items;
};

const colorHexMap = {
  primary: "#1976d2",
  secondary: "#26a69a",
  accent: "#9c27b0",
  positive: "#21ba45",
  negative: "#c10015",
  warning: "#f2c037",
  info: "#31ccec",
  dark: "#1d1d1d",
  grey: "#9e9e9e",
};

const labelColorPresets = [
  { label: "White", value: "white", hex: "#ffffff" },
  { label: "Black", value: "black", hex: "#000000" },
  { label: "Grey", value: "grey-7", hex: "#616161" },
  { label: "Primary", value: "primary", hex: "#1976d2" },
  { label: "Dark", value: "dark", hex: "#1d1d1d" },
];

const pickPreset = (val) => {
  color.value = val;
  customColor.value = null;
};

const pickCustom = (hex) => {
  customColor.value = hex;
  color.value = null;
};

const clearCustomColor = () => {
  customColor.value = null;
  color.value = "primary";
};

const pickLabelPreset = (val) => {
  labelColor.value = val;
  customLabelColor.value = null;
};

const pickLabelCustom = (hex) => {
  customLabelColor.value = hex;
  labelColor.value = null;
};

const clearLabelColor = () => {
  customLabelColor.value = null;
  labelColor.value = null;
};

const iconOptions = ref([]);
const filteredIconOptions = ref([]);

onMounted(() => {
  if (iconList && Array.isArray(iconList)) {
    iconOptions.value = iconList
      .filter((ic) => ic.version === 329)
      .map((ic) => ({ name: ic.name, value: ic.name, icon: ic.name }));
    filteredIconOptions.value = iconOptions.value;
  }
});

const filterIcons = (val, update) => {
  if (!val) {
    update(() => {
      filteredIconOptions.value = iconOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredIconOptions.value = iconOptions.value.filter((ic) =>
      ic.name.toLowerCase().includes(needle)
    );
  });
};
</script>

<style scoped>
.color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.15s, transform 0.15s;
}
.color-dot:hover {
  transform: scale(1.15);
}
.color-dot.active {
  border-color: #333;
  transform: scale(1.15);
}
.color-pick-wrapper {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.color-pick-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
