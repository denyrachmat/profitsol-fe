<template>
  <div>
    <div class="row items-center q-mb-sm">
      <div class="text-caption text-grey-7">HTML Content</div>
      <q-space />
      <q-btn-dropdown dense flat no-icon-animation size="sm" color="primary" label="Insert Variable" menu-anchor="bottom left" menu-self="top left">
        <q-list dense>
          <template v-for="group in groupedVars" :key="group">
            <q-item-label header class="text-weight-bold text-grey-6" style="min-height: 24px; padding: 2px 16px">
              {{ group }}
            </q-item-label>
            <q-item
              v-for="v in varsByGroup(group)"
              :key="v.name"
              clickable v-close-popup
              @click="insertVar(v.name)"
            >
              <q-item-section>
                <q-item-label>{{ v.label }}</q-item-label>
                <q-item-label caption class="text-orange">{{ vToken(v.name) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
          </template>
        </q-list>
      </q-btn-dropdown>
    </div>
    <tinyEditorVue ref="editorRef" v-model="body" />
    <PaddingControl v-model="padding" label="Padding" className="q-mt-sm" />
    <q-input v-model="customCss" label="Custom CSS (e.g. border-radius: 16px;)" type="textarea" dense outlined autogrow placeholder="property: value;" class="q-mt-sm" />
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { toRef } from "vue";
import tinyEditorVue from "src/components/editors/tinyEditor.vue";
import { useBlockField } from "../useBlockField.js";
import PaddingControl from "../shared/PaddingControl.vue";
import variables, { varToken } from "./variables.js";

const props = defineProps({ block: { type: Object, required: true } });
const body = useBlockField(toRef(props, "block"), "body");
const padding = useBlockField(toRef(props, "block"), "padding");
const customCss = useBlockField(toRef(props, "block"), "customCss");

const editorRef = ref(null);

const groupedVars = computed(() => [...new Set(variables.map((v) => v.group))]);
const varsByGroup = (group) => variables.filter((v) => v.group === group);
const vToken = varToken;

const insertVar = (varName) => {
  if (editorRef.value?.insertContent) {
    editorRef.value.insertContent(varToken(varName));
  }
};
</script>
