<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-lg font-inter">
    <div class="premium-container mx-auto">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
          Dashboard Administrator
        </h4>
        <div class="text-subtitle1 text-blue-grey-6 q-mt-xs">
          Pantau ringkasan dan aktivitas kehadiran karyawan hari ini.
        </div>
      </div>
      <div class="q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          color="primary"
          icon="download"
          label="Export Laporan"
          class="rounded-12 text-weight-bold q-px-md q-py-sm shadow-soft-primary"
          @click="downloadExcel"
          :loading="isExporting"
        />
      </div>
    </div>

    <!-- QUICK STATS SECTION -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <!-- Total Karyawan -->
      <div class="col-12 col-md-4">
        <q-card flat class="rounded-24 shadow-soft bg-white p-relative overflow-hidden">
          <div class="absolute-top-right q-pa-md opacity-20">
            <q-icon name="groups" size="80px" color="blue-5" />
          </div>
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-md">
              <q-avatar
                color="blue-1"
                text-color="blue-8"
                size="48px"
                icon="groups"
                class="shadow-1"
              />
              <div
                class="q-ml-md text-subtitle1 text-weight-bold text-blue-grey-8 uppercase letter-spacing-1"
              >
                Total Karyawan
              </div>
            </div>
            <div class="text-h3 text-weight-bolder text-blue-grey-10 q-mt-sm">
              {{ stats.totalKaryawan }}
              <span class="text-subtitle1 text-weight-medium text-grey-5">Orang</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Karyawan Hadir -->
      <div class="col-12 col-md-4">
        <q-card flat class="rounded-24 shadow-soft bg-white p-relative overflow-hidden">
          <div class="absolute-top-right q-pa-md opacity-20">
            <q-icon name="how_to_reg" size="80px" color="teal-5" />
          </div>
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-md">
              <q-avatar
                color="teal-1"
                text-color="teal-8"
                size="48px"
                icon="how_to_reg"
                class="shadow-1"
              />
              <div
                class="q-ml-md text-subtitle1 text-weight-bold text-blue-grey-8 uppercase letter-spacing-1"
              >
                Hadir Hari Ini
              </div>
            </div>
            <div class="text-h3 text-weight-bolder text-blue-grey-10 q-mt-sm">
              {{ stats.hadirHariIni }}
              <span class="text-subtitle1 text-weight-medium text-grey-5">Orang</span>
            </div>
            <div class="q-mt-sm">
              <q-linear-progress
                :value="persentaseHadir"
                color="teal-6"
                class="rounded-borders"
                size="6px"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Cuti Menunggu -->
      <div class="col-12 col-md-4">
        <q-card flat class="rounded-24 shadow-soft bg-white p-relative overflow-hidden">
          <div class="absolute-top-right q-pa-md opacity-20">
            <q-icon name="pending_actions" size="80px" color="orange-5" />
          </div>
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-md">
              <q-avatar
                color="orange-1"
                text-color="orange-8"
                size="48px"
                icon="pending_actions"
                class="shadow-1"
              />
              <div
                class="q-ml-md text-subtitle1 text-weight-bold text-blue-grey-8 uppercase letter-spacing-1"
              >
                Cuti Tertunda
              </div>
            </div>
            <div class="text-h3 text-weight-bolder text-blue-grey-10 q-mt-sm">
              {{ stats.cutiMenunggu }}
              <span class="text-subtitle1 text-weight-medium text-grey-5">Pengajuan</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- MAIN DATA TABLE -->
    <q-card flat class="rounded-24 shadow-soft bg-white overflow-hidden">
      <!-- Toolbar & Date Filter -->
      <q-card-section class="q-pa-lg bg-white border-bottom">
        <div class="row items-center justify-between">
          <div class="col-12 col-md-auto q-mb-md q-md-mb-none">
            <div class="text-h6 text-weight-bold text-blue-grey-10">Laporan Kehadiran Harian</div>
            <div class="text-caption text-blue-grey-6 q-mt-xs text-weight-medium">
              Telah Absen:
              <span class="text-teal-7 text-weight-bolder">{{ stats.hadirHariIni }}</span> | Belum
              Absen:
              <span class="text-red-5 text-weight-bolder">{{
                stats.totalKaryawan - stats.hadirHariIni
              }}</span>
            </div>
          </div>

          <div class="col-12 col-md-auto flex items-center q-gutter-x-sm">
            <q-btn
              flat
              round
              color="blue-grey-5"
              icon="chevron_left"
              @click="ubahTanggal(-1)"
              class="bg-grey-1"
            />

            <q-btn
              outline
              color="primary"
              class="rounded-12 q-px-md text-weight-bold bg-blue-1 border-none"
              icon-right="event"
            >
              {{ displayDate }}
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="selectedDate"
                  mask="YYYY-MM-DD"
                  @update:model-value="fetchDataHarian"
                  color="primary"
                />
              </q-popup-proxy>
            </q-btn>

            <q-btn
              flat
              round
              color="blue-grey-5"
              icon="chevron_right"
              @click="ubahTanggal(1)"
              class="bg-grey-1"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Table Section -->
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        class="premium-table"
        :pagination="{ rowsPerPage: 15 }"
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
            <!-- Kolom No -->
            <q-td key="no" class="text-center text-blue-grey-5 text-weight-bold">{{
              props.rowIndex + 1
            }}</q-td>

            <!-- Kolom Nama & Avatar -->
            <q-td key="nama">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="36px"
                  :color="getRandomColor(props.row.nama_karyawan)"
                  text-color="white"
                  class="text-weight-bold shadow-1 q-mr-md"
                >
                  {{ getInitial(props.row.nama_karyawan) }}
                </q-avatar>
                <div>
                  <div class="text-weight-bold text-blue-grey-9 text-subtitle2">
                    {{ props.row.nama_karyawan }}
                  </div>
                  <div class="text-caption text-blue-grey-4">Karyawan Agra</div>
                </div>
              </div>
            </q-td>

            <!-- Kolom Jam Masuk -->
            <q-td key="jamMasuk" class="text-center">
              <div
                v-if="props.row.waktu_masuk"
                class="time-badge bg-teal-1 text-teal-9 text-weight-bold"
              >
                <q-icon name="login" size="xs" class="q-mr-xs" />
                {{ formatJam(props.row.waktu_masuk) }}
              </div>
              <span v-else class="text-grey-4 text-weight-bold">- : -</span>
            </q-td>

            <!-- Kolom Jam Pulang -->
            <q-td key="jamPulang" class="text-center">
              <div
                v-if="props.row.waktu_pulang"
                class="time-badge bg-orange-1 text-orange-9 text-weight-bold"
              >
                <q-icon name="logout" size="xs" class="q-mr-xs" />
                {{ formatJam(props.row.waktu_pulang) }}
              </div>
              <span v-else class="text-grey-4 text-weight-bold">- : -</span>
            </q-td>

            <!-- Kolom Status -->
            <q-td key="status" class="text-center">
              <q-badge
                v-if="props.row.waktu_masuk"
                rounded
                color="teal-6"
                class="q-px-sm q-py-xs text-weight-bold shadow-1"
              >
                <q-icon name="check_circle" size="xs" class="q-mr-xs" /> HADIR
              </q-badge>
              <q-badge
                v-else
                rounded
                color="red-5"
                class="q-px-sm q-py-xs text-weight-bold shadow-1"
              >
                <q-icon name="cancel" size="xs" class="q-mr-xs" /> BELUM ABSEN
              </q-badge>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
            <q-icon size="4em" name="event_busy" class="q-mb-md opacity-50" />
            <div class="text-h6 text-weight-bold">Tidak Ada Data</div>
            <div class="text-caption">
              Belum ada karyawan yang melakukan absensi pada tanggal ini.
            </div>
          </div>
        </template>
      </q-table>
    </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { date, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const loading = ref(false)
const isExporting = ref(false)

// State Tanggal
const today = new Date()
const selectedDate = ref(date.formatDate(today, 'YYYY-MM-DD'))

// State Data
const stats = ref({
  totalKaryawan: 0,
  hadirHariIni: 0,
  cutiMenunggu: 0,
})
const rows = ref([])

const columns = [
  { name: 'no', label: 'NO', align: 'center', style: 'width: 60px' },
  { name: 'nama', label: 'INFORMASI KARYAWAN', align: 'left', field: 'nama_karyawan' },
  { name: 'jamMasuk', label: 'CLOCK IN', align: 'center' },
  { name: 'jamPulang', label: 'CLOCK OUT', align: 'center' },
  { name: 'status', label: 'STATUS', align: 'center' },
]

// Computed Persentase Hadir
const persentaseHadir = computed(() => {
  if (stats.value.totalKaryawan === 0) return 0
  return stats.value.hadirHariIni / stats.value.totalKaryawan
})

// Format Tanggal untuk Label
const displayDate = computed(() => {
  return date.formatDate(selectedDate.value, 'dddd, DD MMMM YYYY', {
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
})

const formatJam = (ts) => {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return date.formatDate(d, 'HH:mm')
}

const ubahTanggal = (hari) => {
  const current = new Date(selectedDate.value)
  current.setDate(current.getDate() + hari)
  selectedDate.value = date.formatDate(current, 'YYYY-MM-DD')
  fetchDataHarian()
}

// UI HELPER: Ambil inisial nama untuk avatar
const getInitial = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

// UI HELPER: Generate warna random berdasarkan nama (agar avatar berwarna-warni elegan)
const getRandomColor = (name) => {
  if (!name) return 'primary'
  const colors = ['blue-6', 'teal-6', 'indigo-5', 'deep-purple-5', 'cyan-7', 'light-blue-7']
  const index = name.length % colors.length
  return colors[index]
}

// AMBIL DATA REAL-TIME KARYAWAN
const fetchTotalKaryawan = () => {
  onSnapshot(collection(db, 'karyawan'), (snap) => {
    stats.value.totalKaryawan = snap.size
  })
}

// AMBIL DATA ABSENSI BERDASARKAN TANGGAL
const fetchDataHarian = async () => {
  loading.value = true
  try {
    const targetDate = date.formatDate(selectedDate.value, 'dddd, DD MMMM YYYY', {
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

    const q = query(collection(db, 'absensi'), where('tanggal', '==', targetDate))
    const snap = await getDocs(q)

    rows.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    stats.value.hadirHariIni = rows.value.length
  } catch (error) {
    console.error('Gagal memuat absensi', error)
  } finally {
    loading.value = false
  }
}

// EXPORT KE EXCEL DENGAN SHEETJS (SAMA SEPERTI CATATAN ABSENSI)
const downloadExcel = async () => {
  if (rows.value.length === 0) {
    $q.notify({
      color: 'warning',
      message: 'Tidak ada data absensi untuk diekspor pada tanggal ini.',
    })
    return
  }

  isExporting.value = true

  try {
    // Inject library secara dinamis
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    // Mapping Data agar format rapi
    const excelData = rows.value.map((row, index) => ({
      No: index + 1,
      'Nama Karyawan': row.nama_karyawan,
      Tanggal: row.tanggal,
      'Jam Check In': row.waktu_masuk ? formatJam(row.waktu_masuk) : '-',
      'Jam Check Out': row.waktu_pulang ? formatJam(row.waktu_pulang) : '-',
      Status: row.waktu_masuk ? 'Hadir' : 'Belum Absen',
      Lokasi: row.nama_tempat || 'Tidak ada lokasi',
    }))

    const worksheet = window.XLSX.utils.json_to_sheet(excelData)
    const workbook = window.XLSX.utils.book_new()
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Harian')

    // Set lebar kolom Excel (Auto-fit Columns)
    const colWidths = [
      { wch: 6 }, // No
      { wch: 35 }, // Nama
      { wch: 25 }, // Tanggal
      { wch: 15 }, // Check In
      { wch: 15 }, // Check Out
      { wch: 15 }, // Status
      { wch: 35 }, // Lokasi
    ]
    worksheet['!cols'] = colWidths

    // Eksekusi download file .xlsx
    window.XLSX.writeFile(workbook, `Laporan_Harian_AGRA_${selectedDate.value}.xlsx`)

    $q.notify({
      message: 'Berhasil mengunduh Laporan Harian!',
      color: 'positive',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Gagal mengekspor Excel:', error)
    $q.notify({
      message: 'Terjadi kesalahan saat memproses file Excel.',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    isExporting.value = false
  }
}

// === PENGAMANAN HALAMAN (ROUTE GUARD) ===
onMounted(() => {
  const saved = localStorage.getItem('user_data')

  if (saved) {
    const user = JSON.parse(saved)
    const email = user.email?.toLowerCase() || ''
    const role = user.role?.toLowerCase() || ''
    const jabatan = user.jabatan?.toLowerCase() || ''
    const nama = user.nama?.toLowerCase() || ''

    const isAdminIdentity =
      email === 'refqiobeth345@gmail.com' ||
      email.includes('admin') ||
      nama.includes('refqi') ||
      nama.includes('obeth')
    const isAdminRole =
      role.includes('super admin') ||
      role.includes('superadmin') ||
      jabatan.includes('super admin') ||
      jabatan.includes('superadmin')

    // JIKA BUKAN ADMIN, TENDANG BALIK!
    if (!isAdminIdentity && !isAdminRole) {
      $q.notify({
        color: 'negative',
        message: 'Akses Ditolak! Anda tidak memiliki izin Administrator.',
        icon: 'gavel',
        position: 'top',
      })
      router.replace('/absensi/dashboard')
      return
    }
  } else {
    router.replace('/login')
    return
  }

  // JIKA AMAN (ADMIN), BARU EKSEKUSI DATA
  fetchTotalKaryawan()
  fetchDataHarian()
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
.rounded-12 {
  border-radius: 12px;
}
.border-bottom {
  border-bottom: 1px solid #f1f5f9;
}
.border-none {
  border: none !important;
}

/* TYPOGRAPHY */
.letter-spacing-tight {
  letter-spacing: -0.5px;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.uppercase {
  text-transform: uppercase;
}
.opacity-20 {
  opacity: 0.2;
}
.opacity-50 {
  opacity: 0.5;
}

/* CUSTOM COMPONENTS */
.time-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
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
.premium-container {
  max-width: 1200px;
  width: 100%;
}
</style>
