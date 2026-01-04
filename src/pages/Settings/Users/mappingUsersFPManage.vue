<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="width: 1000px; max-width: 80vw">
      <q-card-section class="q-pt-none">
        <div class="row q-py-md">
          <div class="col text-h5">Manage Frontpage Users</div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col">
            <q-table
              :rows="listMenu"
              :columns="[
                {
                  name: 'label',
                  label: 'Menu Name',
                  field: 'label',
                  align: 'left',
                },
                {
                  name: 'value',
                  label: 'URL',
                  field: 'value',
                  align: 'left',
                },
                {
                  name: 'view_option',
                  label: 'View Data Options',
                  field: 'view_option',
                  align: 'center',
                },
              ]"
              row-key="idx"
              flat
              bordered
              selection="multiple"
              v-model:selected="selectedData"
              :loading="loading"
            >
              <template v-slot:body-cell-view_option="props">
                <q-td :props="props">
                  <q-btn-toggle
                    v-model="props.row.view_option"
                    class="my-custom-toggle"
                    no-caps
                    rounded
                    unelevated
                    toggle-color="primary"
                    color="white"
                    text-color="primary"
                    :options="[
                      { label: 'View all', value: 'all' },
                      { label: 'Own Data', value: 'own' },
                    ]"
                    :disable="props.row.isFrontData == 0"
                  />
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onSubmit()" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import { store } from "quasar/wrappers";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();
const { postData } = apiRequest();

const listMenu = ref([]);
const selectedData = ref([]);
const loading = ref(false);

const props = defineProps({
  selectedUsers: {
    type: Array,
    default: () => [],
  },
  selectedFPMenu: {
    type: Array,
    default: () => [],
  },
  // ...your custom props
});

onMounted(() => {
  console.log("Selected Users:", props.selectedUsers);
  // Inisialisasi data jika diperlukan
  getMenuFP();

  if (props.selectedFPMenu) {
    console.log("Selected FP Menu:", props.selectedFPMenu);
    selectedData.value = props.selectedFPMenu;
  }
});

const getMenuFP = async () => {
  try {
    loading.value = true;
    const response = await postData("get", null, "fpmanager/getFPMenu");
    if (response.data) {
      // Process the response data
      console.log("Front Page Menu Data:", response.data);
      listMenu.value = response.data;
    } else {
      $q.notify({
        type: "negative",
        message: "Failed to load front page menu.",
      });
    }
  } catch (error) {
    console.error("Error fetching front page menu:", error);
    $q.notify({
      type: "negative",
      message: "An error occurred while fetching the front page menu.",
    });
  } finally {
    loading.value = false;
  }
};

const onSubmit = () => {
  console.log(selectedData.value);
  $q.dialog({
    title: "Alert",
    message: "Are you sure want to save the changes?",
    cancel: true,
  }).onOk(async () => {
    // Logic to handle submission
    try {
      loading.value = true;
      const payload = {
        data: {
          pgm_code: "UPDATE_FP",
          pgm_value: {
            value: props.selectedUsers.map((item) => item.email),
            store_separately: true,
          },
          pgm_value2: {
            value: selectedData.value.map((item) => item.idx),
            store_separately: true,
          },
          pgm_value3: {
            value: selectedData.value.map((item) => item.view_option),
            store_separately: true,
          },
          pgm_desc: "For Manage FP",
        },
        keys: {
          pgm_code: "UPDATE_FP",
          pgm_value: {
            value: props.selectedUsers.map((item) => item.email),
            store_separately: true,
          },
          pgm_value2: {
            value: selectedData.value.map((item) => item.idx),
            store_separately: true,
          },
        },
      };

      const response = await postData(
        "post",
        payload,
        "portal/gencode/saveGencode"
      );
      if (response.success) {
        $q.notify({
          type: "positive",
          message: "Settings saved successfully.",
        });
        onDialogOK(selectedData.value);
      } else {
        $q.notify({
          type: "negative",
          message: response.message || "Failed to save settings.",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      $q.notify({
        type: "negative",
        message: "An error occurred while saving settings.",
      });
    } finally {
      loading.value = false;
    }
  });
};
</script>
