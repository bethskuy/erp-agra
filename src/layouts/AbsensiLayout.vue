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

        <!-- Theme Toggle Button -->
        <q-btn
          flat
          round
          dense
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          class="q-mr-sm"
          @click="toggleTheme"
        >
          <q-tooltip>{{ $q.dark.isActive ? 'Mode Terang' : 'Mode Gelap' }}</q-tooltip>
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
        <div class="q-pa-sm profile-box">
          <div class="neo-profile-card q-pa-sm">
            <div class="row items-center q-gutter-xs no-wrap">
              <q-avatar size="36px" color="blue-9" text-color="white" class="neo-avatar relative-position">
                <img v-if="userData.fotoUrl" :src="userData.fotoUrl" style="object-fit: cover;" />
                <span v-else>{{
                  userData.nama ? userData.nama.substring(0, 1).toUpperCase() : 'A'
                }}</span>
                <span class="profile-pulse-dot"></span>
              </q-avatar>
              <div class="col overflow-hidden">
                <div class="text-weight-bold text-grey-9 ellipsis leading-tight" style="font-size: 10px;">
                  {{ userData.nama || 'User' }}
                  <q-tooltip class="bg-blue-grey-9" self="center left" anchor="center right" :delay="500">
                    {{ userData.nama || 'User' }}
                  </q-tooltip>
                </div>
                <div class="text-blue-9 text-weight-bolder ellipsis flex items-center q-mt-xs" style="font-size: 9px; letter-spacing: 0.3px;">
                  <span class="q-mr-xs">💼</span> {{ isSuperAdmin ? 'SUPER ADMIN' : userData.jabatan || userData.role || 'Karyawan' }}
                  <q-tooltip class="bg-blue-grey-9" self="center left" anchor="center right" :delay="500">
                    {{ isSuperAdmin ? 'SUPER ADMIN' : userData.jabatan || userData.role || 'Karyawan' }}
                  </q-tooltip>
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

    <!-- Desktop Pets (RunCat / Neko style) -->
    <div class="pixel-pet-container">
      <!-- 1. Excavator -->
      <svg class="walking-pet walking-pet--excavator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <!-- Tracks/Treads -->
        <rect x="6" y="34" width="28" height="6" rx="3" fill="#2d3436" />
        <circle class="excavator-wheel" cx="10" cy="37" r="3" fill="#0f172a" />
        <circle class="excavator-wheel" cx="20" cy="37" r="3" fill="#0f172a" />
        <circle class="excavator-wheel" cx="30" cy="37" r="3" fill="#0f172a" />
        <!-- Cab/Body -->
        <rect x="8" y="22" width="18" height="12" rx="2" fill="#fdcb6e" stroke="#0f172a" stroke-width="2" />
        <!-- Cab Window -->
        <rect x="18" y="24" width="6" height="6" rx="1" fill="#dfe6e9" stroke="#0f172a" stroke-width="1.5" />
        <!-- Counterweight/Engine box -->
        <rect x="4" y="26" width="4" height="8" rx="1" fill="#ffeaa7" stroke="#0f172a" stroke-width="1.5" />
        <!-- Boom / Arm -->
        <g class="excavator-arm">
          <!-- Main Boom -->
          <line x1="22" y1="28" x2="34" y2="16" stroke="#2d3436" stroke-width="4" stroke-linecap="round" />
          <line x1="22" y1="28" x2="34" y2="16" stroke="#fdcb6e" stroke-width="2" stroke-linecap="round" />
          <!-- Dipper / Forearm -->
          <line class="excavator-dipper" x1="34" y1="16" x2="38" y2="28" stroke="#2d3436" stroke-width="3" stroke-linecap="round" />
          <!-- Bucket -->
          <path class="excavator-bucket" d="M 36,28 Q 42,28 40,34 Q 34,34 35,28 Z" fill="#2d3436" />
        </g>
      </svg>

      <!-- 2. Dump Truck -->
      <svg class="walking-pet walking-pet--truck" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <!-- Wheels -->
        <circle class="truck-wheel" cx="14" cy="36" r="5" fill="#0f172a" stroke="#dfe6e9" stroke-width="1.5" />
        <circle class="truck-wheel" cx="34" cy="36" r="5" fill="#0f172a" stroke="#dfe6e9" stroke-width="1.5" />
        <circle cx="14" cy="36" r="2" fill="#dfe6e9" />
        <circle cx="34" cy="36" r="2" fill="#dfe6e9" />
        <!-- Chassis -->
        <rect x="8" y="30" width="32" height="4" fill="#2d3436" />
        <!-- Cab (Blue) -->
        <path d="M 8,30 L 8,20 L 16,20 L 22,25 L 22,30 Z" fill="#0984e3" stroke="#0f172a" stroke-width="2" />
        <rect x="10" y="22" width="6" height="5" fill="#dfe6e9" />
        <!-- Dump Bed (Yellow) -->
        <g class="truck-bed">
          <polygon points="21,18 39,18 39,30 21,30" fill="#fdcb6e" stroke="#0f172a" stroke-width="2" />
          <rect x="23" y="20" width="14" height="2" fill="#ffeaa7" />
        </g>
      </svg>

      <!-- 3. Worker (Yellow Helmet) -->
      <svg class="walking-pet walking-pet--worker-yellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
        <!-- Legs -->
        <rect class="worker-leg worker-leg--left" x="11" y="26" width="3" height="12" rx="1" fill="#2e86de" />
        <rect class="worker-leg worker-leg--right" x="17" y="26" width="3" height="12" rx="1" fill="#1b4f72" />
        <!-- Torso (Safety Vest) -->
        <rect x="9" y="14" width="13" height="13" rx="2" fill="#10b981" />
        <rect x="11" y="14" width="9" height="13" fill="#ff9f43" />
        <rect x="9" y="18" width="13" height="2" fill="#dfe6e9" />
        <rect x="9" y="22" width="13" height="2" fill="#dfe6e9" />
        <!-- Arms -->
        <rect class="worker-arm worker-arm--left" x="6" y="14" width="3" height="11" rx="1" fill="#ffdb58" />
        <rect class="worker-arm worker-arm--right" x="22" y="14" width="3" height="11" rx="1" fill="#ffdb58" />
        <!-- Head & Neck -->
        <rect x="14" y="11" width="3" height="4" fill="#ffdb58" />
        <circle cx="15.5" cy="9.5" r="4.5" fill="#ffdb58" />
        <!-- Helmet (Yellow) -->
        <path d="M 10,7.5 C 10,4.5 21,4.5 21,7.5 Z" fill="#fecb2f" />
        <rect x="9" y="7" width="13" height="1.5" rx="0.5" fill="#fecb2f" />
      </svg>

      <!-- 4. Worker (Orange Helmet & Shovel) -->
      <svg class="walking-pet walking-pet--worker-orange" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
        <!-- Legs -->
        <rect class="worker-leg worker-leg--left" x="11" y="26" width="3" height="12" rx="1" fill="#2f3640" />
        <rect class="worker-leg worker-leg--right" x="17" y="26" width="3" height="12" rx="1" fill="#1e272e" />
        <!-- Torso -->
        <rect x="9" y="14" width="13" height="13" rx="2" fill="#ff9f43" />
        <rect x="11" y="14" width="9" height="13" fill="#10b981" />
        <rect x="9" y="18" width="13" height="2" fill="#dfe6e9" />
        <rect x="9" y="22" width="13" height="2" fill="#dfe6e9" />
        <!-- Arms -->
        <rect class="worker-arm worker-arm--left" x="6" y="14" width="3" height="11" rx="1" fill="#ffd2af" />
        <g class="worker-arm worker-arm--right-tool">
          <rect x="22" y="14" width="3" height="11" rx="1" fill="#ffd2af" />
          <rect x="23" y="10" width="1.5" height="14" fill="#718093" />
          <path d="M 21,8 L 26,8 L 25,11 L 22,11 Z" fill="#95a5a6" />
        </g>
        <!-- Head & Neck -->
        <rect x="14" y="11" width="3" height="4" fill="#ffd2af" />
        <circle cx="15.5" cy="9.5" r="4.5" fill="#ffd2af" />
        <!-- Helmet (Orange) -->
        <path d="M 10,7.5 C 10,4.5 21,4.5 21,7.5 Z" fill="#ff6b6b" />
        <rect x="9" y="7" width="13" height="1.5" rx="0.5" fill="#ff6b6b" />
      </svg>

      <!-- 5. Worker (White Helmet / PM) -->
      <svg class="walking-pet walking-pet--worker-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
        <!-- Legs -->
        <rect class="worker-leg worker-leg--left" x="11" y="26" width="3" height="12" rx="1" fill="#341f97" />
        <rect class="worker-leg worker-leg--right" x="17" y="26" width="3" height="12" rx="1" fill="#222f3e" />
        <!-- Torso -->
        <rect x="9" y="14" width="13" height="13" rx="2" fill="#54a0ff" />
        <rect x="11" y="14" width="9" height="13" fill="#ff9f43" />
        <rect x="9" y="18" width="13" height="2" fill="#dfe6e9" />
        <!-- Arms -->
        <g class="worker-arm worker-arm--left-plan">
          <rect x="5" y="14" width="3" height="11" rx="1" fill="#ffc048" />
          <rect x="2" y="20" width="8" height="3" rx="1" fill="#ffffff" stroke="#2e86de" stroke-width="0.8" />
        </g>
        <rect class="worker-arm worker-arm--right" x="22" y="14" width="3" height="11" rx="1" fill="#ffc048" />
        <!-- Head & Neck -->
        <rect x="14" y="11" width="3" height="4" fill="#ffc048" />
        <circle cx="15.5" cy="9.5" r="4.5" fill="#ffc048" />
        <!-- Helmet (White) -->
        <path d="M 10,7.5 C 10,4.5 21,4.5 21,7.5 Z" fill="#ffffff" stroke="#ccc" stroke-width="0.5" />
        <rect x="9" y="7" width="13" height="1.5" rx="0.5" fill="#ffffff" stroke="#ccc" stroke-width="0.5" />
      </svg>
    </div>
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
    },
    {
      label: 'Pengaturan Absensi',
      icon: 'settings_suggest',
      path: '/absensi/admin/pengaturan',
    },
    {
      label: 'Catatan Absensi',
      icon: 'fact_check',
      path: '/absensi/admin/catatan',
    },
    {
      label: 'Persetujuan Cuti',
      icon: 'event_available',
      path: '/absensi/admin/persetujuan',
    },
    {
      label: 'Persetujuan Izin',
      icon: 'rule_folder',
      path: '/absensi/admin/persetujuan-izin',
    },
    {
      label: 'Pemberitahuan Umum',
      icon: 'campaign',
      path: '/absensi/admin/pemberitahuan',
    },
    {
      label: 'Profil',
      icon: 'account_circle',
      path: '/absensi/profil',
    },
    {
      label: 'Dashboard Karyawan',
      icon: 'dashboard',
      path: '/absensi/dashboard',
    },
    {
      label: 'Riwayat Absensi',
      icon: 'history',
      path: '/absensi/riwayat',
    },
    {
      label: 'Pengajuan Cuti/Izin',
      icon: 'event_note',
      path: '/absensi/pengajuan-izin',
    },
    {
      label: 'Absensi Manual',
      icon: 'history_edu',
      path: '/absensi/manual',
    },
    // BARU: Menambahkan item menu Absensi Harian Lepas dengan struktur sub-menu
    {
      label: 'Absensi Harian Lepas',
      icon: 'engineering',
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

  const checkPermission = (path) => {
    if (!path) return false
    // Format path ke ID menu Firestore (misal: /absensi/admin/dashboard -> _absensi_admin_dashboard)
    const dbId = path.replace(/\//g, '_')
    const dbMenu = absensiModule.menus.find(
      (m) => (m.id || '').toLowerCase() === dbId.toLowerCase()
    )
    return dbMenu ? dbMenu.lihat === true : false
  }

  const result = []

  masterMenus.forEach((menuItem) => {
    if (menuItem.children && menuItem.children.length > 0) {
      // Filter sub-menu secara dinamis berdasarkan izin centang "lihat"
      const activeChildren = menuItem.children.filter((child) => checkPermission(child.path))
      if (activeChildren.length > 0) {
        result.push({
          ...menuItem,
          children: activeChildren,
        })
      }
    } else {
      // Menu standar tanpa children
      if (checkPermission(menuItem.path)) {
        result.push(menuItem)
      }
    }
  })

  return result
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

  // Load and apply Absensi dark mode
  const isDark = $q.localStorage.getItem('absensi-dark-mode')
  if (isDark !== null) {
    $q.dark.set(isDark)
  } else {
    $q.dark.set(false)
  }
})

onUnmounted(() => {
  if (unsubscribePending) unsubscribePending()
  if (unsubscribePendingHarianLepas) unsubscribePendingHarianLepas()
  // Revert back to light theme when leaving Absensi module
  $q.dark.set(false)
})

const toggleTheme = () => {
  $q.dark.toggle()
  $q.localStorage.set('absensi-dark-mode', $q.dark.isActive)
}

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
  width: 10px;
  height: 10px;
  background-color: #27c93f;
  border: 1.5px solid #ffffff;
  border-radius: 50%;
  animation: pulse-glow-green 2s infinite ease-in-out;
  position: absolute;
  bottom: -1px;
  right: -1px;
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

/* Pixel Pets Background Styling */
.pixel-pet-container {
  position: fixed;
  bottom: 0px;
  left: 0;
  width: 100vw;
  height: 60px;
  pointer-events: none;
  z-index: 9999;
  overflow: visible;
}

.walking-pet {
  position: absolute;
  bottom: 0;
  pointer-events: none;
}

.walking-pet--excavator {
  width: 64px;
  height: 64px;
  animation: walk-back-and-forth 38s linear infinite;
  animation-delay: -15s;
}

.walking-pet--truck {
  width: 64px;
  height: 64px;
  animation: walk-back-and-forth 22s linear infinite;
  animation-delay: -3s;
}

.walking-pet--worker-yellow {
  width: 38px;
  height: 48px;
  animation: walk-back-and-forth 28s linear infinite;
  animation-delay: -7s;
}

.walking-pet--worker-orange {
  width: 38px;
  height: 48px;
  animation: walk-back-and-forth 30s linear infinite;
  animation-delay: -20s;
}

.walking-pet--worker-white {
  width: 38px;
  height: 48px;
  animation: walk-back-and-forth 32s linear infinite;
  animation-delay: -11s;
}

/* Wheel, Arm and Bed animations */
.walking-pet .excavator-wheel,
.walking-pet .truck-wheel {
  animation: spin-wheel 1.2s linear infinite;
  transform-origin: center;
  transform-box: fill-box;
}

.walking-pet .excavator-arm {
  animation: bob-arm 2s ease-in-out infinite alternate;
  transform-origin: 22px 28px;
}

.walking-pet .truck-bed {
  animation: tilt-bed 2.5s ease-in-out infinite alternate;
  transform-origin: 39px 30px;
}

/* Worker animations */
.walking-pet .worker-leg--left {
  animation: swing-leg-a 0.35s ease-in-out infinite alternate;
  transform-origin: 12px 26px;
}

.walking-pet .worker-leg--right {
  animation: swing-leg-b 0.35s ease-in-out infinite alternate;
  transform-origin: 18px 26px;
}

.walking-pet .worker-arm--left {
  animation: swing-arm-a 0.35s ease-in-out infinite alternate;
  transform-origin: 7px 14px;
}

.walking-pet .worker-arm--right {
  animation: swing-arm-b 0.35s ease-in-out infinite alternate;
  transform-origin: 23px 14px;
}

.walking-pet .worker-arm--right-tool {
  animation: swing-arm-b 0.35s ease-in-out infinite alternate;
  transform-origin: 23px 14px;
}

.walking-pet .worker-arm--left-plan {
  animation: swing-arm-a 0.35s ease-in-out infinite alternate;
  transform-origin: 6px 14px;
}

@keyframes spin-wheel {
  100% { transform: rotate(360deg); }
}

@keyframes bob-arm {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-12deg); }
}

@keyframes tilt-bed {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-6deg); }
}

@keyframes swing-leg-a {
  0% { transform: rotate(-28deg); }
  100% { transform: rotate(28deg); }
}

@keyframes swing-leg-b {
  0% { transform: rotate(28deg); }
  100% { transform: rotate(-28deg); }
}

@keyframes swing-arm-a {
  0% { transform: rotate(-24deg); }
  100% { transform: rotate(24deg); }
}

@keyframes swing-arm-b {
  0% { transform: rotate(24deg); }
  100% { transform: rotate(-24deg); }
}

@keyframes walk-back-and-forth {
  0% {
    left: -70px;
    transform: scaleX(1);
  }
  48% {
    left: calc(100vw - 70px);
    transform: scaleX(1);
  }
  50% {
    left: calc(100vw - 70px);
    transform: scaleX(-1);
  }
  98% {
    left: -70px;
    transform: scaleX(-1);
  }
  100% {
    left: -70px;
    transform: scaleX(1);
  }
}
</style>
