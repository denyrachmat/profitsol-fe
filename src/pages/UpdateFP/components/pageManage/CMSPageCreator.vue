<template>
  <div class="cms-page-creator">
    <!-- Toolbar -->
    <q-toolbar class="bg-white text-dark shadow-1">
      <q-btn flat no-caps label="File" color="primary">
        <q-menu>
          <q-list dense style="min-width: 160px">
            <q-item clickable v-close-popup @click="onNewPage">
              <q-item-section avatar><q-icon name="note_add" /></q-item-section>
              <q-item-section>New Page</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="onLoadPage"
              :disable="!props.pageId"
            >
              <q-item-section avatar
                ><q-icon name="folder_open"
              /></q-item-section>
              <q-item-section>Open...</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="onSavePage"
              :disable="!pageTitle"
            >
              <q-item-section avatar><q-icon name="save" /></q-item-section>
              <q-item-section>Save (Ctrl + S)</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn flat no-caps label="Action" color="primary">
        <q-menu>
          <q-list dense style="min-width: 160px">
            <q-item
              clickable
              v-close-popup
              @click="onPreviewPage"
              :disable="blocks.length === 0"
            >
              <q-item-section avatar
                ><q-icon name="visibility"
              /></q-item-section>
              <q-item-section>Preview</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onPageSettings">
              <q-item-section avatar><q-icon name="settings" /></q-item-section>
              <q-item-section>Page Settings</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-separator vertical class="q-mx-sm" />

      <div class="text-subtitle2 text-grey-7">
        {{ blocks.length }} block{{ blocks.length !== 1 ? "s" : "" }}
      </div>

      <q-space />

      <q-input
        v-model="pageTitle"
        dense
        outlined
        placeholder="Page Title"
        class="col-4"
        :rules="[(v) => !!v || 'Title is required']"
        hide-bottom-space
      />

      <q-space />

      <q-btn-toggle
        v-model="previewMode"
        flat
        no-caps
        toggle-color="primary"
        :options="[
          { icon: 'edit', value: 'edit', slot: 'edit' },
          { icon: 'desktop_windows', value: 'desktop', slot: 'desktop' },
          { icon: 'phone_iphone', value: 'mobile', slot: 'mobile' },
        ]"
      >
        <template v-slot:edit>
          <q-tooltip>Edit Mode</q-tooltip>
        </template>
        <template v-slot:desktop>
          <q-tooltip>Desktop Preview</q-tooltip>
        </template>
        <template v-slot:mobile>
          <q-tooltip>Mobile Preview</q-tooltip>
        </template>
      </q-btn-toggle>

      <q-btn
        flat
        no-caps
        color="green"
        icon="save"
        label="Save"
        @click="onSavePage"
        :disable="!pageTitle"
      />
    </q-toolbar>

    <q-separator />

    <div class="row no-wrap" style="height: calc(100vh - 110px)">
      <!-- Left: Widget Palette (only in edit mode) -->
      <div
        v-if="previewMode === 'edit'"
        class="widget-palette bg-grey-1"
        style="width: 220px; min-width: 220px"
      >
        <div class="q-pa-sm text-subtitle2 text-grey-7 text-weight-bold">
          <q-icon name="widgets" class="q-mr-xs" /> Widgets
        </div>
        <draggable
          tag="div"
          :list="widgetCatalog"
          :group="{ name: 'widgets', pull: 'clone', put: false }"
          :sort="false"
          item-key="type"
          class="q-pa-xs"
          :clone="cloneWidget"
        >
          <template #item="{ element }">
            <div
              class="widget-palette-item q-pa-sm q-mb-xs cursor-pointer row items-center no-wrap"
            >
              <q-icon
                :name="element.icon"
                :color="element.color"
                size="sm"
                class="q-mr-sm"
              />
              <span class="text-caption">{{ element.label }}</span>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Center: Canvas -->
      <div
        class="col canvas-area"
        :class="{ 'canvas-preview': previewMode !== 'edit' }"
      >
        <div
          :class="{
            'canvas-inner': true,
            'canvas-desktop': previewMode === 'desktop',
            'canvas-mobile': previewMode === 'mobile',
          }"
        >
          <!-- Empty state (shown inside draggable when no blocks) -->
          <div v-if="blocks.length === 0" class="canvas-empty">
            <q-icon name="widgets" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-5 q-mt-md">
              Drag widgets here to start building
            </div>
            <div class="text-caption text-grey-5">
              Or click the + button below
            </div>
          </div>

          <!-- Draggable blocks (always rendered so palette has a drop target) -->
          <draggable
            tag="div"
            v-model="blocks"
            :group="{ name: 'widgets', pull: true, put: true }"
            item-key="id"
            handle=".drag-handle"
            ghost-class="ghost-block"
            animation="200"
            class="blocks-container"
          >
            <template #item="{ element, index }">
              <div
                class="block-wrapper"
                :class="{
                  'block-selected': selectedBlockId === element.id,
                  'block-hover':
                    previewMode === 'edit' && selectedBlockId !== element.id,
                }"
                @click.stop="selectBlock(element)"
              >
                <!-- Block toolbar (edit mode only) -->
                <div
                  v-if="previewMode === 'edit'"
                  class="block-toolbar row items-center no-wrap"
                >
                  <q-icon
                    name="drag_indicator"
                    class="drag-handle cursor-move text-grey-6 q-mr-xs"
                    size="sm"
                  />
                  <q-icon
                    :name="getBlockMeta(element.type).icon"
                    :color="getBlockMeta(element.type).color"
                    size="sm"
                    class="q-mr-xs"
                  />
                  <span class="text-caption text-grey-7">{{
                    getBlockMeta(element.type).label
                  }}</span>
                  <q-space />
                  <q-btn
                    flat
                    dense
                    round
                    icon="content_copy"
                    size="xs"
                    color="grey-7"
                    @click.stop="duplicateBlock(index)"
                  >
                    <q-tooltip>Duplicate</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    round
                    icon="arrow_upward"
                    size="xs"
                    color="grey-7"
                    :disable="index === 0"
                    @click.stop="moveBlock(index, -1)"
                  >
                    <q-tooltip>Move Up</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    round
                    icon="arrow_downward"
                    size="xs"
                    color="grey-7"
                    :disable="index === blocks.length - 1"
                    @click.stop="moveBlock(index, 1)"
                  >
                    <q-tooltip>Move Down</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    size="xs"
                    color="red"
                    @click.stop="deleteBlock(index)"
                  >
                    <q-tooltip>Delete</q-tooltip>
                  </q-btn>
                </div>

                <!-- Block content preview -->
                <div class="block-content">
                  <blockRenderer
                    :block="element"
                    :preview="previewMode !== 'edit'"
                    :edit-mode="previewMode === 'edit'"
                    :selected-block-id="selectedBlockId"
                    @select-block="selectBlock"
                    @update:children="onUpdateColumnChildren"
                    @delete-child="onDeleteColumnChild"
                    @duplicate-child="onDuplicateNestedChild"
                  />
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Right: Properties Panel (only in edit mode when block selected) -->
      <template v-if="previewMode === 'edit' && selectedBlock">
        <div
          v-if="propsPanelOpen"
          class="props-panel bg-white shadow-1"
          :style="{ width: propsPanelWidth + 'px', minWidth: propsPanelWidth + 'px' }"
        >
          <!-- Resize handle -->
          <div
            class="props-resize-handle"
            @mousedown="onPropsResizeStart"
          />
          <div class="q-pa-sm row items-center bg-grey-1">
            <q-icon
              :name="getBlockMeta(selectedBlock.type).icon"
              :color="getBlockMeta(selectedBlock.type).color"
              class="q-mr-sm"
            />
            <span class="text-subtitle2 text-weight-bold"
              >{{ getBlockMeta(selectedBlock.type).label }} Properties</span
            >
            <q-space />
            <q-btn
              flat
              dense
              round
              icon="chevron_right"
              size="sm"
              @click="propsPanelOpen = false"
            />
            <q-btn
              flat
              dense
              round
              icon="close"
              size="sm"
              @click="selectedBlockId = null"
            />
          </div>
          <q-separator />
          <div class="props-content q-pa-sm">
            <!-- Width -->
            <q-select
              v-model="selectedBlockWidth"
              :options="widthOptions"
              label="Column Width"
              dense
              outlined
              emit-value
              map-options
              class="q-mb-sm"
            />

            <!-- Dynamic properties component -->
            <component
              :is="propertiesComponent"
              v-if="propertiesComponent"
              :block="selectedBlock"
              :category-options="categoryOptions"
            />
          </div>
        </div>

        <!-- Collapsed panel toggle -->
        <div
          v-else
          class="bg-grey-1 shadow-1 column items-center q-py-sm"
          style="width: 36px; min-width: 36px; border-left: 1px solid #e0e0e0"
        >
          <q-btn
            flat
            dense
            round
            icon="chevron_left"
            size="sm"
            @click="propsPanelOpen = true"
          >
            <q-tooltip>Show Properties</q-tooltip>
          </q-btn>
        </div>
      </template>
    </div>

    <!-- Floating Widget FAB -->
    <q-fab
      v-if="previewMode === 'edit'"
      v-model="fabOpen"
      icon="add"
      direction="up"
      color="primary"
      class="fab-add-widget"
    >
      <q-fab-action
        v-for="widget in widgetCatalog"
        :key="widget.type"
        :icon="widget.icon"
        :color="widget.color"
        @click="addBlock(widget.type)"
      >
        <q-tooltip anchor="center left" self="center right">{{
          widget.label
        }}</q-tooltip>
      </q-fab-action>
    </q-fab>

    <!-- Preview Dialog -->
    <q-dialog v-model="previewDialog" full-width full-height persistent>
      <q-card class="column full-height">
        <q-card-section class="row items-center q-py-sm bg-grey-2">
          <div class="text-h6">Preview: {{ pageTitle }}</div>
          <q-space />
          <q-btn-toggle
            v-model="dialogPreviewMode"
            flat
            no-caps
            toggle-color="primary"
            size="sm"
            :options="[
              { label: 'Desktop', value: 'desktop', icon: 'desktop_windows' },
              { label: 'Mobile', value: 'mobile', icon: 'phone_iphone' },
            ]"
          />
          <q-btn flat round icon="close" v-close-popup class="q-ml-sm" />
        </q-card-section>
        <q-separator />
        <q-card-section class="col scroll q-pa-none">
          <div
            class="preview-container"
            :class="{ 'preview-mobile': dialogPreviewMode === 'mobile' }"
          >
            <blockRenderer
              v-for="block in blocks"
              :key="block.id"
              :block="block"
              :preview="true"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Page Settings Dialog -->
    <q-dialog v-model="pageSettingsDialog" persistent>
      <q-card style="min-width: 480px">
        <q-card-section class="text-h6">Page Settings</q-card-section>
        <q-card-section>
          <q-input
            v-model="pageTitle"
            label="Page Title"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-input
            v-model="pageDesc"
            label="Description"
            type="textarea"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-input
            v-model="pageSlug"
            label="Slug (URL)"
            dense
            outlined
            class="q-mb-sm"
            hint="Auto-generated from title if empty"
          />
          <q-select
            v-model="pageStatus"
            :options="statusOptions"
            label="Status"
            dense
            outlined
            emit-value
            map-options
          />
          <q-toggle
            v-model="pageShowHeader"
            label="Show Page Header"
            class="q-mt-sm"
          />
          <q-select
            v-model="pageContainerWidth"
            :options="[
              { label: 'Contained (900px)', value: 'contained' },
              { label: 'Wide (1200px)', value: 'wide' },
              { label: 'Full Width', value: 'full' },
            ]"
            label="Container Width"
            dense
            outlined
            emit-value
            map-options
            class="q-mt-sm"
          />
          <q-toggle
            v-model="pageMobileFriendly"
            label="Mobile Friendly (Responsive)"
            class="q-mt-sm"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn
            flat
            label="Save"
            color="primary"
            @click="pageSettingsDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useQuasar } from "quasar";
import draggable from "vuedraggable";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";
import blockRenderer from "./blockRenderer.vue";
import widgetRegistry from "./widgets/widgetRegistry.js";
import { statusOptions, widthOptions } from "./widgets/options.js";

const $q = useQuasar();
const { postData } = apiRequest();
const authStore = useAuthStore();

const emit = defineEmits(["save"]);

const props = defineProps({
  mode: String,
  pageId: [String, Number],
  dataPage: Object,
});

const BLOCK_ID_COUNTER = ref(0);
const generateBlockId = () => `block-${Date.now()}-${++BLOCK_ID_COUNTER.value}`;

const pageIdLocal = ref(props.pageId || null);
const pageTitle = ref("");
const pageDesc = ref("");
const pageSlug = ref("");
const pageStatus = ref("draft");
const pageShowHeader = ref(true);
const pageContainerWidth = ref("contained");
const pageMobileFriendly = ref(false);
const blocks = ref([]);
const selectedBlockId = ref(null);
const propsPanelOpen = ref(true);
const propsPanelWidth = ref(340);
const previewMode = ref("edit");
const fabOpen = ref(false);
const previewDialog = ref(false);
const dialogPreviewMode = ref("desktop");
const pageSettingsDialog = ref(false);
const categoryOptions = ref([
  { label: "All Categories", value: "" },
  { label: "News", value: "news" },
  { label: "Updates", value: "updates" },
  { label: "Events", value: "events" },
]);

const findBlockById = (id, blockList) => {
  for (const b of blockList) {
    if (b.id === id) return b;
    if (b.type === "columns" && b.content.columns) {
      for (const col of b.content.columns) {
        if (col.children?.length) {
          const found = findBlockById(id, col.children);
          if (found) return found;
        }
      }
    }
    if (b.type === "carousel" && b.content.slides) {
      for (const slide of b.content.slides) {
        if (slide.children?.length) {
          const found = findBlockById(id, slide.children);
          if (found) return found;
        }
      }
    }
  }
  return null;
};

const selectedBlock = computed(() => {
  if (!selectedBlockId.value) return null;
  return findBlockById(selectedBlockId.value, blocks.value);
});

const selectedBlockWidth = computed({
  get: () => selectedBlock.value?.width ?? 12,
  set: (val) => {
    if (selectedBlock.value) selectedBlock.value.width = val;
  },
});

const widgetCatalog = ref(
  Object.entries(widgetRegistry).map(([type, def]) => ({
    type,
    ...def.meta,
  }))
);

const getBlockMeta = (type) =>
  widgetRegistry[type]?.meta || { label: type, icon: "help", color: "grey" };

const cloneWidget = (original) => ({
  id: generateBlockId(),
  type: original.type,
  width: 12,
  _dbId: null,
  content: JSON.parse(
    JSON.stringify(widgetRegistry[original.type]?.defaultContent?.() || {})
  ),
});

const propertiesComponent = computed(() => {
  if (!selectedBlock.value) return null;
  return widgetRegistry[selectedBlock.value.type]?.PropertiesComponent || null;
});

const addBlock = (type) => {
  const meta = widgetCatalog.value.find((w) => w.type === type);
  if (!meta) return;
  blocks.value.push(cloneWidget(meta));
  fabOpen.value = false;
  selectedBlockId.value = blocks.value[blocks.value.length - 1].id;
};

const selectBlock = (block) => {
  if (previewMode.value !== "edit") return;
  selectedBlockId.value = block.id;
  propsPanelOpen.value = true;
};

const onPropsResizeMove = (e) => {
  propsPanelWidth.value = Math.min(
    560,
    Math.max(280, window.innerWidth - e.clientX)
  );
};

const onPropsResizeEnd = () => {
  window.removeEventListener("mousemove", onPropsResizeMove);
  window.removeEventListener("mouseup", onPropsResizeEnd);
  document.body.style.userSelect = "";
};

const onPropsResizeStart = () => {
  window.addEventListener("mousemove", onPropsResizeMove);
  window.addEventListener("mouseup", onPropsResizeEnd);
  document.body.style.userSelect = "none";
};

const duplicateBlock = (index) => {
  const original = blocks.value[index];
  const copy = JSON.parse(JSON.stringify(original));
  copy.id = generateBlockId();
  copy._dbId = null;
  blocks.value.splice(index + 1, 0, copy);
  selectedBlockId.value = copy.id;
};

const deleteBlock = (index) => {
  const block = blocks.value[index];
  if (selectedBlockId.value === block.id) selectedBlockId.value = null;
  blocks.value.splice(index, 1);
};

const moveBlock = (index, direction) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= blocks.value.length) return;
  const temp = blocks.value[index];
  blocks.value[index] = blocks.value[newIndex];
  blocks.value[newIndex] = temp;
};

const onUpdateColumnChildren = ({ colIndex, slideIndex, children, blockId }) => {
  if (!blockId) return;
  const parentBlock = findBlockById(blockId, blocks.value);
  if (!parentBlock) return;

  if (parentBlock.type === "columns" && colIndex !== undefined) {
    // guard: :list in ColumnsRenderer mutates in-place, avoid double-set that breaks Sortable's domElement
    if (parentBlock.content.columns[colIndex].children !== children) {
      parentBlock.content.columns[colIndex].children = children;
    }
  } else if (parentBlock.type === "carousel" && slideIndex !== undefined) {
    if (parentBlock.content.slides[slideIndex].children !== children) {
      parentBlock.content.slides[slideIndex].children = children;
    }
  }
};

const findColumnsBlockContainingChild = (blockId) => {
  for (const block of blocks.value) {
    if (block.type === "columns" && block.content.columns) {
      for (const col of block.content.columns) {
        if (col.children?.some((c) => c.id === blockId)) {
          return block;
        }
      }
    }
    if (block.type === "carousel" && block.content.slides) {
      for (const slide of block.content.slides) {
        if (slide.children?.some((c) => c.id === blockId)) {
          return block;
        }
      }
    }
  }
  return null;
};

const onDeleteColumnChild = ({ colIndex, slideIndex, blockId }) => {
  const parentColumnsBlock = findColumnsBlockContainingChild(blockId);
  if (!parentColumnsBlock) {
    // fallback to deep search for nested columns inside columns
    const deep = findParentForChild(blockId, blocks.value);
    if (!deep) return;
    if (deep.column) {
      const idx = deep.column.children.findIndex((b) => b.id === blockId);
      if (idx !== -1) {
        if (selectedBlockId.value === blockId) selectedBlockId.value = null;
        deep.column.children.splice(idx, 1);
      }
      return;
    }
    if (deep.slide) {
      const idx = deep.slide.children.findIndex((b) => b.id === blockId);
      if (idx !== -1) {
        if (selectedBlockId.value === blockId) selectedBlockId.value = null;
        deep.slide.children.splice(idx, 1);
      }
      return;
    }
    return;
  }

  if (parentColumnsBlock.type === "columns") {
    const col = parentColumnsBlock.content.columns[colIndex];
    if (!col?.children) return;
    const idx = col.children.findIndex((b) => b.id === blockId);
    if (idx !== -1) {
      if (selectedBlockId.value === blockId) selectedBlockId.value = null;
      col.children.splice(idx, 1);
    }
  } else if (parentColumnsBlock.type === "carousel") {
    const idx = slideIndex ?? colIndex;
    const slide = parentColumnsBlock.content.slides[idx];
    if (!slide?.children) return;
    const childIdx = slide.children.findIndex((b) => b.id === blockId);
    if (childIdx !== -1) {
      if (selectedBlockId.value === blockId) selectedBlockId.value = null;
      slide.children.splice(childIdx, 1);
    }
  }
};

const cloneBlockWithNewIds = (block) => {
  const clone = JSON.parse(JSON.stringify(block));
  const regenerate = (b) => {
    b.id = generateBlockId();
    b._dbId = null;
    if (b.type === "columns" && b.content?.columns) {
      b.content.columns.forEach((col) => {
        if (col.children) col.children.forEach(regenerate);
      });
    } else if (b.type === "carousel" && b.content?.slides) {
      b.content.slides.forEach((slide) => {
        if (slide.children) slide.children.forEach(regenerate);
      });
    }
  };
  regenerate(clone);
  return clone;
};

const findParentForChild = (targetId, list) => {
  for (const block of list) {
    if (block.type === "columns" && block.content.columns) {
      for (let ci = 0; ci < block.content.columns.length; ci++) {
        const col = block.content.columns[ci];
        if (col.children) {
          const idx = col.children.findIndex((c) => c.id === targetId);
          if (idx !== -1) return { parentBlock: block, colIndex: ci, childIndex: idx, column: col, slide: null };
          const deeper = findParentForChild(targetId, col.children);
          if (deeper) return deeper;
        }
      }
    }
    if (block.type === "carousel" && block.content.slides) {
      for (let si = 0; si < block.content.slides.length; si++) {
        const slide = block.content.slides[si];
        if (slide.children) {
          const idx = slide.children.findIndex((c) => c.id === targetId);
          if (idx !== -1) return { parentBlock: block, slideIndex: si, childIndex: idx, column: null, slide };
          const deeper = findParentForChild(targetId, slide.children);
          if (deeper) return deeper;
        }
      }
    }
  }
  return null;
};

const onDuplicateNestedChild = ({ colIndex, slideIndex, blockId }) => {
  // Try direct parent first
  let parentInfo = findParentForChild(blockId, blocks.value);
  if (!parentInfo) {
    const p = findColumnsBlockContainingChild(blockId);
    if (!p) return;
    if (p.type === "columns") {
      const col = p.content.columns[colIndex];
      if (!col?.children) return;
      const idx = col.children.findIndex((b) => b.id === blockId);
      if (idx === -1) return;
      const clone = cloneBlockWithNewIds(col.children[idx]);
      col.children.splice(idx + 1, 0, clone);
      selectedBlockId.value = clone.id;
      return;
    }
    if (p.type === "carousel") {
      const idx = slideIndex ?? colIndex;
      const slide = p.content.slides[idx];
      if (!slide?.children) return;
      const childIdx = slide.children.findIndex((b) => b.id === blockId);
      if (childIdx === -1) return;
      const clone = cloneBlockWithNewIds(slide.children[childIdx]);
      slide.children.splice(childIdx + 1, 0, clone);
      selectedBlockId.value = clone.id;
      return;
    }
    return;
  }

  // Use deep-found parent (supports nested columns inside columns)
  if (parentInfo.column) {
    const idx = parentInfo.childIndex;
    const clone = cloneBlockWithNewIds(parentInfo.column.children[idx]);
    parentInfo.column.children.splice(idx + 1, 0, clone);
    selectedBlockId.value = clone.id;
  } else if (parentInfo.slide) {
    const idx = parentInfo.childIndex;
    const clone = cloneBlockWithNewIds(parentInfo.slide.children[idx]);
    parentInfo.slide.children.splice(idx + 1, 0, clone);
    selectedBlockId.value = clone.id;
  }
};

const onNewPage = () => {
  $q.dialog({
    title: "New Page",
    message: "Create a new page? Unsaved changes will be lost.",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    pageIdLocal.value = null;
    pageTitle.value = "";
    pageDesc.value = "";
    pageSlug.value = "";
    pageStatus.value = "draft";
    blocks.value = [];
    selectedBlockId.value = null;
    $q.notify({ message: "New page created", color: "green", icon: "check" });
  });
};

const onLoadPage = () => {
  $q.dialog({
    title: "Open Page",
    message: "Load page data? Unsaved changes will be lost.",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (props.dataPage) {
      loadPageData(props.dataPage);
    } else {
      $q.notify({ message: "No page data available", color: "info" });
    }
  });
};

const loadPageData = (data) => {
  pageIdLocal.value = data.id || null;
  pageTitle.value = data.title || "";
  pageDesc.value = data.desc || "";
  pageSlug.value = data.url || "";
  blocks.value = transformBlocksFromBackend(data.forms || []);
  selectedBlockId.value = null;

  if (data.setupTraining) {
    if (data.setupTraining.containerWidth) {
      pageContainerWidth.value = data.setupTraining.containerWidth;
    }
    if (data.setupTraining.mobileFriendly !== undefined) {
      pageMobileFriendly.value = !!data.setupTraining.mobileFriendly;
    }
  }
};

const deepCloneBlocks = (blockList) => {
  return blockList.map((b) => {
    const clone = {
      ...b,
      id: b.id || generateBlockId(),
    };
    if (clone.type === "columns" && clone.content?.columns) {
      clone.content = {
        ...clone.content,
        columns: clone.content.columns.map((col) => ({
          ...col,
          children: col.children ? deepCloneBlocks(col.children) : [],
        })),
      };
    }
    return clone;
  });
};

const transformBlocksToBackend = (blockList) => {
  return blockList.map((block, index) => {
    const base = { seq_name: index + 1 };
    if (block._dbId) base.id = block._dbId;

    if (block.type === "columns") {
      return {
        ...base,
        type: "columns",
        width: block.width || 12,
        content: {
          columns: (block.content.columns || []).map((col) => ({
            size: col.width || 6,
            children: transformBlocksToBackend(col.children || []),
          })),
        },
      };
    } else if (block.type === "carousel") {
      const { _currentSlide, ...rest } = block.content;
      return {
        ...base,
        type: "carousel",
        width: block.width || 12,
        content: {
          ...rest,
          slides: (block.content.slides || []).map((slide) => ({
            children: transformBlocksToBackend(slide.children || []),
          })),
        },
      };
    } else {
      let content = block.content;
      if (block.type === "posts" && content && typeof content === "object") {
        const { category, ...rest } = content;
        content = { ...rest, tags: category };
      }
      return {
        ...base,
        type: block.type,
        width: block.width || 12,
        content,
      };
    }
  });
};

const transformBlocksFromBackend = (forms) => {
  return (forms || []).map((form) => {
    if (form.type === "columns") {
      const content = form.content || {};
      const columns = (content.columns || []).map((col) => ({
        width: col.size || col.width || 6,
        children: transformBlocksFromBackend(col.children || []),
      }));

      return {
        id: generateBlockId(),
        type: "columns",
        width: form.width || 12,
        content: { columns },
        _dbId: form.id || null,
      };
    }

    if (form.type === "row") {
      const children = transformBlocksFromBackend(form.content || []);
      return {
        id: generateBlockId(),
        type: "columns",
        width: form.width || 12,
        content: { columns: [{ size: 12, children }] },
        _dbId: form.id || null,
      };
    }

    if (form.type === "carousel") {
      const content = form.content || {};
      const slides = (content.slides || []).map((slide) => ({
        children: transformBlocksFromBackend(slide.children || []),
      }));
      return {
        id: generateBlockId(),
        type: "carousel",
        width: form.width || 12,
        content: { ...content, slides },
        _dbId: form.id || null,
      };
    }

    let content = form.content;

    if (form.type === "html") {
      if (typeof content === "string") {
        try {
          content = JSON.parse(content);
        } catch {
          content = { body: content };
        }
      }
      if (typeof content === "object" && content !== null && !content.body) {
        content = {
          body: typeof content === "string" ? content : JSON.stringify(content),
        };
      }
    } else if (
      typeof content === "object" &&
      content !== null &&
      !Array.isArray(content)
    ) {
      const { detail_data, ...rest } = content;
      content = rest;
    }

    if (form.type === "posts" && content && typeof content === "object") {
      if (content.tags && !content.category) {
        content.category = content.tags;
      }
      delete content.tags;
    }

    return {
      id: generateBlockId(),
      type: form.type,
      width: form.width || 12,
      content,
      _dbId: form.id || null,
    };
  });
};

const onSavePage = () => {
  if (!pageTitle.value) {
    $q.notify({
      message: "Page title is required",
      color: "red",
      icon: "warning",
    });
    return;
  }

  $q.dialog({
    title: "Confirm",
    message: pageIdLocal.value
      ? "Do you really want to save this page?"
      : "Do you really want to create this page?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const payload = {
      idRef: pageIdLocal.value || null,
      title: pageTitle.value,
      desc: pageDesc.value,
      forms: transformBlocksToBackend(blocks.value),
      isQuiz: 2,
      setupTraining: {
        containerWidth: pageContainerWidth.value,
        mobileFriendly: pageMobileFriendly.value,
      },
    };

    const data = await postData(
      "post",
      payload,
      "cms/forms",
      false,
      true,
      true
    );

    if (data) {
      if (!pageIdLocal.value && data.id) {
        pageIdLocal.value = data.id;
      }

      if (data.insert && Array.isArray(data.insert)) {
        data.insert.forEach((result, i) => {
          const master = result?.[0]?.data?.master;
          if (master?.id && blocks.value[i]) {
            blocks.value[i]._dbId = master.id;
          }
        });
      }

      $q.dialog({
        title: "Success",
        message: "Page saved successfully. Continue editing?",
        cancel: true,
        persistent: true,
      })
        .onOk(() => {})
        .onCancel(() => {
          emit("save", data);
        });
    }
  });
};

const onPreviewPage = () => {
  previewDialog.value = true;
};

const onPageSettings = () => {
  pageSettingsDialog.value = true;
};

const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    onSavePage();
    return;
  }
  const tag = e.target.tagName;
  const isEditing =
    tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable;
  if (isEditing) return;
  if (e.key === "Delete" && selectedBlock.value) {
    const idx = blocks.value.findIndex((b) => b.id === selectedBlockId.value);
    if (idx !== -1) deleteBlock(idx);
  }
  if (e.key === "Escape") {
    selectedBlockId.value = null;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);

  if (props.mode === "edit" && props.dataPage) {
    loadPageData(props.dataPage);
  }

  getDataTags();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("mousemove", onPropsResizeMove);
  window.removeEventListener("mouseup", onPropsResizeEnd);
});

const getDataTags = async () => {
  try {
    const response = await postData(
      "post",
      {
        filter: [],
        selectAs: {
          value: "pgm_value|string",
          label: "pgm_value|string",
          slug: "pgm_value2|string",
          desc: "pgm_desc|string",
        },
      },
      `portal/gencode/showDetail/FP_POST_TAGS`,
      false,
      false,
      true
    );

    if (response.data) {
      const tags = response.data.map((item) => ({
        value: item.value,
        label: item.label,
        slug: item.slug,
        desc: item.desc,
      }));

      categoryOptions.value = [
        { label: "All Categories", value: "all" },
        ...tags,
      ];
      // return tags;
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to fetch category",
    });
  }
};

watch(
  () => pageTitle.value,
  (val) => {
    if (!pageSlug.value) {
      pageSlug.value = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
  }
);
</script>

<style scoped>
.cms-page-creator {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.widget-palette {
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
}

.widget-palette-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.15s;
}

.widget-palette-item:hover {
  background: #e3f2fd;
  border-color: #90caf9;
}

.canvas-area {
  background: #f5f5f5;
  overflow-y: auto;
  display: flex;
  justify-content: center;
}

.canvas-inner {
  width: 100%;
  max-width: 960px;
  padding: 24px;
  min-height: 100%;
}

.canvas-preview .canvas-inner {
  padding: 0;
}

.canvas-desktop {
  max-width: 960px;
  margin: 0 auto;
}

.canvas-mobile {
  max-width: 375px;
  margin: 0 auto;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}

.canvas-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  border: 2px dashed #ccc;
  border-radius: 12px;
}

.blocks-container {
  min-height: 200px;
}

.block-wrapper {
  border: 2px solid transparent;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: border-color 0.15s;
}

.block-wrapper.block-hover:hover {
  border-color: #90caf9;
}

.block-wrapper.block-selected {
  border-color: #1976d2;
  box-shadow: 0 0 0 1px #1976d2;
}

.block-toolbar {
  padding: 4px 8px;
  background: #e3f2fd;
  border-radius: 6px 6px 0 0;
  min-height: 28px;
}

.drag-handle {
  cursor: move;
}

.block-content {
  padding: 8px;
  background: white;
  border-radius: 0 0 6px 6px;
  min-height: 40px;
}

.ghost-block {
  opacity: 0.4;
  background: #bbdefb;
}

.props-panel {
  position: relative;
  overflow-y: auto;
  border-left: 1px solid #e0e0e0;
}

.props-resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  z-index: 1;
}

.props-resize-handle:hover {
  background: #1976d2;
}

.props-content {
  overflow-y: auto;
  height: calc(100vh - 160px);
}

.fab-add-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  padding: 20px;
}

.preview-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.preview-mobile {
  max-width: 375px;
  margin: 0 auto;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}
</style>

<style>
.column-drop-zone {
  min-height: 60px;
  border: 1px dashed #ccc;
  transition: all 0.2s;
}

.column-drop-zone--edit {
  border-color: #90caf9;
}

.column-drop-zone--empty {
  background: rgba(0, 0, 0, 0.02);
}

.column-drop-zone--edit.sortable-ghost {
  background: #bbdefb;
  opacity: 0.4;
}

.nested-block-wrapper {
  border: 1px solid transparent;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: border-color 0.15s;
}

.nested-block-wrapper:hover {
  border-color: #90caf9;
}

.nested-block-wrapper.nested-block-selected {
  border-color: #1976d2;
}

.nested-block-toolbar {
  padding: 2px 6px;
  background: #e8f5e9;
  border-radius: 4px 4px 0 0;
  font-size: 11px;
  min-height: 22px;
}

.column-empty-hint {
  border: 1px dashed #ccc;
  border-radius: 6px;
  opacity: 0.7;
}
</style>
