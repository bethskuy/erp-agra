<template>
  <q-page class="packing-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Packing Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Monitoring Packing Barang Produksi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Pantau proses packing dari hasil QC approved sampai siap delivery berdasarkan SPK,
          quantity packing, checker, dan status packing.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none row q-gutter-sm">
        <q-btn
          flat
          rounded
          color="green-10"
          icon="sync"
          label="Refresh Data"
          no-caps
          :loading="loading"
          class="bg-white shadow-1 q-px-lg"
          @click="loadPackingRows"
        />
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="inventory_2"
          label="Input Packing"
          no-caps
          class="q-px-lg shadow-premium"
          @click="openPackingDialog()"
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
              placeholder="Cari SPK, produk, jenis packing, atau checker..."
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
              label="Filter Status Packing"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} PACKING
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
        class="packing-table"
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
          <q-tr :props="props" class="packing-row">
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk || '-' }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.jenis_packing || '-' }}</div>
            </q-td>
            <q-td key="qty_approved_qc" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_approved_qc) }}
            </q-td>
            <q-td key="qty_packing" :props="props" class="text-weight-bold text-positive">
              {{ formatNumber(props.row.qty_packing) }}
            </q-td>
            <q-td key="jenis_packing" :props="props">{{ props.row.jenis_packing || '-' }}</q-td>
            <q-td key="checker_packing" :props="props">
              {{ props.row.checker_packing || '-' }}
            </q-td>
            <q-td key="tanggal_packing" :props="props">
              {{ formatDateTime(props.row.tanggal_packing) }}
            </q-td>
            <q-td key="progress" :props="props">
              <div class="progress-cell">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="progress-label">Packing</span>
                  <span class="progress-value">{{ packingProgress(props.row) }}%</span>
                </div>
                <q-linear-progress
                  rounded
                  size="9px"
                  :value="packingProgress(props.row) / 100"
                  :color="progressColor(props.row)"
                  track-color="green-1"
                />
              </div>
            </q-td>
            <q-td key="status_packing" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status_packing)"
                class="status-chip"
              >
                {{ props.row.status_packing || 'MENUNGGU_PACKING' }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props" @click.stop>
              <q-btn
                flat
                round
                dense
                color="green-10"
                icon="edit_note"
                @click="openPackingDialog(props.row)"
              />
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory_2" size="28px" class="q-mr-sm" />
            Belum ada data packing produksi.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showPackingDialog" persistent>
      <q-card class="packing-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
            <div class="text-caption">Input quantity dan status packing produksi.</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="savePacking">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nomor_spk"
                  outlined
                  dense
                  label="Nomor SPK"
                  :rules="[(val) => !!val || 'Nomor SPK wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nama_produk"
                  outlined
                  dense
                  label="Nama Produk"
                  :rules="[(val) => !!val || 'Nama produk wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.qty_approved_qc"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Qty Approved QC"
                  :rules="[(val) => Number(val) >= 0 || 'Qty approved QC wajib valid']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.qty_packing"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Qty Packing"
                  :rules="[(val) => Number(val) >= 0 || 'Qty packing wajib valid']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.jenis_packing"
                  :options="packingTypeOptions"
                  outlined
                  dense
                  label="Jenis Packing"
                  :rules="[(val) => !!val || 'Jenis packing wajib dipilih']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.checker_packing"
                  outlined
                  dense
                  label="Checker Packing"
                  :rules="[(val) => !!val || 'Checker packing wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.tanggal_packing"
                  outlined
                  dense
                  type="date"
                  label="Tanggal Packing"
                  :rules="[(val) => !!val || 'Tanggal packing wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.status_packing"
                  :options="statusOptions"
                  outlined
                  dense
                  label="Status Packing"
                  :rules="[(val) => !!val || 'Status packing wajib dipilih']"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
            <q-btn
              unelevated
              rounded
              color="green-10"
              icon="save"
              label="Simpan Packing"
              no-caps
              type="submit"
              :loading="submitting"
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
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'packing_produksi_manufaktur'
const statusOptions = ['MENUNGGU_PACKING', 'PACKING_PROCESS', 'READY_DELIVERY']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]
const packingTypeOptions = ['Dus', 'Box', 'Pallet', 'Crate', 'Wrapping']

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const statusFilter = ref('all')
const showPackingDialog = ref(false)
const selectedRow = ref(null)
let unsubscribePacking = null

const defaultForm = () => ({
  nomor_spk: '',
  nama_produk: '',
  qty_approved_qc: null,
  qty_packing: null,
  jenis_packing: '',
  checker_packing: '',
  tanggal_packing: new Date().toISOString().slice(0, 10),
  status_packing: 'MENUNGGU_PACKING',
})

const form = ref(defaultForm())

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  {
    name: 'qty_approved_qc',
    align: 'right',
    label: 'Qty Approved QC',
    field: 'qty_approved_qc',
    sortable: true,
  },
  { name: 'qty_packing', align: 'right', label: 'Qty Packing', field: 'qty_packing', sortable: true },
  { name: 'jenis_packing', align: 'left', label: 'Jenis Packing', field: 'jenis_packing' },
  { name: 'checker_packing', align: 'left', label: 'Checker Packing', field: 'checker_packing' },
  { name: 'tanggal_packing', align: 'left', label: 'Tanggal Packing', field: 'tanggal_packing' },
  { name: 'progress', align: 'left', label: 'Progress Packing', field: 'progress' },
  { name: 'status_packing', align: 'center', label: 'Status Packing', field: 'status_packing' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const rowStatus = row.status_packing || 'MENUNGGU_PACKING'
    const matchesStatus = statusFilter.value === 'all' || rowStatus === statusFilter.value
    const matchesSearch =
      !keyword ||
      [row.nomor_spk, row.nama_produk, row.jenis_packing, row.checker_packing, rowStatus]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Pending Packing',
    value: rows.value.filter((row) => row.status_packing === 'MENUNGGU_PACKING').length,
    icon: 'pending_actions',
    color: 'blue-grey-6',
  },
  {
    title: 'Packing Process',
    value: rows.value.filter((row) => row.status_packing === 'PACKING_PROCESS').length,
    icon: 'inventory_2',
    color: 'orange-9',
  },
  {
    title: 'Ready Delivery',
    value: rows.value.filter((row) => row.status_packing === 'READY_DELIVERY').length,
    icon: 'local_shipping',
    color: 'green-10',
  },
])

const dialogTitle = computed(() =>
  selectedRow.value ? 'Update Packing Produksi' : 'Input Packing Produksi',
)

const packingProgress = (row) => {
  const approved = Number(row.qty_approved_qc || 0)
  if (!approved) return 0
  return Math.min(100, Math.round((Number(row.qty_packing || 0) / approved) * 100))
}

const progressColor = (row) => {
  const value = packingProgress(row)
  if (value >= 100) return 'green-10'
  if (value >= 60) return 'green-7'
  if (value >= 30) return 'orange-9'
  return 'blue-grey-6'
}

const statusColor = (status) => {
  const colors = {
    MENUNGGU_PACKING: 'blue-grey-6',
    PACKING_PROCESS: 'orange-9',
    READY_DELIVERY: 'green-10',
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

const openPackingDialog = (row = null) => {
  selectedRow.value = row
  form.value = row
    ? {
        nomor_spk: row.nomor_spk || '',
        nama_produk: row.nama_produk || '',
        qty_approved_qc: Number(row.qty_approved_qc || 0),
        qty_packing: Number(row.qty_packing || 0),
        jenis_packing: row.jenis_packing || '',
        checker_packing: row.checker_packing || '',
        tanggal_packing: row.tanggal_packing || new Date().toISOString().slice(0, 10),
        status_packing: row.status_packing || 'MENUNGGU_PACKING',
      }
    : defaultForm()
  showPackingDialog.value = true
}

const savePacking = async () => {
  submitting.value = true
  const payload = {
    ...form.value,
    qty_approved_qc: Number(form.value.qty_approved_qc || 0),
    qty_packing: Number(form.value.qty_packing || 0),
    updated_at: serverTimestamp(),
  }

  try {
    if (selectedRow.value?.id) {
      await updateDoc(doc(db, COLLECTION_NAME, selectedRow.value.id), payload)
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
      })
    }
    showPackingDialog.value = false
    $q.notify({ type: 'positive', message: 'Data packing produksi berhasil disimpan' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan packing produksi' })
  } finally {
    submitting.value = false
  }
}

const loadPackingRows = () => {
  loading.value = true
  if (unsubscribePacking) unsubscribePacking()

  const packingQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribePacking = onSnapshot(
    packingQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((packingDoc) => ({
        id: packingDoc.id,
        status_packing: 'MENUNGGU_PACKING',
        qty_approved_qc: 0,
        qty_packing: 0,
        ...packingDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat packing produksi' })
    },
  )
}

onMounted(loadPackingRows)

onUnmounted(() => {
  if (unsubscribePacking) unsubscribePacking()
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

.shadow-premium {
  box-shadow: 0 10px 30px rgba(27, 94, 32, 0.15);
}

.summary-card,
.filter-card,
.table-card,
.packing-dialog {
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

.packing-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.packing-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.packing-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.progress-cell {
  min-width: 160px;
}

.progress-label {
  color: #667085;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.progress-value {
  color: #1b5e20;
  font-size: 11px;
  font-weight: 900;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 122px;
  justify-content: center;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.packing-dialog {
  max-width: 95vw;
  width: 760px;
}
</style>
