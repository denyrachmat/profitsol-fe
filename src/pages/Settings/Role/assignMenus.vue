<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">Assign Role to Apps</div>
      </q-card-section>

      <q-separator inset />
      <q-card-section class="q-pt-none">
        <div class="row">
          <div class="col">
            <q-tree
              class="assign-tree"
              :nodes="options"
              label-key="label"
              node-key="value"
              tick-strategy="leaf"
              v-model:selected="selectedApps"
              v-model:ticked="ticked"
              default-expand-all
              @update:ticked="onTicked"
            />
          </div>
          <div class="col">
            {{
              selectedApps && selectedApps.length > 0
                ? realData.filter((fil) => fil.am_app_code === selectedApps)
                    .length > 0
                  ? realData.filter(
                      (fil) => fil.am_app_code === selectedApps
                    )[0].am_app_desc
                  : null
                : null
            }}
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick()" />
        <q-btn flat color="red" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useDialogPluginComponent, date } from "quasar";

import apiRequest from "src/components/apiRequest";

const { postData } = apiRequest();

const props = defineProps({
  dataProps: Object || null,
  // ...your custom props
});

const dataHasil = ref(null);
const realData = ref([]);
const options = ref([]);
const ticked = ref([]);
const expanded = ref([]);
const selectedApps = ref([]);

onMounted(() => {
  dataHasil.value = props.dataProps;

  const getTick = [];
  dataHasil.value.role_app_map.map((val) => {
    getTick.push(val.am_app_id);
  });

  ticked.value = getTick;
  getApps();
  // listParent.value = props.list_parent;
});

const getDataApps = () =>
  realData.value.filter((fil) => fil.am_app_code === val);

const normalizeIcon = (iconName) => {
  const icon = String(iconName || "").trim();
  if (!icon) return "apps";
  // Guard against malformed icon payloads that can break tree node layout.
  if (icon.length > 60 && !icon.startsWith("img:")) return "apps";
  return icon;
};

const spreadingNodes = (data) => {
  return data.map((val) => {
    return {
      label: val.am_app_name,
      value: val.am_app_code,
      icon: normalizeIcon(val.am_app_icon),
      children: val.child_apps.length > 0 ? spreadingNodes(val.child_apps) : [],
      parent: val.am_app_parent,
    };
  });
};
const getApps = async () => {
  const data = await postData(
    "get",
    null,
    "portal/appsParent",
    false,
    false,
    true
  );
  if (data) {
    realData.value = data.data;
    const hasil = spreadingNodes(data.data);
    options.value = hasil;
  }
};

const filterUsers = (val, update, abort) => {
  update(() => {});
};

const onTicked = (val) => {
  ticked.value = toggleChecking(options.value, val);
};

const toggleChecking = (arr, val, par = "") => {
  return arr.reduce((r, o) => {
    const children = toggleChecking(o.children, val, o.value);
    if (val.includes(o.value) || children.length > 0) {
      r.push(o.value, ...children);
    }

    return r;
  }, []);
};

const findData = (arr, val) => {
  return arr.reduce((r, o) => {
    const children = findData(o.children, val);
    if (o.value === val) {
      r.push(o, ...children);
    } else {
      r.push(...children);
    }
    return r;
  }, []);
};

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  const selectApp = [];
  ticked.value.map((val) => {
    // console.log(options.value);
    selectApp.push({
      u_username: dataHasil.value.u_username,
      rm_role_id: dataHasil.value.id,
      am_app_id: val,
      am_app_parent: findData(options.value, val)[0].parent,
    });
  });

  onDialogOK(ref({ ...dataHasil.value, role_app_map: selectApp }));
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>

<style scoped>
.assign-tree :deep(.q-tree__node-header) {
  align-items: center;
}

.assign-tree :deep(.q-tree__node-header .q-checkbox) {
  flex: 0 0 auto;
  margin-right: 6px;
  z-index: 2;
}

.assign-tree :deep(.q-tree__icon) {
  font-size: 16px;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  margin-right: 6px;
}

.assign-tree :deep(.q-tree__node-header-content) {
  min-width: 0;
}
</style>
