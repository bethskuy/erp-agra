<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-lg font-pro">
    <!-- GREETING SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bold text-blue-grey-10">Admin Dashboard</div>
        <div class="text-subtitle1 text-grey-7">
          Selamat datang kembali,
          <span class="text-weight-bold text-primary">{{
            authStore.user?.nama || 'Administrator'
          }}</span
          >. Pantau aktivitas sistem Anda di sini.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          color="white"
          text-color="blue-grey-9"
          icon="refresh"
          label="Segarkan Data"
          @click="refreshPage"
          class="rounded-borders shadow-1"
        />
      </div>
    </div>

    <!-- STATS CARDS GRID -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.title">
        <q-card flat class="stat-card shadow-sm border-subtle transition-all">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none">{{ stat.title }}</div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-blue-grey-10">
                {{ stat.value }}
              </div>
            </div>
            <div
              :class="`bg-${stat.color}-1 q-pa-md rounded-borders shadow-sm`"
              style="min-width: 64px; text-align: center"
            >
              <q-icon :name="stat.icon" size="32px" :color="stat.color" />
            </div>
          </q-card-section>
          <!-- Indikator loading kecil jika data sedang fetch -->
          <q-inner-loading :showing="loading">
            <q-spinner-dots color="primary" />
          </q-inner-loading>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- RECENT EMPLOYEES LIST -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders shadow-1 bg-white full-height">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6 text-weight-bold text-blue-grey-10">Karyawan Terbaru</div>
            <q-btn
              flat
              dense
              color="primary"
              label="Lihat Semua"
              to="/management-karyawan/database"
              no-caps
            />
          </q-card-section>

          <q-separator inset />

          <q-card-section class="q-pa-none">
            <q-list separator v-if="recentUsers.length > 0">
              <q-item
                v-for="user in recentUsers"
                :key="user.id"
                class="q-py-md hover-bg transition-all cursor-pointer"
                @click="navigateToUser"
              >
                <q-item-section avatar>
                  <q-avatar size="48px" class="shadow-1">
                    <img :src="user.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold text-subtitle1">{{
                    user.nama
                  }}</q-item-label>
                  <q-item-label caption class="flex items-center">
                    <q-icon name="work" size="14px" class="q-mr-xs" /> {{ user.jabatan }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side class="gt-xs">
                  <div class="text-caption text-grey-6">Masuk: {{ formatDate(user.tglMasuk) }}</div>
                </q-item-section>

                <q-item-section side>
                  <q-badge color="blue-1" text-color="primary" class="q-pa-sm text-weight-bold">
                    {{ user.nik || 'N/A' }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="q-pa-xl text-center text-grey-5">
              <q-icon name="group_add" size="64px" />
              <div class="text-h6 q-mt-sm">Belum ada data karyawan</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- SIDEBAR INFO & STATUS -->
      <div class="col-12 col-md-4">
        <!-- INFO SYSTEM CARD -->
        <q-card
          flat
          class="bg-indigo-10 text-white rounded-borders shadow-6 overflow-hidden relative-position"
        >
          <q-card-section class="q-pa-lg">
            <div class="text-h5 text-weight-bold">Status Server</div>
            <div class="text-body2 q-mt-sm opacity-80">
              Sinkronisasi database dengan Cloud Firestore berjalan normal.
            </div>
            <q-btn
              flat
              dense
              label="Bantuan Sistem"
              class="q-mt-md text-white border-white-30 no-caps"
              icon-right="help_outline"
            />
          </q-card-section>
          <q-icon
            name="cloud_done"
            size="120px"
            class="absolute-bottom-right opacity-10 q-mr-n-lg q-mb-n-lg"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, onSnapshot, where } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(true)
const recentUsers = ref([])

// State untuk integrasi modul dari IndexPage
const apps = ref([])
const userData = ref(null)
const currentAkses = ref([])

// Inisialisasi Statis Data (akan diupdate oleh Firestore)
const stats = ref([
  { title: 'Total Karyawan', value: '0', icon: 'groups', color: 'indigo' },
  { title: 'Modul Aktif', value: '0', icon: 'dashboard_customize', color: 'teal' },
  { title: 'Pending Approval', value: '0', icon: 'pending_actions', color: 'orange' },
  { title: 'Karyawan Baru', value: '0', icon: 'person_add', color: 'blue-grey' },
])

let unsubscribers = []

const refreshPage = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const navigateToUser = () => {
  router.push('/management-karyawan/database')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch (error) {
    console.error(error)
    return dateStr
  }
}

// Logika penyaringan akses modul yang sinkron dengan IndexPage.vue
const canShow = (app) => {
  if (!authStore.user) return false
  if (authStore.user.role === 'Super Admin') return true
  if (app.aksesKey === 'admin')
    return authStore.user.role === 'Admin' || authStore.user.role === 'Super Admin'
  return currentAkses.value.includes(app.aksesKey)
}

// Fungsi untuk menghitung modul aktif secara unik & realtime
const updateModulAktifCount = () => {
  const uniqueMap = new Map()
  apps.value.forEach((app) => {
    if (!uniqueMap.has(app.aksesKey)) {
      uniqueMap.set(app.aksesKey, app)
    }
  })
  const uniqueApps = Array.from(uniqueMap.values())
  const allowedApps = uniqueApps.filter((app) => canShow(app))
  stats.value[1].value = allowedApps.length.toString()
}

// Watcher untuk memperbarui nilai counter Modul Aktif saat data Firestore siap
watch(
  [apps, currentAkses],
  () => {
    updateModulAktifCount()
  },
  { deep: true },
)

onMounted(() => {
  loading.value = true

  // 1. Monitor Koleksi Karyawan (Total & Recent)
  const qKaryawan = query(collection(db, 'karyawan'))
  const unsubKaryawan = onSnapshot(
    qKaryawan,
    (snap) => {
      stats.value[0].value = snap.size.toString()

      const allData = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

      // Urutkan berdasarkan tglMasuk terbaru
      recentUsers.value = [...allData]
        .sort((a, b) => (b.tglMasuk || '').localeCompare(a.tglMasuk || ''))
        .slice(0, 5)

      // Hitung karyawan yang baru masuk bulan ini
      const currentMonth = new Date().toISOString().slice(0, 7)
      const newThisMonth = allData.filter(
        (u) => u.tglMasuk && u.tglMasuk.startsWith(currentMonth),
      ).length
      stats.value[3].value = newThisMonth.toString()
    },
    (err) => {
      console.error('Firestore Error Karyawan:', err)
    },
  )
  unsubscribers.push(unsubKaryawan)

  // 2. Monitor Koleksi Modul (Menarik seluruh data mentah modul)
  const qModul = query(collection(db, 'modul'))
  const unsubModul = onSnapshot(
    qModul,
    (snap) => {
      apps.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
    (err) => {
      console.error('Firestore Error Modul:', err)
    },
  )
  unsubscribers.push(unsubModul)

  // 3. Monitor Koleksi Karyawan Aktif untuk Hak Akses Modul
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    const unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        userData.value = data
        currentAkses.value = data.akses || []
      }
    })
    unsubscribers.push(unsubUser)
  }

  // 4. Monitor Koleksi Penawaran (Pending Approval)
  const qApproval = query(collection(db, 'penawaran'), where('status', '==', 'Pending'))
  const unsubApproval = onSnapshot(
    qApproval,
    (snap) => {
      stats.value[2].value = snap.size.toString()
      loading.value = false
    },
    (err) => {
      console.error('Firestore Error Penawaran:', err)
      loading.value = false
    },
  )
  unsubscribers.push(unsubApproval)
})

onUnmounted(() => {
  // Bersihkan semua listener saat meninggalkan halaman
  unsubscribers.forEach((unsub) => unsub())
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    Helvetica,
    Arial,
    sans-serif;
}

.stat-card {
  border-radius: 16px;
  overflow: hidden;
  border-bottom: 4px solid transparent;
  background: white;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
  border-bottom-color: var(--q-primary);
}

.rounded-borders {
  border-radius: 14px;
}

.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.border-white-30 {
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-10 {
  opacity: 0.1;
}

.leading-none {
  line-height: 1;
}

.transition-all {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Penyesuaian Mobile */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.7rem;
  }
}
</style>
