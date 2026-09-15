<template>
  <q-select
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v ?? '')"
    :options="filteredIconOptions"
    :label="label"
    dense
    outlined
    use-input
    input-debounce="300"
    @filter="filterIcons"
    emit-value
    map-options
    option-label="name"
    clearable
    :class="className"
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
</template>
<script setup>
import { ref, onMounted } from "vue";
import iconList from "src/assets/icon_list.json";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "Icon" },
  className: { type: String, default: "q-mb-sm" },
});
const emit = defineEmits(["update:modelValue"]);

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
