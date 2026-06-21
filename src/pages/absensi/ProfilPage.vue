<template>
  <q-page class="neo-page-bg q-pa-md q-pa-lg font-inter">
    <!-- Decorative Floating Neo-Brutalist Shapes -->
    <div class="neo-decorations-container">
      <div class="neo-shape neo-shape--circle-1"></div>
      <div class="neo-shape neo-shape--circle-2"></div>
      <div class="neo-shape neo-shape--square-1"></div>
      <div class="neo-shape neo-shape--square-2"></div>
      <div class="neo-shape neo-shape--star-1">★</div>
      <div class="neo-shape neo-shape--star-2">★</div>
      <div class="neo-shape neo-shape--triangle-1">▲</div>
      <div class="neo-shape neo-shape--triangle-2">▲</div>
      <div class="neo-shape neo-shape--cross-1">+</div>
      <div class="neo-shape neo-shape--cross-2">+</div>
      <div class="neo-shape neo-shape--cross-3">+</div>
      <div class="neo-shape neo-shape--blob-1"></div>
    </div>

    <div class="premium-container q-mx-auto">
      <!-- ========================================== -->
      <!-- BAGIAN 1: HEADER PROFIL NEO-BRUTALIST      -->
      <!-- ========================================== -->
      <q-card flat class="neo-card q-mb-xl overflow-hidden bg-white header-entrance">
        <q-card-section class="q-pa-lg q-pa-md-xl relative-position z-content">
          <div class="row items-center q-col-gutter-lg">
            <!-- Avatar & Kamera -->
            <div class="col-12 col-sm-auto flex justify-center justify-sm-start">
              <div class="avatar-wrapper neo-avatar-border relative-position" style="border-radius: 50%;">
                <q-avatar size="130px" class="profile-avatar shadow-soft" style="border: 2px solid #0f172a; overflow: hidden; border-radius: 50%;">
                  <q-img
                    v-if="user.fotoUrl || user.foto_profil"
                    :src="user.fotoUrl || user.foto_profil"
                    class="absolute-full"
                    style="border-radius: 50%; overflow: hidden;"
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
                  class="btn-camera neo-btn transition-smooth"
                  style="background: #ea580c !important;"
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
              <div class="q-mb-xs" style="word-wrap: break-word; word-break: break-word">
                <span class="profile-name text-blue-grey-10 text-uppercase text-weight-black">
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
                  color="blue-grey-9"
                  class="q-px-md q-py-sm rounded-8 text-weight-bold text-subtitle2 bg-white"
                  style="border: 2px solid #0f172a; box-shadow: 2px 2px 0px #0f172a;"
                >
                  <q-icon name="tag" size="16px" class="q-mr-xs" /> NIK:
                  {{ user.nik || 'Belum Diatur' }}
                </q-badge>
                <q-badge
                  color="teal-1"
                  text-color="teal-9"
                  class="q-px-md q-py-sm rounded-8 text-weight-bold text-subtitle2"
                  style="border: 2px solid #0f172a; box-shadow: 2px 2px 0px #0f172a;"
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
                class="neo-btn text-weight-bolder q-px-lg q-py-sm transition-smooth"
                @click="openEditDialog"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ========================================== -->
      <!-- BAGIAN 2: BENTO GRID SYMMETRIC             -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-xl table-entrance">
        <!-- CARD 1: AKUN & KONTAK -->
        <div class="col-12 col-md-6">
          <q-card flat class="neo-card full-height flex column">
            <q-card-section class="q-pa-lg neo-table-toolbar bg-white row items-center justify-between">
              <div class="row items-center">
                <div class="ios-icon-box small bg-blue-50 text-blue-6 q-mr-sm neo-avatar-border">
                  <q-icon name="contact_phone" size="18px" />
                </div>
                <div class="text-subtitle1 text-weight-bolder text-blue-grey-9">Akun & Kontak</div>
              </div>
              <q-icon name="alternate_email" size="24px" color="blue-grey-2" />
            </q-card-section>
            
            <q-card-section class="q-pa-lg col">
              <div class="q-gutter-y-lg">
                <!-- Email -->
                <div class="row items-center no-wrap">
                  <div class="ios-icon-box bg-blue-50 text-blue-6 q-mr-md neo-avatar-border" style="width: 44px; height: 44px;">
                    <q-icon name="email" size="20px" />
                  </div>
                  <div class="col overflow-hidden">
                    <div class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs" style="font-size: 10px;">
                      Email Terdaftar
                    </div>
                    <div class="text-subtitle1 text-blue-grey-10 text-weight-bolder ellipsis">
                      {{ user.email }}
                    </div>
                  </div>
                </div>

                <!-- Telepon -->
                <div class="row items-center no-wrap">
                  <div class="ios-icon-box bg-teal-50 text-teal-6 q-mr-md neo-avatar-border" style="width: 44px; height: 44px;">
                    <q-icon name="smartphone" size="20px" />
                  </div>
                  <div class="col overflow-hidden">
                    <div class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs" style="font-size: 10px;">
                      Nomor Telepon
                    </div>
                    <div class="text-subtitle1 text-blue-grey-10 text-weight-bolder ellipsis">
                      {{ user.hp || 'Belum Diatur' }}
                    </div>
                  </div>
                </div>

                <!-- NIK -->
                <div class="row items-center no-wrap">
                  <div class="ios-icon-box bg-deep-purple-50 text-deep-purple-6 q-mr-md neo-avatar-border" style="width: 44px; height: 44px;">
                    <q-icon name="badge" size="20px" />
                  </div>
                  <div class="col overflow-hidden">
                    <div class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs" style="font-size: 10px;">
                      Nomor Induk Karyawan (NIK)
                    </div>
                    <div class="text-subtitle1 text-blue-grey-10 text-weight-bolder ellipsis font-mono">
                      {{ user.nik || 'Belum Diatur' }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- CARD 2: DETAIL KEPEGAWAIAN -->
        <div class="col-12 col-md-6">
          <q-card flat class="neo-card full-height flex column">
            <q-card-section class="q-pa-lg neo-table-toolbar bg-white row items-center justify-between">
              <div class="row items-center">
                <div class="ios-icon-box small bg-indigo-50 text-indigo-6 q-mr-sm neo-avatar-border">
                  <q-icon name="business_center" size="18px" />
                </div>
                <div class="text-subtitle1 text-weight-bolder text-blue-grey-9">Detail Kepegawaian</div>
              </div>
              <q-icon name="admin_panel_settings" size="24px" color="blue-grey-2" />
            </q-card-section>

            <q-card-section class="q-pa-lg col">
              <div class="q-gutter-y-lg">
                <!-- Jabatan -->
                <div class="row items-center no-wrap">
                  <div class="ios-icon-box bg-indigo-50 text-indigo-6 q-mr-md neo-avatar-border" style="width: 44px; height: 44px;">
                    <q-icon name="work_outline" size="20px" />
                  </div>
                  <div class="col overflow-hidden">
                    <div class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs" style="font-size: 10px;">
                      Jabatan Aktif
                    </div>
                    <div class="text-subtitle1 text-blue-grey-10 text-weight-bolder ellipsis">
                      {{ user.jabatan || user.role || 'Staff' }}
                    </div>
                  </div>
                </div>

                <!-- Unit NIK -->
                <div class="row items-center no-wrap">
                  <div class="ios-icon-box bg-cyan-50 text-cyan-6 q-mr-md neo-avatar-border" style="width: 44px; height: 44px;">
                    <q-icon name="corporate_fare" size="20px" />
                  </div>
                  <div class="col overflow-hidden">
                    <div class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs" style="font-size: 10px;">
                      Unit Kerja / Departemen
                    </div>
                    <div class="text-subtitle1 text-blue-grey-10 text-weight-bolder ellipsis">
                      AGRA ERP - Pusat
                    </div>
                  </div>
                </div>

                <!-- Status Kehadiran -->
                <div class="row items-center no-wrap">
                  <div class="ios-icon-box bg-teal-50 text-teal-6 q-mr-md neo-avatar-border" style="width: 44px; height: 44px;">
                    <q-icon name="how_to_reg" size="20px" />
                  </div>
                  <div class="col overflow-hidden">
                    <div class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs" style="font-size: 10px;">
                      Status Kehadiran Hari Ini
                    </div>
                    <div>
                      <q-badge color="teal-1" text-color="teal-9" class="text-weight-bolder uppercase font-mono" style="border: 1.5px solid #0f172a; padding: 4px 8px; border-radius: 6px;">
                        HADIR HARI INI
                      </q-badge>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- CARD 3: ALAMAT TEMPAT TINGGAL -->
        <div class="col-12 col-md-6">
          <q-card flat class="neo-card full-height flex column">
            <q-card-section class="q-pa-lg neo-table-toolbar bg-white row items-center justify-between">
              <div class="row items-center">
                <div class="ios-icon-box small bg-amber-50 text-amber-9 q-mr-sm neo-avatar-border">
                  <q-icon name="location_on" size="18px" />
                </div>
                <div class="text-subtitle1 text-weight-bolder text-blue-grey-9">Alamat Domisili</div>
              </div>
              <q-icon name="home" size="24px" color="blue-grey-2" />
            </q-card-section>

            <q-card-section class="q-pa-lg col">
              <div class="rounded-16 q-pa-md bg-amber-50" style="border: 2px solid #0f172a; min-height: 120px;">
                <div class="text-body1 text-blue-grey-9 text-weight-medium line-height-relaxed" style="font-style: italic;">
                  "{{ user.alamat || 'Alamat domisili belum diatur. Silakan perbarui melalui menu Edit Profil.' }}"
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- CARD 4: KONTAK DARURAT -->
        <div class="col-12 col-md-6">
          <q-card flat class="neo-card full-height flex column" style="background: #fff5f5 !important;">
            <q-card-section class="q-pa-lg neo-table-toolbar bg-white row items-center justify-between">
              <div class="row items-center">
                <div class="ios-icon-box small bg-red-50 text-red-6 q-mr-sm neo-avatar-border">
                  <q-icon name="emergency" size="18px" />
                </div>
                <div class="text-subtitle1 text-weight-bolder text-red-7 uppercase letter-spacing-1">Kontak Darurat</div>
              </div>
              <q-icon name="health_and_safety" size="24px" color="red-3" />
            </q-card-section>

            <q-card-section class="q-pa-lg col">
              <div class="q-gutter-y-md">
                <div>
                  <div class="text-caption text-red-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs" style="font-size: 10px;">
                    Nama Kerabat / Keluarga
                  </div>
                  <div class="text-h6 text-weight-black text-red-9 line-height-tight">
                    {{ user.emergency_name || 'BELUM DIATUR' }}
                  </div>
                </div>

                <div>
                  <div class="text-caption text-red-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs" style="font-size: 10px;">
                    Nomor Telepon Hubung
                  </div>
                  <div class="text-h6 text-weight-black text-red-9 font-mono">
                    {{ user.emergency_phone || '---' }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- DIALOG EDIT PROFIL (NEO-BRUTALIST)         -->
    <!-- ========================================== -->
    <q-dialog v-model="editDialog" persistent backdrop-filter="blur(8px)">
      <q-card
        style="width: 700px; max-width: 95vw"
        class="neo-card overflow-hidden flex column"
      >
        <!-- Header Dialog -->
        <q-card-section class="row items-center q-px-lg q-py-md neo-table-toolbar bg-white">
          <div class="row items-center col">
            <div class="bg-blue-50 text-primary q-pa-sm rounded-8 q-mr-md neo-avatar-border">
              <q-icon name="manage_accounts" size="24px" />
            </div>
            <div>
              <div class="text-h6 text-weight-bolder text-blue-grey-10 line-height-tight">
                Perbarui Profil
              </div>
              <div class="text-caption text-blue-grey-5 font-mono text-weight-bold q-mt-xs">
                Sesuaikan informasi pribadi Anda.
              </div>
            </div>
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            color="red-6"
            class="bg-grey-2 neo-delete-btn"
            style="width: 28px; height: 28px;"
          />
        </q-card-section>

        <!-- Form Section -->
        <q-card-section class="q-pa-lg scroll" style="max-height: 65vh;">
          <div
            class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
          >
            Informasi Dasar
          </div>
          <q-input
            v-model="tempUser.nama"
            placeholder="Nama Lengkap"
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
                placeholder="Email Login"
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
                placeholder="NIK Karyawan"
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

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="tempUser.jabatan"
                placeholder="Jabatan / Posisi"
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
                placeholder="Nomor Telepon Pribadi"
                outlined
                class="rounded-input"
                color="primary"
              >
                <template v-slot:prepend>
                  <q-icon name="phone_iphone" color="blue-grey-4" />
                </template>
              </q-input>
            </div>
          </div>

          <q-input
            v-model="tempUser.alamat"
            placeholder="Alamat Lengkap Domisili"
            outlined
            type="textarea"
            rows="3"
            class="rounded-input q-mb-xl"
            color="primary"
          >
            <template v-slot:prepend><q-icon name="home" color="blue-grey-4" /></template>
          </q-input>

          <div
            class="text-caption text-weight-bold text-red-7 uppercase letter-spacing-1 q-mb-sm row items-center"
          >
            <q-icon name="emergency" size="18px" class="q-mr-xs" /> Kontak Darurat
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="tempUser.emergency_name"
                placeholder="Nama Keluarga/Kerabat"
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
                placeholder="Nomor Telepon Darurat"
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
        <q-card-actions align="right" class="q-pa-lg bg-grey-1 border-top">
          <q-btn
            flat
            label="BATAL"
            color="blue-grey-6"
            v-close-popup
            class="text-weight-bold rounded-8 q-px-md"
          />
          <q-btn
            unelevated
            label="SIMPAN PERUBAHAN"
            color="primary"
            @click="saveProfile"
            class="neo-btn q-px-xl q-py-sm text-weight-bolder"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.letter-spacing-tight {
  letter-spacing: -0.5px;
}
.tracking-wide {
  letter-spacing: 0.5px;
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

.premium-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  width: 100%;
}

/* NEO-BRUTALIST STYLING CORE */
.neo-page-bg {
  background-color: #f1f5f9;
  background-image: radial-gradient(#cbd5e1 2px, transparent 2px);
  background-size: 24px 24px;
  position: relative;
  min-height: 100vh;
}

.neo-card {
  background: #ffffff !important;
  border: 3px solid #0f172a !important;
  box-shadow: 6px 6px 0px #0f172a !important;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-card:hover {
  transform: translateY(-2px) translateX(2px);
  box-shadow: 8px 8px 0px #0f172a !important;
}

.neo-btn {
  border: 2.5px solid #0f172a !important;
  box-shadow: 3.5px 3.5px 0px #0f172a !important;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-btn:hover {
  transform: translateY(-1px) translateX(1px);
  box-shadow: 2.5px 2.5px 0px #0f172a !important;
}

.neo-btn:active {
  transform: translateY(2px) translateX(2px);
  box-shadow: 0px 0px 0px #0f172a !important;
}

.neo-delete-btn {
  border: 1.5px solid #0f172a !important;
  background: #fee2e2 !important;
  color: #b91c1c !important;
  transition: all 0.2s ease;
}
.neo-delete-btn:hover {
  background: #ef4444 !important;
  color: #ffffff !important;
  transform: scale(1.1);
}

.neo-table-toolbar {
  border-bottom: 2.5px solid #0f172a;
}

.neo-avatar-border {
  border: 2px solid #0f172a !important;
}

/* CUSTOM INPUTS */
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
  border: 2px solid #0f172a !important;
  box-shadow: 2px 2px 0px #0f172a !important;
  background-color: #ffffff;
}
.rounded-input :deep(.q-field__marginal) {
  height: 50px;
}

/* ios icon box */
.ios-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0f172a;
}
.ios-icon-box.small {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

/* Floating Shapes Background Styling */
.neo-decorations-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.neo-shape {
  position: absolute;
  user-select: none;
  transition: all 0.3s ease;
}

/* 1. Circle 1 - Indigo/Blue */
.neo-shape--circle-1 {
  width: 180px;
  height: 180px;
  border: 3px solid rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.07);
  box-shadow: 5px 5px 0px rgba(59, 130, 246, 0.12);
  top: 8%;
  left: -20px;
  animation: drift-wobble-1 25s ease-in-out infinite;
}

/* 2. Circle 2 - Pink/Rose */
.neo-shape--circle-2 {
  width: 140px;
  height: 140px;
  border: 3px solid rgba(244, 63, 94, 0.25);
  background: rgba(244, 63, 94, 0.07);
  box-shadow: 5px 5px 0px rgba(244, 63, 94, 0.12);
  top: 52%;
  right: 6%;
  animation: drift-wobble-2 22s ease-in-out infinite reverse;
}

/* 3. Square 1 - Orange */
.neo-shape--square-1 {
  width: 130px;
  height: 130px;
  border: 3px solid rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.07);
  box-shadow: 5px 5px 0px rgba(245, 158, 11, 0.12);
  top: 65%;
  right: -30px;
  animation: drift-wobble-2 30s ease-in-out infinite;
}

/* 4. Square 2 - Lime */
.neo-shape--square-2 {
  width: 110px;
  height: 110px;
  border: 3px solid rgba(132, 204, 22, 0.25);
  background: rgba(132, 204, 22, 0.07);
  box-shadow: 4px 4px 0px rgba(132, 204, 22, 0.12);
  top: 22%;
  left: 15%;
  animation: drift-wobble-1 27s ease-in-out infinite;
}

/* 5. Star 1 - Purple */
.neo-shape--star-1 {
  font-size: 130px;
  color: rgba(168, 85, 247, 0.22);
  text-shadow: 4px 4px 0px rgba(168, 85, 247, 0.12);
  top: 3%;
  right: 15%;
  animation: drift-diagonal-1 28s ease-in-out infinite reverse;
}

/* 6. Star 2 - Yellow */
.neo-shape--star-2 {
  font-size: 90px;
  color: rgba(234, 179, 8, 0.24);
  text-shadow: 3px 3px 0px rgba(234, 179, 8, 0.14);
  top: 85%;
  right: 25%;
  animation: drift-diagonal-2 20s ease-in-out infinite;
}

/* 7. Triangle 1 - Cyan */
.neo-shape--triangle-1 {
  font-size: 100px;
  color: rgba(6, 182, 212, 0.22);
  text-shadow: 4px 4px 0px rgba(6, 182, 212, 0.12);
  top: 40%;
  left: 8%;
  animation: drift-wobble-2 24s ease-in-out infinite reverse;
}

/* 8. Triangle 2 - Amber/Gold */
.neo-shape--triangle-2 {
  font-size: 80px;
  color: rgba(245, 158, 11, 0.22);
  text-shadow: 3px 3px 0px rgba(245, 158, 11, 0.12);
  top: 12%;
  left: 35%;
  animation: drift-diagonal-1 23s ease-in-out infinite;
}

/* 9. Cross 1 - Emerald Green */
.neo-shape--cross-1 {
  font-size: 110px;
  color: rgba(16, 185, 129, 0.22);
  text-shadow: 4px 4px 0px rgba(16, 185, 129, 0.12);
  top: 30%;
  right: 25%;
  animation: drift-diagonal-1 22s ease-in-out infinite;
}

/* 10. Cross 2 - Red/Rose */
.neo-shape--cross-2 {
  font-size: 90px;
  color: rgba(239, 68, 68, 0.22);
  text-shadow: 4px 4px 0px rgba(239, 68, 68, 0.12);
  top: 75%;
  left: 2%;
  animation: drift-diagonal-2 26s ease-in-out infinite;
}

/* 11. Cross 3 - Deep Indigo */
.neo-shape--cross-3 {
  font-size: 100px;
  color: rgba(99, 102, 241, 0.22);
  text-shadow: 4px 4px 0px rgba(99, 102, 241, 0.12);
  top: 90%;
  left: 40%;
  animation: drift-wobble-1 29s ease-in-out infinite;
}

/* 12. Blob 1 - Teal Organic Morphing Blob */
.neo-shape--blob-1 {
  width: 160px;
  height: 160px;
  border: 3px solid rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.07);
  box-shadow: 5px 5px 0px rgba(20, 184, 166, 0.12);
  top: 48%;
  left: 42%;
  animation: drift-blob 32s ease-in-out infinite;
}

/* KEYFRAMES FOR ORGANIC DRIFTING (AGAR.IO STYLE) */
@keyframes drift-wobble-1 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 50% 50% 50% 50%;
  }
  25% {
    transform: translate(50px, -40px) scale(1.05) rotate(90deg);
    border-radius: 46% 54% 48% 52%;
  }
  50% {
    transform: translate(20px, -80px) scale(0.95) rotate(180deg);
    border-radius: 54% 46% 52% 48%;
  }
  75% {
    transform: translate(-40px, -30px) scale(1.02) rotate(270deg);
    border-radius: 48% 52% 54% 46%;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 50% 50% 50% 50%;
  }
}

@keyframes drift-wobble-2 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 8px;
  }
  33% {
    transform: translate(-60px, -30px) scale(1.08) rotate(120deg);
    border-radius: 14px 8px 14px 8px;
  }
  66% {
    transform: translate(30px, -70px) scale(0.92) rotate(240deg);
    border-radius: 8px 14px 8px 14px;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 8px;
  }
}

@keyframes drift-diagonal-1 {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(45px, 60px) rotate(180deg) scale(1.05);
  }
  100% {
    transform: translate(0, 0) rotate(360deg) scale(1);
  }
}

@keyframes drift-diagonal-2 {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(-50px, -60px) rotate(-180deg) scale(0.95);
  }
  100% {
    transform: translate(0, 0) rotate(-360deg) scale(1);
  }
}

@keyframes drift-blob {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
  33% {
    transform: translate(40px, -50px) scale(1.06) rotate(120deg);
    border-radius: 70% 30% 52% 48% / 60% 40% 70% 30%;
  }
  66% {
    transform: translate(-30px, 30px) scale(0.94) rotate(240deg);
    border-radius: 50% 50% 30% 70% / 50% 60% 40% 60%;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
}

/* Entrance animation classes */
.header-entrance {
  animation: brutalist-bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.table-entrance {
  opacity: 0;
  animation: brutalist-bounce-in 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s forwards;
}

@keyframes brutalist-bounce-in {
  0% {
    opacity: 0;
    transform: translateY(35px);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px);
  }
  80% {
    transform: translateY(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  padding: 6px;
  background: white;
  border-radius: 50%;
}
.profile-avatar {
  border-radius: 50%;
}
.btn-camera {
  position: absolute;
  bottom: 0;
  right: 0;
  border: 3.5px solid #ffffff !important;
}

.profile-name {
  font-size: 2.2rem;
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
</style>
