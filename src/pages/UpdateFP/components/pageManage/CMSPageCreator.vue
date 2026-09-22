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
            <q-item clickable v-close-popup @click="aiDialog = true">
              <q-item-section avatar
                ><q-icon name="auto_awesome"
              /></q-item-section>
              <q-item-section>AI Assistant</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onHeaderSetup">
              <q-item-section avatar
                ><q-icon name="web_asset"
              /></q-item-section>
              <q-item-section>Header Setup (domain)</q-item-section>
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

      <q-select
        v-if="previewMode !== 'mobile'"
        v-model="canvasWidth"
        :options="canvasWidthOptions"
        label="Canvas Width"
        dense
        outlined
        emit-value
        map-options
        class="q-ml-md"
        style="width: 150px"
      />

      <q-btn
        flat
        round
        dense
        icon="undo"
        color="grey-8"
        class="q-ml-md"
        :disable="!canUndo"
        @click="undo"
      >
        <q-tooltip>Undo (Ctrl + Z)</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="redo"
        color="grey-8"
        :disable="!canRedo"
        @click="redo"
      >
        <q-tooltip>Redo (Ctrl + Shift + Z)</q-tooltip>
      </q-btn>

      <q-btn
        flat
        no-caps
        color="green"
        icon="save"
        label="Save"
        class="q-ml-sm"
        @click="onSavePage"
        :disable="!pageTitle"
      >
        <q-badge
          v-if="hasUnsavedChanges"
          color="orange"
          floating
          rounded
        />
        <q-tooltip v-if="hasUnsavedChanges">Unsaved changes</q-tooltip>
      </q-btn>
    </q-toolbar>

    <q-separator />

    <div class="row no-wrap" style="height: calc(100vh - 110px)">
      <!-- Left: Widget Palette (only in edit mode) -->
      <div
        v-if="previewMode === 'edit'"
        class="widget-palette bg-grey-1"
        style="width: 220px; min-width: 220px"
      >
        <q-tabs
          v-model="leftPanelTab"
          dense
          no-caps
          class="text-grey-7"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="widgets" icon="widgets" label="Widgets" />
          <q-tab name="outline" icon="account_tree" label="Outline" />
        </q-tabs>
        <q-separator />
        <div v-if="leftPanelTab === 'widgets'" class="q-px-sm q-pt-sm q-pb-sm">
          <q-input
            v-model="widgetSearch"
            dense
            outlined
            clearable
            debounce="0"
            placeholder="Search widget…"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <template v-if="leftPanelTab === 'widgets'">
          <draggable
            tag="div"
            :list="filteredWidgetCatalog"
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
          <div
            v-if="filteredWidgetCatalog.length === 0"
            class="text-caption text-grey-5 q-pa-sm"
          >
            No widget found
          </div>
        </template>

        <!-- Outline tree -->
        <div v-else class="outline-panel q-py-xs">
          <div
            v-if="outlineRows.length === 0"
            class="text-caption text-grey-5 q-pa-sm"
          >
            No blocks yet. Add widgets to see the structure.
          </div>
          <template v-for="row in outlineRows" :key="row.key">
            <div
              v-if="row.block"
              class="outline-row row items-center no-wrap cursor-pointer"
              :class="{
                'outline-row--selected': row.block.id === selectedBlockId,
              }"
              :style="{ paddingLeft: 8 + row.depth * 16 + 'px' }"
              @click="selectBlock(row.block)"
            >
              <q-icon
                :name="getBlockMeta(row.block.type).icon"
                :color="getBlockMeta(row.block.type).color"
                size="xs"
                class="q-mr-xs"
              />
              <span class="text-caption ellipsis">
                {{ getBlockMeta(row.block.type).label }}
              </span>
              <q-icon
                v-if="row.block.content?.anchorId"
                name="anchor"
                size="10px"
                color="teal"
                class="q-ml-xs"
              >
                  <q-tooltip>Section: {{ row.block.content.anchorId }}</q-tooltip>
              </q-icon>
            </div>
            <div
              v-else
              class="outline-row outline-row--group row items-center no-wrap"
              :style="{ paddingLeft: 8 + row.depth * 16 + 'px' }"
            >
              <span class="text-caption text-grey-5 text-italic">{{
                row.label
              }}</span>
            </div>
          </template>
        </div>
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
          :style="canvasInnerStyle"
        >
          <!-- Header preview (matches the live frontpage header) -->
          <div v-if="showPreviewHeader" class="preview-header">
            <HeaderBar
              v-if="effectivePreviewHeader && effectivePreviewHeader.enabled"
              :config="effectivePreviewHeader"
            />
            <div
              v-else
              class="preview-header-default row items-center no-wrap q-px-md"
            >
              <q-icon name="home" size="sm" />
              <div class="text-subtitle2 q-ml-sm">Default Header</div>
            </div>
          </div>

          <!-- Empty state (shown inside draggable when no blocks) -->
          <div v-if="blocks.length === 0" class="canvas-empty">
            <q-icon name="widgets" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-5 q-mt-md">
              Drag widgets here to start building
            </div>
            <div class="text-caption text-grey-5 q-mb-md">
              Or pick one from the catalog
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Add your first widget"
              unelevated
              no-caps
              @click="fabMenuOpen = true"
            />
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
                    :responsive="pageMobileFriendly"
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
          <!-- Breadcrumb for nested selections (e.g. Columns › Button) -->
          <div
            v-if="selectedBlockPath.length > 1"
            class="q-px-sm q-py-xs bg-grey-2 text-caption text-grey-7 ellipsis"
          >
            <template v-for="(crumb, ci) in selectedBlockPath" :key="crumb.id">
              <q-icon v-if="ci > 0" name="chevron_right" size="12px" />
              <q-icon
                :name="getBlockMeta(crumb.type).icon"
                :color="getBlockMeta(crumb.type).color"
                size="12px"
                class="q-mx-xs"
              />
              <span
                :class="{
                  'text-weight-bold text-dark':
                    ci === selectedBlockPath.length - 1,
                }"
                >{{ getBlockMeta(crumb.type).label }}</span
              >
            </template>
          </div>
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

            <!-- Shared: section anchor, available on every widget -->
            <q-input
              :model-value="selectedBlock.content?.anchorId || ''"
              @update:model-value="
                (val) => onUpdateAnchorId(val || '')
              "
              label="Section ID"
              hint="Letters, numbers, - and _. Buttons can scroll here (e.g. agenda)."
              dense
              outlined
              clearable
              class="q-mb-sm"
              :rules="[
                (val) =>
                  !val || /^[A-Za-z][A-Za-z0-9_-]*$/.test(val) ||
                  'Must start with a letter; letters, numbers, - and _ only',
              ]"
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

    <!-- Floating Add Widget button (menu so a long catalog never overflows) -->
    <q-btn
      v-if="previewMode === 'edit'"
      fab
      icon="add"
      color="primary"
      class="fab-add-widget"
    >
      <q-tooltip>Add widget</q-tooltip>
      <q-menu
        v-model="fabMenuOpen"
        anchor="top left"
        self="bottom right"
        :offset="[0, 12]"
      >
        <div class="bg-white" style="width: 240px">
          <q-input
            v-model="fabWidgetSearch"
            dense
            outlined
            clearable
            autofocus
            placeholder="Search widget…"
            class="q-pa-sm"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-list dense style="max-height: 320px; overflow-y: auto">
            <q-item
              v-for="widget in filteredFabCatalog"
              :key="widget.type"
              clickable
              v-close-popup
              @click="addBlock(widget.type)"
            >
              <q-item-section avatar>
                <q-icon :name="widget.icon" :color="widget.color" />
              </q-item-section>
              <q-item-section>{{ widget.label }}</q-item-section>
            </q-item>
            <q-item v-if="filteredFabCatalog.length === 0" disable>
              <q-item-section class="text-grey-5"
                >No widget found</q-item-section
              >
            </q-item>
          </q-list>
        </div>
      </q-menu>
    </q-btn>

    <!-- AI Builder Dialog -->
    <q-dialog v-model="aiDialog" persistent>
      <q-card style="min-width: min(520px, 90vw)">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="auto_awesome" color="primary" size="sm" class="q-mr-sm" />
          <div class="text-h6">AI Page Assistant</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <div
            v-if="aiMessages.length === 0"
            class="text-caption text-grey-7 q-mb-sm"
          >
            Describe the page you want. The assistant proposes blocks; apply
            them to the canvas only when you are happy. Applying never saves —
            press Save to persist.
          </div>

          <div
            ref="aiScroll"
            class="q-pa-sm q-mb-sm bg-grey-1 rounded-borders"
            style="max-height: 260px; overflow-y: auto"
          >
            <div
              v-for="(msg, i) in aiMessages"
              :key="i"
              class="q-mb-sm"
              :class="msg.role === 'user' ? 'text-right' : ''"
            >
              <q-chip
                :color="msg.role === 'user' ? 'primary' : msg.failed ? 'negative' : 'green'"
                text-color="white"
                :icon="msg.role === 'user' ? 'person' : msg.failed ? 'error' : 'auto_awesome'"
              >
                {{ msg.role === "user" ? "You" : "Assistant" }}
              </q-chip>
              <div class="text-body2 q-mt-xs" style="white-space: pre-wrap">
                {{ msg.text }}
              </div>
              <div v-if="msg.blocks" class="text-caption text-grey-7">
                Proposed {{ msg.blocks.length }} block(s)
                <template v-if="msg.title"> — "{{ msg.title }}"</template>
              </div>
            </div>
            <div v-if="aiWorking" class="row items-center q-gutter-sm">
              <q-spinner-dots color="primary" size="24px" />
              <span class="text-caption text-grey-7">Generating…</span>
            </div>
            <div
              v-if="!aiWorking && aiMessages.length === 0"
              class="text-caption text-grey-5"
            >
              e.g. “A landing page for our company gathering: hero banner,
              agenda in two columns, location QR code and a registration
              button.”
            </div>
          </div>

          <q-input
            v-model="aiInput"
            type="textarea"
            autogrow
            dense
            outlined
            label="Describe your page (Ctrl+Enter to generate)"
            :disable="aiWorking"
            maxlength="6000"
            counter
            @keydown.ctrl.enter.prevent="onAskAi('replace')"
          />

          <div class="row q-mt-sm q-gutter-sm">
            <q-btn
              color="primary"
              label="Generate"
              icon="auto_awesome"
              :loading="aiWorking"
              :disable="!aiInput.trim()"
              @click="onAskAi('replace')"
            />
            <q-btn
              outline
              color="primary"
              label="Add to page"
              icon="add"
              :loading="aiWorking"
              :disable="!aiInput.trim() || blocks.length === 0"
              @click="onAskAi('append')"
            />
          </div>

          <!-- Rendered proposal preview -->
          <div v-if="lastProposal" class="q-mt-md">
            <q-separator class="q-mb-sm" />
            <div class="row items-center q-mb-xs">
              <div class="text-subtitle2 text-grey-8">
                Proposal preview
                <span class="text-caption text-grey-6">
                  ({{ lastProposal.blocks.length }} block{{
                    lastProposal.blocks.length !== 1 ? "s" : ""
                  }})
                </span>
              </div>
              <q-space />
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                :label="aiShowPreview ? 'Hide' : 'Show'"
                :icon="aiShowPreview ? 'expand_less' : 'expand_more'"
                @click="aiShowPreview = !aiShowPreview"
              />
            </div>
            <div
              v-show="aiShowPreview"
              class="ai-proposal-preview rounded-borders"
            >
              <blockRenderer
                v-for="block in proposalPreviewBlocks"
                :key="block.id"
                :block="block"
                :preview="true"
                :responsive="pageMobileFriendly"
              />
            </div>
            <div class="row q-mt-sm q-gutter-sm">
              <q-btn
                color="secondary"
                label="Apply (replace page)"
                icon="check"
                @click="applyProposal('replace')"
              />
              <q-btn
                outline
                color="secondary"
                label="Apply (add to page)"
                icon="playlist_add"
                @click="applyProposal('append')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
            class="preview-viewport"
            :class="{ 'preview-mobile': dialogPreviewMode === 'mobile' }"
          >
            <div v-if="showPreviewHeaderInDialog" class="preview-header">
              <HeaderBar
                v-if="effectivePreviewHeader && effectivePreviewHeader.enabled"
                :config="effectivePreviewHeader"
              />
              <div
                v-else
                class="preview-header-default row items-center no-wrap q-px-md"
              >
                <q-icon name="home" size="sm" />
                <div class="text-subtitle2 q-ml-sm">Default Header</div>
              </div>
            </div>

            <div :style="previewContainerStyle">
              <blockRenderer
                v-for="block in blocks"
                :key="block.id"
                :block="block"
                :preview="true"
                :responsive="pageMobileFriendly"
              />
            </div>
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
            v-model="pageHeaderMode"
            :options="headerModeOptions"
            label="Page Header"
            dense
            outlined
            emit-value
            map-options
            class="q-mt-sm"
          />
          <div
            v-if="pageHeaderMode === 'custom'"
            class="row items-center q-mt-sm"
          >
            <q-btn
              color="primary"
              outline
              icon="edit"
              label="Edit Custom Header"
              @click="onPageHeaderSetup"
            />
            <span class="text-caption text-grey-7 q-ml-sm">
              {{
                pageHeaderConfig
                  ? "Custom header set for this page"
                  : "No custom header yet"
              }}
            </span>
          </div>
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
          <q-select
            v-model="pagePadding"
            :options="[
              { label: 'Padded (inside card)', value: 'padded' },
              { label: 'Full (edge to edge)', value: 'full' },
            ]"
            label="Page Padding"
            dense
            outlined
            emit-value
            map-options
            class="q-mt-sm"
          />
          <q-toggle
            v-model="pageFullPageSections"
            label="Full-page sections (snap scroll)"
            hint="Each block with a Section ID fills one screen; scrolling snaps between them."
            class="q-mt-sm"
          />
          <q-select
            v-model="pageRoles"
            :options="roleOptions"
            label="Visible to Roles"
            hint="Leave empty to show for everyone. Otherwise only these roles can view this page."
            dense
            outlined
            multiple
            use-chips
            emit-value
            map-options
            option-value="id"
            option-label="rm_role_name"
            :loading="rolesLoading"
            class="q-mt-sm"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.rm_role_name }}</q-item-label>
                  <q-item-label caption>{{
                    scope.opt.rm_role_desc
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn
            flat
            label="Done"
            color="primary"
            @click="pageSettingsDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useQuasar } from "quasar";
import draggable from "vuedraggable";
import apiRequest from "src/components/apiRequest";
import { useAuthStore } from "src/stores/authStore";
import blockRenderer from "./blockRenderer.vue";
import widgetRegistry from "./widgets/widgetRegistry.js";
import { statusOptions, widthOptions } from "./widgets/options.js";
import HeaderBuilder from "../setWebManage/header/HeaderBuilder.vue";
import HeaderBar from "../setWebManage/header/HeaderBar.vue";
import { normalizeHeaderConfig } from "../setWebManage/header/useHeaderConf.js";

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

// Role allowlists can arrive as an array, a JSON string or null. Always hand
// the select an array of string ids so it matches the loaded role options.
const normalizeRoles = (roles) => {
  if (typeof roles === "string") {
    try {
      roles = JSON.parse(roles);
    } catch {
      roles = roles ? [roles] : [];
    }
  }
  return Array.isArray(roles) ? roles.map(String) : [];
};

const pageIdLocal = ref(props.pageId || null);
const pageTitle = ref("");
const pageDesc = ref("");
const pageSlug = ref("");
const pageStatus = ref("draft");
const pageShowHeader = ref(true);
const pageHeaderMode = ref("inherit");
const pageHeaderConfig = ref(null);
const headerModeOptions = [
  { label: "Inherit from domain", value: "inherit" },
  { label: "Custom for this page", value: "custom" },
  { label: "Hidden", value: "hidden" },
];
const pageContainerWidth = ref("contained");
const pageMobileFriendly = ref(false);
const pagePadding = ref("padded");
const pageRoles = ref([]);
const roleOptions = ref([]);
const rolesLoading = ref(false);
const pageFullPageSections = ref(false);
const headerConf = ref(null);
const blocks = ref([]);
const selectedBlockId = ref(null);
// True when canvas differs from the last loaded/saved server state.
// Deletes are local-only until Save — this dot reminds the user to save.
const hasUnsavedChanges = ref(false);
// Fresh server snapshot after save; Open... prefers it over the stale prop.
const lastSavedSnapshot = ref(null);
const suspendDirty = ref(false);

// Any canvas/title mutation marks the page dirty (deletes included —
// they only persist after Save + server delete-sync).
watch(
  [blocks, pageTitle, pageDesc, pageRoles, pageFullPageSections],
  () => {
    if (suspendDirty.value) {
      suspendDirty.value = false;
      return;
    }
    hasUnsavedChanges.value = true;
  },
  { deep: true }
);

// Undo/redo history. Snapshots are JSON of the blocks array; commits are
// debounced so a drag or a burst of typing collapses into one step.
const HISTORY_LIMIT = 60;
const undoStack = ref([]);
const redoStack = ref([]);
const canUndo = computed(() => undoStack.value.length > 0);
const canRedo = computed(() => redoStack.value.length > 0);
let committedSnapshot = "[]";
let historyTimer = null;
let applyingHistory = false;

const commitHistory = () => {
  const snap = JSON.stringify(blocks.value);
  if (snap === committedSnapshot) return;
  undoStack.value.push(committedSnapshot);
  if (undoStack.value.length > HISTORY_LIMIT) undoStack.value.shift();
  redoStack.value = [];
  committedSnapshot = snap;
};

const flushHistory = () => {
  if (!historyTimer) return;
  clearTimeout(historyTimer);
  historyTimer = null;
  commitHistory();
};

watch(
  blocks,
  () => {
    if (applyingHistory) return;
    clearTimeout(historyTimer);
    historyTimer = setTimeout(() => {
      historyTimer = null;
      commitHistory();
    }, 400);
  },
  { deep: true }
);

const applySnapshot = (snap) => {
  applyingHistory = true;
  blocks.value = JSON.parse(snap);
  committedSnapshot = snap;
  if (
    selectedBlockId.value &&
    !findBlockById(selectedBlockId.value, blocks.value)
  ) {
    selectedBlockId.value = null;
  }
  nextTick(() => {
    applyingHistory = false;
  });
};

const undo = () => {
  flushHistory();
  const prev = undoStack.value.pop();
  if (prev === undefined) return;
  redoStack.value.push(committedSnapshot);
  applySnapshot(prev);
};

const redo = () => {
  flushHistory();
  const next = redoStack.value.pop();
  if (next === undefined) return;
  undoStack.value.push(committedSnapshot);
  applySnapshot(next);
};

const resetHistory = () => {
  clearTimeout(historyTimer);
  historyTimer = null;
  undoStack.value = [];
  redoStack.value = [];
  committedSnapshot = JSON.stringify(blocks.value);
};

const propsPanelOpen = ref(true);
const propsPanelWidth = ref(340);
const previewMode = ref("edit");
const canvasWidth = ref("fill");
const canvasWidthOptions = [
  { label: "Fill", value: "fill" },
  { label: "1440 px", value: "1440px" },
  { label: "1280 px", value: "1280px" },
  { label: "1024 px", value: "1024px" },
  { label: "768 px", value: "768px" },
];
const canvasInnerStyle = computed(() =>
  canvasWidth.value === "fill"
    ? undefined
    : { maxWidth: canvasWidth.value, margin: "0 auto" }
);
const fabMenuOpen = ref(false);
const leftPanelTab = ref("widgets");
const previewDialog = ref(false);
const dialogPreviewMode = ref("desktop");
const pageSettingsDialog = ref(false);
const aiDialog = ref(false);
const aiInput = ref("");
const aiWorking = ref(false);
const aiMessages = ref([]);
const lastProposal = ref(null);
const aiScroll = ref(null);
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
    if (b.type === "container" && b.content.children?.length) {
      const found = findBlockById(id, b.content.children);
      if (found) return found;
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

const normalizeAnchorId = (val) => {
  const raw = String(val || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+/, "");
  return /^[a-z]/.test(raw) ? raw : "";
};

const onUpdateAnchorId = (val) => {
  if (!selectedBlock.value) return;
  const clean = normalizeAnchorId(val);
  if (!selectedBlock.value.content) selectedBlock.value.content = {};
  selectedBlock.value.content.anchorId = clean || null;
};

const widgetCatalog = ref(
  Object.entries(widgetRegistry)
    .map(([type, def]) => ({
      type,
      ...def.meta,
    }))
    .sort((a, b) => (a.label || a.type).localeCompare(b.label || b.type))
);

const widgetSearch = ref("");

const filteredWidgetCatalog = computed(() => {
  const query = widgetSearch.value.trim().toLowerCase();
  if (!query) return widgetCatalog.value;
  return widgetCatalog.value.filter((w) =>
    (w.label || w.type).toLowerCase().includes(query)
  );
});

const fabWidgetSearch = ref("");
const filteredFabCatalog = computed(() => {
  const query = fabWidgetSearch.value.trim().toLowerCase();
  if (!query) return widgetCatalog.value;
  return widgetCatalog.value.filter((w) =>
    (w.label || w.type).toLowerCase().includes(query)
  );
});

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
  selectedBlockId.value = blocks.value[blocks.value.length - 1].id;
};

// Flattened tree of the canvas for the Outline tab. Group rows (column /
// slide headers) have no block and are not selectable.
const outlineRows = computed(() => {
  const rows = [];
  const walk = (list, depth) => {
    for (const b of list) {
      rows.push({ key: b.id, block: b, depth });
      if (b.type === "columns" && b.content?.columns) {
        b.content.columns.forEach((col, ci) => {
          rows.push({
            key: `grp-${b.id}-col-${ci}`,
            block: null,
            depth: depth + 1,
            label: `Column ${ci + 1}`,
          });
          walk(col.children || [], depth + 2);
        });
      } else if (b.type === "container" && b.content?.children) {
        walk(b.content.children, depth + 1);
      } else if (b.type === "carousel" && b.content?.slides) {
        b.content.slides.forEach((slide, si) => {
          rows.push({
            key: `grp-${b.id}-slide-${si}`,
            block: null,
            depth: depth + 1,
            label: `Slide ${si + 1}`,
          });
          walk(slide.children || [], depth + 2);
        });
      }
    }
  };
  walk(blocks.value, 0);
  return rows;
});

// Root-to-selected block path for the properties panel breadcrumb.
const selectedBlockPath = computed(() => {
  if (!selectedBlockId.value) return [];
  const path = [];
  const walk = (list, trail) => {
    for (const b of list) {
      const t = [...trail, b];
      if (b.id === selectedBlockId.value) {
        path.push(...t);
        return true;
      }
      const childSets = [];
      if (b.type === "columns" && b.content?.columns) {
        b.content.columns.forEach((c) => childSets.push(c.children || []));
      }
      if (b.type === "container" && b.content?.children) {
        childSets.push(b.content.children);
      }
      if (b.type === "carousel" && b.content?.slides) {
        b.content.slides.forEach((s) => childSets.push(s.children || []));
      }
      for (const set of childSets) {
        if (walk(set, t)) return true;
      }
    }
    return false;
  };
  walk(blocks.value, []);
  return path;
});

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
  const label = getBlockMeta(block.type).label;
  $q.notify({
    message: `${label} deleted`,
    color: "dark",
    icon: "delete",
    timeout: 5000,
    actions: [
      {
        label: "Undo",
        color: "white",
        handler: () => undo(),
      },
    ],
  });
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
  } else if (parentBlock.type === "container") {
    if (parentBlock.content.children !== children) {
      parentBlock.content.children = children;
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
    if (
      block.type === "container" &&
      block.content.children?.some((c) => c.id === blockId)
    ) {
      return block;
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
    if (deep.containerBlock) {
      const children = deep.containerBlock.content.children || [];
      const idx = children.findIndex((b) => b.id === blockId);
      if (idx !== -1) {
        if (selectedBlockId.value === blockId) selectedBlockId.value = null;
        children.splice(idx, 1);
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
  } else if (parentColumnsBlock.type === "container") {
    const children = parentColumnsBlock.content.children || [];
    const idx = children.findIndex((b) => b.id === blockId);
    if (idx !== -1) {
      if (selectedBlockId.value === blockId) selectedBlockId.value = null;
      children.splice(idx, 1);
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
    } else if (b.type === "container" && b.content?.children) {
      b.content.children.forEach(regenerate);
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
          if (idx !== -1) return { parentBlock: block, colIndex: ci, childIndex: idx, column: col, slide: null, containerBlock: null };
          const deeper = findParentForChild(targetId, col.children);
          if (deeper) return deeper;
        }
      }
    }
    if (block.type === "container" && block.content.children) {
      const idx = block.content.children.findIndex((c) => c.id === targetId);
      if (idx !== -1) return { parentBlock: block, colIndex: 0, childIndex: idx, column: null, slide: null, containerBlock: block };
      const deeper = findParentForChild(targetId, block.content.children);
      if (deeper) return deeper;
    }
    if (block.type === "carousel" && block.content.slides) {
      for (let si = 0; si < block.content.slides.length; si++) {
        const slide = block.content.slides[si];
        if (slide.children) {
          const idx = slide.children.findIndex((c) => c.id === targetId);
          if (idx !== -1) return { parentBlock: block, slideIndex: si, childIndex: idx, column: null, slide, containerBlock: null };
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
    if (p.type === "container") {
      const children = p.content.children || [];
      const idx = children.findIndex((b) => b.id === blockId);
      if (idx === -1) return;
      const clone = cloneBlockWithNewIds(children[idx]);
      children.splice(idx + 1, 0, clone);
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
  } else if (parentInfo.containerBlock) {
    const children = parentInfo.containerBlock.content.children || [];
    const idx = parentInfo.childIndex;
    const clone = cloneBlockWithNewIds(children[idx]);
    children.splice(idx + 1, 0, clone);
    selectedBlockId.value = clone.id;
  } else if (parentInfo.slide) {
    const idx = parentInfo.childIndex;
    const clone = cloneBlockWithNewIds(parentInfo.slide.children[idx]);
    parentInfo.slide.children.splice(idx + 1, 0, clone);
    selectedBlockId.value = clone.id;
  }
};

const onNewPage = () => {
  confirmDiscardChanges("Creating a new page", () => {
    pageIdLocal.value = null;
    pageTitle.value = "";
    pageDesc.value = "";
    pageSlug.value = "";
    pageStatus.value = "draft";
    pageRoles.value = [];
    pageFullPageSections.value = false;
    blocks.value = [];
    selectedBlockId.value = null;
    resetHistory();
    suspendDirty.value = true;
    hasUnsavedChanges.value = false;
    $q.notify({ message: "New page created", color: "green", icon: "check" });
  });
};

const onLoadPage = () => {
  confirmDiscardChanges("Loading page data", () => {
    const src = lastSavedSnapshot.value || props.dataPage;
    if (src) {
      loadPageData(src);
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
  pageStatus.value = data.status || "draft";
  blocks.value = transformBlocksFromBackend(data.forms || []);
  selectedBlockId.value = null;
  // Freshly loaded == in sync with that source. The deep watcher below
  // fires async for this assignment, so arm the guard first.
  suspendDirty.value = true;
  hasUnsavedChanges.value = false;
  resetHistory();

  if (data.setupTraining) {
    if (data.setupTraining.containerWidth) {
      pageContainerWidth.value = data.setupTraining.containerWidth;
    }
    if (data.setupTraining.mobileFriendly !== undefined) {
      pageMobileFriendly.value = !!data.setupTraining.mobileFriendly;
    }
    if (data.setupTraining.showHeader !== undefined) {
      pageShowHeader.value = !!data.setupTraining.showHeader;
    }
    if (data.setupTraining.pagePadding) {
      pagePadding.value = data.setupTraining.pagePadding;
    }
    if (data.setupTraining.pageRoles !== undefined) {
      pageRoles.value = normalizeRoles(data.setupTraining.pageRoles);
    }
    pageFullPageSections.value = !!data.setupTraining.fullPageSections;

    // Per-page header override: { mode: inherit|custom|hidden, config }
    pageHeaderMode.value = "inherit";
    pageHeaderConfig.value = null;
    let headerSetting = data.setupTraining.header || null;
    if (typeof headerSetting === "string") {
      try {
        headerSetting = JSON.parse(headerSetting);
      } catch (e) {
        headerSetting = null;
      }
    }
    if (headerSetting) {
      pageHeaderMode.value = headerSetting.mode || "inherit";
      pageHeaderConfig.value = headerSetting.config || null;
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
    if (clone.type === "container" && clone.content?.children) {
      clone.content = {
        ...clone.content,
        children: deepCloneBlocks(clone.content.children),
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
          ...block.content,
          columns: (block.content.columns || []).map((col) => ({
            size: col.width || 6,
            children: transformBlocksToBackend(col.children || []),
          })),
        },
      };
    } else if (block.type === "container") {
      const { children, ...rest } = block.content || {};
      return {
        ...base,
        type: "container",
        width: block.width || 12,
        content: {
          ...rest,
          children: transformBlocksToBackend(children || []),
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
        content: { ...content, columns },
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

    if (form.type === "container") {
      const content = form.content || {};
      return {
        id: generateBlockId(),
        type: "container",
        width: form.width || 12,
        content: {
          ...content,
          children: transformBlocksFromBackend(content.children || []),
        },
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

// Re-fetch the page from the server and reload the canvas. Makes the
// local state (incl. deletions) exactly match what was persisted.
const refreshFromServer = async () => {
  if (!pageIdLocal.value) return false;
  try {
    const res = await postData(
      "get",
      null,
      `cms/viewByID/${pageIdLocal.value}`
    );
    const page = res?.data?.value;
    if (page) {
      loadPageData(page);
      lastSavedSnapshot.value = page;
      return true;
    }
  } catch (e) {
    console.error("Refresh after save failed:", e);
  }
  return false;
};

const onSavePage = () => {
  if (!pageTitle.value) {    $q.notify({
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
      status: pageStatus.value,
      forms: transformBlocksToBackend(blocks.value),
      isQuiz: 2,
      setupTraining: {
        containerWidth: pageContainerWidth.value,
        mobileFriendly: pageMobileFriendly.value,
        showHeader: pageShowHeader.value,
        pagePadding: pagePadding.value,
        pageRoles: pageRoles.value,
        fullPageSections: pageFullPageSections.value,
        header: {
          mode: pageHeaderMode.value,
          config:
            pageHeaderMode.value === "custom" ? pageHeaderConfig.value : null,
        },
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
      // postData returns the handleResponse envelope
      // { status, data: { insert, id }, message } — unwrap one level.
      const body = data?.data ?? {};

      if (!pageIdLocal.value && body.id) {
        pageIdLocal.value = body.id;
      }

      if (body.insert && Array.isArray(body.insert)) {
        body.insert.forEach((result, i) => {
          const master = result?.[0]?.data?.master;
          if (master?.id && blocks.value[i] && !blocks.value[i]._dbId) {
            blocks.value[i]._dbId = master.id;
          }
        });
      }

      // Re-read the saved page so canvas/_dbIds exactly match the server
      // (deleted blocks are really gone, no stale state for Open...).
      await refreshFromServer();

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

const scrollAiToBottom = () => {
  nextTick(() => {
    const el = aiScroll.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
};

const proposalPreviewBlocks = computed(() =>
  lastProposal.value && Array.isArray(lastProposal.value.blocks)
    ? transformBlocksFromBackend(lastProposal.value.blocks)
    : []
);
const aiShowPreview = ref(true);

const applyProposal = (mode) => {
  const proposal = lastProposal.value;
  if (!proposal || !Array.isArray(proposal.blocks)) return;

  if (mode === "append") {
    blocks.value = [
      ...blocks.value,
      ...transformBlocksFromBackend(proposal.blocks),
    ];
  } else {
    blocks.value = transformBlocksFromBackend(proposal.blocks);
  }

  if (proposal.title && typeof proposal.title === "string") {
    pageTitle.value = proposal.title;
  }

  selectedBlockId.value = null;
  lastProposal.value = null;
  aiMessages.value.push({
    role: "assistant",
    text: "The proposal has been applied to the canvas. Press Save when ready.",
  });
  scrollAiToBottom();
  $q.notify({ color: "positive", message: "AI proposal applied" });
};

const onAskAi = async (mode) => {
  const prompt = aiInput.value.trim();
  if (!prompt || aiWorking.value) return;

  aiMessages.value.push({ role: "user", text: prompt });
  aiInput.value = "";
  aiWorking.value = true;
  lastProposal.value = null;
  scrollAiToBottom();

  const payload = { description: prompt, mode };
  if (mode === "append") {
    payload.blocks = transformBlocksToBackend(blocks.value);
  }

  try {
    const response = await postData("post", payload, "cms/aiPageBuild");

    if (response && response.status === true) {
      const data = response.data || {};
      const blocks = data.blocks;

      if (Array.isArray(blocks) && blocks.length > 0) {
        lastProposal.value = {
          blocks,
          title: data.title,
          mode,
        };
        aiShowPreview.value = true;
        aiMessages.value.push({
          role: "assistant",
          text: "Here is a proposed layout. Check the preview below, then apply it as a replacement or an addition.",
          blocks,
          title: data.title,
        });
      } else {
        aiMessages.value.push({
          role: "assistant",
          text: response.message || "AI returned no blocks.",
          failed: true,
        });
      }
    } else {
      aiMessages.value.push({
        role: "assistant",
        text: response?.message || "AI failed to generate a page.",
        failed: true,
      });
    }
  } catch (error) {
    aiMessages.value.push({
      role: "assistant",
      text: "Something went wrong while calling the AI. Please try again.",
      failed: true,
    });
    console.error(error);
  } finally {
    aiWorking.value = false;
    scrollAiToBottom();
  }
};

const onHeaderSetup = () => {
  // Domain-wide header.
  $q.dialog({
    component: HeaderBuilder,
    persistent: true,
  }).onOk((cfg) => {
    if (cfg) headerConf.value = cfg;
  });
};

const onPageHeaderSetup = () => {
  // Per-page custom header (not persisted here; saved with the page).
  if (pageHeaderMode.value !== "custom") {
    pageHeaderMode.value = "custom";
  }
  $q.dialog({
    component: HeaderBuilder,
    persistent: true,
    componentProps: {
      initialConfig: pageHeaderConfig.value || headerConf.value || undefined,
      persist: false,
    },
  }).onOk((cfg) => {
    if (cfg) {
      pageHeaderConfig.value = cfg;
      hasUnsavedChanges.value = true;
    }
  });
};

const getHeaderConf = async () => {
  try {
    const res = await postData("get", null, "fpmanager/getHeaderConf");
    headerConf.value = res?.data ? normalizeHeaderConfig(res.data) : null;
  } catch (e) {
    headerConf.value = null;
  }
};

// Header preview shows in desktop/mobile preview when the page allows it.
const effectivePreviewHeader = computed(() => {
  if (pageHeaderMode.value === "hidden") return null;
  if (pageHeaderMode.value === "custom") {
    return pageHeaderConfig.value
      ? normalizeHeaderConfig(pageHeaderConfig.value)
      : null;
  }
  return headerConf.value; // inherit from domain (may be null)
});

const showPreviewHeader = computed(
  () =>
    previewMode.value !== "edit" &&
    pageShowHeader.value !== false &&
    pageHeaderMode.value !== "hidden"
);

const showPreviewHeaderInDialog = computed(
  () => pageShowHeader.value !== false && pageHeaderMode.value !== "hidden"
);

const previewContainerStyle = computed(() => {
  const widthMode = pageContainerWidth.value || "contained";
  const pagePad = pagePadding.value || "padded";
  const maxWidth =
    widthMode === "wide" ? "1200px" : widthMode === "full" ? "100%" : "900px";
  const padding =
    widthMode === "full" || pagePad === "full" ? "0" : "0 16px";
  let style = `max-width: ${maxWidth}; margin: 0 auto; padding: ${padding};`;
  if (pageMobileFriendly.value) {
    style += " width: 100%; box-sizing: border-box;";
  }
  return style;
});

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
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
    return;
  }
  if (mod && e.key.toLowerCase() === "y") {
    e.preventDefault();
    redo();
    return;
  }
  if (mod && e.key.toLowerCase() === "d") {
    e.preventDefault();
    duplicateSelectedBlock();
    return;
  }
  if (e.key === "Delete" && selectedBlock.value) {
    deleteSelectedBlock();
  }
  if (e.key === "Escape") {
    selectedBlockId.value = null;
  }
};

const duplicateSelectedBlock = () => {
  if (!selectedBlockId.value) return;
  const idx = blocks.value.findIndex((b) => b.id === selectedBlockId.value);
  if (idx !== -1) {
    duplicateBlock(idx);
    return;
  }
  onDuplicateNestedChild({ blockId: selectedBlockId.value });
};

const deleteSelectedBlock = () => {
  if (!selectedBlockId.value) return;
  const idx = blocks.value.findIndex((b) => b.id === selectedBlockId.value);
  if (idx !== -1) {
    deleteBlock(idx);
    return;
  }
  onDeleteColumnChild({ blockId: selectedBlockId.value });
};

const confirmDiscardChanges = (actionLabel, onConfirm) => {
  if (!hasUnsavedChanges.value) {
    onConfirm();
    return;
  }
  $q.dialog({
    title: "Unsaved changes",
    message: `You have unsaved changes. ${actionLabel} will discard them. Continue?`,
    cancel: true,
    persistent: true,
  }).onOk(onConfirm);
};

const onBeforeUnload = (e) => {
  if (!hasUnsavedChanges.value) return;
  e.preventDefault();
  e.returnValue = "";
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("beforeunload", onBeforeUnload);

  getHeaderConf();
  getRoleOptions();

  if (props.mode === "edit" && props.dataPage) {
    loadPageData(props.dataPage);
  }

  getDataTags();
});

const getRoleOptions = async () => {
  rolesLoading.value = true;
  try {
    const response = await postData(
      "get",
      null,
      "portal/roles",
      false,
      false,
      true
    );
    roleOptions.value = (response?.data || []).map((role) => ({
      ...role,
      id: String(role.id),
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
    roleOptions.value = [];
  } finally {
    rolesLoading.value = false;
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("beforeunload", onBeforeUnload);
  window.removeEventListener("mousemove", onPropsResizeMove);
  window.removeEventListener("mouseup", onPropsResizeEnd);
  clearTimeout(historyTimer);
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
  max-width: 100%;
  padding: 24px;
  min-height: 100%;
}

.canvas-preview .canvas-inner {
  padding: 0;
}

.preview-header {
  margin: 0 0 12px;
  border-radius: 8px;
  overflow: hidden;
}

.canvas-preview .preview-header {
  margin: 0;
  border-radius: 0;
}

.preview-viewport .preview-header {
  margin: 0;
  border-radius: 0;
}

.preview-header-default {
  min-height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
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
}

.outline-panel {
  overflow-y: auto;
}

.outline-row {
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 8px;
  border-radius: 4px;
  margin: 0 4px;
}

.outline-row:not(.outline-row--group):hover {
  background: #e3f2fd;
}

.outline-row--selected {
  background: #bbdefb;
}

.ai-proposal-preview {
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  padding: 8px;
}

.preview-viewport {
  background: #ffffff;
}

.preview-mobile {
  max-width: 375px;
  margin: 0 auto;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}
</style>

<style>
/* Editor-only styles for nested blocks/drop zones. They MUST stay scoped
   under .cms-page-creator: these classes also render on live pages (columns/
   container renderers always emit them), so unscoped rules would leak blue
   hover boxes onto the front page once the editor chunk loads. */
.cms-page-creator .column-drop-zone {
  min-height: 60px;
  border: 1px dashed #ccc;
  transition: all 0.2s;
}

.cms-page-creator .column-drop-zone--edit {
  border-color: #90caf9;
}

.cms-page-creator .column-drop-zone--empty {
  background: rgba(0, 0, 0, 0.02);
}

.cms-page-creator .column-drop-zone--edit.sortable-ghost {
  background: #bbdefb;
  opacity: 0.4;
}

.cms-page-creator .nested-block-wrapper {
  border: 1px solid transparent;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: border-color 0.15s;
}

.cms-page-creator .nested-block-wrapper:hover {
  border-color: #90caf9;
}

.cms-page-creator .nested-block-wrapper.nested-block-selected {
  border-color: #1976d2;
}

.cms-page-creator .nested-block-toolbar {
  padding: 2px 6px;
  background: #e8f5e9;
  border-radius: 4px 4px 0 0;
  font-size: 11px;
  min-height: 22px;
}

.cms-page-creator .column-empty-hint {
  border: 1px dashed #ccc;
  border-radius: 6px;
  opacity: 0.7;
}
</style>
