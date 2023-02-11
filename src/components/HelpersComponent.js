import { QSpinnerFacebook } from "quasar";
import { useAuthStore } from "stores/authStore";

export const HelpersComponent = {
  setup() {
    const store = useAuthStore();

    return {
      data: "",
      condition: [
        {
          value: "contain",
          label: "Contains",
        },
        {
          value: "equals",
          label: "=",
        },
        {
          value: "range",
          label: "Range",
        },
      ],
      menuChoose: [],
      store,
    };
  },
  created() {
    // this.cekValiditasUserPage(this.$route.path)
  },
  methods: {
    async postData(
      opt,
      request = null,
      blob = false,
      loading = false,
      auth = false,
      isApi = null
    ) {
      if (loading) {
        this.$q.loading.show({
          spinner: QSpinnerFacebook,
          spinnerColor: "yellow",
          spinnerSize: 140,
          backgroundColor: "purple",
          message: "Some important process is in progress. Hang on...",
          messageColor: "black",
        });
      }

      const apiURL = !isApi ? process.env.API + opt.url : isApi;
      if (request) {
        if (blob) {
          if (auth) {
            var header = this.$axios[opt.methods](apiURL, request, {
              responseType: "arraybuffer",
              headers: {
                authorization: `Bearer ${this.store.authDet.token}`,
                username: this.store.authDet.username,
                "Content-Type":
                  "multipart/form-data; charset=utf-8; boundary=" +
                  Math.random().toString().substr(2),
              },
            });
          } else {
            var header = this.$axios[opt.methods](apiURL, request, {
              responseType: "arraybuffer",
              headers: {
                "Content-Type":
                  "multipart/form-data; charset=utf-8; boundary=" +
                  Math.random().toString().substr(2),
              },
            });
          }
        } else {
          if (auth) {
            var header = this.$axios[opt.methods](apiURL, request, {
              headers: {
                authorization: `Bearer ${this.store.authDet.token}`,
                username: this.store.authDet.username,
                Accept: "application/json",
              },
            });
          } else {
            var header = this.$axios[opt.methods](apiURL, request);
          }
        }
      } else {
        if (auth) {
          if (blob) {
            var header = this.$axios[opt.methods](apiURL, {
              responseType: "arraybuffer",
              headers: {
                authorization: `Bearer ${this.store.authDet.token}`,
                username: this.store.authDet.username,
              },
            });
          } else {
            var header = this.$axios[opt.methods](apiURL, {
              headers: {
                authorization: `Bearer ${this.store.authDet.token}`,
                username: this.store.authDet.username,
              },
            });
          }
        } else {
          if (blob) {
            var header = this.$axios[opt.methods](apiURL, {
              responseType: "arraybuffer",
            });
          } else {
            var header = this.$axios[opt.methods](apiURL);
          }
        }
      }

      let req = header
        .then((res) => {
          if (loading) {
            this.$q.loading.hide();
          }
          if (blob) {
            return res;
          } else {
            return res.data;
          }
        })
        .catch((e) => {
          if (loading) {
            this.$q.loading.hide();
          }

          if (e.response) {
            if (e.response.status == 422) {
              // console.log(e.response.data);
              let errors = e.response.data.message;
              if (errors) {
                Object.keys(errors).map((val) => {
                  errors[val].map((val_det) => {
                    this.$q.notify({
                      color: "negative",
                      message: val_det,
                    });
                  });
                });
              } else {
                if (blob) {
                  var decodedString = String.fromCharCode.apply(
                    null,
                    new Uint8Array(e.response.data)
                  );

                  this.$q.notify({
                    color: "negative",
                    message: decodedString,
                  });
                } else {
                  this.$q.notify({
                    color: "negative",
                    message: "Undefined error!!",
                  });
                }
              }
            }

            if (e.response.status == 401) {
              this.$q.notify({
                color: "negative",
                message: "You need to login to access this function!",
              });
              localStorage.clear();
              this.$router.push("/login");
            }
          }
        });

      return req;
    },
    blobParsing(Blob, Filename) {
      Blob.lastModifiedDate = new Date();
      Blob.name = Filename;
      return Blob;
    },
    countDiffTime(start, end) {
      let timeStart = new Date(start).getHours();
      let timeEnd = new Date(end).getHours();

      let hasil = timeEnd - timeStart;

      return hasil < 0 ? hasil * -1 : hasil;
    },
    resetForm() {},
    cekValiditasUserPage(url) {
      if (url == "/home" || url == "/login") {
        console.log("ini home");
      } else {
        let test2 = this.authState.data.parent.filter((x) =>
          x.child.some((y) => "/" + y.MENU_URL == url)
        );

        if (test2.length == 0) {
          this.$router.push("errorauth");
        }
      }
    },
  },
  computed: {
    authState: {
      get() {
        let storage = JSON.parse(localStorage.getItem("PortalLocalDB"));
        if (storage) {
          return storage.AuthStore.authDet;
        } else {
          return null;
        }
      },
    },
    roleState: {
      get() {
        let storage = JSON.parse(localStorage.getItem("PortalLocalDB"));
        if (storage) {
          return storage.AuthStore.authDet.data.role;
        } else {
          return null;
        }
      },
    },
    mainUrl: {
      get() {
        let storage = JSON.parse(localStorage.getItem("PortalLocalDB"));
        if (storage) {
          return storage.AuthStore.MainURL;
        } else {
          return this.$store.state.AuthStore.MainURL;
        }
      },
    },
    mainDomain: {
      get() {
        let storage = JSON.parse(localStorage.getItem("PortalLocalDB"));
        if (storage) {
          return storage.AuthStore.rootDomain;
        } else {
          return this.$store.state.AuthStore.rootDomain;
        }
      },
    },
  },
  // watch: {
  //   '$router.path' (to, from) {
  //     console.log(to);

  //     this.cekValiditasUserPage(to)
  //   }
  // },
};
