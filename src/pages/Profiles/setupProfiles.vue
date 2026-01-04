<template>
  <div class="setup-profiles-container">
    <q-form @submit.prevent="saveProfile" class="profile-form">
      <div class="row q-gutter-md">
        <div class="col">
          <div class="text-h6">Signature</div>
        </div>
        <div class="col-12">
          <q-input
            v-model="profile.signature"
            type="textarea"
            label="Your Signature"
            autogrow
          />
        </div>
      </div>
      <div class="row q-gutter-md q-pt-md">
        <div class="col">
          <div class="text-h6 q-mb-sm">Subscription Options</div>

          <template v-if="loading">
            <q-skeleton type="rect" height="100px" />
          </template>
          <template v-else>
            <template v-for="(cat, idx) in profile.categoryList" :key="idx">
              <div class="text-h6 q-mb-sm">{{ idx }}</div>

              <q-checkbox
                v-model="profile.categoryList[idxDet]"
                :label="idx"
                v-for="(catDet, idxDet) in cat"
                :key="idxDet"
              />
            </template>
          </template>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="row q-gutter-md">
        <div class="col">
          <div class="text-h6">Notification Options</div>
        </div>
        <div class="col-12">
          <q-checkbox
            v-model="profile.subscriptions.emailNotifications"
            label="Email Notifications"
          />
          <q-checkbox
            v-model="profile.subscriptions.newsletter"
            label="Browser Notifications"
          />
          <q-checkbox
            v-model="profile.subscriptions.newsletter"
            label="Teams Notifications (Not implemented yet)"
            disable
          />
        </div>
      </div>

      <q-btn
        type="submit"
        color="primary"
        label="Save Settings"
        class="q-mt-md"
      />
    </q-form>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import apiRequest from "src/components/apiRequest";
import { useQuasar } from "quasar";
import { useAuthStore } from "stores/authStore";

const $q = useQuasar();

const { postData } = apiRequest();
const store = useAuthStore();

const profile = ref({
  signature: "",
  subscriptions: {
    emailNotifications: false,
    newsletter: false,
    productUpdates: false,
  },
  categoryList: {},
});
const loading = ref(false);

onMounted(() => {
  getListSubscriber();
});

const getTypeSubscriber = async () => {
  try {
    const { data } = await postData(
      "post",
      {
        id: "FP_SUBSCRIBE_POSTS",
        selectAs: {
          type: "pgm_value|string",
        },
        filter: {
          pgm_value3: [store.authDet.username, "_ALL"],
          pgm_desc2: "1",
        },
        groupBy: ["pgm_value"],
      },
      `portal/gencode/showDetail/FP_SUBSCRIBE_POSTS`,
      false,
      false,
      true
    );

    if (data) {
      return data.map((item) => item.type);
    }
  } catch (error) {
    console.error("Error fetching subscription types:", error);
  }
};

const getListSubscriber = async () => {
  loading.value = true;

  try {
    const typeData = await getTypeSubscriber();

    typeData.map(async (types) => {
      const { data } = await postData(
        "post",
        {
          id: "FP_SUBSCRIBE_POSTS",
          selectAs: {
            email: "pgm_value3|string",
            status: "pgm_desc2|string",
            type: "pgm_value|string",
            subscriptionDate: "created_at|date:max",
            val: "pgm_value2|array|grouped",
          },
          filter: {
            pgm_value3: [store.authDet.username, "_ALL"],
            pgm_desc2: "1",
            pgm_value: types,
          },
        },
        `portal/gencode/showDetail/FP_SUBSCRIBE_POSTS`,
        false,
        false,
        true
      );

      if (data) {
        profile.value.categoryList = {};

        data.map((item) => {
          item.val.map((subItem) => {
            profile.value.categoryList[types][subItem] = true;
          });
          loading.value = false;
        });

        console.log("Fetched subscription data:", profile.value.categoryList);
      }
    });
  } finally {
    loading.value = false;
  }
};

const saveProfile = () => {
  console.log("Profile saved:", profile.value);
};
</script>
