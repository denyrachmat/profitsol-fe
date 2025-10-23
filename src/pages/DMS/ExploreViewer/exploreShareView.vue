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
            <div class="text-h6">Share Folder / Files</div>
          </div>
          <div class="col text-right">
            <q-toggle v-model="canWrite" color="green" label="Can Edit ?" />
            <q-checkbox
              name="accept_agreement"
              v-model="isSharedOutside"
              label="Share all ?"
              @update:model-value="onUpdateShared"
            />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <q-list bordered style="max-height: 30vh; overflow: auto">
              <q-item v-ripple v-for="(form, idx) in forms" :key="idx">
                <q-item-section avatar>
                  <q-icon
                    color="primary"
                    :name="
                      form.type === 'folder'
                        ? 'folder'
                        : `las ${getIcon(form.name).icon}`
                    "
                  />
                </q-item-section>

                <q-item-section>{{ form.name }}</q-item-section>
                <q-item-section v-if="getTokenAll(form.shared)"
                  >{{ rootURL }}/{{ getTokenAll(form.shared) }}</q-item-section
                >
                <q-item-section side>
                  <div class="q-gutter-xs">
                    <q-btn
                      icon="content_copy"
                      outline
                      color="orange"
                      @click="
                        onClickCopy(`${rootURL}/${getTokenAll(form.shared)}`)
                      "
                      :disable="!getTokenAll(form.shared)"
                    >
                      <q-tooltip>Copy URL to direct download</q-tooltip>
                    </q-btn>
                    <q-btn icon="delete" color="red" @click="onDelete(idx)" />
                  </div>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple v-if="forms.length === 0">
                <q-item-section>No Folder / Files selected</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
        <div class="row q-pt-sm">
          <div class="col">
            <q-table
              title="Select Registered User to Share"
              :rows="rows"
              :columns="cols"
              row-key="email"
              :filter="filterData"
              v-model:selected="selectedTable"
              :selection="isSharedOutside ? 'none' : 'multiple'"
              dense
              @update:selected="onSelectData"
              :loading="loading"
            >
              <template v-slot:top-right>
                <q-input
                  borderless
                  dense
                  debounce="300"
                  v-model="filterData"
                  placeholder="Search"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>
            </q-table>
          </div>
        </div>
        <div class="row q-pt-sm" v-if="isSharedFrontpage">
          <div class="col">
            <q-list bordered class="rounded-borders">
              <q-expansion-item
                expand-separator
                :icon="fp.icon"
                :label="fp.label"
                v-for="(fp, index) in frontPageList"
                :key="index"
              >
                <q-card>
                  <q-card-section>
                    <q-expansion-item
                      expand-separator
                      v-for="formHeader in fp.forms"
                      :key="formHeader.id"
                    >
                      <template v-slot:header>
                        <q-checkbox
                          v-model="formHeader.checked"
                          :label="`Section - ${formHeader.cfm_seq_name}`"
                          @update:model-value="
                            (val) => (formHeader.checked = val)
                          "
                        />
                      </template>
                      <q-card>
                        <q-card-section>
                          <q-list
                            bordered
                            style="max-height: 30vh; overflow: auto"
                          >
                            <q-item
                              v-ripple
                              v-for="(form, idxt) in formHeader.cfm_content
                                .files"
                              :key="idxt"
                            >
                              <q-item-section avatar>
                                <q-icon
                                  color="primary"
                                  :name="
                                    form.type === 'folder'
                                      ? 'folder'
                                      : `las ${getIcon(form.name).icon}`
                                  "
                                />
                              </q-item-section>

                              <q-item-section>{{
                                form.dfm_folder_name
                              }}</q-item-section>
                              <q-item-section v-if="getTokenAll(form.shared)"
                                >{{ rootURL }}/{{
                                  getTokenAll(form.shared)
                                }}</q-item-section
                              >
                              <q-item-section side>
                                <div class="q-gutter-xs">
                                  <q-btn
                                    icon="delete"
                                    color="red"
                                    @click="
                                      onDeleteFrontpageFile(
                                        formHeader,
                                        idxt,
                                        form.dfm_folder_name
                                      )
                                    "
                                  />
                                </div>
                              </q-item-section>
                            </q-item>
                            <q-item
                              clickable
                              v-ripple
                              v-if="forms.length === 0"
                            >
                              <q-item-section
                                >No Folder / Files selected</q-item-section
                              >
                            </q-item>
                          </q-list>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="OK"
          color="primary"
          @click="onOKClick()"
          :disable="forms.length === 0 || selected.length === 0"
        />
        <q-btn flat label="Close Shared" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted, computed } from "vue";
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
  idParent: {
    type: Number,
    default: 0,
  },
  idFolder: Array,
  idFiles: Array,
  ddfus_token: String,
  listData: { type: Array, default: () => [] },
  isUsingList: {
    type: Boolean,
    default: false,
  },
  // ...your custom props
});
const $q = useQuasar();

const forms = ref([]);
const loading = ref(false);

const filterData = ref("");
const rows = ref([]);
const cols = ref([
  {
    name: "username",
    align: "left",
    label: "Username",
    field: "u_username",
    sortable: true,
  },
  {
    name: "email",
    align: "left",
    label: "Email",
    field: "email",
    sortable: true,
  },
  {
    name: "pud_first_name",
    align: "left",
    label: "First Name",
    field: "pud_first_name",
    sortable: true,
  },
  {
    name: "pud_last_name",
    align: "left",
    label: "Last Name",
    field: "pud_last_name",
    sortable: true,
  },
]);
const selected = ref([]);
const selectedTable = ref([]);
const canWrite = ref(false);
const isSharedOutside = ref(false);
const isSharedFrontpage = ref(false);
const rootURL = ref("");
const sharedData = ref([]);

const frontPageList = ref([]);

onMounted(async () => {
  rootURL.value = process.env.API_DMS;

  if (props.isUsingList && props.listData.length > 0) {
    props.listData.map((val) => {
      forms.value.push({
        type: val.type,
        id: val.id,
        name: val.name,
        shared: val.shared,
      });
      sharedData.value.push(val);
    });
    return;
  }

  getUsers();
  getNavAssignedDms();

  console.log(props.idFolder);
  const checkFold = await props.idFolder.map((valFold) => {
    return getFolderDetail(valFold);
  });

  if (checkFold) {
    props.idFiles.map(async (valFiles) => {
      await getFilesDetail(valFiles);
    });
  }
});

const getTokenAll = (datas) => {
  let datanya = null;
  if (datas && datas.length > 0) {
    datanya = datas.filter((fil) => fil.ddfus_p_u_username === "all")[0];

    return datanya && datanya.ddfus_token
      ? `${datanya.ddfus_token}/${datanya.id}`
      : "";
  }
};

const getFolderDetail = async (id) => {
  const data = await postData(
    "get",
    null,
    `dms/folderList/list/${store.authDet.username}/${props.root}/${
      props.idParent
    }/1/${id || 0}`,
    false,
    false,
    true
  );

  if (data.data.child_folders) {
    forms.value.push({
      type: "folder",
      id: id,
      name: data.data.child_folders[0].dfm_folder_name,
    });

    sharedData.value.push(data.data.child_folders[0]);

    return data;
  }
};

const getFilesDetail = async (id) => {
  const data = await postData(
    "get",
    null,
    `dms/documents/${id}`,
    false,
    false,
    true
  );

  if (data) {
    forms.value.push({
      type: "files",
      id: id,
      name: data.data.data.ddm_doc_real_name,
      shared: data.data.data.shared,
    });

    sharedData.value.push(data.data.data);
    console.log(data);
  }
};

const getIcon = (filename) => {
  const splitter = filename.split(".");
  const getfileIcon = extList.filter(
    (fil) => fil.ext === splitter[splitter.length - 1]
  );

  return getfileIcon[0];
};

const getNavAssignedDms = async () => {
  const data = await postData(
    "get",
    null,
    `fpmanager/getNavAssignedDMS`,
    false,
    false,
    true
  );

  if (data) {
    frontPageList.value = data.data;
    console.log(frontPageList.value);
  }
};

const onDelete = (idx) => {
  $q.dialog({
    title: "Delete Folder",
    message: `Are you sure want to remove ${forms.value[idx].name} from list ?`,
    cancel: true,
  }).onOk(() => {
    forms.value.splice(idx, 1);
  });
};

const getUsers = async () => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    "portal/users/ActiveOnly",
    false,
    false,
    true
  );
  if (data) {
    loading.value = false;
    rows.value = data.data;

    if (props.shared && props.shared.length > 0) {
      selected.value = props.shared;
      const checkSelectedTable = rows.value.filter((fil) =>
        props.shared.includes(fil.email)
      );

      selectedTable.value = checkSelectedTable;
      selected.value = props.shared;
    }
  }
};

const onSelectData = (val) => {
  const getEmailOnly = val.map((valMap) => valMap.email);
  selected.value = getEmailOnly;
};

const onUpdateShared = (val) => {
  if (val) {
    selected.value = ["all"];
  } else {
    selected.value = [];
  }
};

const onOKClick = () => {
  $q.dialog({
    title: "Share Folder / Files",
    message: `Are you sure want to share to all choosed users ?`,
    cancel: true,
  }).onOk(async () => {
    const data = await postData(
      "post",
      {
        det: forms.value,
        ddfus_p_u_username: selected.value,
        ddfus_read: 1,
        ddfus_write: canWrite.value,
        ddfus_token: props.ddfus_token,
        isSharedFrontpage: isSharedFrontpage.value,
        frontPageList: frontPageList.value,
        sharedData: sharedData.value,
      },
      `dms/documentsRoots/shareFileFolder`,
      false,
      false,
      true
    );

    if (data) {
      forms.value = [];
      props.idFiles.map(async (valFiles) => {
        await getFilesDetail(valFiles);
      });
    }
  });
};

const onClickCopy = (str) => {
  $q.dialog({
    dark: true,
    title: "Copy",
    message: "Copy below URL ?",
    prompt: {
      model: str,
      type: "text", // optional
      readonly: true,
    },
    cancel: true,
    persistent: true,
  })
    .onOk(async (data) => {
      // console.log('>>>> OK, received', data)
      try {
        await navigator.clipboard.writeText(data);
        $q.notify({
          message: `URL Copied !!`,
          caption: "Copy URL",
          color: "green",
          timeout: 3000,
        });
      } catch (e) {
        $q.notify({
          message: `Failed to copy text: ${e}`,
          caption: "Copy URL",
          color: "red",
          timeout: 3000,
        });
        console.error("Failed to copy text: ", e);
        copySuccess.value = false;
      }
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
};

const onDeleteFrontpageFile = (formHeader, idxt, name) => {
  $q.dialog({
    title: "Delete Folder",
    message: `Are you sure want to remove ${name} from list ?`,
    cancel: true,
  }).onOk(async () => {
    formHeader.cfm_content.files.splice(idxt, 1);
  });
};
</script>
