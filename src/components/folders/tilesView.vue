<template>
  <div class="full-height">
    <div class="row">
      <div
        class="col-1 cursor-pointer q-pa-md"
        v-for="(folder, idx) in folders"
        :key="idx + '_folder'"
        @click="clickedFolder(folder)"
        @contextmenu="(e) => rightClick(e, folder)"
      >
        <div class="row">
          <div class="col-4">
            <q-checkbox v-model="selectedFolder" size="xs" :val="folder.id" />
          </div>
          <div class="col text-right" v-if="folder.from_sharepoint">
            <q-badge color="orange">
              <q-icon name="ion-logo-windows" size="xs" />
            </q-badge>
          </div>
        </div>
        <div class="row">
          <div class="col text-center">
            <q-icon
              size="5em"
              color="cyan"
              :name="
                folder.shared && folder.shared.length > 0
                  ? 'folder_shared'
                  : 'folder'
              "
            />
          </div>
        </div>
        <div>
          <span class="text-bold text-center" style="word-wrap: break-word">{{
            folder.dfm_folder_name
          }}</span>
        </div>
      </div>
      <div
        class="col-1 text-center cursor-pointer q-pa-md"
        v-for="(doc, idx) in files"
        :key="'doc' + idx"
        @click="clickedFolder(doc)"
        @contextmenu="(e) => rightClick(e, doc)"
      >
        <div class="row">
          <div class="col-4">
            <q-checkbox v-model="selectedFiles" size="xs" :val="doc.id" />
          </div>
        </div>
        <div class="row">
          <div class="col text-center">
            <q-icon
              size="5em"
              :color="getIcon(doc.ddm_doc_real_name).color"
              :name="`las ${getIcon(doc.ddm_doc_real_name).icon}`"
            >
              <q-badge
                color="orange"
                align="bottom"
                floating
                v-if="doc.shared.length > 0"
              >
                <q-icon size="15px" color="white" :name="`share`"></q-icon>
              </q-badge>
            </q-icon>
          </div>
        </div>
        <div>
          <span class="text-bold text-center" style="word-wrap: break-word">
            {{ doc.ddm_doc_real_name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, ref, onMounted, defineEmits, watch } from "vue";
import extList from "./extList.json";

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
  console.log(props.selectedSites);

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
