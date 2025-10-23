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
        <div class="text-h6">Mapping DMS Root</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <q-select
              dense
              filled
              label="Choose Root Name"
              v-model="forms.dudrm_source"
              use-input
              input-debounce="500"
              :options="listRoots"
              @filter="
                (val, update, abort) => filterFn(val, update, abort, 'root')
              "
              behavior="dialog"
              option-label="ddrm_desc"
              option-value="ddrm_name"
              map-options
              emit-value
              :loading="loading"
              @update:model-value="(value) => onChooseItem(value)"
            />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <q-table
              title="Registered Users"
              :rows="rows"
              :columns="cols"
              row-key="email"
              :filter="filterData"
              v-model:selected="selectedTable"
              selection="multiple"
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

        {{ selected }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="OK"
          color="primary"
          @click="onOKClick()"
          :loading="loading"
        />
        <q-btn
          flat
          label="Cancel"
          color="red"
          @click="onDialogCancel"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const $q = useQuasar();
const { postData } = apiRequest();

const forms = ref({
  dudrm_source: "",
});
const listRoots = ref([]);
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
const props = defineProps({
  dataEdit: Object,
});

onMounted(() => {
  getUsers();
});

const filterFn = (val, update, abort, fun) => {
  update(async () => {
    if (fun === "root") {
      await getRoot(val);
    }
  });
};

const getRoot = async (val = "") => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `dms/documentsRoot`,
    false,
    false,
    true
  );

  if (data) {
    loading.value = false;
    listRoots.value = data.data;
    console.log(data);
  } else {
    loading.value = false;
  }
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

const onChooseItem = async (val) => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    `dms/documentsRoots/getMapping/${val}`,
    false,
    false,
    true
  );
  if (data) {
    selected.value = data.data;
    const checkSelectedTable = rows.value.filter((fil) =>
      data.data.includes(fil.email)
    );

    selectedTable.value = checkSelectedTable;

    console.log(checkSelectedTable);
    // onSelectData(data.data);
    loading.value = false;
  } else {
    loading.value = false;
  }
};

const onOKClick = () => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to save this mapping Root?`,
    cancel: true,
  }).onOk(async () => {
    loading.value = true;
    const data = await postData(
      "post",
      {
        ddrm_name: forms.value.dudrm_source,
        det: selected.value,
      },
      `dms/documentsRoots/storeMappingRoot`,
      false,
      false,
      true
    );
    if (data) {
      loading.value = false;
      onDialogOK();
    }
  });
};
</script>
