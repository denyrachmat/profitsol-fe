<template>
  <div>
    <div v-if="block.content.title" class="text-h6 q-mb-sm">
      {{ block.content.title }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="32px" />
      <div class="text-caption text-grey-5 q-mt-sm">Loading files...</div>
    </div>

    <!-- Auth required -->
    <div
      v-else-if="authRequired"
      class="bg-grey-2 rounded q-pa-md text-center text-grey-5"
    >
      <q-icon name="lock" size="32px" />
      <div class="text-caption q-mt-xs">Sign in to Microsoft to view files</div>
      <q-btn
        color="primary"
        label="Sign In"
        size="sm"
        class="q-mt-sm"
        @click="signIn"
        :loading="signingIn"
      />
    </div>

    <template v-else>
      <!-- Sites browse mode: show list of sites first -->
      <div v-if="isSitesBrowseMode && !selectedSite">
        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="32px" />
          <div class="text-caption text-grey-5 q-mt-sm">Loading sites...</div>
        </div>
        <div
          v-else-if="!sitesList.length"
          class="bg-grey-2 rounded q-pa-md text-center text-grey-5"
        >
          <q-icon name="business" size="32px" />
          <div class="text-caption q-mt-xs">No sites found</div>
        </div>
        <template v-else>
          <q-input
            v-model="siteSearchQuery"
            dense
            outlined
            placeholder="Search sites..."
            class="q-mb-sm"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" size="xs" />
            </template>
          </q-input>
          <q-list
            separator
            bordered
            rounded
            style="height: 50em; overflow: auto"
          >
            <q-item
              v-for="site in filteredSites"
            :key="site.id"
            clickable
            v-ripple
            @click="selectSite(site)"
          >
            <q-item-section avatar>
              <q-icon name="business" color="primary" size="32px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ site.displayName || site.name }}
              </q-item-label>
              <q-item-label caption>
                {{ site.webUrl }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        </template>
      </div>

      <!-- File browser (OneDrive / Site / Shared) -->
      <div v-else>
        <!-- Toolbar: breadcrumb + actions -->
        <div class="row items-center q-mb-sm">
          <q-breadcrumbs class="col">
            <q-breadcrumbs-el
              icon="home"
              class="cursor-pointer"
              @click="navigateToRoot"
            />
            <q-breadcrumbs-el
              v-for="(crumb, idx) in breadcrumbs"
              :key="crumb.id"
              :label="crumb.name"
              :class="
                idx < breadcrumbs.length - 1
                  ? 'cursor-pointer text-primary'
                  : ''
              "
              @click="
                idx < breadcrumbs.length - 1 && navigateToFolder(crumb, idx)
              "
            />
          </q-breadcrumbs>
          <div class="row q-gutter-xs items-center">
            <q-input
              v-model="searchQuery"
              dense
              outlined
              placeholder="Filter files..."
              class="search-input"
              clearable
              size="sm"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="xs" />
              </template>
            </q-input>
            <q-input
              v-model="serverSearchQuery"
              dense
              outlined
              placeholder="Search on server..."
              class="search-input"
              clearable
              size="sm"
              @keyup.enter="serverSearch"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_search" size="xs" />
              </template>
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  round
                  icon="search"
                  size="xs"
                  :loading="serverSearching"
                  @click="serverSearch"
                />
              </template>
            </q-input>
            <q-btn
              flat
              round
              dense
              icon="create_new_folder"
              size="sm"
              @click="showCreateFolder"
            >
              <q-tooltip>Create Folder</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="refresh" size="sm" @click="refresh">
              <q-tooltip>Refresh</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-if="!displayFiles.length"
          class="bg-grey-2 rounded q-pa-md text-center text-grey-5"
        >
          <q-icon name="folder_open" size="32px" />
          <div class="text-caption q-mt-xs">{{ searchQuery ? 'No files match your filter' : 'This folder is empty' }}</div>
        </div>

        <!-- List layout -->
        <div v-else-if="block.content.layout !== 'grid'">
          <q-list
            separator
            bordered
            rounded
            style="height: 50em; overflow: auto"
          >
            <q-item
              v-for="file in displayFiles"
              :key="file.id"
              clickable
              v-ripple
              @click="onItemClick(file)"
              @dblclick="onItemDblClick(file)"
              @contextmenu.prevent="showContextMenu($event, file)"
            >
              <q-item-section avatar>
                <q-icon
                  :name="getFileIcon(file)"
                  :color="getFileColor(file)"
                  size="32px"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ file.name }}
                </q-item-label>
                <q-item-label caption>
                  {{ formatSize(file.size) }} ·
                  {{ formatDate(file.lastModifiedDateTime) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="more_vert"
                  size="sm"
                  @click.stop="showContextMenu($event, file)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Grid layout -->
        <div v-else class="row q-col-gutter-md">
          <div
            v-for="file in displayFiles"
            :key="file.id"
            class="col-4"
            @contextmenu.prevent="showContextMenu($event, file)"
          >
            <q-card
              flat
              bordered
              class="cursor-pointer full-height"
              @click="onItemClick(file)"
              @dblclick="onItemDblClick(file)"
            >
              <q-card-section class="text-center q-pa-md">
                <q-icon
                  :name="getFileIcon(file)"
                  :color="getFileColor(file)"
                  size="48px"
                />
                <div class="text-subtitle2 text-weight-medium q-mt-sm ellipsis">
                  {{ file.name }}
                </div>
                <div class="text-caption text-grey-5">
                  {{ formatSize(file.size) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </template>

    <!-- Context menu -->
    <q-menu v-model="contextMenu.show" :target="contextMenu.target">
      <q-list dense style="min-width: 180px; height: 50em; overflow: auto">
        <q-item clickable v-close-popup @click="openItem(contextMenu.item)">
          <q-item-section avatar><q-icon name="open_in_new" /></q-item-section>
          <q-item-section>Open</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="previewItem(contextMenu.item)"
          v-if="!contextMenu.item?.folder"
        >
          <q-item-section avatar><q-icon name="visibility" /></q-item-section>
          <q-item-section>Preview</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="shareItem(contextMenu.item)">
          <q-item-section avatar><q-icon name="share" /></q-item-section>
          <q-item-section>Share</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="renameItem(contextMenu.item)">
          <q-item-section avatar><q-icon name="edit" /></q-item-section>
          <q-item-section>Rename</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup @click="deleteItem(contextMenu.item)">
          <q-item-section avatar
            ><q-icon name="delete" color="negative"
          /></q-item-section>
          <q-item-section class="text-negative">Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <!-- Share dialog -->
    <q-dialog v-model="shareDialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="share" size="sm" class="q-mr-sm" />
          <div class="text-h6">Share "{{ shareDialog.item?.name }}"</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="shareDialog.email"
            label="Email address"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-select
            v-model="shareDialog.role"
            :options="shareRoleOptions"
            label="Permission"
            dense
            outlined
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="Share"
            :loading="shareDialog.loading"
            @click="submitShare"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Preview dialog -->
    <q-dialog v-model="previewDialog.show" full-width full-height>
      <q-card class="column full-height">
        <q-card-section class="row items-center bg-grey-2">
          <q-icon name="visibility" size="sm" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-medium">
            {{ previewDialog.item?.name }}
          </div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="open_in_new"
            @click="openItem(previewDialog.item)"
          />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="col full-height q-pa-none">
          <iframe
            v-if="previewDialog.url"
            :src="previewDialog.url"
            class="full-width full-height"
            style="border: none"
          />
          <div v-else class="text-center text-grey-5 q-pa-lg">
            <q-icon name="broken_image" size="48px" />
            <div class="q-mt-sm">Preview not available</div>
            <q-btn
              color="primary"
              label="Open in new tab"
              class="q-mt-sm"
              @click="openItem(previewDialog.item)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { sharePointService, authHelper } from "src/components/msHelpers";

const props = defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
  selectedBlockId: String,
});

const $q = useQuasar();

const files = ref([]);
const searchQuery = ref("");
const sitesList = ref([]);
const siteSearchQuery = ref("");
const selectedSite = ref(null);
const loading = ref(false);
const authRequired = ref(false);
const signingIn = ref(false);
const breadcrumbs = ref([]);
const currentFolderId = ref("root");
const currentDriveId = ref(null);
const currentSiteId = ref(null);

const contextMenu = ref({ show: false, target: null, item: null });

const filteredFiles = computed(() => {
  if (!searchQuery.value.trim()) return files.value;
  const q = searchQuery.value.toLowerCase();
  return files.value.filter((f) => f.name?.toLowerCase().includes(q));
});

const serverSearchQuery = ref("");
const serverSearchResults = ref(null);
const serverSearching = ref(false);

const serverSearch = async () => {
  const q = serverSearchQuery.value.trim();
  if (!q) {
    serverSearchResults.value = null;
    return;
  }
  serverSearching.value = true;
  try {
    if (isSitesBrowseMode.value && selectedSite.value && currentDriveId.value) {
      const items = await sharePointService.getFolderContents(currentDriveId.value, currentFolderId.value || "root", { search: q });
      serverSearchResults.value = Array.isArray(items) ? items : [];
    } else if (currentDriveId.value) {
      const items = await sharePointService.getFolderContents(currentDriveId.value, currentFolderId.value || "root", { search: q });
      serverSearchResults.value = Array.isArray(items) ? items : [];
    }
  } catch (err) {
    console.error("Server search failed:", err);
    serverSearchResults.value = [];
  }
  serverSearching.value = false;
};

const displayFiles = computed(() => {
  if (serverSearchResults.value !== null) return serverSearchResults.value;
  return filteredFiles.value;
});

watch(searchQuery, () => {
  serverSearchResults.value = null;
});
const shareDialog = ref({
  show: false,
  item: null,
  email: "",
  role: "read",
  loading: false,
});
const previewDialog = ref({ show: false, item: null, url: "" });

const shareRoleOptions = [
  { label: "Can View", value: "read" },
  { label: "Can Edit", value: "write" },
];

const FILE_ICONS = {
  pdf: { icon: "picture_as_pdf", color: "red" },
  doc: { icon: "description", color: "blue" },
  docx: { icon: "description", color: "blue" },
  xls: { icon: "table_chart", color: "green" },
  xlsx: { icon: "table_chart", color: "green" },
  ppt: { icon: "slideshow", color: "orange" },
  pptx: { icon: "slideshow", color: "orange" },
  jpg: { icon: "image", color: "purple" },
  jpeg: { icon: "image", color: "purple" },
  png: { icon: "image", color: "purple" },
  gif: { icon: "image", color: "purple" },
  mp4: { icon: "videocam", color: "deep-purple" },
  mp3: { icon: "music_note", color: "pink" },
  zip: { icon: "folder_zip", color: "amber" },
  txt: { icon: "article", color: "grey" },
  csv: { icon: "table_chart", color: "teal" },
};

const getFileIcon = (file) => {
  if (file.folder) return "folder";
  const ext = file.name.split(".").pop()?.toLowerCase();
  return FILE_ICONS[ext]?.icon || "insert_drive_file";
};

const getFileColor = (file) => {
  if (file.folder) return "amber";
  const ext = file.name.split(".").pop()?.toLowerCase();
  return FILE_ICONS[ext]?.color || "grey";
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const isSiteSource = () =>
  (props.block.content.source || "onedrive") === "site";

const isSitesBrowseMode = computed(
  () => props.block.content.source === "sites"
);

const filteredSites = computed(() => {
  if (!siteSearchQuery.value.trim()) return sitesList.value;
  const q = siteSearchQuery.value.toLowerCase();
  return sitesList.value.filter(
    (s) =>
      s.displayName?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.webUrl?.toLowerCase().includes(q)
  );
});

const fetchSites = async () => {
  loading.value = true;
  sitesList.value = [];
  authRequired.value = false;

  try {
    const account = authHelper.getActiveAccount();
    if (!account) {
      authRequired.value = true;
      loading.value = false;
      return;
    }

    const content = props.block.content;
    const useFilter = content.filterSites && content.sitePatterns?.trim();

    if (useFilter) {
      const patterns = content.sitePatterns
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const results = await Promise.all(
        patterns.map((pattern) => {
          const searchTerm = pattern.replace(/\*/g, "");
          return sharePointService.getMySites(searchTerm || "*");
        })
      );

      const seen = new Set();
      const merged = [];
      for (const list of results) {
        for (const site of list) {
          if (!seen.has(site.id)) {
            seen.add(site.id);
            merged.push(site);
          }
        }
      }
      sitesList.value = merged;
    } else {
      const sites = await sharePointService.getMySites("*");
      sitesList.value = sites || [];
    }
  } catch (err) {
    console.error("Failed to fetch sites:", err);
    if (err.message?.includes("No active account")) {
      authRequired.value = true;
    }
  }
  loading.value = false;
};

const selectSite = async (site) => {
  selectedSite.value = site;
  currentSiteId.value = site.id;

  loading.value = true;
  try {
    const drives = await sharePointService.getDrives(site.id);
    const drive = drives[0];
    if (drive) {
      currentDriveId.value = drive.id;
      const items = await sharePointService.getFolderContents(drive.id, "root");
      files.value = Array.isArray(items) ? items : [];
    }
  } catch (err) {
    console.error("Error loading site contents:", err);
    files.value = [];
  }
  loading.value = false;
};

const fetchFiles = async (folderId = "root") => {
  const content = props.block.content;
  loading.value = true;
  files.value = [];
  authRequired.value = false;

  try {
    const account = authHelper.getActiveAccount();
    if (!account) {
      authRequired.value = true;
      loading.value = false;
      return;
    }

    const source = content.source || "onedrive";

    if (source === "sites" && !selectedSite.value) {
      await fetchSites();
      loading.value = false;
      return;
    }

    if (source === "shared") {
      const result = await sharePointService.getSharedThroughOneDrive();
      files.value = result || [];
      loading.value = false;
      return;
    }

    if (source === "site" && content.siteName) {
      const siteInfo = await sharePointService.getSiteDetails(content.siteName);
      if (siteInfo?.id) {
        currentSiteId.value = siteInfo.id;
        const drives = await sharePointService.getDrives(siteInfo.id);
        const drive = drives[0];
        if (drive) {
          currentDriveId.value = drive.id;
          const items = await sharePointService.getFolderContents(
            drive.id,
            folderId
          );
          files.value = Array.isArray(items) ? items : [];
        }
      }
      loading.value = false;
      return;
    }

    // OneDrive
    let endpoint;
    if (folderId === "root" && !content.folderPath) {
      endpoint = "me/drive/root/children";
    } else if (folderId !== "root") {
      endpoint = `me/drive/items/${folderId}/children`;
    } else {
      endpoint = `me/drive/root:/${encodeURIComponent(
        content.folderPath
      )}:/children`;
    }

    const driveInfo = await sharePointService.makeGraphRequest("me/drive");
    currentDriveId.value = driveInfo.id;

    const response = await sharePointService.makeGraphRequest(endpoint);
    files.value = response.value || [];

    if (folderId === "root" && !content.folderPath) {
      currentFolderId.value = "root";
      breadcrumbs.value = [];
    }
  } catch (err) {
    console.error("Failed to fetch SharePoint files:", err);
    if (err.message?.includes("No active account")) {
      authRequired.value = true;
    }
  }

  loading.value = false;
};

const navigateToFolder = async (folder, idx) => {
  const newBreadcrumbs = breadcrumbs.value.slice(0, idx + 1);
  breadcrumbs.value = newBreadcrumbs;

  const targetId = folder.id;
  currentFolderId.value = targetId;

  loading.value = true;
  try {
    if (isSiteSource() && currentDriveId.value) {
      const items = await sharePointService.getFolderContents(
        currentDriveId.value,
        targetId
      );
      files.value = Array.isArray(items) ? items : [];
    } else {
      const response = await sharePointService.makeGraphRequest(
        `me/drive/items/${targetId}/children`
      );
      files.value = response.value || [];
    }
  } catch (err) {
    console.error("Error navigating folder:", err);
    files.value = [];
  }
  loading.value = false;
};

const navigateToRoot = () => {
  breadcrumbs.value = [];
  currentFolderId.value = "root";
  if (isSitesBrowseMode.value) {
    selectedSite.value = null;
    files.value = [];
    fetchSites();
  } else {
    fetchFiles("root");
  }
};

const refresh = () => {
  if (breadcrumbs.value.length) {
    navigateToFolder(
      breadcrumbs.value[breadcrumbs.value.length - 1],
      breadcrumbs.value.length - 1
    );
  } else {
    fetchFiles(currentFolderId.value);
  }
};

const onItemClick = (file) => {
  // single click — do nothing special
};

const onItemDblClick = (file) => {
  if (file.folder) {
    enterFolder(file);
  } else {
    openItem(file);
  }
};

const enterFolder = async (file) => {
  breadcrumbs.value.push({ id: file.id, name: file.name });
  currentFolderId.value = file.id;
  searchQuery.value = "";
  serverSearchQuery.value = "";
  serverSearchResults.value = null;

  loading.value = true;
  try {
    if (isSiteSource() && currentDriveId.value) {
      const items = await sharePointService.getFolderContents(
        currentDriveId.value,
        file.id
      );
      files.value = Array.isArray(items) ? items : [];
    } else {
      const response = await sharePointService.makeGraphRequest(
        `me/drive/items/${file.id}/children`
      );
      files.value = response.value || [];
    }
  } catch (err) {
    console.error("Error entering folder:", err);
    files.value = [];
  }
  loading.value = false;
};

const openItem = (item) => {
  if (item?.webUrl) {
    window.open(item.webUrl, "_blank");
  }
};

const previewItem = async (item) => {
  if (!item || item.folder) return;
  try {
    if (currentDriveId.value) {
      const result = await sharePointService.getFileFromSharePoint(
        item.id,
        currentDriveId.value,
        "preview"
      );
      if (result?.getUrl) {
        previewDialog.value = { show: true, item, url: result.getUrl };
        return;
      }
    }
    previewDialog.value = { show: true, item, url: "" };
  } catch (e) {
    previewDialog.value = { show: true, item, url: "" };
  }
};

const showContextMenu = (event, item) => {
  contextMenu.value = { show: true, target: event, item };
};

const showCreateFolder = () => {
  $q.dialog({
    title: "Create Folder",
    message: "Enter folder name:",
    prompt: { model: "", type: "text" },
    cancel: true,
    persistent: true,
  }).onOk(async (name) => {
    if (!name) return;
    loading.value = true;
    try {
      const token = await authHelper.acquireTokenSilently([
        "Files.ReadWrite.All",
      ]);
      const parentId = currentFolderId.value || "root";
      let endpoint;
      if (isSiteSource() && currentDriveId.value) {
        endpoint = `https://graph.microsoft.com/v1.0/drives/${currentDriveId.value}/items/${parentId}/children`;
      } else {
        endpoint = `https://graph.microsoft.com/v1.0/me/drive/items/${parentId}/children`;
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          folder: {},
          "@microsoft.graph.conflictBehavior": "fail",
        }),
      });
      if (response.ok) {
        $q.notify({ type: "positive", message: "Folder created" });
        refresh();
      } else {
        const err = await response.json();
        $q.notify({
          type: "negative",
          message: err.error?.message || "Failed to create folder",
        });
      }
    } catch (err) {
      $q.notify({ type: "negative", message: "Error: " + err.message });
    }
    loading.value = false;
  });
};

const deleteItem = (item) => {
  if (!item) return;
  $q.dialog({
    title: "Delete",
    message: `Are you sure you want to delete "${item.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    try {
      const token = await authHelper.acquireTokenSilently([
        "Files.ReadWrite.All",
      ]);
      let endpoint;
      if (isSiteSource() && currentDriveId.value) {
        endpoint = `https://graph.microsoft.com/v1.0/drives/${currentDriveId.value}/items/${item.id}`;
      } else {
        endpoint = `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}`;
      }
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token.accessToken}` },
      });
      if (response.ok || response.status === 204) {
        $q.notify({ type: "positive", message: `"${item.name}" deleted` });
        refresh();
      } else {
        $q.notify({ type: "negative", message: "Failed to delete" });
      }
    } catch (err) {
      $q.notify({ type: "negative", message: "Error: " + err.message });
    }
    loading.value = false;
  });
};

const renameItem = (item) => {
  if (!item) return;
  $q.dialog({
    title: "Rename",
    message: "Enter new name:",
    prompt: { model: item.name, type: "text" },
    cancel: true,
    persistent: true,
  }).onOk(async (newName) => {
    if (!newName || newName === item.name) return;
    loading.value = true;
    try {
      const token = await authHelper.acquireTokenSilently([
        "Files.ReadWrite.All",
      ]);
      let endpoint;
      if (isSiteSource() && currentDriveId.value) {
        endpoint = `https://graph.microsoft.com/v1.0/drives/${currentDriveId.value}/items/${item.id}`;
      } else {
        endpoint = `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}`;
      }
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });
      if (response.ok) {
        $q.notify({ type: "positive", message: "Renamed successfully" });
        refresh();
      } else {
        $q.notify({ type: "negative", message: "Failed to rename" });
      }
    } catch (err) {
      $q.notify({ type: "negative", message: "Error: " + err.message });
    }
    loading.value = false;
  });
};

const shareItem = (item) => {
  if (!item) return;
  shareDialog.value = {
    show: true,
    item,
    email: "",
    role: "read",
    loading: false,
  };
};

const submitShare = async () => {
  const { item, email, role } = shareDialog.value;
  if (!email) {
    $q.notify({ type: "warning", message: "Enter an email address" });
    return;
  }
  shareDialog.value.loading = true;
  try {
    const token = await authHelper.acquireTokenSilently([
      "Files.ReadWrite.All",
    ]);
    let endpoint;
    if (isSiteSource() && currentDriveId.value) {
      endpoint = `https://graph.microsoft.com/v1.0/drives/${currentDriveId.value}/items/${item.id}/createLink`;
    } else {
      endpoint = `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}/createLink`;
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: role === "write" ? "edit" : "view",
        scope: "organization",
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const link = data.link?.webUrl;
      if (link) {
        await navigator.clipboard.writeText(link);
        $q.notify({
          type: "positive",
          message: "Share link copied to clipboard",
        });
      } else {
        $q.notify({ type: "positive", message: "Share link created" });
      }
      shareDialog.value.show = false;
    } else {
      $q.notify({ type: "negative", message: "Failed to create share link" });
    }
  } catch (err) {
    $q.notify({ type: "negative", message: "Error: " + err.message });
  }
  shareDialog.value.loading = false;
};

const signIn = async () => {
  signingIn.value = true;
  try {
    await authHelper.login(["Files.ReadWrite.All"]);
    await fetchFiles();
  } catch (err) {
    console.error("Microsoft sign-in failed:", err);
  }
  signingIn.value = false;
};

onMounted(() => {
  if (!props.editMode || props.preview) {
    if (isSitesBrowseMode.value) {
      fetchSites();
    } else {
      fetchFiles();
    }
  }
});
</script>

<style scoped>
.search-input {
  max-width: 200px;
}
</style>
