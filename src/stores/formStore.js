import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({
    userAnswers: [],
    timers: 0,
    startForm: false,
    startTime: null,
  }),

  getters: {
    doubleCount(state) {
      return state.counter * 2;
    },
  },

  actions: {
    increment() {
      this.counter++;
    },
  },
});
