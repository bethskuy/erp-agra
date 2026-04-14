import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { getAuth, onAuthStateChanged } from 'firebase/auth' //

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // --- BAGIAN SATPAM (ROUTE GUARD) ---
  Router.beforeEach(async (to, from, next) => {
    const auth = getAuth() //

    // Fungsi helper untuk memastikan kita dapat status login terbaru dari Firebase
    const getCurrentUser = () => {
      return new Promise((resolve, reject) => {
        const removeListener = onAuthStateChanged(
          auth,
          (user) => {
            removeListener()
            resolve(user)
          },
          reject,
        )
      })
    } //

    const user = await getCurrentUser() //

    // Cek apakah halaman yang dituju (atau parent-nya) butuh auth
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth) //

    if (requiresAuth && !user) {
      // 1. Jika butuh login tapi user kosong -> Tendang ke Login
      next('/login')
    } else if (to.path === '/login' && user) {
      // 2. Jika sudah login tapi iseng buka halaman login -> Balikin ke Dashboard
      next('/konstruksi/dashboard')
    } else {
      // 3. Sisanya bolehin lewat
      next()
    } //
  })

  return Router
})
