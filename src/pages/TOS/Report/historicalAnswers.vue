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
        <div class="text-h6">History Answer of users</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-list bordered class="rounded-borders">
          <q-expansion-item
            expand-separator
            :icon="data.is_pass ? 'done_all' : 'cancel'"
            :header-class="data.is_pass ? 'text-green' : 'text-red'"
            :label="`Time Answers on : ${data.times}`"
            :caption="`Grade : ${data.grade}`"
            v-for="(data, idx) in props.datas"
            :key="idx"
          >
            <q-list
              bordered
              class="rounded-borders"
              :header-inset-level="1"
              :key="idx + idx2 + 'child'"
              v-for="(childData, idx2) in getFailedData(
                data.data,
                data.data_ori
              )"
            >
              <q-item>
                <q-item-section top>
                  <q-item-label lines="1">
                    <span class="text-bold">Question :</span>
                  </q-item-label>
                  <q-item-label lines="10">
                    <span v-html="childData.quest.content.label"></span>
                  </q-item-label>
                  <q-item-label lines="1">
                    <span class="text-bold">Answers :</span>
                  </q-item-label>
                  <q-item-label lines="10">
                    <span v-html="childData.answer.ans_value[0]"></span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="OK" color="primary" @click="onOKClick()" />
        <q-btn flat label="Cancel" color="red" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const props = defineProps({
  datas: Array,
});

const getFailedData = (dataChild, dataQuestion) => {
  let hasil = [];
  dataQuestion.map((val, idx) => {
    if (!dataChild[idx].status) {
      hasil.push({
        quest: val,
        answer: dataChild[idx],
      });
    }
  });

  console.log(hasil);
  return hasil;
};

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
  onDialogOK();
}
</script>
