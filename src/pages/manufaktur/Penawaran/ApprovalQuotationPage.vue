<template>
  <q-page class="approval-page q-pa-md q-pa-md-lg font-pro text-left">
    <div class="hero-shell no-print q-mb-lg animate-fade">
      <div class="hero-glow hero-glow-a"></div>
      <div class="hero-glow hero-glow-b"></div>
      <div class="hero-particles">
        <span v-for="n in 12" :key="n" class="hero-particle"></span>
      </div>

      <div class="approval-hero row items-center q-col-gutter-lg">
        <div class="col-12 col-lg-7">
          <div class="row items-center no-wrap hero-title-wrap">
            <div class="lottie-shell q-mr-md">
              <Vue3Lottie
                :animation-data="approvalAnimation"
                :height="104"
                :width="104"
                :speed="0.9"
                loop
                autoplay
              />
            </div>
            <div>
              <div class="hero-kicker">Manufacturing Quotation Control</div>
              <div class="hero-title">Otorisasi Penawaran (ACC)</div>
              <div class="hero-subtitle">Persetujuan & histori quotation manufaktur</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="hero-tools row q-col-gutter-sm justify-end items-center">
            <div class="col-12 col-sm-8">
              <q-input
                v-model="filter"
                placeholder="Cari No. Penawaran atau Customer..."
                outlined
                dense
                color="white"
                class="enterprise-search"
              >
                <template v-slot:prepend>
                  <q-icon name="manage_search" />
                </template>
                <template v-slot:append>
                  <q-icon name="tune" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-auto text-right">
              <div class="hero-stat-label">Total Dokumen</div>
              <div class="hero-stat-badge">
                <span>{{ allRows.length }}</span>
                <small>Dokumen Terdata</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="kpi-grid row q-col-gutter-md q-mb-lg no-print">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="kpi-card kpi-pending">
          <div class="kpi-label">Quotation Pending</div>
          <div class="kpi-value">{{ kpiPending }}</div>
          <div class="kpi-hint">Menunggu proses otorisasi</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="kpi-card kpi-approved">
          <div class="kpi-label">Approved Count</div>
          <div class="kpi-value">{{ kpiApproved }}</div>
          <div class="kpi-hint">Sudah disetujui</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="kpi-card kpi-rejected">
          <div class="kpi-label">Rejected Count</div>
          <div class="kpi-value">{{ kpiRejected }}</div>
          <div class="kpi-hint">Ditolak atau dibatalkan</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="kpi-card kpi-total">
          <div class="kpi-label">Total Documents</div>
          <div class="kpi-value">{{ kpiTotal }}</div>
          <div class="kpi-hint">Seluruh quotation aktif</div>
        </div>
      </div>
    </div>

    <!-- TABLE LIST -->
    <q-card flat class="approval-table-card rounded-20 overflow-hidden no-print">
      <q-table
        :rows="allRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="approval-table modern-table"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="table-header-row text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" class="approval-row cursor-pointer" @click="openApproval(props.row)">
            <q-td key="nomor" class="reference-cell">{{ props.row.nomor }}</q-td>
            <q-td key="nama_customer" class="client-cell uppercase">{{
              props.row.nama_customer
            }}</q-td>
            <q-td key="total_harga" class="amount-cell text-right">
              IDR {{ calculateRowTotal(props.row).toLocaleString() }}
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                size="sm"
                class="status-pill"
                :class="`status-${(props.row.status || 'Pending').toLowerCase()}`"
                :data-status-color="getStatusColor(props.row.status)"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                flat
                round
                class="action-btn action-view"
                icon="visibility"
                size="sm"
                @click="openApproval(props.row)"
              >
                <q-tooltip>Lihat Detail & ACC</q-tooltip>
              </q-btn>
              <template v-if="props.row.status === 'Pending'">
                <q-btn
                  v-if="canAction('approve')"
                  flat
                  round
                  class="action-btn action-approve"
                  icon="check_circle"
                  size="sm"
                  :loading="actionLoading === `${props.row.id}-Approved`"
                  @click="approveQuotation(props.row)"
                >
                  <q-tooltip>Approve Penawaran</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canAction('approve') || canAction('ubah')"
                  flat
                  round
                  class="action-btn action-reject"
                  icon="cancel"
                  size="sm"
                  :loading="actionLoading === `${props.row.id}-Rejected`"
                  @click="rejectQuotation(props.row)"
                >
                  <q-tooltip>Tolak Penawaran</q-tooltip>
                </q-btn>
              </template>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- PREVIEW & APPROVAL DIALOG -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-teal-10 q-py-sm no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold">OTORISASI DOKUMEN</q-toolbar-title>

          <!-- PDF & PRINT -->
          <q-btn-group unelevated rounded class="q-mr-md shadow-1">
            <q-btn color="teal-10" icon="print" label="Cetak" @click="printNow" />
            <q-btn color="red-9" icon="picture_as_pdf" label="Download PDF" @click="exportToPDF" />
          </q-btn-group>

          <template v-if="selectedData?.status === 'Pending'">
            <q-btn
              v-if="canAction('approve')"
              unelevated
              rounded
              color="positive"
              icon="check_circle"
              label="APPROVE"
              class="q-mr-sm text-weight-bold"
              :loading="actionLoading === `${selectedData.id}-Approved`"
              @click="approveQuotation(selectedData)"
            />
            <q-btn
              v-if="canAction('approve') || canAction('ubah')"
              outline
              rounded
              color="negative"
              icon="cancel"
              label="REJECT"
              class="text-weight-bold"
              :loading="actionLoading === `${selectedData.id}-Rejected`"
              @click="rejectQuotation(selectedData)"
            />
          </template>
        </q-toolbar>

        <q-card-section class="col scroll flex flex-center q-pa-md preview-container">
          <div id="quotation-print" class="letter-paper shadow-24" v-if="selectedData">
            <!-- Kop Surat -->
            <div class="row no-wrap items-center">
              <div class="col-auto q-mr-md letter-logo-box">
                <img
                  v-if="selectedData.logo"
                  :src="selectedData.logo"
                  class="letter-logo"
                  alt="Logo Penawaran"
                />
                <q-icon v-else name="factory" color="teal-10" size="55px" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase text-teal-10">{{ selectedData.nama_pt }}</div>
                <div class="final-pt-tagline italic text-grey-8">
                  GENERAL CONSTRUCTION AND GENERAL SUPPLY
                </div>
              </div>
              <div class="col-auto text-right">
                <div class="quotation-title-pro text-teal-10 uppercase">Quotation</div>
                <div class="text-weight-bold">{{ selectedData.nomor }}</div>
                <div class="text-grey-8">
                  {{ selectedData.lokasi }}, {{ formatDateIndo(selectedData.tanggal) }}
                </div>
              </div>
            </div>
            <div class="final-divider bg-teal-10"></div>

            <div class="text-left q-mt-lg">
              <div class="label-grey-pro uppercase">KEPADA YTH :</div>
              <div class="client-name-pro uppercase text-teal-10">
                {{ selectedData.nama_customer }}
              </div>
              <div class="text-body2">Di Tempat</div>
            </div>

            <div class="text-left q-my-md">
              Bersama surat ini kami mengajukan penawaran harga sebagai berikut:
            </div>

            <table class="final-pro-table">
              <thead>
                <tr class="bg-teal-10 text-white">
                  <th width="40">NO</th>
                  <th class="text-left">DESCRIPTION OF WORKS</th>
                  <th width="60">QTY</th>
                  <th width="60">UNIT</th>
                  <th width="120">UNIT PRICE</th>
                  <th width="140">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in selectedData.items" :key="i">
                  <td class="text-center">{{ i + 1 }}</td>
                  <td class="text-left uppercase">{{ it.deskripsi }}</td>
                  <td class="text-center">{{ it.qty }}</td>
                  <td class="text-center uppercase">{{ it.satuan }}</td>
                  <td class="text-right">{{ (it.harga || 0).toLocaleString() }}</td>
                  <td class="text-right text-weight-bolder text-teal-10">
                    {{ (Number(it.qty || 0) * Number(it.harga || 0)).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="row-calculation">
                  <td colspan="5" class="text-right text-bold uppercase">Subtotal Pekerjaan</td>
                  <td class="text-right text-bold text-teal-10">
                    IDR {{ calculateRowTotal(selectedData, 'subtotal').toLocaleString() }}
                  </td>
                </tr>
                <tr class="row-grand-total bg-teal-10 text-white">
                  <td colspan="5" class="text-right text-bold uppercase">Grand Total Amount</td>
                  <td class="text-right text-bold text-h6">
                    IDR {{ calculateRowTotal(selectedData, 'grand').toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div class="terms-container text-left q-mt-lg border-teal">
              <div class="terms-header bg-teal-10 text-white">Syarat & Kondisi Pembayaran :</div>
              <div class="terms-content-box" v-html="selectedData.syarat"></div>
            </div>

            <div class="text-left q-mt-md">
              Demikian penawaran ini kami sampaikan, terima kasih.
            </div>

            <div class="signature-container q-mt-xl">
              <div class="text-body2 uppercase">Hormat Kami,</div>
              <div class="text-weight-bold text-teal-10 uppercase q-mb-xs">
                {{ selectedData.nama_pt }}
              </div>
              <div class="final-sign-space flex flex-center">
                <img
                  v-if="selectedData.signatureUrl"
                  :src="selectedData.signatureUrl"
                  class="img-signature"
                />
                <div v-else class="signature-placeholder text-caption text-grey-5 italic">
                  Belum ditandatangani approval
                </div>
              </div>
              <div class="text-signer-final text-weight-bolder text-teal-10 uppercase">
                <u>{{ primarySigner.nama || '( ........................ )' }}</u>
              </div>
              <div class="text-role-final uppercase text-grey-8 text-caption font-bold">
                {{ primarySigner.jabatan }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- SIGNATURE PAD -->
    <q-dialog v-model="showPad" persistent>
      <q-card style="width: 500px; max-width: 95vw" class="rounded-20">
        <q-card-section class="bg-teal-10 text-white q-pa-md">
          <div class="text-h6 uppercase text-weight-bold">Gurat Tanda Tangan</div>
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="signature-pad-wrapper border-teal">
            <canvas ref="signatureCanvas" class="signature-canvas"></canvas>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Reset" color="grey-7" @click="clearPad" />
          <q-btn unelevated label="Simpan & Pasang" color="teal-10" @click="saveManualSignature" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Vue3Lottie } from 'vue3-lottie'
import approvalAnimation from 'src/assets/animations/ApprovalSign.json'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import SignaturePad from 'signature_pad'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()
const allRows = ref([])
const loading = ref(true)
const filter = ref('')
const showPreview = ref(false)
const showPad = ref(false)
const selectedData = ref(null)
const signatureCanvas = ref(null)
const actionLoading = ref(null)
const userData = ref(null)

let unsubUser = null
let unsubApproval = null
let signaturePad = null

const defaultItem = { nama_produk: '-', deskripsi: '-', qty: 0, satuan: '-', harga: 0, subtotal: 0 }
const defaultSigner = { nama: '', jabatan: '' }

const columns = [
  { name: 'nomor', align: 'left', label: 'REFERENCE NO', field: 'nomor', sortable: true },
  {
    name: 'nama_customer',
    align: 'left',
    label: 'CLIENT NAME',
    field: 'nama_customer',
    sortable: true,
  },
  {
    name: 'total_harga',
    align: 'right',
    label: 'AMOUNT (IDR)',
    field: (row) => calculateRowTotal(row),
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'ACTION' },
]

// --- HELPER FUNCTIONS ---
const normalizeQuotationItem = (item = {}, index = 0) => {
  const qty = Number(item.qty ?? item.quantity ?? item.qty_target ?? item.qty_po ?? 0)
  const harga = Number(item.harga ?? item.price ?? item.harga_satuan ?? item.unit_price ?? 0)
  const namaProduk =
    item.nama_produk ||
    item.product ||
    item.produk ||
    item.nama_barang ||
    item.deskripsi ||
    `Item ${index + 1}`

  return {
    ...item,
    item_id: item.item_id || item.id || `item-${index + 1}`,
    nama_produk: namaProduk,
    deskripsi: item.deskripsi || namaProduk,
    qty,
    satuan: item.satuan || item.unit || 'Unit',
    harga,
    subtotal: Number(item.subtotal ?? item.total ?? qty * harga),
  }
}

const normalizeQuotationItems = (row) => {
  const rawItems = Array.isArray(row.items) && row.items.length ? row.items : [{ ...defaultItem }]
  return rawItems.map(normalizeQuotationItem)
}

const normalizeQuotation = (row) => ({
  ...row,
  logo: row.logo || null,
  status: row.status || 'Pending',
  items: normalizeQuotationItems(row),
  signers:
    Array.isArray(row.signers) && row.signers.length
      ? row.signers
      : [{ nama: row.ttd_nama || '', jabatan: row.ttd_jabatan || '' }],
  syarat: row.syarat || '',
})

const primarySigner = computed(() => selectedData.value?.signers?.[0] || defaultSigner)
const kpiPending = computed(() => allRows.value.filter((row) => row.status === 'Pending').length)
const kpiApproved = computed(() => allRows.value.filter((row) => row.status === 'Approved').length)
const kpiRejected = computed(() => allRows.value.filter((row) => row.status === 'Rejected').length)
const kpiTotal = computed(() => allRows.value.length)

const calculateRowTotal = (row, type = 'grand') => {
  if (!row || !row.items) return 0
  const sub =
    Number(row.subtotal) ||
    row.items.reduce((acc, it) => acc + Number(it.qty || 0) * Number(it.harga || 0), 0)
  if (type === 'subtotal') return sub
  const tax = Number(row.tax_amount) || sub * (Number(row.tax_rate || 0) / 100)
  const grand = sub + tax + Number(row.biaya_lain || 0)
  return Number(row.grand_total) || grand
}

const formatDateIndo = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
const getStatusColor = (s) =>
  s === 'Approved' ? 'positive' : s === 'Rejected' ? 'negative' : 'orange-9'

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'manufaktur')
  if (!modulePerm || !modulePerm.isActive) return false

  const approvalMenu = modulePerm.menus.find((m) => m.id === '_manufaktur_penawaran-approval')
  const penawaranMenu = modulePerm.menus.find((m) => m.id === '_manufaktur_penawaran')
  const menu = approvalMenu || penawaranMenu
  return menu ? menu[actionType] || false : false
}

// --- SIGNATURE PAD LOGIC ---
watch(showPad, async (val) => {
  if (val) {
    await nextTick()
    const canvas = signatureCanvas.value
    if (!canvas) return
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    canvas.getContext('2d')?.scale(ratio, ratio)
    signaturePad = new SignaturePad(canvas)
  } else {
    signaturePad = null
  }
})

const clearPad = () => signaturePad?.clear()

const syncQuotation = (updatedRow) => {
  const normalized = normalizeQuotation(updatedRow)
  allRows.value = allRows.value.map((row) => (row.id === normalized.id ? normalized : row))
  if (selectedData.value?.id === normalized.id) selectedData.value = normalized
}

const saveManualSignature = async () => {
  if (!signaturePad || signaturePad.isEmpty()) return
  const base64 = signaturePad.toDataURL('image/png')
  try {
    $q.loading.show()
    await updateDoc(doc(db, 'penawaran_manufaktur', selectedData.value.id), {
      signatureUrl: base64,
      updatedAt: serverTimestamp(),
    })
    syncQuotation({ ...selectedData.value, signatureUrl: base64 })
    showPad.value = false
    $q.notify({ type: 'positive', message: 'Tanda tangan berhasil dipasang!' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan tanda tangan!' })
  } finally {
    $q.loading.hide()
  }
}

// --- APPROVAL & EXPORT LOGIC ---
const updateStatus = (row, status, alasan = null) => {
  if (!row?.id) {
    $q.notify({ type: 'warning', message: 'Data penawaran tidak valid.' })
    return
  }
  if (!['Approved', 'Rejected'].includes(status)) {
    $q.notify({ type: 'warning', message: 'Status approval tidak valid.' })
    return
  }
  if (row.status !== 'Pending') {
    $q.notify({ type: 'warning', message: 'Dokumen ini sudah diproses.' })
    return
  }
  if (status === 'Approved' && !canAction('approve')) {
    $q.notify({ type: 'negative', message: 'Anda tidak memiliki akses approve penawaran.' })
    return
  }
  if (status === 'Rejected' && !canAction('approve') && !canAction('ubah')) {
    $q.notify({ type: 'negative', message: 'Anda tidak memiliki akses reject penawaran.' })
    return
  }
  if (status === 'Rejected' && !String(alasan || '').trim()) {
    $q.notify({ type: 'warning', message: 'Alasan reject wajib diisi.' })
    return
  }
  if (status === 'Approved' && !row.signatureUrl) {
    $q.notify({
      type: 'warning',
      message: 'Pasang tanda tangan approval sebelum approve penawaran.',
    })
    selectedData.value = normalizeQuotation(row)
    showPreview.value = true
    showPad.value = true
    return
  }

  $q.dialog({
    title: 'Konfirmasi Otorisasi',
    message: `Apakah Anda yakin ingin memproses dokumen ini ke status ${status}?`,
    cancel: true,
    ok: {
      color: status === 'Approved' ? 'positive' : 'negative',
      unelevated: true,
      rounded: true,
      label: 'Ya, Proses',
    },
  }).onOk(async () => {
    try {
      actionLoading.value = `${row.id}-${status}`
      $q.loading.show()
      const payload = {
        status: status,
        updatedAt: serverTimestamp(),
        processedAt: serverTimestamp(),
        approvedAt: status === 'Approved' ? serverTimestamp() : null,
        rejectedAt: status === 'Rejected' ? serverTimestamp() : null,
        marketing_read: false,
      }
      if (status === 'Rejected') payload.alasan_reject = String(alasan || '').trim()
      const normalizedItems = normalizeQuotationItems(row)

      await updateDoc(doc(db, 'penawaran_manufaktur', row.id), payload)
      if (status === 'Approved') {
        await setDoc(
          doc(db, 'manufacturing_approval_quotation', row.id),
          {
            ...row,
            ...payload,
            id: row.id,
            quotation_id: row.id,
            items: normalizedItems,
            source_collection: 'penawaran_manufaktur',
            source_document_id: row.id,
            module: 'manufacturing',
            syncedAt: serverTimestamp(),
          },
          { merge: true },
        )
      } else {
        await deleteDoc(doc(db, 'manufacturing_approval_quotation', row.id))
      }
      syncQuotation({ ...row, ...payload })
      showPreview.value = false
      $q.notify({ type: 'positive', message: `Status diperbarui menjadi ${status}` })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal memperbarui status penawaran!' })
    } finally {
      actionLoading.value = null
      $q.loading.hide()
    }
  })
}

const approveQuotation = (row) => updateStatus(normalizeQuotation(row), 'Approved')
const rejectQuotation = (row) => {
  const normalized = normalizeQuotation(row)
  if (normalized.status !== 'Pending') {
    $q.notify({ type: 'warning', message: 'Dokumen ini sudah diproses.' })
    return
  }
  if (!canAction('approve') && !canAction('ubah')) {
    $q.notify({ type: 'negative', message: 'Anda tidak memiliki akses reject penawaran.' })
    return
  }

  $q.dialog({
    title: 'Penolakan Penawaran (Reject)',
    message: 'Berikan alasan singkat atau instruksi revisi untuk marketing:',
    prompt: {
      model: '',
      type: 'textarea',
      placeholder: 'Contoh: Harga material terlalu tinggi, sesuaikan dengan budget...',
      isValid: (val) => String(val || '').trim().length > 0,
    },
    cancel: true,
    ok: { color: 'negative', unelevated: true, rounded: true, label: 'Reject Dokumen' },
  }).onOk((alasan) => updateStatus(normalized, 'Rejected', alasan))
}

const exportToPDF = () => {
  const element = document.getElementById('quotation-print')
  if (!element || !selectedData.value) {
    $q.notify({ type: 'warning', message: 'Detail penawaran belum siap untuk dibuat PDF.' })
    return
  }

  const fileName = `Quotation_${(selectedData.value.nomor || 'Penawaran').replace(/\//g, '-')}.pdf`
  const opt = {
    margin: 0,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, allowTaint: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Membuat file PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
    .catch((e) => {
      console.error(e)
      $q.loading.hide()
      $q.notify({ type: 'negative', message: 'Gagal membuat PDF!' })
    })
}

const printNow = () => window.print()
const openApproval = (row) => {
  selectedData.value = normalizeQuotation(row)
  showPreview.value = true
}

const fetchApprovalData = () => {
  if (unsubApproval) unsubApproval()
  loading.value = true

  const qApproval = query(collection(db, 'penawaran_manufaktur'), orderBy('updatedAt', 'desc'))
  unsubApproval = onSnapshot(
    qApproval,
    (snap) => {
      allRows.value = snap.docs.map((d) => normalizeQuotation({ id: d.id, ...d.data() }))
      if (selectedData.value?.id) {
        const latest = allRows.value.find((row) => row.id === selectedData.value.id)
        if (latest) selectedData.value = latest
      }
      loading.value = false
    },
    (err) => {
      console.error(err)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat data approval penawaran.' })
    },
  )
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }

  fetchApprovalData()
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubApproval) unsubApproval()
})
</script>

<style scoped>
.font-pro {
  font-family: 'Inter', sans-serif;
}
.approval-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 8%, rgba(34, 197, 94, 0.12), transparent 28%),
    radial-gradient(circle at 84% 12%, rgba(16, 185, 129, 0.1), transparent 26%),
    radial-gradient(circle at 50% 98%, rgba(6, 95, 70, 0.08), transparent 34%),
    linear-gradient(180deg, #f4fbf7 0%, #eef6f1 46%, #f8fbfa 100%);
  color: #10231d;
}
.hero-shell {
  position: relative;
}
.approval-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 28px;
  padding: 28px;
  background:
    linear-gradient(
      120deg,
      rgba(2, 83, 64, 0.98),
      rgba(5, 128, 91, 0.96),
      rgba(22, 163, 117, 0.94)
    ),
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.22), transparent 28%);
  background-size: 220% 220%;
  box-shadow: 0 24px 70px rgba(4, 72, 56, 0.24);
  isolation: isolate;
  animation: gradientMove 12s ease infinite;
}
.approval-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 32%);
  pointer-events: none;
}
.approval-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.13) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.58), transparent);
}
.hero-glow {
  position: absolute;
  z-index: -1;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  filter: blur(14px);
  opacity: 0.44;
  animation: glowPulse 8s ease-in-out infinite;
}
.hero-glow-a {
  left: -80px;
  top: -90px;
  background: rgba(174, 255, 211, 0.8);
}
.hero-glow-b {
  right: 6%;
  bottom: -130px;
  background: rgba(45, 212, 191, 0.7);
  animation-delay: -3s;
}
.hero-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.hero-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.35);
  animation: floatIcon 8s linear infinite;
}
.hero-particle:nth-child(1) {
  left: 8%;
  top: 20%;
  animation-delay: 0s;
}
.hero-particle:nth-child(2) {
  left: 14%;
  top: 68%;
  animation-delay: -1s;
}
.hero-particle:nth-child(3) {
  left: 22%;
  top: 34%;
  animation-delay: -2s;
}
.hero-particle:nth-child(4) {
  left: 34%;
  top: 78%;
  animation-delay: -3s;
}
.hero-particle:nth-child(5) {
  left: 44%;
  top: 18%;
  animation-delay: -4s;
}
.hero-particle:nth-child(6) {
  left: 56%;
  top: 62%;
  animation-delay: -5s;
}
.hero-particle:nth-child(7) {
  left: 66%;
  top: 28%;
  animation-delay: -6s;
}
.hero-particle:nth-child(8) {
  left: 74%;
  top: 72%;
  animation-delay: -1.5s;
}
.hero-particle:nth-child(9) {
  left: 82%;
  top: 22%;
  animation-delay: -2.5s;
}
.hero-particle:nth-child(10) {
  left: 90%;
  top: 58%;
  animation-delay: -3.5s;
}
.hero-particle:nth-child(11) {
  left: 94%;
  top: 30%;
  animation-delay: -4.5s;
}
.hero-particle:nth-child(12) {
  left: 60%;
  top: 84%;
  animation-delay: -5.5s;
}
.hero-title-wrap {
  min-width: 0;
}
.lottie-shell {
  width: 104px;
  min-width: 104px;
  height: 104px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.32);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 20px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(12px);
  animation: floatIcon 4.8s ease-in-out infinite;
}
.hero-kicker {
  color: rgba(220, 252, 231, 0.84);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.hero-title {
  margin-top: 4px;
  color: #ffffff;
  font-size: clamp(1.75rem, 2.6vw, 2.65rem);
  font-weight: 900;
  line-height: 1.05;
  text-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  animation: fadeInUp 800ms ease both;
}
.hero-subtitle {
  margin-top: 9px;
  max-width: 560px;
  color: rgba(236, 253, 245, 0.86);
  font-size: 1rem;
  font-weight: 500;
  animation: fadeInUp 900ms ease both;
}
.hero-tools {
  position: relative;
  z-index: 1;
}
.enterprise-search :deep(.q-field__control) {
  height: 46px;
  border-radius: 16px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 12px 28px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
}
.enterprise-search :deep(.q-field__native),
.enterprise-search :deep(.q-field__prepend),
.enterprise-search :deep(.q-field__append) {
  color: #ffffff;
}
.enterprise-search :deep(.q-field__native::placeholder) {
  color: rgba(255, 255, 255, 0.72);
}
.enterprise-search :deep(.q-field__control::before),
.enterprise-search :deep(.q-field__control::after) {
  border: 0;
}
.enterprise-search :deep(.q-field__prepend .q-icon),
.enterprise-search :deep(.q-field__append .q-icon) {
  padding: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}
.enterprise-search :deep(.q-field__control:hover) {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 16px 32px rgba(0, 0, 0, 0.16);
}
.hero-stat-label {
  margin-bottom: 6px;
  color: rgba(220, 252, 231, 0.76);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.hero-stat-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 16px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
}
.hero-stat-badge span {
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1;
}
.hero-stat-badge small {
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(236, 253, 245, 0.82);
}
.kpi-grid {
  position: relative;
  z-index: 1;
}
.kpi-card {
  position: relative;
  overflow: hidden;
  padding: 18px 18px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(7, 95, 74, 0.1);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(12px);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
  animation: fadeInUp 700ms ease both;
}
.kpi-card::after {
  content: '';
  position: absolute;
  inset: auto -30px -40px auto;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.14), transparent 68%);
  pointer-events: none;
}
.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 52px rgba(15, 23, 42, 0.11);
}
.kpi-label {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.kpi-value {
  margin-top: 6px;
  color: #062f23;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}
.kpi-hint {
  margin-top: 6px;
  color: #5e6f6a;
  font-size: 0.88rem;
}
.kpi-pending {
  border-color: rgba(245, 158, 11, 0.18);
}
.kpi-pending .kpi-value {
  color: #b45309;
}
.kpi-approved {
  border-color: rgba(16, 185, 129, 0.18);
}
.kpi-approved .kpi-value {
  color: #047857;
}
.kpi-rejected {
  border-color: rgba(239, 68, 68, 0.18);
}
.kpi-rejected .kpi-value {
  color: #b91c1c;
}
.kpi-total {
  border-color: rgba(14, 165, 233, 0.16);
}
.kpi-total .kpi-value {
  color: #0369a1;
}
.approval-table-card {
  position: relative;
  border: 1px solid rgba(7, 95, 74, 0.1);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
  animation: fadeInUp 760ms ease both;
}
.approval-table-card:hover {
  transform: translateY(-4px);
  border-color: rgba(13, 148, 103, 0.22);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.12);
}
.modern-table {
  background: transparent;
}
.modern-table :deep(.q-table__top),
.modern-table :deep(.q-table__bottom) {
  background: rgba(255, 255, 255, 0.72);
}
.modern-table :deep(th) {
  height: 52px;
  border-bottom: 0;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
}
.modern-table :deep(td) {
  height: 58px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  color: #24352f;
}
.table-header-row {
  background: linear-gradient(90deg, #064e3b, #047857);
}
.approval-row {
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}
.approval-row:hover {
  transform: translateY(-3px);
  background: linear-gradient(90deg, rgba(240, 253, 244, 0.9), rgba(255, 255, 255, 0.98));
  box-shadow: 0 12px 26px rgba(15, 118, 110, 0.08);
  animation: hoverLift 220ms ease both;
}
.reference-cell {
  color: #075f49;
  font-weight: 900;
}
.client-cell {
  color: #1f2f2a;
  font-weight: 800;
}
.amount-cell {
  color: #0f513f;
  font-weight: 900;
}
.status-pill {
  min-width: 92px;
  justify-content: center;
  border-radius: 999px;
  font-weight: 900;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  animation: glowPulse 2.8s ease-in-out infinite;
}
.status-approved {
  color: #065f46;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-color: rgba(16, 185, 129, 0.24);
}
.status-rejected {
  color: #991b1b;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-color: rgba(239, 68, 68, 0.22);
}
.status-pending {
  color: #92400e;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: rgba(245, 158, 11, 0.26);
}
.action-btn {
  margin: 0 2px;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}
.action-btn:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}
.action-view {
  color: #0f766e;
  background: rgba(13, 148, 136, 0.08);
}
.action-approve {
  color: #047857;
  background: rgba(16, 185, 129, 0.1);
}
.action-reject {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.1);
}
.action-view:hover {
  background: rgba(13, 148, 136, 0.16);
}
.action-approve:hover {
  background: rgba(16, 185, 129, 0.18);
}
.action-reject:hover {
  background: rgba(239, 68, 68, 0.18);
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-10 {
  border-radius: 10px;
}
.border-teal {
  border: 1px solid #004d40;
}
.letter-paper {
  background: white;
  width: 210mm;
  min-height: 296mm;
  padding: 15mm;
  margin: 0 auto;
  color: #1a1a1a;
}
.final-divider {
  height: 3px;
  margin-top: 15px;
}
.letter-logo-box {
  width: 78px;
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.letter-logo {
  max-width: 78px;
  max-height: 58px;
  object-fit: contain;
  display: block;
}
.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.final-pro-table th,
.final-pro-table td {
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 11px;
}
.signature-pad-wrapper {
  height: 250px;
  background: #fcfdff;
  border-radius: 8px;
}
.signature-canvas {
  width: 100%;
  height: 100%;
}
.signature-container {
  width: 260px;
  margin-left: auto;
  text-align: center;
}
.final-sign-space {
  height: 78px;
  width: 100%;
  align-items: flex-end;
  justify-content: center;
  margin-top: 4px;
  margin-bottom: 2px;
}
.img-signature {
  max-width: 230px;
  max-height: 76px;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.signature-placeholder {
  border-bottom: 1px dashed #9e9e9e;
  width: 220px;
  padding-bottom: 8px;
  text-align: center;
}
.text-signer-final {
  line-height: 1.2;
}
.text-role-final {
  line-height: 1.2;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@keyframes floatIcon {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(1.5deg);
  }
}
@keyframes glowPulse {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(24px, 18px, 0) scale(1.12);
  }
}
@keyframes hoverLift {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 700px) {
  .approval-hero {
    padding: 22px;
    border-radius: 22px;
  }
  .hero-title-wrap {
    align-items: flex-start;
  }
  .lottie-shell {
    width: 78px;
    min-width: 78px;
    height: 78px;
    border-radius: 20px;
  }
  .hero-subtitle {
    font-size: 0.9rem;
  }
  .hero-stat-badge {
    width: 100%;
    justify-content: center;
  }
  .kpi-value {
    font-size: 1.7rem;
  }
}
@media print {
  .no-print {
    display: none !important;
  }
  .letter-paper {
    box-shadow: none !important;
    margin: 0;
    padding: 10mm;
  }
}
</style>
