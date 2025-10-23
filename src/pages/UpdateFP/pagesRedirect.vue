<template>
  <div class="post-container">
    <div v-if="isLoading" class="text-center">
      <q-spinner-dots color="primary" size="40px" />
      <p>Loading Article, please wait...</p>
    </div>
    <template v-else>
      <article v-if="choosedPages && choosedPages.forms" class="content">
        <showComponent
          :data="choosedPages.forms"
          v-if="choosedPages.forms[0] && choosedPages.forms[0].id"
          :setup="choosedPages.forms[0].setupTraining"
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
        />
      </article>
      <div v-else class="error-message">
        <q-icon name="error" color="negative" size="50px" />
        <h4>Oops! Article Not Found</h4>
        <p>{{ error }}</p>
        <q-btn to="/" label="Kembali ke Beranda" color="primary" unelevated />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import showComponent from "../CMS/Forms/showComponent.vue";
import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();

// --- STATE MANAGEMENT ---
const route = useRoute(); // Untuk mengakses parameter dari URL
const post = ref(null); // Untuk menyimpan data artikel
const isLoading = ref(true); // Status loading
const error = ref(null); // Untuk menyimpan pesan error

const choosedPages = ref(null);

// --- FUNGSI UNTUK MENGAMBIL DATA ---
const fetchPost = async () => {
  // Ambil 'slug' dari parameter URL, contoh: 'hello-world'
  const slug = route.params.slug;
  const url = route.params.url;

  isLoading.value = true;
  error.value = null;

  try {
    // INI BAGIAN PENTING: Ganti bagian ini dengan API call sesungguhnya
    // Di sini kita simulasikan pengambilan data dari API
    const datas = await getForms(url ?? slug);

    console.log("Fetched Forms Data:", datas.value);
    // Jika data ditemukan, simpan ke state 'post'
    choosedPages.value = datas.value || null;
  } catch (err) {
    // Jika terjadi error (misal: artikel tidak ditemukan), simpan pesan errornya
    console.error("Gagal mengambil data artikel:", err);
    error.value = err.message;
  } finally {
    // Setelah selesai (baik sukses atau gagal), matikan status loading
    isLoading.value = false;
  }
};

// --- SIMULASI API CALL ---
// Fungsi ini hanya untuk contoh. Kamu harus menggantinya dengan fetch/axios ke backend-mu.
const getForms = async (idForms) => {
  // viewByID
  try {
    const response = await postData("get", null, `cms/viewBySlug/${idForms}`);
    if (response.data) {
      console.log("Forms Data:", response.data);
      return response.data || [];
    }
  } catch (error) {
    console.error("Error fetching forms data:", error);
  }
};

// --- LIFECYCLE HOOK ---
// Panggil fungsi fetchPost() saat komponen pertama kali di-mount (ditampilkan)
onMounted(() => {
  fetchPost();
});

watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    console.log("Route changed, new slug:", newSlug);
    if (newSlug !== oldSlug) {
      fetchPost();
    }
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
