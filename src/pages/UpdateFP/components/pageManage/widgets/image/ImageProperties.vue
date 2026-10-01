<template>
  <div>
    <!-- Upload + preview -->
    <div class="text-caption text-grey-7 q-mb-xs">Image</div>
    <div class="row q-col-gutter-sm items-center q-mb-sm">
      <div class="col-auto">
        <q-avatar rounded size="64px" color="grey-3">
          <img v-if="src" :src="src" />
          <q-icon v-else name="image" size="28px" color="grey-6" />
        </q-avatar>
      </div>
      <div class="col">
        <q-file
          v-model="fileModel"
          label="Upload image"
          accept="image/*"
          dense
          outlined
          clearable
          @update:model-value="onFile"
        >
          <template v-slot:prepend>
            <q-icon name="cloud_upload" />
          </template>
        </q-file>
        <div class="text-caption text-grey-6 q-mt-xs">
          Uploaded image is embedded (base64) in the page content.
        </div>
      </div>
    </div>

    <q-input
      v-model="src"
      label="Image URL (or upload above)"
      dense
      outlined
      class="q-mb-sm"
    >
      <template v-slot:append v-if="src">
        <q-btn flat dense round icon="clear" size="sm" @click="clearImage">
          <q-tooltip>Clear image</q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <q-input v-model="alt" label="Alt Text" dense outlined class="q-mb-sm" />
    <q-input v-model="caption" label="Caption" dense outlined class="q-mb-sm" />
    <q-select
      v-model="fit"
      :options="[
        { label: 'Contain (fit inside)', value: 'contain' },
        { label: 'Cover (crop to fill)', value: 'cover' },
        { label: 'Fill (stretch)', value: 'fill' },
      ]"
      label="Object Fit"
      dense
      outlined
      emit-value
      map-options
      class="q-mb-sm"
    />
    <q-toggle
      v-model="fillHeight"
      label="Fill parent height (background mode)"
      dense
      class="q-mb-sm"
    >
      <q-tooltip>
        Makes the image fill its parent box (used when the image is pinned as a
        container background). Width/height overrides are ignored in this mode.
      </q-tooltip>
    </q-toggle>
    <template v-if="!fillHeight">
      <q-select
        v-model="width"
        :options="imgWidthOptions"
        label="Image Width"
        dense
        outlined
        emit-value
        map-options
        class="q-mb-sm"
      />
      <q-input
        v-model.number="height"
        label="Max Height (px)"
        type="number"
        dense
        outlined
        class="q-mb-sm"
      />
    </template>
  </div>
</template>
<script setup>
import { computed, ref, toRef } from "vue";
import { useQuasar } from "quasar";
import { imgWidthOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";

const props = defineProps({ block: { type: Object, required: true } });
const $q = useQuasar();

const blockRef = toRef(props, "block");
const src = useBlockField(blockRef, "src");
const alt = useBlockField(blockRef, "alt");
const caption = useBlockField(blockRef, "caption");
const width = useBlockField(blockRef, "width");
const height = useBlockField(blockRef, "height");

// Defaulted so images saved before these fields show sensible values.
const fit = computed({
  get: () => blockRef.value?.content?.fit || "contain",
  set: (v) => {
    if (blockRef.value?.content) blockRef.value.content.fit = v;
  },
});
const fillHeight = computed({
  get: () => !!blockRef.value?.content?.fillHeight,
  set: (v) => {
    if (blockRef.value?.content) blockRef.value.content.fillHeight = !!v;
  },
});

const fileModel = ref(null);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

const onFile = (files) => {
  const file = Array.isArray(files) ? files[0] : files;
  if (!file || !(file instanceof File)) return;

  if (!file.type.startsWith("image/")) {
    $q.notify({ type: "negative", message: "Please choose an image file" });
    fileModel.value = null;
    return;
  }

  if (file.size > MAX_BYTES) {
    $q.notify({
      type: "warning",
      message: `Image is ${(file.size / 1024 / 1024).toFixed(
        1
      )}MB. Large images are embedded as base64 and may slow the page.`,
      timeout: 6000,
    });
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    src.value = e.target.result;
    fileModel.value = null;
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  src.value = "";
  fileModel.value = null;
};
</script>
