<template>
  <q-page
    class="work-order-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro"
    :class="{ 'form-workspace-page': showFormDialog }"
  >
    <template v-if="!showFormDialog">
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
            SPK Produksi
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
              Kendali PPIC ke Proses Produksi
            </span>
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Monitoring SPK Produksi dari release PPIC, proses fabrikasi, PIC produksi, status
            pekerjaan, dan kebutuhan material.
          </div>
        </div>

        <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
          <q-btn
            unelevated
            rounded
            color="green-10"
            icon="add_circle"
            label="Buat WO"
            no-caps
            class="q-px-lg shadow-premium"
            @click="openCreateDialog"
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
                placeholder="Cari nomor WO, customer, produk, tahapan, atau PIC..."
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
                label="Filter Status WO"
                bg-color="white"
              />
            </div>

            <div class="col-12 col-md-2">
              <q-select
                v-model="priorityFilter"
                :options="priorityFilterOptions"
                outlined
                dense
                rounded
                emit-value
                map-options
                label="Prioritas"
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
                @click="loadWorkOrders"
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
          class="work-order-table"
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
            <q-tr :props="props" class="work-order-row">
              <q-td key="nomor_wo" :props="props" class="text-weight-bolder text-green-10">
                {{ props.row.nomor_wo }}
                <div class="text-caption text-grey-6">{{ formatDate(props.row.deadline) }}</div>
              </q-td>
              <q-td key="produk" :props="props">
                <div class="text-weight-bold text-green-10">{{ props.row.produk }}</div>
                <div class="text-caption text-grey-6">{{ props.row.customer }}</div>
              </q-td>
              <q-td key="qty_target" :props="props" class="text-right text-weight-bold">
                {{ formatNumber(props.row.qty_target) }}
              </q-td>
              <q-td key="line_produksi" :props="props">
                {{ props.row.tahapan_fabrikasi || props.row.line_produksi || '-' }}
              </q-td>
              <q-td key="prioritas" :props="props">
                <q-chip
                  dense
                  square
                  text-color="white"
                  :color="priorityColor(props.row.prioritas)"
                  class="priority-chip"
                >
                  {{ props.row.prioritas }}
                </q-chip>
              </q-td>
              <q-td key="pic_produksi" :props="props">{{ props.row.pic_produksi || '-' }}</q-td>
              <q-td key="material" :props="props">
                <div class="material-cell">
                  <q-linear-progress
                    rounded
                    size="9px"
                    :value="materialReadyRatio(props.row)"
                    :color="materialReadyRatio(props.row) >= 1 ? 'green-10' : 'orange-9'"
                    track-color="green-1"
                  />
                  <div class="text-caption text-grey-7 q-mt-xs">
                    {{ materialReadyCount(props.row) }}/{{ props.row.materials.length }} material
                    siap
                  </div>
                </div>
              </q-td>
              <q-td key="status_wo" :props="props">
                <q-chip
                  dense
                  square
                  text-color="white"
                  :color="statusColor(props.row.status_wo)"
                  class="status-chip"
                >
                  {{ statusLabel(props.row.status_wo) }}
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
                    <q-tooltip>Detail material requirement</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    color="blue-grey-7"
                    icon="edit"
                    @click="openEditDialog(props.row)"
                  >
                    <q-tooltip>Edit Work Order</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>

          <template #no-data>
            <div class="full-width row flex-center text-grey-7 q-pa-xl">
              <q-icon name="description" size="28px" class="q-mr-sm" />
              Belum ada work order.
            </div>
          </template>
        </q-table>
      </q-card>
    </template>

    <template v-else>
      <div class="enterprise-workspace-shell">
        <div class="form-page-header row items-start justify-between q-mb-lg">
          <div class="col">
            <q-btn
              flat
              dense
              color="green-10"
              icon="arrow_back"
              label="Kembali ke Daftar SPK"
              no-caps
              class="q-mb-md"
              @click="closeFormPage"
            />
            <div class="text-h4 text-weight-bolder text-green-10">
              {{ formModeLabel }} SPK Produksi
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-xs form-page-subtitle">
              Lengkapi data SPK untuk release ke produksi.
            </div>
          </div>
          <div class="col-12 col-sm-auto q-mt-md q-mt-sm-none">
            <q-chip color="green-10" text-color="white" icon="description" class="text-weight-bold">
              {{ editingId ? 'EDIT MODE' : 'CREATE MODE' }}
            </q-chip>
          </div>
        </div>

        <q-form class="enterprise-form-shell" @submit.prevent="saveWorkOrder">
          <q-card flat bordered class="enterprise-form-card">
            <q-card-section class="form-section-header">
              <div class="text-h6 text-weight-bold text-green-10">Informasi SPK</div>
              <div class="text-caption text-grey-7">
                Data utama work order, produk, tahapan fabrikasi, prioritas, dan PIC produksi.
              </div>
            </q-card-section>
            <q-separator />
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
                    v-model="form.customer"
                    outlined
                    dense
                    label="Customer"
                    :rules="[(val) => !!val || 'Customer wajib diisi']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.produk_id"
                    :options="produkOptions"
                    outlined
                    dense
                    emit-value
                    map-options
                    option-label="label"
                    option-value="value"
                    label="Produk"
                    :loading="loadingMasterProduk"
                    :rules="[(val) => !!val || 'Produk wajib dipilih']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="form.qty_target"
                    outlined
                    dense
                    type="number"
                    min="1"
                    label="Qty Target"
                    :rules="[(val) => Number(val) > 0 || 'Qty target wajib lebih dari 0']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.deadline"
                    outlined
                    dense
                    type="date"
                    label="Deadline"
                    :rules="[(val) => !!val || 'Deadline wajib diisi']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.tahapan_fabrikasi_id"
                    :options="tahapanOptions"
                    outlined
                    dense
                    emit-value
                    map-options
                    option-label="label"
                    option-value="value"
                    label="Tahapan Fabrikasi"
                    :loading="loadingMasterTahapan"
                    :rules="[(val) => !!val || 'Tahapan fabrikasi wajib dipilih']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.prioritas"
                    :options="priorityOptions"
                    outlined
                    dense
                    label="Prioritas"
                    :rules="[(val) => !!val || 'Prioritas wajib dipilih']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.pic_produksi"
                    outlined
                    dense
                    label="PIC Produksi"
                    :rules="[(val) => !!val || 'PIC produksi wajib diisi']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.status_wo"
                    :options="statusOptions"
                    outlined
                    dense
                    emit-value
                    map-options
                    label="Status WO"
                    :rules="[(val) => !!val || 'Status WO wajib dipilih']"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="enterprise-form-card q-mt-lg">
            <q-card-section class="row items-center justify-between form-section-header">
              <div>
                <div class="text-subtitle1 text-weight-bold text-green-10">
                  Detail Material Requirement
                </div>
                <div class="text-caption text-grey-7">
                  Kebutuhan material untuk menjaga kesiapan WO sebelum produksi.
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
            </q-card-section>

            <q-separator />
            <q-card-section class="q-pa-lg">
              <div class="material-form-list">
                <div
                  v-for="(material, index) in form.materials"
                  :key="index"
                  class="material-form-row"
                >
                  <div class="row q-col-gutter-sm items-start">
                    <div class="col-12 col-md-4">
                      <q-input v-model="material.nama" outlined dense label="Material" />
                    </div>
                    <div class="col-6 col-md-2">
                      <q-input
                        v-model.number="material.qty"
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
                    <div class="col-12 col-md-3">
                      <q-select
                        v-model="material.status"
                        :options="materialStatusOptions"
                        outlined
                        dense
                        label="Status Material"
                      />
                    </div>
                    <div class="col-12 col-md-1 text-right">
                      <q-btn
                        flat
                        round
                        dense
                        color="negative"
                        icon="delete"
                        @click="removeMaterialRow(index)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="form-action-bar q-mt-lg">
            <q-card-section class="row justify-end q-gutter-sm">
              <q-btn flat color="grey-7" label="Batal" no-caps @click="closeFormPage" />
              <q-btn
                unelevated
                color="green-10"
                icon="save"
                label="Simpan WO"
                no-caps
                type="submit"
                :loading="submitting"
              />
            </q-card-section>
          </q-card>
        </q-form>
      </div>
    </template>

    <q-dialog v-model="showDetailDialog">
      <q-card class="detail-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ selectedRow?.nomor_wo }}</div>
            <div class="text-caption">{{ selectedRow?.produk }} - {{ selectedRow?.customer }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-4">
              <div class="detail-label">Status WO</div>
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(selectedRow?.status_wo)"
                class="status-chip q-mt-xs"
              >
                {{ statusLabel(selectedRow?.status_wo) }}
              </q-chip>
            </div>
            <div class="col-12 col-sm-4">
              <div class="detail-label">Tahapan Fabrikasi</div>
              <div class="detail-value">
                {{ selectedRow?.tahapan_fabrikasi || selectedRow?.line_produksi || '-' }}
              </div>
            </div>
            <div class="col-12 col-sm-4">
              <div class="detail-label">PIC Produksi</div>
              <div class="detail-value">{{ selectedRow?.pic_produksi || '-' }}</div>
            </div>
          </div>

          <q-markup-table flat bordered class="material-table">
            <thead class="bg-green-10 text-white">
              <tr>
                <th class="text-left">Material</th>
                <th class="text-right">Qty</th>
                <th class="text-left">Satuan</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(material, index) in selectedRow?.materials || []" :key="index">
                <td class="text-weight-bold">{{ material.nama || '-' }}</td>
                <td class="text-right">{{ formatNumber(material.qty) }}</td>
                <td>{{ material.satuan || '-' }}</td>
                <td class="text-center">
                  <q-chip
                    dense
                    square
                    text-color="white"
                    :color="materialStatusColor(material.status)"
                    class="material-status-chip"
                  >
                    {{ material.status || 'Belum Dicek' }}
                  </q-chip>
                </td>
              </tr>
              <tr v-if="!selectedRow?.materials?.length">
                <td colspan="4" class="text-center text-grey-7 q-pa-lg">
                  Material requirement belum diisi.
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'work_order_manufaktur'
const MASTER_MATERIAL_COLLECTION = 'master_material'
const WORKSPACE_BODY_CLASS = 'manufacturing-work-order-form-workspace'
const statusOptions = [
  { label: 'DRAFT', value: 'DRAFT' },
  { label: 'RELEASED', value: 'RELEASED' },
  { label: 'ON PRODUCTION', value: 'ON_PRODUCTION' },
  { label: 'QC PROCESS', value: 'QC_PROCESS' },
  { label: 'FINISHED', value: 'FINISHED' },
  { label: 'CLOSED', value: 'CLOSED' },
]
const statusFilterOptions = [{ label: 'Semua Status', value: 'all' }, ...statusOptions]
const priorityOptions = ['Low', 'Normal', 'High', 'Urgent']
const priorityFilterOptions = [
  { label: 'Semua Prioritas', value: 'all' },
  ...priorityOptions.map((priority) => ({ label: priority, value: priority })),
]
const materialStatusOptions = ['Belum Dicek', 'Ready', 'Parsial', 'Kurang']

const $q = useQuasar()
const rows = ref([])
const masterProduk = ref([])
const masterTahapan = ref([])
const loading = ref(false)
const loadingMasterProduk = ref(true)
const loadingMasterTahapan = ref(true)
const submitting = ref(false)
const search = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const showFormDialog = ref(false)
const showDetailDialog = ref(false)
const selectedRow = ref(null)
const editingId = ref(null)
let unsubscribeWorkOrders = null
let unsubscribeMasterProduk = null
let unsubscribeMasterTahapan = null

const defaultForm = () => ({
  nomor_wo: generateWorkOrderNumber(),
  customer: '',
  produk_id: '',
  produk: '',
  kode_produk: '',
  kategori_produk: '',
  jenis_fabrikasi: '',
  satuan_produk: '',
  qty_target: null,
  deadline: '',
  line_produksi: '',
  tahapan_fabrikasi_id: '',
  tahapan_fabrikasi: '',
  prioritas: 'Normal',
  pic_produksi: '',
  status_wo: 'DRAFT',
  materials: [],
})

const form = ref(defaultForm())

const columns = [
  { name: 'nomor_wo', align: 'left', label: 'Nomor WO', field: 'nomor_wo', sortable: true },
  { name: 'produk', align: 'left', label: 'Produk / Customer', field: 'produk', sortable: true },
  { name: 'qty_target', align: 'right', label: 'Qty Target', field: 'qty_target', sortable: true },
  { name: 'line_produksi', align: 'left', label: 'Tahapan Fabrikasi', field: 'line_produksi' },
  { name: 'prioritas', align: 'center', label: 'Prioritas', field: 'prioritas', sortable: true },
  { name: 'pic_produksi', align: 'left', label: 'PIC Produksi', field: 'pic_produksi' },
  { name: 'material', align: 'left', label: 'Material Requirement' },
  { name: 'status_wo', align: 'center', label: 'Status WO', field: 'status_wo', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status_wo === statusFilter.value
    const matchesPriority = priorityFilter.value === 'all' || row.prioritas === priorityFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_wo,
        row.customer,
        row.produk,
        row.tahapan_fabrikasi,
        row.line_produksi,
        row.prioritas,
        row.pic_produksi,
        row.status_wo,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesPriority && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Total SPK',
    value: rows.value.length,
    icon: 'description',
    color: 'green-10',
  },
  {
    title: 'Released',
    value: rows.value.filter((row) => row.status_wo === 'RELEASED').length,
    icon: 'assignment_turned_in',
    color: 'blue-grey-7',
  },
  {
    title: 'On Production',
    value: rows.value.filter((row) => row.status_wo === 'ON_PRODUCTION').length,
    icon: 'precision_manufacturing',
    color: 'orange-9',
  },
  {
    title: 'QC Process',
    value: rows.value.filter((row) => row.status_wo === 'QC_PROCESS').length,
    icon: 'fact_check',
    color: 'deep-purple-6',
  },
  {
    title: 'Finished',
    value: rows.value.filter((row) => ['FINISHED', 'CLOSED'].includes(row.status_wo)).length,
    icon: 'verified',
    color: 'positive',
  },
])

const formModeLabel = computed(() => (editingId.value ? 'Edit' : 'Buat'))

watch(showFormDialog, (isOpen) => {
  document.body.classList.toggle(WORKSPACE_BODY_CLASS, isOpen)
})

const produkOptions = computed(() =>
  masterProduk.value.map((item) => ({
    label: `${item.kode_produk ? `${item.kode_produk} - ` : ''}${item.nama_produk}`,
    value: item.id,
    item,
  })),
)

const selectedProduk = computed(
  () => produkOptions.value.find((option) => option.value === form.value.produk_id)?.item,
)

const tahapanOptions = computed(() =>
  masterTahapan.value.map((item) => ({
    label: `${item.urutan ? `${item.urutan}. ` : ''}${item.nama_tahapan}`,
    value: item.id,
    item,
  })),
)

const selectedTahapan = computed(
  () =>
    tahapanOptions.value.find((option) => option.value === form.value.tahapan_fabrikasi_id)?.item,
)

function generateWorkOrderNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const suffix = String(Date.now()).slice(-4)
  return `WO-${year}${month}${day}-${suffix}`
}

const normalizeMaterials = (materials) =>
  (materials || [])
    .map((material) => ({
      nama: material.nama || '',
      qty: Number(material.qty || 0),
      satuan: material.satuan || '',
      status: material.status || 'Belum Dicek',
    }))
    .filter((material) => material.nama || material.qty || material.satuan)

const normalizeMaterialKey = (value) => String(value || '').trim().toLowerCase()

const findMasterMaterial = (material, masterMaterials) => {
  const key = normalizeMaterialKey(material.nama)
  if (!key) return null

  return masterMaterials.find(
    (item) =>
      normalizeMaterialKey(item.id) === key ||
      normalizeMaterialKey(item.kode_material) === key ||
      normalizeMaterialKey(item.nama_material) === key,
  )
}

const buildMaterialAllocations = async (materials) => {
  const requestedMaterials = materials.filter((material) => Number(material.qty || 0) > 0)
  if (!requestedMaterials.length) return []

  const materialSnapshot = await getDocs(
    query(collection(db, MASTER_MATERIAL_COLLECTION), orderBy('nama_material', 'asc')),
  )
  const masterMaterials = materialSnapshot.docs.map((materialDoc) => ({
    id: materialDoc.id,
    ...materialDoc.data(),
  }))

  const allocationMap = new Map()
  requestedMaterials.forEach((material) => {
    const masterMaterial = findMasterMaterial(material, masterMaterials)
    if (!masterMaterial) {
      throw new Error(`Material "${material.nama}" tidak ditemukan di master material.`)
    }

    const qty = Number(material.qty || 0)
    const existing = allocationMap.get(masterMaterial.id)
    if (existing) {
      existing.qty += qty
      return
    }

    allocationMap.set(masterMaterial.id, {
      ref: doc(db, MASTER_MATERIAL_COLLECTION, masterMaterial.id),
      id: masterMaterial.id,
      nama: masterMaterial.nama_material || material.nama,
      qty,
      stokFisik: Number(masterMaterial.stok_fisik || 0),
      stokTerpesan: Number(masterMaterial.stok_terpesan || 0),
    })
  })

  return Array.from(allocationMap.values()).map((allocation) => {
    const stokTersedia = allocation.stokFisik - allocation.stokTerpesan
    if (stokTersedia < allocation.qty) {
      throw new Error(
        `Stok tersedia ${allocation.nama} tidak cukup. Tersedia ${formatNumber(stokTersedia)}, dibutuhkan ${formatNumber(allocation.qty)}.`,
      )
    }

    return {
      ...allocation,
      stokTersedia,
    }
  })
}

const reserveMasterMaterialStock = async (materials) => {
  const allocations = await buildMaterialAllocations(materials)

  await Promise.all(
    allocations.map((allocation) =>
      updateDoc(allocation.ref, {
        stok_terpesan: increment(allocation.qty),
        stok_tersedia: increment(-allocation.qty),
        updated_at: serverTimestamp(),
      }),
    ),
  )
}

const statusLabel = (status) => {
  const option = statusOptions.find((item) => item.value === status)
  return option?.label || status || '-'
}

const statusColor = (status) => {
  const colors = {
    DRAFT: 'grey-7',
    RELEASED: 'blue-grey-7',
    ON_PRODUCTION: 'orange-9',
    QC_PROCESS: 'deep-purple-6',
    FINISHED: 'green-10',
    CLOSED: 'positive',
  }
  return colors[status] || 'grey-6'
}

const priorityColor = (priority) => {
  const colors = {
    Low: 'blue-grey-5',
    Normal: 'green-8',
    High: 'orange-9',
    Urgent: 'negative',
  }
  return colors[priority] || 'grey-6'
}

const materialStatusColor = (status) => {
  const colors = {
    Ready: 'green-10',
    Parsial: 'orange-9',
    Kurang: 'negative',
    'Belum Dicek': 'blue-grey-6',
  }
  return colors[status] || 'grey-6'
}

const materialReadyCount = (row) =>
  (row.materials || []).filter((material) => material.status === 'Ready').length

const materialReadyRatio = (row) => {
  const total = row.materials?.length || 0
  if (!total) return 0
  return materialReadyCount(row) / total
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const openCreateDialog = () => {
  editingId.value = null
  form.value = defaultForm()
  showFormDialog.value = true
}

const openEditDialog = (row) => {
  const matchedProduk = produkOptions.value.find(
    (option) =>
      option.value === row.produk_id ||
      option.item?.nama_produk?.toLowerCase() === row.produk?.toLowerCase() ||
      option.item?.kode_produk?.toLowerCase() === row.kode_produk?.toLowerCase(),
  )

  editingId.value = row.id
  form.value = {
    nomor_wo: row.nomor_wo || '',
    customer: row.customer || '',
    produk_id: matchedProduk?.value || row.produk_id || '',
    produk: matchedProduk?.item?.nama_produk || row.produk || '',
    kode_produk: matchedProduk?.item?.kode_produk || row.kode_produk || '',
    kategori_produk: matchedProduk?.item?.kategori_produk || row.kategori_produk || '',
    jenis_fabrikasi: matchedProduk?.item?.jenis_fabrikasi || row.jenis_fabrikasi || '',
    satuan_produk: matchedProduk?.item?.satuan || row.satuan_produk || '',
    qty_target: Number(row.qty_target || 0),
    deadline: row.deadline || '',
    line_produksi: row.line_produksi || '',
    tahapan_fabrikasi_id: row.tahapan_fabrikasi_id || '',
    tahapan_fabrikasi: row.tahapan_fabrikasi || '',
    prioritas: row.prioritas || 'Normal',
    pic_produksi: row.pic_produksi || '',
    status_wo: row.status_wo || 'DRAFT',
    materials: row.materials?.length ? row.materials.map((material) => ({ ...material })) : [],
  }
  showFormDialog.value = true
}

const openDetailDialog = (row) => {
  selectedRow.value = row
  showDetailDialog.value = true
}

const closeFormPage = () => {
  showFormDialog.value = false
  editingId.value = null
  form.value = defaultForm()
}

const addMaterialRow = () => {
  form.value.materials.push({ nama: '', qty: null, satuan: 'pcs', status: 'Belum Dicek' })
}

const removeMaterialRow = (index) => {
  form.value.materials.splice(index, 1)
}

const saveWorkOrder = async () => {
  submitting.value = true
  try {
    const payload = {
      ...form.value,
      produk_id: form.value.produk_id,
      produk: selectedProduk.value?.nama_produk || form.value.produk,
      kode_produk: selectedProduk.value?.kode_produk || form.value.kode_produk || '',
      kategori_produk: selectedProduk.value?.kategori_produk || form.value.kategori_produk || '',
      jenis_fabrikasi: selectedProduk.value?.jenis_fabrikasi || form.value.jenis_fabrikasi || '',
      satuan_produk: selectedProduk.value?.satuan || form.value.satuan_produk || '',
      qty_target: Number(form.value.qty_target || 0),
      line_produksi: selectedTahapan.value?.nama_tahapan || form.value.line_produksi,
      tahapan_fabrikasi_id: form.value.tahapan_fabrikasi_id,
      tahapan_fabrikasi: selectedTahapan.value?.nama_tahapan || form.value.tahapan_fabrikasi,
      urutan_tahapan: Number(selectedTahapan.value?.urutan || form.value.urutan_tahapan || 0),
      materials: normalizeMaterials(form.value.materials),
      updated_at: serverTimestamp(),
    }

    if (editingId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, editingId.value), payload)
      $q.notify({ type: 'positive', message: 'Work order berhasil diperbarui' })
    } else {
      await reserveMasterMaterialStock(payload.materials)
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'Work order berhasil dibuat' })
    }

    showFormDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.message || 'Gagal menyimpan work order' })
  } finally {
    submitting.value = false
  }
}

const loadWorkOrders = () => {
  loading.value = true
  if (unsubscribeWorkOrders) unsubscribeWorkOrders()

  const workOrderQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeWorkOrders = onSnapshot(
    workOrderQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((workOrderDoc) => ({
        id: workOrderDoc.id,
        materials: [],
        ...workOrderDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat work order' })
    },
  )
}

const loadMasterProduk = () => {
  loadingMasterProduk.value = true
  if (unsubscribeMasterProduk) unsubscribeMasterProduk()

  unsubscribeMasterProduk = onSnapshot(
    query(collection(db, 'master_produk'), orderBy('nama_produk', 'asc')),
    (snapshot) => {
      masterProduk.value = snapshot.docs
        .map((produkDoc) => ({ id: produkDoc.id, ...produkDoc.data() }))
        .filter((item) => item.status !== 'Nonaktif')
      loadingMasterProduk.value = false
    },
    (error) => {
      console.error(error)
      loadingMasterProduk.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat master produk' })
    },
  )
}

const loadMasterTahapan = () => {
  loadingMasterTahapan.value = true
  unsubscribeMasterTahapan = onSnapshot(
    query(collection(db, 'master_tahapan_fabrikasi'), orderBy('urutan', 'asc')),
    (snapshot) => {
      masterTahapan.value = snapshot.docs
        .map((tahapanDoc) => ({ id: tahapanDoc.id, ...tahapanDoc.data() }))
        .filter((item) => item.status !== 'Nonaktif')
      loadingMasterTahapan.value = false
    },
    (error) => {
      console.error(error)
      loadingMasterTahapan.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat master tahapan fabrikasi' })
    },
  )
}

onMounted(() => {
  loadWorkOrders()
  loadMasterProduk()
  loadMasterTahapan()
})

onUnmounted(() => {
  document.body.classList.remove(WORKSPACE_BODY_CLASS)
  if (unsubscribeWorkOrders) unsubscribeWorkOrders()
  if (unsubscribeMasterProduk) unsubscribeMasterProduk()
  if (unsubscribeMasterTahapan) unsubscribeMasterTahapan()
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

.form-workspace-page {
  min-height: calc(100vh - 66px);
  padding: 24px 32px 32px !important;
}

.enterprise-workspace-shell {
  width: min(100%, 1680px);
  margin: 0 auto;
}

.form-page-header {
  background: #ffffff;
  border: 1px solid #dfe8df;
  border-radius: 8px;
  padding: 22px 24px;
}

.form-page-subtitle {
  max-width: 920px;
}

.enterprise-form-shell {
  width: 100%;
}

.enterprise-form-card,
.form-action-bar {
  background: #ffffff;
  border-color: #dfe8df;
  border-radius: 8px;
  box-shadow: 0 16px 38px rgba(15, 60, 45, 0.06);
}

.form-section-header {
  background: #f8fbf8;
  padding: 18px 24px;
}

.summary-card,
.filter-card,
.table-card,
.work-order-dialog,
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

.work-order-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.work-order-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.work-order-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.material-cell {
  min-width: 170px;
}

.status-chip,
.priority-chip,
.material-status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  justify-content: center;
}

.status-chip {
  min-width: 118px;
}

.priority-chip {
  min-width: 72px;
}

.material-status-chip {
  min-width: 88px;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.work-order-dialog {
  max-width: 95vw;
  width: 920px;
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

:global(body.manufacturing-work-order-form-workspace .app-layout--manufacture .sidebar-drawer),
:global(body.manufacturing-work-order-form-workspace .app-layout--manufacture .q-drawer),
:global(body.manufacturing-work-order-form-workspace .app-layout--manufacture .q-drawer__backdrop) {
  display: none !important;
}

:global(body.manufacturing-work-order-form-workspace .app-layout--manufacture .q-page-container) {
  padding-left: 0 !important;
  margin-left: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
}

:global(body.manufacturing-work-order-form-workspace .app-layout--manufacture .q-header) {
  left: 0 !important;
  width: 100vw !important;
}

@media (max-width: 700px) {
  .form-workspace-page {
    padding: 16px !important;
  }

  .form-page-header {
    padding: 18px;
  }
}
</style>
