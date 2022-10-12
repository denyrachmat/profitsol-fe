<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-input label="Form Title" dense outlined v-model="formTitle" />
      </div>
      <div class="col-1 text-right">
        <q-btn-group>
          <q-btn color="green" icon="add" @click="onAddRows" />
          <q-btn color="cyan" icon="search" />
        </q-btn-group>
      </div>
    </div>
    <hr />
    <fieldset style="border: 1px solid #ccc !important; border-radius: 16px">
      <legend>Create forms here</legend>
      <template v-for="(form, idxForm) in forms" :key="idxForm">
        <div class="row q-pt-md">
          <q-input
            borderless
            class="q-ml-md"
            v-model="form.rows_seq_name"
            input-class="text-h6"
          ></q-input>
          <!-- <div class="col text-h4 text-bold">Rows 1</div> -->
          <div class="col text-right">
            <q-btn-group>
              <q-btn color="green" icon="add" @click="onAddCols(idxForm)" />
            </q-btn-group>
          </div>
        </div>

        <!-- Rows Content -->
        <div class="row q-pt-md">
          <div
            class="col text-center q-pa-md"
            style="border: 1px dashed #ccc !important; border-radius: 5px"
            v-for="(col, idxCol) in form.cols"
            :key="idxCol + 'col'"
          >
            <div>
              <q-btn-group flat>
                <q-btn color="green" icon="add" flat />
                <q-btn
                  color="red"
                  icon="delete"
                  flat
                  @click="form.cols.splice(idxCol, 1)"
                />
              </q-btn-group>
            </div>
            <div class="q-pt-md text-italic">Add form component here</div>
          </div>
        </div>
      </template>
    </fieldset>
  </div>
</template>
<script setup>
import { ref } from "vue";

const formTitle = ref("");
const forms = ref([]);
const formsInit = {
  rows_seq_name: "",
  cols: [],
};

const onAddRows = () => {
  // formsInit.rows_seq_name = `Rows ${forms.value.length + 1}`;
  forms.value.push({
    rows_seq_name: `${forms.value.length + 1}`,
    cols: [
      {
        content: {},
      },
    ],
  });
};

const onAddCols = (idx) => {
  forms.value[idx].cols.push({
    content: {},
  });
};
</script>
