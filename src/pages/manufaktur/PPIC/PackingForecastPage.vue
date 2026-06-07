<template>
  <q-page class="forecast-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Forecast Packing Material
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            PPIC Material Kemasan
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Proyeksi kebutuhan indirect material packing berdasarkan planning produksi dan standard packing product.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-chip v-if="shortageRows.length" color="negative" text-color="white" icon="warning" class="text-weight-bold">
          Material packing tidak mencukupi untuk planning produksi.
        </q-chip>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="46px" />
            <div class="q-ml-md">
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
          <div class="col-12 col-md-7">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari material, status, atau rekomendasi..."
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
              :options="statusOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Status"
              bg-color="white"
            />
          </div>
          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} MATERIAL
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card bg-white q-mb-lg">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="material_id"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="forecast-table"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props">
            <q-td key="material" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.material_name }}</div>
              <div class="text-caption text-grey-6">{{ props.row.satuan || '-' }}</div>
            </q-td>
            <q-td key="current_stock" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.current_stock) }}
            </q-td>
            <q-td key="forecast_need" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.forecast_need) }}
            </q-td>
            <q-td key="remaining_forecast" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.remaining_forecast) }}
            </q-td>
            <q-td key="status" :props="props">
              <q-chip dense text-color="white" :color="statusColor(props.row.status)" class="status-chip">
                {{ props.row.status }}
              </q-chip>
            </q-td>
            <q-td key="recommendation" :props="props">
              {{ props.row.recommendation }}
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="query_stats" size="28px" class="q-mr-sm" />
            Belum ada forecast packing material.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-card v-if="standardIssues.length" flat bordered class="issue-card bg-white">
      <q-card-section class="text-weight-bold text-orange-10">
        Produk Belum Memiliki Standard Packing
      </q-card-section>
      <q-separator />
      <q-list separator>
        <q-item v-for="issue in standardIssues" :key="issue.key">
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ issue.product_name || '-' }}</q-item-label>
            <q-item-label caption>
              {{ issue.source_no || '-' }} | Qty {{ formatNumber(issue.qty) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const PLANNING_COLLECTION = 'planning_produksi_manufaktur'
const MASTER_PRODUK_COLLECTION = 'manufactur_master_barang'
const MASTER_PACKING_MATERIAL_COLLECTION = 'master_packing_material'
const STANDARD_PACKING_COLLECTION = 'master_standard_packing_product'

const $q = useQuasar()
const search = ref('')
const statusFilter = ref('all')
const loading = ref(true)
const planningRows = ref([])
const productRows = ref([])
const materialRows = ref([])
const standardRows = ref([])
let unsubPlanning = null
let unsubProduct = null
let unsubMaterial = null
let unsubStandard = null

const columns = [
  { name: 'material', align: 'left', label: 'Material', field: 'material_name', sortable: true },
  { name: 'current_stock', align: 'right', label: 'Current Stock', field: 'current_stock', sortable: true },
  { name: 'forecast_need', align: 'right', label: 'Forecast Need', field: 'forecast_need', sortable: true },
  { name: 'remaining_forecast', align: 'right', label: 'Remaining Forecast', field: 'remaining_forecast', sortable: true },
  { name: 'status', align: 'left', label: 'Status', field: 'status', sortable: true },
  { name: 'recommendation', align: 'left', label: 'Reorder Recommendation', field: 'recommendation' },
]

const statusOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Aman', value: 'Aman' },
  { label: 'Minimum', value: 'Minimum' },
  { label: 'Kritis', value: 'Kritis' },
]

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const getStockStatus = (stock, need, minimumStock) => {
  const remaining = Number(stock || 0) - Number(need || 0)
  const minimum = Number(minimumStock || 0)
  if (remaining < 0 || remaining <= minimum * 0.5) return 'Kritis'
  if (minimum > 0 && remaining <= minimum) return 'Minimum'
  return 'Aman'
}

const statusColor = (status) => {
  if (status === 'Kritis') return 'negative'
  if (status === 'Minimum') return 'orange-9'
  return 'green-10'
}

const normalizeText = (value) => String(value || '').trim().toLowerCase()

const productByDemand = (row) => {
  const productId = row.produk_id || row.product_id || row.id_produk
  if (productId) {
    const byId = productRows.value.find((product) => product.id === productId)
    if (byId) return byId
  }
  const code = normalizeText(row.kode_produk || row.kode_barang)
  if (code) {
    const byCode = productRows.value.find((product) => normalizeText(product.kode_material || product.kode_produk || product.kode) === code)
    if (byCode) return byCode
  }
  const name = normalizeText(row.nama_produk || row.item_produksi || row.nama_barang || row.produk)
  return productRows.value.find((product) => normalizeText(product.nama_material || product.nama_produk || product.nama) === name)
}

const standardByProduct = (product) => {
  if (!product?.id) return null
  const standard = standardRows.value.find((item) => item.product_id === product.id || item.id === product.id)
  if (standard) {
    return {
      material_id: standard.default_packing_material_id,
      material: standard.default_packing_material_name,
      qty_per_box: Number(standard.qty_per_box || 0),
      bubble_wrap: !!standard.bubble_wrap_usage,
      pallet_required: !!standard.pallet_configuration?.enabled,
      pallet_configuration: standard.pallet_configuration || {},
      standard_weight_per_box: Number(standard.standard_weight_per_box || 0),
    }
  }
  return product.packing_standard || null
}

const demandRows = computed(() => {
  const activePlanning = planningRows.value
    .filter((row) => !['Selesai', 'Batal'].includes(row.status_planning || row.status))
    .map((row) => ({
      key: `planning-${row.id}`,
      source_no: row.no_planning || row.nomor_planning || row.nomor_spk || row.nomor_approved,
      project_id: row.project_id || row.projectId || row.proyek_id || '',
      project_name: row.project_name || row.projectName || row.proyek_nama || row.project || '',
      produk_id: row.produk_id,
      kode_produk: row.kode_produk,
      nama_produk: row.nama_produk || row.item_produksi,
      qty: Number(row.qty_target || row.qty || 0),
    }))

  return activePlanning.filter((row) => row.qty > 0)
})

const materialById = (id) => materialRows.value.find((material) => material.id === id)
const materialByName = (name) =>
  materialRows.value.find((material) => normalizeText(material.nama_material).includes(normalizeText(name)))

const standardIssues = computed(() => {
  const issues = []
  demandRows.value.forEach((demand) => {
    const product = productByDemand(demand)
    const standard = standardByProduct(product) || {}
    if (!product || !standard.material_id || !Number(standard.qty_per_box || 0)) {
      issues.push({ ...demand, product_name: demand.nama_produk, key: demand.key })
    }
  })
  return issues
})

const forecastRows = computed(() => {
  const map = new Map()

  const addNeed = (material, qty) => {
    if (!material?.id || qty <= 0) return
    if (!map.has(material.id)) {
      map.set(material.id, {
        material_id: material.id,
        material_name: material.nama_material || '-',
        satuan: material.satuan || '',
        current_stock: Number(material.stok || 0),
        minimum_stock: Number(material.minimum_stock || 0),
        forecast_need: 0,
      })
    }
    map.get(material.id).forecast_need += qty
  }

  demandRows.value.forEach((demand) => {
    const product = productByDemand(demand)
    const standard = standardByProduct(product) || {}
    const qtyPerBox = Number(standard.qty_per_box || 0)
    const mainMaterial = materialById(standard.material_id)
    if (!mainMaterial || qtyPerBox <= 0) return

    const boxNeed = Math.ceil(Number(demand.qty || 0) / qtyPerBox)
    addNeed(mainMaterial, boxNeed)
    if (standard.bubble_wrap) addNeed(materialByName('bubble'), boxNeed)
    if (standard.pallet_required) {
      const boxesPerPallet = Number(standard.pallet_configuration?.boxes_per_pallet || 20)
      addNeed(materialByName('pallet'), Math.ceil(boxNeed / Math.max(1, boxesPerPallet)))
    }
  })

  return Array.from(map.values()).map((row) => {
    const remaining = Number(row.current_stock || 0) - Number(row.forecast_need || 0)
    const shortage = Math.max(0, -remaining)
    const status = getStockStatus(row.current_stock, row.forecast_need, row.minimum_stock)
    return {
      ...row,
      remaining_forecast: remaining,
      status,
      recommendation: shortage > 0 ? `Reorder ${formatNumber(shortage)} ${row.satuan || ''}` : 'Tidak perlu reorder',
    }
  })
})

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return forecastRows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    const matchesSearch =
      !keyword ||
      [row.material_name, row.status, row.recommendation]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    return matchesStatus && matchesSearch
  })
})

const shortageRows = computed(() => forecastRows.value.filter((row) => row.remaining_forecast < 0))

const summaryCards = computed(() => [
  { title: 'Demand Source', value: demandRows.value.length, icon: 'assignment', color: 'green-10' },
  { title: 'Material Forecast', value: forecastRows.value.length, icon: 'inventory_2', color: 'blue-grey-7' },
  { title: 'Shortage', value: shortageRows.value.length, icon: 'warning', color: 'negative' },
  { title: 'Belum Standard', value: standardIssues.value.length, icon: 'rule', color: 'orange-9' },
])

const listen = () => {
  loading.value = true
  unsubPlanning = onSnapshot(
    query(collection(db, PLANNING_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      planningRows.value = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat planning produksi.' })
    },
  )
  unsubProduct = onSnapshot(
    query(collection(db, MASTER_PRODUK_COLLECTION), orderBy('nama', 'asc')),
    (snapshot) => {
      productRows.value = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat master produk.' })
    },
  )
  unsubMaterial = onSnapshot(
    query(collection(db, MASTER_PACKING_MATERIAL_COLLECTION), orderBy('nama_material', 'asc')),
    (snapshot) => {
      materialRows.value = snapshot.docs.map((item) => ({ id: item.id, stok: 0, minimum_stock: 0, ...item.data() }))
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat master packing material.' })
    },
  )
  unsubStandard = onSnapshot(
    query(collection(db, STANDARD_PACKING_COLLECTION), orderBy('product_name', 'asc')),
    (snapshot) => {
      standardRows.value = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat standard packing product.' })
    },
  )
}

onMounted(listen)

onUnmounted(() => {
  if (unsubPlanning) unsubPlanning()
  if (unsubProduct) unsubProduct()
  if (unsubMaterial) unsubMaterial()
  if (unsubStandard) unsubStandard()
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
.issue-card {
  border-color: #dfe8df;
  border-radius: 16px;
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

.forecast-table :deep(thead tr th) {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.5px;
  padding: 14px 16px;
  text-transform: uppercase;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  min-width: 86px;
  justify-content: center;
}
</style>
