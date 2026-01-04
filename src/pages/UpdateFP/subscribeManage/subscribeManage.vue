<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="bg-white text-black">
      <q-card-section class="q-pa-md">
        <div class="text-h6">Subscribe Manage</div>
        <div class="text-subtitle2">Update / Create new subscriber</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="formData.email"
            label="Email"
            type="email"
            outlined
            dense
            :rules="[(val) => !!val || 'Email is required']"
          />

          <q-select
            v-model="formData.status"
            label="Status"
            :options="statusOptions"
            outlined
            dense
            map-options
            emit-value
            :rules="[(val) => !!val || 'Status is required']"
          />

          <q-input
            v-model="formData.type"
            :options="typeOptions"
            map-options
            emit-value
            label="Type"
            outlined
            dense
            :rules="[(val) => !!val || 'Type is required']"
          />

          <q-input
            v-model="formData.val"
            label="Value Type"
            outlined
            dense
            :rules="[(val) => !!val || 'Value Type is required']"
          />

          <div class="row justify-end q-mt-lg">
            <q-btn label="Cancel" color="grey-7" flat @click="onDialogCancel" />
            <q-btn label="Save" type="submit" color="primary" class="q-ml-sm" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useDialogPluginComponent } from "quasar";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const formData = ref({
  email: "",
  status: "",
  type: "",
  val: "",
});

const typeOptions = ref([
  { label: "Users", value: "users" },
  { label: "Organizations", value: "organizations" },
  { label: "Guests", value: "guests" },
]);

const statusOptions = ref([
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
]);

const onSubmit = () => {
  onDialogOK(formData.value);
};
</script>
