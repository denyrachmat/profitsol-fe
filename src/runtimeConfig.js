import axios from "axios";

const keys = [
  "APP_NAME",
  "APP_LOGO",
  "BASE_COLOR",
  "MS_CLIENTID",
  "MS_AUTHORITY",
  "GRAPH_API",
  "SHAREPOINT_URL",
  "SOCKET_URL",
  "INTRANET_URL",
  "VAPID_KEY",
];

const defaults = {
  ...Object.fromEntries(keys.map((key) => [key, ""])),
  GRAPH_API: "https://graph.microsoft.com/v1.0/",
  SHAREPOINT_URL: "https://graph.microsoft.com/v1.0/sites/root?select=id,drive",
};
const settings = { ...defaults };
let globalSettings = { ...defaults };

const normalizedConfig = (response) => {
  const data = response?.data?.data || response?.data || {};
  return Object.fromEntries(
    keys.filter((key) => data[key] !== undefined && data[key] !== null)
      .map((key) => [key, data[key]])
  );
};

export const getRuntimeConfig = (key) => settings[key] || "";
export const getGlobalConfig = () => ({ ...globalSettings });
export const getRuntimeSettings = () => ({ ...settings });

export const applyRuntimeConfig = (config = {}) => {
  Object.assign(settings, config);
  if (typeof document !== "undefined" && settings.BASE_COLOR) {
    document.documentElement.style.setProperty(
      "--q-primary",
      settings.BASE_COLOR
    );
  }
  return getRuntimeSettings();
};

export const loadGlobalConfig = async () => {
  try {
    const response = await axios.get(`${process.env.API}portal/frontend-config`, {
      timeout: 8000,
    });
    globalSettings = { ...defaults, ...normalizedConfig(response) };
  } catch (error) {
    globalSettings = { ...defaults };
  }
  return applyRuntimeConfig(globalSettings);
};

export const loadDomainConfig = async (domainId) => {
  applyRuntimeConfig(globalSettings);
  if (!domainId) return getRuntimeSettings();
  try {
    const response = await axios.get(
      `${process.env.API}domain/${domainId}/frontend-config`,
      { timeout: 8000 }
    );
    return applyRuntimeConfig({
      ...globalSettings,
      ...normalizedConfig(response),
    });
  } catch (error) {
    return getRuntimeSettings();
  }
};
