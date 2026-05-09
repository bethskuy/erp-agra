<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-xl font-pro">
    <div class="text-h4 text-weight-regular text-blue-grey-9 q-mb-lg">Dashboard Administrator</div>

    <q-card flat bordered class="rounded-12 shadow-sm q-mb-lg bg-white overflow-hidden">
      <q-card-section class="bg-blue-8 text-white q-py-sm">
        <div class="text-subtitle1 text-weight-bold">Statistik Cepat</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-card flat class="bg-blue-1 shadow-1 rounded-borders text-center q-py-lg">
              <div class="text-blue-9 text-subtitle1 text-weight-bold q-mb-sm">Total Karyawan</div>
              <div class="text-h3 text-blue-9 text-weight-bolder">{{ stats.totalKaryawan }}</div>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat class="bg-green-1 shadow-1 rounded-borders text-center q-py-lg">
              <div class="text-green-9 text-subtitle1 text-weight-bold q-mb-sm">
                Karyawan Hadir Hari Ini
              </div>
              <div class="text-h3 text-green-9 text-weight-bolder">{{ stats.hadirHariIni }}</div>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat class="bg-orange-1 shadow-1 rounded-borders text-center q-py-lg">
              <div class="text-orange-9 text-subtitle1 text-weight-bold q-mb-sm">
                Cuti Menunggu Persetujuan
              </div>
              <div class="text-h3 text-orange-9 text-weight-bolder">{{ stats.cutiMenunggu }}</div>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="rounded-12 shadow-sm bg-white overflow-hidden">
      <q-card-section class="bg-blue-grey-8 text-white q-py-sm">
        <div class="text-subtitle1 text-weight-bold">Status Absensi Seluruh Karyawan</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row items-center justify-center q-mb-lg q-col-gutter-md">
          <div class="col-12 col-md-auto text-center">
            <q-btn flat round icon="chevron_left" @click="ubahTanggal(-1)" />
            <q-btn outline color="blue-grey-9" class="q-px-md text-weight-bold" icon-right="event">
              {{ displayDate }}
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="selectedDate"
                  mask="YYYY-MM-DD"
                  @update:model-value="fetchDataHarian"
                />
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="chevron_right" @click="ubahTanggal(1)" />
          </div>
        </div>

        <div class="text-center q-mb-md text-blue-grey-9">
          <div>
            Karyawan yang sudah Absen :
            <span class="text-positive text-weight-bold"
              >{{ stats.hadirHariIni }} / {{ stats.totalKaryawan }}</span
            >
          </div>
          <div>
            Belum Absen :
            <span class="text-negative text-weight-bold">{{
              stats.totalKaryawan - stats.hadirHariIni
            }}</span>
          </div>
        </div>

        <div class="row justify-end q-mb-md">
          <q-btn
            color="green-7"
            icon="download"
            label="DOWNLOAD EXCEL"
            unelevated
            class="text-weight-bold"
            size="sm"
            @click="downloadExcel"
          />
        </div>

        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          class="admin-table"
          :pagination="{ rowsPerPage: 15 }"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-grey-2">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold text-blue-grey-9"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="no" class="text-center">{{ props.rowIndex + 1 }}</q-td>
              <q-td key="nama" class="text-weight-bold">{{ props.row.nama_karyawan }}</q-td>
              <q-td key="jamMasuk" class="text-center">
                <q-badge v-if="props.row.waktu_masuk" color="positive" class="q-pa-xs">{{
                  formatJam(props.row.waktu_masuk)
                }}</q-badge>
                <span v-else class="text-grey">-</span>
              </q-td>
              <q-td key="jamPulang" class="text-center">
                <q-badge v-if="props.row.waktu_pulang" color="negative" class="q-pa-xs">{{
                  formatJam(props.row.waktu_pulang)
                }}</q-badge>
                <span v-else class="text-grey">-</span>
              </q-td>
              <q-td key="status" class="text-center">
                <q-chip
                  :color="props.row.waktu_masuk ? 'positive' : 'negative'"
                  text-color="white"
                  size="sm"
                  class="text-weight-bold"
                >
                  {{ props.row.waktu_masuk ? 'HADIR' : 'BELUM ABSEN' }}
                </q-chip>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-6">
              <q-icon size="2em" name="info" class="q-mr-sm" />
              Tidak ada data absensi untuk tanggal ini.
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
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
  { name: 'no', label: 'NO', align: 'center' },
  { name: 'nama', label: 'NAMA KARYAWAN', align: 'left', field: 'nama_karyawan' },
  { name: 'jamMasuk', label: 'JAM MASUK', align: 'center' },
  { name: 'jamPulang', label: 'JAM PULANG', align: 'center' },
  { name: 'status', label: 'STATUS', align: 'center' },
]

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

const downloadExcel = () => {
  $q.notify({
    color: 'info',
    message: 'Fitur download Excel sedang dipersiapkan',
    icon: 'hourglass_empty',
  })
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

    // JIKA BUKAN ADMIN, LANGSUNG TENDANG BALIK!
    if (!isAdminIdentity && !isAdminRole) {
      $q.notify({
        color: 'negative',
        message: 'Akses Ditolak! Anda tidak memiliki izin Administrator.',
        icon: 'gavel',
        position: 'top',
      })
      router.replace('/absensi/dashboard')
      return // Berhenti di sini, jangan load data
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
.font-pro {
  font-family: 'Inter', sans-serif;
}
.rounded-12 {
  border-radius: 12px;
}
.admin-table :deep(th) {
  font-size: 13px;
  letter-spacing: 0.5px;
}
</style>
