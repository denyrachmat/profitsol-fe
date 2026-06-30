<template>
  <div>
    <!-- =========================================================
      1) HISTORY MODE (MRS report)
      ========================================================= -->
    <div class="row q-gutter-md" v-if="shouldShowHistoryReport">
      <div class="col">
        <tableReport
          :idReport="connectedMRSVal.id"
          :TableTitle="connectedMRSVal.mrm_name"
          :idForms="props.id"
          :isAPIExport="props.setup?.allowAPISearchData || false"
          :maxAPIOpt="props.setup?.APISearchQuota || 0"
          :is-add-active-period="periodStateChecker"
          :activate-multiple-create="multipleFormSetup"
        />
      </div>
    </div>

    <div
      v-if="props.setup?.renderMode === 'multiple' && !shouldShowHistoryReport"
      class="row q-gutter-md"
    >
      <div class="col">
        <showComponentAsChecklistVue
          :data="forms"
          :is-multiple-mode="multipleFormSetup"
          :enable-delete-instance="
            convertToBoolean(props.setup?.enableMultipleDelete || true)
          "
          :max-instances="props.setup?.maxMultipleCreate || 10"
          @answerChange="
            (payload) =>
              onAnswerChange(payload.rowIdx, payload.fieldId, payload.value)
          "
          @addNewInstance="onClickAddAnswer"
          @removeInstance="onClickRemoveAnswerInstance"
          @submitData="onSubmitData"
        />
      </div>
    </div>
    <!-- =========================================================
      2) LIVE MODE (render form / html / posts / files / quiz)
      ========================================================= -->
    <template v-else-if="!shouldShowHistoryReport">
      <div v-if="getNowData.length > 0" :style="contentWrapperStyle">
        <!-- Batch upload button (optional) -->
        <div class="row" v-if="uploaderUsersList">
          <div class="col text-right">
            <q-btn
              color="primary"
              icon="file_upload"
              label="Batch Upload"
              @click="onClickBatchUpload"
            />
            <q-btn
              color="secondary"
              icon="file_download"
              label="Download Template"
              class="q-ml-sm"
              @click="onClickDownloadTemplate"
            />
            <q-btn
              color="accent"
              icon="add"
              label="Add new answer"
              class="q-ml-sm"
              @click="onClickAddAnswer"
              :disable="preventClears || props.preventClear"
            />
          </div>
        </div>

        <div style="height: 100%">
          <!-- Header card (optional) -->
          <div class="row" v-if="props.useHeader">
            <div class="col">
              <q-card class="bg-white shadow-1 rounded-borders" bordered>
                <q-card-section>
                  <div class="text-h6">{{ props.headersComp.title }}</div>
                  <div class="text-subtitle2">
                    {{ props.headersComp.description }}
                  </div>

                  <!-- Author + Subscribe -->
                  <div class="text-caption text-italic">
                    By:
                    <q-chip
                      outline
                      color="primary"
                      icon="person"
                      class="q-mr-sm"
                    >
                      {{ props.headersComp.author }}
                      <q-btn
                        icon="person_add"
                        flat
                        dense
                        size="sm"
                        :color="authorSubscribeColor"
                        class="q-ml-sm"
                        @click="
                          () => onSubscribed('users', props.headersComp.author)
                        "
                        :disable="isAuthorSubscribed"
                      >
                        <q-tooltip v-if="isAuthorSubscribed">
                          You already subscribed
                        </q-tooltip>
                      </q-btn>
                    </q-chip>
                    -
                    {{ timeAgo(props.headersComp.date) }}
                  </div>

                  <!-- Categories + tags + subscribe -->
                  <div class="text-caption text-italic">
                    Category:
                    <template v-if="props.tags && props.tags.length > 0">
                      <q-chip
                        class="q-mr-sm"
                        outline
                        color="primary"
                        v-for="tag in props.tags"
                        :key="tag.id ?? tag"
                      >
                        <div class="row">
                          <div class="col">
                            {{ tag }}
                          </div>
                          <div class="col q-pl-sm text-right">
                            <q-btn
                              icon="add_alert"
                              flat
                              dense
                              size="sm"
                              :color="
                                checkSubscribed('categories', tag)
                                  ? 'grey'
                                  : 'primary'
                              "
                              @click="() => onSubscribed('categories', tag)"
                              :disable="checkSubscribed('categories', tag)"
                            >
                              <q-tooltip
                                v-if="checkSubscribed('categories', tag)"
                              >
                                You already subscribed
                              </q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                      </q-chip>
                    </template>

                    <q-chip class="q-mr-sm" outline color="grey" v-else>
                      <div class="row">
                        <div class="col">Uncategorize</div>
                      </div>
                    </q-chip>

                    Tags:
                    <q-chip
                      class="q-mr-sm"
                      outline
                      color="secondary"
                      v-for="hashtag in props.hashTags"
                      :key="hashtag"
                    >
                      <div class="row">
                        <div class="col">
                          {{ hashtag }}
                        </div>
                        <div class="col q-pl-sm text-right">
                          <q-btn
                            icon="add_alert"
                            flat
                            dense
                            size="sm"
                            color="primary"
                            @click="() => onSubscribed('tags', hashtag)"
                          />
                        </div>
                      </div>
                    </q-chip>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- =========================================================
            2A) Render each "row" in current sequence
            ========================================================= -->
          <div
            class="row"
            v-for="(row, rowIdx) in getNowData"
            :key="'row-' + rowIdx"
          >
            <template
              v-for="(col, colIdx) in row.content"
              :key="'col-' + col.id"
            >
              <div
                v-if="!col.hidden"
                :class="getColClass(row, col)"
                style="word-wrap: break-word; overflow-wrap: break-word"
              >
                <q-card
                  class="bg-white shadow-1 rounded-borders"
                  :bordered="props.useCardSeparator"
                  :flat="!props.useCardSeparator"
                  style="width: 100%; height: 100%"
                >
                  <q-card-section>
                    <!-- ========= FORM COMPONENT ========= -->
                    <componentViewVue
                      v-if="col.type === 'form'"
                      :type="col.content.component.category"
                      :type-input="col.content.component.value.type"
                      :comp="col.content.component.value.comp"
                      :label="
                        col.required
                          ? `${col.content.label} *`
                          : col.content.label
                      "
                      :detail="col.content.detail_data"
                      :is-required="col.required"
                      mode="live"
                      @customChange="
                        (val) => onAnswerChange(rowIdx, col.id, val)
                      "
                      :ans="getAnswer(rowIdx, col.id)"
                      :ansArr="getAnswerArr(rowIdx, col.id)"
                      :apiOpt="col.content.component.apiOpt"
                      :readonly="col.readonly"
                    />

                    <!-- ========= HTML BLOCK ========= -->
                    <div v-else-if="col.type === 'html'">
                      <!-- WARNING: processHtml() injects styles + runs scripts (XSS risk).
                           Use only for trusted HTML sources. -->
                      <div v-html="processHtml(col.content)"></div>
                    </div>

                    <!-- ========= POSTS BLOCK ========= -->
                    <div
                      v-else-if="col.type === 'posts'"
                      :key="'posts-' + refreshedPosts"
                    >
                      <div class="text-center" v-if="col.loadingPosts">
                        <q-spinner-dots color="primary" size="lg" />
                      </div>

                      <template v-else>
                        <!-- Render last/current post as embedded form (optional) -->
                        <div class="row" v-if="shouldShowEmbeddedLastPost(col)">
                          <div class="col">
                            <showComponent
                              :data="col.currentPost.forms"
                              v-if="
                                col.currentPost &&
                                col.currentPost.id &&
                                col.currentPost.forms
                              "
                              :setup="col.currentPost.setupTraining"
                              :id="col.currentPost.id"
                              :showFormOnly="true"
                              :preventClear="true"
                              :removeButton="true"
                              :isFullHeight="true"
                              :preventLoops="true"
                            />
                          </div>
                        </div>

                        <!-- List / All mode -->
                        <template
                          v-if="
                            col.content.mode === 'list' ||
                            col.content.mode === 'all'
                          "
                        >
                          <div class="row q-pb-md">
                            <div class="col text-h5 text-bold">
                              <span class="text-h6">
                                {{
                                  col.content.title ??
                                  `Posts with category: ${col.content.tags.join(
                                    ", "
                                  )}`
                                }}
                              </span>
                              <br />
                              <span class="text-subtitle2">
                                {{
                                  col.content.desc ??
                                  `All posts: ${col.content.tags.join(", ")}`
                                }}
                              </span>
                            </div>

                            <div class="col text-right">
                              <q-chip
                                class="q-mr-sm cursor-pointer"
                                outline
                                color="primary"
                                clickable
                                v-for="tag in col.content.tags"
                                :key="tag.id ?? tag"
                                @click="() => onClickTag(tag)"
                              >
                                {{ tag }}
                              </q-chip>
                            </div>
                          </div>

                          <!-- Grid layout -->
                          <template v-if="col.content.layout === 'grid'">
                            <q-carousel
                              v-model="slide[rowIdx][colIdx]"
                              transition-prev="scale"
                              transition-next="scale"
                              swipeable
                              animated
                              control-color="white"
                              navigation
                              padding
                              arrows
                              height="60%"
                              class="bg-primary shadow-1 rounded-borders"
                              v-if="col.postsList.length > 0"
                            >
                              <q-carousel-slide
                                v-for="(postHead, postIdx) in col.postsList"
                                :name="postIdx"
                                :key="postIdx"
                              >
                                <div class="row">
                                  <div
                                    :class="`col-${
                                      12 / (col.content.perSlide || 1)
                                    } q-pa-sm`"
                                    v-for="(post, idxDet) in postHead"
                                    :key="idxDet"
                                  >
                                    <q-card class="my-card">
                                      <img
                                        :src="
                                          post.image ||
                                          'https://cdn.quasar.dev/img/mountains.jpg'
                                        "
                                        style="height: 200px; object-fit: cover"
                                      />

                                      <q-card-section>
                                        <div class="text-h6">
                                          {{ post.cfmt_title }}
                                        </div>
                                        <div class="text-subtitle">
                                          by {{ post.p_u_username }} on
                                          {{
                                            new Date(
                                              post.created_at
                                            ).toLocaleDateString()
                                          }}
                                        </div>
                                      </q-card-section>

                                      <q-card-section
                                        class="q-pt-none text-grey"
                                      >
                                        {{ post.desc }}
                                      </q-card-section>

                                      <q-card-actions>
                                        <q-btn
                                          flat
                                          color="primary"
                                          @click="() => openPost(post)"
                                        >
                                          Read More
                                        </q-btn>
                                      </q-card-actions>
                                    </q-card>
                                  </div>
                                </div>
                              </q-carousel-slide>
                            </q-carousel>

                            <div v-else class="col text-center">
                              No posts available.
                            </div>
                          </template>

                          <!-- List layout -->
                          <template v-else>
                            <q-list
                              bordered
                              v-for="(post, postIdx) in col.postsList"
                              :key="postIdx"
                            >
                              <div
                                class="row"
                                v-if="post.categories_users.length !== 0"
                              >
                                <div class="col">
                                  <div
                                    class="q-mb-sm"
                                    style="height: 4px; border-radius: 2px"
                                    :style="{
                                      background: `linear-gradient(90deg, #4caf50, #66bb6a, #4caf50, #66bb6a)`,
                                    }"
                                  />
                                </div>
                              </div>

                              <q-item
                                clickable
                                v-ripple
                                :class="{
                                  'my-blink-animation':
                                    post.categories_users &&
                                    post.categories_users.length !== 0,
                                }"
                                @click="() => openPost(post)"
                              >
                                <q-item-section class="col-2">
                                  <q-img
                                    :src="post.image"
                                    style="
                                      width: 100%;
                                      height: 150px;
                                      object-fit: cover;
                                      border-radius: 12px;
                                    "
                                    v-if="post.image"
                                  />
                                  <q-img
                                    src="~assets/10167807.jpg"
                                    style="
                                      width: 100%;
                                      height: 150px;
                                      object-fit: cover;
                                      border-radius: 12px;
                                    "
                                    v-else
                                  />
                                </q-item-section>

                                <q-item-section class="col-8">
                                  <q-item-label
                                    class="text-h4"
                                    v-if="post.categories_users"
                                  >
                                    <div
                                      v-html="post.categories_users.note"
                                    ></div>
                                  </q-item-label>

                                  <q-item-label class="text-h6">
                                    {{ post.cfmt_title }}
                                  </q-item-label>

                                  <q-item-label caption class="text-subtitle2">
                                    by
                                    <q-chip class="text-caption" color="orange">
                                      {{ post.p_u_username }}
                                    </q-chip>
                                    on
                                    <q-chip
                                      class="text-caption text-white"
                                      color="blue"
                                    >
                                      {{
                                        new Date(
                                          post.created_at
                                        ).toLocaleString()
                                      }}
                                    </q-chip>
                                  </q-item-label>

                                  <q-item-label class="text-grey">
                                    {{ post.desc }}
                                  </q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </template>

                          <!-- View all -->
                          <div class="q-pt-md">
                            <q-btn
                              style="width: 100%"
                              color="primary"
                              outline
                              @click="() => viewAllPosts(col)"
                            >
                              View All Posts
                            </q-btn>
                          </div>
                        </template>
                      </template>
                    </div>

                    <!-- ========= FILES / VIEWER BLOCK ========= -->
                    <div
                      v-else-if="
                        col.type === 'files' || col.type === 'files_viewer'
                      "
                    >
                      <div class="text-center" v-if="col.loadingPosts">
                        <q-spinner-dots color="primary" size="lg" />
                      </div>
                      <template v-else>
                        <exploreViewerIndex
                          :key="refreshedPosts"
                          :selected-data-detail="col.content.files ?? []"
                          :read-only="true"
                          :deleteable="false"
                          :shared-only="true"
                        />
                      </template>
                    </div>

                    <!-- ========= QUIZ/OTHER EMBEDDED FORM ========= -->
                    <div v-else>
                      <showQuizComponentVue
                        :data="col.content.forms"
                        :setup="col.content.setupTraining"
                        :id="col.content.id"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </div>

          <!-- =========================================================
            2B) Comments section (optional)
            ========================================================= -->
          <div
            class="row q-col-gutter-md q-pt-sm"
            v-if="props.useCommentSection"
          >
            <div class="col-12">
              <q-card
                :bordered="props.useCardSeparator"
                :flat="!props.useCardSeparator"
                style="width: 100%; height: 100%"
              >
                <q-card-section class="text-h6">
                  Comments Section
                </q-card-section>

                <q-card-section>
                  <div v-if="loadingComment" class="text-center">
                    <q-spinner-dots color="primary" size="40px" />
                    <p>Loading Comments, please wait...</p>
                  </div>

                  <div v-else class="bg-grey-2 q-pa-md rounded-borders">
                    <div
                      v-if="listComments.length === 0"
                      class="text-center text-grey-6 q-pa-md"
                    >
                      <q-icon
                        name="chat_bubble_outline"
                        size="48px"
                        class="q-mb-sm"
                      />
                      <div class="text-body1">No comments yet</div>
                      <div class="text-caption">Be the first to comment!</div>
                    </div>

                    <q-tree
                      v-else
                      :nodes="listComments"
                      node-key="idx"
                      default-expand-all
                      children-key="children"
                    >
                      <!-- Header node -->
                      <template v-slot:default-header="prop">
                        <div class="row items-center">
                          <q-avatar size="32px" class="q-mr-sm">
                            <img :src="getUserAvatar(prop.node)" />
                          </q-avatar>

                          <div>
                            <div class="text-weight-bold">
                              {{ prop.node.email }}
                            </div>
                            <div class="text-caption text-italic">
                              {{
                                new Date(
                                  prop.node.created_date
                                ).toLocaleString()
                              }}
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Body node -->
                      <template v-slot:default-body="prop">
                        <div class="q-mt-sm" style="color: #333">
                          <div
                            v-if="getCommentAttachments(prop.node).length > 0"
                          >
                            <div
                              class="q-mb-sm"
                              v-for="(att, attIdx) in getCommentAttachments(
                                prop.node
                              )"
                              :key="attIdx"
                            >
                              <q-chip
                                outline
                                color="primary"
                                class="cursor-pointer"
                                @click="onOpenAttachment(att)"
                                clickable
                              >
                                <q-icon name="attachment" class="q-mr-sm" />
                                {{ att.name }}
                              </q-chip>
                            </div>
                          </div>

                          <div v-html="getCommentHtml(prop.node)"></div>

                          <div class="q-pt-sm text-right">
                            <q-btn
                              outline
                              dense
                              icon="reply"
                              label="Reply"
                              @click="() => selectReply(prop.node)"
                              color="primary"
                            />

                            <template v-if="canEditComment(prop.node)">
                              <q-btn
                                outline
                                dense
                                icon="edit"
                                color="primary"
                                class="q-ml-sm"
                                @click="() => startEditComment(prop.node)"
                              />
                              <q-btn
                                outline
                                dense
                                icon="delete"
                                color="negative"
                                class="q-ml-sm"
                                @click="() => onDeleteComment(prop.node.id)"
                              />
                            </template>
                          </div>

                          <q-separator class="q-my-sm" />

                          <div
                            v-if="selectedReplyComment === prop.node.idx"
                            class="q-mt-sm"
                          >
                            <commentComponentVue
                              @submit="
                                (value) => onSubmitComment(value, prop.node)
                              "
                              @onCancel="resetReplyState"
                              :modelValue="selectedReplyContent"
                              :initial-attachments="selectedReplyAttachments"
                            />
                          </div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-card-section>

                <!-- New comment form -->
                <q-card-section>
                  <commentComponentVue
                    @submit="onSubmitComment"
                    v-if="authStore.isLoggedIn === true"
                  />
                  <div v-else class="text-center text-grey-6 q-pa-md">
                    <q-icon
                      name="chat_bubble_outline"
                      size="48px"
                      class="q-mb-sm"
                    />
                    <div class="text-body1">Please log in to comment</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <template v-else>
        <div class="row">
          <div class="col">Nothing to show.</div>
        </div>
      </template>

      <!-- =========================================================
        3) Wizard navigation actions (optional)
        ========================================================= -->
      <div class="absolute-bottom">
        <div class="row q-pt-sm">
          <div class="col flex flex-center">
            <q-pagination
              v-model="nowSeq"
              color="purple"
              :max="Object.values(getFormsBySeqName).length"
              :max-pages="6"
              boundary-numbers
            />
          </div>
        </div>
        <div class="row" v-if="!removeButtons">
          <div class="col">
            <q-btn-group spread>
              <q-btn
                color="accent"
                icon="arrow_back"
                :disable="getNowIdx === 0"
                @click="prevPage"
              />
              <q-btn
                color="green"
                icon="save"
                :disable="getNextData && getNextData.length !== 0"
                v-if="isFormsExists.length > 0"
                @click="onSubmitData"
              />
              <q-btn
                color="accent"
                icon="arrow_forward"
                @click="nextPage"
                :disable="!getNextData || getNextData.length === 0"
              />
            </q-btn-group>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
/**
 * =========================================================
 * Imports
 * =========================================================
 */
import {
  ref,
  defineProps,
  onMounted,
  computed,
  onBeforeUnmount,
  watch,
} from "vue";
import { useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";
import componentViewVue from "../componentView.vue";
import showQuizComponentVue from "./showQuizComponent.vue";

import { useFormStore } from "stores/formStore";
import { useAuthStore } from "src/stores/authStore";
import { useRoute } from "vue-router";

import tableReport from "../../MRS/Tables/indexTableReport.vue";
import exploreViewerIndex from "src/pages/DMS/ExploreViewer/exploreViewerIndex.vue";
import commentComponentVue from "src/pages/Frontpage/commentComponent.vue";
import uploadFilesIndex from "src/components/uploadFiles/index.vue";

import showComponentAsChecklistVue from "./showComponentAsChecklist.vue";

/**
 * =========================================================
 * Stores / Plugins
 * =========================================================
 */
const store = useFormStore();
const authStore = useAuthStore();
const $q = useQuasar();
const { postData } = apiRequest();
const route = useRoute();

/**
 * =========================================================
 * Props
 * =========================================================
 */
const props = defineProps({
  id: String,
  data: Array,
  setup: Object,
  showFormOnly: Boolean,
  preventClear: Boolean,
  removeButton: Boolean,
  fullHeight: {
    type: Boolean,
    default: false,
  },
  preventLoops: Boolean,
  tags: Array,
  hashTags: {
    type: Array,
    default: () => [],
  },
  useCardSeparator: Boolean,
  useHeader: {
    type: Boolean,
    default: false,
  },
  headersComp: {
    type: Object,
    default: () => ({
      title: "Component",
      description: "Component for Forms",
      author: "STX Team",
      date: new Date().toLocaleDateString(),
    }),
  },
  subscribeList: {
    type: Array,
    default: () => [],
  },
  useCommentSection: {
    type: Boolean,
    default: false,
  },
  batchID: {
    type: String,
    default: null,
  },
});

/**
 * =========================================================
 * Local State (refs)
 * =========================================================
 */
const nowSeq = ref(null);
const forms = ref([]); // main data source rendered in template
const slide = ref([]); // carousel state per [rowIdx][colIdx]
const connectedMRSVal = ref(null);

const isMountedTriggered = ref(false);
const preventClears = ref(false);
const removeButtons = ref(false);
const isFullHeight = ref(false);
const isBulkUpload = ref(false);

const refreshedPosts = ref(0);

/**
 * Comments state
 */
const loadingComment = ref(false);
const listComments = ref([]);
const selectedReplyComment = ref(null);
const selectedReplyContent = ref("");
const selectedReplyAttachments = ref([]);

/**
 * =========================================================
 * Computed (derived state)
 * =========================================================
 */

/**
 * Wrapper style: keep scrollable if there is content.
 */
const contentWrapperStyle = computed(() => `max-height: 70%; overflow: auto;`);

/**
 * Determine whether we should show MRS report in history mode.
 */
const shouldShowHistoryReport = computed(() => {
  return (
    props.setup &&
    props.setup.isHistory == 1 &&
    connectedMRSVal.value &&
    !isShowFormOnly.value
  );
});

/**
 * NOTE: IMPORTANT FIX
 * Previously: ref(props.showFormOnly || true) => always true
 */
const isShowFormOnly = ref(!!props.showFormOnly);

/**
 * Current wizard index & data pages (rows filtered by seq_name)
 */
const getNowIdx = computed(() =>
  forms.value.findIndex((x) => x.seq_name == nowSeq.value)
);

const getNowData = computed(() =>
  forms.value.filter((x) => x.seq_name == nowSeq.value)
);

const getNextData = computed(() =>
  forms.value.filter((x) => x.seq_name == parseInt(nowSeq.value) + 1)
);

const getFormsBySeqName = computed(() => {
  const map = {};
  forms.value.forEach((form) => {
    if (!map[form.seq_name]) map[form.seq_name] = [];
    map[form.seq_name].push(form);
  });
  return map;
});

/**
 * Flatten form items (recursive): used by logic engine & validation
 */
const formItems = computed(() => {
  const result = [];

  const findForms = (items) => {
    (items || []).forEach((item) => {
      if (item?.type === "form") result.push(item);
      if (Array.isArray(item?.content)) findForms(item.content);
    });
  };

  findForms(forms.value);
  return result;
});

/**
 * User answers from store
 */
const getUserAnswers = computed(() => store.getUsersAnswerForm);

/**
 * Collect all logic rules from all form items
 * and attach the item id to each rule set.
 */
const getAllLogics = computed(() => {
  return formItems.value.flatMap((item) =>
    (item.logics || []).map((logic) => ({ ...logic, id: item.id }))
  );
});

/**
 * Determine if at least one form exists (used to show submit button)
 */
const isFormsExists = computed(() =>
  forms.value.filter((x) =>
    x.content?.length > 0
      ? x.content.filter((y) => y.type === "form").length > 0
      : []
  )
);

/**
 * Author subscribe state (header)
 */
const isAuthorSubscribed = computed(() =>
  checkSubscribed("users", props.headersComp.author)
);

const authorSubscribeColor = computed(() =>
  !isAuthorSubscribed.value ? "primary" : "grey"
);

/**
 * =========================================================
 * Lifecycle
 * =========================================================
 */
onMounted(async () => {
  // 1) init local forms from props
  forms.value = props.data || [];

  // 2) init slide matrix for carousels: each row has slide index per col
  slide.value = forms.value.map((row) =>
    Array.isArray(row.content) ? row.content.map(() => 0) : [0]
  );

  // 3) flags
  isFullHeight.value = props.fullHeight;
  preventClears.value = props.preventClear === true;
  isBulkUpload.value = !!(props.setup && props.setup.isBulkUpload);
  removeButtons.value = props.removeButton || false;

  // 4) wizard seq initialization
  if (props.setup && props.setup.isWizard) {
    nowSeq.value = forms.value?.[0]?.seq_name ?? "1";
  } else {
    // normalize seq_name if not wizard
    forms.value = updateRowSeqNames(forms.value, false);
    nowSeq.value = forms.value?.[0]?.seq_name ?? "1";
  }

  // 5) history mode: fetch connected MRS data
  if (props.setup && props.setup.isHistory == 1) {
    isShowFormOnly.value = !!props.showFormOnly;
    await getConnectedMRS(props.id);
  } else {
    connectedMRSVal.value = null;
  }

  // 6) restore default answers unless prevented
  if (!preventClears.value) {
    store.restoreDefault();
  } else {
    // 🟢 KHUSUS MODE EDIT: Paksa UI refreshedPosts berkedip agar watch di anak langsung membaca data store lama
    setTimeout(() => {
      refreshedPosts.value += 1;
    }, 100);
  }

  // 7) run logic engine on mount
  logicsChecker("onMounted");

  // 8) fetch posts blocks (if any)
  const postsTargets = findPostsColumns(forms.value);
  postsTargets.forEach(({ rowIdx, colIdx }) => getPostsData(rowIdx, colIdx));

  // 9) comments
  if (props.useCommentSection) {
    getComment();
  }

  // console.log(JSON.stringify(forms.value));
});

onBeforeUnmount(() => {
  isMountedTriggered.value = false;
});

/**
 * =========================================================
 * UI helpers (template-friendly)
 * =========================================================
 */

/**
 * Generate responsive column class.
 * - If col.width is numeric -> use it (col-md-x)
 * - Else -> divide equally based on row content length
 */
const getColClass = (row, col) => {
  const width =
    col?.width && !isNaN(Number(col.width))
      ? `col-md-${col.width}`
      : `col-md-${Math.floor(12 / (row?.content?.length || 1))}`;

  return ["col-12", "text-wrap", "break-all", width];
};

/**
 * Time-ago label for header
 */
const timeAgo = (dateInput) => {
  const createdDate = new Date(dateInput);
  const now = new Date();
  const diffInMs = now - createdDate;

  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

/**
 * =========================================================
 * Answer helpers (simplify :ans and :ansArr bindings)
 * =========================================================
 */

/**
 * Convert base64 data-url to File if needed (so file inputs can display correctly).
 */
const normalizeAnswer = (val) => {
  if (typeof val === "string" && val.startsWith("data:")) {
    return base64ToFile(val, getFileNamefromBase64(val));
  }
  return val ?? "";
};

/** Get scalar answer (non-array) for a field */
const getAnswer = (rowIdx, fieldId) => {
  const rowAns = getUserAnswers.value?.[rowIdx];
  const val = rowAns?.[fieldId];
  return Array.isArray(val) ? "" : normalizeAnswer(val);
};

/** Get array answer for a field */
const getAnswerArr = (rowIdx, fieldId) => {
  const rowAns = getUserAnswers.value?.[rowIdx];
  const val = rowAns?.[fieldId];
  return Array.isArray(val) ? normalizeAnswer(val) : "";
};

/**
 * Handle changes from input components.
 * - Store answer
 * - If File -> store as base64 data-url with filename embedded
 * - Trigger logic engine onInput for this field
 */
const onAnswerChange = (rowIdx, fieldId, value) => {
  const prev = getUserAnswers.value?.[rowIdx]?.[fieldId];

  // normalize previous comparison value
  const prevComparable =
    prev instanceof File
      ? prev.name
      : typeof prev === "string" && prev.startsWith("data:")
      ? getFileNamefromBase64(prev)
      : prev;

  // normalize current comparison value
  const currComparable = value instanceof File ? value.name : value;

  // If no change, still trigger logic (match previous behavior)
  if (prevComparable === currComparable) {
    logicsChecker("onInput", fieldId);
    return;
  }

  // If File, convert to base64 and attach filename
  if (value instanceof File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = String(e.target?.result || "");
      const base64WithFilename = attachFilenameToDataUrl(base64, value.name);

      store.addAnswersForm(rowIdx, fieldId, base64WithFilename);
      logicsChecker("onInput", fieldId);
    };
    reader.readAsDataURL(value);
    return;
  }

  // other types: store directly
  store.addAnswersForm(rowIdx, fieldId, value);
  logicsChecker("onInput", fieldId);
};

/**
 * Embed filename inside data-url if not already present.
 */
const attachFilenameToDataUrl = (dataUrl, filename = "file") => {
  if (!dataUrl.startsWith("data:")) return dataUrl;
  if (/filename=/.test(dataUrl)) return dataUrl;

  return dataUrl.replace(
    /^data:([^;]+);/,
    `data:$1;filename=${encodeURIComponent(filename)};`
  );
};

/**
 * Extract filename from data-url
 */
const getFileNamefromBase64 = (base64) => {
  const match = base64.match(/filename=([^;]+);?/);
  if (match && match[1]) return decodeURIComponent(match[1]);
  return "file";
};

/**
 * Convert base64 data-url to File
 */
const base64ToFile = (base64, filename) => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};

/**
 * =========================================================
 * Wizard navigation & submit
 * =========================================================
 */

/**
 * Collect quiz blocks from an array of rows.
 * (Kept from original behavior)
 */
const getQuizData = (data, key = 0, hasil = []) => {
  if (data?.[key]) {
    if (data[key].type == "quiz") {
      hasil.push(data[key]);
    } else {
      if (data[key].type === "row") {
        getQuizData(data[key].content, 0, hasil);
      } else {
        getQuizData(data, key + 1, hasil);
      }
    }

    if (data[key + 1]) getQuizData(data, key + 1, hasil);
    else return hasil;
  }
  return hasil;
};

/**
 * Get required form fields and their answers for current page.
 */
const getRequiredForm = (data, key = 0, rows = 0, hasil = []) => {
  if (data?.[key]) {
    if (data[key].type == "form" && data[key].required === true) {
      hasil.push({
        data: data[key],
        answers: getUserAnswers.value?.[rows]?.[key] ?? "",
      });
    } else {
      if (data[key].type === "row") {
        getRequiredForm(data[key].content, 0, key, hasil);
      } else {
        getRequiredForm(data, key + 1, rows, hasil);
      }
    }

    if (data[key + 1]) getRequiredForm(data, key + 1, rows, hasil);
  }
  return hasil;
};

/**
 * Go to next wizard page:
 * - block if required fields empty
 * - if next page contains quiz -> show confirm dialog
 */
const nextPage = (nextSeq = 0) => {
  console.log("masuk sini");
  const empties = getRequiredForm(getNowData.value).filter(
    (v) => v.answers === ""
  );

  if (empties.length > 0) {
    empties.forEach((valMap) => {
      $q.notify({
        message: `<b>${valMap.data.content.label}</b> is still empty, please fill this field`,
        color: "red",
        html: true,
      });
    });
    return false;
  }

  if (getQuizData(getNextData.value).length > 0) {
    $q.dialog({
      title: "Quiz Start",
      message:
        "If you click ok, quiz will be started immediately, do you want to continue ?",
      cancel: true,
      persistent: true,
    }).onOk(() => {
      nowSeq.value =
        parseInt(nextSeq) > 0 ? parseInt(nextSeq) : parseInt(nowSeq.value) + 1;
    });

    return false;
  }

  nowSeq.value =
    parseInt(nextSeq) > 0 ? parseInt(nextSeq) : parseInt(nowSeq.value) + 1;

  console.log(nowSeq.value);
};

const prevPage = () => {
  nowSeq.value = parseInt(nowSeq.value) - 1;
};

/**
 * Validate required fields across the whole form and submit answers.
 */
const onSubmitData = () => {
  const requiredFields = formItems.value.filter(
    (val) => val.required === true && val.type === "form"
  );

  // Flatten answers into a single object: { [fieldId]: answer }
  const flattenedAnswers = Object.assign({}, ...(getUserAnswers.value || []));

  // Detect missing required answers by field id existence
  const missing = requiredFields.filter(
    (field) => !(field.id in flattenedAnswers)
  );

  if (missing.length > 0) {
    missing.forEach((f) => {
      $q.notify({
        message: `<b>${f.content.label}</b> is still empty, please fill this field`,
        color: "red",
        html: true,
      });
    });
    return false;
  }

  console.log("Submitting answers", getUserAnswers.value);

  $q.dialog({
    title: "Confirm",
    message: "Would you like to submit this form ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const data = await postData(
      "post",
      {
        id: props.id,
        ans: getUserAnswers.value,
        batch_id: props.batchID,
      },
      "cms/storeAnswers",
      false,
      true,
      true
    );

    if (data) {
      store.restoreDefault();
      $q.notify({ message: data.message, color: "green", icon: "check" });

      // Optional download response
      if (data.data && data.data.length > 0) {
        data.data.forEach((valDownload) => {
          if (valDownload.opt && valDownload.opt.isDownload) {
            const link = document.createElement("a");
            link.href = valDownload.file_path;
            link.download = valDownload.opt.filename || "download";
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        });
      }
    }
  });
};

/**
 * =========================================================
 * Seq normalization helper
 * =========================================================
 */
const updateRowSeqNames = (data, add = false) => {
  return (data || []).map((row, index) => {
    // Only modify if it's a row
    if (row.type === "row") {
      return {
        ...row,
        seq_name: add ? (index + 1).toString() : "1",
      };
    }
    return row;
  });
};

watch(
  () => nowSeq.value,
  (newData, oldData) => {
    console.log(`Seq changed from ${oldData} to ${newData}`);
    if (newData !== oldData && parseInt(newData) > 1) {
      const check = nextPage(parseInt(newData));
      if (!check) {
        nowSeq.value = oldData; // revert if validation fails
      }
    }
  }
);

/**
 * =========================================================
 * Logic Engine (mini rule engine)
 * =========================================================
 *
 * - Each form item may contain "logics"
 * - logicsChecker(trigger, [id]) will evaluate rules:
 *   * "trigger" action: set initial state
 *   * "logic" action: compute conditions
 *   * "logic_only": changes boolean operator (|| / &&)
 *   * "result": if condition true -> modifyComponent(...)
 */
const logicsChecker = (triggerName, id = "") => {
  const list = id
    ? getAllLogics.value.filter((val) => val.id == id)
    : getAllLogics.value.filter((val) =>
        val.data?.some((x) => x.cfld_opr_ctrl === triggerName)
      );

  list.forEach((ruleSet) => {
    let logicResult = false;
    let lastOperation = "||";
    let pendingResultAction = null; // Penampung aksi result sementara

    ruleSet.data?.forEach((valLogic) => {
      // 1. Amankan Pemicu Utama (Trigger)
      if (
        valLogic.cfld_actions === "trigger" &&
        valLogic.cfld_opr_ctrl === triggerName
      ) {
        logicResult = true;
        if (triggerName === "onMounted") {
          isMountedTriggered.value = true;
        }
      }

      // 2. Evaluasi Kondisi Tambahan (Logic / User Check)
      if (valLogic.cfld_actions === "logic") {
        const isConditionMatch = logicsConditionalChecker(ruleSet.id, valLogic);

        // Jika ini pengecekan user (whitelist), dia harus mendominasi hasil akhir
        if (valLogic.cfld_opr_ctrl === "user") {
          logicResult = isConditionMatch; // Override total berdasarkan hak akses user
        } else {
          const combine = new Function("a", "b", `return a ${lastOperation} b`);
          logicResult = combine(logicResult, isConditionMatch);
        }
      }

      // 3. Simpan Operator Logika
      if (valLogic.cfld_actions === "logic_only") {
        lastOperation = valLogic.cfld_opr;
      }

      // 4. Tampung dulu aksinya, jangan langsung dieksekusi di tengah jalan
      if (valLogic.cfld_actions === "result") {
        pendingResultAction = valLogic;
      }
    });

    // 5. EKSEKUSI AKHIR: Jalankan aksi hanya jika hasil akhir evaluasi bernilai TRUE
    if (logicResult === true && pendingResultAction) {
      modifyComponent(
        ruleSet.id,
        pendingResultAction.withAction || pendingResultAction.cfld_res, // fallback pengaman nama properti
        pendingResultAction.cfld_val
      );
    }
  });
};

/**
 * 1. FIX TOMBOL TAMBAH BARIS (Langsung Nambah pada Klik Pertama)
 */
const onClickAddAnswer = () => {
  if (props.setup?.renderMode === "multiple") {
    // 1. Hitung jumlah instance baris aktif di store saat ini
    const currentAnswers = Object.assign({}, store.getUsersAnswerForm);
    const currentInstances = Object.keys(currentAnswers).length;
    const maxAllowed = props.setup?.maxMultipleCreate || 10;

    if (currentInstances >= maxAllowed) {
      $q.notify({
        message: "Batas maksimal baris form telah tercapai!",
        color: "red",
        icon: "warning",
      });
      return;
    }

    const nextIndex = currentInstances; // Indeks baris baru (misal: 1)

    // 2. Kumpulkan SEMUA field ID yang ada di skema halaman ini
    const activeFieldIds = [];
    if (props.data && props.data.length > 0) {
      props.data.forEach((row) => {
        if (Array.isArray(row.content)) {
          row.content.forEach((col) => {
            if (col.type === "form" && col.id) {
              activeFieldIds.push(col.id);
            }
          });
        }
      });
    }

    // 3. JALUR UTAMA REAKTIVITAS: Daftarkan seluruh field ke store Pinia sekaligus
    if (activeFieldIds.length > 0) {
      activeFieldIds.forEach((fieldId) => {
        // Suntikkan string kosong ke setiap field ID di baris indeks baru ini
        store.addAnswersForm(nextIndex, fieldId, "");
      });
    } else {
      // Fallback menggunakan jangkar komponen darurat jika skema kosong
      let fallbackAnchorId = props.data?.[0]?.content?.[0]?.id;
      if (fallbackAnchorId) {
        store.addAnswersForm(nextIndex, fallbackAnchorId, "");
      } else {
        $q.notify({
          message: "Gagal mendeteksi komponen kolom formulir.",
          color: "red",
          icon: "error",
        });
        return;
      }
    }

    $q.notify({
      message: "Baris form baru berhasil ditambahkan",
      color: "green",
      icon: "add",
    });
  } else {
    // Jalur normal wizard bawaan kamu yang lama
    let getLastSeqName = getNowData.value
      .map((x) => x.seq_name)
      .sort((a, b) => b - a)[0];

    getNowData.value.forEach((row) => {
      forms.value.push({
        ...row,
        seq_name: (parseInt(getLastSeqName) + 1).toString(),
      });
    });

    $q.notify({
      message: "New wizard page added",
      color: "green",
      icon: "check",
    });
  }

  // 4. Paksa penyegaran state global
  refreshedPosts.value += 1;
};

/**
 * 2. FIX TOMBOL HAPUS BARIS (Bebas dari Error Proxy Handler False)
 */
const onClickRemoveAnswerInstance = (index) => {
  // 1. Kloning data store ke dalam objek lokal biasa agar bebas dari proteksi Proxy Read-Only
  const currentAnswers = Object.assign({}, store.getUsersAnswerForm);

  if (currentAnswers[index] !== undefined) {
    // 2. Hapus data pada objek lokal (Aman, tidak akan memicu error proxy handler)
    delete currentAnswers[index];

    // 3. Susun ulang urutan indeks agar tetap berurutan (0, 1, 2) tanpa melompat
    const remainingAnswers = Object.values(currentAnswers);

    // 4. Kosongkan dulu store jawaban lama melalui siklus restore/clear bawaan store kamu jika ada,
    // atau kita timpa isinya satu per satu menggunakan loop mutator resmi
    store.restoreDefault();

    // 5. Masukkan kembali data yang tersisa ke dalam store lewat jalur resmi
    remainingAnswers.forEach((rowAnswers, newRowIdx) => {
      Object.keys(rowAnswers).forEach((fieldId) => {
        store.addAnswersForm(newRowIdx, fieldId, rowAnswers[fieldId]);
      });
    });

    $q.notify({
      message: "Baris berhasil dihapus",
      color: "orange",
      icon: "delete",
    });

    // 6. Paksa render ulang UI agar baris di layar langsung berkurang seketika
    refreshedPosts.value += 1;
  }
};

/**
 * Evaluate a single conditional logic entry against current answers.
 */
const logicsConditionalChecker = (idComp, data) => {
  console.log(`Evaluating logic for comp ${idComp} with condition`, data);
  /// 1. Jika tipenya pengecekan user login, langsung kembalikan boolean hasil include
  if (data.cfld_opr_ctrl === "user") {
    try {
      // Ubah semua list email di DB menjadi lowercase
      const allowedUsers = JSON.parse(data.cfld_val).map((x) =>
        x.trim().toLowerCase()
      );

      // Ambil username login saat ini dan ubah ke lowercase
      const currentUsername = (
        authStore.getDetails?.username ||
        authStore.authDet?.username ||
        ""
      ).toLowerCase();

      console.log(
        `[USER CHECK] Allowed:`,
        allowedUsers,
        `| Current:`,
        currentUsername
      );

      return allowedUsers.includes(currentUsername);
    } catch (e) {
      console.error("Gagal parse json cfld_val untuk user:", e);
      return false;
    }
  }

  // --- Logika bawaan untuk tipe selain "user" ---
  const getAnswersofComp = Object.values(getUserAnswers.value || {}).find(
    (val) => val?.[idComp] !== undefined
  )?.[idComp];

  let valueComparation;
  if (data.cfld_opr_ctrl === "value") {
    valueComparation = data.cfld_val;
  } else {
    valueComparation = getUserAnswers.value.find(
      (val) => val?.[data.cfld_val] !== undefined
    );
  }

  // Bungkus perbandingan dengan pengaman string/tipe data jika diperlukan
  const compare = new Function("a", "b", `return a ${data.cfld_opr} b`);

  console.log(
    `Logic check for comp ${idComp}: compare ${getAnswersofComp} with ${valueComparation} using operator ${
      data.cfld_opr
    } result: ${compare(getAnswersofComp, valueComparation)}`
  );

  return compare(getAnswersofComp, valueComparation);
};

/**
 * Apply modification to components:
 * - hide/show this component
 * - hide/show another component (targetModifID)
 *
 * Also updates forms.value so Vue reactivity can refresh UI.
 */
const modifyComponent = (idComp, modifData, targetModifID = 0) => {
  // 1. Update state utama di formItems
  formItems.value = formItems.value.map((item) => {
    let updatedItem = { ...item };

    // JIKA AKSI BERLAKU UNTUK DIRI SENDIRI
    if (item.id == idComp) {
      if (modifData === "hide_this_comp") updatedItem.hidden = true;
      if (modifData === "show_this_comp") updatedItem.hidden = false;
      if (modifData === "readonly_comp") updatedItem.readonly = true; // Tambahan pengaman self-readonly
      if (modifData === "readonly_comp_disabled") updatedItem.readonly = false;
      if (modifData === "required_comp") updatedItem.required = true;
      if (modifData === "required_comp_disabled") updatedItem.required = false;
    }

    // JIKA AKSI BERLAKU UNTUK TARGET KOMPONEN LAIN
    if (targetModifID && item.id == targetModifID) {
      if (modifData === "hide_comp") updatedItem.hidden = true;
      if (modifData === "show_comp") updatedItem.hidden = false;
      if (modifData === "readonly_comp") updatedItem.readonly = true;
      if (modifData === "readonly_comp_disabled") updatedItem.readonly = false;
      if (modifData === "required_comp") updatedItem.required = true;
      if (modifData === "required_comp_disabled") updatedItem.required = false;
    }
    return updatedItem;
  });

  // 2. Paksa update ke dalam forms.value agar getNowData (computed) terpicu secara reaktif di HTML
  forms.value = forms.value.map((row) => {
    if (Array.isArray(row.content)) {
      return {
        ...row,
        content: row.content.map((col) => {
          let updatedCol = { ...col };

          // Aturan A: Pengaruh langsung ke diri sendiri (idComp)
          if (col.id == idComp) {
            if (modifData === "hide_this_comp") updatedCol.hidden = true;
            if (modifData === "show_this_comp") updatedCol.hidden = false;
            if (modifData === "readonly_comp") updatedCol.readonly = true; // Amankan jika default-nya self-readonly
            if (modifData === "editable_comp") updatedCol.readonly = false;
          }

          // Aturan B: Pengaruh ke komponen target lain (targetModifID)
          if (targetModifID && col.id == targetModifID) {
            if (modifData === "hide_comp") updatedCol.hidden = true;
            if (modifData === "show_comp") updatedCol.hidden = false;
            if (modifData === "readonly_comp") updatedCol.readonly = true;
            if (modifData === "editable_comp") updatedCol.readonly = false;
          }
          return updatedCol;
        }),
      };
    }
    return row;
  });

  console.log(
    `[LOGIC ENGINE] Applied change: ${modifData} on Comp ID: ${idComp} (Target ID: ${targetModifID})`
  );
};

/**
 * =========================================================
 * History: Connected MRS
 * =========================================================
 */
const getConnectedMRS = async (id) => {
  const data = await postData(
    "get",
    null,
    `cms/getConnectedMRS/${id}`,
    false,
    true,
    true
  );
  if (data) connectedMRSVal.value = data;
};

/**
 * =========================================================
 * Posts engine
 * =========================================================
 */

/**
 * Scan top-level rows to find any column with type === 'posts'
 * Return list of targets: [{rowIdx, colIdx}, ...]
 */
const findPostsColumns = (rows = []) => {
  const result = [];
  rows.forEach((row, rowIdx) => {
    (row.content || []).forEach((col, colIdx) => {
      if (col?.type === "posts") result.push({ rowIdx, colIdx });
    });
  });
  return result;
};

/**
 * Template helper: show embedded "last post" form (when allowed)
 */
const shouldShowEmbeddedLastPost = (col) => {
  return (
    !props.preventLoops &&
    col.currentPost &&
    col.currentPost.forms?.length > 0 &&
    (col.content.mode === "last" || col.content.mode === "all")
  );
};

/**
 * Open a post into store CMS page chooser
 */
const openPost = (post) => {
  store.setCMSPageChoosed({ ...post, type: "posts" });
};

/**
 * Navigate to "View All Posts" page
 */
const viewAllPosts = (col) => {
  store.setCMSPageChoosed({
    type: "tags",
    tags: col.content.tags,
    limit: col.content.limit ? col.content.limit : 5,
    orderBy:
      col.content.orderBy?.length > 0 ? col.content.orderBy : "created_at",
    order: col.content.order?.length > 0 ? col.content.order : "desc",
  });
};

/**
 * Fetch and enrich posts data for a single posts column.
 * Flow:
 * 1) Fetch list of posts by tags + sorting.
 * 2) If mode=last/all -> fetch detail for first post and embed its forms.
 * 3) Else -> fetch each post detail to extract image + excerpt text.
 * 4) If layout=grid -> chunk posts by perSlide.
 */
const getPostsData = async (rowIdx, colIdx) => {
  const dataContent = forms.value?.[rowIdx]?.content?.[colIdx];
  if (!dataContent) return;

  forms.value[rowIdx].content[colIdx].loadingPosts = true;

  const response = await postData(
    "post",
    {
      id: "post",
      tags: btoa(JSON.stringify(dataContent.content.tags || [])),
      orderBy: [{ [dataContent.content.orderBy]: dataContent.content.order }],
      limit: dataContent.content.maxShow || 3,
      isPublisedOnly: 1,
    },
    "cms/formsDetail"
  );

  if (!response) {
    forms.value[rowIdx].content[colIdx].loadingPosts = false;
    return;
  }

  dataContent.postsList = response.filter((item) => item.is_published === 1);
  const fetchedPostsList = dataContent.postsList;

  // Fetch last post detail
  if (
    dataContent.content.mode === "last" ||
    dataContent.content.mode === "all"
  ) {
    if (fetchedPostsList.length > 0) {
      const getForms = await postData(
        "get",
        null,
        `cms/viewByID/${fetchedPostsList[0].id}`,
        false,
        false,
        true
      );

      if (getForms?.data?.value) {
        forms.value[rowIdx].content[colIdx].currentPost = getForms.data.value;
      }
    }
    forms.value[rowIdx].content[colIdx].loadingPosts = false;
    refreshedPosts.value += 1;
    return;
  }

  // Otherwise, enrich each post with image + excerpt from detail HTML
  await Promise.all(
    fetchedPostsList.map(async (val, idx) => {
      const getForms = await postData(
        "get",
        null,
        `cms/viewByID/${val.id}`,
        false,
        false,
        true
      );

      const html = getForms?.data?.value?.forms?.[0]?.content?.[0]?.content;
      if (!html) return;

      // Extract first image src
      const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
      const matches = [...String(html).matchAll(imageRegex)];

      const decodeHtmlEntities = (str) => {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = str;
        return textarea.value;
      };

      forms.value[rowIdx].content[colIdx].postsList[idx].image =
        matches.length > 0 ? decodeHtmlEntities(matches[0][1]) : null;

      // Extract plain text (simple)
      const contentRegex = /<[^>]*>|&[^;]+;/g;
      const cleanContent = String(html).replace(contentRegex, "").trim();

      forms.value[rowIdx].content[colIdx].postsList[idx].desc =
        cleanContent.substring(0, 150) +
        (cleanContent.length > 150 ? "..." : "");
    })
  );

  // If grid layout: chunk by perSlide
  if (dataContent.content.layout === "grid") {
    const perSlide = dataContent.content.perSlide || 1;
    const chunked = [];
    for (let i = 0; i < dataContent.postsList.length; i += perSlide) {
      chunked.push(dataContent.postsList.slice(i, i + perSlide));
    }
    forms.value[rowIdx].content[colIdx].postsList = chunked;
  }

  forms.value[rowIdx].content[colIdx].loadingPosts = false;
  refreshedPosts.value += 1;
};

/**
 * =========================================================
 * Subscription helpers (Header & Tags)
 * =========================================================
 */
const onSubscribed = async (methods = "users", data) => {
  if (!authStore.isLoggedIn) {
    $q.notify({
      message: "You need to login first before subscribe",
      color: "negative",
      icon: "warning",
    });
    return;
  }

  try {
    const subscribeData = await postData(
      "post",
      {
        type: methods,
        id: data,
        user_id: authStore.authDet.username,
      },
      "fpmanager/subscribe",
      false,
      true,
      true
    );

    $q.notify({
      message: subscribeData.message,
      color: "positive",
      icon: "check",
    });
  } catch (error) {
    console.error("Error subscribing:", error);
  }
};

const checkSubscribed = (methods = "users", data) => {
  if (!authStore.isLoggedIn) return false;

  return props.subscribeList.some(
    (item) =>
      (item.type === methods && item.value === data) || item.type === "all"
  );
};

const onClickTag = (tag) => {
  store.setCMSPageChoosed({
    type: "tags",
    tags: [tag],
    limit: 5,
    orderBy: "created_at",
    order: "desc",
  });
};

/**
 * =========================================================
 * Comments engine
 * =========================================================
 */

/**
 * Safely parse comment JSON (avoid repeated JSON.parse in template).
 */
const parseCommentJson = (node) => {
  try {
    return node?.comment || "{}";
  } catch {
    return {};
  }
};

const getCommentAttachments = (node) => {
  // console.log("Parsing attachments for node", node.comment);
  const parsed = parseCommentJson(node);
  // console.log("Parsed attachments for node", parsed);
  return Array.isArray(parsed.attachments) ? parsed.attachments : [];
};

const getCommentHtml = (node) => {
  const parsed = parseCommentJson(node);
  return parsed.comment || "";
};

const getUserAvatar = (node) => {
  return node?.user?.profile_picture
    ? node.user.profile_picture
    : "https://cdn.quasar.dev/img/mountains.jpg";
};

const canEditComment = (node) => {
  return (
    node?.email &&
    authStore.isLoggedIn &&
    node.email === authStore.authDet.username
  );
};

const selectReply = (node) => {
  if (!authStore.isLoggedIn) {
    $q.notify({
      message: "You need to login first before reply",
      color: "negative",
      icon: "warning",
    });
    return;
  }
  selectedReplyComment.value = node.idx;
  selectedReplyContent.value = "";
  selectedReplyAttachments.value = [];
};

const startEditComment = (node) => {
  selectedReplyComment.value = node.idx;
  selectedReplyContent.value = getCommentHtml(node);
  selectedReplyAttachments.value = node.attachments ? node.attachments : [];
};

const resetReplyState = () => {
  selectedReplyComment.value = null;
  selectedReplyContent.value = "";
  selectedReplyAttachments.value = [];
};

/**
 * Submit comment/reply, then refresh list.
 */
const onSubmitComment = async (commentData, parentId = null) => {
  const payload = {
    data: {
      pgm_code: "FP_COMMENT",
      pgm_value: props.id,
      pgm_value2: authStore.authDet.username,
      pgm_value3: commentData,
      pgm_desc: `Comment from ${authStore.authDet.username} on form ${props.id}`,
      pgm_parent: parentId ? parentId.idx : null,
    },
    keys: {
      pgm_code: "FP_COMMENT",
      pgm_value: props.id,
      pgm_value2: authStore.authDet.username,
    },
    notify: {
      title: "You have a new comment",
      message: `A new comment has been submitted by ${authStore.authDet.username}.`,
      to: [props.headersComp.author, parentId ? parentId.email : null],
      methods: ["email", "webpush"],
      link: route.fullPath,
    },
  };

  await postData("post", payload, "portal/gencode/saveGencode");

  $q.notify({
    message: "Your comment has been submitted successfully.",
    color: "green",
    icon: "check",
  });

  resetReplyState();
  getComment();
};

/**
 * Load comments and enrich with user profile data.
 */
const getComment = async () => {
  loadingComment.value = true;

  try {
    const { data } = await postData(
      "post",
      {
        id: "FP_COMMENT",
        selectAs: {
          idx: "id",
          form_id: "pgm_value|int",
          email: "pgm_value2|string",
          comment: "pgm_value3|array",
          created_date: "created_at",
          children: "children",
        },
        withParents: true,
        filter: {
          pgm_value: props.id,
        },
      },
      "portal/gencode/showDetail/FP_COMMENT",
      false,
      false,
      false
    );

    if (!data) {
      listComments.value = [];
      return;
    }

    // recursively attach user info to tree nodes
    const attachUserToNodeTree = async (node) => {
      const userDetails = await getUsersDetail(node.email);
      node.user = userDetails
        ? {
            name:
              userDetails.det.pud_first_name +
              " " +
              userDetails.det.pud_last_name,
            email: userDetails.email,
            profile_picture: userDetails.det.pud_photo,
          }
        : null;

      if (Array.isArray(node.children)) {
        await Promise.all(node.children.map(attachUserToNodeTree));
      }
    };

    await Promise.all(data.map(attachUserToNodeTree));
    listComments.value = data;
  } finally {
    loadingComment.value = false;
  }
};

const getUsersDetail = async (username) => {
  const data = await postData(
    "get",
    null,
    `portal/users/${username}`,
    false,
    false,
    true
  );
  return data?.data ?? null;
};

/**
 * Download/open attachment by URL
 */
const onOpenAttachment = (attachment) => {
  const link = document.createElement("a");
  link.href = attachment.url;
  link.download = attachment.name || "download";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * OPTIONAL: if you still need delete comment functionality,
 * implement this function (your original code referenced it but didn't include it).
 */
const onDeleteComment = async (id) => {
  // TODO: implement based on your API endpoint.
  // Keeping placeholder to avoid runtime errors if template calls it.
  $q.notify({
    message: "Delete comment is not implemented yet.",
    color: "warning",
    icon: "warning",
  });
};

/**
 * =========================================================
 * HTML Processor (trusted HTML only)
 * =========================================================
 * WARNING: This runs scripts from HTML via new Function().
 * Use only for trusted content sources.
 */
const processHtml = (html) => {
  // Extract styles
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styles = [];
  let match;

  while ((match = styleRegex.exec(html))) styles.push(match[1]);

  styles.forEach((style) => {
    const styleElement = document.createElement("style");
    styleElement.textContent = style;
    document.head.appendChild(styleElement);
  });

  // Extract scripts
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const scripts = [];

  while ((match = scriptRegex.exec(html))) scripts.push(match[1]);

  scripts.forEach((script) => {
    try {
      new Function(script)();
    } catch (e) {
      console.error("Script error:", e);
    }
  });

  return html.replace(styleRegex, "").replace(scriptRegex, "");
};

/**
 * =========================================================
 * Batch Upload handler (placeholder)
 * =========================================================
 */
const onClickBatchUpload = () => {
  $q.dialog({
    component: uploadFilesIndex,
    componentProps: {
      title: "Upload Bulk Data",
      accept: ".xlsx,.xls",
      multiple: false,
    },
  }).onOk(async (files) => {
    const data = await postData(
      "post",
      {
        id: props.id,
        files: files.result,
        filename: files.fileName,
      },
      "cms/storeBulkAnswers",
      false,
      true,
      true
    );

    if (data) {
      store.restoreDefault();
      $q.notify({ message: data.message, color: "green", icon: "check" });
    }
  });
};

/**
 * =========================================================
 * Download Template handler (placeholder)
 * =========================================================
 */
const onClickDownloadTemplate = async () => {
  // downloadTemplateBulk

  const data = await postData(
    "get",
    null,
    `cms/downloadTemplateBulk/${props.id}`,
    false,
    true,
    true
  );

  if (data && data.path) {
    const link = document.createElement("a");
    link.href = process.env.API_DOWNLOAD + data.path;
    link.download = data.path.split("/").pop();
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const convertToBoolean = (value) => {
  if (typeof value === "number") {
    return value !== 0;
  }
  return !!value;
};

const periodStateChecker = computed(() =>
  convertToBoolean(props.setup?.addPeriod) &&
  !convertToBoolean(props.setup?.specificUserSetPeriod)
    ? true
    : props.setup?.listSpecificUserSetPeriod?.some(
        (item) => item == authStore.authDet.username
      )
);

const uploaderUsersList = computed(() => {
  if (convertToBoolean(props.setup?.isBulkUpload)) {
    if (props.setup?.usersBulkUpload.length > 0) {
      return props.setup?.usersBulkUpload?.some(
        (item) => item == authStore.authDet.username
      );
    } else {
      return true;
    }
  }

  return false;
});

const multipleFormSetup = computed(() => {
  return (
    props.setup?.renderMode !== "disabled" &&
    (props.setup?.listSpecificUserRenderMode.length === 0 ||
      props.setup?.listSpecificUserRenderMode?.some(
        (item) => item == authStore.authDet.username
      ))
  );
});
</script>

<style scoped>
/* Example table styling for tables rendered via v-html */
:deep(table) {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

:deep(th),
:deep(td) {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  text-align: left;
}

:deep(th) {
  background-color: #f5f5f5;
  color: #333;
  font-weight: 600;
}

:deep(tr:nth-child(even)) {
  background-color: #fafafa;
}

:deep(tr:hover) {
  background-color: #e3f2fd;
}

.my-blink-animation {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
