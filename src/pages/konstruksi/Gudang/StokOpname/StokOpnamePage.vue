<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="viewMode === 'LIST'">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle1 text-weight-bold text-grey-9 uppercase">Data Stok Opname</div>
        <q-btn
          color="indigo-10"
          icon="add"
          label="Buat Opname Baru"
          no-caps
          size="sm"
          unelevated
          @click="openForm"
        />
      </div>

      <q-card flat bordered class="rounded-borders bg-white shadow-1">
        <q-card-section class="q-pa-none">
          <div class="row q-pa-md justify-end">
            <div class="row items-center q-gutter-x-sm">
              <div class="text-caption text-grey-7">Search:</div>
              <q-input
                outlined
                dense
                v-model="filter"
                placeholder="Cari Nomor/Gudang..."
                bg-color="white"
                style="width: 250px"
              >
                <template v-slot:append><q-icon name="search" /></template>
              </q-input>
            </div>
          </div>

          <q-table
            :rows="rowsOpname"
            :columns="colsOpname"
            flat
            :filter="filter"
            class="header-blue-grey"
          >
            <template v-slot:body-cell-aksi="props">
              <q-td :props="props" class="text-center">
                <q-btn flat round icon="more_horiz" size="sm" color="grey-7">
                  <q-menu auto-close>
                    <q-list style="min-width: 120px">
                      <q-item clickable @click="viewDetail(props.row)">
                        <q-item-section avatar
                          ><q-icon name="visibility" color="primary" size="xs"
                        /></q-item-section>
                        <q-item-section>Detail</q-item-section>
                      </q-item>
                      <q-item clickable @click="printOpname(props.row)">
                        <q-item-section avatar
                          ><q-icon name="print" color="grey-7" size="xs"
                        /></q-item-section>
                        <q-item-section>Cetak Report</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'FORM'">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-indigo-10 text-weight-bold uppercase">Input Stok Opname</div>
        <q-btn
          flat
          color="grey-7"
          icon="arrow_back"
          label="KEMBALI KE LIST"
          @click="viewMode = 'LIST'"
          no-caps
        />
      </div>

      <q-card flat bordered class="q-mb-md rounded-borders shadow-1 bg-white">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="form.nomor"
              label="Nomor Opname"
              outlined
              dense
              readonly
              bg-color="grey-1"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.tanggal" label="Tanggal Opname" outlined dense type="date" />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="form.gudang"
              :options="['Gudang Utama', 'Gudang Proyek']"
              label="Pilih Gudang"
              outlined
              dense
            />
          </div>
        </q-card-section>
      </q-card>

      <div class="text-subtitle2 text-grey-8 q-mb-xs uppercase font-weight-bold">
        Perhitungan Stok
      </div>
      <q-card flat bordered class="rounded-borders shadow-1 bg-white">
        <q-card-section class="q-pa-none">
          <q-table :rows="form.items" :columns="itemCols" flat hide-bottom separator="cell">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td class="text-center">{{ props.rowIndex + 1 }}</q-td>
                <q-td>
                  <q-select
                    v-model="props.row.barang"
                    :options="barangOptions"
                    dense
                    borderless
                    placeholder="Pilih Material..."
                  />
                </q-td>
                <q-td class="text-center bg-grey-1 text-grey-7">{{ props.row.stok_sistem }}</q-td>
                <q-td>
                  <q-input
                    v-model.number="props.row.stok_fisik"
                    dense
                    borderless
                    type="number"
                    class="text-center text-primary text-weight-bolder"
                  />
                </q-td>
                <q-td class="text-center">
                  <q-chip
                    :color="getSelisih(props.row) === 0 ? 'positive' : 'negative'"
                    text-color="white"
                    dense
                    size="sm"
                  >
                    {{ getSelisih(props.row) }}
                  </q-chip>
                </q-td>
                <q-td
                  ><q-input v-model="props.row.catatan" dense borderless placeholder="..."
                /></q-td>
                <q-td class="text-center">
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeItem(props.rowIndex)"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <div class="q-pa-sm row justify-center">
            <q-btn
              flat
              color="primary"
              icon="add"
              label="Tambah Material"
              no-caps
              @click="addItem"
            />
          </div>
        </q-card-section>
      </q-card>

      <div class="row justify-end q-mt-lg q-gutter-x-sm">
        <q-btn
          unelevated
          label="BATAL"
          color="negative"
          @click="viewMode = 'LIST'"
          no-caps
          class="q-px-md"
        />
        <q-btn
          unelevated
          label="SIMPAN & UPDATE STOK"
          color="positive"
          @click="saveOpname"
          no-caps
          class="q-px-lg"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const viewMode = ref('LIST')
const filter = ref('')

const form = ref({
  nomor: '',
  tanggal: new Date().toISOString().split('T')[0],
  gudang: 'Gudang Utama',
  items: [{ barang: 'Semen Tiga Roda', stok_sistem: 100, stok_fisik: 100, catatan: '' }],
})

const barangOptions = ['Semen Tiga Roda', 'Besi 10mm', 'Bata Ringan']

const colsOpname = [
  { name: 'nomor', align: 'left', label: 'No. Opname', field: 'nomor' },
  { name: 'tanggal', align: 'left', label: 'Tanggal', field: 'tanggal' },
  { name: 'gudang', align: 'left', label: 'Gudang', field: 'gudang' },
  { name: 'petugas', align: 'left', label: 'Petugas', field: 'petugas' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const itemCols = [
  { name: 'no', label: 'No', align: 'center' },
  { name: 'barang', label: 'Nama Material', align: 'left' },
  { name: 'sistem', label: 'Stok Sistem', align: 'center' },
  { name: 'fisik', label: 'Stok Fisik', align: 'center' },
  { name: 'selisih', label: 'Selisih', align: 'center' },
  { name: 'catatan', label: 'Catatan', align: 'left' },
  { name: 'aksi', label: '', align: 'center' },
]

const rowsOpname = ref([
  {
    id: 1,
    nomor: 'SO/AGRA/2026/04/001',
    tanggal: '2026-04-09',
    gudang: 'Gudang Utama',
    petugas: 'Admin Gudang',
  },
])

const openForm = () => {
  form.value = {
    nomor: `SO/AGRA/${new Date().getFullYear()}/04/${Math.floor(Math.random() * 1000)}`,
    tanggal: new Date().toISOString().split('T')[0],
    gudang: 'Gudang Utama',
    items: [{ barang: '', stok_sistem: 0, stok_fisik: 0, catatan: '' }],
  }
  viewMode.value = 'FORM'
}

const getSelisih = (row) => row.stok_fisik - row.stok_sistem
const addItem = () =>
  form.value.items.push({ barang: '', stok_sistem: 0, stok_fisik: 0, catatan: '' })
const removeItem = (idx) => form.value.items.splice(idx, 1)

const saveOpname = () => {
  $q.notify({ color: 'positive', message: 'Stok Opname berhasil disimpan!', icon: 'check' })
  viewMode.value = 'LIST'
}

const viewDetail = (row) => $q.notify({ message: `Detail ${row.nomor}`, color: 'info' })
const printOpname = (row) =>
  $q.notify({ message: `Mencetak report ${row.nomor}`, color: 'grey-8', icon: 'print' })
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
.header-blue-grey :deep(thead tr th) {
  background-color: #f1f4f7;
  color: #333;
  font-weight: bold;
}
.uppercase {
  text-transform: uppercase;
}
.text-indigo-10 {
  color: #1a237e !important;
}
</style>
