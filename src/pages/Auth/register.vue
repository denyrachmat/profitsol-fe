<template>
  <q-card class="my-card center" style="height: 80vh">
    <q-card-section class="bg-purple q-pa-md text-white">
      <div class="text-h6">
        <q-btn
          flat
          color="white"
          icon="chevron_left"
          round
          @click="$emit('getrouted', 'login')"
        />
        Register to Application Portal
      </div>
    </q-card-section>

    <q-separator dark />

    <q-card-section>
      <q-scroll-area style="height: 60vh">
        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <q-input
            filled
            v-model="username"
            label="Username"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Please type something']"
          />

          <q-input
            filled
            v-model="fname"
            label="First Name"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Please type something']"
          />

          <q-input filled v-model="lname" label="Last Name" />

          <q-input
            filled
            type="email"
            v-model="email"
            label="Email"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Please type something']"
          />

          <q-input
            filled
            type="password"
            v-model="password"
            label="Password"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Please type something']"
          />

          <q-input
            filled
            type="password"
            v-model="c_password"
            label="Confirm Password"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Please type something']"
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
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<script>
/* eslint-disable */
import { HelpersComponent } from "../../components/HelpersComponent";

export default {
  name: "register",
  mixins: [HelpersComponent],
  data() {
    return {
      username: "",
      fname: "",
      lname: "",
      password: "",
      c_password: "",
      email: ""
    };
  },
  methods: {
    async onSubmit() {
      let opt = {
        methods: "post",
        url: "api/register"
      };

      let data = {
        username: this.username,
        fname: this.fname,
        lname: this.lname,
        password: this.password,
        password_confirmation: this.c_password,
        email: this.email
      };

      let hasil = await this.postData(opt, data);
      if (hasil) {
        this.onReset();

        this.$emit("getrouted", "login");
      }
    },
    onReset() {
      this.username = "";
      this.fname = "";
      this.lname = "";
      this.password = "";
      this.email = "";
      this.c_password = "";
    }
  }
};
</script>
