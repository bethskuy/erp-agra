<template>
  <q-page class="incoming-page bg-green-1 q-pa-md q-pa-md-lg font-pro">
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="row items-start no-wrap">
          <q-icon name="inventory_2" color="green-10" size="42px" class="q-mr-md q-mt-xs" />
          <div>
          <q-breadcrumbs class="text-caption text-grey-7 q-mb-sm" active-color="green-10">
            <q-breadcrumbs-el label="Manufaktur" icon="precision_manufacturing" />
            <q-breadcrumbs-el label="Produksi" />
            <q-breadcrumbs-el label="Incoming Material" />
          </q-breadcrumbs>

          <div class="text-h4 text-weight-bolder text-green-10 leading-tight uppercase tracking-widest">
            Header Incoming
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">Material Produksi ERP PT</span>
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Workflow barang datang, QC incoming, validasi qty, approve/reject, sampai update gudang.
          </div>
        </div>
        </div>
      </div>

        <div class="col-12 col-md-auto row q-gutter-sm justify-start justify-md-end q-mt-md q-mt-md-none">
          <q-btn
            flat
            rounded
            color="blue-grey-8"
            icon="sync"
            label="Refresh"
            no-caps
            :loading="loading"
            class="bg-white shadow-1"
            @click="loadIncoming"
          />
          <q-btn
            unelevated
            rounded
            color="green-10"
            icon="add_circle"
            label="Incoming Baru"
            no-caps
            class="text-weight-bold q-px-lg shadow-premium btn-hover"
            @click="openAddDialog"
          />
        </div>
      </div>

    <q-card flat bordered class="workflow-card-main q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="bg-green-10 text-white q-py-sm">
        <div class="text-caption text-weight-bold uppercase tracking-widest">Workflow Status Produksi</div>
      </q-card-section>
      <q-card-section class="q-pa-md">
      <div class="workflow-strip row q-col-gutter-sm">
        <div v-for="step in workflowSteps" :key="step.status" class="col-12 col-sm-6 col-lg">
          <div class="workflow-step">
            <q-icon :name="step.icon" size="18px" class="q-mr-sm" />
            <div class="col">
              <div class="workflow-label">{{ step.label }}</div>
              <div class="workflow-caption">{{ step.caption }}</div>
            </div>
            <incoming-status-badge :status="step.badge" dense outline />
          </div>
        </div>
      </div>
      </q-card-section>
    </q-card>

    <div class="section-title-row q-mb-sm">
      <div class="text-overline text-green-10 text-weight-black">Summary Statistik</div>
    </div>

    <incoming-summary :rows="incomingRows" :loading="loading" />

    <div class="section-title-row q-mb-sm">
      <div>
        <div class="text-overline text-green-10 text-weight-black">Monitoring Incoming</div>
        <div class="text-caption text-grey-7">QC Validation dan Riwayat Incoming material produksi.</div>
      </div>
      <q-chip dense color="green-10" text-color="white" class="text-weight-bold">{{ incomingRows.length }} RECORD</q-chip>
    </div>

    <incoming-table-page
      class="table-without-summary"
      :rows="incomingRows"
      :loading="loading"
      @refresh="loadIncoming"
      @view="openDetail"
      @edit="openEditDialog"
      @validasi="validasiIncoming"
      @reject="rejectIncoming"
      @export="exportExcel"
    />

    <incoming-dialog
      v-model="showFormDialog"
      :row="selectedRow"
      :submitting="submitting"
      :current-user-name="currentUserName"
      @save="saveIncoming"
    />

    <q-dialog v-model="showDetailDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="detail-card column bg-grey-2">
        <q-toolbar class="detail-header shrink">
          <div class="row items-center no-wrap">
            <q-icon name="inventory_2" size="24px" class="q-mr-sm" />
            <div class="col">
              <div class="text-subtitle1 text-weight-bolder uppercase tracking-widest">Riwayat Incoming</div>
              <div class="text-caption">{{ selectedRow?.nomor_surat_jalan || '-' }}</div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-toolbar>

        <q-card-section v-if="selectedRow" class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-card flat bordered class="status-panel rounded-20 shadow-1">
                <q-card-section class="row items-center q-pa-md">
                  <div class="col">
                    <div class="text-caption text-grey-7 text-weight-bold">SURAT JALAN</div>
                    <div class="text-h6 text-weight-bolder text-green-10">
                      {{ selectedRow.nomor_surat_jalan || '-' }}
                    </div>
                  </div>
                  <incoming-status-badge :status="getStatus(selectedRow)" />
                </q-card-section>
              </q-card>
            </div>

            <div v-for="item in detailFields" :key="item.label" class="col-12 col-sm-6 col-md-4">
              <div class="label-meta">{{ item.label }}</div>
              <div class="field-value">{{ item.value }}</div>
            </div>

            <div class="col-12">
              <q-card flat bordered class="workflow-card rounded-20 shadow-1">
                <q-card-section>
                  <div class="text-weight-bolder text-green-10 q-mb-sm">QC Validation & Workflow Produksi</div>
                  <q-timeline color="green-10" layout="dense">
                    <q-timeline-entry
                      v-for="entry in workflowHistory"
                      :key="`${entry.status}-${entry.at}`"
                      :title="statusLabel(entry.status)"
                      :subtitle="`${formatDateTime(entry.at)} oleh ${entry.by || '-'}`"
                      :icon="entry.icon"
                    >
                      <div class="text-caption text-grey-7">{{ entry.note || '-' }}</div>
                    </q-timeline-entry>
                  </q-timeline>
                </q-card-section>
              </q-card>
            </div>
          </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md shadow-2 shrink">
          <q-btn flat color="grey-7" label="Tutup" no-caps v-close-popup />
          <q-btn flat color="green-10" icon="edit_note" label="Edit" no-caps @click="openEditDialog(selectedRow)" />
          <q-btn
            unelevated
            color="positive"
            icon="fact_check"
            label="Validasi QC"
            no-caps
            :disable="!canValidate(selectedRow)"
            @click="validasiIncoming(selectedRow)"
          />
          <q-btn
            flat
            color="negative"
            icon="block"
            label="Reject"
            no-caps
            :disable="getStatus(selectedRow) === STATUS_REJECT"
            @click="rejectIncoming(selectedRow)"
          />
          <q-btn
            unelevated
            color="green-10"
            icon="warehouse"
            label="Update Gudang"
            no-caps
            :disable="!canUpdateGudang(selectedRow)"
            @click="updateGudangPlaceholder(selectedRow)"
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
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'
import IncomingDialog from './IncomingDialog.vue'
import IncomingSummary from './IncomingSummary.vue'
import IncomingTablePage from './IncomingTablePage.vue'
import IncomingStatusBadge from './IncomingStatusBadge.vue'

const COLLECTION_NAME = 'incoming_materials'
const STATUS_DATANG = 'MENUNGGU_VALIDASI'
const STATUS_QC = 'VALIDASI_QC'
const STATUS_SELESAI = 'VALIDASI_SELESAI'
const STATUS_PARTIAL = 'PARTIAL'
const STATUS_REJECT = 'INCOMING_REJECT'
const STATUS_GUDANG = 'UPDATE_GUDANG'

const STATUS_LABEL = {
  [STATUS_DATANG]: 'Barang Datang',
  [STATUS_QC]: 'QC Incoming',
  [STATUS_SELESAI]: 'Validasi Selesai',
  [STATUS_PARTIAL]: 'Partial',
  [STATUS_REJECT]: 'Incoming Reject',
  [STATUS_GUDANG]: 'Update Gudang',
  BARANG_DATANG: 'Barang Datang',
  QC_PENDING: 'QC Incoming',
  QC_OK: 'Approve',
  QC_NG: 'Reject',
  SELESAI: 'Selesai',
}

const $q = useQuasar()
const authStore = useAuthStore()
const incomingRows = ref([])
const loading = ref(true)
const submitting = ref(false)
const showFormDialog = ref(false)
const showDetailDialog = ref(false)
const selectedRow = ref(null)
let unsubIncoming = null

const workflowSteps = [
  {
    status: 'barang-datang',
    label: 'Barang Datang',
    caption: 'Dokumen dan material diterima',
    icon: 'local_shipping',
    badge: STATUS_DATANG,
  },
  {
    status: 'qc-incoming',
    label: 'QC Incoming',
    caption: 'Checker QC inspeksi material',
    icon: 'fact_check',
    badge: STATUS_QC,
  },
  {
    status: 'validasi-qty',
    label: 'Validasi Qty',
    caption: 'Cek SJ vs actual',
    icon: 'rule',
    badge: STATUS_PARTIAL,
  },
  {
    status: 'approve-reject',
    label: 'Approve / Reject',
    caption: 'Keputusan incoming produksi',
    icon: 'verified',
    badge: STATUS_SELESAI,
  },
  {
    status: 'update-gudang',
    label: 'Update Gudang',
    caption: 'Placeholder integrasi stok',
    icon: 'warehouse',
    badge: STATUS_SELESAI,
  },
]

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

const detailFields = computed(() => {
  const row = selectedRow.value
  if (!row) return []

  return [
    { label: 'Supplier', value: row.supplier || row.asal || '-' },
    { label: 'Material', value: row.material || row.nama_barang || row.nama_material || '-' },
    { label: 'Kategori', value: row.kategori_material || row.tipe_material || '-' },
    { label: 'Qty Surat Jalan', value: formatNumber(getQtySj(row)) },
    { label: 'Qty Actual', value: formatNumber(getQtyActual(row)) },
    { label: 'Selisih', value: formatNumber(getQtyDiff(row)) },
    { label: 'Satuan', value: row.satuan || 'PCS' },
    { label: 'Checker QC', value: row.checker_qc || row.qc_checker || row.checker || '-' },
    { label: 'Tanggal Masuk', value: formatDate(row.tanggal_masuk) },
  ]
})

const workflowHistory = computed(() => {
  const row = selectedRow.value
  if (!row) return []
  const history = Array.isArray(row.history) ? row.history : []
  if (history.length) return history.map((entry) => ({ ...entry, icon: workflowIcon(entry.status) }))

  return [
    {
      status: getStatus(row),
      note: 'Status incoming terakhir',
      by: row.updated_by || row.created_by?.nama || '-',
      at: row.updated_at || row.created_at || row.incoming_timestamp,
      icon: workflowIcon(getStatus(row)),
    },
  ]
})

const getStatus = (row) => row?.status_incoming || row?.status_validation || row?.status || STATUS_DATANG
const statusLabel = (status) => STATUS_LABEL[status] || String(status || '-').replace(/_/g, ' ')
const workflowIcon = (status) => {
  const icons = {
    [STATUS_DATANG]: 'local_shipping',
    [STATUS_QC]: 'fact_check',
    [STATUS_PARTIAL]: 'rule',
    [STATUS_SELESAI]: 'verified',
    [STATUS_REJECT]: 'report_problem',
    [STATUS_GUDANG]: 'warehouse',
  }
  return icons[status] || 'task_alt'
}

const getQtySj = (row) => Number(row?.qty_surat_jalan ?? row?.qty ?? row?.qtySJ ?? row?.quantity ?? 0)
const getQtyActual = (row) => Number(row?.qty_actual ?? row?.qtyActual ?? row?.quantity ?? 0)
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

const buildAuditEntry = (status, note = '') => ({
  status,
  note,
  by: currentUserName.value,
  at: new Date().toISOString(),
})

const normalizeIncomingRow = (id, data) => {
  const qtySj = Number(data.qty_surat_jalan ?? data.qty ?? data.qtySJ ?? data.quantity ?? 0)
  const qtyActual = Number(data.qty_actual ?? data.qtyActual ?? data.quantity ?? 0)
  const material = data.material || data.nama_barang || data.nama_material || data.tipe_material || ''
  const checker = data.checker_qc || data.qc_checker || data.checker || data.checker_gudang || ''
  const status = getStatus(data)

  return {
    id,
    ...data,
    supplier: data.supplier || data.asal || '',
    material,
    nama_barang: material,
    nama_material: material,
    qty: qtySj,
    qty_surat_jalan: qtySj,
    qty_actual: qtyActual,
    selisih_qty: Number(data.selisih_qty ?? qtyActual - qtySj),
    checker: checker,
    checker_qc: checker,
    qc_checker: checker,
    status: status,
    status_incoming: status,
    status_validation: data.status_validation || status,
    tanggal_masuk: data.tanggal_masuk || normalizeDate(data.created_at) || new Date().toISOString().slice(0, 10),
  }
}

const loadIncoming = () => {
  loading.value = true
  if (unsubIncoming) unsubIncoming()

  unsubIncoming = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc')),
    (snapshot) => {
      incomingRows.value = snapshot.docs.map((docSnap) => normalizeIncomingRow(docSnap.id, docSnap.data()))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat incoming material' })
    },
  )
}

const openAddDialog = () => {
  selectedRow.value = null
  showFormDialog.value = true
}

const openEditDialog = (row) => {
  if (!row) return
  selectedRow.value = row
  showDetailDialog.value = false
  showFormDialog.value = true
}

const openDetail = (row) => {
  selectedRow.value = row
  showDetailDialog.value = true
}

const buildPayload = (form) => {
  const qtySj = Number(form.qty_surat_jalan ?? form.qty ?? 0)
  const qtyActual = Number(form.qty_actual ?? 0)
  const material = form.nama_barang || form.material || form.nama_material || ''
  const checker = form.checker_qc || form.qc_checker || form.checker || currentUserName.value
  const autoStatus = form.status_incoming || form.status_validation || autoStatusFromPayload(form)

  return {
    ...form,
    nomor_surat_jalan: form.nomor_surat_jalan || '',
    supplier: form.supplier || form.asal || '',
    asal: form.supplier || form.asal || '',
    material,
    nama_barang: material,
    nama_material: material,
    qty: qtySj,
    qty_surat_jalan: qtySj,
    qty_actual: qtyActual,
    quantity: qtyActual,
    selisih_qty: qtyActual - qtySj,
    checker,
    checker_qc: checker,
    qc_checker: checker,
    status: autoStatus,
    status_incoming: autoStatus,
    status_validation: autoStatus,
    status_validasi: qtyActual === qtySj ? 'Sesuai' : 'Selisih',
    updated_by: currentUserName.value,
    updated_at: serverTimestamp(),
  }
}

const autoStatusFromPayload = (form) => {
  if (form.kondisi_barang === 'RUSAK') return STATUS_REJECT
  const qtySj = Number(form.qty_surat_jalan ?? form.qty ?? 0)
  const qtyActual = Number(form.qty_actual ?? 0)
  return qtyActual === qtySj ? STATUS_SELESAI : STATUS_PARTIAL
}

const validatePayload = (payload) => {
  if (!payload.nomor_surat_jalan) return 'Nomor surat jalan wajib diisi'
  if (!payload.supplier) return 'Supplier wajib diisi'
  if (!payload.material) return 'Material wajib diisi'
  if (payload.qty_surat_jalan <= 0) return 'Qty surat jalan wajib lebih dari 0'
  if (payload.qty_actual < 0) return 'Qty actual tidak boleh minus'
  if (!payload.checker_qc) return 'Checker QC wajib diisi'
  return ''
}

const saveIncoming = async ({ form }) => {
  const payload = buildPayload(form)
  const errorMessage = validatePayload(payload)
  if (errorMessage) {
    $q.notify({ type: 'warning', message: errorMessage })
    return
  }

  submitting.value = true
  try {
    if (selectedRow.value?.id) {
      await updateDoc(doc(db, COLLECTION_NAME, selectedRow.value.id), {
        ...payload,
        history: [...(selectedRow.value.history || []), buildAuditEntry(payload.status_incoming, 'Incoming diperbarui')],
      })
      $q.notify({ type: 'positive', message: 'Incoming material diperbarui' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        status: STATUS_DATANG,
        status_incoming: STATUS_DATANG,
        status_validation: STATUS_DATANG,
        created_at: serverTimestamp(),
        created_by: {
          uid: authStore.user?.uid || auth.currentUser?.uid || '',
          nama: currentUserName.value,
          email: authStore.user?.email || auth.currentUser?.email || '',
        },
        history: [buildAuditEntry(STATUS_DATANG, 'Barang datang dan dokumen incoming dibuat')],
        stok_integration: 'PENDING',
      })
      $q.notify({ type: 'positive', message: 'Incoming material disimpan' })
    }

    showFormDialog.value = false
    selectedRow.value = null
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan incoming material' })
  } finally {
    submitting.value = false
  }
}

const canValidate = (row) => {
  if (!row?.id) return false
  return ![STATUS_SELESAI, STATUS_REJECT, STATUS_GUDANG].includes(getStatus(row))
}

const canUpdateGudang = (row) => {
  if (!row?.id) return false
  return getStatus(row) === STATUS_SELESAI && row.stok_integration !== 'DONE'
}

const validasiIncoming = (row) => {
  if (!canValidate(row)) return
  const currentStatus = getStatus(row)
  const nextStatus = currentStatus === STATUS_DATANG ? STATUS_QC : getQtyDiff(row) === 0 ? STATUS_SELESAI : STATUS_PARTIAL
  const note =
    nextStatus === STATUS_QC
      ? 'Barang masuk proses QC incoming'
      : nextStatus === STATUS_SELESAI
        ? 'QC approved dan qty sesuai'
        : 'QC validasi partial'

  $q.dialog({
    title: 'Validasi QC Incoming',
    message: `Validasi ${row.nomor_surat_jalan || '-'} sebagai ${statusLabel(nextStatus)}?`,
    cancel: true,
    ok: { color: 'green-10', unelevated: true, label: 'Validasi' },
  }).onOk(async () => {
    await updateWorkflow(row, nextStatus, note)
  })
}

const rejectIncoming = (row) => {
  if (!row?.id || getStatus(row) === STATUS_REJECT) return
  $q.dialog({
    title: 'Reject Incoming',
    message: `Reject incoming ${row.nomor_surat_jalan || '-'}?`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Reject' },
  }).onOk(async () => {
    await updateWorkflow(row, STATUS_REJECT, 'Incoming material direject oleh QC')
  })
}

const updateGudangPlaceholder = (row) => {
  if (!canUpdateGudang(row)) return
  $q.dialog({
    title: 'Update Gudang',
    message: 'Integrasi stok gudang masih placeholder. Tandai incoming siap update gudang?',
    cancel: true,
    ok: { color: 'green-10', unelevated: true, label: 'Tandai Siap' },
  }).onOk(async () => {
    await updateWorkflow(row, STATUS_GUDANG, 'Stock integration placeholder: siap update gudang', {
      stok_integration: 'READY',
    })
  })
}

const updateWorkflow = async (row, status, note, extraPayload = {}) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, row.id), {
      status,
      status_incoming: status,
      status_validation: status,
      updated_at: serverTimestamp(),
      updated_by: currentUserName.value,
      last_status_at: serverTimestamp(),
      history: [...(row.history || []), buildAuditEntry(status, note)],
      ...extraPayload,
    })
    showDetailDialog.value = false
    $q.notify({ type: 'positive', message: `Status diperbarui: ${statusLabel(status)}` })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal update workflow incoming' })
  }
}

const exportExcel = () => {
  $q.notify({ type: 'info', message: 'Export Excel incoming material belum diaktifkan' })
}

onMounted(loadIncoming)

onUnmounted(() => {
  if (unsubIncoming) unsubIncoming()
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

.shadow-premium {
  box-shadow: 0 10px 30px rgba(27, 94, 32, 0.15);
}

.tracking-widest {
  letter-spacing: 0.9px;
}

.leading-tight {
  line-height: 1.15;
}

.workflow-card-main {
  overflow: hidden;
}

.workflow-step {
  align-items: center;
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  display: flex;
  min-height: 62px;
  padding: 10px;
  transition: all 0.2s ease;
}

.workflow-step:hover {
  background: #edf7f3;
  transform: translateY(-1px);
}

.workflow-label {
  color: #1f2a24;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.2;
}

.workflow-caption {
  color: #667085;
  font-size: 11px;
  line-height: 1.2;
  margin-top: 2px;
}

.table-without-summary :deep(.incoming-summary) {
  display: none;
}

.section-title-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.detail-card {
  overflow: hidden;
}

.detail-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 14px 18px;
}

.status-panel,
.workflow-card {
  background: #f7faf8;
  border-radius: 8px;
}

.label-meta {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.field-value {
  color: #1f2a24;
  font-size: 14px;
  font-weight: 800;
}

.btn-hover {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.btn-hover:hover {
  transform: translateY(-1px);
}
</style>
