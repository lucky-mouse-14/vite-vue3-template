import { defineStore } from 'pinia'

export const useAppStore = defineStore('appStore', {
  state() {
    return {
      appLoading: false,
    }
  },
  actions: {
    setAppLoading(bool) {
      this.appLoading = !!bool
    },
  },
})
