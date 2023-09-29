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
        Input your username / registered email
      </div>
    </q-card-section>

    <q-separator dark />

    <q-card-section>
      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
          filled
          v-model="username"
          label="Username / Email"
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
  name: "forgotPassword",
  mixins: [HelpersComponent],
  data() {
    return {
      username: "",
    };
  },
  methods: {
    async onSubmit() {
      let opt = {
        methods: "post",
        url: "forgot-password",
      };

      let hasil = await this.postData(
        opt,
        {
          email: this.username,
        },
        false,
        true,
        false
      );
      if (hasil && hasil.status) {
        console.log(hasil);
        this.$q.notify({
          color: "success",
          message: `Reset link has sent to your email !!`,
        });
      }
    },
    onReset() {},
  },
};
</script>
