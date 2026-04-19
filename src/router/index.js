import { defineRouter } from '#q-app/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from 'src/stores/auth'
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore'
import routes from './routes'

export default defineRouter(function () {
  const Router = createRouter({
    history: createWebHistory(),
    routes,
  })

  // eslint-disable-next-line no-unused-vars
  Router.beforeEach(async (to, from) => {
    const auth = getAuth()
    const authStore = useAuthStore()
    const db = getFirestore()

    const user = await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (u) => {
        unsub()
        resolve(u)
      })
    })

    // Sinkronisasi Data Karyawan jika store kosong
    if (user && !authStore.user) {
      const q = query(collection(db, 'karyawan'), where('uid', '==', user.uid))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data()
        authStore.setLogin(data, data.akses || [])
      }
    }

    if (to.meta.requiresAuth && !user) return { path: '/login' }
    return true
  })

  return Router
})
