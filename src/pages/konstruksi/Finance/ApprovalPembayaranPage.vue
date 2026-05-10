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
              Otorisasi Pencairan Dana
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Payment Approval Dashboard</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Tinjau, validasi, dan setujui permohonan pencairan dana (Account Payable).
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
        <div class="text-caption text-grey-6 q-mb-xs uppercase tracking-widest font-bold">
          Menunggu Otorisasi
        </div>
        <q-badge color="orange-9" class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12">
          {{ pendingRequests.length }} Dokumen
        </q-badge>
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI FINANCE
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Total Pending -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline text-orange-9 leading-none text-weight-bold tracking-widest"
              >
                PENDING APPROVAL
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                {{ pendingRequests.length }}
              </div>
            </div>
            <div
              class="bg-orange-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="hourglass_empty" color="orange-9" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total Dana Pending -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                NILAI DANA PENDING
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                Rp {{ formatCompact(totalDanaPending) }}
              </div>
            </div>
            <div
              class="bg-indigo-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="account_balance_wallet" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Approved Hari Ini -->
      <div class="col-12 col-sm-12 col-md-4">
        <q-card
          flat
          class="rounded-20 border-subtle bg-indigo-10 text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline text-indigo-2 leading-none text-weight-bold tracking-widest"
              >
                RIWAYAT DISETUJUI
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                {{ approvedRequests.length }}
                <span class="text-subtitle1 text-weight-regular">Dokumen</span>
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-2"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="verified" color="positive" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         MAIN TABLE DATA (MENAMPILKAN SEMUA STATUS)
         ===================================================================================== -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-indigo-thin"
    >
      <q-card-section
        class="q-pa-md bg-grey-1 border-bottom-subtle row items-center justify-between"
      >
        <div
          class="text-subtitle1 text-weight-bold text-indigo-10 uppercase tracking-widest flex items-center"
        >
          <q-icon name="list_alt" class="q-mr-sm" size="sm" /> Antrean & Riwayat Pengajuan
        </div>
        <div class="row q-gutter-sm">
          <q-input
            v-model="filter"
            outlined
            dense
            rounded
            placeholder="Cari No. Req / Vendor..."
            bg-color="white"
            style="width: 250px"
          >
            <template v-slot:prepend><q-icon name="search" color="primary" /></template>
          </q-input>
          <q-select
            v-model="statusFilter"
            :options="['Semua Status', 'Menunggu Approval', 'Disetujui', 'Ditolak']"
            outlined
            dense
            rounded
            bg-color="white"
            style="width: 200px"
          />
        </div>
      </q-card-section>

      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="finance-table"
        :pagination="{ rowsPerPage: 10 }"
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
            @click="openReview(props.row)"
          >
            <q-td key="nomor_req">
              <div class="text-weight-bold text-indigo-10 text-subtitle2 leading-none q-mb-xs">
                {{ props.row.nomor_req }}
              </div>
              <div class="text-caption text-grey-6 font-10">Ref: {{ props.row.nomor_invoice }}</div>
            </q-td>

            <q-td key="tujuan">
              <div class="text-weight-bold text-blue-grey-9 uppercase">
                {{ props.row.supplier_nama }}
              </div>
              <div class="text-caption text-primary font-11">
                {{ props.row.rek_bank }} - {{ props.row.rek_nomor }}
              </div>
            </q-td>

            <q-td key="nominal" class="text-right">
              <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                Rp {{ (props.row.nominal_pengajuan || 0).toLocaleString() }}
              </div>
              <div class="text-caption text-grey-6 font-10">Via {{ props.row.metode_bayar }}</div>
            </q-td>

            <q-td key="pemohon">
              <div class="text-weight-medium text-blue-grey-9 font-11">
                {{ props.row.pemohon || 'Staff Finance' }}
              </div>
              <div class="text-caption text-grey-6 font-10">
                {{ formatDateIndo(props.row.tanggal_pengajuan) }}
              </div>
            </q-td>

            <q-td key="status" class="text-center">
              <q-chip
                dense
                :color="getStatusColor(props.row.status).bg"
                :text-color="getStatusColor(props.row.status).text"
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
              >
                <q-icon :name="getStatusColor(props.row.status).icon" class="q-mr-xs" size="10px" />
                {{ props.row.status }}
              </q-chip>
            </q-td>

            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-xs">
                <q-btn
                  v-if="props.row.status === 'Menunggu Approval'"
                  unelevated
                  rounded
                  color="indigo-10"
                  label="Review & Otorisasi"
                  size="sm"
                  class="q-px-md shadow-2 text-weight-bold"
                  @click="openReview(props.row)"
                />
                <q-btn
                  v-else
                  flat
                  round
                  color="grey-7"
                  icon="visibility"
                  size="sm"
                  @click="openReview(props.row)"
                >
                  <q-tooltip>Lihat Detail</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="verified_user" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">
              Bagus! Tidak ada antrean pengajuan yang menunggu otorisasi.
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG REVIEW & APPROVAL (FULLSCREEN)
         ===================================================================================== -->
    <q-dialog
      v-model="showReview"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(8px)"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title>
            <div class="text-weight-bold uppercase tracking-widest font-11">
              Otorisasi Pencairan Dana
            </div>
            <div class="text-caption opacity-70">Dokumen: {{ selectedReq?.nomor_req }}</div>
          </q-toolbar-title>

          <!-- Status Badge di Header -->
          <q-chip
            v-if="selectedReq"
            :color="getStatusColor(selectedReq.status).bg"
            :text-color="getStatusColor(selectedReq.status).text"
            class="text-weight-bold font-11 uppercase q-mr-md shadow-2 q-px-md"
          >
            <q-icon :name="getStatusColor(selectedReq.status).icon" class="q-mr-xs" size="14px" />
            {{ selectedReq.status }}
          </q-chip>
        </q-toolbar>

        <q-scroll-area class="col q-pa-md q-pa-lg-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <div class="row q-col-gutter-lg items-stretch">
                <!-- PANEL KIRI: DETAIL PENGAJUAN -->
                <div class="col-12 col-md-5">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 full-height bg-white shadow-1 border-indigo-thin"
                  >
                    <q-card-section class="q-pa-lg">
                      <div
                        class="text-overline text-primary text-bold tracking-widest q-mb-md flex items-center"
                      >
                        <q-icon name="info" class="q-mr-sm" size="sm" /> Informasi Pengajuan
                      </div>

                      <div class="q-gutter-y-lg">
                        <div class="info-box">
                          <div class="text-caption text-grey-7 uppercase font-10 text-bold">
                            Ditujukan Kepada (Vendor)
                          </div>
                          <div class="text-h6 text-weight-bolder text-blue-grey-10 uppercase">
                            {{ selectedReq?.supplier_nama }}
                          </div>
                        </div>

                        <div class="row q-col-gutter-sm">
                          <div class="col-6">
                            <div class="text-caption text-grey-7 uppercase font-10 text-bold">
                              Metode Pembayaran
                            </div>
                            <div class="text-body1 text-weight-bold text-primary">
                              {{ selectedReq?.metode_bayar }}
                            </div>
                          </div>
                          <div class="col-6">
                            <div class="text-caption text-grey-7 uppercase font-10 text-bold">
                              Tgl Pengajuan
                            </div>
                            <div class="text-body1 text-weight-bold">
                              {{ formatDateIndo(selectedReq?.tanggal_pengajuan) }}
                            </div>
                          </div>
                        </div>

                        <div class="bg-grey-1 q-pa-md rounded-12 border-subtle">
                          <div class="text-caption text-grey-7 uppercase font-10 text-bold q-mb-xs">
                            Informasi Rekening Tujuan
                          </div>
                          <div class="text-subtitle1 text-weight-bolder text-indigo-10">
                            {{ selectedReq?.rek_bank }} - {{ selectedReq?.rek_nomor }}
                          </div>
                          <div class="text-caption text-weight-medium uppercase">
                            A/N: {{ selectedReq?.rek_nama }}
                          </div>
                        </div>

                        <div>
                          <div class="text-caption text-grey-7 uppercase font-10 text-bold q-mb-xs">
                            Keperluan / Keterangan
                          </div>
                          <div class="text-body2 text-blue-grey-8 italic leading-relaxed">
                            "{{ selectedReq?.keperluan || 'Tidak ada keterangan tambahan.' }}"
                          </div>
                        </div>

                        <!-- Opsi Lampiran -->
                        <div v-if="selectedReq?.lampiran_url" class="q-mt-md">
                          <q-btn
                            outline
                            color="indigo-10"
                            icon="attachment"
                            label="Lihat Memo / Lampiran Pengajuan"
                            class="full-width rounded-12 text-weight-bold"
                            @click="openLink(selectedReq.lampiran_url)"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- PANEL KANAN: VALIDASI NOMINAL & INVOICE -->
                <div class="col-12 col-md-7">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 full-height bg-white shadow-1 overflow-hidden border-indigo-thin"
                  >
                    <q-card-section
                      class="bg-indigo-1 q-py-sm border-bottom-subtle flex items-center"
                    >
                      <q-icon
                        name="account_balance_wallet"
                        color="indigo-10"
                        size="sm"
                        class="q-mr-sm"
                      />
                      <div
                        class="text-subtitle1 text-weight-bold text-indigo-10 uppercase tracking-widest"
                      >
                        Validasi Nominal & Tagihan
                      </div>
                    </q-card-section>

                    <q-card-section class="q-pa-lg">
                      <!-- Kotak Nominal Besar -->
                      <div
                        class="bg-indigo-10 text-white q-pa-xl rounded-20 shadow-10 text-center q-mb-xl relative-position overflow-hidden"
                      >
                        <q-icon
                          name="payments"
                          size="150px"
                          class="absolute-right opacity-10 q-mr-n-md"
                          style="top: -20px"
                        />
                        <div
                          class="text-overline text-indigo-2 text-bold uppercase tracking-widest q-mb-sm z-top relative-position"
                        >
                          NOMINAL PENCAIRAN YANG DIAJUKAN
                        </div>
                        <div class="text-h2 text-weight-black z-top relative-position">
                          Rp {{ (selectedReq?.nominal_pengajuan || 0).toLocaleString() }}
                        </div>
                      </div>

                      <div class="row q-col-gutter-lg q-mb-lg">
                        <div class="col-12 col-sm-6">
                          <div class="text-caption text-grey-7 uppercase font-10 text-bold q-mb-xs">
                            Referensi Invoice Supplier
                          </div>
                          <div class="text-h6 text-weight-bold text-blue-grey-10 flex items-center">
                            {{ selectedReq?.nomor_invoice }}
                            <q-btn
                              flat
                              round
                              dense
                              color="primary"
                              icon="open_in_new"
                              size="xs"
                              class="q-ml-sm"
                              @click="lihatInvoice(selectedReq?.tagihan_id)"
                            >
                              <q-tooltip>Buka Detail Tagihan/Invoice</q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                        <div class="col-12 col-sm-6 text-right">
                          <div class="text-caption text-grey-7 uppercase font-10 text-bold q-mb-xs">
                            Sisa Hutang Sebelum Disetujui
                          </div>
                          <div class="text-h6 text-weight-bold text-negative">
                            Rp {{ (selectedReq?.sisa_tagihan || 0).toLocaleString() }}
                          </div>
                        </div>
                      </div>

                      <!-- Peringatan Sistem -->
                      <q-banner
                        dense
                        class="bg-orange-1 text-orange-10 rounded-12 q-pa-md border-orange-thin"
                      >
                        <template v-slot:avatar>
                          <q-icon name="warning" color="orange-9" />
                        </template>
                        <div class="text-caption text-weight-medium leading-relaxed">
                          Dengan menyetujui pengajuan ini, sistem akan otomatis mencatat pembayaran
                          dan memotong sisa hutang pada Invoice
                          <b>{{ selectedReq?.nomor_invoice }}</b
                          >. Tindakan ini bersifat final.
                        </div>
                      </q-banner>

                      <!-- Area Alasan Penolakan -->
                      <div class="q-mt-xl" v-if="selectedReq?.status === 'Menunggu Approval'">
                        <div
                          class="text-caption text-weight-bold text-grey-8 q-mb-sm flex items-center uppercase font-10 tracking-widest"
                        >
                          <q-icon name="comment" color="primary" class="q-mr-xs" />
                          Catatan / Alasan Penolakan (Opsional)
                        </div>
                        <q-input
                          v-model="rejectReason"
                          outlined
                          type="textarea"
                          placeholder="Berikan alasan jika dokumen ditolak..."
                          bg-color="white"
                          rows="3"
                          class="custom-textarea"
                        />
                      </div>

                      <!-- Info Jika Sudah Diproses -->
                      <div
                        class="q-mt-xl bg-grey-1 q-pa-md rounded-12 border-subtle row items-center justify-between"
                        v-if="selectedReq?.status !== 'Menunggu Approval'"
                      >
                        <div class="row items-center">
                          <q-icon
                            :name="selectedReq?.status === 'Disetujui' ? 'verified' : 'cancel'"
                            :color="getStatusColor(selectedReq?.status).bg.replace('-1', '-10')"
                            size="lg"
                            class="q-mr-md"
                          />
                          <div>
                            <div class="text-weight-bold text-blue-grey-10">
                              Dokumen telah diproses
                            </div>
                            <div class="text-caption text-grey-7">
                              Otorisator: <b>{{ selectedReq?.approvedBy || '-' }}</b>
                            </div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-caption text-grey-7">
                            {{ formatDateIndo(selectedReq?.updatedAt) }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </q-scroll-area>

        <q-separator />

        <!-- Sticky Bottom Actions -->
        <q-card-actions
          align="right"
          class="q-pa-lg bg-white shadow-up-5 shrink"
          v-if="selectedReq?.status === 'Menunggu Approval'"
        >
          <q-btn
            flat
            label="Tinjau Nanti"
            color="grey-7"
            v-close-popup
            no-caps
            class="q-px-lg rounded-12 text-weight-bold"
          />
          <q-btn
            outline
            label="Tolak Pengajuan"
            color="negative"
            icon="block"
            class="q-px-xl rounded-12 text-weight-bold bg-white q-ml-sm"
            no-caps
            :loading="submitting"
            @click="processApproval('Ditolak')"
          />
          <q-btn
            unelevated
            label="SETUJUI & CAIRKAN DANA"
            color="positive"
            icon="check_circle"
            class="q-px-xl text-weight-black shadow-8 rounded-12 q-ml-sm"
            no-caps
            :loading="submitting"
            @click="processApproval('Disetujui')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  query,
  doc,
  runTransaction,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()

// State
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const filter = ref('')
const statusFilter = ref('Semua Status')
const showReview = ref(false)
const selectedReq = ref(null)
const rejectReason = ref('')

let unsubPengajuan = null

// Columns
const columns = [
  { name: 'nomor_req', align: 'left', label: 'NO. REQUEST', field: 'nomor_req', sortable: true },
  {
    name: 'tujuan',
    align: 'left',
    label: 'VENDOR / PENERIMA',
    field: 'supplier_nama',
    sortable: true,
  },
  {
    name: 'nominal',
    align: 'right',
    label: 'NOMINAL DIAJUKAN',
    field: 'nominal_pengajuan',
    sortable: true,
  },
  { name: 'pemohon', align: 'left', label: 'PEMOHON', field: 'pemohon', sortable: true },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'OTORISASI', field: 'id' },
]

// Computed
const pendingRequests = computed(() => rows.value.filter((r) => r.status === 'Menunggu Approval'))
const approvedRequests = computed(() => rows.value.filter((r) => r.status === 'Disetujui'))

const totalDanaPending = computed(() => {
  return pendingRequests.value.reduce((sum, r) => sum + (r.nominal_pengajuan || 0), 0)
})

const filteredRows = computed(() => {
  let result = rows.value
  if (statusFilter.value !== 'Semua Status') {
    result = result.filter((r) => r.status === statusFilter.value)
  }
  return result
})

// Fetch Data
const fetchData = () => {
  loading.value = true
  // Ambil semua pengajuan
  const q = query(collection(db, 'finance_pengajuan_pembayaran'), orderBy('createdAt', 'desc'))
  unsubPengajuan = onSnapshot(
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
const openReview = (row) => {
  selectedReq.value = row
  rejectReason.value = row.alasan_reject || ''
  showReview.value = true
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

// Fitur Navigasi Opsional
const lihatInvoice = (tagihanId) => {
  if (!tagihanId) return
  // Asumsi halaman Tagihan Supplier bisa diakses dan difilter
  router.push('/konstruksi/finance/tagihan-supplier')
  showReview.value = false
}

// ============================================================================
// CORE LOGIC: TRANSAKSI FIRESTORE UNTUK APPROVAL & UPDATE TAGIHAN
// ============================================================================
const processApproval = async (status) => {
  if (status === 'Ditolak' && !rejectReason.value) {
    $q.notify({ type: 'warning', message: 'Alasan penolakan wajib diisi untuk arsip audit!' })
    return
  }

  $q.dialog({
    title: `<span class="text-indigo-10 text-weight-bold">Konfirmasi Otorisasi</span>`,
    message: `Anda akan <b>${status === 'Disetujui' ? 'MENYETUJUI' : 'MENOLAK'}</b> pencairan dana sebesar Rp ${(selectedReq.value.nominal_pengajuan || 0).toLocaleString()} untuk tagihan ${selectedReq.value.nomor_invoice}. Lanjutkan?`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      unelevated: true,
      rounded: true,
      color: status === 'Disetujui' ? 'positive' : 'negative',
      label: 'Ya, Otentikasi',
    },
  }).onOk(async () => {
    submitting.value = true
    $q.loading.show({ message: 'Memproses otorisasi dan sinkronisasi jurnal...' })

    try {
      const reqId = selectedReq.value.id
      const tagihanId = selectedReq.value.tagihan_id
      const nominal = selectedReq.value.nominal_pengajuan

      await runTransaction(db, async (transaction) => {
        const reqRef = doc(db, 'finance_pengajuan_pembayaran', reqId)

        if (status === 'Disetujui') {
          const invRef = doc(db, 'finance_tagihan', tagihanId)
          const invSnap = await transaction.get(invRef)

          if (!invSnap.exists()) {
            throw new Error('Dokumen Tagihan (Invoice) referensi tidak ditemukan di sistem!')
          }

          const invData = invSnap.data()
          const currentTotalDibayar = invData.total_dibayar || 0
          const newTotalDibayar = currentTotalDibayar + nominal

          // Validasi keamanan: Jangan sampai overpaid (bayar lebih dari hutang)
          if (newTotalDibayar > invData.grand_total) {
            throw new Error(
              'Peringatan: Nominal pembayaran melebihi total tagihan invoice. Otorisasi dibatalkan.',
            )
          }

          // Tentukan Status Tagihan Baru
          let newInvStatus = 'Dibayar Sebagian'
          if (newTotalDibayar >= invData.grand_total) {
            newInvStatus = 'Lunas'
          }

          // 1. UPDATE TAGIHAN INDUK
          transaction.update(invRef, {
            total_dibayar: newTotalDibayar,
            status: newInvStatus,
            updatedAt: serverTimestamp(),
          })
        }

        // 2. UPDATE STATUS PENGAJUAN
        const updatePayload = {
          status: status,
          approvedBy: authStore.user?.nama || 'Administrator',
          approvedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        if (status === 'Ditolak') {
          updatePayload.alasan_reject = rejectReason.value
        }

        transaction.update(reqRef, updatePayload)
      })

      $q.notify({
        color: status === 'Disetujui' ? 'positive' : 'negative',
        message: `Pengajuan berhasil ${status === 'Disetujui' ? 'disetujui dan tagihan terpotong otomatis' : 'ditolak'}.`,
        icon: status === 'Disetujui' ? 'check_circle' : 'cancel',
        position: 'top',
      })
      showReview.value = false
    } catch (error) {
      console.error('Transaction Failed:', error)
      $q.notify({ type: 'negative', message: error.message || 'Gagal memproses otorisasi.' })
    } finally {
      submitting.value = false
      $q.loading.hide()
    }
  })
}

// Utils
const formatDateIndo = (d) => {
  if (!d) return '-'
  const date = d.toDate ? d.toDate() : new Date(d)
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
    case 'Menunggu Approval':
      return { bg: 'orange-2', text: 'orange-9', icon: 'hourglass_empty' }
    case 'Disetujui':
      return { bg: 'green-2', text: 'green-9', icon: 'verified' }
    case 'Ditolak':
      return { bg: 'red-2', text: 'red-9', icon: 'block' }
    default:
      return { bg: 'grey-3', text: 'grey-8', icon: 'info' }
  }
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (unsubPengajuan) unsubPengajuan()
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
.border-orange-thin {
  border: 1px solid rgba(255, 152, 0, 0.3);
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
.font-8 {
  font-size: 9px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.opacity-70 {
  opacity: 0.7;
}
.opacity-10 {
  opacity: 0.1;
}

.info-box {
  margin-bottom: 16px;
}

.custom-textarea :deep(.q-field__control) {
  border-radius: 12px;
}

.z-top {
  z-index: 10;
}
</style>
