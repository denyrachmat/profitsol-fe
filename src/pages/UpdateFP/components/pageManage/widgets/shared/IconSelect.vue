<template>
  <div :class="className">
    <q-btn-toggle
      v-model="iconSet"
      toggle-color="primary"
      dense
      no-caps
      spread
      class="q-mb-xs full-width"
      :options="ICON_SETS"
    />
    <q-select
      :model-value="modelValue"
      @update:model-value="(v) => emit('update:modelValue', v ?? '')"
      :options="filteredIconOptions"
      :label="label"
      dense
      outlined
      use-input
      input-debounce="200"
      @filter="filterIcons"
      emit-value
      map-options
      option-label="name"
      clearable
      virtual-scroll
      :virtual-scroll-item-size="44"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon :name="scope.opt.icon" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.name }}</q-item-label>
            <q-item-label caption v-if="scope.opt.set">
              {{ scope.opt.set }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:selected-item="scope">
        <q-icon
          :name="scope.opt.icon"
          color="primary"
          size="sm"
          class="q-mr-sm"
        />
        {{ scope.opt.name }}
      </template>
    </q-select>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import iconList from "src/assets/icon_list.json";
import symbolsList from "src/assets/icon_symbols_list.json";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "Icon" },
  className: { type: String, default: "q-mb-sm" },
});
const emit = defineEmits(["update:modelValue"]);

const ICON_SETS = [
  { label: "Material Icons", value: "icons" },
  { label: "Material Symbols", value: "symbols" },
];
const iconSet = ref("icons");

const iconOptions = ref([]);
const filteredIconOptions = ref([]);

const toMaterialIconsOptions = (list) =>
  (list || [])
    .filter((ic) => ic.version === 329)
    .map((ic) => ({ name: ic.name, value: ic.name, icon: ic.name }));

const toSymbolsOptions = (list) =>
  (list || []).map((name) => ({
    name,
    value: `sym_o_${name}`,
    icon: `sym_o_${name}`,
    set: "Material Symbols",
  }));

const buildOptions = () =>
  iconSet.value === "symbols"
    ? toSymbolsOptions(symbolsList?.names)
    : toMaterialIconsOptions(iconList);

const refresh = () => {
  iconOptions.value = buildOptions();
  filteredIconOptions.value = iconOptions.value;
};

watch(iconSet, refresh);
onMounted(refresh);

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
