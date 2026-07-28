<template>
  <div>
    <div v-if="block.content.title" class="text-h6 q-mb-sm">
      {{ block.content.title }}
    </div>
    <div v-if="block.content.desc" class="text-subtitle2 text-grey-7 q-mb-md">
      {{ block.content.desc }}
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="32px" />
      <div class="text-caption text-grey-5 q-mt-sm">Loading posts...</div>
    </div>

    <div
      v-else-if="!postsList.length"
      class="bg-grey-2 rounded q-pa-md text-center text-grey-5"
    >
      <q-icon name="post_add" size="32px" />
      <div class="text-caption q-mt-xs">No posts found</div>
    </div>

    <template v-else>
      <!-- Search box -->
      <q-input
        v-model="searchQuery"
        dense
        outlined
        placeholder="Search posts..."
        class="q-mb-md"
        clearable
      >
        <template v-slot:prepend>
          <q-icon name="search" size="xs" />
        </template>
      </q-input>

      <!-- No results -->
      <div
        v-if="!paginatedPosts.length"
        class="bg-grey-2 rounded q-pa-md text-center text-grey-5"
      >
        <q-icon name="search_off" size="32px" />
        <div class="text-caption q-mt-xs">No posts match your search</div>
      </div>

      <!-- List layout -->
      <div v-if="block.content.layout !== 'grid'" class="q-gutter-md">
        <q-card
          v-for="post in paginatedPosts"
          :key="post.id"
          flat
          bordered
          class="cursor-pointer"
          @click="navigateToPost(post)"
        >
          <q-card-section horizontal>
            <q-img
              v-if="post.image"
              :src="post.image"
              class="col-4"
              style="max-height: 140px"
            />
            <div
              v-else
              class="col-4 flex flex-center bg-grey-3 text-grey-7 text-caption text-weight-medium"
              style="max-height: 140px; min-height: 140px"
            >
              No Photo
            </div>
            <q-card-section>
              <div class="text-weight-bold">
                {{ post.title || post.cfmt_title || post.label || "Untitled" }}
              </div>
              <div
                v-if="post.bodyPreview"
                class="text-caption text-grey-7 q-mt-xs"
              >
                {{ post.bodyPreview }}
              </div>
              <div class="text-caption text-grey-5 q-mt-sm">
                {{ formatDate(post.created_at) }}
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>

      <!-- Grid layout as carousel -->
      <q-carousel
        v-else-if="paginatedGridSlides.length"
        v-model="currentSlide"
        transition-prev="scale"
        transition-next="scale"
        swipeable
        animated
        control-color="white"
        navigation
        padding
        arrows
        height="100%"
        class="bg-primary shadow-1 rounded-borders"
      >
        <q-carousel-slide
          v-for="(slide, si) in paginatedGridSlides"
          :name="si"
          :key="si"
        >
          <div class="row q-col-gutter-sm">
            <div
              v-for="post in slide"
              :key="post.id"
              :class="`col-${Math.floor(12 / (block.content.perSlide || 1))}`"
            >
              <q-card
                flat
                bordered
                class="full-height cursor-pointer"
                @click="navigateToPost(post)"
              >
                <q-img
                  v-if="post.image"
                  :src="post.image"
                  ratio="16/9"
                  style="height: 200px; object-fit: cover"
                />
                <div
                  v-else
                  class="flex flex-center bg-grey-3 text-grey-7 text-caption text-weight-medium"
                  style="height: 200px"
                >
                  No Photo provided
                </div>
                <q-card-section>
                  <div class="text-subtitle2 text-weight-bold">
                    {{
                      post.title || post.cfmt_title || post.label || "Untitled"
                    }}
                  </div>
                  <div
                    v-if="post.bodyPreview"
                    class="text-caption text-grey-7 q-mt-xs"
                  >
                    {{ post.bodyPreview }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="row justify-center q-mt-md"
      >
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="7"
          boundary-links
          boundary-numbers
          color="grey-6"
          active-color="primary"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();
const router = useRouter();

const props = defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
  selectedBlockId: String,
});

const emit = defineEmits(["navigate-post"]);

const postsList = ref([]);
const loading = ref(false);
const currentSlide = ref(0);
const searchQuery = ref("");
const currentPage = ref(1);

const pageSize = computed(() => props.block.content.pageSize || 5);

const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) return postsList.value;
  const q = searchQuery.value.toLowerCase();
  return postsList.value.filter((p) => {
    const title = (p.title || p.cfmt_title || p.label || "").toLowerCase();
    const body = (p.bodyPreview || "").toLowerCase();
    return title.includes(q) || body.includes(q);
  });
});

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / pageSize.value));

const paginatedPosts = computed(() => {
  if (props.block.content.layout !== "list") return filteredPosts.value;
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredPosts.value.slice(start, start + pageSize.value);
});

const allGridSlides = computed(() => {
  if (props.block.content.layout !== "grid") return [];
  const perSlide = props.block.content.perSlide || 1;
  const chunked = [];
  for (let i = 0; i < filteredPosts.value.length; i += perSlide) {
    chunked.push(filteredPosts.value.slice(i, i + perSlide));
  }
  return chunked;
});

const paginatedGridSlides = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allGridSlides.value.slice(start, end);
});

const gridSlides = computed(() => allGridSlides.value);

watch(searchQuery, () => {
  currentPage.value = 1;
  currentSlide.value = 0;
});

watch(
  () => gridSlides.value.length,
  (len) => {
    if (len > 0 && currentSlide.value >= len) {
      currentSlide.value = 0;
    }
  }
);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const navigateToPost = (post) => {
  if (post.postUrl) {
    emit("navigate-post", post);
    router.push({
      name: "pages",
      params: { slug: post.postUrl, url: post.postUrl },
    });
  }
};

const extractPostImage = (html) => {
  if (!html) return null;
  const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
  const matches = [...String(html).matchAll(imageRegex)];
  if (matches.length === 0) return null;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = matches[0][1];
  return textarea.value;
};

const extractPostDesc = (html) => {
  if (!html) return "";
  const contentRegex = /<[^>]*>|&[^;]+;/g;
  const clean = String(html).replace(contentRegex, "").trim();
  return clean.substring(0, 150) + (clean.length > 150 ? "..." : "");
};

const truncateToWords = (text, wordCount = 20) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text.trim();
  return words.slice(0, wordCount).join(" ") + "...";
};

const fetchPosts = async () => {
  const content = props.block.content;
  loading.value = true;
  postsList.value = [];

  try {
    const response = await postData(
      "post",
      {
        id: "post",
        tags: btoa(JSON.stringify(content.category || [])),
        orderBy: [
          { [content.orderBy || "created_at"]: content.order || "desc" },
        ],
        limit: content.maxShow || 5,
        isPublisedOnly: 1,
      },
      "cms/formsDetail"
    );

    if (!response) {
      loading.value = false;
      return;
    }

    let filtered = response.filter((item) => item.is_published === 1);

    postsList.value = filtered.map((post, idx) => ({
      ...post,
      title: post.title || post.cfmt_title || post.label || "Untitled",
      postUrl: post.url || String(post.id),
      bodyPreview: truncateToWords(post.desc || ""),
      image: null,
      currentPost: content.mode === "last" && idx === 0 ? post : undefined,
    }));

    loading.value = false;

    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < filtered.length; i++) {
      const post = filtered[i];
      try {
        const detail = await postData(
          "get",
          null,
          `cms/viewByID/${post.id}`,
          false,
          false,
          true
        );

        const postDataVal = detail?.data?.value;
        if (!postDataVal) continue;

        const forms = postDataVal.forms || [];
        const firstBlock = forms[0];
        let html = "";

        if (firstBlock) {
          if (typeof firstBlock.content === "string") {
            html = firstBlock.content;
          } else if (firstBlock.content?.body) {
            html = firstBlock.content.body;
          } else if (Array.isArray(firstBlock.content)) {
            html = firstBlock.content[0]?.content || "";
          }
        }

        const image = extractPostImage(html);
        const bodyPreview = truncateToWords(extractPostDesc(html));
        if (image || bodyPreview) {
          const idx = postsList.value.findIndex((p) => p.id === post.id);
          if (idx !== -1) {
            const updated = { ...postsList.value[idx] };
            if (image) updated.image = image;
            if (bodyPreview) updated.bodyPreview = bodyPreview;
            postsList.value[idx] = updated;
          }
        }
      } catch (err) {
        console.error("Failed to fetch image for post:", post.id, err);
      }
      if (i < filtered.length - 1) {
        await delay(300);
      }
    }
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    loading.value = false;
  }
};

onMounted(() => {
  if (!props.editMode || props.preview) {
    fetchPosts();
  }
});
</script>
