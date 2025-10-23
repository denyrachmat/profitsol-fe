import { boot } from 'quasar/wrappers'
import Vue3Prism from 'vue3-prism/lib/Vue3Prism.common.js'
import "vue3-prism/lib/Vue3Prism.css"

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  // something to do
  app.use(Vue3Prism)
})
