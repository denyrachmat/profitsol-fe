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
        />
        <q-btn flat dense round icon="home" aria-label="Menu" to="/" />
        <q-toolbar-title> PT Sumitronics Indonesia </q-toolbar-title>

        <div>Portal Application v2.0.0</div>
        <q-btn flat dense round icon="settings" aria-label="Menu">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup>
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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
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
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useAuthStore } from "stores/authStore";

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
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const store = useAuthStore();

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      store,
    };
  },
  created() {
    // console.log(JSON.stringify(this.authDetail));
    if (this.authDetail.length === 0) {
      this.$router.push("/login");
    }
  },
  computed: {
    authDetail() {
      return this.store.getDetail;
    },
  },
  methods: {
    logout() {
      this.store.logoutAction;
      this.$router.push("/login");
    },
  },
});
</script>
