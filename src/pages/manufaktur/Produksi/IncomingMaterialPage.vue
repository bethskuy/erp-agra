<template>
  <q-page class="incoming-page bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Incoming Material
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Dashboard Penerimaan & QC Warehouse
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Monitoring barang datang, validasi quantity, inspeksi QC, dan distribusi material ke produksi / proyek.
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
          @click="loadIncoming"
        />
      </div>
    </div>

    <div class="row q-gutter-md q-mb-lg items-center no-print">
      <q-btn
        unelevated
        color="green-10"
        icon="add_circle"
        label="Incoming Baru"
        no-caps
        rounded
        class="q-px-lg shadow-premium btn-hover"
        @click="openAddDialog"
      />
      <q-btn
        unelevated
        color="white"
        text-color="green-10"
        icon="fact_check"
        label="Monitor QC"
        no-caps
        rounded
        class="q-px-lg shadow-1"
        @click="scrollToMonitoring"
      />
      <q-btn
        unelevated
        color="green-1"
        text-color="green-10"
        icon="send"
        label="Distribusi Material"
        no-caps
        rounded
        class="q-px-lg shadow-1"
        @click="scrollToMonitoring"
      />
      <q-space />
      <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
        {{ incomingRows.length }} RECORD
      </q-chip>
    </div>

    <div class="animate-fade-up">
      <div id="incoming-monitoring" class="section-title-row q-mb-sm">
        <div>
          <div class="text-overline text-green-10 text-weight-black">Summary Incoming</div>
          <div class="text-caption text-grey-7">Ringkasan dokumen, QC pending, reject, dan quantity actual.</div>
        </div>
      </div>

      <incoming-summary :rows="incomingRows" :loading="loading" />

      <q-card flat bordered class="workflow-card-main q-mb-lg shadow-1 rounded-20 bg-white no-print">
        <q-card-section class="bg-green-10 text-white q-py-sm">
          <div class="text-caption text-weight-bold uppercase tracking-widest">Workflow Status Produksi</div>
        </q-card-section>
        <q-card-section class="q-pa-md">
          <div class="workflow-strip row q-col-gutter-sm">
            <div v-for="step in workflowSteps" :key="step.status" class="col-12 col-sm-6 col-lg">
              <div class="workflow-step">
                <q-avatar size="34px" color="green-1" text-color="green-10" :icon="step.icon" class="q-mr-sm" />
                <div class="col min-width-0">
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
        <div>
          <div class="text-overline text-green-10 text-weight-black">Monitoring Incoming</div>
          <div class="text-caption text-grey-7">Search, filter, QC validation, dan riwayat incoming material.</div>
        </div>
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
        @delete="deleteIncoming"
        @export="exportExcel"
      />
    </div>

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
              <incoming-summary :active-row="selectedRow" />
            </div>

            <div class="col-12">
              <q-card flat bordered class="detail-section-card rounded-20 bg-white">
                <q-card-section class="detail-section-head">
                  <q-icon name="table_rows" size="16px" class="q-mr-sm" />
                  Detail Item Material
                </q-card-section>
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
                        <th class="text-left">Kondisi</th>
                        <th class="text-left">Status QC</th>
                        <th class="text-left">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in detailItems" :key="`${item.nama_barang}-${index}`">
                        <td class="text-weight-bold text-green-10">{{ item.nama_barang || '-' }}</td>
                        <td>{{ item.kategori_material || '-' }}</td>
                        <td>{{ item.satuan || 'PCS' }}</td>
                        <td class="text-right">{{ formatNumber(item.qty_surat_jalan) }}</td>
                        <td class="text-right">{{ formatNumber(item.qty_actual) }}</td>
                        <td class="text-right">{{ formatNumber(item.selisih_qty) }}</td>
                        <td>{{ item.kondisi_barang || '-' }}</td>
                        <td>{{ item.status_qc || '-' }}</td>
                        <td>{{ item.catatan || '-' }}</td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-card-section>
              </q-card>
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
            :disable="[STATUS_REJECT, 'INCOMING_REJECT'].includes(getStatus(selectedRow))"
            @click="rejectIncoming(selectedRow)"
          />
      <q-btn
        unelevated
        color="green-10"
        icon="send"
        label="Distribusi Material"
        no-caps
        :disable="!canDistributeMaterial(selectedRow)"
        @click="distribusiMaterial(selectedRow)"
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
import { addDoc, collection, doc, deleteDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
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
const STATUS_REJECT = 'REJECTED'
const STATUS_DISTRIBUSI = 'DISTRIBUSI_MATERIAL'

const STATUS_LABEL = {
  [STATUS_DATANG]: 'Barang Datang',
  [STATUS_QC]: 'QC Incoming',
  [STATUS_SELESAI]: 'Validasi Selesai',
  [STATUS_PARTIAL]: 'Partial',
  [STATUS_REJECT]: 'Rejected',
  [STATUS_DISTRIBUSI]: 'Distribusi Material',
  BARANG_DATANG: 'Barang Datang',
  QC_PENDING: 'QC Incoming',
  QC_OK: 'Approve',
  QC_NG: 'Reject',
  SELESAI: 'Selesai',
  INCOMING_REJECT: 'Rejected',
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
    status: 'distribusi-material',
    label: 'Distribusi Material',
    caption: 'Material dialokasikan ke produksi/proyek',
    icon: 'send',
    badge: STATUS_DISTRIBUSI,
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

const detailItems = computed(() => (selectedRow.value ? getIncomingItems(selectedRow.value) : []))

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
    INCOMING_REJECT: 'report_problem',
    [STATUS_DISTRIBUSI]: 'send',
  }
  return icons[status] || 'task_alt'
}

const getIncomingItems = (row) => {
  if (Array.isArray(row?.items) && row.items.length) {
    return row.items.map((item) => {
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
        kondisi_barang: item.kondisi_barang || (item.status_qc === 'NG' ? 'RUSAK' : 'BAIK'),
        status_qc: item.status_qc || item.qc_status || 'OK',
        catatan: item.catatan || item.catatan_incoming || item.defect_note || '',
      }
    })
  }

  const qtySj = Number(row?.qty_surat_jalan ?? row?.qty ?? row?.qtySJ ?? row?.quantity ?? 0)
  const qtyActual = Number(row?.qty_actual ?? row?.qtyActual ?? row?.quantity ?? 0)
  return [
    {
      nama_barang: row?.nama_barang || row?.nama_material || row?.tipe_material || '',
      kategori_material: row?.kategori_material || row?.tipe_material || '',
      satuan: row?.satuan || 'PCS',
      qty_surat_jalan: qtySj,
      qty_actual: qtyActual,
      selisih_qty: Number(row?.selisih_qty ?? qtyActual - qtySj),
      kondisi_barang: row?.kondisi_barang || (row?.status_incoming === STATUS_REJECT ? 'RUSAK' : 'BAIK'),
      status_qc: row?.status_qc || row?.qc_status || 'OK',
      catatan: row?.catatan || row?.catatan_incoming || row?.defect_note || '',
    },
  ]
}

const getQtySj = (row) => getIncomingItems(row).reduce((sum, item) => sum + Number(item.qty_surat_jalan || 0), 0)
const getQtyActual = (row) => getIncomingItems(row).reduce((sum, item) => sum + Number(item.qty_actual || 0), 0)
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
  const items = getIncomingItems(data)
  const qtySj = getQtySj({ ...data, items })
  const qtyActual = getQtyActual({ ...data, items })
  const material = data.material || data.nama_barang || data.nama_material || data.tipe_material || ''
  const checker = data.checker_qc || data.qc_checker || data.checker || data.checker_gudang || ''
  const status = getStatus(data)

  return {
    id,
    ...data,
    items,
    supplier: data.supplier || data.asal || '',
    material: material || items[0]?.nama_barang || '',
    nama_barang: material || items[0]?.nama_barang || '',
    nama_material: material || items[0]?.nama_barang || '',
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

const scrollToMonitoring = () => {
  document.getElementById('incoming-monitoring')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const buildPayload = (form) => {
  const items = getIncomingItems(form)
  const qtySj = getQtySj({ ...form, items })
  const qtyActual = getQtyActual({ ...form, items })
  const material = form.nama_barang || form.material || form.nama_material || ''
  const checker = form.checker_qc || form.qc_checker || form.checker || currentUserName.value
  const autoStatus = form.status_incoming || form.status_validation || autoStatusFromPayload(form)

  return {
    ...form,
    items,
    nomor_surat_jalan: form.nomor_surat_jalan || '',
    supplier: form.supplier || form.asal || '',
    asal: form.supplier || form.asal || '',
    material: material || items[0]?.nama_barang || '',
    nama_barang: material || items[0]?.nama_barang || '',
    nama_material: material || items[0]?.nama_barang || '',
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
  if (getIncomingItems(form).some((item) => item.kondisi_barang === 'RUSAK' || item.status_qc === 'NG')) return STATUS_REJECT
  const qtySj = getQtySj(form)
  const qtyActual = getQtyActual(form)
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
  return ![STATUS_SELESAI, STATUS_REJECT, STATUS_DISTRIBUSI, 'INCOMING_REJECT'].includes(getStatus(row))
}

const canDistributeMaterial = (row) => {
  if (!row?.id) return false
  return getStatus(row) === STATUS_SELESAI
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
  if (!row?.id || [STATUS_REJECT, 'INCOMING_REJECT'].includes(getStatus(row))) return
  $q.dialog({
    title: 'Reject Incoming',
    message: `Reject incoming ${row.nomor_surat_jalan || '-'}?`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Reject' },
  }).onOk(async () => {
    await updateWorkflow(row, STATUS_REJECT, 'Incoming material direject oleh QC')
  })
}

const deleteIncoming = (row) => {
  if (!row?.id) return
  $q.dialog({
    title: 'Hapus Incoming',
    message: `Hapus permanen incoming ${row.nomor_surat_jalan || '-'}? Data yang dihapus tidak dapat dikembalikan.`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Hapus' },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, row.id))
      if (selectedRow.value?.id === row.id) {
        showDetailDialog.value = false
        selectedRow.value = null
      }
      $q.notify({ type: 'positive', message: 'Incoming material berhasil dihapus' })
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal menghapus incoming material' })
    }
  })
}

const distribusiMaterial = (row) => {
  if (!canDistributeMaterial(row)) return
  $q.dialog({
    title: 'Distribusi Material',
    message: 'Tandai incoming ini sebagai material yang sudah didistribusikan ke produksi / proyek?',
    cancel: true,
    ok: { color: 'green-10', unelevated: true, label: 'Distribusikan' },
  }).onOk(async () => {
    await updateWorkflow(row, STATUS_DISTRIBUSI, 'Material didistribusikan ke produksi / proyek', {
      distribution_status: 'DONE',
      distribution_target: row.distribution_target || row.alokasi || 'Produksi / Proyek',
      distribution_at: serverTimestamp(),
      distribution_by: currentUserName.value,
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
      distribution_history:
        status === STATUS_DISTRIBUSI
          ? [
              ...(row.distribution_history || []),
              {
                at: new Date().toISOString(),
                by: currentUserName.value,
                status,
                note,
                target: extraPayload.distribution_target || row.distribution_target || 'Produksi / Proyek',
              },
            ]
          : row.distribution_history || [],
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
  border-color: #dfe8df;
  overflow: hidden;
}

.workflow-step {
  align-items: center;
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  display: flex;
  min-height: 72px;
  padding: 12px;
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

.min-width-0 {
  min-width: 0;
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

.detail-section-card {
  border-color: #dfe8df;
  height: 100%;
  overflow: hidden;
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
