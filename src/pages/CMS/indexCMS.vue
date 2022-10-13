<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-input label="Content Title" dense outlined />
      </div>
      <div class="col-2 q-pl-md">
        <q-btn-group spread>
          <q-btn color="green" icon="save" />
          <q-btn color="accent" icon="folder_open" />
          <q-btn color="red" icon="delete" />
        </q-btn-group>
      </div>
    </div>

    <div class="row q-pt-md" style="height: 80vh">
      <div class="col">
        <tinyEditorVue />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";

import tinyEditorVue from "src/components/editors/tinyEditor.vue";
</script>
