<template>
  <q-card class="my-card center" style="height: 75vh">
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
        <q-form @submit="onSubmit" @reset="onReset" class="q-pa-md">
          <q-input
            filled
            v-model="username"
            label="Username"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />

          <q-input
            filled
            v-model="fname"
            label="First Name"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />

          <q-input
            filled
            v-model="lname"
            label="Last Name"
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />

          <q-input
            filled
            type="email"
            v-model="email"
            label="Email"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />

          <q-input
            filled
            type="password"
            v-model="password"
            label="Password"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />

          <q-input
            filled
            type="password"
            v-model="c_password"
            label="Confirm Password"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />

          <div class="row">
            <div class="col">
              <q-btn
                label="Submit"
                type="submit"
                color="primary"
                class="full-width"
              />
            </div>
            <!-- <q-btn
              label="Reset"
              type="reset"
              color="primary"
              flat
              class="q-ml-sm"
            /> -->
          </div>
          <div class="q-py-md text-center">OR</div>
          <div class="row">
            <div class="col text-center">
              <q-btn
                icon="ion-logo-windows"
                label=" Sign Up with Microsoft"
                @click="SignInMs"
                class="full-width"
                color="blue-5"
                outline
              ></q-btn>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<script>
/* eslint-disable */
import { HelpersComponent } from "../../components/HelpersComponent";
import { PublicClientApplication } from "@azure/msal-browser";

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
      email: "",
    };
  },
  created() {
    this.$msalInstance = new PublicClientApplication({
      auth: {
        clientId: process.env.MS_CLIENTID,
        authority: process.env.MS_AUTHORITY,
      },
      cache: {
        cacheLocation: "localStorage",
      },
    });
  },
  methods: {
    async onSubmit() {
      console.log("masuk sini");
      let opt = {
        methods: "post",
        url: "register",
      };

      let data = {
        username: this.username,
        pud_first_name: this.fname,
        pud_last_name: this.lname,
        password: this.password,
        password_confirmation: this.c_password,
        email: this.email,
      };

      let hasil = await this.postData(opt, data);
      if (hasil) {
        console.log(hasil);
        this.onReset();

        this.$emit("getrouted", "login");
      } else {
        console.log(hasil);
      }
    },
    onReset() {
      this.username = "";
      this.fname = "";
      this.lname = "";
      this.password = "";
      this.email = "";
      this.c_password = "";
    },
    async SignInMs() {
      await this.$msalInstance
        .loginPopup({})
        .then(() => {
          const myAccounts = this.$msalInstance.getAllAccounts();
          const msAcct = myAccounts[0];

          console.log(msAcct.idTokenClaims.rh);
          this.username = msAcct.username;
          this.fname = msAcct.name.split(" ")[0];
          this.lname = msAcct.name.split(" ")[1];
          this.password = msAcct.idTokenClaims.rh;
          this.c_password = msAcct.idTokenClaims.rh;
          this.email = msAcct.username;

          this.onSubmit();
        })
        .catch((error) => {
          console.error(`error during authentication: ${error}`);
        });
    },
  },
};
</script>
