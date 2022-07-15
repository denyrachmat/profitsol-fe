import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    authDet: [],
    isLoggedIn: false,
    latestStatusLog: "",
  }),

  getters: {
    getDetail(state) {
      return state.authDet;
    },
    getStatusLog(state) {
      return state.isLoggedIn;
    },
    getMsgLog(state) {
      return state.latestStatusLog;
    },
  },

  actions: {
    storeAuthDet(data) {
      this.authDet = data;
    },
    toggleLoggedIn() {
      this.isLoggedIn != this.isLoggedIn;
    },
    logMessage(log) {
      this.latestStatusLog = log;
    },
    logoutAction() {
      this.authDet = [];
      this.toggleLoggedIn();
    },
  },
  persist: true,
});
