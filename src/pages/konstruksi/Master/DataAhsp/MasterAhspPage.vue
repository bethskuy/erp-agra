<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">
          Analisa Harga Satuan (AHSP)
        </div>
        <div class="text-caption text-grey-7">
          Daftar rincian biaya material, jasa, dan alat per item pekerjaan.
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah AHSP"
          no-caps
          class="rounded-borders"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1 text-grey-9">
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari AHSP...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center">
            <q-btn flat round color="blue" icon="edit" size="sm" @click="openEditDialog(props.row)">
              <q-tooltip>Edit AHSP</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="hapusAhsp(props.row)"
            >
              <q-tooltip>Hapus AHSP</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 950px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none text-grey-8">
          <div class="text-h6 text-weight-bold">
            {{ isEditMode ? 'Edit AHSP' : 'Tambah AHSP' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-my-sm" />

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md q-mb-lg text-grey-9">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs">Kode</div>
              <q-input
                outlined
                dense
                v-model="form.kode"
                bg-color="white"
                placeholder="Masukkan Kode"
              />

              <div class="text-subtitle2 q-mt-md q-mb-xs">Nama Pekerjaan</div>
              <q-input
                outlined
                dense
                v-model="form.nama"
                bg-color="white"
                placeholder="Masukkan Nama Pekerjaan"
              />
            </div>

            <div class="col-12 col-md-3">
              <div class="text-subtitle2 q-mb-xs">Volume</div>
              <q-input outlined dense v-model="form.volume" bg-color="white" placeholder="Volume" />

              <div class="text-subtitle2 q-mt-md q-mb-xs">Tipe</div>
              <q-select
                outlined
                dense
                v-model="form.tipe"
                :options="['Struktur', 'Arsitektur', 'Lainnya']"
                label="--Pilih Tipe"
                bg-color="white"
              />
            </div>

            <div class="col-12 col-md-3">
              <div class="text-subtitle2 q-mb-xs">Satuan</div>
              <q-select
                outlined
                dense
                v-model="form.satuan"
                :options="['m1', 'm2', 'm3', 'kg', 'ls']"
                label="Pilih Satuan"
                bg-color="white"
              />
            </div>
          </div>

          <div class="bg-orange-1 rounded-borders q-pa-sm border-orange">
            <q-tabs
              v-model="activeTab"
              dense
              class="text-grey-7"
              active-color="white"
              indicator-color="transparent"
              align="left"
              narrow-indicator
              no-caps
            >
              <q-tab name="material" label="Material" class="tab-btn" />
              <q-tab name="jasa" label="Jasa/Pekerja" class="tab-btn" />
              <q-tab name="peralatan" label="Peralatan" class="tab-btn" />
            </q-tabs>
          </div>

          <q-tab-panels v-model="activeTab" animated class="bg-transparent">
            <q-tab-panel
              v-for="panel in ['material', 'jasa', 'peralatan']"
              :key="panel"
              :name="panel"
              class="q-pa-none q-pt-md"
            >
              <div class="row justify-end q-mb-sm">
                <q-btn
                  unelevated
                  color="primary"
                  icon="add"
                  :label="`Tambah ${panel === 'jasa' ? 'Jasa/Pekerja' : panel.charAt(0).toUpperCase() + panel.slice(1)}`"
                  no-caps
                  size="sm"
                  @click="addRow(panel)"
                />
              </div>

              <q-table
                :rows="getRowsByPanel(panel)"
                :columns="detailCols"
                flat
                bordered
                hide-bottom
                class="bg-blue-grey-1"
              >
                <template v-slot:header="props">
                  <q-tr :props="props" class="bg-blue-grey-2 text-grey-9">
                    <q-th v-for="col in props.cols" :key="col.name" :props="props">{{
                      col.label
                    }}</q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="item" style="width: 40%">
                      <q-select
                        outlined
                        dense
                        v-model="props.row.item"
                        :options="getOptionsByPanel(panel)"
                        placeholder="Cari & Pilih Item"
                        bg-color="white"
                      />
                    </q-td>
                    <q-td key="koefisien">
                      <q-input
                        outlined
                        dense
                        v-model.number="props.row.koefisien"
                        type="number"
                        bg-color="white"
                        class="text-right"
                      />
                    </q-td>
                    <q-td key="satuan">
                      <q-select
                        outlined
                        dense
                        v-model="props.row.satuan"
                        :options="['m2', 'm3', 'kg', 'OH', 'Jam', 'Sewa']"
                        placeholder="Satuan"
                        bg-color="white"
                      />
                    </q-td>
                    <q-td key="harga">
                      <q-input
                        outlined
                        dense
                        v-model.number="props.row.harga"
                        type="number"
                        bg-color="white"
                        class="text-right"
                      />
                    </q-td>
                    <q-td key="aksi" class="text-center">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        size="sm"
                        class="bg-red-1"
                        @click="removeRow(panel, props.rowIndex)"
                      />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="bg-white q-pa-md q-gutter-sm">
          <q-btn unelevated label="Tutup" color="negative" v-close-popup no-caps class="q-px-lg" />
          <q-btn
            unelevated
            label="Simpan"
            color="positive"
            no-caps
            class="q-px-lg"
            @click="simpanAhsp"
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
const activeTab = ref('material')

// Struktur Data
const formDefault = {
  id: null,
  kode: '',
  nama: '',
  volume: '',
  tipe: null,
  satuan: null,
  materials: [],
  jasa: [],
  peralatan: [],
}
const form = ref(JSON.parse(JSON.stringify(formDefault)))

const columns = [
  { name: 'kode', align: 'left', label: 'KODE', field: 'kode', sortable: true },
  { name: 'pekerjaan', align: 'left', label: 'NAMA PEKERJAAN', field: 'nama', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const detailCols = [
  { name: 'item', align: 'left', label: 'Item' },
  { name: 'koefisien', align: 'center', label: 'Koefisien' },
  { name: 'satuan', align: 'center', label: 'Satuan' },
  { name: 'harga', align: 'center', label: 'Harga' },
  { name: 'aksi', align: 'center', label: '' },
]

// Data Dummy (Contoh yang sudah ada datanya biar tes edit enak)
const rows = ref([
  {
    id: 1,
    kode: 'AHSP-001',
    nama: 'Plesteran Dinding 1:4',
    volume: '1',
    tipe: 'Arsitektur',
    satuan: 'm2',
    materials: [{ item: 'Semen PC 50kg', koefisien: 0.2, satuan: 'kg', harga: 70000 }],
    jasa: [{ item: 'Tukang Batu', koefisien: 0.15, satuan: 'OH', harga: 150000 }],
    peralatan: [],
  },
])

// Helpers untuk Panels
const getRowsByPanel = (panel) => {
  if (panel === 'material') return form.value.materials
  if (panel === 'jasa') return form.value.jasa
  return form.value.peralatan
}

const getOptionsByPanel = (panel) => {
  if (panel === 'material') return ['Semen PC 50kg', 'Pasir Pasang', 'Air Kerja']
  if (panel === 'jasa') return ['Tukang Batu', 'Pekerja Terampil', 'Mandor']
  return ['Molen Mixer', 'Ember Cor', 'Steger']
}

// --- FUNGSI UTAMA ---

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  showDialog.value = true
}

const openEditDialog = (rowData) => {
  isEditMode.value = true
  // PENTING: Deep Copy supaya array didalamnya ikut terbawa sempurna
  form.value = JSON.parse(JSON.stringify(rowData))

  // Pastikan array tidak undefined
  if (!form.value.materials) form.value.materials = []
  if (!form.value.jasa) form.value.jasa = []
  if (!form.value.peralatan) form.value.peralatan = []

  showDialog.value = true
}

const addRow = (panel) => {
  const target = panel === 'material' ? 'materials' : panel
  form.value[target].push({ item: null, koefisien: 0, satuan: null, harga: 0 })
}

const removeRow = (panel, index) => {
  const target = panel === 'material' ? 'materials' : panel
  form.value[target].splice(index, 1)
}

const simpanAhsp = () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Pekerjaan wajib diisi!' })
    return
  }

  const dataToSave = JSON.parse(JSON.stringify(form.value))

  if (isEditMode.value) {
    const idx = rows.value.findIndex((r) => r.id === dataToSave.id)
    if (idx !== -1) {
      rows.value[idx] = dataToSave
      $q.notify({ color: 'positive', message: 'AHSP Berhasil Diperbarui' })
    }
  } else {
    dataToSave.id = Date.now()
    rows.value.unshift(dataToSave)
    $q.notify({ color: 'positive', message: 'AHSP Berhasil Disimpan' })
  }
  showDialog.value = false
}

const hapusAhsp = (data) => {
  $q.dialog({
    title: 'Hapus',
    message: `Yakin hapus analisa ${data.nama}?`,
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
.tab-btn {
  border-radius: 8px;
  margin-right: 8px;
  min-width: 120px;
  font-weight: bold;
}
.q-tab--active {
  background-color: #f2a218 !important;
  color: white !important;
}
.border-orange {
  border: 1px solid #f2a218;
}
.q-table td {
  padding: 4px 8px;
}
</style>
