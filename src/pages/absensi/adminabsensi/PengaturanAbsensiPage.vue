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
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl header-entrance">
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
          class="neo-btn text-weight-bold q-px-lg q-py-sm"
          @click="openDialog()"
        />
      </div>
    </div>

    <!-- MAIN DATA TABLE CARD -->
    <q-card flat class="neo-card overflow-hidden table-entrance">
      <!-- Toolbar Pencarian -->
      <q-card-section class="q-pa-lg bg-white neo-table-toolbar">
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
                  icon="edit_location_alt"
                  size="sm"
                  class="neo-edit-btn"
                  @click="openDialog(props.row)"
                >
                  <q-tooltip class="bg-blue-8">Edit Lokasi</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="delete_outline"
                  size="sm"
                  class="neo-delete-btn"
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
      <q-card style="width: 550px; max-width: 95vw" class="neo-card">
        <!-- Dialog Header -->
        <q-card-section class="row items-center q-pb-md q-pt-lg q-px-lg neo-table-toolbar bg-white">
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
                  class="full-width neo-btn bg-white text-grey-9 q-py-sm"
                  @click="openMapModal"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-btn
                  unelevated
                  color="teal-6"
                  icon="my_location"
                  label="Ambil GPS Saat Ini"
                  class="full-width neo-btn bg-teal-1 text-teal-9 q-py-sm"
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
              class="neo-btn text-weight-bold q-px-xl q-py-sm"
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
      <q-card style="width: 850px; max-width: 95vw" class="neo-card overflow-hidden">
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
                class="full-width neo-btn text-weight-bold q-py-sm"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    </div>
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

/* NEO-BRUTALIST STYLING */
.neo-page-bg {
  background-color: #f0f7ff !important;
  background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
  background-size: 20px 20px;
  position: relative;
  overflow: hidden;
}

.neo-card {
  background: #ffffff !important;
  border: 2.5px solid #0f172a !important;
  border-radius: 16px !important;
  box-shadow: 4px 4px 0px #0f172a !important;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.neo-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 8px 8px 0px #0f172a !important;
}

.neo-btn {
  border: 2px solid #0f172a !important;
  box-shadow: 3px 3px 0px #0f172a !important;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-btn:hover {
  transform: translateY(-1px) translateX(1px);
  box-shadow: 2px 2px 0px #0f172a !important;
}

.neo-btn:active {
  transform: translateY(2px) translateX(2px);
  box-shadow: 0px 0px 0px #0f172a !important;
}

.neo-nav-btn {
  border: 2px solid #0f172a !important;
  background: #ffffff !important;
  color: #0f172a !important;
  transition: all 0.2s ease;
  width: 38px;
  height: 38px;
}

.neo-nav-btn:hover {
  background: #e0f2fe !important;
  transform: scale(1.05);
}

.neo-edit-btn {
  border: 1.5px solid #0f172a !important;
  background: #e0f2fe !important;
  color: #1d4ed8 !important;
  transition: all 0.2s ease;
}
.neo-edit-btn:hover {
  background: #3b82f6 !important;
  color: #ffffff !important;
  transform: scale(1.1);
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
}
.rounded-input :deep(.q-field__marginal) {
  height: 50px;
}

/* TABLE STYLING */
.premium-table :deep(thead tr th) {
  font-size: 12px;
  font-weight: 800 !important;
  color: #0f172a !important;
  background-color: #f1f5f9 !important;
  border-bottom: 2.5px solid #0f172a !important;
  border-top: none;
  letter-spacing: 0.5px;
}

.premium-table :deep(tbody tr td) {
  font-size: 13.5px;
  color: #0f172a !important;
  border-bottom: 1.5px solid #0f172a !important;
  transition: all 0.2s ease;
}

.hover-effect:hover td {
  background-color: #e0f2fe !important;
}

.premium-table :deep(.q-badge) {
  border: 1.5px solid #0f172a !important;
  font-weight: 800 !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

.premium-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  width: 100%;
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

/* LEAFLET OVERRIDES */
#leaflet-map-container {
  font-family: 'Inter', sans-serif;
  border: 2px solid #0f172a;
  border-radius: 12px;
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
</style>
