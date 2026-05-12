<template>
  <q-page class="ready-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Ready Delivery
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Monitoring Barang Siap Kirim
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Pantau barang hasil packing yang siap dikirim, proses pickup, kendaraan, checker delivery,
          dan status pengiriman customer.
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
          @click="loadDeliveryRows"
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

    <q-card flat bordered class="filter-card bg-white q-mb-lg no-print">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari SPK, produk, customer, kendaraan, atau checker..."
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
              label="Filter Status Delivery"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} DELIVERY
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card bg-white no-print">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="ready-table"
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
          <q-tr :props="props" class="ready-row">
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk || '-' }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.customer || '-' }}</div>
            </q-td>
            <q-td key="customer" :props="props">{{ props.row.customer || '-' }}</q-td>
            <q-td key="qty_ready" :props="props" class="text-weight-bold text-positive">
              {{ formatNumber(props.row.qty_ready) }}
            </q-td>
            <q-td key="tanggal_ready" :props="props">
              {{ formatDateTime(props.row.tanggal_ready) }}
            </q-td>
            <q-td key="checker_delivery" :props="props">
              {{ props.row.checker_delivery || '-' }}
            </q-td>
            <q-td key="kendaraan" :props="props">{{ props.row.kendaraan || '-' }}</q-td>
            <q-td key="status_delivery" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status_delivery)"
                class="status-chip"
              >
                {{ props.row.status_delivery || 'READY_DELIVERY' }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props" @click.stop>
              <div class="row no-wrap justify-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  color="green-10"
                  icon="visibility"
                  @click="openDetail(props.row)"
                >
                  <q-tooltip>Detail</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="blue-grey-7"
                  icon="print"
                  @click="printSuratJalan(props.row)"
                >
                  <q-tooltip>Cetak Surat Jalan</q-tooltip>
                </q-btn>
                <q-btn
                  unelevated
                  rounded
                  dense
                  color="green-10"
                  icon="local_shipping"
                  label="Konfirmasi"
                  no-caps
                  class="confirm-btn"
                  :disable="props.row.status_delivery === 'DELIVERED'"
                  :loading="updatingId === props.row.id"
                  @click="confirmDelivery(props.row)"
                />
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="local_shipping" size="28px" class="q-mr-sm" />
            Belum ada data ready delivery.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDetailDialog">
      <q-card class="detail-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">Detail Ready Delivery</div>
            <div class="text-caption">{{ selectedRow?.nomor_spk || '-' }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedRow" class="q-pa-lg">
          <div class="detail-grid">
            <div v-for="item in detailItems" :key="item.label" class="detail-cell">
              <div class="detail-label">{{ item.label }}</div>
              <div class="detail-value">{{ item.value }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1 q-pa-md">
          <q-btn flat color="grey-7" label="Tutup" no-caps v-close-popup />
          <q-btn
            unelevated
            rounded
            color="green-10"
            icon="print"
            label="Cetak Surat Jalan"
            no-caps
            @click="printSuratJalan(selectedRow)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div v-if="printRow" class="surat-jalan-print">
      <div class="print-paper">
        <div class="print-header">
          <div>
            <div class="print-company">AGRA ERP MANUFAKTUR</div>
            <div class="print-subtitle">Surat Jalan Delivery</div>
          </div>
          <q-chip dense text-color="white" :color="statusColor(printRow.status_delivery)">
            {{ printRow.status_delivery || 'READY_DELIVERY' }}
          </q-chip>
        </div>
        <div class="print-title">SURAT JALAN</div>
        <div class="print-grid">
          <div>
            <span>Nomor SPK</span>
            <strong>{{ printRow.nomor_spk || '-' }}</strong>
          </div>
          <div>
            <span>Tanggal Ready</span>
            <strong>{{ formatDateTime(printRow.tanggal_ready) }}</strong>
          </div>
          <div>
            <span>Customer</span>
            <strong>{{ printRow.customer || '-' }}</strong>
          </div>
          <div>
            <span>Kendaraan</span>
            <strong>{{ printRow.kendaraan || '-' }}</strong>
          </div>
        </div>
        <table class="print-table">
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th>Qty Ready</th>
              <th>Checker Delivery</th>
              <th>Status Delivery</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ printRow.nama_produk || '-' }}</td>
              <td>{{ formatNumber(printRow.qty_ready) }}</td>
              <td>{{ printRow.checker_delivery || '-' }}</td>
              <td>{{ printRow.status_delivery || 'READY_DELIVERY' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'ready_delivery_manufaktur'
const statusOptions = ['READY_DELIVERY', 'WAITING_PICKUP', 'DELIVERED']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('all')
const showDetailDialog = ref(false)
const selectedRow = ref(null)
const printRow = ref(null)
const updatingId = ref(null)
let unsubscribeDelivery = null

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer', sortable: true },
  { name: 'qty_ready', align: 'right', label: 'Qty Ready', field: 'qty_ready', sortable: true },
  { name: 'tanggal_ready', align: 'left', label: 'Tanggal Ready', field: 'tanggal_ready', sortable: true },
  { name: 'checker_delivery', align: 'left', label: 'Checker Delivery', field: 'checker_delivery' },
  { name: 'kendaraan', align: 'left', label: 'Kendaraan', field: 'kendaraan' },
  { name: 'status_delivery', align: 'center', label: 'Status Delivery', field: 'status_delivery' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const rowStatus = row.status_delivery || 'READY_DELIVERY'
    const matchesStatus = statusFilter.value === 'all' || rowStatus === statusFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_spk,
        row.nama_produk,
        row.customer,
        row.checker_delivery,
        row.kendaraan,
        rowStatus,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Ready Kirim',
    value: rows.value.filter((row) => row.status_delivery === 'READY_DELIVERY').length,
    icon: 'local_shipping',
    color: 'green-10',
  },
  {
    title: 'Waiting Pickup',
    value: rows.value.filter((row) => row.status_delivery === 'WAITING_PICKUP').length,
    icon: 'pending_actions',
    color: 'orange-9',
  },
  {
    title: 'Delivered',
    value: rows.value.filter((row) => row.status_delivery === 'DELIVERED').length,
    icon: 'verified',
    color: 'positive',
  },
])

const detailItems = computed(() => [
  { label: 'Nomor SPK', value: selectedRow.value?.nomor_spk || '-' },
  { label: 'Nama Produk', value: selectedRow.value?.nama_produk || '-' },
  { label: 'Customer', value: selectedRow.value?.customer || '-' },
  { label: 'Qty Ready', value: formatNumber(selectedRow.value?.qty_ready) },
  { label: 'Tanggal Ready', value: formatDateTime(selectedRow.value?.tanggal_ready) },
  { label: 'Checker Delivery', value: selectedRow.value?.checker_delivery || '-' },
  { label: 'Kendaraan', value: selectedRow.value?.kendaraan || '-' },
  { label: 'Status Delivery', value: selectedRow.value?.status_delivery || 'READY_DELIVERY' },
])

const statusColor = (status) => {
  const colors = {
    READY_DELIVERY: 'green-10',
    WAITING_PICKUP: 'orange-9',
    DELIVERED: 'positive',
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

const openDetail = (row) => {
  selectedRow.value = row
  showDetailDialog.value = true
}

const printSuratJalan = async (row) => {
  if (!row) return
  printRow.value = row
  await nextTick()
  window.print()
}

const confirmDelivery = (row) => {
  if (!row?.id) return
  $q.dialog({
    title: 'Konfirmasi Delivery',
    message: `Konfirmasi ${row.nomor_spk || 'SPK'} sudah delivered?`,
    cancel: true,
    ok: {
      color: 'green-10',
      unelevated: true,
      label: 'Konfirmasi',
    },
  }).onOk(async () => {
    updatingId.value = row.id
    try {
      await updateDoc(doc(db, COLLECTION_NAME, row.id), {
        status_delivery: 'DELIVERED',
        delivered_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'Delivery berhasil dikonfirmasi' })
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal konfirmasi delivery' })
    } finally {
      updatingId.value = null
    }
  })
}

const loadDeliveryRows = () => {
  loading.value = true
  if (unsubscribeDelivery) unsubscribeDelivery()

  const deliveryQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeDelivery = onSnapshot(
    deliveryQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((deliveryDoc) => ({
        id: deliveryDoc.id,
        status_delivery: 'READY_DELIVERY',
        qty_ready: 0,
        ...deliveryDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat ready delivery' })
    },
  )
}

onMounted(loadDeliveryRows)

onUnmounted(() => {
  if (unsubscribeDelivery) unsubscribeDelivery()
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
.detail-dialog {
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

.ready-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.ready-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.ready-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 112px;
  justify-content: center;
}

.confirm-btn {
  min-width: 106px;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.detail-dialog {
  max-width: 95vw;
  width: 720px;
}

.detail-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-cell {
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 12px;
  padding: 12px 14px;
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

.surat-jalan-print {
  display: none;
}

.print-paper {
  background: #ffffff;
  color: #1f2a24;
  min-height: 100vh;
  padding: 28px;
}

.print-header {
  align-items: center;
  border-bottom: 3px solid #1b5e20;
  display: flex;
  justify-content: space-between;
  padding-bottom: 16px;
}

.print-company {
  color: #1b5e20;
  font-size: 20px;
  font-weight: 900;
}

.print-subtitle {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.print-title {
  color: #1b5e20;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 1px;
  margin: 24px 0;
  text-align: center;
}

.print-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 22px;
}

.print-grid div {
  border: 1px solid #dfe8df;
  border-radius: 8px;
  padding: 10px 12px;
}

.print-grid span {
  color: #667085;
  display: block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.print-grid strong {
  color: #1f2a24;
  display: block;
  font-size: 13px;
  margin-top: 4px;
}

.print-table {
  border-collapse: collapse;
  width: 100%;
}

.print-table th {
  background: #1b5e20;
  color: #ffffff;
  font-size: 11px;
  padding: 10px;
  text-align: left;
  text-transform: uppercase;
}

.print-table td {
  border: 1px solid #dfe8df;
  font-size: 12px;
  padding: 10px;
}

@media (max-width: 599px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media print {
  .no-print,
  .summary-card,
  .filter-card,
  .table-card,
  .q-dialog,
  .q-dialog__backdrop {
    display: none !important;
  }

  .surat-jalan-print {
    display: block !important;
  }

  .ready-page {
    background: #ffffff !important;
    padding: 0 !important;
  }
}
</style>
