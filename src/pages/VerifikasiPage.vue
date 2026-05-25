<template>
  <div class="bg-slate-100 min-height-screen flex flex-center q-pa-md font-pro">
    <!-- Header Atas -->
    <div
      class="absolute-top bg-white q-py-md q-px-lg shadow-sm flex items-center justify-between full-width border-bottom-subtle"
    >
      <div class="row items-center q-gutter-sm">
        <q-icon name="verified_user" color="teal-7" size="sm" />
        <span class="text-subtitle2 text-weight-bold text-blue-grey-10"
          >PORTAL VERIFIKASI RESMI</span
        >
      </div>
      <div class="text-caption text-weight-bold text-indigo-10">PT AGRA ABHINAYA PERKASA</div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center q-mt-xl">
      <q-spinner-oval color="primary" size="50px" />
      <div class="text-subtitle2 q-mt-md text-grey-7">
        Menghubungkan ke database terenkripsi AGRA...
      </div>
    </div>

    <!-- Data Karyawan Terbuka -->
    <div
      v-else-if="karyawan"
      class="q-mt-xl text-center animate-fade-up"
      style="max-width: 450px; width: 100%"
    >
      <q-card flat bordered class="rounded-24 shadow-24 bg-white overflow-hidden border-subtle">
        <div class="bg-teal-50 q-py-md q-px-lg flex flex-center border-bottom-subtle">
          <div class="row items-center q-gutter-md text-teal-10">
            <q-icon name="check_circle" size="md" />
            <div class="text-left">
              <div class="text-subtitle2 text-weight-bolder leading-none">
                KARYAWAN TERVERIFIKASI
              </div>
              <div class="text-caption text-weight-medium">
                Tercatat Aktif di Database Cloud ERP
              </div>
            </div>
          </div>
        </div>

        <div class="q-pt-xl q-pb-md flex flex-center">
          <div class="profile-verified-photo-box shadow-md">
            <img
              :src="karyawan.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'"
              class="profile-verified-img"
            />
          </div>
        </div>

        <q-card-section class="q-px-lg q-pt-none">
          <div class="text-h5 text-weight-bolder text-blue-grey-10 uppercase q-mb-xs">
            {{ karyawan.nama }}
          </div>
          <div class="text-subtitle2 text-weight-bold text-indigo-10 q-mb-md">
            {{ karyawan.jabatan }}
          </div>

          <q-separator inset class="q-my-md" />

          <div class="text-left q-gutter-y-sm">
            <div class="row items-center justify-between q-py-xs border-bottom-subtle">
              <span class="text-caption text-grey-6 text-weight-bold"
                >Nomor Induk Karyawan (NIK)</span
              >
              <span class="text-body2 text-weight-bold font-mono text-indigo-10">{{
                karyawan.nik
              }}</span>
            </div>
            <div class="row items-center justify-between q-py-xs border-bottom-subtle">
              <span class="text-caption text-grey-6 text-weight-bold">Divisi Bisnis</span>
              <span class="text-body2 text-weight-bold text-blue-grey-9 uppercase">{{
                karyawan.divisi
              }}</span>
            </div>
            <div class="row items-center justify-between q-py-xs border-bottom-subtle">
              <span class="text-caption text-grey-6 text-weight-bold">Masa Kerja</span>
              <span class="text-body2 text-weight-bold text-blue-grey-9">{{
                formatDateIndo(karyawan.tglMasuk)
              }}</span>
            </div>
            <div class="row items-start justify-between q-py-xs border-bottom-subtle">
              <span class="text-caption text-grey-6 text-weight-bold q-pt-xs"
                >Lokasi Dinas Aktif</span
              >
              <div class="text-right">
                <template v-if="Array.isArray(karyawan.lokasi_dinas)">
                  <q-badge
                    v-for="loc in karyawan.lokasi_dinas"
                    :key="loc"
                    color="teal-1"
                    text-color="teal-10"
                    class="q-px-sm q-py-xs text-weight-bold q-ml-xs q-mb-xs"
                  >
                    <q-icon name="place" size="10px" class="q-mr-xs" />{{ loc }}
                  </q-badge>
                </template>
                <template v-else-if="karyawan.lokasi_dinas">
                  <q-badge
                    color="teal-1"
                    text-color="teal-10"
                    class="q-px-sm q-py-xs text-weight-bold"
                  >
                    <q-icon name="place" size="10px" class="q-mr-xs" />{{ karyawan.lokasi_dinas }}
                  </q-badge>
                </template>
              </div>
            </div>
            <div class="row items-center justify-between q-py-xs">
              <span class="text-caption text-grey-6 text-weight-bold">Status Kepegawaian</span>
              <q-badge
                color="positive"
                class="q-px-md q-py-xs text-weight-bold rounded-pill text-overline"
                >AKTIF</q-badge
              >
            </div>
          </div>
        </q-card-section>

        <div class="bg-blue-grey-1 q-py-md text-caption text-grey-6 text-center border-top">
          Sistem Informasi SDM Terintegrasi AGRA ERP<br />
          <span class="font-bold text-indigo-10">Valid &amp; Tercatat Resmi</span>
        </div>
      </q-card>
    </div>

    <!-- Error State -->
    <div v-else class="text-center animate-fade-up">
      <q-icon name="error_outline" color="negative" size="64px" />
      <div class="text-h6 q-mt-md text-red-7">Verifikasi Profil Gagal</div>
      <div class="text-caption text-grey-6 q-px-md">
        ID Karyawan tidak terdaftar atau telah dinonaktifkan dari PT AGRA ABHINAYA PERKASA.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db, auth } from 'src/boot/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'

const route = useRoute()
const karyawan = ref(null)
const loading = ref(true)

const formatDateIndo = (d) =>
  d && d !== '-'
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-'

onMounted(async () => {
  const publicId = route.params.id
  if (publicId) {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth)
      }
      const docRef = doc(db, 'karyawan', publicId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        karyawan.value = docSnap.data()
      }
    } catch (err) {
      console.error('Error fetching public data:', err)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.min-height-screen {
  min-height: 100vh;
}
.rounded-24 {
  border-radius: 24px;
}
.border-subtle {
  border: 1px solid #f1f5f9 !important;
}
.border-bottom-subtle {
  border-bottom: 1px solid #f1f5f9 !important;
}
.profile-verified-photo-box {
  width: 140px;
  height: 140px;
  border: 4px solid #009688;
  border-radius: 50%;
  overflow: hidden;
  background: #f8fafc;
}
.profile-verified-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
