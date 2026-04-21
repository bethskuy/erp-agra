<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <!-- JIKA PUNYA IZIN LIHAT -->
    <template v-if="canAction('lihat')">
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bolder text-indigo-10">
            Hello, Agra Team
            <span class="text-h5 text-weight-light text-grey-7">| Project Overview</span>
          </div>
          <div class="text-subtitle1 text-grey-6">
            Hari ini adalah <span class="text-weight-bold">{{ currentDate }}</span
            >. Monitoring terpusat untuk efisiensi konstruksi Anda.
          </div>
        </div>
        <div class="col-12 col-md-3 text-right">
          <!-- Tombol Proyek Baru: Hanya muncul jika punya izin 'buat' di Data Proyek -->
          <q-btn
            v-if="canActionProyek('buat')"
            color="indigo-10"
            icon="add"
            to="/konstruksi/master/proyek-data"
            label="Proyek Baru"
            unelevated
            no-caps
            class="q-px-md q-py-sm rounded-borders shadow-2"
          />
        </div>
      </div>

      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.title">
          <q-card
            flat
            class="stat-card shadow-sm cursor-pointer"
            :style="{ borderLeft: `6px solid ${stat.hex}` }"
            @click="$router.push(stat.to)"
          >
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="text-caption text-grey-6 text-uppercase">{{ stat.title }}</div>
                <div class="text-h4 text-weight-bold q-mt-sm">{{ stat.value }}</div>
              </div>
              <q-icon :name="stat.icon" :color="stat.color" size="2rem" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-8">
          <q-card flat bordered class="rounded-borders">
            <q-card-section>
              <div class="text-h6 text-weight-bold">Progress Proyek Aktif</div>
            </q-card-section>
            <q-list separator>
              <q-item v-for="p in activeProjects" :key="p.id" class="q-py-md">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ p.nama_proyek }}</q-item-label>
                  <q-item-label caption>{{ p.lokasi }}</q-item-label>
                </q-item-section>
                <q-item-section side style="width: 150px">
                  <q-linear-progress
                    :value="(p.progress || 0) / 100"
                    size="10px"
                    rounded
                    color="primary"
                  />
                  <div class="text-caption q-mt-xs">{{ p.progress }}% Selesai</div>
                </q-item-section>
              </q-item>
              <q-item v-if="activeProjects.length === 0">
                <q-item-section class="text-center text-grey-5 italic"
                  >Tidak ada proyek aktif</q-item-section
                >
              </q-item>
            </q-list>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered class="rounded-borders fit">
            <q-card-section>
              <div class="text-h6 text-weight-bold">Aktivitas Terkini</div>
            </q-card-section>
            <q-list separator>
              <q-item v-for="log in logs" :key="log.id" clickable v-ripple :to="log.to">
                <q-item-section avatar
                  ><q-icon :name="log.icon" :color="log.color"
                /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ log.title }}</q-item-label>
                  <q-item-label caption>{{ log.time }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="logs.length === 0">
                <q-item-section class="text-center text-grey-5 italic"
                  >Belum ada aktivitas</q-item-section
                >
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </template>

    <!-- TAMPILAN JIKA TIDAK PUNYA IZIN -->
    <template v-else>
      <div class="fixed-center text-center">
        <q-icon name="lock_person" size="100px" color="grey-4" />
        <div class="text-h4 text-weight-bold text-grey-5 q-mt-md">Akses Terbatas</div>
        <div class="text-subtitle1 text-grey-6 q-mb-xl">
          Anda tidak memiliki izin untuk melihat Dashboard Konstruksi.
        </div>
        <q-btn color="primary" label="Kembali ke Beranda" icon="home" to="/" rounded unelevated />
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const userData = ref(null)
let unsubscribeUser = null

const currentDate = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const stats = ref([
  {
    title: 'Proyek Aktif',
    value: '0',
    icon: 'business',
    color: 'primary',
    hex: '#1976D2',
    to: '/konstruksi/master/proyek-data',
  },
  {
    title: 'Stok Kritis',
    value: '0',
    icon: 'warning',
    color: 'red',
    hex: '#F44336',
    to: '/konstruksi/gudang',
  },
])

const activeProjects = ref([])
const logs = ref([])

/**
 * LOGIKA SATPAM DASHBOARD: Mengecek izin 'lihat'
 * ID Target: _konstruksi_dashboard
 */
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false

  const targetId = '_konstruksi_dashboard'
  const menu = modulePerm.menus.find((m) => m.id === targetId)

  return menu ? menu[actionType] : false
}

/**
 * SATPAM TAMBAHAN: Untuk tombol Proyek Baru
 * Mengecek izin 'buat' di menu Data Proyek
 */
const canActionProyek = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  const targetId = '_konstruksi_master_proyek-data'
  const menu = modulePerm?.menus.find((m) => m.id === targetId)

  return menu ? menu[actionType] : false
}

const fetchData = async () => {
  try {
    // 1. Fetch Proyek
    const projSnap = await getDocs(collection(db, 'proyek'))
    activeProjects.value = projSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    stats.value[0].value = projSnap.size.toString()

    // 2. Fetch Stok Kritis
    const stokSnap = await getDocs(collection(db, 'stok_barang'))
    const kritis = stokSnap.docs.filter((d) => d.data().jumlah < 10).length
    stats.value[1].value = kritis.toString()

    // 3. Fetch Log Aktivitas
    const logSnap = await getDocs(
      query(collection(db, 'aktivitas'), orderBy('timestamp', 'desc'), limit(5)),
    )
    logs.value = logSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Dashboard Fetch Error:', e)
  }
}

onMounted(() => {
  // Pantau Hak Akses User Real-time
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
      }
    })
  }

  fetchData()
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.stat-card {
  border-radius: 16px;
  transition: 0.3s;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
