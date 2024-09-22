<template>
  <q-layout view="hHh lpR fFf">
    <div class="row">
      <div class="col-xs-12 col-md-4 leftbcg">
        <q-page-container>
          <q-page id="troublemaker">
            <div class="center q-pa-sm text-center">
              <q-img src="~assets/sumitronics_OGP.png" />
              <div class="text-h4">Application Portal</div>
              <div class="text-h6">v2.0.1</div>
            </div>
          </q-page>
        </q-page-container>
      </div>
      <div class="col-xs-12 col-md-8">
        <q-page-container>
          <q-page style="background-color: #31ccec">
            <transition
              appear
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
            >
              <component :is="choosedcomp" v-on:getrouted="routedto" />
            </transition>
          </q-page>
        </q-page-container>
      </div>
    </div>
  </q-layout>
</template>

<script>
/* eslint-disable */
import login from "./login";
import register from "./register";
import forgot from "./forgotpassword";
import reset from "./resetPassword";
import { HelpersComponent } from "../../components/HelpersComponent";

export default {
  name: "Auth",
  mixins: [HelpersComponent],
  components: { login, register, forgot, reset },
  data() {
    return {
      choosedcomp: "login",
    };
  },
  mounted() {
    if (this.$route.name) {
      this.choosedcomp = this.$route.name;
    }
  },
  methods: {
    routedto(val) {
      this.choosedcomp = val;
    },
  },
  watch: {
    $route(to, from) {
      this.choosedcomp = to.name;
      console.log(to);
    },
  },
};
</script>

<style scoped>
.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%); /* for IE 9 */
  -webkit-transform: translate(-50%, -50%); /* for Safari */
  min-width: 200px;
  max-width: 500px;
  width: 100%;
  /* optional size in px or %: */
  /* width: 100px; */
  /* height: 100px; */
}
</style>
