<template>
  <div class="row q-col-gutter-md">
    <div
      v-for="(col, ci) in block.content.columns || []"
      :key="ci"
      :class="`col-${
        col.width || Math.floor(12 / (block.content.columns?.length || 2))
      }`"
    >
      <draggable
        tag="div"
        :list="col.children"
        :group="{ name: 'widgets', pull: true, put: true }"
        item-key="id"
        ghost-class="ghost-block"
        animation="200"
        handle=".drag-handle-nested"
        :class="editMode ? 'column-drop-zone rounded column-drop-zone--edit' : ''"
        :disabled="!editMode"
      >
        <template #item="{ element: childBlock }">
          <div
            class="nested-block-wrapper"
            :class="{
              'nested-block-selected': selectedBlockId === childBlock.id,
            }"
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
import draggable from "vuedraggable";
import blockRenderer from "../../blockRenderer.vue";
import widgetRegistry from "../widgetRegistry.js";

const getBlockMeta = (type) =>
  widgetRegistry[type]?.meta || { label: type, icon: "help", color: "grey" };

defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
  selectedBlockId: String,
});
defineEmits(["select-block", "update:children", "delete-child", "duplicate-child"]);
</script>
