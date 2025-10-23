<template>
  <div class="q-pa-md">
    <q-card style="height: 90vh">
      <q-card-section>
        <div class="q-pa-md">
          <div class="row">
            <div class="col">
              <div class="text-h6">Front Page Configuration</div>
              <div class="text-subtitle2">
                Configure the navigation, tags, and content for your front page.
              </div>
            </div>
            <div class="col tex-right">
              <q-toggle
                v-model="viewPreview"
                label="Preview Mode"
                color="primary"
              />
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-gutter-md">
          <div :class="viewPreview ? 'col-2' : 'col'">
            <q-list bordered>
              <template v-if="listMenu.length === 0">
                <q-item>
                  <q-item-section>
                    <span class="text-grey">No menu items found.</span>
                  </q-item-section>
                </q-item>
              </template>
              <template v-else>
                <q-item
                  clickable
                  v-ripple
                  v-for="(item, index) in listMenu"
                  :key="index"
                  @click="onClickMenu(item)"
                >
                  <q-item-section avatar>
                    <q-icon color="primary" :name="item.icon" />
                  </q-item-section>

                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </div>
          <div class="col" v-if="viewPreview">
            <fieldset
              style="
                border: 1px solid #ccc !important;
                border-radius: 16px;
                max-height: 73vh;
                overflow: auto;
              "
            >
              <legend>Preview</legend>
              <FrontPageIndex :mode="'edit'" />
            </fieldset>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import listMenuRecurse from "./listMenuRecurse.vue";
import FrontPageIndex from "../Frontpage/FrontPageIndex.vue";
import { useAuthStore } from "stores/authStore";

const { postData } = apiRequest();
const $q = useQuasar();
const authStore = useAuthStore();

onMounted(() => {
  // getMenuFP();
  if (authStore.authDet.is_fpconf) {
    listMenu.value = authStore.authDet.is_fpconf;
  } else {
    getMenuFP();
  }
});

// Mock store for demonstration; replace with your actual store import
const store = {
  getChoosedDomain: ref({
    pd_desc: "Your domain description here",
  }),
};

const listMenu = ref([]);
const viewPreview = ref(false);

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

const onClickMenu = async (item) => {
  try {
    const componentModule = await import(`./${item.value}.vue`);
    $q.dialog({
      component: componentModule.default,
      componentProps: {
        menuItem: item,
      },
      persistent: true,
    })
      .onOk(() => {
        console.log("Dialog confirmed");
      })
      .onCancel(() => {
        console.log("Dialog canceled");
      });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to load the dialog component.",
    });
    console.error("Dialog component load error:", error);
  }
};

function onSubmit() {
  $q.notify({
    type: "positive",
    message: "Front page updated successfully!",
  });
  // Add your submit logic here
}
</script>
