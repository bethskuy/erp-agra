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
            <span class="text-teal-7 text-weight-bolder">{{ stats.hadirHariIni }}</span> | 
            Belum Absen:
            <span class="text-red-5 text-weight-bolder">{{ stats.belumAbsen }}</span>
            <span v-if="stats.cutiIzinSakit > 0">
              | Cuti/Izin/Sakit:
              <span class="text-indigo-7 text-weight-bolder">{{ stats.cutiIzinSakit }}</span>
            </span>
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
                  :color="props.row.fotoUrl ? undefined : getRandomColor(props.row.nama_karyawan)"
                  text-color="white"
                  class="text-weight-bold shadow-1 q-mr-md"
                >
                  <img v-if="props.row.fotoUrl" :src="props.row.fotoUrl" style="object-fit: cover;" />
                  <span v-else>{{ getInitial(props.row.nama_karyawan) }}</span>
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
                v-if="props.row.status === 'Hadir'"
                rounded
                color="teal-6"
                class="q-px-sm q-py-xs text-weight-bold shadow-1"
                :class="props.row.dokumen_url ? 'cursor-pointer' : ''"
                @click="props.row.dokumen_url ? bukaLampiran(props.row.dokumen_url) : null"
              >
                <q-icon name="check_circle" size="xs" class="q-mr-xs" /> HADIR
                <q-icon v-if="props.row.dokumen_url" name="attachment" size="xs" class="q-ml-xs" />
                <q-tooltip v-if="props.row.dokumen_url" class="bg-teal-8 text-weight-bold">
                  Klik untuk Lihat Lampiran Absen Manual
                </q-tooltip>
              </q-badge>
              <q-badge
                v-else-if="props.row.status === 'Terlambat'"
                rounded
                color="orange-8"
                class="q-px-sm q-py-xs text-weight-bold shadow-1"
              >
                <q-icon name="warning" size="xs" class="q-mr-xs" /> TERLAMBAT
              </q-badge>
              <q-badge
                v-else-if="props.row.status === 'Cuti'"
                rounded
                color="blue-6"
                class="q-px-sm q-py-xs text-weight-bold shadow-1"
                :class="props.row.dokumen_url ? 'cursor-pointer' : ''"
                @click="props.row.dokumen_url ? bukaLampiran(props.row.dokumen_url) : null"
              >
                <q-icon name="beach_access" size="xs" class="q-mr-xs" /> CUTI
                <q-icon v-if="props.row.dokumen_url" name="attachment" size="xs" class="q-ml-xs" />
                <q-tooltip v-if="props.row.dokumen_url" class="bg-blue-8 text-weight-bold">
                  Klik untuk Lihat Lampiran Cuti
                </q-tooltip>
              </q-badge>
              <q-badge
                v-else-if="props.row.status === 'Sakit'"
                rounded
                color="amber-7"
                class="q-px-sm q-py-xs text-weight-bold shadow-1"
                :class="props.row.dokumen_url ? 'cursor-pointer' : ''"
                @click="props.row.dokumen_url ? bukaLampiran(props.row.dokumen_url) : null"
              >
                <q-icon name="healing" size="xs" class="q-mr-xs" /> SAKIT
                <q-icon v-if="props.row.dokumen_url" name="attachment" size="xs" class="q-ml-xs" />
                <q-tooltip v-if="props.row.dokumen_url" class="bg-amber-8 text-weight-bold">
                  Klik untuk Lihat Lampiran Sakit
                </q-tooltip>
              </q-badge>
              <q-badge
                v-else-if="props.row.status === 'Izin'"
                rounded
                color="indigo-6"
                class="q-px-sm q-py-xs text-weight-bold shadow-1"
                :class="props.row.dokumen_url ? 'cursor-pointer' : ''"
                @click="props.row.dokumen_url ? bukaLampiran(props.row.dokumen_url) : null"
              >
                <q-icon name="description" size="xs" class="q-mr-xs" /> IZIN
                <q-icon v-if="props.row.dokumen_url" name="attachment" size="xs" class="q-ml-xs" />
                <q-tooltip v-if="props.row.dokumen_url" class="bg-indigo-8 text-weight-bold">
                  Klik untuk Lihat Lampiran Izin
                </q-tooltip>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
  belumAbsen: 0,
  cutiIzinSakit: 0,
  cutiMenunggu: 0,
})
const karyawanList = ref([])
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
  if (typeof ts === 'string' && ts.includes(':')) return ts
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

// UI HELPER: Normalisasi format tanggal menjadi YYYY-MM-DD secara konsisten
const normalizeDateStr = (dateStr) => {
  if (!dateStr) return ''
  let normalized = dateStr.replace(/\//g, '-')
  const parts = normalized.split('-')
  if (parts.length === 3) {
    const y = parts[0]
    const m = parts[1].padStart(2, '0')
    const d = parts[2].padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return normalized
}

// UI HELPER: Buka lampiran bukti izin/absen di tab baru
const bukaLampiran = (url) => {
  if (!url) return
  window.open(url, '_blank')
}

// helper untuk memuat library ExcelJS secara dinamis dari CDN
const loadExcelJS = () => {
  return new Promise((resolve, reject) => {
    if (window.ExcelJS) {
      resolve(window.ExcelJS)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js'
    script.onload = () => resolve(window.ExcelJS)
    script.onerror = () => reject(new Error('Gagal memuat ExcelJS'))
    document.head.appendChild(script)
  })
}

// helper untuk mengubah gambar URL ke format Base64 secara asinkron
const getBase64Image = async (url) => {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.error('Failed to load image as base64', e)
    return null
  }
}

const unsubscribePending = ref(null)

const listenPendingCuti = () => {
  const qPending = query(
    collection(db, 'pengajuan'),
    where('status_approval', '==', 'Pending')
  )
  unsubscribePending.value = onSnapshot(qPending, (snap) => {
    stats.value.cutiMenunggu = snap.docs.filter(
      (d) => d.data().jenis_pengajuan === 'Cuti Tahunan'
    ).length
  }, (err) => {
    console.warn('Gagal memuat pending cuti:', err.message)
  })
}

// AMBIL DATA REAL-TIME KARYAWAN
const fetchTotalKaryawan = () => {
  onSnapshot(collection(db, 'karyawan'), (snap) => {
    stats.value.totalKaryawan = snap.size
    karyawanList.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    fetchDataHarian()
  })
}

// AMBIL DATA ABSENSI BERDASARKAN TANGGAL DAN PETAKAN SELURUH KARYAWAN & CUTI/IZIN/SAKIT
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

    // 1. Tarik data absensi hari ini
    const q = query(collection(db, 'absensi'), where('tanggal', '==', targetDate))
    const snap = await getDocs(q)
    const absensiList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    // 2. Tarik pengajuan Cuti/Izin/Sakit yang disetujui
    const qPengajuan = query(
      collection(db, 'pengajuan'),
      where('status_approval', 'in', ['Approved', 'Selesai'])
    )
    const pengajuanSnap = await getDocs(qPengajuan)
    const pengajuanList = pengajuanSnap.docs.map((doc) => doc.data())

    const targetDateStr = normalizeDateStr(selectedDate.value)

    // 3. Petakan seluruh karyawan
    const mappedRows = karyawanList.value.map((karyawan) => {
      const namaUpper = (karyawan.nama || '').toUpperCase()
      
      // Cari data check-in
      const checkInRow = absensiList.find((absen) => (absen.nama_karyawan || '').toUpperCase() === namaUpper)

      // Cari pengajuan cuti/izin/sakit yang aktif di tanggal ini
      const leaveRow = pengajuanList.find((p) => {
        const nameMatch = (p.nama_karyawan || '').toUpperCase() === namaUpper
        if (!nameMatch) return false
        
        const pStart = normalizeDateStr(p.tanggal_mulai)
        const pEnd = normalizeDateStr(p.tanggal_selesai || p.tanggal_mulai)
        
        return targetDateStr >= pStart && targetDateStr <= pEnd
      })

      let jamIn = null
      let jamOut = null
      let statusStr = 'Belum Absen'
      let lokasiStr = '-'
      let docUrl = null

      if (checkInRow) {
        jamIn = checkInRow.waktu_masuk || null
        jamOut = checkInRow.waktu_pulang || null
        statusStr = checkInRow.is_late ? 'Terlambat' : 'Hadir'
        lokasiStr = checkInRow.nama_tempat || 'Tidak ada lokasi'
        // Jika checkInRow tidak memiliki dokumen lampiran tetapi leaveRow memilikinya (misal absen manual)
        if (leaveRow && leaveRow.dokumen_url) {
          docUrl = leaveRow.dokumen_url
        }
      } else if (leaveRow) {
        docUrl = leaveRow.dokumen_url || null
        const jenis = leaveRow.jenis_pengajuan || ''
        
        if (jenis === 'Absensi Manual' || jenis.toLowerCase().includes('manual')) {
          statusStr = 'Hadir'
          lokasiStr = 'Absen Manual (Disetujui)'
          
          // Ekstrak jam masuk & pulang dari alasan
          const alasanText = leaveRow.alasan || ''
          const masukMatch = alasanText.match(/Jam Masuk:\s*([0-9]{2}:[0-9]{2})/)
          const pulangMatch = alasanText.match(/Jam Pulang:\s*([0-9]{2}:[0-9]{2})/)
          
          jamIn = masukMatch ? masukMatch[1] : null
          jamOut = pulangMatch && pulangMatch[1] !== 'Belum Pulang' ? pulangMatch[1] : null
        } else {
          statusStr = jenis === 'Cuti Tahunan' || jenis.toLowerCase().includes('cuti')
            ? 'Cuti'
            : jenis === 'Izin Sakit' || jenis.toLowerCase().includes('sakit')
              ? 'Sakit'
              : 'Izin'
          lokasiStr = 'Cuti/Izin Disetujui'
        }
      }

      return {
        id: karyawan.id,
        nik: karyawan.nik || '-',
        nama_karyawan: karyawan.nama || 'Tanpa Nama',
        jabatan: karyawan.jabatan || 'STAF',
        waktu_masuk: jamIn,
        waktu_pulang: jamOut,
        status: statusStr,
        nama_tempat: lokasiStr,
        dokumen_url: docUrl,
        fotoUrl: karyawan.fotoUrl || karyawan.foto_profil || null
      }
    })

    rows.value = mappedRows
    
    // Hitung statistik
    stats.value.hadirHariIni = mappedRows.filter(r => r.status === 'Hadir' || r.status === 'Terlambat').length
    stats.value.belumAbsen = mappedRows.filter(r => r.status === 'Belum Absen').length
    stats.value.cutiIzinSakit = mappedRows.filter(r => ['Cuti', 'Izin', 'Sakit'].includes(r.status)).length

  } catch (error) {
    console.error('Gagal memuat absensi', error)
  } finally {
    loading.value = false
  }
}


// EXPORT KE EXCEL DENGAN EXCELJS
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
    const ExcelJS = await loadExcelJS()
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Laporan Harian')
    worksheet.views = [{ showGridLines: true }]

    // Set merged headers
    worksheet.mergeCells('A1:B2')
    worksheet.mergeCells('C1:H1')
    worksheet.mergeCells('C2:H2')

    worksheet.getRow(1).height = 30
    worksheet.getRow(2).height = 24
    worksheet.getRow(3).height = 22

    worksheet.getCell('C1').value = 'LAPORAN HARIAN KEHADIRAN KARYAWAN PT AGRA ABHINAYA PERKASA'
    worksheet.getCell('C2').value = 'TANGGAL: ' + displayDate.value.toUpperCase()

    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' } // Navy Blue
    }

    // Apply header background to rows 1 and 2
    for (let r = 1; r <= 2; r++) {
      const row = worksheet.getRow(r)
      for (let c = 1; c <= 8; c++) {
        row.getCell(c).fill = headerFill
      }
    }

    const titleCell = worksheet.getCell('C1')
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }

    const subtitleCell = worksheet.getCell('C2')
    subtitleCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' }

    // Embed logo
    const logoBase64 = await getBase64Image('/icons/logo-agra.png')
    if (logoBase64) {
      const imageId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      })
      worksheet.addImage(imageId, {
        tl: { col: 0.1, row: 0.1 },
        br: { col: 1.9, row: 1.9 },
        editAs: 'oneCell'
      })
    }

    // Table Header Row 3
    const tableHeaderRow = worksheet.getRow(3)
    const headerColumns = ["No", "NIK", "Nama Karyawan", "Jabatan", "Jam Check In", "Jam Check Out", "Status Kehadiran", "Lokasi"]
    tableHeaderRow.values = headerColumns

    const subHeaderFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9EEF4' } // Clean soft blue grey header
    }
    const thinBorder = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }

    for (let col = 1; col <= 8; col++) {
      const cell = tableHeaderRow.getCell(col)
      cell.fill = subHeaderFill
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = thinBorder
    }

    // Populate data
    let currentRowNum = 4
    rows.value.forEach((row, index) => {
      const dataRow = worksheet.getRow(currentRowNum)
      dataRow.height = 20

      const vals = [
        index + 1,
        row.nik || '-',
        (row.nama_karyawan || '').toUpperCase(),
        row.jabatan || 'STAF',
        row.waktu_masuk ? formatJam(row.waktu_masuk) : '-',
        row.waktu_pulang ? formatJam(row.waktu_pulang) : '-',
        row.status,
        row.nama_tempat || '-'
      ]
      dataRow.values = vals

      for (let col = 1; col <= 8; col++) {
        const cell = dataRow.getCell(col)
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF000000' } }
        cell.border = thinBorder
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }

        if (col === 1) {
          cell.font.bold = true
        }
        if (col === 3) {
          cell.font.bold = true
          cell.alignment.horizontal = 'left'
        }
        if (col === 8) {
          cell.alignment.horizontal = 'left'
        }

        if (col === 7) {
          const status = cell.value
          cell.font.bold = true
          let bg = 'FFFFFFFF'
          let textCol = 'FF000000'
          if (status === 'Hadir') {
            bg = 'FF00B050'
            textCol = 'FFFFFFFF'
          } else if (status === 'Terlambat') {
            bg = 'FFFF6F00'
            textCol = 'FFFFFFFF'
          } else if (status === 'Cuti') {
            bg = 'FF00B0F0'
            textCol = 'FFFFFFFF'
          } else if (status === 'Sakit') {
            bg = 'FFFFC000'
            textCol = 'FF000000'
          } else if (status === 'Izin') {
            bg = 'FF3F51B5'
            textCol = 'FFFFFFFF'
          } else if (status === 'Belum Absen') {
            bg = 'FFFF0000'
            textCol = 'FFFFFFFF'
          }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
          cell.font.color = { argb: textCol }
        }
      }
      currentRowNum++
    })

    // Legend
    worksheet.getRow(currentRowNum).height = 15
    currentRowNum++

    const legendTitleRow = worksheet.getRow(currentRowNum)
    legendTitleRow.height = 20
    legendTitleRow.getCell(1).value = 'Keterangan:'
    legendTitleRow.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true }
    currentRowNum++

    const legends = [
      { code: 'Hadir', desc: 'Hadir Tepat Waktu', bg: 'FF00B050', text: 'FFFFFFFF' },
      { code: 'Terlambat', desc: 'Hadir Terlambat', bg: 'FFFF6F00', text: 'FFFFFFFF' },
      { code: 'Cuti', desc: 'Sedang Cuti', bg: 'FF00B0F0', text: 'FFFFFFFF' },
      { code: 'Sakit', desc: 'Sakit Dengan Surat', bg: 'FFFFC000', text: 'FF000000' },
      { code: 'Izin', desc: 'Izin Keperluan Lain', bg: 'FF3F51B5', text: 'FFFFFFFF' },
      { code: 'Belum Absen', desc: 'Mangkir / Belum Clock-in', bg: 'FFFF0000', text: 'FFFFFFFF' }
    ]

    legends.forEach(l => {
      const rowObj = worksheet.getRow(currentRowNum)
      rowObj.height = 18

      const cellCode = rowObj.getCell(1)
      cellCode.value = l.code
      cellCode.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: l.text } }
      cellCode.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: l.bg } }
      cellCode.alignment = { horizontal: 'center', vertical: 'middle' }
      cellCode.border = thinBorder

      const cellDesc = rowObj.getCell(2)
      cellDesc.value = l.desc
      cellDesc.font = { name: 'Segoe UI', size: 10, bold: true }
      cellDesc.alignment = { horizontal: 'left', vertical: 'middle' }
      cellDesc.border = thinBorder

      currentRowNum++
    })

    // Set widths explicitly
    worksheet.getColumn(1).width = 6
    worksheet.getColumn(2).width = 15
    worksheet.getColumn(3).width = 30
    worksheet.getColumn(4).width = 18
    worksheet.getColumn(5).width = 16
    worksheet.getColumn(6).width = 16
    worksheet.getColumn(7).width = 18
    worksheet.getColumn(8).width = 35

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const filename = `Laporan_Harian_AGRA_${selectedDate.value}.xlsx`
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(link.href)

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

    const isAdminIdentity =
      user?.email?.toLowerCase().trim() === 'refqiobeth345@gmail.com' ||
      user?.email?.toLowerCase().trim().includes('admin') ||
      user?.nama?.toLowerCase().trim().includes('refqi') ||
      user?.nama?.toLowerCase().trim().includes('obeth')
    const isAdminRole =
      user?.role?.toLowerCase().trim().includes('admin') ||
      user?.jabatan?.toLowerCase().trim().includes('admin')

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
  listenPendingCuti()
})

onUnmounted(() => {
  if (unsubscribePending.value) unsubscribePending.value()
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
