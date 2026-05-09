<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row q-col-gutter-md justify-center">
      <template v-if="!showCamera">
        <!-- BARIS 1: JAM & INFORMASI PENUGASAN -->
        <div class="col-12 col-md-5">
          <q-card class="main-card text-white shadow-5 full-height flex flex-center">
            <q-card-section class="text-center q-pa-lg full-width">
              <div class="text-subtitle2 opacity-80 text-uppercase text-weight-bold font-digital">
                ERP PT AGRA ABHINAYA PERKASA
              </div>
              <div class="text-h2 text-weight-bolder q-my-md font-digital letter-spacing-2">
                {{ currentTime }}
              </div>
              <div class="text-subtitle1 text-weight-medium opacity-90">{{ currentDate }}</div>

              <!-- STATUS LOKASI DASHBOARD -->
              <div class="q-mt-lg bg-white-20 q-pa-md rounded-12 border-white-30">
                <div class="row items-center justify-center q-gutter-x-sm q-mb-xs">
                  <q-icon
                    :name="locationData.inRange ? 'location_on' : 'location_off'"
                    :color="locationData.inRange ? 'light-green-13' : 'red-4'"
                    size="sm"
                  />
                  <span
                    class="text-subtitle2 text-weight-bolder"
                    :class="locationData.inRange ? 'text-light-green-13' : 'text-red-4'"
                  >
                    {{ locationData.statusText }}
                  </span>
                </div>

                <div class="address-text q-mb-xs text-weight-medium">
                  <q-icon name="explore" size="xs" class="q-mr-xs opacity-70" />
                  {{ locationData.address || 'Mendeteksi alamat...' }}
                </div>

                <div class="text-caption opacity-60 x-small-text">
                  {{ locationData.lat }}, {{ locationData.lng }}
                </div>

                <!-- INDIKATOR LOKASI KANTOR (JIKA COCOK) -->
                <div
                  v-if="locationData.inRange"
                  class="q-mt-sm text-caption text-weight-bold text-light-green-11 uppercase"
                >
                  Area Valid: {{ locationData.matchedLocationName }}
                </div>
                <div v-else class="q-mt-sm text-caption text-weight-bold text-red-3 uppercase">
                  Harap mendekat ke area kantor!
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card flat bordered class="rounded-card full-height shadow-1">
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-md">
                <q-icon name="assignment_ind" color="primary" size="sm" />
                <div class="text-subtitle1 text-weight-bold q-ml-sm text-grey-9 text-uppercase">
                  Informasi Penugasan
                </div>
              </div>

              <div class="q-gutter-y-sm q-mb-lg">
                <div class="info-row">
                  <span class="label text-grey-7 text-weight-bold">Nama Karyawan</span>
                  <span class="text-weight-bolder text-primary text-uppercase">{{
                    userData.nama || 'MEMUAT...'
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="label text-grey-7 text-weight-bold">Posisi / Jabatan</span>
                  <q-badge color="blue-1" text-color="blue-9" class="text-weight-bold q-pa-xs">{{
                    userData.jabatan || userData.role || 'STAFF'
                  }}</q-badge>
                </div>
              </div>

              <div class="row q-col-gutter-sm">
                <!-- TOMBOL CLOCK-IN DENGAN LOGIKA GEMBOK -->
                <div class="col-6">
                  <q-btn
                    unelevated
                    rounded
                    :color="locationData.inRange ? 'positive' : 'grey-6'"
                    :icon="locationData.inRange ? 'camera_alt' : 'lock'"
                    :label="locationData.inRange ? 'CLOCK-IN' : 'TERKUNCI'"
                    class="full-width q-py-md text-weight-bold shadow-2"
                    @click="startAbsensi"
                  />
                </div>
                <!-- TOMBOL CLOCK-OUT -->
                <div class="col-6">
                  <q-btn
                    unelevated
                    rounded
                    color="negative"
                    icon="logout"
                    label="CLOCK-OUT"
                    class="full-width q-py-md text-weight-bold shadow-2"
                    @click="absenPulang"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- BARIS 2: AKTIVITAS TERBARU -->
        <div class="col-12 col-md-10 q-mt-md">
          <q-card flat bordered class="rounded-card shadow-1 overflow-hidden">
            <q-card-section class="bg-blue-grey-10 text-white q-pa-sm">
              <div class="text-subtitle2 text-weight-bold text-uppercase q-ml-sm">
                Aktivitas Terbaru Anda
              </div>
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-list separator>
                <q-item
                  v-if="riwayatData.length === 0"
                  class="text-center q-pa-lg text-grey-5 italic"
                  >Belum ada aktivitas hari ini.</q-item
                >
                <q-item v-for="item in riwayatData" :key="item.id" class="q-py-md">
                  <q-item-section avatar
                    ><q-avatar color="blue-1" text-color="primary" icon="history"
                  /></q-item-section>
                  <q-item-section>
                    <q-item-label
                      class="text-weight-bold text-grey-9 text-uppercase text-caption"
                      >{{ item.tanggal }}</q-item-label
                    >
                    <q-item-label caption
                      >Lokasi:
                      <span class="text-primary text-weight-bold">{{
                        item.nama_tempat
                      }}</span></q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <div class="text-weight-bold text-grey-9">
                      {{ formatWaktu(item.waktu_masuk) }} - {{ formatWaktu(item.waktu_pulang) }}
                    </div>
                    <q-badge
                      :color="item.status === 'Selesai' ? 'positive' : 'orange'"
                      :label="item.status"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- BARIS 3: STATUS ABSENSI SELURUH KARYAWAN -->
        <div class="col-12 col-md-10 q-mt-md">
          <q-card flat bordered class="rounded-card shadow-1 overflow-hidden">
            <q-card-section class="bg-blue-grey-10 text-white q-pa-sm">
              <div class="text-subtitle2 text-weight-bold text-uppercase q-ml-sm">
                Status Absensi Karyawan Hari Ini
              </div>
            </q-card-section>
            <q-card-section class="q-pa-md">
              <q-table
                :rows="dataSeluruhKaryawan"
                :columns="columnsKaryawan"
                flat
                bordered
                dense
                hide-bottom
                class="status-table"
              />
            </q-card-section>
          </q-card>
        </div>
      </template>

      <!-- MODUL KAMERA -->
      <div class="col-12 col-md-8" v-if="showCamera">
        <q-card flat bordered class="rounded-card shadow-5 overflow-hidden">
          <q-card-section class="bg-primary text-white row items-center q-pa-md">
            <q-btn icon="arrow_back" flat round dense @click="stopCamera" />
            <div class="text-subtitle1 text-weight-bold q-ml-md">VERIFIKASI ABSENSI & GPS</div>
          </q-card-section>

          <q-card-section class="text-center q-pa-md">
            <div class="camera-wrapper relative-position shadow-2">
              <video ref="video" autoplay playsinline class="video-stream"></video>
              <canvas ref="canvas" class="hidden"></canvas>
              <!-- GARIS PANDU WAJAH -->
              <div class="camera-guide" v-if="!capturedImage">
                <div class="guide-circle"></div>
                <div class="text-caption text-white q-mt-sm bg-black-50 rounded-borders q-px-sm">
                  Posisikan wajah di dalam lingkaran
                </div>
              </div>
            </div>

            <div v-if="!capturedImage" class="q-mt-md">
              <q-btn
                color="primary"
                icon="photo_camera"
                label="AMBIL FOTO"
                size="lg"
                rounded
                @click="takePhoto"
              />
            </div>

            <q-slide-transition>
              <div v-if="capturedImage" class="q-mt-lg text-left">
                <q-img :src="capturedImage" class="captured-img rounded-borders shadow-2" />

                <!-- DETAIL LOKASI DI DALAM CLOCK-IN -->
                <div class="q-mt-md bg-grey-1 q-pa-md rounded-borders border-grey">
                  <div class="text-weight-bold text-primary q-mb-xs text-uppercase small-label">
                    Detail Lokasi Presensi
                  </div>
                  <div class="text-body2 text-blue-grey-9 text-weight-medium">
                    {{ locationData.address }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs">
                    Koordinat: {{ locationData.lat }}, {{ locationData.lng }}
                  </div>
                  <q-badge
                    :color="locationData.inRange ? 'positive' : 'negative'"
                    class="q-mt-sm q-px-md text-weight-bold"
                  >
                    STATUS: {{ locationData.statusText.toUpperCase() }}
                  </q-badge>
                </div>

                <!-- TOMBOL KIRIM TERKUNCI DOUBLE GUARD -->
                <q-btn
                  unelevated
                  :color="locationData.inRange ? 'positive' : 'grey-5'"
                  :label="locationData.inRange ? 'KIRIM SEKARANG' : 'DIBLOKIR'"
                  class="full-width q-mt-md q-py-md text-weight-bold shadow-3"
                  icon="send"
                  @click="saveAbsensi"
                />

                <div
                  v-if="!locationData.inRange"
                  class="text-negative text-center q-mt-sm text-weight-bold text-caption"
                >
                  Tombol pengiriman dikunci karena Anda di luar area.
                </div>

                <q-btn
                  flat
                  color="grey-7"
                  label="ULANGI FOTO"
                  class="full-width q-mt-xs"
                  @click="capturedImage = null"
                />
              </div>
            </q-slide-transition>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  Timestamp,
} from 'firebase/firestore'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const currentTime = ref('')
const currentDate = ref('')
const riwayatData = ref([])
const dataSeluruhKaryawan = ref([])

// Variabel data user dinamis yang tersinkron
const userData = ref({
  nama: 'Memuat...',
  jabatan: 'Staff',
  role: 'Staff',
  email: '',
})

const documentId = ref(null)
const showCamera = ref(false)
const capturedImage = ref(null)
const video = ref(null)
const canvas = ref(null)

// Variabel Penampung Lokasi Kantor dari Firestore
const daftarLokasiKantor = ref([])

const locationData = ref({
  lat: '0.0000',
  lng: '0.0000',
  address: '',
  statusText: 'Mencari Lokasi...',
  inRange: false,
  matchedLocationName: 'AREA LUAR KANTOR',
})

const columnsKaryawan = [
  { name: 'no', label: 'No', field: 'no', align: 'left' },
  { name: 'nama', label: 'Nama Karyawan', field: 'nama_karyawan', align: 'left' },
  { name: 'checkin', label: 'Check-in', field: 'checkin', align: 'center' },
  { name: 'checkout', label: 'Check-out', field: 'checkout', align: 'center' },
]

const updateTime = () => {
  const now = new Date()
  currentTime.value = date.formatDate(now, 'HH.mm.ss')
  currentDate.value = date.formatDate(now, 'dddd, DD MMMM YYYY', {
    days: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    months: [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ],
  })
}

const getAddressName = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    )
    const data = await response.json()
    locationData.value.address = data.display_name.split(',').slice(0, 3).join(',')
  } catch {
    locationData.value.address = 'Gagal memuat alamat'
  }
}

// RUMUS MENGHITUNG JARAK ANTARA 2 TITIK KOORDINAT (HAVERSINE)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius Bumi dalam KM
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Hasil dalam KM
}

// FUNGSI DETEKSI LOKASI MULTI-KANTOR
const detectLocation = () => {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (p) => {
      const lat = p.coords.latitude
      const lng = p.coords.longitude

      locationData.value.lat = lat.toFixed(5)
      locationData.value.lng = lng.toFixed(5)

      let foundMatch = false
      let matchedName = 'AREA LUAR KANTOR'

      // CEK SATU-PERSATU DARI SEMUA LOKASI KANTOR YANG ADA DI DATABASE
      for (const loc of daftarLokasiKantor.value) {
        const distance = calculateDistance(lat, lng, loc.latitude, loc.longitude)

        // Jika jarak user <= radius kantor (KM)
        if (distance <= loc.radius) {
          foundMatch = true
          matchedName = loc.nama_lokasi
          break // Stop loop, sudah ketemu 1 yang valid
        }
      }

      locationData.value.inRange = foundMatch
      locationData.value.matchedLocationName = matchedName
      locationData.value.statusText = foundMatch ? 'Lokasi Dalam Jangkauan' : 'DI LUAR AREA KANTOR'

      getAddressName(lat, lng)
    },
    () => {
      locationData.value.statusText = 'GPS Tidak Aktif'
    },
    { enableHighAccuracy: true },
  )
}

// ==========================================
// PENGUNCIAN TOMBOL CLOCK-IN
// ==========================================
const startAbsensi = () => {
  // Jika di luar range, blokir kamera terbuka!
  if (!locationData.value.inRange) {
    $q.notify({
      color: 'negative',
      icon: 'gavel',
      message: 'AKSES DITOLAK: Anda berada di luar radius lokasi kantor yang diizinkan!',
      position: 'top',
      timeout: 3000,
    })
    return
  }

  showCamera.value = true
  setTimeout(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      if (video.value) video.value.srcObject = s
    })
  }, 100)
}

const takePhoto = () => {
  const ctx = canvas.value.getContext('2d')
  canvas.value.width = video.value.videoWidth
  canvas.value.height = video.value.videoHeight
  ctx.drawImage(video.value, 0, 0)
  capturedImage.value = canvas.value.toDataURL('image/jpeg')
}

const stopCamera = () => {
  if (video.value?.srcObject) video.value.srcObject.getTracks().forEach((t) => t.stop())
  showCamera.value = false
}

// ==========================================
// PENGUNCIAN FUNGSI SIMPAN KE DATABASE
// ==========================================
const saveAbsensi = async () => {
  // Double guard: Cegah simpan data kalau bukan inRange
  if (!locationData.value.inRange) {
    $q.notify({ color: 'negative', message: 'Tidak bisa mengirim absensi dari luar area!' })
    return
  }

  $q.loading.show()
  try {
    const formattedName = (userData.value.nama || 'USER').toUpperCase()

    await addDoc(collection(db, 'absensi'), {
      nama_karyawan: formattedName,
      waktu_masuk: serverTimestamp(),
      waktu_pulang: null,
      tanggal: currentDate.value,
      status: 'Hadir',
      nama_tempat: locationData.value.matchedLocationName, // Cth: PT AGRA ABHINAYA PERKASA
      alamat_lengkap: locationData.value.address,
      koordinat: `${locationData.value.lat}, ${locationData.value.lng}`,
    })
    $q.notify({ color: 'positive', message: 'Berhasil Clock-in!' })
    stopCamera()
  } catch (e) {
    console.error('Gagal Clock-in:', e)
    $q.notify({ color: 'negative', message: 'Gagal absen, coba lagi.' })
  } finally {
    $q.loading.hide()
  }
}

const absenPulang = async () => {
  if (!documentId.value) return $q.notify({ color: 'warning', message: 'Belum Clock-in hari ini!' })
  $q.loading.show()
  try {
    await updateDoc(doc(db, 'absensi', documentId.value), {
      waktu_pulang: serverTimestamp(),
      status: 'Selesai',
    })
    $q.notify({ color: 'negative', message: 'Berhasil Clock-out!' })
  } catch (e) {
    console.error('Gagal Clock-out:', e)
    $q.notify({ color: 'negative', message: 'Gagal Clock-out, coba lagi.' })
  } finally {
    $q.loading.hide()
  }
}

const formatWaktu = (ts) => (ts ? date.formatDate(ts.toDate(), 'HH.mm') : '--.--')

let timer, unsubMe, unsubAll, unsubUser, unsubLokasi, locationTimer

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)

  // 0. AMBIL DAFTAR LOKASI KANTOR DARI ADMIN (REALTIME)
  unsubLokasi = onSnapshot(collection(db, 'lokasi_kantor'), (snap) => {
    daftarLokasiKantor.value = snap.docs.map((doc) => doc.data())
    // Langsung tembak deteksi GPS begitu pengaturan lokasi selesai diunduh
    detectLocation()
  })

  locationTimer = setInterval(detectLocation, 45000)

  // 1. SINKRONISASI DATA USER DARI LOCALSTORAGE
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      userData.value = {
        nama: parsed.nama || 'User',
        jabatan: parsed.jabatan || parsed.role || 'Staff',
        role: parsed.role || 'Staff',
        email: parsed.email || '',
      }

      if (userData.value.email) {
        const qUser = query(collection(db, 'karyawan'), where('email', '==', userData.value.email))
        unsubUser = onSnapshot(qUser, (snap) => {
          if (!snap.empty) {
            const data = snap.docs[0].data()
            userData.value = {
              ...userData.value,
              nama: data.nama || userData.value.nama,
              jabatan: data.jabatan || userData.value.jabatan,
              role: data.role || userData.value.role,
            }
          }
        })
      }
    } catch (e) {
      console.error('Gagal parse data sesi lokal', e)
    }
  }

  // 3. AMBIL DATA RIWAYAT PRIBADI HARI INI
  const searchName = (userData.value.nama || 'USER').toUpperCase()
  const qMe = query(
    collection(db, 'absensi'),
    where('nama_karyawan', '==', searchName),
    orderBy('waktu_masuk', 'desc'),
    limit(5),
  )

  unsubMe = onSnapshot(qMe, (snap) => {
    riwayatData.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const active = riwayatData.value.find(
      (a) => a.tanggal === currentDate.value && a.status === 'Hadir',
    )
    documentId.value = active ? active.id : null
  })

  // 4. PENARIKAN DATA SELURUH KARYAWAN HARI INI
  const startDay = new Date()
  startDay.setHours(0, 0, 0, 0)
  const qAll = query(
    collection(db, 'absensi'),
    where('waktu_masuk', '>=', Timestamp.fromDate(startDay)),
    orderBy('waktu_masuk', 'desc'),
  )

  unsubAll = onSnapshot(qAll, (snap) => {
    dataSeluruhKaryawan.value = snap.docs.map((d, i) => {
      const dta = d.data()
      return {
        no: i + 1,
        nama_karyawan: dta.nama_karyawan,
        checkin: formatWaktu(dta.waktu_masuk),
        checkout: formatWaktu(dta.waktu_pulang),
      }
    })
  })
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(locationTimer)
  if (unsubMe) unsubMe()
  if (unsubAll) unsubAll()
  if (unsubUser) unsubUser()
  if (unsubLokasi) unsubLokasi()
})
</script>

<style scoped>
.main-card {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 12px;
}
.rounded-card {
  border-radius: 12px;
}
.bg-white-20 {
  background: rgba(255, 255, 255, 0.15);
}
.border-white-30 {
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.rounded-12 {
  border-radius: 12px;
}
.address-text {
  font-size: 0.85rem;
  line-height: 1.2;
  max-width: 90%;
  margin: 0 auto;
}
.x-small-text {
  font-size: 0.65rem;
}
.camera-wrapper {
  width: 100%;
  height: 350px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.camera-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.guide-circle {
  width: 180px;
  height: 240px;
  border: 3px dashed #4caf50;
  border-radius: 100px;
  background: rgba(76, 175, 80, 0.05);
}
.bg-black-50 {
  background: rgba(0, 0, 0, 0.5);
}
.captured-img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}
.small-label {
  font-size: 0.7rem;
  letter-spacing: 1px;
}
.font-digital {
  font-family: 'Courier New', Courier, monospace;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.uppercase {
  text-transform: uppercase;
}
</style>
