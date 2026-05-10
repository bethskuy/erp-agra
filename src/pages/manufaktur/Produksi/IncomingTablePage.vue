<template>
  <div class="incoming-table-page">
    <incoming-summary :rows="rows" />

    <q-card flat bordered class="filter-card q-mb-lg shadow-1 rounded-20 bg-white">
      <q-card-section class="toolbar-section">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-input
              v-model="keyword"
              outlined
              dense
              rounded
              clearable
              debounce="250"
              placeholder="Cari nomor SJ, supplier, material, checker incoming..."
              bg-color="white"
              class="search-input"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="statusFilter"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Status"
              bg-color="white"
              :options="statusOptions"
            />
          </div>

          <div class="col-12 col-sm-6 col-md-2">
            <q-input v-model="dateFilter" outlined dense rounded type="date" label="Tanggal Masuk" clearable bg-color="white" />
          </div>

          <q-space />

          <div class="col-12 col-md-auto">
            <div class="row justify-end q-gutter-xs no-wrap">
              <q-badge color="green-10" class="q-px-md q-py-xs text-weight-bold shadow-1">
                {{ filteredRows.length }} RECORD
              </q-badge>
              <q-btn flat dense color="grey-7" icon="filter_alt_off" label="Reset" no-caps @click="resetFilter" />
              <q-btn flat round color="blue-grey-8" icon="file_download" @click="exportExcel">
                <q-tooltip>Export Excel</q-tooltip>
              </q-btn>
              <q-btn flat round color="green-10" icon="refresh" :loading="loading" @click="emit('refresh')">
                <q-tooltip>Refresh</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card rounded-20 shadow-sm overflow-hidden bg-white">
      <q-card-section class="bg-green-10 text-white q-py-sm">
        <div class="row items-center justify-between">
          <div class="text-caption text-weight-bold uppercase tracking-widest">Monitoring Incoming</div>
          <div class="text-caption">Validasi Awal & Riwayat Incoming</div>
        </div>
      </q-card-section>
      <q-table
        v-model:pagination="pagination"
        :rows="filteredRows"
        :columns="columns"
        :loading="loading"
        row-key="id"
        flat
        binary-state-sort
        class="incoming-table"
        :rows-per-page-options="[15, 25, 50, 100]"
      >
        <template #loading>
          <q-inner-loading showing color="green-10">
            <div class="column items-center q-gutter-sm">
              <q-spinner-gears size="34px" color="green-10" />
              <div class="text-caption text-grey-7 text-weight-bold">Memuat incoming material...</div>
            </div>
          </q-inner-loading>
        </template>

        <template #no-data>
          <div class="full-width column items-center empty-state">
            <div class="empty-icon">
              <q-icon name="inventory_2" size="42px" />
            </div>
            <div class="text-subtitle1 text-weight-bolder text-green-10">Belum ada incoming material</div>
            <div class="text-caption text-grey-7">
              Data penerimaan dari surat jalan akan tampil setelah form incoming disimpan.
            </div>
          </div>
        </template>

        <template #body="slotProps">
          <q-tr :props="slotProps" class="cursor-pointer" @click="emit('view', slotProps.row)">
            <q-td key="nomor_surat_jalan" :props="slotProps">
              <div class="doc-number">{{ getSuratJalan(slotProps.row) }}</div>
              <div class="text-caption text-grey-6">{{ getTimestamp(slotProps.row) }}</div>
            </q-td>

            <q-td key="supplier" :props="slotProps">
              <div class="cell-main">{{ getSupplier(slotProps.row) }}</div>
              <div class="text-caption text-grey-6">Vendor / customer</div>
            </q-td>

            <q-td key="material" :props="slotProps">
              <div class="cell-main">{{ getMaterial(slotProps.row) }}</div>
              <div class="text-caption text-grey-6">{{ getKategori(slotProps.row) }}</div>
            </q-td>

            <q-td key="qty_surat_jalan" :props="slotProps" class="text-right">
              <div class="qty-value">{{ formatNumber(getQtySj(slotProps.row)) }}</div>
              <div class="text-caption text-grey-6">{{ getSatuan(slotProps.row) }}</div>
            </q-td>

            <q-td key="qty_actual" :props="slotProps" class="text-right">
              <div class="qty-value">{{ formatNumber(getQtyActual(slotProps.row)) }}</div>
              <div class="text-caption text-grey-6">Actual</div>
            </q-td>

            <q-td key="selisih" :props="slotProps" class="text-right">
              <q-badge
                outline
                :color="getQtyDiff(slotProps.row) === 0 ? 'positive' : 'orange-10'"
                class="diff-badge"
              >
                {{ formatNumber(getQtyDiff(slotProps.row)) }}
              </q-badge>
            </q-td>

            <q-td key="checker_qc" :props="slotProps">
              <div class="cell-main">{{ getCheckerQc(slotProps.row) }}</div>
              <div class="text-caption text-grey-6">{{ getKondisi(slotProps.row) }}</div>
            </q-td>

            <q-td key="tanggal_masuk" :props="slotProps">
              <div class="cell-main text-green-10">{{ formatDate(slotProps.row.tanggal_masuk) }}</div>
              <div class="text-caption text-grey-6">{{ formatDateTime(slotProps.row.created_at) }}</div>
            </q-td>

            <q-td key="status" :props="slotProps" class="text-center">
              <incoming-status-badge :status="getBadgeStatus(slotProps.row)" dense />
              <div v-if="getStatusLabel(slotProps.row)" class="text-caption text-grey-7 q-mt-xs">
                {{ getStatusLabel(slotProps.row) }}
              </div>
            </q-td>

            <q-td key="action" :props="slotProps" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-xs no-wrap">
                <q-btn flat round color="blue-grey-8" icon="visibility" size="sm" @click="emit('view', slotProps.row)">
                  <q-tooltip>Detail</q-tooltip>
                </q-btn>
                <q-btn flat round color="green-9" icon="edit_note" size="sm" @click="emit('edit', slotProps.row)">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canSendToQc(slotProps.row)"
                  flat
                  round
                  color="positive"
                  icon="send"
                  size="sm"
                  @click="sendToQcRow(slotProps.row)"
                >
                  <q-tooltip>Kirim ke QC</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canRejectRow(slotProps.row)"
                  flat
                  round
                  color="negative"
                  icon="block"
                  size="sm"
                  @click="rejectRow(slotProps.row)"
                >
                  <q-tooltip>Reject</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete_forever"
                  size="sm"
                  @click="deleteRow(slotProps.row)"
                >
                  <q-tooltip>Hapus Incoming</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import IncomingStatusBadge from './IncomingStatusBadge.vue'
import IncomingSummary from './IncomingSummary.vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh', 'view', 'edit', 'advance', 'validasi', 'send-to-qc', 'reject', 'delete', 'open-file', 'export'])
const $q = useQuasar()

const keyword = ref('')
const statusFilter = ref('ALL')
const dateFilter = ref('')
const pagination = ref({
  sortBy: 'tanggal_masuk',
  descending: true,
  page: 1,
  rowsPerPage: 15,
})

const statusOptions = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Menunggu Validasi', value: 'MENUNGGU_VALIDASI' },
  { label: 'Send To QC', value: 'SEND_TO_QC' },
  { label: 'QC Process', value: 'QC_PROCESS' },
  { label: 'QC Approved', value: 'QC_APPROVED' },
  { label: 'QC Rejected', value: 'QC_REJECTED' },
  { label: 'Distribusi Material', value: 'DISTRIBUSI_MATERIAL' },
]

const columns = [
  {
    name: 'nomor_surat_jalan',
    label: 'Nomor SJ',
    align: 'left',
    field: (row) => getSuratJalan(row),
    sortable: true,
  },
  { name: 'supplier', label: 'Supplier', align: 'left', field: (row) => getSupplier(row), sortable: true },
  { name: 'material', label: 'Material', align: 'left', field: (row) => getMaterial(row), sortable: true },
  {
    name: 'qty_surat_jalan',
    label: 'Qty SJ',
    align: 'right',
    field: (row) => getQtySj(row),
    sortable: true,
  },
  {
    name: 'qty_actual',
    label: 'Qty Actual',
    align: 'right',
    field: (row) => getQtyActual(row),
    sortable: true,
  },
  { name: 'selisih', label: 'Selisih', align: 'right', field: (row) => getQtyDiff(row), sortable: true },
  { name: 'checker_qc', label: 'Checker Incoming', align: 'left', field: (row) => getCheckerQc(row), sortable: true },
  { name: 'tanggal_masuk', label: 'Tanggal Masuk', align: 'left', field: 'tanggal_masuk', sortable: true },
  { name: 'status', label: 'Status', align: 'center', field: (row) => getStatus(row), sortable: true },
  { name: 'action', label: 'Action', align: 'center' },
]

const getSuratJalan = (row) => row?.nomor_surat_jalan || row?.noSuratJalan || '-'
const getSupplier = (row) => row?.supplier || row?.asal || '-'
const getItems = (row) => (Array.isArray(row?.items) && row.items.length ? row.items : [])
const getMaterial = (row) => {
  const items = getItems(row)
  if (items.length > 1) return `${items[0]?.nama_barang || items[0]?.nama_material || '-'} +${items.length - 1} item`
  return row?.nama_barang || row?.nama_material || row?.tipe_material || items[0]?.nama_barang || '-'
}
const getKategori = (row) => {
  const items = getItems(row)
  if (items.length > 1) return `${items.length} detail material`
  return row?.kategori_material || row?.tipe_material || items[0]?.kategori_material || 'Material produksi'
}
const getSatuan = (row) => row?.satuan || 'PCS'
const getCheckerQc = (row) => row?.checker_qc || row?.qc_checker || row?.checker_gudang || row?.checker || '-'
const getKondisi = (row) => row?.kondisi_barang || (Number(row?.qty_ng || 0) > 0 ? 'RUSAK' : 'BAIK')
const getStatus = (row) => row?.status_validation || row?.status_incoming || row?.status_qc || 'MENUNGGU_VALIDASI'
const getBadgeStatus = (row) => {
  const status = getStatus(row)
  const badgeStatusMap = {
    VALIDASI_SELESAI: 'SELESAI',
    PARTIAL: 'QC_PENDING',
    INCOMING_REJECT: 'QC_NG',
    REJECTED: 'QC_NG',
    SEND_TO_QC: 'VALIDASI_QC',
    QC_PROCESS: 'VALIDASI_QC',
    QC_APPROVED: 'VALIDASI_SELESAI',
    QC_REJECTED: 'QC_NG',
    DISTRIBUSI_MATERIAL: 'VALIDASI_SELESAI',
  }

  return badgeStatusMap[status] || status
}
const getStatusLabel = (row) => {
  const status = getStatus(row)
  const labelMap = {
    VALIDASI_SELESAI: 'Validasi Selesai',
    PARTIAL: 'Partial',
    INCOMING_REJECT: 'Rejected',
    REJECTED: 'Rejected',
    SEND_TO_QC: 'Send To QC',
    QC_PROCESS: 'QC Process',
    QC_APPROVED: 'QC Approved',
    QC_REJECTED: 'QC Rejected',
    DISTRIBUSI_MATERIAL: 'Distribusi Material',
  }

  return labelMap[status] || ''
}
const getQtySj = (row) => {
  const items = getItems(row)
  if (items.length) {
    return items.reduce((sum, item) => sum + Number(item.qty_surat_jalan ?? item.qtySJ ?? item.qty ?? 0), 0)
  }
  return Number(row?.qty_surat_jalan ?? row?.qtySJ ?? row?.quantity ?? 0)
}
const getQtyActual = (row) => {
  const items = getItems(row)
  if (items.length) {
    return items.reduce((sum, item) => sum + Number(item.qty_actual ?? item.qtyActual ?? item.quantity ?? 0), 0)
  }
  return Number(row?.qty_actual ?? row?.qtyActual ?? row?.quantity ?? 0)
}
const getQtyDiff = (row) => Number(row?.selisih_qty ?? getQtyActual(row) - getQtySj(row))
const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const toDate = (value) => {
  if (!value) return null
  if (value.toDate) return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeDate = (value) => {
  const date = toDate(value)
  if (date) return date.toISOString().slice(0, 10)
  if (typeof value === 'string') return value.slice(0, 10)
  return ''
}

const formatDate = (value) => {
  const normalized = normalizeDate(value)
  if (!normalized) return '-'
  const date = new Date(`${normalized}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
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

const getTimestamp = (row) => {
  const value = row?.incoming_timestamp || row?.updated_at || row?.created_at
  return formatDateTime(value)
}

const filteredRows = computed(() => {
  const needle = keyword.value.trim().toLowerCase()

  return props.rows.filter((row) => {
    const textMatch =
      !needle ||
      [
        getSuratJalan(row),
        getSupplier(row),
        getMaterial(row),
        getKategori(row),
        ...getItems(row).flatMap((item) => [item.nama_barang, item.kategori_material, item.catatan]),
        getCheckerQc(row),
        getStatus(row),
        row?.catatan,
        row?.catatan_incoming,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))

    const statusMatch = statusFilter.value === 'ALL' || getStatus(row) === statusFilter.value
    const dateMatch = !dateFilter.value || normalizeDate(row?.tanggal_masuk || row?.created_at) === dateFilter.value

    return textMatch && statusMatch && dateMatch
  })
})

const resetFilter = () => {
  keyword.value = ''
  statusFilter.value = 'ALL'
  dateFilter.value = ''
  pagination.value.page = 1
}

const REJECTABLE_STATUSES = []

const canRejectRow = (row) => REJECTABLE_STATUSES.includes(getStatus(row))
const canSendToQc = (row) => getStatus(row) === 'MENUNGGU_VALIDASI'

const sendToQcRow = (row) => {
  if (!canSendToQc(row)) return
  emit('send-to-qc', row)
}

const rejectRow = (row) => {
  if (!canRejectRow(row)) return
  emit('reject', row)
}

const deleteRow = (row) => {
  emit('delete', row)
}

const exportExcel = () => {
  emit('export', filteredRows.value)
  $q.notify({
    type: 'info',
    message: 'Export Excel belum diaktifkan. Data sudah disiapkan untuk handler export.',
  })
}
</script>

<style scoped>
.incoming-table-page {
  display: flex;
  flex-direction: column;
}

.rounded-20 {
  border-radius: 20px;
}

.filter-card,
.table-card {
  border-color: #dfe8df;
}

.table-card {
  overflow: hidden;
}

.toolbar-section {
  background: #ffffff;
  padding: 14px;
}

.incoming-table {
  min-height: 420px;
}

.incoming-table :deep(.q-table__middle) {
  max-height: 68vh;
  overflow: auto;
}

.incoming-table :deep(thead tr th) {
  background: #1b5e20;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 13px 10px;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 2;
}

.incoming-table :deep(tbody td) {
  font-size: 12.5px;
  padding: 10px;
  vertical-align: top;
}

.incoming-table :deep(tbody tr:hover) {
  background: rgba(27, 94, 32, 0.04);
}

.doc-number,
.cell-main,
.qty-value {
  color: #1f2a24;
  font-weight: 850;
  line-height: 1.25;
}

.doc-number {
  color: #1b5e20;
}

.diff-badge {
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  min-width: 54px;
  padding: 5px 8px;
}

.empty-state {
  background: #fbfdfb;
  min-height: 320px;
  padding: 54px 16px;
}

.empty-icon {
  align-items: center;
  background: #e8f3eb;
  border: 1px solid #cfe3d4;
  border-radius: 8px;
  color: #1b5e20;
  display: flex;
  height: 72px;
  justify-content: center;
  margin-bottom: 14px;
  width: 72px;
}

.tracking-widest {
  letter-spacing: 0.9px;
}

.shadow-sm {
  box-shadow: 0 5px 16px rgba(27, 94, 32, 0.08);
}

@media (max-width: 900px) {
  .incoming-table :deep(table) {
    min-width: 1180px;
  }
}
</style>
