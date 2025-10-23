import { Node } from '@tiptap/core';

export const PdfEmbed = Node.create({
  name: 'pdfEmbed', // Nama unik untuk node Anda

  group: 'block', // Ini adalah node level blok (seperti paragraf atau gambar)

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

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'pdf-embed', 'data-src': HTMLAttributes.src }, 'PDF Embed'];
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
