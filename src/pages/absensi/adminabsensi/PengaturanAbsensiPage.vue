<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-xl font-pro">
    <div class="text-h4 text-weight-regular text-blue-grey-9 q-mb-lg">Manajemen Absensi</div>

    <q-card flat bordered class="rounded-12 shadow-sm bg-white overflow-hidden">
      <q-card-section class="bg-blue-grey-8 text-white q-py-md row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">Daftar Lokasi Kantor</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between q-mb-md q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input outlined dense v-model="search" placeholder="Cari Lokasi..." class="bg-white">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto">
            <q-btn
              unelevated
              color="primary"
              icon="add_location_alt"
              label="TAMBAH LOKASI"
              class="text-weight-bold q-px-md"
              @click="openDialog()"
            />
          </div>
        </div>

        <q-table
          :rows="lokasiList"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :filter="search"
          :loading="loading"
          class="admin-table"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-grey-1">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold text-blue-grey-9"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="nama" class="text-weight-bold text-blue-grey-9">{{
                props.row.nama_lokasi
              }}</q-td>
              <q-td key="koordinat">
                <a
                  :href="`https://www.google.com/maps/search/?api=1&query=${props.row.latitude},${props.row.longitude}`"
                  target="_blank"
                  class="text-primary text-weight-medium text-decoration-none"
                >
                  Lihat Lokasi <q-icon name="open_in_new" />
                </a>
                <div class="text-caption text-grey-7 q-mt-xs">
                  lat : {{ props.row.latitude }} <br />
                  long : {{ props.row.longitude }}
                </div>
              </q-td>
              <q-td key="radius" class="text-weight-bold">{{ props.row.radius }} KM</q-td>
              <q-td key="aksi" class="text-center">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="edit"
                  size="sm"
                  @click="openDialog(props.row)"
                >
                  <q-tooltip>Edit Lokasi</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="hapusLokasi(props.row.id)"
                >
                  <q-tooltip>Hapus Lokasi</q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-lg text-grey-6">
              <q-icon size="2em" name="location_off" class="q-mr-sm" />
              Belum ada lokasi kantor yang diatur.
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogLokasi" persistent>
      <q-card style="width: 600px; max-width: 95vw" class="rounded-12">
        <q-card-section class="bg-primary text-white row items-center q-py-sm">
          <div class="text-h6 text-weight-bold">
            {{ isEdit ? 'Edit Lokasi Kantor' : 'Tambah Lokasi Kantor Baru' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="simpanLokasi">
          <q-card-section class="q-gutter-y-md q-pa-md">
            <q-input
              v-model="form.nama_lokasi"
              outlined
              label="Nama Lokasi (Cth: Head Office)"
              :rules="[(val) => !!val || 'Nama lokasi wajib diisi']"
            />

            <q-input
              v-model="form.latitude"
              outlined
              label="Latitude"
              :rules="[(val) => !!val || 'Latitude wajib diisi']"
            />

            <q-input
              v-model="form.longitude"
              outlined
              label="Longitude"
              :rules="[(val) => !!val || 'Longitude wajib diisi']"
            />

            <q-btn
              unelevated
              color="teal-6"
              icon="my_location"
              label="Ambil Lokasi Admin Sekarang"
              class="full-width text-weight-bold q-py-sm"
              @click="dapatkanLokasiSekarang"
              :loading="gettingLocation"
            />

            <q-input
              v-model.number="form.radius"
              outlined
              type="number"
              step="0.1"
              label="Radius Validasi Absen (KM)"
              hint="Berapa kilometer maksimal karyawan boleh absen dari titik ini? (Cth: 0.5)"
              :rules="[(val) => !!val || 'Radius wajib diisi']"
            />
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-1 q-pa-md">
            <q-btn flat label="Batal" color="grey-7" v-close-popup class="text-weight-bold" />
            <q-btn
              unelevated
              label="SIMPAN LOKASI"
              color="primary"
              type="submit"
              class="text-weight-bold q-px-lg"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const search = ref('')
const loading = ref(true)
const saving = ref(false)
const gettingLocation = ref(false)

const lokasiList = ref([])
const dialogLokasi = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const form = ref({
  nama_lokasi: '',
  latitude: '',
  longitude: '',
  radius: 0.5,
})

const columns = [
  { name: 'nama', label: 'Nama Lokasi', align: 'left', field: 'nama_lokasi', sortable: true },
  { name: 'koordinat', label: 'Koordinat', align: 'left' },
  { name: 'radius', label: 'Radius', align: 'left', field: 'radius' },
  { name: 'aksi', label: 'Aksi', align: 'center' },
]

// AMBIL DATA REAL-TIME DARI FIRESTORE
const fetchLokasi = () => {
  onSnapshot(
    collection(db, 'lokasi_kantor'),
    (snap) => {
      lokasiList.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      loading.value = false
    },
    (error) => {
      console.error('Gagal mengambil data lokasi:', error)
      loading.value = false
    },
  )
}

// BUKA MODAL TAMBAH/EDIT
const openDialog = (data = null) => {
  if (data) {
    isEdit.value = true
    editId.value = data.id
    form.value = {
      nama_lokasi: data.nama_lokasi,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius,
    }
  } else {
    isEdit.value = false
    editId.value = null
    form.value = { nama_lokasi: '', latitude: '', longitude: '', radius: 0.5 }
  }
  dialogLokasi.value = true
}

// SIMPAN ATAU UPDATE LOKASI
const simpanLokasi = async () => {
  saving.value = true
  try {
    const dataSimpan = {
      nama_lokasi: form.value.nama_lokasi,
      latitude: parseFloat(form.value.latitude),
      longitude: parseFloat(form.value.longitude),
      radius: parseFloat(form.value.radius),
      updated_at: serverTimestamp(),
    }

    if (isEdit.value) {
      await updateDoc(doc(db, 'lokasi_kantor', editId.value), dataSimpan)
      $q.notify({ color: 'positive', message: 'Lokasi berhasil diperbarui!' })
    } else {
      dataSimpan.created_at = serverTimestamp()
      await addDoc(collection(db, 'lokasi_kantor'), dataSimpan)
      $q.notify({ color: 'positive', message: 'Lokasi baru berhasil ditambahkan!' })
    }
    dialogLokasi.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Terjadi kesalahan saat menyimpan data.' })
  } finally {
    saving.value = false
  }
}

// HAPUS LOKASI
const hapusLokasi = (id) => {
  $q.dialog({
    title: 'Hapus Lokasi',
    message:
      'Apakah Anda yakin ingin menghapus lokasi kantor ini? Karyawan tidak akan bisa absen di lokasi ini lagi.',
    cancel: true,
    ok: { color: 'negative', label: 'Ya, Hapus' },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'lokasi_kantor', id))
      $q.notify({ color: 'positive', message: 'Lokasi berhasil dihapus!' })
    } catch (error) {
      console.error('Gagal menghapus lokasi:', error) // Error variabel sekarang terpakai
      $q.notify({ color: 'negative', message: 'Gagal menghapus lokasi.' })
    }
  })
}

// FITUR DETEKSI OTOMATIS LOKASI ADMIN
const dapatkanLokasiSekarang = () => {
  if (!navigator.geolocation) {
    $q.notify({ color: 'negative', message: 'Browser Anda tidak mendukung fitur GPS.' })
    return
  }

  gettingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = position.coords.latitude.toFixed(6)
      form.value.longitude = position.coords.longitude.toFixed(6)
      gettingLocation.value = false
      $q.notify({ color: 'positive', message: 'Lokasi berhasil didapatkan!', position: 'top' })
    },
    (error) => {
      console.error(error)
      gettingLocation.value = false
      $q.notify({ color: 'negative', message: 'Gagal mendapatkan lokasi. Pastikan GPS aktif.' })
    },
    { enableHighAccuracy: true },
  )
}

onMounted(() => {
  fetchLokasi()
})
</script>

<style scoped>
.font-pro {
  font-family: 'Inter', sans-serif;
}
.rounded-12 {
  border-radius: 12px;
}
.text-decoration-none {
  text-decoration: none;
}
.admin-table :deep(th) {
  font-size: 13px;
  letter-spacing: 0.5px;
}
</style>
