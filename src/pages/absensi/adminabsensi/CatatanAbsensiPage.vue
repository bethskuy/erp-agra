<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-xl font-inter">
    <div class="premium-container mx-auto">
      <!-- ========================================== -->
      <!-- HEADER SECTION (GLOBAL)                    -->
      <!-- ========================================== -->
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-7">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-blue-50 text-primary q-mr-sm">
              <q-icon name="fact_check" size="20px" />
            </div>
            <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
              {{
                viewMode === 'summary'
                  ? 'Catatan Absensi Bulanan'
                  : `Detail Absensi ${selectedKaryawan?.nama}`
              }}
            </h4>
          </div>
          <div class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal">
            {{
              viewMode === 'summary'
                ? 'Rekapitulasi kehadiran seluruh karyawan terintegrasi dengan database cloud.'
                : `Rincian kehadiran harian untuk periode ${filterBulan}.`
            }}
          </div>
        </div>

        <div
          class="col-12 col-md-auto q-mt-md q-md-mt-none flex q-gutter-x-sm"
          v-if="viewMode === 'summary'"
        >
          <q-btn
            unelevated
            color="teal-6"
            icon="file_download"
            label="EKSPOR LAPORAN (EXCEL)"
            class="rounded-12 text-weight-bolder shadow-soft-positive transition-smooth q-px-md"
            @click="exportToExcel"
            :loading="isExporting"
            :disable="loading || rows.length === 0"
          >
            <q-tooltip class="bg-teal-9"
              >Unduh rekap bulan ini ke format asli .xlsx yang rapi</q-tooltip
            >
          </q-btn>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODE 1: RINGKASAN (SUMMARY VIEW)           -->
      <!-- ========================================== -->
      <q-slide-transition>
        <q-card
          flat
          class="bento-card bg-white overflow-hidden shadow-soft"
          v-if="viewMode === 'summary'"
        >
          <!-- Filter Toolbar -->
          <q-card-section class="bg-white q-pa-lg border-bottom-light">
            <div class="row q-col-gutter-md items-center justify-between">
              <div class="col-12 col-md-5">
                <q-input
                  outlined
                  dense
                  v-model="search"
                  placeholder="Cari Nama Karyawan atau NIK..."
                  class="rounded-input bg-grey-1"
                  color="primary"
                >
                  <template v-slot:prepend><q-icon name="search" color="blue-grey-4" /></template>
                </q-input>
              </div>

              <div class="col-12 col-md-auto row items-center">
                <div
                  class="text-caption text-weight-bold text-blue-grey-5 uppercase letter-spacing-1 q-mr-md hidden sm-block"
                >
                  Periode Rekap:
                </div>
                <q-input
                  outlined
                  dense
                  v-model="filterBulan"
                  readonly
                  class="rounded-input bg-blue-50 cursor-pointer"
                  color="primary"
                  style="min-width: 200px"
                >
                  <template v-slot:prepend
                    ><q-icon name="calendar_month" color="primary"
                  /></template>
                  <template v-slot:append
                    ><q-icon name="arrow_drop_down" color="primary"
                  /></template>

                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="filterBulan"
                      mask="MMMM YYYY"
                      minimal
                      emit-immediately
                      years-in-month-view
                      color="primary"
                      @update:model-value="loadDataRekap"
                      v-close-popup
                      class="shadow-soft rounded-16"
                    />
                  </q-popup-proxy>
                </q-input>
              </div>
            </div>
          </q-card-section>

          <!-- Table Ringkasan -->
          <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            flat
            :filter="search"
            :loading="loading"
            class="premium-table"
            v-model:pagination="paginationSummary"
            :rows-per-page-options="[5, 10, 15, 20, 50, 0]"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-slate-50">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bolder text-blue-grey-6 uppercase letter-spacing-1"
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
                <q-td key="nik" class="text-center">
                  <q-badge
                    outline
                    color="blue-grey-4"
                    class="bg-grey-1 rounded-6 text-weight-bold font-mono"
                    >{{ props.row.nik }}</q-badge
                  >
                </q-td>
                <q-td key="nama" class="text-left">
                  <div class="row items-center no-wrap">
                    <q-avatar
                      size="36px"
                      color="blue-1"
                      text-color="primary"
                      class="q-mr-md text-weight-bold shadow-1"
                    >
                      {{ props.row.nama.substring(0, 1).toUpperCase() }}
                    </q-avatar>
                    <div>
                      <div class="text-weight-bolder text-blue-grey-10 text-uppercase">
                        {{ props.row.nama }}
                      </div>
                      <div class="text-caption text-blue-grey-5">{{ props.row.email }}</div>
                    </div>
                  </div>
                </q-td>
                <q-td key="bulan" class="text-center">
                  <span class="text-weight-medium text-blue-grey-8">{{ props.row.bulan }}</span>
                </q-td>
                <q-td key="ringkasan" class="text-left">
                  <q-badge
                    color="teal-1"
                    text-color="teal-8"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bolder"
                  >
                    <q-icon name="fact_check" size="14px" class="q-mr-xs" /> HADIR:
                    {{ props.row.totalHadir }} HARI
                  </q-badge>
                </q-td>
                <q-td key="aksi" class="text-center">
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="visibility"
                    class="bg-blue-50 transition-smooth hover-scale"
                    @click="lihatDetail(props.row)"
                  >
                    <q-tooltip class="bg-primary">Lihat Detail Karyawan</q-tooltip>
                  </q-btn>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:loading>
              <q-inner-loading showing color="primary">
                <q-spinner-dots size="50px" color="primary" />
                <div class="text-primary q-mt-md text-weight-medium">Merekap Data Absensi...</div>
              </q-inner-loading>
            </template>
            <template v-slot:no-data>
              <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
                <q-icon size="4em" name="folder_off" class="q-mb-md opacity-50" />
                <div class="text-h6 text-weight-bold">Data Tidak Ditemukan</div>
                <div class="text-caption">
                  Tidak ada data absensi untuk bulan {{ filterBulan }}.
                </div>
              </div>
            </template>
          </q-table>
        </q-card>
      </q-slide-transition>

      <!-- ========================================== -->
      <!-- MODE 2: DETAIL HARIAN (DETAIL VIEW)        -->
      <!-- ========================================== -->
      <q-slide-transition>
        <q-card
          flat
          class="bento-card bg-white overflow-hidden shadow-soft"
          v-if="viewMode === 'detail'"
        >
          <!-- Toolbar Kembali -->
          <q-card-section
            class="bg-white q-pa-md border-bottom-light row items-center justify-between"
          >
            <q-btn
              flat
              color="primary"
              icon="arrow_back"
              label="KEMBALI KE RINGKASAN"
              class="text-weight-bold rounded-8 transition-smooth hover-scale"
              @click="viewMode = 'summary'"
            />
            <q-badge
              color="blue-50"
              text-color="primary"
              class="q-pa-sm text-weight-bold rounded-8 shadow-1"
            >
              PERIODE: {{ filterBulan.toUpperCase() }}
            </q-badge>
          </q-card-section>

          <q-table
            :rows="detailRows"
            :columns="detailColumns"
            row-key="no"
            flat
            :loading="loadingDetail"
            class="detail-table"
            v-model:pagination="paginationDetail"
            :rows-per-page-options="[5, 10, 15, 20, 31, 0]"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-slate-50">
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
                <q-td key="no" class="text-center text-weight-bold">{{ props.row.no }}</q-td>
                <q-td key="tanggal" class="text-left text-weight-bold text-blue-grey-9">{{
                  props.row.tanggal
                }}</q-td>

                <q-td key="checkIn" class="text-center font-mono">{{ props.row.checkIn }}</q-td>
                <q-td key="statusIn" class="text-center">{{ props.row.statusIn }}</q-td>
                <q-td key="fotoIn" class="text-center">
                  <q-avatar
                    v-if="props.row.fotoIn"
                    size="38px"
                    class="shadow-1 cursor-pointer hover-scale transition-smooth"
                    @click="bukaFoto(props.row.fotoIn)"
                  >
                    <q-img :src="props.row.fotoIn" />
                    <q-tooltip class="bg-blue-grey-9">Klik untuk perbesar</q-tooltip>
                  </q-avatar>
                  <span v-else class="text-caption text-grey-5 font-mono">-</span>
                </q-td>
                <q-td key="lokasiIn" class="text-left text-caption">{{ props.row.lokasiIn }}</q-td>

                <q-td key="checkOut" class="text-center font-mono">{{ props.row.checkOut }}</q-td>
                <q-td key="statusOut" class="text-center">{{ props.row.statusOut }}</q-td>
                <q-td key="fotoOut" class="text-center">
                  <q-avatar
                    v-if="props.row.fotoOut"
                    size="38px"
                    class="shadow-1 cursor-pointer hover-scale transition-smooth"
                    @click="bukaFoto(props.row.fotoOut)"
                  >
                    <q-img :src="props.row.fotoOut" />
                    <q-tooltip class="bg-blue-grey-9">Klik untuk perbesar</q-tooltip>
                  </q-avatar>
                  <span v-else class="text-caption text-grey-5 font-mono">-</span>
                </q-td>
                <q-td key="lokasiOut" class="text-left text-caption">{{
                  props.row.lokasiOut
                }}</q-td>

                <q-td key="statusAbsensi" class="text-center">
                  <q-badge
                    :color="props.row.isHadir ? 'teal-5' : 'grey-5'"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold shadow-1"
                  >
                    {{ props.row.statusAbsensi }}
                  </q-badge>
                </q-td>
                <q-td key="totalJam" class="text-center font-mono">{{ props.row.totalJam }}</q-td>

                <!-- TOMBOL AKSI TAMBAH MANUAL -->
                <q-td key="aksi" class="text-center">
                  <q-btn
                    flat
                    round
                    dense
                    icon="edit_calendar"
                    color="primary"
                    size="sm"
                    class="bg-blue-50 transition-smooth hover-scale"
                    @click="openManualDialog(props.row)"
                  >
                    <q-tooltip class="bg-primary">Input Absen Manual</q-tooltip>
                  </q-btn>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:loading>
              <q-inner-loading showing color="primary">
                <q-spinner-dots size="50px" color="primary" />
                <div class="text-primary q-mt-md text-weight-medium">
                  Membangun detail kalender...
                </div>
              </q-inner-loading>
            </template>
          </q-table>
        </q-card>
      </q-slide-transition>

      <!-- ========================================== -->
      <!-- MODAL LIHAT FOTO                           -->
      <!-- ========================================== -->
      <q-dialog v-model="photoDialog" backdrop-filter="blur(8px)">
        <q-card style="width: 400px; max-width: 90vw" class="rounded-16 bg-transparent no-shadow">
          <q-img :src="selectedPhoto" class="rounded-16 shadow-24" />
          <q-btn
            round
            color="negative"
            icon="close"
            class="absolute-top-right q-ma-sm shadow-soft"
            v-close-popup
          />
        </q-card>
      </q-dialog>

      <!-- ========================================== -->
      <!-- MODAL TAMBAH ABSENSI MANUAL (CLEAN SAAS UI)-->
      <!-- ========================================== -->
      <q-dialog v-model="manualDialog" persistent backdrop-filter="blur(5px)">
        <q-card
          style="width: 600px; max-width: 95vw"
          class="rounded-24 bg-white overflow-hidden shadow-soft flex column"
        >
          <q-form
            @submit.prevent="simpanManualAbsensi"
            class="column full-height"
            style="margin: 0"
          >
            <!-- HEADER MODAL -->
            <q-card-section class="row items-center q-pb-md q-pt-lg q-px-lg">
              <div class="row items-center col">
                <div class="bg-blue-50 text-primary q-pa-sm rounded-8 q-mr-md">
                  <q-icon name="edit_calendar" size="24px" />
                </div>
                <div>
                  <div class="text-h6 text-weight-bolder text-blue-grey-10 line-height-tight">
                    Rekam Log Absensi Manual
                  </div>
                  <div class="text-caption text-blue-grey-5 font-mono text-weight-bold q-mt-xs">
                    {{ manualForm.tanggal }}
                  </div>
                </div>
              </div>
              <q-btn
                icon="close"
                flat
                round
                dense
                v-close-popup
                color="blue-grey-4"
                class="bg-grey-1 transition-smooth hover-scale"
              />
            </q-card-section>

            <!-- BODY MODAL (DIBERI SCROLL AGAR TOMBOL BAWAH TIDAK HILANG) -->
            <q-card-section class="q-px-lg q-py-sm scroll" style="max-height: 60vh">
              <!-- SECTION CHECK-IN (BORDER BIRU) -->
              <div class="q-pa-md rounded-12 q-mb-lg bg-white box-outline-blue relative-position">
                <div class="row items-center q-mb-md">
                  <div class="bg-blue-50 text-primary q-pa-xs rounded-6 q-mr-sm">
                    <q-icon name="login" size="18px" />
                  </div>
                  <div
                    class="text-subtitle2 text-weight-bolder text-primary uppercase tracking-widest"
                  >
                    Data Check-In
                  </div>
                </div>

                <div class="row q-col-gutter-lg items-center q-mb-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      outlined
                      v-model="manualForm.waktuIn"
                      type="time"
                      label="Waktu Masuk"
                      color="primary"
                      class="rounded-input bg-white"
                    />
                  </div>
                  <div class="col-12 col-sm-6 flex items-center">
                    <q-toggle
                      v-model="manualForm.lokasiInValid"
                      label="Validasi Lokasi Aktif"
                      color="primary"
                      class="text-weight-bold text-blue-grey-8"
                    />
                  </div>
                </div>
                <div class="col-12">
                  <q-input
                    outlined
                    v-model="manualForm.fotoIn"
                    placeholder="Tautkan URL Foto (Opsional)"
                    color="primary"
                    class="rounded-input bg-white"
                  >
                    <template v-slot:prepend><q-icon name="link" color="blue-grey-4" /></template>
                  </q-input>
                </div>
              </div>

              <!-- SECTION CHECK-OUT (BORDER ORANYE) -->
              <div class="q-pa-md rounded-12 bg-white box-outline-orange relative-position">
                <div class="row items-center q-mb-md">
                  <div class="bg-orange-50 text-orange-9 q-pa-xs rounded-6 q-mr-sm">
                    <q-icon name="logout" size="18px" />
                  </div>
                  <div
                    class="text-subtitle2 text-weight-bolder text-orange-9 uppercase tracking-widest"
                  >
                    Data Check-Out
                  </div>
                </div>

                <div class="row q-col-gutter-lg items-center q-mb-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      outlined
                      v-model="manualForm.waktuOut"
                      type="time"
                      label="Waktu Pulang"
                      color="orange-9"
                      class="rounded-input bg-white"
                    />
                  </div>
                  <div class="col-12 col-sm-6 flex items-center">
                    <q-toggle
                      v-model="manualForm.lokasiOutValid"
                      label="Validasi Lokasi Aktif"
                      color="orange-9"
                      class="text-weight-bold text-blue-grey-8"
                    />
                  </div>
                </div>
                <div class="col-12">
                  <q-input
                    outlined
                    v-model="manualForm.fotoOut"
                    placeholder="Tautkan URL Foto (Opsional)"
                    color="orange-9"
                    class="rounded-input bg-white"
                  >
                    <template v-slot:prepend><q-icon name="link" color="blue-grey-4" /></template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <!-- FOOTER MODAL (STICKY DI BAWAH) -->
            <q-card-actions align="right" class="bg-white q-px-lg q-pb-lg q-pt-md">
              <q-btn
                flat
                label="BATAL"
                color="blue-grey-6"
                v-close-popup
                class="text-weight-bold rounded-8 q-px-md transition-smooth hover-scale"
              />
              <q-btn
                unelevated
                label="SIMPAN DATA ABSENSI"
                color="primary"
                type="submit"
                class="text-weight-bolder rounded-12 q-px-xl shadow-soft-primary transition-smooth hover-scale q-py-sm"
                :loading="savingManual"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { date, useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'

const $q = useQuasar()

// State Management Umum
const viewMode = ref('summary')
const search = ref('')
const loading = ref(false)
const loadingDetail = ref(false)
const isExporting = ref(false)
const filterBulan = ref(date.formatDate(Date.now(), 'MMMM YYYY'))
const rows = ref([])

const selectedKaryawan = ref(null)
const detailRows = ref([])

const paginationSummary = ref({ page: 1, rowsPerPage: 10 })
const paginationDetail = ref({ page: 1, rowsPerPage: 5 })

const photoDialog = ref(false)
const selectedPhoto = ref(null)

// STATE ABSENSI MANUAL
const manualDialog = ref(false)
const savingManual = ref(false)
const manualForm = ref({
  absenId: null,
  tanggal: '',
  waktuIn: '',
  waktuOut: '',
  lokasiInValid: true,
  lokasiOutValid: true,
  fotoIn: '',
  fotoOut: '',
})

const bukaFoto = (url) => {
  if (!url) return
  selectedPhoto.value = url
  photoDialog.value = true
}

const columns = [
  { name: 'no', label: 'NO', align: 'center', field: 'no', style: 'width: 50px;' },
  { name: 'nik', label: 'NIK', align: 'center', field: 'nik' },
  { name: 'nama', label: 'INFORMASI KARYAWAN', align: 'left', field: 'nama', sortable: true },
  { name: 'bulan', label: 'PERIODE', align: 'center', field: 'bulan' },
  {
    name: 'ringkasan',
    label: 'REKAPITULASI HADIR',
    align: 'left',
    field: 'totalHadir',
    sortable: true,
  },
  { name: 'aksi', label: 'AKSI', align: 'center', field: 'aksi' },
]

const detailColumns = [
  { name: 'no', label: 'No', align: 'center' },
  { name: 'tanggal', label: 'Tanggal', align: 'left' },
  { name: 'checkIn', label: 'Check in', align: 'center' },
  { name: 'statusIn', label: 'Status Check In', align: 'center' },
  { name: 'fotoIn', label: 'Foto Check In', align: 'center' },
  { name: 'lokasiIn', label: 'Lokasi Check In', align: 'left' },
  { name: 'checkOut', label: 'Check Out', align: 'center' },
  { name: 'statusOut', label: 'Status Check Out', align: 'center' },
  { name: 'fotoOut', label: 'Foto Check Out', align: 'center' },
  { name: 'lokasiOut', label: 'Lokasi Check Out', align: 'left' },
  { name: 'statusAbsensi', label: 'Status Absensi', align: 'center' },
  { name: 'totalJam', label: 'Total Jam Kerja', align: 'center' },
  { name: 'aksi', label: 'Aksi', align: 'center' },
]

const getMonthDetails = () => {
  const parts = filterBulan.value.split(' ')
  const monthName = parts[0]
  const year = parseInt(parts[1])
  const monthMap = {
    Januari: 0,
    February: 1,
    Februari: 1,
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
  const monthIndex = monthMap[monthName] !== undefined ? monthMap[monthName] : new Date().getMonth()
  return { year, monthIndex, monthName }
}

const loadDataRekap = async () => {
  loading.value = true
  rows.value = []
  viewMode.value = 'summary'

  try {
    const { year, monthIndex } = getMonthDetails()
    const startDate = new Date(year, monthIndex, 1, 0, 0, 0)
    const endDate = new Date(year, monthIndex + 1, 1, 0, 0, 0)

    const karyawanSnap = await getDocs(collection(db, 'karyawan'))
    const listKaryawan = karyawanSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    const qAbsen = query(
      collection(db, 'absensi'),
      where('waktu_masuk', '>=', Timestamp.fromDate(startDate)),
      where('waktu_masuk', '<', Timestamp.fromDate(endDate)),
    )
    const absensiSnap = await getDocs(qAbsen)
    const listAbsensi = absensiSnap.docs.map((doc) => doc.data())

    const rekapData = listKaryawan.map((karyawan) => {
      const namaUpper = (karyawan.nama || '').toUpperCase()
      const absensiKaryawanIni = listAbsensi.filter((absen) => absen.nama_karyawan === namaUpper)
      const totalHadir = absensiKaryawanIni.length

      return {
        id: karyawan.id,
        nik: karyawan.nik || '-',
        nama: karyawan.nama || 'Tanpa Nama',
        email: karyawan.email || '-',
        bulan: filterBulan.value,
        totalHadir: totalHadir,
      }
    })

    rows.value = rekapData.filter((data) => data.totalHadir > 0)
  } catch (error) {
    console.error('Gagal merekap data:', error)
    $q.notify({ color: 'negative', message: 'Terjadi kesalahan saat menarik data laporan.' })
  } finally {
    loading.value = false
  }
}

const lihatDetail = async (row) => {
  selectedKaryawan.value = row
  viewMode.value = 'detail'
  loadingDetail.value = true
  detailRows.value = []

  try {
    const { year, monthIndex, monthName } = getMonthDetails()
    const startDate = new Date(year, monthIndex, 1, 0, 0, 0)
    const endDate = new Date(year, monthIndex + 1, 1, 0, 0, 0)

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

    const qAbsen = query(
      collection(db, 'absensi'),
      where('waktu_masuk', '>=', Timestamp.fromDate(startDate)),
      where('waktu_masuk', '<', Timestamp.fromDate(endDate)),
    )
    const absensiSnap = await getDocs(qAbsen)

    const namaTarget = (row.nama || '').toUpperCase()
    const listAbsensi = absensiSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((absen) => absen.nama_karyawan === namaTarget)

    const absensiByDate = {}
    listAbsensi.forEach((absen) => {
      if (absen.waktu_masuk) {
        const dateObj = absen.waktu_masuk.toDate()
        const day = dateObj.getDate()
        absensiByDate[day] = absen
      }
    })

    const generatedRows = []
    for (let i = 1; i <= daysInMonth; i++) {
      const dataAbsen = absensiByDate[i]
      const currentDateStr = `${i.toString().padStart(2, '0')} ${monthName} ${year}`

      if (dataAbsen) {
        const checkInTime = date.formatDate(dataAbsen.waktu_masuk.toDate(), 'HH:mm')
        const checkOutTime = dataAbsen.waktu_pulang
          ? date.formatDate(dataAbsen.waktu_pulang.toDate(), 'HH:mm')
          : '-'

        let totalJamStr = '-'
        if (dataAbsen.waktu_pulang) {
          const start = dataAbsen.waktu_masuk.toDate()
          const end = dataAbsen.waktu_pulang.toDate()
          const diffMs = end - start
          const hrs = Math.floor(diffMs / 3600000)
          const mins = Math.floor((diffMs % 3600000) / 60000)
          totalJamStr = `${hrs}j ${mins}m`
        }

        generatedRows.push({
          absenId: dataAbsen.id,
          no: i,
          tanggal: currentDateStr,
          checkIn: checkInTime,
          statusIn: dataAbsen.is_manual ? 'Manual' : 'Sesuai Waktu',
          fotoInRaw:
            dataAbsen.foto_masuk ||
            dataAbsen.foto_in ||
            dataAbsen.fotoUrl_masuk ||
            dataAbsen.foto ||
            null,
          fotoIn:
            dataAbsen.foto_masuk ||
            dataAbsen.foto_in ||
            dataAbsen.fotoUrl_masuk ||
            dataAbsen.foto ||
            null,
          lokasiIn: dataAbsen.nama_tempat || 'Tidak ada lokasi',

          checkOut: checkOutTime,
          statusOut: dataAbsen.waktu_pulang
            ? dataAbsen.is_manual
              ? 'Manual'
              : 'Sesuai Waktu'
            : 'N/A',
          fotoOutRaw:
            dataAbsen.foto_pulang || dataAbsen.foto_out || dataAbsen.fotoUrl_pulang || null,
          fotoOut: dataAbsen.foto_pulang || dataAbsen.foto_out || dataAbsen.fotoUrl_pulang || null,
          lokasiOut: dataAbsen.waktu_pulang
            ? dataAbsen.nama_tempat || 'Tidak ada lokasi'
            : 'Tidak ada lokasi',

          statusAbsensi: 'Hadir',
          totalJam: totalJamStr,
          isHadir: true,
        })
      } else {
        generatedRows.push({
          absenId: null,
          no: i,
          tanggal: currentDateStr,
          checkIn: '-',
          statusIn: 'N/A',
          fotoInRaw: null,
          fotoIn: null,
          lokasiIn: 'Tidak ada lokasi',
          checkOut: '-',
          statusOut: 'N/A',
          fotoOutRaw: null,
          fotoOut: null,
          lokasiOut: 'Tidak ada lokasi',
          statusAbsensi: 'Tidak Ada Data',
          totalJam: '-',
          isHadir: false,
        })
      }
    }

    detailRows.value = generatedRows
  } catch (error) {
    console.error('Gagal load detail: ', error)
    $q.notify({ color: 'negative', message: 'Gagal memuat detail karyawan.' })
  } finally {
    loadingDetail.value = false
  }
}

// BUKA DIALOG MANUAL ABSENSI
const openManualDialog = (row) => {
  manualForm.value = {
    absenId: row.absenId,
    tanggal: row.tanggal,
    waktuIn: row.checkIn !== '-' && row.checkIn !== 'N/A' ? row.checkIn : '',
    waktuOut: row.checkOut !== '-' && row.checkOut !== 'N/A' ? row.checkOut : '',
    lokasiInValid: row.lokasiIn && row.lokasiIn.includes('Luar') ? false : true,
    lokasiOutValid: row.lokasiOut && row.lokasiOut.includes('Luar') ? false : true,
    fotoIn: row.fotoInRaw || '',
    fotoOut: row.fotoOutRaw || '',
  }
  manualDialog.value = true
}

// SIMPAN MANUAL ABSENSI KE FIRESTORE
const simpanManualAbsensi = async () => {
  savingManual.value = true
  try {
    const parts = manualForm.value.tanggal.split(' ')
    const day = parseInt(parts[0])
    const monthName = parts[1]
    const year = parseInt(parts[2])

    const monthMap = {
      Januari: 0,
      February: 1,
      Februari: 1,
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
    const monthIndex = monthMap[monthName]

    let waktuMasukTs = null
    let waktuPulangTs = null

    if (manualForm.value.waktuIn) {
      const [h, m] = manualForm.value.waktuIn.split(':')
      waktuMasukTs = Timestamp.fromDate(
        new Date(year, monthIndex, day, parseInt(h), parseInt(m), 0),
      )
    }
    if (manualForm.value.waktuOut) {
      const [h, m] = manualForm.value.waktuOut.split(':')
      waktuPulangTs = Timestamp.fromDate(
        new Date(year, monthIndex, day, parseInt(h), parseInt(m), 0),
      )
    }

    if (!waktuMasukTs) {
      throw new Error('Waktu Check-in wajib diisi jika ingin menambah absensi manual.')
    }

    const dataToSave = {
      nama_karyawan: selectedKaryawan.value.nama.toUpperCase(),
      tanggal: date.formatDate(waktuMasukTs.toDate(), 'dddd, DD MMMM YYYY', {
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
      }),
      waktu_masuk: waktuMasukTs,
      waktu_pulang: waktuPulangTs,
      status: 'Hadir',
      nama_tempat: manualForm.value.lokasiInValid
        ? 'MANUAL - LOKASI VALID'
        : 'MANUAL - LUAR LOKASI',
      alamat_lengkap: 'Ditambahkan Manual oleh Administrator',
      koordinat: '0,0',
      foto_masuk: manualForm.value.fotoIn || null,
      foto_pulang: manualForm.value.fotoOut || null,
      is_manual: true,
    }

    if (manualForm.value.absenId) {
      await updateDoc(doc(db, 'absensi', manualForm.value.absenId), dataToSave)
    } else {
      await addDoc(collection(db, 'absensi'), dataToSave)
    }

    $q.notify({
      color: 'positive',
      message: 'Data absensi manual berhasil disimpan!',
      icon: 'check_circle',
    })
    manualDialog.value = false

    await lihatDetail(selectedKaryawan.value)
  } catch (e) {
    $q.notify({ color: 'negative', message: e.message || 'Terjadi kesalahan.', icon: 'error' })
  } finally {
    savingManual.value = false
  }
}

const exportToExcel = async () => {
  if (rows.value.length === 0) return
  isExporting.value = true

  try {
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const excelData = rows.value.map((row, index) => ({
      No: index + 1,
      'NIK Karyawan': row.nik,
      'Nama Lengkap Karyawan': row.nama,
      'Email Terdaftar': row.email,
      'Periode Laporan': row.bulan,
      'Total Kehadiran (Hari)': row.totalHadir,
    }))

    const worksheet = window.XLSX.utils.json_to_sheet(excelData)
    const workbook = window.XLSX.utils.book_new()
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi')

    const colWidths = [{ wch: 6 }, { wch: 18 }, { wch: 35 }, { wch: 30 }, { wch: 20 }, { wch: 25 }]
    worksheet['!cols'] = colWidths

    window.XLSX.writeFile(
      workbook,
      `Rekap_Absensi_AGRA_${filterBulan.value.replace(' ', '_')}.xlsx`,
    )

    $q.notify({
      message: 'Berhasil mengunduh laporan Excel!',
      color: 'positive',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Gagal mengekspor Excel:', error)
    $q.notify({ message: 'Gagal memproses file Excel.', color: 'negative', icon: 'error' })
  } finally {
    isExporting.value = false
  }
}

onMounted(() => {
  loadDataRekap()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');

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
.line-height-normal {
  line-height: 1.4;
}
.tracking-wide {
  letter-spacing: 0.5px;
}
.uppercase {
  text-transform: uppercase;
}

.premium-container {
  max-width: 1400px;
}
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.border-bottom-light {
  border-bottom: 1px solid #f8fafc;
}
.border-bottom {
  border-bottom: 1px solid #e2e8f0;
}
.border-top {
  border-top: 1px solid #e2e8f0;
}

/* Custom box borders matching the screenshot */
.box-outline-blue {
  border: 1.5px solid #e0f2fe;
}
.box-outline-orange {
  border: 1.5px solid #ffedd5;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.opacity-20 {
  opacity: 0.2;
}
.opacity-50 {
  opacity: 0.5;
}
.z-content {
  position: relative;
  z-index: 2;
}

.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.06) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(25, 118, 210, 0.5) !important;
}
.rounded-24 {
  border-radius: 24px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-8 {
  border-radius: 8px;
}
.rounded-6 {
  border-radius: 6px;
}

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-effect:hover td {
  background-color: #f8fafc !important;
}
.hover-scale:hover {
  transform: scale(1.05);
}

.ios-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ios-icon-box.small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s ease;
}
.rounded-input :deep(.q-field__control:hover) {
  border-color: #1976d2;
}

.premium-table :deep(thead tr th),
.detail-table :deep(thead tr th) {
  font-size: 12px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: none;
}
.premium-table :deep(tbody tr td),
.detail-table :deep(tbody tr td) {
  font-size: 14px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
}

.detail-table :deep(tbody tr td) {
  font-size: 12px;
}

@media (max-width: 599px) {
  .sm-block {
    display: block;
    margin-bottom: 8px;
  }
}
</style>
