<template>
  <node-view-wrapper class="pdf-embed-wrapper">
    <canvas ref="pdfCanvas"></canvas>
  </node-view-wrapper>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";

// Ambil props dari Tiptap, termasuk 'node'
const props = defineProps(nodeViewProps);

const pdfCanvas = ref(null);

// Fungsi untuk me-render PDF
const renderPdf = async () => {
  const url = props.node.attrs.src;
  if (!url || !pdfCanvas.value) {
    return;
  }

  try {
    // 1. Import library PDF.js (menggunakan dynamic import dari CDN)
    // Kamu juga bisa install via NPM: npm install pdfjs-dist
    const pdfjsLib = await import(
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs"
    );

    // 2. Set worker-nya (penting!)
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

    // 3. Muat dokumen PDF
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;

    // 4. Ambil halaman pertama
    const page = await pdf.getPage(1);

    // 5. Siapkan canvas
    const viewport = page.getViewport({ scale: 1.0 }); // Skala 1.0
    const canvas = pdfCanvas.value;
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 6. Render halaman ke canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
  } catch (error) {
    console.error("Error rendering PDF:", error);
    // Mungkin tampilkan pesan error di canvas jika gagal
  }
};

// Render saat komponen di-mount
onMounted(renderPdf);

// Render ulang jika 'src' berubah (misalnya user mengedit URL)
watch(() => props.node.attrs.src, renderPdf);
</script>

<style>
/* Beri sedikit style agar rapi */
.pdf-embed-wrapper {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  background: #f9f9f9;
}
.pdf-embed-wrapper canvas {
  /* Pastikan canvas tidak terlalu besar */
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style>
