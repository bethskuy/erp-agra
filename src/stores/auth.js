import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userAkses: [],
  }),
  actions: {
    setLogin(userData, akses) {
      this.user = userData
      this.userAkses = akses || []
    },
    clearLogin() {
      this.user = null
      this.userAkses = []
      localStorage.removeItem('auth')
    },
  },
  persist: {
    storage: localStorage,
    paths: ['user', 'userAkses'],
  },
})
