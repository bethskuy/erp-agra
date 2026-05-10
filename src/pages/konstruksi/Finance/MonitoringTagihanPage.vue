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
              Monitoring Tagihan
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Account Payable Dashboard</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Pantau seluruh invoice masuk, status pembayaran, dan sisa hutang (outstanding) vendor.
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
          REAL-TIME CONNECTED
        </q-badge>
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI FINANCE
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Tagihan Aktif -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                TAGIHAN AKTIF
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                {{ tagihanAktif.length }} <span class="text-subtitle1 text-weight-medium">INV</span>
              </div>
            </div>
            <div
              class="bg-indigo-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="receipt_long" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tagihan Lunas -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                INVOICE LUNAS
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-positive">
                {{ tagihanLunas.length }} <span class="text-subtitle1 text-weight-medium">INV</span>
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

      <!-- Tagihan Jatuh Tempo -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                JATUH TEMPO
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-negative">
                {{ tagihanOverdue.length }}
                <span class="text-subtitle1 text-weight-medium">INV</span>
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

      <!-- Sisa Hutang Keseluruhan -->
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
                TOTAL OUTSTANDING
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
              placeholder="Cari No. Invoice, Supplier, atau Proyek..."
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
                { label: 'Belum Lunas', value: 'OUTSTANDING' },
                { label: 'Jatuh Tempo', value: 'OVERDUE' },
                { label: 'Lunas', value: 'LUNAS' },
              ]"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE DATA
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
            <q-td key="invoice">
              <div class="text-weight-bold text-indigo-10 text-subtitle2 leading-none q-mb-xs">
                {{ props.row.nomor_invoice }}
              </div>
              <div class="text-caption text-blue-grey-8 font-10 uppercase text-weight-bold">
                {{ props.row.supplier_nama }}
              </div>
            </q-td>

            <q-td key="proyek">
              <div class="text-weight-bold text-blue-grey-9 uppercase font-11">
                {{ props.row.proyek_nama || 'NON PROYEK' }}
              </div>
              <div class="text-caption text-grey-6 font-10" v-if="props.row.po_nomor">
                Ref PO: {{ props.row.po_nomor }}
              </div>
            </q-td>

            <q-td key="timeline">
              <div class="text-caption text-grey-8 font-11">
                Tgl:
                <span class="text-weight-bold">{{
                  formatDateIndo(props.row.tanggal_invoice)
                }}</span>
              </div>
              <div
                class="text-caption font-11"
                :class="isOverdue(props.row) ? 'text-negative text-weight-bold' : 'text-grey-8'"
              >
                Tempo:
                <span class="text-weight-bold">{{ formatDateIndo(props.row.jatuh_tempo) }}</span>
              </div>
            </q-td>

            <q-td key="nominal" class="text-right">
              <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                Rp {{ (props.row.grand_total || 0).toLocaleString() }}
              </div>
              <div class="text-caption text-grey-6 font-10">Total Tagihan</div>
            </q-td>

            <!-- PROGRESS BAR PEMBAYARAN -->
            <q-td key="progress" style="width: 250px">
              <div class="full-width">
                <div class="row items-center justify-between q-mb-xs font-10">
                  <span class="text-weight-bold text-primary">Telah Dibayar</span>
                  <span class="text-weight-bolder text-indigo-10"
                    >Rp {{ (props.row.total_dibayar || 0).toLocaleString() }}</span
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
                    ((props.row.grand_total || 0) - (props.row.total_dibayar || 0)).toLocaleString()
                  }}
                </div>
              </div>
            </q-td>

            <q-td key="status" class="text-center">
              <q-chip
                dense
                :color="isOverdue(props.row) ? 'red-2' : getStatusColor(props.row.status).bg"
                :text-color="
                  isOverdue(props.row) ? 'red-10' : getStatusColor(props.row.status).text
                "
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
              >
                {{ isOverdue(props.row) ? 'OVERDUE' : props.row.status }}
              </q-chip>
            </q-td>

            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                flat
                round
                color="indigo-10"
                icon="visibility"
                size="sm"
                @click="openDetail(props.row)"
              >
                <q-tooltip>Lihat Detail Tagihan</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="receipt_long" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">
              Bagus! Tidak ada data tagihan yang sesuai.
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG DETAIL TAGIHAN (FULLSCREEN)
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
              Rincian Dokumen Tagihan
            </div>
            <div class="text-caption opacity-70">Invoice: {{ selectedTagihan?.nomor_invoice }}</div>
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
              <div id="invoice-pdf-target" class="pdf-container shadow-24" v-if="selectedTagihan">
                <div class="row justify-between items-end q-mb-lg border-bottom-subtle q-pb-md">
                  <div>
                    <div class="text-h3 text-weight-black text-indigo-10 tracking-widest uppercase">
                      DETAIL TAGIHAN
                    </div>
                    <div class="text-subtitle1 text-grey-7 font-bold q-mt-xs">
                      Vendor: {{ selectedTagihan.supplier_nama }}
                    </div>
                  </div>
                  <div class="text-right">
                    <q-chip
                      :color="
                        isOverdue(selectedTagihan)
                          ? 'red-2'
                          : getStatusColor(selectedTagihan.status).bg
                      "
                      :text-color="
                        isOverdue(selectedTagihan)
                          ? 'red-10'
                          : getStatusColor(selectedTagihan.status).text
                      "
                      class="text-weight-bold font-11 uppercase shadow-sm"
                      size="md"
                    >
                      STATUS:
                      {{
                        isOverdue(selectedTagihan)
                          ? 'JATUH TEMPO (OVERDUE)'
                          : selectedTagihan.status
                      }}
                    </q-chip>
                  </div>
                </div>

                <div class="row q-col-gutter-xl q-mb-xl">
                  <!-- INFO KIRI -->
                  <div class="col-12 col-md-6">
                    <div class="text-overline text-grey-6 text-bold tracking-widest q-mb-xs">
                      INFORMASI DOKUMEN
                    </div>
                    <table class="info-table full-width">
                      <tr>
                        <td width="130" class="text-grey-8">No. Invoice</td>
                        <td class="text-weight-bold text-indigo-10">
                          : {{ selectedTagihan.nomor_invoice }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-8">Tanggal Terbit</td>
                        <td class="text-weight-bold">
                          : {{ formatDateIndo(selectedReq?.tanggal_invoice) }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-8">Jatuh Tempo</td>
                        <td class="text-weight-bold text-negative">
                          : {{ formatDateIndo(selectedReq?.jatuh_tempo) }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-8">Referensi PO</td>
                        <td class="text-weight-bold">
                          : {{ selectedTagihan.po_nomor || 'Tanpa PO' }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-8">Lokasi Proyek</td>
                        <td class="text-weight-bold uppercase">
                          : {{ selectedTagihan.proyek_nama || 'Non-Proyek' }}
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
                        SUMMARY HUTANG (IDR)
                      </div>
                      <div class="row justify-between items-center q-mb-xs">
                        <span class="text-grey-8">Total Nilai Tagihan</span>
                        <span class="text-weight-bold text-subtitle1"
                          >Rp {{ (selectedTagihan.grand_total || 0).toLocaleString() }}</span
                        >
                      </div>
                      <div class="row justify-between items-center q-mb-md">
                        <span class="text-grey-8">Telah Dibayar (Paid)</span>
                        <span class="text-weight-bold text-positive"
                          >- Rp {{ (selectedTagihan.total_dibayar || 0).toLocaleString() }}</span
                        >
                      </div>
                      <q-separator class="bg-indigo-2 q-mb-sm" />
                      <div class="row justify-between items-center">
                        <span class="text-indigo-10 text-weight-bold uppercase"
                          >Sisa Outstanding</span
                        >
                        <span class="text-weight-black text-h5 text-negative">
                          Rp
                          {{
                            (
                              (selectedTagihan.grand_total || 0) -
                              (selectedTagihan.total_dibayar || 0)
                            ).toLocaleString()
                          }}
                        </span>
                      </div>
                    </q-card>
                  </div>
                </div>

                <!-- TAX & NOMINAL BREAKDOWN -->
                <div
                  class="text-h6 text-indigo-10 text-weight-bold uppercase tracking-widest q-mb-sm"
                >
                  Rincian Pajak & Perhitungan
                </div>
                <table class="pdf-table full-width q-mb-xl">
                  <thead>
                    <tr class="bg-blue-grey-10 text-white">
                      <th class="text-left">URAIAN / KETERANGAN</th>
                      <th class="text-right" width="200">NILAI NOMINAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="text-left font-bold text-blue-grey-9">
                        {{ selectedTagihan.keterangan || 'Tagihan Vendor' }}
                      </td>
                      <td class="text-right">
                        Rp {{ (selectedTagihan.nilai_dpp || 0).toLocaleString() }}
                      </td>
                    </tr>
                    <tr v-if="selectedTagihan.ppn_persen > 0">
                      <td class="text-right italic text-grey-8">
                        Pajak Pertambahan Nilai (PPN) {{ selectedTagihan.ppn_persen }}%
                      </td>
                      <td class="text-right">
                        + Rp {{ (selectedTagihan.ppn_nominal || 0).toLocaleString() }}
                      </td>
                    </tr>
                    <tr v-if="selectedTagihan.pph_persen > 0">
                      <td class="text-right italic text-grey-8">
                        Pajak Penghasilan (PPh) {{ selectedTagihan.pph_persen }}%
                      </td>
                      <td class="text-right text-negative">
                        - Rp {{ (selectedTagihan.pph_nominal || 0).toLocaleString() }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="bg-grey-2">
                      <td class="text-right text-weight-black uppercase">GRAND TOTAL INVOICE</td>
                      <td class="text-right text-weight-black text-h6 text-indigo-10">
                        Rp {{ (selectedTagihan.grand_total || 0).toLocaleString() }}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <!-- LAMPIRAN (Di UI Saja, disembunyikan saat PDF) -->
                <div class="no-print" v-if="selectedTagihan.lampiran?.length > 0">
                  <div
                    class="text-h6 text-indigo-10 text-weight-bold uppercase tracking-widest q-mb-sm"
                  >
                    Dokumen Pendukung (Faktur/Surat Jalan)
                  </div>
                  <div class="row q-col-gutter-md">
                    <div
                      class="col-12 col-sm-6 col-md-4"
                      v-for="(lamp, i) in selectedTagihan.lampiran"
                      :key="i"
                    >
                      <q-card
                        flat
                        bordered
                        class="rounded-12 bg-white hover-shadow transition-all border-subtle"
                      >
                        <q-card-section class="q-pa-md text-center">
                          <q-icon
                            name="description"
                            size="48px"
                            color="blue-grey-4"
                            class="q-mb-sm"
                          />
                          <div class="text-weight-bold text-blue-grey-10 ellipsis">
                            {{ lamp.label || 'Dokumen ' + (i + 1) }}
                          </div>
                          <q-btn
                            outline
                            color="primary"
                            label="Buka Dokumen"
                            size="sm"
                            class="q-mt-md rounded-borders full-width"
                            @click="openLink(lamp.url || lamp.base64)"
                          />
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
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
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()

// State
const rows = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('ALL')
const showDetail = ref(false)
const selectedTagihan = ref(null)

let unsubTagihan = null

// Columns
const columns = [
  {
    name: 'invoice',
    align: 'left',
    label: 'NO. INVOICE & VENDOR',
    field: 'nomor_invoice',
    sortable: true,
  },
  {
    name: 'referensi',
    align: 'left',
    label: 'PROYEK & REFF',
    field: 'proyek_nama',
    sortable: true,
  },
  {
    name: 'timeline',
    align: 'left',
    label: 'TANGGAL & TEMPO',
    field: 'tanggal_invoice',
    sortable: true,
  },
  { name: 'nominal', align: 'right', label: 'GRAND TOTAL', field: 'grand_total', sortable: true },
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

// Computed Data & KPI
const tagihanAktif = computed(() =>
  rows.value.filter((r) => r.status === 'Menunggu Pembayaran' || r.status === 'Dibayar Sebagian'),
)
const tagihanLunas = computed(() => rows.value.filter((r) => r.status === 'Lunas'))

const tagihanOverdue = computed(() => {
  const today = new Date().toISOString().substr(0, 10)
  return rows.value.filter((r) => r.jatuh_tempo < today && r.status !== 'Lunas')
})

const totalOutstanding = computed(() => {
  return tagihanAktif.value.reduce(
    (sum, r) => sum + ((r.grand_total || 0) - (r.total_dibayar || 0)),
    0,
  )
})

const filteredRows = computed(() => {
  let result = rows.value

  // Status Filter
  if (statusFilter.value === 'OUTSTANDING')
    result = result.filter(
      (r) => r.status === 'Menunggu Pembayaran' || r.status === 'Dibayar Sebagian',
    )
  else if (statusFilter.value === 'LUNAS') result = result.filter((r) => r.status === 'Lunas')
  else if (statusFilter.value === 'OVERDUE') result = result.filter((r) => isOverdue(r))

  // Search Filter
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.nomor_invoice?.toLowerCase().includes(lower) ||
        r.supplier_nama?.toLowerCase().includes(lower) ||
        r.proyek_nama?.toLowerCase().includes(lower),
    )
  }
  return result
})

// Fetch Data
const fetchData = () => {
  loading.value = true
  const q = query(collection(db, 'finance_tagihan'), orderBy('createdAt', 'desc'))
  unsubTagihan = onSnapshot(
    q,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Listen Error:', err)
      loading.value = false
    },
  )
}

// Logic Actions
const openDetail = (row) => {
  selectedTagihan.value = row
  showDetail.value = true
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

const isOverdue = (row) => {
  if (row.status === 'Lunas') return false
  const today = new Date().toISOString().substr(0, 10)
  return row.jatuh_tempo < today
}

// Utils
const formatDateIndo = (d) => {
  if (!d) return '-'
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
    case 'Draft':
      return { bg: 'grey-3', text: 'grey-8' }
    case 'Menunggu Pembayaran':
      return { bg: 'orange-2', text: 'orange-9' }
    case 'Dibayar Sebagian':
      return { bg: 'blue-2', text: 'blue-9' }
    case 'Lunas':
      return { bg: 'green-2', text: 'green-9' }
    default:
      return { bg: 'grey-3', text: 'grey-8' }
  }
}

const exportToPDF = () => {
  const element = document.getElementById('invoice-pdf-target')
  const fileName = `Monitoring_INV_${selectedTagihan.value.nomor_invoice.replace(/\//g, '-')}.pdf`

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
  if (unsubTagihan) unsubTagihan()
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
