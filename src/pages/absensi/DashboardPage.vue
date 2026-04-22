<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row q-col-gutter-md justify-center">
      <template v-if="!showCamera">
        <div class="col-12 col-md-5">
          <q-card class="main-card text-white shadow-5 full-height flex flex-center">
            <q-card-section class="text-center q-pa-lg">
              <div class="text-subtitle2 opacity-80 text-uppercase text-weight-bold font-digital">
                ERP PT AGRA ABHINAYA PERKASA
              </div>
              <div class="text-h2 text-weight-bolder q-my-md font-digital">{{ currentTime }}</div>
              <div class="text-subtitle1 text-weight-medium opacity-90">{{ currentDate }}</div>
              <div class="status-pill q-mt-md inline-block">
                <q-icon name="circle" color="light-green-13" size="xs" />
                <span class="q-ml-sm text-weight-bold">Status: Online</span>
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
                    currentUserName
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="label text-grey-7 text-weight-bold">Shift Kerja</span>
                  <q-badge color="blue-1" text-color="blue-9" class="text-weight-bold"
                    >SHIFT 1 (08:15 - 17:00)</q-badge
                  >
                </div>
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-btn
                    unelevated
                    rounded
                    color="positive"
                    icon="camera_alt"
                    label="CLOCK-IN"
                    class="full-width q-py-md text-weight-bold shadow-2"
                    @click="startAbsensi"
                  />
                </div>
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

        <div class="col-12 col-md-10 q-mt-md">
          <q-card flat bordered class="rounded-card shadow-1 overflow-hidden">
            <q-card-section class="bg-blue-grey-10 text-white q-pa-sm">
              <div class="text-subtitle2 text-weight-bold text-uppercase q-ml-sm">
                Pemberitahuan Anda
              </div>
            </q-card-section>
            <q-card-section class="q-pa-none scroll-container">
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
                    <q-item-label class="text-weight-bold text-uppercase text-grey-9">{{
                      item.tanggal
                    }}</q-item-label>
                    <q-item-label caption
                      >Area:
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

        <div class="col-12 col-md-10 q-mt-md">
          <q-card flat bordered class="rounded-card shadow-1 overflow-hidden">
            <q-card-section class="bg-blue-grey-10 text-white q-pa-sm">
              <div class="text-subtitle2 text-weight-bold text-uppercase q-ml-sm">
                Status Absensi Seluruh Karyawan Hari Ini
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
              >
                <template v-slot:no-data>
                  <div class="full-width row flex-center q-pa-md text-grey-6 italic">
                    Belum ada karyawan yang absen hari ini.
                  </div>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <div class="col-12 col-md-8" v-if="showCamera">
        <q-card flat bordered class="rounded-card shadow-5 overflow-hidden">
          <q-card-section class="bg-primary text-white row items-center q-pa-md">
            <q-btn icon="arrow_back" flat round dense @click="stopCamera" />
            <div class="text-subtitle1 text-weight-bold q-ml-md">
              AMBIL FOTO & VERIFIKASI LOKASI
            </div>
          </q-card-section>

          <q-card-section class="text-center q-pa-md">
            <div class="camera-wrapper relative-position shadow-2">
              <video ref="video" autoplay playsinline class="video-stream"></video>
              <canvas ref="canvas" class="hidden"></canvas>
              <div class="camera-guide" v-if="!capturedImage"><div class="guide-circle"></div></div>
            </div>

            <div class="row justify-center q-mt-md" v-if="!capturedImage">
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

                <div class="q-mt-md bg-grey-1 q-pa-md rounded-borders border-grey">
                  <div class="text-weight-bold text-primary q-mb-sm">Informasi Lokasi</div>
                  <div class="text-caption text-grey-9 q-gutter-y-xs">
                    <div>
                      Latitude: <b>{{ locationData.lat }}</b>
                    </div>
                    <div>
                      Longitude: <b>{{ locationData.lng }}</b>
                    </div>
                    <div class="q-mt-xs">
                      <span
                        :class="locationData.inRange ? 'text-positive' : 'text-negative'"
                        class="text-weight-bold"
                      >
                        Status Lokasi: {{ locationData.statusText }}
                      </span>
                    </div>
                  </div>
                </div>

                <q-btn
                  unelevated
                  color="positive"
                  label="KIRIM ABSENSI"
                  class="full-width q-mt-md q-py-md text-weight-bold shadow-3"
                  icon="send"
                  @click="saveAbsensi"
                />
                <q-btn
                  flat
                  color="grey-7"
                  label="ULANG FOTO"
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
const currentUserName = ref('KARYAWAN AGRA')
const documentId = ref(null)
const showCamera = ref(false)
const capturedImage = ref(null)
const video = ref(null)
const canvas = ref(null)
const locationData = ref({ lat: 0, lng: 0, statusText: 'Mencari GPS...', inRange: false })

const KANTOR_LAT = -6.2842
const KANTOR_LNG = 107.1706

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

const startAbsensi = () => {
  showCamera.value = true
  capturedImage.value = null
  setTimeout(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      if (video.value) video.value.srcObject = s
    })
  }, 100)
}

const stopCamera = () => {
  if (video.value?.srcObject) video.value.srcObject.getTracks().forEach((t) => t.stop())
  showCamera.value = false
}

const takePhoto = () => {
  const ctx = canvas.value.getContext('2d')
  canvas.value.width = video.value.videoWidth
  canvas.value.height = video.value.videoHeight
  ctx.drawImage(video.value, 0, 0)
  capturedImage.value = canvas.value.toDataURL('image/jpeg')

  navigator.geolocation.getCurrentPosition((p) => {
    const lat = p.coords.latitude
    const lng = p.coords.longitude
    const R = 6371
    const dLat = ((KANTOR_LAT - lat) * Math.PI) / 180
    const dLon = ((KANTOR_LNG - lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((KANTOR_LAT * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    locationData.value = {
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      inRange: dist <= 0.1,
      statusText: dist <= 0.1 ? 'Dalam Jangkauan Kantor' : 'Di Luar Jangkauan Kantor',
    }
  })
}

const saveAbsensi = async () => {
  $q.loading.show()
  try {
    await addDoc(collection(db, 'absensi'), {
      nama_karyawan: currentUserName.value,
      waktu_masuk: serverTimestamp(),
      waktu_pulang: null,
      tanggal: currentDate.value,
      status: 'Hadir',
      nama_tempat: locationData.value.inRange ? 'KANTOR AGRA' : 'AREA TESTING',
    })
    $q.notify({ color: 'positive', message: 'Clock-in Berhasil!' })
    stopCamera()
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

const absenPulang = async () => {
  const id = documentId.value
  if (!id) return $q.notify({ color: 'warning', message: 'Kamu belum absen masuk hari ini!' })
  $q.loading.show()
  try {
    await updateDoc(doc(db, 'absensi', id), { waktu_pulang: serverTimestamp(), status: 'Selesai' })
    $q.notify({ color: 'negative', message: 'Clock-out Berhasil!' })
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

const formatWaktu = (ts) => (ts ? date.formatDate(ts.toDate(), 'HH.mm') : '--.--')

let timer
let unsubMe
let unsubAll
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)

  const saved = localStorage.getItem('user_data')
  if (saved) {
    const parsed = JSON.parse(saved)
    currentUserName.value = parsed.nama || parsed.displayName || 'KARYAWAN AGRA'
  }

  // 1. DATA PRIBADI (Pemberitahuan) - Listen ke semua absen kamu
  const qMe = query(
    collection(db, 'absensi'),
    where('nama_karyawan', '==', currentUserName.value),
    orderBy('waktu_masuk', 'desc'),
    limit(5),
  )
  unsubMe = onSnapshot(qMe, (snap) => {
    riwayatData.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const hariIni = riwayatData.value.find(
      (a) => a.tanggal === currentDate.value && a.status === 'Hadir',
    )
    documentId.value = hariIni ? hariIni.id : null
  })

  // 2. DATA SEMUA KARYAWAN - Listen ke semua orang hari ini
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
  if (unsubMe) unsubMe()
  if (unsubAll) unsubAll()
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
.status-pill {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
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
.guide-circle {
  width: 180px;
  height: 240px;
  border: 3px solid #4caf50;
  border-radius: 50% 50% 40% 40%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5);
}
.scroll-container {
  max-height: 250px;
  overflow-y: auto;
}
.font-digital {
  font-family: 'Courier New', Courier, monospace;
}
</style>
