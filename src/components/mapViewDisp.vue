<template><div id="map" style="height: 100%" /></template>

<script>
import { defineComponent, ref, onMounted, watchEffect, defineEmits } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import HelpersComponent from "./HelpersComponent";

import axios from "axios";

export default defineComponent({
  emits: ["onSelect"],
  setup(props, { emit }) {
    const center = ref([107.1162057, -6.3232389]);
    const map = ref(null);
    const access_token = ref(
      "pk.eyJ1IjoiZGVueTIyIiwiYSI6ImNqaHU2aDZ2MzA3MjEza3BpbDA5cWQyNDEifQ.SNmUHNN6YhvH5ATUQSTeJQ"
    );
    const markers = ref(null);

    // const emit = defineEmits(["onSelect"]);

    onMounted(() => {
      mapboxgl.accessToken = access_token.value;
      map.value = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: center.value,
        zoom: 11,
      });

      let geocoder = new MapboxGeocoder({
        accessToken: access_token.value,
        mapboxgl: mapboxgl,
        marker: false,
      });

      map.value.addControl(geocoder);

      geocoder.on("result", (e) => {
        manageMarkers(e.result.center);

        markers.value.on("dragend", (e) => {
          center.value = Object.values(e.target.getLngLat());
          manageMarkers(e.target.getLngLat());
        });
      });

      map.value.on("idle", function () {
        map.value.resize();
      });

      map.value.on("click", (val) => {
        manageMarkers(val.lngLat);

        markers.value.on("dragend", (e) => {
          center.value = Object.values(e.target.getLngLat());
          manageMarkers(e.target.getLngLat());
        });
      });
    });

    watchEffect(() => {
      console.log("berubah nih");
    }, [markers.value]);

    const manageMarkers = (marksLatLng) => {
      if (markers.value) {
        markers.value.remove();
      }

      map.value.flyTo({
        center: marksLatLng,
        zoom: 15,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });

      center.value = Object.values(marksLatLng);
      markers.value = new mapboxgl.Marker({
        draggable: true,
        color: "#D80739",
      })
        .setLngLat(center.value)
        .addTo(map.value);

      findPlace(marksLatLng);
    };

    const findPlace = async (coordinates) => {
      const url =
        "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        coordinates.lng +
        "," +
        coordinates.lat +
        ".json?access_token=" +
        access_token.value;

      const cekData = await axios.get(url);

      if (cekData) {
        emit("onSelect", {
          country: findPlaceInData(cekData.data, "country").text,
          region: findPlaceInData(cekData.data, "region").text,
          place: findPlaceInData(cekData.data, "place").text,
          locality: findPlaceInData(cekData.data, "locality").text,
          neighborhood: findPlaceInData(cekData.data, "neighborhood").text,
          latLng: center.value,
        });
      }
    };

    const findPlaceInData = (fullDataAddr, idnya) => {
      if (fullDataAddr.features) {
        const getData = fullDataAddr.features.filter((val) =>
          val.id.includes(idnya)
        );
        return getData[0];
      }
    };

    return {
      access_token,
      center,
      map,
    };
  },
});
</script>

<style>
#map {
  height: 100vh;
}
</style>
