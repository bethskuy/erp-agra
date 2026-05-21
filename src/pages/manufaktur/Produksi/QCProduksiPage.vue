<template>
  <q-page class="qc-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          QC Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Validasi Hasil Produksi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Pemeriksaan hasil produksi sebelum proses packing dan delivery, lengkap dengan status QC,
          checker, quantity reject, dan catatan validasi.
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
          class="bg-white shadow-1 q-px-lg"
          @click="loadQcRows"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg-4">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="48px" />
            <div class="q-ml-md col">
              <div class="summary-label">{{ card.title }}</div>
              <div class="summary-value">{{ card.value }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="filter-card bg-white q-mb-lg">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari SPK, produk, line, checker, atau catatan QC..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="statusFilter"
              :options="statusFilterOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Filter Status QC"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} QC
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card bg-white">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="qc-table"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase table-head"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="qc-row">
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk || '-' }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.line_produksi || '-' }}</div>
            </q-td>
            <q-td key="line_produksi" :props="props">{{ props.row.line_produksi || '-' }}</q-td>
            <q-td key="qc_checklist" :props="props">
              <div class="text-weight-bold">{{ props.row.nama_pengecekan || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.parameter_qc || '-' }}</div>
            </q-td>
            <q-td key="qty_produksi" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_produksi) }}
            </q-td>
            <q-td key="qty_reject" :props="props" class="text-weight-bold text-negative">
              {{ formatNumber(props.row.qty_reject) }}
            </q-td>
            <q-td key="checker_qc" :props="props">{{ props.row.checker_qc || '-' }}</q-td>
            <q-td key="catatan_qc" :props="props">
              <div class="note-cell">{{ props.row.catatan_qc || '-' }}</div>
            </q-td>
            <q-td key="tanggal_qc" :props="props">{{ formatDateTime(props.row.tanggal_qc) }}</q-td>
            <q-td key="status_qc" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status_qc)"
                class="status-chip"
              >
                {{ props.row.status_qc || 'MENUNGGU_QC' }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props" @click.stop>
              <div class="row no-wrap justify-center q-gutter-xs">
                <q-btn
                  unelevated
                  rounded
                  dense
                  color="green-10"
                  icon="check_circle"
                  label="Approve"
                  no-caps
                  class="action-btn"
                  :disable="props.row.status_qc === 'QC_APPROVED'"
                  :loading="updatingId === props.row.id && actionType === 'approve'"
                  @click="openQcDialog(props.row, 'approve')"
                />
                <q-btn
                  outline
                  rounded
                  dense
                  color="negative"
                  icon="cancel"
                  label="Reject"
                  no-caps
                  class="action-btn"
                  :disable="props.row.status_qc === 'QC_REJECTED'"
                  :loading="updatingId === props.row.id && actionType === 'reject'"
                  @click="openQcDialog(props.row, 'reject')"
                />
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="fact_check" size="28px" class="q-mr-sm" />
            Belum ada data QC produksi.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showQcDialog" persistent>
      <q-card class="qc-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
            <div class="text-caption">{{ selectedRow?.nomor_spk || '-' }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="submitQcAction">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <div class="detail-label">Produk</div>
                <div class="detail-value">{{ selectedRow?.nama_produk || '-' }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="detail-label">Line Produksi</div>
                <div class="detail-value">{{ selectedRow?.line_produksi || '-' }}</div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="selectedQcChecklistId"
                  :options="qcChecklistOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                  label="QC Checklist"
                  :loading="loadingMasterQc"
                  :rules="[(val) => !!val || 'QC checklist wajib dipilih']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="selectedToolId"
                  :options="toolOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                  label="Tools / Peralatan"
                  :loading="loadingMasterTools"
                  clearable
                />
              </div>
            </div>

            <q-input
              v-model="qcNote"
              outlined
              type="textarea"
              autogrow
              label="Catatan QC"
              :rules="[(val) => !!val || 'Catatan QC wajib diisi']"
            />
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
            <q-btn
              unelevated
              rounded
              :color="actionType === 'approve' ? 'green-10' : 'negative'"
              :icon="actionType === 'approve' ? 'check_circle' : 'cancel'"
              :label="actionType === 'approve' ? 'Approve QC' : 'Reject QC'"
              no-caps
              type="submit"
              :loading="!!updatingId"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useAuthStore } from 'src/stores/auth'

const COLLECTION_NAME = 'qc_produksi_manufaktur'
const statusOptions = ['MENUNGGU_QC', 'QC_PROCESS', 'QC_APPROVED', 'QC_REJECTED']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const masterQcChecklist = ref([])
const masterTools = ref([])
const loading = ref(false)
const loadingMasterQc = ref(true)
const loadingMasterTools = ref(true)
const search = ref('')
const statusFilter = ref('all')
const showQcDialog = ref(false)
const selectedRow = ref(null)
const selectedQcChecklistId = ref('')
const selectedToolId = ref('')
const qcNote = ref('')
const actionType = ref('')
const updatingId = ref(null)
let unsubscribeQc = null
let unsubscribeMasterQc = null
let unsubscribeMasterTools = null

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'line_produksi', align: 'left', label: 'Line Produksi', field: 'line_produksi', sortable: true },
  { name: 'qc_checklist', align: 'left', label: 'QC Checklist', field: 'nama_pengecekan', sortable: true },
  { name: 'qty_produksi', align: 'right', label: 'Qty Produksi', field: 'qty_produksi', sortable: true },
  { name: 'qty_reject', align: 'right', label: 'Qty Reject', field: 'qty_reject', sortable: true },
  { name: 'checker_qc', align: 'left', label: 'Checker QC', field: 'checker_qc' },
  { name: 'catatan_qc', align: 'left', label: 'Catatan QC', field: 'catatan_qc' },
  { name: 'tanggal_qc', align: 'left', label: 'Tanggal QC', field: 'tanggal_qc', sortable: true },
  { name: 'status_qc', align: 'center', label: 'Status QC', field: 'status_qc', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const rowStatus = row.status_qc || 'MENUNGGU_QC'
    const matchesStatus = statusFilter.value === 'all' || rowStatus === statusFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_spk,
        row.nama_produk,
        row.line_produksi,
        row.nama_pengecekan,
        row.parameter_qc,
        row.nama_tools,
        row.checker_qc,
        row.catatan_qc,
        rowStatus,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Pending QC',
    value: rows.value.filter((row) => ['MENUNGGU_QC', 'QC_PROCESS'].includes(row.status_qc)).length,
    icon: 'pending_actions',
    color: 'orange-9',
  },
  {
    title: 'Approved',
    value: rows.value.filter((row) => row.status_qc === 'QC_APPROVED').length,
    icon: 'verified',
    color: 'green-10',
  },
  {
    title: 'Rejected',
    value: rows.value.filter((row) => row.status_qc === 'QC_REJECTED').length,
    icon: 'cancel',
    color: 'negative',
  },
])

const dialogTitle = computed(() =>
  actionType.value === 'approve' ? 'Approve Hasil Produksi' : 'Reject Hasil Produksi',
)

const currentCheckerName = computed(
  () => authStore.user?.displayName || authStore.user?.email || 'Checker QC',
)

const qcChecklistOptions = computed(() =>
  masterQcChecklist.value.map((item) => ({
    label: `${item.kode_qc ? `${item.kode_qc} - ` : ''}${item.nama_pengecekan}`,
    value: item.id,
    item,
  })),
)

const toolOptions = computed(() =>
  masterTools.value.map((item) => ({
    label: `${item.kode_tools ? `${item.kode_tools} - ` : ''}${item.nama_tools}`,
    value: item.id,
    item,
  })),
)

const selectedQcChecklist = computed(
  () => qcChecklistOptions.value.find((option) => option.value === selectedQcChecklistId.value)?.item,
)

const selectedTool = computed(
  () => toolOptions.value.find((option) => option.value === selectedToolId.value)?.item,
)

const statusColor = (status) => {
  const colors = {
    MENUNGGU_QC: 'blue-grey-6',
    QC_PROCESS: 'orange-9',
    QC_APPROVED: 'green-10',
    QC_REJECTED: 'negative',
  }
  return colors[status] || 'grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const openQcDialog = (row, type) => {
  selectedRow.value = row
  actionType.value = type
  selectedQcChecklistId.value = row.qc_checklist_id || ''
  selectedToolId.value = row.tools_id || ''
  qcNote.value = row.catatan_qc || ''
  showQcDialog.value = true
}

const submitQcAction = async () => {
  if (!selectedRow.value?.id) return
  const nextStatus = actionType.value === 'approve' ? 'QC_APPROVED' : 'QC_REJECTED'
  updatingId.value = selectedRow.value.id

  try {
    await updateDoc(doc(db, COLLECTION_NAME, selectedRow.value.id), {
      status_qc: nextStatus,
      qc_checklist_id: selectedQcChecklistId.value,
      kode_qc: selectedQcChecklist.value?.kode_qc || selectedRow.value.kode_qc || '',
      nama_pengecekan: selectedQcChecklist.value?.nama_pengecekan || selectedRow.value.nama_pengecekan || '',
      parameter_qc: selectedQcChecklist.value?.parameter || selectedRow.value.parameter_qc || '',
      toleransi_qc: selectedQcChecklist.value?.toleransi || selectedRow.value.toleransi_qc || '',
      satuan_qc: selectedQcChecklist.value?.satuan || selectedRow.value.satuan_qc || '',
      tools_id: selectedToolId.value || '',
      kode_tools: selectedTool.value?.kode_tools || selectedRow.value.kode_tools || '',
      nama_tools: selectedTool.value?.nama_tools || selectedRow.value.nama_tools || '',
      checker_qc: currentCheckerName.value,
      catatan_qc: qcNote.value,
      tanggal_qc: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    showQcDialog.value = false
    $q.notify({ type: 'positive', message: `Status QC diperbarui: ${nextStatus}` })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal memproses QC produksi' })
  } finally {
    updatingId.value = null
  }
}

const loadQcRows = () => {
  loading.value = true
  if (unsubscribeQc) unsubscribeQc()

  const qcQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeQc = onSnapshot(
    qcQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((qcDoc) => ({
        id: qcDoc.id,
        status_qc: 'MENUNGGU_QC',
        qty_produksi: 0,
        qty_reject: 0,
        ...qcDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat QC produksi' })
    },
  )
}

const loadMasterQcChecklist = () => {
  loadingMasterQc.value = true
  unsubscribeMasterQc = onSnapshot(
    query(collection(db, 'master_qc_checklist'), orderBy('nama_pengecekan', 'asc')),
    (snapshot) => {
      masterQcChecklist.value = snapshot.docs
        .map((qcDoc) => ({ id: qcDoc.id, ...qcDoc.data() }))
        .filter((item) => item.status !== 'Nonaktif')
      loadingMasterQc.value = false
    },
    (error) => {
      console.error(error)
      loadingMasterQc.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat master QC checklist' })
    },
  )
}

const loadMasterTools = () => {
  loadingMasterTools.value = true
  unsubscribeMasterTools = onSnapshot(
    query(collection(db, 'master_tools'), orderBy('nama_tools', 'asc')),
    (snapshot) => {
      masterTools.value = snapshot.docs
        .map((toolDoc) => ({ id: toolDoc.id, ...toolDoc.data() }))
        .filter((item) => item.status !== 'Nonaktif')
      loadingMasterTools.value = false
    },
    (error) => {
      console.error(error)
      loadingMasterTools.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat master tools' })
    },
  )
}

onMounted(() => {
  loadQcRows()
  loadMasterQcChecklist()
  loadMasterTools()
})

onUnmounted(() => {
  if (unsubscribeQc) unsubscribeQc()
  if (unsubscribeMasterQc) unsubscribeMasterQc()
  if (unsubscribeMasterTools) unsubscribeMasterTools()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}

.leading-tight {
  line-height: 1.15;
}

.summary-card,
.filter-card,
.table-card,
.qc-dialog {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.summary-label {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.summary-value {
  color: #1b5e20;
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
  margin-top: 5px;
}

.qc-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.qc-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.qc-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.note-cell {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 112px;
  justify-content: center;
}

.action-btn {
  min-width: 92px;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.qc-dialog {
  max-width: 95vw;
  width: 640px;
}

.detail-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.detail-value {
  color: #1b5e20;
  font-size: 14px;
  font-weight: 900;
  margin-top: 4px;
}
</style>
