import { defineStore } from "pinia";
import { store } from "quasar/wrappers";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    authDet: [],
    msLoginDet: [],
    msTokenDet: [],
    isLoggedIn: false,
    latestStatusLog: "",
    choosedRoles: null,
    informationList: [],
    choosedDomain: null,
    choosedMenu: null,
    minimizedMenu: [],
    isNotifDone: true,
    isMsChecking: true
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
    getChoosedMenu(state) {
      return state.choosedMenu;
    },
    getMinimizedMenu(state) {
      return state.minimizedMenu;
    },
    getIsNotifDone(state) {
      return state.isNotifDone;
    }
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
    storeChoosedMenu(data) {
      this.choosedMenu = data;
    },
    storeMinimizedMenu(data) {
      // Check if the menu item already exists
      const exists = this.minimizedMenu.some(item => item.am_app_code === data.am_app_code);
      if (exists) {
        // If it exists, remove it first
        this.removeMinimizedMenu(data.am_app_code);
      }

      this.minimizedMenu = [...this.minimizedMenu, data];
    },
    removeMinimizedMenu(data) {
      this.minimizedMenu = this.minimizedMenu.filter(item => item.am_app_code !== data);
    },
    storeIsNotifDone(data) {
      this.isNotifDone = data;
    },
    storeIsMsChecking(data) {
      this.isMsChecking = data;
    }
  },
});
