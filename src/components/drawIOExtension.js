import { Node } from '@tiptap/core'

export const DrawioNode = Node.create({
  name: 'drawio',
  group: 'block',
  atom: true,
  selectable: true,   // biar bisa ke-select tapi isi di dalam tetap bebas
  draggable: false,

  addAttributes() {
    return {
      src: {
        default: 'https://embed.diagrams.net/?embed=1&ui=atlas&proto=json',
      },
      width: {
        default: '100%',
      },
      height: {
        default: '500px',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-drawio-wrapper]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // ini cuma fallback kalau editor diserialisasi → HTML (bukan nodeView)
    return [
      'div',
      {
        'data-drawio-wrapper': '',
        contenteditable: 'false',
        style: 'position: relative;',
      },
      [
        'iframe',
        {
          'data-drawio': '',
          src: HTMLAttributes.src,
          width: HTMLAttributes.width,
          height: HTMLAttributes.height,
          frameborder: '0',
          allowfullscreen: 'true',
          style: 'border: none;',
        },
      ],
    ]
  },

  // 🚨 KUNCI: NodeView custom, bukan hanya renderHTML
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-drawio-wrapper', '')
      dom.contentEditable = 'false'
      dom.style.position = 'relative'
      dom.style.width = node.attrs.width || '100%'

      const iframe = document.createElement('iframe')
      iframe.setAttribute('data-drawio', '')
      iframe.src =
        node.attrs.src ||
        'https://embed.diagrams.net/?embed=1&ui=atlas&proto=json'
      iframe.width = node.attrs.width || '100%'
      iframe.height = node.attrs.height || '500px'
      iframe.frameBorder = '0'
      iframe.allowFullscreen = true
      iframe.style.border = 'none'

      dom.appendChild(iframe)

      return {
        dom,
        // jangan pernah biarkan ProseMirror memproses event di dalam node ini
        stopEvent: () => true,
        ignoreMutation: () => true,
      }
    }
  },

  addCommands() {
    return {
      insertDrawio:
        () =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: {
                src: 'https://embed.diagrams.net/?embed=1&ui=atlas&proto=json',
              },
            })
          },
      updateDrawio:
        attrs =>
          ({ commands }) => {
            return commands.updateAttributes(this.name, attrs)
          },
    }
  },
})
