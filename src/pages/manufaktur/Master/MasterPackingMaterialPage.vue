<template>
  <q-page class="packing-master-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Master Packing Material
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Material Kemasan Produksi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Kelola jenis kemasan, stok, satuan, minimum stock, dan status aktif untuk proses Packing Produksi.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none row q-gutter-sm">
        <q-btn
          flat
          rounded
          color="green-10"
          icon="sync"
          label="Refresh"
          no-caps
          class="bg-white shadow-1 q-px-lg"
          :loading="loading"
          @click="loadRows"
        />
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add"
          label="Tambah Material"
          no-caps
          class="q-px-lg"
          @click="openDialog()"
        />
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
              placeholder="Cari material, satuan, atau status..."
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
        class="master-table"
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
            <q-td key="nama_material" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_material || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.kode_material || '-' }}</div>
            </q-td>
            <q-td key="stok" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.stok) }}
            </q-td>
            <q-td key="satuan" :props="props">{{ props.row.satuan || '-' }}</q-td>
            <q-td key="minimum_stock" :props="props">
              {{ formatNumber(props.row.minimum_stock) }}
            </q-td>
            <q-td key="status_stock" :props="props">
              <q-chip dense text-color="white" :color="stockColor(props.row)">
                {{ stockLabel(props.row) }}
              </q-chip>
            </q-td>
            <q-td key="aktif" :props="props">
              <q-toggle
                :model-value="props.row.aktif !== false"
                color="green-10"
                :disable="updatingId === props.row.id"
                @update:model-value="(value) => toggleActive(props.row, value)"
              />
            </q-td>
            <q-td key="updated_at" :props="props">
              {{ formatDateTime(props.row.updated_at) }}
            </q-td>
            <q-td key="aksi" :props="props">
              <div class="row no-wrap justify-center q-gutter-xs">
                <q-btn flat round dense color="green-10" icon="edit" @click="openDialog(props.row)">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="negative" icon="block" @click="deactivate(props.row)">
                  <q-tooltip>Nonaktifkan</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory" size="28px" class="q-mr-sm" />
            Belum ada master packing material.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent :maximized="$q.screen.lt.md" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="material-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
            <div class="text-caption">Collection: master_packing_material</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveMaterial">
          <q-card-section class="q-pa-md q-pa-lg-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="form.kode_material" outlined dense label="Kode Material" />
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
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.stok"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Stok"
                  :rules="[(val) => Number(val) >= 0 || 'Stok wajib valid']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.satuan"
                  outlined
                  dense
                  label="Satuan"
                  :rules="[(val) => !!val || 'Satuan wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.minimum_stock"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Minimum Stock"
                  :rules="[(val) => Number(val) >= 0 || 'Minimum stock wajib valid']"
                />
              </div>
              <div class="col-12">
                <q-toggle v-model="form.aktif" color="green-10" label="Aktif untuk dropdown packing" />
              </div>
              <div class="col-12">
                <q-input v-model="form.catatan" outlined dense type="textarea" autogrow label="Catatan" />
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
              label="Simpan"
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

const COLLECTION_NAME = 'master_packing_material'

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const updatingId = ref(null)
const search = ref('')
const statusFilter = ref('all')
const dialog = ref(false)
const selectedRow = ref(null)
let unsubscribeRows = null

const statusOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Aktif', value: 'aktif' },
  { label: 'Nonaktif', value: 'nonaktif' },
  { label: 'Aman', value: 'aman' },
  { label: 'Minimum', value: 'minimum' },
  { label: 'Kritis', value: 'kritis' },
]

const columns = [
  { name: 'nama_material', align: 'left', label: 'Material', field: 'nama_material', sortable: true },
  { name: 'stok', align: 'right', label: 'Stok', field: 'stok', sortable: true },
  { name: 'satuan', align: 'left', label: 'Satuan', field: 'satuan', sortable: true },
  { name: 'minimum_stock', align: 'right', label: 'Minimum Stock', field: 'minimum_stock', sortable: true },
  { name: 'status_stock', align: 'center', label: 'Status Stock' },
  { name: 'aktif', align: 'center', label: 'Aktif' },
  { name: 'updated_at', align: 'left', label: 'Update Terakhir', field: 'updated_at', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const defaultForm = () => ({
  kode_material: '',
  nama_material: '',
  stok: 0,
  satuan: '',
  minimum_stock: 0,
  aktif: true,
  catatan: '',
})

const form = ref(defaultForm())

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const active = row.aktif !== false
    const stock = stockLabel(row).toLowerCase()
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'aktif' && active) ||
      (statusFilter.value === 'nonaktif' && !active) ||
      statusFilter.value === stock
    const matchesSearch =
      !keyword ||
      [row.kode_material, row.nama_material, row.satuan, active ? 'aktif' : 'nonaktif']
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  { title: 'Total Material', value: rows.value.length, icon: 'inventory', color: 'green-10' },
  { title: 'Aktif', value: rows.value.filter((row) => row.aktif !== false).length, icon: 'toggle_on', color: 'positive' },
  { title: 'Nonaktif', value: rows.value.filter((row) => row.aktif === false).length, icon: 'toggle_off', color: 'grey-7' },
  {
    title: 'Minimum',
    value: rows.value.filter((row) => stockLabel(row) === 'Minimum').length,
    icon: 'warning',
    color: 'orange-9',
  },
  {
    title: 'Kritis',
    value: rows.value.filter((row) => stockLabel(row) === 'Kritis').length,
    icon: 'priority_high',
    color: 'negative',
  },
])

const dialogTitle = computed(() => (selectedRow.value ? 'Edit Packing Material' : 'Tambah Packing Material'))

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

const stockLabel = (row) => {
  const stock = Number(row.stok || 0)
  const minimum = Number(row.minimum_stock || 0)
  if (stock <= 0 || (minimum > 0 && stock <= minimum * 0.5)) return 'Kritis'
  if (minimum > 0 && stock <= minimum) return 'Minimum'
  return 'Aman'
}

const stockColor = (row) => {
  const label = stockLabel(row)
  if (label === 'Kritis') return 'negative'
  if (label === 'Minimum') return 'orange-9'
  return 'green-10'
}

const openDialog = (row = null) => {
  selectedRow.value = row
  form.value = row
    ? {
        kode_material: row.kode_material || '',
        nama_material: row.nama_material || '',
        stok: Number(row.stok || 0),
        satuan: row.satuan || '',
        minimum_stock: Number(row.minimum_stock || 0),
        aktif: row.aktif !== false,
        catatan: row.catatan || '',
      }
    : defaultForm()
  dialog.value = true
}

const saveMaterial = async () => {
  submitting.value = true
  const payload = {
    kode_material: form.value.kode_material || '',
    nama_material: form.value.nama_material,
    stok: Number(form.value.stok || 0),
    satuan: form.value.satuan,
    minimum_stock: Number(form.value.minimum_stock || 0),
    status_stock: stockLabel(form.value),
    aktif: !!form.value.aktif,
    catatan: form.value.catatan || '',
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
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Master packing material berhasil disimpan' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan master packing material' })
  } finally {
    submitting.value = false
  }
}

const toggleActive = async (row, value) => {
  updatingId.value = row.id
  try {
    await updateDoc(doc(db, COLLECTION_NAME, row.id), {
      aktif: !!value,
      updated_at: serverTimestamp(),
    })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal update status material' })
  } finally {
    updatingId.value = null
  }
}

const deactivate = (row) => {
  $q.dialog({
    title: 'Nonaktifkan Material',
    message: `Nonaktifkan ${row.nama_material || 'material'} dari dropdown packing?`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Nonaktifkan' },
  }).onOk(() => toggleActive(row, false))
}

const loadRows = () => {
  loading.value = true
  if (unsubscribeRows) unsubscribeRows()

  unsubscribeRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('nama_material', 'asc')),
    (snapshot) => {
      rows.value = snapshot.docs.map((itemDoc) => ({
        id: itemDoc.id,
        stok: 0,
        minimum_stock: 0,
        aktif: true,
        ...itemDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat master packing material' })
    },
  )
}

onMounted(loadRows)

onUnmounted(() => {
  if (unsubscribeRows) unsubscribeRows()
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
.material-dialog {
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

.master-table :deep(thead tr th) {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.5px;
  padding: 14px 16px;
  text-transform: uppercase;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.material-dialog {
  max-width: 95vw;
  width: 760px;
}

@media (max-width: 1023px) {
  .material-dialog {
    border-radius: 0;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    width: 100%;
  }
}
</style>
