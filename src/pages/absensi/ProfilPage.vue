<template>
  <q-page class="bg-blue-grey-1 q-pa-md">
    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-xl-11">
        <!-- HEADER SECTION -->
        <q-card flat class="full-card bg-white shadow-2 overflow-hidden">
          <div class="row items-center q-pa-md q-pa-md-lg">
            <!-- Avatar Section -->
            <div class="col-12 col-sm-auto flex justify-center q-mb-md q-mb-sm-none">
              <q-avatar size="140px" class="shadow-5 border-white relative-position">
                <q-img :src="user.foto || 'https://cdn.quasar.dev/img/avatar.png'" />
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
                  {{ user.nama }}
                </div>
                <q-icon name="verified" color="primary" size="xs" class="q-ml-xs" />
              </div>
              <div class="text-h6 text-primary text-weight-medium q-mt-xs">{{ user.jabatan }}</div>

              <div class="row q-mt-md q-gutter-x-sm justify-center justify-sm-start">
                <q-badge
                  color="blue-grey-2"
                  text-color="blue-grey-10"
                  class="q-px-md q-py-xs text-weight-bold"
                >
                  NIK: {{ user.nik }}
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
                class="q-px-lg"
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
                <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-md">DOMISILI</div>
                <div class="bg-blue-grey-1 q-pa-md rounded-borders border-dashed">
                  <div class="text-body2 text-blue-grey-9">{{ user.alamat || 'Belum diatur' }}</div>
                </div>
              </q-card>

              <q-card flat class="full-card q-pa-lg shadow-2 bg-blue-10 text-white">
                <div class="row items-center q-mb-md">
                  <q-icon name="contact_phone" color="red-4" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">DARURAT</span>
                </div>
                <div class="text-h6 text-weight-bolder">{{ user.emergency_name || '-' }}</div>
                <div class="text-body2 opacity-80">{{ user.emergency_phone || '-' }}</div>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DIALOG EDIT -->
    <q-dialog v-model="editDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 20px">
        <q-card-section class="bg-primary text-white row items-center q-pa-md">
          <div class="text-subtitle1 text-weight-bold">Update Profil</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md q-gutter-y-sm">
          <q-input v-model="tempUser.nama" label="Nama Lengkap" outlined dense stack-label />
          <div class="row q-col-gutter-sm">
            <q-input v-model="tempUser.nik" label="NIK" outlined dense stack-label class="col-6" />
            <q-input
              v-model="tempUser.jabatan"
              label="Jabatan"
              outlined
              dense
              stack-label
              class="col-6"
            />
          </div>
          <q-input v-model="tempUser.email" label="Email Kantor" outlined dense stack-label />
          <q-input v-model="tempUser.phone" label="Nomor Telepon" outlined dense stack-label />
          <q-input
            v-model="tempUser.alamat"
            label="Alamat Domisili"
            outlined
            dense
            stack-label
            type="textarea"
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="BATAL" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            label="SIMPAN PERUBAAN"
            color="primary"
            @click="saveProfile"
            no-caps
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const fileInput = ref(null)
const editDialog = ref(false)

const user = ref({
  nama: 'REVAL ALFARIZZI AKBAR',
  nik: '312310250',
  jabatan: 'Operator produksi',
  email: 'reval@agra.co.id',
  phone: '08123456789',
  alamat: 'Dian Anyar H2-7 RT002 RW 012 PURWAKARTA JAWA BARAT',
  foto: null,
  emergency_name: 'Admin Agra',
  emergency_phone: '0812-0000-1111',
})

const tempUser = ref({})

const displayFields = computed(() => [
  { label: 'Email Kantor', value: user.value.email },
  { label: 'Nomor Telepon', value: user.value.phone },
  { label: 'Jabatan Aktif', value: user.value.jabatan },
  { label: 'Unit NIK', value: user.value.nik },
])

const loadProfile = () => {
  const saved = localStorage.getItem('agra_erp_session')
  if (saved) {
    user.value = { ...user.value, ...JSON.parse(saved) }
  }
}

const openEditDialog = () => {
  tempUser.value = { ...user.value }
  editDialog.value = true
}

const saveProfile = () => {
  user.value = { ...tempUser.value }
  localStorage.setItem('agra_erp_session', JSON.stringify(user.value))
  $q.notify({
    color: 'primary',
    message: 'Profil Berhasil Disinkronkan!',
    position: 'top',
    icon: 'sync',
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
      // Konsisten simpan ke agra_erp_session agar halaman lain ikut terupdate
      localStorage.setItem('agra_erp_session', JSON.stringify(user.value))
      $q.notify({ color: 'positive', message: 'Foto profil diperbarui!', icon: 'photo_camera' })
    }
    reader.readAsDataURL(file)
  }
}

onMounted(() => loadProfile())
</script>

<style scoped>
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
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
