<template>
  <div
    class="post-container"
    :class="{
      'page-full': choosedPages?.setupTraining?.pagePadding,
    }"
  >
    <div v-if="isLoading" class="text-center">
      <q-spinner-dots color="primary" size="40px" />
      <p>Loading Article, please wait...</p>
    </div>
    <template v-else>
      <article v-if="choosedPages && choosedPages.forms" class="content">
        <q-breadcrumbs class="text-grey-6 q-mb-md">
          <q-breadcrumbs-el icon="home" to="/" label="Home" />
          <q-breadcrumbs-el :label="choosedPages.title || 'Article'" />
        </q-breadcrumbs>
        <showComponent
          :key="`${route.params.slug}-${route.params.url}-${refreshKey}`"
          :data="choosedPages.forms"
          v-if="choosedPages.forms[0] && choosedPages.forms[0].id"
          :setup="choosedPages.setupTraining"
          :id="choosedPages.forms[0].id"
          :showFormOnly="true"
          :preventClear="true"
          :removeButton="true"
          :isFullHeight="true"
          :tags="choosedPages.tags ?? []"
          :use-card-separator="true"
          :use-header="true"
          :headers-comp="{
            title: choosedPages.title,
            description: choosedPages.desc,
            author: choosedPages.p_u_username,
            date: choosedPages.created_at,
          }"
          :subscribe-list="choosedPages.subscription"
          :use-comment-section="true"
        />
      </article>
      <div v-else class="error-message">
        <q-icon name="error" color="negative" size="50px" />
        <h4>Oops! Page Not Loaded</h4>
        <p>{{ error }}</p>
        <div class="q-gutter-sm">
          <q-btn
            label="Try Again"
            color="primary"
            unelevated
            icon="refresh"
            @click="fetchPost"
          />
          <q-btn to="/" label="Kembali ke Beranda" color="primary" outline />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import showComponent from "../CMS/Forms/showComponent.vue";
import apiRequest from "src/components/apiRequest";
import { scrollToHashRetry } from "src/components/scrollToSection.js";

import { useFormStore } from "src/stores/formStore";

const { postData } = apiRequest();
const formStore = useFormStore();

// --- STATE MANAGEMENT ---
const route = useRoute(); // Untuk mengakses parameter dari URL
const post = ref(null); // Untuk menyimpan data artikel
const isLoading = ref(true); // Status loading
const error = ref(null); // Untuk menyimpan pesan error

const choosedPages = ref(null);
const refreshKey = ref(0);

defineEmits(["isLoadingChange"]);

// --- FETCH POST ---
// Load-critical: bounded request + a watchdog so a stalled network can never
// leave this page spinning forever (a pending axios request logs nothing).
const REQUEST_TIMEOUT_MS = 20000;
const WATCHDOG_MS = REQUEST_TIMEOUT_MS + 5000;
let watchdog = null;

const clearWatchdog = () => {
  if (watchdog) {
    clearTimeout(watchdog);
    watchdog = null;
  }
};

const startWatchdog = () => {
  clearWatchdog();
  watchdog = setTimeout(() => {
    if (isLoading.value) {
      isLoading.value = false;
      error.value =
        "Request timed out. Please check your internet connection and try again.";
    }
  }, WATCHDOG_MS);
};

const fetchPost = async () => {
  const slug = route.params.slug;
  const url = route.params.url;

  isLoading.value = true;
  error.value = null;
  startWatchdog();

  try {
    const response = await postData(
      "get",
      null,
      `cms/viewBySlug/${url ?? slug}`,
      false,
      false,
      false,
      null,
      false,
      false,
      false,
      REQUEST_TIMEOUT_MS
    );
    choosedPages.value = response?.data?.value || null;
    if (!response) {
      error.value = error.value || "Failed to load this page.";
    }
  } catch (err) {
    console.error("Failed to fetch article:", err);
    error.value = err.message;
  } finally {
    clearWatchdog();
    isLoading.value = false;
    // Deep links like /pages/slug#agenda: blocks render async, so retry
    // until the section exists instead of scrolling once too early.
    if (route.hash) scrollToHashRetry(route.hash);
  }
};

// --- LIFECYCLE HOOK ---
// Panggil fungsi fetchPost() saat komponen pertama kali di-mount (ditampilkan)
onBeforeUnmount(() => {
  clearWatchdog();
});

// Fetch on mount and whenever the routed slug/url changes. `immediate: true`
// covers the first load, so onMounted must NOT fetch again — doing both fired
// two identical viewBySlug requests on every page open.
watch(
  [() => route.params.slug, () => route.params.url],
  ([newSlug, newUrl], [oldSlug, oldUrl]) => {
    if (newSlug !== oldSlug || newUrl !== oldUrl) {
      refreshKey.value++;
      fetchPost();
    }
  },
  { immediate: true }
);

watch(
  () => isLoading.value,
  (newVal) => {
    formStore.setLoadingArticle(newVal);
  }
);

// In-page anchor changes (e.g. clicking a "#section" link or editing the URL).
watch(
  () => route.hash,
  (hash) => {
    if (hash) scrollToHashRetry(hash);
  }
);
</script>

<style scoped>
.post-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
}

.post-container.page-full {
  padding: 0;
}

h1 {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
  line-height: 1.2;
}

.meta {
  color: #666;
  margin-bottom: 2em;
  font-size: 0.9em;
}

.meta span {
  margin-right: 10px;
}

.featured-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 2em;
  object-fit: cover;
}

.content {
  line-height: 1.7;
  font-size: 1.1em;
  color: #333;
}

/* Styling untuk konten dari v-html */
.content :deep(p) {
  margin-bottom: 1em;
}

.content :deep(ul) {
  padding-left: 20px;
  margin-bottom: 1em;
}

.content :deep(strong) {
  color: #000;
}

.error-message {
  text-align: center;
  padding: 40px 20px;
  background-color: #fff3f3;
  border: 1px solid #fdb8b8;
  border-radius: 8px;
  color: #5b2121;
}
</style>
