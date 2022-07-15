import { boot } from "quasar/wrappers";
import Emitter from "tiny-emitter";
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  // something to do
  app.config.globalProperties.$msalInstance = {};
  app.config.globalProperties.$emitter = new Emitter();
});
