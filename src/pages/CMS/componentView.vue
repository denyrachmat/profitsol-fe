<template>
  <div>
    <template v-if="props.type === 'normal'">
      <q-input
        v-model="modelData"
        :label="props.label"
        dense
        filled
        :type="props.typeInput"
        v-if="props.comp === 'q-input'"
      >
        <template
          v-slot:prepend
          v-if="props.typeInput === 'date' || props.typeInput === 'time'"
        >
          <q-icon
            :name="props.typeInput === 'date' ? 'event' : 'access_time'"
            class="cursor-pointer"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="modelData"
                mask="YYYY-MM-DD"
                v-if="props.typeInput === 'date'"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>

              <q-time v-model="modelData" mask="HH:mm" format24h v-else>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>

        <!-- If Datetime -->
        <template v-slot:prepend v-else-if="props.typeInput === 'datetime'">
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="modelData" mask="YYYY-MM-DD HH:mm">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>

        <template v-slot:append v-if="props.typeInput === 'datetime'">
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time v-model="modelData" mask="YYYY-MM-DD HH:mm" format24h>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-file
        filled
        bottom-slots
        v-model="modelData"
        :label="props.label"
        counter
        max-files="12"
        v-if="props.comp === 'q-file'"
        dense
      >
        <template v-slot:before>
          <q-icon name="folder_open" />
        </template>

        <template v-slot:hint> Field hint </template>

        <template v-slot:append>
          <q-btn round dense flat icon="add" @click.stop.prevent />
        </template>
      </q-file>
    </template>
    <template v-else-if="props.type === 'multiple'">
      <template v-if="props.mode == 'edit'">
        <div style="max-height: 20vh; overflow: auto">
          <div class="row q-pb-md" v-for="(opt, idx) in detailData" :key="idx">
            <div class="col-5">
              <q-input
                label="Value of this options"
                v-model="opt.value"
                outlined
                dense
                filled
              />
            </div>
            <div class="col-6 q-pl-md">
              <q-input
                label="Label of this options"
                v-model="opt.label"
                outlined
                dense
                filled
              />
            </div>

            <div class="col-1 text-right">
              <q-btn
                icon="delete"
                color="red"
                flat
                @click="onDeleteData(idx)"
              />
            </div>
          </div>
        </div>

        <!-- Preview -->
        <fieldset
          style="
            border: 1px dashed #ccc !important;
            border-radius: 16px;
            max-height: 20vh;
            overflow: auto;
          "
        >
          <legend>Preview component here</legend>
          <div class="row q-pa-md" :key="refreshDetail">
            <div class="col">
              <q-select
                filled
                v-model="modelData"
                :options="detailData"
                :label="props.label"
                emit-value
                map-options
                v-if="props.comp === 'q-select'"
              />

              <template v-else-if="props.comp === 'q-checkbox'">
                <span v-html="props.label" />
                <div class="q-gutter-sm">
                  <q-option-group
                    :options="detailData"
                    type="checkbox"
                    v-model="modelDataArr"
                  />
                </div>
              </template>

              <template v-else-if="props.comp === 'q-radio'">
                <span v-html="props.label" />
                <div class="q-gutter-sm">
                  <q-option-group :options="detailData" v-model="modelData" />
                </div>
              </template>
            </div>
          </div>
        </fieldset>
      </template>
      <template v-else>
        <div>
          <q-select
            filled
            v-model="modelData"
            :options="detailData"
            :label="props.label"
            emit-value
            map-options
            :readonly="props.mode == 'live-read'"
            v-if="props.comp === 'q-select'"
          />

          <template v-else-if="props.comp === 'q-checkbox'">
            <span v-html="props.label" />
            <div class="q-gutter-sm">
              <q-option-group
                :options="props.detail"
                type="checkbox"
                v-model="modelDataArr"
                :disable="props.mode == 'live-read'"
              />
            </div>
          </template>

          <template v-else-if="props.comp === 'q-radio'">
            <span v-html="props.label"></span>
            <div class="q-gutter-sm">
              <q-option-group
                :options="props.detail"
                v-model="modelData"
                :disable="props.mode == 'live-read'"
              />
            </div>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>
<script setup>
import { defineProps, onMounted, ref, watch } from "vue";

const emit = defineEmits(["onDeleted", "customChange"]);

const modelData = ref("");
const refreshDetail = ref(0);
const modelDataArr = ref([]);
const props = defineProps({
  type: String,
  typeInput: String,
  comp: String,
  label: String,
  detail: Array,
  mode: String,
  ans: String,
  ansArr: Array,
  isRequired: Boolean,
});

const detailData = ref([]);

const onDeleteData = (idx) => {
  detailData.value.splice(idx, 1);
  emit("onDeleted", detailData.value);
};

onMounted(() => {
  console.log("masuk awalan");
  detailData.value = props.detail;

  if (props.ans) {
    modelData.value = props.ans.toString();
  }

  if (props.ansArr && props.ansArr.length > 0) {
    console.log(props.ansArr);
    modelDataArr.value = props.ansArr;
  }
});

watch(
  () => JSON.stringify(props.detail),
  (val) => {
    console.log(props);
    detailData.value = JSON.parse(val);

    modelDataArr.value = props.ansArr;
    // refreshDetail.value = refreshDetail.value + 1;
    // emit("onDeleted", JSON.parse(val));
  }
);

watch(
  () => JSON.stringify(detailData.value),
  (val) => {
    detailData.value = JSON.parse(val);
    emit("onDeleted", JSON.parse(val));
    refreshDetail.value = refreshDetail.value + 1;
  }
);

watch(
  () => props.ans,
  (val) => {
    console.log("masuk cek jawaban 1");
    modelData.value = val;
  }
);

watch(
  () => JSON.stringify(props.ansArr),
  (val) => {
    if (JSON.parse(val).length > 0) {
      console.log("masuk cek jawaban Array");
      console.log(JSON.parse(val));
      modelDataArr.value = JSON.parse(val);
    }
  }
);

// Jawaban yang di pilih
watch(
  () => JSON.stringify(modelDataArr.value),
  (val) => {
    if (modelDataArr.value) {
      if (props.mode == "live-ans") {
        emit("customAnschange", JSON.parse(val));
      } else {
        emit("customChange", JSON.parse(val));
      }
    }
  }
);

watch(
  () => modelData.value,
  (val) => {
    if (modelData.value) {
      console.log(props.mode);
      console.log(val);
      if (props.mode == "live-ans") {
        emit("customAnschange", val);
      } else {
        emit("customChange", val);
      }
    }
  }
);
</script>
