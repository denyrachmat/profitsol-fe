import { defineStore } from "pinia";

export const useFormStore = defineStore("form", {
  state: () => ({
    hashForms: "",
    userAnswers: [],
    userAnswersForm: [],
    intervalSetup: null,
    timers: 0,
    startTime: false,
    finishQuiz: false,
    setUpTimer: false,
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
    startFormDate: "",
    endFormDate: "",
    CMSPageChoosed: "",
    isLoadingArticle: false,
    isFrontPageTourDone: false
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
    getHashForm(state) {
      return state.hashForms;
    },
    getStartTimeState(state) {
      return state.startTime;
    },
    getFinishQuizState(state) {
      return state.finishQuiz;
    },
    getStartDateForm(state) {
      return state.startFormDate;
    },
    getEndDateForm(state) {
      return state.endFormDate;
    },
    getSetUpTimer(state) {
      return state.setUpTimer
    },
    getCMSPageChoosed(state) {
      return state.CMSPageChoosed;
    },
    getIsLoadingArticle(state) {
      return parseInt(state.isLoadingArticle);
    },
    getIsFrontPageTourDone(state) {
      return state.isFrontPageTourDone;
    }
  },

  actions: {
    startCountDown() {
      // console.log("masuk timer 1");
      this.startTime = true;
      this.finishQuiz = false;

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
          clearInterval(this.intervalSetup);
          // this.finishQuiz = true;
          // this.startTime = false;
        }
      };

      this.intervalSetup = setInterval(timerFunction, 1000);
    },
    addAnswers(idx, val) {
      this.userAnswers[idx] = val;
    },
    addAnswersForm(rowIdx, colIdx, val) {
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
    hashFormsUpdate(val) {
      this.hashForms = val;
    },
    finishQuizImmediatelly() {
      this.restoreDefault();
      clearInterval(this.intervalSetup);
      this.finishQuiz = true;
    },
    setStartDateForm(date) {
      this.startFormDate = date;
    },
    setEndDateForm(date) {
      this.endFormDate = date;
    },
    setStartTimeState(flag) {
      this.startTime = flag;
    },
    setFinishQuizState(flag) {
      this.finishQuiz = flag;
    },
    setHashForms(hashed) {
      this.hashForms = hashed;
    },
    setSetUpTimer(stateVal) {
      this.setUpTimer = stateVal
    },
    setCMSPageChoosed(page) {
      this.CMSPageChoosed = page;
    },
    setLoadingArticle(stateVal) {
      this.isLoadingArticle = stateVal;
    },
    setFrontPageTourDone(stateVal) {
      this.isFrontPageTourDone = stateVal;
    },
    setUserAnswerAtIndex(index, value) {
      this.userAnswers[index] = value;
    }
  },
  persist: true
});
