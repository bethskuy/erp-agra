<template>
  <q-page class="ppic-page bg-grey-2 q-pa-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bolder text-green-10">Stock Forecast</div>
        <div class="text-subtitle1 text-grey-7">
          PPIC / Stock Forecast - proyeksi kebutuhan stok gudang berdasarkan data forecast yang
          tersedia.
        </div>
      </div>
      <div class="row q-gutter-sm q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="analytics"
          label="Lihat Analisis Forecast"
          no-caps
          class="text-weight-bold"
          @click="showAnalyticsDialog = true"
        />
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

    <q-card flat bordered class="filter-card bg-white q-mb-md">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-5">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari kode, nama material, ukuran, atau satuan..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="typeFilter"
              :options="typeOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Tipe Material"
              bg-color="white"
            />
          </div>
          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ rows.length }} MATERIAL
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card bg-white">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="text-subtitle1 text-weight-bold text-green-10">Daftar Forecast Stok</div>
          <div class="text-caption text-grey-7">
            {{ criticalRows.length }} material kritis siap diproses ke Material Requirement.
          </div>
        </div>
        <q-btn
          unelevated
          rounded
          color="indigo-7"
          icon="shopping_cart"
          label="Proses Semua Barang Kritis"
          no-caps
          class="text-weight-bold"
          :disable="!criticalRows.length"
          :loading="bulkSubmitting"
          @click="processAllCriticalRows"
        />
      </q-card-section>
      <q-separator />
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #body-cell-nama_barang="props">
          <q-td :props="props">
            <div class="text-weight-bold text-green-10">{{ props.row.nama_barang || '-' }}</div>
            <div class="text-caption text-grey-6">{{ props.row.kode_barang || '-' }}</div>
            <q-badge v-if="isLowStock(props.row)" color="negative" class="q-mt-xs">
              {{ props.row.status_stok }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-stok_tersedia="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              dense
              no-caps
              class="stock-link text-weight-bold"
              :class="isLowStock(props.row) ? 'text-negative' : 'text-green-10'"
              @click="openMutationHistory(props.row)"
            >
              {{ formatNumber(props.row.stok_tersedia) }}
            </q-btn>
          </q-td>
        </template>

        <template #body-cell-kebutuhan="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{ formatNumber(props.row.kebutuhan) }}
          </q-td>
        </template>

        <template #body-cell-status_stok="props">
          <q-td :props="props">
            <q-badge
              :color="statusColor(props.row.status_stok)"
              class="text-weight-bold q-px-sm q-py-xs"
            >
              {{ props.row.status_stok }}
            </q-badge>
            <div
              v-if="isLowStock(props.row)"
              class="text-caption text-negative text-weight-bold q-mt-xs"
            >
              Perlu perhatian PPIC
            </div>
          </q-td>
        </template>

        <template #body-cell-aksi="props">
          <q-td :props="props" @click.stop>
            <q-btn
              v-if="props.row.status_stok === 'Kritis'"
              unelevated
              dense
              no-caps
              color="orange-9"
              icon="shopping_cart"
              label="Mintakan Stok"
              class="text-weight-bold"
              @click="openRequestDialog(props.row)"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="query_stats" size="28px" class="q-mr-sm" />
            Belum ada data stock forecast.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showMutationDialog" @hide="closeMutationHistory">
      <q-card class="mutation-dialog">
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6 text-weight-bold text-green-10">Mutation History</div>
            <div class="text-caption text-grey-7">
              {{ selectedMaterial?.nama_barang || '-' }} -
              {{ selectedMaterial?.kode_barang || '-' }}
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-none">
          <q-table
            :rows="mutationRows"
            :columns="mutationColumns"
            row-key="id"
            flat
            dense
            :loading="loadingMutations"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #body-cell-tanggal="props">
              <q-td :props="props">{{ formatDateTime(props.row.tanggal) }}</q-td>
            </template>
            <template #body-cell-incoming="props">
              <q-td :props="props" class="text-right text-positive text-weight-bold">
                {{ formatNumber(props.row.incoming) }}
              </q-td>
            </template>
            <template #body-cell-outgoing="props">
              <q-td :props="props" class="text-right text-negative text-weight-bold">
                {{ formatNumber(props.row.outgoing) }}
              </q-td>
            </template>
            <template #body-cell-qty="props">
              <q-td :props="props" class="text-right text-weight-bold">
                {{ formatNumber(props.row.qty) }}
              </q-td>
            </template>
            <template #no-data>
              <div class="full-width row flex-center text-grey-7 q-pa-lg">
                Belum ada mutation history.
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showRequestDialog" maximized persistent>
      <q-card class="request-dialog column no-wrap">
        <q-toolbar class="bg-white text-green-10 shadow-2">
          <q-btn flat round dense icon="close" color="grey-7" @click="closeRequestDialog" />
          <q-toolbar-title class="text-weight-bold">Mintakan Stok Material</q-toolbar-title>
          <q-btn
            unelevated
            color="green-10"
            icon="send"
            label="Kirim ke Material Requirement"
            no-caps
            class="text-weight-bold gt-xs"
            :loading="requestSubmitting"
            @click="submitMaterialRequirement"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-lg-lg">
          <div class="request-shell">
            <q-card flat bordered class="request-summary bg-white q-mb-md">
              <q-card-section>
                <div class="text-h6 text-weight-bold text-green-10 q-mb-sm">
                  {{ selectedRequestRow?.nama_barang || '-' }}
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Kode Barang</div>
                    <div class="detail-value">{{ selectedRequestRow?.kode_barang || '-' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Nama Material</div>
                    <div class="detail-value">{{ selectedRequestRow?.nama_barang || '-' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Stok Tersedia</div>
                    <div class="detail-value">
                      {{ formatNumber(selectedRequestRow?.stok_tersedia) }}
                      {{ selectedRequestRow?.satuan || '' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Stok Minimal</div>
                    <div class="detail-value">
                      {{ formatNumber(selectedRequestRow?.stok_minimal) }}
                      {{ selectedRequestRow?.satuan || '' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Kebutuhan</div>
                    <div class="detail-value">
                      {{ formatNumber(selectedRequestRow?.kebutuhan) }}
                      {{ selectedRequestRow?.satuan || '' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Kekurangan Stok</div>
                    <div class="detail-value text-negative">
                      {{ formatNumber(selectedRequestShortage) }}
                      {{ selectedRequestRow?.satuan || '' }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="request-form-card bg-white">
              <q-form @submit.prevent="submitMaterialRequirement">
                <q-card-section>
                  <q-input
                    v-model.number="requestForm.jumlah_diminta"
                    type="number"
                    outlined
                    bg-color="white"
                    label="Jumlah Diminta"
                    :suffix="selectedRequestRow?.satuan || ''"
                    :rules="[(val) => Number(val || 0) > 0 || 'Jumlah diminta wajib lebih dari 0']"
                  />
                </q-card-section>
                <q-separator />
                <q-card-actions align="right" class="q-pa-md">
                  <q-btn flat color="grey-8" label="Batal" no-caps @click="closeRequestDialog" />
                  <q-btn
                    unelevated
                    color="green-10"
                    icon="send"
                    label="Kirim ke Material Requirement"
                    no-caps
                    type="submit"
                    class="text-weight-bold"
                    :loading="requestSubmitting"
                  />
                </q-card-actions>
              </q-form>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAnalyticsDialog" maximized>
      <q-card class="analytics-dialog column no-wrap">
        <q-toolbar class="analytics-toolbar text-white shadow-2">
          <q-btn flat round dense icon="close" @click="showAnalyticsDialog = false" />
          <q-toolbar-title class="text-weight-bold">Analisis Stock Forecast</q-toolbar-title>
          <q-chip dense color="white" text-color="green-10" class="text-weight-bold">
            {{ analyticsMaterialRows.length }} material
          </q-chip>
        </q-toolbar>

        <q-card-section class="col scroll analytics-scroll q-pa-md q-pa-lg-lg">
          <div class="analytics-shell">
            <div class="row q-col-gutter-md q-mb-md">
              <div
                v-for="card in analyticsSummaryCards"
                :key="card.label"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card flat bordered class="analytics-summary-card">
                  <q-card-section class="row items-center no-wrap">
                    <q-avatar :color="card.color" text-color="white" :icon="card.icon" />
                    <div class="q-ml-md">
                      <div class="text-caption text-grey-7">{{ card.label }}</div>
                      <div class="text-h6 text-weight-bolder text-green-10">
                        {{ card.value }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-lg-8">
                <q-card flat bordered class="analytics-chart-card">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-green-10">
                      Stok vs Kebutuhan
                    </div>
                    <div class="text-caption text-grey-7">
                      Material Kritis dan Material Kurang
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <VueApexCharts
                      type="bar"
                      height="360"
                      :options="barChartOptions"
                      :series="barChartSeries"
                    />
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-lg-4">
                <q-card flat bordered class="analytics-chart-card">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-green-10">
                      Status Material
                    </div>
                    <div class="text-caption text-grey-7">Aman, Warning, Kritis</div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <VueApexCharts
                      type="pie"
                      height="330"
                      :options="pieChartOptions"
                      :series="pieChartSeries"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <q-card flat bordered class="analytics-critical-card q-mt-md">
              <q-card-section>
                <div class="row items-center justify-between q-gutter-sm">
                  <div>
                    <div class="text-subtitle1 text-weight-bold text-green-10">
                      Ringkasan Material Kritis
                    </div>
                    <div class="text-caption text-grey-7">
                      Diurutkan berdasarkan defisit terbesar
                    </div>
                  </div>
                  <q-badge color="negative" class="q-px-sm q-py-xs text-weight-bold">
                    {{ criticalAnalyticsRows.length }} item
                  </q-badge>
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-none">
                <q-list separator>
                  <q-item v-for="item in criticalAnalyticsRows" :key="item.key">
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-green-10">
                        {{ item.nama_material }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ item.kode_material || '-' }} • {{ item.status_label }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side class="text-right">
                      <q-item-label class="text-weight-bold text-negative">
                        {{ formatNumber(item.shortage) }}
                      </q-item-label>
                      <q-item-label caption>shortage</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="!criticalAnalyticsRows.length">
                    <q-item-section class="text-grey-7">
                      Tidak ada material kritis untuk dianalisis.
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import VueApexCharts from 'vue3-apexcharts'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from 'src/boot/firebase'

const COLLECTION_NAME = 'manufactur_master_barang'
const STOCK_FORECAST_COLLECTION_NAME = 'stock_forecast'
const STOCK_COLLECTION_NAME = 'stok_barang_manufaktur'
const MUTATION_COLLECTION_NAME = 'stock_mutation_history'
const MATERIAL_REQUIREMENT_COLLECTION_NAME = 'material_requirement_manufaktur'
const LIST_BARANG_COLLECTION_NAME = 'list_barang'
const PURCHASE_REQUEST_COLLECTION_NAME = 'permintaan_barang_manufaktur'
const DEFAULT_PR_STATUS = 'Belum Diajukan'
const STOCK_FORECAST_SOURCE = 'STOCK_FORECAST'
const REVIEW_GUDANG_STATUS = 'Review Gudang'
const $q = useQuasar()
const masterMaterials = ref([])
const warehouseStocks = ref([])
const mutationRows = ref([])
const stockForecastRows = ref([])
const materialRequirementRows = ref([])
const listBarangRows = ref([])
const selectedMaterial = ref(null)
const selectedRequestRow = ref(null)
const search = ref('')
const typeFilter = ref('all')
const loading = ref(false)
const loadingMutations = ref(false)
const requestSubmitting = ref(false)
const bulkSubmitting = ref(false)
const showMutationDialog = ref(false)
const showRequestDialog = ref(false)
const showAnalyticsDialog = ref(false)
const requestForm = ref({
  jumlah_diminta: 0,
})
let unsubscribeRows = null
let unsubscribeStocks = null
let unsubscribeMutations = null
let unsubscribeStockForecast = null
let unsubscribeMaterialRequirements = null
let unsubscribeListBarang = null
const typeOptions = [
  { label: 'Semua Tipe', value: 'all' },
  { label: 'RAW_MATERIAL', value: 'RAW_MATERIAL' },
  { label: 'SEMI_FINISHED', value: 'SEMI_FINISHED' },
  { label: 'FINISHED_GOOD', value: 'FINISHED_GOOD' },
  { label: 'CONSUMABLE', value: 'CONSUMABLE' },
]

const columns = [
  {
    name: 'kode_barang',
    label: 'Kode Barang',
    field: 'kode_barang',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nama_barang',
    label: 'Nama Material',
    field: 'nama_barang',
    align: 'left',
    sortable: true,
  },
  { name: 'tipe_material', label: 'Tipe', field: 'tipe_material', align: 'left', sortable: true },
  {
    name: 'stok_tersedia',
    label: 'Stok Tersedia',
    field: 'stok_tersedia',
    align: 'right',
    sortable: true,
  },
  {
    name: 'stok_minimal',
    label: 'Stok Min.',
    field: 'stok_minimal',
    align: 'right',
    sortable: true,
  },
  { name: 'lead_time', label: 'Lead Time', field: 'lead_time', align: 'right', sortable: true },
  { name: 'kebutuhan', label: 'Kebutuhan', field: 'kebutuhan', align: 'right', sortable: true },
  { name: 'status_stok', label: 'Status', field: 'status_stok', align: 'left', sortable: true },
  { name: 'forecast', label: 'Forecast', field: 'forecast', align: 'right', sortable: true },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left' },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const mutationColumns = [
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'left', sortable: true },
  {
    name: 'tipe_mutasi',
    label: 'Tipe Mutasi',
    field: 'tipe_mutasi',
    align: 'left',
    sortable: true,
  },
  { name: 'incoming', label: 'Incoming', field: 'incoming', align: 'right', sortable: true },
  { name: 'outgoing', label: 'Outgoing', field: 'outgoing', align: 'right', sortable: true },
  {
    name: 'spk_reference',
    label: 'SPK Reference',
    field: 'spk_reference',
    align: 'left',
    sortable: true,
  },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'right', sortable: true },
  { name: 'user', label: 'User', field: 'user', align: 'left', sortable: true },
]

const getMaterialType = (data = {}) =>
  String(data.jenis_material || data.tipe_material || data.tipe || data.kategori || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')

const normalizeKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const getWarehouseStockQty = (materialId) =>
  warehouseStocks.value
    .filter(
      (stock) => normalizeKey(stock.id_barang || stock.material_id) === normalizeKey(materialId),
    )
    .reduce((sum, stock) => sum + Number(stock.jumlah ?? stock.stok_tersedia ?? stock.stok ?? 0), 0)

const getStockStatus = (stokTersedia, stokMinimal, leadTime) => {
  const stock = Number(stokTersedia || 0)
  const minimal = Number(stokMinimal || 0)
  const warningBuffer = Math.max(Math.ceil(minimal * 0.5), Number(leadTime || 0))

  if (stock <= minimal) return 'Kritis'
  if (stock <= minimal + warningBuffer) return 'Warning'
  return 'Aman'
}

const statusColor = (status) => {
  const colors = {
    Aman: 'positive',
    Warning: 'orange-9',
    Kritis: 'negative',
  }
  return colors[status] || 'grey-7'
}

const normalizeRow = (id, data) => {
  const stokTersedia = getWarehouseStockQty(id)
  const stokMinimal = Number(data.stok_minimal ?? data.stok_minimum ?? data.min_stok ?? 0)
  const leadTime = Number(data.lead_time ?? data.estimasi_waktu ?? 0)
  const kebutuhan = Number(data.kebutuhan ?? data.qty_kebutuhan ?? stokMinimal)

  return {
    id,
    kode_barang: data.kode_material || data.kode_barang || data.kode || '-',
    nama_barang: data.nama_material || data.nama || data.nama_barang || '-',
    tipe_material: getMaterialType(data) || '-',
    stok_tersedia: stokTersedia,
    stok_minimal: stokMinimal,
    lead_time: leadTime,
    kebutuhan,
    status_stok: getStockStatus(stokTersedia, stokMinimal, leadTime),
    forecast: Math.max(kebutuhan - stokTersedia, 0),
    satuan: data.unit || data.satuan || 'PCS',
  }
}

const isLowStock = (row) => ['Warning', 'Kritis'].includes(row?.status_stok)
const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')
const getRequestQty = (row = {}) => {
  const data = row || {}
  return Math.max(
    Number(data.kebutuhan || 0) - Number(data.stok_tersedia || 0) + Number(data.stok_minimal || 0),
    0,
  )
}

const getRequirementPoNumber = (row = {}) =>
  String(row.nomor_po || row.nomor_wo || row.no_po || row.po_number || STOCK_FORECAST_SOURCE).trim()

const getRequirementMaterialKeys = (row = {}) =>
  [
    row.material_id,
    row.master_material_id,
    row.id_barang,
    row.kode_material,
    row.kode_barang,
    row.kode,
    row.id,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

const isPendingRequirement = (row = {}) => {
  const statusPr = row.status_pr || DEFAULT_PR_STATUS
  const status = String(row.status || '').toUpperCase()
  return statusPr === DEFAULT_PR_STATUS || status === 'PENDING'
}

const selectedRequestShortage = computed(() => getRequestQty(selectedRequestRow.value))

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

const getMutationDateValue = (data) =>
  data.tanggal || data.date || data.created_at || data.updated_at || data.timestamp || ''

const normalizeMutationRow = (id, data) => {
  const qty = Number(data.qty ?? data.jumlah ?? data.quantity ?? 0)
  const type = data.tipe_mutasi || data.tipe || data.type || data.mutation_type || '-'
  const incoming = Number(data.incoming ?? (String(type).toLowerCase().includes('in') ? qty : 0))
  const outgoing = Number(data.outgoing ?? (String(type).toLowerCase().includes('out') ? qty : 0))

  return {
    id,
    tanggal: getMutationDateValue(data),
    tipe_mutasi: type,
    incoming,
    outgoing,
    spk_reference:
      data.spk_reference || data.no_spk || data.nomor_spk || data.spk || data.reference || '-',
    qty,
    user: data.user || data.created_by || data.updated_by || data.createdBy || '-',
    material_id:
      data.material_id || data.master_material_id || data.id_material || data.id_barang || '',
    kode_barang: data.kode_barang || data.kode_material || data.kode || '',
    nama_barang: data.nama_barang || data.nama_material || data.material || '',
  }
}

const isMutationForMaterial = (mutation, material) => {
  if (!material) return false
  const mutationKeys = [mutation.material_id, mutation.kode_barang, mutation.nama_barang]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())
  const materialKeys = [material.id, material.kode_barang, material.nama_barang]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  return mutationKeys.some((key) => materialKeys.includes(key))
}

const rows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return masterMaterials.value
    .filter((item) => item.status !== 'Nonaktif' && item.status_aktif !== 'Nonaktif')
    .filter((item) => typeFilter.value === 'all' || getMaterialType(item) === typeFilter.value)
    .map((item) => normalizeRow(item.id, item))
    .filter((row) => {
      if (!keyword) return true
      return [row.kode_barang, row.nama_barang, row.tipe_material, row.satuan]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
})
const criticalRows = computed(() => rows.value.filter((row) => row.status_stok === 'Kritis'))

const getListBarangMatch = (row = {}) => {
  const keys = [row.id, row.material_id, row.kode_barang, row.kode_material, row.nama_barang, row.nama_material]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  return listBarangRows.value.find((item) => {
    const itemKeys = [item.id, item.id_barang, item.kode_barang, item.kode_material, item.nama, item.nama_barang]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase())
    return itemKeys.some((key) => keys.includes(key))
  })
}

const normalizeAnalyticsRow = (row = {}, source = 'stock_forecast') => {
  const listBarang = getListBarangMatch(row)
  const kodeMaterial =
    row.kode_material || row.kode_barang || row.kode || listBarang?.kode_material || listBarang?.kode_barang || ''
  const namaMaterial =
    row.nama_material || row.nama_barang || row.material || row.nama || listBarang?.nama || listBarang?.nama_barang || '-'
  const stokTersedia = Number(row.stok_tersedia ?? row.stok ?? row.stock ?? 0)
  const qtyKebutuhan = Number(
    row.qty_kebutuhan ?? row.kebutuhan ?? row.jumlah_diminta ?? row.forecast ?? row.qty ?? 0,
  )
  const shortage = Number(row.qty_kurang ?? row.kekurangan_stok ?? Math.max(qtyKebutuhan - stokTersedia, 0))
  const statusMaterial = row.status_material || ''
  const statusStok = row.status_stok || getStockStatus(stokTersedia, Number(row.stok_minimal || 0), Number(row.lead_time || 0))

  return {
    key: String(row.id || row.material_id || kodeMaterial || namaMaterial),
    source,
    kode_material: kodeMaterial,
    nama_material: namaMaterial,
    stok_tersedia: stokTersedia,
    qty_kebutuhan: qtyKebutuhan,
    shortage,
    status_stok: statusStok,
    status_material: statusMaterial,
    status_label: statusMaterial || statusStok,
  }
}

const analyticsMaterialRows = computed(() => {
  const rowMap = new Map()
  const appendRow = (row, source) => {
    const normalized = normalizeAnalyticsRow(row, source)
    const key = normalized.key.toLowerCase()
    const existing = rowMap.get(key)
    if (!existing || normalized.shortage > existing.shortage || source === 'material_requirement') {
      rowMap.set(key, normalized)
    }
  }

  rows.value.forEach((row) => appendRow(row, 'stock_forecast'))
  stockForecastRows.value.forEach((row) => appendRow({ id: row.id, ...row }, 'stock_forecast'))
  materialRequirementRows.value.forEach((row) => appendRow(row, 'material_requirement'))

  return Array.from(rowMap.values())
})

const chartTargetRows = computed(() =>
  analyticsMaterialRows.value
    .filter(
      (row) =>
        row.status_stok === 'Kritis' ||
        row.status_material === 'Material Kurang' ||
        row.shortage > 0,
    )
    .sort((a, b) => b.shortage - a.shortage)
    .slice(0, 12),
)

const criticalAnalyticsRows = computed(() =>
  analyticsMaterialRows.value
    .filter((row) => row.status_stok === 'Kritis' || row.status_material === 'Material Kurang')
    .sort((a, b) => b.shortage - a.shortage)
    .slice(0, 8),
)

const totalShortage = computed(() =>
  criticalAnalyticsRows.value.reduce((sum, row) => sum + Number(row.shortage || 0), 0),
)

const mostDeficitMaterial = computed(() => criticalAnalyticsRows.value[0]?.nama_material || '-')

const analyticsSummaryCards = computed(() => [
  {
    label: 'Total Material Kritis',
    value: formatNumber(criticalAnalyticsRows.value.length),
    icon: 'warning',
    color: 'negative',
  },
  {
    label: 'Total Shortage',
    value: formatNumber(totalShortage.value),
    icon: 'inventory_shortage',
    color: 'orange-9',
  },
  {
    label: 'Material Paling Defisit',
    value: mostDeficitMaterial.value,
    icon: 'leaderboard',
    color: 'green-10',
  },
])

const chartTextColor = computed(() => ($q.dark.isActive ? '#e5e7eb' : '#334155'))
const chartGridColor = computed(() => ($q.dark.isActive ? '#334155' : '#e5e7eb'))

const barChartSeries = computed(() => [
  {
    name: 'Stok Tersedia',
    data: chartTargetRows.value.map((row) => row.stok_tersedia),
  },
  {
    name: 'Qty Kebutuhan',
    data: chartTargetRows.value.map((row) => row.qty_kebutuhan),
  },
])

const barChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    foreColor: chartTextColor.value,
    parentHeightOffset: 0,
  },
  theme: { mode: $q.dark.isActive ? 'dark' : 'light' },
  colors: ['#16a34a', '#f97316'],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '48%',
    },
  },
  dataLabels: { enabled: false },
  grid: { borderColor: chartGridColor.value },
  xaxis: {
    categories: chartTargetRows.value.map((row) => row.nama_material),
    labels: {
      rotate: -35,
      trim: true,
      hideOverlappingLabels: true,
      style: { fontSize: '11px' },
    },
  },
  yaxis: {
    labels: {
      formatter: (value) => formatNumber(value),
    },
  },
  tooltip: {
    y: {
      formatter: (value) => formatNumber(value),
    },
  },
  legend: { position: 'top', horizontalAlign: 'left' },
  noData: { text: 'Belum ada material kritis' },
}))

const pieChartCounts = computed(() => {
  const counts = { Aman: 0, Warning: 0, Kritis: 0 }
  rows.value.forEach((row) => {
    counts[row.status_stok] = Number(counts[row.status_stok] || 0) + 1
  })
  return counts
})

const pieChartSeries = computed(() => [
  pieChartCounts.value.Aman,
  pieChartCounts.value.Warning,
  pieChartCounts.value.Kritis,
])

const pieChartOptions = computed(() => ({
  chart: {
    foreColor: chartTextColor.value,
    parentHeightOffset: 0,
  },
  theme: { mode: $q.dark.isActive ? 'dark' : 'light' },
  labels: ['Aman', 'Warning', 'Kritis'],
  colors: ['#16a34a', '#f59e0b', '#dc2626'],
  legend: { position: 'bottom' },
  dataLabels: {
    formatter: (value) => `${Number(value || 0).toFixed(1)}%`,
  },
  tooltip: {
    y: {
      formatter: (value) => `${formatNumber(value)} material`,
    },
  },
  noData: { text: 'Belum ada data status' },
}))

const buildMaterialRequirementPayload = (row, jumlahDiminta = getRequestQty(row)) => {
  const qtyKurang = Number(jumlahDiminta || 0)
  const stokTersedia = Number(row.stok_tersedia || 0)
  const qtyKebutuhan = stokTersedia + qtyKurang
  const namaMaterial = row.nama_material || row.nama_barang || row.material || '-'
  const kodeMaterial = row.kode_material || row.kode_barang || row.kode || '-'
  const nomorPo = getRequirementPoNumber(row)

  return {
    nomor_po: nomorPo,
    nomor_wo: nomorPo,
    produk: row.produk || row.nama_produk || '',
    material_id: row.material_id || row.id || '',
    kode_barang: kodeMaterial,
    kode_material: kodeMaterial,
    nama_material: namaMaterial,
    material: namaMaterial,
    tipe_material: row.tipe_material,
    satuan: row.satuan,
    stok_tersedia: stokTersedia,
    stok_minimal: Number(row.stok_minimal || 0),
    kebutuhan: Number(row.kebutuhan || 0),
    qty_kebutuhan: qtyKebutuhan,
    qty_kurang: qtyKurang,
    kekurangan_stok: qtyKurang,
    jumlah_diminta: qtyKurang,
    status: 'PENDING',
    status_material: qtyKurang > 0 ? 'Material Kurang' : 'Material Ready',
    status_pr: DEFAULT_PR_STATUS,
    source: STOCK_FORECAST_SOURCE,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
}

const findPendingDuplicateRequirement = async (row) => {
  const materialKeys = getRequirementMaterialKeys(row)
  const nomorPo = getRequirementPoNumber(row).toLowerCase()
  if (!materialKeys.length || !nomorPo) return null

  const snapshot = await getDocs(
    query(
      collection(db, MATERIAL_REQUIREMENT_COLLECTION_NAME),
      where('source', '==', STOCK_FORECAST_SOURCE),
    ),
  )

  return snapshot.docs
    .map((requirementDoc) => ({ firestore_id: requirementDoc.id, ...requirementDoc.data() }))
    .find((requirement) => {
      const requirementMaterialKeys = getRequirementMaterialKeys(requirement)
      const requirementPo = getRequirementPoNumber(requirement).toLowerCase()
      return (
        requirementMaterialKeys.some((key) => materialKeys.includes(key)) &&
        requirementPo === nomorPo &&
        isPendingRequirement(requirement)
      )
    })
}

const findPendingDraftQueue = async (row) => {
  const materialKeys = getRequirementMaterialKeys(row)
  const nomorPo = getRequirementPoNumber(row).toLowerCase()
  if (!materialKeys.length || !nomorPo) return null

  const snapshot = await getDocs(
    query(
      collection(db, PURCHASE_REQUEST_COLLECTION_NAME),
      where('tipe', '==', 'PURCHASE_REQUEST'),
      where('source_module', '==', 'PPIC'),
    ),
  )

  return snapshot.docs
    .map((draftDoc) => ({ firestore_id: draftDoc.id, ...draftDoc.data() }))
    .find((draft) => {
      const draftMaterialKeys = (draft.items || []).flatMap((item) => getRequirementMaterialKeys(item))
      const draftPo = String(draft.no_reff || draft.nomor_po || '').trim().toLowerCase()
      return (
        draftMaterialKeys.some((key) => materialKeys.includes(key)) &&
        draftPo === nomorPo &&
        (draft.status_workflow || draft.status) === REVIEW_GUDANG_STATUS
      )
    })
}

const buildPurchaseRequestDraftPayload = (row, materialRequirementId, jumlahDiminta) => {
  const draftRef = doc(collection(db, PURCHASE_REQUEST_COLLECTION_NAME))
  const nomorPo = getRequirementPoNumber(row)
  const qty = Number(jumlahDiminta || getRequestQty(row) || 0)
  const kodeMaterial = row.kode_material || row.kode_barang || row.kode || ''
  const namaMaterial = row.nama_material || row.nama_barang || row.material || ''

  return {
    id: draftRef.id,
    ref: draftRef,
    data: {
      id_draft_queue: draftRef.id,
      nomor: '',
      no_reff: nomorPo,
      nomor_po: nomorPo,
      tipe: 'PURCHASE_REQUEST',
      pemohon: 'PPIC',
      proyek_id: 'UTAMA',
      proyek_nama: 'Gudang Utama Center',
      id_gudang: 'UTAMA',
      gudang_tujuan: 'Gudang Utama',
      status: REVIEW_GUDANG_STATUS,
      status_workflow: REVIEW_GUDANG_STATUS,
      workflow_status: REVIEW_GUDANG_STATUS,
      gudang_status: REVIEW_GUDANG_STATUS,
      approval_sync_status: REVIEW_GUDANG_STATUS,
      is_read_gudang: 0,
      source: 'MATERIAL_REQUIREMENT',
      source_module: 'PPIC',
      material_requirement_id: materialRequirementId,
      created_by_ppic: {
        uid: auth.currentUser?.uid || '',
        email: auth.currentUser?.email || '',
        nama: auth.currentUser?.displayName || auth.currentUser?.email || 'PPIC',
      },
      items: [
        {
          id_barang: row.material_id || row.id || '',
          kode_barang: kodeMaterial,
          kode_material: kodeMaterial,
          nama_barang: namaMaterial,
          nama_material: namaMaterial,
          qty,
          jumlah: qty,
          satuan: row.satuan || '',
          estimasi_harga: 0,
          total: 0,
          supplier: '',
          note: '',
          keterangan: `Draft queue dari Stock Forecast untuk PO ${nomorPo}`,
        },
      ],
      total_estimasi: 0,
      timestamp: serverTimestamp(),
      created_at: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  }
}

const createMaterialRequirementFromForecast = async (row, jumlahDiminta = getRequestQty(row)) => {
  const duplicate = await findPendingDuplicateRequirement(row)
  if (duplicate) return { created: false, duplicate }

  const materialRequirementRef = await addDoc(
    collection(db, MATERIAL_REQUIREMENT_COLLECTION_NAME),
    buildMaterialRequirementPayload(row, jumlahDiminta),
  )
  const draftDuplicate = await findPendingDraftQueue(row)
  if (!draftDuplicate) {
    const draft = buildPurchaseRequestDraftPayload(row, materialRequirementRef.id, jumlahDiminta)
    await setDoc(draft.ref, draft.data)
  }

  return { created: true, duplicate: null }
}

const refreshRows = () => {
  loadRows()
}

const openRequestDialog = (row) => {
  selectedRequestRow.value = row
  requestForm.value = {
    jumlah_diminta: getRequestQty(row),
  }
  showRequestDialog.value = true
}

const closeRequestDialog = () => {
  showRequestDialog.value = false
  selectedRequestRow.value = null
  requestForm.value = {
    jumlah_diminta: 0,
  }
}

const submitMaterialRequirement = async () => {
  if (!selectedRequestRow.value) return
  const jumlahDiminta = Number(requestForm.value.jumlah_diminta || 0)
  if (jumlahDiminta <= 0) {
    $q.notify({ type: 'warning', message: 'Jumlah diminta wajib lebih dari 0' })
    return
  }

  requestSubmitting.value = true
  try {
    const result = await createMaterialRequirementFromForecast(selectedRequestRow.value, jumlahDiminta)
    if (!result.created) {
      $q.notify({
        type: 'warning',
        message: 'Material requirement pending untuk material dan nomor PO ini sudah ada',
      })
      return
    }

    $q.notify({ type: 'positive', message: 'Material requirement berhasil dikirim' })
    closeRequestDialog()
    refreshRows()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal mengirim material requirement' })
  } finally {
    requestSubmitting.value = false
  }
}

const processAllCriticalRows = async () => {
  const targets = criticalRows.value
  if (!targets.length) return

  bulkSubmitting.value = true
  try {
    const results = await Promise.all(
      targets.map((row) => createMaterialRequirementFromForecast(row)),
    )
    const createdCount = results.filter((result) => result.created).length
    const duplicateCount = results.length - createdCount
    $q.notify({
      type: createdCount ? 'positive' : 'warning',
      message: duplicateCount
        ? `${createdCount} barang kritis diproses, ${duplicateCount} duplicate pending dilewati`
        : `${createdCount} barang kritis berhasil diproses ke Material Requirement`,
    })
    refreshRows()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal memproses barang kritis' })
  } finally {
    bulkSubmitting.value = false
  }
}

const loadRows = () => {
  loading.value = true
  if (unsubscribeRows) unsubscribeRows()
  unsubscribeRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('nama', 'asc')),
    (snapshot) => {
      masterMaterials.value = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat stock forecast' })
    },
  )

  if (unsubscribeStocks) unsubscribeStocks()
  unsubscribeStocks = onSnapshot(
    query(collection(db, STOCK_COLLECTION_NAME)),
    (snapshot) => {
      warehouseStocks.value = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat stok gudang realtime' })
    },
  )

  if (unsubscribeStockForecast) unsubscribeStockForecast()
  unsubscribeStockForecast = onSnapshot(
    query(collection(db, STOCK_FORECAST_COLLECTION_NAME)),
    (snapshot) => {
      stockForecastRows.value = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
    },
    (error) => {
      console.warn('Gagal memuat collection stock_forecast untuk analytics', error)
      stockForecastRows.value = []
    },
  )

  if (unsubscribeMaterialRequirements) unsubscribeMaterialRequirements()
  unsubscribeMaterialRequirements = onSnapshot(
    query(collection(db, MATERIAL_REQUIREMENT_COLLECTION_NAME)),
    (snapshot) => {
      materialRequirementRows.value = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
    },
    (error) => {
      console.warn('Gagal memuat material_requirement untuk analytics', error)
      materialRequirementRows.value = []
    },
  )

  if (unsubscribeListBarang) unsubscribeListBarang()
  unsubscribeListBarang = onSnapshot(
    query(collection(db, LIST_BARANG_COLLECTION_NAME)),
    (snapshot) => {
      listBarangRows.value = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
    },
    (error) => {
      console.warn('Gagal memuat list_barang untuk analytics', error)
      listBarangRows.value = []
    },
  )
}

const closeMutationHistory = () => {
  if (unsubscribeMutations) unsubscribeMutations()
  unsubscribeMutations = null
  mutationRows.value = []
  selectedMaterial.value = null
  loadingMutations.value = false
}

const openMutationHistory = (row) => {
  closeMutationHistory()
  selectedMaterial.value = row
  showMutationDialog.value = true
  loadingMutations.value = true

  unsubscribeMutations = onSnapshot(
    query(collection(db, MUTATION_COLLECTION_NAME)),
    (snapshot) => {
      mutationRows.value = snapshot.docs
        .map((docItem) => normalizeMutationRow(docItem.id, docItem.data()))
        .filter((mutation) => isMutationForMaterial(mutation, row))
        .sort((a, b) => Number(toDate(b.tanggal) || 0) - Number(toDate(a.tanggal) || 0))
      loadingMutations.value = false
    },
    (error) => {
      console.error(error)
      loadingMutations.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat mutation history' })
    },
  )
}

onMounted(loadRows)
onUnmounted(() => {
  if (unsubscribeRows) unsubscribeRows()
  if (unsubscribeStocks) unsubscribeStocks()
  if (unsubscribeMutations) unsubscribeMutations()
  if (unsubscribeStockForecast) unsubscribeStockForecast()
  if (unsubscribeMaterialRequirements) unsubscribeMaterialRequirements()
  if (unsubscribeListBarang) unsubscribeListBarang()
})
</script>

<style scoped>
.filter-card,
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.stock-link {
  min-height: 28px;
  padding: 0 8px;
}

.mutation-dialog {
  width: min(960px, 94vw);
  max-width: 94vw;
}

.request-dialog {
  background: #f4f7f6;
}

.analytics-dialog {
  background: #f4f7f6;
}

.analytics-toolbar {
  background: #14532d;
}

.analytics-scroll {
  scroll-behavior: smooth;
}

.analytics-shell {
  width: min(100%, 1180px);
  margin: 0 auto;
  padding-bottom: 28px;
}

.analytics-summary-card,
.analytics-chart-card,
.analytics-critical-card {
  border-color: #dfe8df;
  border-radius: 12px;
  background: #ffffff;
}

.analytics-chart-card {
  min-height: 100%;
  overflow: hidden;
}

.request-shell {
  width: min(100%, 1080px);
  margin: 0 auto;
}

.request-summary,
.request-form-card {
  border-color: #dfe8df;
  border-radius: 12px;
}

.detail-label {
  color: #66736d;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.detail-value {
  color: #12382d;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

body.body--dark .analytics-dialog {
  background: #0f172a;
}

body.body--dark .analytics-summary-card,
body.body--dark .analytics-chart-card,
body.body--dark .analytics-critical-card {
  border-color: #334155;
  background: #111827;
}

body.body--dark .analytics-summary-card :deep(.text-grey-7),
body.body--dark .analytics-chart-card :deep(.text-grey-7),
body.body--dark .analytics-critical-card :deep(.text-grey-7) {
  color: #cbd5e1 !important;
}

@media (max-width: 599px) {
  .analytics-shell {
    padding-bottom: 16px;
  }

  .analytics-chart-card :deep(.apexcharts-canvas) {
    max-width: 100%;
  }
}
</style>
