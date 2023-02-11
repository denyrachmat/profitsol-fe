<template>
  <div class="q-pa-md">
    <q-list class="bg-white">
      <template v-if="viewList.length > 0">
        <template v-for="(event, idx) in viewList" :key="idx">
          <q-item>
            <q-item-section>
              <q-item-label
                ><strong>{{ event.subject }}</strong></q-item-label
              >
              <q-item-label caption lines="1">
                <div class="q-pa-md q-gutter-sm" style="height: 80px">
                  <q-avatar
                    v-for="(att, n) in event.attendees.slice(0, 5)"
                    :key="n"
                    size="38px"
                    class="overlapping"
                    color="primary"
                    text-color="white"
                    :style="`left: ${n * 25}px`"
                  >
                    {{ att.emailAddress.name[0] }}
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      {{ att.emailAddress.name }}
                    </q-tooltip>
                  </q-avatar>
                  <span
                    v-if="event.attendees.length > 5"
                    class="overlapping text-h6"
                    :style="`left: ${5 * 28}px`"
                    >And +{{ event.attendees.length - 5 }} Others</span
                  >
                </div>
              </q-item-label>
            </q-item-section>

            <q-item-section side top class="relative-position">
              <q-item-label caption>{{
                convertDate(event.start.dateTime)
              }}</q-item-label>
            </q-item-section>
            <q-item-section side class="relative-position">
              <q-btn
                icon="visibility"
                outline
                round
                dense
                color="green"
                @click="clickView(event)"
              />
            </q-item-section>
          </q-item>

          <q-separator spaced inset />
        </template>
      </template>

      <q-item v-else>
        <q-item-label class="text-center">
          <strong>No new Meeting</strong>
        </q-item-label>
      </q-item>
    </q-list>

    <q-dialog v-model="viewDetail">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ choosedData.subject }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-html="choosedData.body.content"></div>
          <q-list>
            <q-item-label header>Participant</q-item-label>

            <q-item v-for="(attDet, idx2) in choosedData.attendees" :key="idx2">
              <q-item-section avatar>
                <q-icon color="primary" name="person" />
              </q-item-section>
              <q-item-section>{{ attDet.emailAddress.name }}</q-item-section>
              <q-item-section side>
                <q-item-label caption>{{
                  attDet.emailAddress.address
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup>
import { ref, defineProps, computed } from "vue";
import { date } from "quasar";

const props = defineProps({
  events: Array,
  // ...your custom props
});

const viewDetail = ref(false);
const choosedData = ref(null);

const viewList = computed(() => {
  return props.events && props.events.length > 0
    ? props.events.filter((val) =>
        listNowTill7Days().includes(
          date.formatDate(new Date(val.start.dateTime), "YYYYMMDD")
        )
      )
    : [];
});

const clickView = (val) => {
  choosedData.value = val;
  viewDetail.value = !viewDetail.value;
};

const listNowTill7Days = () => {
  const hasil = [];
  for (let index = -7; index < 13; index++) {
    hasil.push(
      date.formatDate(
        date.addToDate(new Date(), { days: index + 1 }),
        "YYYYMMDD"
      )
    );
  }

  return hasil;
};

const convertDate = (dt) => {
  return dt ? date.formatDate(new Date(dt), "D MMM YYYY") : "";
};
</script>
<style lang="sass" scoped>
.overlapping
  border: 2px solid white
  position: absolute
</style>
