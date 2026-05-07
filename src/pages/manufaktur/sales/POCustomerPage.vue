<template>
  <q-page class="bg-green-1 q-pa-md q-pa-lg-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          PO Customer
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Otorisasi Purchase Order Customer & Kendali Produksi</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Tinjau pesanan resmi dari customer dan berikan persetujuan untuk proses manufaktur.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
        <div class="text-caption text-grey-6 q-mb-xs uppercase tracking-widest font-bold">
          Menunggu Otorisasi
        </div>
        <q-badge color="orange-9" class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12">
          {{ manufacturRows.filter((r) => r.status === 'Pending').length }} PO Customer
        </q-badge>
      </div>
    </div>

    <!-- SEARCH & SUMMARY CARD -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="manufacturFilter"
              outlined
              dense
              rounded
              placeholder="Cari No. PO, Customer, atau Pemohon..."
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>
          <q-space />
          <q-btn flat round icon="refresh" color="green-10" @click="loadManufacturData" />
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE LIST SECTION -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="manufacturRows"
        :columns="manufacturColumns"
        row-key="id"
        flat
        :loading="manufacturLoading"
        :filter="manufacturFilter"
        binary-state-sort
        class="approval-table"
      >
        <!-- Custom Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
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
            @click="manufacturOpenPreview(props.row)"
          >
            <q-td key="nomor" class="text-weight-bolder text-green-10">
              {{ props.row.nomor }}
            </q-td>
            <q-td key="proyek_nama">
              <div class="text-weight-bold text-green-10 uppercase">
                {{ props.row.proyek_nama || props.row.customerName || props.row.customer_nama }}
              </div>
              <div class="text-caption text-grey-6 italic">
                Oleh: {{ props.row.pemohon?.nama || props.row.customerName || '-' }}
              </div>
              <div
                v-if="props.row.status === 'Rejected'"
                class="text-negative text-caption font-bold"
              >
                Alasan: {{ props.row.alasan_reject || '-' }}
              </div>
            </q-td>
            <q-td key="total_estimasi" class="text-right text-weight-bolder">
              <span class="text-caption text-grey-6 q-mr-xs">IDR</span>
              {{ (props.row.total_estimasi || props.row.total || 0).toLocaleString() }}
            </q-td>
            <q-td key="gudang_status" class="text-center">
              <q-chip
                text-color="white"
                size="sm"
                class="text-weight-bold shadow-sm"
                :color="manufacturGetGudangStatusColor(props.row.gudang_status)"
              >
                {{ manufacturGetGudangStatusLabel(props.row.gudang_status) }}
              </q-chip>
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                text-color="white"
                size="sm"
                class="text-weight-bold shadow-sm"
                :color="manufacturGetStatusColor(props.row.status)"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-xs">
                <template v-if="props.row.status === 'Pending'">
                  <q-btn
                    v-if="manufacturCanAction('approve')"
                    unelevated
                    rounded
                    color="positive"
                    icon="check"
                    label="Approve"
                    size="sm"
                    class="q-px-md"
                    @click="manufacturHandleApproval(props.row, 'Approved')"
                  />
                  <q-btn
                    v-if="manufacturCanAction('approve') || manufacturCanAction('ubah')"
                    outline
                    rounded
                    color="negative"
                    icon="close"
                    label="Reject"
                    size="sm"
                    class="q-px-md"
                    @click="manufacturPromptReject(props.row)"
                  />
                </template>
                <q-btn
                  flat
                  round
                  color="grey-6"
                  icon="visibility"
                  size="sm"
                  @click="manufacturOpenPreview(props.row)"
                />
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- PREVIEW & APPROVAL DIALOG -->
    <q-dialog
      v-model="manufacturShowPreview"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-green-10 q-py-sm no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold uppercase font-10"
            >Peninjauan Dokumen PO Customer</q-toolbar-title
          >

          <q-space />

          <q-btn
            v-if="manufacturSelectedData?.status === 'Pending' && manufacturCanAction('approve')"
            color="green-10"
            icon="draw"
            label="Bubuhkan Tanda Tangan"
            unelevated
            rounded
            class="q-mr-md"
            @click="manufacturShowPad = true"
          />

          <q-btn
            v-if="manufacturSelectedData?.status === 'Pending' && manufacturCanAction('approve')"
            unelevated
            color="positive"
            :icon="manufacturSelectedData.approve_signature_url ? 'verified' : 'check_circle'"
            :label="
              manufacturSelectedData.approve_signature_url
                ? 'KONFIRMASI APPROVAL'
                : 'APPROVE DOKUMEN'
            "
            @click="manufacturHandleApproval(manufacturSelectedData, 'Approved')"
            rounded
            class="text-weight-bold shadow-4"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-none q-pa-md-md flex flex-center preview-container">
          <div
            id="po-customer-print-area"
            class="letter-paper shadow-24"
            v-if="manufacturSelectedData"
          >
            <div class="row no-wrap items-center">
              <div v-if="manufacturSelectedData.logoUrl" class="col-auto q-mr-xl">
                <img :src="manufacturSelectedData.logoUrl" class="final-kop-img" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase">{{ manufacturSelectedData.nama_pt }}</div>
                <div class="final-pt-tagline italic text-grey-8">
                  {{ manufacturSelectedData.slogan_pt }}
                </div>
              </div>
            </div>
            <div class="final-divider"></div>
            <div class="row justify-end q-mt-md">
              <div class="col-auto text-right">
                <div class="quotation-title-pro uppercase">PURCHASE ORDER CUSTOMER</div>
                <div class="quotation-no-pro text-green-10 text-bold font-mono">
                  No. PO : {{ manufacturSelectedData.nomor || manufacturSelectedData.noPO }}
                </div>
              </div>
            </div>

            <div class="row q-mt-md q-mb-lg text-left text-body2">
              <div class="col-7">
                <table class="meta-info-table">
                  <tr>
                    <td class="text-bold label-meta">Customer</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-medium">
                      {{
                        manufacturSelectedData.customerName ||
                        manufacturSelectedData.customer_nama ||
                        manufacturSelectedData.kepada_yth
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">Project</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-bold text-green-10 uppercase">
                      {{ manufacturSelectedData.proyek_nama || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">No. Reff</td>
                    <td class="meta-separator">:</td>
                    <td>{{ manufacturSelectedData.no_reff || '-' }}</td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">Requestor</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-medium uppercase">
                      {{ manufacturSelectedData.pemohon?.nama || '-' }}
                    </td>
                  </tr>
                </table>
              </div>
              <div class="col-5 text-right">
                <div class="row no-wrap justify-end">
                  <div class="text-bold q-mr-md">Tanggal</div>
                  <div class="text-weight-bold">
                    :
                    {{ manufacturSelectedData.kota || '' }},
                    {{ manufacturFormatIndoDate(manufacturSelectedData.tanggal) }}
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
                  <th width="120">UNIT PRICE</th>
                  <th width="140">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in manufacturSelectedData.items || []" :key="i">
                  <td class="text-center">{{ i + 1 }}</td>
                  <td class="uppercase">{{ it.nama_barang || it.produk || it.nama || '-' }}</td>
                  <td class="text-center">{{ it.qty }}</td>
                  <td class="text-center uppercase text-caption">{{ it.satuan || '-' }}</td>
                  <td class="text-right">
                    {{ (it.harga || it.estimasi_harga || 0).toLocaleString() }}
                  </td>
                  <td class="text-right text-weight-bold">
                    {{ (it.total || 0).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="row-calculation">
                  <td colspan="5" class="text-right text-bold">Subtotal</td>
                  <td class="text-right text-bold">
                    IDR
                    {{
                      (
                        manufacturSelectedData.total_estimasi ||
                        manufacturSelectedData.total ||
                        0
                      ).toLocaleString()
                    }}
                  </td>
                </tr>
                <tr class="row-grand-total">
                  <td colspan="5" class="text-right text-bold uppercase">Grand Total Amount</td>
                  <td class="text-right text-white text-bold">
                    IDR
                    {{
                      (
                        manufacturSelectedData.total_estimasi ||
                        manufacturSelectedData.total ||
                        0
                      ).toLocaleString()
                    }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div class="signature-container text-left q-mt-xl">
              <div class="row q-mt-lg justify-between">
                <div class="col-5 text-left">
                  <div class="q-mb-xs text-body2 uppercase font-8 text-bold">Prepared By,</div>
                  <div class="final-sign-space text-left">
                    <img
                      v-if="manufacturSelectedData.signatureUrl"
                      :src="manufacturSelectedData.signatureUrl"
                      class="img-signature-clean"
                    />
                  </div>
                  <div class="text-signer-final text-weight-bolder underline uppercase">
                    {{ manufacturSelectedData.ttd_nama || '...................' }}
                  </div>
                </div>
                <div class="col-5 text-right">
                  <div class="q-mb-xs text-body2 uppercase font-8 text-bold">Approved By,</div>
                  <div class="final-sign-space text-right">
                    <img
                      v-if="manufacturSelectedData.approve_signature_url"
                      :src="manufacturSelectedData.approve_signature_url"
                      class="img-signature-clean"
                    />
                  </div>
                  <div
                    class="text-signer-final text-weight-bolder underline uppercase text-green-10"
                  >
                    {{
                      manufacturSelectedData.approve_nama ||
                      (manufacturSelectedData.status === 'Approved'
                        ? manufacturUserData?.nama
                        : '...................')
                    }}
                  </div>
                  <div class="text-role-final uppercase text-grey-8 text-caption font-bold block">
                    {{ manufacturSelectedData.approve_jabatan || 'Manager' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- SIGNATURE PAD FOR APPROVER -->
    <q-dialog v-model="manufacturShowPad" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 95vw" class="rounded-20 shadow-24">
        <q-card-section class="row items-center bg-green-10 text-white q-pa-md">
          <div class="text-h6 text-weight-bold uppercase font-10">
            Otorisasi Digital (Approved By)
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="signature-pad-wrapper shadow-inner bg-white border-subtle">
            <canvas ref="manufacturSignatureCanvas" class="signature-canvas"></canvas>
          </div>
          <div class="text-caption text-grey-7 q-mt-md text-center italic">
            Berikan tanda tangan persetujuan untuk PO Customer ini.
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Reset" color="grey-7" @click="manufacturClearPad" rounded />
          <q-btn
            unelevated
            label="Gunakan Tanda Tangan"
            color="green-10"
            @click="manufacturSaveApproverSignature"
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
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import SignaturePad from 'signature_pad'

// --- INITIALIZATION ---
const manufacturQ = useQuasar()
const manufacturAuthStore = useAuthStore()
const manufacturRows = ref([])
const manufacturLoading = ref(true)
const manufacturFilter = ref('')
const manufacturShowPreview = ref(false)
const manufacturShowPad = ref(false)
const manufacturSelectedData = ref(null)
const manufacturUserData = ref(null)
const manufacturConfig = ref({ kopUrl: '' })
const manufacturSignatureCanvas = ref(null)
let manufacturSignaturePad = null
let manufacturUnsubUser = null
let manufacturUnsubRows = null

const manufacturColumns = [
  { name: 'nomor', align: 'left', label: 'PO NUMBER', field: 'nomor', sortable: true },
  { name: 'proyek_nama', align: 'left', label: 'CUSTOMER / REQUESTOR', field: 'proyek_nama' },
  {
    name: 'total_estimasi',
    align: 'right',
    label: 'AMOUNT (IDR)',
    field: 'total_estimasi',
    sortable: true,
  },
  { name: 'gudang_status', align: 'center', label: 'GUDANG', field: 'gudang_status' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'ACTIONS' },
]

const manufacturGetStatusColor = (manufacturStatus) =>
  manufacturStatus === 'Approved'
    ? 'positive'
    : manufacturStatus === 'Rejected'
      ? 'negative'
      : manufacturStatus === 'Pending'
        ? 'orange-9'
        : 'grey-6'

const manufacturGetGudangStatusLabel = (manufacturStatus) => {
  const manufacturLabels = {
    READY_FOR_GUDANG: 'Siap Gudang',
    PR_DRAFT_CREATED: 'PR Draft',
    PR_UPDATED: 'PR Update',
    PR_PENDING_APPROVAL: 'PR Pending',
    PR_APPROVED: 'PR Approved',
    STOCK_OUT_PARTIAL: 'Parsial',
    STOCK_OUT_DONE: 'Selesai',
  }
  return manufacturLabels[manufacturStatus] || 'Belum Diproses'
}

const manufacturGetGudangStatusColor = (manufacturStatus) => {
  if (manufacturStatus === 'STOCK_OUT_DONE') return 'green-10'
  if (manufacturStatus === 'STOCK_OUT_PARTIAL') return 'orange-9'
  if (
    ['PR_DRAFT_CREATED', 'PR_UPDATED', 'PR_PENDING_APPROVAL', 'PR_APPROVED'].includes(
      manufacturStatus,
    )
  ) {
    return 'green-8'
  }
  if (manufacturStatus === 'READY_FOR_GUDANG') return 'blue-grey-7'
  return 'grey-6'
}

const manufacturCanAction = (manufacturActionType) => {
  if (manufacturAuthStore.user?.role === 'Super Admin') return true
  if (!manufacturUserData.value?.permissions_detail) return false
  const manufacturModulePerm = manufacturUserData.value.permissions_detail.find(
    (manufacturModule) => manufacturModule.id === 'manufaktur',
  )
  const manufacturMenu = manufacturModulePerm?.menus.find(
    (manufacturMenuItem) => manufacturMenuItem.id === 'sales/po-customer',
  )
  return manufacturMenu ? manufacturMenu[manufacturActionType] || false : false
}

const loadManufacturData = () => {
  manufacturLoading.value = true
  getDoc(doc(db, 'config_manufaktur', 'perusahaan')).then((manufacturSnap) => {
    if (manufacturSnap.exists()) manufacturConfig.value = manufacturSnap.data()
  })

  manufacturUnsubRows = onSnapshot(
    collection(db, 'purchase_order_manufactur'),
    (manufacturSnap) => {
      manufacturRows.value = manufacturSnap.docs
        .map((manufacturDoc) => ({ id: manufacturDoc.id, ...manufacturDoc.data() }))
        .filter((manufacturItem) => manufacturItem.status !== 'Draft')
        .sort(
          (manufacturA, manufacturB) =>
            (manufacturB.updatedAt?.seconds ||
              manufacturB.created_at?.seconds ||
              manufacturB.createdAt?.seconds ||
              0) -
            (manufacturA.updatedAt?.seconds ||
              manufacturA.created_at?.seconds ||
              manufacturA.createdAt?.seconds ||
              0),
        )
      manufacturLoading.value = false
    },
  )
}

const manufacturHandleApproval = (manufacturRow, manufacturStatus, manufacturAlasan = null) => {
  if (
    manufacturStatus === 'Approved' &&
    !manufacturRow.approve_signature_url &&
    !manufacturSignaturePad
  ) {
    manufacturQ.notify({ type: 'warning', message: 'Harap bubuhkan tanda tangan persetujuan!' })
    return
  }

  manufacturQ
    .dialog({
      title: 'Konfirmasi Approval',
      message: `Lanjutkan proses dokumen ini ke status ${manufacturStatus}?`,
      cancel: true,
      ok: {
        color: manufacturStatus === 'Approved' ? 'positive' : 'negative',
        unelevated: true,
        label: 'Ya, Proses',
      },
    })
    .onOk(async () => {
      try {
        const manufacturData = {
          status: manufacturStatus,
          updatedAt: serverTimestamp(),
          approve_nama: manufacturUserData.value?.nama || 'Admin Manufaktur',
          approve_jabatan: manufacturUserData.value?.jabatan || 'Manager',
          approve_at: serverTimestamp(),
          gudang_status: manufacturStatus === 'Approved' ? 'READY_FOR_GUDANG' : 'PO_REJECTED',
          gudang_sync_at: serverTimestamp(),
        }
        if (manufacturAlasan) manufacturData.alasan_reject = manufacturAlasan
        if (manufacturStatus === 'Approved' && manufacturRow.approve_signature_url) {
          manufacturData.approve_signature_url = manufacturRow.approve_signature_url
        }

        await updateDoc(doc(db, 'purchase_order_manufactur', manufacturRow.id), manufacturData)
        manufacturShowPreview.value = false
        manufacturQ.notify({
          type: 'positive',
          message: `PO Customer telah berhasil di-${manufacturStatus.toLowerCase()}`,
        })
      } catch (manufacturError) {
        console.error(manufacturError)
        manufacturQ.notify({ type: 'negative', message: 'Gagal memproses approval' })
      }
    })
}

const manufacturPromptReject = (manufacturRow) => {
  manufacturQ
    .dialog({
      title: 'Penolakan PO Customer',
      message: 'Berikan alasan penolakan atau instruksi revisi:',
      prompt: { model: '', type: 'textarea' },
      cancel: true,
      ok: { color: 'negative', label: 'Reject' },
    })
    .onOk((manufacturAlasan) =>
      manufacturHandleApproval(manufacturRow, 'Rejected', manufacturAlasan),
    )
}

const manufacturOpenPreview = (manufacturRow) => {
  manufacturSelectedData.value = manufacturRow
  manufacturShowPreview.value = true
}

// --- SIGNATURE LOGIC ---
watch(manufacturShowPad, async (manufacturValue) => {
  if (manufacturValue) {
    await nextTick()
    const manufacturCanvas = manufacturSignatureCanvas.value
    const manufacturRatio = Math.max(window.devicePixelRatio || 1, 1)
    manufacturCanvas.width = manufacturCanvas.offsetWidth * manufacturRatio
    manufacturCanvas.height = manufacturCanvas.offsetHeight * manufacturRatio
    manufacturCanvas.getContext('2d').scale(manufacturRatio, manufacturRatio)
    manufacturSignaturePad = new SignaturePad(manufacturCanvas, { penColor: '#000000' })
  }
})

const manufacturClearPad = () => manufacturSignaturePad?.clear()

const manufacturSaveApproverSignature = () => {
  if (!manufacturSignaturePad || manufacturSignaturePad.isEmpty()) return
  manufacturSelectedData.value.approve_signature_url = manufacturSignaturePad.toDataURL()
  manufacturShowPad.value = false
}

const manufacturFormatIndoDate = (manufacturDate) =>
  manufacturDate
    ? new Date(
        manufacturDate.seconds ? manufacturDate.seconds * 1000 : manufacturDate,
      ).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

// eslint-disable-next-line no-unused-vars
const manufacturPrintPage = () => window.print()

onMounted(() => {
  loadManufacturData()
  const manufacturEmail = manufacturAuthStore.user?.email
  if (manufacturEmail) {
    const manufacturUserQuery = query(
      collection(db, 'karyawan_manufaktur'),
      where('email', '==', manufacturEmail),
    )
    manufacturUnsubUser = onSnapshot(manufacturUserQuery, (manufacturSnap) => {
      if (!manufacturSnap.empty) manufacturUserData.value = manufacturSnap.docs[0].data()
    })
  }
})

onUnmounted(() => {
  if (manufacturUnsubUser) manufacturUnsubUser()
  if (manufacturUnsubRows) manufacturUnsubRows()
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
  background-color: rgba(27, 94, 32, 0.04) !important;
}
.transition-all {
  transition: all 0.3s ease;
}

/* SIGNATURE PAD */
.signature-pad-wrapper {
  border: 2px dashed #1b5e20;
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
  color: #1b5e20;
  letter-spacing: 0;
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
  background: #1b5e20;
  margin-top: 15px;
  border-bottom: 1px solid #1b5e20;
}
.quotation-title-pro {
  font-size: 20px;
  font-weight: 900;
  color: #1b5e20;
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
  border: 1.5px solid #1b5e20;
}
.final-pro-table th {
  background: #1b5e20 !important;
  color: white !important;
  padding: 10px 8px;
  font-size: 10px;
  font-weight: 900;
  text-align: center;
  border: 1px solid #1b5e20;
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
  border: 1px solid #1b5e20 !important;
  background: #1b5e20;
}
.terms-container {
  border: 1.5px solid #1b5e20;
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
}
.terms-header {
  background: #1b5e20;
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
  color: #1b5e20;
  border-bottom: 2.5px solid #1b5e20;
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
    background-color: #1b5e20 !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
