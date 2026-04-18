<template>
  <q-page class="bg-grey-2 q-pa-sm">
    <div class="row q-col-gutter-sm justify-center items-stretch">
      <div class="col-12 col-md-5">
        <q-card class="dashboard-card text-white shadow-3 full-height">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-weight-light">Selamat Datang,</div>
            <div class="text-h6 text-weight-bold">Karyawan PT Agra</div>
            <div class="text-caption q-mt-xs opacity-70">
              <q-icon name="place" size="xs" /> {{ placeName || 'Mencari Lokasi...' }}
            </div>
          </q-card-section>

          <q-card-section class="text-center q-py-sm">
            <div class="text-h2 text-weight-bolder">{{ currentTime }}</div>
            <div class="text-caption opacity-80 text-uppercase">{{ currentDate }}</div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <div
              class="row items-center justify-between bg-white-transparent q-pa-xs q-px-md rounded-borders"
            >
              <div class="text-caption text-weight-medium">Status Absensi:</div>
              <q-badge
                color="white"
                text-color="primary"
                :label="statusAbsen"
                class="text-weight-bold text-caption"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card flat bordered class="rounded-borders full-height column">
          <q-card-section class="col q-pa-sm">
            <div class="row items-center no-wrap text-grey-9 q-mb-xs">
              <q-icon name="location_on" color="red" size="xs" />
              <div class="text-caption text-weight-bold q-ml-xs truncate">
                {{ placeName }}
              </div>
            </div>
            <div
              id="map"
              class="shadow-1 rounded-borders"
              style="height: 145px; width: 100%; z-index: 1"
            ></div>
          </q-card-section>

          <q-separator inset />

          <q-card-section class="row items-center justify-around q-py-lg">
            <div class="text-center">
              <q-btn
                round
                size="28px"
                color="positive"
                icon="login"
                class="shadow-2"
                @click="absenMasuk"
                :disable="false"
              />
              <div class="q-mt-xs text-caption text-weight-bold text-grey-7">MASUK</div>
            </div>

            <div class="text-center">
              <q-btn
                round
                size="28px"
                color="negative"
                icon="logout"
                class="shadow-2"
                @click="absenPulang"
                :disable="false"
              />
              <div class="q-mt-xs text-caption text-weight-bold text-grey-7">PULANG</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-12 q-mt-sm">
        <div class="text-subtitle2 text-grey-8 q-mb-xs q-ml-xs">Riwayat Terakhir</div>
        <q-list bordered separator class="bg-white rounded-borders shadow-1">
          <q-item v-if="riwayatAbsen.length === 0" class="text-center q-pa-md text-grey-6 italic"
            >Belum ada data...</q-item
          >
          <q-item v-for="item in riwayatAbsen" :key="item.id" dense class="q-py-sm">
            <q-item-section avatar>
              <q-avatar size="32px" color="blue-1" text-color="blue" icon="event_available" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-caption text-weight-bold">{{ item.tanggal }}</q-item-label>
              <q-item-label caption class="truncate text-orange-9" style="max-width: 200px">
                {{ item.nama_tempat }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-caption text-weight-bold text-grey-9 q-mb-xs">
                {{ formatWaktu(item.waktu_masuk) }} - {{ formatWaktu(item.waktu_pulang) }}
              </div>
              <q-badge
                dense
                outline
                :color="item.status === 'Selesai' ? 'positive' : 'orange'"
                :label="item.status"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  setup() {
    const $q = useQuasar()
    const currentTime = ref('')
    const currentDate = ref('')
    const statusAbsen = ref('Belum Absen')
    const riwayatAbsen = ref([])
    const documentId = ref(null)
    const userCoords = ref(null)
    const placeName = ref('Mencari lokasi...')
    const accuracyInfo = ref(0)

    let map = null,
      marker = null
    const gpsOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      currentDate.value = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const formatWaktu = (ts) =>
      ts ? ts.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'

    const initMap = (lat, lng) => {
      if (map) {
        map.setView([lat, lng], 15)
        marker.setLatLng([lat, lng])
        return
      }
      map = L.map('map', { zoomControl: false }).setView([lat, lng], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      marker = L.marker([lat, lng]).addTo(map)
    }

    const getPlaceName = async (lat, lng) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        )
        const data = await res.json()
        placeName.value =
          data.address.residential ||
          data.address.road ||
          data.address.village ||
          'Lokasi Terdeteksi'
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        placeName.value = 'Gagal memuat alamat'
      }
    }

    const getRealLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            userCoords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            accuracyInfo.value = pos.coords.accuracy.toFixed(0)
            getPlaceName(pos.coords.latitude, pos.coords.longitude)
            await nextTick()
            initMap(pos.coords.latitude, pos.coords.longitude)
          },
          (err) => {
            console.error(err)
          },
          gpsOptions,
        )
      }
    }

    const absenMasuk = async () => {
      $q.loading.show({ message: 'Mengunci GPS...' })
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const todayStr = new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
            await addDoc(collection(db, 'absensi'), {
              nama_karyawan: 'Karyawan PT Agra',
              waktu_masuk: serverTimestamp(),
              waktu_pulang: null,
              tanggal: todayStr,
              status: 'Hadir',
              nama_tempat: placeName.value,
              koordinat_masuk: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            })
            $q.notify({
              color: 'positive',
              message: 'Berhasil Absen!',
              icon: 'check',
              position: 'top',
            })
          } catch (e) {
            console.error(e)
          } finally {
            $q.loading.hide()
          }
        },
        null,
        gpsOptions,
      )
    }

    const absenPulang = async () => {
      const rec = riwayatAbsen.value.find((a) => a.status === 'Hadir')
      const id = documentId.value || (rec ? rec.id : null)
      if (!id) return $q.notify({ color: 'warning', message: 'Tidak ada data aktif.' })
      $q.loading.show()
      try {
        await updateDoc(doc(db, 'absensi', id), {
          waktu_pulang: serverTimestamp(),
          status: 'Selesai',
        })
        $q.notify({
          color: 'negative',
          message: 'Berhasil Pulang!',
          icon: 'logout',
          position: 'top',
        })
      } catch (e) {
        console.error(e)
      } finally {
        $q.loading.hide()
      }
    }

    let timerInterval
    onMounted(() => {
      updateTime()
      getRealLocation()
      timerInterval = setInterval(updateTime, 1000)
      const q = query(collection(db, 'absensi'), orderBy('waktu_masuk', 'desc'), limit(5))
      onSnapshot(q, (snap) => {
        riwayatAbsen.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const t = new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        const h = riwayatAbsen.value.find((a) => a.tanggal === t)
        if (h) {
          documentId.value = h.id
          statusAbsen.value = h.waktu_pulang ? 'Sudah Pulang' : 'Sudah Absen Masuk'
        } else {
          statusAbsen.value = 'Belum Absen'
          documentId.value = null
        }
      })
    })

    onUnmounted(() => {
      if (timerInterval) clearInterval(timerInterval)
    })

    return {
      currentTime,
      currentDate,
      statusAbsen,
      absenMasuk,
      absenPulang,
      riwayatAbsen,
      formatWaktu,
      userCoords,
      placeName,
      accuracyInfo,
    }
  },
}
</script>

<style scoped>
.dashboard-card {
  background: linear-gradient(135deg, #1976d2 0%, #2196f3 100%);
  border-radius: 15px;
}
.bg-white-transparent {
  background: rgba(255, 255, 255, 0.2);
}
.rounded-borders {
  border-radius: 12px;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.full-height {
  height: 100%;
}
</style>
