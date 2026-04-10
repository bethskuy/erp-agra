<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Barang</div>
        <div class="text-caption text-grey-7">
          Kelola daftar material, alat, dan inventaris proyek.
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Barang"
          no-caps
          class="rounded-borders"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari barang...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center">
            <q-btn
              flat
              round
              color="blue"
              icon="edit"
              size="sm"
              @click="openEditDialog(props.row)"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="hapusBarang(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-grey-8 text-weight-bold">Tambah Barang</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup class="text-grey-8" />
        </q-card-section>

        <q-separator class="q-my-md" />

        <q-card-section class="q-pa-md q-gutter-y-md">
          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Kode Barang</div>
            <q-input
              outlined
              dense
              v-model="form.kode"
              placeholder="kode akan digenerate otomatis"
              bg-color="white"
              class="placeholder-italic"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Nama Barang</div>
            <q-input outlined dense v-model="form.nama" bg-color="white" />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Unit</div>
            <q-select
              outlined
              dense
              v-model="form.unit"
              :options="['Sack', 'm3', 'Kg', 'Batang', 'Pcs', 'Lot']"
              label="Pilih Satuan"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Harga Beli</div>
            <q-input
              outlined
              dense
              v-model.number="form.harga_beli"
              type="number"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Kategori</div>
            <q-select
              outlined
              dense
              v-model="form.kategori"
              :options="['Beton', 'Material Alam', 'Besi', 'Alat Bantu']"
              label="Pilih Kategori"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Merk</div>
            <q-input outlined dense v-model="form.merk" bg-color="white" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md q-gutter-sm">
          <q-btn
            unelevated
            label="Tutup"
            color="negative"
            v-close-popup
            class="q-px-lg"
            no-caps
            style="border-radius: 6px"
          />
          <q-btn
            unelevated
            label="Simpan"
            color="positive"
            class="q-px-lg"
            @click="simpanBarang"
            no-caps
            style="border-radius: 6px"
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

const formDefault = {
  id: null,
  kode: '',
  nama: '',
  unit: null,
  harga_beli: 0,
  kategori: null,
  merk: '',
}

const form = ref({ ...formDefault })

const columns = [
  { name: 'kode', align: 'left', label: 'KODE', field: 'kode', sortable: true },
  { name: 'nama', align: 'left', label: 'NAMA BARANG', field: 'nama', sortable: true },
  { name: 'unit', align: 'center', label: 'UNIT', field: 'unit' },
  {
    name: 'harga',
    align: 'right',
    label: 'HARGA BELI',
    field: 'harga_beli',
    format: (val) => `Rp ${val.toLocaleString()}`,
  },
  { name: 'kategori', align: 'left', label: 'KATEGORI', field: 'kategori' },
  { name: 'merk', align: 'left', label: 'MERK', field: 'merk' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  {
    id: 1,
    kode: 'BRG-001',
    nama: 'Semen Tiga Roda',
    unit: 'Sack',
    harga_beli: 65000,
    kategori: 'Beton',
    merk: 'Indocement',
  },
])

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  showDialog.value = true
}

const simpanBarang = () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Barang wajib diisi!' })
    return
  }

  if (isEditMode.value) {
    const idx = rows.value.findIndex((r) => r.id === form.value.id)
    rows.value[idx] = { ...form.value }
    $q.notify({ color: 'positive', message: 'Data barang diperbarui' })
  } else {
    // Simulasi Generate Kode Otomatis jika kosong
    if (!form.value.kode) form.value.kode = 'BRG-' + Math.floor(Math.random() * 1000)
    rows.value.unshift({ ...form.value, id: Date.now() })
    $q.notify({ color: 'positive', message: 'Barang baru ditambahkan' })
  }
  showDialog.value = false
}

const hapusBarang = (data) => {
  $q.dialog({
    title: 'Hapus',
    message: `Yakin ingin menghapus ${data.nama}?`,
    cancel: true,
  }).onOk(() => {
    rows.value = rows.value.filter((r) => r.id !== data.id)
  })
}
</script>

<style>
.placeholder-italic .q-placeholder::placeholder {
  font-style: italic;
  color: #9e9e9e;
}
</style>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.text-subtitle2 {
  font-size: 13px;
  font-weight: 600;
}
</style>
