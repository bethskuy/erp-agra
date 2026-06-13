<template>
  <div v-if="activeRow" class="incoming-detail-summary q-mb-lg">
    <div class="row justify-end q-gutter-sm q-mb-sm no-print">
      <q-btn
        unelevated
        rounded
        color="white"
        text-color="green-10"
        icon="print"
        label="Cetak PDF"
        no-caps
        class="shadow-1 q-px-md"
        @click="printDetailPdf"
      />
      <q-btn
        unelevated
        rounded
        color="green-10"
        icon="download"
        label="Download PDF"
        no-caps
        class="shadow-1 q-px-md"
        @click="downloadDetailPdf"
      />
    </div>

    <q-card ref="detailPdfRef" flat bordered class="detail-summary-card rounded-20 bg-white">
      <q-card-section class="detail-header-compact">
        <div class="document-company-row">
          <div class="document-brand">
            <div class="company-logo-frame">
              <img v-if="companyLogoSrc" :src="companyLogoSrc" :alt="companyLogoAlt" class="company-logo-img" />
              <div v-else class="company-logo-fallback">LOGO</div>
            </div>
            <div class="company-identity">
              <div class="company-name">{{ companyName }}</div>
              <div class="company-subtitle">Dokumen Penerimaan Material</div>
            </div>
          </div>
          <div class="detail-status-wrap">
            <q-badge :color="statusTone(activeRow)" class="detail-status-badge">
              {{ statusLabel(getStatus(activeRow)) }}
            </q-badge>
          </div>
        </div>

        <div class="document-title-block">
          <div class="document-title">SURAT PENERIMAAN MATERIAL</div>
          <div class="document-meta-grid">
            <div class="document-meta-cell">
              <div class="document-meta-label">Nomor Surat Jalan</div>
              <div class="document-number">{{ getSuratJalan(activeRow) }}</div>
            </div>
            <div class="document-meta-cell document-meta-cell--right">
              <div class="document-meta-label">Tanggal Masuk</div>
              <div class="document-date">{{ incomingDateLabel }}</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <div class="clean-divider"></div>

      <q-card-section class="detail-section">
        <div class="document-info-grid">
          <div class="detail-info-cell">
            <div class="detail-info-label">Supplier</div>
            <div class="detail-info-value">{{ getSupplier(activeRow) }}</div>
          </div>
          <div class="detail-info-cell">
            <div class="detail-info-label">Checker QC</div>
            <div class="detail-info-value">{{ getChecker(activeRow) }}</div>
          </div>
          <div class="detail-info-cell">
            <div class="detail-info-label">Status Incoming</div>
            <div class="detail-info-value">{{ statusLabel(getStatus(activeRow)) }}</div>
          </div>
          <div class="detail-info-cell">
            <div class="detail-info-label">Material Utama</div>
            <div class="detail-info-value">{{ getMaterial(activeRow) }}</div>
          </div>
        </div>
      </q-card-section>

      <div class="clean-divider clean-divider--inset"></div>

      <q-card-section class="detail-section">
        <div class="section-heading">Daftar Material</div>
        <q-markup-table flat dense class="pdf-items-table">
          <thead>
            <tr>
              <th class="text-center">No</th>
              <th class="text-left">Nama Barang</th>
              <th class="text-left">Kategori</th>
              <th class="text-right">Qty SJ</th>
              <th class="text-right">Qty Actual</th>
              <th class="text-right">Selisih</th>
              <th class="text-left">QC</th>
              <th class="text-left">Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in activeItems" :key="`${item.nama_barang}-${index}`">
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-weight-bold">{{ item.nama_barang || '-' }}</td>
              <td>{{ item.kategori_material || '-' }}</td>
              <td class="text-right">{{ formatNumber(item.qty_surat_jalan) }} {{ item.satuan || 'PCS' }}</td>
              <td class="text-right">{{ formatNumber(item.qty_actual) }} {{ item.satuan || 'PCS' }}</td>
              <td class="text-right">{{ formatNumber(item.selisih_qty) }}</td>
              <td>{{ item.status_qc || item.kondisi_barang || '-' }}</td>
              <td>{{ item.catatan || '-' }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>

      <div class="clean-divider clean-divider--inset"></div>

      <q-card-section class="detail-section">
        <div class="section-heading">Approval Incoming</div>
        <div class="approval-strip">
          <div v-for="approval in approvalColumns" :key="approval.role" class="approval-column">
            <div class="approval-role">{{ approval.role }}</div>
            <div class="approval-signature-line"></div>
            <div class="approval-name">{{ approval.name }}</div>
            <div class="approval-position">{{ approval.position }}</div>
            <div class="approval-timestamp">{{ approval.timestamp }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <div v-else class="incoming-summary row q-col-gutter-md q-mb-lg">
    <div v-for="card in cards" :key="card.key" class="col-12 col-sm-6 col-lg">
      <q-card flat bordered class="summary-card glass-card rounded-20 shadow-1">
        <q-card-section class="summary-content">
          <div class="row items-start no-wrap">
            <div class="summary-icon" :class="`summary-icon--${card.tone}`">
              <q-icon :name="card.icon" size="22px" />
            </div>

            <div class="col min-width-0">
              <div class="row items-center justify-between no-wrap q-gutter-sm">
                <div class="summary-label">{{ card.label }}</div>
                <q-chip dense square :color="card.color" text-color="white" class="summary-chip">
                  {{ card.chip }}
                </q-chip>
              </div>

              <template v-if="loading">
                <q-skeleton dark type="text" width="72px" height="34px" class="q-mt-sm" />
                <q-skeleton dark type="text" width="120px" height="16px" />
              </template>
              <template v-else>
                <div class="summary-value">{{ card.value }}</div>
                <div class="summary-caption">{{ card.caption }}</div>
              </template>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const detailPdfRef = ref(null)

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  activeRow: {
    type: Object,
    default: null,
  },
})

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const getStatus = (row) => row?.status || row?.status_validation || row?.status_incoming || row?.status_qc || ''
const getSuratJalan = (row) => row?.nomor_surat_jalan || row?.noSuratJalan || '-'
const getSupplier = (row) => row?.supplier || row?.asal || '-'
const getChecker = (row) => row?.checker_qc || row?.qc_checker || row?.checker || row?.checker_gudang || '-'

const getAuditName = (value, fallback = '-') => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value.nama || value.name || value.displayName || value.email || fallback
}

const getAuditPosition = (value, fallback = '-') => {
  if (!value || typeof value === 'string') return fallback
  return value.jabatan || value.posisi || value.role || value.divisi || value.department || fallback
}

const normalizeItem = (item = {}) => {
  const qtySj = Number(item.qty_surat_jalan ?? item.qtySJ ?? item.qty ?? 0)
  const qtyActual = Number(item.qty_actual ?? item.qtyActual ?? item.quantity ?? 0)
  return {
    ...item,
    nama_barang: item.nama_barang || item.nama_material || item.material || '',
    kategori_material: item.kategori_material || item.tipe_material || '',
    satuan: item.satuan || 'PCS',
    qty_surat_jalan: qtySj,
    qty_actual: qtyActual,
    selisih_qty: Number(item.selisih_qty ?? qtyActual - qtySj),
    status_qc: item.status_qc || item.qc_status || '',
    kondisi_barang: item.kondisi_barang || '',
    catatan: item.catatan || item.catatan_incoming || item.defect_note || '',
  }
}

const getItems = (row) => {
  if (Array.isArray(row?.items) && row.items.length) return row.items.map(normalizeItem)
  return [
    normalizeItem({
      nama_barang: row?.nama_barang || row?.nama_material || row?.tipe_material || '',
      kategori_material: row?.kategori_material || row?.tipe_material || '',
      satuan: row?.satuan || 'PCS',
      qty_surat_jalan: row?.qty_surat_jalan ?? row?.qty ?? row?.qtySJ ?? row?.quantity ?? 0,
      qty_actual: row?.qty_actual ?? row?.qtyActual ?? row?.quantity ?? 0,
      selisih_qty: row?.selisih_qty,
      status_qc: row?.status_qc || row?.qc_status,
      kondisi_barang: row?.kondisi_barang,
      catatan: row?.catatan || row?.catatan_incoming || row?.defect_note,
    }),
  ]
}

const activeRow = computed(() => props.activeRow)
const activeItems = computed(() => (activeRow.value ? getItems(activeRow.value) : []))
const companyLogo = computed(
  () => activeRow.value?.company_logo || activeRow.value?.company_logo_base64 || activeRow.value?.logo_perusahaan || null,
)
const companyLogoSrc = computed(() => (typeof companyLogo.value === 'string' ? companyLogo.value : companyLogo.value?.base64 || companyLogo.value?.url || ''))
const companyLogoAlt = computed(() => (typeof companyLogo.value === 'object' && companyLogo.value?.name ? companyLogo.value.name : 'Logo perusahaan'))
const companyName = computed(
  () =>
    activeRow.value?.company_name ||
    activeRow.value?.nama_perusahaan ||
    activeRow.value?.perusahaan ||
    'PT AGRA',
)
const incomingDateLabel = computed(() =>
  formatDateTime(activeRow.value?.tanggal_masuk || activeRow.value?.incoming_timestamp || activeRow.value?.created_at),
)
const getMaterial = (row) => {
  const items = getItems(row)
  if (items.length > 1) return `${items[0]?.nama_barang || '-'} +${items.length - 1} item`
  return items[0]?.nama_barang || row?.nama_barang || row?.nama_material || '-'
}

const getQtyIncoming = (row) => {
  if (Array.isArray(row?.items) && row.items.length) {
    return row.items.reduce((sum, item) => sum + Number(item.qty_actual ?? item.qtyActual ?? item.quantity ?? 0), 0)
  }
  return Number(row?.qty_actual ?? row?.qty ?? row?.qty_surat_jalan ?? row?.quantity ?? 0)
}

const isPendingQc = (row) =>
  [
    'MENUNGGU_VALIDASI',
    'BARANG_DATANG',
    'VALIDASI_GUDANG',
    'QC_PENDING',
    'PARTIAL',
    'PENDING_QC',
  ].includes(getStatus(row))

const isReject = (row) =>
  ['INCOMING_REJECT', 'REJECTED', 'QC_NG', 'Reject', 'REJECT'].includes(getStatus(row)) ||
  Number(row?.qty_ng || 0) > 0

const isDone = (row) => ['VALIDASI_SELESAI', 'SELESAI', 'QC_OK', 'Sesuai', 'DONE'].includes(getStatus(row))

const statusLabel = (status) =>
  ({
    MENUNGGU_VALIDASI: 'Menunggu Validasi',
    BARANG_DATANG: 'Barang Datang',
    VALIDASI_QC: 'QC Incoming',
    VALIDASI_SELESAI: 'Validasi Selesai',
    PARTIAL: 'Partial',
    INCOMING_REJECT: 'Incoming Reject',
    REJECTED: 'Rejected',
    DISTRIBUSI_MATERIAL: 'Distribusi Material',
    QC_OK: 'QC OK',
    QC_NG: 'QC NG',
    SELESAI: 'Selesai',
  })[status] || String(status || '-').replace(/_/g, ' ')

const statusTone = (row) => {
  if (isReject(row)) return 'negative'
  if (isDone(row)) return 'positive'
  if (isPendingQc(row)) return 'orange-9'
  return 'green-10'
}

const toDate = (value) => {
  if (!value) return null
  if (value.toDate) return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDateTime = (value) => {
  const date = toDate(value)
  if (!date) return '-'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const validationTimestamp = computed(
  () =>
    activeRow.value?.last_status_at ||
    activeRow.value?.updated_at ||
    activeRow.value?.incoming_timestamp ||
    activeRow.value?.created_at,
)

const approvalTimestamp = computed(
  () =>
    activeRow.value?.approved_at ||
    activeRow.value?.approve_at ||
    activeRow.value?.approval_at ||
    activeRow.value?.validated_at ||
    validationTimestamp.value,
)

const approvalColumns = computed(() => {
  const row = activeRow.value || {}
  const creator = row.created_by || row.createdBy || row.created_by_user
  const approver =
    row.approved_by ||
    row.approve_by ||
    row.approver ||
    row.approvedBy ||
    row.approve_nama ||
    row.updated_by ||
    null

  return [
    {
      role: 'Dibuat Oleh',
      name: getAuditName(creator, row.createdBy || row.created_by_name || '-'),
      position: getAuditPosition(creator, row.created_by_divisi || 'Warehouse / Produksi'),
      timestamp: formatDateTime(row.created_at || row.incoming_timestamp),
    },
    {
      role: 'Checker QC',
      name: getChecker(row),
      position: row.checker_jabatan || row.qc_jabatan || row.checker_divisi || 'Quality Control',
      timestamp: formatDateTime(validationTimestamp.value),
    },
    {
      role: 'Disetujui Oleh',
      name: getAuditName(approver, row.approve_nama || row.approved_by_name || '-'),
      position: row.approve_jabatan || row.approved_by_jabatan || row.approver_jabatan || 'Supervisor / Manager',
      timestamp: formatDateTime(approvalTimestamp.value),
    },
  ]
})

const pdfFilename = computed(() => `Incoming-${getSuratJalan(activeRow.value).replace(/[\\/]/g, '-')}.pdf`)

const pdfOptions = computed(() => ({
  margin: 8,
  filename: pdfFilename.value,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, letterRendering: true },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
}))

const getPdfElement = () => detailPdfRef.value?.$el || detailPdfRef.value

const downloadDetailPdf = async () => {
  const element = getPdfElement()
  if (!element) return
  $q.loading.show({ message: 'Menyiapkan PDF incoming...' })
  try {
    await html2pdf().set(pdfOptions.value).from(element).save()
    $q.notify({ type: 'positive', message: 'PDF incoming berhasil diunduh' })
  } finally {
    $q.loading.hide()
  }
}

const printDetailPdf = async () => {
  const element = getPdfElement()
  if (!element) return
  $q.loading.show({ message: 'Menyiapkan PDF incoming...' })
  try {
    const blobUrl = await html2pdf().set(pdfOptions.value).from(element).outputPdf('bloburl')
    window.open(blobUrl, '_blank')
  } finally {
    $q.loading.hide()
  }
}

const stats = computed(() =>
  props.rows.reduce(
    (acc, row) => {
      acc.total += 1
      if (isPendingQc(row) && !isReject(row) && !isDone(row)) acc.pendingQc += 1
      if (isReject(row)) acc.reject += 1
      if (isDone(row)) acc.done += 1
      acc.qtyIncoming += getQtyIncoming(row)
      return acc
    },
    {
      total: 0,
      pendingQc: 0,
      reject: 0,
      done: 0,
      qtyIncoming: 0,
    },
  ),
)

const cards = computed(() => [
  {
    key: 'total',
    label: 'Total Incoming',
    value: formatNumber(stats.value.total),
    caption: 'Dokumen material masuk',
    chip: 'ALL',
    icon: 'inventory_2',
    color: 'cyan-9',
    tone: 'green',
  },
  {
    key: 'pending',
    label: 'Pending QC',
    value: formatNumber(stats.value.pendingQc),
    caption: 'Menunggu validasi checker',
    chip: 'QC',
    icon: 'pending_actions',
    color: 'orange-9',
    tone: 'orange',
  },
  {
    key: 'reject',
    label: 'Reject',
    value: formatNumber(stats.value.reject),
    caption: 'Material tidak lolos incoming',
    chip: 'NG',
    icon: 'report_problem',
    color: 'red-9',
    tone: 'red',
  },
  {
    key: 'done',
    label: 'Selesai',
    value: formatNumber(stats.value.done),
    caption: 'Incoming tervalidasi',
    chip: 'OK',
    icon: 'verified',
    color: 'green-9',
    tone: 'teal',
  },
  {
    key: 'quantity',
    label: 'Qty Incoming',
    value: formatNumber(stats.value.qtyIncoming),
    caption: 'Total quantity actual',
    chip: 'QTY',
    icon: 'bar_chart',
    color: 'blue-grey-9',
    tone: 'slate',
  },
])
</script>

<style scoped>
.incoming-summary {
  align-items: stretch;
}

.detail-summary-card {
  border: 1px solid #d6e2d8;
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(27, 94, 32, 0.08);
  color: #18231d;
  font-family:
    'Times New Roman',
    Georgia,
    serif;
  overflow: hidden;
}

.detail-header-compact {
  background: #ffffff;
  padding: 24px 28px 18px;
}

.document-company-row {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.document-brand {
  align-items: center;
  display: flex;
  gap: 16px;
  min-width: 0;
}

.company-identity {
  min-width: 0;
}

.company-name {
  color: #123d1e;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 20px;
  font-weight: 950;
  letter-spacing: 0.4px;
  line-height: 1.1;
  text-transform: uppercase;
}

.company-subtitle {
  color: #5f6f65;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
  margin-top: 4px;
}

.detail-status-wrap {
  align-items: center;
  display: flex;
  justify-content: flex-end;
}

.document-title-block {
  border-top: 2px solid #1b5e20;
  margin-top: 18px;
  padding-top: 15px;
}

.document-title {
  color: #123d1e;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 21px;
  font-weight: 950;
  letter-spacing: 1.4px;
  line-height: 1.2;
  text-align: center;
}

.document-meta-grid {
  border: 1px solid #c8d8ca;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  margin-top: 16px;
}

.document-meta-cell {
  padding: 10px 12px;
}

.document-meta-cell + .document-meta-cell {
  border-left: 1px solid #c8d8ca;
}

.document-meta-cell--right {
  text-align: right;
}

.document-meta-label {
  color: #5f6f65;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.5px;
  line-height: 1.2;
  text-transform: uppercase;
}

.document-number,
.document-date {
  color: #14241a;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.25;
  margin-top: 5px;
}

.clean-divider {
  background: #c8d8ca;
  height: 1px;
}

.clean-divider--inset {
  margin: 0 28px;
}

.detail-section {
  padding: 18px 28px;
}

.detail-section--compact {
  padding-top: 8px;
}

.company-logo-frame {
  align-items: center;
  background: #ffffff;
  border: 1px solid #c8d8ca;
  border-radius: 4px;
  box-shadow: none;
  display: flex;
  height: 72px;
  justify-content: center;
  overflow: hidden;
  width: 104px;
}

.company-logo-img {
  display: block;
  height: 100%;
  object-fit: contain;
  padding: 6px;
  width: 100%;
}

.company-logo-fallback {
  align-items: center;
  background: #f4f8f5;
  color: #1b5e20;
  display: flex;
  font-size: 12px;
  font-weight: 950;
  height: 100%;
  justify-content: center;
  letter-spacing: 0.8px;
  width: 100%;
}

.detail-status-badge {
  align-items: center;
  border-radius: 3px;
  display: inline-flex;
  box-shadow: none;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.45px;
  min-height: 28px;
  padding: 6px 10px;
  text-transform: uppercase;
}

.document-info-grid {
  display: grid;
  border: 1px solid #c8d8ca;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-info-cell {
  background: #ffffff;
  border-bottom: 1px solid #c8d8ca;
  min-height: 66px;
  padding: 12px 14px;
}

.detail-info-cell:nth-child(odd) {
  border-right: 1px solid #c8d8ca;
}

.detail-info-cell:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.detail-info-label {
  color: #5f6f65;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.55px;
  line-height: 1.2;
  text-transform: uppercase;
}

.detail-info-value {
  color: #18231d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  margin-top: 7px;
}

.section-heading {
  align-items: center;
  color: #1b5e20;
  display: flex;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 12px;
  font-weight: 950;
  gap: 10px;
  letter-spacing: 0.65px;
  margin-bottom: 14px;
  text-transform: uppercase;
}

.section-heading::after {
  background: #dfe8df;
  content: '';
  flex: 1;
  height: 1px;
}

.detail-metric-card {
  border-color: rgba(27, 94, 32, 0.12);
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(27, 94, 32, 0.06);
  height: 100%;
  min-height: 104px;
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease,
    border-color 0.18s ease;
}

.detail-metric-card:hover {
  border-color: rgba(27, 94, 32, 0.24);
  box-shadow: 0 12px 26px rgba(27, 94, 32, 0.11);
  transform: translateY(-1px);
}

.detail-metric-content {
  align-items: stretch;
  display: flex;
  height: 100%;
  padding: 16px;
}

.detail-metric-row {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
  width: 100%;
}

.detail-metric-row .summary-icon {
  margin-right: 0;
}

.detail-metric-value {
  color: #1b5e20;
  font-size: 18px;
  font-weight: 950;
  line-height: 1.15;
  margin-top: 7px;
  overflow-wrap: anywhere;
}

.pdf-items-table {
  border: 1px solid #213d29;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}

.pdf-items-table :deep(thead tr th) {
  background: #1b5e20;
  border: 1px solid #213d29;
  color: #ffffff;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.55px;
  padding: 11px 10px;
  text-transform: uppercase;
}

.pdf-items-table :deep(tbody td) {
  border: 1px solid #c8d8ca;
  color: #1f2a24;
  font-size: 12px;
  line-height: 1.4;
  padding: 10px;
  vertical-align: middle;
}

.pdf-items-table :deep(tbody tr:nth-child(even)) {
  background: #f8fbf8;
}

.pdf-items-table :deep(tbody tr:hover) {
  background: #ffffff;
}

.approval-strip {
  display: grid;
  gap: 28px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding-top: 10px;
}

.approval-column {
  background: #ffffff;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  min-height: 152px;
  padding: 0;
  text-align: center;
}

.approval-role {
  color: #1b5e20;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.55px;
  line-height: 1.2;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.approval-name {
  color: #1f2a24;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.3;
  min-height: 18px;
}

.approval-position,
.approval-timestamp,
.approval-signature-note {
  color: #667085;
  font-family:
    'Inter',
    Arial,
    sans-serif;
  font-size: 9.5px;
  font-weight: 700;
  line-height: 1.35;
  margin-top: 3px;
}

.approval-signature-line {
  align-items: flex-end;
  border-bottom: 1px solid #18231d;
  display: flex;
  flex: 1;
  margin: 22px auto 10px;
  min-height: 54px;
  width: min(180px, 100%);
}

.glass-card {
  background: rgba(13, 34, 51, 0.7) !important;
  border: 1px solid rgba(124, 255, 79, 0.08) !important;
  border-radius: 18px !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}

.summary-card {
  border-color: rgba(124, 255, 79, 0.08) !important;
  height: 100%;
  min-height: 112px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  box-shadow: 0 8px 24px rgba(0, 209, 178, 0.15) !important;
  transform: translateY(-2px);
}

.summary-content {
  padding: 16px;
}

.summary-icon {
  align-items: center;
  border-radius: 14px;
  display: flex;
  flex: 0 0 42px;
  height: 42px;
  justify-content: center;
  margin-right: 12px;
  width: 42px;
}

.summary-icon--green {
  background: rgba(124, 255, 79, 0.1) !important;
  color: #7CFF4F !important;
}

.summary-icon--orange {
  background: rgba(255, 169, 64, 0.1) !important;
  color: #FFA940 !important;
}

.summary-icon--red {
  background: rgba(255, 77, 79, 0.1) !important;
  color: #FF4D4F !important;
}

.summary-icon--teal {
  background: rgba(0, 209, 178, 0.1) !important;
  color: #00D1B2 !important;
}

.summary-icon--slate {
  background: rgba(140, 163, 184, 0.1) !important;
  color: #8CA3B8 !important;
}

.summary-label {
  color: #8CA3B8 !important;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  line-height: 1.2;
  text-transform: uppercase;
}

.summary-chip {
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  margin: 0;
  min-height: 20px;
  padding: 0 7px;
}

.summary-value {
  color: #FFFFFF !important;
  font-size: 25px;
  font-weight: 950;
  line-height: 1.1;
  margin-top: 8px;
}

.summary-caption {
  color: #B8C7D9 !important;
  font-size: 12px;
  line-height: 1.3;
  margin-top: 4px;
}

.min-width-0 {
  min-width: 0;
}

.rounded-20 {
  border-radius: 20px;
}

@media (max-width: 1023px) {
  .detail-header-compact {
    padding: 20px;
  }

  .document-company-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-status-wrap {
    justify-content: flex-start;
  }

  .detail-section {
    padding: 18px 20px;
  }

  .clean-divider--inset {
    margin-left: 20px;
    margin-right: 20px;
  }

  .document-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .approval-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .approval-column {
    min-height: 164px;
    padding: 13px;
  }

  .summary-value {
    font-size: 23px;
  }
}

@media (max-width: 599px) {
  .document-brand {
    align-items: flex-start;
    flex-direction: column;
  }

  .document-meta-grid {
    grid-template-columns: 1fr;
  }

  .document-meta-cell + .document-meta-cell {
    border-left: 0;
    border-top: 1px solid #c8d8ca;
  }

  .document-meta-cell--right {
    text-align: left;
  }

  .document-info-grid {
    grid-template-columns: 1fr;
  }

  .detail-info-cell,
  .detail-info-cell:nth-child(odd),
  .detail-info-cell:nth-last-child(-n + 2) {
    border-bottom: 1px solid #c8d8ca;
    border-right: 0;
  }

  .detail-info-cell:last-child {
    border-bottom: 0;
  }

  .approval-strip {
    grid-template-columns: 1fr;
  }

  .company-logo-frame {
    width: 112px;
  }
}

@media print {
  .detail-summary-card {
    border-color: #1f3325;
    box-shadow: none;
  }

  .detail-header-compact,
  .detail-section {
    padding-left: 18px;
    padding-right: 18px;
  }

  .pdf-items-table :deep(thead tr th) {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
