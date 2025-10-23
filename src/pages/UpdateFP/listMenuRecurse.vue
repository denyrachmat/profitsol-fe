<template>
  <q-list class="rounded-borders">
    <template v-if="!listMenu || listMenu.length === 0">
      <q-item>
        <q-item-section>No menu items available</q-item-section>
      </q-item>
    </template>
    <template v-else>
      <template v-for="item in listMenu" :key="item.value">
        <template v-if="item.children && item.children.length > 0">
          <q-expansion-item
            :label="item.label"
            :icon="item.icon"
            :content-inset-level="0.5"
            @click="onClickMenu(item)"
            :class="
              formStore.getCMSPageChoosed.value === item.value
                ? 'bg-grey-4 text-black'
                : ''
            "
          >
            <listMenuRecurse :listMenu="item.children" />
          </q-expansion-item>
          <!-- <q-item-section>{{ item.value }}</q-item-section> -->
        </template>
        <template v-else>
          <q-item
            clickable
            @click="onClickMenu(item)"
            :active="formStore.getCMSPageChoosed.value === item.value"
            active-class="bg-grey-6 text-white"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
            <!-- <q-item-section>{{ item.value }}</q-item-section> -->
          </q-item>
        </template>
      </template>
    </template>
  </q-list>
</template>
<script setup>
import { ref } from "vue";
import listMenuRecurse from "./listMenuRecurse.vue";
import { useFormStore } from "src/stores/formStore";

const props = defineProps({
  listMenu: {
    type: Array,
    required: true,
  },
});

const formStore = useFormStore();

const onClickMenu = (item) => {
  // Handle menu item click
  console.log("Menu item clicked:", item);
  formStore.setCMSPageChoosed(item);
};
const listMenu = ref(props.listMenu || []);
</script>
