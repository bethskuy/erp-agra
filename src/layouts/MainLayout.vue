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

    <q-dialog v-model="showUpdateDialog" persistent>
      <q-card class="update-dialog">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-weight-bold text-primary">Update APK Tersedia</div>
          <div class="text-body2 text-grey-8 q-mt-sm">
            Versi baru aplikasi tersedia untuk Android.
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-body2 q-mb-sm">
            Versi saat ini: <span class="text-weight-bold">{{ currentAppVersion }}</span>
          </div>
          <div class="text-body2 q-mb-sm">
            Versi terbaru: <span class="text-weight-bold">{{ updateInfo.version }}</span>
          </div>
          <div v-if="updateInfo.notes" class="text-body2 text-grey-8">
            {{ updateInfo.notes }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Nanti" color="grey-7" @click="showUpdateDialog = false" />
          <q-btn
            unelevated
            color="primary"
            label="Install Update APK"
            :loading="isInstallingUpdate"
            @click="installApkUpdate"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import { Capacitor } from '@capacitor/core'
import { auth } from 'src/boot/firebase'
import { signOut } from 'firebase/auth'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const UPDATE_MANIFEST_URL = 'https://raw.githubusercontent.com/bethskuy/erp-agra/refs/heads/main/public/version.json'

const FALLBACK_APK_URL = 'https://agra-erp.vercel.app/app-debug.apk'

const showUpdateDialog = ref(false)
const isCheckingUpdate = ref(false)
const isInstallingUpdate = ref(false)
const dismissedUpdateVersion = ref('')
const updateInfo = ref({
  version: '',
  apk: '',
  notes: '',
})

const currentAppVersion = computed(
  () => import.meta.env.APP_VERSION || import.meta.env.PACKAGE_VERSION || '0.0.0',
)
const isNativeAndroid = computed(
  () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android',
)
const isAndroidClient = computed(
  () => isNativeAndroid.value || /android/i.test(window.navigator.userAgent || ''),
)

const normalizeVersion = (version) =>
  String(version || '')
    .trim()
    .replace(/^v/i, '')

const compareVersions = (currentVersion, nextVersion) => {
  const currentParts = normalizeVersion(currentVersion)
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0)
  const nextParts = normalizeVersion(nextVersion)
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0)
  const maxLength = Math.max(currentParts.length, nextParts.length)

  for (let index = 0; index < maxLength; index += 1) {
    const currentPart = currentParts[index] || 0
    const nextPart = nextParts[index] || 0

    if (nextPart > currentPart) {
      return 1
    }

    if (nextPart < currentPart) {
      return -1
    }
  }

  return 0
}

const resolveAbsoluteUrl = (url) => new URL(url, window.location.origin).toString()

const openExternalUrl = async (url) => {
  const popup = window.open(url, '_blank', 'noopener,noreferrer')

  if (!popup) {
    window.location.href = url
  }
}

const fetchUpdateManifest = async () => {
  const response = await fetch(`${UPDATE_MANIFEST_URL}?t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Gagal memuat manifest update (${response.status})`)
  }

  return response.json()
}

const checkForAppUpdate = async () => {
  if (isCheckingUpdate.value || !isAndroidClient.value) {
    return
  }

  isCheckingUpdate.value = true

  try {
    const manifest = await fetchUpdateManifest()
    const remoteVersion = normalizeVersion(manifest?.version)
    const remoteApkUrl = manifest?.apk ? resolveAbsoluteUrl(manifest.apk) : ''

    if (!remoteVersion || !remoteApkUrl) {
      return
    }

    const hasNewerVersion = compareVersions(currentAppVersion.value, remoteVersion) < 0
    const isDismissed = dismissedUpdateVersion.value === remoteVersion

    if (!hasNewerVersion || isDismissed) {
      return
    }

    updateInfo.value = {
      version: remoteVersion,
      apk: remoteApkUrl,
      notes: manifest?.notes || '',
    }
    showUpdateDialog.value = true
  } catch (error) {
    console.error('Update check gagal:', error)
  } finally {
    isCheckingUpdate.value = false
  }
}

const installApkUpdate = async () => {
  const apkUrl = updateInfo.value.apk || resolveAbsoluteUrl(FALLBACK_APK_URL)

  if (!apkUrl) {
    $q.notify({
      color: 'negative',
      message: 'Link APK update tidak ditemukan.',
      icon: 'error',
      position: 'top',
    })
    return
  }

  isInstallingUpdate.value = true

  try {
    await openExternalUrl(apkUrl)
    showUpdateDialog.value = false
    dismissedUpdateVersion.value = updateInfo.value.version

    $q.notify({
      color: 'info',
      message: isNativeAndroid.value
        ? 'Download APK dimulai. Lanjutkan instalasi dari browser Android Anda.'
        : 'Halaman download APK dibuka.',
      icon: 'system_update_alt',
      position: 'top',
      timeout: 3500,
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: `Gagal membuka link update: ${error.message}`,
      icon: 'error',
      position: 'top',
    })
  } finally {
    isInstallingUpdate.value = false
  }
}

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

onMounted(() => {
  checkForAppUpdate()
})
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
.update-dialog {
  width: min(92vw, 420px);
  border-radius: 20px;
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
