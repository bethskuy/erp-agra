<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Satuan</div>
        <div class="text-caption text-grey-7">
          Kelola daftar satuan ukuran material dan jasa (Unit of Measurement).
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Satuan"
          no-caps
          class="rounded-borders"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari satuan...">
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
              @click="hapusSatuan(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 400px; max-width: 95vw; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none text-grey-8">
          <div class="text-h6 text-weight-bold">
            {{ isEditMode ? 'Edit Satuan' : 'Tambah Satuan' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-my-md" />

        <q-card-section class="q-pa-md q-gutter-y-md">
          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Nama Satuan / Simbol</div>
            <q-input
              outlined
              dense
              v-model="form.nama"
              placeholder="Contoh: m3, Kg, Sack, Ls"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Keterangan Panjang</div>
            <q-input
              outlined
              dense
              v-model="form.keterangan"
              placeholder="Contoh: Meter Kubik, Kilogram"
              bg-color="white"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md q-gutter-sm">
          <q-btn outline label="Tutup" color="negative" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Simpan"
            color="orange"
            class="text-white q-px-lg"
            @click="simpanSatuan"
            no-caps
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
  { name: 'nama', align: 'left', label: 'SIMBOL / SATUAN', field: 'nama', sortable: true },
  { name: 'keterangan', align: 'left', label: 'KETERANGAN', field: 'keterangan' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  { id: 1, nama: 'm3', keterangan: 'Meter Kubik' },
  { id: 2, nama: 'Kg', keterangan: 'Kilogram' },
  { id: 3, nama: 'Sack', keterangan: 'Kantong / Karung' },
  { id: 4, nama: 'Ls', keterangan: 'Lump Sum' },
])

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  showDialog.value = true
}

const simpanSatuan = () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Satuan wajib diisi!' })
    return
  }

  if (isEditMode.value) {
    const idx = rows.value.findIndex((r) => r.id === form.value.id)
    rows.value[idx] = { ...form.value }
    $q.notify({ color: 'positive', message: 'Satuan diperbarui' })
  } else {
    rows.value.unshift({ ...form.value, id: Date.now() })
    $q.notify({ color: 'positive', message: 'Satuan berhasil ditambah' })
  }
  showDialog.value = false
}

const hapusSatuan = (data) => {
  $q.dialog({
    title: 'Hapus',
    message: `Yakin hapus satuan ${data.nama}?`,
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
