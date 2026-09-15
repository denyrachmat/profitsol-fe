<template>
  <div class="q-pa-sm">
    <div class="row no-gutter">
      <q-list class="my-card">
        <q-item
          clickable
          :class="
            'cursor-pointer ' +
            (selectedFilesFolder.includes(value.id) ? 'bg-grey-5' : 'bg-white')
          "
          @contextmenu="(e) => $emit('onRightClick', e, value)"
          @dblclick="
            !props.activateSelected
              ? $emit('onClick', value)
              : selectedFilesFolder.includes(value.id)
              ? selectedFilesFolder.splice(
                  selectedFilesFolder.indexOf(value.id),
                  1
                )
              : selectedFilesFolder.push(value.id)
          "
          @click="
            !props.activateSelected
              ? null
              : selectedFilesFolder.includes(value.id)
              ? selectedFilesFolder.splice(
                  selectedFilesFolder.indexOf(value.id),
                  1
                )
              : selectedFilesFolder.push(value.id)
          "
          v-for="value in props.folders"
          :key="`folder-${value.id}`"
        >
          <q-item-section
            v-if="props.activateSelected && !props.selectFilesOnly"
            avatar
          >
            <q-checkbox
              v-model="selectedFilesFolder"
              color="primary"
              class="q-mt-xs"
              :val="value.id"
            ></q-checkbox>
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              :name="
                value.shared && value.shared.length > 0
                  ? 'folder_shared'
                  : 'folder'
              "
              size="2em"
              :color="selectedFilesFolder.includes(value.id) ? 'white' : 'cyan'"
            >
            </q-icon>
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
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-subtitle1 text-bold">
              {{ value.dfm_folder_name }}
            </q-item-label>
            <q-item-label caption>
              Created at : {{ new Date(value.created_at).toLocaleString() }}
            </q-item-label>
            <q-item-label caption>
              Created by : {{ value.p_u_username }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              name="ion-logo-windows"
              size="sm"
              v-if="value.from_sharepoint"
              color="orange"
            >
              <q-tooltip>This folder is from SharePoint</q-tooltip>
            </q-icon>
          </q-item-section>
          <q-item-section
            side
            v-if="value.sent_to_fp && value.sent_to_fp.length > 0"
          >
            <q-btn outline round icon="pageview" color="cyan">
              <q-tooltip> This folder have been sent to Front page </q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>

        <!-- For Files -->
        <q-item
          clickable
          :class="
            'cursor-pointer my-card ' +
            (selectedFilesFolder.includes(value.id) ? 'bg-grey-5' : 'bg-white')
          "
          @contextmenu="(e) => $emit('onRightClick', e, value)"
          @dblclick="
            !props.activateSelected
              ? $emit('onClick', value)
              : selectedFilesFolder.includes(value.id)
              ? selectedFilesFolder.splice(
                  selectedFilesFolder.indexOf(value.id),
                  1
                )
              : selectedFilesFolder.push(value.id)
          "
          @click="
            !props.activateSelected
              ? null
              : selectedFilesFolder.includes(value.id)
              ? selectedFilesFolder.splice(
                  selectedFilesFolder.indexOf(value.id),
                  1
                )
              : selectedFilesFolder.push(value.id)
          "
          v-for="value in props.files"
          :key="`file-${value.id}`"
        >
          <q-item-section
            v-if="props.activateSelected && !props.selectFilesOnly"
            avatar
          >
            <q-checkbox
              v-model="selectedFilesFolder"
              color="primary"
              class="q-mt-xs"
              :val="value.id"
            ></q-checkbox>
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              :name="`las ${getIcon(value.ddm_doc_real_name).icon}`"
              :color="getIcon(value.ddm_doc_real_name).color"
              size="2em"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-subtitle1">
              {{ value.ddm_doc_real_name }}
            </q-item-label>
            <q-item-label caption>
              {{ new Date(value.created_at).toLocaleString() }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              name="ion-logo-windows"
              size="sm"
              v-if="value.from_sharepoint"
              color="orange"
            >
              <q-tooltip>This folder is from SharePoint</q-tooltip>
            </q-icon>
          </q-item-section>
          <q-item-section
            side
            v-if="value.sent_to_fp && value.sent_to_fp.length > 0"
          >
            <q-btn outline round icon="pageview" color="cyan">
              <q-tooltip> This files have been sent to Front page </q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
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
