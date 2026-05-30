<template>
  <q-page class="master-departemen-page q-pa-md q-pa-lg-lg">
    <div class="page-header row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bolder text-green-10">Master Departemen</div>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          Kelola departemen produksi untuk workflow, monitoring, tracking progress, dan dashboard
          per departemen.
        </div>
      </div>

      <q-btn
        unelevated
        rounded
        color="green-10"
        icon="add"
        label="Tambah Departemen"
        no-caps
        class="q-mt-md q-mt-md-none"
        @click="openDialog()"
      />
    </div>

    <q-card flat bordered class="filter-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-7">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari kode, nama departemen, PIC, atau deskripsi..."
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
              <template #append v-if="search">
                <q-icon name="close" class="cursor-pointer" @click="search = ''" />
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
              {{ filteredRows.length }} DEPARTEMEN
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card">
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
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body-cell-nama_departemen="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar
                size="36px"
                color="green-1"
                text-color="green-10"
                icon="corporate_fare"
                class="q-mr-md"
              />
              <div>
                <div class="text-weight-bold text-green-10">
                  {{ props.row.nama_departemen || '-' }}
                </div>
                <div class="text-caption text-grey-6">{{ props.row.kode_departemen || '-' }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              dense
              square
              text-color="white"
              :color="props.row.status === 'Aktif' ? 'positive' : 'grey-7'"
              class="status-chip"
            >
              {{ props.row.status || '-' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-created_at="props">
          <q-td :props="props">
            {{ formatDate(props.row.created_at) }}
          </q-td>
        </template>

        <template #body-cell-aksi="props">
          <q-td :props="props" @click.stop>
            <q-btn flat round dense color="green-10" icon="edit" @click="openDialog(props.row)">
              <q-tooltip>Edit departemen</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Hapus departemen</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="corporate_fare" size="28px" class="q-mr-sm" />
            Belum ada data departemen.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card class="departemen-dialog">
        <q-toolbar class="bg-green-10 text-white">
          <q-icon name="corporate_fare" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold">
            {{ selectedId ? 'Edit Departemen' : 'Tambah Departemen' }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </q-toolbar>

        <q-form @submit.prevent="saveRow">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.trim="form.kode_departemen"
                  outlined
                  label="Kode Departemen"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.trim="form.nama_departemen"
                  outlined
                  label="Nama Departemen"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model.trim="form.pic" outlined label="PIC" />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.status"
                  :options="statusOptions"
                  outlined
                  label="Status"
                  :rules="[required]"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model.trim="form.deskripsi"
                  outlined
                  type="textarea"
                  autogrow
                  label="Deskripsi"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" color="grey-7" no-caps @click="closeDialog" />
            <q-btn
              unelevated
              label="Simpan Departemen"
              color="green-10"
              icon="save"
              no-caps
              type="submit"
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
import { useQuasar, date } from 'quasar'
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
import { db } from 'src/boot/firebase'

const MANUFACTURING_DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'

const $q = useQuasar()
const rows = ref([])
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const statusFilter = ref('Semua')
const dialogOpen = ref(false)
const selectedId = ref(null)
let unsubscribeRows = null

const emptyForm = () => ({
  kode_departemen: '',
  nama_departemen: '',
  pic: '',
  deskripsi: '',
  status: 'Aktif',
})

const form = ref(emptyForm())
const statusOptions = ['Aktif', 'Nonaktif']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'Semua' },
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
]

const columns = [
  {
    name: 'nama_departemen',
    label: 'Departemen',
    field: 'nama_departemen',
    align: 'left',
    sortable: true,
  },
  { name: 'pic', label: 'PIC', field: 'pic', align: 'left', sortable: true },
  { name: 'deskripsi', label: 'Deskripsi', field: 'deskripsi', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'created_at', label: 'Dibuat', field: 'created_at', align: 'left', sortable: true },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const required = (val) => !!val || 'Field wajib diisi'

const filteredRows = computed(() => {
  const term = search.value.toLowerCase().trim()
  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'Semua' || row.status === statusFilter.value
    const matchesSearch =
      !term ||
      [row.kode_departemen, row.nama_departemen, row.pic, row.deskripsi]
        .join(' ')
        .toLowerCase()
        .includes(term)

    return matchesStatus && matchesSearch
  })
})

const notify = (type, message) => {
  $q.notify({ type, message, position: 'top-right', timeout: 2200 })
}

const formatDate = (value) => {
  if (!value) return '-'
  const rawDate = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(rawDate.getTime())) return '-'
  return date.formatDate(rawDate, 'DD MMM YYYY HH:mm')
}

const openDialog = (row = null) => {
  selectedId.value = row?.id || null
  form.value = row
    ? {
        ...emptyForm(),
        kode_departemen: row.kode_departemen || '',
        nama_departemen: row.nama_departemen || '',
        pic: row.pic || '',
        deskripsi: row.deskripsi || '',
        status: row.status || 'Aktif',
      }
    : emptyForm()
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  selectedId.value = null
  form.value = emptyForm()
}

const payloadFromForm = () => ({
  kode_departemen: form.value.kode_departemen,
  nama_departemen: form.value.nama_departemen,
  pic: form.value.pic,
  deskripsi: form.value.deskripsi,
  status: form.value.status,
})

const saveRow = async () => {
  saving.value = true
  try {
    const payload = payloadFromForm()
    if (selectedId.value) {
      await updateDoc(doc(db, MANUFACTURING_DEPARTEMEN_COLLECTION, selectedId.value), {
        ...payload,
        updated_at: serverTimestamp(),
      })
      notify('positive', 'Departemen berhasil diperbarui.')
    } else {
      await addDoc(collection(db, MANUFACTURING_DEPARTEMEN_COLLECTION), {
        ...payload,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      notify('positive', 'Departemen berhasil ditambahkan.')
    }
    closeDialog()
  } catch (error) {
    console.error(error)
    notify('negative', 'Gagal menyimpan departemen.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Departemen',
    message: `Hapus departemen ${row.nama_departemen || row.kode_departemen}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, MANUFACTURING_DEPARTEMEN_COLLECTION, row.id))
      notify('positive', 'Departemen berhasil dihapus.')
    } catch (error) {
      console.error(error)
      notify('negative', 'Gagal menghapus departemen.')
    }
  })
}

onMounted(() => {
  loading.value = true
  unsubscribeRows = onSnapshot(
    query(collection(db, MANUFACTURING_DEPARTEMEN_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      rows.value = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      notify('negative', 'Gagal memuat data departemen.')
    },
  )
})

onUnmounted(() => {
  if (unsubscribeRows) unsubscribeRows()
})
</script>

<style scoped>
.master-departemen-page {
  background: #f4f7f5;
  min-height: 100%;
}

.page-header {
  gap: 16px;
}

.filter-card,
.table-card,
.departemen-dialog {
  border-radius: 8px;
  border-color: #dfe8df;
}

.table-card {
  overflow: hidden;
}

.departemen-dialog {
  width: min(96vw, 760px);
  max-width: 96vw;
}

.status-chip {
  min-width: 72px;
  justify-content: center;
}

@media (max-width: 700px) {
  .page-header {
    align-items: flex-start;
  }
}
</style>
