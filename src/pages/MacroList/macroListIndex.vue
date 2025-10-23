<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-breadcrumbs>
          <q-breadcrumbs-el
            label="Home"
            icon="home"
            @click="
              paths = [];
              getData();
            "
            to="/"
          />
          <q-breadcrumbs-el
            :label="path.split('/')[path.split('/').length - 1]"
            icon="folder"
            v-for="(path, idxP) in paths"
            :key="idxP"
            @click="backAction(path, idxP)"
            to="/"
          />
        </q-breadcrumbs>
      </div>
      <div class="col-4 text-right">
        <q-btn-group>
          <q-btn
            label="Send to Group"
            color="secondary"
            icon="groups"
            :disable="selected.length === 0"
            @click="sendToPortal"
          />
          <q-btn
            :label="
              selected.length === lists.length ? 'Uncheck All' : 'Check All'
            "
            color="indigo"
            :icon="
              selected.length === lists.length
                ? 'check_box_outline_blank'
                : 'check_box'
            "
            @click="checkAll"
            :disable="
              lists.filter((fil) => fil.icon !== 'folder' && !fil.AppRole)
                .length === 0
            "
          />
        </q-btn-group>
      </div>
    </div>
    <div class="row q-pt-md">
      <div class="col"></div>
    </div>
    <q-list bordered separator style="height: 80vh; overflow: auto">
      <template v-if="lists.length > 0">
        <q-item
          clickable
          v-ripple
          v-for="(list, idx) in lists"
          :key="idx"
          @click="list.icon === 'folder' ? onClickFolders(list.path) : '#'"
          :tag="!list.AppRole ? 'label' : ''"
        >
          <q-item-section side top v-if="list.icon !== 'folder'">
            <q-checkbox
              v-model="selected"
              :val="list.path"
              v-if="!list.AppRole"
            />
            <q-icon name="done_all" color="green" v-else>
              <q-tooltip>This macro already sent to STX-I Web System</q-tooltip>
            </q-icon>
          </q-item-section>
          <q-item-section avatar>
            <q-icon :name="list.icon" />
          </q-item-section>
          <q-item-section>{{ list.filename }}</q-item-section>
          <q-item-section side>
            <q-btn
              icon="download"
              flat
              color="green"
              v-if="list.icon !== 'folder'"
              @click="downloadMacro(list.path, list.filename)"
            />
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </div>
</template>
<script setup>
import { ref, defineProps, computed, onMounted } from "vue";
import { date, useQuasar } from "quasar";
import apiRequest from "src/components/apiRequest";

import sendToPortalGroup from "./sendToPortalGroup.vue";

const $q = useQuasar();
const { postData } = apiRequest();

const lists = ref([]);
const loading = ref(false);
const paths = ref([]);
const selected = ref([]);

onMounted(() => {
  getData();
});

const getData = async (subFold = "") => {
  loading.value = true;
  const data = await postData(
    "get",
    null,
    subFold ? `macro/list/${btoa(subFold)}` : "macro/list",
    false,
    false,
    true
  );

  if (data) {
    selected.value = [];
    setTimeout(() => {
      console.log(data);
    }, 1000);
    loading.value = false;
    lists.value = data.data;
  }
};

const onClickFolders = (folder) => {
  paths.value.push(folder);
  getData(folder);
};

const backAction = (path, idx) => {
  paths.value.splice((paths.value.length - (idx + 1)) * -1);
  console.log(paths.value);
  getData(path);
};

const downloadMacro = async (path, name) => {
  $q.dialog({
    title: "Download Macro",
    message: "Are you sure want to download this macro ?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const datas = await postData(
      "get",
      null,
      `macro/download/${btoa(path)}`,
      true,
      false,
      true
    );

    if (datas) {
      // console.log(datas);
      const link = document.createElement("a");
      link.download = name;
      // const data = await fetch(datas).then((res) => res.blob());
      link.href = window.URL.createObjectURL(
        new Blob([datas.data], { type: "application/vnd.ms-excel" })
      );
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
      // console.log(datas);
    }
  });
};

const checkAll = () => {
  // console.log(lists.value);
  if (selected.value.length === lists.value.length) {
    selected.value = [];
  } else {
    selected.value = [];
    lists.value.map((val) => {
      selected.value.push(val.path);
    });
  }
};

const sendToPortal = () => {
  $q.dialog({
    component: sendToPortalGroup,
    componentProps: {
      selected: selected.value,
    },
  }).onOk(async (val) => {
    console.log(val);
  });
};
</script>
