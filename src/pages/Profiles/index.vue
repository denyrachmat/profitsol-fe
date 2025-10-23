<template>
  <div class="q-gutter-md q-pa-md bg-grey-2">
    <div class="row q-py-md">
      <div class="col text-center">
        <b class="text-h4">Profiles</b>
      </div>
    </div>
    <!-- Photo Profile -->
    <div class="row q-py-md">
      <div class="col" style="position: relative; min-height: 150px">
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          :duration="200"
          v-if="!changePhoto"
        >
          <q-avatar
            size="150px"
            v-if="!changePhoto"
            @mouseenter="onHoverPhoto(true)"
            position="absolute"
            style="left: 50%; transform: translateX(-50%); z-index: 1"
          >
            <img
              :src="store.getDetail.user_det.pud_photo"
              style="object-fit: cover"
            />
          </q-avatar>
          <q-btn
            round
            size="50px"
            position="absolute"
            style="left: 50%; transform: translateX(-50%); z-index: 99"
            @mouseleave="onHoverPhoto(false)"
            v-else
          >
            <q-avatar
              size="150px"
              font-size="52px"
              color="teal"
              text-color="white"
              icon="refresh"
            />
          </q-btn>
        </transition>
        <!-- <template v-if="!changePhoto">
          <q-avatar
            size="150px"
            v-if="form.pud_photo"
            @mouseenter="onHoverPhoto(true)"
            position="absolute"
            style="left: 50%; transform: translateX(-50%); z-index: 1"
            color="teal"
            text-color="white"
            font-size="150px"
          >
            <img :src="form.pud_photo" style="object-fit: cover" />
          </q-avatar>
          <q-avatar
            size="150px"
            v-else
            @mouseenter="onHoverPhoto(true)"
            position="absolute"
            icon="account_circle"
            style="left: 50%; transform: translateX(-50%); z-index: 1"
            color="teal"
            text-color="white"
            font-size="150px"
          />
        </template> -->
        <div v-else>
          <q-btn
            round
            size="50px"
            position="absolute"
            style="left: 50%; transform: translateX(-50%); z-index: 99"
            @mouseleave="onHoverPhoto(false)"
            @click="changePhotoClick()"
          >
            <q-avatar size="150px" color="teal" text-color="white">
              <q-icon name="refresh" size="100px"></q-icon>
              <p style="font-size: 12px"><b>Change Photo</b></p>
            </q-avatar>
          </q-btn>
        </div>
      </div>
    </div>
    <q-separator />

    <q-card bordered>
      <q-card-section>
        <!-- Personal Data -->
        <div class="row">
          <div class="col q-px-sm">
            <q-input
              dense
              outlined
              v-model="form.pud_first_name"
              label="First Name *"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
            />
          </div>
          <div class="col q-px-sm">
            <q-input
              dense
              outlined
              v-model="form.pud_last_name"
              label="Last Name *"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
            />
          </div>
        </div>
        <div class="row">
          <div class="col q-px-sm">
            <q-input
              dense
              outlined
              v-model="form.pud_birth_place"
              label="Birth Place"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
            />
          </div>
          <div class="col q-px-sm">
            <q-input
              dense
              outlined
              v-model="form.pud_birth_date"
              mask="date"
              :rules="['date']"
              label="Birth Date"
              lazy-rules
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="form.pud_birth_date">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
        <div class="row">
          <div class="col q-px-sm">
            <q-input
              outlined
              v-model="form.pud_phone"
              label="Phone Number"
              lazy-rules
              mask="(+##) ###-####-####"
              hint="(+##) ###-####-####"
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
              dense
            />
          </div>
        </div>

        <!-- ID Number -->
        <div class="row">
          <div class="col-px-sm">
            <div class="q-gutter-sm">
              <div><b>ID Type</b></div>
              <q-radio
                keep-color
                v-model="form.pud_id_type"
                val="nationality"
                label="Nationality ID"
                color="teal"
              />
              <q-radio
                keep-color
                v-model="form.pud_id_type"
                val="driving"
                label="Driving ID"
                color="orange"
              />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col q-px-sm">
            <q-input
              outlined
              v-model="form.pud_id_card"
              label="ID Number"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
              dense
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Identification Detail -->
    <q-separator />
    <q-card bordered>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-px-sm col-sm-6">
            <div class="row q-py-md">
              <div class="col">
                <div class="text-h5"><b>ID Address</b></div>
              </div>
            </div>
            <div class="row q-py-md">
              <div class="col">
                <q-btn icon="place" color="cyan" no-caps @click="viewMaps('id')"
                  >Find place on Maps</q-btn
                >
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_country"
                  label="Country"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_states"
                  label="State / Province"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_cities"
                  label="City"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_district"
                  label="District"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_subdistrict"
                  label="Sub-District"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_addr1"
                  label="Detail Locations"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
          </div>
          <div class="col-12 q-px-sm col-sm-6">
            <div class="row q-py-md">
              <div class="col">
                <div class="text-h5"><b>Current Address</b></div>
              </div>
            </div>
            <div class="row q-py-md">
              <div class="col">
                <q-btn-group>
                  <q-btn
                    icon="content_copy"
                    color="orange"
                    no-caps
                    @click="isSameAddr()"
                    >Same address as your ID</q-btn
                  >
                  <q-btn
                    icon="place"
                    color="cyan"
                    no-caps
                    @click="viewMaps('curr')"
                    >Find place on Maps</q-btn
                  >
                </q-btn-group>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_country_rsdn"
                  label="Country"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_states_rsdn"
                  label="State / Province"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_cities_rsdn"
                  label="City"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_district_rsdn"
                  label="District"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_subdistrict_rsdn"
                  label="Sub-District"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-input
                  outlined
                  v-model="form.pud_addr1_rsdn"
                  label="Detail Locations"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                  dense
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-separator />
    <div class="row q-py-md">
      <div class="col-10 text-h4"><b>Educations Detail</b></div>
      <div class="col-2 text-right">
        <q-btn icon="add" color="cyan" no-caps @click="addEdu()"
          >Add more data</q-btn
        >
      </div>
    </div>
    <div class="row" v-if="educations.length === 0">
      <div class="col q-pa-md text-center"><b>No data found</b></div>
    </div>
    <div v-else class="q-gutter-md">
      <q-card v-for="(edu, idx) in educations" :key="idx" bordered>
        <q-card-section>
          <div class="row">
            <div class="col">
              <q-select
                outlined
                v-model="edu.pusd_level"
                :options="schoolOpt"
                label="School Level"
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-6">
              <q-input
                outlined
                v-model="edu.pusd_sch_name"
                label="School Name"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                dense
              />
            </div>
            <div class="col-1 text-right">
              <q-btn
                round
                color="red"
                icon="clear"
                outline
                @click="removeEdu(idx)"
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-input
                outlined
                v-model="edu.pusd_sch_majors"
                label="School Major"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                dense
              />
            </div>
            <div class="col">
              <q-input
                outlined
                v-model="edu.pusd_sch_minors"
                label="School Minor"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                dense
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-input
                outlined
                v-model="edu.pusd_sch_end"
                mask="####-##-##"
                label="Graduate Date"
                dense
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="edu.pusd_sch_end" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col">
              <q-input
                outlined
                v-model="edu.pusd_grade"
                label="Grade"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-separator />
    <div class="row q-pt-md">
      <div class="col-10 text-h4"><b>Families Detail</b></div>
      <div class="col-2 text-right">
        <q-btn icon="add" color="cyan" no-caps @click="addFam()"
          >Add more data</q-btn
        >
      </div>
    </div>
    <div class="row" v-if="families.length === 0">
      <div class="col q-pa-md text-center">
        <b>No data found</b>
      </div>
    </div>
    <div v-else class="q-gutter-md">
      <q-card v-for="(family, idx) in families" :key="idx" bordered>
        <q-card-section>
          <div class="row">
            <div class="col">
              <q-input
                outlined
                v-model="family.pufd_first_name"
                label="First Name"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                dense
              />
            </div>
            <div class="col">
              <q-input
                outlined
                v-model="family.pufd_last_name"
                label="Last Name"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                dense
              />
            </div>
            <div class="col-1 text-right">
              <q-btn
                round
                color="red"
                icon="clear"
                outline
                @click="removeFam(idx)"
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-select
                outlined
                v-model="family.pufd_relation"
                :options="relationOpt"
                label="Relation"
                dense
                emit-value
                map-options
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />
            </div>
            <div class="col">
              <q-input
                outlined
                v-model="family.pufd_phone"
                label="Phone Number"
                lazy-rules
                mask="(+##) ###-####-####"
                hint="(+##) ###-####-####"
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
                dense
              />
            </div>
            <div class="col">
              <q-input
                outlined
                v-model="family.pufd_birthday"
                mask="date"
                :rules="['date']"
                label="Birth Date"
                lazy-rules
                dense
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="family.pufd_birthday">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { defineComponent, ref, watch } from "vue";
import { useAuthStore } from "stores/authStore";
import _ from "lodash";

import { HelpersComponent } from "src/components/HelpersComponent";

import MapView from "../../components/mapView/index.vue";
import UploadPhoto from "../../components/uploadPhoto/index.vue";

const educationTemp = {
  pusd_level: "",
  pusd_sch_name: "",
  pusd_sch_majors: "",
  pusd_sch_minors: "",
  pusd_sch_addr: "",
  pusd_sch_start: "",
  pusd_sch_end: "",
  pusd_grade: "",
  pusd_sch_passed: "",
};

const familiesTemp = {
  pufd_first_name: "",
  pufd_last_name: "",
  pufd_relation: "",
  pufd_phone: "",
  pufd_birthday: "",
};

export default defineComponent({
  name: "Profiles",
  components: { MapView },
  mixins: [HelpersComponent],
  setup() {
    const store = useAuthStore();
    const form = ref({
      pud_first_name: "",
      pud_last_name: "",
      pud_id_card: "",
      pud_photo: "",
      pud_phone: "",
      pud_country: "",
      pud_states: "",
      pud_cities: "",
      pud_district: "",
      pud_subdistrict: "",
      pud_addr1: "",
      pud_addr2: "",
      pud_id_type: "nationality",
      pud_birth_place: "",
      pud_birth_date: "",
      pud_country_rsdn: "",
      pud_states_rsdn: "",
      pud_cities_rsdn: "",
      pud_district_rsdn: "",
      pud_subdistrict_rsdn: "",
      pud_addr1_rsdn: "",
      pud_addr2_rsdn: "",
    });

    const educations = ref([]);
    const families = ref([]);

    // watch(
    //   () => JSON.stringify(form.value),
    //   _.debounce((newVal) => {
    //     this.updateProfile();
    //     console.log("berubah loh", newVal);
    //   }, 5000)
    // );

    return {
      store,
      form,
      educations,
      families,
      changePhoto: ref(false),
      schoolOpt: ref([
        {
          label: "High School",
          value: "1",
        },
        {
          label: "Associate / Diploma Degree",
          value: "2",
        },
        {
          label: "Bachelor Degree",
          value: "3",
        },
        {
          label: "Master Degree",
          value: "4",
        },
        {
          label: "Doctor Degree",
          value: "5",
        },
      ]),
      relationOpt: ref([
        {
          label: "Father",
          value: "father",
        },
        {
          label: "Mother",
          value: "mother",
        },
        {
          label: "Brother",
          value: "brother",
        },
        {
          label: "Sister",
          value: "sister",
        },
        {
          label: "Uncle",
          value: "uncle",
        },
        {
          label: "Aunt",
          value: "aunt",
        },
        {
          label: "Cousin",
          value: "cousin",
        },
        {
          label: "Grand Father",
          value: "grand_father",
        },
        {
          label: "Grand Mother",
          value: "grand_mother",
        },
        {
          label: "Husband",
          value: "husband",
        },
        {
          label: "Wife",
          value: "wife",
        },
        {
          label: "Son",
          value: "son",
        },
        {
          label: "Daughter",
          value: "daughter",
        },
      ]),
    };
  },
  created() {
    this.form = this.store.getDetail.user_det;
    this.educations = this.store.getDetail.edu;
    this.families = this.store.getDetail.fam;
  },
  methods: {
    onHoverPhoto(state) {
      this.changePhoto = state;
    },
    viewMaps(sts) {
      this.$q
        .dialog({
          component: MapView,
          componentProps: {
            title: "Select Location",
          },
        })
        .onOk((val) => {
          if (sts === "id") {
            this.form.pud_country = val.country;
            this.form.pud_states = val.state;
            this.form.pud_cities = val.city;
            this.form.pud_district = val.distric;
            this.form.pud_subdistrict = val.subDistrict;
            this.form.pud_addr2 = JSON.stringify(val.latLng.value);
          } else {
            this.form.pud_country_rsdn = val.country;
            this.form.pud_states_rsdn = val.state;
            this.form.pud_cities_rsdn = val.city;
            this.form.pud_district_rsdn = val.distric;
            this.form.pud_subdistrict_rsdn = val.subDistrict;
            this.form.pud_addr2_rsdn = JSON.stringify(val.latLng.value);
          }
          console.log(val);
        })
        .onCancel(() => {
          console.log("Cancel");
        });
    },
    isSameAddr() {
      this.$q
        .dialog({
          title: "Confirm",
          message:
            "Are you sure want to copy ID Address to your current Address ?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.form.pud_country_rsdn = this.form.pud_country;
          this.form.pud_states_rsdn = this.form.pud_states;
          this.form.pud_cities_rsdn = this.form.pud_cities;
          this.form.pud_district_rsdn = this.form.pud_district;
          this.form.pud_subdistrict_rsdn = this.form.pud_subdistrict;
          this.form.pud_addr1_rsdn = this.form.pud_addr1;
          this.form.pud_addr2_rsdn = this.form.pud_addr2;
          // console.log('>>>> OK')
        });
    },
    addEdu() {
      this.educations.push(educationTemp);
    },
    removeEdu(idx) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure want to delete this item ?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.educations.splice(idx, 1);
        });
    },
    removeFam(idx) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure want to delete this item ?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.families.splice(idx, 1);
        });
    },
    addFam() {
      this.families.push(familiesTemp);
    },
    changePhotoClick() {
      this.$q
        .dialog({
          component: UploadPhoto,

          // props forwarded to your custom component
          componentProps: {
            title: "Select Photo Profile",
            // ...more..props...
          },
        })
        .onOk((val) => {
          this.form.pud_photo = val.result;
          console.log(val);
        });
    },
    async updateProfile() {
      const data = await this.postData(
        {
          url: `portal/profiles/${btoa(this.store.authDet.username)}`,
          methods: "patch",
        },
        {
          form: this.form,
          educations: this.educations,
          families: this.families,
        },
        false,
        false,
        true
      );

      if (data) {
        console.log(data);
      }
    },
  },
  watch: {
    form: {
      handler: _.debounce(function (newVal) {
        this.updateProfile();
        console.log("berubah loh", newVal);

        // const data = _.debounce(() => {
        //   this.updateProfile();
        //   console.log("berubah loh", newVal);
        // }, 3000);

        // data();
      }, 3000),
      deep: true,
    },
  },
});
</script>
