<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="viewMode === 'LIST'">
      <div class="row items-center q-mb-sm">
        <div class="col">
          <div class="text-h5 text-weight-bolder text-primary uppercase">Data BoQ Proyek</div>
        </div>
      </div>

      <q-card flat bordered class="rounded-borders shadow-1">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :filter="filter"
          @row-dblclick="(evt, row) => selectProject(row)"
          class="text-grey-9 cursor-pointer"
        >
          <template v-slot:top-right>
            <div class="row items-center q-gutter-x-sm">
              <div class="text-caption text-grey-7">Search:</div>
              <q-input outlined dense v-model="filter" bg-color="white" style="width: 250px">
                <template v-slot:append><q-icon name="search" /></template>
              </q-input>
            </div>
          </template>
        </q-table>
        <div class="q-pa-sm bg-blue-1 text-blue-8 text-caption text-center">
          <q-icon name="info" class="q-mr-xs" /> Double click pada baris untuk mengelola Kontrak/SPK
          BoQ
        </div>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'SPK_LIST'">
      <div class="row items-center q-mb-md">
        <div class="col row items-center">
          <q-icon name="assignment" size="md" color="indigo-10" class="q-mr-sm" />
          <div class="text-h5 text-indigo-10 text-weight-bolder uppercase">
            Daftar Kontrak/SPK: {{ selectedProyek.nama }}
          </div>
        </div>
        <q-btn flat color="grey-7" icon="arrow_back" label="KEMBALI" @click="viewMode = 'LIST'" />
      </div>

      <q-card flat bordered class="q-pa-md bg-white">
        <div class="row justify-between items-center q-mb-md">
          <div class="text-subtitle2 text-grey-7">
            Daftar kontrak yang terdaftar pada proyek ini
          </div>
          <q-btn
            color="indigo-10"
            icon="add"
            label="TAMBAH KONTRAK/SPK BARU"
            no-caps
            @click="addNewSPK"
          />
        </div>

        <q-table
          :rows="selectedProyek.spk_list || []"
          :columns="spkColumns"
          flat
          bordered
          @row-dblclick="(evt, row) => editBoqItems(row)"
          class="text-grey-9 cursor-pointer"
        >
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="q-gutter-xs text-center">
              <q-btn flat round color="primary" icon="edit_note" @click="editBoqItems(props.row)">
                <q-tooltip>Input Rincian BoQ</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="removeSPK(props.row)"
              >
                <q-tooltip>Hapus Kontrak/SPK</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:bottom="scope">
            <div class="row full-width items-center justify-end q-gutter-sm text-grey-7">
              <div>Records per page:</div>
              <q-select
                v-model="scope.pagination.rowsPerPage"
                :options="[5, 10, 20]"
                dense
                borderless
              />
              <div>
                {{ (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1 }}-{{
                  Math.min(
                    scope.pagination.page * scope.pagination.rowsPerPage,
                    selectedProyek.spk_list.length,
                  )
                }}
                of {{ selectedProyek.spk_list.length }}
              </div>
              <q-btn
                icon="chevron_left"
                flat
                round
                dense
                :disable="scope.isFirstPage"
                @click="scope.prevPage"
              />
              <q-btn
                icon="chevron_right"
                flat
                round
                dense
                :disable="scope.isLastPage"
                @click="scope.nextPage"
              />
            </div>
          </template>
        </q-table>
        <div class="text-caption text-grey-6 q-mt-sm">
          * Double click pada baris kontrak untuk mengisi rincian item pekerjaan
        </div>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'INPUT_BOQ'">
      <div class="row items-center q-mb-md">
        <div class="col row items-center">
          <q-icon name="menu_open" size="md" color="indigo-10" class="q-mr-sm" />
          <div class="text-h5 text-indigo-10 text-weight-bolder">Input BoQ</div>
        </div>
        <q-btn
          flat
          color="grey-7"
          icon="arrow_back"
          label="KEMBALI"
          @click="viewMode = 'SPK_LIST'"
        />
      </div>

      <q-card
        flat
        bordered
        class="rounded-borders shadow-1 bg-white overflow-hidden dashed-container"
      >
        <div class="bg-indigo-10 text-white q-pa-md text-weight-bold text-subtitle1 uppercase">
          Rincian BoQ (Jual)
        </div>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-md-4">
              <div class="custom-input-group">
                <div class="text-caption text-grey-7">No Kontrak</div>
                <q-input
                  v-model="activeSPK.no_kontrak"
                  dense
                  borderless
                  class="text-subtitle1 text-indigo-10 text-weight-bold no-padding-input"
                />
              </div>
            </div>
            <div class="col-12 col-md-5">
              <div class="custom-input-group">
                <div class="text-caption text-grey-7">Nama Project</div>
                <q-input
                  v-model="selectedProyek.nama"
                  dense
                  borderless
                  class="text-subtitle1 text-indigo-10 text-weight-bold no-padding-input"
                />
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="custom-input-group">
                <div class="text-caption text-grey-7">Dokumen SPK</div>
                <div class="row items-center no-wrap">
                  <q-file
                    v-model="activeSPK.file"
                    dense
                    borderless
                    class="col"
                    placeholder="Upload File"
                  >
                    <template v-slot:prepend><q-icon name="attach_file" size="xs" /></template>
                  </q-file>
                  <q-btn
                    v-if="activeSPK.file"
                    flat
                    round
                    color="primary"
                    icon="visibility"
                    size="sm"
                    @click="reviewDoc"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-sm items-end q-mb-md">
            <div class="col-12 col-md-5">
              <q-input
                outlined
                dense
                v-model="tempItem.pekerjaan"
                label="Item Pekerjaan"
                bg-color="white"
              />
            </div>
            <div class="col-12 col-md-1">
              <q-input
                outlined
                dense
                v-model.number="tempItem.vol"
                label="Vol"
                type="number"
                bg-color="white"
              />
            </div>
            <div class="col-12 col-md-1">
              <q-input outlined dense v-model="tempItem.sat" label="Sat" bg-color="white" />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model.number="tempItem.harga"
                label="Harga Jual"
                prefix="Rp"
                bg-color="white"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-btn
                unelevated
                color="indigo-10"
                icon="add"
                label="ADD"
                class="full-width"
                @click="addItem"
                style="height: 40px"
              />
            </div>
          </div>

          <div class="border rounded-borders">
            <q-table
              :rows="activeSPK.items || []"
              :columns="itemColumns"
              row-key="id"
              flat
              hide-bottom
              separator="none"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="pekerjaan" class="text-left">{{ props.row.pekerjaan }}</q-td>
                  <q-td key="vol" class="text-center">{{ props.row.vol }}</q-td>
                  <q-td key="sat" class="text-center">{{ props.row.sat }}</q-td>
                  <q-td key="harga" class="text-right text-weight-bold">{{
                    props.row.harga.toLocaleString('id-ID')
                  }}</q-td>
                  <q-td key="aksi" class="text-center">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="removeItem(props.row)"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>

          <div class="row items-center justify-end q-mt-xl q-gutter-x-lg">
            <div class="text-h5 text-indigo-10 text-weight-bolder">
              TOTAL: Rp {{ calculateTotal.toLocaleString('id-ID') }}
            </div>
            <q-btn
              unelevated
              color="positive"
              icon="save"
              label="SIMPAN BOQ"
              class="q-px-xl q-py-sm text-weight-bolder"
              @click="saveBOQ"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const filter = ref('')
const viewMode = ref('LIST')
const selectedProyek = ref({})
const activeSPK = ref({})
const tempItem = ref({ pekerjaan: '', vol: 0, sat: '', harga: 0 })

// DATA MASTER (TERINTEGRASI)
const rows = ref([
  {
    id: 1,
    nomor: 'PRJ2025110001',
    nama: 'Proyek Percontohan',
    kota: 'Kab. Bogor',
    kustomer: 'General Customer',
    hp: '+6289872827221',
    spk_list: [
      {
        id: 101,
        no_kontrak: '001/SPK/AGRA/2026',
        tgl: '2026-01-10',
        total: 1800000000,
        items: [{ id: 1, pekerjaan: 'Galian Tanah', vol: 40000, sat: 'm3', harga: 45000 }],
        file: null,
      },
      {
        id: 102,
        no_kontrak: '005/SPK/AGRA/2026',
        tgl: '2026-02-15',
        total: 0,
        items: [],
        file: null,
      },
    ],
  },
])

const columns = [
  { name: 'no', align: 'left', label: 'Nomor', field: 'nomor', sortable: true },
  { name: 'nama', align: 'left', label: 'Nama', field: 'nama' },
  { name: 'kota', align: 'left', label: 'Kota', field: 'kota' },
  { name: 'kustomer', align: 'left', label: 'Kustomer', field: 'kustomer' },
  { name: 'hp', align: 'left', label: 'No. HP', field: 'hp' },
]

const spkColumns = [
  { name: 'no_kontrak', align: 'left', label: 'Nomor Kontrak/SPK', field: 'no_kontrak' },
  { name: 'tgl', align: 'center', label: 'Tanggal', field: 'tgl' },
  { name: 'total', align: 'right', label: 'Total Nilai (Rp)', field: 'total' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const itemColumns = [
  { name: 'pekerjaan', align: 'left', label: 'Pekerjaan' },
  { name: 'vol', align: 'center', label: 'Vol' },
  { name: 'sat', align: 'center', label: 'Sat' },
  { name: 'harga', align: 'right', label: 'Harga' },
  { name: 'aksi', align: 'center', label: '' },
]

const calculateTotal = computed(() => {
  if (!activeSPK.value.items) return 0
  return activeSPK.value.items.reduce((acc, item) => acc + item.vol * item.harga, 0)
})

const selectProject = (row) => {
  selectedProyek.value = row
  viewMode.value = 'SPK_LIST'
}

const addNewSPK = () => {
  const newId = Date.now()
  selectedProyek.value.spk_list.push({
    id: newId,
    no_kontrak: 'BARU/SPK/' + new Date().getFullYear(),
    tgl: new Date().toISOString().split('T')[0],
    total: 0,
    items: [],
    file: null,
  })
}

const editBoqItems = (spk) => {
  activeSPK.value = spk
  viewMode.value = 'INPUT_BOQ'
}

const removeSPK = (spk) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Hapus kontrak ${spk.no_kontrak}? Data BoQ di dalamnya akan hilang permanen.`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'HAPUS', unelevated: true },
  }).onOk(() => {
    selectedProyek.value.spk_list = selectedProyek.value.spk_list.filter(
      (item) => item.id !== spk.id,
    )
    $q.notify({ color: 'positive', message: 'Kontrak berhasil dihapus', icon: 'delete' })
  })
}

const addItem = () => {
  if (!tempItem.value.pekerjaan) return
  activeSPK.value.items.push({ ...tempItem.value, id: Date.now() })
  tempItem.value = { pekerjaan: '', vol: 0, sat: '', harga: 0 }
}

const removeItem = (item) => {
  activeSPK.value.items = activeSPK.value.items.filter((i) => i.id !== item.id)
}

const reviewDoc = () => {
  if (activeSPK.value.file) {
    const url = URL.createObjectURL(activeSPK.value.file)
    window.open(url, '_blank')
  }
}

const saveBOQ = () => {
  activeSPK.value.total = calculateTotal.value
  $q.notify({ color: 'positive', message: 'BoQ Disimpan', icon: 'check' })
  viewMode.value = 'SPK_LIST'
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
.dashed-container {
  border: 1px dashed #ccc !important;
}
.custom-input-group {
  padding: 4px 8px;
  border-bottom: 1px solid #eee;
}
.no-padding-input :deep(.q-field__control),
.no-padding-input :deep(.q-field__native) {
  padding: 0 !important;
  min-height: 0 !important;
}
.text-indigo-10 {
  color: #1a237e !important;
}
.bg-indigo-10 {
  background-color: #1a237e !important;
}
.uppercase {
  text-transform: uppercase;
}
.cursor-pointer:hover {
  background-color: #f1f6fa;
}
.border {
  border: 1px solid #ddd;
}
.border-bottom {
  border-bottom: 2px solid #eee;
}
</style>
