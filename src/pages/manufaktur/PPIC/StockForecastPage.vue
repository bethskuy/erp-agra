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
      <q-btn
        flat
        rounded
        color="green-10"
        icon="sync"
        label="Refresh Data"
        no-caps
        :loading="loading"
        class="bg-white shadow-1 q-mt-md q-mt-md-none"
        @click="loadRows"
      />
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
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'manufactur_master_barang'
const STOCK_COLLECTION_NAME = 'stok_barang_manufaktur'
const MUTATION_COLLECTION_NAME = 'stock_mutation_history'
const MATERIAL_REQUIREMENT_COLLECTION_NAME = 'material_requirement'
const $q = useQuasar()
const masterMaterials = ref([])
const warehouseStocks = ref([])
const mutationRows = ref([])
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
const requestForm = ref({
  jumlah_diminta: 0,
})
let unsubscribeRows = null
let unsubscribeStocks = null
let unsubscribeMutations = null
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

const buildMaterialRequirementPayload = (row, jumlahDiminta = getRequestQty(row)) => ({
  material_id: row.id,
  kode_barang: row.kode_barang,
  kode_material: row.kode_barang,
  nama_material: row.nama_barang,
  material: row.nama_barang,
  tipe_material: row.tipe_material,
  satuan: row.satuan,
  stok_tersedia: Number(row.stok_tersedia || 0),
  stok_minimal: Number(row.stok_minimal || 0),
  kebutuhan: Number(row.kebutuhan || 0),
  kekurangan_stok: getRequestQty(row),
  jumlah_diminta: Number(jumlahDiminta || 0),
  status: 'PENDING',
  source: 'STOCK_FORECAST',
  created_at: serverTimestamp(),
  updated_at: serverTimestamp(),
})

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
    await addDoc(
      collection(db, MATERIAL_REQUIREMENT_COLLECTION_NAME),
      buildMaterialRequirementPayload(selectedRequestRow.value, jumlahDiminta),
    )
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
    await Promise.all(
      targets.map((row) =>
        addDoc(
          collection(db, MATERIAL_REQUIREMENT_COLLECTION_NAME),
          buildMaterialRequirementPayload(row),
        ),
      ),
    )
    $q.notify({
      type: 'positive',
      message: `${targets.length} barang kritis berhasil diproses ke Material Requirement`,
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
</style>
