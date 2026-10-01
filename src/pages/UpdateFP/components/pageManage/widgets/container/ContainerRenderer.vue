<template>
  <div :style="containerStyle" :class="{ 'container-has-bg': hasPinned }">
    <!-- Pinned background layer (image/html children flagged pinBackground).
         Rendered only outside edit mode; in edit mode pinned children show
         as slim labeled bars in the drag list instead. -->
    <div
      v-if="hasPinned && !editMode"
      class="container-bg-layer"
      :style="bgLayerStyle"
    >
      <div
        v-for="child in pinnedChildren"
        :key="child.id"
        class="container-bg-item"
      >
        <blockRenderer
          :block="child"
          :preview="preview"
          :edit-mode="false"
          :selected-block-id="selectedBlockId"
          :responsive="responsive"
          @select-block="$emit('select-block', $event)"
          @update:children="$emit('update:children', $event)"
          @delete-child="$emit('delete-child', $event)"
          @duplicate-child="$emit('duplicate-child', $event)"
        />
      </div>
      <!-- Readability scrim above the background, below the content -->
      <div
        v-if="bgScrim"
        class="container-bg-scrim"
        :style="{ background: bgScrim }"
      />
    </div>

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
        hasPinned ? 'container-content--above' : '',
        editMode ? 'column-drop-zone rounded column-drop-zone--edit' : '',
      ]"
      :disabled="!editMode"
    >
      <template #item="{ element: childBlock }">
          <div
            class="nested-block-wrapper"
            :class="{
              'nested-block-selected': selectedBlockId === childBlock.id,
              'nested-block--pinned': isPinned(childBlock),
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
            :icon="isPinned(childBlock) ? 'layers_clear' : 'layers'"
            size="xs"
            :color="isPinned(childBlock) ? 'teal' : 'grey-7'"
            @click.stop="togglePin(childBlock)"
          >
            <q-tooltip>{{
              isPinned(childBlock)
                ? "Unpin from background"
                : "Pin as background (behind content)"
            }}</q-tooltip>
          </q-btn>
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
          <!-- Pinned children render as a labeled bar in edit mode (the live
               layer is hidden while editing), and render nothing in flow in
               preview/live — their real copy lives in the bg layer above. -->
          <div
            v-if="editMode && isPinned(childBlock)"
            class="container-bg-bar row items-center no-wrap q-px-sm q-py-xs"
            @click.stop="$emit('select-block', childBlock)"
          >
            <q-icon name="layers" size="xs" color="teal" class="q-mr-xs" />
            <span class="text-caption text-grey-8 ellipsis">
              Background — {{ getBlockMeta(childBlock.type).label }}
            </span>
            <q-space />
            <q-btn
              flat
              dense
              round
              icon="layers_clear"
              size="xs"
              color="teal"
              @click.stop="togglePin(childBlock)"
            >
              <q-tooltip>Unpin from background</q-tooltip>
            </q-btn>
          </div>
          <div
            v-else-if="!editMode && isPinned(childBlock)"
            style="display: none"
          ></div>
          <blockRenderer
            v-else
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

// Pinned children (content.pinBackground) render in the absolute background
// layer instead of the flow. Single source list is kept — the split happens
// at render time only, so draggable write-back can never lose blocks.
const isPinned = (child) => !!(child && child.content && child.content.pinBackground);

const pinnedChildren = computed(() =>
  (props.block.content?.children || []).filter(isPinned)
);
const hasPinned = computed(() => pinnedChildren.value.length > 0);

const bgScrim = computed(() => props.block.content?.bgScrim || "");

const togglePin = (child) => {
  if (!child) return;
  if (!child.content) child.content = {};
  child.content.pinBackground = !child.content.pinBackground;
};

// Inherits the container's radius so backgrounds clip to rounded corners.
const bgLayerStyle = computed(() => {
  const c = props.block.content || {};
  return c.borderRadius ? { borderRadius: c.borderRadius } : undefined;
});

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
  // With a background layer the box must be the positioned ancestor of the
  // absolute layer, unless the author set an explicit position already.
  s.position = c.position || (hasPinned.value ? "relative" : undefined);
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
/* Background layer: pinned children fill the container behind the content. */
.container-bg-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* Decorative only — never intercept clicks meant for the content. */
  pointer-events: none;
}

.container-bg-item {
  width: 100%;
  height: 100%;
}

/* Let pinned widgets fill the layer height (an image in fill mode or an HTML
   block that sizes itself will then cover the container). */
.container-bg-item > :deep(.block-renderer) {
  height: 100%;
}

.container-bg-scrim {
  position: absolute;
  inset: 0;
}

/* Content must paint above the absolute background layer. */
.container-content--above {
  position: relative;
  z-index: 1;
}

/* Edit-mode bar for a pinned child — keeps it manageable without rendering
   the live background (mirrors how CarouselRenderer abstracts its slides). */
.container-bg-bar {
  background: repeating-linear-gradient(
    45deg,
    #e0f2f1,
    #e0f2f1 8px,
    #d3eae8 8px,
    #d3eae8 16px
  );
  border: 1px dashed #26a69a;
  border-radius: 4px;
  min-height: 28px;
  cursor: pointer;
}

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
