import { boot } from "quasar/wrappers";
import GoogleSignInPlugin from "vue3-google-signin";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.use(GoogleSignInPlugin, {
    clientId: "AIzaSyDf3aRZtSe9tIo77ZdL1nxzxFymAOHAzcQ",
  });
});
