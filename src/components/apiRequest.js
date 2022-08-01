import axios from "axios";
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const apiRequest = () => {
  const store = useAuthStore();
  const $q = useQuasar();
  const router = useRouter();

  const data = ref(null);
  const postData = async (
    methods = "get",
    request = null,
    url = "",
    blob = false,
    loading = false,
    auth = false,
    isApi = null
  ) => {
    // Jika menggunakan loading
    if (loading) {
      $q.loading.show({
        spinner: QSpinnerFacebook,
        spinnerColor: "yellow",
        spinnerSize: 140,
        backgroundColor: "purple",
        message: "Some important process is in progress. Hang on...",
        messageColor: "black",
      });
    }

    // Setup Root API
    const apiURL = !isApi ? process.env.API + url : isApi;

    let header = {
      responseType: blob ? "arraybuffer" : "json",
      headers: {
        authorization: `Bearer ${store.authDet.token}`,
        username: store.authDet.username,
        ...(blob
          ? {
              "Content-Type":
                "multipart/form-data; charset=utf-8; boundary=" +
                Math.random().toString().substr(2),
            }
          : null),
      },
    };

    let setupAx = null;
    if (methods === "get") {
      setupAx = axios[methods](apiURL, header);
    } else {
      setupAx = axios[methods](apiURL, request, header);
    }

    // console.log(header);

    let req = setupAx
      .then((res) => {
        if (loading) {
          $q.loading.hide();
        }

        return blob ? res : res.data;
      })
      .catch((e) => {
        if (loading) {
          $q.loading.hide();
        }

        if (e.response) {
          if (e.response.status == 422) {
            // console.log(e.response.data);
            let errors = e.response.data.message;
            if (errors) {
              Object.keys(errors).map((val) => {
                errors[val].map((val_det) => {
                  $q.notify({
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

                $q.notify({
                  color: "negative",
                  message: decodedString,
                });
              } else {
                $q.notify({
                  color: "negative",
                  message: "Undefined error!!",
                });
              }
            }
          }

          if (e.response.status == 401) {
            $q.notify({
              color: "negative",
              message: "You need to login to access this function!",
            });
            localStorage.clear();
            router.push("/login");
          }

          if (e.response.status == 500) {
            $q.notify({
              color: "negative",
              message: e.response.data.message,
              timeout: 10000,
            });
          }
        }
      });

    if (req) {
      return req;
    }
  };

  return {
    data,
    postData,
  };
};

export default apiRequest;
