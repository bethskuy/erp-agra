<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="viewMode === 'LIST'">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle1 text-weight-bold text-grey-9 uppercase">Data Perintah Kerja</div>
        <div class="row q-gutter-x-xs">
          <q-btn
            color="orange-9"
            icon="filter_alt"
            unelevated
            size="sm"
            class="q-px-sm"
            @click="showFilter = true"
          />

          <q-btn-dropdown
            color="indigo-10"
            icon="add"
            label="Tambah Perintah Kerja"
            no-caps
            size="sm"
            unelevated
          >
            <q-list>
              <q-item clickable v-close-popup @click="openForm('INTERNAL')">
                <q-item-section>Internal</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="openForm('SUBCON')">
                <q-item-section>Subcon</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>

      <q-card flat bordered class="rounded-borders bg-white shadow-1">
        <q-card-section class="q-pa-none">
          <div class="row q-pa-md justify-end">
            <div class="row items-center q-gutter-x-sm">
              <div class="text-caption text-grey-7">Search:</div>
              <q-input outlined dense v-model="filter" bg-color="white" style="width: 250px" />
            </div>
          </div>
          <q-table
            :rows="rowsSpk"
            :columns="colsSpk"
            flat
            :filter="filter"
            no-data-label="No data available in table"
            class="header-blue-grey"
          />
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'FORM'">
      <q-card flat bordered class="rounded-borders bg-white shadow-1">
        <q-card-section class="q-py-sm q-px-md bg-grey-1">
          <div class="text-subtitle2 text-grey-8">Tambah Perintah Kerja {{ spkType }}</div>
        </q-card-section>
        <q-separator />

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6 q-gutter-y-sm">
              <div>
                <div class="text-caption text-grey-8">Nomor</div>
                <q-input
                  v-model="form.nomor"
                  dense
                  outlined
                  placeholder="nomor akan digenerate otomatis"
                  bg-color="white"
                />
              </div>
              <div>
                <div class="text-caption text-grey-8">Judul</div>
                <q-input v-model="form.judul" dense outlined bg-color="white" />
              </div>
              <div>
                <div class="text-caption text-grey-8">Tanggal SPK</div>
                <q-input v-model="form.tanggal" dense outlined type="date" bg-color="white" />
              </div>
              <div>
                <div class="text-caption text-grey-8">Lampiran</div>
                <q-file v-model="form.lampiran" dense outlined bg-color="white" label="Choose File">
                  <template v-slot:append><q-icon name="attach_file" /></template>
                </q-file>
                <div class="text-caption text-grey-6" style="font-size: 10px">
                  Format File: Image, Pdf
                </div>
              </div>
              <div v-if="spkType === 'SUBCON'">
                <div class="text-caption text-grey-8">Tipe Pembayaran Subcon</div>
                <q-select
                  v-model="form.tipe_bayar_subcon"
                  :options="['Termin', 'Progress']"
                  dense
                  outlined
                  placeholder="- Pilih Tipe Pembayaran -"
                />
              </div>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-sm">
              <div class="row q-col-gutter-sm items-end">
                <div class="col">
                  <div class="text-caption text-grey-8">Pekerja</div>
                  <q-select
                    v-model="form.pekerja"
                    :options="['Mandor A', 'Subcon B']"
                    dense
                    outlined
                    placeholder="Pilih Pekerja/Perusahaan Subcon"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    color="positive"
                    icon="add"
                    label="Tambah Pekerja Baru"
                    no-caps
                    unelevated
                    size="sm"
                    style="height: 40px"
                  />
                </div>
              </div>
              <div class="row q-col-gutter-sm">
                <div class="col">
                  <div class="text-caption text-grey-8">Tanggal Mulai</div>
                  <q-input v-model="form.tgl_mulai" dense outlined type="date" />
                </div>
                <div class="col">
                  <div class="text-caption text-grey-8">Lama Pengerjaan (Hari)</div>
                  <q-input v-model="form.lama_hari" dense outlined />
                </div>
              </div>
              <div v-if="spkType === 'INTERNAL'">
                <div class="text-caption text-grey-8">Siklus Pembayaran</div>
                <q-select
                  v-model="form.siklus_bayar"
                  :options="['Mingguan', 'Bulanan']"
                  dense
                  outlined
                  placeholder="Pilih Siklus Pembayaran"
                />
              </div>
              <div>
                <div class="text-caption text-grey-8">Proyek</div>
                <q-select
                  v-model="form.proyek"
                  :options="['Proyek A', 'Proyek B']"
                  dense
                  outlined
                  placeholder="- Pilih Proyek -"
                />
              </div>
              <div>
                <div class="text-caption text-grey-8">BOQ</div>
                <q-input v-model="form.boq" dense outlined />
              </div>
            </div>
          </div>

          <div class="text-center q-my-lg">
            <div class="text-h6 text-grey-8 uppercase">List Fee</div>
            <div v-if="spkType === 'SUBCON'" class="text-caption text-grey-6">
              Silahkan pilih Tipe Pembayaran dan Kapling
            </div>
          </div>

          <q-table
            :rows="form.fee_items"
            :columns="feeCols"
            flat
            bordered
            hide-bottom
            separator="cell"
            class="header-blue-grey q-mb-md"
          >
            <template v-slot:header-cell-aksi="props">
              <q-th :props="props"
                ><q-btn color="indigo-10" icon="add" size="xs" round @click="addFeeItem"
              /></q-th>
            </template>
          </q-table>

          <div class="text-caption text-grey-8 q-mb-xs">Syarat dan Ketentuan</div>
          <q-editor
            v-model="form.syarat"
            min-height="150px"
            flat
            bordered
            :toolbar="[
              ['bold', 'italic', 'link', 'custom_btn'],
              ['unordered', 'ordered'],
              ['left', 'center', 'right', 'justify'],
            ]"
          />

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
              label="Simpan"
              color="positive"
              @click="saveSpk"
              no-caps
              size="sm"
              class="q-px-md"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showFilter">
      <q-card style="width: 450px; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-grey-8">Filter</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator class="q-my-sm" />
        <q-card-section class="q-pa-md q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Contract</div>
            <q-select
              outlined
              dense
              v-model="filterForm.kontrak"
              :options="[]"
              placeholder="- Pilih Kontrak -"
            />
          </div>
          <div>
            <div class="row items-center q-gutter-x-sm q-mb-xs">
              <div class="text-caption text-weight-bold text-grey-8">Tanggal Laporan Progress</div>
              <q-btn label="Reset Tanggal" color="negative" size="xs" unelevated no-caps />
            </div>
            <div class="row items-center no-wrap">
              <q-input outlined dense v-model="filterForm.tgl_mulai" type="date" class="col" />
              <div
                class="bg-orange-9 text-white q-px-sm flex flex-center text-weight-bold"
                style="height: 40px; min-width: 40px"
              >
                s/d
              </div>
              <q-input outlined dense v-model="filterForm.tgl_selesai" type="date" class="col" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md q-gutter-x-sm">
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
const spkType = ref('INTERNAL')
const filter = ref('')
const showFilter = ref(false)

const filterForm = ref({ kontrak: null, tgl_mulai: '', tgl_selesai: '' })
const form = ref({
  nomor: '',
  judul: '',
  tanggal: '2026-04-09',
  lampiran: null,
  pekerja: null,
  tgl_mulai: '',
  lama_hari: '',
  siklus_bayar: null,
  tipe_bayar_subcon: null,
  proyek: null,
  boq: '',
  fee_items: [],
  syarat:
    '1. Item pekerjaan, bobot prosentase pekerjaan... \n2. Keterlambatan terhadap penyelesaian...',
})

const colsSpk = [
  { name: 'nomor', align: 'left', label: 'Nomor', field: 'nomor' },
  { name: 'tanggal', align: 'left', label: 'Tanggal', field: 'tanggal' },
  { name: 'proyek', align: 'left', label: 'Proyek/BOQ', field: 'proyek' },
  { name: 'tipe', align: 'left', label: 'Tipe', field: 'tipe' },
  { name: 'tukang', align: 'left', label: 'Tukang', field: 'tukang' },
  { name: 'nominal', align: 'right', label: 'Nominal', field: 'nominal' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const feeCols = [
  { name: 'pekerjaan', label: 'Pekerjaan', align: 'left' },
  { name: 'durasi', label: 'Durasi', align: 'center' },
  { name: 'fee', label: 'Fee', align: 'right' },
  { name: 'retensi', label: 'Retensi (%)', align: 'center' },
  { name: 'aksi', label: '', align: 'center' },
]

const rowsSpk = ref([])

const openForm = (type) => {
  spkType.value = type
  viewMode.value = 'FORM'
}

const addFeeItem = () => {
  form.value.fee_items.push({ pekerjaan: '', durasi: '', fee: 0, retensi: 0 })
}

const saveSpk = () => {
  $q.notify({ color: 'positive', message: 'SPK Berhasil Disimpan!' })
  viewMode.value = 'LIST'
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
.bg-grey-1 {
  background-color: #f8f9fa;
}
</style>
