import { boot } from "quasar/wrappers";
import GoogleSignInPlugin from "vue3-google-signin";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  console.log("masuk sini loh");
  app.use(GoogleSignInPlugin, {
    clientId:
      "230143637925-eah2tueg85422reh4sgp7r8pohiomp6c.apps.googleusercontent.com",
  });
});
