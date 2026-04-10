<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="viewMode === 'LIST'">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle1 text-weight-bold text-grey-9 uppercase">
          Data Permintaan Pembelian Material
        </div>
        <div class="row q-gutter-x-xs">
          <q-btn
            color="orange-9"
            icon="filter_alt"
            unelevated
            size="sm"
            class="q-px-sm"
            @click="showFilter = true"
          />
          <q-btn
            color="indigo-10"
            icon="add"
            label="Tambah Permintaan Pembelian"
            no-caps
            size="sm"
            unelevated
            @click="openForm"
          />
        </div>
      </div>

      <q-card flat bordered class="rounded-borders bg-white shadow-1">
        <q-card-section class="q-pa-none">
          <div class="row q-pa-md justify-end">
            <div class="row items-center q-gutter-x-sm">
              <div class="text-caption text-grey-7">Search:</div>
              <q-input outlined dense v-model="filter" bg-color="white" style="width: 250px">
                <template v-slot:append><q-icon name="search" /></template>
              </q-input>
            </div>
          </div>

          <q-table
            :rows="rowsPermintaan"
            :columns="colsPermintaan"
            row-key="id"
            flat
            :filter="filter"
            no-data-label="No data available in table"
            class="header-blue-grey"
          >
            <template v-slot:body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-chip
                  :color="getStatusColor(props.row.status)"
                  text-color="white"
                  dense
                  size="sm"
                >
                  {{ props.row.status }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-aksi="props">
              <q-td :props="props" class="text-center">
                <q-btn flat round icon="more_horiz" size="sm" color="grey-7">
                  <q-menu auto-close>
                    <q-list style="min-width: 100px">
                      <q-item clickable @click="viewDetail(props.row)">
                        <q-item-section avatar
                          ><q-icon name="visibility" color="primary" size="xs"
                        /></q-item-section>
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
          <div class="text-subtitle2 text-grey-8">Tambah Permintaan Pembelian Material</div>
        </q-card-section>
        <q-separator />

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6 q-gutter-y-sm">
              <div>
                <div class="text-caption text-grey-8">Nomor Permintaan</div>
                <q-input
                  v-model="form.nomor"
                  dense
                  outlined
                  placeholder="nomor akan digenerate otomatis"
                  readonly
                  bg-color="grey-1"
                />
              </div>
              <div>
                <div class="text-caption text-grey-8">Proyek</div>
                <q-select
                  v-model="form.proyek"
                  :options="proyekOptions"
                  dense
                  outlined
                  placeholder="- Pilih Proyek -"
                />
              </div>
              <div>
                <div class="text-caption text-grey-8">Tanggal Dibutuhkan</div>
                <q-input v-model="form.tgl_butuh" dense outlined type="date" />
              </div>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-sm">
              <div>
                <div class="text-caption text-grey-8">Diminta Oleh</div>
                <q-input v-model="form.peminta" dense outlined readonly bg-color="grey-1" />
              </div>
              <div>
                <div class="text-caption text-grey-8">Keterangan / Alasan Pembelian</div>
                <q-input v-model="form.keterangan" dense outlined type="textarea" rows="3" />
              </div>
            </div>
          </div>

          <div class="text-center q-my-lg">
            <div class="text-h6 text-grey-8 uppercase">Daftar Material yang Diminta</div>
          </div>

          <q-table
            :rows="form.items"
            :columns="materialCols"
            flat
            bordered
            hide-bottom
            separator="cell"
            class="header-blue-grey q-mb-md"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="no" class="text-center">{{ props.rowIndex + 1 }}</q-td>
                <q-td key="barang">
                  <q-select
                    v-model="props.row.barang"
                    :options="barangOptions"
                    dense
                    borderless
                    placeholder="Cari Material..."
                  />
                </q-td>
                <q-td key="qty">
                  <q-input
                    v-model.number="props.row.qty"
                    type="number"
                    dense
                    borderless
                    class="text-center"
                  />
                </q-td>
                <q-td key="satuan" class="text-center">
                  <q-select
                    v-model="props.row.satuan"
                    :options="['Pcs', 'M3', 'Zak', 'Kg', 'Batang']"
                    dense
                    borderless
                    class="text-center"
                  />
                </q-td>
                <q-td key="aksi" class="text-center">
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeMaterial(props.rowIndex)"
                  />
                </q-td>
              </q-tr>
            </template>
            <template v-slot:bottom-row>
              <q-tr>
                <q-td colspan="5" class="text-center">
                  <q-btn
                    flat
                    color="primary"
                    icon="add"
                    label="Tambah Baris Material"
                    no-caps
                    @click="addMaterial"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>

          <div class="row justify-end q-mt-md q-gutter-x-sm">
            <q-btn
              unelevated
              label="Batal"
              color="negative"
              @click="viewMode = 'LIST'"
              no-caps
              size="sm"
              class="q-px-md"
            />
            <q-btn
              unelevated
              label="Simpan Permintaan"
              color="positive"
              @click="savePermintaan"
              no-caps
              size="sm"
              class="q-px-md"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showFilter">
      <q-card style="width: 400px; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Filter Permintaan</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator class="q-my-sm" />
        <q-card-section class="q-pa-md q-gutter-y-md">
          <q-select
            outlined
            dense
            v-model="filterForm.proyek"
            :options="proyekOptions"
            label="Proyek"
          />
          <q-select
            outlined
            dense
            v-model="filterForm.status"
            :options="['Pending', 'Approved', 'Purchased']"
            label="Status"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Tutup" color="negative" no-caps v-close-popup />
          <q-btn label="Filter" color="positive" no-caps @click="showFilter = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const viewMode = ref('LIST')
const filter = ref('')
const showFilter = ref(false)

const filterForm = ref({ proyek: null, status: null })
const form = ref({
  nomor: '',
  proyek: null,
  tgl_butuh: '',
  peminta: 'Admin Proyek - Lapangan',
  keterangan: '',
  items: [{ barang: '', qty: 0, satuan: 'Pcs' }],
})

const proyekOptions = ['Villa Modern A1', 'Agra Town House B2']
const barangOptions = [
  'Semen Tiga Roda',
  'Pasir Pasang',
  'Besi 10mm',
  'Batu Bata Merah',
  'Kabel Eterna',
]

const colsPermintaan = [
  { name: 'nomor', align: 'left', label: 'No. Permintaan', field: 'nomor', sortable: true },
  { name: 'tanggal', align: 'left', label: 'Tgl. Butuh', field: 'tgl_butuh' },
  { name: 'proyek', align: 'left', label: 'Proyek', field: 'proyek' },
  { name: 'peminta', align: 'left', label: 'Diminta Oleh', field: 'peminta' },
  { name: 'status', align: 'center', label: 'Status', field: 'status' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const materialCols = [
  { name: 'no', label: 'No', align: 'center' },
  { name: 'barang', label: 'Nama Material', align: 'left' },
  { name: 'qty', label: 'Quantity', align: 'center' },
  { name: 'satuan', label: 'Satuan', align: 'center' },
  { name: 'aksi', label: 'Aksi', align: 'center' },
]

const rowsPermintaan = ref([
  {
    id: 1,
    nomor: 'PR/AGRA/2026/04/001',
    tgl_butuh: '2026-04-15',
    proyek: 'Villa Modern A1',
    peminta: 'Admin Proyek',
    status: 'Pending',
  },
])

const openForm = () => {
  form.value.nomor = `PR/AGRA/${new Date().getFullYear()}/04/${Math.floor(Math.random() * 1000)}`
  viewMode.value = 'FORM'
}

const addMaterial = () => form.value.items.push({ barang: '', qty: 0, satuan: 'Pcs' })
const removeMaterial = (index) => form.value.items.splice(index, 1)

const savePermintaan = () => {
  $q.notify({ color: 'positive', message: 'Permintaan Berhasil Dikirim ke Bag. Pembelian!' })
  viewMode.value = 'LIST'
}

const getStatusColor = (status) => {
  if (status === 'Pending') return 'orange'
  if (status === 'Approved') return 'blue'
  return 'positive'
}

const viewDetail = (row) => {
  $q.notify({ message: 'Detail: ' + row.nomor, color: 'info' })
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
}
.uppercase {
  text-transform: uppercase;
}
</style>
