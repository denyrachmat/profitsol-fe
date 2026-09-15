<template>
  <div>
    <q-input v-model="title" label="Title" dense outlined class="q-mb-sm" />
    <q-select v-model="source" :options="sourceOptions" label="Source" dense outlined emit-value map-options class="q-mb-sm" />
    <q-input v-if="source === 'site'" v-model="siteName" label="Site Name" dense outlined class="q-mb-sm" hint="e.g. 'my-site' from stxgmail.sharepoint.com/sites/my-site" />
    <q-input v-if="source !== 'sites'" v-model="folderPath" label="Folder Path (optional)" dense outlined class="q-mb-sm" hint="e.g. Documents/Reports" />
    <q-select v-model="layout" :options="layoutOptions" label="Layout" dense outlined emit-value map-options class="q-mb-sm" />
    <template v-if="source === 'sites'">
      <q-toggle v-model="filterSites" label="Filter sites" dense class="q-mb-sm" />
      <q-input
        v-if="filterSites"
        v-model="sitePatterns"
        label="Site Patterns"
        dense
        outlined
        class="q-mb-sm"
        hint="Comma-separated patterns. Use * as wildcard. e.g. project-*, team-*"
      />
    </template>
  </div>
</template>
<script setup>
import { toRef } from "vue";
import { layoutOptions } from "../options.js";
import { useBlockField } from "../useBlockField.js";

const props = defineProps({ block: { type: Object, required: true } });
const blockRef = toRef(props, "block");

const title = useBlockField(blockRef, "title");
const source = useBlockField(blockRef, "source");
const siteName = useBlockField(blockRef, "siteName");
const folderPath = useBlockField(blockRef, "folderPath");
const layout = useBlockField(blockRef, "layout");
const filterSites = useBlockField(blockRef, "filterSites");
const sitePatterns = useBlockField(blockRef, "sitePatterns");

const sourceOptions = [
  { label: "My OneDrive", value: "onedrive" },
  { label: "Shared with Me", value: "shared" },
  { label: "Site Documents", value: "site" },
  { label: "Browse Sites", value: "sites" },
];
</script>
