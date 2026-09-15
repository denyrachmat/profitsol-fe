<template>
  <div class="q-pa-sm">
    <div class="row no-gutter">
      <div class="col-2 q-pa-sm" v-for="value in props.folders" :key="`folder-${value.id}`">
        <q-card
          :class="
            'my-card text-center cursor-pointer ' +
            (selectedFilesFolder.includes(value.id) ? 'bg-grey-5' : '')
          "
          @contextmenu="(e) => $emit('onRightClick', e, value)"
          @click="
            !props.activateSelected
              ? $emit('onClick', value)
              : selectedFilesFolder.includes(value.id)
              ? selectedFilesFolder.splice(
                  selectedFilesFolder.indexOf(value.id),
                  1
                )
              : selectedFilesFolder.push(value.id)
          "
        >
          <q-badge
            color="red"
            floating
            v-if="props.deleteable"
            class="cursor-pointer"
            @click.stop="
              $emit('onDelete', value);
              selectedFilesFolder.splice(
                selectedFilesFolder.indexOf(value.id),
                1
              );
            "
            style="z-index: 9999999"
          >
            <q-icon name="close" size="sm" />
          </q-badge>
          <q-card-section class="text-left">
            <div class="row">
              <div
                class="col"
                v-if="props.activateSelected && !props.selectFilesOnly"
              >
                <q-checkbox
                  v-model="selectedFilesFolder"
                  color="primary"
                  class="q-mt-xs"
                  :val="value.id"
                ></q-checkbox>
              </div>
            </div>
          </q-card-section>
          <q-icon
            :name="
              value.shared && value.shared.length > 0
                ? 'folder_shared'
                : 'folder'
            "
            size="6em"
            :color="selectedFilesFolder.includes(value.id) ? 'white' : 'cyan'"
            class="q-mt-md q-mb-sm"
          >
            <q-badge color="orange" floating v-if="value.from_sharepoint">
              <q-icon name="ion-logo-windows" size="xs" />
            </q-badge>
          </q-icon>
          <q-card-section class="text-left">
            <div class="text-bold">{{ value.dfm_folder_name }}</div>
            <div class="text-subtitle">
              Created at : {{ new Date(value.created_at).toLocaleString() }}
            </div>
            <div class="text-subtitle">
              Created by : {{ value.p_u_username }}
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-2 q-pa-sm" v-for="value in props.files" :key="`file-${value.id}`">
        <q-card
          :class="
            'my-card text-center cursor-pointer ' +
            (selectedFilesFolder.includes(value.id) ? 'bg-grey-5' : '')
          "
          @click="
            !props.activateSelected
              ? $emit('onClick', value)
              : selectedFilesFolder.includes(value.id)
              ? selectedFilesFolder.splice(
                  selectedFilesFolder.indexOf(value.id),
                  1
                )
              : selectedFilesFolder.push(value.id)
          "
          @contextmenu="(e) => $emit('onRightClick', e, value)"
        >
          <q-card-section
            class="text-left"
            v-if="props.activateSelected && !props.selectFolderOnly"
          >
            <q-checkbox
              v-model="selectedFilesFolder"
              color="primary"
              class="q-mt-xs"
              :val="value.id"
            ></q-checkbox>
          </q-card-section>
          <q-icon
            :name="`las ${getIcon(value.ddm_doc_real_name).icon}`"
            :color="
              selectedFilesFolder.includes(value.id)
                ? 'white'
                : getIcon(value.ddm_doc_real_name).color
            "
            size="5em"
            class="q-mt-md q-mb-sm"
          >
            <q-badge color="orange" floating v-if="value.from_sharepoint">
              <q-icon name="ion-logo-windows" size="xs" />
            </q-badge>
          </q-icon>
          <q-card-section class="text-left">
            <div class="text-bold">{{ value.ddm_doc_real_name }}</div>
            <div class="text-subtitle">
              Created at : {{ new Date(value.created_at).toLocaleString() }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineEmits, watch } from "vue";
import extList from "@/components/folders/extList.json";

const props = defineProps({
  folders: Array,
  files: Array,
  activateSelected: Boolean,
  selectedSites: Object,
  selectFolderOnly: {
    type: Boolean,
    default: false,
  },
  selectFilesOnly: {
    type: Boolean,
    default: false,
  },
  multipleSelect: {
    type: Boolean,
    default: true,
  },
  deleteable: {
    type: Boolean,
    default: false,
  },
  // ...your custom props
});

const selectedFilesFolder = ref([]);

const emit = defineEmits([
  "onClick",
  "onRightClick",
  "onSelectedFilesFolder",
  "onDelete",
]);

const getIcon = (filename) => {
  const splitter = filename.split(".");

  // console.log("Splitter: ", splitter);
  const getfileIcon = extList.filter(
    (fil) => fil.ext === splitter[splitter.length - 1]
  );

  if (getfileIcon.length === 0) {
    return { icon: "la-file-alt", color: "grey" };
  }

  return getfileIcon[0];
};

const isLoading = ref(true);

watch(
  () => selectedFilesFolder.value,
  (newVal, oldVal) => {
    if (!props.multipleSelect && newVal.length > 1) {
      selectedFilesFolder.value = [newVal[newVal.length - 1]];
    }
    // Emit the selected files and folders
    emit("onSelectedFilesFolder", selectedFilesFolder.value);
  },
  { deep: true }
);
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>
