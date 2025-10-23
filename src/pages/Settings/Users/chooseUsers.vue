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
            <div class="text-h6">Select Registered Users</div>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col">
            <q-table
              flat
              bordered
              title="Registered Users List"
              :rows="rows"
              :columns="columns"
              row-key="username"
              :filter="filter"
              selection="multiple"
              v-model:selected="selected"
              :loading="loading"
              class="my-sticky-header-table"
            >
              <template v-slot:top-right>
                <div class="q-pr-sm">
                  <q-input
                    borderless
                    dense
                    debounce="300"
                    v-model="filter"
                    placeholder="Search"
                  >
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onOKClick()" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();
const { postData } = apiRequest();

const props = defineProps({
  dataProps: Array,
  formatOut: Object,
  // ...your custom props
});

const loading = ref(false);
const rows = ref([]);
const columns = ref([
  {
    name: "username",
    align: "center",
    label: "Username",
    field: "u_username",
    sortable: true,
  },
  {
    name: "email",
    align: "center",
    label: "Email",
    field: "email",
    sortable: true,
  },
  {
    name: "pud_first_name",
    align: "center",
    label: "First Name",
    field: "pud_first_name",
    sortable: true,
  },
  {
    name: "pud_last_name",
    align: "center",
    label: "Last Name",
    field: "pud_last_name",
    sortable: true,
  },
  {
    name: "email_verified_at",
    align: "center",
    label: "Verified Date",
    field: "email_verified_at",
    sortable: true,
  },
  {
    name: "action",
    align: "center",
    label: "Actions",
    field: (row) => row.username,
  },
]);
const filter = ref("");
const selected = ref([]);

onMounted(async () => {
  await getUsers();

  if (props.dataProps && props.dataProps.length > 0) {
    console.log("checking dataProps:", props.dataProps);
    // Filter rows to only include users present in dataProps
    selected.value = rows.value.filter((row) =>
      props.dataProps.some((sel) => sel === row.username)
    );
  }
});

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
  }
};

const onOKClick = () => {
  $q.dialog({
    title: "Alert",
    message: "Are you sure want to choose all this user ?",
    cancel: true,
  }).onOk(async () => {
    let result = [];
    selected.value.map((valSel, idx) => {
      let createOut = {};
      Object.keys(props.formatOut).map((valFormat) => {
        createOut[valFormat] =
          props.formatOut[valFormat] === "idx"
            ? idx
            : props.formatOut[valFormat] === "idx+"
            ? idx + 1
            : Array.isArray(props.formatOut[valFormat])
            ? props.formatOut[valFormat]
                .map((valRes) => valSel[valRes])
                .join(" ")
            : valSel[props.formatOut[valFormat]] ?? props.formatOut[valFormat];
      });

      result.push(createOut);
    });
    onDialogOK({ result: result, data: rows.value });
  });
};
</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 70vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #ff0

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
