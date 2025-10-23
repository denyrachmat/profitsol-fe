<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card
      class="q-dialog-plugin q-pt-md"
      style="width: 700px; max-width: 80vw"
    >
      <q-card-section class="q-pt-none">
        <div class="row q-pb-sm">
          <div class="col">
            <q-input
              outlined
              label="App Code"
              v-model="dataHasil.am_app_code"
              :disable="isUpdate"
            />
          </div>
        </div>
        <div class="row q-pb-sm">
          <div class="col">
            <q-input
              outlined
              label="App Name"
              v-model="dataHasil.am_app_name"
            />
          </div>
        </div>
        <div class="row q-pb-sm">
          <div class="col">
            <q-input outlined label="App URL" v-model="dataHasil.am_app_url" />
          </div>
        </div>
        <div class="row q-pb-sm">
          <div class="col">
            <q-input
              outlined
              label="App Icon Name"
              v-model="dataHasil.am_app_icon"
            >
              <template v-slot:before>
                <q-icon
                  :name="
                    dataHasil.am_app_icon
                      ? dataHasil.am_app_icon
                      : 'add_reaction'
                  "
                >
                  <q-tooltip>Icon Preview will be here</q-tooltip>
                </q-icon>
              </template>
              <template v-slot:after>
                <q-btn icon="open_in_new" flat @click="openLinkIcon">
                  <q-tooltip>Click to find all available icons</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>
        </div>
        <div class="row q-pb-sm">
          <div class="col">
            <q-input
              type="textarea"
              outlined
              label="App Desc"
              v-model="dataHasil.am_app_desc"
            />
          </div>
        </div>
        <div class="row q-pb-sm">
          <div class="col">
            <!-- <q-input
              outlined
              label="Parent"
              v-model="dataHasil.am_app_parent"
            /> -->

            <q-select
              filled
              v-model="dataHasil.am_app_parent"
              :options="listParent"
              label="Parent Apps"
              option-label="am_app_name"
              option-value="am_app_code"
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <q-checkbox
              v-model="isVerified"
              label="Is Drawer Menu ?"
              checked-icon="task_alt"
              unchecked-icon="highlight_off"
              :color="isVerified ? 'green' : 'red'"
              keep-color
            />
            <q-checkbox
              v-model="isFiles"
              label="Is Downloaded Files ?"
              checked-icon="task_alt"
              unchecked-icon="highlight_off"
              :color="isFiles ? 'green' : 'red'"
              keep-color
            />
            <q-checkbox
              v-model="isShared"
              label="Is Shared Trough Apps ?"
              checked-icon="task_alt"
              unchecked-icon="highlight_off"
              :color="isShared ? 'green' : 'red'"
              keep-color
            />
          </div>
        </div>
      </q-card-section>

      <!-- buttons example -->
      <q-separator />
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn flat color="red" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useDialogPluginComponent, date } from "quasar";

const props = defineProps({
  isUpdate: Boolean,
  dataProps: Object || null,
  list_parent: Array,
  // ...your custom props
});

const dataHasil = ref(null);
const listParent = ref(props.list_parent);
const isVerified = ref(false);
const isFiles = ref(false);
const isShared = ref(false);

watch(isVerified, (val) => {
  if (val) {
    dataHasil.value.am_is_drawer = val;
  }
});

watch(isFiles, (val) => {
  if (val) {
    dataHasil.value.am_is_files = val;
  }
});

watch(isShared, (val) => {
  if (val) {
    dataHasil.value.am_is_shared = val;
  }
});

onMounted(() => {
  dataHasil.value = props.dataProps;
  isVerified.value = props.dataProps.am_is_drawer == 1;
  isFiles.value = props.dataProps.am_is_files == 1;
  isShared.value = props.dataProps.am_is_shared == 1;
  // console.log(props.dataProps);
  // listParent.value = props.list_parent;
});

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

const openLinkIcon = () => {
  window.open("https://fonts.google.com/icons?icon.platform=android", "_blank");
};

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK(dataHasil);
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
