import { computed } from "vue";

export function useBlockField(blockRef, field) {
  return computed({
    get: () => blockRef.value?.content?.[field],
    set: (val) => {
      if (blockRef.value?.content) blockRef.value.content[field] = val;
    },
  });
}
