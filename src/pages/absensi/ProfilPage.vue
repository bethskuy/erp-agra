<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg font-inter">
    <div class="premium-container q-mx-auto">
      <!-- ========================================== -->
      <!-- BAGIAN 1: HEADER PROFIL MODERN (CLEAN SAAS)-->
      <!-- ========================================== -->
      <q-card flat class="bento-card bg-white q-mb-xl relative-position overflow-hidden">
        <!-- Dekorasi Background Halus -->
        <div class="bg-decor top-right"></div>
        <div class="bg-decor bottom-left"></div>

        <q-card-section class="q-pa-lg q-pa-md-xl relative-position z-content">
          <div class="row items-center q-col-gutter-lg">
            <!-- Avatar & Kamera -->
            <div class="col-12 col-sm-auto flex justify-center justify-sm-start">
              <div class="avatar-wrapper">
                <q-avatar size="130px" class="profile-avatar shadow-soft">
                  <q-img
                    v-if="user.fotoUrl || user.foto_profil"
                    :src="user.fotoUrl || user.foto_profil"
                    class="absolute-full"
                  />
                  <span v-else class="text-h2 text-weight-bolder text-primary font-mono">
                    {{ user.nama ? user.nama.substring(0, 1).toUpperCase() : 'U' }}
                  </span>
                </q-avatar>
                <!-- Tombol Kamera Mengambang -->
                <q-btn
                  round
                  color="primary"
                  icon="add_a_photo"
                  size="14px"
                  class="btn-camera shadow-primary transition-smooth"
                  @click="triggerUpload"
                >
                  <q-tooltip class="bg-primary">Ubah Foto Profil</q-tooltip>
                </q-btn>
                <input
                  type="file"
                  ref="fileInput"
                  class="hidden"
                  accept="image/*"
                  @change="onFileChange"
                />
              </div>
            </div>

            <!-- Teks Identitas -->
            <div class="col-12 col-sm text-center text-sm-left">
              <!-- FIX: Membuat nama dan ikon inline agar bisa turun baris rapi dan font responsif -->
              <div class="q-mb-xs" style="word-wrap: break-word; word-break: break-word">
                <span class="profile-name text-blue-grey-10 text-uppercase">
                  {{ user.nama || 'Memuat Data...' }}
                </span>
                <q-icon
                  name="verified"
                  color="teal-5"
                  size="24px"
                  class="q-ml-sm vertical-middle"
                  style="margin-top: -6px"
                />
              </div>

              <div
                class="text-subtitle1 text-blue-grey-6 text-weight-medium q-mb-md letter-spacing-1 q-mt-sm"
              >
                AGRA ERP <span class="q-mx-sm">•</span>
                <span class="text-primary text-weight-bold">{{
                  user.jabatan || user.role || 'Staff'
                }}</span>
              </div>

              <div class="row justify-center justify-sm-start q-gutter-sm">
                <q-badge
                  outline
                  color="blue-grey-4"
                  class="q-px-md q-py-sm rounded-8 text-weight-bold text-subtitle2 bg-grey-1"
                >
                  <q-icon name="tag" size="16px" class="q-mr-xs" /> NIK:
                  {{ user.nik || 'Belum Diatur' }}
                </q-badge>
                <q-badge
                  color="teal-1"
                  text-color="teal-8"
                  class="q-px-md q-py-sm rounded-8 text-weight-bold text-subtitle2"
                >
                  <q-icon name="check_circle" size="16px" class="q-mr-xs" /> STATUS: AKTIF
                </q-badge>
              </div>
            </div>

            <!-- Tombol Edit -->
            <div class="col-12 col-md-auto flex justify-center justify-md-end q-mt-md q-md-mt-none">
              <q-btn
                unelevated
                color="blue-grey-9"
                icon="edit_note"
                label="EDIT PROFIL"
                class="rounded-12 text-weight-bolder shadow-soft q-px-lg q-py-sm transition-smooth"
                @click="openEditDialog"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ========================================== -->
      <!-- BAGIAN 2: GRID INFORMASI BENTO             -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg">
        <!-- KOLOM KIRI: DATA PERSONALIA -->
        <div class="col-12 col-lg-8">
          <q-card flat class="bento-card bg-white full-height q-pa-lg q-pa-md-xl">
            <div class="row items-center justify-between q-mb-xl border-bottom-light q-pb-md">
              <div>
                <div class="text-h6 text-weight-bolder text-blue-grey-9">Informasi Personalia</div>
                <div class="text-caption text-blue-grey-5 text-weight-medium">
                  Data pokok karyawan yang terdaftar di sistem.
                </div>
              </div>
              <q-icon name="admin_panel_settings" size="md" color="blue-grey-2" />
            </div>

            <div class="row q-col-gutter-xl">
              <!-- Render Mini Bento Info Cards -->
              <div class="col-12 col-sm-6" v-for="(info, index) in displayFields" :key="index">
                <div class="row items-center no-wrap transition-smooth hover-scale">
                  <div
                    class="ios-icon-box q-mr-md"
                    :class="'bg-' + info.color + '-50 text-' + info.color + '-6'"
                  >
                    <q-icon :name="info.icon" size="24px" />
                  </div>
                  <div class="col overflow-hidden">
                    <div
                      class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                    >
                      {{ info.label }}
                    </div>
                    <div class="text-subtitle1 text-blue-grey-10 text-weight-bolder ellipsis">
                      {{ info.value || 'Belum Diatur' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <!-- KOLOM KANAN: DOMISILI & KONTAK DARURAT -->
        <div class="col-12 col-lg-4 flex column q-gutter-y-lg">
          <!-- Card Domisili -->
          <q-card flat class="bento-card bg-white col flex column">
            <q-card-section class="q-pa-lg">
              <div class="row items-center q-mb-md">
                <div class="ios-icon-box small bg-blue-50 text-blue-6 q-mr-sm">
                  <q-icon name="location_on" size="18px" />
                </div>
                <div class="text-subtitle1 text-weight-bold text-blue-grey-9">Alamat Domisili</div>
              </div>

              <div class="bg-slate-50 q-pa-md rounded-12 border-grey full-height relative-position">
                <div
                  class="text-body2 text-blue-grey-8 line-height-relaxed text-weight-medium z-content relative-position"
                >
                  {{
                    user.alamat ||
                    'Alamat domisili belum diatur. Silakan perbarui melalui menu Edit Profil.'
                  }}
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Card Kontak Darurat -->
          <q-card
            flat
            class="bento-card bg-red-50 text-red-9 col flex column border-red-100 overflow-hidden relative-position"
          >
            <div class="absolute-top-right q-pa-md opacity-20">
              <q-icon name="health_and_safety" size="80px" color="red-5" />
            </div>

            <q-card-section
              class="q-pa-lg relative-position z-content full-height flex column justify-center"
            >
              <div class="row items-center q-mb-lg">
                <q-icon name="emergency" size="sm" color="red-6" class="q-mr-sm" />
                <div
                  class="text-subtitle1 text-weight-bolder letter-spacing-1 uppercase text-red-8"
                >
                  Kontak Darurat
                </div>
              </div>

              <div class="q-mb-md">
                <div
                  class="text-caption text-red-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                >
                  Nama Kerabat / Keluarga
                </div>
                <div class="text-h6 text-weight-black text-red-9 line-height-tight">
                  {{ user.emergency_name || 'BELUM DIATUR' }}
                </div>
              </div>

              <div>
                <div
                  class="text-caption text-red-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                >
                  Nomor Telepon Hubung
                </div>
                <div class="text-h6 text-weight-black text-red-9 font-mono">
                  {{ user.emergency_phone || '---' }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- DIALOG EDIT PROFIL (GLASSMORPHISM)         -->
    <!-- ========================================== -->
    <q-dialog v-model="editDialog" persistent backdrop-filter="blur(8px)">
      <q-card style="width: 700px; max-width: 95vw" class="rounded-24 shadow-soft">
        <!-- Header Dialog -->
        <q-card-section class="row items-center q-px-lg q-pt-lg q-pb-sm">
          <div class="row items-center">
            <div class="ios-icon-box bg-blue-50 text-primary q-mr-md">
              <q-icon name="manage_accounts" size="28px" />
            </div>
            <div>
              <div class="text-h6 text-weight-bolder text-blue-grey-10 line-height-tight">
                Perbarui Profil
              </div>
              <div class="text-caption text-blue-grey-5">Sesuaikan informasi pribadi Anda.</div>
            </div>
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            color="blue-grey-4"
            class="bg-grey-1 transition-smooth"
          />
        </q-card-section>

        <!-- Form Section -->
        <q-card-section class="q-pa-lg">
          <div
            class="text-subtitle2 text-weight-bold text-blue-grey-8 q-mb-sm uppercase letter-spacing-1"
          >
            Informasi Dasar
          </div>
          <q-input
            v-model="tempUser.nama"
            label="Nama Lengkap"
            outlined
            class="rounded-input q-mb-md"
            color="primary"
          >
            <template v-slot:prepend><q-icon name="person" color="blue-grey-4" /></template>
          </q-input>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="tempUser.email"
                label="Email Login"
                outlined
                class="rounded-input bg-grey-1"
                color="primary"
                readonly
                hint="Hubungi admin untuk ubah email"
              >
                <template v-slot:prepend><q-icon name="email" color="blue-grey-4" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="tempUser.nik"
                label="NIK Karyawan"
                outlined
                class="rounded-input bg-grey-1"
                color="primary"
                readonly
                hint="Data NIK terkunci oleh HRD"
              >
                <template v-slot:prepend><q-icon name="badge" color="blue-grey-4" /></template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="tempUser.jabatan"
                label="Jabatan / Posisi"
                outlined
                class="rounded-input bg-grey-1"
                color="primary"
                readonly
              >
                <template v-slot:prepend><q-icon name="work" color="blue-grey-4" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="tempUser.hp"
                label="Nomor Telepon Pribadi"
                outlined
                class="rounded-input"
                color="primary"
              >
                <template v-slot:prepend
                  ><q-icon name="phone_iphone" color="blue-grey-4"
                /></template>
              </q-input>
            </div>
          </div>

          <q-input
            v-model="tempUser.alamat"
            label="Alamat Lengkap Domisili"
            outlined
            type="textarea"
            rows="3"
            class="rounded-input q-mb-xl"
            color="primary"
          >
            <template v-slot:prepend><q-icon name="home" color="blue-grey-4" /></template>
          </q-input>

          <div
            class="text-subtitle2 text-weight-bold text-red-7 q-mb-sm uppercase letter-spacing-1 row items-center"
          >
            <q-icon name="emergency" size="18px" class="q-mr-xs" /> Kontak Darurat
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="tempUser.emergency_name"
                label="Nama Keluarga/Kerabat"
                outlined
                class="rounded-input"
                color="red-5"
              >
                <template v-slot:prepend><q-icon name="group" color="blue-grey-4" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="tempUser.emergency_phone"
                label="Nomor Telepon Darurat"
                outlined
                class="rounded-input"
                color="red-5"
              >
                <template v-slot:prepend><q-icon name="call" color="blue-grey-4" /></template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <!-- Footer -->
        <q-card-actions align="right" class="q-pa-lg bg-slate-50 border-top">
          <q-btn
            flat
            label="BATAL"
            color="blue-grey-6"
            v-close-popup
            class="text-weight-bold rounded-8 q-px-md transition-smooth"
          />
          <q-btn
            unelevated
            label="SIMPAN PERUBAHAN"
            color="primary"
            @click="saveProfile"
            class="q-px-xl q-py-sm text-weight-bolder shadow-soft-primary rounded-12 transition-smooth"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const $q = useQuasar()
const fileInput = ref(null)
const editDialog = ref(false)

const user = ref({
  id: '',
  nama: '',
  nik: '',
  jabatan: '',
  role: '',
  email: '',
  hp: '',
  alamat: '',
  fotoUrl: '',
  foto_profil: '',
  emergency_name: '',
  emergency_phone: '',
  akses: [],
})

const tempUser = ref({})

// Array untuk Mini Bento Info
const displayFields = computed(() => [
  { label: 'Email Terdaftar', value: user.value.email, icon: 'alternate_email', color: 'blue' },
  { label: 'Nomor Telepon', value: user.value.hp, icon: 'smartphone', color: 'teal' },
  {
    label: 'Jabatan Aktif',
    value: user.value.jabatan || user.value.role,
    icon: 'work_outline',
    color: 'indigo',
  },
  { label: 'Unit NIK', value: user.value.nik, icon: 'badge', color: 'deep-purple' },
])

const syncProfileData = () => {
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      user.value = { ...user.value, ...parsed }

      if (user.value.email) {
        const q = query(collection(db, 'karyawan'), where('email', '==', user.value.email))
        onSnapshot(
          q,
          (snap) => {
            if (!snap.empty) {
              const docData = snap.docs[0]
              const data = docData.data()

              user.value = {
                ...user.value,
                ...data,
                id: docData.id,
              }
              localStorage.setItem('user_data', JSON.stringify(user.value))
            }
          },
          (error) => {
            console.warn('Real-time sync error:', error)
          },
        )
      }
    } catch (e) {
      console.error('Gagal memuat profil:', e)
    }
  }
}

const openEditDialog = () => {
  tempUser.value = { ...user.value }
  editDialog.value = true
}

const saveProfile = async () => {
  $q.loading.show()
  try {
    const namaKapital = tempUser.value.nama.trim().toUpperCase()

    if (user.value.id) {
      const userRef = doc(db, 'karyawan', user.value.id)
      await updateDoc(userRef, {
        nama: namaKapital,
        hp: tempUser.value.hp || '',
        alamat: tempUser.value.alamat || '',
        emergency_name: tempUser.value.emergency_name || '',
        emergency_phone: tempUser.value.emergency_phone || '',
      })
    }

    user.value = {
      ...user.value,
      ...tempUser.value,
      nama: namaKapital,
    }
    localStorage.setItem('user_data', JSON.stringify(user.value))

    $q.notify({
      color: 'positive',
      message: 'Profil berhasil diperbarui & disinkronkan!',
      position: 'top',
      icon: 'check_circle',
      classes: 'rounded-12 text-weight-bold',
    })

    editDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Gagal menyimpan profil: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}

const triggerUpload = () => fileInput.value.click()

const onFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  $q.loading.show({ message: 'Mengunggah foto profil...' })
  try {
    // 1. Upload ke Firebase Storage
    const fRef = storageRef(storage, `karyawan/avatars/${Date.now()}_${file.name}`)
    await uploadBytes(fRef, file)
    const url = await getDownloadURL(fRef)

    // 2. Simpan URL ke Firestore
    if (user.value.id) {
      await updateDoc(doc(db, 'karyawan', user.value.id), {
        fotoUrl: url,
        foto_profil: url,
      })
    }

    // 3. Update Local State & Session
    user.value.fotoUrl = url
    localStorage.setItem('user_data', JSON.stringify(user.value))

    $q.notify({
      color: 'positive',
      message: 'Foto profil berhasil diubah!',
      icon: 'photo_camera',
      classes: 'rounded-12 text-weight-bold',
    })
  } catch (error) {
    console.error('Upload error:', error)
    $q.notify({ color: 'negative', message: 'Gagal mengunggah foto profil.' })
  } finally {
    $q.loading.hide()
    if (fileInput.value) fileInput.value.value = ''
  }
}

onMounted(() => {
  syncProfileData()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');

/* GLOBAL TYPOGRAPHY */
.font-inter {
  font-family: 'Inter', sans-serif;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.line-height-tight {
  line-height: 1.2;
}
.line-height-relaxed {
  line-height: 1.6;
}
.uppercase {
  text-transform: uppercase;
}

/* LAYOUTING & BENTO GRID */
.premium-container {
  max-width: 1200px;
  width: 100%;
}
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.border-top {
  border-top: 1px solid #f1f5f9;
}
.border-bottom-light {
  border-bottom: 1px solid #f8fafc;
}
.border-grey {
  border: 1px solid #e2e8f0;
}
.border-red-100 {
  border: 1px solid #fee2e2;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.z-content {
  position: relative;
  z-index: 2;
}
.opacity-20 {
  opacity: 0.2;
}

/* SHADOWS & RADIUS */
.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(25, 118, 210, 0.5) !important;
}
.shadow-primary {
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3) !important;
}
.rounded-24 {
  border-radius: 24px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-8 {
  border-radius: 8px;
}

/* ANIMATION */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.transition-smooth:hover {
  transform: translateY(-2px);
}
.hover-scale:hover {
  transform: translateX(4px);
}

/* CUSTOM COMPONENTS: HEADER & AVATAR */
.bg-decor {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 0;
}
.bg-decor.top-right {
  top: -100px;
  right: -100px;
  background: rgba(59, 130, 246, 0.08);
}
.bg-decor.bottom-left {
  bottom: -100px;
  left: -100px;
  background: rgba(16, 185, 129, 0.05);
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  padding: 6px;
  background: white;
  border-radius: 50%;
  border: 1px solid #f1f5f9;
}
.profile-avatar {
  border: 1px solid #e2e8f0;
}
.btn-camera {
  position: absolute;
  bottom: 0;
  right: 0;
  border: 3px solid #ffffff;
}

.profile-name {
  font-size: 2.2rem;
  font-weight: 900;
  display: inline;
  letter-spacing: -1px;
}

/* RESPONSIVE FONT SIZE FOR MOBILE */
@media (max-width: 599px) {
  .profile-name {
    font-size: 1.5rem;
    letter-spacing: -0.5px;
  }
}

/* APPLE-STYLE ICONS */
.ios-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ios-icon-box.small {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

/* CUSTOM INPUTS */
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
}
</style>
