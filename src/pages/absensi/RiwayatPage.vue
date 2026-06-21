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
      <div class="row items-center justify-between q-mb-xl header-entrance">
        <div class="col-12 col-md-8">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-blue-50 text-primary q-mr-sm" style="border: 2px solid #0f172a; box-shadow: 2px 2px 0px #0f172a;">
              <q-icon name="history" size="20px" />
            </div>
            <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
              Riwayat Kehadiran
            </h4>
          </div>
          <div class="text-subtitle1 text-blue-grey-6 q-mt-sm">
            Tinjau rekam jejak aktivitas kerja Anda,
            <span class="text-primary text-weight-bold">{{ userName }}</span
            >.
          </div>
        </div>

        <div class="col-12 col-md-auto q-mt-md q-md-mt-none">
          <q-btn
            unelevated
            color="white"
            text-color="blue-grey-9"
            class="neo-btn q-px-lg q-py-sm bg-white"
            no-caps
          >
            <div class="row items-center no-wrap">
              <q-icon name="calendar_month" color="primary" size="20px" class="q-mr-sm" />
              <div class="text-left">
                <div
                  class="text-caption text-blue-grey-5 text-weight-bold uppercase"
                  style="font-size: 10px; line-height: 1"
                >
                  Periode Laporan
                </div>
                <div class="text-subtitle2 text-weight-bolder">{{ filterBulan }}</div>
              </div>
              <q-icon name="arrow_drop_down" color="blue-grey-4" size="20px" class="q-ml-sm" />
            </div>

            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                v-model="filterBulan"
                mask="MMMM YYYY"
                minimal
                emit-immediately
                years-in-month-view
                color="primary"
                @update:model-value="setupRealtimeListener"
                v-close-popup
              />
            </q-popup-proxy>
          </q-btn>
        </div>
      </div>

      <div class="row q-col-gutter-lg q-mb-xl table-entrance">
        <div class="col-12 col-md-4">
          <q-card
            flat
            class="neo-card full-height q-pa-md transition-smooth"
          >
            <div class="row items-center no-wrap">
              <div class="ios-icon-box bg-blue-50 text-blue-6 q-mr-md" style="border: 2px solid #0f172a; box-shadow: 2px 2px 0px #0f172a;">
                <q-icon name="fact_check" size="28px" />
              </div>
              <div>
                <div
                  class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1"
                >
                  Total Kehadiran
                </div>
                <div class="text-h4 text-weight-bolder text-blue-grey-10 line-height-tight">
                  {{ rows.length }}
                  <span class="text-subtitle1 text-weight-bold text-blue-grey-5">Hari</span>
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card
            flat
            class="neo-card bg-white full-height q-pa-md transition-smooth"
          >
            <div class="row items-center no-wrap">
              <div class="ios-icon-box bg-teal-50 text-teal-6 q-mr-md" style="border: 2px solid #0f172a; box-shadow: 2px 2px 0px #0f172a;">
                <q-icon name="timer" size="28px" />
              </div>
              <div>
                <div
                  class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1"
                >
                  Total Jam Kerja
                </div>
                <div class="text-h4 text-weight-bolder text-teal-6 line-height-tight">
                  {{ totalJamKerja }}
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card
            flat
            class="neo-card bg-white full-height q-pa-md transition-smooth"
          >
            <div class="row items-center no-wrap">
              <div class="ios-icon-box bg-orange-50 text-orange-6 q-mr-md" style="border: 2px solid #0f172a; box-shadow: 2px 2px 0px #0f172a;">
                <q-icon name="place" size="28px" />
              </div>
              <div class="col overflow-hidden">
                <div
                  class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1"
                >
                  Lokasi Mayoritas
                </div>
                <div
                  class="text-h6 text-weight-bolder text-orange-9 text-uppercase ellipsis line-height-tight q-mt-xs"
                >
                  AREA KANTOR
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <q-card flat class="neo-card overflow-hidden q-mb-lg table-entrance">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :pagination="{ rowsPerPage: 31 }"
          class="premium-table"
          card-class="bg-transparent"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bolder text-blue-grey-8 uppercase letter-spacing-1"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" class="hover-effect">
              <q-td key="no" class="text-center text-blue-grey-4 text-weight-bold">{{
                props.rowIndex + 1
              }}</q-td>

              <q-td key="tanggal" class="text-left">
                <div class="row items-center no-wrap">
                  <div class="date-icon-box bg-grey-1 text-blue-grey-5 q-mr-sm" style="border: 1.5px solid #0f172a; box-shadow: 1.5px 1.5px 0px #0f172a;">
                    <q-icon name="event" size="16px" />
                  </div>
                  <div class="text-weight-bold text-blue-grey-9 text-subtitle2">
                    {{ formatTanggalIndo(props.row.waktu_masuk) }}
                  </div>
                </div>
              </q-td>

              <q-td key="jamIn" class="text-center">
                <div class="column items-center justify-center">
                  <div
                    class="time-badge font-mono"
                    :class="props.row.is_late ? 'bg-red-50 text-red-7' : 'bg-teal-50 text-teal-7'"
                    style="border: 1.5px solid #0f172a;"
                  >
                    <q-icon name="login" size="14px" class="q-mr-xs" />
                    {{ formatWaktu(props.row.waktu_masuk) }}
                  </div>
                  <q-badge
                    v-if="props.row.is_late"
                    color="red-5"
                    class="q-mt-xs text-weight-bold"
                    style="font-size: 9px; padding: 2px 6px; border: 1.5px solid #0f172a;"
                  >
                    TERLAMBAT
                  </q-badge>
                </div>
              </q-td>

              <q-td key="jamOut" class="text-center">
                <div
                  class="time-badge font-mono"
                  :class="
                    props.row.waktu_pulang ? 'bg-orange-50 text-orange-7' : 'bg-grey-1 text-grey-5'
                  "
                  style="border: 1.5px solid #0f172a;"
                >
                  <q-icon name="logout" size="14px" class="q-mr-xs" />
                  {{ formatWaktu(props.row.waktu_pulang) }}
                </div>
              </q-td>

              <q-td key="area" class="text-left">
                <div class="row items-center no-wrap">
                  <q-icon name="explore" color="blue-grey-4" size="14px" class="q-mr-xs" />
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 ellipsis"
                    style="max-width: 150px"
                  >
                    {{ props.row.nama_tempat || 'AREA AGRA' }}
                    <q-tooltip class="bg-blue-grey-9">{{
                      props.row.nama_tempat || 'AREA AGRA'
                    }}</q-tooltip>
                  </div>
                </div>
              </q-td>

              <q-td key="totalJam" class="text-center">
                <q-badge
                  rounded
                  :color="props.row.waktu_pulang ? 'primary' : 'blue-grey-2'"
                  :text-color="props.row.waktu_pulang ? 'white' : 'blue-grey-6'"
                  class="q-px-sm q-py-xs text-weight-bold font-mono"
                  style="border: 1.5px solid #0f172a;"
                >
                  <q-icon v-if="!props.row.waktu_pulang" name="sync" class="q-mr-xs rotating" />
                  {{ hitungDurasi(props.row.waktu_masuk, props.row.waktu_pulang) }}
                </q-badge>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
              <q-icon size="4em" name="event_busy" class="q-mb-md opacity-50" />
              <div class="text-h6 text-weight-bold">Tidak Ada Riwayat</div>
              <div class="text-caption">
                Sistem tidak menemukan data presensi pada {{ filterBulan }}.
              </div>
            </div>
          </template>
        </q-table>
      </q-card>

      <div
        class="row items-center justify-center text-blue-grey-5 text-caption text-weight-medium q-mb-xl"
      >
        <q-icon name="cloud_sync" size="16px" class="q-mr-xs" />
        Data riwayat disinkronkan secara real-time dengan server Cloud AGRA ERP.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const filterBulan = ref(date.formatDate(Date.now(), 'MMMM YYYY'))
const rows = ref([])
const userName = ref('USER')

const columns = [
  { name: 'no', label: 'NO', align: 'center', style: 'width: 50px' },
  { name: 'tanggal', label: 'HARI & TANGGAL', align: 'left' },
  { name: 'jamIn', label: 'CHECK IN', align: 'center' },
  { name: 'jamOut', label: 'CHECK OUT', align: 'center' },
  { name: 'area', label: 'LOKASI VALIDASI', align: 'left' },
  { name: 'totalJam', label: 'DURASI AKTIF', align: 'center' },
]

const totalJamKerja = computed(() => {
  let totalMs = 0
  rows.value.forEach((row) => {
    if (row.waktu_masuk && row.waktu_pulang) {
      const start = row.waktu_masuk.toDate ? row.waktu_masuk.toDate() : new Date(row.waktu_masuk)
      const end = row.waktu_pulang.toDate ? row.waktu_pulang.toDate() : new Date(row.waktu_pulang)
      totalMs += end - start
    }
  })
  const hrs = Math.floor(totalMs / 3600000)
  const mins = Math.floor((totalMs % 3600000) / 60000)
  return `${hrs}j ${mins}m`
})

const formatWaktu = (ts) => {
  if (!ts) return '--:--'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return date.formatDate(d, 'HH:mm')
}

const formatTanggalIndo = (ts) => {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = [
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
  ]
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const hitungDurasi = (startTs, endTs) => {
  if (!startTs || !endTs) return 'AKTIF'
  const start = startTs.toDate ? startTs.toDate() : new Date(startTs)
  const end = endTs.toDate ? endTs.toDate() : new Date(endTs)
  const diffMs = end - start
  if (diffMs < 0) return '0j 0m'
  const hrs = Math.floor(diffMs / 3600000)
  const mins = Math.floor((diffMs % 3600000) / 60000)
  return `${hrs}j ${mins}m`
}

let unsubscribe = null

const setupRealtimeListener = () => {
  loading.value = true
  if (unsubscribe) unsubscribe()

  try {
    const parts = filterBulan.value.split(' ')
    const monthName = parts[0]
    const year = parts[1]

    const monthMap = {
      Januari: 0,
      January: 0,
      Februari: 1,
      February: 1,
      Maret: 2,
      March: 2,
      April: 3,
      Mei: 4,
      May: 4,
      Juni: 5,
      June: 5,
      Juli: 6,
      July: 6,
      Agustus: 7,
      August: 7,
      September: 8,
      Oktober: 9,
      October: 9,
      November: 10,
      Desember: 11,
      December: 11,
    }

    const monthIndex =
      monthMap[monthName] !== undefined ? monthMap[monthName] : new Date().getMonth()
    const startOfMonth = new Date(parseInt(year), monthIndex, 1, 0, 0, 0)
    const endOfMonth = new Date(parseInt(year), monthIndex + 1, 1, 0, 0, 0)

    const q = query(
      collection(db, 'absensi'),
      where('nama_karyawan', '==', userName.value),
      where('waktu_masuk', '>=', Timestamp.fromDate(startOfMonth)),
      where('waktu_masuk', '<', Timestamp.fromDate(endOfMonth)),
      orderBy('waktu_masuk', 'desc'),
    )

    unsubscribe = onSnapshot(
      q,
      (snap) => {
        rows.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        loading.value = false
      },
      (err) => {
        console.error('Firestore Error:', err)
        $q.notify({ color: 'negative', message: 'Gagal memuat data presensi.', icon: 'error' })
        loading.value = false
      },
    )
  } catch (e) {
    console.error('Setup Error:', e)
    loading.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('user_data')
  if (saved) {
    const parsed = JSON.parse(saved)
    userName.value = (parsed.nama || 'USER').toUpperCase()
  }

  setupRealtimeListener()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
.font-mono {
  font-family: monospace;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.letter-spacing-tight {
  letter-spacing: -0.5px;
}
.line-height-tight {
  line-height: 1.1;
}
.uppercase {
  text-transform: uppercase;
}

/* LAYOUTING */
.premium-container {
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* NEO-BRUTALIST STYLING CORE */
.neo-page-bg {
  background-color: #f1f5f9;
  background-image: radial-gradient(#cbd5e1 2px, transparent 2px);
  background-size: 24px 24px;
  position: relative;
  min-height: 100vh;
}

.neo-card {
  background: #ffffff !important;
  border: 3px solid #0f172a !important;
  box-shadow: 6px 6px 0px #0f172a !important;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-card:hover {
  transform: translateY(-2px) translateX(2px);
  box-shadow: 8px 8px 0px #0f172a !important;
}

.neo-btn {
  border: 2.5px solid #0f172a !important;
  box-shadow: 3.5px 3.5px 0px #0f172a !important;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-btn:hover {
  transform: translateY(-1px) translateX(1px);
  box-shadow: 2.5px 2.5px 0px #0f172a !important;
}

.neo-btn:active {
  transform: translateY(2px) translateX(2px);
  box-shadow: 0px 0px 0px #0f172a !important;
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

/* KEYFRAMES FOR ORGANIC DRIFTING */
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

.rotating {
  animation: spin 2s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* APPLE-STYLE ICONS */
.ios-icon-box {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ios-icon-box.small {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

/* CUSTOM COMPONENTS */
.time-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}
.date-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding-top: 16px;
  padding-bottom: 16px;
}

.premium-table :deep(tbody tr td) {
  font-size: 13.5px;
  color: #0f172a !important;
  border-bottom: 1.5px solid #0f172a !important;
  transition: all 0.2s ease;
  padding-top: 16px;
  padding-bottom: 16px;
}

.hover-effect:hover td {
  background-color: #e0f2fe !important;
}

.premium-table :deep(.q-badge) {
  font-weight: 800 !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}
</style>
