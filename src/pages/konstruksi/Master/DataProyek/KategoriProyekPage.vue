<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Kategori Proyek</div>
        <div class="text-caption text-grey-7">
          Kelola master data jenis atau kategori proyek konstruksi.
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Kategori"
          no-caps
          class="rounded-borders"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter" class="no-shadow">
        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="Cari kategori..."
            bg-color="white"
          >
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center">
            <q-btn flat round color="blue" icon="edit" size="sm" @click="openEditDialog(props.row)">
              <q-tooltip>Edit Kategori</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="hapusKategori(props.row)"
            >
              <q-tooltip>Hapus Kategori</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 400px; border-radius: 12px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ isEditMode ? 'Edit Kategori' : 'Tambah Kategori' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md q-gutter-y-sm">
          <div>
            <div class="text-subtitle2 q-mb-xs">Nama Kategori</div>
            <q-input
              outlined
              dense
              v-model="form.nama"
              placeholder="Contoh: Perumahan, Ruko, Infrastruktur"
              bg-color="white"
              autofocus
            />
          </div>
          <div>
            <div class="text-subtitle2 q-mb-xs">Keterangan</div>
            <q-input
              outlined
              dense
              v-model="form.keterangan"
              type="textarea"
              rows="3"
              bg-color="white"
              placeholder="Penjelasan singkat kategori..."
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            :label="isEditMode ? 'Simpan Perubahan' : 'Simpan Kategori'"
            color="primary"
            no-caps
            @click="simpanKategori"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const filter = ref('')
const showDialog = ref(false)
const isEditMode = ref(false)

const formDefault = { id: null, nama: '', keterangan: '' }
const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA KATEGORI', field: 'nama', sortable: true },
  { name: 'keterangan', align: 'left', label: 'KETERANGAN', field: 'keterangan' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

// Data Dummy
const rows = ref([
  { id: 1, nama: 'Perumahan', keterangan: 'Kategori untuk proyek residensial / cluster' },
  { id: 2, nama: 'Ruko', keterangan: 'Kategori untuk bangunan komersial rumah toko' },
  { id: 3, nama: 'Gedung', keterangan: 'Kategori untuk proyek high-rise atau perkantoran' },
])

// --- LOGIKA ---

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showDialog.value = true
}

const openEditDialog = (data) => {
  isEditMode.value = true
  form.value = { ...data }
  showDialog.value = true
}

const hapusKategori = (data) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus kategori "${data.nama}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    rows.value = rows.value.filter((r) => r.id !== data.id)
    $q.notify({ color: 'positive', message: 'Kategori berhasil dihapus', icon: 'delete' })
  })
}

const simpanKategori = () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Kategori tidak boleh kosong!' })
    return
  }

  if (isEditMode.value) {
    const index = rows.value.findIndex((r) => r.id === form.value.id)
    if (index !== -1) {
      rows.value[index] = { ...form.value }
    }
    $q.notify({ color: 'blue', message: 'Kategori diperbarui', icon: 'edit' })
  } else {
    rows.value.unshift({ ...form.value, id: Date.now() })
    $q.notify({ color: 'positive', message: 'Kategori baru ditambahkan', icon: 'check' })
  }
  showDialog.value = false
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.text-subtitle2 {
  font-size: 13px;
  color: #444;
  font-weight: 600;
}
</style>
