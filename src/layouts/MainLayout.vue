<template>
  <q-layout view="hHh lpR fFf" class="app-layout app-layout--main">
    <div class="layout-bg" aria-hidden="true">
      <div class="layout-glow layout-glow-a"></div>
      <div class="layout-glow layout-glow-b"></div>
      <div class="layout-glow layout-glow-c"></div>
      <div class="layout-grid"></div>
    </div>

    <!-- Header -->
    <q-header elevated class="app-header app-header--main text-white">
      <q-toolbar class="q-py-sm app-toolbar">
        <q-toolbar-title class="text-weight-bolder text-uppercase tracking-widest app-brand">
          Agra ERP
        </q-toolbar-title>

        <q-space />

        <div class="row items-center no-wrap">
          <div class="column items-end q-mr-md hide-on-mobile app-user-meta">
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

    <q-page-container class="app-page-container">
      <router-view />
    </q-page-container>

    <!-- FOOTER CREDIT (PERBAIKAN: Warna putih agar menyatu dengan background)
    <q-footer class="bg-white text-blue-grey-4 q-pa-md border-top-subtle">
      <div class="text-center text-caption text-weight-bold tracking-widest uppercase">
        © 2026 <span class="text-blue-grey-9 text-weight-bolder">AGRA CONSTRUCTION</span> - Internal
        ERP System
      </div>
    </q-footer> -->
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
      rounded: true,
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
.app-layout {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 12%, rgba(16, 185, 129, 0.14), transparent 24%),
    radial-gradient(circle at 80% 18%, rgba(59, 130, 246, 0.11), transparent 28%),
    radial-gradient(circle at 50% 100%, rgba(6, 95, 70, 0.08), transparent 34%),
    linear-gradient(180deg, #eef6f1 0%, #f6faf8 48%, #f9fbfb 100%);
}
.app-layout--main {
  isolation: isolate;
}
.layout-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.layout-grid {
  position: absolute;
  inset: 0;
  opacity: 0.32;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.16) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(circle at center, black 24%, transparent 78%);
  animation: gridDrift 36s linear infinite;
}
.layout-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.55;
  animation: floatBlob 14s ease-in-out infinite;
}
.layout-glow-a {
  width: 380px;
  height: 380px;
  top: -120px;
  left: -110px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.42), rgba(16, 185, 129, 0));
}
.layout-glow-b {
  width: 320px;
  height: 320px;
  top: 18%;
  right: -100px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.3), rgba(14, 165, 233, 0));
  animation-delay: -4s;
}
.layout-glow-c {
  width: 460px;
  height: 460px;
  bottom: -180px;
  left: 28%;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0));
  animation-delay: -8s;
}
.app-header {
  position: relative;
  z-index: 2;
  backdrop-filter: blur(16px);
}
.app-header--main {
  background:
    linear-gradient(135deg, rgba(11, 61, 46, 0.96), rgba(9, 102, 74, 0.94), rgba(4, 78, 59, 0.96)),
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 28%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 36px rgba(3, 44, 34, 0.2);
  background-size: 220% 220%;
  animation: gradientMove 18s ease infinite;
}
.app-toolbar {
  min-height: 66px;
}
.app-brand {
  letter-spacing: 2px;
}
.app-user-meta {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}
.app-page-container {
  position: relative;
  z-index: 1;
}
.opacity-70 {
  opacity: 0.7;
}
.opacity-80 {
  opacity: 0.8;
}
.tracking-widest {
  letter-spacing: 2px;
}
.border-top-subtle {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes floatBlob {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(20px, 16px, 0) scale(1.08);
  }
}

@keyframes gridDrift {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-72px, -72px, 0);
  }
}

/* Sembunyikan nama user kalau di layar HP kecil banget */
@media (max-width: 400px) {
  .hide-on-mobile {
    display: none;
  }
}
</style>
