import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    authDet: [],
    msLoginDet: [],
    msTokenDet: [],
    isLoggedIn: false,
    latestStatusLog: "",
    choosedRoles: null,
    informationList: [],
    choosedDomain: null
  }),
  persist: true,
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
    getChoosedDomain(state) {
      return state.choosedDomain;
    },
    getMSLogDet(state) {
      return state.msLoginDet;
    },
    getMSTokenDet(state) {
      return state.msTokenDet;
    },
    getInformationList(state) {
      return state.informationList;
    },
  },

  actions: {
    storeAuthDet(data) {
      this.authDet = data;
    },
    storeMenu(data) {
      this.authDet.menus = data;
    },
    storeMSLoginDet(data) {
      this.msLoginDet = data;
    },
    storeMSTokenDet(data) {
      this.msTokenDet = data;
    },
    storeChoosedRole(data) {
      this.choosedRoles = data;
    },
    storeInformationList(data) {
      this.informationList = data;
    },
    storeDomain(data) {
      this.choosedDomain = data
    },
    toggleLoggedIn() {
      this.isLoggedIn = !this.isLoggedIn;
    },
    logMessage(log) {
      this.latestStatusLog = log;
    },
    logoutAction() {
      this.authDet = [];
      this.msLoginDet = [];
      this.msTokenDet = [];
      this.isLoggedIn = false;
    },
  },
});
