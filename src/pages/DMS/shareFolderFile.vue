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
              label="Share outside ?"
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
import { useQuasar, useDialogPluginComponent } from "quasar";
import { useAuthStore } from "src/stores/authStore";
import apiRequest from "src/components/apiRequest";
import extList from "src/components/folders/extList.json";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const { postData } = apiRequest();
const store = useAuthStore();

const props = defineProps({
  root: String,
  idFolder: Array,
  idFiles: Array,
  ddfus_token: String,
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
const rootURL = ref("");

onMounted(async () => {
  rootURL.value = process.env.API_DMS;
  getUsers();
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

    return `${datanya.ddfus_token}/${datanya.id}`;
  }
  // else {
  //   datanya = datas.filter(
  //     (fil) => fil.ddfus_p_u_username === store.authDet.username
  //   )[0];
  // }
};

const getFolderDetail = async (id) => {
  const data = await postData(
    "get",
    null,
    `dms/folderList/list/${store.authDet.username}/${props.root}/${id}`,
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
</script>
