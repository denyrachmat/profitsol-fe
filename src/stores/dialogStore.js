import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    isDialogOpen: false,
    dialogTitle: '',
    dialogBody: null,
    dialogYesButton: 'Ok',
    dialogCancelButton: 'Cancel',
    dialogResult: null
  }),

  getters: {
    doubleCount (state) {
      return state.counter * 2
    }
  },

  actions: {
    toggleDialog () {
      !this.isDialogOpen
    },
    updateContentDialog ({
      title,
      body,
      yesButton,
      cancelButton
    }) {
      this.dialogTitle = title
      this.dialogBody = body
      this.dialogYesButton = yesButton ?? 'Ok'
      this.dialogCancelButton = cancelButton ?? 'Cancel' 
    },
    updateOkResult (result) {
      this.dialogResult = result
    }
  }
})
