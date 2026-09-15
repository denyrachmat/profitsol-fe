<template>
  <div class="q-pa-md q-gutter-md">
    <div class="row">
      <div class="col text-h4">Posts Categorized List</div>
      <div class="col text-right">
        <q-chip
          color="primary"
          text-color="white"
          v-for="tag in decodeBase64(tags)"
          :key="tag"
          >{{ tag }}</q-chip
        >
      </div>
    </div>
    <q-separator />
    <div class="row q-pa-md q-col-gutter-md items-end">
      <div class="col-12">
        <span class="text-h6">Filters</span>
      </div>
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchSubject"
          label="Search Subject"
          dense
          outlined
          clearable
          debounce="400"
        />
      </div>
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchUser"
          label="Search User"
          dense
          outlined
          clearable
          debounce="400"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="searchDate"
          type="input"
          label="Search Date"
          dense
          outlined
          clearable
          debounce="400"
          readonly
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="searchDate" mask="YYYY-MM-DD">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-1">
        <q-btn
          color="primary"
          icon="restart_alt"
          flat
          class="full-width"
          @click="clearSearch"
        >
          <q-tooltip>Clear Filters</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <q-list bordered separator>
          <template v-if="loadingData">
            <q-item>
              <q-item-section>
                <span>Loading Data, please wait...</span>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <template v-if="posts.length === 0">
              <q-item>
                <q-item-section>
                  <span>No posts found for your search</span>
                </q-item-section>
              </q-item>
            </template>
            <template v-else>
              <q-item
                clickable
                v-ripple
                @click="
                  () => {
                    store.setCMSPageChoosed({
                      ...post,
                      type: 'posts',
                    });
                  }
                "
                v-for="(post, postIdx) in posts"
                :key="postIdx"
              >
                <q-item-section class="col-2">
                  <q-skeleton
                    :type="'QToolbar'"
                    v-if="post.loading"
                    style="
                      width: 100%;
                      height: 150px;
                      object-fit: cover;
                      border-radius: 12px;
                    "
                  />
                  <template v-else>
                    <img
                      :src="post.image"
                      style="
                        width: 100%;
                        height: 150px;
                        object-fit: cover;
                        border-radius: 12px;
                      "
                      v-if="post.image"
                    />
                    <img
                      src="~assets/10167807.jpg"
                      style="
                        width: 100%;
                        height: 150px;
                        object-fit: cover;
                        border-radius: 12px;
                      "
                      v-else
                    />
                  </template>
                </q-item-section>

                <q-item-section class="col-10">
                  <q-skeleton
                    :type="'QToolbar'"
                    v-if="post.loading"
                    style="
                      width: 100%;
                      height: 150px;
                      object-fit: cover;
                      border-radius: 12px;
                    "
                  />
                  <template v-else>
                    <q-item-label class="text-h6">
                      {{ post.cfmt_title }}
                    </q-item-label>
                    <q-item-label caption class="text-subtitle2">
                      by
                      <q-chip class="text-caption" color="orange">{{
                        post.p_u_username
                      }}</q-chip>
                      on
                      <q-chip class="text-caption" color="blue">
                        {{ new Date(post.created_at).toLocaleString() }}
                      </q-chip>
                    </q-item-label>
                    <q-item-label class="text-grey">
                      {{ post.desc }}
                    </q-item-label>
                  </template>
                </q-item-section>
              </q-item>
            </template>
          </template>
        </q-list>
      </div>
    </div>
    <div class="row">
      <div class="col q-pa-lg flex flex-center">
        <q-pagination
          v-model="pagination.page"
          :max="pagination.last_page"
          direction-links
          boundary-links
          icon-first="skip_previous"
          icon-last="skip_next"
          icon-prev="fast_rewind"
          icon-next="fast_forward"
          @update:model-value="onChangePage"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import apiRequest from "src/components/apiRequest";
import { useFormStore } from "stores/formStore";

const { postData } = apiRequest();
const route = useRoute();
const tags = ref(route.params.tag || "");
const limit = ref(atob(route.params.limit) || 5);
const orderBy = ref(atob(route.params.orderBy) || "created_at");
const order = ref(atob(route.params.order) || "desc");
const store = useFormStore();
const loadingData = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: limit.value,
  last_page: 5,
});

const posts = ref([]);
const searchSubject = ref("");
const searchUser = ref("");
const searchDate = ref("");
let searchDebounce = null;

onMounted(() => {
  getTags();
});

const decodeBase64 = (str) => {
  try {
    return JSON.parse(atob(str));
  } catch (e) {
    console.error("Invalid base64 string:", str);
    return str; // Return the original string if decoding fails
  }
};

const getTags = async () => {
  loadingData.value = true;
  const orderByObj = {};
  orderByObj[orderBy.value] = order.value;
  const filter = [];

  if (searchSubject.value) {
    filter.push({
      cols: "cfmt_title",
      param: "like",
      value: `%${searchSubject.value}%`,
    });
  }

  if (searchUser.value) {
    filter.push({
      cols: "p_u_username",
      param: "like",
      value: `%${searchUser.value}%`,
    });
  }

  if (searchDate.value) {
    filter.push({
      cols: "created_at",
      param: "like",
      value: `${searchDate.value}%`,
    });
  }

  const response = await postData(
    "post",
    {
      id: "post",
      tags: tags.value,
      filter,
      orderBy: [orderByObj],
      limit: pagination.value.rowsPerPage,
      isPaginated: true,
      page: pagination.value.page,
      isPublisedOnly: true,
    },
    "cms/formsDetail"
  );
  if (response) {
    posts.value = [];

    response.data.forEach(async (val, idx) => {
      posts.value.push({ ...val, loading: true });
      const getDetails = await checkDetail(val);

      posts.value[idx] = getDetails;
    });

    pagination.value = {
      ...pagination.value,
      ...response.pagination,
      page: response.pagination.current_page,
    };

    loadingData.value = false;
  } else {
    loadingData.value = false;
    throw new Error("Failed to fetch forms");
  }
};

const checkDetail = async (data) => {
  const getForms = await postData(
    "get",
    null,
    `cms/viewByID/${data.id}`,
    false,
    false,
    true
  );
  if (getForms && getForms.data.value) {
    // console.log(
    //   "check by col idx",
    //   forms.value[rowsIdx].content[colIdx].postsList[idx]
    // );

    const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    const matches = [
      ...getForms.data.value.forms[0].content[0].content.matchAll(imageRegex),
    ];
    // Decode HTML entities
    const decodeHtmlEntities = (str) => {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = str;
      return textarea.value;
    };

    // Apply decoding to the matched image source
    if (matches.length > 0) {
      const imageSrc = decodeHtmlEntities(matches[0][1]);
      data.image = imageSrc;
    } else {
      data.image = null;
    }

    // Extract content text (first 50 characters)
    const contentRegex = /<[^>]*>|&[^;]+;/g;
    const cleanContent = getForms.data.value.forms[0].content[0].content
      .replace(contentRegex, "")
      .trim();
    data.desc =
      cleanContent.substring(0, 150) + (cleanContent.length > 150 ? "..." : "");

    data.loading = false;

    return data;
  }
};

const onChangePage = (newPage) => {
  console.log("Page changed to:", newPage);
  pagination.value.page = newPage;
  getTags();
};

const clearSearch = () => {
  searchSubject.value = "";
  searchUser.value = "";
  searchDate.value = "";
};

watch([searchSubject, searchUser, searchDate], () => {
  if (searchDebounce) {
    clearTimeout(searchDebounce);
  }

  searchDebounce = setTimeout(() => {
    pagination.value.page = 1;
    getTags();
  }, 400);
});

onBeforeUnmount(() => {
  if (searchDebounce) {
    clearTimeout(searchDebounce);
    searchDebounce = null;
  }
});
</script>
