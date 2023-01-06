<template>
  <div class="q-pa-md">
    <template v-if="props.type === 'normal'">
      <q-input
        :type="props.typeInput"
        v-model="modelData"
        :label="props.label"
        dense
      />
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
              />
            </div>
            <div class="col-6 q-pl-md">
              <q-input
                label="Label of this options"
                v-model="opt.label"
                outlined
                dense
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
                outlined
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
            outlined
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

            {{ modelDataArr }}
          </template>

          <template v-else-if="props.comp === 'q-radio'">
            <span v-html="props.label" />
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
});

const detailData = ref([]);

const onDeleteData = (idx) => {
  detailData.value.splice(idx, 1);
  emit("onDeleted", detailData.value);
};

onMounted(() => {
  console.log("masuk sini");
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
    console.log("masuk cek jawaban 2");
    modelDataArr.value = JSON.parse(val);
  }
);

// Jawaban yang di pilih
watch(
  () => JSON.stringify(modelDataArr.value),
  (val) => {
    if (modelDataArr.value) {
      emit("customChange", JSON.parse(val));
    }
  }
);

watch(
  () => modelData.value,
  (val) => {
    console.log("masuk ke 2");
    emit("customChange", val);
  }
);
</script>
