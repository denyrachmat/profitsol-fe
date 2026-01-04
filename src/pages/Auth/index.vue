<template>
  <q-layout view="hHh lpR fFf">
    <div class="row">
      <div class="col-xs-12 col-md-4 leftbcg">
        <q-page-container>
          <q-page id="troublemaker">
            <div class="center q-pa-sm text-center">
              <q-img :src="domain.pd_img" v-if="domain.pd_img" />
              <q-img :src="'~assets/logo-new.png'" v-else />
              <div class="text-h4">Application Portal</div>
              <div class="text-h6">v2.0.1</div>
              <div class="q-pt-md">
                <q-select
                  filled
                  v-model="domain"
                  use-input
                  input-debounce="0"
                  label="Choose Domain"
                  :options="options"
                  @filter="filterFn"
                  option-label="pd_desc"
                  @update:model-value="onSelectStore"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
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
              <div>
                <component :is="choosedcomp" v-on:getrouted="routedto" />
              </div>
            </transition>
          </q-page>
        </q-page-container>

        <div ref="autoscrollContainer"></div>
      </div>
    </div>
  </q-layout>
</template>

<script>
/* eslint-disable */
import login from "./login.vue";
import register from "./register.vue";
import forgot from "./forgotpassword.vue";
import reset from "./resetPassword.vue";
import { HelpersComponent } from "../../components/HelpersComponent";
import { useAuthStore } from "stores/authStore";
import { useQuasar } from "quasar";

export default {
  name: "Auth",
  mixins: [HelpersComponent],
  components: { login, register, forgot, reset },
  data() {
    return {
      choosedcomp: "login",
      options: [],
      domain: "",
      store: useAuthStore(),
      $q: useQuasar(),
    };
  },
  mounted() {
    if (this.$route.name) {
      this.choosedcomp = this.$route.name;
    }

    console.log(this.store.getChoosedDomain);
    this.getListDomain();
  },
  created() {
    this.$nextTick(() => {
      const container = this.$refs.autoscrollContainer;
      if (container && container.scrollIntoView) {
        container.scrollIntoView({ behavior: "smooth" });
      }
    });
  },
  methods: {
    routedto(val) {
      this.choosedcomp = val;
    },
    async getListDomain() {
      let hasil = await this.postData({
        methods: "get",
        url: "domain",
      });

      if (hasil) {
        this.options = [];
        hasil.data.map((val) => {
          this.options.push(val);
        });

        this.domain = this.options[0];
        this.onSelectStore(this.domain);
      }
    },
    onSelectStore(val) {
      console.log("change domain");
      this.store.storeDomain(val);

      if (val.pd_is_cms == 1 && val.urlCMS) {
        this.$q
          .dialog({
            title: "Confirm",
            message: `We found the domain ${val.pd_desc} has Intranet Features. Do you want to go there instead ?`,
            cancel: true,
            persistent: true,
          })
          .onOk(async () => {
            window.location.href = val.urlCMS;
          });
      }
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
