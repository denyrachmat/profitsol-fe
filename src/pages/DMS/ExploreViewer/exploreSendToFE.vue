<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="q-dialog-plugin bg-white q-pa-md">
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">Send Folders/Files to Front Page</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-list bordered style="max-height: 30vh; overflow: auto">
          <q-item v-ripple v-for="(form, idx) in forms" :key="idx">
            <q-item-section avatar>
              <q-icon
                color="primary"
                :name="
                  form.type === 'folder'
                    ? 'folder'
                    : `las ${getIcon(form.ddm_doc_name).icon}`
                "
              />
            </q-item-section>

            <q-item-section>
              <div v-if="form.editing">
                <q-input
                  v-model="form.editValue"
                  dense
                  autofocus
                  @blur="onEditBlur(form)"
                  @keyup.enter="onEditBlur(form)"
                />
              </div>
              <div v-else @click="form.editing = true" style="cursor: pointer">
                {{
                  form.type === "folder"
                    ? form.dfm_folder_name
                    : form.ddm_doc_name
                }}
              </div>
            </q-item-section>

            <q-item-section side>
              <q-btn
                icon="close"
                round
                dense
                color="red"
                @click="forms.splice(idx, 1)"
              />
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple v-if="forms.length === 0">
            <q-item-section>No Folder / Files selected</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <q-list bordered separator>
          <template v-if="loading">
            <q-item>
              <q-item-section class="text-center">
                <q-spinner color="primary" size="2em" />
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <q-item
              clickable
              v-for="item in frontPageList"
              :key="item.id"
              @click="
                selectedFP.includes(item.id)
                  ? selectedFP.splice(selectedFP.indexOf(item.id), 1)
                  : selectedFP.push(item.id)
              "
            >
              <q-item-section side>
                <q-checkbox
                  v-model="selectedFP"
                  :val="item.id"
                  color="primary"
                />
              </q-item-section>
              <q-item-section avatar>
                <q-icon :name="item.icon" color="blue" />
              </q-item-section>
              <q-item-section>
                <div class="text-h6">{{ item.label }}</div>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-card-section>

      <q-card-section>
        <q-list bordered style="max-height: 20vh; overflow: auto">
          <template v-if="listAssignedFiles.length > 0">
            <q-item v-for="(item, idx) in listAssignedFiles" :key="idx">
              <q-item-section>
                <div class="text-bold">
                  List of files / folder assigned to page
                  {{
                    frontPageList.find((fp) => fp.id === item.formId)?.label ||
                    ""
                  }}
                  :
                </div>
                <q-list bordered separator>
                  <q-item
                    clickable
                    v-for="(file, fIdx) in item.files"
                    :key="fIdx"
                    class="q-pa-xs"
                    v-ripple
                  >
                    <q-item-section avatar>
                      <q-icon
                        name="folder"
                        color="grey"
                        v-if="file.type === 'folder'"
                      />
                      <q-icon
                        :name="`las ${getIcon(file.name || file).icon}`"
                        color="grey"
                        v-else
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{
                          file.type === "folder"
                            ? file.dfm_folder_name
                            : file.ddm_doc_name
                        }}
                      </q-item-label>
                      <q-item-label caption>
                        Created By: {{ file.p_u_username || "N/A" }} <br />
                        Created At:
                        {{
                          new Date(
                            file.created_at || file.ddm_doc_created
                          ).toLocaleString()
                        }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        icon="close"
                        round
                        dense
                        color="red"
                        @click="
                          () => {
                            $q.dialog({
                              title: 'Confirm',
                              message:
                                'Remove this file from the assigned list?',
                              cancel: true,
                              persistent: true,
                            }).onOk(() => {
                              item.files.splice(fIdx, 1);
                            });
                          }
                        "
                        :disable="file.p_u_username != store.authDet.username"
                      >
                        <q-tooltip
                          v-if="file.p_u_username != store.authDet.username"
                        >
                          You can only remove files you have added
                        </q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <q-item>
              <q-item-section>No assigned files found</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="row">
          <div class="col q-gutter-sm">
            <q-checkbox
              v-model="options.createPage"
              label="Create Children page each files (Only affect to files) ?"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          v-close-popup
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="Send"
          color="primary"
          :disable="selectedFP.length === 0 || forms.length === 0"
          @click="onClickSave(selectedFP, forms, options)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted, watch } from "vue";
import { useQuasar, useDialogPluginComponent, is } from "quasar";
import { useAuthStore } from "src/stores/authStore";
import apiRequest from "src/components/apiRequest";
import extList from "src/components/folders/extList.json";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const { postData } = apiRequest();
const store = useAuthStore();

const props = defineProps({
  root: String,
  listSharedData: {
    type: Array,
    default: () => [],
  },
  // ...your custom props
});
const $q = useQuasar();

onMounted(() => {
  getNavAssignedDms();
  // Add editValue property for each form item
  forms.value = props.listSharedData.map((form) => ({
    ...form,
    editValue:
      form.type === "folder" ? form.dfm_folder_name : form.ddm_doc_name,
  }));
});

const frontPageList = ref([]);
const selectedFP = ref([]);
const forms = ref([]);
const listAssignedFiles = ref([]);
const loading = ref(false);
const options = ref({
  createPage: false,
});

// Update the correct field when editing is finished
function onEditBlur(form) {
  if (form.type === "folder") {
    form.dfm_folder_name = form.editValue;
  } else {
    form.ddm_doc_name = form.editValue;
  }
  form.editing = false;
}

const getNavAssignedDms = async () => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `fpmanager/getNavAssignedDMS`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    frontPageList.value = data.data;
    console.log(frontPageList.value);
  } else {
    loading.value = false;
    $q.notify({
      type: "negative",
      message: "Failed to load Front Page list",
    });
  }
};

const getIcon = (filename) => {
  // Ensure filename is a string
  if (!filename || typeof filename !== "string") {
    return { icon: "file" };
  }

  if (!filename.includes(".")) {
    return { icon: "file" };
  }

  const splitter = filename.split(".");
  if (splitter.length === 1) {
    return { icon: "file" }; // Default icon for files without extension
  }

  const getfileIcon = extList.filter(
    (fil) => fil.ext === splitter[splitter.length - 1]
  );

  return getfileIcon[0];
};

const onClickSave = async (selectedFP, forms, options) => {
  const confirmed = await $q
    .dialog({
      title: "Confirmation",
      message:
        "Are you sure you want to send the selected folders/files to the Front Page?",
      cancel: true,
      persistent: true,
    })
    .onOk(async () => {
      console.log("Selected FP: ", selectedFP);
      console.log("Forms: ", forms);
      console.log("Options: ", options);

      const sendData = {
        idPage: selectedFP,
        sharedData: forms,
        options: options,
        userId: store.authDet.username,
        editedShared: listAssignedFiles.value,
      };

      // console.log("Payload to send: ", sendData);

      // saveDMStoFrontPage

      const data = await postData(
        "post",
        sendData,
        `fpmanager/saveDMStoFrontPage`,
        false,
        false,
        true
      );

      if (data) {
        $q.notify({
          type: "positive",
          message: "Success to send to Front Page",
        });
        onDialogOK();

        console.log(data);
      } else {
        $q.notify({
          type: "negative",
          message: "Failed to send to Front Page",
        });
      }
    })
    .onCancel(() => false);

  if (!confirmed) {
    return;
  }
};

watch(
  () => selectedFP.value,
  (val) => {
    let getFP = frontPageList.value.filter((fp) => val.includes(fp.id));

    const collectedFiles = [];
    getFP.forEach((fp) => {
      if (Array.isArray(fp.forms)) {
        fp.forms.forEach((form) => {
          if (form.cfm_content && Array.isArray(form.cfm_content.files)) {
            collectedFiles.push({
              formId: fp.id,
              files: form.cfm_content.files,
            });
          }
        });
      }
    });

    listAssignedFiles.value = collectedFiles;
  },
  { deep: true }
);
</script>
