<template>
  <q-card class="my-card center">
    <q-card-section class="bg-purple q-pa-md text-white">
      <div class="text-h6">Login to your account</div>
      <div class="text-subtitle2">
        Don't have an account?
        <q-btn
          flat
          color="cyan"
          label="Sign Up here"
          no-caps
          @click="$emit('getrouted', 'register')"
        />
        <br />
        Or login guest here
        <q-btn
          flat
          color="cyan"
          label="Login here"
          no-caps
          @click="onSubmit('guest')"
        />
      </div>
    </q-card-section>

    <q-separator dark />

    <q-card-section>
      <q-form @submit="onSubmit('notgus')" @reset="onReset" class="q-gutter-md">
        <q-input
          filled
          v-model="username"
          label="Username"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-input
          filled
          type="password"
          v-model="password"
          label="Password"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-toggle v-model="remember" label="Remember Me?" />

        <q-btn
          flat
          color="blue"
          label="Forget your password?"
          no-caps
          @click="$emit('getrouted', 'forgot')"
        />

        <div>
          <q-btn label="Submit" type="submit" color="primary" />
          <q-btn
            label="Reset"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
/* eslint-disable */
import { HelpersComponent } from "../../components/HelpersComponent";
import { defineComponent, ref } from "vue";

import { useAuthStore } from "stores/authStore";

export default defineComponent({
  name: "login",
  mixins: [HelpersComponent],
  setup() {
    const store = useAuthStore();

    return {
      remember: ref(false),
      username: ref(""),
      password: ref(""),
      store,
    };
  },
  created() {
    // console.log(JSON.stringify(this.authDetail));
    if (this.authDetail.length > 0) {
      this.$router.push("/");
    } else if (!this.$q.localStorage.has("LoggedOut")) {
      this.onSubmit("guest");
    }
  },
  computed: {
    authDetail() {
      return this.store.getDetail;
    },
  },
  methods: {
    async onSubmit(user) {
      let opt = {
        methods: "post",
        url: "api/login",
      };

      if (user === "guest") {
        var data = {
          username: "gueststxsmt",
          password: "guest",
        };
      } else {
        var data = {
          username: this.username,
          password: this.password,
        };
      }

      let hasil = await this.postData(opt, data, false, true);
      let date = new Date();

      var time =
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      if (hasil) {
        let remember = { rememberme: this.remember };
        let login_time = { login_time: time };
        let grup = { ...remember, ...login_time, ...hasil.data };

        this.store.storeAuthDet(grup);
        this.store.toggleLoggedIn();
        this.store.logMessage(hasil.message);

        this.$router.push("/");
      }
      this.onReset();
    },
    onReset() {},
  },
});
</script>
