<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="viewMode === 'LIST'">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle1 text-weight-bold text-grey-9 uppercase">
          Data Pengeluaran Barang
        </div>
        <q-btn
          color="indigo-10"
          icon="add"
          label="Tambah Pengeluaran Barang"
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
              <q-input outlined dense v-model="filter" bg-color="white" style="width: 250px" />
            </div>
          </div>
          <q-table :rows="rowsPengeluaran" :columns="colsPengeluaran" flat class="header-blue-grey">
            <template v-slot:body-cell-aksi="props">
              <q-td :props="props" class="text-center">
                <q-btn flat round icon="more_horiz" size="sm" color="grey-7">
                  <q-menu auto-close>
                    <q-list style="min-width: 100px">
                      <q-item clickable @click="viewDetail(props.row)">
                        <q-item-section>Detail</q-item-section>
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
      <q-card flat bordered class="rounded-borders bg-white shadow-1">
        <q-card-section class="q-py-sm q-px-md bg-grey-1">
          <div class="text-subtitle2 text-grey-8">Tambah Pengeluaran Barang</div>
        </q-card-section>
        <q-separator />

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6 q-gutter-y-sm">
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 120px">
                  No. Pengeluaran
                </div>
                <q-input
                  v-model="form.no_pengeluaran"
                  dense
                  outlined
                  class="col"
                  placeholder="nomor akan digenerate otomatis"
                  readonly
                  bg-color="white"
                />
              </div>
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 120px">Tanggal</div>
                <q-input
                  v-model="form.tanggal"
                  dense
                  outlined
                  class="col"
                  type="date"
                  bg-color="white"
                />
              </div>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-sm">
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 100px">Asal</div>
                <q-select
                  v-model="form.asal"
                  :options="proyekOptions"
                  dense
                  outlined
                  class="col"
                  placeholder="- Pilih Proyek -"
                  bg-color="white"
                />
              </div>
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 100px">Tujuan</div>
                <q-select
                  v-model="form.tujuan"
                  :options="proyekOptions"
                  dense
                  outlined
                  class="col"
                  placeholder="- Pilih Proyek -"
                  bg-color="white"
                />
              </div>
            </div>
          </div>

          <div class="text-center q-my-xl">
            <div class="text-h5 text-grey-8 font-weight-bold">Item Tambah Pengeluaran Barang</div>
            <div class="text-caption text-grey-6 italic">
              Silahkan Masukkan Poin - Poin Tambah Pengeluaran Barang
            </div>
          </div>

          <q-table
            :rows="form.items"
            :columns="itemCols"
            flat
            bordered
            hide-bottom
            separator="cell"
            class="header-blue-grey q-mb-md"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="pekerjaan">
                  <q-select
                    v-model="props.row.pekerjaan"
                    :options="pekerjaanOptions"
                    dense
                    borderless
                    placeholder="Pilih Pekerjaan"
                  />
                </q-td>
                <q-td key="barang">
                  <q-select
                    v-model="props.row.barang"
                    :options="barangOptions"
                    dense
                    borderless
                    placeholder="Pilih Barang"
                  />
                </q-td>
                <q-td key="stock" class="text-center text-grey-7 bg-grey-1">{{
                  props.row.stock
                }}</q-td>
                <q-td key="quota" class="text-center text-grey-7 bg-grey-1">{{
                  props.row.quota
                }}</q-td>
                <q-td key="jumlah">
                  <q-input
                    v-model.number="props.row.jumlah"
                    dense
                    borderless
                    type="number"
                    class="text-center text-weight-bold text-primary"
                  />
                </q-td>
                <q-td key="satuan" class="text-center">{{ props.row.satuan }}</q-td>
                <q-td key="keterangan">
                  <q-input v-model="props.row.keterangan" dense borderless placeholder="..." />
                </q-td>
                <q-td key="aksi" class="text-center">
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
            <template v-slot:header-cell-aksi="props">
              <q-th :props="props">
                <q-btn color="orange-9" icon="add" size="xs" square @click="addItem" />
              </q-th>
            </template>
          </q-table>

          <div class="row justify-end q-mt-xl q-gutter-x-sm">
            <q-btn
              unelevated
              label="Batal"
              color="negative"
              @click="viewMode = 'LIST'"
              no-caps
              class="q-px-md"
            />
            <q-btn
              unelevated
              label="Simpan"
              color="positive"
              @click="savePengeluaran"
              no-caps
              class="q-px-md"
            />
          </div>
        </q-card-section>
      </q-card>
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
  no_pengeluaran: '',
  tanggal: '2026-04-09',
  asal: null,
  tujuan: null,
  items: [],
})

const proyekOptions = ['Gudang Pusat', 'Villa Modern Canggu', 'Agra Town House B2']
const pekerjaanOptions = ['Pekerjaan Pondasi', 'Pekerjaan Dinding', 'Pekerjaan Atap']
const barangOptions = ['Semen Tiga Roda', 'Besi 10mm', 'Pasir Pasang']

const itemCols = [
  { name: 'pekerjaan', label: 'Pekerjaan', align: 'left' },
  { name: 'barang', label: 'Barang', align: 'left' },
  { name: 'stock', label: 'Stock', align: 'center' },
  { name: 'quota', label: 'Quota RAP', align: 'center' },
  { name: 'jumlah', label: 'Jumlah', align: 'center' },
  { name: 'satuan', label: 'Satuan', align: 'center' },
  { name: 'keterangan', label: 'Keterangan', align: 'left' },
  { name: 'aksi', label: '', align: 'center' },
]

const colsPengeluaran = [
  { name: 'no', align: 'left', label: 'No. Pengeluaran', field: 'no_pengeluaran' },
  { name: 'tgl', align: 'left', label: 'Tanggal', field: 'tanggal' },
  { name: 'asal', align: 'left', label: 'Asal', field: 'asal' },
  { name: 'tujuan', align: 'left', label: 'Tujuan', field: 'tujuan' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const rowsPengeluaran = ref([])

const openForm = () => {
  form.value = {
    no_pengeluaran: '',
    tanggal: '2026-04-09',
    asal: null,
    tujuan: null,
    items: [
      {
        pekerjaan: '',
        barang: '',
        stock: 100,
        quota: 500,
        jumlah: 0,
        satuan: 'Pcs',
        keterangan: '',
      },
    ],
  }
  viewMode.value = 'FORM'
}

const addItem = () => {
  form.value.items.push({
    pekerjaan: '',
    barang: '',
    stock: 0,
    quota: 0,
    jumlah: 0,
    satuan: 'Pcs',
    keterangan: '',
  })
}

const removeItem = (idx) => {
  form.value.items.splice(idx, 1)
}

const savePengeluaran = () => {
  $q.notify({ color: 'positive', message: 'Data Pengeluaran Berhasil Disimpan!' })
  viewMode.value = 'LIST'
}

const viewDetail = (row) => {
  console.log('Detail:', row)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
.header-blue-grey :deep(thead tr th) {
  background-color: #f1f4f7;
  color: #333;
  font-weight: bold;
  font-size: 12px;
}
.bg-grey-1 {
  background-color: #f8f9fa;
}
</style>
