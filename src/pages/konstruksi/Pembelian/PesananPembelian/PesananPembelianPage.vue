<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-lg-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
          Approval & Pesanan Pembelian
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Otorisasi Purchase Request & Kendali PO</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Tinjau permintaan material dari lapangan dan berikan persetujuan untuk penerbitan PO.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
        <div class="text-caption text-grey-6 q-mb-xs uppercase tracking-widest font-bold">
          Menunggu Otorisasi
        </div>
        <q-badge color="orange-9" class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12">
          {{ rows.filter((r) => r.status === 'Pending').length }} Purchase Request
        </q-badge>
      </div>
    </div>

    <!-- SEARCH & SUMMARY CARD -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari No. PR, Proyek, atau Pemohon..."
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>
          <q-space />
          <q-btn flat round icon="refresh" color="primary" @click="fetchData" />
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE LIST SECTION (Logic Mirip ApprovalPenawaranPage) -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="approval-table"
      >
        <!-- Custom Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-indigo-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase font-10"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom Body -->
        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="openPreview(props.row)"
          >
            <q-td key="nomor" class="text-weight-bolder text-indigo-10">
              {{ props.row.nomor }}
            </q-td>
            <q-td key="proyek_nama">
              <div class="text-weight-bold text-blue-grey-9 uppercase">
                {{ props.row.proyek_nama }}
              </div>
              <div class="text-caption text-grey-6 italic">Oleh: {{ props.row.pemohon?.nama }}</div>
              <div
                v-if="props.row.status === 'Rejected'"
                class="text-negative text-caption font-bold"
              >
                Alasan: {{ props.row.alasan_reject || '-' }}
              </div>
            </q-td>
            <q-td key="total_estimasi" class="text-right text-weight-bolder">
              <span class="text-caption text-grey-6 q-mr-xs">IDR</span>
              {{ (props.row.total_estimasi || 0).toLocaleString() }}
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                text-color="white"
                size="sm"
                class="text-weight-bold shadow-sm"
                :color="getStatusColor(props.row.status)"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-xs">
                <template v-if="props.row.status === 'Pending'">
                  <q-btn
                    v-if="canAction('approve')"
                    unelevated
                    rounded
                    color="positive"
                    icon="check"
                    label="Approve"
                    size="sm"
                    class="q-px-md"
                    @click="handleApproval(props.row, 'Approved')"
                  />
                  <q-btn
                    v-if="canAction('approve') || canAction('ubah')"
                    outline
                    rounded
                    color="negative"
                    icon="close"
                    label="Reject"
                    size="sm"
                    class="q-px-md"
                    @click="promptReject(props.row)"
                  />
                </template>
                <q-btn
                  flat
                  round
                  color="grey-6"
                  icon="visibility"
                  size="sm"
                  @click="openPreview(props.row)"
                />
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- PREVIEW & APPROVAL DIALOG (Gaya Profesional) -->
    <q-dialog
      v-model="showPreview"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-indigo-10 q-py-sm no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold uppercase font-10"
            >Peninjauan Dokumen Purchase Request</q-toolbar-title
          >

          <q-space />

          <!-- Signature Pad Trigger -->
          <q-btn
            v-if="selectedData?.status === 'Pending' && canAction('approve')"
            color="indigo-10"
            icon="draw"
            label="Bubuhkan Tanda Tangan"
            unelevated
            rounded
            class="q-mr-md"
            @click="showPad = true"
          />

          <q-btn
            v-if="selectedData?.status === 'Pending' && canAction('approve')"
            unelevated
            color="positive"
            :icon="selectedData.signatureUrl ? 'verified' : 'check_circle'"
            :label="selectedData.signatureUrl ? 'KONFIRMASI APPROVAL' : 'APPROVE DOKUMEN'"
            @click="handleApproval(selectedData, 'Approved')"
            rounded
            class="text-weight-bold shadow-4"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-none q-pa-md-md flex flex-center preview-container">
          <!-- Area Cetak / Preview Surat (Identik dengan Desain Terakhir) -->
          <div id="pr-print-area" class="letter-paper shadow-24" v-if="selectedData">
            <!-- ... (Kodingan Kop Surat & Meta Data tetap sama seperti yang sudah kita buat sebelumnya) ... -->
            <div class="row no-wrap items-center">
              <div v-if="selectedData.logoUrl" class="col-auto q-mr-xl">
                <img :src="selectedData.logoUrl" class="final-kop-img" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase">{{ selectedData.nama_pt }}</div>
                <div class="final-pt-tagline italic text-grey-8">{{ selectedData.slogan_pt }}</div>
              </div>
            </div>
            <div class="final-divider"></div>
            <div class="row justify-end q-mt-md">
              <div class="col-auto text-right">
                <div class="quotation-title-pro uppercase">PURCHASE REQUEST</div>
                <div class="quotation-no-pro text-indigo-10 text-bold font-mono">
                  No. Pr : {{ selectedData.nomor }}
                </div>
              </div>
            </div>
            <!-- Meta info alignment rapi -->
            <div class="row q-mt-md q-mb-lg text-left text-body2">
              <div class="col-7">
                <table class="meta-info-table">
                  <tr>
                    <td class="text-bold label-meta">Kepada Yth</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-medium">{{ selectedData.kepada_yth }}</td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">Gudang / Project</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-bold text-indigo-10 uppercase">
                      {{ selectedData.proyek_nama }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">No. Reff</td>
                    <td class="meta-separator">:</td>
                    <td>{{ selectedData.no_reff || '-' }}</td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">Requestor</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-medium uppercase">{{ selectedData.pemohon?.nama }}</td>
                  </tr>
                </table>
              </div>
              <div class="col-5 text-right">
                <div class="row no-wrap justify-end">
                  <div class="text-bold q-mr-md">Tanggal</div>
                  <div class="text-weight-bold">
                    : {{ selectedData.kota }}, {{ formatIndoDate(selectedData.tanggal) }}
                  </div>
                </div>
              </div>
            </div>

            <table class="final-pro-table full-width">
              <thead>
                <tr>
                  <th width="40">NO</th>
                  <th>ITEM DESCRIPTION</th>
                  <th width="60">QTY</th>
                  <th width="60">UNIT</th>
                  <th width="120">est UNIT PRICE</th>
                  <th width="140">est AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in selectedData.items" :key="i">
                  <td class="text-center">{{ i + 1 }}</td>
                  <td class="uppercase">{{ it.nama_barang }}</td>
                  <td class="text-center">{{ it.qty }}</td>
                  <td class="text-center uppercase text-caption">{{ it.satuan }}</td>
                  <td class="text-right">{{ (it.estimasi_harga || 0).toLocaleString() }}</td>
                  <td class="text-right text-weight-bold">
                    {{ (it.total || 0).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="row-calculation">
                  <td colspan="5" class="text-right text-bold">Subtotal</td>
                  <td class="text-right text-bold">
                    IDR {{ selectedData.total_estimasi.toLocaleString() }}
                  </td>
                </tr>
                <tr class="row-grand-total">
                  <td colspan="5" class="text-right text-bold uppercase">Grand Total Amount</td>
                  <td class="text-right text-white text-bold">
                    IDR {{ selectedData.total_estimasi.toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Signature Display for Approval -->
            <div class="signature-container text-left q-mt-xl">
              <div class="row q-mt-lg justify-between">
                <!-- Requestor Sign -->
                <div class="col-5 text-left">
                  <div class="q-mb-xs text-body2 uppercase font-8 text-bold">
                    Prepared By (Requestor),
                  </div>
                  <div class="final-sign-space text-left">
                    <img
                      v-if="selectedData.signatureUrl"
                      :src="selectedData.signatureUrl"
                      class="img-signature-clean"
                    />
                  </div>
                  <div class="text-signer-final text-weight-bolder underline uppercase">
                    {{ selectedData.ttd_nama }}
                  </div>
                </div>
                <!-- Approver Sign -->
                <div class="col-5 text-right">
                  <div class="q-mb-xs text-body2 uppercase font-8 text-bold">Approved By,</div>
                  <div class="final-sign-space text-right">
                    <img
                      v-if="selectedData.approve_signature_url"
                      :src="selectedData.approve_signature_url"
                      class="img-signature-clean"
                    />
                  </div>
                  <div
                    class="text-signer-final text-weight-bolder underline uppercase text-indigo-10"
                  >
                    {{
                      selectedData.approve_nama ||
                      (selectedData.status === 'Approved' ? userData?.nama : '...................')
                    }}
                  </div>
                  <div class="text-role-final uppercase text-grey-8 text-caption font-bold block">
                    {{ selectedData.approve_jabatan || 'Project Manager' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- SIGNATURE PAD FOR APPROVER -->
    <q-dialog v-model="showPad" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 95vw" class="rounded-20 shadow-24">
        <q-card-section class="row items-center bg-indigo-10 text-white q-pa-md">
          <div class="text-h6 text-weight-bold uppercase font-10">
            Otorisasi Digital (Approved By)
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="signature-pad-wrapper shadow-inner bg-white border-subtle">
            <canvas ref="signatureCanvas" class="signature-canvas"></canvas>
          </div>
          <div class="text-caption text-grey-7 q-mt-md text-center italic">
            Berikan tanda tangan persetujuan untuk pengadaan ini.
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Reset" color="grey-7" @click="clearPad" rounded />
          <q-btn
            unelevated
            label="Gunakan Tanda Tangan"
            color="indigo-10"
            @click="saveApproverSignature"
            rounded
            class="q-px-xl text-weight-bold"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  // eslint-disable-next-line no-unused-vars
  getDocs,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import SignaturePad from 'signature_pad'

// --- INITIALIZATION ---
const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const loading = ref(true)
const filter = ref('')
const showPreview = ref(false)
const showPad = ref(false)
const selectedData = ref(null)
const userData = ref(null)
const config = ref({ kopUrl: '' })
const signatureCanvas = ref(null)
let signaturePad = null
let unsubUser = null
let unsubRows = null

const columns = [
  { name: 'nomor', align: 'left', label: 'PR NUMBER', field: 'nomor', sortable: true },
  { name: 'proyek_nama', align: 'left', label: 'PROJECT / REQUESTOR', field: 'proyek_nama' },
  {
    name: 'total_estimasi',
    align: 'right',
    label: 'AMOUNT (IDR)',
    field: 'total_estimasi',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'ACTIONS' },
]

const getStatusColor = (s) =>
  s === 'Approved'
    ? 'positive'
    : s === 'Rejected'
      ? 'negative'
      : s === 'Pending'
        ? 'orange-9'
        : 'blue-grey-6'

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  const menu = modulePerm?.menus.find((m) => m.id === '_konstruksi_pembelian_pesanan')
  return menu ? menu[actionType] || false : false
}

const fetchData = () => {
  loading.value = true
  getDoc(doc(db, 'config', 'perusahaan')).then((s) => {
    if (s.exists()) config.value = s.data()
  })

  // Ambil data Purchase Request dengan status Pending/Approved/Rejected untuk di-review
  unsubRows = onSnapshot(collection(db, 'permintaan_barang'), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    rows.value = all
      .filter((it) => it.tipe === 'PURCHASE_REQUEST' && it.status !== 'Draft')
      .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
    loading.value = false
  })
}

const handleApproval = (row, status, alasan = null) => {
  if (status === 'Approved' && !row.approve_signature_url && !signaturePad) {
    $q.notify({ type: 'warning', message: 'Harap bubuhkan tanda tangan persetujuan!' })
    return
  }

  $q.dialog({
    title: 'Konfirmasi Approval',
    message: `Lanjutkan proses dokumen ini ke status ${status}?`,
    cancel: true,
    ok: {
      color: status === 'Approved' ? 'positive' : 'negative',
      unelevated: true,
      label: 'Ya, Proses',
    },
  }).onOk(async () => {
    try {
      const data = {
        status: status,
        updatedAt: serverTimestamp(),
        approve_nama: userData.value?.nama || 'Admin Logistik',
        approve_jabatan: userData.value?.jabatan || 'Manager',
        approve_at: serverTimestamp(),
      }
      if (alasan) data.alasan_reject = alasan
      // Jika statusnya approved, kita pasang TTD yang baru di-gurat
      if (status === 'Approved' && row.approve_signature_url)
        data.approve_signature_url = row.approve_signature_url

      await updateDoc(doc(db, 'permintaan_barang', row.id), data)
      showPreview.value = false
      $q.notify({ type: 'positive', message: `PR telah berhasil di-${status.toLowerCase()}` })
    } catch (e) {
      console.error(e)
    }
  })
}

const promptReject = (row) => {
  $q.dialog({
    title: 'Penolakan PR',
    message: 'Berikan alasan penolakan atau instruksi revisi:',
    prompt: { model: '', type: 'textarea' },
    cancel: true,
    ok: { color: 'negative', label: 'Reject' },
  }).onOk((a) => handleApproval(row, 'Rejected', a))
}

const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
}

// --- SIGNATURE LOGIC ---
watch(showPad, async (v) => {
  if (v) {
    await nextTick()
    const c = signatureCanvas.value
    const r = Math.max(window.devicePixelRatio || 1, 1)
    c.width = c.offsetWidth * r
    c.height = c.offsetHeight * r
    c.getContext('2d').scale(r, r)
    signaturePad = new SignaturePad(c, { penColor: '#000000' })
  }
})
const clearPad = () => signaturePad?.clear()
const saveApproverSignature = () => {
  if (!signaturePad || signaturePad.isEmpty()) return
  selectedData.value.approve_signature_url = signaturePad.toDataURL()
  showPad.value = false
}

const formatIndoDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
// eslint-disable-next-line no-unused-vars
const printPage = () => window.print()

onMounted(() => {
  fetchData()
  const email = authStore.user?.email
  if (email) {
    const q = query(collection(db, 'karyawan'), where('email', '==', email))
    unsubUser = onSnapshot(q, (s) => {
      if (!s.empty) userData.value = s.docs[0].data()
    })
  }
})
onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubRows) unsubRows()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.uppercase {
  text-transform: uppercase;
}
.font-10 {
  font-size: 10px;
}
.font-8 {
  font-size: 9px;
}
.approval-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 16px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s ease;
}

/* SIGNATURE PAD */
.signature-pad-wrapper {
  border: 2px dashed #1a237e;
  border-radius: 12px;
  height: 200px;
  width: 100%;
}
.signature-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

/* PREVIEW DOC */
.letter-paper {
  background: white;
  width: 210mm;
  min-height: 296mm;
  padding: 15mm 20mm;
  margin: 0 auto;
  color: #1a1a1a;
  line-height: 1.5;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.final-kop-img {
  height: 75px;
  width: auto;
  object-fit: contain;
}
.final-pt-name {
  font-size: 24px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: -1px;
  line-height: 1;
}
.final-pt-tagline {
  font-size: 10px;
  color: #555;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}
.final-divider {
  height: 4px;
  background: #1a237e;
  margin-top: 15px;
  border-bottom: 1px solid #1a237e;
}
.quotation-title-pro {
  font-size: 20px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: 2px;
  border-bottom: 2px solid #f0f0f0;
  display: inline-block;
}
.quotation-no-pro {
  font-size: 12px;
  font-weight: 800;
  margin-top: 4px;
}
.meta-info-table td {
  padding: 3px 0;
  font-size: 12px;
  vertical-align: top;
}
.label-meta {
  width: 125px;
  color: #555;
}
.meta-separator {
  width: 15px;
  text-align: center;
}
.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border: 1.5px solid #1a237e;
}
.final-pro-table th {
  background: #1a237e !important;
  color: white !important;
  padding: 10px 8px;
  font-size: 10px;
  font-weight: 900;
  text-align: center;
  border: 1px solid #1a237e;
}
.final-pro-table td {
  padding: 8px 10px;
  border: 1px solid #ddd;
  font-size: 11.5px;
  color: #111;
}
.row-calculation td {
  padding: 6px 12px !important;
  border: 1px solid #ddd !important;
  font-size: 10.5px;
  background: #f9fafb;
}
.row-grand-total td {
  padding: 12px 12px !important;
  color: white !important;
  border: 1px solid #1a237e !important;
  background: #1a237e;
}
.terms-container {
  border: 1.5px solid #1a237e;
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
}
.terms-header {
  background: #1a237e;
  padding: 6px 12px;
  font-weight: 900;
  color: white;
  font-size: 10.5px;
  letter-spacing: 1px;
}
.terms-content-box {
  padding: 8px 12px;
  font-size: 10.5px;
  color: #333;
}
.signature-container {
  margin-top: auto;
  padding-top: 30px;
}
.final-sign-space {
  height: 80px;
  position: relative;
}
.img-signature-clean {
  max-height: 80px;
  max-width: 200px;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.text-signer-final {
  font-size: 14px;
  font-weight: 900;
  color: #1a237e;
  border-bottom: 2.5px solid #1a237e;
  display: inline-block;
  padding: 0 8px;
  min-width: 170px;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  .letter-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
  }
  .final-pro-table th,
  .row-grand-total,
  .terms-header {
    background-color: #1a237e !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
