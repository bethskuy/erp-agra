<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-xl">
    <div class="row justify-center">
      <div class="col-12 col-lg-10">
        <!-- HEADER SECTION -->
        <div class="row items-center justify-between q-mb-xl">
          <div class="col-12 col-md-auto">
            <h4
              class="text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-1 text-uppercase"
            >
              Riwayat Presensi
            </h4>
            <div class="text-subtitle1 text-grey-7 q-mt-xs">
              Halo, <span class="text-primary text-weight-bold">{{ userName }}</span
              >! Berikut laporan aktivitas kerja Anda.
            </div>
          </div>
          <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
            <q-card flat bordered class="rounded-12 bg-white shadow-sm">
              <q-card-section class="q-pa-sm row items-center">
                <q-input
                  borderless
                  v-model="filterBulan"
                  label="Periode Laporan"
                  dense
                  readonly
                  class="q-px-md cursor-pointer"
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_month" color="primary" />
                  </template>
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="filterBulan"
                      mask="MMMM YYYY"
                      minimal
                      emit-immediately
                      years-in-month-view
                      @update:model-value="setupRealtimeListener"
                      v-close-popup
                    />
                  </q-popup-proxy>
                </q-input>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- SUMMARY CARDS -->
        <div class="row q-col-gutter-lg q-mb-xl">
          <div class="col-12 col-sm-4">
            <q-card flat class="rounded-16 shadow-card bg-white">
              <q-card-section class="row items-center no-wrap">
                <q-avatar icon="fact_check" color="blue-1" text-color="blue-9" size="48px" />
                <div class="q-ml-md">
                  <div class="text-caption text-grey-6 text-uppercase text-weight-bold">
                    Total Kehadiran
                  </div>
                  <div class="text-h5 text-weight-bolder text-blue-grey-9">
                    {{ rows.length }} <span class="text-subtitle2">Hari</span>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-4">
            <q-card flat class="rounded-16 shadow-card bg-white">
              <q-card-section class="row items-center no-wrap">
                <q-avatar icon="timer" color="green-1" text-color="positive" size="48px" />
                <div class="q-ml-md">
                  <div class="text-caption text-grey-6 text-uppercase text-weight-bold">
                    Total Jam Kerja
                  </div>
                  <div class="text-h5 text-weight-bolder text-positive">{{ totalJamKerja }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-4">
            <q-card flat class="rounded-16 shadow-card bg-white">
              <q-card-section class="row items-center no-wrap">
                <q-avatar icon="place" color="orange-1" text-color="orange-9" size="48px" />
                <div class="q-ml-md">
                  <div class="text-caption text-grey-6 text-uppercase text-weight-bold">
                    Lokasi Utama
                  </div>
                  <div class="text-h6 text-weight-bolder text-orange-9 text-uppercase">
                    KANTOR AGRA
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- DATA TABLE -->
        <q-card flat class="rounded-16 shadow-card overflow-hidden bg-white">
          <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            flat
            :loading="loading"
            :pagination="{ rowsPerPage: 31 }"
            class="modern-table"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-blue-grey-10 text-white">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bold letter-spacing-1"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props" class="hover-row">
                <q-td key="no" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td>
                <q-td key="tanggal" class="text-center">
                  <div class="text-weight-bold text-blue-grey-9">
                    {{ formatTanggalIndo(props.row.waktu_masuk) }}
                  </div>
                </q-td>
                <q-td key="jamIn" class="text-center">
                  <q-chip outline color="positive" size="sm" icon="login" class="text-weight-bold">
                    {{ formatWaktu(props.row.waktu_masuk) }}
                  </q-chip>
                </q-td>
                <q-td key="jamOut" class="text-center">
                  <q-chip
                    outline
                    :color="props.row.waktu_pulang ? 'negative' : 'grey-5'"
                    size="sm"
                    icon="logout"
                    class="text-weight-bold"
                  >
                    {{ formatWaktu(props.row.waktu_pulang) }}
                  </q-chip>
                </q-td>
                <q-td key="area" class="text-center">
                  <div class="text-caption text-weight-medium">
                    {{ props.row.nama_tempat || 'AREA AGRA' }}
                  </div>
                </q-td>
                <q-td key="totalJam" class="text-center">
                  <q-badge
                    :color="props.row.waktu_pulang ? 'primary' : 'orange-2'"
                    :text-color="props.row.waktu_pulang ? 'white' : 'orange-9'"
                    class="q-px-md q-py-xs text-weight-bolder"
                  >
                    {{ hitungDurasi(props.row.waktu_masuk, props.row.waktu_pulang) }}
                  </q-badge>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width text-center q-pa-xl">
                <q-icon name="event_busy" size="64px" color="grey-3" />
                <div class="text-grey-5 q-mt-md text-weight-bold">
                  Tidak ada data presensi pada periode {{ filterBulan }}.
                </div>
              </div>
            </template>
          </q-table>
        </q-card>

        <div class="q-mt-xl text-center text-grey-6 text-caption italic">
          <q-icon name="info" /> Data riwayat ini disinkronkan langsung dengan server AGRA Cloud
          secara real-time.
        </div>
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
  { name: 'no', label: 'NO', align: 'center' },
  { name: 'tanggal', label: 'HARI & TANGGAL', align: 'center' },
  { name: 'jamIn', label: 'JAM MASUK', align: 'center' },
  { name: 'jamOut', label: 'JAM PULANG', align: 'center' },
  { name: 'area', label: 'AREA LOKASI', align: 'center' },
  { name: 'totalJam', label: 'DURASI KERJA', align: 'center' },
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
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
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

    const monthIndex = monthMap[monthName] ?? new Date().getMonth()
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
        $q.notify({ color: 'negative', message: 'Gagal memuat data presensi.' })
        loading.value = false
      },
    )
  } catch (e) {
    console.error('Setup Error:', e)
    loading.value = false
  }
}

onMounted(() => {
  // SINKRONISASI: Mengambil nama lengkap dari key tunggal agra_erp_session
  const saved = localStorage.getItem('agra_erp_session')
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
.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-card {
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05) !important;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.modern-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
.hover-row:hover {
  background-color: #f8fafc !important;
  transition: all 0.3s ease;
}
.modern-table :deep(td) {
  height: 60px;
}
</style>
