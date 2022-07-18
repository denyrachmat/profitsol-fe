<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-dialog ref="dialogRef" full-width full-height>
    <div style="position: relative">
      <mapViewDisp v-on:onSelect="onSelectMaps" />

      <div
        style="position: absolute; z-index: 99; top: 10%"
        class="text-center full-width"
      >
        <p class="text-h5">
          <b>{{ title }}</b>
        </p>
      </div>

      <div
        style="position: absolute; z-index: 99; bottom: 20%"
        class="bg-white"
      >
        <div class="row q-pa-md full-height">
          <div class="col">
            <p><b>Selected Location</b></p>
            <q-list bordered separator>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="location_city" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ country }}</q-item-label>
                  <q-item-label caption>Country</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="location_city" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ state }}</q-item-label>
                  <q-item-label caption>State</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="location_city" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ city }}</q-item-label>
                  <q-item-label caption>City</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="location_city" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ distric }}</q-item-label>
                  <q-item-label caption>District</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="location_city" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ subDistrict }}</q-item-label>
                  <q-item-label caption>Sub - District</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>

      <div
        style="position: absolute; z-index: 99; bottom: 0; max-height: 200px"
        class="text-right full-width bg-white"
      >
        <div class="row q-pa-md full-height">
          <div class="col text-right full-height">
            <div style="bottom: 0 !important">
              <q-btn-group>
                <q-btn label="OK" color="primary" @click="onOKClick()" />
                <q-btn label="Cancel" color="red" v-close-popup />
              </q-btn-group>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useDialogPluginComponent } from "quasar";
import mapViewDisp from "./mapViewDisp.vue";

const country = ref("");
const state = ref("");
const city = ref("");
const distric = ref("");
const subDistrict = ref("");
const latLng = ref("");

defineProps({
  title: String,
});

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK({
    country,
    state,
    city,
    distric,
    subDistrict,
    latLng,
  });
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}

const onSelectMaps = (val) => {
  console.log(val);
  country.value = val.country;
  state.value = val.region;
  city.value = val.place;
  distric.value = val.locality;
  subDistrict.value = val.neighborhood;
  latLng.value = val.latLng;
};
</script>
