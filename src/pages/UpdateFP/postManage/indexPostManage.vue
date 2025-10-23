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
        <div class="text-h6">
          {{ modes !== 2 ? "Post Manage" : "Choose Post" }}
        </div>
        <div class="text-subtitle2">
          {{
            modes !== 2
              ? "Create and manage your post here."
              : "Choose post that you want."
          }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="row">
          <div class="col">
            <q-table
              style="height: 400px"
              flat
              bordered
              :rows="rows"
              :columns="columns"
              row-key="index"
              virtual-scroll
              v-model:pagination="pagination"
              :rows-per-page-options="[0]"
              :filter="filter"
              :loading="loading"
            >
              <template v-slot:top>
                <div
                  class="row items-center q-gutter-sm justify-end"
                  style="width: 100%"
                >
                  <div class="col-auto">
                    <q-input
                      dense
                      debounce="300"
                      v-model="filter"
                      placeholder="Search"
                      clearable
                      outlined
                      class="q-mr-md"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-auto" v-if="props.mode !== 2">
                    <q-btn
                      color="primary"
                      label="Add New Post"
                      @click="onClickAddPage"
                      icon-right="add"
                    />
                    <q-btn
                      color="indigo"
                      label="Manage Category"
                      @click="onClickTagsManage"
                      icon-right="sell"
                      flat
                    />
                  </div>
                </div>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" @click="onRowClick(props.row)">
                  <q-td
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    <span
                      v-if="
                        col.name !== 'tags' &&
                        col.name !== 'action' &&
                        col.name !== 'is_published'
                      "
                    >
                      {{ props.row[col.field] }}
                    </span>
                    <template v-if="col.name === 'tags'">
                      <div>
                        <template
                          v-if="props.row.tags && props.row.tags.length > 0"
                        >
                          <q-chip
                            v-for="(tag, index) in props.row.tags"
                            :key="index"
                            color="green-7"
                            text-color="white"
                            class="q-mr-sm"
                            removable
                            @remove="onClickRemoveTag(props.row.id, tag)"
                          >
                            {{ tag }}
                          </q-chip>

                          <q-btn
                            color="orange"
                            size="sm"
                            @click="onClickAddTag(props.row)"
                            icon="edit"
                            outline
                            rounded
                          />
                        </template>
                        <template v-else>
                          <template v-if="modes != 2">
                            <q-btn
                              color="orange"
                              label="Select Tags"
                              size="sm"
                              @click="onClickAddTag(props.row)"
                              icon="sell"
                              outline
                            />
                          </template>
                          <template v-else>
                            <q-chip
                              color="orange-7"
                              text-color="white"
                              class="q-mr-sm"
                            >
                              <q-icon name="warning" />
                              <span class="q-ml-xs">No Tags Defined</span>
                            </q-chip>
                          </template>
                        </template>
                      </div>
                    </template>

                    <template v-if="col.name === 'action' && modes !== 2">
                      <q-btn
                        flat
                        round
                        icon="edit"
                        color="primary"
                        @click="onClickAddPage(props.row)"
                        size="sm"
                        class="q-mr-xs"
                      >
                        <q-tooltip anchor="top middle" self="bottom middle">
                          Edit Post
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        icon="delete"
                        color="negative"
                        @click="onClickDeleteForm(props.row.id)"
                        size="sm"
                      >
                        <q-tooltip anchor="top middle" self="bottom middle">
                          Delete Post
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        icon="content_copy"
                        color="warning"
                        @click="onClickCopyForm(props.row.id, props.row)"
                        size="sm"
                      >
                        <q-tooltip anchor="top middle" self="bottom middle">
                          Copy Post
                        </q-tooltip>
                      </q-btn>
                    </template>

                    <template v-if="col.name === 'is_published'">
                      <q-toggle
                        v-model="props.row.is_published"
                        :true-value="1"
                        :false-value="0"
                        color="primary"
                        @update:model-value="
                          onUpdatePublishPost(
                            props.row.id,
                            props.row.is_published
                          )
                        "
                      />
                    </template>
                  </q-td>
                  <slot name="body-cell-tags" :props="props" />
                  <slot name="body-cell-is_main" :props="props" />
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import formDialog from "./formAddPost.vue";
import multiplePromptDialog from "src/components/multiplePromptDialog.vue";
import tagsManageView from "./tagsManageView.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const { postData } = apiRequest();

onMounted(() => {
  getData();
});

const props = defineProps({
  mode: Number,
});

const modes = ref(props.mode || 1); // Default to mode 0 if not provided
const $q = useQuasar();
const rows = ref([{ cfmt_title: "Page 1", desc: "Description for Page 1" }]);
const columns = ref([
  { name: "id", label: "ID", field: "id", align: "left" },
  { name: "cfmt_title", label: "Name", field: "cfmt_title", align: "left" },
  { name: "url", label: "URL", field: "url", align: "left" },
  {
    name: "desc",
    label: "Description",
    field: "desc",
    align: "left",
  },
  {
    name: "tags",
    label: "Category",
    field: "tags",
    align: "left",
  },
  {
    name: "created_at",
    label: "Created At",
    field: "created_at",
    align: "left",
  },
  { name: "action", label: "Action", field: "action", align: "left" },
  {
    name: "is_published",
    label: "Published",
    field: "is_published",
    align: "left",
  },
]);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: "index",
  descending: false,
  rowsNumber: rows.value.length,
});
const loading = ref(false);

const onClickAddPage = (item) => {
  $q.dialog({
    component: formDialog,
    componentProps: {
      postsData: item,
    },
    transitionShow: "slide-up",
    transitionHide: "slide-down",
    persistent: true,
  }).onDismiss(() => {
    getData();
  });
};

const getData = async () => {
  loading.value = true;
  const response = await postData("get", null, "cms/forms/post");
  if (response) {
    console.log("Data fetched successfully:", response);
    rows.value = response;
    loading.value = false;
  } else {
    console.error("Error fetching data");
    loading.value = false;
  }
};

const onUpdateMainPage = (id, val) => {
  $q.dialog({
    title: "Update Main Page",
    message: "Are you sure you set this as the main page?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const response = await postData(
      "put",
      null,
      `fpmanager/updateMainPage/${id}/${val}`
    );
    if (response) {
      $q.notify({
        type: "positive",
        message: "Main page updated successfully",
      });
      getData();
    } else {
      $q.notify({
        type: "negative",
        message: "Failed to update main page",
      });
    }
  });
};

const onClickDeleteForm = (id) => {
  $q.dialog({
    title: "Delete Form",
    message: "Are you sure you want to delete this form?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const response = await postData("delete", null, `cms/forms/${id}`);
    if (response) {
      $q.notify({
        type: "positive",
        message: "Form deleted successfully",
      });
      getData();
    } else {
      $q.notify({
        type: "negative",
        message: "Failed to delete form",
      });
    }
  });
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

const onClickAddTag = async (row) => {
  const getListTags = await getDataTags();

  console.log("Get List Tags:", getListTags);
  let tagsList = [];
  if (getListTags && getListTags.length > 0) {
    tagsList = getListTags.map((tag) => ({
      label: `${tag.name} (${tag.desc})`,
      value: tag.name,
      desc: tag.desc,
      slug: tag.slug,
    }));
  }

  console.log("Tags List:", tagsList);

  $q.dialog({
    component: multiplePromptDialog,
    componentProps: {
      title: "User Details",
      initialFields: [
        {
          name: "tagsName",
          label: "Tags Name",
          type: "select",
          options: tagsList,
          multiple: true,
          default: row.tags || [],
          rules: [
            (val) => !!val || "Field is required",
            (val) =>
              /^[A-Za-z0-9]+$/.test(val) ||
              "No spaces or special characters allowed",
          ],
        },
      ],
      addable: true,
      removable: true,
    },
  }).onOk(async (payload) => {
    console.log("Submitted:", payload);

    loading.value = true;
    try {
      const response = await postData(
        "post",
        {
          id: row.id,
          tags: payload.tagsName,
        },
        `fpmanager/saveTags`
      );

      if (response) {
        $q.notify({
          type: "positive",
          message: "Tags saved successfully",
        });
        getData();
      } else {
        $q.notify({
          type: "negative",
          message: "Failed to save tags",
        });
      }
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to save tags",
      });
      return;
    } finally {
      loading.value = false;
    }
  });
};

const onRowClick = (row) => {
  if (modes.value == 2) {
    $q.dialog({
      title: "Post Selected",
      message: `You have selected the post: ${row.cfmt_title}`,
      ok: true,
    }).onOk(() => {
      onDialogOK({
        id: row.id,
        title: row.cfmt_title,
        url: row.url,
        desc: row.desc,
        order: "",
      });
    });
  }
};

const onClickTagsManage = () => {
  $q.dialog({
    component: tagsManageView,
    componentProps: {
      mode: 1,
    },
    transitionShow: "slide-up",
    transitionHide: "slide-down",
    persistent: true,
  }).onDismiss(() => {
    getData();
  });
};

const onClickRemoveTag = (id, tag) => {
  $q.dialog({
    title: "Remove Tag",
    message: `Are you sure you want to remove the tag "${tag}" from this post?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    try {
      const response = await postData(
        "delete",
        null,
        `fpmanager/removeTag/${id}/${tag}`
      );
      if (response) {
        $q.notify({
          type: "positive",
          message: "Tag removed successfully",
        });
        getData();
      } else {
        $q.notify({
          type: "negative",
          message: "Failed to remove tag",
        });
      }
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to remove tag",
      });
    } finally {
      loading.value = false;
    }
  });
};

const onUpdatePublishPost = (id, state) => {
  $q.dialog({
    title: "Publish Post",
    message: `Are you sure you want to ${
      state ? "publish" : "unpublish"
    } this post?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    try {
      const response = await postData(
        "get",
        null,
        `fpmanager/publishPost/${id}/${state ? 1 : 0}`
      );
      if (response) {
        $q.notify({
          type: "positive",
          message: `Post ${state ? "published" : "unpublished"} successfully`,
        });
        getData();
      } else {
        $q.notify({
          type: "negative",
          message: `Failed to ${state ? "publish" : "unpublish"} post`,
        });
      }
    } catch (error) {
      $q.notify({
        type: "negative",
        message: `Failed to ${state ? "publish" : "unpublish"} post`,
      });
    } finally {
      loading.value = false;
    }
  });
};

const getDataForms = async (id) => {
  try {
    const response = await postData("get", null, `cms/viewByID/${id}`);

    if (response) {
      return response.data;
      // dataForms.value = response.data.value;
    } else {
      console.error("Failed to fetch forms data");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const onClickCopyForm = (id, row) => {
  $q.dialog({
    title: "Copy Post",
    message: "Are you sure you want to copy this post?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    try {
      const getForms = await getDataForms(id);

      if (!getForms) {
        $q.notify({
          type: "negative",
          message: "Failed to fetch forms data",
        });
        loading.value = false;
        return;
      }

      // console.log("Get Forms Data:", getForms);
      const posts = {
        idRef: "", // Add idRef if needed, or set to actual value
        forms: getForms.value.forms,
        title: getForms.value.title,
        desc: getForms.value.desc,
        isQuiz: 3, // Set as needed
        setupTraining: null, // Set as needed
        shareForms: null, // Set as needed
        shareFormsIsMainMenu: null, // Set as needed
        shareFormsIsRoles: null, // Set as needed
        selectedSharedMenu: null, // Set as needed
        shareFormsMenuIcon: null, // Set as needed
        tags: row.tags || [], // Use existing tags or set to empty array
      };

      console.log("Posts Data to Copy:", posts);

      const response = await postData(
        "post",
        posts,
        "cms/forms",
        false,
        false,
        true
      );
      if (response) {
        $q.notify({
          type: "positive",
          message: "Post copied successfully",
        });
        getData();
      } else {
        $q.notify({
          type: "negative",
          message: "Failed to copy post",
        });
      }
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to copy post",
      });
    } finally {
      loading.value = false;
    }
  });
};
</script>
