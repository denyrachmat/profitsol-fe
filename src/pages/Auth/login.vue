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
import {
  PublicClientApplication,
  InteractionStatus,
} from "@azure/msal-browser";
import { useAuthStore } from "stores/authStore";
import { Providers, Msal2Provider } from "@microsoft/mgt";
import { authHelper } from "src/components/msHelpers";

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
      isInteractionInProgress: ref(false),
    };
  },
  created() {
    console.log(this.authDetail);
    if (this.authDetail && this.store.getStatusLog) {
      this.$router.push("/");
    }
    // else if (!this.$q.localStorage.has("LoggedOut")) {
    //   this.onSubmit("guest");
    // }

    // this.$msalInstance = new PublicClientApplication({
    //   auth: {
    //     clientId: process.env.MS_CLIENTID,
    //     authority: process.env.MS_AUTHORITY,
    //     knownAuthorities: [new URL(process.env.MS_AUTHORITY).hostname], // Add this
    //   },
    //   cache: {
    //     cacheLocation: "localStorage",
    //     storeAuthStateInCookie: true, // Recommended for IE
    //   },
    // });

    // this.$msalInstance = new PublicClientApplication({
    //   auth: {
    //     clientId: process.env.MS_CLIENTID,
    //     authority: process.env.MS_AUTHORITY,
    //     knownAuthorities: [new URL(process.env.MS_AUTHORITY).hostname],
    //   },
    //   cache: {
    //     cacheLocation: "localStorage",
    //     storeAuthStateInCookie: true,
    //   },
    //   system: {
    //     loggerOptions: {
    //       loggerCallback: (level, message, containsPii) => {
    //         if (containsPii) return;
    //         console.log(`MSAL: ${message}`);
    //       },
    //     },
    //   },
    // });

    this.isInteractionInProgress = false;

    // if (this.$msalInstance.getInteractionInProgress()) {
    //   this.handlePendingLogin();
    // }
  },
  mounted() {
    const accounts = this.$msalInstance.getAllAccounts();
    if (accounts.length == 0) {
      return;
    }

    console.log(accounts);
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
        this.store.storeIsMsChecking(hasil.data.is_ms_checking);

        if (!this.isMSLogin) {
          this.store.storeMSTokenDet("");
          this.store.storeMSLoginDet("");
        }

        this.$router.push("/");
      }
      this.onReset();
    },
    onReset() {},
    async SignInMsOld() {
      // Check interaction state using storage
      const interactionKey = `msal.${this.$msalInstance.config.auth.clientId}.interaction.status`;
      const interactionState = sessionStorage.getItem(interactionKey);

      const scopes = [
        "user.read",
        "mail.send",
        "Files.ReadWrite.All",
        "Sites.ReadWrite.All",
        // "Calendars.ReadBasic",
        "Calendars.ReadWrite",
      ];

      if (this.isInteractionInProgress || interactionState) {
        this.$q.notify({
          color: "warning",
          message: "Please complete the current login attempt first",
          timeout: 3000,
        });
        return;
      }

      // Clear all MSAL accounts and related cache to force account selection
      const accounts = await this.$msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const tokenResult = await this.acquireTokenWithFallback(
          accounts[0],
          scopes
        );
        this.handleLoginSuccess(accounts[0], tokenResult);

        return;
      }

      this.isInteractionInProgress = true;

      try {
        // 👇 Panggil loginPopup dengan prompt: "login"
        const authResult = await this.$msalInstance.loginPopup({
          scopes,
          prompt: "select_account", // Pastikan prompt ini sudah digunakan
          loginHint: "", // Clear any login hints
        });

        console.log(authResult);
        // 👇 Cek kembali akun setelah login berhasil
        const newAccounts = this.$msalInstance.getAllAccounts();
        if (authResult && newAccounts.length > 0) {
          console.log(newAccounts);
          // Sekarang newAccounts seharusnya hanya berisi akun yang baru
          console.log("Login dengan akun baru:", authResult.account);

          const tokenResult = await this.acquireTokenWithFallback(
            authResult.account,
            scopes
          );
          this.handleLoginSuccess(authResult.account, tokenResult);
        }
      } catch (error) {
        this.handleLoginError(error);
      } finally {
        this.isInteractionInProgress = false;
        sessionStorage.removeItem(interactionKey);
      }
    },

    async SignInMs() {
      const scopes = [
        "user.read",
        "mail.send",
        "Files.ReadWrite.All",
        "Sites.ReadWrite.All",
        "Calendars.ReadWrite",
      ];

      // Check if interaction is in progress
      if (
        this.isInteractionInProgress ||
        (await authHelper.handleInteractionInProgress())
      ) {
        this.$q.notify({
          color: "warning",
          message: "Please complete the current login attempt first",
          timeout: 3000,
        });
        return;
      }

      this.isInteractionInProgress = true;

      try {
        // Use the updated authHelper with Edge compatibility
        const authResult = await authHelper.login(scopes);

        if (authResult && authResult.account) {
          console.log("Login successful:", authResult.account);

          // Get access token
          const tokenResult = await authHelper.acquireTokenSilently(scopes);
          this.handleLoginSuccess(authResult.account, tokenResult);
        }
      } catch (error) {
        console.error("Login failed:", error);
        this.handleLoginError(error);
      } finally {
        this.isInteractionInProgress = false;
      }
    },

    // Your existing success/error handlers
    handleLoginSuccess(account, tokenResult) {
      // Your success logic here
      console.log("Token acquired:", tokenResult);
      this.$q.notify({
        color: "positive",
        message: "Login successful!",
        timeout: 3000,
      });
    },

    handleLoginError(error) {
      // Your error handling logic here
      this.$q.notify({
        color: "negative",
        message: `Login failed: ${error.message}`,
        timeout: 5000,
      });
    },

    // Optional: Add a method to manually clear cache if needed
    async clearAuthCache() {
      authHelper.clearMsalCache();
      this.$q.notify({
        color: "info",
        message: "Authentication cache cleared",
        timeout: 3000,
      });
    },

    // Helper method for token acquisition
    async acquireTokenWithFallback(account, scopes) {
      try {
        return await this.$msalInstance.acquireTokenSilent({
          scopes,
          account,
        });
      } catch (silentError) {
        if (silentError instanceof InteractionRequiredAuthError) {
          return await this.$msalInstance.acquireTokenPopup({
            scopes,
            account,
          });
        }
        throw silentError;
      }
    },

    // Handle successful login
    handleLoginSuccess(account, tokenResult) {
      this.store.storeMSTokenDet(tokenResult);
      this.store.storeMSLoginDet(account);
      this.username = account.username;
      this.isMSLogin = true;
      this.onSubmit();
    },
    clearAuthStorage() {
      const msalKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("msal.")
      );
      const oidcKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("oidc.")
      );
      [...msalKeys, ...oidcKeys].forEach((key) => localStorage.removeItem(key));

      sessionStorage.clear(); // Optional: Clear session storage if used
    },

    // Handle errors
    async handleLoginError(error) {
      console.error("Login error:", error);

      const scopes = [
        "user.read",
        "mail.send",
        // "Files.ReadWrite.All",
        // "Sites.ReadWrite.All",
      ];

      if (error instanceof DOMException) {
        this.$q.notify({
          color: "negative",
          message: "Storage full - cleared cache. Please try again.",
        });
        this.clearAuthStorage(); // Retry automatically if needed
        await this.$msalInstance.loginPopup({ scopes });
      }

      let message = "Microsoft login failed";
      if (error.errorMessage) {
        message += `: ${error.errorMessage}`;
      } else if (error.message) {
        message += `: ${error.message}`;
      }

      this.$q.notify({
        color: "negative",
        message,
        timeout: 5000,
        actions:
          error.errorCode !== "user_cancelled"
            ? [
                {
                  label: "Retry",
                  color: "white",
                  handler: () => this.SignInMs(),
                },
              ]
            : null,
      });
    },

    async OldSignInMs() {
      // 1. Check for existing interaction
      const interactionKey = `msal.${this.$msalInstance.config.auth.clientId}.interaction.status`;
      const interactionState = sessionStorage.getItem(interactionKey);

      if (interactionState) {
        this.$q.notify({
          color: "warning",
          message: "Please complete the current login attempt first",
          timeout: 3000,
        });
        return;
      }

      // 2. Clear any old tokens
      // try {
      //   await this.$msalInstance.logout();
      // } catch (error) {
      //   console.log("No existing session to clear");
      // }

      // 3. Start new login
      const scopes = [
        "user.read",
        "mail.send",
        "Files.ReadWrite.All",
        "Sites.ReadWrite.All",
      ];

      try {
        const authResult = await this.$msalInstance.loginPopup({
          scopes,
          prompt: "select_account",
        });

        // 4. Process successful login
        const accounts = this.$msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const tokenRequest = {
            scopes,
            account: accounts[0],
          };

          const dataToken = await this.$msalInstance
            .acquireTokenSilent(tokenRequest)
            .catch(async (error) => {
              if (error.name === "InteractionRequiredAuthError") {
                return await this.$msalInstance.acquireTokenPopup(tokenRequest);
              }
              throw error;
            });

          this.store.storeMSTokenDet(dataToken);
          this.store.storeMSLoginDet(accounts[0]);
          this.username = accounts[0].username;
          this.isMSLogin = true;
          this.onSubmit();
        }
      } catch (error) {
        console.error("MS Login error:", error);

        // 5. Clean up if error occurs
        sessionStorage.removeItem(interactionKey);

        this.$q.notify({
          color: "negative",
          message: "Microsoft login failed",
          caption: error.message,
        });
      }
    },
    // async handlePendingLogin() {
    //   try {
    //     // Get the interaction state from storage
    //     const interactionState =
    //       this.$msalInstance.browserStorage.getInteractionState();

    //     if (interactionState && interactionState.interactionType === "popup") {
    //       // Complete the pending interaction
    //       const result = await this.$msalInstance.handleRedirectPromise();

    //       if (result) {
    //         // Successfully completed the pending login
    //         await this.processMsalResult(result);
    //       } else {
    //         // No result means the interaction was cancelled
    //         this.$q.notify({
    //           color: "warning",
    //           message: "Login was cancelled",
    //           timeout: 3000,
    //         });
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error handling pending login:", error);
    //     this.$q.notify({
    //       color: "negative",
    //       message: "Error completing previous login attempt",
    //       timeout: 3000,
    //     });
    //   } finally {
    //     // Clear the interaction state
    //     this.$msalInstance.browserStorage.removeInteractionState();
    //   }
    // },
    // async processMsalResult(result) {
    //   const accounts = this.$msalInstance.getAllAccounts();
    //   if (accounts.length > 0) {
    //     const tokenRequest = {
    //       scopes: ["user.read"],
    //       account: accounts[0],
    //     };

    //     const tokenResponse = await this.$msalInstance
    //       .acquireTokenSilent(tokenRequest)
    //       .catch(async (error) => {
    //         if (error instanceof InteractionRequiredAuthError) {
    //           return await this.$msalInstance.acquireTokenPopup(tokenRequest);
    //         }
    //         throw error;
    //       });

    //     // Store tokens and proceed with login
    //     this.store.storeMSTokenDet(tokenResponse);
    //     this.store.storeMSLoginDet(accounts[0]);
    //     this.username = accounts[0].username;
    //     this.isMSLogin = true;
    //     await this.onSubmit();
    //   }
    // },
  },
});
</script>
