<template>
  <q-page class="bom-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Bill Of Material
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Komposisi Material Produk
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Kelola struktur material produksi berdasarkan kode BOM, versi, kebutuhan material, waste,
          dan status dokumen.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Tambah BOM"
          no-caps
          class="q-px-lg shadow-premium"
          @click="openCreateDialog"
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
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari kode BOM, produk, versi, atau material..."
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
              label="Filter Status BOM"
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
              @click="loadBom"
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
        class="bom-table"
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
          <q-tr :props="props" class="bom-row">
            <q-td key="kode_bom" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.kode_bom }}
              <div class="text-caption text-grey-6">{{ props.row.versi_bom }}</div>
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk }}</div>
              <div class="text-caption text-grey-6">
                {{ props.row.materials.length }} material
              </div>
            </q-td>
            <q-td key="material" :props="props">
              <div class="material-preview">
                <q-chip
                  v-for="material in props.row.materials.slice(0, 2)"
                  :key="materialKey(material)"
                  dense
                  square
                  color="green-1"
                  text-color="green-10"
                  class="material-chip"
                >
                  {{ material.material }}
                </q-chip>
                <q-chip
                  v-if="props.row.materials.length > 2"
                  dense
                  square
                  color="blue-grey-1"
                  text-color="blue-grey-8"
                  class="material-chip"
                >
                  +{{ props.row.materials.length - 2 }}
                </q-chip>
              </div>
            </q-td>
            <q-td key="total_material" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(totalMaterial(props.row.materials)) }}
            </q-td>
            <q-td key="avg_waste" :props="props" class="text-right text-weight-bold">
              {{ averageWaste(props.row.materials) }}%
            </q-td>
            <q-td key="status_bom" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status_bom)"
                class="status-chip"
              >
                {{ props.row.status_bom }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props" class="text-center">
              <div class="row justify-center q-gutter-xs no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  color="green-10"
                  icon="visibility"
                  @click="openDetailDialog(props.row)"
                >
                  <q-tooltip>Detail material produk</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="blue-grey-7"
                  icon="edit"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>Edit BOM</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory" size="28px" class="q-mr-sm" />
            Belum ada Bill Of Material.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showFormDialog" persistent>
      <q-card class="bom-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ formModeLabel }} Bill Of Material</div>
            <div class="text-caption">Tambahkan multi material untuk komposisi produk.</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveBom">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.kode_bom"
                  outlined
                  dense
                  label="Kode BOM"
                  :rules="[(val) => !!val || 'Kode BOM wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-5">
                <q-input
                  v-model="form.nama_produk"
                  outlined
                  dense
                  label="Nama Produk"
                  :rules="[(val) => !!val || 'Nama produk wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.versi_bom"
                  outlined
                  dense
                  label="Versi BOM"
                  :rules="[(val) => !!val || 'Versi BOM wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.status_bom"
                  :options="statusOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="Status BOM"
                  :rules="[(val) => !!val || 'Status BOM wajib dipilih']"
                />
              </div>
              <div class="col-12 col-md-8">
                <q-banner rounded class="bg-green-1 text-green-10">
                  <template #avatar>
                    <q-icon name="calculate" />
                  </template>
                  Total material: {{ formatNumber(formTotalMaterial) }} dari
                  {{ form.materials.length }} baris material.
                </q-banner>
              </div>
            </div>

            <q-separator class="q-my-lg" />

            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-subtitle1 text-weight-bold text-green-10">
                  Detail Material Produk
                </div>
                <div class="text-caption text-grey-7">
                  Qty kebutuhan dan waste digunakan sebagai komposisi BOM produksi.
                </div>
              </div>
              <q-btn
                flat
                dense
                color="green-10"
                icon="add"
                label="Tambah Material"
                no-caps
                @click="addMaterialRow"
              />
            </div>

            <div class="material-form-list">
              <div
                v-for="(material, index) in form.materials"
                :key="index"
                class="material-form-row"
              >
                <div class="row q-col-gutter-sm items-start">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="material.material"
                      outlined
                      dense
                      label="Material"
                      :rules="[(val) => !!val || 'Material wajib diisi']"
                    />
                  </div>
                  <div class="col-6 col-md-2">
                    <q-input
                      v-model.number="material.qty_kebutuhan"
                      outlined
                      dense
                      type="number"
                      min="0"
                      label="Qty"
                    />
                  </div>
                  <div class="col-6 col-md-2">
                    <q-input v-model="material.satuan" outlined dense label="Satuan" />
                  </div>
                  <div class="col-8 col-md-3">
                    <q-input
                      v-model.number="material.waste_percent"
                      outlined
                      dense
                      type="number"
                      min="0"
                      max="100"
                      suffix="%"
                      label="Waste"
                    />
                  </div>
                  <div class="col-4 col-md-1 text-right">
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      :disable="form.materials.length === 1"
                      @click="removeMaterialRow(index)"
                    />
                  </div>
                </div>
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
              label="Simpan BOM"
              no-caps
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDetailDialog">
      <q-card class="detail-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ selectedRow?.kode_bom }}</div>
            <div class="text-caption">
              {{ selectedRow?.nama_produk }} - {{ selectedRow?.versi_bom }}
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-4">
              <div class="detail-label">Status BOM</div>
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(selectedRow?.status_bom)"
                class="status-chip q-mt-xs"
              >
                {{ selectedRow?.status_bom || '-' }}
              </q-chip>
            </div>
            <div class="col-12 col-sm-4">
              <div class="detail-label">Total Material</div>
              <div class="detail-value">{{ formatNumber(totalMaterial(selectedRow?.materials)) }}</div>
            </div>
            <div class="col-12 col-sm-4">
              <div class="detail-label">Rata-rata Waste</div>
              <div class="detail-value">{{ averageWaste(selectedRow?.materials) }}%</div>
            </div>
          </div>

          <q-markup-table flat bordered class="material-table">
            <thead class="bg-green-10 text-white">
              <tr>
                <th class="text-left">Material</th>
                <th class="text-right">Qty Kebutuhan</th>
                <th class="text-left">Satuan</th>
                <th class="text-right">Waste %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="material in selectedRow?.materials || []" :key="materialKey(material)">
                <td class="text-weight-bold">{{ material.material || '-' }}</td>
                <td class="text-right">{{ formatNumber(material.qty_kebutuhan) }}</td>
                <td>{{ material.satuan || '-' }}</td>
                <td class="text-right">{{ Number(material.waste_percent || 0) }}%</td>
              </tr>
              <tr v-if="!selectedRow?.materials?.length">
                <td colspan="4" class="text-center text-grey-7 q-pa-lg">
                  Detail material produk belum diisi.
                </td>
              </tr>
            </tbody>
          </q-markup-table>
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

const COLLECTION_NAME = 'bill_of_material_manufaktur'
const statusOptions = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
  { label: 'DRAFT', value: 'DRAFT' },
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
const showDetailDialog = ref(false)
const selectedRow = ref(null)
const editingId = ref(null)
let unsubscribeBom = null

const defaultMaterial = () => ({
  material: '',
  qty_kebutuhan: null,
  satuan: 'pcs',
  waste_percent: 0,
})

const generateBomCode = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const suffix = String(Date.now()).slice(-4)
  return `BOM-${year}${month}-${suffix}`
}

const defaultForm = () => ({
  kode_bom: generateBomCode(),
  nama_produk: '',
  versi_bom: 'V1',
  status_bom: 'DRAFT',
  materials: [defaultMaterial()],
})

const form = ref(defaultForm())

const columns = [
  { name: 'kode_bom', align: 'left', label: 'Kode BOM', field: 'kode_bom', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'material', align: 'left', label: 'Material' },
  { name: 'total_material', align: 'right', label: 'Total Material', sortable: true },
  { name: 'avg_waste', align: 'right', label: 'Avg Waste', sortable: true },
  { name: 'status_bom', align: 'center', label: 'Status BOM', field: 'status_bom', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const normalizedRows = computed(() =>
  rows.value.map((row) => ({
    ...row,
    materials: normalizeMaterials(row.materials),
  })),
)

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return normalizedRows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status_bom === statusFilter.value
    const materialText = row.materials.map((material) => material.material).join(' ')
    const matchesSearch =
      !keyword ||
      [row.kode_bom, row.nama_produk, row.versi_bom, row.status_bom, materialText]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Total BOM',
    value: rows.value.length,
    icon: 'inventory',
    color: 'green-10',
  },
  {
    title: 'Active',
    value: rows.value.filter((row) => row.status_bom === 'ACTIVE').length,
    icon: 'verified',
    color: 'positive',
  },
  {
    title: 'Draft',
    value: rows.value.filter((row) => row.status_bom === 'DRAFT').length,
    icon: 'edit_note',
    color: 'orange-9',
  },
  {
    title: 'Material Lines',
    value: rows.value.reduce((sum, row) => sum + normalizeMaterials(row.materials).length, 0),
    icon: 'format_list_bulleted',
    color: 'blue-grey-7',
  },
])

const formModeLabel = computed(() => (editingId.value ? 'Edit' : 'Tambah'))

const formTotalMaterial = computed(() => totalMaterial(form.value.materials))

function normalizeMaterials(materials) {
  return (materials || [])
    .map((material) => ({
      material: material.material || '',
      qty_kebutuhan: Number(material.qty_kebutuhan || 0),
      satuan: material.satuan || '',
      waste_percent: Number(material.waste_percent || 0),
    }))
    .filter((material) => material.material || material.qty_kebutuhan || material.satuan)
}

const totalMaterial = (materials) =>
  normalizeMaterials(materials).reduce((sum, material) => sum + Number(material.qty_kebutuhan || 0), 0)

const averageWaste = (materials) => {
  const items = normalizeMaterials(materials)
  if (!items.length) return 0
  const totalWaste = items.reduce((sum, material) => sum + Number(material.waste_percent || 0), 0)
  return Number((totalWaste / items.length).toFixed(2))
}

const materialKey = (material) =>
  `${material.material || 'material'}-${material.satuan || 'unit'}-${material.qty_kebutuhan || 0}`

const statusColor = (status) => {
  const colors = {
    ACTIVE: 'green-10',
    INACTIVE: 'blue-grey-6',
    DRAFT: 'orange-9',
  }
  return colors[status] || 'grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const openCreateDialog = () => {
  editingId.value = null
  form.value = defaultForm()
  showFormDialog.value = true
}

const openEditDialog = (row) => {
  editingId.value = row.id
  form.value = {
    kode_bom: row.kode_bom || '',
    nama_produk: row.nama_produk || '',
    versi_bom: row.versi_bom || 'V1',
    status_bom: row.status_bom || 'DRAFT',
    materials: normalizeMaterials(row.materials).length ? normalizeMaterials(row.materials) : [defaultMaterial()],
  }
  showFormDialog.value = true
}

const openDetailDialog = (row) => {
  selectedRow.value = row
  showDetailDialog.value = true
}

const addMaterialRow = () => {
  form.value.materials.push(defaultMaterial())
}

const removeMaterialRow = (index) => {
  form.value.materials.splice(index, 1)
}

const buildPayload = () => ({
  kode_bom: form.value.kode_bom,
  nama_produk: form.value.nama_produk,
  versi_bom: form.value.versi_bom,
  status_bom: form.value.status_bom,
  materials: normalizeMaterials(form.value.materials),
  total_material: formTotalMaterial.value,
  average_waste: averageWaste(form.value.materials),
  updated_at: serverTimestamp(),
})

const saveBom = async () => {
  submitting.value = true
  try {
    const payload = buildPayload()

    if (editingId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, editingId.value), payload)
      $q.notify({ type: 'positive', message: 'Bill Of Material berhasil diperbarui' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'Bill Of Material berhasil dibuat' })
    }

    showFormDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan Bill Of Material' })
  } finally {
    submitting.value = false
  }
}

const loadBom = () => {
  loading.value = true
  if (unsubscribeBom) unsubscribeBom()

  const bomQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeBom = onSnapshot(
    bomQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((bomDoc) => ({
        id: bomDoc.id,
        materials: [],
        ...bomDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat Bill Of Material' })
    },
  )
}

onMounted(loadBom)

onUnmounted(() => {
  if (unsubscribeBom) unsubscribeBom()
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
.bom-dialog,
.detail-dialog {
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

.bom-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.bom-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.bom-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.material-preview {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 180px;
}

.material-chip,
.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.status-chip {
  justify-content: center;
  min-width: 88px;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.bom-dialog {
  max-width: 95vw;
  width: 940px;
}

.detail-dialog {
  max-width: 95vw;
  width: 760px;
}

.material-form-list {
  display: grid;
  gap: 10px;
}

.material-form-row {
  background: #f8fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  padding: 12px;
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
  font-size: 16px;
  font-weight: 800;
  margin-top: 4px;
}

.material-table {
  border-color: #dfe8df;
  border-radius: 12px;
  overflow: hidden;
}
</style>
