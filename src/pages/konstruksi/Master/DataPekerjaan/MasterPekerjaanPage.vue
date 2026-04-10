<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Pekerjaan</div>
        <div class="text-caption text-grey-7">
          Standarisasi item pekerjaan dan pemetaan akun akuntansi (COA).
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Pekerjaan"
          no-caps
          class="rounded-borders"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari pekerjaan...">
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
              @click="hapusPekerjaan(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 450px; max-width: 95vw; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-grey-8">
            {{ isEditMode ? 'Edit Data Pekerjaan' : 'Tambah Data Pekerjaan' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-my-md" />

        <q-card-section class="q-pa-md q-gutter-y-md">
          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Tipe</div>
            <q-select
              outlined
              dense
              v-model="form.tipe"
              :options="['Pekerjaan', 'Jasa', 'Lainnya']"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Nama Pekerjaan</div>
            <q-input outlined dense v-model="form.nama" bg-color="white" />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Satuan</div>
            <q-select
              outlined
              dense
              v-model="form.satuan"
              :options="['m2', 'm3', 'Kg', 'M1', 'Lot', 'Unit']"
              label="Pilih Satuan"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Harga</div>
            <q-input outlined dense v-model.number="form.harga" type="number" bg-color="white" />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">COA Inventori</div>
            <q-select
              outlined
              dense
              v-model="form.coa_inventori"
              :options="['1-1001 Kas', '1-2001 Persediaan Barang']"
              label="Pilih Coa"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">COA HPP</div>
            <q-select
              outlined
              dense
              v-model="form.coa_hpp"
              :options="['5-1001 HPP Pekerjaan', '5-1002 HPP Jasa']"
              label="Pilih Coa"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Aktif</div>
            <q-select
              outlined
              dense
              v-model="form.status_aktif"
              :options="['Ya', 'Tidak']"
              bg-color="white"
            />
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
            @click="simpanPekerjaan"
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
  tipe: 'Pekerjaan',
  nama: '',
  satuan: null,
  harga: 0,
  coa_inventori: null,
  coa_hpp: null,
  status_aktif: 'Ya',
}

const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA PEKERJAAN', field: 'nama', sortable: true },
  { name: 'tipe', align: 'left', label: 'TIPE', field: 'tipe' },
  { name: 'satuan', align: 'center', label: 'SATUAN', field: 'satuan' },
  {
    name: 'harga',
    align: 'right',
    label: 'HARGA',
    field: 'harga',
    format: (val) => `Rp ${val.toLocaleString()}`,
  },
  { name: 'status', align: 'center', label: 'AKTIF', field: 'status_aktif' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  {
    id: 1,
    tipe: 'Pekerjaan',
    nama: 'Galian Tanah',
    satuan: 'm3',
    harga: 50000,
    coa_inventori: '1-2001 Persediaan Barang',
    coa_hpp: '5-1001 HPP Pekerjaan',
    status_aktif: 'Ya',
  },
])

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

const simpanPekerjaan = () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Pekerjaan wajib diisi!' })
    return
  }

  if (isEditMode.value) {
    const index = rows.value.findIndex((r) => r.id === form.value.id)
    rows.value[index] = { ...form.value }
    $q.notify({ color: 'positive', message: 'Data berhasil diperbarui!' })
  } else {
    rows.value.unshift({ ...form.value, id: Date.now() })
    $q.notify({ color: 'positive', message: 'Data berhasil disimpan!' })
  }
  showDialog.value = false
}

const hapusPekerjaan = (data) => {
  $q.dialog({
    title: 'Hapus',
    message: `Yakin ingin menghapus ${data.nama}?`,
    cancel: true,
  }).onOk(() => {
    rows.value = rows.value.filter((r) => r.id !== data.id)
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.text-subtitle2 {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}
</style>
