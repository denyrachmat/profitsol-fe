<template>
  <div ref="hostEl" :style="wrapperStyle"></div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useAuthStore } from "stores/authStore";
import { resolveVariables } from "./variables.js";

const props = defineProps({
  block: { type: Object, required: true },
  preview: Boolean,
  editMode: Boolean,
  selectedBlockId: String,
});

const authStore = useAuthStore();
const hostEl = ref(null);
let shadowRoot = null;

// A full HTML document (pasted standalone page) has document-level selectors
// like `html {}` / `body {}`. Injected via v-html those leak into the whole
// app (e.g. `body { padding }` adds gaps around every page). Some editors
// strip the <!doctype>/<html> wrapper but keep the <style>, so also isolate
// any fragment that still carries document-level selectors (:root/html/body).
const needsIsolation = (html) => {
  const s = html || "";
  if (/<!doctype\s+html|<html[\s>]/i.test(s)) return true;
  return /(^|[\s,>])(html|body|:root)\s*[,{]/i.test(s);
};

// Keep :root custom properties working by re-pointing them at :host.
// `html`/`body` rules are intentionally left unmatched inside the shadow
// root, so their page-level box model never affects the app. A small reset
// keeps the block flush (no host/first/last-child margins).
const FLUSH_RESET =
  "<style>:host{margin:0;padding:0}:host>*{margin-top:0}:host>*:last-child{margin-bottom:0}</style>";

const scopeDocumentCss = (html) =>
  html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (m, attrs, css) =>
    `<style${attrs}>${css.replace(/:root\b/g, ":host")}</style>`
  ) + FLUSH_RESET;

// Editors often leave empty <p></p> (or <p><br></p>) at the top/bottom of the
// content; their default margins create a vertical gap when the block should
// be flush. Strip only the leading/trailing empty ones.
const stripEdgeEmptyParagraphs = (s) =>
  (s || "")
    .replace(/^\s*(?:<p[^>]*>(?:\s|&nbsp;|\u00a0|<br\s*\/?>)*<\/p>\s*)+/i, "")
    .replace(/(?:\s*<p[^>]*>(?:\s|&nbsp;|\u00a0|<br\s*\/?>)*<\/p>)+\s*$/i, "");

const renderContent = () => {
  const el = hostEl.value;
  if (!el) return;
  const html = stripEdgeEmptyParagraphs(
    resolveVariables(props.block.content.body, authStore)
  );

  if (needsIsolation(html)) {
    if (!shadowRoot) shadowRoot = el.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = scopeDocumentCss(html);
  } else {
    el.innerHTML = html;
  }
};

onMounted(renderContent);
watch(
  () => props.block.content.body,
  () => renderContent()
);

const parseCustomCss = (css) => {
  const s = {};
  if (!css || typeof css !== "string") return s;
  css.split(";").forEach((decl) => {
    const idx = decl.indexOf(":");
    if (idx === -1) return;
    const prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) return;
    s[prop.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = val;
  });
  return s;
};

const wrapperStyle = computed(() => {
  const c = props.block.content || {};
  const s = {};
  if (c.padding) s.padding = c.padding;
  return { ...s, ...parseCustomCss(c.customCss) };
});
</script>
