<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      elevated
      :style="`background-color:${
        store.choosedDomain ? store.choosedDomain.pd_base_color : 'cyan'
      }`"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          v-if="
            store &&
            store.choosedRoles &&
            store.choosedRoles.role &&
            store.choosedRoles.role.id === 1
          "
        />
        <q-btn
          flat
          dense
          round
          icon="home"
          aria-label="Menu"
          @click="onClickHome"
        >
          <q-tooltip>Back to home</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          icon="home_work"
          aria-label="Menu"
          :to="'/portal'"
          v-if="
            !(
              store &&
              store.choosedDomain &&
              store.choosedDomain.pd_is_cms == 1 &&
              store.choosedDomain.urlCMS
            )
          "
        >
          <q-tooltip>Back to Portal</q-tooltip>
        </q-btn>
        <q-toolbar-title>
          <q-select
            borderless
            v-model="domain"
            use-input
            input-debounce="0"
            :options="options"
            @filter="filterFn"
            option-label="pd_desc"
            @update:model-value="onSelectStore"
            dense
            dark
            :disable="!store.choosedRoles || !store.choosedRoles.role"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-toolbar-title>

        <div>Portal Application v2.26.9.1</div>

        <q-btn flat dense aria-label="Roles" icon-right="group">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item
                clickable
                v-close-popup
                v-for="(role, idx) in listRoles"
                :key="idx"
                @click="changeRoles(role)"
                :active="role.role.id === store.choosedRoles.role.id"
                :disable="role.role.id === store.choosedRoles.role.id"
              >
                <q-item-section>{{ role.role.rm_role_name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat dense round icon="mail" aria-label="Notification">
          <q-menu @show="getNotif()" style="width: 50%" @hide="initPage = 1">
            <q-list style="overflow: auto; height: 40%">
              <q-item-label header>
                <q-tabs
                  v-model="tab"
                  inline-label
                  class="text-dark"
                  dense
                  narrow-indicator
                  @update:model-value="getNotif()"
                  justify
                >
                  <q-tab
                    name="inbox"
                    icon="inbox"
                    label="Inbox"
                    :disable="loading"
                  />
                  <q-tab
                    name="outbox"
                    icon="outgoing_mail"
                    label="Outbox"
                    :disable="loading"
                  />
                </q-tabs>
                <br />
                <div class="row">
                  <div class="col">
                    <q-btn
                      outline
                      color="blue"
                      dense
                      class="full-width"
                      @click="onClickReadAll()"
                      :disable="loading"
                    >
                      Mark all as read
                    </q-btn>
                  </div>
                  <div class="col-2 q-pl-sm">
                    <q-btn
                      outline
                      color="orange"
                      dense
                      class="full-width"
                      :disable="loading"
                      icon-right="search"
                      @click="onClickSearchOption()"
                    >
                      Search
                    </q-btn>
                  </div>
                </div>
              </q-item-label>
              <template v-if="listNotification.length > 0">
                <q-item
                  clickable
                  v-ripple
                  v-for="(notif, idx) in listNotification"
                  :key="idx"
                  :class="notif.readed_at ? 'white' : 'bg-orange-2'"
                  @click="
                    onClickNotification(notif.amshd_token, notif.amstd_token)
                  "
                >
                  <q-separator spaced v-if="idx > 0" />
                  <q-item-section>
                    <q-item-label v-if="tab === 'outbox'">
                      To
                      <b
                        >{{ notif.receive_user.pud_first_name }}
                        {{ notif.receive_user.pud_last_name }}</b
                      >
                      -
                      {{
                        getFirstParamIfExists(
                          JSON.parse(notif.amshd_paramstore)
                        )
                      }}
                    </q-item-label>
                    <q-item-label v-else>
                      From
                      <b
                        >{{ notif.sender_user.pud_first_name }}
                        {{ notif.sender_user.pud_last_name }}</b
                      >
                      -
                      {{
                        getFirstParamIfExists(
                          JSON.parse(notif.amshd_paramstore)
                        )
                      }}
                    </q-item-label>
                    <q-item-label caption lines="2">
                      {{
                        tab === "outbox"
                          ? "Send approval is success, click to view content."
                          : "You receive new notification, click to view content."
                      }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side top>
                    <q-item-label caption>{{
                      getTimeDifference(notif.created_at)
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-btn full-width color="indigo" @click="onClickMoreNotif"
                      >Load More</q-btn
                    >
                  </q-item-section>
                </q-item>
              </template>

              <q-item v-else>
                <q-item-section>
                  <q-item-label>{{
                    loading
                      ? "Loading Data, please wait"
                      : "No new notification for you :("
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>

          <q-badge color="red" floating v-if="totalUnread > 0">
            {{ totalUnread }}
          </q-badge>
        </q-btn>

        <q-btn flat dense round icon="settings" aria-label="Menu">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="changePassword()">
                <q-item-section>Change Password</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="logout()">
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header> Setup Apps </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />

        <q-separator></q-separator>
        <appListRows :dataProps="getRoleAppMap" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab
          icon="add"
          direction="left"
          color="accent"
          v-if="getMinimizedMenu && getMinimizedMenu.length > 0"
        >
          <q-fab-action
            v-for="(minimized, idx) in getMinimizedMenu"
            :key="idx"
            @click="openMinimizedApp(minimized)"
            color="primary"
            :icon="minimized.am_app_icon"
            :label="minimized.am_app_name"
          />
        </q-fab>
      </q-page-sticky>
    </q-page-container>

    <q-footer
      reveal
      elevated
      :style="`background-color:${
        store.choosedDomain ? store.choosedDomain.pd_base_color : 'cyan'
      }`"
    >
      <q-toolbar>
        <q-toolbar-title>
          <div v-if="store.choosedRoles">
            {{ store.choosedRoles.role.rm_role_name }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useAuthStore } from "stores/authStore";
import { Providers, Msal2Provider, ProviderState } from "@microsoft/mgt";
import { useQuasar, date } from "quasar";
// import { PublicClientApplication } from "@azure/msal-browser";
import apiRequest from "src/components/apiRequest";
import viewApps from "src/pages/Dashboards/viewApps.vue";
import { socket } from "src/boot/socket";
import appListRows from "src/pages/Dashboards/appListRows.vue";
import dataFilter from "src/pages/AMS/dataFilter.vue";
import { authHelper } from "src/components/msHelpers";

window.onbeforeunload = function (e) {
  return "Please press the Logout button to logout.";
};

const { postData } = apiRequest();

import ChangePasswordVue from "src/pages/Dashboards/changePassword.vue";

const linksList = [
  {
    title: "Users Setup",
    caption: "Setup users for portal app",
    icon: "account_circle",
    link: "/settings/users",
  },
  {
    title: "Menu Setup",
    caption: "Setup menu apps",
    icon: "touch_app",
    link: "/settings/menu",
  },
  {
    title: "Role Setup",
    caption: "Setup users role",
    icon: "settings_accessibility",
    link: "/settings/role",
  },
];

// List of routes that should not trigger beforeunload warning
const allowedRoutes = ["/settings/users", "/settings/menu", "/settings/role"];

const msalConfig = {
  auth: {
    clientId: process.env.MS_CLIENTID,
    authority: process.env.MS_AUTHORITY,
    redirectUri: window.location.origin, // Must match app registration
    postLogoutRedirectUri: window.location.origin, // 👈 Critical for logout
    navigateToLoginRequestUrl: false, // Prevents unexpected redirects
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
    // eslint-disable-next-line vue/no-unused-components
    ChangePasswordVue,
    appListRows,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const $q = useQuasar();
    const store = useAuthStore();
    const listNotification = ref([]);
    const listInboxOnly = ref([]);
    const loading = ref(false);
    const tab = ref("inbox");
    const domain = ref("");
    const options = ref([]);
    const initPage = ref(1);

    socket.on("server-stxi", (data) => {
      console.log(data);
      if (
        data.app === "portal_notif" &&
        data.data.username_dest === store.authDet.username
      ) {
        $q.notify({
          message: data.message,
          caption: "New Notification",
          color: data.type,
          timeout: 10000,
          onDismiss: () => {},
        });

        getNotif();
      }
    });

    const getNotif = async (filteredData = []) => {
      loading.value = true;
      listNotification.value = [];
      const data = await postData(
        "post",
        {
          filter: [
            {
              cols:
                tab.value == "inbox" ? "amshd_username_apprv" : "p_u_username",
              param: "=",
              value: store.authDet.username,
            },
            {
              cols: "amshd_stat",
              param: tab.value == "inbox" ? "<>" : "=",
              value: tab.value == "inbox" ? "receive" : "sent",
            },
          ].concat(filteredData),
          page: initPage.value,
        },
        `ams/approveHist`,
        false,
        false,
        true
      );

      if (data) {
        loading.value = false;
        listNotification.value = data.data;

        if (tab.value === "inbox") {
          listInboxOnly.value = data.data;
        }
      } else {
        loading.value = false;
        listInboxOnly.value = [];
      }
    };

    const getRoleAppMap = computed(() =>
      store.getChoosedRole
        ? store.getChoosedRole.role.role_app_map.filter(
            (f) => f.apps && f.apps.am_is_drawer == 1
          )
        : []
    );

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      store,
      $q,
      listNotification,
      loading,
      tab,
      listInboxOnly,
      socket,
      getNotif,
      getRoleAppMap,
      options,
      domain,
      initPage,
      isInteractionInProgress: ref(false),
    };
  },
  beforeCreate() {
    console.log(this.authDetail);
  },
  created() {
    if (
      !this.authDetail ||
      Object.keys(this.authDetail).length === 0 ||
      !this.store.getChoosedRole
      // (this.authDetail && !this.authDetail.isLoggedIn)
    ) {
      this.$router.push("/login");
    }

    if (this.store.getChoosedRole) {
      this.getRoles(this.store.getChoosedRole.role.id);
    }
    // console.log(JSON.stringify(this.authDetail));

    // if (Providers.globalProvider) {
    //   console.log(Providers.globalProvider.state);

    //   console.log({ stat: "cek ms signin", data: ProviderState.SignedIn });
    // }

    console.log(this.$msalInstance);

    // this.$msalInstance = new PublicClientApplication(msalConfig);

    this.getNotif();
    this.getListDomain();
  },
  computed: {
    authDetail() {
      return this.store.getDetail;
    },
    listRoles() {
      return this.store.authDet.rolesGroup.roles;
    },
    totalUnread() {
      return !this.listInboxOnly
        ? 0
        : this.listInboxOnly.filter((fil) => !fil.readed_at).length;
    },
    getMinimizedMenu() {
      return this.store.getMinimizedMenu;
    },
  },
  methods: {
    handleBeforeUnload(e) {
      if (allowedRoutes.includes(this.$route.path)) {
        return; // Don't show warning for allowed routes
      }

      // Only show warning if user has unsaved changes or is logged in
      if (this.hasUnsavedChanges || this.isUserLoggedIn) {
        e.preventDefault();
        e.returnValue = ""; // Required for some browsers
        return "";
      }
    },
    async logout() {
      if (this.store.msLoginDet?.username) {
        // await this.msalLogout();
        await authHelper.logout();
        // Setelah logoutRedirect, browser akan di-refresh,
        // jadi kode di bawah ini tidak akan dijalankan.
        // return;
      }

      // Jika tidak ada login MSAL, lanjutkan dengan alur logout reguler.
      this.store.logoutAction();
      this.$router.push("/login");
      this.$q.notify({
        color: "positive",
        message: "Anda telah berhasil logout.",
        timeout: 3000,
      });
    },
    async msalLogout() {
      if (!this.$msalInstance) {
        console.error("MSAL instance tidak ditemukan.");
        this.$q.notify({
          color: "warning",
          message: "MSAL instance tidak ditemukan.",
          timeout: 3000,
        });

        this.store.logoutAction();
        this.$router.push("/login");
        this.$q.notify({
          color: "positive",
          message: "Anda telah berhasil logout.",
          timeout: 3000,
        });
        return;
      }

      let activeAccount = this.$msalInstance.getActiveAccount();
      if (!activeAccount) {
        const allAccounts = this.$msalInstance.getAllAccounts();
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
        console.log(
          "Melakukan logoutRedirect untuk akun:",
          activeAccount.username
        );
        try {
          // Menggunakan logoutRedirect untuk memastikan sesi browser juga terhapus.
          // Ini adalah metode paling andal untuk beralih akun.
          await this.$msalInstance
            .logoutPopup({
              account: activeAccount,
              // postLogoutRedirectUri: window.location.origin, // Make sure this matches your Azure AD app registration
            })
            .then(() => {
              this.store.logoutAction();

              window.close();
              this.$router.push("/");
              this.$q.notify({
                color: "positive",
                message: "Anda telah berhasil logout.",
                timeout: 3000,
              });
            });
          // The browser will be redirected, so code below may not execute.
        } catch (error) {
          console.error("Gagal melakukan logoutRedirect:", error);
          this.$q.notify({
            color: "negative",
            message: "Gagal logout. Silakan coba lagi.",
            timeout: 3000,
          });
        }
      } else {
        // Jika tidak ada akun aktif, kita cukup lanjutkan.
        console.log("Tidak ada akun MSAL aktif yang terdeteksi.");
        this.store.logoutAction();
        this.$router.push("/login");
        this.$q.notify({
          color: "positive",
          message: "Anda telah berhasil logout.",
          timeout: 3000,
        });
      }
    },
    changePassword() {
      this.$q
        .dialog({
          component: ChangePasswordVue,

          // props forwarded to your custom component
          componentProps: {
            title: "Upload Documents",
            // ...more..props...
          },
        })
        .onOk(async (val) => {
          console.log(val);
        });
    },
    changeRoles(data) {
      this.$q
        .dialog({
          title: "Confirm",
          message: `Are you sure want to change roles to ${data.role.rm_role_name} ?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          console.log(data);
          await this.getRoles(data.rm_role_id);

          this.$q.notify({
            message: `You're on ${data.role.rm_role_name} now !`,
            caption: "Role Changed !",
            color: "green",
            timeout: 5000,
          });

          // this.store.storeChoosedRole(data);
          // this.store.storeMenu(data.role.role_app_map);
        });
    },
    getTimeDifference(timestmp) {
      const dates = new Date(timestmp);
      const dateNow = new Date();

      let days = date.getDateDiff(dateNow, dates, "days");
      let hours = date.getDateDiff(dateNow, dates, "hour");
      let minutes = date.getDateDiff(dateNow, dates, "minute");
      let seconds = date.getDateDiff(dateNow, dates, "second");

      return days > 30
        ? "A Long ago"
        : `${days} days, ${hours > 23 ? parseInt(hours / 24) : hours} hours, ${
            minutes > 60 ? parseInt(minutes / 60) : minutes
          } minutes ago`;
    },
    onClickNotification(token, tokenAprv) {
      this.$q
        .dialog({
          component: viewApps,

          // props forwarded to your custom component
          componentProps: {
            dataProps: `https://intranet.sumitronics-indonesia.com/ams/approvalAction/${tokenAprv}/${token}`,
            // dataProps: `http://192.168.100.32:8081/portal_v2/#/ams/approvalAction/${tokenAprv}/${token}`,
            // dataProps: `http://localhost:8080/#/ams/approvalAction/${tokenAprv}/${token}`,
            title: "Approval Action",
            // ...more..props...
          },
        })
        .onDismiss(async (val) => {
          this.getNotif();
        });
    },
    async onClickReadAll() {
      const data = await postData(
        "get",
        null,
        `ams/readAllNotif`,
        false,
        false,
        true
      );

      if (data) {
        this.loading = false;
        this.getNotif();
      }
    },
    getFirstParamIfExists(paramSet) {
      // msgkey
      let getFirstKey;
      if (paramSet.msgkey) {
        getFirstKey = paramSet.msgkey;
      } else {
        getFirstKey = Object.keys(paramSet.data)[0];
      }

      return paramSet.data[getFirstKey];
      // amshd_paramstore
    },
    async getListDomain() {
      let hasil = await postData("get", null, "domain");

      if (hasil) {
        this.options = [];
        hasil.data.map((val) => {
          this.options.push(val);
        });

        this.domain = this.options[0];
        this.onSelectStore(this.domain);
      }
    },
    onSelectStore(val) {
      console.log("change domain");
      this.store.storeDomain(val);
    },
    onClickMoreNotif() {
      this.initPage = this.initPage + 1;
      this.getNotif();
    },
    onClickSearchOption() {
      this.$q
        .dialog({
          component: dataFilter,
          componentProps: {
            colsData: [
              {
                field: "p_u_username",
                name: "p_u_username",
                label: "From",
              },
              {
                field: "amshd_paramstore",
                name: "amshd_paramstore",
                label: "Subject",
              },
            ],
            filtered: [
              {
                cols: "p_u_username",
                param: "like",
                value: "",
              },
              {
                cols: "amshd_paramstore",
                param: "like",
                value: "",
              },
            ],
            nonEdit: true,
          },
        })
        .onOk(async (val) => {
          this.getNotif(val);
          console.log(val);
        });
    },
    async getRoles(idRoles) {
      const data = await postData(
        "get",
        null,
        `portal/roles/${idRoles}`,
        false,
        true,
        true
      );
      if (data) {
        // this.store.storeRoles(data);
        this.store.storeChoosedRole({
          ...this.store.getChoosedRole,
          role: data.data,
        });

        this.store.storeMenu(data.data.role_app_map);
      } else {
        this.$q.notify({
          color: "negative",
          message: "Failed to load roles",
          icon: "warning",
        });
      }
    },
    openMinimizedApp(app) {
      this.store.removeMinimizedMenu(app.am_app_code);
      this.$q
        .dialog({
          component: viewApps,

          // props forwarded to your custom component
          componentProps: {
            dataProps: app.am_app_url,
            title: app.am_app_name,
            isRouter: app.am_is_router,
            // ...more..props...
          },
        })
        .onDismiss(async (val) => {
          console.log("Dialog closed");
        });
    },
    onClickHome() {
      if (
        this.store.choosedDomain.pd_is_cms == 1 &&
        this.store.choosedDomain.urlCMS
      ) {
        window.location.href = this.store.choosedDomain.urlCMS;
      } else if (this.store.choosedDomain.pd_is_cms == 2) {
        this.$router.push("/");
      } else {
        this.$router.push("/portal");
      }
    },
  },
});
</script>
