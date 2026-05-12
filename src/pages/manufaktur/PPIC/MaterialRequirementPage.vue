<template>
  <q-page class="mrp-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Material Requirement Planning
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Kesiapan Material Sebelum Produksi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Monitoring kebutuhan material berdasarkan Work Order, stok tersedia, kekurangan material,
          dan status pengadaan.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Tambah Requirement"
          no-caps
          class="q-px-lg shadow-premium"
          @click="openCreateDialog"
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
              placeholder="Cari nomor WO, produk, atau material..."
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
              label="Filter Status Material"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-md-auto">
            <q-btn
              flat
              round
              color="green-10"
              icon="refresh"
              :loading="loading"
              @click="loadRequirements"
            />
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
        class="mrp-table"
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
          <q-tr :props="props" class="mrp-row">
            <q-td key="nomor_wo" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_wo }}
            </q-td>
            <q-td key="produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.produk }}</div>
              <div class="text-caption text-grey-6">{{ props.row.material }}</div>
            </q-td>
            <q-td key="material" :props="props">{{ props.row.material }}</q-td>
            <q-td key="qty_kebutuhan" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.qty_kebutuhan) }}
            </q-td>
            <q-td key="stok_tersedia" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.stok_tersedia) }}
            </q-td>
            <q-td key="qty_kurang" :props="props" class="text-right">
              <q-badge
                v-if="props.row.qty_kurang > 0"
                color="negative"
                class="warning-badge q-px-sm q-py-xs"
              >
                Kurang {{ formatNumber(props.row.qty_kurang) }}
              </q-badge>
              <span v-else class="text-positive text-weight-bold">0</span>
            </q-td>
            <q-td key="status_material" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status_material)"
                class="status-chip"
              >
                {{ statusLabel(props.row.status_material) }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props" class="text-center">
              <div class="row justify-center q-gutter-xs no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  color="green-10"
                  icon="inventory"
                  @click="openStockDialog(props.row)"
                >
                  <q-tooltip>Cek stok material</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="blue-grey-7"
                  icon="edit"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>Edit requirement</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory" size="28px" class="q-mr-sm" />
            Belum ada material requirement.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showFormDialog" persistent>
      <q-card class="mrp-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ formModeLabel }} Material Requirement</div>
            <div class="text-caption">Qty kurang dihitung otomatis dari kebutuhan dan stok.</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveRequirement">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nomor_wo"
                  outlined
                  dense
                  label="Nomor WO"
                  :rules="[(val) => !!val || 'Nomor WO wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.produk"
                  outlined
                  dense
                  label="Produk"
                  :rules="[(val) => !!val || 'Produk wajib diisi']"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.material"
                  outlined
                  dense
                  label="Material"
                  :rules="[(val) => !!val || 'Material wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.qty_kebutuhan"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Qty Kebutuhan"
                  :rules="[(val) => Number(val) > 0 || 'Qty kebutuhan wajib lebih dari 0']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.stok_tersedia"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Stok Tersedia"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  :model-value="calculatedShortage"
                  outlined
                  dense
                  readonly
                  label="Qty Kurang"
                >
                  <template #append>
                    <q-icon
                      :name="calculatedShortage > 0 ? 'warning' : 'check_circle'"
                      :color="calculatedShortage > 0 ? 'negative' : 'positive'"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12">
                <q-banner
                  rounded
                  :class="calculatedShortage > 0 ? 'bg-red-1 text-negative' : 'bg-green-1 text-green-10'"
                >
                  <template #avatar>
                    <q-icon :name="calculatedShortage > 0 ? 'warning' : 'verified'" />
                  </template>
                  {{ stockMessage }}
                </q-banner>
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
              label="Simpan Requirement"
              no-caps
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showStockDialog">
      <q-card class="stock-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">Cek Stok Material</div>
            <div class="text-caption">{{ selectedRow?.nomor_wo }} - {{ selectedRow?.material }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="stock-grid">
            <div class="stock-metric">
              <div class="metric-label">Qty Kebutuhan</div>
              <div class="metric-value">{{ formatNumber(selectedRow?.qty_kebutuhan) }}</div>
            </div>
            <div class="stock-metric">
              <div class="metric-label">Stok Tersedia</div>
              <div class="metric-value">{{ formatNumber(selectedRow?.stok_tersedia) }}</div>
            </div>
            <div class="stock-metric" :class="{ 'stock-metric--warning': selectedRow?.qty_kurang > 0 }">
              <div class="metric-label">Qty Kurang</div>
              <div class="metric-value">{{ formatNumber(selectedRow?.qty_kurang) }}</div>
            </div>
          </div>

          <q-linear-progress
            rounded
            size="14px"
            :value="stockCoverage(selectedRow)"
            :color="selectedRow?.qty_kurang > 0 ? 'orange-9' : 'green-10'"
            track-color="green-1"
            class="q-mt-lg"
          />
          <div class="text-caption text-grey-7 q-mt-sm">
            Coverage stok {{ Math.round(stockCoverage(selectedRow) * 100) }}% dari kebutuhan.
          </div>
        </q-card-section>
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

const COLLECTION_NAME = 'material_requirement_manufaktur'
const statusOptions = [
  { label: 'READY', value: 'READY' },
  { label: 'KURANG MATERIAL', value: 'KURANG_MATERIAL' },
  { label: 'WAITING PURCHASE', value: 'WAITING_PURCHASE' },
]
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions,
]

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const statusFilter = ref('all')
const showFormDialog = ref(false)
const showStockDialog = ref(false)
const selectedRow = ref(null)
const editingId = ref(null)
let unsubscribeRequirements = null

const defaultForm = () => ({
  nomor_wo: '',
  produk: '',
  material: '',
  qty_kebutuhan: null,
  stok_tersedia: 0,
})

const form = ref(defaultForm())

const columns = [
  { name: 'nomor_wo', align: 'left', label: 'Nomor WO', field: 'nomor_wo', sortable: true },
  { name: 'produk', align: 'left', label: 'Produk', field: 'produk', sortable: true },
  { name: 'material', align: 'left', label: 'Material', field: 'material', sortable: true },
  {
    name: 'qty_kebutuhan',
    align: 'right',
    label: 'Qty Kebutuhan',
    field: 'qty_kebutuhan',
    sortable: true,
  },
  {
    name: 'stok_tersedia',
    align: 'right',
    label: 'Stok Tersedia',
    field: 'stok_tersedia',
    sortable: true,
  },
  { name: 'qty_kurang', align: 'right', label: 'Qty Kurang', field: 'qty_kurang', sortable: true },
  {
    name: 'status_material',
    align: 'center',
    label: 'Status Material',
    field: 'status_material',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const enrichedRows = computed(() =>
  rows.value.map((row) => {
    const shortage = calculateShortage(row.qty_kebutuhan, row.stok_tersedia)
    return {
      ...row,
      qty_kurang: shortage,
      status_material: row.status_material || deriveStatus(shortage),
    }
  }),
)

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return enrichedRows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status_material === statusFilter.value
    const matchesSearch =
      !keyword ||
      [row.nomor_wo, row.produk, row.material, row.status_material]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Material Ready',
    value: enrichedRows.value.filter((row) => row.status_material === 'READY').length,
    icon: 'verified',
    color: 'green-10',
  },
  {
    title: 'Material Kurang',
    value: enrichedRows.value.filter((row) => row.status_material === 'KURANG_MATERIAL').length,
    icon: 'warning',
    color: 'negative',
  },
  {
    title: 'Waiting Purchase',
    value: enrichedRows.value.filter((row) => row.status_material === 'WAITING_PURCHASE').length,
    icon: 'pending_actions',
    color: 'orange-9',
  },
])

const calculatedShortage = computed(() =>
  calculateShortage(form.value.qty_kebutuhan, form.value.stok_tersedia),
)

const stockMessage = computed(() => {
  if (calculatedShortage.value > 0) {
    return `Stok kurang ${formatNumber(calculatedShortage.value)}. Material perlu dipenuhi sebelum produksi dimulai.`
  }
  return 'Stok material mencukupi untuk kebutuhan produksi.'
})

const formModeLabel = computed(() => (editingId.value ? 'Edit' : 'Tambah'))

const calculateShortage = (required, available) =>
  Math.max(Number(required || 0) - Number(available || 0), 0)

const deriveStatus = (shortage) => (shortage > 0 ? 'KURANG_MATERIAL' : 'READY')

const statusLabel = (status) => {
  const option = statusOptions.find((item) => item.value === status)
  return option?.label || status || '-'
}

const statusColor = (status) => {
  const colors = {
    READY: 'green-10',
    KURANG_MATERIAL: 'negative',
    WAITING_PURCHASE: 'orange-9',
  }
  return colors[status] || 'grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const stockCoverage = (row) => {
  const required = Number(row?.qty_kebutuhan || 0)
  if (!required) return 0
  return Math.min(Number(row?.stok_tersedia || 0) / required, 1)
}

const buildPayload = () => {
  const qtyKebutuhan = Number(form.value.qty_kebutuhan || 0)
  const stokTersedia = Number(form.value.stok_tersedia || 0)
  const qtyKurang = calculateShortage(qtyKebutuhan, stokTersedia)

  return {
    nomor_wo: form.value.nomor_wo,
    produk: form.value.produk,
    material: form.value.material,
    qty_kebutuhan: qtyKebutuhan,
    stok_tersedia: stokTersedia,
    qty_kurang: qtyKurang,
    status_material: deriveStatus(qtyKurang),
    updated_at: serverTimestamp(),
  }
}

const openCreateDialog = () => {
  editingId.value = null
  form.value = defaultForm()
  showFormDialog.value = true
}

const openEditDialog = (row) => {
  editingId.value = row.id
  form.value = {
    nomor_wo: row.nomor_wo || '',
    produk: row.produk || '',
    material: row.material || '',
    qty_kebutuhan: Number(row.qty_kebutuhan || 0),
    stok_tersedia: Number(row.stok_tersedia || 0),
  }
  showFormDialog.value = true
}

const openStockDialog = (row) => {
  selectedRow.value = row
  showStockDialog.value = true
}

const saveRequirement = async () => {
  submitting.value = true
  try {
    const payload = buildPayload()

    if (editingId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, editingId.value), payload)
      $q.notify({ type: 'positive', message: 'Material requirement berhasil diperbarui' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'Material requirement berhasil dibuat' })
    }

    showFormDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan material requirement' })
  } finally {
    submitting.value = false
  }
}

const loadRequirements = () => {
  loading.value = true
  if (unsubscribeRequirements) unsubscribeRequirements()

  const requirementQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeRequirements = onSnapshot(
    requirementQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((requirementDoc) => ({
        id: requirementDoc.id,
        ...requirementDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat material requirement' })
    },
  )
}

onMounted(loadRequirements)

onUnmounted(() => {
  if (unsubscribeRequirements) unsubscribeRequirements()
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
.mrp-dialog,
.stock-dialog {
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

.mrp-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.mrp-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.mrp-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 132px;
  justify-content: center;
}

.warning-badge {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.mrp-dialog {
  max-width: 95vw;
  width: 760px;
}

.stock-dialog {
  max-width: 95vw;
  width: 680px;
}

.stock-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stock-metric {
  background: #f8fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  padding: 16px;
}

.stock-metric--warning {
  background: #fff3f3;
  border-color: #f3c4c4;
}

.metric-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.metric-value {
  color: #1b5e20;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
  margin-top: 8px;
}

.stock-metric--warning .metric-value {
  color: #c10015;
}

@media (max-width: 599px) {
  .stock-grid {
    grid-template-columns: 1fr;
  }
}
</style>
