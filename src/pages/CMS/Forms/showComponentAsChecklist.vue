<template>
  <div class="show-component-checklist q-py-sm">
    <div
      v-if="props.data.length > 0"
      class="table-container shadow-2 rounded-borders"
    >
      <q-markup-table flat buffered dense class="checklist-table">
        <thead>
          <tr class="bg-grey-2 text-grey-9 text-weight-bold">
            <th style="width: 60px" class="text-center text-subtitle2">No</th>

            <th
              class="text-center text-wrap text-subtitle2 q-px-md header-cell"
              v-for="flatCol in flattenedFields"
              :key="'head-' + flatCol.id"
              v-show="!flatCol.hidden"
            >
              <div class="header-content">
                <span v-html="flatCol.content?.label || flatCol.label"></span>
                <span v-if="flatCol.required" class="text-red"> *</span>
              </div>
            </th>

            <th
              v-if="props.enableDeleteInstance"
              style="width: 70px"
              class="text-center text-subtitle2"
            >
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="instanceIdx in paginatedInstances"
            :key="'instance-row-' + instanceIdx"
            class="checklist-row"
          >
            <td
              class="text-center text-weight-bold text-primary text-body1 bg-grey-1 cursor-default"
            >
              #{{ instanceIdx }}
            </td>

            <td
              v-for="flatCol in flattenedFields"
              :key="'instance-input-' + instanceIdx + '-' + flatCol.id"
              v-show="!flatCol.hidden"
              class="q-pa-sm input-cell"
            >
              <div class="cell-wrapper">
                <!-- Cari bagian componentViewVue di dalam tbody showComponentAsChecklist.vue -->
                <componentViewVue
                  v-if="flatCol.type === 'form' && flatCol.content?.component"
                  :type="flatCol.content?.component?.category"
                  :type-input="flatCol.content?.component?.value?.type"
                  :comp="flatCol.content?.component?.value?.comp"
                  :label="''"
                  :detail="flatCol.content?.detail_data"
                  :is-required="flatCol.required"
                  mode="live"
                  class="full-width compact-input"
                  @customChange="
                    (val) => emitAnswerChange(instanceIdx - 1, flatCol.id, val)
                  "
                  :ans="getAnswerData(instanceIdx - 1, flatCol.id)"
                  :ansArr="getAnswerArrData(instanceIdx - 1, flatCol.id)"
                  :apiOpt="flatCol.content?.component?.apiOpt"
                  :readonly="flatCol.readonly"
                />

                <div
                  v-else-if="flatCol.type === 'html'"
                  class="full-width text-left"
                >
                  <div v-html="flatCol.content"></div>
                </div>
              </div>
            </td>

            <td v-if="props.enableDeleteInstance" class="text-center bg-grey-1">
              <q-btn
                icon="delete"
                color="negative"
                flat
                round
                dense
                size="sm"
                :disable="totalInstances <= 1"
                @click="emitRemoveRow(instanceIdx - 1)"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <div
        class="row q-pa-sm justify-center bg-white border-top"
        v-if="totalPages > 1"
      >
        <div class="col flex flex-center">
          <q-pagination
            v-model="currentPage"
            :max="totalPages"
            :max-pages="5"
            direction-links
            boundary-links
            color="primary"
          />
        </div>
      </div>

      <div
        class="row q-pa-md bg-grey-1 border-top justify-between items-center"
        v-if="props.isMultipleMode"
      >
        <div class="text-caption text-grey-6">
          Total Baris:
          <span class="text-weight-bold text-primary">{{
            totalInstances
          }}</span>
          / {{ props.maxInstances }}
        </div>

        <div class="q-gutter-x-sm">
          <q-btn
            color="primary"
            outline
            icon="add"
            label="TAMBAH FORM BARU"
            :disable="totalInstances >= props.maxInstances"
            @click="emitAddRow"
          />

          <q-btn
            color="green"
            unelevated
            icon="save"
            label="SUBMIT DATA"
            @click="emit('submitData')"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center q-pa-xl text-grey-5 bg-white rounded-borders border-dashed"
    >
      <q-icon name="assignment_late" size="56px" />
      <div class="text-h6 q-mt-sm">Struktur Formulir Belum Siap</div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits, watch, ref } from "vue";
import { useFormStore } from "stores/formStore";
import componentViewVue from "../componentView.vue";

const props = defineProps({
  data: { type: Array, default: () => [] },
  isMultipleMode: { type: Boolean, default: false },
  enableDeleteInstance: { type: Boolean, default: false },
  maxInstances: { type: Number, default: 10 },
});

const localTotalRows = ref(1);
// Tambahkan ini di bagian atas script setup
const currentPage = ref(1);
const rowsPerPage = ref(10); // Batasi maksimal 10 baris saja per halaman agar super ringan!

// Hitung total halaman berdasarkan localTotalRows yang ada saat ini
const totalPages = computed(() => {
  return Math.ceil(localTotalRows.value / rowsPerPage.value);
});

const paginatedInstances = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;

  // Bikin array deretan index sesuai halaman aktif (misal: 1, 2, 3... atau 11, 12, 13...)
  const indices = [];
  for (let i = start + 1; i <= Math.min(end, localTotalRows.value); i++) {
    indices.push(i);
  }
  return indices;
});

const emit = defineEmits([
  "answerChange",
  "addNewInstance",
  "removeInstance",
  "submitData",
]);
const store = useFormStore();
const getUserAnswers = computed(() => store.getUsersAnswerForm);

/**
 * 1. FIX FLATTENED FIELDS (Ambil skema dari blueprint asli secara aman)
 */
const flattenedFields = computed(() => {
  const fields = [];
  // Kita hanya ambil skema dari kelompok baris (row) asli bawaan form pertama kali
  if (props.data && props.data.length > 0) {
    // Cari baris-baris awal yang membentuk 1 halaman form utuh
    props.data.forEach((row) => {
      if (Array.isArray(row.content)) {
        row.content.forEach((col) => {
          // Cegah duplikasi field ID di dalam susunan kolom header
          if (!fields.some((f) => f.id === col.id)) {
            fields.push(col);
          }
        });
      }
    });
  }
  return fields;
});

/**
 * 2. FIX TOTAL INSTANCES (Suntikkan reaktivitas pemicu)
 */
const totalInstances = computed(() => {
  // 🟢 TRICK: Panggil properti primitif props.data.length di baris paling atas.
  // Ini bertindak sebagai jangkar pemicu agar Vue tahu bahwa skema induk sedang berubah!
  const triggerReactivity = props.data ? props.data.length : 0;

  const answers = getUserAnswers.value;

  // Jika store belum terbentuk atau kosong, paksa render 1 baris utama pertama
  if (!answers || Object.keys(answers).length === 0) {
    return 1;
  }

  // Ambil semua key indeks jawaban, ubah ke angka
  const filledIndices = Object.keys(answers).map((key) => parseInt(key));

  if (filledIndices.length === 0) return 1;

  // Cari tahu indeks terbesar saat ini
  const maxIndex = Math.max(...filledIndices);

  if (maxIndex === -Infinity || isNaN(maxIndex)) return 1;

  // Jumlah baris adalah indeks tertinggi + 1 (karena indeks dimulai dari 0)
  return Math.max(1, maxIndex + 1);
});

const normalizeAnswer = (val) => {
  if (typeof val === "string" && val.startsWith("data:")) return val;
  return val ?? "";
};

const getAnswerData = (rowIdx, fieldId) => {
  const rowAns = getUserAnswers.value?.[rowIdx];
  const val = rowAns?.[fieldId];
  return Array.isArray(val) ? "" : normalizeAnswer(val);
};

const getAnswerArrData = (rowIdx, fieldId) => {
  const rowAns = getUserAnswers.value?.[rowIdx];
  const val = rowAns?.[fieldId];
  return Array.isArray(val) ? normalizeAnswer(val) : "";
};

const emitAnswerChange = (rowIdx, fieldId, value) => {
  emit("answerChange", { rowIdx, fieldId, value });
};
const emitAddRow = () => {
  emit("addNewInstance");
};
const emitRemoveRow = (index) => {
  emit("removeInstance", index);
};

// Pantau perubahan data jawaban di store secara mendalam
watch(
  () => store.getUsersAnswerForm,
  (newAnswers) => {
    if (!newAnswers || Object.keys(newAnswers).length === 0) {
      localTotalRows.value = 1;
      return;
    }

    // Ambil semua indeks baris yang terdaftar di store
    const filledIndices = Object.keys(newAnswers).map((key) => parseInt(key));
    if (filledIndices.length === 0) {
      localTotalRows.value = 1;
      return;
    }

    // Cari indeks tertinggi saat ini
    const maxIndex = Math.max(...filledIndices);

    if (maxIndex === -Infinity || isNaN(maxIndex)) {
      localTotalRows.value = 1;
    } else {
      // Jumlah baris tampilan = Indeks tertinggi + 1
      localTotalRows.value = Math.max(1, maxIndex + 1);
    }
  },
  { deep: true, immediate: true } // deep wajib true agar perubahan properti objek dalam Pinia tertangkap basah
);
</script>

<style scoped>
/* Container utama pembungkus spreadsheet horizontal */
.table-container {
  border: 1px solid #dee2e6;
  background: #ffffff;
  overflow: hidden;
}

/* Mengatur scrollbar horizontal global hanya pada satu tempat */
.checklist-table {
  max-height: 70vh;
  overflow-x: auto;
  overflow-y: auto;
}

/* Memaksa text th header rapi di tengah dan mengunci minimal lebar kolom */
.header-cell,
.input-cell {
  min-width: 250px; /* Menjaga input text dan select agar tidak gepeng */
  max-width: 380px;
  vertical-align: middle;
}

/* Khusus untuk kolom textarea agar memiliki batas atas yang rapi */
.header-content {
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
}

.cell-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Desain baris saat di-hover mirip excel */
.checklist-row:hover {
  background-color: #f1f5f9 !important;
}

/* Penyeimbang garis border tambahan */
.border-top {
  border-top: 1px solid #dee2e6;
}

.border-dashed {
  border: 2px dashed #cbd5e1;
}

/* Trik memaksa komponen input internal Quasar agar tingginya seragam (compact) */
.compact-input :deep(.q-field--filled .q-field__control) {
  background-color: #ffffff !important;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.compact-input :deep(.q-field--filled .q-field__control:before) {
  display: none !important; /* Buang garis bawah default filled */
}

.compact-input :deep(.q-field__native),
.compact-input :deep(.q-field__input) {
  padding: 6px 0 !important;
}

/* Membatasi ketinggian maksimal Textarea agar tidak merusak tinggi baris */
.compact-input :deep(textarea.q-field__native) {
  min-height: 40px !important;
  max-height: 80px !important;
}

.compact-input :deep(.q-field__label) {
  display: none !important;
}
</style>
