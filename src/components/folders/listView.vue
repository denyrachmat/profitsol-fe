<template>
  <q-list bordered class="rounded-borders">
    <template v-if="props.folders.length > 0">
      <q-item
        clickable
        v-ripple
        v-for="folders in props.folders"
        :key="folders.id"
        @click="() => clickedFolder(folders)"
      >
        <q-item-section avatar>
          <q-icon
            :color="'primary'"
            :name="
              folders.shared && folders.shared.length > 0
                ? 'folder_shared'
                : 'folder'
            "
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ folders.dfm_folder_name }}</q-item-label>
          <q-item-label caption>{{ folders.created_at }}</q-item-label>
          <!-- <q-item-label caption>{{ JSON.stringify(files) }}</q-item-label> -->
        </q-item-section>
      </q-item>
    </template>
    <template v-else>
      <q-item
        clickable
        v-ripple
        v-for="files in props.files"
        :key="files.id"
        @click="clickedFolder(files)"
      >
        <q-item-section avatar>
          <q-icon
            :color="getIcon(files.ddm_doc_real_name).color"
            :name="`las ${getIcon(files.ddm_doc_real_name).icon}`"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ files.ddm_doc_real_name }}</q-item-label>
          <q-item-label caption>{{ files.created_at }}</q-item-label>
          <!-- <q-item-label caption>{{ JSON.stringify(files) }}</q-item-label> -->
        </q-item-section>
      </q-item>
    </template>
  </q-list>
  <!-- <template v-else>
    <template v-if="props.folders.length > 0">
      <q-expansion-item
        expand-separator
        :icon="
          folder.shared && folder.shared.length > 0 ? 'folder_shared' : 'folder'
        "
        :label="folder.dfm_folder_name"
        :caption="JSON.stringify(folder)"
        v-for="folder in props.folders"
        :key="folder.id"
      >
      </q-expansion-item>
    </template>
    <template v-else>
      <q-item
        clickable
        v-ripple
        v-for="files in props.files"
        :key="files.id"
        @click="clickedFolder(files)"
        @contextmenu="(e) => rightClick(e, files)"
      >
        <q-item-section avatar>
          <q-icon :color="'primary'" :name="`las ${'files'}`" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ files.ddm_doc_real_name }}</q-item-label>
          <q-item-label caption>{{ JSON.stringify(files) }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </template> -->
</template>
<script setup>
import { defineProps, ref, onMounted, defineEmits, watch } from "vue";
import extList from "./extList.json";
import listView from "./listView.vue";

const selectedFolder = ref([]);
const selectedFiles = ref([]);
const folderList = ref([]);
const foldersS = ref([]);
const filesS = ref([]);
const generalSelected = ref([]);

const props = defineProps({
  folders: Array,
  files: Array,
  selectedSites: Object,
  isBegin: {
    type: Boolean,
    default: true,
  },
  // ...your custom props
});

const emit = defineEmits([
  "onSelectItem",
  "onMountedDone",
  "onSelectedFileFolder",
  "onSelectedFilesCheck",
  "onRightClickItems",
  "onSelected",
]);

onMounted(() => {
  emit("onMountedDone", true);
  foldersS.value = props.folders;
  filesS.value = props.files;
  folderList.value = props.data;
});

const getIcon = (filename) => {
  const splitter = filename.split(".");
  const getfileIcon = extList.filter(
    (fil) => fil.ext === splitter[splitter.length - 1]
  );

  return getfileIcon[0];
};

watch(
  () => JSON.stringify(selectedFolder.value),
  (val) => {
    // console.log("Selected folders:", JSON.parse(val));
    emit("onSelectedFileFolder", JSON.parse(val));

    const selectedIds = JSON.parse(val);
    const filteredFolders = foldersS.value.filter((folder) =>
      selectedFolder.value.includes(folder.id)
    );

    generalSelected.value = generalSelected.value.filter(
      (item) => item.type !== "folder"
    );

    generalSelected.value = [...generalSelected.value, ...filteredFolders];

    emit("onSelected", generalSelected.value);
  }
);

watch(
  () => JSON.stringify(selectedFiles.value),
  (val) => {
    emit("onSelectedFilesCheck", JSON.parse(val));
    const selectedIds = JSON.parse(val);
    const filteredFiles = filesS.value.filter((file) =>
      selectedFiles.value.includes(file.id)
    );

    generalSelected.value = generalSelected.value.filter(
      (item) => item.type !== "files"
    );

    generalSelected.value = [...generalSelected.value, ...filteredFiles];

    emit("onSelected", generalSelected.value);
  }
);

const clickedFolder = (val) => {
  // selectedFolder.value = val;
  // files.value = val.child_folders;

  emit("onSelectItem", val);
};

const rightClick = (e, val) => {
  emit("onRightClickItems", val);
  e.preventDefault();
};
</script>
