<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw">
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
              ]"
              row-key="idx"
              flat
              bordered
              selection="multiple"
              v-model:selected="selectedData"
            >
            </q-table>
          </div>
        </div>
      </q-card-section>
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

const listMenu = ref([]);
const selectedData = ref([]);

onMounted(() => {
  // Inisialisasi data jika diperlukan
  getMenuFP();
});

const getMenuFP = async () => {
  try {
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
  }
};
</script>
