import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from 'src/stores/auth'
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from, next) => {
    const auth = getAuth()
    const authStore = useAuthStore()
    const db = getFirestore()

    const getCurrentUser = () => {
      return new Promise((resolve) => {
        const removeListener = onAuthStateChanged(auth, (user) => {
          removeListener()
          resolve(user)
        })
      })
    }

    const user = await getCurrentUser()
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    // PERBAIKAN: Cari data karyawan berdasarkan field 'uid' di dokumen karyawan
    if (user && authStore.userAkses.length === 0) {
      const q = query(collection(db, 'karyawan'), where('uid', '==', user.uid))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data()
        authStore.setLogin(data, data.akses)
      }
    }

    if (requiresAuth && !user) {
      next('/login')
      return
    }

    if (to.path === '/login' && user) {
      next('/management-karyawan/dashboard')
      return
    }

    const aksesUser = authStore.userAkses || []

    // Proteksi Akses Modul
    if (to.path.includes('/konstruksi') && !aksesUser.includes('konstruksi')) {
      alert('Anda tidak memiliki akses ke modul Konstruksi!')
      next('/management-karyawan/dashboard')
    } else if (to.path.includes('/absensi') && !aksesUser.includes('absensi')) {
      alert('Anda tidak memiliki akses ke modul Absensi!')
      next('/management-karyawan/dashboard')
    } else if (to.path.includes('/manufaktur') && !aksesUser.includes('manufaktur')) {
      alert('Anda tidak memiliki akses ke modul Manufaktur!')
      next('/management-karyawan/dashboard')
    } else {
      next()
    }
  })

  return Router
})
