<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <q-header borderless class="bg-blue-9 text-white shadow-1">
      <q-toolbar class="q-py-xs">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bolder">
          <div class="row items-center no-wrap">
            <div class="row items-center no-wrap text-h6 text-md-h5">
              <span class="q-mr-xs tracking-tighter">AGRA</span>
              <span class="text-weight-light text-blue-2">ERP</span>
              <q-badge color="positive" class="q-ml-sm text-weight-bold shadow-2">
                ABSENSI
              </q-badge>
            </div>
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn flat round icon="apps" to="/" class="q-mr-xs">
          <q-tooltip>Kembali ke Portal Utama</q-tooltip>
        </q-btn>

        <q-avatar size="32px" color="white" text-color="blue-9" class="text-weight-bold shadow-1">
          {{ currentUserName.substring(0, 1).toUpperCase() }}
        </q-avatar>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="295" class="bg-white" elevation="10">
      <div class="column fit">
        <div class="q-pa-lg bg-blue-1 text-blue-10 border-bottom-soft">
          <div class="row items-center q-gutter-md">
            <q-avatar size="56px" color="blue-9" text-color="white" class="shadow-2">
              {{ currentUserName.substring(0, 1).toUpperCase() }}
            </q-avatar>
            <div class="col overflow-hidden">
              <div class="text-weight-bold text-subtitle1 ellipsis">
                {{ currentUserName }}
              </div>
              <div
                class="text-caption text-grey-7 ellipsis text-uppercase tracking-widest"
                style="font-size: 10px"
              >
                Modul Absensi
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

        <div class="q-pa-md text-center text-caption text-grey-5 border-top-soft">
          v2.5.0-flash | PT AGRA
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(false)
const currentUserName = ref('User')

onMounted(() => {
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      currentUserName.value = parsed.nama || parsed.displayName || 'Karyawan'
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      currentUserName.value = 'Karyawan'
    }
  }
})

const handleLogout = () => {
  $q.dialog({
    title: '<span class="text-blue-9 text-weight-bold">Konfirmasi Keluar</span>',
    message: 'Apakah Anda yakin ingin mengakhiri sesi AGRA ERP ini?',
    html: true,
    cancel: true,
    ok: { unelevated: true, label: 'Ya, Keluar', color: 'negative', rounded: true },
    persistent: true,
  }).onOk(() => {
    localStorage.removeItem('user_data')
    router.push('/')
    $q.notify({
      message: 'Berhasil keluar.',
      color: 'grey-8',
      icon: 'logout',
    })
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
  &:hover {
    background-color: rgba(21, 101, 192, 0.05);
    color: #1565c0;
  }
}

.menu-item-active {
  background-color: #e3f2fd !important;
  color: #1565c0 !important;
  font-weight: 800 !important;
  border-right: 5px solid #1565c0; /* Indikator kanan warna Biru */
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.border-top-soft {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.tracking-tighter {
  letter-spacing: -1px;
}

.tracking-widest {
  letter-spacing: 1px;
}
</style>
