<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card class="dashboard-card text-white shadow-5">
          <q-card-section>
            <div class="text-h6 text-weight-light">Selamat Datang,</div>
            <div class="text-h5 text-weight-bold">Karyawan PT Agra</div>
            <div class="text-subtitle2 q-mt-sm opacity-70">Sukatani First Mile Hub</div>
          </q-card-section>

          <q-card-section class="text-center q-py-lg">
            <div class="text-h2 text-weight-bolder">{{ currentTime }}</div>
            <div class="text-h6 opacity-80">{{ currentDate }}</div>
          </q-card-section>

          <q-card-section>
            <div
              class="row items-center justify-between bg-white-transparent q-pa-sm rounded-borders"
            >
              <div class="text-caption">Status Hari Ini:</div>
              <q-badge
                color="white"
                text-color="primary"
                :label="statusAbsen"
                class="text-weight-bold"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card flat bordered class="rounded-borders full-height">
          <q-card-section class="text-grey-8 text-weight-bold">
            <q-icon name="location_on" color="red" size="sm" />
            Lokasi Anda:
            <span class="text-primary" v-if="userCoords">
              {{ placeName }}
              <q-tooltip class="bg-black">
                Akurasi: {{ accuracyInfo }}m | {{ userCoords.lat.toFixed(6) }},
                {{ userCoords.lng.toFixed(6) }}
              </q-tooltip>
            </span>
            <span class="text-grey-6" v-else>Mencari sinyal GPS akurat...</span>
          </q-card-section>

          <q-separator />

          <q-card-section class="row items-center justify-around q-py-xl">
            <div class="text-center">
              <q-btn
                round
                size="35px"
                color="positive"
                icon="login"
                class="shadow-3"
                @click="absenMasuk"
                :disable="statusAbsen !== 'Belum Absen'"
              />
              <div class="q-mt-md text-weight-bold text-grey-9 text-uppercase">Absen Masuk</div>
            </div>

            <div class="text-center">
              <q-btn
                round
                size="35px"
                color="negative"
                icon="logout"
                class="shadow-3"
                @click="absenPulang"
                :disable="statusAbsen !== 'Sudah Absen Masuk'"
              />
              <div class="q-mt-md text-weight-bold text-grey-9 text-uppercase">Absen Pulang</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <div class="text-h6 text-grey-8 q-mb-sm">Riwayat Minggu Ini</div>
        <q-list bordered separator class="bg-white rounded-borders shadow-1">
          <q-item v-if="riwayatAbsen.length === 0" class="text-center q-pa-md text-grey-6 italic"
            >Belum ada data...</q-item
          >
          <q-item v-for="item in riwayatAbsen" :key="item.id" clickable v-ripple>
            <q-item-section avatar>
              <q-avatar color="blue-1" text-color="blue" icon="event_available" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ item.tanggal }}</q-item-label>
              <q-item-label caption>
                Masuk: {{ formatWaktu(item.waktu_masuk) }} | Pulang:
                {{ formatWaktu(item.waktu_pulang) }}
              </q-item-label>
              <q-item-label caption class="text-orange-9" v-if="item.nama_tempat">
                <q-icon name="explore" size="xs" /> Lokasi: {{ item.nama_tempat }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
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
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

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

    // Opsi GPS Akurasi Tinggi
    const gpsOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }

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

    const getPlaceName = async (lat, lng) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        )
        const data = await res.json()
        // Prioritas menampilkan nama jalan/perumahan
        placeName.value =
          data.address.residential ||
          data.address.road ||
          data.address.neighbourhood ||
          data.address.village ||
          data.address.suburb ||
          'Lokasi Terdeteksi'
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        placeName.value = 'Gagal memuat alamat'
      }
    }

    const getRealLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            userCoords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            accuracyInfo.value = pos.coords.accuracy.toFixed(0)
            getPlaceName(pos.coords.latitude, pos.coords.longitude)
          },
          (err) => {
            console.error(err)
          },
          gpsOptions,
        )
      }
    }

    const absenMasuk = async () => {
      $q.loading.show({ message: 'Mengunci GPS Akurasi Tinggi...' })

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            // Cari nama tempat terbaru sebelum simpan
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
            )
            const data = await res.json()
            const finalPlace =
              data.address.residential ||
              data.address.road ||
              data.address.neighbourhood ||
              data.address.village ||
              'Lokasi Terdeteksi'

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
              nama_tempat: finalPlace,
              koordinat_masuk: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            })
            $q.notify({ color: 'positive', message: 'Berhasil! Lokasi Terkunci.', icon: 'check' })
            // eslint-disable-next-line no-unused-vars
          } catch (e) {
            $q.notify({ color: 'negative', message: 'Database Error' })
          } finally {
            $q.loading.hide()
          }
        },
        // eslint-disable-next-line no-unused-vars
        (err) => {
          $q.loading.hide()
          $q.notify({ color: 'negative', message: 'GPS Error: Pastikan Izin Diberikan' })
        },
        gpsOptions,
      )
    }

    const absenPulang = async () => {
      if (!documentId.value) return
      $q.loading.show({ message: 'Update Jam Pulang...' })
      try {
        await updateDoc(doc(db, 'absensi', documentId.value), {
          waktu_pulang: serverTimestamp(),
          status: 'Selesai',
        })
        $q.notify({ color: 'negative', message: 'Hati-hati di jalan!', icon: 'logout' })
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        $q.notify({ color: 'negative', message: 'Gagal' })
      } finally {
        $q.loading.hide()
      }
    }

    let timer, unsubscribe
    onMounted(() => {
      updateTime()
      getRealLocation()
      timer = setInterval(updateTime, 1000)
      const q = query(collection(db, 'absensi'), orderBy('waktu_masuk', 'desc'), limit(5))
      unsubscribe = onSnapshot(q, (snapshot) => {
        riwayatAbsen.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        const tStr = new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        const hIni = riwayatAbsen.value.find((a) => a.tanggal === tStr)
        if (hIni) {
          documentId.value = hIni.id
          statusAbsen.value = hIni.waktu_pulang ? 'Sudah Pulang' : 'Sudah Absen Masuk'
        } else {
          statusAbsen.value = 'Belum Absen'
          documentId.value = null
        }
      })
    })

    onUnmounted(() => {
      clearInterval(timer)
      if (unsubscribe) unsubscribe()
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
  border-radius: 20px;
}
.bg-white-transparent {
  background: rgba(255, 255, 255, 0.2);
}
.rounded-borders {
  border-radius: 15px;
}
</style>
