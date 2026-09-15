// File: PdfEmbed.js
import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import PdfEmbedView from './PdfEmbedView.vue'; // <-- Impor komponen Vue kamu

export const PdfEmbed = Node.create({
  name: 'pdfEmbed',
  group: 'block',

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="pdf-embed"]',
        getAttrs: (element) => ({
          src: element.getAttribute('data-src'),
        }),
      },
    ];
  },

  // renderHTML tetap penting untuk menyimpan datanya
  renderHTML({ HTMLAttributes }) {
    // Kita tetap simpan sebagai div, preview-nya hanya di editor
    return ['div', { 'data-type': 'pdf-embed', 'data-src': HTMLAttributes.src }];
  },

  // INI BAGIAN PENTINGNYA
  addNodeView() {
    return VueNodeViewRenderer(PdfEmbedView);
  },

  addCommands() {
    return {
      insertPdfEmbed: (src) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { src },
        });
      },
    };
  },
});