<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg font-inter">
    <div class="premium-container mx-auto">
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

      <q-slide-transition>
        <q-card
          flat
          class="bento-card bg-white overflow-hidden shadow-soft"
          v-if="viewMode === 'summary'"
        >
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
                      :color="props.row.fotoUrl ? undefined : 'blue-1'"
                      :text-color="props.row.fotoUrl ? undefined : 'primary'"
                      class="q-mr-md text-weight-bold shadow-1"
                    >
                      <img v-if="props.row.fotoUrl" :src="props.row.fotoUrl" style="object-fit: cover;" />
                      <span v-else>{{ props.row.nama.substring(0, 1).toUpperCase() }}</span>
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
                  <div class="row q-gutter-xs">
                    <q-badge
                      color="teal-1"
                      text-color="teal-8"
                      class="q-px-sm q-py-xs rounded-6 text-weight-bolder"
                    >
                      <q-icon name="fact_check" size="14px" class="q-mr-xs" /> HADIR:
                      {{ props.row.totalHadir }} HARI
                    </q-badge>
                    <q-badge
                      v-if="props.row.totalLeaves > 0"
                      color="indigo-1"
                      text-color="indigo-8"
                      class="q-px-sm q-py-xs rounded-6 text-weight-bolder"
                    >
                      <q-icon name="event_busy" size="14px" class="q-mr-xs" /> IZIN/CUTI:
                      {{ props.row.totalLeaves }} HARI
                    </q-badge>
                  </div>
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

      <q-slide-transition>
        <q-card
          flat
          class="bento-card bg-white overflow-hidden shadow-soft"
          v-if="viewMode === 'detail'"
        >
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
              color="blue-1"
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

                <q-td key="statusIn" class="text-center">
                  <q-badge
                    v-if="props.row.statusIn !== 'N/A'"
                    :color="
                      props.row.statusIn === 'Terlambat'
                        ? 'red-5'
                        : props.row.statusIn === 'Manual'
                          ? 'orange-5'
                          : props.row.statusIn === 'Cuti'
                            ? 'blue-5'
                            : props.row.statusIn === 'Sakit'
                              ? 'amber-7'
                              : props.row.statusIn === 'Izin'
                                ? 'indigo-5'
                                : 'teal-5'
                    "
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold shadow-1"
                  >
                    {{ props.row.statusIn }}
                  </q-badge>
                  <span v-else class="text-caption text-grey-5 font-mono">N/A</span>
                </q-td>

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
                <q-td key="statusOut" class="text-center">
                  <q-badge
                    v-if="props.row.statusOut !== 'N/A'"
                    :color="
                      props.row.statusOut === 'Manual'
                        ? 'orange-5'
                        : props.row.statusOut === 'Cuti'
                          ? 'blue-5'
                          : props.row.statusOut === 'Sakit'
                            ? 'amber-7'
                            : props.row.statusOut === 'Izin'
                              ? 'indigo-5'
                              : 'teal-5'
                    "
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold shadow-1"
                  >
                    {{ props.row.statusOut }}
                  </q-badge>
                  <span v-else class="text-caption text-grey-5 font-mono">N/A</span>
                </q-td>
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
                    v-if="props.row.statusAbsensi === 'Hadir'"
                    color="teal-5"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold shadow-1"
                    :class="props.row.dokumen_url ? 'cursor-pointer' : ''"
                    @click="props.row.dokumen_url ? bukaLampiran(props.row.dokumen_url) : null"
                  >
                    {{ props.row.statusAbsensi }}
                    <q-icon v-if="props.row.dokumen_url" name="attachment" size="xs" class="q-ml-xs" />
                    <q-tooltip v-if="props.row.dokumen_url" class="bg-teal-8 text-weight-bold">
                      Klik untuk Lihat Lampiran
                    </q-tooltip>
                  </q-badge>
                  <q-badge
                    v-else-if="props.row.statusAbsensi === 'Cuti'"
                    color="blue-5"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold shadow-1"
                    :class="props.row.dokumen_url ? 'cursor-pointer' : ''"
                    @click="props.row.dokumen_url ? bukaLampiran(props.row.dokumen_url) : null"
                  >
                    <q-icon name="beach_access" size="xs" class="q-mr-xs" />
                    {{ props.row.statusAbsensi }}
                    <q-icon v-if="props.row.dokumen_url" name="attachment" size="xs" class="q-ml-xs" />
                    <q-tooltip v-if="props.row.dokumen_url" class="bg-blue-8 text-weight-bold">
                      Klik untuk Lihat Lampiran
                    </q-tooltip>
                  </q-badge>
                  <q-badge
                    v-else-if="props.row.statusAbsensi === 'Sakit'"
                    color="amber-7"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold shadow-1"
                    :class="props.row.dokumen_url ? 'cursor-pointer' : ''"
                    @click="props.row.dokumen_url ? bukaLampiran(props.row.dokumen_url) : null"
                  >
                    <q-icon name="healing" size="xs" class="q-mr-xs" />
                    {{ props.row.statusAbsensi }}
                    <q-icon v-if="props.row.dokumen_url" name="attachment" size="xs" class="q-ml-xs" />
                    <q-tooltip v-if="props.row.dokumen_url" class="bg-amber-8 text-weight-bold">
                      Klik untuk Lihat Lampiran
                    </q-tooltip>
                  </q-badge>
                  <q-badge
                    v-else-if="props.row.statusAbsensi === 'Izin'"
                    color="indigo-5"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold shadow-1"
                    :class="props.row.dokumen_url ? 'cursor-pointer' : ''"
                    @click="props.row.dokumen_url ? bukaLampiran(props.row.dokumen_url) : null"
                  >
                    <q-icon name="description" size="xs" class="q-mr-xs" />
                    {{ props.row.statusAbsensi }}
                    <q-icon v-if="props.row.dokumen_url" name="attachment" size="xs" class="q-ml-xs" />
                    <q-tooltip v-if="props.row.dokumen_url" class="bg-indigo-8 text-weight-bold">
                      Klik untuk Lihat Lampiran
                    </q-tooltip>
                  </q-badge>
                  <q-badge
                    v-else
                    color="grey-5"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold shadow-1"
                  >
                    {{ props.row.statusAbsensi }}
                  </q-badge>
                </q-td>
                <q-td key="totalJam" class="text-center font-mono">{{ props.row.totalJam }}</q-td>

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

            <q-card-section class="q-px-lg q-py-sm scroll" style="max-height: 60vh">
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

    // Ambil data pengajuan Cuti/Izin/Sakit yang disetujui
    const qPengajuan = query(
      collection(db, 'pengajuan'),
      where('status_approval', 'in', ['Approved', 'Selesai'])
    )
    const pengajuanSnap = await getDocs(qPengajuan)
    const listPengajuan = pengajuanSnap.docs.map((doc) => doc.data())

    const rekapData = listKaryawan.map((karyawan) => {
      const namaUpper = (karyawan.nama || '').toUpperCase()
      const absensiKaryawanIni = listAbsensi.filter((absen) => (absen.nama_karyawan || '').toUpperCase() === namaUpper)

      // Menghitung hari kehadiran unik untuk mencegah bug duplikasi data check-in di hari yang sama
      const uniqueDays = new Set()
      absensiKaryawanIni.forEach((absen) => {
        if (absen.waktu_masuk) {
          const dateObj = absen.waktu_masuk.toDate ? absen.waktu_masuk.toDate() : new Date(absen.waktu_masuk)
          const dateStr = date.formatDate(dateObj, 'YYYY-MM-DD')
          uniqueDays.add(dateStr)
        }
      })
      const totalHadir = uniqueDays.size

      // Menghitung pengajuan cuti/izin/sakit yang aktif di bulan ini
      const pengajuanKaryawanIni = listPengajuan.filter((p) => (p.nama_karyawan || '').toUpperCase() === namaUpper)
      const leafDays = new Set()
      pengajuanKaryawanIni.forEach((p) => {
        const pStart = new Date(p.tanggal_mulai)
        const pEnd = new Date(p.tanggal_selesai || p.tanggal_mulai)
        const curr = new Date(pStart)
        while (curr <= pEnd) {
          if (curr.getMonth() === monthIndex && curr.getFullYear() === year) {
            const dateStr = date.formatDate(curr, 'YYYY-MM-DD')
            leafDays.add(dateStr)
          }
          curr.setDate(curr.getDate() + 1)
        }
      })
      const totalLeaves = leafDays.size

      return {
        id: karyawan.id,
        nik: karyawan.nik || '-',
        nama: karyawan.nama || 'Tanpa Nama',
        email: karyawan.email || '-',
        bulan: filterBulan.value,
        totalHadir: totalHadir,
        totalLeaves: totalLeaves,
        fotoUrl: karyawan.fotoUrl || karyawan.foto_profil || null,
      }
    })

    rows.value = rekapData.filter((data) => data.totalHadir > 0 || data.totalLeaves > 0)
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

    // 1. Tarik data absensi karyawan
    const qAbsen = query(
      collection(db, 'absensi'),
      where('waktu_masuk', '>=', Timestamp.fromDate(startDate)),
      where('waktu_masuk', '<', Timestamp.fromDate(endDate)),
    )
    const absensiSnap = await getDocs(qAbsen)

    const namaTarget = (row.nama || '').toUpperCase()
    const listAbsensi = absensiSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((absen) => (absen.nama_karyawan || '').toUpperCase() === namaTarget)

    const absensiByDate = {}
    listAbsensi.forEach((absen) => {
      if (absen.waktu_masuk) {
        const dateObj = absen.waktu_masuk.toDate ? absen.waktu_masuk.toDate() : new Date(absen.waktu_masuk)
        const day = dateObj.getDate()
        absensiByDate[day] = absen
      }
    })

    // 2. Tarik pengajuan (Cuti/Izin/Sakit) yang disetujui
    const qPengajuan = query(
      collection(db, 'pengajuan'),
      where('status_approval', 'in', ['Approved', 'Selesai'])
    )
    const pengajuanSnap = await getDocs(qPengajuan)
    const listPengajuan = pengajuanSnap.docs
      .map((doc) => doc.data())
      .filter((p) => (p.nama_karyawan || '').toUpperCase() === namaTarget)

    const generatedRows = []
    for (let i = 1; i <= daysInMonth; i++) {
      const dataAbsen = absensiByDate[i]
      const currentDateStr = `${i.toString().padStart(2, '0')} ${monthName} ${year}`
      const curDateStrYYYYMMDD = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

      // Cari pengajuan cuti/izin/sakit yang aktif di tanggal ini
      const leaveRow = listPengajuan.find((p) => {
        const pStart = normalizeDateStr(p.tanggal_mulai)
        const pEnd = normalizeDateStr(p.tanggal_selesai || p.tanggal_mulai)
        return curDateStrYYYYMMDD >= pStart && curDateStrYYYYMMDD <= pEnd
      })

      if (dataAbsen) {
        const checkInTime = date.formatDate(dataAbsen.waktu_masuk.toDate ? dataAbsen.waktu_masuk.toDate() : new Date(dataAbsen.waktu_masuk), 'HH:mm')
        const checkOutTime = dataAbsen.waktu_pulang
          ? date.formatDate(dataAbsen.waktu_pulang.toDate ? dataAbsen.waktu_pulang.toDate() : new Date(dataAbsen.waktu_pulang), 'HH:mm')
          : '-'

        let totalJamStr = '-'
        if (dataAbsen.waktu_pulang) {
          const start = dataAbsen.waktu_masuk.toDate ? dataAbsen.waktu_masuk.toDate() : new Date(dataAbsen.waktu_masuk)
          const end = dataAbsen.waktu_pulang.toDate ? dataAbsen.waktu_pulang.toDate() : new Date(dataAbsen.waktu_pulang)
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
          statusIn: dataAbsen.is_manual
            ? 'Manual'
            : dataAbsen.is_late
              ? 'Terlambat'
              : 'Tepat Waktu',
          fotoInRaw: dataAbsen.foto_masuk || dataAbsen.foto_in || dataAbsen.fotoUrl_masuk || dataAbsen.foto || null,
          fotoIn: dataAbsen.foto_masuk || dataAbsen.foto_in || dataAbsen.fotoUrl_masuk || dataAbsen.foto || null,
          lokasiIn: dataAbsen.nama_tempat || 'Tidak ada lokasi',
          checkOut: checkOutTime,
          statusOut: dataAbsen.waktu_pulang
            ? dataAbsen.is_manual
              ? 'Manual'
              : 'Tepat Waktu'
            : 'N/A',
          fotoOutRaw: dataAbsen.foto_pulang || dataAbsen.foto_out || dataAbsen.fotoUrl_pulang || null,
          fotoOut: dataAbsen.foto_pulang || dataAbsen.foto_out || dataAbsen.fotoUrl_pulang || null,
          lokasiOut: dataAbsen.waktu_pulang
            ? dataAbsen.nama_tempat_pulang || dataAbsen.nama_tempat || 'Tidak ada lokasi'
            : 'Tidak ada lokasi',
          statusAbsensi: 'Hadir',
          totalJam: totalJamStr,
          isHadir: true,
          dokumen_url: (leaveRow && leaveRow.dokumen_url) || null
        })
      } else if (leaveRow) {
        const jenis = leaveRow.jenis_pengajuan || ''
        const docUrl = leaveRow.dokumen_url || null
        
        if (jenis === 'Absensi Manual' || jenis.toLowerCase().includes('manual')) {
          const alasanText = leaveRow.alasan || ''
          const masukMatch = alasanText.match(/Jam Masuk:\s*([0-9]{2}:[0-9]{2})/)
          const pulangMatch = alasanText.match(/Jam Pulang:\s*([0-9]{2}:[0-9]{2})/)
          const checkInTime = masukMatch ? masukMatch[1] : '-'
          const checkOutTime = pulangMatch && pulangMatch[1] !== 'Belum Pulang' ? pulangMatch[1] : '-'
          
          generatedRows.push({
            absenId: null,
            no: i,
            tanggal: currentDateStr,
            checkIn: checkInTime,
            statusIn: 'Manual',
            fotoInRaw: null,
            fotoIn: null,
            lokasiIn: 'Absen Manual (Disetujui)',
            checkOut: checkOutTime,
            statusOut: checkOutTime !== '-' ? 'Manual' : 'N/A',
            fotoOutRaw: null,
            fotoOut: null,
            lokasiOut: checkOutTime !== '-' ? 'Absen Manual (Disetujui)' : 'Tidak ada lokasi',
            statusAbsensi: 'Hadir',
            totalJam: '-',
            isHadir: true,
            dokumen_url: docUrl
          })
        } else {
          const statusStr = jenis === 'Cuti Tahunan' || jenis.toLowerCase().includes('cuti')
            ? 'Cuti'
            : jenis === 'Izin Sakit' || jenis.toLowerCase().includes('sakit')
              ? 'Sakit'
              : 'Izin'
              
          generatedRows.push({
            absenId: null,
            no: i,
            tanggal: currentDateStr,
            checkIn: '-',
            statusIn: statusStr,
            fotoInRaw: null,
            fotoIn: null,
            lokasiIn: 'Cuti/Izin Disetujui',
            checkOut: '-',
            statusOut: statusStr,
            fotoOutRaw: null,
            fotoOut: null,
            lokasiOut: 'Cuti/Izin Disetujui',
            statusAbsensi: statusStr,
            totalJam: '-',
            isHadir: false,
            dokumen_url: docUrl
          })
        }
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
          dokumen_url: null
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
      is_late: false, // Karena di-input manual oleh HRD, dianggap on-time / kebijakan HRD
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
    const ExcelJS = await loadExcelJS()
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rekap Absensi')
    worksheet.views = [{ showGridLines: true }]

    const { year, monthIndex } = getMonthDetails()
    const startDate = new Date(year, monthIndex, 1, 0, 0, 0)
    const endDate = new Date(year, monthIndex + 1, 1, 0, 0, 0)

    // Tarik data karyawan & absensi aktual secara real-time
    const karyawanSnap = await getDocs(collection(db, 'karyawan'))
    const listKaryawan = karyawanSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.nama || '').localeCompare(b.nama || ''))

    const qAbsen = query(
      collection(db, 'absensi'),
      where('waktu_masuk', '>=', Timestamp.fromDate(startDate)),
      where('waktu_masuk', '<', Timestamp.fromDate(endDate)),
    )
    const absensiSnap = await getDocs(qAbsen)
    const listAbsensi = absensiSnap.docs.map((doc) => doc.data())

    // Tarik pengajuan Cuti / Izin / Sakit yang disetujui
    const qPengajuan = query(
      collection(db, 'pengajuan'),
      where('status_approval', 'in', ['Approved', 'Selesai'])
    )
    const pengajuanSnap = await getDocs(qPengajuan)
    const listPengajuan = pengajuanSnap.docs.map((doc) => doc.data())

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const daysIndoShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    const dayNames = []
    for (let i = 1; i <= daysInMonth; i++) {
      const dObj = new Date(year, monthIndex, i)
      dayNames.push(daysIndoShort[dObj.getDay()])
    }

    const HOLIDAY_DATA = {
      2025: [
        { tanggal: '2025/01/01', nama: 'Tahun Baru 2025', type: 'holiday' },
        { tanggal: '2025/01/27', nama: 'Isra Miraj', type: 'holiday' },
        { tanggal: '2025/01/28', nama: 'Cuti Bersama Isra Miraj', type: 'cuti_bersama' },
        { tanggal: '2025/01/29', nama: 'Tahun Baru Imlek', type: 'holiday' },
        { tanggal: '2025/03/29', nama: 'Hari Raya Nyepi', type: 'holiday' },
        { tanggal: '2025/03/28', nama: 'Cuti Bersama Nyepi', type: 'cuti_bersama' },
        { tanggal: '2025/03/31', nama: 'Idul Fitri 1446 H', type: 'holiday' },
        { tanggal: '2025/04/01', nama: 'Idul Fitri 1446 H', type: 'holiday' },
        { tanggal: '2025/03/26', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2025/03/27', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2025/04/02', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2025/04/03', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2025/04/04', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2025/04/07', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2025/04/18', nama: 'Wafat Yesus Kristus', type: 'holiday' },
        { tanggal: '2025/05/01', nama: 'Hari Buruh Internasional', type: 'holiday' },
        { tanggal: '2025/05/12', nama: 'Hari Raya Waisak', type: 'holiday' },
        { tanggal: '2025/05/13', nama: 'Cuti Bersama Waisak', type: 'cuti_bersama' },
        { tanggal: '2025/05/29', nama: 'Kenaikan Yesus Kristus', type: 'holiday' },
        { tanggal: '2025/05/28', nama: 'Cuti Bersama Kenaikan Yesus', type: 'cuti_bersama' },
        { tanggal: '2025/06/01', nama: 'Hari Lahir Pancasila', type: 'holiday' },
        { tanggal: '2025/06/06', nama: 'Idul Adha 1446 H', type: 'holiday' },
        { tanggal: '2025/06/27', nama: 'Tahun Baru Islam 1447 H', type: 'holiday' },
        { tanggal: '2025/08/17', nama: 'HUT Kemerdekaan RI', type: 'holiday' },
        { tanggal: '2025/09/05', nama: 'Maulid Nabi Muhammad SAW', type: 'holiday' },
        { tanggal: '2025/12/25', nama: 'Hari Raya Natal', type: 'holiday' },
        { tanggal: '2025/12/26', nama: 'Cuti Bersama Natal', type: 'cuti_bersama' },
      ],
      2026: [
        { tanggal: '2026/01/01', nama: 'Tahun Baru 2026', type: 'holiday' },
        { tanggal: '2026/01/16', nama: 'Isra Miraj 1447 H', type: 'holiday' },
        { tanggal: '2026/02/17', nama: 'Tahun Baru Imlek 2577', type: 'holiday' },
        { tanggal: '2026/03/19', nama: 'Hari Raya Nyepi', type: 'holiday' },
        { tanggal: '2026/03/20', nama: 'Wafat Yesus Kristus', type: 'holiday' },
        { tanggal: '2026/03/21', nama: 'Idul Fitri 1447 H', type: 'holiday' },
        { tanggal: '2026/03/22', nama: 'Idul Fitri 1447 H', type: 'holiday' },
        { tanggal: '2026/03/18', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2026/03/23', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2026/03/24', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2026/03/25', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2026/03/26', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2026/03/27', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
        { tanggal: '2026/05/01', nama: 'Hari Buruh Internasional', type: 'holiday' },
        { tanggal: '2026/05/14', nama: 'Kenaikan Yesus Kristus', type: 'holiday' },
        { tanggal: '2026/05/25', nama: 'Hari Raya Waisak', type: 'holiday' },
        { tanggal: '2026/06/01', nama: 'Hari Lahir Pancasila', type: 'holiday' },
        { tanggal: '2026/05/27', nama: 'Idul Adha 1447 H', type: 'holiday' },
        { tanggal: '2026/05/28', nama: 'Cuti Bersama Idul Adha', type: 'cuti_bersama' },
        { tanggal: '2026/06/17', nama: 'Tahun Baru Islam 1448 H', type: 'holiday' },
        { tanggal: '2026/08/17', nama: 'HUT Kemerdekaan RI ke-81', type: 'holiday' },
        { tanggal: '2026/08/25', nama: 'Maulid Nabi Muhammad SAW', type: 'holiday' },
        { tanggal: '2026/12/25', nama: 'Hari Raya Natal', type: 'holiday' },
        { tanggal: '2026/12/24', nama: 'Cuti Bersama Natal', type: 'cuti_bersama' },
        { tanggal: '2026/12/26', nama: 'Cuti Bersama Natal', type: 'cuti_bersama' },
        { tanggal: '2026/12/31', nama: 'Cuti Bersama Tahun Baru', type: 'cuti_bersama' },
      ],
    }

    const yearHolidays = HOLIDAY_DATA[year] || []
    const getHolidayName = (dayNum) => {
      const dateStr = `${year}/${String(monthIndex + 1).padStart(2, '0')}/${String(dayNum).padStart(2, '0')}`
      const h = yearHolidays.find(item => item.tanggal === dateStr)
      return h ? h.nama : null
    }

    const colIndexToLabel = (index) => {
      let label = ''
      let temp = index
      while (temp >= 0) {
        label = String.fromCharCode((temp % 26) + 65) + label
        temp = Math.floor(temp / 26) - 1
      }
      return label
    }

    const lastColIndex = 2 + daysInMonth + 6 // index 38 (column AM)
    const colLetterLast = colIndexToLabel(lastColIndex)

    worksheet.mergeCells('A1:B2')
    worksheet.mergeCells(`C1:${colLetterLast}1`)
    worksheet.mergeCells(`C2:${colLetterLast}2`)

    worksheet.getRow(1).height = 30
    worksheet.getRow(2).height = 24
    worksheet.getRow(3).height = 22
    worksheet.getRow(4).height = 22

    worksheet.getCell('C1').value = 'ABSENSI KARYAWAN PT AGRA ABHINAYA PERKASA'
    worksheet.getCell('C2').value = 'PERIODE: ' + filterBulan.value.toUpperCase()

    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' } // Navy Blue
    }

    // Apply header fill
    for (let r = 1; r <= 2; r++) {
      const row = worksheet.getRow(r)
      for (let c = 1; c <= lastColIndex + 1; c++) {
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

    // Build header values
    const row3Vals = ["Nama Karyawan", "Jabatan", "Tanggal"]
    for (let i = 1; i < daysInMonth; i++) {
      row3Vals.push("")
    }
    row3Vals.push("Jumlah Hari Kerja")
    row3Vals.push("Keterangan")
    for (let i = 1; i < 6; i++) {
      row3Vals.push("")
    }
    worksheet.getRow(3).values = row3Vals

    const row4Vals = ["", "", ...Array.from({ length: daysInMonth }, (_, idx) => idx + 1), "", "H", "T", "I", "C", "S", "A"]
    worksheet.getRow(4).values = row4Vals

    // Merges for table headers
    worksheet.mergeCells('A3:A4') // Nama Karyawan
    worksheet.mergeCells('B3:B4') // Jabatan

    const endDayColLetter = colIndexToLabel(2 + daysInMonth - 1)
    worksheet.mergeCells(`C3:${endDayColLetter}3`)

    const totalWorkDayColLetter = colIndexToLabel(2 + daysInMonth)
    worksheet.mergeCells(`${totalWorkDayColLetter}3:${totalWorkDayColLetter}4`)

    const ketStartLetter = colIndexToLabel(2 + daysInMonth + 1)
    const ketEndLetter = colIndexToLabel(lastColIndex)
    worksheet.mergeCells(`${ketStartLetter}3:${ketEndLetter}3`)

    // Styling table headers (Row 3 & Row 4)
    const tableHeaderFill = {
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

    for (let r = 3; r <= 4; r++) {
      const row = worksheet.getRow(r)
      for (let c = 1; c <= lastColIndex + 1; c++) {
        const cell = row.getCell(c)
        cell.fill = tableHeaderFill
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.border = thinBorder
      }
    }

    const subheaderColors = {
      'H': { bg: 'FF00B050', text: 'FFFFFFFF' },
      'T': { bg: 'FFFF6F00', text: 'FFFFFFFF' },
      'I': { bg: 'FFFFFF00', text: 'FF000000' },
      'C': { bg: 'FF00B0F0', text: 'FFFFFFFF' },
      'S': { bg: 'FFFFC000', text: 'FF000000' },
      'A': { bg: 'FFFF0000', text: 'FFFFFFFF' }
    }

    const subHeaderStartCol = 2 + daysInMonth + 2 // col AI
    for (let c = subHeaderStartCol; c <= lastColIndex + 1; c++) {
      const cell = worksheet.getRow(4).getCell(c)
      const val = cell.value
      if (subheaderColors[val]) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: subheaderColors[val].bg } }
        cell.font.color = { argb: subheaderColors[val].text }
      }
    }

    // Add employee rows
    let currentRowNum = 5
    listKaryawan.forEach((karyawan, index) => {
      const dataRow = worksheet.getRow(currentRowNum)
      dataRow.height = 20

      const namaUpper = (karyawan.nama || '').toUpperCase()
      const absensiKaryawanIni = listAbsensi.filter((absen) => (absen.nama_karyawan || '').toUpperCase() === namaUpper)

      const statusByDay = {}
      absensiKaryawanIni.forEach((absen) => {
        if (absen.waktu_masuk) {
          const dateObj = absen.waktu_masuk.toDate ? absen.waktu_masuk.toDate() : new Date(absen.waktu_masuk)
          const dNum = dateObj.getDate()
          statusByDay[dNum] = absen.is_late ? 'T' : 'H'
        }
      })

      const pengajuanKaryawanIni = listPengajuan.filter((p) => (p.nama_karyawan || '').toUpperCase() === namaUpper)
      for (let i = 1; i <= daysInMonth; i++) {
        const curDateStrYYYYMMDD = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

        const leaveRow = pengajuanKaryawanIni.find((p) => {
          const pStart = normalizeDateStr(p.tanggal_mulai)
          const pEnd = normalizeDateStr(p.tanggal_selesai || p.tanggal_mulai)
          return curDateStrYYYYMMDD >= pStart && curDateStrYYYYMMDD <= pEnd
        })

        if (leaveRow) {
          const jenis = leaveRow.jenis_pengajuan || ''
          if (jenis === 'Absensi Manual' || jenis.toLowerCase().includes('manual')) {
            if (!statusByDay[i]) {
              statusByDay[i] = 'H'
            }
          } else if (jenis === 'Cuti Tahunan' || jenis.toLowerCase().includes('cuti')) {
            statusByDay[i] = 'C'
          } else if (jenis === 'Izin Sakit' || jenis.toLowerCase().includes('sakit')) {
            statusByDay[i] = 'S'
          } else {
            statusByDay[i] = 'I'
          }
        }
      }

      let countH = 0
      let countT = 0
      let countI = 0
      let countC = 0
      let countS = 0
      let countA = 0

      for (let i = 1; i <= daysInMonth; i++) {
        const dObj = new Date(year, monthIndex, i)
        const isSun = dObj.getDay() === 0
        const isHol = getHolidayName(i) !== null
        if (isSun || isHol) continue

        const code = statusByDay[i]
        if (code === 'H') {
          countH++
        } else if (code === 'T') {
          countH++
          countT++
        } else if (code === 'I') {
          countI++
        } else if (code === 'C') {
          countC++
        } else if (code === 'S') {
          countS++
        } else {
          const checkDate = new Date(year, monthIndex, i)
          if (checkDate <= new Date()) {
            countA++
          }
        }
      }

      const vals = [
        namaUpper,
        karyawan.jabatan || 'STAF'
      ]

      for (let i = 1; i <= daysInMonth; i++) {
        const dObj = new Date(year, monthIndex, i)
        const isSun = dObj.getDay() === 0
        const holName = getHolidayName(i)

        if (isSun || holName) {
          if (index === 0) {
            vals.push(isSun ? "Minggu" : "Libur Nasional")
          } else {
            vals.push("")
          }
        } else {
          vals.push(statusByDay[i] || '')
        }
      }

      vals.push(countH)
      vals.push(countH)
      vals.push(countT)
      vals.push(countI)
      vals.push(countC)
      vals.push(countS)
      vals.push(countA)

      dataRow.values = vals

      for (let col = 1; col <= lastColIndex + 1; col++) {
        const cell = dataRow.getCell(col)
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF000000' } }
        cell.border = thinBorder
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }

        if (col === 1) {
          cell.font.bold = true
          cell.alignment.horizontal = 'left'
        }

        if (col >= 3 && col <= 2 + daysInMonth) {
          const dNum = col - 2
          const dObj = new Date(year, monthIndex, dNum)
          const isSun = dObj.getDay() === 0
          const holName = getHolidayName(dNum)

          if (isSun || holName) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }
            cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
            cell.alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' }
          } else {
            const code = cell.value
            if (code) {
              cell.font.bold = true
              let bg = 'FFFFFFFF'
              let textCol = 'FF000000'
              if (code === 'H') {
                bg = 'FF00B050'
                textCol = 'FFFFFFFF'
              } else if (code === 'T') {
                bg = 'FFFF6F00'
                textCol = 'FFFFFFFF'
              } else if (code === 'I') {
                bg = 'FFFFFF00'
                textCol = 'FF000000'
              } else if (code === 'C') {
                bg = 'FF00B0F0'
                textCol = 'FFFFFFFF'
              } else if (code === 'S') {
                bg = 'FFFFC000'
                textCol = 'FF000000'
              } else if (code === 'A') {
                bg = 'FFFF0000'
                textCol = 'FFFFFFFF'
              }
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
              cell.font.color = { argb: textCol }
            }
          }
        }

        if (col > 2 + daysInMonth) {
          cell.font.bold = true
        }
      }

      currentRowNum++
    })

    // Apply vertical merges for Sundays/Holidays
    if (listKaryawan.length > 0) {
      for (let i = 1; i <= daysInMonth; i++) {
        const isSun = new Date(year, monthIndex, i).getDay() === 0
        const holName = getHolidayName(i)

        if (isSun || holName) {
          const colLetter = colIndexToLabel(1 + i)
          worksheet.mergeCells(`${colLetter}5:${colLetter}${5 + listKaryawan.length - 1}`)
        }
      }
    }

    // Legend
    worksheet.getRow(currentRowNum).height = 15
    currentRowNum++

    const legendTitleRow = worksheet.getRow(currentRowNum)
    legendTitleRow.height = 20
    legendTitleRow.getCell(1).value = 'Keterangan:'
    legendTitleRow.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true }
    currentRowNum++

    const monthlyLegends = [
      { code: 'H', desc: 'Hadir', bg: 'FF00B050', text: 'FFFFFFFF' },
      { code: 'T', desc: 'Terlambat', bg: 'FFFF6F00', text: 'FFFFFFFF' },
      { code: 'I', desc: 'Izin', bg: 'FFFFFF00', text: 'FF000000' },
      { code: 'C', desc: 'Cuti', bg: 'FF00B0F0', text: 'FFFFFFFF' },
      { code: 'S', desc: 'Sakit', bg: 'FFFFC000', text: 'FF000000' },
      { code: 'A', desc: 'Alpha', bg: 'FFFF0000', text: 'FFFFFFFF' }
    ]

    monthlyLegends.forEach(l => {
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
    worksheet.getColumn(1).width = 22 // Nama Karyawan
    worksheet.getColumn(2).width = 16 // Jabatan
    for (let i = 3; i <= 2 + daysInMonth; i++) {
      worksheet.getColumn(i).width = 5 // Days (small column)
    }
    worksheet.getColumn(2 + daysInMonth + 1).width = 16 // Jumlah Hari Kerja
    for (let i = 2 + daysInMonth + 2; i <= lastColIndex + 1; i++) {
      worksheet.getColumn(i).width = 6 // H, T, I, C, S, A
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const filename = `Rekap_Absensi_AGRA_${filterBulan.value.replace(' ', '_')}.xlsx`
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(link.href)

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
  width: 100%;
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
.premium-container {
  max-width: 1200px;
  width: 100%;
}
</style>
