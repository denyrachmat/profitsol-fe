import { defineStore } from "pinia";

export const useFormStore = defineStore("form", {
  state: () => ({
    userAnswers: [],
    userAnswersForm: [],
    timers: 0,
    startTime: false,
    timeData: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    timeRunning: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  }),

  getters: {
    getRunningTimers(state) {
      return state.timeRunning;
    },
    getUsersAnswer(state) {
      return state.userAnswers;
    },
    getUsersAnswerForm(state) {
      return state.userAnswersForm;
    },
  },

  actions: {
    startCountDown() {
      // console.log("masuk timer 1");
      this.startTime = true;

      let initSecond =
        parseInt(this.timeData.hours) * 3600 +
        parseInt(this.timeData.minutes) * 60 +
        parseInt(this.timeData.seconds);
      // clearInterval(intTimer);

      const timerFunction = () => {
        initSecond--;
        let seconds = initSecond % 60; // Seconds that cannot be written in minutes
        let secondsInMinutes = (initSecond - seconds) / 60; // Gives the seconds that COULD be given in minutes
        let minutes = secondsInMinutes % 60; // Minutes that cannot be written in hours
        let hours = (secondsInMinutes - minutes) / 60;

        this.timeRunning = {
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        };
        // console.log([this.timeRunning]);

        if (initSecond <= 0) {
          clearInterval(intTimer);
          this.startTime = false;
        }
      };

      const intTimer = setInterval(timerFunction, 1000);
    },
    addAnswers(idx, val) {
      this.userAnswers[idx] = val;
    },
    addAnswersForm(rowIdx, colIdx, val) {
      console.log([rowIdx, colIdx, val]);
      this.userAnswersForm[rowIdx] = {
        ...this.userAnswersForm[rowIdx],
        [colIdx]: val,
      };
    },
    restoreDefault() {
      this.userAnswers = [];
      this.userAnswersForm = [];
      this.timeData = {
        hours: 0,
        minutes: 0,
        seconds: 0,
      };

      this.timeRunning = {
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    },
  },
});
