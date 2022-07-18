<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-dialog ref="dialogRef">
    <div class="bg-white">
      <div class="row">
        <div class="col">
          <q-uploader
            style="max-width: 500px"
            :factory="factoryFn"
            label="Restricted to images"
            accept=".jpg, image/*"
            auto-upload
          />
        </div>
      </div>
      <div class="row q-pa-sm">
        <div class="col text-right">
          <q-btn-group spread>
            <q-btn color="red" label="Cancel" />
            <q-btn label="Ok" color="primary" />
          </q-btn-group>
        </div>
      </div>
    </div>
  </q-dialog>
</template>
<script>
import { defineComponent, ref } from "vue";
import { useDialogPluginComponent } from "quasar";

export default defineComponent({
  props: {
    // ...your custom props
  },

  emits: [
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
  ],

  setup() {
    // REQUIRED; must be called inside of setup()
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    // dialogRef      - Vue ref to be applied to QDialog
    // onDialogHide   - Function to be used as handler for @hide on QDialog
    // onDialogOK     - Function to call to settle dialog with "ok" outcome
    //                    example: onDialogOK() - no payload
    //                    example: onDialogOK({ /*.../* }) - with payload
    // onDialogCancel - Function to call to settle dialog with "cancel" outcome
    const result = ref("");

    const factoryFn = (val) => {
      console.log(val);
      console.log(convertBase64(val));

      result.value = convertBase64(val).result;

      return convertBase64(val).result;
      return new Promise((resolve) => {
        // simulating a delay of 2 seconds
        setTimeout(() => {
          resolve({
            url: "http://localhost:4444/upload",
            data: convertBase64(val).result,
          });
        }, 2000);
      });
    };

    const convertBase64 = (filenya, callback) => {
      const reader = new FileReader();
      let hasil = "";
      reader.readAsDataURL(filenya[0]);
      reader.onload = function () {
        return reader.result;
      };
      reader.onerror = function (error) {
        return `Error: ${error}`;
      };

      return reader;
    };

    return {
      // This is REQUIRED;
      // Need to inject these (from useDialogPluginComponent() call)
      // into the vue scope for the vue html template
      dialogRef,
      onDialogHide,
      result,

      // other methods that we used in our vue html template;
      // these are part of our example (so not required)
      onOKClick() {
        // on OK, it is REQUIRED to
        // call onDialogOK (with optional payload)
        onDialogOK();
        // or with payload: onDialogOK({ ... })
        // ...and it will also hide the dialog automatically
      },

      // we can passthrough onDialogCancel directly
      onCancelClick: onDialogCancel,
      factoryFn: factoryFn,
    };
  },
});
</script>
