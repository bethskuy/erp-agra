<template>
  <q-page class="material-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Pemakaian Material
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Monitoring Material Produksi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Pantau material incoming, pemakaian aktual, sisa material, reject material, dan status
          kecukupan material per SPK produksi.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none row q-gutter-sm">
        <q-btn
          flat
          rounded
          color="green-10"
          icon="sync"
          label="Refresh Data"
          no-caps
          :loading="loading"
          class="bg-white shadow-1 q-px-lg"
          @click="loadMaterialUsage"
        />
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Input Material Usage"
          no-caps
          class="q-px-lg shadow-premium"
          @click="openUsageDialog()"
        />
      </div>
    </div>

    <q-banner v-if="shortageRows.length" rounded class="shortage-banner q-mb-lg">
      <template #avatar>
        <q-icon name="warning_amber" color="negative" />
      </template>
      <div class="text-weight-bold">Warning material kurang</div>
      <div class="text-caption">
        {{ shortageRows.length }} material memiliki pemakaian dan reject melebihi qty incoming.
      </div>
    </q-banner>

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
              placeholder="Cari SPK, produk, material, line, atau PIC..."
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
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} MATERIAL
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
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="material-table"
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
          <q-tr :props="props" class="material-row" :class="rowClass(props.row)">
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk || '-' }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.line_produksi || '-' }}</div>
            </q-td>
            <q-td key="nama_material" :props="props">
              <div class="text-weight-bold">{{ props.row.nama_material || '-' }}</div>
              <div v-if="materialStatus(props.row) === 'KURANG_MATERIAL'" class="warning-text">
                Material kurang {{ formatNumber(Math.abs(qtySisa(props.row))) }}
              </div>
            </q-td>
            <q-td key="qty_incoming" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_incoming) }}
            </q-td>
            <q-td key="qty_dipakai" :props="props" class="text-weight-bold text-positive">
              {{ formatNumber(props.row.qty_dipakai) }}
            </q-td>
            <q-td
              key="qty_sisa"
              :props="props"
              class="text-weight-bold"
              :class="qtySisa(props.row) < 0 ? 'text-negative' : 'text-green-10'"
            >
              {{ formatNumber(qtySisa(props.row)) }}
            </q-td>
            <q-td key="reject_material" :props="props" class="text-weight-bold text-negative">
              {{ formatNumber(props.row.reject_material) }}
            </q-td>
            <q-td key="line_produksi" :props="props">{{ props.row.line_produksi || '-' }}</q-td>
            <q-td key="pic_produksi" :props="props">{{ props.row.pic_produksi || '-' }}</q-td>
            <q-td key="tanggal_penggunaan" :props="props">
              {{ formatDate(props.row.tanggal_penggunaan) }}
            </q-td>
            <q-td key="status" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(materialStatus(props.row))"
                class="status-chip"
              >
                {{ materialStatus(props.row) }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props" @click.stop>
              <q-btn
                flat
                round
                dense
                color="green-10"
                icon="edit_note"
                @click="openUsageDialog(props.row)"
              />
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory_2" size="28px" class="q-mr-sm" />
            Belum ada data pemakaian material.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showUsageDialog" persistent>
      <q-card class="usage-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
            <div class="text-caption">Input material yang dipakai pada proses produksi.</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveUsage">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nomor_spk"
                  outlined
                  dense
                  label="Nomor SPK"
                  :rules="[(val) => !!val || 'Nomor SPK wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nama_produk"
                  outlined
                  dense
                  label="Nama Produk"
                  :rules="[(val) => !!val || 'Nama produk wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nama_material"
                  outlined
                  dense
                  label="Nama Material"
                  :rules="[(val) => !!val || 'Nama material wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.qty_incoming"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Qty Incoming"
                  :rules="[(val) => Number(val) >= 0 || 'Qty incoming wajib valid']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.qty_dipakai"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Qty Dipakai"
                  :rules="[(val) => Number(val) >= 0 || 'Qty dipakai wajib valid']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  :model-value="formQtySisa"
                  outlined
                  dense
                  readonly
                  label="Qty Sisa"
                  :class="formQtySisa < 0 ? 'shortage-field' : ''"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.reject_material"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Reject Material"
                  :rules="[(val) => Number(val) >= 0 || 'Reject material wajib valid']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.line_produksi"
                  outlined
                  dense
                  label="Line Produksi"
                  :rules="[(val) => !!val || 'Line produksi wajib diisi']"
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
                <q-input
                  v-model="form.tanggal_penggunaan"
                  outlined
                  dense
                  type="date"
                  label="Tanggal Penggunaan"
                  :rules="[(val) => !!val || 'Tanggal penggunaan wajib diisi']"
                />
              </div>
            </div>

            <q-banner v-if="formQtySisa < 0" rounded class="shortage-banner q-mt-md">
              <template #avatar>
                <q-icon name="warning_amber" color="negative" />
              </template>
              Material kurang {{ formatNumber(Math.abs(formQtySisa)) }} dari qty incoming.
            </q-banner>
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
            <q-btn
              unelevated
              rounded
              color="green-10"
              icon="save"
              label="Simpan Material Usage"
              no-caps
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
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

const COLLECTION_NAME = 'material_usage_manufaktur'
const statusOptions = ['READY', 'KURANG_MATERIAL', 'HABIS']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const statusFilter = ref('all')
const showUsageDialog = ref(false)
const selectedRow = ref(null)
let unsubscribeUsage = null

const defaultForm = () => ({
  nomor_spk: '',
  nama_produk: '',
  nama_material: '',
  qty_incoming: null,
  qty_dipakai: null,
  reject_material: 0,
  line_produksi: '',
  pic_produksi: '',
  tanggal_penggunaan: new Date().toISOString().slice(0, 10),
})

const form = ref(defaultForm())

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'nama_material', align: 'left', label: 'Nama Material', field: 'nama_material', sortable: true },
  { name: 'qty_incoming', align: 'right', label: 'Qty Incoming', field: 'qty_incoming', sortable: true },
  { name: 'qty_dipakai', align: 'right', label: 'Qty Dipakai', field: 'qty_dipakai', sortable: true },
  { name: 'qty_sisa', align: 'right', label: 'Qty Sisa', field: 'qty_sisa', sortable: true },
  {
    name: 'reject_material',
    align: 'right',
    label: 'Reject Material',
    field: 'reject_material',
    sortable: true,
  },
  { name: 'line_produksi', align: 'left', label: 'Line Produksi', field: 'line_produksi' },
  { name: 'pic_produksi', align: 'left', label: 'PIC Produksi', field: 'pic_produksi' },
  {
    name: 'tanggal_penggunaan',
    align: 'left',
    label: 'Tanggal Penggunaan',
    field: 'tanggal_penggunaan',
  },
  { name: 'status', align: 'center', label: 'Status Material', field: 'status_material' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const rowsWithComputed = computed(() =>
  rows.value.map((row) => ({
    ...row,
    qty_sisa: qtySisa(row),
    status_material: materialStatus(row),
  })),
)

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rowsWithComputed.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status_material === statusFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_spk,
        row.nama_produk,
        row.nama_material,
        row.line_produksi,
        row.pic_produksi,
        row.status_material,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const shortageRows = computed(() =>
  rowsWithComputed.value.filter((row) => row.status_material === 'KURANG_MATERIAL'),
)

const summaryCards = computed(() => [
  {
    title: 'Total Material',
    value: formatNumber(rows.value.reduce((sum, row) => sum + Number(row.qty_incoming || 0), 0)),
    icon: 'inventory_2',
    color: 'green-10',
  },
  {
    title: 'Material Dipakai',
    value: formatNumber(rows.value.reduce((sum, row) => sum + Number(row.qty_dipakai || 0), 0)),
    icon: 'precision_manufacturing',
    color: 'blue-grey-7',
  },
  {
    title: 'Sisa Material',
    value: formatNumber(rowsWithComputed.value.reduce((sum, row) => sum + row.qty_sisa, 0)),
    icon: 'inventory',
    color: 'orange-9',
  },
  {
    title: 'Reject Material',
    value: formatNumber(rows.value.reduce((sum, row) => sum + Number(row.reject_material || 0), 0)),
    icon: 'report_problem',
    color: 'negative',
  },
])

const dialogTitle = computed(() =>
  selectedRow.value ? 'Update Material Usage' : 'Input Material Usage',
)

const formQtySisa = computed(
  () =>
    Number(form.value.qty_incoming || 0) -
    Number(form.value.qty_dipakai || 0) -
    Number(form.value.reject_material || 0),
)

const qtySisa = (row) =>
  Number(row.qty_incoming || 0) - Number(row.qty_dipakai || 0) - Number(row.reject_material || 0)

const materialStatus = (row) => {
  const sisa = qtySisa(row)
  if (sisa < 0) return 'KURANG_MATERIAL'
  if (sisa === 0) return 'HABIS'
  return 'READY'
}

const statusColor = (status) => {
  const colors = {
    READY: 'green-10',
    KURANG_MATERIAL: 'negative',
    HABIS: 'blue-grey-7',
  }
  return colors[status] || 'grey-6'
}

const rowClass = (row) => (materialStatus(row) === 'KURANG_MATERIAL' ? 'row-shortage' : '')

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDate = (value) => {
  if (!value) return '-'
  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const openUsageDialog = (row = null) => {
  selectedRow.value = row
  form.value = row
    ? {
        nomor_spk: row.nomor_spk || '',
        nama_produk: row.nama_produk || '',
        nama_material: row.nama_material || '',
        qty_incoming: Number(row.qty_incoming || 0),
        qty_dipakai: Number(row.qty_dipakai || 0),
        reject_material: Number(row.reject_material || 0),
        line_produksi: row.line_produksi || '',
        pic_produksi: row.pic_produksi || '',
        tanggal_penggunaan: row.tanggal_penggunaan || new Date().toISOString().slice(0, 10),
      }
    : defaultForm()
  showUsageDialog.value = true
}

const saveUsage = async () => {
  submitting.value = true
  const payload = {
    ...form.value,
    qty_incoming: Number(form.value.qty_incoming || 0),
    qty_dipakai: Number(form.value.qty_dipakai || 0),
    reject_material: Number(form.value.reject_material || 0),
    qty_sisa: formQtySisa.value,
    status_material:
      formQtySisa.value < 0 ? 'KURANG_MATERIAL' : formQtySisa.value === 0 ? 'HABIS' : 'READY',
    updated_at: serverTimestamp(),
  }

  try {
    if (selectedRow.value?.id) {
      await updateDoc(doc(db, COLLECTION_NAME, selectedRow.value.id), payload)
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
      })
    }
    showUsageDialog.value = false
    $q.notify({ type: 'positive', message: 'Pemakaian material berhasil disimpan' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan pemakaian material' })
  } finally {
    submitting.value = false
  }
}

const loadMaterialUsage = () => {
  loading.value = true
  if (unsubscribeUsage) unsubscribeUsage()

  const usageQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeUsage = onSnapshot(
    usageQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((usageDoc) => ({
        id: usageDoc.id,
        qty_incoming: 0,
        qty_dipakai: 0,
        reject_material: 0,
        ...usageDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat pemakaian material' })
    },
  )
}

onMounted(loadMaterialUsage)

onUnmounted(() => {
  if (unsubscribeUsage) unsubscribeUsage()
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
.usage-dialog {
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
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
  margin-top: 5px;
}

.shortage-banner {
  background: #fff5f5;
  border: 1px solid #ffc9c9;
  color: #8a1f1f;
}

.material-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.material-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.material-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.row-shortage {
  background: #fffafa;
}

.warning-text {
  color: #c10015;
  font-size: 11px;
  font-weight: 800;
  margin-top: 2px;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 118px;
  justify-content: center;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.usage-dialog {
  max-width: 95vw;
  width: 820px;
}

.shortage-field :deep(.q-field__control) {
  background: #fff5f5;
}

.shortage-field :deep(input) {
  color: #c10015;
  font-weight: 900;
}
</style>
