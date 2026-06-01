<template>
  <q-page class="master-material-page q-pa-md q-pa-lg-lg">
    <div class="page-header row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bolder text-green-10">Master Material</div>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          Referensi material produksi untuk PPIC, gudang, dan kebutuhan manufacturing.
        </div>
      </div>
      <q-btn
        unelevated
        rounded
        color="green-10"
        icon="add"
        label="Tambah Material Baru"
        no-caps
        class="q-mt-md q-mt-md-none text-weight-bold q-px-lg shadow-3"
        @click="openDialog()"
      />
    </div>

    <q-card class="filter-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              bg-color="white"
              debounce="250"
              placeholder="Cari kode material, nama material, kategori, tipe, atau supplier..."
            >
              <template #prepend><q-icon name="search" color="green-10" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="typeFilter"
              :options="typeFilterOptions"
              outlined
              dense
              rounded
              bg-color="white"
              emit-value
              map-options
              label="Tipe Material"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="statusFilter"
              :options="statusFilterOptions"
              outlined
              dense
              rounded
              bg-color="white"
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

    <q-card class="table-card">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold text-uppercase"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body-cell-foto="props">
          <q-td :props="props">
            <q-avatar rounded size="48px" class="material-thumb shadow-1">
              <q-img v-if="props.row.foto" :src="props.row.foto" :ratio="1" fit="cover" />
              <q-icon v-else name="inventory_2" color="grey-5" size="24px" />
            </q-avatar>
          </q-td>
        </template>

        <template #body-cell-nama_material="props">
          <q-td :props="props">
            <div class="text-weight-bold text-green-10">{{ props.row.nama_material || '-' }}</div>
            <div class="text-caption text-grey-6 text-weight-medium">
              {{ props.row.kode_material || '-' }}
            </div>
          </q-td>
        </template>

        <template #body-cell-tipe_material="props">
          <q-td :props="props">
            <q-chip dense outline color="teal" class="text-weight-bold">
              {{ props.row.tipe_material || '-' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-stok_minimal="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{ formatNumber(props.row.stok_minimal) }}
          </q-td>
        </template>

        <template #body-cell-lead_time="props">
          <q-td :props="props">
            <q-chip dense outline color="teal" class="text-weight-bold">
              {{ props.row.lead_time ? `${props.row.lead_time} hari` : '-' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              dense
              square
              text-color="white"
              :color="props.row.status === 'Aktif' ? 'positive' : 'grey-5'"
              class="status-chip text-weight-bold shadow-1"
            >
              {{ props.row.status || '-' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-aksi="props">
          <q-td :props="props" @click.stop>
            <q-btn flat round dense color="blue-8" icon="edit" @click="openDialog(props.row)">
              <q-tooltip>Edit material</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="red-8" icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Hapus material</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-6 q-pa-xl">
            <q-icon name="inventory_2" size="32px" class="q-mr-sm" />
            <span class="text-h6">Belum ada data material.</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card class="material-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <div>
            <div class="text-h6 text-weight-bold text-green-10">{{ dialogTitle }}</div>
            <div class="text-caption text-grey-7">Tambah Material Baru</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-7" @click="closeDialog" />
        </q-card-section>
        <q-separator />

        <q-form @submit.prevent="saveRow">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.kode_material"
                  outlined
                  bg-color="white"
                  label="Kode Material"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nama_material"
                  outlined
                  bg-color="white"
                  label="Nama Material"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.kategori"
                  outlined
                  bg-color="white"
                  label="Kategori"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.tipe_material"
                  :options="typeOptions"
                  outlined
                  bg-color="white"
                  label="Tipe Material"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.satuan"
                  outlined
                  bg-color="white"
                  label="Satuan"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.stok_minimal"
                  type="number"
                  outlined
                  bg-color="white"
                  label="Stok Minimal"
                  :rules="[nonNegative]"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.lead_time"
                  type="number"
                  outlined
                  bg-color="white"
                  label="Lead Time"
                  suffix="Hari"
                  :rules="[nonNegative]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.supplier_default"
                  outlined
                  bg-color="white"
                  label="Supplier Default"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.status"
                  :options="statusOptions"
                  outlined
                  bg-color="white"
                  label="Status"
                  :rules="[required]"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.deskripsi"
                  type="textarea"
                  outlined
                  bg-color="white"
                  label="Deskripsi"
                  autogrow
                />
              </div>
              <div class="col-12">
                <div class="row q-col-gutter-md items-center">
                  <div class="col-auto">
                    <q-avatar rounded size="96px" class="image-preview shadow-1">
                      <q-img v-if="imagePreview" :src="imagePreview" :ratio="1" fit="cover" />
                      <q-icon v-else name="image" color="grey-4" size="42px" />
                    </q-avatar>
                  </div>
                  <div class="col">
                    <q-file
                      v-model="fotoFile"
                      outlined
                      bg-color="white"
                      accept="image/*"
                      label="Upload Foto"
                      clearable
                      max-file-size="3145728"
                      @update:model-value="handleFotoChange"
                      @rejected="notify('negative', 'Ukuran foto maksimal 3 MB.')"
                    >
                      <template #prepend>
                        <q-icon name="photo_camera" color="green-10" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" color="grey-8" no-caps @click="closeDialog" />
            <q-btn
              unelevated
              label="Simpan Material"
              color="green-10"
              icon="save"
              no-caps
              type="submit"
              class="text-weight-bold"
              :loading="saving"
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
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { db, storage } from 'src/boot/firebase'

const COLLECTION_NAME = 'manufactur_master_barang'

const $q = useQuasar()
const rows = ref([])
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const typeFilter = ref('Semua')
const statusFilter = ref('Semua')
const showDialog = ref(false)
const selectedId = ref(null)
const fotoFile = ref(null)
const imagePreview = ref('')
let objectPreviewUrl = null
let unsubscribeRows = null

const typeOptions = ['RAW_MATERIAL', 'SEMI_FINISHED', 'FINISHED_GOOD', 'CONSUMABLE']
const statusOptions = ['Aktif', 'Nonaktif']
const typeFilterOptions = [
  { label: 'Semua Tipe', value: 'Semua' },
  ...typeOptions.map((type) => ({ label: type, value: type })),
]
const statusFilterOptions = [
  { label: 'Semua Status', value: 'Semua' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const emptyForm = () => ({
  kode_material: '',
  nama_material: '',
  kategori: '',
  tipe_material: 'RAW_MATERIAL',
  satuan: '',
  stok_minimal: 0,
  lead_time: 0,
  supplier_default: '',
  deskripsi: '',
  status: 'Aktif',
  foto: '',
})

const form = ref(emptyForm())

const columns = [
  { name: 'foto', label: 'Foto', field: 'foto', align: 'center' },
  {
    name: 'kode_material',
    label: 'Kode Material',
    field: 'kode_material',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nama_material',
    label: 'Nama Material',
    field: 'nama_material',
    align: 'left',
    sortable: true,
  },
  { name: 'kategori', label: 'Kategori', field: 'kategori', align: 'left', sortable: true },
  {
    name: 'tipe_material',
    label: 'Tipe Material',
    field: 'tipe_material',
    align: 'left',
    sortable: true,
  },
  {
    name: 'stok_minimal',
    label: 'Stok Minimal',
    field: 'stok_minimal',
    align: 'right',
    sortable: true,
  },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left', sortable: true },
  {
    name: 'lead_time',
    label: 'Lead Time',
    field: 'lead_time',
    align: 'center',
    sortable: true,
  },
  {
    name: 'supplier_default',
    label: 'Supplier Default',
    field: 'supplier_default',
    align: 'left',
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const required = (val) => !!val || 'Field wajib diisi'
const nonNegative = (val) => Number(val || 0) >= 0 || 'Wajib valid'
const dialogTitle = computed(() =>
  selectedId.value ? 'Edit Master Material' : 'Tambah Material Baru',
)

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const normalizeRow = (id, data = {}) => ({
  id,
  ...data,
  kode_material: data.kode_material || data.kode || data.kode_barang || '',
  nama_material: data.nama_material || data.nama || data.nama_barang || '',
  kategori: data.kategori || data.kategori_material || '',
  tipe_material: data.tipe_material || data.tipe || '',
  stok_minimal: Number(data.stok_minimal ?? data.stok_minimum ?? data.min_stok ?? 0),
  satuan: data.satuan || data.unit || '',
  lead_time: Number(data.lead_time ?? data.estimasi_waktu ?? 0),
  supplier_default: data.supplier_default || '',
  deskripsi: data.deskripsi || data.description || '',
  foto: data.foto || data.foto_url || data.foto_base64 || '',
  status: data.status || data.status_aktif || 'Aktif',
})

const filteredRows = computed(() => {
  const term = search.value.toLowerCase().trim()
  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'Semua' || row.status === statusFilter.value
    const matchesType = typeFilter.value === 'Semua' || row.tipe_material === typeFilter.value
    const matchesSearch =
      !term ||
      [
        row.kode_material,
        row.nama_material,
        row.kategori,
        row.tipe_material,
        row.satuan,
        row.supplier_default,
        row.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    return matchesStatus && matchesType && matchesSearch
  })
})

const notify = (type, message) => {
  $q.notify({ type, message, position: 'top-right', timeout: 2200 })
}

const revokeObjectPreview = () => {
  if (objectPreviewUrl) {
    URL.revokeObjectURL(objectPreviewUrl)
    objectPreviewUrl = null
  }
}

const handleFotoChange = (file) => {
  revokeObjectPreview()
  if (file) {
    objectPreviewUrl = URL.createObjectURL(file)
    imagePreview.value = objectPreviewUrl
    return
  }
  imagePreview.value = form.value.foto || ''
}

const openDialog = (row = null) => {
  revokeObjectPreview()
  selectedId.value = row?.id || null
  form.value = row ? { ...emptyForm(), ...row } : emptyForm()
  fotoFile.value = null
  imagePreview.value = form.value.foto || ''
  showDialog.value = true
}

const closeDialog = () => {
  revokeObjectPreview()
  showDialog.value = false
  selectedId.value = null
  fotoFile.value = null
  imagePreview.value = ''
  form.value = emptyForm()
}

const uploadFotoMaterial = async () => {
  if (!fotoFile.value) return form.value.foto || ''
  const extension = fotoFile.value.name?.split('.').pop() || 'jpg'
  const cleanCode = form.value.kode_material?.replace(/[^a-zA-Z0-9-_]/g, '-') || 'material'
  const path = `manufaktur/master/material/photos/${Date.now()}_${cleanCode}.${extension}`
  const fileRef = storageRef(storage, path)
  const snapshot = await uploadBytes(fileRef, fotoFile.value)
  return getDownloadURL(snapshot.ref)
}

const payloadFromForm = () => ({
  kode_material: form.value.kode_material,
  kode: form.value.kode_material,
  nama_material: form.value.nama_material,
  nama: form.value.nama_material,
  kategori: form.value.kategori,
  tipe_material: form.value.tipe_material,
  satuan: form.value.satuan,
  unit: form.value.satuan,
  stok_minimal: Number(form.value.stok_minimal || 0),
  stok_minimum: Number(form.value.stok_minimal || 0),
  lead_time: Number(form.value.lead_time || 0),
  supplier_default: form.value.supplier_default || '',
  deskripsi: form.value.deskripsi || '',
  status: form.value.status,
  status_aktif: form.value.status,
  foto: form.value.foto || '',
  foto_url: form.value.foto || '',
})

const saveRow = async () => {
  saving.value = true
  try {
    const fotoMaterialUrl = await uploadFotoMaterial()
    form.value.foto = fotoMaterialUrl
    const payload = payloadFromForm()
    if (selectedId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, selectedId.value), {
        ...payload,
        updated_at: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      notify('positive', 'Material berhasil diperbarui.')
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
        createdAt: serverTimestamp(),
        updated_at: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      notify('positive', 'Material berhasil ditambahkan.')
    }
    closeDialog()
  } catch (error) {
    console.error(error)
    notify('negative', 'Gagal menyimpan material.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Material',
    message: `Yakin ingin menghapus material ${row.nama_material || row.kode_material}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, row.id))
      notify('positive', 'Material berhasil dihapus.')
    } catch (error) {
      console.error(error)
      notify('negative', 'Gagal menghapus material.')
    }
  })
}

onMounted(() => {
  loading.value = true
  unsubscribeRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('nama', 'asc')),
    (snapshot) => {
      rows.value = snapshot.docs.map((item) => normalizeRow(item.id, item.data()))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      notify('negative', 'Gagal memuat data material.')
    },
  )
})

onUnmounted(() => {
  revokeObjectPreview()
  if (unsubscribeRows) unsubscribeRows()
})
</script>

<style scoped>
.master-material-page {
  min-height: 100vh;
  background: #f4f7f6;
}

.page-header,
.filter-card,
.table-card {
  background: #ffffff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(15, 60, 45, 0.05);
}

.page-header {
  padding: 24px;
}

.material-dialog {
  width: min(980px, 94vw);
  max-width: 94vw;
  border-radius: 12px;
}

.status-chip {
  min-width: 80px;
  justify-content: center;
  border-radius: 6px;
}

.material-thumb,
.image-preview {
  background: #f8fbf8;
  border: 1px dashed #b8d2bc;
}
</style>
