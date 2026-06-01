<template>
  <q-page class="planning-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Planning Produksi
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Planning produksi dari approved quotation ke departemen manufacturing
          </span>
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Tambah Planning"
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
          <div class="col-12 col-md-5">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari planning, approved quotation, customer, produk, atau departemen..."
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

          <div class="col-12 col-md-3">
            <q-select
              v-model="priorityFilter"
              :options="priorityFilterOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Filter Prioritas"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-md-1">
            <q-btn
              outline
              rounded
              color="green-10"
              icon="refresh"
              class="full-width"
              @click="resetFilter"
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
        class="planning-table"
      >
        <template #top v-if="errorMessage">
          <q-banner rounded class="full-width bg-red-1 text-negative">
            <template #avatar>
              <q-icon name="error" />
            </template>
            {{ errorMessage }}
          </q-banner>
        </template>

        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="planning-row">
            <q-td key="no_planning" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_planning || props.row.no_planning }}
              <div class="text-caption text-grey-6">
                {{ props.row.nomor_approved || props.row.nomor_spk || '-' }}
              </div>
            </q-td>

            <q-td key="nomor_approved" :props="props" class="text-weight-bold">
              {{ props.row.nomor_approved || props.row.nomor_spk || '-' }}
            </q-td>

            <q-td key="customer" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.customer_nama || props.row.customer || '-' }}</div>
            </q-td>

            <q-td key="produk" :props="props">
              <div>{{ props.row.nama_produk || props.row.item_produksi || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.kode_produk || '-' }}</div>
            </q-td>

            <q-td key="qty_target" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.qty_target || props.row.qty) }} {{ props.row.satuan }}
            </q-td>

            <q-td key="departemen" :props="props">
              {{ formatDepartemenRoute(props.row) }}
            </q-td>

            <q-td key="deadline" :props="props">
              {{ formatDate(props.row.deadline) }}
            </q-td>

            <q-td key="prioritas" :props="props">
              <q-badge :color="priorityColor(props.row.prioritas)" class="status-badge">
                {{ props.row.prioritas }}
              </q-badge>
            </q-td>

            <q-td key="status_planning" :props="props">
              <q-badge :color="statusColor(props.row.status_planning || props.row.status)" class="status-badge">
                {{ props.row.status_planning || props.row.status }}
              </q-badge>
            </q-td>

            <q-td key="action" :props="props" class="text-center">
              <div class="row justify-center q-gutter-xs no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  color="green-10"
                  icon="visibility"
                  @click="openDetailDialog(props.row)"
                >
                  <q-tooltip>Detail</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="blue-grey-7"
                  icon="edit"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="event_note" size="28px" class="q-mr-sm" />
            Belum ada planning produksi.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="formDialog" persistent maximized transition-show="fade" transition-hide="fade">
      <q-card class="planning-dialog">
        <q-card-section class="dialog-header row items-center justify-between bg-green-10 text-white">
          <div>
            <div class="text-h6 text-weight-bold">{{ formTitle }}</div>
            <div class="text-caption">Data planning tersinkron realtime ke departemen tujuan.</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form class="planning-dialog-form" @submit.prevent="savePlanning">
          <q-card-section class="planning-dialog-body">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.no_planning"
                  outlined
                  dense
                  readonly
                  label="Nomor Planning"
                  :rules="[(val) => !!val || 'No planning wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.approved_obj"
                  :options="approvedOptions"
                  outlined
                  dense
                  use-input
                  input-debounce="200"
                  label="Nomor Approved"
                  :loading="loadingApproved"
                  :rules="[(val) => !!val || 'Nomor approved wajib dipilih']"
                  @filter="filterApproved"
                  @update:model-value="handleApprovedSelected"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.status_planning"
                  :options="statusOptions"
                  outlined
                  dense
                  label="Status Planning"
                  :rules="[(val) => !!val || 'Status wajib dipilih']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.customer_nama"
                  outlined
                  dense
                  readonly
                  label="Customer"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.departemen_obj"
                  :options="departemenOptions"
                  outlined
                  dense
                  multiple
                  use-chips
                  label="Departemen Tujuan / Routing Produksi"
                  :loading="loadingDepartemen"
                  :rules="[(val) => (Array.isArray(val) ? val.length > 0 : !!val) || 'Departemen tujuan wajib dipilih']"
                  @update:model-value="handleDepartemenSelected"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nama_produk"
                  outlined
                  dense
                  readonly
                  label="Produk"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.qty_target"
                  outlined
                  dense
                  type="number"
                  min="0"
                  readonly
                  label="Qty Target"
                  :rules="[(val) => Number(val) > 0 || 'Qty wajib lebih dari 0']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.satuan" outlined dense readonly label="Satuan" />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.deadline" outlined dense type="date" label="Deadline" />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.prioritas"
                  :options="priorityOptions"
                  outlined
                  dense
                  readonly
                  label="Prioritas"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.catatan"
                  outlined
                  dense
                  type="textarea"
                  label="Catatan"
                  autogrow
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="dialog-footer bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
            <q-btn
              unelevated
              rounded
              color="green-10"
              icon="save"
              label="Simpan"
              no-caps
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="detailDialog">
      <q-card class="detail-dialog">
        <q-card-section class="row items-center justify-between bg-green-10 text-white">
          <div>
            <div class="text-h6 text-weight-bold">Detail Planning Produksi</div>
            <div class="text-caption">{{ selectedRow?.no_planning }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedRow" class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="detail-label">Nomor Approved</div>
              <div class="detail-value">{{ selectedRow.nomor_approved || selectedRow.nomor_spk || '-' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Departemen Tujuan</div>
              <div class="detail-value">{{ formatDepartemenRoute(selectedRow) }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Customer</div>
              <div class="detail-value">{{ selectedRow.customer_nama || selectedRow.customer || '-' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Produk</div>
              <div class="detail-value">{{ selectedRow.nama_produk || selectedRow.item_produksi || '-' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Qty Target</div>
              <div class="detail-value">
                {{ formatNumber(selectedRow.qty_target || selectedRow.qty) }} {{ selectedRow.satuan }}
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Deadline</div>
              <div class="detail-value">{{ formatDate(selectedRow.deadline) }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Prioritas</div>
              <q-badge :color="priorityColor(selectedRow.prioritas)" class="status-badge">
                {{ selectedRow.prioritas }}
              </q-badge>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Status Planning</div>
              <q-badge :color="statusColor(selectedRow.status_planning || selectedRow.status)" class="status-badge">
                {{ selectedRow.status_planning || selectedRow.status }}
              </q-badge>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="detail-label q-mb-sm">Catatan PPIC</div>
          <div class="note-box">{{ selectedRow.catatan || '-' }}</div>
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
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const PLANNING_COLLECTION = 'planning_produksi_manufaktur'
const APPROVAL_QUOTATION_COLLECTION = 'manufacturing_approval_quotation'
const MASTER_PRODUK_COLLECTION = 'master_produk'
const MASTER_DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'

const search = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const formDialog = ref(false)
const detailDialog = ref(false)
const selectedRow = ref(null)
const editingId = ref(null)
const rows = ref([])
const departemenRows = ref([])
const approvedRows = ref([])
const produkRows = ref([])
const filteredApprovedOptions = ref([])
const loading = ref(true)
const loadingDepartemen = ref(true)
const loadingApproved = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
let unsubscribePlanning = null
let unsubscribeDepartemen = null
let unsubscribeApproved = null
let unsubscribeProduk = null

const statusOptions = ['Draft', 'Scheduled', 'On Progress', 'Selesai']
const priorityOptions = ['High', 'Medium', 'Low']

const planningCollection = collection(db, PLANNING_COLLECTION)

const listenPlanningProduksi = (callback, errorCallback) =>
  onSnapshot(
    query(planningCollection, orderBy('created_at', 'desc')),
    (snapshot) =>
      callback(snapshot.docs.map((planningDoc) => ({ id: planningDoc.id, ...planningDoc.data() }))),
    errorCallback,
  )

const createPlanningProduksi = (payload) =>
  addDoc(planningCollection, {
    ...payload,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

const updatePlanningProduksi = (id, payload) =>
  updateDoc(doc(db, PLANNING_COLLECTION, id), {
    ...payload,
    updated_at: serverTimestamp(),
  })

const deletePlanningProduksi = (id) => deleteDoc(doc(db, PLANNING_COLLECTION, id))

const mapDepartemen = (departemenDoc) => {
  const data = departemenDoc.data()
  return {
    id: departemenDoc.id,
    value: departemenDoc.id,
    label: `${data.nama_departemen || departemenDoc.id}${data.kode_departemen ? ` - ${data.kode_departemen}` : ''}`,
    ...data,
  }
}

const listenMasterDepartemen = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, MASTER_DEPARTEMEN_COLLECTION), orderBy('nama_departemen', 'asc')),
    (snapshot) =>
      callback(
        snapshot.docs
          .map(mapDepartemen)
          .filter((item) => String(item.status || 'Aktif').toLowerCase() !== 'nonaktif'),
      ),
    errorCallback,
  )

const listenApprovedQuotations = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, APPROVAL_QUOTATION_COLLECTION), where('status', '==', 'Approved')),
    (snapshot) =>
      callback(
        snapshot.docs.map((approvalDoc) => ({
          id: approvalDoc.id,
          ...approvalDoc.data(),
        })),
      ),
    errorCallback,
  )

const listenMasterProduk = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, MASTER_PRODUK_COLLECTION), orderBy('nama_produk', 'asc')),
    (snapshot) =>
      callback(
        snapshot.docs
          .map((produkDoc) => ({ id: produkDoc.id, value: produkDoc.id, ...produkDoc.data() }))
          .filter((item) => String(item.status || 'Aktif').toLowerCase() !== 'nonaktif'),
      ),
    errorCallback,
  )

const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const priorityFilterOptions = [
  { label: 'Semua Prioritas', value: 'all' },
  ...priorityOptions.map((priority) => ({ label: priority, value: priority })),
]

const generatePlanningNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const countThisMonth = rows.value.filter((row) =>
    String(row.no_planning || row.nomor_planning || '').includes(`PLN-MFG/${year}${month}`),
  ).length
  return `PLN-MFG/${year}${month}/${String(countThisMonth + 1).padStart(4, '0')}`
}

const defaultForm = () => ({
  no_planning: generatePlanningNumber(),
  nomor_planning: generatePlanningNumber(),
  approved_obj: null,
  approved_id: '',
  nomor_approved: '',
  quotation_id: '',
  spk_id: '',
  nomor_spk: '',
  no_so: '',
  project: '',
  customer: '',
  customer_id: '',
  customer_nama: '',
  item_produksi: '',
  produk_id: '',
  kode_produk: '',
  nama_produk: '',
  qty: null,
  qty_target: null,
  satuan: 'Unit',
  tanggal_planning: '',
  deadline: '',
  departemen_obj: null,
  departemen_id: '',
  departemen_nama: '',
  departemen_kode: '',
  all_departemen: false,
  routing_mode: 'single',
  route_departemen: [],
  current_route_index: 0,
  current_departemen_id: '',
  current_departemen_nama: '',
  prioritas: 'Medium',
  status: 'Draft',
  status_planning: 'Draft',
  progress: 0,
  catatan: '',
})

const form = ref(defaultForm())

const columns = [
  {
    name: 'no_planning',
    align: 'left',
    label: 'Nomor Planning',
    field: 'no_planning',
    sortable: true,
  },
  { name: 'nomor_approved', align: 'left', label: 'Nomor Approved', field: 'nomor_approved', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer_nama', sortable: true },
  { name: 'produk', align: 'left', label: 'Produk', field: 'nama_produk' },
  { name: 'qty_target', align: 'right', label: 'Qty', field: 'qty_target', sortable: true },
  { name: 'departemen', align: 'left', label: 'Departemen', field: 'departemen_nama' },
  { name: 'deadline', align: 'left', label: 'Deadline', field: 'deadline', sortable: true },
  { name: 'prioritas', align: 'center', label: 'Prioritas', field: 'prioritas', sortable: true },
  { name: 'status_planning', align: 'center', label: 'Status Planning', field: 'status_planning', sortable: true },
  { name: 'action', align: 'center', label: 'Action' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    const rowStatus = row.status_planning || row.status
    const matchesStatus = statusFilter.value === 'all' || rowStatus === statusFilter.value
    const matchesPriority = priorityFilter.value === 'all' || row.prioritas === priorityFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_planning,
        row.no_planning,
        row.nomor_approved,
        row.nomor_spk,
        row.customer_nama,
        row.customer,
        row.nama_produk,
        row.item_produksi,
        row.departemen_nama,
        formatDepartemenRoute(row),
        row.tujuan_departemen?.nama_departemen,
        rowStatus,
        row.prioritas,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesPriority && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Total Planning',
    value: rows.value.length,
    icon: 'business_center',
    color: 'green-10',
  },
  {
    title: 'Planning Aktif',
    value: rows.value.filter((row) => ['Draft', 'Scheduled', 'On Progress'].includes(row.status_planning || row.status)).length,
    icon: 'assignment_turned_in',
    color: 'blue-grey-7',
  },
  {
    title: 'Approved Terhubung',
    value: rows.value.filter((row) => row.approved_id || row.nomor_approved || row.spk_id).length,
    icon: 'assignment',
    color: 'teal-8',
  },
  {
    title: 'Planning Baru',
    value: rows.value.filter((row) => row.is_new !== false && (row.status_planning || row.status) !== 'Selesai').length,
    icon: 'fiber_new',
    color: 'positive',
  },
])

const formTitle = computed(() => (editingId.value ? 'Edit Planning Produksi' : 'Tambah Planning Produksi'))

const departemenOptions = computed(() =>
  [
    {
      label: 'ALL DEPARTEMEN',
      value: '__ALL_DEPARTEMEN__',
      item: {
        id: '__ALL_DEPARTEMEN__',
        nama_departemen: 'ALL DEPARTEMEN',
        kode_departemen: 'ALL',
      },
    },
    ...departemenRows.value.map((item) => ({
      label: item.label,
      value: item.id,
      item,
    })),
  ],
)

const approvedOptions = computed(() => filteredApprovedOptions.value)

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const getApprovedNumber = (row) =>
  row.nomor_approved || row.nomor || row.no_quotation || row.nomor_quotation || row.reference_no || row.id

const getApprovedItems = (row) =>
  (Array.isArray(row.items) && row.items.length
    ? row.items
    : [
        {
          deskripsi: row.nama_produk || row.produk?.nama_produk || row.produk,
          nama_produk: row.nama_produk || row.produk?.nama_produk || row.produk,
          qty: row.qty_target || row.qty_po || row.qty,
          satuan: row.satuan || row.produk?.satuan,
          kode_produk: row.kode_produk || row.produk?.kode_produk,
          produk_id: row.produk_id || row.produk?.id,
        },
      ]
  ).map((item, index) => {
    const qty = Number(item.qty ?? item.quantity ?? item.qty_target ?? item.qty_po ?? 0)
    const harga = Number(item.harga ?? item.price ?? item.harga_satuan ?? item.unit_price ?? 0)
    const namaProduk =
      item.nama_produk ||
      item.nama_barang ||
      item.deskripsi ||
      item.produk ||
      item.product ||
      `Item ${index + 1}`

    return {
      ...item,
      item_id: item.item_id || item.id || `item-${index + 1}`,
      nama_produk: namaProduk,
      deskripsi: item.deskripsi || namaProduk,
      qty,
      satuan: item.satuan || item.unit || 'Unit',
      harga,
      subtotal: Number(item.subtotal ?? item.total ?? qty * harga),
      produk_id: item.produk_id || item.product_id || item.id_produk || null,
      kode_produk: item.kode_produk || item.kode_barang || '',
    }
  })

const findMasterProduk = (item) => {
  const produkId = item.produk_id || item.product_id || item.id_produk
  if (produkId) {
    const byId = produkRows.value.find((produk) => produk.id === produkId)
    if (byId) return byId
  }

  const kodeProduk = normalizeText(item.kode_produk || item.kode_barang)
  if (kodeProduk) {
    const byCode = produkRows.value.find((produk) => normalizeText(produk.kode_produk) === kodeProduk)
    if (byCode) return byCode
  }

  const namaProduk = normalizeText(item.nama_produk || item.produk || item.deskripsi || item.nama_barang)
  if (!namaProduk) return null
  return produkRows.value.find(
    (produk) => normalizeText(produk.nama_produk || produk.nama || produk.label) === namaProduk,
  )
}

const mapApprovedOption = (row) => {
  const items = getApprovedItems(row)
  const item = items[0] || {}
  const produk = findMasterProduk(item)
  const produkName = produk?.nama_produk || produk?.nama || item.nama_produk || item.deskripsi || '-'
  return {
    label: `${getApprovedNumber(row)} - ${produkName}${items.length > 1 ? ` +${items.length - 1} item` : ''}`,
    value: row.id,
    item: row,
  }
}

const refreshApprovedOptions = (needle = '') => {
  const searchText = normalizeText(needle)
  filteredApprovedOptions.value = approvedRows.value
    .filter((row) => row.status === 'Approved')
    .filter((row) => {
      const items = getApprovedItems(row)
      return (
        !searchText ||
        [
          getApprovedNumber(row),
          row.nama_customer,
          row.customer_nama,
          row.customer?.nama,
          ...items.flatMap((item) => {
            const produk = findMasterProduk(item)
            return [produk?.nama_produk, item.nama_produk, item.deskripsi, item.kode_produk]
          }),
        ]
          .filter(Boolean)
          .some((value) => normalizeText(value).includes(searchText))
      )
    })
    .map(mapApprovedOption)
}

const filterApproved = (value, update) => {
  update(() => refreshApprovedOptions(value || ''))
}

const findDepartemenOption = (id, name) =>
  departemenOptions.value.find((option) => option.value === id) ||
  departemenOptions.value.find((option) => option.item.nama_departemen === name)

const normalizeDepartemenSelection = (selection) => {
  const selectedOptions = (Array.isArray(selection) ? selection : selection ? [selection] : []).filter(Boolean)
  const isAllSelected = selectedOptions.some((option) => option.value === '__ALL_DEPARTEMEN__')
  const baseOptions = isAllSelected
    ? departemenRows.value.map((item) => ({ label: item.label, value: item.id, item }))
    : selectedOptions.filter((option) => option.value !== '__ALL_DEPARTEMEN__')

  const seen = new Set()
  const route = baseOptions
    .map((option, index) => {
      const item = option?.item || option
      const id = item?.id || item?.value || option?.value || ''
      if (!id || seen.has(id)) return null
      seen.add(id)
      return {
        id,
        value: id,
        nama_departemen: item?.nama_departemen || item?.label || option?.label || '',
        kode_departemen: item?.kode_departemen || '',
        label: option?.label || item?.nama_departemen || item?.label || '',
        urutan: index + 1,
        status: index === 0 ? 'Menunggu Produksi' : 'Menunggu Routing',
        is_new: index === 0,
      }
    })
    .filter(Boolean)

  return { isAllSelected, route }
}

const handleDepartemenSelected = (option) => {
  const { isAllSelected, route } = normalizeDepartemenSelection(option)
  const firstDepartemen = route[0] || null

  form.value.all_departemen = isAllSelected
  form.value.routing_mode = isAllSelected ? 'all' : route.length > 1 ? 'routing' : 'single'
  form.value.route_departemen = route
  form.value.current_route_index = 0
  form.value.current_departemen_id = isAllSelected ? '' : firstDepartemen?.id || ''
  form.value.current_departemen_nama = isAllSelected ? 'ALL DEPARTEMEN' : firstDepartemen?.nama_departemen || ''
  form.value.departemen_id = isAllSelected ? '' : firstDepartemen?.id || ''
  form.value.departemen_nama = isAllSelected
    ? 'ALL DEPARTEMEN'
    : route.map((item) => item.nama_departemen).join(' -> ')
  form.value.departemen_kode = isAllSelected ? 'ALL' : firstDepartemen?.kode_departemen || ''
}

const handleApprovedSelected = (option) => {
  const approved = option?.item || option
  if (!approved) return

  const selectedItem = getApprovedItems(approved)[0] || {}
  const produk = findMasterProduk(selectedItem)
  const approvedNumber = getApprovedNumber(approved)

  form.value.approved_id = approved.id
  form.value.quotation_id = approved.quotation_id || approved.source_document_id || approved.id
  form.value.nomor_approved = approvedNumber
  form.value.spk_id = approved.id
  form.value.nomor_spk = approvedNumber
  form.value.no_so = approved.nomor_po || approved.nomor || ''
  form.value.project = approved.nomor || approvedNumber
  form.value.customer_id = approved.customer_id || approved.customer?.id || ''
  form.value.customer_nama =
    approved.customer_nama || approved.nama_customer || approved.customer?.nama || approved.customerName || ''
  form.value.customer = form.value.customer_nama
  form.value.produk_id = produk?.id || selectedItem.produk_id || approved.produk_id || ''
  form.value.kode_produk = produk?.kode_produk || selectedItem.kode_produk || approved.kode_produk || ''
  form.value.nama_produk =
    produk?.nama_produk ||
    produk?.nama ||
    selectedItem.nama_produk ||
    selectedItem.deskripsi ||
    approved.nama_produk ||
    ''
  form.value.item_produksi = form.value.nama_produk
  form.value.qty_target = Number(selectedItem.qty || approved.qty_target || approved.qty_po || approved.qty || 0)
  form.value.qty = form.value.qty_target
  form.value.satuan = produk?.satuan || selectedItem.satuan || approved.satuan || 'Unit'
  form.value.prioritas = 'Medium'

  const departemenOption = findDepartemenOption(
    approved.departemen_id || approved.tujuan_departemen?.id,
    approved.departemen_nama || approved.tujuan_departemen?.nama_departemen,
  )
  if (departemenOption) {
    form.value.departemen_obj = [departemenOption]
    handleDepartemenSelected([departemenOption])
  }
}

const buildPayload = () => {
  const qtyTarget = Number(form.value.qty_target || form.value.qty || 0)
  const statusPlanning = form.value.status_planning || form.value.status || 'Draft'

  return {
    no_planning: form.value.no_planning,
    nomor_planning: form.value.no_planning,
    approved_id: form.value.approved_id,
    quotation_id: form.value.quotation_id,
    nomor_approved: form.value.nomor_approved,
    nomor_spk: form.value.nomor_approved || form.value.nomor_spk,
    spk_id: form.value.spk_id,
    no_so: form.value.no_so,
    customer_id: form.value.customer_id,
    customer_nama: form.value.customer_nama,
    customer: form.value.customer_nama,
    produk_id: form.value.produk_id,
    kode_produk: form.value.kode_produk,
    nama_produk: form.value.nama_produk,
    item_produksi: form.value.nama_produk,
    qty_target: qtyTarget,
    qty: qtyTarget,
    satuan: form.value.satuan,
    departemen_id: form.value.departemen_id,
    departemen_nama: form.value.departemen_nama,
    departemen_kode: form.value.departemen_kode,
    all_departemen: form.value.all_departemen,
    routing_mode: form.value.routing_mode,
    route_departemen: form.value.route_departemen,
    current_route_index: Number(form.value.current_route_index || 0),
    current_departemen_id: form.value.current_departemen_id,
    current_departemen_nama: form.value.current_departemen_nama,
    tujuan_departemen: {
      id: form.value.departemen_id,
      nama_departemen: form.value.departemen_nama,
      kode_departemen: form.value.departemen_kode,
    },
    deadline: form.value.deadline,
    prioritas: form.value.prioritas,
    status_planning: statusPlanning,
    status: statusPlanning,
    progress: statusPlanning === 'Selesai' ? 100 : 0,
    is_new: editingId.value ? form.value.is_new !== false : true,
    catatan: form.value.catatan,
  }
}

const buildPayloadForItem = (item, index, totalItems) => {
  const produk = findMasterProduk(item)
  const qtyTarget = Number(item.qty || 0)
  const namaProduk = produk?.nama_produk || produk?.nama || item.nama_produk || item.deskripsi || ''

  return {
    ...buildPayload(),
    item_id: item.item_id,
    item_index: index,
    items: getApprovedItems(form.value.approved_obj?.item || form.value.approved_obj || {}),
    no_planning:
      totalItems > 1
        ? `${form.value.no_planning}-${String(index + 1).padStart(2, '0')}`
        : form.value.no_planning,
    nomor_planning:
      totalItems > 1
        ? `${form.value.no_planning}-${String(index + 1).padStart(2, '0')}`
        : form.value.no_planning,
    produk_id: produk?.id || item.produk_id || '',
    kode_produk: produk?.kode_produk || item.kode_produk || '',
    nama_produk: namaProduk,
    item_produksi: namaProduk,
    qty_target: qtyTarget,
    qty: qtyTarget,
    satuan: produk?.satuan || item.satuan || 'Unit',
    harga: Number(item.harga || 0),
    subtotal: Number(item.subtotal || 0),
    progress: 0,
    total_progress: 0,
    sisa_qty: qtyTarget,
    progress_percent: 0,
  }
}

const openCreateDialog = () => {
  editingId.value = null
  form.value = defaultForm()
  refreshApprovedOptions()
  formDialog.value = true
}

const openEditDialog = (row) => {
  editingId.value = row.id
  const approvedOption = approvedRows.value.find(
    (item) =>
      item.id === row.approved_id ||
      item.id === row.spk_id ||
      getApprovedNumber(item) === (row.nomor_approved || row.nomor_spk),
  )
  const departemenOption = findDepartemenOption(
    row.departemen_id || row.tujuan_departemen?.id,
    row.departemen_nama || row.tujuan_departemen?.nama_departemen,
  )
  form.value = {
    ...defaultForm(),
    ...row,
    no_planning: row.no_planning || row.nomor_planning || '',
    nomor_planning: row.nomor_planning || row.no_planning || '',
    approved_obj: approvedOption ? mapApprovedOption(approvedOption) : null,
    approved_id: row.approved_id || row.spk_id || '',
    nomor_approved: row.nomor_approved || row.nomor_spk || '',
    departemen_obj: row.all_departemen
      ? [departemenOptions.value.find((option) => option.value === '__ALL_DEPARTEMEN__')].filter(Boolean)
      : row.route_departemen?.length
        ? row.route_departemen
            .map((routeItem) => findDepartemenOption(routeItem.id, routeItem.nama_departemen))
            .filter(Boolean)
        : departemenOption
          ? [departemenOption]
          : [],
    all_departemen: !!row.all_departemen,
    routing_mode: row.routing_mode || 'single',
    route_departemen: Array.isArray(row.route_departemen) ? row.route_departemen : [],
    current_route_index: Number(row.current_route_index || 0),
    current_departemen_id: row.current_departemen_id || row.departemen_id || '',
    current_departemen_nama: row.current_departemen_nama || row.departemen_nama || '',
    customer_nama: row.customer_nama || row.customer || '',
    nama_produk: row.nama_produk || row.item_produksi || '',
    qty_target: Number(row.qty_target || row.qty || 0),
    qty: Number(row.qty_target || row.qty || 0),
    status_planning: row.status_planning || row.status || 'Draft',
    progress: Number(row.progress || 0),
  }
  formDialog.value = true
}

const openDetailDialog = (row) => {
  selectedRow.value = row
  detailDialog.value = true
}

const savePlanning = async () => {
  submitting.value = true
  try {
    const payload = buildPayload()

    if (editingId.value) {
      await updatePlanningProduksi(editingId.value, payload)
      $q.notify({ type: 'positive', message: 'Planning produksi berhasil diperbarui' })
    } else {
      const approved = form.value.approved_obj?.item || form.value.approved_obj
      const approvedItems = getApprovedItems(approved || {})
      if (approvedItems.length > 1) {
        await Promise.all(
          approvedItems.map((item, index) =>
            createPlanningProduksi(buildPayloadForItem(item, index, approvedItems.length)),
          ),
        )
      } else {
        await createPlanningProduksi(payload)
      }
      $q.notify({ type: 'positive', message: 'Planning produksi berhasil ditambahkan' })
    }

    formDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan planning produksi' })
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Planning',
    message: `Hapus planning ${row.no_planning}?`,
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(async () => {
    try {
      await deletePlanningProduksi(row.id)
      $q.notify({ type: 'positive', message: 'Planning produksi berhasil dihapus' })
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal menghapus planning produksi' })
    }
  })
}

const listenPlanning = () => {
  loading.value = true
  errorMessage.value = ''
  if (unsubscribePlanning) unsubscribePlanning()

  unsubscribePlanning = listenPlanningProduksi(
    (planningRows) => {
      rows.value = planningRows
      loading.value = false
      errorMessage.value = ''
    },
    (error) => {
      console.error(error)
      loading.value = false
      errorMessage.value = 'Gagal memuat data planning produksi dari Firestore.'
      $q.notify({ type: 'negative', message: 'Gagal memuat planning produksi' })
    },
  )
}

const listenDepartemenOptions = () => {
  loadingDepartemen.value = true
  if (unsubscribeDepartemen) unsubscribeDepartemen()

  unsubscribeDepartemen = listenMasterDepartemen(
    (options) => {
      departemenRows.value = options
      loadingDepartemen.value = false
    },
    (error) => {
      console.error(error)
      loadingDepartemen.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat departemen manufacturing' })
    },
  )
}

const listenApprovedOptions = () => {
  loadingApproved.value = true
  if (unsubscribeApproved) unsubscribeApproved()

  unsubscribeApproved = listenApprovedQuotations(
    (nextRows) => {
      approvedRows.value = nextRows
      refreshApprovedOptions()
      loadingApproved.value = false
    },
    (error) => {
      console.error(error)
      loadingApproved.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat approved quotation manufacturing' })
    },
  )
}

const listenProdukOptions = () => {
  if (unsubscribeProduk) unsubscribeProduk()

  unsubscribeProduk = listenMasterProduk(
    (nextRows) => {
      produkRows.value = nextRows
      refreshApprovedOptions()
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat master produk manufacturing' })
    },
  )
}

const resetFilter = () => {
  search.value = ''
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
}

const statusColor = (status) => {
  const colors = {
    Draft: 'grey-7',
    Approved: 'blue-grey-7',
    Scheduled: 'purple-7',
    'On Progress': 'orange-9',
    Selesai: 'green-10',
  }
  return colors[status] || 'grey-6'
}

const priorityColor = (priority) => {
  const colors = {
    High: 'negative',
    Medium: 'orange-9',
    Low: 'green-8',
  }
  return colors[priority] || 'grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDepartemenRoute = (row) => {
  if (!row) return '-'
  if (row.all_departemen || row.routing_mode === 'all') return 'ALL DEPARTEMEN'
  if (Array.isArray(row.route_departemen) && row.route_departemen.length) {
    return row.route_departemen.map((item) => item.nama_departemen || item.label || item.id).join(' -> ')
  }
  return row.departemen_nama || row.tujuan_departemen?.nama_departemen || '-'
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  listenPlanning()
  listenDepartemenOptions()
  listenProdukOptions()
  listenApprovedOptions()
})

onUnmounted(() => {
  if (unsubscribePlanning) unsubscribePlanning()
  if (unsubscribeDepartemen) unsubscribeDepartemen()
  if (unsubscribeApproved) unsubscribeApproved()
  if (unsubscribeProduk) unsubscribeProduk()
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

.planning-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
  font-weight: 800;
}

.planning-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.status-badge {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  justify-content: center;
  min-width: 82px;
  padding: 5px 8px;
}

.detail-dialog {
  width: 760px;
  max-width: 95vw;
  border-radius: 18px;
  overflow: hidden;
}

.planning-dialog {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.planning-dialog-form {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  flex: 0 0 auto;
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 16px 24px;
}

.planning-dialog-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
}

.dialog-footer {
  flex: 0 0 auto;
  position: sticky;
  bottom: 0;
  z-index: 2;
  border-top: 1px solid #dfe8df;
}

@media (max-width: 599px) {
  .dialog-header {
    align-items: flex-start;
    padding: 14px 16px;
  }

  .planning-dialog-body {
    padding: 16px;
  }

  .dialog-footer {
    gap: 8px;
  }

  .dialog-footer :deep(.q-btn) {
    flex: 1;
  }
}

.detail-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.detail-value {
  color: #1b5e20;
  font-size: 15px;
  font-weight: 700;
}

.note-box {
  background: #f5f7f5;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  color: #344054;
  padding: 14px;
}
</style>
