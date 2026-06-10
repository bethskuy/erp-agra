<template>
  <q-page class="dashboard-page font-pro">
    <div class="bento-container q-mx-auto">
      <!-- ========================================== -->
      <!-- WELCOME HERO BANNER (PLAYFUL CUTE)         -->
      <!-- ========================================== -->
      <div class="mac-card q-mb-xl animate-fade">
        <div class="mac-header">
          <div class="dots-row">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="mac-title">🌸 SISTEM INTEGRASI AGRA 🌸</div>
        </div>

        <div class="row items-center justify-between q-pa-lg q-pa-md-xl bg-white relative-position">
          <div class="col-12 col-md-9 text-center text-md-left">
            <div class="text-h3 text-weight-bolder text-pink-7 title-fluid line-height-tight leading-tight q-mb-sm">
              ✨ Admin Dashboard ✨
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm text-fluid font-weight-medium">
              Selamat datang kembali,
              <span class="text-weight-bold text-pink-5 font-pro">
                {{ authStore.user?.nama || 'Administrator' }}
              </span>. Mari pantau aktivitas dan kelola karyawan Anda dengan gembira! 🧸💕
            </div>
          </div>

          <div class="col-12 col-md-auto q-mt-lg q-md-mt-none flex justify-center">
            <q-btn
              unelevated
              color="pink-1"
              text-color="pink-7"
              icon="sync"
              label="Segarkan Data 🔄"
              @click="refreshPage"
              class="cute-refresh-btn text-weight-bold q-py-sm q-px-lg transition-all"
            />
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STATS CARDS GRID (COMPACT 2x2 ON MOBILE)   -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.title">
          <q-card
            flat
            class="cute-stat-card transition-all full-height relative-position overflow-hidden"
            :class="`stat-card-${stat.color}`"
          >
            <q-card-section class="q-pa-md row items-center no-wrap">
              <div class="col overflow-hidden">
                <div
                  class="text-overline text-grey-5 leading-none ellipsis text-uppercase tracking-wider font-9 text-weight-bold"
                >
                  {{ stat.title }}
                </div>
                <div
                  class="text-h4 text-weight-bolder q-mt-xs q-mt-sm-sm text-pink-7 number-fluid"
                >
                  {{ stat.value }}
                </div>
              </div>

              <div
                :class="`icon-container icon-container-${stat.color} flex flex-center`"
              >
                <q-icon :name="stat.icon" size="24px" class="icon-fluid" />
              </div>
            </q-card-section>

            <q-inner-loading :showing="loading">
              <q-spinner-dots color="pink-5" />
            </q-inner-loading>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MAIN CONTENT SECTION                       -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg">
        <!-- RECENT EMPLOYEES LIST -->
        <div class="col-12 col-md-8">
          <q-card
            flat
            class="mac-card full-height"
          >
            <div class="mac-header">
              <div class="dots-row">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="mac-title">🧸 Karyawan Terbaru 🧸</div>
            </div>

            <q-card-section class="row items-center justify-between q-pa-lg header-section-light">
              <div class="text-subtitle1 text-weight-bold text-pink-7">Daftar Rekrutan Baru</div>
              <!-- REVISI: Mengarahkan rute "Lihat Semua" ke /karyawan yang valid -->
              <q-btn
                flat
                dense
                color="pink"
                label="Lihat Semua ➡️"
                to="/management-karyawan/karyawan"
                no-caps
                class="text-weight-bold cute-view-btn q-px-md"
              />
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-none">
              <q-list separator v-if="recentUsers.length > 0">
                <q-item
                  v-for="user in recentUsers"
                  :key="user.id"
                  class="q-py-md q-px-md hover-bg transition-all cursor-pointer employee-list-item"
                  @click="navigateToUser"
                >
                  <q-item-section avatar>
                    <q-avatar size="44px" class="shadow-soft cute-avatar-border">
                      <img :src="user.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label
                      class="text-weight-bold text-subtitle2 text-pink-7 text-uppercase"
                    >
                      {{ user.nama }}
                    </q-item-label>
                    <q-item-label caption class="flex items-center text-grey-6 q-mt-xs">
                      <q-icon name="work" size="12px" class="q-mr-xs text-pink-5" />
                      {{ user.jabatan }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side class="gt-xs">
                    <div class="text-caption text-grey-5 font-weight-medium">
                      Masuk: {{ formatDate(user.tglMasuk) }}
                    </div>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge
                      color="pink-1"
                      text-color="pink-7"
                      class="q-pa-sm text-weight-bold font-mono cute-badge"
                    >
                      {{ user.nik || 'N/A' }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="q-pa-xl text-center text-grey-5">
                <q-icon name="group_add" size="64px" class="opacity-50 text-pink-3" />
                <div class="text-h6 q-mt-sm text-pink-4">Belum ada data karyawan</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- SIDEBAR INFO & STATUS -->
        <div class="col-12 col-md-4">
          <q-card
            flat
            class="server-status-card text-white overflow-hidden relative-position full-height flex column justify-between"
            style="min-height: 200px"
          >
            <div class="server-scanline"></div>
            <div class="mac-header-maroon">
              <div class="dots-row">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="mac-title text-pink-2">💻 Server Terminal 💻</div>
            </div>

            <q-card-section class="q-pa-lg z-content">
              <div class="row items-center justify-between no-wrap q-mb-md">
                <div class="text-subtitle2 text-weight-bold text-pink-3">STATUS: SECURE</div>
                <div class="pulse-badge">
                  <span class="pulse-dot"></span>
                  <span class="pulse-text font-mono text-pink-2">ACTIVE</span>
                </div>
              </div>
              
              <div class="console-text font-mono text-left q-mt-md">
                <div v-for="(log, idx) in consoleLogs" :key="idx" class="console-line">
                  <span class="text-pink-3">></span> {{ log }}
                </div>
                <div class="console-line cursor-line">
                  <span class="text-pink-3">></span> <span class="blinking-cursor">▒</span>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pa-lg z-content q-pt-none text-left">
              <q-btn
                outline
                dense
                label="Bantuan Sistem 🧸"
                class="support-btn transition-all text-pink-2"
                icon-right="help_outline"
              />
            </q-card-section>

            <div class="absolute-bottom-right opacity-80 q-mr-n-sm q-mb-n-sm pointer-events-none lottie-glow">
              <Vue3Lottie
                :animation-data="serverSyncAnimation"
                :height="150"
                :width="150"
                loop
                autoplay
              />
            </div>
          </q-card>
        </div>
      </div>
    </div>

    <!-- PLAYFUL MASKOT AGRA-BEAR -->
    <div class="agra-mascot-container" :class="{ 'mascot-wiggle': isMascotWiggling }">
      <!-- Speech Bubble -->
      <transition name="balloon-fade">
        <div v-if="showMessage" class="bear-speech-balloon">
          {{ bearMessage }}
          <div class="balloon-arrow"></div>
        </div>
      </transition>

      <!-- Bear SVG -->
      <div class="bear-svg-wrapper" @click="onMascotClick">
        <svg width="100" height="100" viewBox="50 45 100 100" xmlns="http://www.w3.org/2000/svg">
          <!-- Ears -->
          <circle cx="65" cy="65" r="18" fill="#dbb89a" />
          <circle cx="65" cy="65" r="10" fill="#fecdd3" />
          
          <circle cx="135" cy="65" r="18" fill="#dbb89a" />
          <circle cx="135" cy="65" r="10" fill="#fecdd3" />
          
          <!-- Head -->
          <ellipse cx="100" cy="100" rx="45" ry="40" fill="#dbb89a" />
          
          <!-- Rosy Cheeks -->
          <ellipse cx="72" cy="104" rx="7" ry="4" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="128" cy="104" rx="7" ry="4" fill="#f43f5e" opacity="0.4" />
          
          <!-- Snout -->
          <ellipse cx="100" cy="110" rx="16" ry="11" fill="#ffffff" />
          
          <!-- Nose & Mouth -->
          <path d="M 96 112 Q 100 116 104 112" stroke="#5c3d2e" stroke-width="2" fill="none" />
          <ellipse cx="100" cy="106" rx="6" ry="4" fill="#5c3d2e" />
          
          <!-- Eyes Groups with Blinking animation -->
          <g class="bear-eye-group left-eye">
            <circle cx="82" cy="95" r="8" fill="#ffffff" />
            <circle :cx="82 + pupilX" :cy="95 + pupilY" r="4.5" fill="#374151" class="bear-pupil" />
            <circle :cx="80.5 + pupilX" :cy="93.5 + pupilY" r="1.5" fill="#ffffff" class="bear-pupil" />
          </g>
          <g class="bear-eye-group right-eye">
            <circle cx="118" cy="95" r="8" fill="#ffffff" />
            <circle :cx="118 + pupilX" :cy="95 + pupilY" r="4.5" fill="#374151" class="bear-pupil" />
            <circle :cx="116.5 + pupilX" :cy="93.5 + pupilY" r="1.5" fill="#ffffff" class="bear-pupil" />
          </g>
        </svg>
      </div>

      <!-- Particle Burst Container -->
      <div v-for="p in particles" :key="p.id" class="particle" :style="p.style">
        {{ p.symbol }}
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
import { Vue3Lottie } from 'vue3-lottie'
import serverSyncAnimation from 'src/assets/animations/approval.json'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(true)
const recentUsers = ref([])

// Mascot Interactive State & Functions
const pupilX = ref(0)
const pupilY = ref(0)
const isMascotWiggling = ref(false)
const showMessage = ref(true)
const bearMessage = ref('Semangat kerjanya ya! 🧸💕')
const particles = ref([])
let messageTimeout = null

const bearMessages = [
  'Semangat kerjanya ya! 🧸💕',
  'Ada yang bisa kubantu? 🌸',
  'Agra ERP siap melayani! ✨',
  'Jangan lupa minum air! 🥤',
  'Hari yang luar biasa! 🌈',
  'Karyawan Agra rajin-rajin ya! 🥰',
  'Kamu luar biasa hari ini! ⭐',
  'Tetap tersenyum dan ceria! 🧁',
  'Meong? Eh, aku kan beruang! 🧸',
  'Kerja cerdas, kerja ikhlas! 🧠',
]

const handleMouseMove = (e) => {
  const mascotX = window.innerWidth - 80
  const mascotY = window.innerHeight - 80
  
  const dx = e.clientX - mascotX
  const dy = e.clientY - mascotY
  const angle = Math.atan2(dy, dx)
  const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 40, 3.5)
  
  pupilX.value = Math.cos(angle) * distance
  pupilY.value = Math.sin(angle) * distance
}

const onMascotClick = () => {
  if (isMascotWiggling.value) return
  isMascotWiggling.value = true
  
  const oldMsg = bearMessage.value
  let newMsg = oldMsg
  while (newMsg === oldMsg) {
    newMsg = bearMessages[Math.floor(Math.random() * bearMessages.length)]
  }
  bearMessage.value = newMsg
  showMessage.value = true
  
  if (messageTimeout) clearTimeout(messageTimeout)
  
  spawnParticles()

  setTimeout(() => {
    isMascotWiggling.value = false
  }, 1000)
}

const spawnParticles = () => {
  const pCount = 12
  const newParticles = []
  const baseId = Date.now()
  for (let i = 0; i < pCount; i++) {
    const angle = (i / pCount) * 2 * Math.PI + (Math.random() * 0.4 - 0.2)
    const distance = 50 + Math.random() * 50
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance - 20
    const scale = 0.6 + Math.random() * 0.8
    const duration = 0.8 + Math.random() * 0.6
    
    const emojis = ['❤️', '💖', '✨', '🌸', '🧸', '⭐']
    const symbol = emojis[Math.floor(Math.random() * emojis.length)]

    newParticles.push({
      id: `${baseId}-${i}`,
      symbol,
      style: {
        '--tx': `${x}px`,
        '--ty': `${y}px`,
        '--scale': scale,
        'animation-duration': `${duration}s`
      }
    })
  }
  
  particles.value = [...particles.value, ...newParticles]
  
  setTimeout(() => {
    particles.value = particles.value.filter(p => !newParticles.find(np => np.id === p.id))
  }, 1500)
}

const consoleLogs = ref([
  'INITIALIZING AGRA PROTOCOL...',
  'CLOUD FIRESTORE SYNC: ONLINE',
  'DATABASE INTEGRITY: 100% OK',
  'CUTE SYSTEM ACTIVE: YES 🧸'
])
let terminalLogTimer = null

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

// REVISI: Mengarahkan klik karyawan ke /karyawan yang valid
const navigateToUser = () => {
  router.push('/management-karyawan/karyawan')
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
      const allData = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

      // REVISI EMAS: Filter hanya karyawan yang memiliki data nama valid (menghindari sisa data sampah/kosong di Firestore)
      const activeKaryawan = allData.filter((u) => u.nama && u.nama.trim() !== '')

      stats.value[0].value = activeKaryawan.length.toString()

      // Urutkan berdasarkan tglMasuk terbaru dari data karyawan yang valid
      recentUsers.value = [...activeKaryawan]
        .sort((a, b) => (b.tglMasuk || '').localeCompare(a.tglMasuk || ''))
        .slice(0, 5)

      // Hitung karyawan yang baru masuk bulan ini dari data yang valid
      const currentMonth = new Date().toISOString().slice(0, 7)
      const newThisMonth = activeKaryawan.filter(
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

  const cuteLogPool = [
    'COMPILING SWEETNESS MODULES...',
    'GRADIENT PROTOCOLS ENGAGED 🌸',
    'EMISSION LEVEL: 100% HAPPINESS 🍭',
    'CACHE POLISHED WITH SUGAR 🧁',
    'HELLO REFQI! HAVE A CUTE DAY! 💕',
    'DATA STREAM: STABLY YUMMY 🍩',
    'SECURE COOKIE HANDSHAKE: SUCCESS 🍪',
    'SYNCING CLOUD PROTOCOLS...',
    'RENDERING PINK INTERFACE... 🎀',
    'VUE REACTIVITY: FULLY CUTE 🐱',
    'BEAR OVERLOAD INDEX: NORMAL 🧸',
    'HEARTBEAT OK: BLINK BLINK Blink 💓',
    'CLEANING DUST FROM TERMINAL... 🧹',
    'FIRESTORE RESPONDED IN 4ms ✨'
  ]

  terminalLogTimer = setInterval(() => {
    const randomMsg = cuteLogPool[Math.floor(Math.random() * cuteLogPool.length)]
    consoleLogs.value.push(randomMsg)
    if (consoleLogs.value.length > 5) {
      consoleLogs.value.shift()
    }
  }, 4000)

  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  // Bersihkan semua listener saat meninggalkan halaman
  unsubscribers.forEach((unsub) => unsub())
  if (terminalLogTimer) clearInterval(terminalLogTimer)
  window.removeEventListener('mousemove', handleMouseMove)
  if (messageTimeout) clearTimeout(messageTimeout)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Fira+Code:wght@300..700&display=swap');

.font-pro {
  font-family:
    'Fredoka',
    'Inter',
    -apple-system,
    sans-serif;
}

.dashboard-page {
  padding: 16px;
  background-color: #ffe4e6; /* Cute pastel rose pink background */
  background-image: 
    radial-gradient(#ffd1dc 2px, transparent 2px), 
    radial-gradient(#ffd1dc 2px, transparent 2px);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
  position: relative;
  overflow: hidden;
}

@media (min-width: 600px) {
  .dashboard-page {
    padding: 24px;
  }
}

@media (min-width: 1200px) {
  .dashboard-page {
    padding: 32px 40px;
  }
}

.bento-container {
  max-width: 1400px;
  position: relative;
  z-index: 1;
}

/* =======================================================================
   MAC WINDOW SHELL CARDS
   ======================================================================= */
.mac-card {
  background: #ffffff;
  border: 3px solid #ffb7c5;
  border-radius: 24px;
  box-shadow: 0 10px 0px #fecdd3, 0 16px 30px rgba(225, 29, 72, 0.08) !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.mac-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 0px #fecdd3, 0 20px 35px rgba(225, 29, 72, 0.12) !important;
}

.mac-header {
  background: #fff0f2;
  border-bottom: 3px solid #ffb7c5;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  position: relative;
}

.dots-row {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  border: 1.5px solid transparent;
}
.dot.red { background-color: #ff5f56; border-color: #e0443e; }
.dot.yellow { background-color: #ffbd2e; border-color: #dea123; }
.dot.green { background-color: #27c93f; border-color: #1aab29; }

.mac-title {
  width: 100%;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: #db2777;
}

.cute-refresh-btn {
  background-color: #fff1f2 !important;
  border: 2.5px solid #fda4af !important;
  border-radius: 50px !important;
  color: #db2777 !important;
  box-shadow: 0 4px 0px #fecdd3 !important;
  transition: all 0.2s ease;
}

.cute-refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0px #fecdd3 !important;
  background-color: #ffe4e6 !important;
}

.cute-refresh-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0px #fecdd3 !important;
}

/* =======================================================================
   CUTE STATS CARDS
   ======================================================================= */
.cute-stat-card {
  background: #ffffff;
  border: 3px solid #ffb7c5;
  border-radius: 20px;
  box-shadow: 0 6px 0px #fecdd3 !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.cute-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 0px #fecdd3 !important;
}

.icon-container {
  border-radius: 14px;
  width: 48px;
  height: 48px;
  border: 2px solid transparent;
}

.icon-container-indigo { background: #e0e7ff !important; color: #3f51b5 !important; border-color: #c7d2fe; }
.icon-container-teal { background: #e6fffa !important; color: #009688 !important; border-color: #b2f5ea; }
.icon-container-orange { background: #fffbeb !important; color: #d97706 !important; border-color: #fde68a; }
.icon-container-blue-grey { background: #f1f5f9 !important; color: #475569 !important; border-color: #cbd5e1; }

/* =======================================================================
   BENTO MAIN WORKSPACE
   ======================================================================= */
.header-section-light {
  background: linear-gradient(180deg, #fdfdfd 0%, #fafafa 100%);
  border-bottom: 3px solid #ffb7c5;
}

.cute-view-btn {
  border-radius: 50px;
  font-size: 13px;
  background-color: #fff1f2;
  border: 2.5px solid #fda4af;
  color: #e11d48 !important;
}

.cute-view-btn:hover {
  background-color: #ffe4e6;
  color: #db2777 !important;
}

.employee-list-item {
  border-bottom: 1px solid #ffe4e6;
  margin: 4px 8px;
  border-radius: 12px;
}

.employee-list-item:hover {
  background-color: rgba(219, 39, 119, 0.04) !important;
  transform: translateX(4px);
}

.cute-avatar-border {
  border: 3.5px solid #ffb7c5;
}

.cute-badge {
  border: 2px solid #fda4af;
  border-radius: 8px !important;
}

/* =======================================================================
   SERVER STATUS CYBER CARD (MAROON THEME)
   ======================================================================= */
.server-status-card {
  border: 3px solid #ffb7c5;
  border-radius: 24px !important;
  background: #4c0519 !important; /* Dark maroon/pink terminal background */
  box-shadow: 0 10px 0px #fecdd3, 0 16px 30px rgba(225, 29, 72, 0.15) !important;
}

.mac-header-maroon {
  background: #5c0b24;
  border-bottom: 3px solid #ffb7c5;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  position: relative;
}

.console-text {
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  line-height: 1.8;
  color: #fecdd3;
  background: rgba(0, 0, 0, 0.25);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.blinking-cursor {
  animation: blink-cursor-glow 1s step-end infinite;
  color: #fecdd3;
  font-weight: bold;
}

@keyframes blink-cursor-glow {
  from, to { color: transparent }
  50% { color: #fecdd3; }
}

.pulse-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(244, 63, 94, 0.15);
  border: 1.5px solid rgba(244, 63, 94, 0.3);
  border-radius: 20px;
  gap: 6px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #f43f5e;
  border-radius: 50%;
  animation: pulse-glow-rose 1.8s infinite ease-in-out;
}

@keyframes pulse-glow-rose {
  0% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.6);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 6px rgba(244, 63, 94, 0);
  }
  100% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(244, 63, 94, 0);
  }
}

.pulse-text {
  font-size: 9px;
  font-weight: 900;
  color: #fda4af;
  letter-spacing: 1px;
}

.support-btn {
  border-radius: 50px !important;
  font-size: 12px;
  border: 2px solid #fda4af !important;
  background: rgba(255, 255, 255, 0.08);
}

.support-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.lottie-glow {
  filter: drop-shadow(0 0 15px rgba(244, 63, 94, 0.35));
}

/* =======================================================================
   RESPONSIVE LAYOUT ADJUSTMENTS FOR SMALL DEVICES
   ======================================================================= */
@media (max-width: 599px) {
  .title-fluid {
    font-size: 1.8rem !important;
    line-height: 1.1;
  }
  .text-fluid {
    font-size: 13px !important;
  }
  .font-9 {
    font-size: 9px !important;
  }
  .number-fluid {
    font-size: 1.6rem !important;
  }
  .icon-container {
    min-width: 44px !important;
    max-width: 44px !important;
    height: 44px !important;
    padding: 8px !important;
  }
  .icon-fluid {
    font-size: 18px !important;
  }
  .welcome-banner-card {
    border-radius: 16px;
  }
  .mac-card, .server-status-card {
    border-radius: 16px !important;
  }
}

/* =======================================================================
   RETRO CRT SCANLINE EFFECT
   ======================================================================= */
.z-content {
  position: relative;
  z-index: 3;
}

.server-status-card::before {
  content: " ";
  display: block;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%);
  background-size: 100% 4px;
  z-index: 1;
  pointer-events: none;
}

.server-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(244, 63, 94, 0) 0%,
    rgba(244, 63, 94, 0.08) 10%,
    rgba(244, 63, 94, 0.15) 15%,
    rgba(244, 63, 94, 0.08) 20%,
    rgba(244, 63, 94, 0) 30%
  );
  z-index: 2;
  pointer-events: none;
  animation: scanline-move 8s linear infinite;
}

@keyframes scanline-move {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* =======================================================================
   AGRA-BEAR PLAYFUL MASCOT STYLES
   ======================================================================= */
.agra-mascot-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
}

.bear-svg-wrapper {
  width: 90px;
  height: 90px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.bear-svg-wrapper:hover {
  transform: translateY(-5px) scale(1.05);
}

/* Wiggle animation when mascot is clicked */
.mascot-wiggle .bear-svg-wrapper {
  animation: mascot-bounce-wiggle 1s ease-in-out;
}

@keyframes mascot-bounce-wiggle {
  0% { transform: scale(1) translateY(0); }
  15% { transform: scale(1.2, 0.8) translateY(0); }
  30% { transform: scale(0.8, 1.2) translateY(-15px) rotate(-10deg); }
  50% { transform: scale(1.1, 0.9) translateY(0) rotate(10deg); }
  70% { transform: scale(0.95, 1.05) translateY(-5px) rotate(-5deg); }
  85% { transform: scale(1.05, 0.95) translateY(0) rotate(5deg); }
  100% { transform: scale(1) translateY(0) rotate(0); }
}

/* Blinking eyes */
.bear-eye-group {
  animation: bear-blink 6s infinite;
}
.left-eye {
  transform-origin: 82px 95px;
}
.right-eye {
  transform-origin: 118px 95px;
}
@keyframes bear-blink {
  0%, 96%, 100% {
    transform: scaleY(1);
  }
  98% {
    transform: scaleY(0.05);
  }
}

/* Speech Balloon Styling */
.bear-speech-balloon {
  background: white;
  color: #e11d48;
  border: 3px solid #ffb7c5;
  padding: 10px 14px;
  border-radius: 18px;
  font-family: 'Fredoka', sans-serif;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  box-shadow: 0 6px 0px #fecdd3, 0 8px 20px rgba(225, 29, 72, 0.1);
  position: relative;
  max-width: 180px;
  word-wrap: break-word;
  animation: balloon-wiggle 4s infinite ease-in-out;
}

.balloon-arrow {
  position: absolute;
  bottom: -9px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #ffb7c5;
}

.balloon-arrow::after {
  content: '';
  position: absolute;
  top: -11px;
  left: -6px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
}

@keyframes balloon-wiggle {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-4px) rotate(1deg); }
}

.balloon-fade-enter-active, .balloon-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.balloon-fade-enter-from, .balloon-fade-leave-to {
  transform: scale(0.7) translateY(10px);
  opacity: 0;
}

/* Canvas-less CSS bursts */
.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  font-size: 20px;
  pointer-events: none;
  z-index: 10000;
  animation: particle-fly ease-out forwards;
}

@keyframes particle-fly {
  0% {
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale));
    opacity: 0;
  }
}
</style>
