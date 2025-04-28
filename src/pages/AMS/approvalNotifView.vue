<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col">
        <q-table
          flat
          bordered
          :rows="listData"
          :columns="columns"
          row-key="YSPDT_INVNO"
          color="amber"
          :loading="loading"
          title="Uploaded HS Code"
        >
          <template v-slot:top-right>
            <div class="q-pr-sm">
              <q-btn
                label="Filter Data"
                color="primary"
                flat
                @click="onClickFilter()"
              >
                <q-badge color="red" floating transparent>
                  {{ filter.length }}
                </q-badge>
              </q-btn>
            </div>
            <q-btn
              flat
              icon="send"
              color="primary"
              @click="onClickSend()"
              :disable="
                listData.filter((fil) => !fil.HSCD_APPRVDT).length === 0 ||
                loading
              "
              :loading="loading"
            >
              <q-tooltip>Send All Unapprove HS Code</q-tooltip>
            </q-btn>
          </template>
          <!-- For header -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
              <q-th auto-width>Action</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.value }}
              </q-td>
              <q-td auto-width>
                <q-btn
                  color="orange"
                  flat
                  dense
                  icon="delete"
                  @click="deleteData(props.row.id)"
                >
                  <q-tooltip> Delete </q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>
