<template>
  <q-layout view="hHh lpR fFf" class="bg-grey-2">
    <q-header elevated class="bg-indigo-10 text-white">
      <q-toolbar class="q-py-sm">
        <q-toolbar-title class="text-weight-bolder text-uppercase tracking-widest">
          Agra ERP
        </q-toolbar-title>

        <q-space />

        <div class="row items-center no-wrap">
          <div class="column items-end q-mr-md hide-on-mobile">
            <div class="text-subtitle2 text-weight-bold">Administrator</div>
            <div class="text-caption opacity-80">Agra Construction Group</div>
          </div>

          <q-separator vertical dark inset class="q-mx-sm" />

          <q-btn
            flat
            round
            dense
            icon="power_settings_new"
            color="white"
            size="lg"
            @click="handleLogout"
          >
            <q-tooltip class="bg-red text-white">Keluar dari Sistem</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-red-10 text-white border-top q-pa-sm">
      <div class="text-center text-caption text-weight-medium">
        © 2026 <span class="text-white text-weight-bold">AGRA CONSTRUCTION</span> - Internal ERP
        System
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { auth } from 'src/boot/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const handleLogout = () => {
  $q.dialog({
    title: '<span class="text-primary text-weight-bold">Konfirmasi Keluar</span>',
    message: 'Apakah Anda yakin ingin mengakhiri sesi ini?',
    html: true,
    cancel: {
      flat: true,
      label: 'Batal',
      color: 'grey-7',
    },
    ok: {
      unelevated: true,
      label: 'Ya, Keluar',
      color: 'negative',
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await signOut(auth)
      $q.notify({
        color: 'positive',
        message: 'Logout Berhasil. Sampai jumpa!',
        icon: 'check_circle',
        position: 'top',
      })
      router.push('/login')
    } catch (e) {
      $q.notify({
        color: 'negative',
        message: 'Gagal Logout: ' + e.message,
        icon: 'error',
      })
    }
  })
}
</script>

<style scoped>
.opacity-70 {
  opacity: 0.7;
}
.opacity-80 {
  opacity: 0.8;
}
.tracking-widest {
  letter-spacing: 2px;
}
.border-top {
  border-top: 1px solid #ddd;
}

/* Sembunyikan nama user kalau di layar HP kecil banget */
@media (max-width: 400px) {
  .hide-on-mobile {
    display: none;
  }
}
</style>
