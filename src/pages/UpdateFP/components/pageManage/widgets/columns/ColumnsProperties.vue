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
    <q-select
      v-model="gap"
      :options="[
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ]"
      label="Gap Between Columns"
      dense
      outlined
      emit-value
      map-options
      class="q-mb-sm"
    />
    <q-select
      v-model="rowGap"
      :options="[
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ]"
      label="Gap Between Rows (stacked widgets)"
      dense
      outlined
      emit-value
      map-options
      class="q-mb-sm"
    />
    <PaddingControl v-model="colPadding" label="Column Padding" />
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
import { toRef } from "vue";
import { useBlockField } from "../useBlockField.js";
import PaddingControl from "../shared/PaddingControl.vue";
const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");
const count = useBlockField(blockRef, "count");
const columns = useBlockField(blockRef, "columns");
const gap = useBlockField(blockRef, "gap");
const rowGap = useBlockField(blockRef, "rowGap");
const colPadding = useBlockField(blockRef, "colPadding");
const equalizeColumns = () => {
  const colCount = props.block.content.count;
  const width = Math.floor(12 / colCount);
  props.block.content.columns = Array.from({ length: colCount }, (_, i) => ({
    width: i === colCount - 1 ? 12 - width * (colCount - 1) : width,
    children: props.block.content.columns?.[i]?.children || [],
  }));
};
</script>
