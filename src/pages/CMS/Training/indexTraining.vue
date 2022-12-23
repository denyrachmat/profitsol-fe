<template>
    <div class="q-pa-md">
        <div class="row">
            <div class="col q-pr-md">
                <q-input outlined label="Question Bank Title" :v-model="title" dense />
            </div>
            <div class="col-2 text-right">
                <q-btn-group>
                    <q-btn color="green" icon="save">
                        <q-tooltip>
                            Save question bank.
                        </q-tooltip>
                    </q-btn>
                    <q-btn color="accent" icon="add">
                        <q-tooltip>
                            Add more question.
                        </q-tooltip>
                    </q-btn>
                    <q-btn color="primary" icon="search">
                        <q-tooltip>
                            Find & Edit saved question bank.
                        </q-tooltip>
                    </q-btn>
                    <q-btn color="orange" icon="visibility">
                        <q-tooltip>
                            Test your question bank.
                        </q-tooltip>
                    </q-btn>
                </q-btn-group>
            </div>
        </div>

        <div class="row q-py-md">
            <div class="col">
                <hr />
            </div>
        </div>

        <div class="row">
            <div class="col">
                <fieldset style="
                    border: 1px solid #ccc !important;
                    border-radius: 16px;
                    max-height: 80vh;
                    overflow: auto;
                ">
                    <legend>Add question here</legend>
                </fieldset>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";

const title = ref('')
</script>