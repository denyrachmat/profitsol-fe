import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    authDet: [],
    msLoginDet: [],
    isLoggedIn: false,
    latestStatusLog: "",
    choosedRoles: null,
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
    getChoosedRole(state) {
      return state.choosedRoles;
    },
  },

  actions: {
    storeAuthDet(data) {
      this.authDet = data;
    },
    storeMSLoginDet(data) {
      this.msLoginDet = data;
    },
    storeChoosedRole(data) {
      this.choosedRoles = data;
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
