import { Node } from '@tiptap/core';

export const DrawioNode = Node.create({
  name: 'drawio', // Unique name for the node
  group: 'block', // Belongs to the 'block' group
  atom: true,    // Treated as a single unit (can't split/delete part of it)

  // Default attributes
  addAttributes() {
    return {
      src: {
        default: '', // Draw.io embed URL or saved diagram data
      },
      width: {
        default: '100%',
      },
      height: {
        default: '500px',
      },
    };
  },

  // Parse HTML to Tiptap node
  parseHTML() {
    return [{
      tag: 'iframe[data-drawio]', // Match iframes with this attribute
    }];
  },

  // Render Tiptap node to HTML
  renderHTML({ HTMLAttributes }) {
    return ['iframe', {
      'data-drawio': '',
      src: HTMLAttributes.src || 'https://embed.diagrams.net/?embed=1&ui=atlas',
      width: HTMLAttributes.width,
      height: HTMLAttributes.height,
      frameborder: '0',
      allowfullscreen: 'true',
    }];
  },

  // Add commands to insert/edit the node
  addCommands() {
    return {
      insertDrawio: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            src: 'https://embed.diagrams.net/?embed=1&ui=atlas',
          },
        });
      },
      updateDrawio: (attrs) => ({ commands }) => {
        return commands.updateAttributes(this.name, attrs);
      },
    };
  },
});
