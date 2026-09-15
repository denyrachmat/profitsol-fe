<template>
  <div class="row" :class="gutterClass">
    <div v-for="(col, ci) in block.content.columns || []" :key="ci" :class="colClass(col)">
      <draggable
        tag="div"
        :list="col.children"
        :group="{ name: 'widgets', pull: true, put: true }"
        item-key="id"
        ghost-class="ghost-block"
        animation="200"
        handle=".drag-handle-nested"
        :class="editMode ? 'column-drop-zone rounded column-drop-zone--edit' : ''"
        :style="colPadding ? { padding: colPadding } : undefined"
        :disabled="!editMode"
      >
        <template #item="{ element: childBlock }">
          <div
            class="nested-block-wrapper"
            :class="{
              'nested-block-selected': selectedBlockId === childBlock.id,
            }"
            :style="rowGapStyle"
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
                    colIndex: ci,
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
                    colIndex: ci,
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
            v-if="editMode && !col.children?.length"
            class="column-empty-hint text-center text-grey-5 text-caption q-pa-sm"
          >
            <q-icon name="add" size="18px" />
            <div>Drop widgets here</div>
          </div>
        </template>
      </draggable>
    </div>
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

// When the page is Mobile Friendly, columns stack full-width on small screens
// (col-12) and only apply their configured width from the md breakpoint up.
const colClass = (col) => {
  const w =
    col.width || Math.floor(12 / (props.block.content.columns?.length || 2));
  return props.responsive ? ["col-12", `col-md-${w}`] : `col-${w}`;
};

const getBlockMeta = (type) =>
  widgetRegistry[type]?.meta || { label: type, icon: "help", color: "grey" };

const GUTTER_MAP = { none: "", sm: "q-col-gutter-sm", md: "q-col-gutter-md", lg: "q-col-gutter-lg" };

// Undefined gap = no gutter (an explicit md/sm/lg is required to add one).
const gutterClass = computed(() => GUTTER_MAP[props.block.content.gap ?? ""] || "");
const colPadding = computed(() => props.block.content.colPadding || "");

const ROW_GAP_MAP = { none: "", sm: "8px", md: "16px", lg: "24px" };
const rowGapStyle = computed(() => {
  const g = ROW_GAP_MAP[props.block.content.rowGap ?? ""];
  return g ? { marginBottom: g } : undefined;
});
</script>
