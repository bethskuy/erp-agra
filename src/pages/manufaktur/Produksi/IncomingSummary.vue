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

    <q-card ref="detailPdfRef" flat bordered class="detail-summary-card rounded-20 shadow-1 bg-white">
      <q-card-section class="detail-header-compact">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md">
            <div class="text-caption text-grey-7 text-weight-bold uppercase">Surat Jalan</div>
            <div class="detail-doc-number">{{ getSuratJalan(activeRow) }}</div>
            <div class="text-caption text-grey-7 q-mt-xs">{{ getSupplier(activeRow) }}</div>
          </div>
          <div class="col-12 col-md-auto">
            <q-badge :color="statusTone(activeRow)" class="detail-status-badge">
              {{ statusLabel(getStatus(activeRow)) }}
            </q-badge>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="detail-info-grid">
          <div class="detail-info-cell">
            <div class="detail-info-label">Supplier</div>
            <div class="detail-info-value">{{ getSupplier(activeRow) }}</div>
          </div>
          <div class="detail-info-cell">
            <div class="detail-info-label">Material Utama</div>
            <div class="detail-info-value">{{ getMaterial(activeRow) }}</div>
          </div>
          <div class="detail-info-cell">
            <div class="detail-info-label">Checker QC</div>
            <div class="detail-info-value">{{ getChecker(activeRow) }}</div>
          </div>
          <div class="detail-info-cell">
            <div class="detail-info-label">Status Incoming</div>
            <div class="detail-info-value">{{ statusLabel(getStatus(activeRow)) }}</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="section-heading">Ringkasan Incoming</div>
        <div class="row q-col-gutter-md">
          <div v-for="item in detailCards" :key="item.label" class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="detail-metric-card">
              <q-card-section class="q-pa-md">
                <div class="row items-center no-wrap">
                  <div class="summary-icon summary-icon--green q-mr-sm">
                    <q-icon :name="item.icon" size="20px" />
                  </div>
                  <div class="col min-width-0">
                    <div class="summary-label">{{ item.label }}</div>
                    <div class="detail-metric-value">{{ item.value }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <div class="section-heading">Daftar Material</div>
        <q-markup-table flat dense class="pdf-items-table">
          <thead>
            <tr>
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

      <q-card-section class="q-pt-sm">
        <div class="section-heading">Approval Incoming</div>
        <div class="approval-strip">
          <div v-for="approval in approvalColumns" :key="approval.role" class="approval-column">
            <div class="approval-role">{{ approval.role }}</div>
            <div class="approval-name">{{ approval.name }}</div>
            <div class="approval-position">{{ approval.position }}</div>
            <div class="approval-timestamp">{{ approval.timestamp }}</div>
            <div class="approval-signature-line"></div>
            <div class="approval-signature-note">Tanda tangan</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <div v-else class="incoming-summary row q-col-gutter-md q-mb-lg">
    <div v-for="card in cards" :key="card.key" class="col-12 col-sm-6 col-lg">
      <q-card flat bordered class="summary-card rounded-20 shadow-1 bg-white">
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
                <q-skeleton type="text" width="72px" height="34px" class="q-mt-sm" />
                <q-skeleton type="text" width="120px" height="16px" />
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

const activeTotalQty = computed(() => activeItems.value.reduce((sum, item) => sum + Number(item.qty_actual || 0), 0))
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

const detailCards = computed(() => [
  { label: 'Total Item', value: formatNumber(activeItems.value.length), icon: 'format_list_numbered' },
  { label: 'Total Qty', value: formatNumber(activeTotalQty.value), icon: 'bar_chart' },
  { label: 'Status QC', value: statusLabel(getStatus(activeRow.value)), icon: 'fact_check' },
  { label: 'Timestamp Validasi', value: formatDateTime(validationTimestamp.value), icon: 'schedule' },
])

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
    color: 'green-10',
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
    color: 'negative',
    tone: 'red',
  },
  {
    key: 'done',
    label: 'Selesai',
    value: formatNumber(stats.value.done),
    caption: 'Incoming tervalidasi',
    chip: 'OK',
    icon: 'verified',
    color: 'positive',
    tone: 'teal',
  },
  {
    key: 'quantity',
    label: 'Qty Incoming',
    value: formatNumber(stats.value.qtyIncoming),
    caption: 'Total quantity actual',
    chip: 'QTY',
    icon: 'bar_chart',
    color: 'blue-grey-8',
    tone: 'slate',
  },
])
</script>

<style scoped>
.incoming-summary {
  align-items: stretch;
}

.detail-summary-card {
  border-color: #dfe8df;
  overflow: hidden;
}

.detail-header-compact {
  background: #fbfffc;
  padding: 14px 16px;
}

.detail-doc-number {
  color: #1b5e20;
  font-size: 22px;
  font-weight: 950;
  line-height: 1.1;
}

.detail-status-badge {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.3px;
  min-height: 30px;
  padding: 8px 12px;
  text-transform: uppercase;
}

.detail-info-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.detail-info-cell {
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 10px;
  padding: 10px 12px;
}

.detail-info-label {
  color: #667085;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.detail-info-value {
  color: #1f2a24;
  font-size: 13px;
  font-weight: 850;
  line-height: 1.25;
  margin-top: 4px;
}

.section-heading {
  color: #1b5e20;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.detail-metric-card {
  border-color: #dfe8df;
  height: 100%;
}

.detail-metric-value {
  color: #1b5e20;
  font-size: 17px;
  font-weight: 950;
  line-height: 1.2;
  margin-top: 4px;
}

.pdf-items-table {
  border: 1px solid #dfe8df;
  border-radius: 10px;
  overflow: hidden;
}

.pdf-items-table :deep(thead tr th) {
  background: #1b5e20;
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.4px;
  padding: 9px 8px;
  text-transform: uppercase;
}

.pdf-items-table :deep(tbody td) {
  color: #1f2a24;
  font-size: 11.5px;
  padding: 8px;
  vertical-align: top;
}

.approval-strip {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.approval-column {
  min-height: 118px;
  padding: 0 2px;
}

.approval-role {
  color: #1b5e20;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.3px;
  line-height: 1.2;
  margin-bottom: 2px;
  text-transform: uppercase;
}

.approval-name {
  color: #1f2a24;
  font-size: 11px;
  font-weight: 950;
  line-height: 1.25;
  margin-top: 2px;
}

.approval-position,
.approval-timestamp,
.approval-signature-note {
  color: #667085;
  font-size: 9.5px;
  font-weight: 700;
  line-height: 1.3;
  margin-top: 1px;
}

.approval-signature-line {
  border-bottom: 1px solid #8d9b90;
  height: 22px;
  margin-top: 10px;
}

.approval-signature-note {
  color: #8b9499;
  font-size: 9px;
  letter-spacing: 0.2px;
  margin-top: 4px;
  text-transform: uppercase;
}

.summary-card {
  border-color: #dfe8df;
  height: 100%;
  min-height: 112px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  box-shadow: 0 10px 28px rgba(27, 94, 32, 0.12);
  transform: translateY(-1px);
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
  background: #e8f3eb;
  color: #1b5e20;
}

.summary-icon--orange {
  background: #fff4e5;
  color: #e65100;
}

.summary-icon--red {
  background: #fdecec;
  color: #c62828;
}

.summary-icon--teal {
  background: #e5f4f1;
  color: #00796b;
}

.summary-icon--slate {
  background: #edf1f4;
  color: #37474f;
}

.summary-label {
  color: #667085;
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
  color: #1b5e20;
  font-size: 25px;
  font-weight: 950;
  line-height: 1.1;
  margin-top: 8px;
}

.summary-caption {
  color: #667085;
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
  .detail-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .approval-strip {
    grid-template-columns: 1fr;
  }

  .summary-value {
    font-size: 23px;
  }
}

@media (max-width: 599px) {
  .detail-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
