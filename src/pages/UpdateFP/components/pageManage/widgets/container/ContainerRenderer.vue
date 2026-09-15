<template>
  <div :style="containerStyle">
    <draggable
      tag="div"
      :list="block.content.children || []"
      :group="{ name: 'widgets', pull: true, put: true }"
      item-key="id"
      ghost-class="ghost-block"
      animation="200"
      handle=".drag-handle-nested"
      :class="[
        'container-content',
        contentAlign ? 'content-align' : 'content-stretch',
        editMode ? 'column-drop-zone rounded column-drop-zone--edit' : '',
      ]"
      :disabled="!editMode"
    >
      <template #item="{ element: childBlock }">
        <div
          class="nested-block-wrapper"
          :class="{
            'nested-block-selected': selectedBlockId === childBlock.id,
          }"
          :style="childWrapperStyle"
          @click.stop="$emit('select-block', childBlock)"
        >
          <div
            v-if="editMode"
            class="nested-block-toolbar row items-center no-wrap q-gutter-xs"
          >
            <q-icon
              name="drag_indicator"
              class="drag-handle-nested cursor-move text-grey-6"
              size="xs"
            />
            <q-icon
              :name="getBlockMeta(childBlock.type).icon"
              size="xs"
              :color="getBlockMeta(childBlock.type).color"
            />
            <span class="text-caption">{{
              getBlockMeta(childBlock.type).label
            }}</span>
            <q-space />
            <q-btn
              flat
              dense
              round
              icon="content_copy"
              size="xs"
              color="grey-7"
              @click.stop="
                $emit('duplicate-child', {
                  colIndex: 0,
                  blockId: childBlock.id,
                })
              "
            >
              <q-tooltip>Duplicate</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="delete_outline"
              size="xs"
              color="red"
              @click.stop="
                $emit('delete-child', {
                  colIndex: 0,
                  blockId: childBlock.id,
                })
              "
            />
          </div>
          <blockRenderer
            :block="childBlock"
            :preview="preview"
            :edit-mode="editMode"
            :selected-block-id="selectedBlockId"
            :responsive="responsive"
            @select-block="$emit('select-block', $event)"
            @update:children="$emit('update:children', $event)"
            @delete-child="$emit('delete-child', $event)"
            @duplicate-child="$emit('duplicate-child', $event)"
          />
        </div>
      </template>
      <template #footer>
        <div
          v-if="editMode && !(block.content.children || []).length"
          class="column-empty-hint text-center text-grey-5 text-caption q-pa-sm"
        >
          <q-icon name="add" size="18px" />
          <div>Drop widgets here</div>
        </div>
      </template>
    </draggable>
  </div>
</template>
<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import blockRenderer from "../../blockRenderer.vue";
import widgetRegistry from "../widgetRegistry.js";

const props = defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
  selectedBlockId: String,
  responsive: Boolean,
});
defineEmits(["select-block", "update:children", "delete-child", "duplicate-child"]);

const getBlockMeta = (type) =>
  widgetRegistry[type]?.meta || { label: type, icon: "help", color: "grey" };

// Aligns the child blocks inside the container (left / center / right).
// Uses block layout + per-child width + auto margins (deterministic,
// no reliance on flex intrinsic sizing). Stretch = full width.
const contentAlign = computed(
  () => (props.block.content || {}).contentAlign || ""
);

// Only affects the child wrapper when an alignment or row gap is chosen;
// empty otherwise, leaving the default full-width block layout untouched.
const ROW_GAP_MAP = { none: "", sm: "8px", md: "16px", lg: "24px" };
const childWrapperStyle = computed(() => {
  const c = props.block.content || {};
  const s = {};
  const a = contentAlign.value;
  if (a) s.textAlign = a;
  const g = ROW_GAP_MAP[c.rowGap ?? ""];
  if (g) s.marginBottom = g;
  return Object.keys(s).length ? s : undefined;
});

const containerAlign = computed(
  () => (props.block.content || {}).containerAlign || ""
);

const fullBg = computed(() => !!(props.block.content || {}).bgFullWidth);

const containerStyle = computed(() => {
  const c = props.block.content || {};
  const s = {};
  // With a full-width background the color is painted by the block wrapper,
  // so the container itself must not paint it again.
  if (!fullBg.value && c.background) s.background = c.background;
  if (c.padding) s.padding = c.padding;
  if (c.borderRadius) s.borderRadius = c.borderRadius;

  if (fullBg.value) {
    // Keep the content inside the container's own column width, centered.
    const w = props.block.width || 12;
    s.width = "100%";
    s.maxWidth = `${(w / 12) * 100}%`;
    s.marginLeft = "auto";
    s.marginRight = "auto";
  } else {
    if (c.maxWidth) s.maxWidth = c.maxWidth;
    // Container box placement on the page
    if (containerAlign.value === "center") {
      s.marginLeft = "auto";
      s.marginRight = "auto";
    } else if (containerAlign.value === "right") {
      s.marginLeft = "auto";
    } else if (containerAlign.value === "left") {
      s.marginRight = "auto";
    }
  }

  if (contentAlign.value) s.textAlign = contentAlign.value;
  if (c.position) s.position = c.position;
  if (c.position && c.position !== "static") {
    if (c.top) s.top = c.top;
    if (c.left) s.left = c.left;
    if (c.right) s.right = c.right;
    if (c.bottom) s.bottom = c.bottom;
    if (c.zIndex) s.zIndex = c.zIndex;
    if (c.width) s.width = c.width;
  }
  return s;
});
</script>

<style scoped>
/* Aligned mode: make the child block hug its content (inline-block) so the
   wrapper's text-align can position it left/center/right. */
.container-content.content-align
  > :deep(.nested-block-wrapper)
  > .block-renderer {
  display: inline-block;
  width: auto;
  max-width: 100%;
}
/* Stretch: force the child to fill the container width. */
.container-content.content-stretch
  > :deep(.nested-block-wrapper)
  > .block-renderer {
  width: 100%;
}
</style>
