<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Training Management</div>
      </q-card-section>

      <q-card-section>
        <q-btn label="Add Training" color="primary" @click="openAddDialog" />
      </q-card-section>

      <q-card-section>
        <!-- Training List Table (placeholder) -->
        <q-table
          title="Trainings"
          :rows="trainings"
          :columns="columns"
          row-key="id"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                icon="edit"
                flat
                round
                dense
                @click="editTraining(props.row)"
              />
              <q-btn
                icon="delete"
                flat
                round
                dense
                @click="deleteTraining(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Training Dialog -->
    <q-dialog v-model="addEditDialog" persistent>
      <q-card style="min-width: 700px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? 'Edit Training' : 'Add New Training' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveTraining">
            <q-input
              v-model="currentTraining.title"
              label="Title"
              outlined
              dense
              class="q-mb-md"
              :rules="[(val) => !!val || 'Title is required']"
            />
            <q-input
              v-model="currentTraining.description"
              label="Description"
              type="textarea"
              outlined
              dense
              class="q-mb-md"
            />

            <q-select
              v-model="currentTraining.category"
              :options="categoryOptions"
              label="Category"
              outlined
              dense
              class="q-mb-md"
              :rules="[(val) => !!val || 'Category is required']"
            />

            <q-input
              v-model="currentTraining.date"
              label="Date"
              type="date"
              outlined
              dense
              class="q-mb-md"
              :rules="[(val) => !!val || 'Date is required']"
            />

            <q-input
              v-model="currentTraining.time"
              label="Time"
              type="time"
              outlined
              dense
              class="q-mb-md"
              :rules="[(val) => !!val || 'Time is required']"
            />

            <q-input
              v-model="currentTraining.location"
              label="Location"
              outlined
              dense
              class="q-mb-md"
            />

            <q-radio
              v-model="currentTraining.status"
              val="active"
              label="Active"
              class="q-mr-md"
            />
            <q-radio
              v-model="currentTraining.status"
              val="inactive"
              label="Inactive"
            />

            <div class="q-mt-md">
              <div class="text-subtitle1">Upload Files</div>
              <q-uploader
                ref="uploader"
                url="http://localhost:4444/upload"
                label="Select files to upload"
                multiple
                batch
                :auto-upload="false"
                @uploaded="handleUploaded"
                @failed="handleUploadFailed"
                @added="handleFilesAdded"
                @removed="handleFilesRemoved"
                class="q-mt-sm"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancel" color="grey" flat @click="closeAddDialog" />
          <q-btn
            label="OK"
            color="primary"
            @click="triggerUploadAndSave"
            :disable="!canSave"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const trainings = ref([]);
const addEditDialog = ref(false);
const isEditing = ref(false);
const currentTraining = ref({
  id: null,
  title: '',
  description: '',
  category: null,
  date: '',
  time: '',
  location: '',
  status: 'active',
  files: [], // To store uploaded file info
});

const categoryOptions = ['IT', 'HR', 'Sales', 'Marketing'];

const columns = [
  { name: 'title', required: true, label: 'Title', align: 'left', field: 'title', sortable: true },
  { name: 'category', label: 'Category', align: 'left', field: 'category', sortable: true },
  { name: 'date', label: 'Date', align: 'left', field: 'date', sortable: true },
  { name: 'time', label: 'Time', align: 'left', field: 'time', sortable: true },
  { name: 'status', label: 'Status', align: 'left', field: 'status', sortable: true },
  { name: 'actions', label: 'Actions', align: 'right' },
];

const uploader = ref(null);
const filesInUploader = ref([]);
const isUploading = ref(false);

// Computed property to enable/disable the "OK" button
const canSave = computed(() => {
  // Check if required form fields are filled
  const formValid =
    currentTraining.value.title &&
    currentTraining.value.category &&
    currentTraining.value.date &&
    currentTraining.value.time;

  // The "OK" button should be disabled if an upload is in progress
  // or if there are files to upload but the form is not valid.
  // If there are no files to upload, the form validity is enough.
  return formValid && !isUploading.value;
});

function openAddDialog() {
  isEditing.value = false;
  currentTraining.value = {
    id: null,
    title: '',
    description: '',
    category: null,
    date: '',
    time: '',
    location: '',
    status: 'active',
    files: [],
  };
  filesInUploader.value = []; // Clear files from previous dialogs
  if (uploader.value) {
    uploader.value.reset(); // Reset the uploader component
  }
  addEditDialog.value = true;
}

function closeAddDialog() {
  addEditDialog.value = false;
  isUploading.value = false; // Reset upload status
  if (uploader.value) {
    uploader.value.reset(); // Reset the uploader component
  }
}

function editTraining(training) {
  isEditing.value = true;
  currentTraining.value = { ...training };
  // When editing, if there are existing files, you might want to display them
  // or handle them differently. For now, we'll clear the uploader.
  filesInUploader.value = [];
  if (uploader.value) {
    uploader.value.reset();
  }
  addEditDialog.value = true;
}

function deleteTraining(id) {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this training?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    trainings.value = trainings.value.filter((t) => t.id !== id);
    $q.notify({
      message: 'Training deleted successfully.',
      color: 'positive',
      icon: 'check_circle',
    });
  });
}

// Handles files added to the uploader queue
function handleFilesAdded(files) {
  filesInUploader.value = files;
}

// Handles files removed from the uploader queue
function handleFilesRemoved(files) {
  filesInUploader.value = uploader.value.files; // Update the list of files currently in the uploader
}

// Trigger upload and then save the training
async function triggerUploadAndSave() {
  // Validate form fields first
  const formValid =
    currentTraining.value.title &&
    currentTraining.value.category &&
    currentTraining.value.date &&
    currentTraining.value.time;

  if (!formValid) {
    $q.notify({
      message: 'Please fill in all required training details.',
      color: 'negative',
      icon: 'warning',
    });
    return;
  }

  if (filesInUploader.value.length > 0) {
    isUploading.value = true;
    uploader.value.upload(); // Manually trigger upload
  } else {
    // No files to upload, proceed directly to saving
    saveTraining();
  }
}

// Handles successful upload
function handleUploaded({ files, xhr }) {
  isUploading.value = false;
  const response = JSON.parse(xhr.responseText);
  // Assuming your backend returns an array of uploaded file details
  // e.g., [{ name: 'file1.jpg', url: '...', size: '...' }]
  currentTraining.value.files = response.uploadedFiles || [];

  $q.notify({
    message: 'Files uploaded successfully!',
    color: 'positive',
    icon: 'cloud_done',
  });

  saveTraining(); // Now save the training details with file info
}

// Handles upload failure
function handleUploadFailed({ files, xhr }) {
  isUploading.value = false;
  $q.notify({
    message: `File upload failed for ${files.map(f => f.name).join(', ')}.`,
    color: 'negative',
    icon: 'error',
  });
  // Decide if you want to prevent saving the training if upload fails
  // For now, we'll still allow saving the training details without the files.
  // If files are mandatory, you might want to prevent saveTraining() here.
  // saveTraining(); // Or prevent this if files are critical
}

function saveTraining() {
  if (isEditing.value) {
    const index = trainings.value.findIndex((t) => t.id === currentTraining.value.id);
    if (index !== -1) {
      trainings.value[index] = { ...currentTraining.value };
    }
    $q.notify({
      message: 'Training updated successfully.',
      color: 'positive',
      icon: 'check_circle',
    });
  } else {
    currentTraining.value.id = trainings.value.length > 0 ? Math.max(...trainings.value.map(t => t.id)) + 1 : 1;
    trainings.value.push({ ...currentTraining.value });
    $q.notify({
      message: 'Training added successfully.',
      color: 'positive',
      icon: 'check_circle',
    });
  }
  closeAddDialog();
}
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
