<template>
  <q-page class="line-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Proses Fabrikasi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Monitoring Alur Proses Fabrikasi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Pantau SPK aktif, operator, quantity selesai, reject, progress, dan status setiap proses
          fabrikasi secara realtime.
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
          @click="loadLines"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="46px" />
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
          <div class="col-12 col-md-5">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari SPK, produk, line, atau operator..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="lineFilter"
              :options="lineFilterOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Filter Line"
              bg-color="white"
            />
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
              label="Filter Status"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} LINE
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
        class="line-table"
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
          <q-tr :props="props" class="line-row">
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk || '-' }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.line_produksi || '-' }}</div>
            </q-td>
            <q-td key="line_produksi" :props="props">{{ props.row.line_produksi || '-' }}</q-td>
            <q-td key="operator" :props="props">{{ props.row.operator || '-' }}</q-td>
            <q-td key="qty_target" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_target) }}
            </q-td>
            <q-td key="qty_selesai" :props="props" class="text-weight-bold text-positive">
              {{ formatNumber(props.row.qty_selesai) }}
            </q-td>
            <q-td key="reject_qty" :props="props" class="text-weight-bold text-negative">
              {{ formatNumber(props.row.reject_qty) }}
            </q-td>
            <q-td key="progress" :props="props">
              <div class="progress-cell">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="progress-label">Progress</span>
                  <span class="progress-value">{{ progressPercent(props.row) }}%</span>
                </div>
                <q-linear-progress
                  rounded
                  size="9px"
                  :value="progressPercent(props.row) / 100"
                  :color="progressColor(props.row)"
                  track-color="green-1"
                />
              </div>
            </q-td>
            <q-td key="status" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status)"
                class="status-chip"
              >
                {{ props.row.status || 'Waiting' }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props">
              <q-select
                :model-value="props.row.status || 'Waiting'"
                :options="statusOptions"
                dense
                outlined
                emit-value
                map-options
                options-dense
                bg-color="white"
                class="status-select"
                :loading="updatingId === props.row.id"
                @update:model-value="updateLineStatus(props.row, $event)"
              />
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="precision_manufacturing" size="28px" class="q-mr-sm" />
            Belum ada data line produksi.
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'line_produksi_manufaktur'
const statusOptions = ['Waiting', 'On Progress', 'Pending', 'Finished']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]
const defaultLineOptions = ['Line A', 'Line B', 'Line C', 'Line D']

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const search = ref('')
const lineFilter = ref('all')
const statusFilter = ref('all')
const updatingId = ref(null)
let unsubscribeLines = null

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'line_produksi', align: 'left', label: 'Line Produksi', field: 'line_produksi', sortable: true },
  { name: 'operator', align: 'left', label: 'Operator', field: 'operator', sortable: true },
  { name: 'qty_target', align: 'right', label: 'Qty Target', field: 'qty_target', sortable: true },
  { name: 'qty_selesai', align: 'right', label: 'Qty Selesai', field: 'qty_selesai', sortable: true },
  { name: 'reject_qty', align: 'right', label: 'Reject Qty', field: 'reject_qty', sortable: true },
  { name: 'progress', align: 'left', label: 'Progress %', field: 'progress' },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
  { name: 'aksi', align: 'left', label: 'Update Status' },
]

const lineFilterOptions = computed(() => {
  const lines = new Set(defaultLineOptions)
  rows.value.forEach((row) => {
    if (row.line_produksi) lines.add(row.line_produksi)
  })
  return [
    { label: 'Semua Line', value: 'all' },
    ...Array.from(lines).map((line) => ({ label: line, value: line })),
  ]
})

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesLine = lineFilter.value === 'all' || row.line_produksi === lineFilter.value
    const rowStatus = row.status || 'Waiting'
    const matchesStatus = statusFilter.value === 'all' || rowStatus === statusFilter.value
    const matchesSearch =
      !keyword ||
      [row.nomor_spk, row.nama_produk, row.line_produksi, row.operator, rowStatus]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesLine && matchesStatus && matchesSearch
  })
})

const activeLines = computed(
  () => new Set(rows.value.filter((row) => row.status === 'On Progress').map((row) => row.line_produksi)).size,
)

const totalProduction = computed(() =>
  rows.value.reduce((total, row) => total + Number(row.qty_selesai || 0), 0),
)

const totalReject = computed(() =>
  rows.value.reduce((total, row) => total + Number(row.reject_qty || 0), 0),
)

const finishedRows = computed(() => rows.value.filter((row) => row.status === 'Finished').length)

const summaryCards = computed(() => [
  {
    title: 'Proses Aktif',
    value: activeLines.value,
    icon: 'precision_manufacturing',
    color: 'green-10',
  },
  {
    title: 'Total Produksi',
    value: formatNumber(totalProduction.value),
    icon: 'inventory_2',
    color: 'blue-grey-7',
  },
  {
    title: 'Reject',
    value: formatNumber(totalReject.value),
    icon: 'report_problem',
    color: 'negative',
  },
  {
    title: 'Selesai',
    value: finishedRows.value,
    icon: 'fact_check',
    color: 'positive',
  },
])

const progressPercent = (row) => {
  const target = Number(row.qty_target || 0)
  if (!target) return 0
  return Math.min(100, Math.round((Number(row.qty_selesai || 0) / target) * 100))
}

const progressColor = (row) => {
  const value = progressPercent(row)
  if (value >= 100) return 'green-10'
  if (value >= 60) return 'green-7'
  if (value >= 30) return 'orange-9'
  return 'blue-grey-6'
}

const statusColor = (status) => {
  const colors = {
    Waiting: 'blue-grey-6',
    'On Progress': 'orange-9',
    Pending: 'deep-orange-7',
    Finished: 'green-10',
  }
  return colors[status] || 'grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const updateLineStatus = async (row, status) => {
  if (!row.id || row.status === status) return
  updatingId.value = row.id
  try {
    await updateDoc(doc(db, COLLECTION_NAME, row.id), {
      status,
      updated_at: serverTimestamp(),
      finished_at: status === 'Finished' ? serverTimestamp() : row.finished_at || null,
    })
    $q.notify({ type: 'positive', message: `Status line diperbarui: ${status}` })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal update status line produksi' })
  } finally {
    updatingId.value = null
  }
}

const loadLines = () => {
  loading.value = true
  if (unsubscribeLines) unsubscribeLines()

  const lineQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeLines = onSnapshot(
    lineQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((lineDoc) => ({
        id: lineDoc.id,
        status: 'Waiting',
        qty_target: 0,
        qty_selesai: 0,
        reject_qty: 0,
        ...lineDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat line produksi' })
    },
  )
}

onMounted(loadLines)

onUnmounted(() => {
  if (unsubscribeLines) unsubscribeLines()
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
.table-card {
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
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
  margin-top: 5px;
}

.line-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.line-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.line-row:hover {
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
  min-width: 92px;
  justify-content: center;
}

.status-select {
  min-width: 132px;
}
</style>
