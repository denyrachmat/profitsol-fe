<template>
  <div>
    <q-select
      v-model="count"
      :options="[2, 3, 4, 8, 12]"
      label="Number of Columns"
      dense
      outlined
      class="q-mb-sm"
    />
    <div v-for="(col, ci) in columns" :key="ci" class="q-mb-sm">
      <q-input
        v-model.number="columns[ci].width"
        :label="`Column ${ci + 1} Width`"
        type="number"
        dense
        outlined
        min="1"
        max="12"
      />
    </div>
    <q-btn
      flat
      dense
      no-caps
      label="Equalize widths"
      color="primary"
      @click="equalizeColumns"
      class="q-mt-xs"
    />
  </div>
</template>
<script setup>
import { toRef, toRaw } from "vue";
import { useBlockField } from "../useBlockField.js";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const count = useBlockField(blockRef, "count");
const columns = useBlockField(blockRef, "columns");
const equalizeColumns = () => {
  const raw = toRaw(props.block);
  const colCount = raw.content.count;
  const width = Math.floor(12 / colCount);
  raw.content.columns = Array.from({ length: colCount }, (_, i) => ({
    width: i === colCount - 1 ? 12 - width * (colCount - 1) : width,
    children: raw.content.columns?.[i]?.children || [],
  }));
};
</script>
