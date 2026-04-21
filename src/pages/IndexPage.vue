<template>
  <q-page class="flex flex-center bg-modern-dashboard q-pa-md overflow-hidden">
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
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" class="q-ml-sm" />
          </template>
        </q-input>
      </div>

      <!-- Apps Grid Section (Odoo Style) -->
      <div class="row q-col-gutter-lg justify-center items-start animate-fade-up">
        <div
          v-for="(app, index) in filteredApps"
          :key="app.id"
          class="col-4 col-sm-3 col-md-2 flex justify-center"
        >
          <!-- Tombol Modul dengan Desain App-Icon -->
          <div
            v-if="canShow(app)"
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
                <q-icon :name="app.icon" :color="app.color || 'primary'" size="44px" />
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
// eslint-disable-next-line no-unused-vars
import { db, auth } from 'src/boot/firebase'
import { collection, onSnapshot, getDocs, writeBatch, doc, query, where } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const apps = ref([])
const searchQuery = ref('')
const userData = ref(null)
const currentAkses = ref([])
let unsubscribeUser = null

// Filter Apps berdasarkan pencarian cerdas
const filteredApps = computed(() => {
  return apps.value.filter(
    (app) => app.name.toLowerCase().includes(searchQuery.value.toLowerCase()) && canShow(app),
  )
})

/**
 * Logika Pengecekan Akses
 */
const canShow = (app) => {
  if (!authStore.user) return false
  if (authStore.user.role === 'Super Admin') return true
  if (app.aksesKey === 'admin')
    return authStore.user.role === 'Admin' || authStore.user.role === 'Super Admin'
  return currentAkses.value.includes(app.aksesKey)
}

/**
 * Inisialisasi Modul Default
 */
const setupDefaultModuls = async () => {
  const querySnapshot = await getDocs(collection(db, 'modul'))
  if (querySnapshot.empty) {
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
    defaultData.forEach((m) => batch.set(doc(collection(db, 'modul')), m))
    await batch.commit()
  }
}

onMounted(async () => {
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
/* Latar Belakang Bersih & Profesional */
.bg-modern-dashboard {
  background: linear-gradient(135deg, #f8fafd 0%, #ffffff 100%);
  min-height: 100vh;
}

/* Logo Styling */
.logo-container {
  width: 140px;
  height: 140px;
  background: white;
  border-radius: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  transition: transform 0.4s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

/* Odoo-style App Icon Card */
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
  filter: brightness(1.05);
}

.app-card-wrapper:active .app-icon-card {
  transform: scale(0.92);
}

/* Warna-warna Lembut Card */
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

/* Tipografi & Gradasi Teks */
.text-gradient {
  background: linear-gradient(135deg, #1976d2, #64b5f6);
  background-clip: text; /* Standard property */
  -webkit-background-clip: text; /* Safari/Webkit property */
  -webkit-text-fill-color: transparent;
}

.tracking-widest {
  letter-spacing: 0.35em;
}
.leading-tight {
  line-height: 1.15;
}

/* Search Bar Odoo Style */
.search-odoo {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.search-odoo:focus-within {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
}

/* Animasi */
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

/* Responsivitas */
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
  .logo-container {
    width: 110px;
    height: 110px;
  }
}

.border-top-subtle {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.shadow-premium {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}
</style>
