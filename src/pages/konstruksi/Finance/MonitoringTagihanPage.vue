<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <!-- =====================================================================================
         HEADER SECTION
         ===================================================================================== -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="indigo-10"
            icon="arrow_back"
            @click="$router.back()"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
              Monitoring Keuangan Proyek
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Project Financial Dashboard</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Pantau seluruh nilai kontrak proyek, status pekerjaan, dan progress penagihan dari
              Master Proyek.
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
        <div class="text-caption text-grey-6 q-mb-xs uppercase tracking-widest font-bold">
          Status Sinkronisasi
        </div>
        <q-badge color="positive" class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12">
          <q-icon name="cloud_done" size="xs" class="q-mr-sm" />
          MASTER PROYEK CONNECTED
        </q-badge>
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI FINANCE
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Proyek Aktif -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                PROYEK AKTIF
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                {{ tagihanAktif.length }} <span class="text-subtitle1 text-weight-medium">PRJ</span>
              </div>
            </div>
            <div
              class="bg-indigo-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="foundation" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Proyek Selesai/Lunas -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                PROYEK LUNAS
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-positive">
                {{ tagihanLunas.length }} <span class="text-subtitle1 text-weight-medium">PRJ</span>
              </div>
            </div>
            <div
              class="bg-green-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="task_alt" color="positive" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Proyek Jatuh Tempo -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                JATUH TEMPO
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-negative">
                {{ tagihanOverdue.length }}
                <span class="text-subtitle1 text-weight-medium">PRJ</span>
              </div>
            </div>
            <div
              class="bg-red-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="warning" color="negative" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total Nilai Proyek Keseluruhan -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="rounded-20 border-subtle bg-indigo-10 text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline text-indigo-2 leading-none text-weight-bold tracking-widest"
              >
                TOTAL VALUASI
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                Rp {{ formatCompact(totalOutstanding) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-2"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="account_balance_wallet" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         SEARCH & FILTER AREA
         ===================================================================================== -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-indigo-thin">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              rounded
              placeholder="Cari Nama Proyek, SPK, atau Klien..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
              <template v-slot:append v-if="searchQuery">
                <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space />
          <div class="col-12 col-md-auto">
            <q-btn-toggle
              v-model="statusFilter"
              flat
              rounded
              toggle-color="indigo-10"
              color="grey-7"
              class="bg-grey-1 text-weight-bold"
              :options="[
                { label: 'Semua', value: 'ALL' },
                { label: 'Proyek Aktif', value: 'AKTIF' },
                { label: 'Jatuh Tempo', value: 'OVERDUE' },
                { label: 'Lunas', value: 'LUNAS' },
              ]"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE DATA (MURNI DATA PROYEK)
         ===================================================================================== -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-indigo-thin"
    >
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        binary-state-sort
        class="finance-table"
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-blue-grey-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase font-11 tracking-widest"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="openDetail(props.row)"
          >
            <!-- IDENTITAS PROYEK -->
            <q-td key="proyek">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="36px"
                  color="indigo-1"
                  text-color="indigo-10"
                  icon="foundation"
                  class="q-mr-md shadow-sm rounded-12"
                />
                <div>
                  <div
                    class="text-weight-bold text-indigo-10 text-subtitle2 leading-none q-mb-xs uppercase"
                  >
                    {{ props.row.nama_proyek }}
                  </div>
                  <div class="text-caption text-blue-grey-8 font-10 uppercase text-weight-bold">
                    KLIEN: {{ props.row.konsumen }}
                  </div>
                </div>
              </div>
            </q-td>

            <!-- REFERENSI SPK -->
            <q-td key="spk">
              <div class="text-weight-bold text-blue-grey-9 uppercase font-11">
                {{ props.row.nomor_spk }}
              </div>
            </q-td>

            <!-- TIMELINE -->
            <q-td key="timeline">
              <div class="text-caption text-grey-8 font-11">
                Tgl Mulai:
                <span class="text-weight-bold">{{ formatDateIndo(props.row.tgl_mulai) }}</span>
              </div>
              <div
                class="text-caption font-11"
                :class="
                  props.row.status === 'Jatuh Tempo'
                    ? 'text-negative text-weight-bold'
                    : 'text-grey-8'
                "
              >
                Tempo:
                <span class="text-weight-bold">{{ formatDateIndo(props.row.jatuh_tempo) }}</span>
              </div>
            </q-td>

            <!-- NILAI PROYEK (GRAND TOTAL) -->
            <q-td key="nominal" class="text-right">
              <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                Rp {{ (props.row.grand_total || 0).toLocaleString('id-ID') }}
              </div>
              <div class="text-caption text-grey-6 font-10">Total Valuasi</div>
            </q-td>

            <!-- PROGRESS PEMBAYARAN -->
            <q-td key="progress" style="width: 250px">
              <div class="full-width">
                <div class="row items-center justify-between q-mb-xs font-10">
                  <span class="text-weight-bold text-primary">Telah Dibayar</span>
                  <span class="text-weight-bolder text-indigo-10"
                    >Rp {{ (props.row.total_dibayar || 0).toLocaleString('id-ID') }}</span
                  >
                </div>
                <q-linear-progress
                  :value="(props.row.total_dibayar || 0) / (props.row.grand_total || 1)"
                  size="8px"
                  rounded
                  :color="
                    (props.row.total_dibayar || 0) >= (props.row.grand_total || 0)
                      ? 'positive'
                      : 'primary'
                  "
                  track-color="blue-1"
                />
                <div
                  class="text-right q-mt-xs font-10 text-negative text-weight-bold"
                  v-if="(props.row.grand_total || 0) > (props.row.total_dibayar || 0)"
                >
                  Sisa: Rp
                  {{
                    ((props.row.grand_total || 0) - (props.row.total_dibayar || 0)).toLocaleString(
                      'id-ID',
                    )
                  }}
                </div>
              </div>
            </q-td>

            <!-- STATUS -->
            <q-td key="status" class="text-center">
              <q-chip
                dense
                :color="getStatusColor(props.row.status).bg"
                :text-color="getStatusColor(props.row.status).text"
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>

            <!-- AKSI DETAIL -->
            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                flat
                round
                color="indigo-10"
                icon="visibility"
                size="sm"
                @click="openDetail(props.row)"
              >
                <q-tooltip>Lihat Rincian Keuangan</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="foundation" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Belum ada data proyek di Master Data.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG DETAIL KEUANGAN PROYEK (FULLSCREEN WITH PDF PREVIEW)
         ===================================================================================== -->
    <q-dialog
      v-model="showDetail"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(8px)"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink no-print">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title>
            <div class="text-weight-bold uppercase tracking-widest font-11">
              Rincian Keuangan Proyek
            </div>
            <div class="text-caption opacity-70">Proyek: {{ selectedProject?.nama_proyek }}</div>
          </q-toolbar-title>

          <q-btn
            unelevated
            color="white"
            text-color="indigo-10"
            icon="picture_as_pdf"
            label="EXPORT PDF"
            class="q-mr-md text-weight-black rounded-12 shadow-2"
            @click="exportToPDF"
          />
        </q-toolbar>

        <q-scroll-area class="col q-pa-md q-pa-lg-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <!-- PDF TARGET CONTAINER -->
              <div id="invoice-pdf-target" class="pdf-container shadow-24" v-if="selectedProject">
                <div class="row justify-between items-end q-mb-lg border-bottom-subtle q-pb-md">
                  <div>
                    <div class="text-h3 text-weight-black text-indigo-10 tracking-widest uppercase">
                      DETAIL KEUANGAN
                    </div>
                    <div class="text-subtitle1 text-grey-7 font-bold q-mt-xs">
                      Klien: {{ selectedProject.konsumen }}
                    </div>
                  </div>
                  <div class="text-right">
                    <q-chip
                      :color="getStatusColor(selectedProject.status).bg"
                      :text-color="getStatusColor(selectedProject.status).text"
                      class="text-weight-bold font-11 uppercase shadow-sm"
                      size="md"
                    >
                      STATUS: {{ selectedProject.status }}
                    </q-chip>
                  </div>
                </div>

                <div class="row q-col-gutter-xl q-mb-xl">
                  <!-- INFO KIRI -->
                  <div class="col-12 col-md-6">
                    <div class="text-overline text-grey-6 text-bold tracking-widest q-mb-xs">
                      INFORMASI PROYEK & KONTRAK
                    </div>
                    <table class="info-table full-width">
                      <tr>
                        <td width="130" class="text-grey-8">Nama Proyek</td>
                        <td class="text-weight-bold text-indigo-10 uppercase">
                          : {{ selectedProject.nama_proyek }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-8">Nomor SPK</td>
                        <td class="text-weight-bold uppercase">
                          : {{ selectedProject.nomor_spk }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <div style="border-bottom: 1px solid #e0e0e0; margin: 12px 0"></div>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-8">Lokasi Proyek</td>
                        <td class="text-weight-bold">: {{ selectedProject.alamat }}</td>
                      </tr>
                      <tr>
                        <td class="text-grey-8">Mulai Proyek</td>
                        <td class="text-weight-bold">
                          : {{ formatDateIndo(selectedProject.tgl_mulai) }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-8">Target Selesai</td>
                        <td
                          class="text-weight-bold"
                          :class="selectedProject.status === 'Jatuh Tempo' ? 'text-negative' : ''"
                        >
                          : {{ formatDateIndo(selectedProject.jatuh_tempo) }}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- INFO KANAN (FINANCIAL BOX) -->
                  <div class="col-12 col-md-6">
                    <q-card
                      flat
                      class="bg-indigo-1 rounded-12 border-indigo-thin h-full flex column justify-center q-pa-lg"
                    >
                      <div class="text-overline text-indigo-10 text-bold tracking-widest q-mb-sm">
                        SUMMARY KEUANGAN (IDR)
                      </div>
                      <div class="row justify-between items-center q-mb-xs">
                        <span class="text-grey-8">Total Nilai Kontrak</span>
                        <span class="text-weight-bold text-subtitle1"
                          >Rp {{ (selectedProject.grand_total || 0).toLocaleString('id-ID') }}</span
                        >
                      </div>
                      <div class="row justify-between items-center q-mb-md">
                        <span class="text-grey-8">Telah Dibayar (Termin Masuk)</span>
                        <span class="text-weight-bold text-positive"
                          >Rp
                          {{ (selectedProject.total_dibayar || 0).toLocaleString('id-ID') }}</span
                        >
                      </div>
                      <q-separator class="bg-indigo-2 q-mb-sm" />
                      <div class="row justify-between items-center">
                        <span class="text-indigo-10 text-weight-bold uppercase"
                          >Sisa Piutang (Sisa Tagihan)</span
                        >
                        <span
                          class="text-weight-black text-h5"
                          :class="
                            selectedProject.grand_total - selectedProject.total_dibayar > 0
                              ? 'text-negative'
                              : 'text-positive'
                          "
                        >
                          Rp
                          {{
                            (
                              (selectedProject.grand_total || 0) -
                              (selectedProject.total_dibayar || 0)
                            ).toLocaleString('id-ID')
                          }}
                        </span>
                      </div>
                    </q-card>
                  </div>
                </div>

                <!-- NOMINAL BREAKDOWN (BILL OF QUANTITY) -->
                <div
                  class="text-h6 text-indigo-10 text-weight-bold uppercase tracking-widest q-mb-sm"
                >
                  Rincian Bill of Quantity (BOQ) Proyek
                </div>
                <table class="pdf-table full-width q-mb-xl">
                  <thead>
                    <tr class="bg-blue-grey-10 text-white">
                      <th class="text-center" width="50">NO</th>
                      <th class="text-left">URAIAN PEKERJAAN (BOQ)</th>
                      <th class="text-center" width="80">VOL</th>
                      <th class="text-right" width="150">HARGA SATUAN</th>
                      <th class="text-right" width="180">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, i) in selectedProject.items" :key="i">
                      <td class="text-center font-bold">{{ i + 1 }}</td>
                      <td class="text-left font-bold text-blue-grey-9 uppercase">
                        {{ item.deskripsi || item.nama_barang || '-' }}
                      </td>
                      <td class="text-center">
                        {{ item.volume || item.qty || 0 }} {{ item.satuan || '' }}
                      </td>
                      <td class="text-right">
                        Rp {{ (item.harga_satuan || 0).toLocaleString('id-ID') }}
                      </td>
                      <td class="text-right text-weight-bold text-indigo-10">
                        Rp
                        {{
                          (
                            (item.volume || item.qty || 0) * (item.harga_satuan || 0)
                          ).toLocaleString('id-ID')
                        }}
                      </td>
                    </tr>
                    <tr v-if="!selectedProject.items || selectedProject.items.length === 0">
                      <td colspan="5" class="text-center text-grey-6 italic">
                        Tidak ada rincian item BOQ di dalam master SPK. (Hanya Total Nilai)
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="bg-grey-2">
                      <td colspan="4" class="text-right text-weight-black uppercase">
                        GRAND TOTAL VALUASI PROYEK
                      </td>
                      <td class="text-right text-weight-black text-h6 text-indigo-10">
                        Rp {{ (selectedProject.grand_total || 0).toLocaleString('id-ID') }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <!-- End PDF Container -->
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()

// State Data Master
const masterProyek = ref([])
const masterSpk = ref([])

// State UI
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('ALL')
const showDetail = ref(false)
const selectedProject = ref(null)

let unsubProyek = null
let unsubSpk = null

// Columns Setup (Sesuai dengan keinginan Anda: Identitas, Referensi, Timeline, Nominal, Progress, Status, Aksi)
const columns = [
  {
    name: 'proyek',
    align: 'left',
    label: 'IDENTITAS PROYEK & KLIEN',
    field: 'nama_proyek',
    sortable: true,
  },
  { name: 'spk', align: 'left', label: 'REFERENSI SPK', field: 'nomor_spk', sortable: true },
  { name: 'timeline', align: 'left', label: 'TIMELINE PROYEK', field: 'tgl_mulai', sortable: true },
  { name: 'nominal', align: 'right', label: 'NILAI KONTRAK', field: 'grand_total', sortable: true },
  {
    name: 'progress',
    align: 'left',
    label: 'PROGRESS PEMBAYARAN',
    field: 'total_dibayar',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'DETAIL', field: 'id' },
]

// Computed Data Mapping - Murni Tarikan dari `proyek` dan di-JOIN dengan `spk_customer`
const mappedRows = computed(() => {
  return masterProyek.value
    .map((proj) => {
      // Tarik SPK yang sesuai dengan ID proyek ini
      const spks = masterSpk.value.filter((s) => s.projectId === proj.id)

      let nomor_spk = '-'
      let grand_total = 0
      let total_dibayar = proj.total_dibayar || 0 // Default 0
      let tgl_mulai = '-'
      let jatuh_tempo = '-'
      let items = []

      if (spks.length > 0) {
        nomor_spk =
          spks
            .map((s) => s.nomor_spk)
            .filter(Boolean)
            .join(', ') || '-'
        grand_total = spks.reduce((sum, s) => sum + (Number(s.nilai_total) || 0), 0)
        total_dibayar = spks.reduce((sum, s) => sum + (Number(s.total_dibayar) || 0), 0) // Jika suatu saat ada input total_dibayar

        // Ambil Timeline (Paling awal s/d Paling Akhir)
        const starts = spks
          .map((s) => s.tgl_mulai)
          .filter(Boolean)
          .sort()
        if (starts.length) tgl_mulai = starts[0]

        const ends = spks
          .map((s) => s.tgl_akhir)
          .filter(Boolean)
          .sort()
          .reverse()
        if (ends.length) jatuh_tempo = ends[0]

        // Kumpulkan item BOQ untuk PDF
        spks.forEach((s) => {
          if (s.groups) {
            s.groups.forEach((g) => {
              if (g.items) {
                g.items.forEach((i) => {
                  if (!i.is_header) items.push(i)
                })
              }
            })
          }
        })
      }

      // Kalkulasi Status Proyek
      let status = 'Aktif'
      const today = new Date().toISOString().substr(0, 10)
      if (grand_total > 0 && total_dibayar >= grand_total) {
        status = 'Lunas'
      } else if (jatuh_tempo !== '-' && jatuh_tempo < today) {
        status = 'Jatuh Tempo'
      }

      return {
        id: proj.id,
        nama_proyek: proj.nama || 'Tanpa Nama',
        konsumen: proj.konsumen || '-',
        alamat: proj.alamat || '-',
        nomor_spk,
        tgl_mulai,
        jatuh_tempo,
        grand_total,
        total_dibayar,
        status,
        items,
        // Search string untuk mempermudah pencarian
        search_string: `${proj.nama} ${nomor_spk} ${proj.konsumen}`.toLowerCase(),
      }
    })
    .sort((a, b) => b.grand_total - a.grand_total)
})

// KPI Computed
const tagihanAktif = computed(() => mappedRows.value.filter((r) => r.status === 'Aktif'))
const tagihanLunas = computed(() => mappedRows.value.filter((r) => r.status === 'Lunas'))
const tagihanOverdue = computed(() => mappedRows.value.filter((r) => r.status === 'Jatuh Tempo'))

const totalOutstanding = computed(() => {
  return mappedRows.value.reduce((sum, r) => sum + r.grand_total, 0)
})

// Filtered List for Table
const filteredRows = computed(() => {
  let result = mappedRows.value

  // Status Filter
  if (statusFilter.value === 'OUTSTANDING') result = result.filter((r) => r.status === 'Aktif')
  else if (statusFilter.value === 'LUNAS') result = result.filter((r) => r.status === 'Lunas')
  else if (statusFilter.value === 'OVERDUE')
    result = result.filter((r) => r.status === 'Jatuh Tempo')

  // Search Filter
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    result = result.filter((r) => r.search_string.includes(lower))
  }
  return result
})

// Fetch Data (MURNI DARI MASTER PROYEK DAN SPK SAJA - TIDAK ADA PURCHASE ORDER/TAGIHAN PO)
const fetchData = () => {
  loading.value = true

  // 1. Tarik Data SPK Kontrak
  unsubSpk = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    masterSpk.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 2. Tarik Data Master Proyek Utama
  unsubProyek = onSnapshot(
    collection(db, 'proyek'),
    (snap) => {
      masterProyek.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Listen Error Proyek:', err)
      loading.value = false
    },
  )
}

// Logic Actions
const openDetail = (row) => {
  selectedProject.value = row
  showDetail.value = true
}

// Utils
const formatDateIndo = (d) => {
  if (!d || d === '-') return '-'
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + ' M'
  if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Aktif':
      return { bg: 'blue-1', text: 'blue-10' }
    case 'Lunas':
      return { bg: 'green-2', text: 'green-10' }
    case 'Jatuh Tempo':
      return { bg: 'red-2', text: 'red-10' }
    default:
      return { bg: 'grey-2', text: 'grey-8' }
  }
}

const exportToPDF = () => {
  const element = document.getElementById('invoice-pdf-target')
  const fileName = `Valuasi_Proyek_${selectedProject.value.nama_proyek.replace(/\s+/g, '_')}.pdf`

  const opt = {
    margin: 10,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }

  $q.loading.show({ message: 'Generating Professional PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      $q.loading.hide()
    })
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubSpk) unsubSpk()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(26, 35, 126, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.finance-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.1) !important;
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.6s ease-out both;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.uppercase {
  text-transform: uppercase;
}
.font-11 {
  font-size: 11px;
}
.font-10 {
  font-size: 10px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.opacity-80 {
  opacity: 0.8;
}
.opacity-70 {
  opacity: 0.7;
}
.h-full {
  height: 100%;
}

/* PDF Target Styling (Perfectionist Paper) */
.pdf-container {
  background: white;
  width: 100%;
  max-width: 210mm;
  min-height: 200mm;
  padding: 40px;
  margin: 0 auto;
  color: black;
  box-sizing: border-box;
}

.info-table td {
  padding: 4px 0;
  font-size: 13.5px;
}

.pdf-table {
  border-collapse: collapse;
  border: 1px solid #ddd;
}
.pdf-table th,
.pdf-table td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  font-size: 13.5px;
}

@media print {
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  .pdf-container {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
    padding: 15mm !important;
  }
}
</style>
