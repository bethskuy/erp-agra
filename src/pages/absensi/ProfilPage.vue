<template>
  <q-page class="bg-blue-grey-1 q-pa-md">
    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-xl-11">
        <!-- HEADER SECTION -->
        <q-card flat class="full-card bg-white shadow-2 overflow-hidden">
          <div class="row items-center q-pa-md q-pa-md-lg">
            <!-- Avatar Section -->
            <div class="col-12 col-sm-auto flex justify-center q-mb-md q-mb-sm-none">
              <q-avatar size="140px" class="shadow-5 border-white relative-position bg-grey-2">
                <q-img
                  :src="user.fotoUrl || user.foto_profil || 'https://cdn.quasar.dev/img/avatar.png'"
                />
                <q-btn
                  round
                  color="primary"
                  icon="photo_camera"
                  size="sm"
                  class="absolute-bottom-right shadow-2"
                  @click="triggerUpload"
                />
              </q-avatar>
              <input
                type="file"
                ref="fileInput"
                class="hidden"
                accept="image/*"
                @change="onFileChange"
              />
            </div>

            <!-- Identity Section -->
            <div class="col-12 col-sm q-ml-sm-xl text-center text-sm-left">
              <div class="row items-center justify-center justify-sm-start no-wrap">
                <div class="text-h4 text-weight-bolder text-blue-grey-10 text-uppercase ellipsis">
                  {{ user.nama || 'Memuat...' }}
                </div>
                <q-icon name="verified" color="primary" size="xs" class="q-ml-xs" />
              </div>
              <div class="text-h6 text-primary text-weight-medium q-mt-xs">
                {{ user.jabatan || user.role || 'Staff' }}
              </div>

              <div class="row q-mt-md q-gutter-x-sm justify-center justify-sm-start">
                <q-badge
                  color="blue-grey-2"
                  text-color="blue-grey-10"
                  class="q-px-md q-py-xs text-weight-bold"
                >
                  NIK: {{ user.nik || '-' }}
                </q-badge>
                <q-badge
                  color="green-1"
                  text-color="green-9"
                  class="q-px-md q-py-xs text-weight-bold"
                >
                  AKTIF
                </q-badge>
              </div>
            </div>

            <div class="col-12 col-sm-auto q-mt-lg q-mt-sm-none text-center">
              <q-btn
                unelevated
                rounded
                color="primary"
                icon="edit"
                label="EDIT PROFIL"
                class="q-px-lg shadow-3 text-weight-bold"
                no-caps
                @click="openEditDialog"
              />
            </div>
          </div>
        </q-card>

        <div class="row q-col-gutter-lg q-mt-sm">
          <!-- GRID INFORMASI -->
          <div class="col-12 col-md-8">
            <q-card flat class="full-card q-pa-lg q-pa-md-xl shadow-2 full-height">
              <div
                class="text-subtitle1 text-weight-bold text-blue-grey-9 q-mb-lg row items-center justify-center justify-sm-start"
              >
                <q-icon name="badge" color="primary" class="q-mr-sm" />
                RINCIAN DATA PERSONALIA
              </div>

              <div class="row q-col-gutter-lg">
                <div class="col-12 col-sm-6" v-for="(info, index) in displayFields" :key="index">
                  <div class="column items-center items-sm-start">
                    <span
                      class="text-caption text-grey-6 text-weight-bold text-uppercase tracking-widest"
                      >{{ info.label }}</span
                    >
                    <span class="text-body1 text-blue-grey-10 text-weight-bold q-mt-xs">{{
                      info.value || '-'
                    }}</span>
                  </div>
                  <q-separator class="q-mt-sm opacity-50" />
                </div>
              </div>
            </q-card>
          </div>

          <!-- SIDEBAR DATA -->
          <div class="col-12 col-md-4">
            <div class="column q-gutter-y-md full-height">
              <q-card flat class="full-card q-pa-lg shadow-2 bg-white">
                <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-md flex items-center">
                  <q-icon name="location_on" color="primary" class="q-mr-sm" size="sm" />
                  DOMISILI
                </div>
                <div class="bg-blue-grey-1 q-pa-md rounded-borders border-dashed">
                  <div class="text-body2 text-blue-grey-9 leading-relaxed">
                    {{
                      user.alamat || 'Alamat domisili belum diatur. Silakan perbarui profil Anda.'
                    }}
                  </div>
                </div>
              </q-card>

              <q-card flat class="full-card q-pa-lg shadow-2 bg-blue-10 text-white">
                <div class="row items-center q-mb-md">
                  <q-icon name="contact_phone" color="red-4" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold tracking-widest">KONTAK DARURAT</span>
                </div>
                <div class="text-h6 text-weight-bolder">
                  {{ user.emergency_name || 'BELUM DIATUR' }}
                </div>
                <div class="text-body2 opacity-80">{{ user.emergency_phone || '-' }}</div>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DIALOG EDIT -->
    <q-dialog v-model="editDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 600px; max-width: 95vw; border-radius: 20px">
        <q-card-section class="bg-primary text-white row items-center q-pa-md">
          <div class="text-subtitle1 text-weight-bold">Update Profil Saya</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md q-gutter-y-md">
          <q-input v-model="tempUser.nama" label="Nama Lengkap" outlined dense />

          <div class="row q-col-gutter-sm">
            <q-input
              v-model="tempUser.email"
              label="Email Login"
              outlined
              dense
              class="col-12 col-sm-6"
              readonly
              hint="Hubungi Admin untuk ubah email"
            />
            <q-input
              v-model="tempUser.nik"
              label="NIK"
              outlined
              dense
              class="col-12 col-sm-6"
              readonly
              hint="Sesuai database HRD"
            />
          </div>

          <div class="row q-col-gutter-sm">
            <q-input
              v-model="tempUser.jabatan"
              label="Jabatan / Posisi"
              outlined
              dense
              class="col-12 col-sm-6"
              readonly
            />
            <q-input
              v-model="tempUser.hp"
              label="Nomor Telepon Pribadi"
              outlined
              dense
              class="col-12 col-sm-6"
            />
          </div>

          <q-input
            v-model="tempUser.alamat"
            label="Alamat Lengkap Domisili"
            outlined
            dense
            type="textarea"
            rows="3"
          />

          <q-separator class="q-my-sm" />
          <div class="text-subtitle2 text-weight-bold text-grey-8">
            Kontak Darurat (Keluarga/Kerabat)
          </div>

          <div class="row q-col-gutter-sm">
            <q-input
              v-model="tempUser.emergency_name"
              label="Nama Kontak Darurat"
              outlined
              dense
              class="col-12 col-sm-6"
            />
            <q-input
              v-model="tempUser.emergency_phone"
              label="No. Telepon Darurat"
              outlined
              dense
              class="col-12 col-sm-6"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="BATAL" color="grey-7" v-close-popup class="text-weight-bold" />
          <q-btn
            unelevated
            label="SIMPAN PERUBAHAN"
            color="primary"
            @click="saveProfile"
            class="q-px-lg text-weight-bold shadow-3 rounded-borders"
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

const displayFields = computed(() => [
  { label: 'Email Kantor', value: user.value.email },
  { label: 'Nomor Telepon', value: user.value.hp },
  { label: 'Jabatan Aktif', value: user.value.jabatan || user.value.role },
  { label: 'Unit NIK', value: user.value.nik },
])

const syncProfileData = () => {
  // 1. Ambil data dari key yang BENAR (Sama dengan Login & Layout)
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      user.value = { ...user.value, ...parsed }

      // 2. Real-time Listener ke Firestore
      if (user.value.email) {
        const q = query(collection(db, 'karyawan'), where('email', '==', user.value.email))
        onSnapshot(
          q,
          (snap) => {
            if (!snap.empty) {
              const docData = snap.docs[0]
              const data = docData.data()

              // Perbarui state reaktif
              user.value = {
                ...user.value,
                ...data,
                id: docData.id, // Simpan ID dokumen untuk proses Update
              }

              // Perbarui LocalStorage agar Layout/Sidebar ikut terupdate otomatis
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

    // 1. Update ke Firestore (Jika ID dokumen tersedia)
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

    // 2. Update State Lokal & Local Storage
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
      icon: 'sync',
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

    $q.notify({ color: 'positive', message: 'Foto profil berhasil diubah!', icon: 'photo_camera' })
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
.font-pro {
  font-family: 'Inter', sans-serif;
}
.full-card {
  border-radius: 16px;
}
.border-white {
  border: 4px solid #fff;
}
.border-dashed {
  border: 2px dashed #cfd8dc;
}
.tracking-widest {
  letter-spacing: 1px;
}
.leading-relaxed {
  line-height: 1.6;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
