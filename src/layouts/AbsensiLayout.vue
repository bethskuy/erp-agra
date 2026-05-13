<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <q-header borderless class="bg-blue-9 text-white shadow-1">
      <q-toolbar class="q-py-xs">
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

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="285" class="bg-white">
      <div class="column fit">
        <div class="q-pa-lg bg-blue-1 text-blue-10">
          <div class="row items-center q-gutter-md">
            <q-avatar size="56px" color="blue-9" text-color="white" class="shadow-2">
              <img v-if="userData.fotoUrl" :src="userData.fotoUrl" />
              <span v-else>{{
                userData.nama ? userData.nama.substring(0, 1).toUpperCase() : 'A'
              }}</span>
            </q-avatar>
            <div class="col">
              <div class="text-weight-bold text-subtitle1 ellipsis">
                {{ userData.nama || 'User' }}
              </div>
              <div
                class="text-caption text-grey-7 text-uppercase"
                style="font-size: 10px; letter-spacing: 1px"
              >
                {{ isSuperAdmin ? 'SUPER ADMIN' : userData.jabatan || userData.role || 'Karyawan' }}
              </div>
            </div>
          </div>
        </div>

        <q-scroll-area class="col">
          <q-list class="q-py-md">
            <div class="q-px-md q-pb-sm text-overline text-grey-6">MENU UTAMA</div>

            <template v-for="menu in menuListFiltered" :key="menu.path">
              <q-item
                clickable
                v-ripple
                :to="menu.path"
                class="menu-item q-mb-xs"
                active-class="menu-item-active"
              >
                <q-item-section avatar><q-icon :name="menu.icon" size="22px" /></q-item-section>
                <q-item-section class="text-weight-bold uppercase">{{ menu.label }}</q-item-section>
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

            <q-separator spaced class="q-my-md" />
            <q-item clickable v-ripple @click="handleLogout" class="menu-item text-negative">
              <q-item-section avatar><q-icon name="logout" /></q-item-section>
              <q-item-section class="text-weight-bold uppercase">KELUAR SISTEM</q-item-section>
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
import { ref, onMounted, computed } from 'vue'
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

const menuListFiltered = computed(() => {
  if (isSuperAdmin.value) {
    return [
      { label: 'DASHBOARD ADMIN', icon: 'admin_panel_settings', path: '/absensi/admin/dashboard' },
      { label: 'PENGATURAN ABSENSI', icon: 'settings_suggest', path: '/absensi/admin/pengaturan' },
      { label: 'CATATAN ABSENSI', icon: 'fact_check', path: '/absensi/admin/catatan' }, // <-- MENU BARU
      { label: 'DASHBOARD KARYAWAN', icon: 'dashboard', path: '/absensi/dashboard' },
      { label: 'PROFIL', icon: 'account_circle', path: '/absensi/profil' },
      { label: 'RIWAYAT ABSENSI', icon: 'history', path: '/absensi/riwayat' },
      { label: 'PENGAJUAN CUTI/IZIN', icon: 'event_note', path: '/absensi/pengajuan-izin' },
    ]
  }

  const absensiModule = userPermissions.value.find((p) => p.id === 'absensi')
  if (!absensiModule || !absensiModule.isActive) return []

  const canSee = (searchKey) => {
    if (!absensiModule.menus) return false
    const found = absensiModule.menus.find(
      (m) =>
        m.id.toLowerCase().includes(searchKey.toLowerCase()) ||
        m.label.toLowerCase().includes(searchKey.toLowerCase()),
    )
    return found ? found.lihat : false
  }

  const baseMenus = [
    { label: 'DASHBOARD', icon: 'dashboard', path: '/absensi/dashboard', key: 'dashboard' },
    { label: 'PROFIL', icon: 'account_circle', path: '/absensi/profil', key: 'profil' },
    { label: 'RIWAYAT ABSENSI', icon: 'history', path: '/absensi/riwayat', key: 'riwayat' },
    {
      label: 'PENGAJUAN CUTI/IZIN',
      icon: 'event_note',
      path: '/absensi/pengajuan-izin',
      key: 'pengajuan',
    },
  ]

  return baseMenus.filter((m) => canSee(m.key))
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
                jabatan: data.jabatan || userData.value.jabatan,
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
})

const handleLogout = () => {
  $q.dialog({ title: 'Logout', message: 'Yakin ingin keluar dari sistem?', cancel: true }).onOk(
    async () => {
      try {
        localStorage.removeItem('user_data')
        localStorage.removeItem('auth')
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
.menu-item {
  border-radius: 0 25px 25px 0;
  margin-right: 12px;
  color: #546e7a;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
  transition: all 0.3s;
  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}
.menu-item-active {
  background: #e3f2fd !important;
  color: #1565c0 !important;
  font-weight: 800;
  border-right: 5px solid #1565c0;
}
.app-btn {
  border-radius: 12px;
  padding: 8px 4px;
  transition: all 0.2s ease;
  &:hover {
    background: #f8fafc;
    transform: translateY(-2px);
  }
}
.active-app {
  background: #e8f5e9;
  border: 1px solid #4caf50;
}
.app-label {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  white-space: normal;
  word-wrap: break-word;
}
</style>
