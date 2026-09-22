<template>
  <q-layout class="shadow-2" view="hHh Lpr lFf">
    <q-header
      :reveal="
        activeHeaderConfig && activeHeaderConfig.enabled
          ? !activeHeaderConfig.sticky
          : false
      "
      :elevated="
        activeHeaderConfig && activeHeaderConfig.enabled
          ? !!activeHeaderConfig.elevated
          : mainConfData.headerElevated == 1
      "
      :style="{
        backgroundColor:
          activeHeaderConfig && activeHeaderConfig.enabled
            ? activeHeaderConfig.background || '#ffffff'
            : mainConfData.headerColor || '#ffffff',
        color:
          activeHeaderConfig && activeHeaderConfig.enabled
            ? activeHeaderConfig.textColor || undefined
            : undefined,
      }"
      v-if="
        mainConfData &&
        mainConfData.isHeader == 1 &&
        pageHeaderVisible &&
        !pageHeaderHidden
      "
    >
        <q-toolbar class="header-toolbar" :style="headerToolbarStyle">
        <!-- Custom background layer (HTML / image / etc.) -->
        <div v-if="hasHeaderBackground" class="header-bg-layer">
          <HeaderSlot
            :key="`fp-header-bg-${headerRenderKey}`"
            :blocks="activeHeaderConfig.slots.background"
            justify="center"
          />
        </div>

        <q-btn
          flat
          round
          dense
          icon="menu"
          class="q-mr-sm"
          v-if="mainConfData.headerSideBarBtn == 1 && defaultButtons.menu"
          :style="defaultButtonStyle"
          @click="drawerLeft = !drawerLeft"
          id="btn-toggle-menu"
        />

        <!-- Effective custom header slots (left / center / right) -->
        <template v-if="hasAnyCustomHeader">
          <HeaderSlot
            :key="`fp-header-left-${headerRenderKey}`"
            :blocks="activeHeaderConfig.slots.left"
            justify="start"
            class="col"
          />
          <HeaderSlot
            :key="`fp-header-center-${headerRenderKey}`"
            :blocks="activeHeaderConfig.slots.center"
            justify="center"
            class="col-auto"
          />
          <HeaderSlot
            :key="`fp-header-right-${headerRenderKey}`"
            :blocks="activeHeaderConfig.slots.right"
            justify="end"
            class="col"
          />
        </template>

        <!-- Default branding (logo + title) -->
        <template v-else>
          <div class="q-pa-sm">
            <q-avatar
              :size="mainConfData.headerLogoSize ?? '10vh'"
              rounded
              v-if="
                mainConfData.headerLogoAvatar &&
                mainConfData.headerLogoAvatar == 1
              "
            >
              <img
                :src="
                  mainConfData.headerLogo ||
                  'https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg'
                "
              />
            </q-avatar>
            <img
              :src="
                mainConfData.headerLogo ||
                'https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg'
              "
              :style="`width: ${mainConfData.headerLogoSize ?? '10vh'}`"
              v-else
            />
          </div>

          <q-toolbar-title
            :style="`color: ${mainConfData.headerTextColor || '#000000'}`"
            >{{ mainConfData.headerName || "Default Title" }}</q-toolbar-title
          >
        </template>

        <q-space />
        <q-btn
          :color="defaultButtonsColor ? undefined : 'white'"
          :style="defaultButtonStyle"
          label="Account Settings"
          outline
          icon="account_circle"
          v-if="mainConfData.headerSideBarBtn == 1 && defaultButtons.account"
          id="btn-settings"
        >
          <q-menu>
            <div class="row no-wrap q-pa-md" style="min-width: 25em">
              <div class="column">
                <div class="text-h6 q-mb-md">Action</div>
                <div class="q-gutter-md">
                  <div class="row">
                    <q-btn
                      outline
                      :label="
                        authStore.getDetail.user_det ? 'To Portal' : 'Login'
                      "
                      :to="authStore.getDetail.user_det ? '/portal' : '/login'"
                      icon="login"
                      class="full-width"
                      id="btn-portal"
                    />
                  </div>
                  <div class="row" v-if="authStore.getDetail.user_det">
                    <q-btn
                      outline
                      label="Edit Profile"
                      :to="'/profiles'"
                      icon="edit"
                      class="full-width"
                      id="btn-edit-profile"
                    />
                  </div>
                </div>
              </div>

              <q-separator vertical inset class="q-mx-lg" />

              <div class="column items-center">
                <q-avatar
                  size="72px"
                  v-if="
                    authStore.getDetail &&
                    authStore.getDetail.user_det &&
                    authStore.getDetail.user_det.pud_photo
                  "
                >
                  <img :src="authStore.getDetail.user_det.pud_photo" />
                </q-avatar>
                <q-avatar
                  v-else
                  size="72px"
                  color="teal"
                  text-color="white"
                  icon="account_circle"
                  font-size="72px"
                />

                <div
                  class="text-subtitle1 q-mt-md q-mb-xs"
                  v-if="
                    authStore &&
                    authStore.getDetail &&
                    authStore.getDetail.user_det
                  "
                >
                  {{ authStore.getDetail.user_det.pud_first_name }}
                  {{ authStore.getDetail.user_det.pud_last_name }}
                </div>

                <q-btn
                  color="primary"
                  label="Logout"
                  push
                  size="sm"
                  v-close-popup
                  @click="logout"
                  v-if="
                    authStore &&
                    authStore.getDetail &&
                    authStore.getDetail.user_det
                  "
                  id="btn-logout"
                />
              </div>
            </div>
          </q-menu>
        </q-btn>
        <q-btn
          flat
          :icon="isSubscribed ? 'notifications' : 'notifications_off'"
          @click="requestPermissionAndSubscribe"
          :color="defaultButtonsColor ? undefined : isSubscribed ? 'white' : 'red-7'"
          :style="defaultButtonStyle"
          v-if="defaultButtons.notifications"
          id="btn-subscribe"
        >
          <q-tooltip>{{
            isSubscribed
              ? "Notifications On, Click to turn off"
              : "Notifications Off, Click to turn on"
          }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="help"
          @click="startTutorial"
          :color="defaultButtonsColor ? undefined : 'white'"
          :style="defaultButtonStyle"
          v-if="defaultButtons.help"
          id="btn-help-tour"
        >
          <q-tooltip>Start Front Page Tutorial</q-tooltip>
        </q-btn>

        <!-- <q-btn
          flat
          round
          dense
          icon="login"
          v-if="mainConfData.headerSideBarBtn == 1"
          to="/portal"
        >
          <q-tooltip>Go to Portal</q-tooltip>
        </q-btn> -->
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerLeft"
      :width="300"
      :breakpoint="500"
      bordered
      :class="'bg-grey-3'"
      :key="'drawer' + refreshKeys"
      id="drawer-menu"
    >
      <div v-if="loadingDrawer" class="q-pa-md flex flex-center">
        <q-spinner color="primary" size="2em" />
        <span class="q-ml-sm">Loading menu...</span>
      </div>
      <q-scroll-area class="full-height" style="max-width: 300px" v-else>
        <listMenuRecurse :list-menu="listPreviewMenu" :is-loading="loading" />
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="full-height relative-position">
      <div class="row" :key="refreshKeys">
        <div v-if="loading" class="col flex flex-center column">
          <q-spinner color="primary" size="15em" class="q-mt-xl" />
          <div class="text-subtitle2 q-mt-sm">
            Loading content, please wait...
          </div>
        </div>
        <template v-else>
          <!-- CMSPageCreator pages manage their own padding (Page Padding
               setting), so skip the default q-pa-md to avoid double padding. -->
          <div
            class="col"
            :class="
              choosedPages?.forms?.setupTraining?.pagePadding
                ? 'q-pa-none'
                : 'q-pa-md'
            "
            :key="refreshKeysContent"
          >
            <showComponent
              :data="choosedPages.forms.forms"
              v-if="
                (choosedPages.forms &&
                  choosedPages.forms.id &&
                  choosedPages.is_main == 1 &&
                  formStore.getCMSPageChoosed.type !== 'posts' &&
                  formStore.getCMSPageChoosed.type !== 'tags') ||
                viewMode == 'edit'
              "
              @loading-state="onShowComponentLoading"
              :setup="choosedPages.forms.setupTraining"
              :id="() => String(choosedPages.forms.id)"
              :showFormOnly="true"
              :preventClear="true"
              :removeButton="true"
              :isFullHeight="true"
              :tags="choosedPages.tags ? JSON.parse(choosedPages.tags) : []"
              :use-card-separator="true"
            />
            <template v-else>
              <router-view
                v-if="
                  formStore.getCMSPageChoosed.type === 'page' ||
                  formStore.getCMSPageChoosed.type === 'posts' ||
                  formStore.getCMSPageChoosed.type === 'tags'
                "
              ></router-view>
              <iframe
                v-else
                :src="formStore.getCMSPageChoosed.url"
                width="100%"
                height="60vh"
                style="border: none"
              ></iframe>
              <!-- formStore.getCMSPageChoosed -->
            </template>
            <!-- <span v-else>
              There is no content to display here yet. You can add your content
              and configure the front page as needed.
            </span> -->
          </div>
        </template>
      </div>
    </q-page-container>

    <transition name="fade">
      <div v-if="showHomeOverlay" class="home-loading-overlay">
        <q-spinner-dots color="primary" size="80px" />
        <div class="text-subtitle1 text-weight-medium q-mt-md">
          Preparing home components...
        </div>
      </div>
    </transition>
  </q-layout>
</template>
<script setup>
import {
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { useQuasar } from "quasar";
import { useFormStore } from "src/stores/formStore";
import showComponent from "../CMS/Forms/showComponent.vue";
import { useRouter } from "vue-router";
import { buildTourSteps } from "@/tours/useTourSteps";

import apiRequest from "src/components/apiRequest";
import listMenuRecurse from "../UpdateFP/listMenuRecurse.vue";
import HeaderSlot from "../UpdateFP/components/setWebManage/header/HeaderSlot.vue";
import {
  normalizeHeaderConfig,
  cssSize,
} from "../UpdateFP/components/setWebManage/header/useHeaderConf.js";

import { useAuthStore } from "src/stores/authStore";
import { route } from "quasar/wrappers";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const { postData } = apiRequest();
const $q = useQuasar();
const formStore = useFormStore();
const authStore = useAuthStore();
const router = useRouter();
const { proxy } = getCurrentInstance();

let tour;

const listPreviewMenu = ref([]);
const loading = ref(false);
const drawerLeft = ref(false);
const refreshKeys = ref(0);
const refreshKeysContent = ref(0);
const loadingDrawer = ref(false);
const showComponentLoadingCount = ref(0);
const loadingShowComponent = ref(false);
const loadingHeader = ref(false);
const headerLoadedOnce = ref(false);
const initialLoadDone = ref(false);
const initialOverlayLock = ref(true);
const hasShowComponentLoadingSignal = ref(false);
const viewMode = ref("view");
const isSubscribed = ref(false);

let intervalId = null;
let hideShowComponentOverlayTimer = null;
const SHOW_COMPONENT_OVERLAY_HIDE_DELAY_MS = 250;

const choosedPages = ref([]);
const listMainConf = ref([]);
const headerConf = ref(null);

const isChromiumLike = () => {
  const ua = navigator.userAgent.toLowerCase();
  // edge, chrome, brave, opera, dll biasanya masuk ini
  const isChrome = ua.includes("chrome") || ua.includes("chromium");
  const isEdge = ua.includes("edg");
  const isOpera = ua.includes("opr");
  const isBrave =
    navigator.brave && typeof navigator.brave.isBrave === "function";
  const isFirefox = ua.includes("firefox");

  return (isChrome || isEdge || isOpera || isBrave) && !isFirefox;
};

const mainConfData = computed(() => {
  // Convert the array to an object using the "keys" property as the key
  return listMainConf.value.reduce((acc, item) => {
    if (item.keys) {
      acc[item.keys] = item.url;
    }
    return acc;
  }, {});
});

// Per-page override from the CMS Page Settings: "Show Page Header" off
// hides the frontpage top bar on that page. The value can arrive as a
// boolean or as "0"/0/"false" strings, so normalize it.
const pageHeaderVisible = computed(() => {
  const v = choosedPages.value?.forms?.setupTraining?.showHeader;
  if (v === undefined || v === null || v === "") return true;
  return !(v === false || v === 0 || v === "0" || v === "false");
});

// Per-page header override: { mode: inherit|custom|hidden, config }.
const pageHeaderSetting = computed(() => {
  const raw = choosedPages.value?.forms?.setupTraining?.header;
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  return raw;
});

// Resolve which header config to render: page override -> domain -> default.
const resolvedHeaderConfig = computed(() => {
  const setting = pageHeaderSetting.value;
  if (setting && setting.mode === "custom" && setting.config) {
    return normalizeHeaderConfig(setting.config);
  }
  return headerConf.value; // domain config (may be null)
});

const pageHeaderHidden = computed(
  () => pageHeaderSetting.value?.mode === "hidden"
);

// On-scroll variant: switch the header config once the page is scrolled past
// the configured threshold. Reads the actual scrolled position on scroll,
// since no single element is guaranteed to be the scroller.
const isScrolled = ref(false);
// The on-scroll header variant is only allowed once scrolling is known to be
// user-driven. Load-time scroll (browser restore, scroll anchoring, layout
// shift) must never switch the header on first paint.
const scrollArmed = ref(false);

const scrollThreshold = computed(
  () => Number(resolvedHeaderConfig.value?.scrolled?.threshold) || 80
);

const readScrollY = () => {
  if (typeof window === "undefined") return 0;
  const doc = document.documentElement;
  const body = document.body;
  const container =
    document.querySelector(".q-page-container") || document.querySelector("main");
  return Math.max(
    window.scrollY || window.pageYOffset || 0,
    doc ? doc.scrollTop || 0 : 0,
    body ? body.scrollTop || 0 : 0,
    container ? container.scrollTop || 0 : 0
  );
};

const updateScrollState = () => {
  // While the initial overlay is up, or before any user-driven scroll has
  // happened, the page is not "scrolled" as far as the header is concerned.
  // Browsers restore the last position and re-anchor on layout change; both
  // trigger scroll events that would otherwise switch the header on first paint.
  if (initialOverlayLock.value || !scrollArmed.value) {
    isScrolled.value = false;
    return;
  }
  isScrolled.value = readScrollY() > scrollThreshold.value;
};

const armScroll = () => {
  if (scrollArmed.value) return;
  scrollArmed.value = true;
  updateScrollState();
};

const onScrollKeyDown = (e) => {
  if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) {
    armScroll();
  }
};

const setupScrollListener = () => {
  if (typeof window === "undefined") return;
  window.removeEventListener("scroll", updateScrollState, true);
  window.addEventListener("scroll", updateScrollState, true);

  // Arm on any genuine user input that can scroll the page.
  ["wheel", "touchstart", "touchmove"].forEach((ev) =>
    window.addEventListener(ev, armScroll, { passive: true, capture: true })
  );
  window.addEventListener("keydown", onScrollKeyDown, true);

  resetScrollPosition();
  updateScrollState();
};

const teardownScrollListener = () => {
  if (typeof window === "undefined") return;
  window.removeEventListener("scroll", updateScrollState, true);
  ["wheel", "touchstart", "touchmove"].forEach((ev) =>
    window.removeEventListener(ev, armScroll, true)
  );
  window.removeEventListener("keydown", onScrollKeyDown, true);
};

// Pin the page to the top for the initial render. Browsers restore the last
// scroll position on refresh and the address bar shrink/layout shifts produce
// transient non-zero values, either of which would otherwise be read as
// "scrolled" the moment the overlay lifts and flip the header.
const resetScrollPosition = () => {
  if (typeof window === "undefined") return;
  try {
    window.scrollTo(0, 0);
  } catch (e) {
    // ignore
  }
  [document.documentElement, document.body, document.querySelector(".q-page-container")]
    .filter(Boolean)
    .forEach((el) => {
      el.scrollTop = 0;
    });
  isScrolled.value = false;
};

watch(scrollThreshold, () => updateScrollState());

const activeHeaderConfig = computed(() => {
  const base = resolvedHeaderConfig.value;
  if (
    base &&
    base.enabled &&
    base.scrolled?.enabled &&
    headerLoadedOnce.value &&
    !initialOverlayLock.value &&
    isScrolled.value &&
    base.scrolled.config
  ) {
    return normalizeHeaderConfig(base.scrolled.config);
  }
  return base;
});

// The header first paints from the domain config, then switches to the page's
// own custom header (and later between normal/on-scroll) once the page data is
// loaded. Those configs can share widget keys, so Vue reuses the slot nodes and
// keeps the stale HTML. Bumping this key on every active-config change forces
// the header content to re-create with the right variant.
const headerRenderKey = ref(0);
watch(activeHeaderConfig, () => {
  headerRenderKey.value += 1;
});



// True when the effective header has at least one configured widget.
// The background layer counts too, so a background-only custom header still
// replaces the default logo/title.
const hasAnyCustomHeader = computed(() => {
  const cfg = activeHeaderConfig.value;
  if (!cfg || !cfg.enabled) return false;
  const slots = cfg.slots || {};
  return (
    (slots.left?.length || 0) +
      (slots.center?.length || 0) +
      (slots.right?.length || 0) +
      (slots.background?.length || 0) >
    0
  );
});

const hasHeaderBackground = computed(() => {
  const cfg = activeHeaderConfig.value;
  return !!cfg && cfg.enabled && (cfg.slots?.background?.length || 0) > 0;
});

// Built-in header buttons; all on unless the effective header turns one off.
const defaultButtons = computed(() => {
  const fallback = { menu: true, account: true, notifications: true, help: true };
  const cfg = activeHeaderConfig.value;
  if (!cfg || !cfg.enabled) return fallback;
  return { ...fallback, ...(cfg.defaultButtons || {}) };
});

const defaultButtonsColor = computed(
  () => activeHeaderConfig.value?.defaultButtonsColor || ""
);

// Inline style so hex/rgb/rgba work too (q-btn's `color` only takes theme names).
const defaultButtonStyle = computed(() =>
  defaultButtonsColor.value ? { color: defaultButtonsColor.value } : {}
);

const headerToolbarStyle = computed(() => {
  const style = {};
  const cfg = activeHeaderConfig.value;
  if (!cfg || !cfg.enabled) return style;
  if (cfg.height) style.minHeight = cssSize(cfg.height);
  if (cfg.padding !== undefined && cfg.padding !== null) {
    style.padding = cfg.padding || "0";
  }
  if (cfg.transition) {
    style.transition = `background-color ${cfg.transition}, color ${cfg.transition}, min-height ${cfg.transition}`;
  }
  if (cfg.maxWidth) {
    style.maxWidth = cfg.maxWidth;
    style.margin = "0 auto";
    style.width = "100%";
  }
  return style;
});

const shouldRenderMainShowComponent = computed(
  () =>
    ((choosedPages.value?.forms &&
      choosedPages.value.forms.id &&
      choosedPages.value?.is_main == 1) ||
      viewMode.value == "edit") ??
    false
);

const showHomeOverlay = computed(
  () =>
    initialOverlayLock.value ||
    loading.value ||
    loadingDrawer.value ||
    loadingShowComponent.value ||
    loadingHeader.value
);

const onShowComponentLoading = (val) => {
  hasShowComponentLoadingSignal.value = true;

  if (val) {
    if (hideShowComponentOverlayTimer) {
      clearTimeout(hideShowComponentOverlayTimer);
      hideShowComponentOverlayTimer = null;
    }

    showComponentLoadingCount.value += 1;
    loadingShowComponent.value = true;
    return;
  }

  showComponentLoadingCount.value = Math.max(
    0,
    showComponentLoadingCount.value - 1
  );

  if (showComponentLoadingCount.value === 0) {
    hideShowComponentOverlayTimer = setTimeout(() => {
      if (showComponentLoadingCount.value === 0) {
        // Reset before releasing so a restored scroll position can't flip the
        // header the instant the overlay disappears.
        resetScrollPosition();
        loadingShowComponent.value = false;
        initialOverlayLock.value = false;
      }
    }, SHOW_COMPONENT_OVERLAY_HIDE_DELAY_MS);
  }
};

watch(
  () => [
    loading.value,
    loadingDrawer.value,
    loadingShowComponent.value,
    loadingHeader.value,
    shouldRenderMainShowComponent.value,
    hasShowComponentLoadingSignal.value,
  ],
  ([
    isLoading,
    isDrawerLoading,
    isShowCompLoading,
    isHeaderLoading,
    shouldRenderShowComp,
    hasSignal,
  ]) => {
    // Never release the overlay before the initial fetch sequence is done —
    // otherwise the gap between getMainConf and getHeaderConf/getNavMenu would
    // hide it while the header and page are still empty.
    if (!initialLoadDone.value) return;

    const baseReady =
      !isLoading && !isDrawerLoading && !isShowCompLoading && !isHeaderLoading;

    if (baseReady && !shouldRenderShowComp) {
      resetScrollPosition();
      initialOverlayLock.value = false;
      return;
    }

    if (baseReady && shouldRenderShowComp && hasSignal) {
      resetScrollPosition();
      initialOverlayLock.value = false;
    }
  }
);

const props = defineProps({
  mode: {
    type: String,
    default: "view",
  },
});

const startTutorial = () => {
  document.body.classList.remove("driver-active");
  tour.drive();
};
onMounted(async () => {
  // ====== NOTIF FLOW FIX ======
  try {
    const chromium = isChromiumLike();

    // Kalau permission sudah granted, boleh auto subscribe di semua browser
    if (Notification.permission === "granted") {
      await executeSubscription(); // ini fungsi subscribe murni ya
    } else {
      if (chromium) {
        // Chrome engine: JANGAN prompt di sini
        // Tampilkan info + tombol enable (gesture user)
        $q.notify({
          type: "info",
          message: "Turn on notifications by clicking the bell icon.",
          timeout: 4000,
        });
      } else {
        // Firefox: boleh tetap auto minta izin seperti behavior lama
        if (authStore.getStatusLog) {
          await requestPermissionAndSubscribe(true);
        }
      }
    }
  } catch (e) {
    console.warn("Notif init error:", e);
  }

  // if (!authStore.getStatusLog) {
  //   router.push("/login");
  // }

  // For tour guide Start
  tour = driver({
    showProgress: true,
    overlayColor: "rgba(0, 0, 0, 0.5)",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Done",
    closeBtnText: "Close",
    allowClose: false,
    onDestroyed: () => document.body.classList.remove("driver-active"),
  });

  tour.setSteps(buildTourSteps({ tour, formStore }));
  // For tour guide End

  // Stop the browser from restoring the previous scroll position during the
  // initial load; otherwise the header can flip to its on-scroll variant right
  // as the overlay lifts. Restored to auto once the page is loaded.
  const prevScrollRestoration =
    typeof history !== "undefined" ? history.scrollRestoration : null;
  if (prevScrollRestoration !== null) {
    history.scrollRestoration = "manual";
  }

  await getMainConf();
  await getHeaderConf();

  setupScrollListener();

  if (!formStore.getIsFrontPageTourDone && authStore.getStatusLog) {
    // startTutorial();
  }

  await getDataNav();

  // Find the menu item where is_main == 1
  // Flatten the menu array recursively before finding is_main == 1

  console.log("Mode:", props.mode);

  if (props.mode === "edit") {
    intervalId = setInterval(async () => {
      await getMainConf();
      // Background refresh must not retrigger the loading overlay.
      await getHeaderConf(false);
      await getDataNav();
      refreshKeys.value += 1;
    }, 60000);
    viewMode.value = "edit";
  }

  const flatMenu = flattenMenu(listPreviewMenu.value);

  console.log("Flat Menu:", flatMenu);
  const mainMenuItem = flatMenu.find((item) => item.is_main == 1);
  if (mainMenuItem) {
    // Check if current URL matches the main menu item's route
    const currentPath = router.currentRoute.value.path;
    if (currentPath === "/") {
      formStore.setCMSPageChoosed(mainMenuItem);
    } else {
      formStore.setCMSPageChoosed({
        type: "posts",
        tags:
          currentPath.split("/pages/")[1]?.split("/")[0] || mainMenuItem.url,
        url:
          currentPath.split("/pages/")[1]?.split("/").slice(1).join("/") || "",
      });
    }
    console.log("Current URL:", currentPath.split("/pages/")[1]?.split("/"));
    // You can perform additional logic here if needed
  }
  refreshKeys.value += 1;

  // All initial config (main conf, header conf, nav) plus the first page (if
  // any) are in place — release the loading overlay only from here.
  initialLoadDone.value = true;
  updateScrollState();

  if (prevScrollRestoration !== null && typeof history !== "undefined") {
    history.scrollRestoration = prevScrollRestoration;
  }
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }

  teardownScrollListener();

  if (hideShowComponentOverlayTimer) {
    clearTimeout(hideShowComponentOverlayTimer);
    hideShowComponentOverlayTimer = null;
  }
});

const flattenMenu = (arr) => {
  let result = [];
  arr.forEach((item) => {
    result.push(item);
    if (item.children && item.children.length > 0) {
      result = result.concat(flattenMenu(item.children));
    }
  });
  return result;
};

const getDataNav = async () => {
  loadingDrawer.value = true;
  try {
    const response = await postData(
      "get",
      null,
      "fpmanager/getNavMenu?rolefilter=1"
    );
    if (response.data) {
      console.log("Navigation Data:", response.data);
      listPreviewMenu.value = response.data;
      loadingDrawer.value = false;
    } else {
      loadingDrawer.value = false;
    }
  } catch (error) {
    console.error("Error fetching navigation data:", error);

    loadingDrawer.value = false;
  } finally {
    loading.value = false;
    loadingDrawer.value = false;
    refreshKeys.value += 1;
  }
};

const getHeaderConf = async (trackLoading = true) => {
  if (trackLoading) loadingHeader.value = true;
  try {
    const response = await postData("get", null, "fpmanager/getHeaderConf");
    const raw = response?.data;
    headerConf.value = raw ? normalizeHeaderConfig(raw) : null;
  } catch (error) {
    console.error("Error fetching header configuration:", error);
    headerConf.value = null;
  } finally {
    if (trackLoading) {
      loadingHeader.value = false;
      headerLoadedOnce.value = true;
    }
  }
};

const getMainConf = async () => {
  loading.value = true;
  try {
    const response = await postData("get", null, "fpmanager/getMainConf");
    if (response.data) {
      console.log("Main Configuration Data:", response.data);
      // Flatten the config if it's not "row"
      let mainConf = response.data;
      // Recursively flatten all children and filter where config is not "row"
      function flattenArray(arr) {
        let result = [];

        arr.forEach((item) => {
          // Add the current item to the result if it meets the condition
          if (item.config !== "row") {
            result.push(item);
          }

          // If the item has children, recursively process them
          if (item.children && item.children.length > 0) {
            result = result.concat(flattenArray(item.children));
          }
        });

        return result;
      }

      listMainConf.value = flattenArray(mainConf);

      console.log(listMainConf.value);
    }
  } catch (error) {
    loading.value = false;
    console.error("Error fetching main configuration data:", error);
  } finally {
    loading.value = false;
    refreshKeysContent.value += 1;
  }
};

const logout = async () => {
  const confirmed = await $q
    .dialog({
      title: "Logout Confirmation",
      message: "Are you sure you want to logout?",
      cancel: true,
      persistent: true,
    })
    .onOk(async () => {
      console.log(authStore.msLoginDet);
      if (authStore.msLoginDet?.username) {
        await msalLogout();
        // Setelah logoutRedirect, browser akan di-refresh,
        // jadi kode di bawah ini tidak akan dijalankan.
        return;
      }

      // Jika tidak ada login MSAL, lanjutkan dengan alur logout reguler.
      authStore.logoutAction();
      // Use Vue Router's composition API
      router.push("/login");
      $q.notify({
        color: "positive",
        message: "Anda telah berhasil logout.",
        timeout: 3000,
      });
    })
    .onCancel(() => false);

  if (!confirmed) {
    return;
  }
};

const msalLogout = async () => {
  if (!proxy.$msalInstance) {
    console.error("MSAL instance tidak ditemukan.");
    $q.notify({
      color: "warning",
      message: "MSAL instance tidak ditemukan.",
      timeout: 3000,
    });

    authStore.logoutAction();
    // Use Vue Router's composition API
    router.push("/");
    $q.notify({
      color: "positive",
      message: "Anda telah berhasil logout.",
      timeout: 3000,
    });
    return;
  }

  let activeAccount = proxy.$msalInstance.getActiveAccount();
  if (!activeAccount) {
    const allAccounts = proxy.$msalInstance.getAllAccounts();
    console.log(
      "Tidak ada akun aktif, mengambil semua akun MSAL:",
      allAccounts
    );
    if (allAccounts.length > 0) {
      activeAccount = allAccounts[0]; // Ambil akun pertama dari daftar
    }
  }

  console.log("Akun aktif sebelum logout:", activeAccount);
  if (activeAccount) {
    console.log("Melakukan logoutRedirect untuk akun:", activeAccount.username);
    try {
      // Menggunakan logoutRedirect untuk memastikan sesi browser juga terhapus.
      // Ini adalah metode paling andal untuk beralih akun.
      await proxy.$msalInstance
        .logoutPopup({
          account: activeAccount,
        })
        .then(() => {
          authStore.logoutAction();
          router.push("/login");
          $q.notify({
            color: "positive",
            message: "Anda telah berhasil logout.",
            timeout: 3000,
          });
        })
        .catch((e) => {
          console.error("Gagal melakukan logoutRedirect:", e);
        });
    } catch (error) {
      console.error("Gagal melakukan logoutRedirect:", error);
      $q.notify({
        color: "negative",
        message: "Gagal logout. Silakan coba lagi.",
        timeout: 3000,
      });
    }
  } else {
    // Jika tidak ada akun aktif, kita cukup lanjutkan.
    console.log("Tidak ada akun MSAL aktif yang terdeteksi.");
    authStore.logoutAction();
    router.push("/");
    $q.notify({
      color: "positive",
      message: "Anda telah berhasil logout.",
      timeout: 3000,
    });
  }
};

const getForms = async (idForms) => {
  loading.value = true;
  // viewByID
  try {
    const response = await postData("get", null, `cms/viewByID/${idForms}`);
    if (response.data) {
      console.log("Forms Data:", response.data);
      choosedPages.value.forms = response.data.value || [];
      loading.value = false;
    }
  } catch (error) {
    console.error("Error fetching forms data:", error);
    loading.value = false;
  } finally {
    loading.value = false;
    // refreshKeys.value += 1;
  }
};

// Pastikan Helper ini ada di file kamu (di luar function subscribeToPush)
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ====== subscribe murni TANPA requestPermission ======
const executeSubscription = async () => {
  console.log("--- [STEP 1] executeSubscription... ---");

  const registration = await navigator.serviceWorker.ready;
  console.log("--- [STEP 2] Service Worker Ready ---", registration);

  const vapidPublicKey = process.env.VAPID_KEY || "";

  // OPTIONAL: kalau sudah ada subscription, pakai itu aja
  const existingSub = await registration.pushManager.getSubscription();
  if (existingSub) {
    isSubscribed.value = true;
    console.log("--- Already subscribed ---", existingSub);
    await sendSubscriptionToBackend(existingSub);
    return;
  }

  console.log("--- [STEP 3] Subscribe ke Browser... ---");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  console.log("--- [STEP 4] Berhasil Subscribe Browser ---", subscription);
  await sendSubscriptionToBackend(subscription);
};

const executeUnsubscribe = async () => {
  console.log("--- [UNSUB] executeUnsubscribe... ---");

  const registration = await navigator.serviceWorker.ready;
  console.log("--- [UNSUB] Service Worker Ready ---", registration);

  const existingSub = await registration.pushManager.getSubscription();
  if (existingSub) {
    console.log("--- [UNSUB] Found existing subscription ---", existingSub);
    await existingSub.unsubscribe();
    console.log("--- [UNSUB] Unsubscribed from browser ---");
    await sendUnsubscribeToBackend(existingSub);
    isSubscribed.value = false;
  } else {
    console.log("--- [UNSUB] No existing subscription found ---");
    $q.notify({
      type: "info",
      message: "Tidak ada langganan notifikasi yang ditemukan.",
    });
  }
};

// ====== fungsi minta izin + lanjut subscribe ======
const requestPermissionAndSubscribe = async (byPassQuestion = true) => {
  if (!authStore.getStatusLog) {
    $q.notify({
      type: "warning",
      message: "Please log in to enable notifications.",
    });

    router.push("/login");
    return;
  }

  console.log("--- [REQ] requestPermissionAndSubscribe ---");

  const currentPermission = Notification.permission;
  console.log("--- Status Izin Awal:", currentPermission);

  if (byPassQuestion) {
    $q.dialog({
      title: `${isSubscribed.value ? "Disable" : "Enable"} Notifications`,
      message: `Are you sure you want to ${
        isSubscribed.value ? "disable" : "enable"
      } notifications?`,
      cancel: true,
      persistent: true,
    })
      .onOk(async () => {
        isSubscribed.value
          ? await executeUnsubscribe()
          : await executeSubscription();
      })
      .onCancel(() => {
        return;
      });
  } else {
    if (currentPermission === "granted") {
      await executeSubscription();
      return;
    }

    if (currentPermission === "denied") {
      $q.notify({
        type: "warning",
        message:
          "Notifikasi diblokir. Silakan reset izin di pengaturan browser.",
      });
      return;
    }
  }
};

// ====== kirim backend (dari kode kamu) ======
const sendSubscriptionToBackend = async (subscription) => {
  const subJson = subscription.toJSON();
  const payload = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth,
    },
  };

  console.log("--- [STEP 5] postData payload ---", payload);

  const response = await postData("post", payload, "fpmanager/subscribeAllow");

  console.log("--- [STEP 6] backend response ---", response);

  if (response) {
    $q.notify({
      color: "positive",
      message: "Notifikasi berhasil diaktifkan!",
      icon: "check_circle",
    });
  }
};

const sendUnsubscribeToBackend = async (subscription) => {
  const subJson = subscription.toJSON();
  const payload = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth,
    },
  };

  console.log("--- [UNSUB REQ] payload ---", payload);

  const response = await postData("post", payload, "fpmanager/unsubscribe");

  console.log("--- [UNSUB RES] backend response ---", response);

  if (response) {
    $q.notify({
      color: "positive",
      message: "Notifikasi berhasil dinonaktifkan!",
      icon: "check_circle",
    });
  }
};

watch(
  () => formStore.getCMSPageChoosed,
  (newVal) => {
    if (newVal) {
      console.log("checkChange", newVal);
      if (newVal.type === "page" && newVal.url && newVal.is_main == 1) {
        choosedPages.value = newVal || [];
        getForms(choosedPages.value.page);

        if (props.mode === "view") {
          router.push("/");
        }
      } else {
        if (newVal.type === "page") {
          choosedPages.value = newVal || [];
          router.push({
            name: "pages",
            params: {
              slug: newVal.tags
                ? Array.isArray(newVal.tags)
                  ? newVal.tags[0]
                  : newVal.tags
                : "Uncategorize",
              url: newVal.url ? newVal.url : newVal.page,
            },
          });

          getForms(choosedPages.value.page);
        } else if (newVal.type === "posts") {
          choosedPages.value = newVal || [];
          router.push({
            name: "pages",
            params: {
              slug: newVal.tags
                ? Array.isArray(newVal.tags)
                  ? newVal.tags[0]
                  : newVal.tags
                : "Uncategorize",
              url: newVal.url,
            },
          });
        } else if (newVal.type === "tags") {
          choosedPages.value = newVal || [];
          router.push({
            name: "tags",
            params: {
              tag: btoa(JSON.stringify(newVal.tags)),
              limit: btoa(newVal.limit ? newVal.limit : 3),
              orderBy: btoa(
                newVal.orderBy.length > 0 ? JSON.stringify(newVal.orderBy) : ""
              ),
              order: btoa(
                newVal.order.length > 0 ? JSON.stringify(newVal.order) : ""
              ),
            },
          });
        }
      }
    }
  }
);

watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    // if (!authStore.getStatusLog) {
    //   router.push("/login");
    // }

    if (newPath === "/") {
      // Find the menu item where is_main == 1
      const flatMenu = flattenMenu(listPreviewMenu.value);
      const mainMenuItem = flatMenu.find((item) => item.is_main == 1);
      if (mainMenuItem) {
        formStore.setCMSPageChoosed(mainMenuItem);
        // isHome.value = true;
      }
    } else if (newPath.startsWith("/pages/")) {
      formStore.setCMSPageChoosed({
        type: "posts",
        value: null,
        tags:
          newPath.split("/pages/")[1]?.split("/")[0] || "",
        url:
          newPath.split("/pages/")[1]?.split("/").slice(1).join("/") || "",
      });
    }
  }
);
</script>
<style scoped>
/* Saat driver aktif, blok klik ke halaman */
body.driver-active {
  pointer-events: none;
}

/* Tapi popover driver tetap bisa diklik */
body.driver-active .driver-popover,
body.driver-active .driver-popover * {
  pointer-events: auto;
}

.home-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Per-domain header background layer (behind the toolbar content) */
.header-toolbar {
  position: relative;
}

.header-toolbar > *:not(.header-bg-layer) {
  position: relative;
  z-index: 1;
}

.header-bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
}

/* Let background widgets stretch flush to fill the header bar */
.header-bg-layer :deep(.header-slot) {
  width: 100%;
  height: 100%;
  margin: 0 !important;
}
.header-bg-layer :deep(.header-slot__item) {
  width: 100%;
  height: 100%;
  margin: 0 !important;
}
</style>
