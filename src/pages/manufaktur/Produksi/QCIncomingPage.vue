<template>
  <q-page class="qc-incoming-page bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          QC Incoming
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">Pengecekan Kualitas Detail</span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Approve, reject, catatan QC, dan validasi akhir incoming material.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          flat
          rounded
          color="green-10"
          icon="sync"
          label="Refresh Data"
          no-caps
          :loading="loading"
          class="bg-white shadow-1"
          @click="loadRows"
        />
      </div>
    </div>

    <q-card flat bordered class="table-card rounded-20 shadow-sm overflow-hidden bg-white">
      <q-card-section class="bg-green-10 text-white q-py-sm">
        <div class="row items-center justify-between">
          <div class="text-caption text-weight-bold uppercase tracking-widest">Monitoring QC Incoming</div>
          <div class="text-caption">{{ qcRows.length }} RECORD</div>
        </div>
      </q-card-section>

      <q-table
        :rows="qcRows"
        :columns="columns"
        :loading="loading"
        row-key="id"
        flat
        binary-state-sort
        class="qc-table"
        :rows-per-page-options="[15, 25, 50, 100]"
      >
        <template #body="slotProps">
          <q-tr :props="slotProps" class="cursor-pointer" @click="openDetail(slotProps.row)">
            <q-td key="nomor_surat_jalan" :props="slotProps">
              <div class="doc-number">{{ slotProps.row.nomor_surat_jalan || '-' }}</div>
              <div class="text-caption text-grey-6">{{ formatDateTime(slotProps.row.created_at) }}</div>
            </q-td>
            <q-td key="supplier" :props="slotProps">
              <div class="cell-main">{{ slotProps.row.supplier || slotProps.row.asal || '-' }}</div>
              <div class="text-caption text-grey-6">Supplier</div>
            </q-td>
            <q-td key="material" :props="slotProps">
              <div class="cell-main">{{ getMaterial(slotProps.row) }}</div>
              <div class="text-caption text-grey-6">{{ getItems(slotProps.row).length }} item</div>
            </q-td>
            <q-td key="qty_surat_jalan" :props="slotProps" class="text-right">
              <div class="qty-value">{{ formatNumber(getQtySj(slotProps.row)) }}</div>
              <div class="text-caption text-grey-6">SJ</div>
            </q-td>
            <q-td key="qty_actual" :props="slotProps" class="text-right">
              <div class="qty-value">{{ formatNumber(getQtyActual(slotProps.row)) }}</div>
              <div class="text-caption text-grey-6">Actual</div>
            </q-td>
            <q-td key="status" :props="slotProps" class="text-center">
              <q-badge :color="statusColor(getStatus(slotProps.row))" class="status-badge">
                {{ statusLabel(getStatus(slotProps.row)) }}
              </q-badge>
            </q-td>
            <q-td key="qc_note" :props="slotProps">
              <div class="note-cell">{{ slotProps.row.qc_note || '-' }}</div>
            </q-td>
            <q-td key="action" :props="slotProps" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-xs no-wrap">
                <q-btn flat round color="blue-grey-8" icon="visibility" size="sm" @click="openDetail(slotProps.row)">
                  <q-tooltip>Detail</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="getStatus(slotProps.row) === STATUS_SEND_TO_QC"
                  flat
                  round
                  color="cyan-8"
                  icon="play_circle"
                  size="sm"
                  @click="startQc(slotProps.row)"
                >
                  <q-tooltip>Mulai QC</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canFinalizeQc(slotProps.row)"
                  flat
                  round
                  color="positive"
                  icon="verified"
                  size="sm"
                  @click="openQcDecision(slotProps.row, STATUS_QC_APPROVED)"
                >
                  <q-tooltip>Approve QC</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canFinalizeQc(slotProps.row)"
                  flat
                  round
                  color="negative"
                  icon="block"
                  size="sm"
                  @click="openQcDecision(slotProps.row, STATUS_QC_REJECTED)"
                >
                  <q-tooltip>Reject QC</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDetailDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="detail-card column bg-grey-2">
        <q-toolbar class="detail-header shrink">
          <q-icon name="fact_check" size="24px" class="q-mr-sm" />
          <q-toolbar-title>
            <div class="text-subtitle1 text-weight-bolder uppercase tracking-widest">Detail QC Incoming</div>
            <div class="text-caption">{{ selectedRow?.nomor_surat_jalan || '-' }}</div>
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section v-if="selectedRow" class="col scroll q-pa-md q-pa-md-xl">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-card flat bordered class="detail-section-card rounded-20 bg-white">
                <q-card-section class="detail-section-head">Dokumen Incoming</q-card-section>
                <q-card-section>
                  <div class="label-meta">Supplier</div>
                  <div class="field-value q-mb-md">{{ selectedRow.supplier || selectedRow.asal || '-' }}</div>
                  <div class="label-meta">Status</div>
                  <q-badge :color="statusColor(getStatus(selectedRow))" class="status-badge">
                    {{ statusLabel(getStatus(selectedRow)) }}
                  </q-badge>
                  <div class="label-meta q-mt-md">Catatan QC</div>
                  <div class="field-value">{{ selectedRow.qc_note || '-' }}</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-8">
              <q-card flat bordered class="detail-section-card rounded-20 bg-white">
                <q-card-section class="detail-section-head">Detail Item Material</q-card-section>
                <q-separator />
                <q-card-section class="q-pa-none">
                  <q-markup-table flat dense class="detail-items-table">
                    <thead>
                      <tr>
                        <th class="text-left">Nama Barang</th>
                        <th class="text-left">Kategori</th>
                        <th class="text-left">Satuan</th>
                        <th class="text-right">Qty SJ</th>
                        <th class="text-right">Qty Actual</th>
                        <th class="text-right">Selisih</th>
                        <th class="text-left">Kondisi Awal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in getItems(selectedRow)" :key="`${item.nama_barang}-${index}`">
                        <td class="text-weight-bold text-green-10">{{ item.nama_barang || '-' }}</td>
                        <td>{{ item.kategori_material || '-' }}</td>
                        <td>{{ item.satuan || '-' }}</td>
                        <td class="text-right">{{ formatNumber(item.qty_surat_jalan) }}</td>
                        <td class="text-right">{{ formatNumber(item.qty_actual) }}</td>
                        <td class="text-right">{{ formatNumber(item.selisih_qty) }}</td>
                        <td>{{ item.kondisi_barang || '-' }}</td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md shadow-2 shrink">
          <q-btn flat color="grey-7" label="Tutup" no-caps v-close-popup />
          <q-btn
            v-if="selectedRow && getStatus(selectedRow) === STATUS_SEND_TO_QC"
            unelevated
            color="cyan-8"
            icon="play_circle"
            label="Mulai QC"
            no-caps
            @click="startQc(selectedRow)"
          />
          <q-btn
            v-if="selectedRow && canFinalizeQc(selectedRow)"
            unelevated
            color="positive"
            icon="verified"
            label="Approve QC"
            no-caps
            @click="openQcDecision(selectedRow, STATUS_QC_APPROVED)"
          />
          <q-btn
            v-if="selectedRow && canFinalizeQc(selectedRow)"
            flat
            color="negative"
            icon="block"
            label="Reject QC"
            no-caps
            @click="openQcDecision(selectedRow, STATUS_QC_REJECTED)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDecisionDialog" persistent>
      <q-card class="decision-card">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bolder text-green-10">{{ decisionTitle }}</div>
          <div class="text-caption text-grey-7">{{ decisionRow?.nomor_surat_jalan || '-' }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model.trim="qcNote" outlined dense type="textarea" rows="4" label="Catatan QC" autofocus />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
          <q-btn
            unelevated
            :color="decisionStatus === STATUS_QC_APPROVED ? 'positive' : 'negative'"
            :label="decisionStatus === STATUS_QC_APPROVED ? 'Approve QC' : 'Reject QC'"
            no-caps
            :loading="submitting"
            @click="submitDecision"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { auth, db } from 'src/boot/firebase'
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const COLLECTION_NAME = 'incoming_materials'
const STATUS_SEND_TO_QC = 'SEND_TO_QC'
const STATUS_QC_PROCESS = 'QC_PROCESS'
const STATUS_QC_APPROVED = 'QC_APPROVED'
const STATUS_QC_REJECTED = 'QC_REJECTED'
const QC_STATUSES = [STATUS_SEND_TO_QC, STATUS_QC_PROCESS, STATUS_QC_APPROVED, STATUS_QC_REJECTED]

const columns = [
  { name: 'nomor_surat_jalan', label: 'Nomor SJ', align: 'left', field: 'nomor_surat_jalan', sortable: true },
  { name: 'supplier', label: 'Supplier', align: 'left', field: 'supplier', sortable: true },
  { name: 'material', label: 'Material', align: 'left', field: (row) => getMaterial(row), sortable: true },
  { name: 'qty_surat_jalan', label: 'Qty SJ', align: 'right', field: (row) => getQtySj(row), sortable: true },
  { name: 'qty_actual', label: 'Qty Actual', align: 'right', field: (row) => getQtyActual(row), sortable: true },
  { name: 'status', label: 'Status', align: 'center', field: (row) => getStatus(row), sortable: true },
  { name: 'qc_note', label: 'Catatan QC', align: 'left', field: 'qc_note' },
  { name: 'action', label: 'Action', align: 'center' },
]

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const selectedRow = ref(null)
const showDetailDialog = ref(false)
const showDecisionDialog = ref(false)
const decisionRow = ref(null)
const decisionStatus = ref('')
const qcNote = ref('')
let unsubRows = null

const currentUserName = computed(
  () =>
    authStore.user?.nama ||
    authStore.user?.name ||
    authStore.user?.displayName ||
    auth.currentUser?.displayName ||
    authStore.user?.email ||
    auth.currentUser?.email ||
    'System',
)

const qcRows = computed(() => rows.value.filter((row) => QC_STATUSES.includes(getStatus(row))))
const decisionTitle = computed(() => (decisionStatus.value === STATUS_QC_APPROVED ? 'Approve QC Incoming' : 'Reject QC Incoming'))

const getStatus = (row) => row?.status_incoming || row?.status_validation || row?.status || ''
const statusLabel = (status) => {
  const labels = {
    [STATUS_SEND_TO_QC]: 'SEND TO QC',
    [STATUS_QC_PROCESS]: 'QC PROCESS',
    [STATUS_QC_APPROVED]: 'QC APPROVED',
    [STATUS_QC_REJECTED]: 'QC REJECTED',
  }
  return labels[status] || String(status || '-').replace(/_/g, ' ')
}
const statusColor = (status) => {
  const colors = {
    [STATUS_SEND_TO_QC]: 'cyan-8',
    [STATUS_QC_PROCESS]: 'orange-9',
    [STATUS_QC_APPROVED]: 'positive',
    [STATUS_QC_REJECTED]: 'negative',
  }
  return colors[status] || 'grey-7'
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

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')
const getItems = (row) => (Array.isArray(row?.items) && row.items.length ? row.items.map(normalizeItem) : [normalizeItem(row)])
const normalizeItem = (item = {}) => {
  const qtySj = Number(item.qty_surat_jalan ?? item.qtySJ ?? item.qty ?? 0)
  const qtyActual = Number(item.qty_actual ?? item.qtyActual ?? item.quantity ?? 0)
  return {
    ...item,
    nama_barang: item.nama_barang || item.nama_material || item.material || '',
    kategori_material: item.kategori_material || item.tipe_material || '',
    satuan: item.satuan || '',
    qty_surat_jalan: qtySj,
    qty_actual: qtyActual,
    selisih_qty: Number(item.selisih_qty ?? qtyActual - qtySj),
    kondisi_barang: item.kondisi_barang || 'BAIK',
  }
}
const getMaterial = (row) => {
  const items = getItems(row)
  if (items.length > 1) return `${items[0]?.nama_barang || '-'} +${items.length - 1} item`
  return row?.material || row?.nama_barang || items[0]?.nama_barang || '-'
}
const getQtySj = (row) => getItems(row).reduce((sum, item) => sum + Number(item.qty_surat_jalan || 0), 0)
const getQtyActual = (row) => getItems(row).reduce((sum, item) => sum + Number(item.qty_actual || 0), 0)

const normalizeRow = (id, data) => ({
  id,
  ...data,
  supplier: data.supplier || data.asal || '',
  status: getStatus(data),
  status_incoming: getStatus(data),
  status_validation: data.status_validation || getStatus(data),
})

const buildAuditEntry = (status, note = '') => ({
  status,
  note,
  by: currentUserName.value,
  at: new Date().toISOString(),
})

const loadRows = () => {
  loading.value = true
  if (unsubRows) unsubRows()
  unsubRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc')),
    (snapshot) => {
      rows.value = snapshot.docs.map((docSnap) => normalizeRow(docSnap.id, docSnap.data()))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat data QC incoming' })
    },
  )
}

const openDetail = (row) => {
  selectedRow.value = row
  showDetailDialog.value = true
}

const canFinalizeQc = (row) => [STATUS_SEND_TO_QC, STATUS_QC_PROCESS].includes(getStatus(row))

const updateQcWorkflow = async (row, status, note, extraPayload = {}) => {
  if (!row?.id) return
  submitting.value = true
  try {
    await updateDoc(doc(db, COLLECTION_NAME, row.id), {
      status,
      status_incoming: status,
      status_validation: status,
      qc_status: status === STATUS_QC_APPROVED ? 'APPROVED' : status === STATUS_QC_REJECTED ? 'REJECTED' : 'PROCESS',
      qc_note: note || row.qc_note || '',
      qc_checked_by: currentUserName.value,
      qc_checked_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      updated_by: currentUserName.value,
      history: [...(row.history || []), buildAuditEntry(status, note)],
      ...extraPayload,
    })
    selectedRow.value = null
    showDetailDialog.value = false
    $q.notify({ type: 'positive', message: `Status QC diperbarui: ${statusLabel(status)}` })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal update QC incoming' })
  } finally {
    submitting.value = false
  }
}

const startQc = async (row) => {
  if (getStatus(row) !== STATUS_SEND_TO_QC) return
  await updateQcWorkflow(row, STATUS_QC_PROCESS, 'QC incoming mulai diproses')
}

const openQcDecision = (row, status) => {
  if (!canFinalizeQc(row)) return
  decisionRow.value = row
  decisionStatus.value = status
  qcNote.value = row.qc_note || ''
  showDecisionDialog.value = true
}

const submitDecision = async () => {
  if (!decisionRow.value || !decisionStatus.value) return
  await updateQcWorkflow(decisionRow.value, decisionStatus.value, qcNote.value || statusLabel(decisionStatus.value), {
    qc_finalized_at: serverTimestamp(),
  })
  showDecisionDialog.value = false
  decisionRow.value = null
  decisionStatus.value = ''
  qcNote.value = ''
}

onMounted(loadRows)

onUnmounted(() => {
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

.tracking-widest {
  letter-spacing: 0.9px;
}

.leading-tight {
  line-height: 1.15;
}

.detail-section-card {
  border-color: #dfe8df;
}

/* Table Spacing Alignment (Matching PlanningProduksiPage.vue) */
.table-card {
  border-color: #dfe8df;
  margin-top: 20px !important;
  padding: 20px !important;
  border-radius: 18px !important;
  background: #ffffff !important;
  overflow: hidden;
}

.table-card :deep(.q-table thead tr) {
  height: 54px !important;
}

.table-card :deep(.q-table thead th) {
  height: 54px !important;
  font-size: 13px !important;
  letter-spacing: 0.08em !important;
  padding: 0 18px !important;
  vertical-align: middle !important;
  background: #1b5e20 !important;
}

.table-card :deep(.q-table tbody tr) {
  min-height: 64px !important;
  height: 64px !important;
}

.table-card :deep(.q-table tbody td) {
  padding: 14px 18px !important;
  white-space: normal !important;
  vertical-align: middle !important;
}

.table-card :deep(.q-table__bottom) {
  padding: 16px 20px !important;
}

.qc-table {
  min-height: 420px;
}

.qc-table :deep(.q-table__middle) {
  max-height: 68vh;
  overflow: auto;
}


.doc-number,
.cell-main,
.qty-value,
.field-value {
  color: #1f2a24;
  font-weight: 850;
  line-height: 1.25;
}

.doc-number {
  color: #1b5e20;
}

.note-cell {
  max-width: 260px;
  white-space: normal;
}

.status-badge {
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.45px;
  padding: 6px 10px;
}

.detail-card {
  overflow: hidden;
}

.detail-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 14px 18px;
}

.detail-section-head {
  align-items: center;
  background: #e8f5e9;
  color: #1b5e20;
  display: flex;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.4px;
  padding: 10px 14px;
  text-transform: uppercase;
}

.label-meta {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.decision-card {
  width: min(520px, 92vw);
}

@media (max-width: 900px) {
  .qc-table :deep(table) {
    min-width: 1180px;
  }
}
</style>
