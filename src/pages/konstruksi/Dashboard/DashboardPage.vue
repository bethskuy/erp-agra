<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- JIKA PUNYA IZIN LIHAT -->
    <template v-if="canAction('lihat')">
      <!-- HEADER SECTION -->
      <div class="row items-end justify-between q-mb-xl animate-fade">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
            Hello, Agra Team
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
              >Dashboard Overview</span
            >
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            <q-icon name="event" color="primary" class="q-mr-xs" />
            Hari ini adalah <span class="text-weight-bold text-blue-grey-9">{{ currentDate }}</span>
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
          <q-btn
            v-if="canActionProyek('buat')"
            color="indigo-10"
            icon="add"
            to="/konstruksi/master/proyek-data"
            label="Mulai Proyek Baru"
            unelevated
            rounded
            no-caps
            class="q-px-lg q-py-sm shadow-premium btn-hover"
          />
        </div>
      </div>

      <!-- QUICK STATS SECTION -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.title">
          <q-card
            flat
            class="stat-card border-subtle transition-all cursor-pointer overflow-hidden"
            @click="$router.push(stat.to)"
          >
            <q-card-section class="row items-center no-wrap q-pa-lg">
              <div class="col">
                <div class="text-overline text-grey-6 tracking-widest leading-none">
                  {{ stat.title }}
                </div>
                <div class="text-h3 text-weight-bolder q-mt-sm text-blue-grey-10">
                  {{ stat.value }}
                </div>
              </div>
              <div
                :class="`bg-${stat.color}-1 q-pa-md rounded-borders shadow-sm`"
                style="min-width: 60px; text-align: center"
              >
                <q-icon :name="stat.icon" :color="stat.color" size="32px" />
              </div>
            </q-card-section>
            <div
              :style="{ background: stat.hex, height: '4px' }"
              class="full-width absolute-bottom"
            ></div>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- LEFT COLUMN: ACTIVE PROJECTS -->
        <div class="col-12 col-lg-8">
          <q-card flat bordered class="rounded-20 shadow-sm bg-white overflow-hidden">
            <q-card-section class="row items-center justify-between q-pa-lg bg-indigo-1">
              <div class="text-h6 text-weight-bold text-indigo-10">Monitoring Progress Proyek</div>
              <q-btn flat round icon="more_vert" color="grey-7" />
            </q-card-section>

            <q-separator />

            <q-list separator>
              <q-item
                v-for="p in activeProjects"
                :key="p.id"
                class="q-py-xl hover-bg transition-all"
              >
                <q-item-section avatar>
                  <q-avatar color="indigo-10" text-color="white" icon="architecture" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold text-subtitle1">{{
                    p.nama_proyek
                  }}</q-item-label>
                  <q-item-label caption class="flex items-center">
                    <q-icon name="place" size="14px" class="q-mr-xs" /> {{ p.lokasi }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side style="min-width: 220px">
                  <div class="full-width">
                    <div class="row items-center justify-between q-mb-xs">
                      <span class="text-caption text-weight-bold text-grey-7"
                        >Status Realisasi</span
                      >
                      <span class="text-caption text-primary text-weight-bolder"
                        >{{ p.progress }}%</span
                      >
                    </div>
                    <q-linear-progress
                      :value="(p.progress || 0) / 100"
                      size="12px"
                      rounded
                      color="primary"
                      track-color="blue-1"
                      class="shadow-sm"
                    >
                      <q-badge
                        color="white"
                        text-color="primary"
                        class="absolute-full flex flex-center"
                        v-if="p.progress >= 100"
                      >
                        SELESAI
                      </q-badge>
                    </q-linear-progress>
                  </div>
                </q-item-section>
              </q-item>

              <q-item v-if="activeProjects.length === 0" class="q-pa-xl">
                <q-item-section class="text-center">
                  <q-icon name="business_center" size="64px" color="grey-3" class="q-mx-auto" />
                  <div class="text-h6 text-grey-5 q-mt-md font-weight-light">
                    Tidak ada proyek aktif saat ini
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- RIGHT COLUMN: RECENT ACTIVITIES -->
        <div class="col-12 col-lg-4">
          <q-card flat bordered class="rounded-20 shadow-sm bg-white fit">
            <q-card-section class="q-pa-lg">
              <div class="text-h6 text-weight-bold text-blue-grey-10">Aktivitas Terkini</div>
              <div class="text-caption text-grey-6">Update operasional lapangan & gudang</div>
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-pa-none">
              <q-list class="q-pb-md">
                <q-item
                  v-for="log in logs"
                  :key="log.id"
                  clickable
                  v-ripple
                  :to="log.to"
                  class="q-py-md"
                >
                  <q-item-section avatar top>
                    <q-avatar
                      :color="`${log.color || 'blue'}-1`"
                      :text-color="log.color || 'primary'"
                      size="40px"
                    >
                      <q-icon :name="log.icon || 'history'" size="20px" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-blue-grey-9">{{
                      log.title
                    }}</q-item-label>
                    <q-item-label caption class="text-grey-7">{{
                      log.description || 'Aktivitas tercatat pada sistem'
                    }}</q-item-label>
                    <q-item-label
                      caption
                      class="q-mt-xs flex items-center text-primary text-weight-medium"
                    >
                      <q-icon name="schedule" size="12px" class="q-mr-xs" />
                      {{ log.time || 'Baru saja' }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side top>
                    <q-icon name="chevron_right" color="grey-4" />
                  </q-item-section>
                </q-item>

                <div v-if="logs.length === 0" class="text-center q-pa-xl">
                  <q-icon name="notifications_none" size="48px" color="grey-3" />
                  <div class="text-body2 text-grey-5 q-mt-sm">Belum ada aktivitas baru</div>
                </div>
              </q-list>
            </q-card-section>

            <q-card-section class="bg-grey-1 text-center q-pa-sm">
              <q-btn
                flat
                no-caps
                label="Lihat Seluruh Log"
                color="primary"
                class="full-width"
                icon-right="arrow_forward"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- TAMPILAN JIKA TIDAK PUNYA IZIN -->
    <template v-else>
      <div class="fixed-center text-center animate-fade">
        <q-avatar size="150px" font-size="80px" color="grey-3" text-color="white" icon="lock" />
        <div class="text-h4 text-weight-bold text-blue-grey-10 q-mt-xl">Akses Terbatas</div>
        <div class="text-subtitle1 text-grey-7 q-mb-xl">
          Akun Anda tidak memiliki otoritas untuk melihat <br />
          dashboard monitoring konstruksi.
        </div>
        <q-btn
          color="indigo-10"
          label="Kembali ke Beranda"
          icon="home"
          to="/"
          rounded
          unelevated
          padding="12px 35px"
        />
      </div>
    </template>

    <!-- FOOTER SPACER -->
    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const userData = ref(null)
const loading = ref(false)
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
    icon: 'domain',
    color: 'primary',
    hex: '#1976D2',
    to: '/konstruksi/master/proyek-data',
  },
  {
    title: 'Stok Kritis',
    value: '0',
    icon: 'warning_amber',
    color: 'red-7',
    hex: '#D32F2F',
    to: '/konstruksi/gudang',
  },
])

const activeProjects = ref([])
const logs = ref([])

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_dashboard'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] : false
}

const canActionProyek = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  const targetId = '_konstruksi_master_proyek-data'
  const menu = modulePerm?.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] : false
}

const fetchData = async () => {
  loading.value = true
  try {
    const projSnap = await getDocs(collection(db, 'proyek'))
    activeProjects.value = projSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    stats.value[0].value = projSnap.size.toString()

    const stokSnap = await getDocs(collection(db, 'stok_barang'))
    const kritis = stokSnap.docs.filter((d) => d.data().jumlah < 10).length
    stats.value[1].value = kritis.toString()

    const logSnap = await getDocs(
      query(collection(db, 'aktivitas'), orderBy('timestamp', 'desc'), limit(5)),
    )
    logs.value = logSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      time: d.data().timestamp
        ? d
            .data()
            .timestamp.toDate()
            .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : 'Baru saja',
      description:
        d.data().tipe === 'MASUK'
          ? `Penerimaan barang: ${d.data().nama_barang}`
          : `Pengeluaran barang: ${d.data().nama_barang}`,
    }))
  } catch (e) {
    console.error('Dashboard Fetch Error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
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
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    Helvetica,
    Arial,
    sans-serif;
}

.rounded-20 {
  border-radius: 20px;
}

.rounded-borders {
  border-radius: 12px;
}

.stat-card {
  border-radius: 20px;
  background: white;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08) !important;
}

.shadow-premium {
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.2);
}

.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.transition-all {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.02);
}

.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
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

.leading-tight {
  line-height: 1.15;
}

.leading-none {
  line-height: 1;
}

.tracking-widest {
  letter-spacing: 0.15em;
}

.block {
  display: block;
}
</style>
