import { boot } from "quasar/wrappers";
import Emitter from "tiny-emitter";
import { getMsalInstance } from "src/components/msHelpers/msalFactory";

export default boot(async ({ app }) => {
  Object.defineProperty(app.config.globalProperties, "$msalInstance", {
    configurable: true,
    get: getMsalInstance,
  });
  app.config.globalProperties.$emitter = new Emitter();

  try {
    const response = await getMsalInstance().handleRedirectPromise();
    if (response) {
      getMsalInstance().setActiveAccount(response.account);
    }
  } catch (error) {
    console.error("Error handling redirect promise:", error);
  }
});
