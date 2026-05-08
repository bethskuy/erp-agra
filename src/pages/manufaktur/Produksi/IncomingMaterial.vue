<template>
  <q-page class="incoming-module q-pa-md q-pa-lg-md">
    <div class="module-header row items-center justify-between q-mb-md">
      <div class="col-12 col-md">
        <div class="text-h4 text-weight-bolder text-green-10">Incoming Material</div>
        <div class="text-subtitle2 text-grey-7">
          Monitoring penerimaan material manufaktur, validasi QC, dan status incoming PT.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          color="green-10"
          icon="add_circle"
          label="Input Incoming"
          no-caps
          class="text-weight-bold q-px-lg"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <incoming-summary :rows="incomingRows" />

    <incoming-table-page
      class="table-without-summary"
      :rows="incomingRows"
      :loading="loading"
      @refresh="listenIncoming"
      @view="openDetail"
      @edit="openEditDialog"
      @validasi="validasiIncoming"
      @reject="rejectIncoming"
      @export="exportExcel"
    />

    <incoming-dialog
      v-model="showDialog"
      :row="selectedRow"
      :submitting="submitting"
      :current-user-name="currentUserName"
      @save="saveIncoming"
    />

    <q-dialog v-model="showDetailDialog">
      <q-card class="detail-card">
        <q-card-section class="detail-header">
          <div class="row items-center no-wrap">
            <q-icon name="fact_check" size="24px" class="q-mr-sm" />
            <div class="col">
              <div class="text-subtitle1 text-weight-bolder">Detail Incoming Material</div>
              <div class="text-caption">{{ selectedRow?.nomor_surat_jalan || '-' }}</div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section v-if="selectedRow" class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-card flat bordered class="detail-status">
                <q-card-section class="row items-center q-pa-md">
                  <div class="col">
                    <div class="text-caption text-grey-7 text-weight-bold">NOMOR SURAT JALAN</div>
                    <div class="text-h6 text-weight-bolder text-green-10">
                      {{ selectedRow.nomor_surat_jalan || '-' }}
                    </div>
                  </div>
                  <q-badge :color="statusColor(selectedRow.status)" class="status-badge">
                    {{ statusLabel(selectedRow.status) }}
                  </q-badge>
                </q-card-section>
              </q-card>
            </div>

            <div v-for="item in detailFields" :key="item.label" class="col-12 col-sm-6 col-md-4">
              <div class="field-label">{{ item.label }}</div>
              <div class="field-value">{{ item.value }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4">
              <div class="field-label">Selisih</div>
              <div class="field-value" :class="qtyDiff(selectedRow) === 0 ? 'text-positive' : 'text-orange-10'">
                {{ formatNumber(qtyDiff(selectedRow)) }}
              </div>
            </div>

            <div class="col-12">
              <div class="field-label">Catatan</div>
              <div class="text-body2">{{ selectedRow.catatan || selectedRow.catatan_incoming || '-' }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1 q-pa-md">
          <q-btn flat color="grey-7" label="Tutup" no-caps v-close-popup />
          <q-btn flat color="green-10" icon="edit_note" label="Edit" no-caps @click="openEditDialog(selectedRow)" />
          <q-btn
            unelevated
            color="positive"
            icon="fact_check"
            label="Validasi"
            no-caps
            :disable="isFinalStatus(selectedRow)"
            @click="validasiIncoming(selectedRow)"
          />
          <q-btn
            flat
            color="negative"
            icon="block"
            label="Reject"
            no-caps
            :disable="selectedRow?.status === STATUS_REJECT"
            @click="rejectIncoming(selectedRow)"
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

const COLLECTION_NAME = 'incoming_material_manufaktur'
const STATUS_PENDING = 'MENUNGGU_VALIDASI'
const STATUS_VALIDATED = 'VALIDASI_SELESAI'
const STATUS_PARTIAL = 'PARTIAL'
const STATUS_REJECT = 'INCOMING_REJECT'

const $q = useQuasar()
const authStore = useAuthStore()

const incomingRows = ref([])
const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const showDetailDialog = ref(false)
const selectedRow = ref(null)
let unsubscribeIncoming = null

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
    { label: 'Supplier', value: row.supplier || '-' },
    { label: 'Material', value: row.material || row.nama_barang || '-' },
    { label: 'Qty Surat Jalan', value: formatNumber(row.qty || row.qty_surat_jalan) },
    { label: 'Qty Actual', value: formatNumber(row.qty_actual) },
    { label: 'Checker QC', value: row.checker || row.checker_qc || '-' },
    { label: 'Tanggal Masuk', value: formatDate(row.tanggal_masuk) },
  ]
})

const normalizeIncomingRow = (id, data) => {
  const qty = Number(data.qty ?? data.qty_surat_jalan ?? 0)
  const qtyActual = Number(data.qty_actual ?? data.qtyActual ?? 0)
  const material = data.material || data.nama_barang || data.nama_material || ''
  const checker = data.checker || data.checker_qc || data.qc_checker || ''
  const status = data.status || data.status_validation || data.status_incoming || STATUS_PENDING

  return {
    id,
    ...data,
    nomor_surat_jalan: data.nomor_surat_jalan || data.noSuratJalan || '',
    supplier: data.supplier || data.asal || '',
    material,
    nama_barang: material,
    nama_material: material,
    qty,
    qty_surat_jalan: qty,
    qty_actual: qtyActual,
    selisih_qty: Number(data.selisih_qty ?? qtyActual - qty),
    checker,
    checker_qc: checker,
    qc_checker: checker,
    status,
    status_validation: status,
    status_incoming: status,
    tanggal_masuk: data.tanggal_masuk || normalizeDate(data.created_at) || today(),
  }
}

const today = () => new Date().toISOString().slice(0, 10)

const listenIncoming = () => {
  loading.value = true
  if (unsubscribeIncoming) unsubscribeIncoming()

  unsubscribeIncoming = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc')),
    (snapshot) => {
      incomingRows.value = snapshot.docs.map((document) => normalizeIncomingRow(document.id, document.data()))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat incoming material' })
    },
  )
}

const openCreateDialog = () => {
  selectedRow.value = null
  showDialog.value = true
}

const openEditDialog = (row) => {
  if (!row) return
  selectedRow.value = row
  showDetailDialog.value = false
  showDialog.value = true
}

const openDetail = (row) => {
  selectedRow.value = row
  showDetailDialog.value = true
}

const buildPayload = (form) => {
  const qty = Number(form.qty ?? form.qty_surat_jalan ?? 0)
  const qtyActual = Number(form.qty_actual ?? 0)
  const material = form.material || form.nama_barang || form.nama_material || ''
  const checker = form.checker || form.checker_qc || form.qc_checker || currentUserName.value
  const status = form.status || form.status_validation || form.status_incoming || getAutoStatus(form)

  return {
    nomor_surat_jalan: form.nomor_surat_jalan || '',
    supplier: form.supplier || form.asal || '',
    material,
    qty,
    qty_actual: qtyActual,
    checker,
    status,
    updated_at: serverTimestamp(),

    // Aliases consumed by reusable incoming components.
    nama_barang: material,
    nama_material: material,
    qty_surat_jalan: qty,
    selisih_qty: qtyActual - qty,
    checker_qc: checker,
    qc_checker: checker,
    status_validation: status,
    status_incoming: status,
    tanggal_masuk: form.tanggal_masuk || today(),
    satuan: form.satuan || 'PCS',
    kategori_material: form.kategori_material || '',
    kondisi_barang: form.kondisi_barang || '',
    catatan: form.catatan || form.catatan_incoming || '',
    catatan_incoming: form.catatan || form.catatan_incoming || '',
  }
}

const getAutoStatus = (form) => {
  if (form.kondisi_barang === 'RUSAK') return STATUS_REJECT
  const qty = Number(form.qty ?? form.qty_surat_jalan ?? 0)
  const qtyActual = Number(form.qty_actual ?? 0)
  if (qtyActual === qty) return STATUS_VALIDATED
  return STATUS_PARTIAL
}

const validatePayload = (payload) => {
  if (!payload.nomor_surat_jalan) return 'Nomor surat jalan wajib diisi'
  if (!payload.supplier) return 'Supplier wajib diisi'
  if (!payload.material) return 'Material wajib diisi'
  if (!Number.isFinite(payload.qty) || payload.qty <= 0) return 'Qty surat jalan wajib lebih dari 0'
  if (!Number.isFinite(payload.qty_actual) || payload.qty_actual < 0) return 'Qty actual tidak boleh minus'
  if (!payload.checker) return 'Checker QC wajib diisi'
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
      await updateDoc(doc(db, COLLECTION_NAME, selectedRow.value.id), payload)
      $q.notify({ type: 'positive', message: 'Incoming material berhasil diperbarui' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
        created_by: {
          uid: authStore.user?.uid || auth.currentUser?.uid || '',
          nama: currentUserName.value,
          email: authStore.user?.email || auth.currentUser?.email || '',
        },
      })
      $q.notify({ type: 'positive', message: 'Incoming material berhasil disimpan' })
    }

    showDialog.value = false
    selectedRow.value = null
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan incoming material' })
  } finally {
    submitting.value = false
  }
}

const validasiIncoming = (row) => {
  if (!row?.id || isFinalStatus(row)) return
  $q.dialog({
    title: 'Validasi QC',
    message: `Validasi incoming ${row.nomor_surat_jalan || '-'}?`,
    cancel: true,
    ok: { color: 'green-10', unelevated: true, label: 'Validasi' },
  }).onOk(async () => {
    await updateStatus(row, row.selisih_qty === 0 ? STATUS_VALIDATED : STATUS_PARTIAL, 'Validasi QC berhasil')
  })
}

const rejectIncoming = (row) => {
  if (!row?.id || row.status === STATUS_REJECT) return
  $q.dialog({
    title: 'Reject Incoming',
    message: `Reject incoming ${row.nomor_surat_jalan || '-'}?`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Reject' },
  }).onOk(async () => {
    await updateStatus(row, STATUS_REJECT, 'Incoming material direject')
  })
}

const updateStatus = async (row, status, successMessage) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, row.id), {
      status,
      status_validation: status,
      status_incoming: status,
      updated_at: serverTimestamp(),
      validated_at: serverTimestamp(),
      validated_by: currentUserName.value,
    })
    showDetailDialog.value = false
    $q.notify({ type: 'positive', message: successMessage })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal update status incoming' })
  }
}

const exportExcel = () => {
  $q.notify({ type: 'info', message: 'Export Excel incoming material belum diaktifkan' })
}

const isFinalStatus = (row) => [STATUS_VALIDATED, STATUS_REJECT].includes(row?.status)
const qtyDiff = (row) => Number(row?.qty_actual || 0) - Number(row?.qty || row?.qty_surat_jalan || 0)
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

const statusLabel = (status) => {
  const labels = {
    [STATUS_PENDING]: 'Menunggu Validasi',
    [STATUS_VALIDATED]: 'Validasi Selesai',
    [STATUS_PARTIAL]: 'Partial',
    [STATUS_REJECT]: 'Incoming Reject',
  }

  return labels[status] || status || '-'
}

const statusColor = (status) => {
  const colors = {
    [STATUS_PENDING]: 'orange-9',
    [STATUS_VALIDATED]: 'positive',
    [STATUS_PARTIAL]: 'amber-9',
    [STATUS_REJECT]: 'negative',
  }

  return colors[status] || 'blue-grey-7'
}

onMounted(listenIncoming)

onUnmounted(() => {
  if (unsubscribeIncoming) unsubscribeIncoming()
})
</script>

<style scoped>
.incoming-module {
  background: #f4f8f5;
  min-height: 100%;
}

.module-header {
  background: #ffffff;
  border: 1px solid #dfe8df;
  border-radius: 8px;
  padding: 16px;
}

.table-without-summary :deep(.incoming-summary) {
  display: none;
}

.detail-card {
  border-radius: 8px;
  max-width: 95vw;
  width: 860px;
}

.detail-header {
  background: linear-gradient(135deg, #163c2d 0%, #1b5e20 100%);
  color: #ffffff;
  padding: 14px 16px;
}

.detail-status {
  background: #f7faf8;
  border-radius: 8px;
}

.status-badge {
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  padding: 7px 10px;
  text-transform: uppercase;
}

.field-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.field-value {
  color: #1f2a24;
  font-size: 14px;
  font-weight: 800;
}
</style>
