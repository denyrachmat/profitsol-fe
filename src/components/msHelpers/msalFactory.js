import { PublicClientApplication } from "@azure/msal-browser";
import { getRuntimeConfig } from "src/runtimeConfig";

let msalInstance = null;
let configuredKey = "";

export const buildMsalConfig = (settings = {}) => {
  const clientId =
    settings.MS_CLIENTID ||
    getRuntimeConfig("MS_CLIENTID") ||
    "00000000-0000-0000-0000-000000000000";
  const authority =
    settings.MS_AUTHORITY ||
    getRuntimeConfig("MS_AUTHORITY") ||
    "https://login.microsoftonline.com/common";
  return {
    auth: {
      clientId,
      authority,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true,
      secureCookies: window.location.protocol === "https:",
    },
    system: {
      allowNativeBroker: false,
      windowHashTimeout: 60000,
    },
  };
};

export const msalConfigKeyOf = (settings = {}) =>
  [
    settings.MS_CLIENTID || settings.auth?.clientId,
    settings.MS_AUTHORITY || settings.auth?.authority,
  ].join("|");

export const getMsalInstance = () => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(buildMsalConfig());
    configuredKey = msalConfigKeyOf(buildMsalConfig());
  }
  return msalInstance;
};

export const configureMsal = (settings = {}) => {
  const key = msalConfigKeyOf(settings);
  if (key === configuredKey) return getMsalInstance();
  if (!settings.MS_CLIENTID && !settings.MS_AUTHORITY) return getMsalInstance();
  msalInstance = new PublicClientApplication(buildMsalConfig(settings));
  configuredKey = key;
  return msalInstance;
};

export const resetMsal = () => {
  msalInstance = null;
  configuredKey = "";
};
