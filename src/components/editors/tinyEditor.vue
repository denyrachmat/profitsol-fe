<template>
  <div eager>
    <div class="editor-container">
      <div class="editor-mode-toggle q-mb-sm row items-center q-gutter-sm">
        <q-toggle
          v-model="editorMode"
          label="Code View ?"
          left-label
          val="visual"
          false-value="visual"
          true-value="code"
          color="primary"
          dense
          outlined
        />

        <q-space />

        <q-expansion-item
          label="Custom CSS"
          icon="palette"
          dense
          header-class="text-primary"
          class="col-auto"
        >
          <q-card flat bordered class="q-mt-xs">
            <q-card-section class="q-pb-sm">
              <div class="text-caption text-grey-7 q-mb-sm">
                Load external CSS into the editor preview (HTTPS only, max 5).
              </div>

              <div
                v-for="(url, i) in localCssUrls"
                :key="i"
                class="row items-center q-gutter-xs q-mb-xs"
              >
                <q-input
                  v-model="localCssUrls[i]"
                  dense
                  outlined
                  placeholder="https://example.com/style.css"
                  class="col"
                  :rules="[isValidCssUrl]"
                  lazy-rules
                />
                <q-btn
                  icon="delete"
                  flat
                  dense
                  round
                  color="negative"
                  size="sm"
                  @click="removeCssUrl(i)"
                />
              </div>

              <q-btn
                v-if="localCssUrls.length < MAX_CSS_FILES"
                flat
                dense
                no-caps
                icon="add"
                label="Add CSS URL"
                color="primary"
                class="q-mt-xs"
                @click="addCssUrl"
              />
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>

      <div class="row q-gutter-md">
        <div class="col">
          <editor
            api-key="gw0rtlzda4wpi7l6uncts5jnjh5ftvfw8ncz54ex7maanor4"
            class="full-height"
            :init="initEditor"
            v-model="editors"
          />
        </div>
        <div class="col" v-if="editorMode === 'code' && monacoReady">
          <CodeEditor
            v-model:value="editors"
            language="html"
            theme="vs-dark"
            :height="600"
            :options="{
              minimap: { enabled: true },
              wordWrap: 'on',
              lineNumbers: 'on',
              fontSize: 14,
              automaticLayout: true,
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from "vue";
import Editor from "@tinymce/tinymce-vue";
import { useQuasar } from "quasar";
import { html as beautifyHtml } from "js-beautify";
import { CodeEditor } from "monaco-editor-vue3";

const editorMode = ref("visual"); // 'visual' or 'code'
const monacoReady = ref(false);

const MAX_CSS_FILES = 5;
const BLOCKED_PROTOCOLS = ["javascript:", "data:", "vbscript:"];

/* ================= CSS URL Security ================= */
const isAbsoluteUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isSecureUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const hasBlockedProtocol = (url) => {
  const lower = url.trim().toLowerCase();
  return BLOCKED_PROTOCOLS.some((p) => lower.startsWith(p));
};

const isValidCssUrl = (url) => {
  if (!url || !url.trim()) return true;
  if (hasBlockedProtocol(url)) return "Blocked protocol";
  if (!isAbsoluteUrl(url)) return "Must be a full URL (https://...)";
  if (!isSecureUrl(url)) return "HTTPS only";
  if (!/\.(css)(\?.*)?$/i.test(url)) return "Must be a .css file";
  return true;
};

const getSanitizedCssUrls = (urls) => {
  return (urls || [])
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter((u) => u && isValidCssUrl(u) === true);
};

/* ================= Monaco Loader (CDN) ================= */
const MONACO_BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min";
function loadScriptOnce(src) {
  const abs = new URL(src, location.origin).href;
  if ([...document.scripts].some((s) => s.src === abs))
    return Promise.resolve();
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
  return new Promise((res, rej) => {
    s.onload = res;
    s.onerror = rej;
  });
}
async function ensureMonaco() {
  await loadScriptOnce(`${MONACO_BASE}/vs/loader.js`);

  window.MonacoEnvironment = {
    getWorkerUrl(moduleId, label) {
      if (label === "json") {
        return `${MONACO_BASE}/vs/language/json/json.worker.js`;
      }
      if (label === "css" || label === "scss" || label === "less") {
        return `${MONACO_BASE}/vs/language/css/css.worker.js`;
      }
      if (label === "html" || label === "handlebars" || label === "razor") {
        return `${MONACO_BASE}/vs/language/html/html.worker.js`;
      }
      if (label === "typescript" || label === "javascript") {
        return `${MONACO_BASE}/vs/language/typescript/ts.worker.js`;
      }
      return `${MONACO_BASE}/vs/editor/editor.worker.js`;
    },
  };

  const amdRequire = window.require;
  amdRequire.config({ paths: { vs: `${MONACO_BASE}/vs` } });

  await new Promise((resolve, reject) => {
    amdRequire(["vs/editor/editor.main"], () => resolve(), reject);
  });

  return window.monaco;
}

const props = defineProps({
  modelValue: { type: String, default: "" },
  customCssUrls: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:modelValue"]);
const $q = useQuasar();
const editors = ref("");
const localCssUrls = ref([]);
let tinyEditorInstance = null;
const CUSTOM_CSS_ATTR = "data-custom-css";

const addCssUrl = () => {
  if (localCssUrls.value.length >= MAX_CSS_FILES) return;
  localCssUrls.value.push("");
};

const removeCssUrl = (index) => {
  localCssUrls.value.splice(index, 1);
};

const mergedContentCss = computed(() => {
  const base = [
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css",
  ];
  const sanitized = getSanitizedCssUrls(localCssUrls.value);
  return [...base, ...sanitized];
});

const applyCustomCss = (urls) => {
  if (!tinyEditorInstance) return;

  try {
    const doc = tinyEditorInstance.getDoc();
    if (!doc) return;

    doc.querySelectorAll(`[${CUSTOM_CSS_ATTR}]`).forEach((el) => el.remove());

    urls.forEach((url) => {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.setAttribute(CUSTOM_CSS_ATTR, "");
      doc.head.appendChild(link);
    });
  } catch (e) {
    console.error("Failed to apply custom CSS:", e);
  }
};

onMounted(async () => {
  if (props.modelValue) editors.value = props.modelValue;
  localCssUrls.value = getSanitizedCssUrls(props.customCssUrls);
  await ensureMonaco();
  monacoReady.value = true;
});
watch(
  () => props.modelValue,
  (v) => {
    if (v !== editors.value) editors.value = v || "";
  }
);
watch(
  () => editors.value,
  (v) => emit("update:modelValue", v)
);

watch(mergedContentCss, (urls) => {
  applyCustomCss(getSanitizedCssUrls(urls));
});

const dialogConfig = {
  title: "Variable",
  body: {
    type: "panel",
    items: [
      { type: "input", name: "catdata", label: "Enter Variable Name" },
      {
        type: "htmlpanel",
        html: '<div id="monaco-src" style="border:1px solid #ddd;"></div>',
      },
    ],
  },
  buttons: [
    { type: "cancel", name: "closeButton", text: "Cancel" },
    {
      type: "submit",
      name: "submitButton",
      text: "Submit",
      buttonType: "primary",
    },
  ],
  initialData: { catdata: "$username" },
  onSubmit: (api) => {
    const { catdata } = api.getData();
    tinymce.activeEditor.execCommand(
      "mceInsertContent",
      false,
      `{{$${catdata}}}`
    );
    api.close();
  },
};

const initEditor = ref({
  selector: "textarea#open-source-plugins",
  extended_valid_elements: "script[src|type|defer|async],style[type]",
  valid_elements: "*[*]",
  valid_children: "+body[style|script],+div[style|script]",
  plugins:
    "code print preview paste importcss searchreplace autolink autosave save directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons",
  external_plugins: {
    bootstrap3grid: "/plugins/TinyMCE5/bootstrap3grid/plugin.min.js",
  },
  menubar: "file edit view insert format tools table help",
  toolbar:
    "pdfPreviewButton | code | bootstrap3grid quasarDialogButton | dialog-example-btn | undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen preview save print | insertfile image media template link anchor codesample | ltr rtl",
  height: 600,
  toolbar_sticky: true,
  paste_data_images: true,
  image_advtab: true,
  content_css: mergedContentCss.value,
  codesample_languages: [
    { text: "SQL", value: "sql" },
    { text: "HTML/XML", value: "markup" },
  ],
  codesample_content_css: "https://ourcodeworld.com/material/css/prism.css",

  setup: (editor) => {
    tinyEditorInstance = editor;

    editor.on("init", () => {
      applyCustomCss(getSanitizedCssUrls(localCssUrls.value));
    });
    editor.ui.registry.addButton("dialog-example-btn", {
      icon: "format-code",
      tooltip: "Add variable to become value",
      onAction: () => editor.windowManager.open(dialogConfig),
    });

    editor.ui.registry.addButton("pdfPreviewButton", {
      text: "PDF",
      tooltip: "Preview PDF",
      onAction: () => {
        editor.windowManager.open({
          title: "Insert PDF Preview",
          body: {
            type: "panel",
            items: [{ type: "input", name: "pdfUrl", label: "PDF URL" }],
          },
          buttons: [
            { type: "submit", text: "Insert" },
            { type: "cancel", text: "Cancel" },
          ],
          onSubmit: (api) => {
            const { pdfUrl } = api.getData();
            if (pdfUrl) {
              const html = `<iframe src="https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
                pdfUrl
              )}" width="100%" height="500px" style="border:none;"></iframe>`;
              editor.insertContent(html);
            }
            api.close();
          },
        });
      },
    });

    editor.ui.registry.addButton("codePro", {
      icon: "sourcecode",
      tooltip: "Source code (VS Code style)",
      onAction: async () => {
        const monaco = await ensureMonaco();
        const initial = beautifyHtml(editor.getContent({ format: "html" }), {
          indent_size: 2,
          wrap_line_length: 80,
        });

        let monacoEditor;
        let currentTheme = "vs-dark";

        editor.windowManager.open({
          title: "Source code",
          size: "large",
          body: {
            type: "panel",
            items: [
              {
                type: "htmlpanel",
                html: '<div id="monaco-container" style="width:100%;height:600px;min-height:600px;border:1px solid #ddd;position:relative;overflow:hidden;"></div>',
              },
            ],
          },
          buttons: [
            { type: "custom", name: "theme", text: "Toggle Theme" },
            { type: "submit", text: "OK", buttonType: "primary" },
            { type: "cancel", text: "Cancel" },
          ],
          onAction(api, details) {
            if (details.name === "theme" && monacoEditor) {
              currentTheme = currentTheme === "vs-dark" ? "vs" : "vs-dark";
              monaco.editor.setTheme(currentTheme);
            }
          },
          onSubmit(api) {
            const val = monacoEditor?.getValue() ?? initial;
            editor.setContent(val);
            api.close();
          },
          onClose() {
            if (monacoEditor) {
              monacoEditor.dispose();
              monacoEditor = null;
            }
          },
          onReady() {
            // Use requestAnimationFrame to ensure DOM is ready
            const initMonaco = () => {
              requestAnimationFrame(() => {
                const container = document.getElementById("monaco-container");
                if (!container || !container.isConnected) {
                  setTimeout(initMonaco, 100);
                  return;
                }

                // Ensure container is properly attached to the document
                if (!document.body.contains(container)) {
                  setTimeout(initMonaco, 100);
                  return;
                }

                const rect = container.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                  setTimeout(initMonaco, 50);
                  return;
                }

                try {
                  // Safely clear container
                  while (container.firstChild) {
                    container.removeChild(container.firstChild);
                  }

                  monacoEditor = monaco.editor.create(container, {
                    value: initial,
                    language: "html",
                    theme: currentTheme,
                    automaticLayout: true,
                    minimap: { enabled: true },
                    wordWrap: "on",
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    fontSize: 14,
                    fixedOverflowWidgets: true,
                  });

                  // Single layout call with proper timing
                  setTimeout(() => {
                    if (
                      monacoEditor &&
                      !monacoEditor.isDisposed() &&
                      container.isConnected
                    ) {
                      monacoEditor.layout();
                      monacoEditor.focus();
                    }
                  }, 100);
                } catch (error) {
                  console.error("Error creating Monaco editor:", error);
                }
              });
            };

            // Start initialization with proper timing
            setTimeout(initMonaco, 100);
          },
        });
      },
    });
  },
});

const insertContent = (html) => {
  if (!tinyEditorInstance) return;
  tinyEditorInstance.execCommand("mceInsertContent", false, html);
};

defineExpose({ insertContent });
</script>

<style>
.tox-silver-sink,
.tox-dialog-wrap,
.tox-dialog {
  z-index: 15000000000 !important;
}
</style>
