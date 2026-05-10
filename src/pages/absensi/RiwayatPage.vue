<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-xl font-inter">
    <div class="premium-container mx-auto">
      <!-- ========================================== -->
      <!-- BAGIAN 1: HEADER & FILTER (CLEAN DESIGN)   -->
      <!-- ========================================== -->
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-blue-50 text-primary q-mr-sm">
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

        <!-- Filter Bulan Modern -->
        <div class="col-12 col-md-auto q-mt-md q-md-mt-none">
          <q-btn
            unelevated
            color="white"
            text-color="blue-grey-9"
            class="rounded-12 q-px-lg q-py-sm shadow-soft transition-smooth border-grey"
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

            <!-- Popup Date Picker -->
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

      <!-- ========================================== -->
      <!-- BAGIAN 2: STATISTIK BENTO CARDS            -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- Total Kehadiran -->
        <div class="col-12 col-md-4">
          <q-card
            flat
            class="bento-card bg-white full-height q-pa-md transition-smooth hover-scale"
          >
            <div class="row items-center no-wrap">
              <div class="ios-icon-box bg-blue-50 text-blue-6 q-mr-md">
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

        <!-- Total Jam Kerja -->
        <div class="col-12 col-md-4">
          <q-card
            flat
            class="bento-card bg-white full-height q-pa-md transition-smooth hover-scale"
          >
            <div class="row items-center no-wrap">
              <div class="ios-icon-box bg-teal-50 text-teal-6 q-mr-md">
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

        <!-- Lokasi Utama -->
        <div class="col-12 col-md-4">
          <q-card
            flat
            class="bento-card bg-white full-height q-pa-md transition-smooth hover-scale"
          >
            <div class="row items-center no-wrap">
              <div class="ios-icon-box bg-orange-50 text-orange-6 q-mr-md">
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

      <!-- ========================================== -->
      <!-- BAGIAN 3: TABEL DATA MODERN (BORDERLESS)   -->
      <!-- ========================================== -->
      <q-card flat class="bento-card bg-white overflow-hidden q-mb-lg">
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
          <!-- Header Styling -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-slate-100">
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

          <!-- Body Styling -->
          <template v-slot:body="props">
            <q-tr :props="props" class="hover-effect">
              <q-td key="no" class="text-center text-blue-grey-4 text-weight-bold">{{
                props.rowIndex + 1
              }}</q-td>

              <!-- Kolom Tanggal -->
              <q-td key="tanggal" class="text-left">
                <div class="row items-center no-wrap">
                  <div class="date-icon-box bg-grey-1 text-blue-grey-5 q-mr-sm">
                    <q-icon name="event" size="16px" />
                  </div>
                  <div class="text-weight-bold text-blue-grey-9 text-subtitle2">
                    {{ formatTanggalIndo(props.row.waktu_masuk) }}
                  </div>
                </div>
              </q-td>

              <!-- Kolom Jam Masuk -->
              <q-td key="jamIn" class="text-center">
                <div class="time-badge bg-teal-50 text-teal-7 font-mono">
                  <q-icon name="login" size="14px" class="q-mr-xs" />
                  {{ formatWaktu(props.row.waktu_masuk) }}
                </div>
              </q-td>

              <!-- Kolom Jam Pulang -->
              <q-td key="jamOut" class="text-center">
                <div
                  class="time-badge font-mono"
                  :class="
                    props.row.waktu_pulang ? 'bg-orange-50 text-orange-7' : 'bg-grey-1 text-grey-5'
                  "
                >
                  <q-icon name="logout" size="14px" class="q-mr-xs" />
                  {{ formatWaktu(props.row.waktu_pulang) }}
                </div>
              </q-td>

              <!-- Kolom Area Lokasi -->
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

              <!-- Kolom Durasi Kerja -->
              <q-td key="totalJam" class="text-center">
                <q-badge
                  rounded
                  :color="props.row.waktu_pulang ? 'primary' : 'blue-grey-2'"
                  :text-color="props.row.waktu_pulang ? 'white' : 'blue-grey-6'"
                  class="q-px-sm q-py-xs text-weight-bold font-mono shadow-1"
                >
                  <q-icon v-if="!props.row.waktu_pulang" name="sync" class="q-mr-xs rotating" />
                  {{ hitungDurasi(props.row.waktu_masuk, props.row.waktu_pulang) }}
                </q-badge>
              </q-td>
            </q-tr>
          </template>

          <!-- No Data State -->
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

      <!-- Footer Info -->
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');

/* GLOBAL TYPOGRAPHY */
.font-inter {
  font-family: 'Inter', sans-serif;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
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

/* LAYOUTING & BENTO GRID */
.premium-container {
  max-width: 1200px;
}
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.bg-slate-100 {
  background-color: #f1f5f9;
}
.border-grey {
  border: 1px solid #e2e8f0;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.opacity-50 {
  opacity: 0.5;
}

/* SHADOWS & RADIUS */
.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05) !important;
}
.rounded-12 {
  border-radius: 12px;
}

/* ANIMATION */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-scale:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.1) !important;
}
.hover-effect:hover td {
  background-color: #f8fafc !important;
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
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: none;
}
.premium-table :deep(tbody tr td) {
  font-size: 14px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
}
</style>
