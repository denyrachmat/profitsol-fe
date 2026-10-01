import { boot } from "quasar/wrappers";
import { loadGlobalConfig } from "src/runtimeConfig";

export default boot(async () => {
  await loadGlobalConfig();
});
