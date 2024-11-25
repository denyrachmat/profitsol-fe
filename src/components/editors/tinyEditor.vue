<template>
  <div eager>
    <editor
      api-key="gw0rtlzda4wpi7l6uncts5jnjh5ftvfw8ncz54ex7maanor4"
      class="full-height"
      :init="initEditor"
      v-model="editors"
    />
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import Editor from "@tinymce/tinymce-vue";

const props = defineProps({
  modelValue: String,
});

onMounted(() => {
  if (props.modelValue) {
    editors.value = props.modelValue;
  }
});

const dialogConfig = {
  title: "Pet Name Machine",
  body: {
    type: "panel",
    items: [
      {
        type: "input",
        name: "catdata",
        label: "Enter Variable Name",
      },
    ],
  },
  buttons: [
    {
      type: "cancel",
      name: "closeButton",
      text: "Cancel",
    },
    {
      type: "submit",
      name: "submitButton",
      text: "Submit",
      buttonType: "primary",
    },
  ],
  initialData: {
    catdata: "$username",
  },
  onSubmit: (api) => {
    const data = api.getData();

    tinymce.activeEditor.execCommand(
      "mceInsertContent",
      false,
      `{{$${data.catdata}}}`
    );
    api.close();
  },
};

const initEditor = ref({
  selector: "textarea#open-source-plugins",
  codesample_languages: [
    { text: "SQL", value: "sql" },
    { text: "HTML/XML", value: "markup" },
  ],
  plugins:
    "print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons",
  imagetools_cors_hosts: ["picsum.photos"],
  menubar: "file edit view insert format tools table help",
  toolbar:
    "dialog-example-btn | undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl | myCustomToolbarButton",
  toolbar_sticky: true,
  autosave_ask_before_unload: true,
  autosave_interval: "30s",
  autosave_prefix: "{path}{query}-{id}-",
  autosave_restore_when_empty: false,
  autosave_retention: "2m",
  codesample_content_css: "http://ourcodeworld.com/material/css/prism.css",
  image_advtab: true,
  link_list: [
    { title: "My page 1", value: "https://www.tiny.cloud" },
    { title: "My page 2", value: "http://www.moxiecode.com" },
  ],
  image_list: [
    { title: "My page 1", value: "https://www.tiny.cloud" },
    { title: "My page 2", value: "http://www.moxiecode.com" },
  ],
  image_class_list: [
    { title: "None", value: "" },
    { title: "Some class", value: "class-name" },
  ],
  importcss_append: true,
  file_picker_callback: function (callback, value, meta) {
    /* Provide file and text for the link dialog */
    if (meta.filetype === "file") {
      callback("https://www.google.com/logos/google.jpg", { text: "My text" });
    }

    /* Provide image and alt text for the image dialog */
    if (meta.filetype === "image") {
      callback("https://www.google.com/logos/google.jpg", {
        alt: "My alt text",
      });
    }

    /* Provide alternative source and posted for the media dialog */
    if (meta.filetype === "media") {
      callback("movie.mp4", {
        source2: "alt.ogg",
        poster: "https://www.google.com/logos/google.jpg",
      });
    }
  },
  templates: [
    {
      title: "New Table",
      description: "creates a new table",
      content:
        '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>',
    },
    {
      title: "Starting my story",
      description: "A cure for writers block",
      content: "Once upon a time...",
    },
    {
      title: "New list with dates",
      description: "New List with dates",
      content:
        '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>',
    },
  ],
  template_cdate_format: "[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
  template_mdate_format: "[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
  height: 600,
  image_caption: true,
  quickbars_selection_toolbar:
    "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
  noneditable_noneditable_class: "mceNonEditable",
  toolbar_mode: "sliding",
  contextmenu: "link image imagetools table",
  skin: "oxide-dark",
  content_css: "dark",
  content_style:
    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
  paste_data_images: true,
  setup: (editor) => {
    //To add a simple triangle icon:
    // editor.ui.registry.addIcon('format-code', '<svg height="24" width="24"><path d="M12 0 L24 24 L0 24 Z" /></svg>');

    editor.ui.registry.addButton("dialog-example-btn", {
      icon: "format-code",
      tooltip: "Add variable to become value",
      onAction: () => editor.windowManager.open(dialogConfig),
    });

    editor.ui.registry.addButton("dialog-example-btn", {
      icon: "format-code",
      tooltip: "Add variable to become value",
      onAction: () => editor.windowManager.open(dialogConfig),
    });
  },
});
const emit = defineEmits("update:modelValue");
const editors = ref("");

watch(
  () => editors.value,
  (val) => {
    emit("update:modelValue", val);
  }
);
</script>

<style>
.tox-dialog {
  z-index: 15000000000 !important;
}
</style>
