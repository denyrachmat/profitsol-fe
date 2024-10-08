<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-cyan">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          v-if="store && store.choosedRoles && store.choosedRoles.role.id === 1"
        />
        <q-btn flat dense round icon="home" aria-label="Menu" to="/" />
        <q-toolbar-title> PT Sumitronics Indonesia </q-toolbar-title>

        <div>Portal Application v2.0.0</div>
        <q-btn flat dense aria-label="Roles" icon-right="group">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item
                clickable
                v-close-popup
                v-for="(role, idx) in listRoles"
                :key="idx"
                @click="changeRoles(role)"
                :active="role.id === store.choosedRoles.id"
                :disable="role.id === store.choosedRoles.id"
              >
                <q-item-section>{{ role.role.rm_role_name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat dense round icon="mail" aria-label="Notification">
          <q-menu @show="getNotif()" style="width: 30%">
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
                          JSON.parse(notif.amshd_paramstore).data
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
                          JSON.parse(notif.amshd_paramstore).data
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
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer reveal elevated class="bg-cyan">
      <q-toolbar>
        <q-toolbar-title>
          <div>{{ store.choosedRoles.role.rm_role_name }}</div></q-toolbar-title
        >
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useAuthStore } from "stores/authStore";
import { Providers, Msal2Provider, ProviderState } from "@microsoft/mgt";
import { useQuasar, date } from "quasar";
import { PublicClientApplication } from "@azure/msal-browser";
import apiRequest from "src/components/apiRequest";
import viewApps from "src/pages/Dashboards/viewApps.vue";
import { socket } from "src/boot/socket";

const { postData } = apiRequest();

import ChangePasswordVue from "src/pages/Dashboards/changePassword.vue";

const linksList = [
  {
    title: "Users Setup",
    caption: "Setup users for portal app",
    icon: "account_circle",
    link: "#/settings/users",
  },
  {
    title: "Menu Setup",
    caption: "Setup menu apps",
    icon: "touch_app",
    link: "#/settings/menu",
  },
  {
    title: "Role Setup",
    caption: "Setup users role",
    icon: "settings_accessibility",
    link: "#/settings/role",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
    // eslint-disable-next-line vue/no-unused-components
    ChangePasswordVue,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const $q = useQuasar();
    const store = useAuthStore();
    const listNotification = ref([]);
    const listInboxOnly = ref([]);
    const loading = ref(false);
    const tab = ref("inbox");

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

    const getNotif = async () => {
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
              param: "=",
              value: "sent",
            },
          ],
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
    };
  },
  beforeCreate() {
    console.log(this.authDetail);
  },
  created() {
    console.log(JSON.stringify(this.authDetail));
    if (
      !this.authDetail ||
      Object.keys(this.authDetail).length === 0
      // (this.authDetail && !this.authDetail.isLoggedIn)
    ) {
      this.$router.push("/login");
    }

    if (Providers.globalProvider) {
      console.log(Providers.globalProvider.state);

      console.log({ stat: "cek ms signin", data: ProviderState.SignedIn });
    }

    this.$msalInstance = new PublicClientApplication({
      auth: {
        clientId: process.env.MS_CLIENTID,
        authority: process.env.MS_AUTHORITY,
      },
      cache: {
        cacheLocation: "localStorage",
      },
    });

    this.getNotif();
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
  },
  methods: {
    async logout() {
      if (
        this.store.msLoginDet.length > 0 &&
        this.store.msLoginDet.username === this.store.authDet.username
      ) {
        const logoutRequest = {
          account: this.store.authDet.username,
        };

        // const loggerout = await this.$msalInstance.logout();
        // if (loggerout) {
        //   console.log(loggerout);
        // }
      }

      this.store.logoutAction();
      this.$router.push("/login");
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
          this.$q.notify({
            message: `You're on ${data.role.rm_role_name} now !`,
            caption: "Role Changed !",
            color: "green",
            timeout: 5000,
          });

          this.store.storeChoosedRole(data);
          this.store.storeMenu(data.role.role_app_map);
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
            dataProps: `http://localhost:8080/#/ams/approvalAction/${tokenAprv}/${token}/disp`,
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
      const getFirstKey = Object.keys(paramSet)[0];

      return paramSet[getFirstKey];
      // amshd_paramstore
    },
  },
});
</script>
