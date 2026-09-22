<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="width: 720px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="storage" color="primary" class="q-mr-sm" />
        <div class="text-h6">
          {{ form.id ? "Edit Dataset" : "New Dataset" }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="onDialogCancel" />
      </q-card-section>

      <q-card-section class="q-gutter-sm">
        <div class="row q-col-gutter-sm">
          <q-input
            v-model="form.name"
            label="Name"
            dense
            outlined
            class="col-7"
            :rules="[(v) => !!v || 'Required']"
          />
          <q-input
            v-model="form.code"
            label="Code (used by charts)"
            dense
            outlined
            class="col-5"
            hint="lowercase, numbers, - and _"
            :rules="[
              (v) =>
                /^[a-z0-9][a-z0-9\-_]*$/.test(v) ||
                'Must start with letter/number; lowercase, - and _ only',
            ]"
          />
        </div>

        <q-input v-model="form.desc" label="Description" dense outlined />

        <div class="row items-center">
          <div class="col">
            <q-select
              v-model="form.type"
              :options="[
                { label: 'SQL Query', value: 'sql' },
                { label: 'Internal API', value: 'api' },
                { label: 'External API', value: 'api_ext' },
              ]"
              label="Source Type"
              dense
              outlined
              emit-value
              map-options
              class="col-4"
            />
          </div>
          <div class="col">
            <q-select
              v-if="form.type === 'sql'"
              v-model="form.connection"
              :options="connectionOptions"
              label="Database Connection"
              dense
              outlined
              emit-value
              map-options
              class="col-8"
              :loading="connectionsLoading"
            />
            <template v-else>
              <q-select
                v-model="form.method"
                :options="['get', 'post']"
                label="Method"
                dense
                outlined
                class="col-3"
              />
              <q-input
                v-model="form.endpoint"
                :label="
                  form.type === 'api_ext'
                    ? 'External URL (https://...)'
                    : 'API Path (e.g. div/ems2/getData)'
                "
                dense
                outlined
                class="col-5"
                :hint="
                  form.type === 'api_ext'
                    ? 'Full http(s) URL. Use {{param}} for declared params.'
                    : 'Relative to this API. Use {{param}} for declared params.'
                "
              />
            </template>
          </div>
        </div>

        <q-input
          v-if="form.type === 'sql'"
          v-model="form.query"
          type="textarea"
          label="SELECT Query"
          outlined
          autogrow
          input-style="font-family: monospace; min-height: 120px"
          hint="Read-only SELECT only. Use ? for declared params (in order)."
        />

        <q-input
          v-if="form.type !== 'sql' && form.method === 'post'"
          v-model="form.payload"
          type="textarea"
          label='POST Payload (JSON template, e.g. {"year": "{{year}}"})'
          dense
          outlined
          autogrow
          input-style="font-family: monospace"
        />

        <!-- Custom HTTP headers (API datasets) -->
        <template v-if="form.type !== 'sql'">
          <div class="text-subtitle2 text-grey-8 q-mt-sm">
            HTTP Headers
            <q-btn
              flat
              dense
              round
              icon="add"
              size="sm"
              color="primary"
              @click="form.headers.push({ key: '', value: '' })"
            >
              <q-tooltip>Add header</q-tooltip>
            </q-btn>
          </div>
          <div v-if="!form.headers.length" class="text-caption text-grey-5">
            No custom headers. Internal API calls forward your portal identity
            automatically.
          </div>
          <div
            v-for="(h, i) in form.headers"
            :key="i"
            class="row q-col-gutter-xs items-center q-mb-xs"
          >
            <q-input
              v-model="h.key"
              label="Header"
              dense
              outlined
              class="col-4"
              placeholder="Authorization"
            />
            <q-input
              v-model="h.value"
              label="Value"
              dense
              outlined
              class="col-7"
              placeholder="Bearer ..."
            />
            <q-btn
              flat
              dense
              round
              icon="close"
              size="sm"
              color="red"
              class="col-1"
              @click="form.headers.splice(i, 1)"
            />
          </div>
        </template>

        <!-- Params schema -->
        <div class="text-subtitle2 text-grey-8 q-mt-sm">
          Parameters
          <q-btn
            flat
            dense
            round
            icon="add"
            size="sm"
            color="primary"
            @click="addParam"
          >
            <q-tooltip>Add parameter</q-tooltip>
          </q-btn>
        </div>
        <div v-if="!form.paramsSchema.length" class="text-caption text-grey-5">
          No parameters — the query runs as-is.
        </div>
        <div
          v-for="(p, i) in form.paramsSchema"
          :key="i"
          class="row q-col-gutter-xs items-center q-mb-xs"
        >
          <q-input v-model="p.name" label="name" dense outlined class="col-3" />
          <q-input
            v-model="p.label"
            label="label"
            dense
            outlined
            class="col-3"
          />
          <q-select
            v-model="p.type"
            :options="['string', 'number', 'date']"
            label="type"
            dense
            outlined
            class="col-2"
          />
          <q-input
            v-model="p.default"
            label="default"
            dense
            outlined
            class="col-3"
          />
          <q-btn
            flat
            dense
            round
            icon="close"
            size="sm"
            color="red"
            class="col-1"
            @click="form.paramsSchema.splice(i, 1)"
          />
        </div>

        <div class="row q-col-gutter-sm">
          <q-input
            v-model.number="form.cacheTtl"
            type="number"
            label="Cache TTL (seconds, 0 = no cache)"
            dense
            outlined
            class="col-4"
          />
          <q-select
            v-model="form.status"
            :options="[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]"
            label="Status"
            dense
            outlined
            emit-value
            map-options
            class="col-3"
          />
          <q-select
            v-model="form.roles"
            :options="roleOptions"
            label="Visible to Roles (empty = everyone)"
            dense
            outlined
            multiple
            use-chips
            emit-value
            map-options
            option-value="id"
            option-label="rm_role_name"
            class="col-5"
          />
        </div>

        <!-- Test -->
        <q-separator class="q-my-sm" />
        <div class="row items-center q-gutter-sm">
          <q-btn
            outline
            color="primary"
            icon="play_arrow"
            label="Test Run (max 50 rows)"
            no-caps
            :loading="testing"
            @click="testRun"
          />
          <div v-if="testError" class="text-caption text-negative">
            {{ testError }}
          </div>
          <div v-else-if="testResult" class="text-caption text-grey-7">
            {{ testResult.rows.length }} row(s), columns:
            {{ testResult.columns.join(", ") || "—" }}
          </div>
        </div>

        <q-table
          v-if="testResult && testResult.rows.length"
          flat
          bordered
          dense
          :rows="testResult.rows"
          :columns="testColumns"
          row-key="__idx"
          :pagination="{ rowsPerPage: 5 }"
          style="max-height: 260px"
          class="q-mt-sm"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" @click="onDialogCancel" />
        <q-btn
          flat
          label="Save"
          color="primary"
          icon="save"
          :loading="saving"
          :disable="!form.name || !isCodeValid"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar, useDialogPluginComponent } from "quasar";
import apiRequest from "src/components/apiRequest";

const $q = useQuasar();
const { postData } = apiRequest();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const props = defineProps({
  dataset: { type: Object, default: null },
});

const parseJson = (val, fallback) => {
  if (Array.isArray(val)) return val;
  try {
    return JSON.parse(val || "") || fallback;
  } catch {
    return fallback;
  }
};

// cds_headers is stored as { "Header": "value" } — the UI edits key/value rows.
const parseHeaders = (val) => {
  let obj = val;
  if (typeof val === "string") {
    try {
      obj = JSON.parse(val || "{}");
    } catch {
      obj = {};
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: value === null || value === undefined ? "" : String(value),
  }));
};

const form = ref({
  id: props.dataset?.id || null,
  name: props.dataset?.cds_name || "",
  code: props.dataset?.cds_code || "",
  desc: props.dataset?.cds_desc || "",
  type: props.dataset?.cds_type || "sql",
  connection: props.dataset?.cds_connection || "sqlsrv_cms",
  query: props.dataset?.cds_query || "",
  endpoint: props.dataset?.cds_endpoint || "",
  method: props.dataset?.cds_method || "get",
  payload: props.dataset?.cds_payload || "",
  headers: parseHeaders(props.dataset?.cds_headers),
  paramsSchema: parseJson(props.dataset?.cds_params_schema, []),
  cacheTtl: props.dataset?.cds_cache_ttl ?? 300,
  status: props.dataset?.cds_status || "active",
  roles: parseJson(props.dataset?.cds_roles, []).map(String),
});

const isCodeValid = computed(() =>
  /^[a-z0-9][a-z0-9\-_]*$/.test(form.value.code)
);

const addParam = () => {
  form.value.paramsSchema.push({
    name: "",
    label: "",
    type: "string",
    default: "",
  });
};

/* ---------------- lookups ---------------- */

const connectionOptions = ref([]);
const connectionsLoading = ref(false);
const roleOptions = ref([]);

const loadLookups = async () => {
  connectionsLoading.value = true;
  try {
    const res = await postData(
      "get",
      null,
      "cms/datasets/connections",
      false,
      false,
      true
    );
    connectionOptions.value = (res?.data || []).map((c) => {
      if (typeof c === "string") {
        return { label: c, value: c };
      }
      const configured = c.configured !== false;
      return {
        label: configured ? c.name : `${c.name} (not configured)`,
        value: c.name,
        disable: !configured,
      };
    });
  } catch {
    connectionOptions.value = [{ label: "sqlsrv_cms", value: "sqlsrv_cms" }];
  } finally {
    connectionsLoading.value = false;
  }

  try {
    const res = await postData("get", null, "portal/roles", false, false, true);
    roleOptions.value = (res?.data || []).map((r) => ({
      ...r,
      id: String(r.id),
    }));
  } catch {
    roleOptions.value = [];
  }
};

/* ---------------- test ---------------- */

const testing = ref(false);
const testResult = ref(null);
const testError = ref("");

const testColumns = computed(() => {
  if (!testResult.value) return [];
  return testResult.value.columns.map((c) => ({
    name: c,
    label: c,
    field: c,
    align: "left",
  }));
});

const testRun = async () => {
  testing.value = true;
  testResult.value = null;
  testError.value = "";
  try {
    const res = await postData(
      "post",
      {
        type: form.value.type,
        connection: form.value.connection,
        query: form.value.query,
        endpoint: form.value.endpoint,
        method: form.value.method,
        payload: form.value.payload,
        headers: form.value.headers,
        paramsSchema: form.value.paramsSchema,
        params: {},
      },
      "cms/datasets/test",
      false,
      false,
      true
    );
    if (res && res.status !== false) {
      testResult.value = res.data;
    } else {
      testError.value = res?.message || "Test failed";
    }
  } catch {
    testError.value = "Test failed";
  } finally {
    testing.value = false;
  }
};

/* ---------------- save ---------------- */

const saving = ref(false);

const save = async () => {
  saving.value = true;
  try {
    const res = await postData(
      "post",
      {
        idRef: form.value.id,
        name: form.value.name,
        code: form.value.code,
        desc: form.value.desc,
        type: form.value.type,
        connection: form.value.connection,
        query: form.value.query,
        endpoint: form.value.endpoint,
        method: form.value.method,
        payload: form.value.payload,
        headers: form.value.headers,
        paramsSchema: form.value.paramsSchema,
        cacheTtl: form.value.cacheTtl,
        status: form.value.status,
        roles: form.value.roles,
      },
      "cms/datasets",
      false,
      false,
      true
    );
    if (res && res.status !== false) {
      $q.notify({ color: "positive", message: "Dataset saved" });
      onDialogOK(res.data);
    } else {
      $q.notify({ color: "negative", message: res?.message || "Save failed" });
    }
  } finally {
    saving.value = false;
  }
};

onMounted(loadLookups);
</script>
