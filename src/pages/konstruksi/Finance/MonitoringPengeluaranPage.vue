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
              Monitoring Pengeluaran
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Cash Disbursement & Expense Ledger</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Pantau seluruh arus kas keluar dari pengajuan pembayaran yang telah disetujui
              (Approved).
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
        <div class="text-caption text-grey-6 q-mb-xs uppercase tracking-widest font-bold">
          Status Buku Kas
        </div>
        <q-badge color="positive" class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12">
          <q-icon name="sync" size="xs" class="q-mr-sm animate-spin-slow" />
          AUTO-SYNC AKTIF
        </q-badge>
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI FINANCE (PENGELUARAN)
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Total Pengeluaran (All Time) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                TOTAL PENGELUARAN
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs text-negative">
                Rp {{ formatCompact(totalPengeluaran) }}
              </div>
            </div>
            <div
              class="bg-red-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="trending_down" color="negative" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Pengeluaran Bulan Ini -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                BULAN INI ({{ currentMonthName }})
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs text-orange-9">
                Rp {{ formatCompact(pengeluaranBulanIni) }}
              </div>
            </div>
            <div
              class="bg-orange-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="date_range" color="orange-9" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Volume Transaksi -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                VOLUME TRANSAKSI
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                {{ approvedExpenses.length }}
                <span class="text-subtitle1 text-weight-medium">TRX</span>
              </div>
            </div>
            <div
              class="bg-indigo-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="receipt" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Rata-rata Pengeluaran -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="rounded-20 border-subtle bg-blue-grey-10 text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline text-blue-grey-2 leading-none text-weight-bold tracking-widest"
              >
                RATA-RATA / TRANSAKSI
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                Rp {{ formatCompact(rataRataPengeluaran) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-2"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="analytics" color="blue-grey-10" size="28px" />
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
              placeholder="Cari Vendor, No. Voucher, Invoice..."
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
              v-model="metodeFilter"
              flat
              rounded
              toggle-color="indigo-10"
              color="grey-7"
              class="bg-grey-1 text-weight-bold border-subtle"
              :options="[
                { label: 'Semua Metode', value: 'ALL' },
                { label: 'Transfer Bank', value: 'Transfer Bank' },
                { label: 'Tunai / Cash', value: 'Tunai / Cash' },
                { label: 'Lainnya', value: 'Lainnya' },
              ]"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE DATA (KAS KELUAR)
         ===================================================================================== -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-indigo-thin"
    >
      <q-table
        :rows="filteredExpenses"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        binary-state-sort
        class="finance-table"
        :pagination="{ rowsPerPage: 15 }"
        no-data-label="Belum ada catatan pengeluaran kas."
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
            @click="openVoucher(props.row)"
          >
            <q-td key="waktu">
              <div class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs">
                {{ formatDateIndo(props.row.approvedAt) }}
              </div>
              <div class="text-caption text-grey-6 font-10 uppercase">
                REQ: {{ props.row.nomor_req }}
              </div>
            </q-td>

            <q-td key="penerima">
              <div class="text-weight-bold text-indigo-10 uppercase font-11">
                {{ props.row.supplier_nama }}
              </div>
              <div class="text-caption text-grey-7 font-10">
                Inv Ref: {{ props.row.nomor_invoice || '-' }}
              </div>
            </q-td>

            <q-td key="metode" class="text-center">
              <q-chip
                dense
                :color="getMetodeColor(props.row.metode_bayar).bg"
                :text-color="getMetodeColor(props.row.metode_bayar).text"
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
              >
                <q-icon
                  :name="getMetodeColor(props.row.metode_bayar).icon"
                  class="q-mr-xs"
                  size="12px"
                />
                {{ props.row.metode_bayar }}
              </q-chip>
              <div
                class="text-caption text-grey-6 font-10 q-mt-xs"
                v-if="props.row.metode_bayar.includes('Transfer')"
              >
                {{ props.row.rek_bank }} - {{ props.row.rek_nomor }}
              </div>
            </q-td>

            <q-td key="keperluan" class="text-left" style="max-width: 250px">
              <div class="text-body2 text-blue-grey-8 ellipsis-2-lines italic">
                "{{ props.row.keperluan }}"
              </div>
            </q-td>

            <q-td key="nominal" class="text-right">
              <div class="text-weight-black text-negative text-subtitle1">
                - Rp {{ (props.row.nominal_pengajuan || 0).toLocaleString() }}
              </div>
            </q-td>

            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                flat
                round
                color="indigo-10"
                icon="receipt_long"
                size="sm"
                @click="openVoucher(props.row)"
              >
                <q-tooltip>Lihat Bukti Kas Keluar</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG BUKTI KAS KELUAR (VOUCHER) - EXPORTABLE PDF
         ===================================================================================== -->
    <q-dialog
      v-model="showVoucher"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(8px)"
    >
      <q-card class="bg-grey-3 column no-wrap">
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink no-print">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title>
            <div class="text-weight-bold uppercase tracking-widest font-11">
              Arsip Dokumen Keuangan
            </div>
            <div class="text-caption opacity-70">Bukti Kas Keluar</div>
          </q-toolbar-title>
          <q-btn
            unelevated
            color="white"
            text-color="indigo-10"
            icon="print"
            label="CETAK / PDF BUKTI"
            class="q-mr-md text-weight-black rounded-12 shadow-2"
            @click="exportVoucherToPDF"
          />
        </q-toolbar>

        <q-scroll-area class="col q-pa-md q-pa-lg-xl flex flex-center">
          <div class="row justify-center">
            <div class="col-12 col-md-11 col-xl-8">
              <!-- DOKUMEN BUKTI KAS KELUAR (TARGET PDF) -->
              <div id="voucher-pdf-target" class="voucher-paper shadow-24" v-if="selectedVoucher">
                <!-- Header & Kop -->
                <div class="row items-center justify-between q-mb-lg border-bottom-thick q-pb-md">
                  <div class="row items-center no-wrap">
                    <img
                      :src="compConfig.kopUrl || 'icons/logo-agra.png'"
                      class="voucher-logo q-mr-md"
                    />
                    <div class="column">
                      <div
                        class="text-h5 text-weight-black text-indigo-10 tracking-tighter leading-none"
                      >
                        {{ compConfig.nama_perusahaan || 'PT AGRA ABHINAYA PERKASA' }}
                      </div>
                      <div class="text-caption text-grey-8 font-bold uppercase tracking-widest">
                        {{
                          compConfig.slogan_perusahaan || 'General Construction & General Supplier'
                        }}
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-h4 text-weight-black text-indigo-10 uppercase tracking-widest">
                      BUKTI KAS KELUAR
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-grey-8 font-mono">
                      BKK / {{ selectedVoucher.nomor_req?.replace('PAY-', '') }}
                    </div>
                  </div>
                </div>

                <!-- Info Transaksi -->
                <div class="row q-col-gutter-lg q-mb-xl text-body2">
                  <div class="col-7">
                    <table class="voucher-info-table full-width">
                      <tr>
                        <td width="150" class="text-grey-7 font-bold">Dibayarkan Kepada</td>
                        <td width="20">:</td>
                        <td class="text-weight-bolder text-uppercase text-subtitle1">
                          {{ selectedVoucher.supplier_nama }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Referensi Invoice</td>
                        <td>:</td>
                        <td class="text-weight-bold">{{ selectedVoucher.nomor_invoice || '-' }}</td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Melalui (Metode)</td>
                        <td>:</td>
                        <td class="text-weight-bold text-primary">
                          {{ selectedVoucher.metode_bayar }}
                        </td>
                      </tr>
                      <tr v-if="selectedVoucher.metode_bayar.includes('Transfer')">
                        <td class="text-grey-7 font-bold">Rekening Tujuan</td>
                        <td>:</td>
                        <td class="text-weight-bold">
                          {{ selectedVoucher.rek_bank }} - {{ selectedVoucher.rek_nomor }} <br />
                          <span class="text-caption italic"
                            >A/N: {{ selectedVoucher.rek_nama }}</span
                          >
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div class="col-5">
                    <table class="voucher-info-table full-width">
                      <tr>
                        <td width="120" class="text-grey-7 font-bold">Tgl Pembayaran</td>
                        <td width="20">:</td>
                        <td class="text-weight-bold">
                          {{ formatDateIndo(selectedVoucher.approvedAt) }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Tgl Pengajuan</td>
                        <td>:</td>
                        <td class="text-weight-bold">
                          {{ formatDateIndo(selectedVoucher.tanggal_pengajuan) }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Pemohon (Req)</td>
                        <td>:</td>
                        <td class="text-weight-bold">{{ selectedVoucher.pemohon }}</td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Otorisator (App)</td>
                        <td>:</td>
                        <td class="text-weight-bold">{{ selectedVoucher.approvedBy }}</td>
                      </tr>
                    </table>
                  </div>
                </div>

                <!-- Rincian Keperluan -->
                <div class="voucher-box q-mb-xl">
                  <div class="voucher-box-header">URAIAN / KEPERLUAN PEMBAYARAN</div>
                  <div
                    class="voucher-box-content text-body1 leading-relaxed italic text-blue-grey-9"
                  >
                    "{{ selectedVoucher.keperluan }}"
                  </div>
                </div>

                <!-- Nominal Besar -->
                <div class="row justify-end q-mb-xl">
                  <div class="col-12 col-md-7">
                    <table class="nominal-table full-width">
                      <tr>
                        <td
                          class="bg-grey-2 text-weight-bold text-right q-pa-md uppercase tracking-widest text-grey-8"
                        >
                          TOTAL DIBAYARKAN
                        </td>
                        <td
                          class="bg-indigo-10 text-white text-h4 text-weight-black text-right q-pa-md"
                        >
                          Rp {{ (selectedVoucher.nominal_pengajuan || 0).toLocaleString() }}
                        </td>
                      </tr>
                    </table>
                    <div class="text-right q-mt-sm text-caption text-grey-6 italic">
                      Telah diverifikasi dan disetujui sesuai dengan bukti invoice yang sah.
                    </div>
                  </div>
                </div>

                <!-- Tanda Tangan -->
                <div class="row justify-between text-center q-mt-xl pt-lg" style="font-size: 13px">
                  <div class="col-3">
                    <div class="text-weight-bold q-mb-xl">Disetujui Oleh,</div>
                    <div style="height: 60px"></div>
                    <div class="text-weight-bolder underline text-indigo-10 uppercase">
                      {{ selectedVoucher.approvedBy }}
                    </div>
                    <div class="text-caption text-bold text-grey-6 uppercase">
                      Finance / Direksi
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="text-weight-bold q-mb-xl">Diperiksa Oleh,</div>
                    <div style="height: 60px"></div>
                    <div class="text-weight-bolder underline text-blue-grey-10 uppercase">
                      Accounting Staff
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="text-weight-bold q-mb-xl">Dibuat Oleh,</div>
                    <div style="height: 60px"></div>
                    <div class="text-weight-bolder underline text-blue-grey-10 uppercase">
                      {{ selectedVoucher.pemohon }}
                    </div>
                    <div class="text-caption text-bold text-grey-6 uppercase">Pemohon</div>
                  </div>
                  <div class="col-3">
                    <div class="text-weight-bold q-mb-xl">Penerima,</div>
                    <div style="height: 60px"></div>
                    <div class="text-weight-bolder text-grey-5">
                      (..............................)
                    </div>
                    <div class="text-caption text-bold text-grey-6 uppercase">Vendor / TTD</div>
                  </div>
                </div>

                <div
                  class="q-mt-xl text-center text-grey-4 text-caption font-bold tracking-widest uppercase"
                  style="font-size: 9px"
                >
                  Sistem Informasi Keuangan Agra ERP • Generated V4.0.1
                </div>
              </div>

              <!-- VIEW LAMPIRAN (UI ONLY NO-PRINT) -->
              <div class="q-mt-lg text-center no-print" v-if="selectedVoucher?.lampiran_url">
                <q-btn
                  outline
                  color="indigo-10"
                  icon="attachment"
                  label="Buka Bukti Pengajuan / Memo Terlampir"
                  class="bg-white rounded-12 text-weight-bold shadow-1"
                  @click="openLink(selectedVoucher.lampiran_url)"
                />
              </div>
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
import { collection, onSnapshot, query, orderBy, where, getDoc, doc } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()

// State
const expenses = ref([]) // Menyimpan data mentah dari DB
const loading = ref(true)
const searchQuery = ref('')
const metodeFilter = ref('ALL')
const showVoucher = ref(false)
const selectedVoucher = ref(null)
const compConfig = ref({ kopUrl: '', nama_perusahaan: '', slogan_perusahaan: '' })

let unsubExpenses = null

// Columns
const columns = [
  { name: 'waktu', align: 'left', label: 'WAKTU BAYAR & REF', field: 'approvedAt', sortable: true },
  {
    name: 'penerima',
    align: 'left',
    label: 'PENERIMA (VENDOR)',
    field: 'supplier_nama',
    sortable: true,
  },
  { name: 'metode', align: 'center', label: 'METODE', field: 'metode_bayar', sortable: true },
  {
    name: 'keperluan',
    align: 'left',
    label: 'URAIAN TRANSAKSI',
    field: 'keperluan',
    sortable: true,
  },
  {
    name: 'nominal',
    align: 'right',
    label: 'KAS KELUAR (IDR)',
    field: 'nominal_pengajuan',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'VOUCHER', field: 'id' },
]

// Fetch Data
const fetchData = async () => {
  loading.value = true

  // Ambil data profil perusahaan untuk kop PDF
  const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
  if (confSnap.exists()) compConfig.value = confSnap.data()

  // Ambil semua pengajuan yang statusnya DISETUJUI (Artinya sudah dicairkan/keluar uang)
  const q = query(
    collection(db, 'finance_pengajuan_pembayaran'),
    where('status', '==', 'Disetujui'),
    orderBy('approvedAt', 'desc'),
  )

  unsubExpenses = onSnapshot(
    q,
    (snap) => {
      expenses.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Listen Error:', err)
      loading.value = false
    },
  )
}

// Computed Data & KPI
const approvedExpenses = computed(() => expenses.value) // Karena query base nya memang yang disetujui

const totalPengeluaran = computed(() => {
  return approvedExpenses.value.reduce((sum, r) => sum + (r.nominal_pengajuan || 0), 0)
})

const rataRataPengeluaran = computed(() => {
  if (approvedExpenses.value.length === 0) return 0
  return totalPengeluaran.value / approvedExpenses.value.length
})

// Logika hitung pengeluaran bulan berjalan
const currentMonthName = computed(() => {
  return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const pengeluaranBulanIni = computed(() => {
  const currentMonthPrefix = new Date().toISOString().slice(0, 7) // ex: '2026-05'
  return approvedExpenses.value
    .filter((r) => {
      // Handling kalau dia firebase timestamp atau ISO string
      let dateStr = ''
      if (r.approvedAt && r.approvedAt.toDate) {
        dateStr = r.approvedAt.toDate().toISOString()
      } else if (r.approvedAt) {
        dateStr = new Date(r.approvedAt).toISOString()
      } else {
        dateStr = new Date(r.updatedAt || r.createdAt).toISOString()
      }
      return dateStr.startsWith(currentMonthPrefix)
    })
    .reduce((sum, r) => sum + (r.nominal_pengajuan || 0), 0)
})

// Filter Data Table
const filteredExpenses = computed(() => {
  let result = approvedExpenses.value

  if (metodeFilter.value !== 'ALL') {
    // Pencocokan substring (Krn di db mungkin "Transfer Bank", "Tunai / Cash")
    result = result.filter((r) => r.metode_bayar?.includes(metodeFilter.value.split(' ')[0]))
  }

  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.nomor_req?.toLowerCase().includes(lower) ||
        r.supplier_nama?.toLowerCase().includes(lower) ||
        r.nomor_invoice?.toLowerCase().includes(lower),
    )
  }
  return result
})

// Actions
const openVoucher = (row) => {
  selectedVoucher.value = row
  showVoucher.value = true
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

// Utils
const formatDateIndo = (d) => {
  if (!d) return '-'
  const date = d.toDate ? d.toDate() : new Date(d)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + ' M'
  if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
}

const getMetodeColor = (metode) => {
  if (!metode) return { bg: 'grey-2', text: 'grey-7', icon: 'payments' }
  if (metode.toLowerCase().includes('transfer'))
    return { bg: 'blue-1', text: 'primary', icon: 'account_balance' }
  if (metode.toLowerCase().includes('tunai') || metode.toLowerCase().includes('cash'))
    return { bg: 'green-1', text: 'positive', icon: 'local_atm' }
  return { bg: 'purple-1', text: 'purple-9', icon: 'money' }
}

const exportVoucherToPDF = () => {
  const element = document.getElementById('voucher-pdf-target')
  const reqNo = selectedVoucher.value.nomor_req?.replace('PAY-', '') || 'VOUCHER'
  const fileName = `BKK_${reqNo}.pdf`

  const opt = {
    margin: 15,
    filename: fileName,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2.5, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }

  $q.loading.show({ message: 'Mencetak Voucher Bukti Kas Keluar...' })
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
  if (unsubExpenses) unsubExpenses()
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
.border-bottom-thick {
  border-bottom: 3px solid #1a237e;
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
.tracking-tighter {
  letter-spacing: -1px;
}
.opacity-80 {
  opacity: 0.8;
}
.opacity-70 {
  opacity: 0.7;
}
.leading-none {
  line-height: 1.1;
}
.leading-relaxed {
  line-height: 1.6;
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.animate-spin-slow {
  animation: spin 4s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* =====================================================================================
   VOUCHER / BUKTI KAS KELUAR (PDF TARGET STYLING)
   ===================================================================================== */
.voucher-paper {
  background: white;
  width: 100%;
  max-width: 210mm;
  min-height: 148.5mm; /* Setengah A4 (A5 Landscape) cocok untuk voucher kas */
  padding: 40px;
  margin: 0 auto;
  color: black;
  box-sizing: border-box;
}

.voucher-logo {
  height: 60px;
  object-fit: contain;
}

.voucher-info-table td {
  padding: 5px 0;
  vertical-align: top;
}

.voucher-box {
  border: 1.5px solid #cfd8dc;
  border-radius: 8px;
  overflow: hidden;
}
.voucher-box-header {
  background: #eceff1;
  padding: 8px 15px;
  font-weight: 800;
  color: #37474f;
  font-size: 12px;
  letter-spacing: 1px;
}
.voucher-box-content {
  padding: 15px;
}

.nominal-table {
  border-collapse: collapse;
  border: 2px solid #1a237e;
  border-radius: 8px;
}
.nominal-table td {
  border: 1px solid #1a237e;
}

.underline {
  border-bottom: 1.5px solid #1a237e;
  display: inline-block;
  padding: 0 5px;
}

@media print {
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  .voucher-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
    padding: 15mm !important;
  }
}
</style>
