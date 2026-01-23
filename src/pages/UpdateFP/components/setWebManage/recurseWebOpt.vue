<template>
  <template v-for="(item, index) in rowNavData" :key="index">
    <div class="row q-gutter-md" v-if="item.config == 'row'">
      <div class="col">
        <span class="text-h6 text-italic">{{ item.label }}</span>
      </div>
    </div>
    <div class="row q-gutter-md q-pt-md" v-if="item.config == 'row'">
      <recurseWebOpt
        :rowNavData="item.children"
        v-if="item.children && item.children.length > 0"
      />
    </div>

    <div
      class="col relative-position"
      v-if="item.config == 'btnconf' || item.config == 'btnedit'"
    >
      <q-btn
        :color="item.color"
        :label="item.label"
        @click="onClickBtn(item)"
        class="full-width"
      />
    </div>

    <div class="col relative-position" v-if="item.config == 'toggle'">
      <q-toggle
        v-model="item.url"
        :label="item.label"
        color="primary"
        class="full-width"
        true-value="1"
        false-value="0"
      />
    </div>

    <div class="col relative-position" v-if="item.config == 'input'">
      <q-input
        v-model="item.url"
        :label="item.label"
        dense
        outlined
        class="full-width absolute-bottom"
      />
    </div>

    <div class="col relative-position" v-if="item.config == 'colorChooser'">
      <q-input
        v-model="item.url"
        :label="item.label"
        dense
        outlined
        readonly
        class="absolute-bottom"
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

    <div class="col text-center" v-if="item.config == 'imageChooser'">
      <div class="row">
        <div class="col">
          <q-avatar rounded size="15vh" color="orange">
            <img :src="item.url" v-if="item.url" />
            <q-icon name="supervised_user_circle" size="10vh" />
          </q-avatar>
        </div>
      </div>
      <div class="row q-pt-sm">
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
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import recurseWebOpt from "./recurseWebOpt.vue";

const $q = useQuasar();
const props = defineProps({
  rowNavData: Array,
});

onMounted(() => {
  console.log("recurseWebOpt mounted with data:", props.rowNavData);
});

const rowNavData = ref(props.rowNavData || []);

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
