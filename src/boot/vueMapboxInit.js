import { boot } from 'quasar/wrappers'
import VueMapbox from "vue-mapbox";
import Mapbox from "mapbox-gl";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({app}) => {
  app.use(VueMapbox, { mapboxgl: Mapbox })
})
