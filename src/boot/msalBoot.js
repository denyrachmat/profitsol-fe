import { boot } from "quasar/wrappers";
import Emitter from "tiny-emitter";
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: process.env.MS_CLIENTID,
    authority: process.env.MS_AUTHORITY,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "localStorage", // Changed from sessionStorage
    storeAuthStateInCookie: true,  // Critical for Edge!
    secureCookies: window.location.protocol === "https:"
  },
  system: {
    allowNativeBroker: false, // Disable native broker for Edge compatibility
    windowHashTimeout: 60000, // Longer timeout for Edge
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

export default boot(async ({ app }) => {
  app.config.globalProperties.$msalInstance = msalInstance;
  app.config.globalProperties.$emitter = new Emitter();

  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      // Login berhasil, atur akun aktif
      msalInstance.setActiveAccount(response.account);
      console.log("Redirect promise handled successfully. Active account:", response.account);
    }
  } catch (error) {
    console.error("Error handling redirect promise:", error);
  }
});
