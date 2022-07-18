<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-12 col-sm-3">
        <q-card class="my-card">
          <q-img src="https://cdn.quasar.dev/img/chicken-salad.jpg">
            <div class="text-center full-width full-height">
              <q-avatar
                size="150px"
                style="margin: 0 auto; top: 20%"
                v-if="store.getDetail.user_det.pud_photo"
              >
                <img
                  :src="store.getDetail.user_det.pud_photo"
                  style="object-fit: cover"
                />
              </q-avatar>
              <q-avatar
                v-else
                size="150px"
                style="margin: 0 auto; top: 20%"
                color="teal"
                text-color="white"
                icon="account_circle"
                font-size="150px"
              />
            </div>
          </q-img>

          <q-card-section>
            <q-btn
              fab
              color="primary"
              icon="place"
              class="absolute"
              style="top: 0; right: 12px; transform: translateY(-50%)"
            />

            <div class="row no-wrap items-center">
              <div class="col text-h6 ellipsis">
                {{ store.getDetail.user_det.pud_first_name }}
                {{ store.getDetail.user_det.pud_last_name }}
              </div>
              <div
                class="
                  col-auto
                  text-grey text-caption
                  q-pt-md
                  row
                  no-wrap
                  items-center
                "
              >
                <q-icon name="place" />
                250 ft
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-subtitle1">IT Departement</div>
            <div class="text-caption text-grey">MIS Staff</div>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-btn flat round icon="event" />
            <q-btn flat color="primary" to="/profiles"> Edit Profile </q-btn>
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-9 q-pa-md bg-grey-2">
        <div class="row">
          <div class="col text-center">
            <strong class="text-h4">Application List</strong>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <!-- <q-card class="my-card" style="max-width: 25%">
              <q-card-section class="bg-purple text-white">
                <div class="text-h6">Our Changing Planet</div>
                <div class="text-subtitle2">by John Doe</div>
              </q-card-section>

              <q-card-actions align="around">
                <q-btn flat>Action 1</q-btn>
                <q-btn flat>Action 2</q-btn>
              </q-card-actions>
            </q-card> -->

            <MglMap :accessToken="accessToken" :mapStyle="mapStyle" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { defineComponent } from "vue";
import { MglMap } from "vue-mapbox";
import { useAuthStore } from "stores/authStore";

export default defineComponent({
  name: "Dashboard",
  components: { MglMap },
  setup() {
    const store = useAuthStore();
    return {
      accessToken:
        "pk.eyJ1IjoiZGVueTIyIiwiYSI6ImNqaHU2aDZ2MzA3MjEza3BpbDA5cWQyNDEifQ.SNmUHNN6YhvH5ATUQSTeJQ", // your access token. Needed if you using Mapbox maps
      mapStyle: "mapbox://styles/mapbox/dark-v10", // your map style
      store,
    };
  },
});
</script>
<!-- <style scoped src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css">
</style> -->
