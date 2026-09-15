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
        <div class="text-h6">Setup Field Permissions</div>
        <div class="text-caption q-mt-sm">
          Define which users/roles can edit each field. Unlisted users will see
          restricted fields as read-only or hidden (Restricted Method). Fields
          not listed are editable by everyone.
        </div>
      </q-card-section>

      <q-card-section class="q-pb-sm">
        <div class="row items-center q-gutter-md">
          <div class="text-bold">Assign by:</div>
          <q-radio v-model="assignMode" val="users" label="Users" />
          <q-radio v-model="assignMode" val="roles" label="Roles" />
        </div>
      </q-card-section>

      <q-card-section class="q-pb-sm" v-if="selectedFields.size > 0">
        <div class="row items-center q-gutter-sm">
          <div class="text-bold text-primary">
            {{ selectedFields.size }} field(s) selected
          </div>
          <div class="col" style="max-width: 400px">
            <q-select
              v-model="bulkValue"
              :options="assignMode === 'users' ? filteredUsers : filteredRoles"
              multiple
              :label="'Bulk assign to selected (' + assignMode + ')'"
              emit-value
              map-options
              use-chips
              dense
              outlined
              use-input
              input-debounce="300"
              @filter="(val, update) => filterOpts(val, update, assignMode)"
              @update:model-value="onBulkAssign"
            />
          </div>
          <div class="col" style="max-width: 160px">
            <q-select
              v-model="bulkMethod"
              :options="methodOptions"
              label="Bulk method"
              emit-value
              map-options
              dense
              outlined
              clearable
              @update:model-value="onBulkMethod"
            />
          </div>
          <q-btn
            icon="clear"
            flat
            dense
            color="negative"
            @click="onBulkClear"
            label="Clear selected"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md" style="max-height: 50vh; overflow-y: auto">
        <div class="row q-py-sm items-center text-weight-bold text-grey">
          <div class="col-auto" style="width: 40px">
            <q-checkbox
              v-model="selectAll"
              dense
              @update:model-value="onToggleSelectAll"
            />
          </div>
          <div class="col-3">Field</div>
          <div class="col">{{ assignMode === "users" ? "Users" : "Roles" }}</div>
          <div class="col-auto" style="width: 100px">Status</div>
          <div class="col-auto" style="width: 140px">Restricted Method</div>
        </div>
        <q-separator />
        <div
          v-for="(field, idx) in formFields"
          :key="field.id"
          class="row q-py-sm items-center"
        >
          <div class="col-auto" style="width: 40px">
            <q-checkbox
              :model-value="selectedFields.has(field.id)"
              dense
              @update:model-value="onToggleField(field.id)"
            />
          </div>
          <div class="col-3">
            <strong>{{ field.label || field.content?.label || "Unnamed Field" }}</strong>
            <div class="text-caption text-grey">ID: {{ field.id }}</div>
          </div>
          <div class="col">
            <q-select
              v-if="assignMode === 'users'"
              v-model="localPerms[idx].users"
              :options="filteredUsers"
              multiple
              label="Select users"
              emit-value
              map-options
              use-chips
              dense
              filled
              use-input
              input-debounce="300"
              @filter="(val, update) => filterOpts(val, update, 'users')"
            />
            <q-select
              v-if="assignMode === 'roles'"
              v-model="localPerms[idx].roles"
              :options="filteredRoles"
              multiple
              label="Select roles"
              emit-value
              map-options
              use-chips
              dense
              filled
              use-input
              input-debounce="300"
              @filter="(val, update) => filterOpts(val, update, 'roles')"
            />
          </div>
          <div class="col-auto" style="width: 100px">
            <q-badge
              :color="
                localPerms[idx].users.length === 0 &&
                localPerms[idx].roles.length === 0
                  ? 'green'
                  : 'orange'
              "
            >
              {{
                localPerms[idx].users.length === 0 &&
                localPerms[idx].roles.length === 0
                  ? "Everyone"
                  : "Restricted"
              }}
            </q-badge>
          </div>
          <div class="col-auto" style="width: 140px">
            <q-select
              v-model="localPerms[idx].method"
              :options="methodOptions"
              label="Method"
              emit-value
              map-options
              dense
              outlined
              :disable="isEveryone(localPerms[idx])"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn @click="onSubmit" color="primary" label="Submit" />
        <q-btn @click="onDialogCancel" color="secondary" label="Close" flat />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  forms: { type: Array, default: () => [] },
  fieldPermissions: { type: Array, default: () => [] },
  optionsUsers: { type: Array, default: () => [] },
  optionsRoles: { type: Array, default: () => [] },
});

const assignMode = ref("users");
const formFields = ref([]);
const localPerms = ref([]);
const filteredUsers = ref([]);
const filteredRoles = ref([]);
const selectedFields = ref(new Set());
const selectAll = ref(false);
const bulkValue = ref([]);
const bulkMethod = ref(null);

const methodOptions = [
  { label: "Readonly", value: "readonly" },
  { label: "Hidden", value: "hidden" },
];

const isEveryone = (p) =>
  (p?.users?.length || 0) === 0 && (p?.roles?.length || 0) === 0;

onMounted(() => {
  filteredUsers.value = [...props.optionsUsers];
  filteredRoles.value = [...props.optionsRoles];

  const fields = [];
  if (props.forms && props.forms.length > 0) {
    props.forms.forEach((row) => {
      if (Array.isArray(row.content)) {
        row.content.forEach((col) => {
          if (col.type === "form" && col.id) {
            fields.push({
              id: col.id,
              label: col.content?.label || col.label || "",
            });
          }
        });
      }
    });
  }
  formFields.value = fields;

  localPerms.value = fields.map((f) => {
    const existing = props.fieldPermissions.find(
      (p) => String(p.fieldId) === String(f.id)
    );
    return {
      fieldId: f.id,
      users: existing?.users || [],
      roles: existing?.roles || [],
      method: existing?.method || "readonly",
    };
  });
});

const filterOpts = (val, update, type) => {
  if (val === "") {
    update(() => {
      if (type === "users") {
        filteredUsers.value = [...props.optionsUsers];
      } else {
        filteredRoles.value = [...props.optionsRoles];
      }
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    if (type === "users") {
      filteredUsers.value = props.optionsUsers.filter((v) =>
        (v.label || "").toLowerCase().includes(needle)
      );
    } else {
      filteredRoles.value = props.optionsRoles.filter((v) =>
        (v.label || "").toLowerCase().includes(needle)
      );
    }
  });
};

const onToggleField = (id) => {
  const next = new Set(selectedFields.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selectedFields.value = next;
  selectAll.value = next.size === formFields.value.length;
};

const onToggleSelectAll = (val) => {
  if (val) {
    selectedFields.value = new Set(formFields.value.map((f) => f.id));
  } else {
    selectedFields.value = new Set();
  }
  selectAll.value = val;
};

const onBulkAssign = (vals) => {
  if (!vals || vals.length === 0) return;
  localPerms.value = localPerms.value.map((p) => {
    if (selectedFields.value.has(p.fieldId)) {
      const key = assignMode.value === "users" ? "users" : "roles";
      return { ...p, [key]: [...vals] };
    }
    return p;
  });
};

const onBulkMethod = (val) => {
  if (!val || selectedFields.value.size === 0) return;
  localPerms.value = localPerms.value.map((p) => {
    if (selectedFields.value.has(p.fieldId)) {
      return { ...p, method: val };
    }
    return p;
  });
  bulkMethod.value = null;
};

const onBulkClear = () => {
  localPerms.value = localPerms.value.map((p) => {
    if (selectedFields.value.has(p.fieldId)) {
      return { ...p, users: [], roles: [], method: "readonly" };
    }
    return p;
  });
  selectedFields.value = new Set();
  selectAll.value = false;
  bulkValue.value = [];
};

const onSubmit = () => {
  const result = localPerms.value.filter(
    (p) => p.users.length > 0 || p.roles.length > 0
  );
  onDialogOK(result);
};
</script>
