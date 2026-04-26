<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-xl">
    <div class="row justify-center">
      <div class="col-12 col-lg-10 col-xl-8">
        <!-- PROFILE HERO SECTION (GLASSMORPHISM) -->
        <q-card flat class="profile-hero shadow-10 overflow-hidden q-mb-xl">
          <div class="hero-overlay"></div>
          <q-card-section class="q-pa-xl row items-center no-wrap relative-position">
            <div class="col-auto">
              <div class="avatar-container shadow-5">
                <q-avatar size="140px" class="bg-white q-pa-xs">
                  <q-img
                    src="https://cdn.quasar.dev/img/avatar.png"
                    spinner-color="primary"
                    class="rounded-borders"
                  />
                  <q-btn
                    round
                    color="primary"
                    icon="photo_camera"
                    size="sm"
                    class="absolute-bottom-right shadow-2"
                  >
                    <q-tooltip>Ubah Foto Profil</q-tooltip>
                  </q-btn>
                </q-avatar>
              </div>
            </div>

            <div class="col q-ml-xl text-white">
              <div class="row items-center q-gutter-x-sm">
                <h3 class="text-weight-bolder q-ma-none letter-spacing-1 text-uppercase">
                  {{ user.nama }}
                </h3>
                <q-icon name="verified" color="blue-2" size="sm" />
              </div>
              <div class="text-h6 text-weight-light opacity-80">
                {{ user.jabatan || 'Senior Staff Operational' }}
              </div>

              <div class="row q-mt-md q-gutter-x-md">
                <q-badge outline color="blue-2" class="q-px-md q-py-xs text-weight-bold">
                  ID: AGRA-{{ user.nik || '09882' }}
                </q-badge>
                <q-badge outline color="light-green-11" class="q-px-md q-py-xs text-weight-bold">
                  STATUS: AKTIF
                </q-badge>
              </div>
            </div>

            <div class="col-auto self-start">
              <q-btn flat round color="white" icon="settings" class="bg-white-20">
                <q-menu transition-show="scale" transition-hide="scale">
                  <q-list style="min-width: 150px">
                    <q-item clickable v-ripple>
                      <q-item-section avatar><q-icon name="key" /></q-item-section>
                      <q-item-section>Ganti Password</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple class="text-negative">
                      <q-item-section avatar><q-icon name="logout" /></q-item-section>
                      <q-item-section>Keluar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-xl">
          <!-- DATA PRIBADI (KIRI) -->
          <div class="col-12 col-md-7">
            <q-card flat class="rounded-16 shadow-card bg-white full-height">
              <q-card-section class="q-pa-lg">
                <div class="row items-center q-mb-lg">
                  <div class="bg-indigo-1 rounded-8 q-pa-sm q-mr-md">
                    <q-icon name="person_outline" color="indigo" size="sm" />
                  </div>
                  <div class="text-h6 text-weight-bold text-blue-grey-9">
                    Detail Informasi Pribadi
                  </div>
                </div>

                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-sm-6" v-for="(info, index) in personalInfo" :key="index">
                    <div class="text-caption text-grey-6 text-uppercase letter-spacing-1 q-mb-xs">
                      {{ info.label }}
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-blue-grey-10 row items-center">
                      <q-icon :name="info.icon" color="grey-4" size="xs" class="q-mr-sm" />
                      {{ info.value }}
                    </div>
                    <q-separator class="q-mt-sm opacity-30" />
                  </div>
                </div>

                <div class="q-mt-xl">
                  <div class="text-caption text-grey-6 text-uppercase letter-spacing-1 q-mb-md">
                    Alamat Domisili
                  </div>
                  <div class="bg-grey-1 q-pa-md rounded-12 border-dashed">
                    <div class="row no-wrap">
                      <q-icon name="place" color="primary" size="sm" class="q-mr-md" />
                      <div class="text-subtitle2 text-grey-8 line-height-1-5">
                        Jl. Pasir Gombong No. 12, Cikarang Utara, Bekasi, Jawa Barat. 17530.
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- INFORMASI PEKERJAAN & KONTAK (KANAN) -->
          <div class="col-12 col-md-5">
            <div class="column q-gutter-y-lg">
              <!-- WORK CARD -->
              <q-card flat class="rounded-16 shadow-card bg-white">
                <q-card-section class="q-pa-lg">
                  <div class="row items-center q-mb-lg">
                    <div class="bg-orange-1 rounded-8 q-pa-sm q-mr-md">
                      <q-icon name="business_center" color="orange-9" size="sm" />
                    </div>
                    <div class="text-h6 text-weight-bold text-blue-grey-9">Data Kepegawaian</div>
                  </div>

                  <q-list padding class="q-pa-none">
                    <q-item
                      v-for="(work, index) in workInfo"
                      :key="index"
                      class="q-px-none q-py-md border-bottom-light"
                    >
                      <q-item-section avatar>
                        <q-avatar
                          :icon="work.icon"
                          color="grey-1"
                          text-color="grey-7"
                          size="40px"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption class="text-uppercase">{{ work.label }}</q-item-label>
                        <q-item-label class="text-weight-bold text-blue-grey-10">{{
                          work.value
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>

              <!-- EMERGENCY CONTACT -->
              <q-card
                flat
                class="rounded-16 shadow-card bg-primary text-white overflow-hidden relative-position"
              >
                <q-icon
                  name="contact_emergency"
                  size="120px"
                  class="absolute-right opacity-10 q-mr-n-xl q-mt-n-xl"
                />
                <q-card-section class="q-pa-lg">
                  <div class="text-subtitle1 text-weight-bold q-mb-md">Kontak Darurat</div>
                  <div class="text-h6 text-weight-bold">Siti Aisyah (Istri)</div>
                  <div class="text-subtitle2 opacity-80">+62 812-9988-1234</div>
                  <q-btn
                    unelevated
                    color="white"
                    text-color="primary"
                    icon="call"
                    label="HUBUNGI SEKARANG"
                    class="full-width q-mt-lg text-weight-bold rounded-12"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const user = ref({
  nama: 'Hafidz Agus Pratama',
  nik: '202611090',
  jabatan: 'Head of Operations',
})

const personalInfo = computed(() => [
  { label: 'Email Kantor', value: 'hafidz.pratama@agra.co.id', icon: 'alternate_email' },
  { label: 'Nomor Telepon', value: '+62 851-5667-0000', icon: 'phone_android' },
  { label: 'Tanggal Lahir', value: '12 Agustus 1996', icon: 'celebration' },
  { label: 'Jenis Kelamin', value: 'Laki-laki', icon: 'wc' },
  { label: 'Agama', value: 'Islam', icon: 'mosque' },
  { label: 'Pendidikan', value: 'S1 Teknik Industri', icon: 'school' },
])

const workInfo = computed(() => [
  { label: 'Departemen', value: 'Operations & Logistics', icon: 'lan' },
  { label: 'Lokasi Kerja', value: 'Kantor Pusat Agra', icon: 'location_on' },
  { label: 'Tanggal Bergabung', value: '01 Januari 2021', icon: 'event_available' },
  { label: 'Tipe Kontrak', value: 'Karyawan Tetap', icon: 'verified_user' },
])

onMounted(() => {
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      user.value.nama = parsed.nama || user.value.nama
      user.value.nik = parsed.nik || user.value.nik
      user.value.jabatan = parsed.jabatan || user.value.jabatan
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      console.warn('Gagal load data profil.')
    }
  }
})
</script>

<style scoped>
.profile-hero {
  border-radius: 24px;
  background: url('https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
  position: relative;
  min-height: 280px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.9) 0%, rgba(42, 82, 152, 0.7) 100%);
  backdrop-filter: blur(4px);
}

.avatar-container {
  padding: 5px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-8 {
  border-radius: 8px;
}

.shadow-card {
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.06) !important;
}

.bg-white-20 {
  background: rgba(255, 255, 255, 0.2);
}

.border-dashed {
  border: 1px dashed #ced4da;
}

.letter-spacing-1 {
  letter-spacing: 1.5px;
}

.line-height-1-5 {
  line-height: 1.6;
}

.border-bottom-light {
  border-bottom: 1px solid #f8f9fa;
}
.border-bottom-light:last-child {
  border-bottom: none;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #cfd8dc;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #b0bec5;
}
</style>
