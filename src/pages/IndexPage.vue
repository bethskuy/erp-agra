<template>
  <q-page
    class="flex flex-center bg-modern-dashboard q-pa-md overflow-hidden"
    :class="{ 'theme-dark': isDarkMode }"
  >
    <div class="theme-toggle-wrap">
      <q-btn
        unelevated
        rounded
        no-caps
        class="theme-toggle"
        :icon="isDarkMode ? 'light_mode' : 'dark_mode'"
        :label="isDarkMode ? 'Mode Terang' : 'Mode Gelap'"
        @click="toggleTheme"
      />
    </div>

    <!-- Konten Utama -->
    <div class="full-width container-modern" style="max-width: 1000px">
      <!-- Header Section: Logo & Greeting -->
      <div class="text-center q-mb-xl animate-fade-down">
        <div class="logo-wrapper q-mb-md">
          <div class="logo-container shadow-premium">
            <q-img src="icons/logo-agra.png" style="width: 110px; height: 110px" class="logo-img" />
          </div>
        </div>
        <div
          class="text-overline text-primary text-weight-bolder tracking-widest text-uppercase q-mb-xs"
        >
          Agra Abhinaya Perkasa
        </div>
        <div class="q-mt-sm">
          <div class="text-h3 text-weight-bolder text-blue-grey-10 leading-tight">
            Selamat Datang,
            <span class="text-gradient">{{ userData?.nama || authStore.user?.nama || 'User' }}</span
            >!
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-md flex flex-center items-center">
            <q-icon name="admin_panel_settings" color="primary" size="xs" class="q-mr-xs" />
            Jabatan:
            <q-badge
              color="blue-1"
              text-color="primary"
              class="q-ml-sm q-px-md q-py-xs text-weight-bold shadow-sm"
            >
              {{ userData?.jabatan || authStore.user?.role || 'Staff' }}
            </q-badge>
          </div>
        </div>
      </div>

      <!-- Search Section -->
      <div class="row justify-center q-mb-xl animate-fade-up">
        <q-input
          v-model="searchQuery"
          outlined
          rounded
          placeholder="Cari modul aplikasi..."
          class="full-width search-odoo"
          style="max-width: 500px"
          :bg-color="isDarkMode ? 'transparent' : 'white'"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" class="q-ml-sm" />
          </template>
        </q-input>
      </div>

      <!-- Apps Grid Section -->
      <div class="row q-col-gutter-lg justify-center items-start animate-fade-up">
        <div
          v-for="(app, index) in filteredApps"
          :key="app.aksesKey"
          class="col-4 col-sm-3 col-md-2 flex justify-center"
        >
          <!-- Tombol Modul -->
          <div
            class="app-container full-width"
            @click="$router.push(app.path)"
            :style="{ '--delay': index * 0.05 + 's' }"
          >
            <div class="app-card-wrapper column items-center">
              <q-card
                flat
                class="app-icon-card flex flex-center transition-all cursor-pointer"
                :class="`bg-light-${app.bgColor || 'blue'}`"
              >
                <Vue3Lottie
                  v-if="isManufactureApp(app)"
                  :animation-data="manufactureAnimation"
                  :height="64"
                  :width="64"
                  loop
                  autoplay
                />
                <q-icon v-else :name="app.icon" :color="app.color || 'primary'" size="44px" />
              </q-card>
              <div class="text-center q-mt-sm">
                <div
                  class="text-weight-bold text-blue-grey-10 text-caption text-uppercase tracking-wide"
                >
                  {{ app.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredApps.length === 0" class="text-center q-pa-xl empty-state animate-fade">
        <q-icon name="apps_outage" size="64px" color="grey-3" />
        <div class="text-h6 text-grey-5 q-mt-md font-weight-light">Modul tidak ditemukan</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Vue3Lottie } from 'vue3-lottie'
import manufactureAnimation from '../assets/animations/icon-manufactur.json'
import { db } from 'src/boot/firebase'
import { collection, onSnapshot, getDocs, writeBatch, doc, query, where } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const apps = ref([])
const searchQuery = ref('')
const userData = ref(null)
const currentAkses = ref([])
const isDarkMode = ref(false)
let unsubscribeUser = null

const isManufactureApp = (app) => app.name?.toUpperCase() === 'MANUFACTURE'
const themeStorageKey = 'index-page-theme'

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem(themeStorageKey, isDarkMode.value ? 'dark' : 'light')
}

// Filter Apps agar unik (berdasarkan aksesKey) dan sesuai hak akses
const filteredApps = computed(() => {
  // Langkah 1: Hilangkan duplikasi dari data mentah database
  const uniqueMap = new Map()
  apps.value.forEach((app) => {
    if (!uniqueMap.has(app.aksesKey)) {
      uniqueMap.set(app.aksesKey, app)
    }
  })

  const uniqueApps = Array.from(uniqueMap.values())

  // Langkah 2: Filter berdasarkan pencarian dan ijin akses
  return uniqueApps.filter(
    (app) => app.name.toLowerCase().includes(searchQuery.value.toLowerCase()) && canShow(app),
  )
})

const canShow = (app) => {
  if (!authStore.user) return false
  if (authStore.user.role === 'Super Admin') return true
  if (app.aksesKey === 'admin')
    return authStore.user.role === 'Admin' || authStore.user.role === 'Super Admin'
  return currentAkses.value.includes(app.aksesKey)
}

/**
 * Perbaikan: Menggunakan SetDoc dengan ID unik agar tidak duplikat
 */
const setupDefaultModuls = async () => {
  const querySnapshot = await getDocs(collection(db, 'modul'))

  // Jika database masih kosong atau kurang dari 4, jalankan inisialisasi cerdas
  if (querySnapshot.size < 4) {
    const batch = writeBatch(db)
    const defaultData = [
      {
        name: 'Konstruksi',
        icon: 'engineering',
        color: 'blue-10',
        bgColor: 'blue-1',
        path: '/konstruksi/dashboard',
        aksesKey: 'konstruksi',
      },
      {
        name: 'Absensi',
        icon: 'badge',
        color: 'green-10',
        bgColor: 'green-1',
        path: '/absensi/dashboard',
        aksesKey: 'absensi',
      },
      {
        name: 'Manufacture',
        icon: 'factory',
        color: 'teal-10',
        bgColor: 'teal-1',
        path: '/manufaktur/dashboard',
        aksesKey: 'manufaktur',
      },
      {
        name: 'Management Karyawan',
        icon: 'people',
        color: 'purple-10',
        bgColor: 'purple-1',
        path: '/management-karyawan/dashboard',
        aksesKey: 'admin',
      },
    ]

    // Gunakan aksesKey sebagai ID Dokumen agar tidak pernah duplikat (Upsert)
    defaultData.forEach((m) => {
      const docRef = doc(db, 'modul', `modul_${m.aksesKey}`)
      batch.set(docRef, m)
    })

    await batch.commit()
  }
}

onMounted(async () => {
  isDarkMode.value = localStorage.getItem(themeStorageKey) === 'dark'
  await setupDefaultModuls()

  onSnapshot(collection(db, 'modul'), (snapshot) => {
    apps.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })

  const userEmail = authStore.user?.email
  if (userEmail) {
    const q = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        userData.value = data
        currentAkses.value = data.akses || []
      }
    })
  }
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
})
</script>

<style scoped>
.bg-modern-dashboard {
  background: linear-gradient(135deg, #f8fafd 0%, #ffffff 100%);
  min-height: 100vh;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}
.theme-toggle-wrap {
  position: absolute;
  top: 18px;
  right: 24px;
  z-index: 2;
}
.theme-toggle {
  min-height: 38px;
  padding: 0 16px;
  color: #0f766e;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.1);
}
.theme-toggle :deep(.q-icon) {
  font-size: 18px;
}
.theme-toggle :deep(.q-btn__content) {
  gap: 8px;
}
.container-modern {
  position: relative;
}
.logo-container {
  width: 140px;
  height: 140px;
  background: white;
  border-radius: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
.app-icon-card {
  width: 90px;
  height: 90px;
  border-radius: 22px;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.app-container {
  animation: appAppear 0.5s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
}
.app-card-wrapper:hover .app-icon-card {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}
.bg-light-blue-1 {
  background-color: #f0f7ff !important;
}
.bg-light-green-1 {
  background-color: #f2faf3 !important;
}
.bg-light-teal-1 {
  background-color: #f0fdfa !important;
}
.bg-light-purple-1 {
  background-color: #faf5ff !important;
}

.text-gradient {
  background: linear-gradient(135deg, #1976d2, #64b5f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.tracking-widest {
  letter-spacing: 0.35em;
}
.leading-tight {
  line-height: 1.15;
}
.search-odoo {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}
.bg-modern-dashboard.theme-dark {
  color: #f8fafc;
  background:
    radial-gradient(circle at 82% 14%, rgba(59, 130, 246, 0.16), transparent 28%),
    linear-gradient(135deg, #05070a 0%, #0b1120 52%, #111827 100%);
  background-color: #05070a;
}
.theme-dark .theme-toggle {
  color: #f8fafc;
  background: rgba(8, 47, 73, 0.78);
  box-shadow: 0 12px 28px rgba(2, 12, 18, 0.28);
}
.theme-dark .logo-container {
  background: rgba(255, 255, 255, 0.94);
}
.theme-dark .text-overline {
  color: #99f6e4 !important;
}
.theme-dark .text-blue-grey-10 {
  color: #f8fafc !important;
}
.theme-dark .text-grey-7 {
  color: rgba(226, 232, 240, 0.76) !important;
}
.theme-dark :deep(.q-badge) {
  color: #ccfbf1 !important;
  background: rgba(13, 148, 136, 0.2) !important;
}
.theme-dark :deep(.q-field__control) {
  color: #f8fafc;
  background: rgba(15, 23, 42, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.18);
}
.theme-dark :deep(.q-field__native),
.theme-dark :deep(.q-field__prepend .q-icon) {
  color: #f8fafc !important;
}
.theme-dark :deep(.q-field__native::placeholder) {
  color: rgba(226, 232, 240, 0.58) !important;
}
.theme-dark .app-icon-card {
  background: rgba(15, 23, 42, 0.74) !important;
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 18px 36px rgba(2, 12, 18, 0.24);
}
.theme-dark .bg-light-blue-1,
.theme-dark .bg-light-green-1,
.theme-dark .bg-light-teal-1,
.theme-dark .bg-light-purple-1 {
  background-color: rgba(15, 23, 42, 0.74) !important;
}
@keyframes appAppear {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-fade-down {
  animation: fadeDown 0.8s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.8s ease-out;
}
@keyframes fadeDown {
  from {
    transform: translateY(-40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes fadeUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@media (max-width: 600px) {
  .text-h3 {
    font-size: 2rem;
  }
  .app-icon-card {
    width: 75px;
    height: 75px;
    border-radius: 18px;
  }
  .q-icon {
    font-size: 36px !important;
  }
}
.shadow-premium {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}
</style>
