<template>
  <div class="full-height">
    <div class="row">
      <div
        class="col-2 text-center cursor-pointer q-pa-md"
        v-for="(file, idx) in files"
        :key="idx"
        @click="clickedFolder(file)"
      >
        <div>
          <q-icon size="13em" color="cyan" name="folder" />
        </div>
        <div>
          <span class="text-h5">{{ file.dfm_folder_name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, ref, onMounted, defineEmits } from "vue";

const selectedFolder = ref([]);
const folderList = ref([]);
const files = ref([]);

const props = defineProps({
  data: Array,
  // ...your custom props
});

onMounted(() => {
  files.value = props.data;
  folderList.value = props.data;
});

const clickedFolder = (val) => {
  selectedFolder.value = val;
  files.value = val.child_folders;
};
</script>
