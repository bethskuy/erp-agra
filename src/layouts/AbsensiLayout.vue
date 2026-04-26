<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title class="text-weight-bolder">
          AGRA <span class="text-weight-light">ERP</span>
          <q-badge align="top" color="positive" class="q-ml-sm shadow-2 text-weight-bold">
            ABSENSI
          </q-badge>
        </q-toolbar-title>
        <q-space />
        <q-btn flat round icon="apps" to="/" class="q-mr-sm">
          <q-tooltip>Kembali ke Portal</q-tooltip>
        </q-btn>
        <q-avatar color="white" text-color="primary" class="text-weight-bold shadow-2">
          {{ currentUserName.substring(0, 1).toUpperCase() }}
        </q-avatar>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR (DRAWER) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="280" class="bg-white">
      <div class="column fit">
        <!-- Label Menu Utama -->
        <div class="q-pa-md text-grey-7 text-subtitle1 text-weight-medium">Menu Utama</div>

        <q-scroll-area class="col">
          <q-list padding class="text-grey-9 text-weight-medium custom-menu-list">
            <!-- 1. PROFIL -->
            <q-item clickable v-ripple to="/absensi/profil" active-class="active-menu-item">
              <q-item-section avatar>
                <q-icon name="account_circle" size="md" />
              </q-item-section>
              <q-item-section class="text-subtitle1">Profil</q-item-section>
            </q-item>

            <!-- 2. DASHBOARD -->
            <q-item clickable v-ripple to="/absensi/dashboard" active-class="active-menu-item">
              <q-item-section avatar>
                <q-icon name="dashboard" size="md" />
              </q-item-section>
              <q-item-section class="text-subtitle1">Dashboard</q-item-section>
            </q-item>

            <!-- 3. RIWAYAT ABSENSI -->
            <q-item clickable v-ripple to="/absensi/riwayat" active-class="active-menu-item">
              <q-item-section avatar>
                <q-icon name="history" size="md" />
              </q-item-section>
              <q-item-section class="text-subtitle1">Riwayat Absensi</q-item-section>
            </q-item>

            <!-- 4. PENGAJUAN CUTI/IZIN -->
            <q-item clickable v-ripple to="/absensi/pengajuan-izin" active-class="active-menu-item">
              <q-item-section avatar>
                <q-icon name="event_note" size="md" />
              </q-item-section>
              <q-item-section class="text-subtitle1">Pengajuan Cuti/Izin</q-item-section>
            </q-item>

            <q-separator q-my-md />

            <!-- 5. LOGOUT -->
            <q-item clickable v-ripple @click="handleLogout" class="text-negative">
              <q-item-section avatar>
                <q-icon name="logout" size="md" />
              </q-item-section>
              <q-item-section class="text-subtitle1 text-weight-bold">Logout</q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <!-- Footer Sidebar (Optional) -->
        <div class="q-pa-md text-center text-caption text-grey-5 border-top">
          v2.5.0-flash | PT AGRA
        </div>
      </div>
    </q-drawer>

    <!-- CONTENT AREA -->
    <q-page-container>
      <router-view />
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
    title: 'Konfirmasi Logout',
    message: 'Apakah Anda yakin ingin keluar dari sistem?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Logout',
      color: 'negative',
      unelevated: true,
    },
  }).onOk(() => {
    // Bersihkan data login (sesuaikan dengan sistem login kamu)
    localStorage.removeItem('user_data')
    // Redirect ke login atau portal utama
    router.push('/')
    $q.notify({
      message: 'Berhasil keluar.',
      color: 'grey-8',
      icon: 'logout',
    })
  })
}
</script>

<style scoped>
.custom-menu-list .q-item {
  border-radius: 0 32px 32px 0;
  margin-right: 12px;
  margin-bottom: 4px;
  min-height: 58px;
  color: #455a64;
}

.active-menu-item {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
  font-weight: 700 !important;
}

.active-menu-item .q-icon {
  color: #1976d2 !important;
}

.border-top {
  border-top: 1px solid #eeeeee;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}
</style>
