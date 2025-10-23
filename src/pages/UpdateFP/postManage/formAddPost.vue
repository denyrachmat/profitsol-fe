<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <q-card-section class="q-pa-md">
        <div class="text-h6">Post Create</div>
        <div class="text-subtitle2">Create and manage your post here.</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="row q-pb-md">
          <div class="col">
            <q-input
              v-model="postTitle"
              label="Post Title"
              outlined
              dense
              :loading="loading"
            />
          </div>
        </div>
        <div class="row q-pb-md">
          <div class="col">
            <q-input
              v-model="postDescription"
              label="Description"
              type="textarea"
              rows="3"
              outlined
              dense
              :loading="loading"
            />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-btn
              label="Manage Category"
              color="primary"
              @click="onClickAddCategory()"
            />
          </div>
          <div class="col">
            <template v-for="category in categories" :key="category.id">
              <q-chip
                class="q-mr-sm"
                color="blue-4"
                text-color="white"
                outline
                rounded
                removable
                @remove="categories.splice(categories.indexOf(category), 1)"
              >
                {{ category }}
              </q-chip>
            </template>
          </div>
        </div>
        <q-separator class="q-my-md" />
        <div class="row q-pb-md">
          <div class="col">
            <q-card flat bordered>
              <q-toolbar class="bg-grey-2 q-gutter-xs">
                <!-- Text Formatting -->
                <q-btn-toggle
                  v-model="formatting"
                  multiple
                  unelevated
                  :options="[
                    { value: 'bold', icon: 'format_bold' },
                    { value: 'italic', icon: 'format_italic' },
                    { value: 'underline', icon: 'format_underlined' },
                    { value: 'strike', icon: 'strikethrough_s' },
                  ]"
                  @update:model-value="toggleFormatting"
                  :loading="loading"
                />

                <q-separator vertical />

                <!-- Headings -->
                <q-btn-dropdown stretch flat label="Headings" icon="title">
                  <q-list>
                    <q-item clickable @click="setHeading(1)">
                      <q-item-section>Heading 1</q-item-section>
                    </q-item>
                    <q-item clickable @click="setHeading(2)">
                      <q-item-section>Heading 2</q-item-section>
                    </q-item>
                    <q-item clickable @click="setHeading(3)">
                      <q-item-section>Heading 3</q-item-section>
                    </q-item>
                    <q-item clickable @click="setParagraph">
                      <q-item-section>Paragraph</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>

                <q-separator vertical />

                <!-- Lists -->
                <q-btn-group flat>
                  <q-btn
                    :color="listType === 'bullet' ? 'primary' : 'grey-6'"
                    :flat="listType !== 'bullet'"
                    icon="format_list_bulleted"
                    @click="toggleSingleList('bullet')"
                    dense
                    unelevated
                  />
                  <q-btn
                    :color="listType === 'ordered' ? 'primary' : 'grey-6'"
                    :flat="listType !== 'ordered'"
                    icon="format_list_numbered"
                    @click="toggleSingleList('ordered')"
                    dense
                    unelevated
                  />
                  <q-btn
                    :color="editor?.isActive('taskList') ? 'primary' : 'grey-6'"
                    :flat="!editor?.isActive('taskList')"
                    icon="checklist"
                    @click="editor?.chain().focus().toggleTaskList().run()"
                    dense
                    unelevated
                  />
                </q-btn-group>

                <q-separator vertical />

                <!-- Alignment -->
                <q-btn-group flat>
                  <q-btn
                    :color="
                      editor?.isActive({ textAlign: 'left' })
                        ? 'primary'
                        : 'grey-6'
                    "
                    :flat="!editor?.isActive({ textAlign: 'left' })"
                    icon="format_align_left"
                    @click="editor?.chain().focus().setTextAlign('left').run()"
                    dense
                    unelevated
                  />
                  <q-btn
                    :color="
                      editor?.isActive({ textAlign: 'center' })
                        ? 'primary'
                        : 'grey-6'
                    "
                    :flat="!editor?.isActive({ textAlign: 'center' })"
                    icon="format_align_center"
                    @click="
                      editor?.chain().focus().setTextAlign('center').run()
                    "
                    dense
                    unelevated
                  />
                  <q-btn
                    :color="
                      editor?.isActive({ textAlign: 'right' })
                        ? 'primary'
                        : 'grey-6'
                    "
                    :flat="!editor?.isActive({ textAlign: 'right' })"
                    icon="format_align_right"
                    @click="editor?.chain().focus().setTextAlign('right').run()"
                    dense
                    unelevated
                  />
                </q-btn-group>

                <q-separator vertical />

                <!-- Table Controls -->
                <q-btn-dropdown flat label="Table" icon="table_chart">
                  <q-list>
                    <q-item clickable @click="insertTable(3, 3)">
                      <q-item-section>Insert Table</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      @click="editor?.chain().focus().addColumnAfter().run()"
                      :disable="!editor?.can().addColumnAfter()"
                    >
                      <q-item-section>Add Column</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      @click="editor?.chain().focus().addRowAfter().run()"
                      :disable="!editor?.can().addRowAfter()"
                    >
                      <q-item-section>Add Row</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      @click="editor?.chain().focus().deleteColumn().run()"
                      :disable="!editor?.can().deleteColumn()"
                    >
                      <q-item-section>Delete Column</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      @click="editor?.chain().focus().deleteRow().run()"
                      :disable="!editor?.can().deleteRow()"
                    >
                      <q-item-section>Delete Row</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      @click="editor?.chain().focus().deleteTable().run()"
                      :disable="!editor?.can().deleteTable()"
                    >
                      <q-item-section>Delete Table</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>

                <q-separator vertical />

                <!-- Media Controls -->
                <q-btn-group flat>
                  <q-btn
                    flat
                    icon="image"
                    label="Image"
                    @click="addImage"
                    dense
                    unelevated
                  />
                  <q-btn
                    flat
                    icon="link"
                    label="Link"
                    @click="setLink"
                    dense
                    unelevated
                  />
                  <q-btn
                    flat
                    icon="grid_on"
                    label="Grid"
                    @click="insertGrid"
                    dense
                    unelevated
                  />
                  <q-btn
                    flat
                    icon="schema"
                    label="Diagram"
                    @click="insertDiagram"
                    dense
                    unelevated
                  />
                  <q-btn
                    flat
                    icon="draw"
                    label="Draw.io"
                    @click="editor?.chain().focus().insertDrawio().run()"
                    :disable="!editor?.can().insertDrawio()"
                    dense
                    unelevated
                  />
                </q-btn-group>

                <q-separator vertical />

                <!-- Other Formatting -->
                <q-btn-group flat>
                  <q-btn
                    :color="
                      editor?.isActive('codeBlock') ? 'primary' : 'grey-6'
                    "
                    :flat="!editor?.isActive('codeBlock')"
                    icon="code"
                    @click="editor?.chain().focus().toggleCodeBlock().run()"
                    dense
                    unelevated
                  />
                  <q-btn
                    :color="
                      editor?.isActive('blockquote') ? 'primary' : 'grey-6'
                    "
                    :flat="!editor?.isActive('blockquote')"
                    icon="format_quote"
                    @click="editor?.chain().focus().toggleBlockquote().run()"
                    dense
                    unelevated
                  />
                  <q-btn
                    flat
                    icon="horizontal_rule"
                    @click="editor?.chain().focus().setHorizontalRule().run()"
                    dense
                    unelevated
                  />
                  <q-btn
                    flat
                    icon="undo"
                    @click="editor?.chain().focus().undo().run()"
                    :disable="!editor?.can().undo()"
                    dense
                    unelevated
                  />
                  <q-btn
                    flat
                    icon="redo"
                    @click="editor?.chain().focus().redo().run()"
                    :disable="!editor?.can().redo()"
                    dense
                    unelevated
                  />
                </q-btn-group>

                <q-separator vertical />
                <q-btn-group flat>
                  <q-btn
                    flat
                    icon="picture_as_pdf"
                    label="PDF"
                    @click="addPdf"
                    dense
                    unelevated
                  />
                </q-btn-group>
              </q-toolbar>

              <!-- TipTap Editor -->
              <q-card-section>
                <editor-content :editor="editor" class="editor-content" />
              </q-card-section>

              <q-card-section>
                <div class="row q-gutter-md">
                  <div class="col-12">
                    <div class="text-subtitle2 q-mb-sm">Tags</div>
                    <div v-if="tags.length > 0" class="q-gutter-xs">
                      <q-chip
                        v-for="tag in tags"
                        :key="tag"
                        color="green-4"
                        text-color="white"
                        dense
                        removable
                        @remove="tags.splice(tags.indexOf(tag), 1)"
                      >
                        #{{ tag }}
                      </q-chip>
                    </div>
                    <div v-else class="text-caption text-grey-6">
                      No tags found. Tags will appear automatically when you
                      type # followed by text in the editor.
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          label="Save"
          color="primary"
          @click="onClickSave"
          unelevated
          :loading="loading"
        />
        <q-btn
          label="Cancel"
          color="secondary"
          @click="onDialogCancel"
          flat
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {
  onMounted,
  onBeforeUnmount,
  ref,
  shallowRef,
  nextTick,
  watch,
} from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import { EditorContent } from "@tiptap/vue-3";
import { DrawioNode } from "src/components/drawIOExtension";
import apiRequest from "src/components/apiRequest";
import { PdfEmbed } from "./PdfEmbedExtension.js"; // Sesuaikan path-nya
import multiplePromptDialog from "src/components/multiplePromptDialog.vue";

const $q = useQuasar();

const { postData } = apiRequest();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const editor = shallowRef(null);
const formatting = ref([]);
const listType = ref(null);
const idRef = ref(null);
const postTitle = ref("");
const postDescription = ref("");
const loading = ref(false);
const idContent = ref("");
const tags = ref([]);
const categories = ref([]);

const props = defineProps({
  postsData: {
    type: Object,
    default: () => ({}),
  },
});

// Initialize editor
onMounted(async () => {
  try {
    // console.log(props.postsData);
    // Dynamically import extensions
    const { Editor } = await import("@tiptap/core");
    const { StarterKit } = await import("@tiptap/starter-kit");
    const { Underline } = await import("@tiptap/extension-underline");
    const { Link } = await import("@tiptap/extension-link");
    const { Image } = await import("@tiptap/extension-image");
    const { TextAlign } = await import("@tiptap/extension-text-align");
    const { Table } = await import("@tiptap/extension-table");
    const { TableRow } = await import("@tiptap/extension-table-row");
    const { TableCell } = await import("@tiptap/extension-table-cell");
    const { TableHeader } = await import("@tiptap/extension-table-header");
    const { TaskList } = await import("@tiptap/extension-task-list");
    const { TaskItem } = await import("@tiptap/extension-task-item");
    const { CodeBlock } = await import("@tiptap/extension-code-block");
    const { Blockquote } = await import("@tiptap/extension-blockquote");
    const { HorizontalRule } = await import(
      "@tiptap/extension-horizontal-rule"
    );

    onClickChooseTags();

    editor.value = new Editor({
      extensions: [
        StarterKit.configure({
          table: false,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
        }),
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        CodeBlock,
        Blockquote,
        HorizontalRule,
        DrawioNode,
        PdfEmbed,
      ],
      content: "<p>Start writing your post here...</p>",
      onUpdate: ({ editor }) => {
        updateToolbarState();
        const found = extractHashtags(editor.getHTML());
        tags.value = Array.from(new Set([...found]));
      },
      onSelectionUpdate: () => {
        updateToolbarState();
      },
    });

    nextTick(async () => {
      if (editor.value) {
        await editor.value.commands.setContent(
          "<p>Welcome to the post editor!</p>"
        );
        updateToolbarState();

        if (props.postsData && props.postsData.id) {
          await getDataForms();
        }
        // Watch for hashtag detection in editor content
      }
    });
  } catch (error) {
    console.error("Editor initialization failed:", error);
    $q.notify({
      type: "negative",
      message: "Failed to initialize editor",
    });
  }
  // Remove DrawioButton function. Use a Quasar button in the template for Drawio insertion.
  // No return statement needed here; rendering is handled in the template.
});

const extractHashtags = (html) => {
  // lebih fleksibel (dukung huruf, angka, underscore, dash)
  const set = new Set();
  const re = /(^|[\s>])#([-\p{L}\p{N}_]{2,32})/gu;
  let m;
  while ((m = re.exec(html))) set.add(m[2].toLowerCase());
  return [...set];
};

const getDataForms = async () => {
  try {
    loading.value = true;
    const response = await postData(
      "get",
      null,
      `cms/viewByID/${props.postsData.id}`
    );

    if (response) {
      loading.value = false;
      console.log("Data fetched successfully:", response);
      const dataFetch = response.data.value;
      // editor.value.setContent(response.data.content);
      idRef.value = dataFetch.id || null;
      postTitle.value = dataFetch.title;
      postDescription.value = dataFetch.desc;

      const formsArray = Array.isArray(dataFetch.forms) ? dataFetch.forms : [];
      // Find the first content object with type 'html'
      let htmlContent = "";
      for (const form of formsArray) {
        if (Array.isArray(form.content)) {
          for (const c of form.content) {
            if (c.type === "html" && typeof c.content === "string") {
              htmlContent = c.content.replace(/\r?\n/g, "");
              idContent.value = c.id || "";
              break;
            }
          }
        }
        if (htmlContent) break;
      }

      console.log("Fetched HTML content:", htmlContent);
      console.log("Editor instance:", editor.value);
      if (editor.value && htmlContent) {
        // Use nextTick to ensure editor is ready before setting content
        await nextTick();
        editor.value.commands.setContent(htmlContent);
      } else {
        // Wait for editor to be initialized, then set content
        const unwatch = watch(
          () => editor.value,
          (val) => {
            if (val) {
              editor.value.setContent(htmlContent);
              unwatch();
            }
          }
        );
      }
      // dataForms.value = response.data.value;
    }
  } catch (error) {
    loading.value = false;
    console.error("Error fetching data:", error);
  }
};

function updateToolbarState() {
  if (!editor.value) return;

  const activeFormats = [];
  if (editor.value.isActive("bold")) activeFormats.push("bold");
  if (editor.value.isActive("italic")) activeFormats.push("italic");
  if (editor.value.isActive("underline")) activeFormats.push("underline");
  if (editor.value.isActive("strike")) activeFormats.push("strike");

  formatting.value = activeFormats;

  if (editor.value.isActive("bulletList")) {
    listType.value = "bullet";
  } else if (editor.value.isActive("orderedList")) {
    listType.value = "ordered";
  } else {
    listType.value = null;
  }
}

function toggleFormatting(formats) {
  if (!editor.value) return;

  ["bold", "italic", "underline", "strike"].forEach((format) => {
    const isActive = editor.value.isActive(format);
    const shouldBeActive = formats.includes(format);

    if (isActive !== shouldBeActive) {
      if (format === "bold") editor.value.chain().focus().toggleBold().run();
      else if (format === "italic")
        editor.value.chain().focus().toggleItalic().run();
      else if (format === "underline")
        editor.value.chain().focus().toggleUnderline().run();
      else if (format === "strike")
        editor.value.chain().focus().toggleStrike().run();
    }
  });
}

function setHeading(level) {
  if (!editor.value) return;
  editor.value.chain().focus().toggleHeading({ level }).run();
}

function setParagraph() {
  if (!editor.value) return;
  editor.value.chain().focus().setParagraph().run();
}

function toggleList(type) {
  if (!editor.value) return;

  if (type === "bullet") {
    editor.value.chain().focus().toggleBulletList().run();
  } else if (type === "ordered") {
    editor.value.chain().focus().toggleOrderedList().run();
  }
}

function toggleSingleFormat(format) {
  if (!editor.value) return;

  if (format === "bold") editor.value.chain().focus().toggleBold().run();
  else if (format === "italic")
    editor.value.chain().focus().toggleItalic().run();
  else if (format === "underline")
    editor.value.chain().focus().toggleUnderline().run();
  else if (format === "strike")
    editor.value.chain().focus().toggleStrike().run();
}

function toggleSingleList(type) {
  if (!editor.value) return;
  toggleList(type);
}

function insertTable(rows = 3, cols = 3) {
  if (!editor.value) return;
  editor.value
    .chain()
    .focus()
    .insertTable({ rows, cols, withHeaderRow: true })
    .run();
}

async function addImage() {
  if (!editor.value) return;

  try {
    $q.dialog({
      title: "Insert Image",
      message: "Enter the image URL",
      prompt: {
        model: "",
        type: "url",
      },
      cancel: true,
      persistent: true,
    }).onOk((url) => {
      console.log("Image URL entered:", url);
      if (url && typeof url === "string" && url.trim()) {
        editor.value.chain().focus().setImage({ src: url.trim() }).run();
      }
    });
  } catch (error) {
    // Dialog was cancelled
    console.log("Image dialog cancelled");
  }
}

function setLink() {
  if (!editor.value) return;

  const previousUrl = editor.value.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  if (url === null) return;
  if (url === "") {
    editor.value.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.value
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

function insertGrid(columns = 2) {
  if (!editor.value) return;

  const colWidth = Math.floor(12 / columns);
  const columnsHtml = Array(columns)
    .fill("")
    .map(
      () => `
      <div class="col-${colWidth} q-pa-sm">
        <p>Column content</p>
      </div>
    `
    )
    .join("");

  editor.value
    .chain()
    .focus()
    .insertContent(
      `
      <div class="row q-col-gutter-md">
        ${columnsHtml}
      </div>
      <p></p>
    `
    )
    .run();
}

function insertDiagram() {
  if (!editor.value) return;

  editor.value
    .chain()
    .focus()
    .insertContent(
      `
      <div class="diagram-container">
        <div class="diagram-title">Diagram Title</div>
        <div class="diagram-steps">
          <div class="diagram-step" style="background:#4CAF50">Step 1</div>
          <div class="diagram-step" style="background:#2196F3">Step 2</div>
          <div class="diagram-step" style="background:#FF9800">Step 3</div>
        </div>
        <div class="diagram-footer">Edit this diagram</div>
      </div>
      <p></p>
    `
    )
    .run();
}

async function addPdf() {
  if (!editor.value) return;

  const url = await $q.dialog({
    title: "Insert PDF",
    message: "Masukkan URL PDF",
    prompt: {
      model: "",
      type: "url",
    },
    cancel: true,
    persistent: true,
  });

  if (url) {
    editor.value.chain().focus().insertPdfEmbed(url).run();
  }
}

const onClickSave = () => {
  if (!postTitle.value || !postDescription.value) {
    $q.notify({
      type: "negative",
      message: "Please fill in all fields.",
    });
    return;
  }

  console.log(editor.value.getHTML());

  // Here you would typically send the post data to your backend
  $q.dialog({
    title: "Confirm",
    message: "Do you really want to save this post?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const posts = {
      idRef: idRef.value, // Add idRef if needed, or set to actual value
      forms: [
        {
          type: "row",
          content: [
            {
              id: idContent.value,
              content: editor.value.getHTML(),
              type: "html",
            },
          ],
        },
      ],
      title: postTitle.value,
      desc: postDescription.value,
      isQuiz: 3, // Set as needed
      setupTraining: null, // Set as needed
      shareForms: null, // Set as needed
      shareFormsIsMainMenu: null, // Set as needed
      shareFormsIsRoles: null, // Set as needed
      selectedSharedMenu: null, // Set as needed
      shareFormsMenuIcon: null, // Set as needed
      tags: categories.value,
      hastags: tags.value,
    };

    // Simulate API call
    try {
      // Replace with your actual API call

      console.log("Saving post data:", posts);
      loading.value = true;
      const response = await postData(
        "post",
        posts,
        "cms/forms",
        false,
        false,
        true
      );
      if (response) {
        loading.value = false;
        $q.notify({
          type: "positive",
          message: "Post saved successfully!",
        });
        onDialogOK();
      } else {
        loading.value = false;
        $q.notify({
          type: "negative",
          message: "Failed to save post.",
        });
      }
    } catch (error) {
      loading.value = false;
      $q.notify({
        type: "negative",
        message: "Error occurred while saving post.",
      });
    }
  });
};

const onClickAddCategory = async () => {
  const getListTags = await getDataCategories();

  let tagsList = [];
  if (getListTags && getListTags.length > 0) {
    tagsList = getListTags.map((tag) => ({
      label: `${tag.name} (${tag.desc})`,
      value: tag.name,
      desc: tag.desc,
      slug: tag.slug,
    }));
  }

  $q.dialog({
    component: multiplePromptDialog,
    componentProps: {
      title: "User Details",
      initialFields: [
        {
          name: "tagsName",
          label: "Category Name",
          type: "select",
          options: tagsList,
          multiple: true,
          default: categories.value || [],
          rules: [(val) => !!val || "Field is required"],
        },
      ],
      addable: true,
      removable: true,
    },
  }).onOk(async (payload) => {
    categories.value = [...categories.value, payload.tagsName].flat();
    console.log("Submitted:", payload);
  });
};

const onClickChooseTags = async () => {
  const getListTags = await getDataTags();

  console.log(getListTags);

  // let tagsList = [];
  // if (getListTags && getListTags.length > 0) {
  //   tagsList = getListTags.map((tag) => ({
  //     label: `${tag.name} (${tag.desc})`,
  //     value: tag.name,
  //     desc: tag.desc,
  //     slug: tag.slug,
  //   }));
  // }

  // $q.dialog({
  //   component: multiplePromptDialog,
  //   componentProps: {
  //     title: "Choose Tags",
  //     initialFields: [
  //       {
  //         name: "tagsName",
  //         label: "Tags Name",
  //         type: "select",
  //         options: tagsList,
  //         multiple: true,
  //         default: tags.value || [],
  //         rules: [(val) => !!val || "Field is required"],
  //       },
  //     ],
  //     addable: true,
  //     removable: true,
  //   },
  // }).onOk(async (payload) => {
  //   tags.value = [...tags.value, payload.tagsName].flat();
  //   console.log("Submitted:", payload);
  // });
};

const getDataCategories = async () => {
  loading.value = true;
  try {
    const response = await postData(
      "post",
      {
        filter: [],
        selectAs: {
          name: "pgm_value|string",
          slug: "pgm_value2|string",
          desc: "pgm_desc|string",
        },
      },
      `portal/gencode/showDetail/FP_POST_TAGS`,
      false,
      false,
      true
    );
    if (response.data) {
      loading.value = false;
      return response.data;
    } else {
      $q.notify({
        type: "negative",
        message: "Failed to fetch tags",
      });
      loading.value = false;
      return [];
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to fetch tags",
    });
  }
};

const getDataTags = async () => {
  loading.value = true;
  try {
    const response = await postData(
      "post",
      {
        filter: [],
        selectAs: {
          name: "pgm_value|string",
          slug: "pgm_value2|string",
          desc: "pgm_desc|string",
        },
      },
      `portal/gencode/showDetail/FP_POST_HASHTAGS`,
      false,
      false,
      true
    );
    if (response.data) {
      loading.value = false;
      return response.data;
    } else {
      $q.notify({
        type: "negative",
        message: "Failed to fetch tags",
      });
      loading.value = false;
      return [];
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to fetch tags",
    });
  }
};
</script>

<style lang="scss" scoped>
.tiptap {
  table {
    border-collapse: collapse;
    margin: 1em 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;

    td,
    th {
      border: 1px solid #ddd;
      box-sizing: border-box;
      min-width: 1em;
      padding: 8px 12px;
      position: relative;
      vertical-align: top;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      background-color: #f1f3f5;
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      background: rgba(200, 200, 255, 0.4);
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
      position: absolute;
      z-index: 2;
    }

    .column-resize-handle {
      background-color: #adf;
      bottom: -2px;
      position: absolute;
      right: -2px;
      pointer-events: none;
      top: 0;
      width: 4px;
    }
  }

  .tableWrapper {
    margin: 1em 0;
    overflow-x: auto;
  }

  .resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }

  img {
    max-width: 100%;
    height: auto;

    &.ProseMirror-selectednode {
      outline: 3px solid #68cef8;
    }
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }

  pre {
    background: #0d0d0d;
    color: #fff;
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  hr {
    border: none;
    border-top: 2px solid rgba(13, 13, 13, 0.1);
    margin: 2rem 0;
  }

  .row {
    display: flex !important;
    flex-wrap: wrap !important;
    margin-left: -8px !important;
    margin-right: -8px !important;
  }

  .q-col-gutter-md {
    margin-top: -8px !important;
    margin-bottom: -8px !important;

    > [class*="col-"] {
      padding: 8px !important;
    }
  }

  [class*="col-"] {
    min-height: 50px;
    position: relative;

    &.ProseMirror-selectednode {
      outline: 2px solid #68cef8 !important;
      background: rgba(104, 206, 248, 0.2) !important;
    }

    > * {
      margin-top: 0;
    }
  }

  .diagram-container {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
    background: #f9f9f9;
    margin: 16px 0;

    &.ProseMirror-selectednode {
      outline: 3px solid #68cef8;
      background: rgba(104, 206, 248, 0.1);
    }
  }

  .diagram-title {
    text-align: center;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .diagram-steps {
    display: flex;
    justify-content: space-around;
    margin: 16px 0;
  }

  .diagram-step {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;

    &.ProseMirror-selectednode {
      outline: 2px solid #68cef8;
    }
  }

  .diagram-footer {
    text-align: center;
    color: #666;
    font-style: italic;
    margin-top: 16px;
  }
}

:deep(.editor-content) {
  .ProseMirror {
    min-height: 200px;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    outline: none;
  }
}
</style>
