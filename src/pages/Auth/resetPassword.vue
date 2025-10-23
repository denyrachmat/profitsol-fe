<template>
  <q-card class="my-card center">
    <q-card-section class="bg-purple q-pa-md text-white">
      <div class="text-h6">
        <q-btn
          flat
          color="white"
          icon="chevron_left"
          round
          @click="$emit('getrouted', 'login')"
        />
        Reset your password
      </div>
    </q-card-section>

    <q-separator dark />

    <q-card-section>
      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
          filled
          v-model="email"
          label="Username / Email"
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
        <q-input
          filled
          type="password"
          v-model="password_confirmation"
          label="Password Confirmation"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
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

export default {
  name: "resetPassword",
  mixins: [HelpersComponent],
  data() {
    return {
      token: this.$route.params.token,
      email: "",
      password: "",
      password_confirmation: "",
    };
  },
  methods: {
    async onSubmit() {
      let opt = {
        methods: "post",
        url: `reset-password/${this.token}`,
      };

      let hasil = await this.postData(
        opt,
        {
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
        },
        false,
        true,
        false
      );
      if (hasil) {
        this.$q.notify({
          color: hasil.status ? "success" : "red",
          message: hasil.message,
        });

        this.$router.push("/login");
      }
    },
    onReset() {},
  },
};
</script>
