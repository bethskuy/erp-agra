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
            <div class="q-pa-md bg-white" style="width: 320px; border-radius: 12px">
              <div class="text-overline q-px-sm q-pb-sm text-grey-7 tracking-widest">
                Modul Agra ERP
              </div>
              <div class="row q-col-gutter-sm">
                <template v-for="app in availableApps" :key="app.aksesKey">
                  <div class="col-4">
                    <q-btn
                      flat
                      stack
                      class="full-width app-btn"
                      :class="{ 'active-app': app.aksesKey === 'absensi' }"
                      no-caps
                      :to="app.path"
                    >
                      <q-icon :name="app.icon" :color="app.color || 'primary'" size="32px" />
                      <div class="app-label text-center">{{ app.name }}</div>
                    </q-btn>
                  </div>
                </template>
              </div>
              <q-separator class="q-my-md" />
              <q-btn
                outline
                color="blue-9"
                class="full-width text-weight-bold"
                icon="home"
                label="Kembali ke Menu Utama"
                to="/"
                no-caps
                rounded
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

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="295" class="bg-white" elevation="10">
      <div class="column fit">
        <div class="q-pa-lg bg-blue-1 text-blue-10 border-bottom-soft">
          <div class="row items-center q-gutter-md">
            <q-avatar size="56px" color="blue-9" text-color="white" class="shadow-2">
              <img v-if="userData.fotoUrl" :src="userData.fotoUrl" />
              <span v-else>{{
                userData.nama ? userData.nama.substring(0, 1).toUpperCase() : 'A'
              }}</span>
            </q-avatar>
            <div class="col overflow-hidden">
              <div class="text-weight-bold text-subtitle1 ellipsis">{{ userData.nama }}</div>
              <div
                class="text-caption text-grey-7 ellipsis text-uppercase tracking-widest"
                style="font-size: 10px"
              >
                {{ userData.jabatan }}
              </div>
            </div>
          </div>
        </div>

        <q-scroll-area class="col">
          <q-list class="q-py-md">
            <div class="q-px-md q-pt-sm q-pb-sm text-overline text-grey-6 tracking-widest">
              MENU UTAMA
            </div>
            <q-item
              clickable
              v-ripple
              to="/absensi/dashboard"
              class="menu-item q-mb-sm"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="dashboard" size="22px" /></q-item-section>
              <q-item-section class="text-weight-bold uppercase">DASHBOARD</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              to="/absensi/profil"
              class="menu-item q-mb-sm"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="account_circle" size="22px" /></q-item-section>
              <q-item-section class="text-weight-bold uppercase">PROFIL</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              to="/absensi/riwayat"
              class="menu-item q-mb-sm"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="history" size="22px" /></q-item-section>
              <q-item-section class="text-weight-bold uppercase">RIWAYAT ABSENSI</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              to="/absensi/pengajuan-izin"
              class="menu-item q-mb-sm"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="event_note" size="22px" /></q-item-section>
              <q-item-section class="text-weight-bold uppercase"
                >PENGAJUAN CUTI/IZIN</q-item-section
              >
            </q-item>
            <q-separator spaced inset class="bg-grey-3 q-my-md" />
            <q-item
              clickable
              v-ripple
              @click="handleLogout"
              class="menu-item q-mb-sm text-negative"
            >
              <q-item-section avatar><q-icon name="logout" size="22px" /></q-item-section>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(false)

const userData = ref({ nama: 'Memuat...', jabatan: 'Modul Absensi', fotoUrl: '' })

const availableApps = ref([
  {
    name: 'Manufacture',
    icon: 'precision_manufacturing',
    color: 'teal-9',
    path: '/manufacture',
    aksesKey: 'manufacture',
  },
  {
    name: 'Absensi',
    icon: 'badge',
    color: 'blue-9',
    path: '/absensi/dashboard',
    aksesKey: 'absensi',
  },
  { name: 'Modul Aset', icon: 'inventory', color: 'orange-9', path: '/aset', aksesKey: 'aset' },
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
    path: '/hrd',
    aksesKey: 'hrd',
  },
])

onMounted(async () => {
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      const userEmail = parsed.email

      if (userEmail) {
        // Mencari data karyawan berdasarkan email di koleksi 'karyawan'
        const q = query(collection(db, 'karyawan'), where('email', '==', userEmail))
        const querySnap = await getDocs(q)

        if (!querySnap.empty) {
          const data = querySnap.docs[0].data()
          userData.value = {
            nama: data.nama || data.nama_lengkap || 'Karyawan',
            jabatan: data.jabatan || data.posisi || 'Staff',
            fotoUrl: data.foto_profil || data.fotoUrl || '',
          }
        } else {
          userData.value.nama = parsed.nama || 'Karyawan'
        }
      }
    } catch (e) {
      console.error(e)
      userData.value.nama = 'Error Loading'
    }
  }
})

const handleLogout = () => {
  $q.dialog({ title: 'Keluar', message: 'Yakin ingin keluar?', cancel: true }).onOk(() => {
    localStorage.removeItem('user_data')
    router.push('/')
  })
}
</script>

<style lang="scss" scoped>
.menu-item {
  border-radius: 0 25px 25px 0;
  color: #546e7a;
  margin: 0 12px 4px 0;
  font-size: 13.5px;
  min-height: 50px;
}
.menu-item-active {
  background-color: #e3f2fd !important;
  color: #1565c0 !important;
  font-weight: 800 !important;
  border-right: 5px solid #1565c0;
}
.app-btn {
  border-radius: 8px;
  min-height: 85px;
  transition: all 0.3s;
  &:hover {
    background: #f8f9fa;
    transform: translateY(-2px);
  }
}
.active-app {
  background: #e3f2fd;
  border: 1px solid rgba(21, 101, 192, 0.1);
  .app-label {
    font-weight: 700;
    color: #1565c0;
  }
}
.app-label {
  font-size: 11px;
  margin-top: 8px;
  color: #444;
}
.border-bottom-soft {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
