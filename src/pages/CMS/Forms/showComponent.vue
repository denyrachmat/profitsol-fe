<template>
  <div>
    <div
      class="row q-gutter-md"
      v-if="
        props.setup &&
        props.setup.isHistory == 1 &&
        connectedMRSVal &&
        !isShowFormOnly
      "
    >
      <div class="col">
        <tableReport
          :idReport="connectedMRSVal.id"
          :TableTitle="connectedMRSVal.mrm_name"
          :idForms="props.id"
        />
      </div>
    </div>
    <template v-else>
      <div
        v-if="getNowData.length > 0"
        :style="`max-height: 70%; overflow: auto;`"
      >
        <q-scroll-area class="window-height">
          <div class="row" v-if="props.useHeader">
            <div class="col">
              <q-card class="bg-white shadow-1 rounded-borders" bordered>
                <q-card-section>
                  <div class="text-h6">{{ props.headersComp.title }}</div>
                  <div class="text-subtitle2">
                    {{ props.headersComp.description }}
                  </div>
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
                        :color="
                          !checkSubscribed('users', props.headersComp.author)
                            ? 'primary'
                            : 'grey'
                        "
                        class="q-ml-sm"
                        @click="
                          () => onSubscribed('users', props.headersComp.author)
                        "
                        :disable="
                          checkSubscribed('users', props.headersComp.author)
                        "
                      >
                        <q-tooltip
                          v-if="
                            checkSubscribed('users', props.headersComp.author)
                          "
                          >You already subscribed</q-tooltip
                        >
                      </q-btn>
                    </q-chip>
                    -
                    {{
                      (() => {
                        const createdDate = new Date(props.headersComp.date);
                        const now = new Date();
                        const diffInMs = now - createdDate;

                        const diffInMinutes = Math.floor(
                          diffInMs / (1000 * 60)
                        );
                        const diffInHours = Math.floor(
                          diffInMs / (1000 * 60 * 60)
                        );
                        const diffInDays = Math.floor(
                          diffInMs / (1000 * 60 * 60 * 24)
                        );

                        if (diffInDays > 0) {
                          return `${diffInDays} day${
                            diffInDays > 1 ? "s" : ""
                          } ago`;
                        } else if (diffInHours > 0) {
                          return `${diffInHours} hour${
                            diffInHours > 1 ? "s" : ""
                          } ago`;
                        } else if (diffInMinutes > 0) {
                          return `${diffInMinutes} minute${
                            diffInMinutes > 1 ? "s" : ""
                          } ago`;
                        } else {
                          return "Just now";
                        }
                      })()
                    }}
                  </div>
                  <div class="text-caption text-italic">
                    Category:
                    <template v-if="props.tags && props.tags.length > 0">
                      <q-chip
                        class="q-mr-sm"
                        outline
                        color="primary"
                        v-for="tag in props.tags"
                        :key="tag.id"
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
                                >You already subscribed</q-tooltip
                              >
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
          <div
            class="row q-col-gutter-md q-pt-md"
            v-for="(row, idx) in getNowData"
            :key="idx"
          >
            <template v-for="(col, idx2) in row['content']">
              <div
                :class="[
                  'col-12',
                  'text-wrap',
                  'break-all',
                  col.width && !isNaN(Number(col.width))
                    ? `col-md-${col.width}`
                    : `col-md-${Math.floor(12 / row['content'].length)}`,
                ]"
                :key="idx2"
                v-if="!col.hidden"
                style="word-wrap: break-word; overflow-wrap: break-word"
              >
                <q-card
                  :bordered="props.useCardSeparator"
                  :flat="!props.useCardSeparator"
                  style="width: 100%; height: 100%"
                >
                  <q-card-section>
                    <componentViewVue
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
                        (val) => getAnswers(idx, idx2, val, col.id)
                      "
                      :ans="
                        getUserAnswers[idx] &&
                        !Array.isArray(
                          getUserAnswers[idx] && getUserAnswers[idx][col.id]
                        )
                          ? typeof getUserAnswers[idx][col.id] === 'string' &&
                            getUserAnswers[idx][col.id].startsWith('data:')
                            ? base64ToFile(
                                getUserAnswers[idx][col.id],
                                getFileNamefromBase64(
                                  getUserAnswers[idx][col.id]
                                )
                              )
                            : getUserAnswers[idx][col.id]
                          : ''
                      "
                      :ansArr="
                        Array.isArray(
                          getUserAnswers[idx] && getUserAnswers[idx][col.id]
                        )
                          ? typeof getUserAnswers[idx][col.id] === 'string' &&
                            getUserAnswers[idx][col.id].startsWith('data:')
                            ? base64ToFile(
                                getUserAnswers[idx][col.id],
                                getFileNamefromBase64(
                                  getUserAnswers[idx][col.id]
                                )
                              )
                            : getUserAnswers[idx][col.id]
                          : ''
                      "
                      :apiOpt="col.content.component.apiOpt"
                      v-if="col.type === 'form'"
                    />
                    <!-- If Content is HTML -->
                    <div v-else-if="col.type === 'html'">
                      <!-- Use a dynamic component to render HTML with script and style support -->
                      <div v-html="processHtml(col.content)"></div>
                    </div>

                    <!-- If Content is posts -->
                    <div v-else-if="col.type === 'posts'" :key="refreshedPosts">
                      <div class="text-center" v-if="col.loadingPosts">
                        <q-spinner-dots color="primary" size="lg" />
                      </div>
                      <template v-else>
                        <div
                          class="row"
                          v-if="
                            !props.preventLoops &&
                            col.currentPost &&
                            col.currentPost.forms.length > 0 &&
                            (col.content.mode === 'last' ||
                              col.content.mode === 'all')
                          "
                        >
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
                        <template
                          v-if="
                            col.content.mode === 'list' ||
                            col.content.mode === 'all'
                          "
                        >
                          <div class="row q-pb-md">
                            <div class="col text-h5 text-bold">
                              <span class="text-h6">{{
                                col.content.title ??
                                `Posts with category: ${col.content.tags.join(
                                  ", "
                                )}`
                              }}</span>
                              <br />
                              <span class="text-subtitle2">{{
                                col.content.desc ??
                                `All posts: ${col.content.tags.join(", ")}`
                              }}</span>
                            </div>
                            <div class="col text-right">
                              <q-chip
                                class="q-mr-sm cursor-pointer"
                                outline
                                color="primary"
                                clickable
                                v-for="tag in col.content.tags"
                                :key="tag.id"
                                @click="() => onClickTag(tag)"
                              >
                                {{ tag }}
                              </q-chip>
                            </div>
                          </div>
                          <template v-if="col.content.layout === 'grid'">
                            <q-carousel
                              v-model="slide[idx][idx2]"
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
                                          @click="
                                            () => {
                                              store.setCMSPageChoosed({
                                                ...post,
                                                type: 'posts',
                                              });
                                            }
                                          "
                                          >Read More</q-btn
                                        >
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
                                @click="
                                  () => {
                                    store.setCMSPageChoosed({
                                      ...post,
                                      type: 'posts',
                                    });
                                  }
                                "
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
                                    <q-chip
                                      class="text-caption"
                                      color="orange"
                                      >{{ post.p_u_username }}</q-chip
                                    >
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
                          <div class="q-pt-md">
                            <q-btn
                              style="width: 100%"
                              color="primary"
                              outline
                              @click="
                                () => {
                                  store.setCMSPageChoosed({
                                    type: 'tags',
                                    tags: col.content.tags,
                                    limit: col.content.limit
                                      ? col.content.limit
                                      : 5,
                                    orderBy:
                                      col.content.orderBy.length > 0
                                        ? col.content.orderBy
                                        : 'created_at',
                                    order:
                                      col.content.order.length > 0
                                        ? col.content.order
                                        : 'desc',
                                  });
                                }
                              "
                              >View All Posts</q-btn
                            >
                          </div>
                        </template>
                      </template>
                    </div>

                    <!-- If Content is files -->
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
                      :nodes="listComments"
                      node-key="idx"
                      default-expand-all
                      children-key="children"
                      v-else
                    >
                      <template v-slot:default-header="prop">
                        <div class="row items-center">
                          <q-avatar size="32px" class="q-mr-sm">
                            <img
                              :src="
                                prop.node.user && prop.node.user.profile_picture
                                  ? prop.node.user.profile_picture
                                  : 'https://cdn.quasar.dev/img/mountains.jpg'
                              "
                            />
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

                      <template v-slot:default-body="prop">
                        <div class="q-mt-sm" style="color: #333">
                          <div
                            v-if="
                              JSON.parse(prop.node.comment).attachments.length >
                              0
                            "
                          >
                            <div
                              class="q-mb-sm"
                              v-for="(att, attIdx) in JSON.parse(
                                prop.node.comment
                              ).attachments"
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
                          <div
                            v-html="JSON.parse(prop.node.comment).comment"
                          ></div>
                          <div class="q-pt-sm text-right">
                            <q-btn
                              outline
                              dense
                              icon="reply"
                              label="Reply"
                              @click="
                                () => {
                                  selectedReplyComment = prop.node.idx;
                                }
                              "
                              color="primary"
                            />
                            <template
                              v-if="
                                prop.node.email &&
                                authStore.isLoggedIn &&
                                prop.node.email === authStore.authDet.username
                              "
                            >
                              <q-btn
                                outline
                                dense
                                icon="edit"
                                color="primary"
                                class="q-ml-sm"
                                @click="
                                  () => {
                                    selectedReplyComment = prop.node.idx;
                                    selectedReplyContent = JSON.parse(
                                      prop.node.comment
                                    ).comment;
                                    selectedReplyAttachments = prop.node
                                      .attachments
                                      ? prop.node.attachments
                                      : [];
                                  }
                                "
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
                              @onCancel="
                                () => {
                                  selectedReplyComment = null;
                                  selectedReplyContent = '';
                                  selectedReplyAttachments = [];
                                }
                              "
                              :modelValue="selectedReplyContent"
                              :initial-attachments="selectedReplyAttachments"
                            />
                          </div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-card-section>
                <q-card-section>
                  <commentComponentVue @submit="onSubmitComment" />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-scroll-area>
      </div>
      <template v-else>
        <div class="row">
          <div class="col">Nothing to show.</div>
        </div>
      </template>

      <!-- This is for action -->
      <div class="row q-pt-md" v-if="!removeButtons">
        <div class="col absolute-bottom">
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
    </template>
  </div>
</template>
<script setup>
import {
  ref,
  defineProps,
  onMounted,
  computed,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";
import componentViewVue from "../componentView.vue";
import showQuizComponentVue from "./showQuizComponent.vue";

import { useFormStore } from "stores/formStore";
import { useAuthStore } from "src/stores/authStore";
import { useRoute } from "vue-router";

import tableReport from "../../MRS/Tables/indexTableReport.vue";
import uploadDocument from "src/pages/DMS/uploadDocument.vue";
import exploreViewerIndex from "src/pages/DMS/ExploreViewer/exploreViewerIndex.vue";
import commentComponentVue from "src/pages/Frontpage/commentComponent.vue";

const store = useFormStore();
const authStore = useAuthStore();
const $q = useQuasar();
const { postData } = apiRequest();
const route = useRoute();

const nowSeq = ref(null);
const refreshKeys = ref(0);
const removeButtons = ref(false);
const isFullHeight = ref(false);
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

const slide = ref([]);
const forms = ref([]);
const isMountedTriggered = ref(false);
const connectedMRSVal = ref(null);
const isShowFormOnly = ref(props.showFormOnly || true);
const preventClears = ref(false);
const loadingPosts = ref(false);
const postsList = ref([]);
const currentPost = ref(null);
const refreshedPosts = ref(0);

const getNowIdx = computed(() =>
  forms.value.findIndex((x) => x.seq_name == nowSeq.value)
);

const getNowData = computed(() =>
  forms.value.filter((x) => x.seq_name == nowSeq.value)
);

const getNextData = computed(() =>
  forms.value.filter((x) => x.seq_name == parseInt(nowSeq.value) + 1)
);

const getRequired = computed(() =>
  getNowData.value.filter((x) => x.content.filter((y) => y.required).length > 0)
);

const isFormsExists = computed(() =>
  forms.value.filter((x) =>
    x.content.length > 0
      ? x.content.filter((y) => y.type === "form").length > 0
      : []
  )
);

const formItems = computed(() => {
  const result = [];

  // Recursive function to find all form items
  function findForms(items) {
    items.forEach((item) => {
      if (item.type === "form") {
        result.push(item);
      }
      if (item.content && Array.isArray(item.content)) {
        findForms(item.content);
      }
    });
  }

  // Start with the root data array
  findForms(forms.value);

  return result;
});

const getUserAnswers = computed(() => {
  return store.getUsersAnswerForm;
});

const getAllLogics = computed(() => {
  return formItems.value.flatMap((item) =>
    (item.logics || []).map((logic) => ({ ...logic, id: item.id }))
  );
});

// Comments Section Start
const loadingComment = ref(false);
const listComments = ref([]);
const selectedReplyComment = ref(null);
const selectedReplyContent = ref("");
const selectedReplyAttachments = ref([]);
// Comments Section End

onMounted(async () => {
  forms.value = props.data;

  // Initialize slide array based on forms structure
  slide.value = forms.value.map((row) =>
    row.content ? row.content.map(() => 0) : [0]
  );

  isFullHeight.value = props.fullHeight;

  if (props.setup && props.setup.isWizard) {
    nowSeq.value = forms.value[0].seq_name;
  } else {
    forms.value = updateRowSeqNames(forms.value, false);
    nowSeq.value = forms.value[0].seq_name;
  }

  if (props.setup && props.setup.isHistory == 1) {
    // console.log("showFormOnly", props.showFormOnly);
    isShowFormOnly.value = props.showFormOnly;
    getConnectedMRS(props.id);
  } else {
    connectedMRSVal.value = null;
  }

  if (props.preventClear === true) {
    preventClears.value = true;
  } else {
    preventClears.value = false;
  }

  if (preventClears.value === false) {
    store.restoreDefault();
  }

  logicsChecker("onMounted");

  removeButtons.value = props.removeButton || false;

  function checkForPostsType(items, rowsIdx, data = []) {
    // if (!Array.isArray(items)) return false;

    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      if (element.type === "posts")
        if (!data.some((d) => d.rowIdx === rowsIdx && d.colIdx === index)) {
          // Only push if not already present (by rowIdx and colIdx)
          data.push({
            rowIdx: rowsIdx,
            colIdx: index,
          });
        }

      if (element.content && Array.isArray(element.content)) {
        checkForPostsType(element.content, index, data);
      }
    }

    return data;
  }

  let dataPosts = checkForPostsType(forms.value);
  if (dataPosts.length > 0) {
    for (let index = 0; index < dataPosts.length; index++) {
      const element = dataPosts[index];
      getPostsData(element.rowIdx, element.colIdx);
    }
  }

  if (props.useCommentSection) {
    getComment();
  }

  console.log(forms.value);
});

onBeforeUnmount(() => {
  isMountedTriggered.value = false;
});

const convertBase64 = (val) => {
  return btoa(val);
};

const processHtml = (html) => {
  // Process styles
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styles = [];
  let match;

  while ((match = styleRegex.exec(html))) {
    styles.push(match[1]);
  }

  styles.forEach((style) => {
    const styleElement = document.createElement("style");
    styleElement.textContent = style;
    document.head.appendChild(styleElement);
  });

  // Process scripts
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const scripts = [];

  while ((match = scriptRegex.exec(html))) {
    scripts.push(match[1]);
  }

  scripts.forEach((script) => {
    try {
      new Function(script)();
    } catch (e) {
      console.error("Script error:", e);
    }
  });

  return html.replace(styleRegex, "").replace(scriptRegex, "");
};

const base64ToFile = (base64, filename) => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const updateRowSeqNames = (data, add = false) => {
  return data.map((row, index) => {
    // Only modify if it's a row
    if (row.type === "row") {
      return {
        ...row, // Spread all existing properties
        seq_name: add ? (index + 1).toString() : "1", // Update seq_name based on index
      };
    }
    return row; // Return unchanged if not a row
  });
};

const logicsChecker = (valLogics, id = "") => {
  // console.log(getAllLogics.value);
  const getLogicsList = id
    ? getAllLogics.value.filter((val) => val.id == id)
    : getAllLogics.value.filter(
        (val) =>
          val.data.filter((x) => x.cfld_opr_ctrl === valLogics).length > 0
      );

  getLogicsList.map((val, idx) => {
    // console.log("val", val);
    let logicResult = false;
    let lastOperation = "||";
    val.data.some((valLogic, idx) => {
      if (
        valLogic.cfld_actions === "trigger" &&
        valLogic.cfld_opr_ctrl === "onMounted" &&
        valLogics === "onMounted"
        // isMountedTriggered.value === false &&
        // getLogicsList.length === idx + 1
      ) {
        logicResult = true;
        isMountedTriggered.value = true;
      }

      if (valLogic.cfld_opr_ctrl !== valLogics) {
        if (valLogic.cfld_actions === "logic") {
          const compare = new Function("a", "b", `return a ${lastOperation} b`);

          logicResult = compare(
            logicResult,
            logicsConditionalChecker(val.id, valLogic)
          );

          // console.log(
          //   "logicResult 1",
          //   logicResult,
          //   valLogic.cfld_opr_ctrl,
          //   valLogic.cfld_opr,
          //   valLogic.cfld_val
          // );
        }

        if (valLogic.cfld_actions === "logic_only") {
          lastOperation = valLogic.cfld_opr;
        }

        if (logicResult === true && valLogic.cfld_actions === "result") {
          // console.log(
          //   "logicResult",
          //   logicResult,
          //   valLogic.cfld_opr_ctrl,
          //   valLogic.cfld_opr,
          //   valLogic.cfld_val
          // );
          modifyComponent(val.id, valLogic.cfld_res, valLogic.cfld_val);
        }
      }
    });
  });

  // console.log(formItems.value);
};

const logicsConditionalChecker = (idComp, data) => {
  const getAnswersofComp = Object.values(getUserAnswers.value).find(
    (val) => val[idComp] !== undefined
  )?.[idComp];

  let valueComparation;
  if (data.cfld_opr_ctrl === "value") {
    valueComparation = data.cfld_val;
  } else {
    valueComparation = getUserAnswers.value.find(
      (val) => val[data.cfld_val] !== undefined
    );
  }

  const compare = new Function("a", "b", `return a ${data.cfld_opr} b`);
  return compare(getAnswersofComp, valueComparation);
};

const getQuizData = (data, key = 0, hasil = []) => {
  if (data[key]) {
    if (data[key].type == "quiz") {
      hasil.push(data[key]);
    } else {
      if (data[key].type === "row") {
        getQuizData(data[key].content, 0, hasil);
      } else {
        getQuizData(data, key + 1, hasil);
      }
    }

    if (data[key + 1]) {
      getQuizData(data, key + 1, hasil);
    } else {
      return hasil;
    }
  }

  return hasil;
};

const getRequiredForm = (data, key = 0, rows = 0, hasil = []) => {
  if (data[key]) {
    if (data[key].type == "form" && data[key].required === true) {
      hasil.push({
        data: data[key],
        answers: getUserAnswers.value[rows]
          ? getUserAnswers.value[rows][key]
          : "",
      });
    } else {
      if (data[key].type === "row") {
        getRequiredForm(data[key].content, 0, key, hasil);
      } else {
        getRequiredForm(data, key + 1, rows, hasil);
      }
    }

    // console.log(data[key + 1]);
    if (data[key + 1]) {
      getRequiredForm(data, key + 1, rows, hasil);
    }
  }

  return hasil;
};

const getAnswers = (row, col, val, idDiv) => {
  // console.log([row, col, val, idDiv]);
  const prevVal = getUserAnswers.value[row]
    ? (() => {
        const ans = getUserAnswers.value[row][idDiv];
        if (typeof ans === "string" && ans.startsWith("data:")) {
          return base64ToFile(ans, getFileNamefromBase64(ans)).name;
        }
        // If both are File, compare by filename
        if (ans instanceof File) {
          return ans.name;
        }

        return ans;
      })()
    : undefined;

  const currVal = val instanceof File ? val.name : val;

  // console.log("prevVal", prevVal, "currVal", currVal);

  if (prevVal == currVal) {
    logicsChecker("onInput", idDiv);
    return;
  }

  if (val instanceof File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Get the original filename if available, otherwise fallback to val.name
      let filename = val && val.name ? val.name : "file";
      // If the base64 string contains a filename, extract it
      const base64 = e.target.result;
      const match = base64.match(/filename=([^;]+);?/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
      // Append filename to base64 string if not present
      let base64WithFilename = base64;
      if (!/filename=/.test(base64)) {
        // Insert filename before the base64 data
        base64WithFilename = base64.replace(
          /^data:([^;]+);/,
          `data:$1;filename=${encodeURIComponent(filename)};`
        );
      }

      store.addAnswersForm(row, idDiv, base64WithFilename);
      logicsChecker("onInput", idDiv);
    };

    reader.readAsDataURL(val);
    return;
  } else {
    store.addAnswersForm(row, idDiv, val);
    logicsChecker("onInput", idDiv);
  }

  // store.addAnswersForm(row, idDiv, val);
  // logicsChecker("onInput", idDiv);
};

const getFileNamefromBase64 = (base64) => {
  const match = base64.match(/filename=([^;]+);?/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  return "file";
};

const nextPage = () => {
  if (
    getRequiredForm(getNowData.value).filter((val) => val.answers === "")
      .length > 0
  ) {
    getRequiredForm(getNowData.value).map((valMap) => {
      // console.log(valMap);
      $q.notify({
        message: `<b>${valMap.data.content.label}</b> is still empty, please fill this field`,
        color: "red",
        html: true,
      });
    });
  } else {
    if (getQuizData(getNextData.value).length > 0) {
      $q.dialog({
        title: "Quiz Start",
        message:
          "If you click ok, quiz will be started immediately, do you want to continue ?",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        nowSeq.value = parseInt(nowSeq.value) + 1;
      });
    } else {
      nowSeq.value = parseInt(nowSeq.value) + 1;
    }
  }
};

const onSubmitData = () => {
  const getRequiredFormData = formItems.value.filter(
    (val) => val.required === true && val.type === "form"
  );

  // Check if any required form data is empty
  // If so, show a notification for each empty field
  // and return false to prevent submission
  if (getRequiredFormData.length > 0) {
    const flattenedAnswers = computed(() => {
      return Object.assign({}, ...getUserAnswers.value);
    });

    let resultReq = [];
    getRequiredFormData.map((valMap) => {
      const listIDAnswer = Object.keys(flattenedAnswers.value).map(Number);

      if (!listIDAnswer.includes(valMap.id)) {
        resultReq.push({
          id: valMap.id,
          ans: flattenedAnswers.value[valMap.id],
        });

        $q.notify({
          message: `<b>${valMap.content.label}</b> is still empty, please fill this field`,
          color: "red",
          html: true,
        });
      }
    });

    // console.log(resultReq);
    if (resultReq.length > 0) {
      return false;
    }
  }

  console.log("connectedMRSVal", connectedMRSVal.value);

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
      `cms/storeAnswers`,
      false,
      true,
      true
    );

    if (data) {
      store.restoreDefault();
      $q.notify({
        message: data.message,
        color: "green",
        icon: "check",
      });

      console.log("valDownload", data.data);
      if (data.data && data.data.length > 0) {
        data.data.map((valDownload) => {
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

const prevPage = () => {
  nowSeq.value = parseInt(nowSeq.value) - 1;
};

const modifyComponent = (idComp, modifData, targetModifID = 0) => {
  const getCompByID = formItems.value.find((val) => val.id == idComp) || {};
  const getCompByTargetID =
    formItems.value.find((val) => val.id == targetModifID) || {};
  if (modifData === "hide_this_comp") {
    getCompByID.hidden = true;
  } else if (modifData === "show_this_comp") {
    getCompByID.hidden = false;
  } else if (modifData === "hide_comp") {
    getCompByTargetID.hidden = true;
  } else if (modifData === "show_comp") {
    getCompByTargetID.hidden = false;
  }

  // refreshKeys.value = refreshKeys.value + 1;

  const index = forms.value.findIndex((row) =>
    row.content && Array.isArray(row.content)
      ? row.content.some((item) => item.id === idComp)
      : false
  );
  if (index !== -1) {
    const row = forms.value[index];
    const updatedContent = row.content.map((item) => {
      if (item.id === idComp) {
        return { ...item, ...getCompByID };
      }
      if (item.id === targetModifID) {
        return { ...item, ...getCompByTargetID };
      }
      return item;
    });
    forms.value[index] = { ...row, content: updatedContent };
  }
};

const getConnectedMRS = async (id) => {
  const data = await postData(
    "get",
    null,
    `cms/getConnectedMRS/${id}`,
    false,
    true,
    true
  );
  if (data) {
    connectedMRSVal.value = data;
  }
};

const getPostsData = async (rowsIdx, colIdx) => {
  let dataContent = forms.value[rowsIdx].content[colIdx];
  // console.log("dataContent", dataContent);
  forms.value[rowsIdx].content[colIdx].loadingPosts = true;
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
  if (response) {
    console.log("Data fetched successfully:", response);
    dataContent.postsList = response.filter((item) => item.is_published === 1);
    // Chunk posts based on dataContent.content.perSlide or default to 1

    console.log(
      "Filtered posts:",
      forms.value[rowsIdx].content[colIdx].postsList
    );
    let fetchedPostsList = dataContent.postsList;

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
        if (getForms && getForms.data.value) {
          // console.log("getForms", getForms);
          forms.value[rowsIdx].content[colIdx].currentPost =
            getForms.data.value;

          // console.log("result forms", forms.value[rowsIdx].content[colIdx]);
          forms.value[rowsIdx].content[colIdx].loadingPosts = false;
        }
      }
    } else {
      Promise.all(
        fetchedPostsList.map(async (val, idx) => {
          const getForms = await postData(
            "get",
            null,
            `cms/viewByID/${val.id}`,
            false,
            false,
            true
          );
          if (getForms && getForms.data.value) {
            // console.log(
            //   "check by col idx",
            //   forms.value[rowsIdx].content[colIdx].postsList[idx]
            // );

            const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
            const matches = [
              ...getForms.data.value.forms[0].content[0].content.matchAll(
                imageRegex
              ),
            ];
            // Decode HTML entities
            const decodeHtmlEntities = (str) => {
              const textarea = document.createElement("textarea");
              textarea.innerHTML = str;
              return textarea.value;
            };

            // Apply decoding to the matched image source
            if (matches.length > 0) {
              const imageSrc = decodeHtmlEntities(matches[0][1]);
              forms.value[rowsIdx].content[colIdx].postsList[idx].image =
                imageSrc;
            } else {
              forms.value[rowsIdx].content[colIdx].postsList[idx].image = null;
            }

            // Extract content text (first 50 characters)
            const contentRegex = /<[^>]*>|&[^;]+;/g;
            const cleanContent = getForms.data.value.forms[0].content[0].content
              .replace(contentRegex, "")
              .trim();
            forms.value[rowsIdx].content[colIdx].postsList[idx].desc =
              cleanContent.substring(0, 150) +
              (cleanContent.length > 150 ? "..." : "");
          }
        })
      ).then(() => {
        // console.log("All posts processed");
        forms.value[rowsIdx].content[colIdx].loadingPosts = false;
        if (dataContent.content.layout === "grid") {
          const perSlide = dataContent.content.perSlide || 1;
          const chunkedPosts = [];
          for (let i = 0; i < dataContent.postsList.length; i += perSlide) {
            chunkedPosts.push(dataContent.postsList.slice(i, i + perSlide));
          }
          forms.value[rowsIdx].content[colIdx].postsList = chunkedPosts;
        }
      });
    }

    refreshedPosts.value += 1; // Trigger reactivity
  } else {
    console.error("Error fetching data");
    forms.value[rowsIdx].content[colIdx].loadingPosts = false;
  }
};

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

    console.log(subscribeData);
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
  if (!authStore.isLoggedIn) {
    return false;
  }

  const isSubscribed = props.subscribeList.some(
    (item) =>
      (item.type === methods && item.value === data) || item.type === "all"
  );

  return isSubscribed;
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

  const response = await postData(
    "post",
    payload,
    "portal/gencode/saveGencode"
  );

  $q.notify({
    message: "Your comment has been submitted successfully.",
    color: "green",
    icon: "check",
  });

  // Clear reply state
  selectedReplyComment.value = null;
  selectedReplyContent.value = "";
  selectedReplyAttachments.value = [];
  getComment();
};

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
      `portal/gencode/showDetail/FP_COMMENT`,
      false,
      false,
      true
    );

    if (data) {
      console.log(data);

      await Promise.all(
        data.map(async (comment) => {
          const userDetails = await getUsersDetail(comment.email);

          // Recursively process children
          const processChildren = async (children) => {
            if (Array.isArray(children)) {
              await Promise.all(
                children.map(async (child) => {
                  const childUserDetails = await getUsersDetail(child.email);
                  if (childUserDetails) {
                    child.user = {
                      name:
                        childUserDetails.det.pud_first_name +
                        " " +
                        childUserDetails.det.pud_last_name,
                      email: childUserDetails.email,
                      profile_picture: childUserDetails.det.pud_photo,
                    };
                  } else {
                    child.user = null;
                  }
                  // Recursively process nested children
                  if (child.children) {
                    await processChildren(child.children);
                  }
                })
              );
            }
          };

          await processChildren(comment.children);
          if (userDetails) {
            comment.user = {
              name:
                userDetails.det.pud_first_name +
                " " +
                userDetails.det.pud_last_name,
              email: userDetails.email,
              profile_picture: userDetails.det.pud_photo,
            };
          } else {
            comment.user = null;
          }
        })
      );

      console.log("Comments with user details:", data);

      listComments.value = data;
    }
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
    true,
    true
  );
  if (data) {
    return data.data;
  }
  return null;
};

const onOpenAttachment = (attachment) => {
  const link = document.createElement("a");
  link.href = attachment.url;
  link.download = attachment.name || "download";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
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
