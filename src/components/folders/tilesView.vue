<template>
  <div class="full-height">
    <div class="row">
      <div
        class="col-1 cursor-pointer q-pa-md"
        v-for="(folder, idx) in folders"
        :key="idx"
        @click="clickedFolder(folder)"
      >
        <div class="row">
          <div class="col-4">
            <q-checkbox v-model="selectedFolder" size="xs" :val="folder.id" />
          </div>
        </div>
        <div class="row">
          <div class="col text-center">
            <q-icon size="5em" color="cyan" name="folder" />
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
            />
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
import {
  defineProps,
  ref,
  onMounted,
  useContext,
  defineEmits,
  watch,
} from "vue";
import extList from "./extList.json";

const selectedFolder = ref([]);
const selectedFiles = ref([]);
const folderList = ref([]);
const folders = ref([]);
const files = ref([]);

const props = defineProps({
  folders: Array,
  files: Array,
  // ...your custom props
});

const emit = defineEmits([
  "onSelectItem",
  "onMountedDone",
  "onSelectedFileFolder",
  "onSelectedFilesCheck",
]);

onMounted(() => {
  emit("onMountedDone", true);
  folders.value = props.folders;
  files.value = props.files;
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
    emit("onSelectedFileFolder", JSON.parse(val));
  }
);

watch(
  () => JSON.stringify(selectedFiles.value),
  (val) => {
    emit("onSelectedFilesCheck", JSON.parse(val));
  }
);

const clickedFolder = (val) => {
  // selectedFolder.value = val;
  // files.value = val.child_folders;

  emit("onSelectItem", val);
};
</script>
