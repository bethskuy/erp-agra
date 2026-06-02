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
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg-3">
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
              placeholder="Cari SPK, produk, departemen, operator, atau status QC..."
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
            <q-td key="no_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.no_spk || props.row.nomor_spk || '-' }}
            </q-td>
            <q-td key="nama_produk" :props="props" class="text-weight-bold text-green-10">
              {{ props.row.nama_produk || '-' }}
            </q-td>
            <q-td key="departemen_asal" :props="props">{{ props.row.departemen_asal || '-' }}</q-td>
            <q-td key="qty_produksi" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_produksi) }}
            </q-td>
            <q-td key="qty_passed" :props="props" class="text-weight-bold text-green-10">
              {{ formatNumber(props.row.qty_passed) }}
            </q-td>
            <q-td key="qty_rework" :props="props" class="text-weight-bold text-purple-8">
              {{ formatNumber(props.row.qty_rework) }}
            </q-td>
            <q-td key="qty_reject" :props="props" class="text-weight-bold text-negative">
              {{ formatNumber(props.row.qty_reject) }}
            </q-td>
            <q-td key="operator" :props="props">{{ props.row.operator || '-' }}</q-td>
            <q-td key="tanggal_finish" :props="props">{{ formatDateTime(props.row.tanggal_finish) }}</q-td>
            <q-td key="status_qc" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status_qc)"
                class="status-chip"
              >
                {{ statusLabel(props.row.status_qc) }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props" @click.stop>
              <div class="row no-wrap justify-center q-gutter-xs">
                <q-btn
                  v-if="isPendingQc(props.row.status_qc)"
                  unelevated
                  rounded
                  dense
                  color="green-10"
                  icon="fact_check"
                  label="Jalankan QC"
                  no-caps
                  class="action-btn"
                  :loading="updatingId === props.row.id"
                  @click="openQcDialog(props.row)"
                />
                <q-badge v-else color="grey-6" class="q-px-sm">
                  {{ statusLabel(props.row.status_qc) }}
                </q-badge>
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

    <q-dialog v-model="showQcDialog" persistent maximized>
      <q-card class="qc-dialog column">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
            <div class="text-caption">{{ selectedRow?.no_spk || selectedRow?.nomor_spk || '-' }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form class="column col" @submit.prevent="submitQcAction">
          <q-card-section class="q-pa-lg col scroll">
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-3">
                <div class="detail-label">No SPK</div>
                <div class="detail-value">{{ selectedRow?.no_spk || selectedRow?.nomor_spk || '-' }}</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="detail-label">Produk</div>
                <div class="detail-value">{{ selectedRow?.nama_produk || '-' }}</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="detail-label">Departemen Asal</div>
                <div class="detail-value">{{ selectedRow?.departemen_asal || '-' }}</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="detail-label">Operator</div>
                <div class="detail-value">{{ selectedRow?.operator || '-' }}</div>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-md-4">
                <q-input
                  :model-value="formatNumber(selectedRow?.qty_produksi)"
                  outlined
                  dense
                  readonly
                  label="Qty Produksi"
                  bg-color="grey-2"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model.number="qtyPassed" outlined dense type="number" min="0" label="Qty Passed" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model.number="qtyRework" outlined dense type="number" min="0" label="Qty Rework" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model.number="qtyReject" outlined dense type="number" min="0" label="Qty Reject" />
              </div>
            </div>

            <q-card flat bordered class="q-mb-lg">
              <q-card-section class="bg-green-1 text-green-10 text-weight-bold">
                Checklist QC
              </q-card-section>
              <q-separator />
              <q-card-section>
                <q-inner-loading :showing="loadingMasterQc" />
                <q-list separator>
                  <q-item v-for="item in filteredChecklist" :key="item.id">
                    <q-item-section avatar>
                      <q-checkbox
                        :model-value="!!checklistState[item.id]"
                        color="green-10"
                        @update:model-value="(val) => setChecklistChecked(item.id, val)"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-green-10">
                        {{ item.nama_pengecekan }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ item.parameter || '-' }} | Toleransi: {{ item.toleransi || '-' }}
                        <span v-if="item.departemen_terkait"> | Dept: {{ item.departemen_terkait }}</span>
                        <span v-if="item.kategori_produk"> | Kategori: {{ item.kategori_produk }}</span>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <q-input
              v-model="qcNote"
              outlined
              type="textarea"
              autogrow
              label="Catatan QC"
              :rules="[(val) => !!val || 'Catatan QC wajib diisi']"
            />

            <q-file
              v-model="rejectPhotoFile"
              outlined
              dense
              accept="image/*"
              label="Upload Foto Reject"
              class="q-mt-md"
              clearable
            >
              <template #prepend>
                <q-icon name="photo_camera" color="green-10" />
              </template>
            </q-file>
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
            <q-btn
              unelevated
              rounded
              color="green-10"
              icon="fact_check"
              label="Simpan Hasil QC"
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
import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useAuthStore } from 'src/stores/auth'

const COLLECTION_NAME = 'qc_produksi_manufaktur'
const PRODUCTION_COLLECTION = 'manufactur_departemen_produksi'
const FINISHED_GOODS_COLLECTION = 'manufactur_master_barang'
const REWORK_COLLECTION = 'manufactur_rework_queue'
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Pending QC', value: 'pending_qc' },
  { label: 'Approved', value: 'approved' },
  { label: 'Reject', value: 'reject' },
  { label: 'Rework', value: 'rework' },
]

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const masterQcChecklist = ref([])
const loading = ref(false)
const loadingMasterQc = ref(true)
const search = ref('')
const statusFilter = ref('all')
const showQcDialog = ref(false)
const selectedRow = ref(null)
const checklistState = ref({})
const qtyPassed = ref(0)
const qtyRework = ref(0)
const qtyReject = ref(0)
const qcNote = ref('')
const rejectPhotoFile = ref(null)
const updatingId = ref(null)
let unsubscribeQc = null
let unsubscribeMasterQc = null

const columns = [
  { name: 'no_spk', align: 'left', label: 'No SPK', field: 'no_spk', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'departemen_asal', align: 'left', label: 'Departemen Asal', field: 'departemen_asal', sortable: true },
  { name: 'qty_produksi', align: 'right', label: 'Qty Produksi', field: 'qty_produksi', sortable: true },
  { name: 'qty_passed', align: 'right', label: 'Qty Passed', field: 'qty_passed', sortable: true },
  { name: 'qty_rework', align: 'right', label: 'Qty Rework', field: 'qty_rework', sortable: true },
  { name: 'qty_reject', align: 'right', label: 'Qty Reject', field: 'qty_reject', sortable: true },
  { name: 'operator', align: 'left', label: 'Operator', field: 'operator', sortable: true },
  { name: 'tanggal_finish', align: 'left', label: 'Tanggal Finish', field: 'tanggal_finish', sortable: true },
  { name: 'status_qc', align: 'center', label: 'Status QC', field: 'status_qc', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const rowStatus = normalizeQcStatus(row.status_qc)
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'pending_qc' && rowStatus === 'pending_qc') ||
      (statusFilter.value === 'approved' && rowStatus === 'qc_approved') ||
      (statusFilter.value === 'reject' && rowStatus === 'qc_reject') ||
      (statusFilter.value === 'rework' && rowStatus === 'rework')
    const matchesSearch =
      !keyword ||
      [
        row.nomor_spk,
        row.no_spk,
        row.nama_produk,
        row.departemen_asal,
        row.operator,
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
    value: rows.value.filter((row) => ['pending_qc', 'qc_process'].includes(normalizeQcStatus(row.status_qc))).length,
    icon: 'pending_actions',
    color: 'orange-9',
  },
  {
    title: 'Approved',
    value: rows.value.filter((row) => normalizeQcStatus(row.status_qc) === 'qc_approved').length,
    icon: 'verified',
    color: 'green-10',
  },
  {
    title: 'Reject',
    value: rows.value.filter((row) => normalizeQcStatus(row.status_qc) === 'qc_reject').length,
    icon: 'cancel',
    color: 'negative',
  },
  {
    title: 'Rework',
    value: rows.value.filter((row) => normalizeQcStatus(row.status_qc) === 'rework').length,
    icon: 'restart_alt',
    color: 'purple-7',
  },
])

const dialogTitle = computed(() => 'Jalankan QC Produksi')

const normalizeQcStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase()
  if (normalized === 'menunggu_qc' || normalized === 'qc process' || normalized === 'qc_process') return 'pending_qc'
  if (normalized === 'qc_approved' || normalized === 'approved') return 'qc_approved'
  if (normalized === 'qc_rejected' || normalized === 'reject') return 'qc_reject'
  if (normalized === 'qc_rework' || normalized === 'rework') return 'rework'
  return normalized || 'pending_qc'
}

const statusLabel = (status) => {
  const normalized = normalizeQcStatus(status)
  if (normalized === 'pending_qc') return 'Pending QC'
  if (normalized === 'qc_approved') return 'Approved'
  if (normalized === 'qc_reject') return 'Reject'
  if (normalized === 'rework') return 'Rework'
  return status || 'Pending QC'
}

const isPendingQc = (status) => normalizeQcStatus(status) === 'pending_qc'

const currentCheckerName = computed(
  () => authStore.user?.displayName || authStore.user?.email || 'Checker QC',
)

const statusColor = (status) => {
  const normalized = normalizeQcStatus(status)
  const colors = {
    pending_qc: 'orange-9',
    qc_approved: 'green-10',
    qc_reject: 'negative',
    rework: 'purple-7',
  }
  return colors[normalized] || 'grey-6'
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

const setChecklistChecked = (id, value) => {
  checklistState.value = { ...checklistState.value, [id]: value }
}

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve('')
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const openQcDialog = (row) => {
  selectedRow.value = row
  checklistState.value = Object.fromEntries(
    filteredChecklist.value.map((item) => [
      item.id,
      row.checklist_results?.some?.((result) => result.id === item.id && result.checked) || false,
    ]),
  )
  qtyPassed.value = Number(row.qty_passed || row.qty_lolos || row.qty_produksi || 0)
  qtyRework.value = Number(row.qty_rework || 0)
  qtyReject.value = Number(row.qty_reject || 0)
  qcNote.value = row.catatan_qc || ''
  rejectPhotoFile.value = null
  showQcDialog.value = true
}

const filteredChecklist = computed(() => {
  const departemen = String(selectedRow.value?.departemen_asal || '').trim().toLowerCase()
  const kategori = String(selectedRow.value?.kategori_produk || '').trim().toLowerCase()

  const matched = masterQcChecklist.value.filter((item) => {
    const itemDepartemen = String(item.departemen_terkait || '').trim().toLowerCase()
    const itemKategori = String(item.kategori_produk || '').trim().toLowerCase()
    const departemenMatch = !itemDepartemen || !departemen || itemDepartemen === departemen
    const kategoriMatch = !itemKategori || !kategori || itemKategori === kategori
    return departemenMatch && kategoriMatch
  })

  return matched.length ? matched : masterQcChecklist.value
})

const submitQcAction = async () => {
  if (!selectedRow.value?.id) return
  const qtyProduksi = Number(selectedRow.value.qty_produksi || 0)
  const nextQtyPassed = Number(qtyPassed.value || 0)
  const nextQtyRework = Number(qtyRework.value || 0)
  const nextQtyReject = Number(qtyReject.value || 0)

  if (nextQtyPassed + nextQtyRework + nextQtyReject !== qtyProduksi) {
    $q.notify({
      type: 'warning',
      message: 'Qty passed + qty rework + qty reject harus sama dengan qty produksi.',
    })
    return
  }

  const checklistResults = filteredChecklist.value.map((item) => ({
    id: item.id,
    kode_qc: item.kode_qc || '',
    nama_pengecekan: item.nama_pengecekan || '',
    parameter: item.parameter || '',
    toleransi: item.toleransi || '',
    satuan: item.satuan || '',
    checked: !!checklistState.value[item.id],
  }))
  const allChecklistPassed = checklistResults.length
    ? checklistResults.every((item) => item.checked)
    : true
  const nextStatus = !allChecklistPassed
    ? nextQtyRework > 0
      ? 'rework'
      : 'reject'
    : nextQtyReject > 0
      ? 'reject'
      : nextQtyRework > 0
        ? 'rework'
        : 'approved'
  const monitoringStatus = nextStatus === 'approved' ? 'qc_approved' : nextStatus === 'reject' ? 'qc_reject' : 'rework'
  updatingId.value = selectedRow.value.id

  try {
    const rejectPhotoBase64 = await fileToBase64(rejectPhotoFile.value)
    const batch = writeBatch(db)
    batch.update(doc(db, COLLECTION_NAME, selectedRow.value.id), {
      status_qc: nextStatus,
      checklist_results: checklistResults,
      qty_passed: nextQtyPassed,
      qty_lolos: nextQtyPassed,
      qty_rework: nextQtyRework,
      qty_reject: nextQtyReject,
      checker_qc: currentCheckerName.value,
      catatan_qc: qcNote.value,
      foto_reject_base64: rejectPhotoBase64 || selectedRow.value.foto_reject_base64 || '',
      tanggal_qc: serverTimestamp(),
      updated_at: serverTimestamp(),
    })

    if (selectedRow.value.production_source_id && selectedRow.value.source_type === 'production') {
      batch.update(doc(db, PRODUCTION_COLLECTION, selectedRow.value.production_source_id), {
        status_produksi: monitoringStatus,
        status: monitoringStatus,
        status_qc: monitoringStatus,
        qty_lolos_qc: nextQtyPassed,
        qty_passed_qc: nextQtyPassed,
        qty_rework_qc: nextQtyRework,
        qty_reject_qc: nextQtyReject,
        qc_queue_id: selectedRow.value.id,
        qc_checked_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    }

    if (nextStatus === 'approved' || nextQtyPassed > 0) {
      const fgId = selectedRow.value.produk_id || selectedRow.value.kode_produk || selectedRow.value.id
      batch.set(
        doc(db, FINISHED_GOODS_COLLECTION, fgId),
        {
          nama: selectedRow.value.nama_produk || '',
          nama_barang: selectedRow.value.nama_produk || '',
          kode: selectedRow.value.kode_produk || fgId,
          kode_barang: selectedRow.value.kode_produk || fgId,
          jenis_material: 'bahan_jadi',
          tipe_material: 'bahan_jadi',
          kategori: 'bahan_jadi',
          satuan: selectedRow.value.satuan || 'Unit',
          stok_tersedia: increment(nextQtyPassed),
          stok: increment(nextQtyPassed),
          updated_at: serverTimestamp(),
        },
        { merge: true },
      )
    }

    if (nextStatus === 'reject' || nextStatus === 'rework') {
      batch.set(doc(collection(db, REWORK_COLLECTION)), {
        qc_queue_id: selectedRow.value.id,
        production_source_id: selectedRow.value.production_source_id || '',
        no_spk: selectedRow.value.no_spk || selectedRow.value.nomor_spk || '',
        nomor_spk: selectedRow.value.nomor_spk || selectedRow.value.no_spk || '',
        nama_produk: selectedRow.value.nama_produk || '',
        kode_produk: selectedRow.value.kode_produk || '',
        departemen_asal: selectedRow.value.departemen_asal || '',
        departemen_id: selectedRow.value.departemen_id || '',
        qty_passed: nextQtyPassed,
        qty_rework: nextQtyRework,
        qty_reject: nextQtyReject,
        satuan: selectedRow.value.satuan || 'Unit',
        catatan_qc: `${qcNote.value || ''}${qcNote.value ? '\n' : ''}Perlu perbaikan ulang dari QC`,
        foto_reject_base64: rejectPhotoBase64 || '',
        status_rework: nextStatus,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    }

    await batch.commit()
    showQcDialog.value = false
    $q.notify({ type: 'positive', message: `Status QC diperbarui: ${statusLabel(nextStatus)}` })
  } catch (error) {
    console.error('[QCProduksi] Gagal memproses QC produksi', {
      error,
      selectedRow: selectedRow.value,
      qtyProduksi,
      nextQtyPassed,
      nextQtyRework,
      nextQtyReject,
    })
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
        status_qc: 'pending_qc',
        qty_produksi: 0,
        qty_reject: 0,
        qty_lolos: 0,
        qty_passed: 0,
        qty_rework: 0,
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

onMounted(() => {
  loadQcRows()
  loadMasterQcChecklist()
})

onUnmounted(() => {
  if (unsubscribeQc) unsubscribeQc()
  if (unsubscribeMasterQc) unsubscribeMasterQc()
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
