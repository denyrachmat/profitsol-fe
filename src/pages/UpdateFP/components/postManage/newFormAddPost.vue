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
        <div class="row q-gutter-md q-pb-md">
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
          <div class="col">
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
              No tags found. Tags will appear automatically when you type #
              followed by text in the editor.
            </div>
          </div>
        </div>
        <q-separator class="q-my-md" />
        <div class="row q-gutter-md">
          <div class="col-12">
            <comment-component
              :key="refreshKey || idRef || props.postsData.id || 'new-post'"
              @submit="(value) => onClickSave(value)"
              @onCancel="
                () => {
                  editor = '';
                  onDialogCancel();
                }
              "
              :bypass-confirm="true"
              :modelValue="editor"
              :initial-attachments="listAttachments"
              @onChange="
                (value) => {
                  editor = value;
                  tags =
                    value.match(/#(\w+)/g)?.map((tag) => tag.substring(1)) ||
                    [];
                }
              "
            />
          </div>
        </div>
      </q-card-section>
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
import apiRequest from "src/components/apiRequest";
import multiplePromptDialog from "src/components/multiplePromptDialog.vue";
import uploadFiles from "src/components/uploadFiles/index.vue";

import commentComponent from "@/pages/Frontpage/commentComponent.vue";

const $q = useQuasar();

const { postData } = apiRequest();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const editor = ref("");
const formatting = ref([]);
const listType = ref(null);
const idRef = ref(null);
const postTitle = ref("");
const postDescription = ref("");
const loading = ref(false);
const idContent = ref("");
const tags = ref([]);
const categories = ref([]);
const listAttachments = ref([]);
const refreshKey = ref(0); // Key to force re-rendering of the comment component

const props = defineProps({
  postsData: {
    type: Object,
    default: () => ({}),
  },
});

onMounted(async () => {
  console.log("props.postsData:", props.postsData);
  if (props.postsData) {
    postTitle.value = props.postsData.title || "";
    postDescription.value = props.postsData.description || "";
    categories.value = props.postsData.tags || [];
    tags.value =
      props.postsData.hashtags ||
      editor.value.match(/#(\w+)/g)?.map((tag) => tag.substring(1)) ||
      [];
    editor.value = props.postsData.content || "";
  }

  if (props.postsData && props.postsData.id) {
    await getDataForms();
  }

  refreshKey.value++; // Increment the key to force re-rendering of the comment component
});

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
      if (htmlContent) {
        editor.value = htmlContent;
        console.log("Editor instance:", editor.value);
      }

      if (dataFetch.setupTraining && dataFetch.setupTraining.attachments) {
        listAttachments.value = dataFetch.setupTraining.attachments;
      }
    }
  } catch (error) {
    loading.value = false;
    console.error("Error fetching data:", error);
  }
};

const onClickSave = (valueData) => {
  if (!postTitle.value) {
    $q.notify({
      type: "negative",
      message: "Please fill post title.",
    });
    return;
  }

  console.log(valueData);

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
              content: valueData.comment, // Use the comment content from the dialog
              type: "html",
            },
          ],
        },
      ],
      title: postTitle.value,
      desc: postDescription.value,
      isQuiz: 3, // Set as needed
      setupTraining: {
        attachments: valueData.attachments,
      }, // Set as needed
      shareForms: null, // Set as needed
      shareFormsIsMainMenu: null, // Set as needed
      shareFormsIsRoles: null, // Set as needed
      selectedSharedMenu: null, // Set as needed
      shareFormsMenuIcon: null, // Set as needed
      tags: categories.value,
      hashtags: tags.value, // Use the attachments from the dialog
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
      creator: tag.creator,
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
          creator: "pgm_created_by|string",
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
          creator: "pgm_created_by|string",
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
