<template>
  <q-page class="spk-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10">SPK Produksi</div>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          Perintah produksi dari PO Customer approved menuju departemen produksi.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Buat SPK"
          no-caps
          class="q-px-lg"
          @click="openDialog()"
        />
      </div>
    </div>

    <q-card flat bordered class="filter-card bg-white q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari nomor SPK, PO, customer, produk, departemen, atau status..."
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
              label="Status"
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
        row-key="id"
        flat
        :grid="$q.screen.lt.md"
        binary-state-sort
        :loading="loadingSpk"
        :pagination="{ rowsPerPage: 10 }"
        class="spk-table"
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
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk }}
              <div class="text-caption text-grey-6">PO: {{ props.row.nomor_po || '-' }}</div>
            </q-td>
            <q-td key="customer" :props="props">{{ props.row.customer_nama || '-' }}</q-td>
            <q-td key="produk" :props="props">
              <div class="text-weight-bold">{{ props.row.nama_produk || '-' }}</div>
              <div class="text-caption text-grey-6">Qty target: {{ formatNumber(props.row.qty_target) }}</div>
            </q-td>
            <q-td key="departemen" :props="props">
              {{ props.row.tujuan_departemen?.nama_departemen || '-' }}
            </q-td>
            <q-td key="deadline" :props="props">{{ formatDate(props.row.deadline) }}</q-td>
            <q-td key="prioritas" :props="props">
              <q-chip dense square :color="priorityColor(props.row.prioritas)" text-color="white">
                {{ props.row.prioritas || '-' }}
              </q-chip>
            </q-td>
            <q-td key="status" :props="props">
              <q-chip dense square text-color="white" :color="statusColor(props.row.status)" class="status-chip">
                {{ props.row.status || '-' }}
              </q-chip>
            </q-td>
          </q-tr>
        </template>

        <template #item="props">
          <div class="q-pa-xs col-12 col-sm-6">
            <q-card flat bordered class="spk-grid-card">
              <q-card-section class="q-pa-md">
                <div class="row items-start no-wrap q-mb-sm">
                  <div class="col">
                    <div class="text-weight-bolder text-green-10">{{ props.row.nomor_spk }}</div>
                    <div class="text-caption text-grey-7">PO: {{ props.row.nomor_po || '-' }}</div>
                  </div>
                  <q-chip dense square text-color="white" :color="statusColor(props.row.status)">
                    {{ props.row.status || '-' }}
                  </q-chip>
                </div>
                <div class="text-body2 text-weight-bold">{{ props.row.nama_produk || '-' }}</div>
                <div class="text-caption text-grey-7 q-mb-sm">
                  {{ props.row.customer_nama || '-' }} - Qty {{ formatNumber(props.row.qty_target) }}
                </div>
                <div class="row q-col-gutter-sm text-caption">
                  <div class="col-6">
                    <div class="text-grey-6">Departemen</div>
                    <div class="text-weight-bold">{{ props.row.tujuan_departemen?.nama_departemen || '-' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-grey-6">Deadline</div>
                    <div class="text-weight-bold">{{ formatDate(props.row.deadline) }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="assignment" size="28px" class="q-mr-sm" />
            Belum ada SPK produksi.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog
      v-model="dialogOpen"
      persistent
      maximized
      full-width
      full-height
      class="spk-fullscreen-dialog"
    >
      <q-card class="spk-dialog fullscreen column no-wrap">
        <q-card-section class="dialog-header row items-center shrink">
          <div>
            <div class="text-h6 text-weight-bold">Buat SPK Produksi</div>
            <div class="text-caption">PO Approved -> PPIC buat SPK -> Departemen Produksi</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </q-card-section>

        <q-form class="spk-form col column no-wrap" @submit.prevent="saveSpk">
          <q-card-section class="spk-dialog-body col scroll">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="form.nomor_spk" outlined dense readonly label="Nomor SPK" />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.po_obj"
                  :options="approvedPoOptions"
                  outlined
                  dense
                  use-input
                  input-debounce="250"
                  option-label="label"
                  option-value="value"
                  label="Nomor PO Approved"
                  :loading="loadingPo"
                  :rules="[required]"
                  @filter="filterApprovedPo"
                  @update:model-value="handlePoSelected"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.customer_nama" outlined dense readonly label="Customer" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.nama_produk" outlined dense readonly label="Produk" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model.number="form.qty_target" outlined dense readonly type="number" label="Qty Target" />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.departemen_obj"
                  :options="departemenOptions"
                  outlined
                  dense
                  option-label="label"
                  option-value="value"
                  label="Departemen Tujuan"
                  :loading="loadingDepartemen"
                  :rules="[required]"
                >
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.value === ALL_DEPARTEMEN_VALUE ? 'groups' : 'corporate_fare'" color="green-10" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption v-if="scope.opt.value === ALL_DEPARTEMEN_VALUE">
                          Kirim SPK ke semua departemen aktif
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.deadline" outlined dense type="date" label="Deadline Produksi" :rules="[required]" />
              </div>
              <div class="col-12 col-md-6">
                <q-select v-model="form.prioritas" :options="priorityOptions" outlined dense label="Prioritas" :rules="[required]" />
              </div>
              <div class="col-12">
                <q-input v-model="form.catatan_produksi" outlined dense type="textarea" autogrow label="Catatan Produksi" />
              </div>
              <div class="col-12">
                <q-input v-model="form.status" outlined dense readonly label="Status" />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="spk-dialog-actions bg-grey-1">
            <q-btn flat color="grey-7" label="Batal" no-caps @click="closeDialog" />
            <q-btn unelevated rounded color="green-10" icon="save" label="Simpan SPK" no-caps type="submit" :loading="saving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { date, useQuasar } from 'quasar'
import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()

const MASTER_DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'
const PO_CUSTOMER_COLLECTION = 'manufacturing_po_customer'
const APPROVAL_QUOTATION_COLLECTION = 'manufacturing_approval_quotation'
const MANUFACTURING_DEPARTEMEN_COLLECTION = 'manufacturing_departemen'
const SPK_SUBCOLLECTION = 'spk'

const rows = ref([])
const departemenRows = ref([])
const approvedPoRawOptions = ref([])
const approvedPoOptions = ref([])
const loadingSpk = ref(true)
const loadingPo = ref(true)
const loadingDepartemen = ref(true)
const saving = ref(false)
const search = ref('')
const statusFilter = ref('all')
const dialogOpen = ref(false)
let unsubscribeSpk = null
let unsubscribePo = null
let unsubscribeDepartemen = null

const statusOptions = ['Menunggu Produksi', 'On Production', 'QC Process', 'Finished']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]
const priorityOptions = ['Normal', 'Urgent', 'High']
const ALL_DEPARTEMEN_VALUE = '__ALL_DEPARTEMEN__'

const getSpkCollection = (departemenId) =>
  collection(db, MANUFACTURING_DEPARTEMEN_COLLECTION, departemenId, SPK_SUBCOLLECTION)

const listenSpkProduksi = (callback, errorCallback) =>
  onSnapshot(
    collectionGroup(db, SPK_SUBCOLLECTION),
    (snapshot) => {
      callback(
        snapshot.docs.map((spkDoc) => ({
          id: spkDoc.id,
          departemen_path_id: spkDoc.ref.parent.parent?.id || '',
          ...spkDoc.data(),
        })),
      )
    },
    errorCallback,
  )

const listenMasterDepartemen = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, MASTER_DEPARTEMEN_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      callback(snapshot.docs.map((departemenDoc) => ({ id: departemenDoc.id, ...departemenDoc.data() })))
    },
    errorCallback,
  )

const getDocumentItems = (data) =>
  Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.list_item_barang)
      ? data.list_item_barang
      : Array.isArray(data.detail_barang)
        ? data.detail_barang
        : Array.isArray(data.item)
          ? data.item
          : []

const normalizeApprovedDocument = (sourceCollection, sourceLabel, sourceDoc) => {
  const data = sourceDoc.data()
  const items = getDocumentItems(data)
  const firstItem = items[0] || {}
  const nomor =
    data.nomor_po ||
    data.nomor ||
    data.noPO ||
    data.no_po ||
    data.no_penawaran ||
    data.nomor_penawaran ||
    sourceDoc.id

  return {
    ...data,
    id: sourceDoc.id,
    value: `${sourceCollection}:${sourceDoc.id}`,
    label: `${nomor} - ${sourceLabel}`,
    nomor,
    nomor_po: nomor,
    source_collection: sourceCollection,
    source_document_id: sourceDoc.id,
    source_label: sourceLabel,
    customerName:
      data.customerName ||
      data.customer_nama ||
      data.nama_customer ||
      data.kepada_yth ||
      data.proyek_nama ||
      data.konsumen ||
      '',
    customer_id: data.customer_id || data.id_customer || data.customerId || null,
    qty_po: Number(
      firstItem.qty ||
        firstItem.quantity ||
        firstItem.qty_po ||
        data.qty_po ||
        data.qty ||
        data.total_qty ||
        data.qty_target ||
        0,
    ),
    satuan: firstItem.satuan || firstItem.unit || data.satuan || '',
    produk_id: firstItem.produk_id || firstItem.product_id || data.produk_id || null,
    kode_produk: firstItem.kode_produk || firstItem.kode_barang || data.kode_produk || '',
    nama_produk:
      firstItem.nama_produk ||
      firstItem.nama_barang ||
      firstItem.deskripsi ||
      firstItem.produk ||
      firstItem.nama ||
      data.nama_produk ||
      data.produk ||
      data.item_produksi ||
      '',
    items,
  }
}

const listenApprovedPoOptions = (callback, errorCallback) => {
  const snapshots = {
    po: [],
    quotation: [],
  }

  const emit = () => {
    const merged = [...snapshots.po, ...snapshots.quotation]
      .filter((item) => item.status === 'Approved')
      .sort((a, b) => {
        const left = a.approvedAt?.toMillis?.() || a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0
        const right = b.approvedAt?.toMillis?.() || b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0
        return right - left
      })
    callback(merged)
  }

  const handleError = (error) => {
    if (errorCallback) errorCallback(error)
  }

  const unsubscribePoCustomer = onSnapshot(
    query(collection(db, PO_CUSTOMER_COLLECTION), where('status', '==', 'Approved')),
    (snapshot) => {
      snapshots.po = snapshot.docs.map((poDoc) =>
        normalizeApprovedDocument(PO_CUSTOMER_COLLECTION, 'PO Customer', poDoc),
      )
      emit()
    },
    handleError,
  )

  const unsubscribeApprovalQuotation = onSnapshot(
    query(collection(db, APPROVAL_QUOTATION_COLLECTION), where('status', '==', 'Approved')),
    (snapshot) => {
      snapshots.quotation = snapshot.docs.map((quotationDoc) =>
        normalizeApprovedDocument(APPROVAL_QUOTATION_COLLECTION, 'Quotation Approved', quotationDoc),
      )
      emit()
    },
    handleError,
  )

  return () => {
    unsubscribePoCustomer()
    unsubscribeApprovalQuotation()
  }
}

const createSpkProduksi = async (payload) => {
  const targetDepartemen = Array.isArray(payload.target_departemen) ? payload.target_departemen : []
  const batch = writeBatch(db)
  const createdIds = []
  const groupSpkId = doc(collection(db, MANUFACTURING_DEPARTEMEN_COLLECTION)).id
  const targets = targetDepartemen.length
    ? targetDepartemen
    : payload.departemen_id || payload.tujuan_departemen?.id
      ? [payload.tujuan_departemen]
      : []

  targets.forEach((departemen) => {
    const departemenId = departemen?.id || departemen?.value
    if (!departemenId || departemenId === ALL_DEPARTEMEN_VALUE) return

    const spkRef = doc(getSpkCollection(departemenId))
    createdIds.push(spkRef.id)
    batch.set(spkRef, {
      ...payload,
      id: spkRef.id,
      group_spk_id: targetDepartemen.length ? groupSpkId : null,
      departemen_id: departemenId,
      tujuan_departemen: {
        id: departemenId,
        kode_departemen: departemen.kode_departemen || '',
        nama_departemen: departemen.nama_departemen || departemen.label || '',
      },
      target_mode: targetDepartemen.length ? 'ALL_DEPARTEMEN' : 'SINGLE_DEPARTEMEN',
      status: 'Menunggu Produksi',
      status_pekerjaan: 'Menunggu Produksi',
      is_new: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
  })

  if (!createdIds.length) throw new Error('Departemen tujuan wajib dipilih.')
  await batch.commit()
  return targetDepartemen.length ? createdIds : createdIds[0]
}

const generateSpkNumber = () => {
  const now = new Date()
  return `SPK-PRD-${date.formatDate(now, 'YYYYMMDD')}-${String(now.getTime()).slice(-5)}`
}

const defaultForm = () => ({
  nomor_spk: generateSpkNumber(),
  po_obj: null,
  nomor_po: '',
  po_id: null,
  customer_id: null,
  customer_nama: '',
  produk_id: null,
  kode_produk: '',
  nama_produk: '',
  qty_target: 0,
  satuan: '',
  departemen_obj: null,
  deadline: '',
  prioritas: 'Normal',
  catatan_produksi: '',
  status: 'Menunggu Produksi',
})

const form = ref(defaultForm())
const required = (val) => !!val || 'Field wajib diisi'

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer_nama', sortable: true },
  { name: 'produk', align: 'left', label: 'Produk', field: 'nama_produk', sortable: true },
  { name: 'departemen', align: 'left', label: 'Departemen Tujuan', field: 'departemen_nama', sortable: true },
  { name: 'deadline', align: 'left', label: 'Deadline', field: 'deadline', sortable: true },
  { name: 'prioritas', align: 'center', label: 'Prioritas', field: 'prioritas', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
]

const activeDepartemenRows = computed(() =>
  departemenRows.value.filter((item) => item.status === 'Aktif'),
)

const departemenOptions = computed(() =>
  [
    {
      label: 'ALL DEPARTEMEN',
      value: ALL_DEPARTEMEN_VALUE,
      item: {
        id: ALL_DEPARTEMEN_VALUE,
        kode_departemen: 'ALL',
        nama_departemen: 'ALL DEPARTEMEN',
      },
    },
    ...activeDepartemenRows.value.map((item) => ({
      label: `${item.kode_departemen ? `${item.kode_departemen} - ` : ''}${item.nama_departemen}`,
      value: item.id,
      item,
    })),
  ],
)

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_spk,
        row.nomor_po,
        row.customer_nama,
        row.nama_produk,
        row.tujuan_departemen?.nama_departemen,
        row.prioritas,
        row.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    return matchesStatus && matchesSearch
  })
})

const filterByLabel = (options, needle) => {
  const term = String(needle || '').toLowerCase()
  if (!term) return options
  return options.filter((option) =>
    [option.label, option.nomor, option.customerName, option.customer_nama, option.nama_produk, option.kode_produk]
      .join(' ')
      .toLowerCase()
      .includes(term),
  )
}

const filterApprovedPo = (val, update) => {
  update(() => {
    approvedPoOptions.value = filterByLabel(approvedPoRawOptions.value, val)
  })
}

const handlePoSelected = (po) => {
  form.value.nomor_po = po?.nomor || po?.label || ''
  form.value.po_id = po?.source_document_id || po?.id || null
  form.value.customer_id = po?.customer_id || null
  form.value.customer_nama =
    po?.customerName || po?.customer_nama || po?.nama_customer || po?.kepada_yth || ''
  form.value.produk_id = po?.produk_id || null
  form.value.kode_produk = po?.kode_produk || ''
  form.value.nama_produk = po?.nama_produk || po?.produk || po?.item_produksi || ''
  form.value.qty_target = Number(po?.qty_po || po?.qty || po?.total_qty || po?.qty_target || 0)
  form.value.satuan = po?.satuan || ''
}

const buildPayload = () => {
  const selectedDepartemen = form.value.departemen_obj?.item || form.value.departemen_obj
  const isAllDepartemen =
    selectedDepartemen?.id === ALL_DEPARTEMEN_VALUE || selectedDepartemen?.value === ALL_DEPARTEMEN_VALUE
  const targetDepartemen = isAllDepartemen ? activeDepartemenRows.value : []

  return {
    nomor_spk: form.value.nomor_spk,
    nomor_po: form.value.nomor_po,
    po_id: form.value.po_id,
    po_source_collection: form.value.po_obj?.source_collection || PO_CUSTOMER_COLLECTION,
    po_source_document_id: form.value.po_obj?.source_document_id || form.value.po_id,
    customer_id: form.value.customer_id,
    customer_nama: form.value.customer_nama,
    produk_id: form.value.produk_id,
    kode_produk: form.value.kode_produk,
    nama_produk: form.value.nama_produk,
    qty_target: Number(form.value.qty_target || 0),
    qty_hasil_jadi: 0,
    satuan: form.value.satuan,
    departemen_id: isAllDepartemen ? null : selectedDepartemen?.id || selectedDepartemen?.value || null,
    tujuan_departemen: {
      id: isAllDepartemen ? ALL_DEPARTEMEN_VALUE : selectedDepartemen?.id || selectedDepartemen?.value || null,
      kode_departemen: isAllDepartemen ? 'ALL' : selectedDepartemen?.kode_departemen || '',
      nama_departemen: isAllDepartemen
        ? 'ALL DEPARTEMEN'
        : selectedDepartemen?.nama_departemen || selectedDepartemen?.label || '',
    },
    target_departemen: targetDepartemen,
    target_mode: isAllDepartemen ? 'ALL_DEPARTEMEN' : 'SINGLE_DEPARTEMEN',
    deadline: form.value.deadline,
    prioritas: form.value.prioritas,
    catatan_produksi: form.value.catatan_produksi,
    status: 'Menunggu Produksi',
    status_flow: statusOptions,
    source: 'PO_CUSTOMER_APPROVED',
  }
}

const openDialog = () => {
  form.value = defaultForm()
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  form.value = defaultForm()
}

const saveSpk = async () => {
  saving.value = true
  try {
    const created = await createSpkProduksi(buildPayload())
    closeDialog()
    const totalCreated = Array.isArray(created) ? created.length : 1
    $q.notify({
      type: 'positive',
      message: `SPK produksi berhasil dikirim ke ${totalCreated} departemen.`,
    })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error?.message || 'Gagal menyimpan SPK produksi.' })
  } finally {
    saving.value = false
  }
}

const statusColor = (status) => {
  const colors = {
    'Menunggu Produksi': 'orange-9',
    'On Production': 'primary',
    'QC Process': 'indigo-7',
    Finished: 'positive',
  }
  return colors[status] || 'grey-6'
}

const priorityColor = (priority) => {
  if (priority === 'Urgent') return 'negative'
  if (priority === 'High') return 'orange-9'
  return 'blue-grey-7'
}

const formatDate = (value) => {
  if (!value) return '-'
  const rawDate = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(rawDate.getTime())) return '-'
  return date.formatDate(rawDate, 'DD MMM YYYY')
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

onMounted(() => {
  unsubscribeSpk = listenSpkProduksi(
    (nextRows) => {
      rows.value = nextRows
      loadingSpk.value = false
    },
    (error) => {
      console.error(error)
      loadingSpk.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat SPK produksi.' })
    },
  )

  unsubscribePo = listenApprovedPoOptions(
    (options) => {
      approvedPoRawOptions.value = options
      approvedPoOptions.value = options
      loadingPo.value = false
    },
    (error) => {
      console.error(error)
      loadingPo.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat PO approved.' })
    },
  )

  unsubscribeDepartemen = listenMasterDepartemen(
    (rows) => {
      departemenRows.value = [...rows].sort((a, b) =>
        String(a.nama_departemen || '').localeCompare(String(b.nama_departemen || '')),
      )
      loadingDepartemen.value = false
    },
    (error) => {
      console.error(error)
      loadingDepartemen.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat master departemen.' })
    },
  )
})

onUnmounted(() => {
  if (unsubscribeSpk) unsubscribeSpk()
  if (unsubscribePo) unsubscribePo()
  if (unsubscribeDepartemen) unsubscribeDepartemen()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}

.filter-card,
.table-card,
.spk-dialog {
  border-color: #dfe8df;
  border-radius: 8px;
  overflow: hidden;
}

.shrink {
  flex: 0 0 auto;
}

.dialog-header {
  background: #1b5e20;
  color: white;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.spk-dialog {
  border-radius: 0;
  height: 100dvh;
  max-height: 100dvh;
  max-width: 100vw;
  width: 100vw;
}

:global(.spk-fullscreen-dialog .q-dialog__inner) {
  padding: 0 !important;
}

:global(.spk-fullscreen-dialog .q-dialog__inner > div) {
  margin: 0 !important;
}

.spk-form {
  height: 100%;
  min-height: 0;
}

.spk-dialog-body {
  -webkit-overflow-scrolling: touch;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
}

.spk-dialog-actions {
  border-top: 1px solid #dfe8df;
  bottom: 0;
  flex: 0 0 auto;
  padding: 12px 16px;
  position: sticky;
  z-index: 2;
}

.table-head {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.spk-grid-card {
  border-color: #dfe8df;
  border-radius: 8px;
  min-height: 156px;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  justify-content: center;
  min-width: 126px;
}

@media (max-width: 1023px) {
  .spk-page {
    padding: 12px;
  }

  .dialog-header {
    padding: 12px 14px;
  }

  .spk-dialog-body {
    padding: 12px;
    padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  }

  .spk-dialog-actions {
    gap: 8px;
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  }

  .spk-dialog-actions .q-btn {
    flex: 1 1 0;
  }

  .spk-table :deep(.q-table__grid-content) {
    row-gap: 8px;
  }
}
</style>
