<template>
  <div class="row q-col-gutter-md">
    <template v-for="(item, index) in rowNavData" :key="item.id ?? index">
      <!-- Section header: full width, forces a line break -->
      <div class="col-12 q-pt-md" v-if="item.config === 'row'">
        <q-separator />
        <span class="text-h6 text-italic">{{ item.label }}</span>
      </div>

      <!-- Recursive children rendered in their own grid -->
      <div
        class="col-12"
        v-if="item.config === 'row' && item.children && item.children.length"
      >
        <recurse-web-opt :rowNavData="item.children" />
      </div>

      <!-- Controls: 1 col mobile, 2 tablet, 3 desktop -->
      <div
        class="col-12 col-sm-6 col-md-4"
        v-if="item.config === 'btnconf' || item.config === 'btnedit'"
      >
        <q-btn
          :color="item.color"
          :label="item.label"
          @click="onClickBtn(item)"
          class="full-width"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-4" v-if="item.config === 'toggle'">
        <q-toggle
          :model-value="item.url === 1 || item.url === '1' || item.url === true"
          @update:model-value="(v) => (item.url = v ? '1' : '0')"
          :label="item.label"
          color="primary"
          class="full-width"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-4" v-if="item.config === 'input'">
        <q-input
          v-model="item.url"
          :label="item.label"
          dense
          outlined
          class="full-width"
        />
      </div>

      <div
        class="col-12 col-sm-6 col-md-4"
        v-if="item.config === 'colorChooser'"
      >
        <q-input
          v-model="item.url"
          :label="item.label"
          dense
          outlined
          readonly
          class="full-width"
        >
          <template v-slot:append>
            <q-icon
              name="colorize"
              class="cursor-pointer"
              :style="`background-color: ${item.url}; border-radius: 50%; padding: 4px;`"
            >
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-color v-model="item.url" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-sm-6" v-if="item.config === 'imageChooser'">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-auto">
            <q-avatar rounded size="80px" color="orange">
              <img :src="item.url" v-if="item.url" />
              <q-icon v-else name="supervised_user_circle" size="40px" />
            </q-avatar>
          </div>
          <div class="col">
            <q-file
              color="grey-3"
              outlined
              accept="image/*"
              @update:model-value="(files) => onImageFileChange(item, files)"
              :label="item.label"
              dense
              v-model="item.url"
            >
              <template v-slot:append>
                <q-icon name="attachment" color="orange" />
              </template>
            </q-file>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { useQuasar } from "quasar";
import recurseWebOpt from "./recurseWebOpt.vue";

const $q = useQuasar();
const props = defineProps({
  rowNavData: Array,
});

const onImageFileChange = (item, files) => {
  const file = Array.isArray(files) ? files[0] : files;
  if (file && file instanceof File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      item.url = e.target.result; // base64 string
      console.log("Base64 image string:", item.url);
    };
    reader.readAsDataURL(file);
  }
};

const onClickBtn = (item) => {
  console.log("Button clicked:", item);
  if (item.keys === "editConf") {
    $q.dialog({
      component: formNavManage,
      componentProps: {
        idForm: props.rowNavData.id,
        navData: props.selectedNav,
      },
    })
      .onOk((data) => {
        console.log("Navigation added:", data);
      })
      .onDismiss(() => {});
  } else {
    $q.notify({
      type: "info",
      message: `Configuration for ${item.label} is not implemented yet.`,
    });
  }
};
</script>
