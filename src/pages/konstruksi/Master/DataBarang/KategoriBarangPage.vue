<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Kategori Inventori</div>
        <div class="text-caption text-grey-7">
          Kelola pemetaan akun dan pelacakan stok per kategori.
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
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari...">
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
              @click="hapusKategori(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-grey-8 text-weight-bold">Tambah Kategori Inventori</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup class="text-grey-8" />
        </q-card-section>

        <q-separator class="q-my-md" />

        <q-card-section class="q-pa-md q-gutter-y-md">
          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Nama Kategori</div>
            <q-input outlined dense v-model="form.nama" bg-color="white" />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Perlu Pelacakan Stok ?</div>
            <div class="q-gutter-sm">
              <q-radio v-model="form.track_stok" :val="true" label="Ya" color="primary" />
              <q-radio v-model="form.track_stok" :val="false" label="Tidak" color="primary" />
            </div>
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Akun Persediaan</div>
            <q-select
              outlined
              dense
              v-model="form.akun_persediaan"
              :options="['1-2001 Persediaan Material', '1-2002 Persediaan Alat']"
              label="Pilih Coa"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Akun COGS</div>
            <q-select
              outlined
              dense
              v-model="form.akun_cogs"
              :options="['5-1001 HPP Material', '5-1002 HPP Jasa']"
              label="Pilih Coa"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-9 q-mb-xs">Tipe :</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-checkbox
                  v-model="form.tipe"
                  val="Material"
                  label="Material"
                  color="orange"
                  keep-color
                />
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="form.tipe"
                  val="Jasa/Tukang"
                  label="Jasa/Tukang"
                  color="orange"
                  keep-color
                />
              </div>
              <div class="col-6">
                <q-checkbox v-model="form.tipe" val="Alat" label="Alat" color="orange" keep-color />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md q-gutter-sm">
          <q-btn
            outline
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
            color="orange"
            class="q-px-lg text-white"
            @click="simpanKategori"
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
  nama: '',
  track_stok: true,
  akun_persediaan: null,
  akun_cogs: null,
  tipe: [], // Array karena checkbox bisa pilih lebih dari satu
}

const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA KATEGORI', field: 'nama', sortable: true },
  {
    name: 'track',
    align: 'center',
    label: 'PELACAKAN STOK',
    field: (row) => (row.track_stok ? 'Ya' : 'Tidak'),
  },
  { name: 'tipe', align: 'left', label: 'TIPE', field: (row) => row.tipe.join(', ') },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  {
    id: 1,
    nama: 'Material Alam',
    track_stok: true,
    akun_persediaan: '1-2001',
    akun_cogs: '5-1001',
    tipe: ['Material'],
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

const simpanKategori = () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Kategori wajib diisi!' })
    return
  }

  if (isEditMode.value) {
    const idx = rows.value.findIndex((r) => r.id === form.value.id)
    rows.value[idx] = { ...form.value }
    $q.notify({ color: 'positive', message: 'Kategori diperbarui' })
  } else {
    rows.value.unshift({ ...form.value, id: Date.now() })
    $q.notify({ color: 'positive', message: 'Kategori berhasil disimpan' })
  }
  showDialog.value = false
}

const hapusKategori = (data) => {
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
