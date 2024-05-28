<template>
  <q-card class="my-card center">
    <q-card-section class="bg-purple q-pa-md text-white">
      <div class="text-h6">Login to your account</div>
    </q-card-section>

    <q-separator dark />

    <q-card-section>
      <q-form @submit="onSubmit('notgus')" @reset="onReset" class="q-gutter-md">
        <q-input
          filled
          v-model="username"
          label="Username"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-input
          filled
          type="password"
          v-model="password"
          label="Password"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-toggle v-model="remember" label="Remember Me?" />

        <q-btn
          flat
          color="blue"
          label="Forget your password?"
          no-caps
          @click="$emit('getrouted', 'forgot')"
        />

        <div>
          <q-btn
            label="Submit"
            type="submit"
            color="green"
            class="full-width"
          />
        </div>
      </q-form>
      <div class="q-pa-md text-center">Or</div>
      <div class="row">
        <div class="col text-center">
          <q-btn
            icon="ion-logo-windows"
            label=" Login with Microsoft"
            @click="SignInMs"
            class="full-width"
            color="blue-5"
            outline
          ></q-btn>
        </div>
      </div>
      <div class="row q-py-md">
        <div class="col text-center">
          <div class="text-subtitle2">
            Don't have an account?
            <q-btn
              flat
              color="cyan"
              label="Sign Up here"
              no-caps
              @click="$emit('getrouted', 'register')"
            />
            <!-- <br />
            Or login guest here
            <q-btn
              flat
              color="cyan"
              label="Login here"
              no-caps
              @click="onSubmit('guest')"
            /> -->
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
/* eslint-disable */
import { HelpersComponent } from "../../components/HelpersComponent";
import { defineComponent, ref } from "vue";
import { PublicClientApplication } from "@azure/msal-browser";
import { useAuthStore } from "stores/authStore";
import { Providers, Msal2Provider } from "@microsoft/mgt";

export default defineComponent({
  name: "login",
  mixins: [HelpersComponent],
  setup() {
    const store = useAuthStore();

    return {
      remember: ref(false),
      isMSLogin: ref(false),
      username: ref(""),
      password: ref(""),
      store,
    };
  },
  created() {
    if (this.authDetail && this.authDetail.length > 0) {
      this.$router.push("/");
    }
    // else if (!this.$q.localStorage.has("LoggedOut")) {
    //   this.onSubmit("guest");
    // }

    this.$msalInstance = new PublicClientApplication({
      auth: {
        clientId: process.env.MS_CLIENTID,
        authority: process.env.MS_AUTHORITY,
      },
      cache: {
        cacheLocation: "localStorage",
      },
    });
  },
  mounted() {
    const accounts = this.$msalInstance.getAllAccounts();
    if (accounts.length == 0) {
      return;
    }
  },
  computed: {
    authDetail() {
      return this.store.getDetail;
    },
  },
  methods: {
    async onSubmit(user) {
      let opt = {
        methods: "post",
        url: "login",
      };

      if (user === "guest") {
        var data = {
          username: "gueststxsmt",
          password: "guest",
        };
      } else {
        var data = {
          username: this.username,
          password: this.password,
          isMSLogin: this.isMSLogin,
          remember: this.remember,
        };
      }

      let hasil = await this.postData(opt, data, false, true);
      let date = new Date();

      var time =
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      if (hasil) {
        let remember = { rememberme: this.remember };
        let login_time = { login_time: time };
        let grup = { ...remember, ...login_time, ...hasil.data };

        this.store.storeAuthDet(grup);
        this.store.toggleLoggedIn();
        this.store.logMessage(hasil.message);
        this.store.storeChoosedRole(grup.rolesGroup.roles[0]);

        if (!this.isMSLogin) {
          this.store.storeMSTokenDet("");
          this.store.storeMSLoginDet("");
        }

        this.$router.push("/");
      }
      this.onReset();
    },
    onReset() {},
    async SignInMs() {
      const scopes = [
        "user.read",
        "mail.send",
        "Files.ReadWrite.All",
        "Sites.ReadWrite.All",
      ];

      await this.$msalInstance
        .loginPopup({
          scopes,
        })
        .then(async (val) => {
          const myAccounts = this.$msalInstance.getAllAccounts();
          const logs = myAccounts[0];
          const tokenRequest = {
            scopes,
            account: logs.username,
          };

          const dataToken = await this.$msalInstance.acquireTokenSilent(
            tokenRequest
          );

          if (dataToken) {
            this.store.storeMSTokenDet(dataToken);
            this.store.storeMSLoginDet(logs);

            this.username = logs.username;
            this.password = logs.idTokenClaims.rh;

            this.isMSLogin = true;

            this.onSubmit();
          }
        })
        .catch((error) => {
          this.$q.notify({
            color: "negative",
            message: `error during authentication: ${error}`,
          });
        });
    },
  },
});
</script>
