import { toRaw, ref, watch } from "vue";

export function useBlockField(blockRef, field) {
  const local = ref(blockRef.value?.content?.[field]);

  watch(
    () => blockRef.value?.content?.[field],
    (newVal) => {
      local.value = newVal;
    }
  );

  watch(local, (newVal) => {
    const raw = toRaw(blockRef.value);
    if (raw?.content) raw.content[field] = newVal;
  });

  return local;
}
