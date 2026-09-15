<template>
  <q-list
    :separator="!!c.dividers"
    :dense="c.dense !== false"
    :bordered="!!c.bordered"
    :padding="!!c.padding"
    :striped="!!c.striped"
    :dark="!!c.dark"
    :style="listStyle"
    :class="[
      'fp-list-widget',
      c.highlight ? 'fp-list-highlight' : '',
      c.dark ? 'fp-list-dark' : '',
    ]"
  >
    <q-item
      v-for="(item, li) in c.items || []"
      :key="li"
      :clickable="isClickable(item)"
      :lines="c.lines || undefined"
      :style="itemStyle"
      @click="handleClick(item)"
    >
      <q-item-section v-if="c.showIcon !== false && item.icon" avatar>
        <q-icon
          :name="item.icon"
          :color="c.iconColor ? undefined : 'primary'"
          :style="iconStyle"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-weight-bold" :style="titleStyle">{{
          item.title
        }}</q-item-label>
        <q-item-label caption v-if="item.desc" :style="descStyle">{{
          item.desc
        }}</q-item-label>
      </q-item-section>
      <q-item-section side v-if="item.url && !editMode">
        <q-icon name="chevron_right" color="grey-5" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
  selectedBlockId: String,
});

const router = useRouter();

const c = computed(() => props.block.content || {});
const listStyle = computed(() =>
  c.value.bgColor ? { background: c.value.bgColor } : undefined
);
const iconStyle = computed(() =>
  c.value.iconColor ? { color: c.value.iconColor } : undefined
);
const titleStyle = computed(() =>
  c.value.titleColor ? { color: c.value.titleColor } : undefined
);
const descStyle = computed(() =>
  c.value.descColor ? { color: c.value.descColor } : undefined
);
const itemStyle = computed(() =>
  c.value.itemPadding ? { padding: c.value.itemPadding } : undefined
);

// Clickable when the block opts in, or when the item has its own link.
const isClickable = (item) => {
  if (props.editMode) return false;
  return !!c.value.clickable || !!item.url;
};

const handleClick = (item) => {
  if (props.editMode || !item.url) return;
  if (item.url.startsWith("http://") || item.url.startsWith("https://")) {
    window.open(item.url, "_blank");
  } else {
    router.push(item.url);
  }
};
</script>

<style scoped>
/* Real hover highlight (Quasar's `highlight` prop only reacts to active). */
.fp-list-highlight :deep(.q-item:hover) {
  background: rgba(0, 0, 0, 0.06);
  transition: background 0.15s;
}
.fp-list-highlight.fp-list-dark :deep(.q-item:hover) {
  background: rgba(255, 255, 255, 0.08);
}
</style>
