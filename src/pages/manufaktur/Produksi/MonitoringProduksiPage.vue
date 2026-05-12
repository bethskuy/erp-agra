<template>
  <q-page class="monitoring-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Monitoring Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Realtime End-to-End Production Flow
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Dashboard terpadu untuk memantau Planning Produksi, Line Produksi, QC Produksi, Packing
          Produksi, dan Ready Delivery dalam satu halaman.
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
          @click="loadMonitoring"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg">
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

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-lg-7">
        <q-card flat bordered class="dashboard-card bg-white full-height">
          <q-card-section class="card-header">
            <div>
              <div class="text-overline text-green-10 text-weight-black">Progress Produksi</div>
              <div class="text-caption text-grey-7">Akumulasi progres seluruh SPK aktif.</div>
            </div>
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold">
              {{ averageProgress }}%
            </q-chip>
          </q-card-section>
          <q-card-section>
            <q-linear-progress
              rounded
              size="14px"
              :value="averageProgress / 100"
              :color="averageProgress >= 100 ? 'green-10' : 'orange-9'"
              track-color="green-1"
              class="q-mb-lg"
            />

            <div class="flow-grid">
              <div v-for="stage in flowStages" :key="stage.title" class="flow-stage">
                <q-avatar :icon="stage.icon" color="green-1" text-color="green-10" size="38px" />
                <div class="flow-stage__title">{{ stage.title }}</div>
                <div class="flow-stage__value">{{ stage.value }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat bordered class="dashboard-card bg-white full-height">
          <q-card-section class="card-header">
            <div>
              <div class="text-overline text-green-10 text-weight-black">Timeline Produksi</div>
              <div class="text-caption text-grey-7">Status terbaru dari flow produksi.</div>
            </div>
          </q-card-section>
          <q-card-section class="timeline-panel">
            <q-timeline color="green-10" layout="dense">
              <q-timeline-entry
                v-for="item in timelineItems"
                :key="`${item.nomor_spk}-${item.status}`"
                :title="item.title"
                :subtitle="item.subtitle"
                :icon="item.icon"
                :color="item.color"
              >
                <div class="text-caption text-grey-7">{{ item.caption }}</div>
              </q-timeline-entry>
            </q-timeline>
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
              placeholder="Cari SPK, produk, customer, line, atau status..."
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
              label="Filter Status"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} SPK
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card bg-white">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="nomor_spk"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="monitoring-table"
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
          <q-tr :props="props" class="monitoring-row">
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk }}</div>
              <div class="text-caption text-grey-6">{{ props.row.customer || '-' }}</div>
            </q-td>
            <q-td key="line_produksi" :props="props">{{ props.row.line_produksi || '-' }}</q-td>
            <q-td key="qty_target" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_target) }}
            </q-td>
            <q-td key="qty_selesai" :props="props" class="text-weight-bold text-positive">
              {{ formatNumber(props.row.qty_selesai) }}
            </q-td>
            <q-td key="qty_reject" :props="props" class="text-weight-bold text-negative">
              {{ formatNumber(props.row.qty_reject) }}
            </q-td>
            <q-td key="progress" :props="props">
              <div class="progress-cell">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="progress-label">Progress</span>
                  <span class="progress-value">{{ props.row.progress }}%</span>
                </div>
                <q-linear-progress
                  rounded
                  size="9px"
                  :value="props.row.progress / 100"
                  :color="progressColor(props.row.progress)"
                  track-color="green-1"
                />
              </div>
            </q-td>
            <q-td key="stage" :props="props">
              <div class="stage-mini">
                <q-icon
                  v-for="stage in props.row.stages"
                  :key="stage.key"
                  :name="stage.icon"
                  :color="stage.done ? 'green-10' : 'grey-5'"
                  size="18px"
                >
                  <q-tooltip>{{ stage.label }}</q-tooltip>
                </q-icon>
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
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="monitoring" size="28px" class="q-mr-sm" />
            Belum ada data monitoring produksi.
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTIONS = {
  planning: 'planning_produksi_manufaktur',
  line: 'line_produksi_manufaktur',
  qc: 'qc_produksi_manufaktur',
  packing: 'packing_produksi_manufaktur',
  delivery: 'ready_delivery_manufaktur',
}

const statusOptions = ['Waiting', 'On Progress', 'QC', 'Packing', 'Ready Delivery', 'Delivered']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const $q = useQuasar()
const loading = ref(false)
const search = ref('')
const statusFilter = ref('all')
const planningRows = ref([])
const lineRows = ref([])
const qcRows = ref([])
const packingRows = ref([])
const deliveryRows = ref([])
let unsubscribers = []

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'line_produksi', align: 'left', label: 'Line Produksi', field: 'line_produksi', sortable: true },
  { name: 'qty_target', align: 'right', label: 'Qty Target', field: 'qty_target', sortable: true },
  { name: 'qty_selesai', align: 'right', label: 'Qty Selesai', field: 'qty_selesai', sortable: true },
  { name: 'qty_reject', align: 'right', label: 'Reject QC', field: 'qty_reject', sortable: true },
  { name: 'progress', align: 'left', label: 'Progress Produksi', field: 'progress', sortable: true },
  { name: 'stage', align: 'center', label: 'Flow' },
  { name: 'status', align: 'center', label: 'Status Realtime', field: 'status', sortable: true },
]

const monitoringRows = computed(() => {
  const map = new Map()
  const ensureRow = (source) => {
    const key = source.nomor_spk || source.id
    if (!key) return null
    if (!map.has(key)) {
      map.set(key, {
        nomor_spk: key,
        nama_produk: source.nama_produk || '-',
        customer: source.customer || '',
        line_produksi: source.line_produksi || '',
        qty_target: Number(source.qty_target || 0),
        qty_selesai: Number(source.qty_selesai || source.qty_packing || source.qty_ready || 0),
        qty_reject: Number(source.qty_reject || source.reject_qty || 0),
        planning: null,
        line: null,
        qc: null,
        packing: null,
        delivery: null,
      })
    }
    const row = map.get(key)
    row.nama_produk = row.nama_produk !== '-' ? row.nama_produk : source.nama_produk || '-'
    row.customer = row.customer || source.customer || ''
    row.line_produksi = row.line_produksi || source.line_produksi || ''
    row.qty_target = row.qty_target || Number(source.qty_target || source.qty_approved_qc || 0)
    row.qty_selesai =
      row.qty_selesai || Number(source.qty_selesai || source.qty_packing || source.qty_ready || 0)
    row.qty_reject = row.qty_reject || Number(source.qty_reject || source.reject_qty || 0)
    return row
  }

  planningRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.planning = item
  })
  lineRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.line = item
  })
  qcRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.qc = item
  })
  packingRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.packing = item
  })
  deliveryRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.delivery = item
  })

  return Array.from(map.values()).map((row) => {
    const status = realtimeStatus(row)
    const progress = productionProgress(row)
    return {
      ...row,
      status,
      progress,
      stages: buildStages(row),
    }
  })
})

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return monitoringRows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    const matchesSearch =
      !keyword ||
      [row.nomor_spk, row.nama_produk, row.customer, row.line_produksi, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Produksi Aktif',
    value: monitoringRows.value.filter((row) => ['Waiting', 'On Progress', 'QC'].includes(row.status)).length,
    icon: 'precision_manufacturing',
    color: 'green-10',
  },
  {
    title: 'QC Pending',
    value: qcRows.value.filter((row) => ['MENUNGGU_QC', 'QC_PROCESS'].includes(row.status_qc)).length,
    icon: 'pending_actions',
    color: 'orange-9',
  },
  {
    title: 'Reject QC',
    value: formatNumber(qcRows.value.reduce((sum, row) => sum + Number(row.qty_reject || 0), 0)),
    icon: 'report_problem',
    color: 'negative',
  },
  {
    title: 'Packing Process',
    value: packingRows.value.filter((row) => row.status_packing === 'PACKING_PROCESS').length,
    icon: 'inventory_2',
    color: 'blue-grey-7',
  },
  {
    title: 'Ready Delivery',
    value: deliveryRows.value.filter((row) => row.status_delivery === 'READY_DELIVERY').length,
    icon: 'local_shipping',
    color: 'positive',
  },
])

const flowStages = computed(() => [
  { title: 'Planning Produksi', value: planningRows.value.length, icon: 'assignment' },
  { title: 'Line Produksi', value: lineRows.value.length, icon: 'precision_manufacturing' },
  { title: 'QC Produksi', value: qcRows.value.length, icon: 'fact_check' },
  { title: 'Packing Produksi', value: packingRows.value.length, icon: 'inventory_2' },
  { title: 'Ready Delivery', value: deliveryRows.value.length, icon: 'local_shipping' },
])

const averageProgress = computed(() => {
  if (!monitoringRows.value.length) return 0
  const total = monitoringRows.value.reduce((sum, row) => sum + row.progress, 0)
  return Math.round(total / monitoringRows.value.length)
})

const timelineItems = computed(() =>
  monitoringRows.value.slice(0, 6).map((row) => ({
    nomor_spk: row.nomor_spk,
    title: `${row.nomor_spk} - ${row.status}`,
    subtitle: row.nama_produk || '-',
    caption: `${row.line_produksi || 'Line belum ditentukan'} | Progress ${row.progress}%`,
    icon: statusIcon(row.status),
    color: statusColor(row.status),
  })),
)

const realtimeStatus = (row) => {
  if (row.delivery?.status_delivery === 'DELIVERED') return 'Delivered'
  if (row.delivery?.status_delivery === 'READY_DELIVERY') return 'Ready Delivery'
  if (row.delivery?.status_delivery === 'WAITING_PICKUP') return 'Ready Delivery'
  if (row.packing?.status_packing === 'READY_DELIVERY') return 'Ready Delivery'
  if (row.packing?.status_packing === 'PACKING_PROCESS') return 'Packing'
  if (row.qc?.status_qc === 'QC_APPROVED') return 'Packing'
  if (row.qc?.status_qc === 'QC_PROCESS' || row.qc?.status_qc === 'MENUNGGU_QC') return 'QC'
  if (row.line?.status === 'On Progress' || row.planning?.status === 'On Progress') return 'On Progress'
  return 'Waiting'
}

const productionProgress = (row) => {
  if (row.status === 'Delivered') return 100
  if (row.status === 'Ready Delivery') return 90
  if (row.status === 'Packing') return 75
  if (row.status === 'QC') return 60
  const target = Number(row.qty_target || 0)
  if (target) return Math.min(55, Math.round((Number(row.qty_selesai || 0) / target) * 55))
  if (row.status === 'On Progress') return 35
  return row.planning ? 15 : 0
}

const buildStages = (row) => [
  { key: 'planning', label: 'Planning Produksi', icon: 'assignment', done: !!row.planning },
  { key: 'line', label: 'Line Produksi', icon: 'precision_manufacturing', done: !!row.line },
  { key: 'qc', label: 'QC Produksi', icon: 'fact_check', done: !!row.qc },
  { key: 'packing', label: 'Packing Produksi', icon: 'inventory_2', done: !!row.packing },
  { key: 'delivery', label: 'Ready Delivery', icon: 'local_shipping', done: !!row.delivery },
]

const statusColor = (status) => {
  const colors = {
    Waiting: 'blue-grey-6',
    'On Progress': 'orange-9',
    QC: 'deep-purple-6',
    Packing: 'blue-grey-7',
    'Ready Delivery': 'green-10',
    Delivered: 'positive',
  }
  return colors[status] || 'grey-6'
}

const statusIcon = (status) => {
  const icons = {
    Waiting: 'hourglass_empty',
    'On Progress': 'precision_manufacturing',
    QC: 'fact_check',
    Packing: 'inventory_2',
    'Ready Delivery': 'local_shipping',
    Delivered: 'verified',
  }
  return icons[status] || 'monitoring'
}

const progressColor = (value) => {
  if (value >= 90) return 'green-10'
  if (value >= 60) return 'green-7'
  if (value >= 30) return 'orange-9'
  return 'blue-grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const subscribeCollection = (collectionName, targetRef) => {
  const collectionQuery = query(collection(db, collectionName), orderBy('updated_at', 'desc'))
  return onSnapshot(
    collectionQuery,
    (snapshot) => {
      targetRef.value = snapshot.docs.map((itemDoc) => ({
        id: itemDoc.id,
        ...itemDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: `Gagal memuat ${collectionName}` })
    },
  )
}

const loadMonitoring = () => {
  loading.value = true
  unsubscribers.forEach((unsubscribe) => unsubscribe())
  unsubscribers = [
    subscribeCollection(COLLECTIONS.planning, planningRows),
    subscribeCollection(COLLECTIONS.line, lineRows),
    subscribeCollection(COLLECTIONS.qc, qcRows),
    subscribeCollection(COLLECTIONS.packing, packingRows),
    subscribeCollection(COLLECTIONS.delivery, deliveryRows),
  ]
}

onMounted(loadMonitoring)

onUnmounted(() => {
  unsubscribers.forEach((unsubscribe) => unsubscribe())
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
.dashboard-card,
.filter-card,
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.summary-label {
  color: #667085;
  font-size: 11px;
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

.card-header {
  align-items: center;
  border-bottom: 1px solid #edf1f0;
  display: flex;
  justify-content: space-between;
  padding: 14px 18px;
}

.flow-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.flow-stage {
  align-items: center;
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  min-height: 112px;
  padding: 14px 10px;
  text-align: center;
}

.flow-stage__title {
  color: #1f2a24;
  font-size: 11px;
  font-weight: 900;
  line-height: 1.2;
  margin-top: 9px;
}

.flow-stage__value {
  color: #1b5e20;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  margin-top: 8px;
}

.timeline-panel {
  max-height: 284px;
  overflow-y: auto;
}

.monitoring-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.monitoring-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.monitoring-row:hover {
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

.stage-mini {
  display: inline-flex;
  gap: 7px;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 104px;
  justify-content: center;
}

@media (max-width: 1023px) {
  .flow-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .flow-grid {
    grid-template-columns: 1fr;
  }
}
</style>
