<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-xl">
    <div class="row justify-center">
      <div class="col-12 col-lg-10 col-xl-8">
        <!-- PROFILE HERO SECTION -->
        <q-card flat class="profile-hero shadow-10 overflow-hidden q-mb-xl">
          <div class="hero-overlay"></div>
          <q-card-section class="q-pa-xl row items-center no-wrap relative-position">
            <div class="col-auto">
              <div class="avatar-container shadow-5">
                <q-avatar size="140px" class="bg-white q-pa-xs relative-position">
                  <q-img
                    :src="user.foto || 'https://cdn.quasar.dev/img/avatar.png'"
                    spinner-color="primary"
                    class="rounded-borders full-height"
                  />
                  <q-btn
                    round
                    color="primary"
                    icon="photo_camera"
                    size="sm"
                    class="absolute-bottom-right shadow-2"
                    @click="triggerUpload"
                  >
                    <q-tooltip>Ubah Foto Profil</q-tooltip>
                  </q-btn>
                  <input
                    type="file"
                    ref="fileInput"
                    class="hidden"
                    accept="image/*"
                    @change="onFileChange"
                  />
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
                {{ user.jabatan }}
              </div>

              <div class="row q-mt-md q-gutter-x-md">
                <q-badge outline color="blue-2" class="q-px-md q-py-xs text-weight-bold">
                  NIK: {{ user.nik }}
                </q-badge>
                <q-btn
                  unelevated
                  rounded
                  color="white"
                  text-color="primary"
                  label="EDIT PROFIL"
                  icon="edit"
                  size="sm"
                  class="text-weight-bold"
                  @click="openEditDialog"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- INFORMASI DETAIL -->
        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-7">
            <q-card flat class="rounded-16 shadow-card bg-white full-height">
              <q-card-section class="q-pa-lg">
                <div class="text-h6 text-weight-bold text-blue-grey-9 q-mb-lg row items-center">
                  <q-icon name="badge" color="primary" class="q-mr-sm" />
                  Informasi Akun
                </div>

                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-sm-6" v-for="(info, index) in displayFields" :key="index">
                    <div class="text-caption text-grey-6 text-uppercase letter-spacing-1 q-mb-xs">
                      {{ info.label }}
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-blue-grey-10">
                      {{ info.value || '-' }}
                    </div>
                    <q-separator class="q-mt-sm opacity-30" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-5">
            <q-card flat class="rounded-16 shadow-card bg-white q-mb-md">
              <q-card-section class="q-pa-lg">
                <div class="text-subtitle1 text-weight-bold text-blue-grey-9 q-mb-md">Domisili</div>
                <div class="bg-grey-1 q-pa-md rounded-12 border-dashed">
                  <div class="text-body2 text-grey-8">
                    {{ user.alamat || 'Alamat belum diatur.' }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat class="rounded-16 shadow-card bg-primary text-white">
              <q-card-section class="q-pa-lg">
                <div class="text-subtitle1 text-weight-bold q-mb-sm">Kontak Darurat</div>
                <div class="text-h6 text-weight-bold">
                  {{ user.emergency_name || 'Belum diatur' }}
                </div>
                <div class="text-subtitle2 opacity-80">{{ user.emergency_phone || '-' }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- DIALOG EDIT PROFIL -->
        <q-dialog v-model="editDialog" persistent>
          <q-card style="min-width: 350px; border-radius: 16px">
            <q-card-section class="bg-primary text-white row items-center">
              <div class="text-h6">Perbarui Profil</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section class="q-pa-lg q-gutter-y-md">
              <q-input v-model="tempUser.nama" label="Nama Lengkap" outlined dense />
              <q-input v-model="tempUser.nik" label="NIK" outlined dense />
              <q-input v-model="tempUser.jabatan" label="Jabatan" outlined dense />
              <q-input v-model="tempUser.email" label="Email Kantor" outlined dense />
              <q-input v-model="tempUser.phone" label="Nomor Telepon" outlined dense />
              <q-input
                v-model="tempUser.alamat"
                label="Alamat Domisili"
                outlined
                dense
                type="textarea"
                rows="2"
              />
              <div class="row q-col-gutter-sm">
                <q-input
                  v-model="tempUser.emergency_name"
                  label="Nama Kontak Darurat"
                  outlined
                  dense
                  class="col-6"
                />
                <q-input
                  v-model="tempUser.emergency_phone"
                  label="No. Kontak Darurat"
                  outlined
                  dense
                  class="col-6"
                />
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Batal" color="grey" v-close-popup />
              <q-btn unelevated label="Simpan Perubahan" color="primary" @click="saveProfile" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const fileInput = ref(null)
const editDialog = ref(false)

const user = ref({
  nama: 'KARYAWAN AGRA',
  nik: '202611',
  jabatan: 'Senior Staff Operations',
  email: 'user.agra@agra.co.id',
  phone: '+62 851-5667-0000',
  alamat: '',
  foto: null,
  emergency_name: '',
  emergency_phone: '',
})

const tempUser = ref({})

const displayFields = computed(() => [
  { label: 'Email Kantor', value: user.value.email, icon: 'email' },
  { label: 'Telepon', value: user.value.phone, icon: 'phone' },
  { label: 'Jabatan', value: user.value.jabatan, icon: 'work' },
  { label: 'NIK', value: user.value.nik, icon: 'id_card' },
])

const loadProfile = () => {
  const saved = localStorage.getItem('user_data')
  if (saved) {
    user.value = { ...user.value, ...JSON.parse(saved) }
  }
}

const openEditDialog = () => {
  tempUser.value = { ...user.value }
  editDialog.value = true
}

const saveProfile = () => {
  if (!tempUser.value.nama)
    return $q.notify({ color: 'negative', message: 'Nama tidak boleh kosong' })

  user.value = { ...tempUser.value }
  localStorage.setItem('user_data', JSON.stringify(user.value))

  $q.notify({
    color: 'positive',
    icon: 'check_circle',
    message: 'Profil berhasil diperbarui! Sinkronisasi aktif.',
  })
  editDialog.value = false
}

const triggerUpload = () => fileInput.value.click()

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      user.value.foto = event.target.result
      localStorage.setItem('user_data', JSON.stringify(user.value))
      $q.notify({ color: 'positive', message: 'Foto profil diperbarui!' })
    }
    reader.readAsDataURL(file)
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-hero {
  border-radius: 24px;
  background: url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1350&q=80')
    center;
  min-height: 280px;
  position: relative;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.95) 0%, rgba(42, 82, 152, 0.75) 100%);
  backdrop-filter: blur(4px);
}
.avatar-container {
  padding: 6px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}
.rounded-16 {
  border-radius: 16px;
}
.shadow-card {
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05) !important;
}
.border-dashed {
  border: 1px dashed #ced4da;
}
.letter-spacing-1 {
  letter-spacing: 1.2px;
}
</style>
