<template>
  <q-page class="bg-blue-grey-1 q-pa-lg font-inter">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
          Pengaturan Lokasi
        </h4>
        <div class="text-subtitle1 text-blue-grey-6 q-mt-xs">
          Manajemen titik koordinat dan radius area kantor untuk validasi GPS karyawan.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-md-mt-none">
        <q-btn
          unelevated
          color="primary"
          icon="add_location_alt"
          label="TAMBAH LOKASI BARU"
          class="rounded-12 text-weight-bold q-px-lg q-py-sm shadow-soft-primary"
          @click="openDialog()"
        />
      </div>
    </div>

    <!-- MAIN DATA TABLE CARD -->
    <q-card flat class="rounded-24 shadow-soft bg-white overflow-hidden">
      <!-- Toolbar Pencarian -->
      <q-card-section class="q-pa-lg border-bottom bg-white">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-md-6 col-lg-4">
            <q-input
              outlined
              dense
              v-model="search"
              placeholder="Cari nama lokasi..."
              class="rounded-input bg-grey-1"
              color="primary"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="blue-grey-5" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto text-blue-grey-5 text-weight-medium text-caption">
            <q-icon name="info" size="xs" class="q-mr-xs" />
            Titik-titik ini yang akan mendeteksi HP Karyawan
          </div>
        </div>
      </q-card-section>

      <!-- Tabel -->
      <q-table
        :rows="lokasiList"
        :columns="columns"
        row-key="id"
        flat
        :filter="search"
        :loading="loading"
        class="premium-table"
        :pagination="{ rowsPerPage: 10 }"
        card-class="bg-transparent"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bolder text-blue-grey-5 uppercase letter-spacing-1 bg-grey-1"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" class="hover-effect">
            <!-- Kolom Nama Lokasi -->
            <q-td key="nama">
              <div class="row items-center no-wrap">
                <q-avatar size="40px" color="blue-1" text-color="primary" class="q-mr-md shadow-1">
                  <q-icon name="domain" size="20px" />
                </q-avatar>
                <div>
                  <div class="text-weight-bold text-blue-grey-10 text-subtitle2">
                    {{ props.row.nama_lokasi }}
                  </div>
                  <div class="text-caption text-blue-grey-4">Zona Validasi Aktif</div>
                </div>
              </div>
            </q-td>

            <!-- Kolom Koordinat -->
            <q-td key="koordinat">
              <div class="column q-gutter-y-xs">
                <div class="text-weight-medium text-blue-grey-8">
                  <q-icon name="explore" color="teal-5" size="xs" class="q-mr-xs" />
                  {{ props.row.latitude }}, {{ props.row.longitude }}
                </div>
                <a
                  :href="`https://www.google.com/maps/search/?api=1&query=${props.row.latitude},${props.row.longitude}`"
                  target="_blank"
                  class="text-primary text-caption text-weight-bold text-decoration-none"
                >
                  Lihat di Google Maps <q-icon name="open_in_new" size="10px" />
                </a>
              </div>
            </q-td>

            <!-- Kolom Radius -->
            <q-td key="radius">
              <q-badge
                color="teal-1"
                text-color="teal-9"
                class="q-px-sm q-py-xs text-weight-bolder shadow-1 rounded-8"
              >
                <q-icon name="radar" size="xs" class="q-mr-xs" />
                {{ props.row.radius }} KM
              </q-badge>
            </q-td>

            <!-- Kolom Aksi -->
            <q-td key="aksi" class="text-right">
              <div class="row justify-end q-gutter-x-sm">
                <q-btn
                  flat
                  round
                  color="blue-7"
                  icon="edit_location_alt"
                  size="sm"
                  class="bg-blue-1 transition-smooth"
                  @click="openDialog(props.row)"
                >
                  <q-tooltip class="bg-blue-8">Edit Lokasi</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="red-6"
                  icon="delete_outline"
                  size="sm"
                  class="bg-red-1 transition-smooth"
                  @click="hapusLokasi(props.row.id)"
                >
                  <q-tooltip class="bg-red-8">Hapus Lokasi</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
            <q-icon size="4em" name="wrong_location" class="q-mb-md opacity-50" />
            <div class="text-h6 text-weight-bold">Belum Ada Lokasi</div>
            <div class="text-caption">Silakan tambah lokasi kantor agar fitur GPS aktif.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- ============================================== -->
    <!-- MODAL TAMBAH / EDIT LOKASI (CLEAN DESIGN)      -->
    <!-- ============================================== -->
    <q-dialog v-model="dialogLokasi" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 550px; max-width: 95vw" class="rounded-24 shadow-soft">
        <!-- Dialog Header -->
        <q-card-section class="row items-center q-pb-none q-pt-lg q-px-lg">
          <div class="row items-center">
            <q-avatar
              color="blue-1"
              text-color="primary"
              icon="place"
              size="42px"
              class="q-mr-md"
            />
            <div>
              <div class="text-h6 text-weight-bold text-blue-grey-10 line-height-1">
                {{ isEdit ? 'Perbarui Lokasi' : 'Lokasi Kantor Baru' }}
              </div>
              <div class="text-caption text-blue-grey-5">
                Pastikan koordinat akurat agar GPS valid.
              </div>
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
            class="bg-grey-2"
          />
        </q-card-section>

        <!-- Dialog Body -->
        <q-form @submit.prevent="simpanLokasi">
          <q-card-section class="q-gutter-y-md q-pa-lg">
            <q-input
              v-model="form.nama_lokasi"
              outlined
              label="Nama Lokasi (Cth: Head Office)"
              class="rounded-input"
              color="primary"
              :rules="[(val) => !!val || 'Nama lokasi wajib diisi']"
            >
              <template v-slot:prepend><q-icon name="apartment" color="blue-grey-4" /></template>
            </q-input>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.latitude"
                  outlined
                  label="Latitude"
                  class="rounded-input"
                  color="primary"
                  :rules="[(val) => !!val || 'Latitude wajib diisi']"
                >
                  <template v-slot:prepend
                    ><q-icon name="gps_fixed" color="blue-grey-4"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.longitude"
                  outlined
                  label="Longitude"
                  class="rounded-input"
                  color="primary"
                  :rules="[(val) => !!val || 'Longitude wajib diisi']"
                >
                  <template v-slot:prepend
                    ><q-icon name="gps_fixed" color="blue-grey-4"
                  /></template>
                </q-input>
              </div>
            </div>

            <!-- Action Buttons for Location -->
            <div class="row q-col-gutter-sm q-mb-xs">
              <div class="col-12 col-md-6">
                <q-btn
                  unelevated
                  color="primary"
                  icon="map"
                  label="Buka Peta"
                  class="full-width rounded-12 text-weight-bold shadow-2 q-py-sm"
                  @click="openMapModal"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-btn
                  unelevated
                  color="teal-6"
                  icon="my_location"
                  label="Ambil GPS Saat Ini"
                  class="full-width rounded-12 text-weight-bold shadow-2 q-py-sm"
                  @click="dapatkanLokasiSekarang"
                  :loading="gettingLocation"
                />
              </div>
            </div>

            <q-input
              v-model.number="form.radius"
              outlined
              type="number"
              step="0.01"
              label="Radius Toleransi Absen (KM)"
              hint="Contoh: 0.5 untuk 500 meter"
              class="rounded-input q-mt-md"
              color="primary"
              :rules="[(val) => !!val || 'Radius wajib diisi']"
            >
              <template v-slot:prepend><q-icon name="radar" color="teal-6" /></template>
              <template v-slot:append
                ><span class="text-caption text-weight-bold text-blue-grey-5">KM</span></template
              >
            </q-input>
          </q-card-section>

          <!-- Dialog Footer -->
          <q-card-actions align="right" class="bg-grey-1 q-pa-md border-top">
            <q-btn
              flat
              label="Batal"
              color="blue-grey-6"
              v-close-popup
              class="text-weight-bold rounded-8 q-px-md"
            />
            <q-btn
              unelevated
              label="SIMPAN DATA"
              color="primary"
              type="submit"
              class="text-weight-bold rounded-12 q-px-xl shadow-soft-primary"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- ============================================== -->
    <!-- MODAL PETA INTERAKTIF (LEAFLET MODERN)         -->
    <!-- ============================================== -->
    <q-dialog v-model="mapDialog" persistent @show="onMapDialogShow" backdrop-filter="blur(4px)">
      <q-card style="width: 850px; max-width: 95vw" class="rounded-24 shadow-soft overflow-hidden">
        <!-- Peta Interaktif Langsung Full di Atas -->
        <div
          class="relative-position"
          style="height: 450px; width: 100%; background-color: #e2e8f0"
        >
          <div id="leaflet-map-container" style="height: 100%; width: 100%; z-index: 1"></div>

          <!-- Floating Header & Close Button di atas Peta -->
          <div
            class="absolute-top row justify-between items-center q-pa-md"
            style="z-index: 1000; pointer-events: none"
          >
            <q-chip
              color="white"
              text-color="blue-grey-10"
              class="shadow-3 text-weight-bolder q-pa-md"
              style="pointer-events: auto"
            >
              <q-icon name="satellite_alt" color="primary" class="q-mr-sm" size="20px" />
              Tentukan Lokasi Validasi
            </q-chip>
            <q-btn
              icon="close"
              round
              dense
              color="white"
              text-color="red-5"
              class="shadow-3"
              v-close-popup
              style="pointer-events: auto"
            />
          </div>

          <!-- Floating Search Box Mulus -->
          <q-card
            class="absolute-top-left shadow-4 rounded-16 overflow-hidden"
            style="z-index: 1000; top: 70px; left: 16px; width: 300px; max-width: 80%"
          >
            <q-input
              v-model="mapSearch"
              dense
              borderless
              class="q-px-md bg-white text-weight-medium"
              placeholder="Cari nama jalan / daerah..."
              @keyup.enter="cariLokasiDiPeta"
              :loading="searchingMap"
            >
              <template v-slot:append>
                <q-btn flat round dense icon="search" color="primary" @click="cariLokasiDiPeta" />
              </template>
            </q-input>
          </q-card>
        </div>

        <!-- Bagian Bawah Peta (Manual Input & Konfirmasi) -->
        <q-card-section class="bg-white">
          <div class="row items-center justify-between q-col-gutter-md">
            <!-- Manual Koordinat & Sinkronisasi -->
            <div class="col-12 col-md-8 row q-gutter-x-sm">
              <q-input
                outlined
                dense
                v-model="tempMapLat"
                label="Latitude"
                class="col bg-grey-1 rounded-8"
                color="primary"
              />
              <q-input
                outlined
                dense
                v-model="tempMapLng"
                label="Longitude"
                class="col bg-grey-1 rounded-8"
                color="primary"
              />
              <q-btn
                unelevated
                outline
                color="blue-grey-4"
                icon="sync"
                class="col-auto rounded-8 bg-white"
                @click="arahkanPetaKeKoordinat"
              >
                <q-tooltip>Sinkronkan Pin ke Input</q-tooltip>
              </q-btn>
            </div>

            <!-- Tombol Konfirmasi -->
            <div class="col-12 col-md-4 text-right">
              <q-btn
                unelevated
                label="PILIH TITIK INI"
                icon="check_circle"
                color="primary"
                @click="konfirmasiPeta"
                class="full-width rounded-12 text-weight-bold shadow-soft-primary q-py-sm"
              />
            </div>
          </div>
        </q-card-section>
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
  { name: 'nama', label: 'NAMA LOKASI', align: 'left', field: 'nama_lokasi', sortable: true },
  { name: 'koordinat', label: 'KOORDINAT GPS', align: 'left' },
  { name: 'radius', label: 'TOLERANSI (RADIUS)', align: 'left', field: 'radius' },
  { name: 'aksi', label: '', align: 'right' },
]

// STATE PETA INTERAKTIF
const mapDialog = ref(false)
const mapSearch = ref('')
const tempMapLat = ref('')
const tempMapLng = ref('')
const searchingMap = ref(false)

let leafletMap = null
let mapMarker = null

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

// BUKA MODAL TAMBAH/EDIT UTAMA
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

// SIMPAN ATAU UPDATE LOKASI KE DATABASE
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
      $q.notify({ color: 'positive', message: 'Lokasi berhasil diperbarui!', position: 'top' })
    } else {
      dataSimpan.created_at = serverTimestamp()
      await addDoc(collection(db, 'lokasi_kantor'), dataSimpan)
      $q.notify({
        color: 'positive',
        message: 'Lokasi baru berhasil ditambahkan!',
        position: 'top',
      })
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
      $q.notify({ color: 'positive', message: 'Lokasi berhasil dihapus!', position: 'top' })
    } catch (error) {
      console.error('Gagal menghapus:', error)
      $q.notify({ color: 'negative', message: 'Gagal menghapus lokasi.' })
    }
  })
}

// FITUR 1: DETEKSI OTOMATIS GPS HP/LAPTOP ADMIN
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
      $q.notify({
        color: 'positive',
        message: 'Koordinat saat ini berhasil dikunci!',
        position: 'top',
      })
    },
    (error) => {
      console.error(error)
      gettingLocation.value = false
      $q.notify({
        color: 'negative',
        message: 'Gagal mendapatkan lokasi. Pastikan GPS browser aktif.',
      })
    },
    { enableHighAccuracy: true },
  )
}

// ==========================================
// FITUR 2: SISTEM PETA INTERAKTIF (LEAFLET)
// ==========================================

const openMapModal = () => {
  tempMapLat.value = form.value.latitude || '-6.284200'
  tempMapLng.value = form.value.longitude || '107.170600'
  mapDialog.value = true

  if (!window.L) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      setTimeout(() => initLeafletMap(), 200)
    }
    document.head.appendChild(script)
  }
}

const onMapDialogShow = () => {
  if (window.L) {
    setTimeout(() => initLeafletMap(), 200)
  }
}

const initLeafletMap = () => {
  const lat = parseFloat(tempMapLat.value)
  const lng = parseFloat(tempMapLng.value)

  if (leafletMap) {
    leafletMap.off()
    leafletMap.remove()
    leafletMap = null
  }

  leafletMap = window.L.map('leaflet-map-container').setView([lat, lng], 16)

  // Style peta modern ala Google Maps Carto
  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(leafletMap)

  // Custom Icon Agar Terlihat Premium
  const customIcon = window.L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  })

  mapMarker = window.L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(leafletMap)

  // eslint-disable-next-line no-unused-vars
  mapMarker.on('dragend', function (e) {
    const pos = mapMarker.getLatLng()
    tempMapLat.value = pos.lat.toFixed(6)
    tempMapLng.value = pos.lng.toFixed(6)
  })

  leafletMap.on('click', function (e) {
    mapMarker.setLatLng(e.latlng)
    tempMapLat.value = e.latlng.lat.toFixed(6)
    tempMapLng.value = e.latlng.lng.toFixed(6)
  })

  leafletMap.invalidateSize()
}

const arahkanPetaKeKoordinat = () => {
  if (leafletMap && mapMarker) {
    const lat = parseFloat(tempMapLat.value) || 0
    const lng = parseFloat(tempMapLng.value) || 0
    leafletMap.setView([lat, lng], 16)
    mapMarker.setLatLng([lat, lng])
  }
}

const cariLokasiDiPeta = async () => {
  if (!mapSearch.value) return
  searchingMap.value = true
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch.value)}`,
    )
    const data = await response.json()

    if (data && data.length > 0) {
      const result = data[0]
      tempMapLat.value = parseFloat(result.lat).toFixed(6)
      tempMapLng.value = parseFloat(result.lon).toFixed(6)
      arahkanPetaKeKoordinat()
    } else {
      $q.notify({ color: 'warning', message: 'Lokasi tidak ditemukan di peta.' })
    }
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Terjadi kesalahan pencarian.' })
  } finally {
    searchingMap.value = false
  }
}

const konfirmasiPeta = () => {
  form.value.latitude = tempMapLat.value
  form.value.longitude = tempMapLng.value
  mapDialog.value = false
}

onMounted(() => {
  fetchLokasi()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

/* SHADOWS & RADIUS */
.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(25, 118, 210, 0.6) !important;
}
.rounded-24 {
  border-radius: 24px;
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
.border-bottom {
  border-bottom: 1px solid #f1f5f9;
}
.border-top {
  border-top: 1px solid #f1f5f9;
}

/* TYPOGRAPHY */
.letter-spacing-tight {
  letter-spacing: -0.5px;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.line-height-1 {
  line-height: 1.2;
}
.uppercase {
  text-transform: uppercase;
}
.opacity-50 {
  opacity: 0.5;
}

/* CUSTOM INPUTS */
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
}
.rounded-input :deep(.q-field__marginal) {
  height: 50px;
}

/* BUTTON TRANSITIONS */
.transition-smooth {
  transition: all 0.3s ease;
}
.transition-smooth:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* TABLE STYLING */
.premium-table :deep(thead tr th) {
  font-size: 12px;
  border-bottom: 2px solid #f1f5f9;
}
.premium-table :deep(tbody tr td) {
  font-size: 14px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}
.hover-effect:hover td {
  background-color: #f8fafc !important;
}
.text-decoration-none {
  text-decoration: none;
}
.text-decoration-none:hover {
  text-decoration: underline;
}

/* LEAFLET OVERRIDES */
#leaflet-map-container {
  font-family: 'Inter', sans-serif;
}
</style>
