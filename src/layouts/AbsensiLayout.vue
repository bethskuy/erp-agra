<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <q-header borderless class="neo-header text-white shadow-2">
      <q-toolbar class="q-py-xs">
        <!-- Mac Dots on Header (Left) - Hidden on extra small screen -->
        <div class="gt-xs q-mr-md flex items-center" style="gap: 6px;">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>

        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bolder">
          <div class="row items-center no-wrap text-h6 text-md-h5">
            <span class="q-mr-xs tracking-tighter">AGRA</span>
            <span class="text-weight-light text-blue-2">ERP</span>
            <q-badge color="positive" class="q-ml-sm text-weight-bold shadow-2"> ABSENSI </q-badge>
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn flat round icon="apps" class="q-mr-xs">
          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
            :offset="[0, 10]"
            class="app-launcher-menu shadow-10"
          >
            <div class="q-pa-md bg-white" style="width: 340px; border-radius: 12px">
              <div
                class="text-subtitle2 q-px-sm q-pb-md text-grey-7 text-weight-bold tracking-widest text-uppercase"
              >
                Modul Agra ERP
              </div>

              <div class="row q-col-gutter-sm">
                <template v-for="app in filteredApps" :key="app.aksesKey">
                  <div class="col-4 flex flex-center">
                    <q-btn
                      flat
                      stack
                      class="full-width app-btn q-pa-sm"
                      :class="{ 'active-app': app.aksesKey === 'absensi' }"
                      no-caps
                      :to="app.path"
                    >
                      <q-icon :name="app.icon" :color="app.color" size="38px" class="q-mb-xs" />
                      <div class="app-label text-center text-blue-grey-10">
                        {{ app.name }}
                      </div>
                    </q-btn>
                  </div>
                </template>
              </div>

              <q-separator class="q-my-md" />

              <q-btn
                outline
                rounded
                color="primary"
                icon="home"
                label="Kembali ke Menu Utama"
                class="full-width text-weight-bold q-py-sm"
                no-caps
                to="/"
              />
            </div>
          </q-menu>
        </q-btn>

        <q-avatar size="32px" color="white" text-color="blue-9" class="text-weight-bold shadow-1">
          <img v-if="userData.fotoUrl" :src="userData.fotoUrl" />
          <span v-else>{{
            userData.nama ? userData.nama.substring(0, 1).toUpperCase() : 'A'
          }}</span>
        </q-avatar>
      </q-toolbar>
    </q-header>

    <!-- Lebar drawer kembali seimbang dan pas di 272px sesuai ManufakturLayout -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="272"
      class="sidebar-drawer neo-drawer text-grey-9"
    >
      <div class="column fit">
        <!-- Profile Section Card wrapper -->
        <div class="q-pa-md profile-box">
          <div class="neo-profile-card q-pa-md">
            <div class="row items-center q-gutter-sm no-wrap">
              <q-avatar size="44px" color="blue-9" text-color="white" class="neo-avatar relative-position">
                <img v-if="userData.fotoUrl" :src="userData.fotoUrl" style="object-fit: cover;" />
                <span v-else>{{
                  userData.nama ? userData.nama.substring(0, 1).toUpperCase() : 'A'
                }}</span>
                <span class="profile-pulse-dot"></span>
              </q-avatar>
              <div class="col overflow-hidden">
                <div class="text-weight-bold text-subtitle2 text-grey-9 ellipsis leading-tight">
                  {{ userData.nama || 'User' }}
                  <q-tooltip class="bg-blue-grey-9">{{ userData.nama || 'User' }}</q-tooltip>
                </div>
                <div class="text-caption text-blue-9 text-weight-bolder ellipsis flex items-center q-mt-xs">
                  <span class="q-mr-xs">💼</span> {{ isSuperAdmin ? 'SUPER ADMIN' : userData.jabatan || userData.role || 'Karyawan' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-scroll-area class="col sidebar-scroll">
          <q-list class="menu-list">
          <q-item-label header class="section-title">MENU UTAMA</q-item-label>

          <template v-for="menu in menuListFiltered" :key="menu.label">
            <!-- Submenu Collapsible using q-expansion-item -->
            <q-expansion-item
              v-if="menu.children && menu.children.length > 0"
              :icon="menu.icon"
              :label="menu.label"
              header-class="nav-group"
              expand-icon-class="nav-expand-icon"
              default-opened
            >
              <q-list>
                <q-item
                  v-for="sub in menu.children"
                  :key="sub.path"
                  clickable
                  v-ripple
                  :to="sub.path"
                  class="submenu-item"
                  active-class="active-menu"
                >
                  <q-item-section avatar class="submenu-icon">
                    <q-icon :name="sub.icon" size="xs" />
                  </q-item-section>
                  <q-item-section class="submenu-text">{{ sub.label }}</q-item-section>
                  <q-item-section side v-if="sub.path === '/absensi/admin/persetujuan-harian-lepas' && pendingHarianLepasCount > 0">
                    <q-badge
                      color="orange-9"
                      rounded
                      :label="pendingHarianLepasCount"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- Standard flat menu item -->
            <q-item
              v-else
              clickable
              v-ripple
              :to="menu.path"
              class="menu-item nav-item"
              active-class="active-menu"
            >
              <q-item-section avatar class="menu-icon">
                <q-icon :name="menu.icon" />
              </q-item-section>
              <q-item-section class="menu-text">{{ menu.label }}</q-item-section>

              <!-- Badge Notifikasi Cuti -->
              <q-item-section side v-if="menu.path === '/absensi/admin/persetujuan' && pendingCutiCount > 0">
                <q-badge color="red" rounded :label="pendingCutiCount" />
              </q-item-section>

              <!-- Badge Notifikasi Izin/Sakit/Manual -->
              <q-item-section side v-if="menu.path === '/absensi/admin/persetujuan-izin' && pendingIzinCount > 0">
                <q-badge color="orange-9" rounded :label="pendingIzinCount" />
              </q-item-section>
            </q-item>
          </template>

          <div v-if="menuListFiltered.length === 0" class="text-center q-pa-lg">
            <q-icon name="lock_person" color="grey-4" size="48px" />
            <div class="text-grey-6 text-caption q-mt-sm">Akses Menu Dibatasi</div>
            <q-btn
              flat
              color="primary"
              label="Refresh Izin"
              size="sm"
              class="q-mt-sm"
              @click="syncData"
            />
          </div>

          <q-separator class="sidebar-separator" />
          <q-item clickable v-ripple @click="handleLogout" class="menu-item nav-item text-negative">
            <q-item-section avatar class="menu-icon"><q-icon name="logout" /></q-item-section>
            <q-item-section class="menu-text">Keluar Sistem</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </div>
  </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { db, auth } from 'src/boot/firebase'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(false)

const userData = ref({ nama: '', jabatan: '', role: '', fotoUrl: '', email: '', akses: [] })
const userPermissions = ref([])

// State Notifikasi Real-time
const pendingList = ref([])
let unsubscribePending = null

const pendingHarianLepas = ref([])
let unsubscribePendingHarianLepas = null

const availableApps = [
  {
    name: 'Manufacture',
    icon: 'factory',
    color: 'green-9',
    path: '/manufaktur/dashboard',
    aksesKey: 'manufaktur',
  },
  {
    name: 'Absensi',
    icon: 'badge',
    color: 'green-9',
    path: '/absensi/dashboard',
    aksesKey: 'absensi',
  },
  {
    name: 'Modul Aset',
    icon: 'inventory_2',
    color: 'deep-orange-9',
    path: '/aset/dashboard',
    aksesKey: 'aset',
  },
  {
    name: 'Konstruksi',
    icon: 'engineering',
    color: 'indigo-10',
    path: '/konstruksi/dashboard',
    aksesKey: 'konstruksi',
  },
  {
    name: 'Management Karyawan',
    icon: 'groups',
    color: 'deep-purple-9',
    path: '/management-karyawan/dashboard',
    aksesKey: 'admin',
  },
]

const isSuperAdmin = computed(() => {
  const email = userData.value.email ? userData.value.email.toLowerCase() : ''
  const role = userData.value.role ? userData.value.role.toLowerCase() : ''
  const jabatan = userData.value.jabatan ? userData.value.jabatan.toLowerCase() : ''
  const nama = userData.value.nama ? userData.value.nama.toLowerCase() : ''

  const isAdminIdentity =
    email === 'refqiobeth345@gmail.com' ||
    email.includes('admin') ||
    nama.includes('refqi') ||
    nama.includes('obeth')

  const isAdminRole =
    role.includes('super admin') ||
    role.includes('superadmin') ||
    jabatan.includes('super admin') ||
    jabatan.includes('superadmin')

  return isAdminIdentity || isAdminRole
})

const filteredApps = computed(() => {
  if (isSuperAdmin.value) return availableApps

  if (userData.value.akses && Array.isArray(userData.value.akses)) {
    return availableApps.filter((app) => userData.value.akses.includes(app.aksesKey))
  }
  return []
})

// REVISI EMAS: INTEGRASI TOTAL HAK AKSES MATRIKS FIRESTORE (ANTI TERBALIK / SEJAJAR 100%)
const menuListFiltered = computed(() => {
  // Master Blueprint Susunan Menu Absensi Utama PT AGRA (Total 12 Sub-Modul Sejajar Baris DB)
  const masterMenus = [
    {
      label: 'Dashboard Admin',
      icon: 'admin_panel_settings',
      path: '/absensi/admin/dashboard',
      dbKey: 'DASHBOARD',
      isAdminRow: true,
    },
    {
      label: 'Pengaturan Absensi',
      icon: 'settings_suggest',
      path: '/absensi/admin/pengaturan',
      dbKey: 'PENGATURAN',
    },
    {
      label: 'Catatan Absensi',
      icon: 'fact_check',
      path: '/absensi/admin/catatan',
      dbKey: 'CATATAN',
    },
    {
      label: 'Persetujuan Cuti',
      icon: 'event_available',
      path: '/absensi/admin/persetujuan',
      dbKey: 'PERSETUJUAN',
    },
    {
      label: 'Persetujuan Izin',
      icon: 'rule_folder',
      path: '/absensi/admin/persetujuan-izin',
      dbKey: 'PERSETUJUAN IZIN',
    },
    {
      label: 'Pemberitahuan Umum',
      icon: 'campaign',
      path: '/absensi/admin/pemberitahuan',
      dbKey: 'PEMBERITAHUAN',
    },
    { label: 'Profil', icon: 'account_circle', path: '/absensi/profil', dbKey: 'PROFIL' },
    {
      label: 'Dashboard Karyawan',
      icon: 'dashboard',
      path: '/absensi/dashboard',
      dbKey: 'DASHBOARD',
      isAdminRow: false,
    },
    { label: 'Riwayat Absensi', icon: 'history', path: '/absensi/riwayat', dbKey: 'RIWAYAT' },
    {
      label: 'Pengajuan Cuti/Izin',
      icon: 'event_note',
      path: '/absensi/pengajuan-izin',
      dbKey: 'PENGAJUAN IZIN',
    }, // FIX: dbKey disesuaikan dengan Firestore "PENGAJUAN IZIN"
    { label: 'Absensi Manual', icon: 'history_edu', path: '/absensi/manual', dbKey: 'MANUAL' },
    // BARU: Menambahkan item menu Absensi Harian Lepas dengan struktur sub-menu
    {
      label: 'Absensi Harian Lepas',
      icon: 'engineering',
      dbKey: 'HARIAN LEPAS',
      children: [
        {
          label: 'Kelola Pekerja & Mandor',
          icon: 'manage_accounts',
          path: '/absensi/admin/absensi-harian-lepas',
        },
        {
          label: 'Pengajuan Absensi',
          icon: 'assignment_turned_in',
          path: '/absensi/admin/pengajuan-absensi-harian-lepas',
        },
        {
          label: 'Persetujuan Harian Lepas',
          icon: 'verified_user',
          path: '/absensi/admin/persetujuan-harian-lepas',
        },
      ],
    },
  ]

  // 1. Jika akun adalah Super Admin, berikan bypass akses penuh langsung
  if (isSuperAdmin.value) {
    return masterMenus
  }

  // 2. Filter Hak Akses secara Dinamis & Presisi berdasarkan baris Centangan di Firestore Karyawan
  const absensiModule = userPermissions.value.find((p) => p.id === 'absensi')
  if (!absensiModule || !absensiModule.menus || !absensiModule.isActive) return []

  return masterMenus.filter((menuItem) => {
    // Cari semua item di Firestore yang cocok dengan dbKey ini
    const matchedDbMenus = absensiModule.menus.filter((m) => {
      const idUpper = m.id?.toUpperCase() || ''
      const labelUpper = m.label?.toUpperCase() || ''
      return idUpper === menuItem.dbKey || labelUpper === menuItem.dbKey
    })

    if (matchedDbMenus.length === 0) return false

    // Kasus khusus untuk kunci ganda seperti 'DASHBOARD'
    if (menuItem.dbKey === 'DASHBOARD') {
      // DASHBOARD ADMIN (isAdminRow: true) mengambil index ke-0
      // DASHBOARD KARYAWAN (isAdminRow: false) mengambil index ke-1 (atau ke-0 jika cuma ada 1 di DB)
      const dbMenu = menuItem.isAdminRow
        ? matchedDbMenus[0]
        : matchedDbMenus[1] || matchedDbMenus[0]
      return dbMenu ? dbMenu.lihat === true : false
    }

    // Untuk menu biasa lainnya (PENGATURAN, PROFIL, PENGAJUAN IZIN, MANUAL, dll.)
    // Ambil item pertama yang cocok
    const dbMenu = matchedDbMenus[0]
    return dbMenu ? dbMenu.lihat === true : false
  })
})

const loadPendingCount = () => {
  if (unsubscribePending) unsubscribePending()
  const qPending = query(collection(db, 'pengajuan'), where('status_approval', '==', 'Pending'))
  unsubscribePending = onSnapshot(
    qPending,
    (snap) => {
      pendingList.value = snap.docs.map((docObj) => ({ id: docObj.id, ...docObj.data() }))
    },
    (err) => {
      console.warn('Gagal load pending count:', err.message)
    },
  )
}

const loadPendingHarianLepasCount = () => {
  if (unsubscribePendingHarianLepas) unsubscribePendingHarianLepas()
  const q = query(collection(db, 'harian_lepas_absen'), where('status', '==', 'diajukan'))
  unsubscribePendingHarianLepas = onSnapshot(
    q,
    (snap) => {
      pendingHarianLepas.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
    (err) => {
      console.warn('Gagal load pending harian lepas count:', err.message)
    }
  )
}

const pendingHarianLepasCount = computed(() => pendingHarianLepas.value.length)

// KALKULATOR BADGE SECARA REAKTIF & AMAN DI MEMORI
const pendingCutiCount = computed(() => {
  return pendingList.value.filter((p) => p.jenis_pengajuan === 'Cuti Tahunan').length
})

const pendingIzinCount = computed(() => {
  return pendingList.value.filter((p) => p.jenis_pengajuan !== 'Cuti Tahunan').length
})

const syncData = () => {
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)

      userData.value = {
        nama: parsed.nama || 'User',
        jabatan: parsed.jabatan || parsed.role || 'Staff',
        role: parsed.role || 'Staff',
        email: parsed.email || '',
        fotoUrl: parsed.fotoUrl || parsed.foto_profil || '',
        akses: parsed.akses || [],
      }

      if (userData.value.email) {
        const q = query(collection(db, 'karyawan'), where('email', '==', userData.value.email))
        onSnapshot(
          q,
          (snap) => {
            if (!snap.empty) {
              const data = snap.docs[0].data()
              userData.value = {
                ...userData.value,
                nama: data.nama || userData.value.nama,
                jabatan: data.jabatan || data.role || userData.value.jabatan,
                role: data.role || userData.value.role,
                fotoUrl: data.foto_profil || data.fotoUrl || userData.value.fotoUrl,
                akses: data.akses || userData.value.akses,
              }
              userPermissions.value = data.permissions_detail || []
            }
          },
          (err) => {
            console.warn('Firestore sync restricted:', err.message)
          },
        )
      }
    } catch (e) {
      console.error(e)
    }
  } else {
    router.push('/login')
  }
}

onMounted(() => {
  syncData()
  loadPendingCount()
  loadPendingHarianLepasCount()
})

onUnmounted(() => {
  if (unsubscribePending) unsubscribePending()
  if (unsubscribePendingHarianLepas) unsubscribePendingHarianLepas()
})

const handleLogout = () => {
  $q.dialog({ title: 'Logout', message: 'Yakin ingin keluar dari sistem?', cancel: true }).onOk(
    async () => {
      try {
        localStorage.removeItem('user_data')
        localStorage.removeItem('auth')
        if (unsubscribePending) unsubscribePending()
        if (unsubscribePendingHarianLepas) unsubscribePendingHarianLepas()
        await signOut(auth)
        router.push('/login')
      } catch (error) {
        console.error('Gagal logout:', error)
      }
    },
  )
}
</script>

<style lang="scss" scoped>
/* Scoped Styles for Clean Neo-Brutalist Theme */

.neo-header {
  background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%) !important;
  border-bottom: 3.5px solid #0f172a;
  box-shadow: 0 4px 0px rgba(15, 23, 42, 0.15) !important;
}

/* Mac dots styling in header */
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid transparent;
}
.dot.red { background-color: #ff5f56; border-color: #e0443e; }
.dot.yellow { background-color: #ffbd2e; border-color: #dea123; }
.dot.green { background-color: #27c93f; border-color: #1aab29; }

.sidebar-drawer {
  color: #0f172a;
}

:deep(.q-drawer) {
  color: #0f172a;
  background: #f0f7ff; /* Soft Pastel Blue background */
  border-right: 3.5px solid #0f172a;
  box-shadow: 6px 0 0px rgba(15, 23, 42, 0.05);
  transition:
    width 0.24s ease,
    transform 0.24s ease;
}

:deep(.q-drawer__content) {
  color: #0f172a;
  background: #f0f7ff;
}

:deep(.q-list) {
  color: #0f172a;
}

:deep(.q-item) {
  color: #0f172a;
}

:deep(.q-item__label) {
  color: inherit;
}

:deep(.q-icon) {
  color: inherit;
}

.profile-box {
  background: #f0f7ff !important;
  border-bottom: 2.5px dashed #0f172a;
}

.neo-profile-card {
  background: #ffffff;
  border: 2.5px solid #0f172a;
  border-radius: 14px;
  box-shadow: 4px 4px 0px #0f172a !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0px #0f172a !important;
}

.neo-avatar {
  border: 2.5px solid #0f172a;
}

/* Pulsing Active Green Dot */
.profile-pulse-dot {
  width: 12px;
  height: 12px;
  background-color: #27c93f;
  border: 2px solid #ffffff;
  border-radius: 50%;
  animation: pulse-glow-green 2s infinite ease-in-out;
  position: absolute;
  bottom: -2px;
  right: -2px;
  z-index: 2;
}

@keyframes pulse-glow-green {
  0% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(39, 201, 63, 0.6);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 5px rgba(39, 201, 63, 0);
  }
  100% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(39, 201, 63, 0);
  }
}

.sidebar-scroll {
  background: #f0f7ff;
}

.menu-list {
  padding: 10px 10px 16px;
}

.section-title {
  min-height: auto;
  margin: 14px 4px 8px;
  padding: 0 10px;
  color: #1e3a8a; /* Deep blue */
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  line-height: 1;
}

.sidebar-separator {
  margin: 12px 8px 8px;
  background: #0f172a;
  height: 2px;
}

.menu-item {
  min-height: 40px;
  margin: 6px 4px;
  padding: 0 12px;
  border: 2.5px solid transparent;
  border-radius: 12px;
  color: #0f172a;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.menu-item:hover,
.submenu-item:hover,
:deep(.submenu-group:hover),
:deep(.nav-group:hover) {
  background: #e0f2fe; /* Light pastel blue hover */
  border-color: #0f172a;
  color: #0f172a;
  box-shadow: 3px 3px 0px #0f172a;
  transform: translateY(-2px) translateX(2px);
}

.menu-icon,
.submenu-icon {
  min-width: 32px;
  padding-right: 8px;
  color: inherit;
  align-items: center;
  justify-content: center;
}

.menu-icon :deep(.q-icon) {
  font-size: 20px;
}

.menu-text,
.submenu-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submenu-item {
  min-height: 36px;
  margin: 4px 4px 4px 18px;
  padding: 0 12px;
  border: 2px solid transparent;
  border-radius: 10px;
  color: #0f172a;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.submenu-icon {
  min-width: 24px;
  padding-right: 7px;
  color: #1976d2;
}

.submenu-icon :deep(.q-icon) {
  font-size: 16px;
}

:deep(.submenu-group) {
  min-height: 36px;
  margin: 4px 4px 4px 18px;
  padding: 0 12px;
  border: 2px solid transparent;
  border-radius: 10px;
  color: #0f172a;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.submenu-group .q-item__section--avatar) {
  min-width: 24px;
  padding-right: 7px;
  color: #1976d2;
}

:deep(.submenu-group .q-item__label) {
  min-width: 0;
  overflow: hidden;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.q-expansion-item--expanded > .submenu-group) {
  color: #0f172a;
  background: #ffffff;
  border-color: #0f172a;
  box-shadow: 3px 3px 0px #0f172a;
  transform: translateY(-1px);
}

:deep(.nav-group) {
  min-height: 40px;
  margin: 6px 4px;
  padding: 0 12px;
  border: 2.5px solid transparent;
  border-radius: 14px;
  color: #0f172a;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.nav-group .q-item__section--avatar) {
  min-width: 32px;
  padding-right: 8px;
  color: #1976d2;
}

:deep(.nav-group .q-item__label) {
  line-height: 1.1;
}

:deep(.nav-expand-icon) {
  color: #0f172a;
  font-size: 18px;
}

:deep(.q-expansion-item__content) {
  padding: 4px 0 6px;
  transition:
    max-height 0.22s ease,
    opacity 0.18s ease;
}

:deep(.q-expansion-item--expanded > .nav-group) {
  color: #0f172a;
  background: #ffffff;
  border-color: #0f172a;
  box-shadow: 3px 3px 0px #0f172a;
  transform: translateY(-2px) translateX(2px);
}

.active-menu {
  color: #ffffff !important;
  background: #2563eb !important; /* Vibrant Neo-Brutalist Blue */
  border-color: #0f172a !important;
  border-radius: 12px !important;
  box-shadow: 4px 4px 0px #0f172a !important;
  transform: translateY(-2px) translateX(2px);
  font-weight: 800;
}

.active-menu .submenu-icon,
.active-menu .menu-icon {
  color: #ffffff !important;
}

/* Add high-contrast border to badges */
:deep(.q-badge) {
  border: 1.5px solid #0f172a;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
}

/* Force-hide horizontal scrollbars for sidebar and scroll areas */
:deep(.q-scrollarea__container),
:deep(.q-scrollarea__content),
:deep(.q-drawer),
:deep(.q-drawer__content) {
  overflow-x: hidden !important;
}

/* Ensure the scroll area content and lists do not exceed the drawer width */
:deep(.q-scrollarea) {
  width: 100% !important;
  max-width: 100% !important;
}
:deep(.q-scrollarea__content) {
  width: 100% !important;
  max-width: 100% !important;
}
:deep(.q-list) {
  width: 100% !important;
  max-width: 100% !important;
}
.menu-item,
.menu-expansion-item {
  max-width: calc(100% - 8px) !important;
}
</style>
