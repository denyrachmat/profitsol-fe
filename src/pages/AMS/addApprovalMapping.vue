<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    transition-show="slide-up"
    transition-hide="slide-down"
    full-width
  >
    <q-card class="q-dialog-plugin bg-white q-pa-md">
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">Approval Mapping Maintenance</div>
          </div>
          <div class="col text-right">
            <q-btn-group outline>
              <q-btn
                outline
                :icon="listApproval.length > 0 ? 'edit' : 'add_box'"
                :color="listApproval.length > 0 ? 'warning' : 'primary'"
                @click="openUsersChoose()"
              >
                <q-tooltip>{{
                  listApproval.length > 0
                    ? "Update users workflow"
                    : "Add users to workflow"
                }}</q-tooltip>
              </q-btn>
              <q-btn
                outline
                :icon="'build'"
                :color="'cyan'"
                @click="onClickApprovalSet()"
                :disable="isNew"
              >
                <q-tooltip>Setup Approval</q-tooltip>
              </q-btn>
              <q-btn
                outline
                :icon="'integration_instructions'"
                :color="'purple'"
                @click="onClickChangeContent()"
                :disable="isNew"
              >
                <q-tooltip>Change Notification Content</q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-sm">
        <div class="q-pb-sm">
          <q-input outlined v-model="title" label="Title" />
        </div>
        <q-list
          dense
          bordered
          padding
          class="rounded-borders"
          style="max-height: 50vh; overflow: auto"
        >
          <template v-if="listApproval.length > 0">
            <template v-for="(apprvGrp, idx) in viewBasedOnOrder" :key="idx">
              <q-separator spaced v-if="parseInt(idx) > 1" />
              <q-item-label header>Approval Order : {{ idx }}</q-item-label>

              <q-item
                clickable
                v-ripple
                v-for="(apprv, idx2) in apprvGrp"
                :key="`idDet-${idx}-${idx2}`"
              >
                <q-item-section>{{ apprv.fullname }}</q-item-section>
                <q-item-section avatar>
                  <q-toggle
                    v-model="listApproval[apprv.idx].amsmd_reqaprv"
                    label="Need Approve ?"
                    :false-value="0"
                    :true-value="1"
                  />
                </q-item-section>
                <q-item-section avatar>
                  <q-btn-group rounded>
                    <q-btn
                      :color="idx == 1 ? 'grey' : 'blue'"
                      rounded
                      outline
                      icon="arrow_upward"
                      :disable="idx == 1"
                      @click="changeOrder('down', apprv.idx)"
                    />
                    <q-btn
                      :color="idx == listApproval.length ? 'grey' : 'orange'"
                      rounded
                      outline
                      icon="arrow_downward"
                      :disable="idx == listApproval.length"
                      @click="changeOrder('up', apprv.idx)"
                    />
                    <q-btn
                      color="red"
                      rounded
                      icon="delete"
                      @click="deleteUsers(apprv.idx)"
                    />
                  </q-btn-group>
                </q-item-section>
              </q-item>
            </template>
          </template>
          <q-item clickable v-ripple v-else>
            <q-item-section> No data found here </q-item-section>
          </q-item>
        </q-list>
        <p class="q-pt-sm">
          * Same Approval order will get notification at same time
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="OK"
          color="primary"
          @click="onOKClick()"
          :loading="loading"
        />
        <q-btn
          flat
          label="Cancel"
          color="red"
          @click="onDialogCancel"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

import chooseUsers from "../Settings/Users/chooseUsers.vue";
import settingsApproval from "./settingsApproval.vue";
import addContentComponent from "../CMS/addContentComponent.vue";

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();
const { postData } = apiRequest();

const title = ref("");
const ids = ref("");
const listApproval = ref([]);
const listAllUsers = ref([]);
const loading = ref(false);
const isNew = ref(true);

const props = defineProps({
  dataUpdated: Object,
  // ...your custom props
});

onMounted(() => {
  if (props.dataUpdated.det && props.dataUpdated.det.length > 0) {
    title.value = props.dataUpdated.ams_title;
    ids.value = props.dataUpdated.id;
    props.dataUpdated.det.map((val) => {
      listApproval.value.push({
        amsmd_username: val.amsmd_username,
        amsmd_order: parseInt(val.amsmd_order),
        amsmd_reqaprv: parseInt(val.amsmd_reqaprv),
        fullname: val.user_det.fullname,
      });
    });

    isNew.value = false;
  }
});

const openUsersChoose = () => {
  const listChoosedApprv = listApproval.value.map(
    (valApprv) => valApprv.amsmd_username
  );

  const filteredChoosedApprv = listAllUsers.value.filter((fil) =>
    listChoosedApprv.includes(fil.u_username)
  );

  $q.dialog({
    component: chooseUsers,
    componentProps: {
      dataProps: filteredChoosedApprv,
      formatOut: {
        amsmd_username: "u_username",
        amsmd_order: "idx+",
        amsmd_reqaprv: 1,
        fullname: ["pud_first_name", "pud_last_name"],
      },
    },
  }).onOk(async (val) => {
    listApproval.value = val.result;
    listAllUsers.value = val.data;
  });
};

const viewBasedOnOrder = computed(() => {
  const a = listApproval.value.reduce((prev, curr, i) => {
    var key = parseInt(curr["amsmd_order"]);
    if (!prev[key]) {
      prev[key] = [];
    }
    prev[key].push({ ...curr, idx: i });
    return prev;
  }, {});

  return a;
});

const changeOrder = (stat, id) => {
  if (stat === "up") {
    listApproval.value[id].amsmd_order += 1;
  } else {
    listApproval.value[id].amsmd_order -= 1;
  }
};

const deleteUsers = (idx) => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to delete user ${listApproval.value[idx].fullname}?`,
    cancel: true,
  }).onOk(async () => {
    listApproval.value.splice(idx, 1);
  });
};

const onClickApprovalSet = (id) => {
  $q.dialog({
    component: settingsApproval,
    componentProps: {
      dataExists: props.dataUpdated.apprv_set,
    },
  }).onOk(async (val) => {
    loading.value = true;
    const data = await postData(
      "post",
      { ...val, id: ids.value },
      `ams/approvalSettings`,
      false,
      false,
      true
    );

    if (data) {
      $q.notify({
        color: "green",
        message: data.message,
      });

      loading.value = false;
    }
  });
};

const onClickChangeContent = () => {
  $q.dialog({
    component: addContentComponent,
  }).onOk(async (val) => {
    if (val.content) {
      loading.value = true;
      const data = await postData(
        "patch",
        {
          updateHead: {
            ams_content: val.content,
          },
        },
        `ams/approval/${ids.value}`,
        false,
        false,
        true
      );

      if (data) {
        getData();
      }
      console.log(val);
    }
  });
};

const onOKClick = () => {
  $q.dialog({
    title: "Alert",
    message: `Are you sure want to save this approval?`,
    cancel: true,
  }).onOk(async () => {
    loading.value = true;
    const data = ids.value
      ? await postData(
          `patch`,
          {
            updateHead: {
              ams_title: title.value,
            },
            det: listApproval.value,
          },
          `ams/approval/${ids.value}`,
          false,
          false,
          true
        )
      : await postData(
          "post",
          {
            title: title.value,
            det: listApproval.value,
          },
          `ams/approval`,
          false,
          false,
          true
        );

    if (data) {
      $q.notify({
        color: "green",
        message: data.message,
      });
      loading.value = false;
      onDialogOK();
    }
  });
};
</script>
