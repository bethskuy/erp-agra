import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // Menyimpan data profil user
    userAkses: [], // Menyimpan daftar modul: ['konstruksi', 'absensi', 'manufaktur']
    isAuthenticated: false,
  }),

  actions: {
    // Dipanggil saat login berhasil
    setLogin(userData, akses) {
      this.user = userData
      this.userAkses = akses
      this.isAuthenticated = true
    },

    // Dipanggil saat logout
    clearLogin() {
      this.user = null
      this.userAkses = []
      this.isAuthenticated = false
    },
  },

  // Jika kamu ingin data tetap ada saat refresh,
  // pastikan sudah install pinia-plugin-persistedstate
  persist: true,
})
