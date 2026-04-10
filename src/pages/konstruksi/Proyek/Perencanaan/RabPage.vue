<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Perijinan Proyek</div>
        <div class="text-caption text-grey-7">
          Manajemen dokumen legalitas dan arsip perijinan proyek.
        </div>
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1" v-if="!showArsipForm">
      <q-table :rows="rows" :columns="columns" row-key="nomor" flat :filter="filter">
        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="Cari Proyek / Nomor..."
            bg-color="white"
            style="width: 300px"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="text-center">
            <q-btn
              unelevated
              color="primary"
              icon="folder"
              label="Arsip"
              no-caps
              size="sm"
              class="q-px-sm"
              @click="openArsip(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-card flat bordered class="rounded-borders shadow-1" v-else>
      <q-card-section class="bg-white q-pa-md border-bottom">
        <div class="text-subtitle1 text-weight-bold text-grey-8">
          Data Arsip Proyek: <span class="text-primary">{{ selectedProyek.nama }}</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg scroll" style="max-height: 75vh">
        <div class="row q-col-gutter-xl">
          <div v-for="(doc, index) in arsipList" :key="index" class="col-12 col-md-6 q-mb-md">
            <div class="arsip-item-box q-pa-md bordered rounded-borders bg-white shadow-1">
              <div class="row items-center q-mb-sm">
                <div class="col text-caption text-weight-bold text-primary text-overline">
                  DOKUMEN #{{ index + 1 }}
                </div>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="removeArsip(index)"
                />
              </div>

              <div class="row items-center q-mb-xs">
                <div class="col-3 text-caption text-grey-9 text-weight-medium">Nama :</div>
                <div class="col-9">
                  <q-input outlined dense v-model="doc.nama" bg-color="white" />
                </div>
              </div>

              <div class="row items-center q-mb-xs">
                <div class="col-3 text-caption text-grey-9 text-weight-medium">Nomor :</div>
                <div class="col-9">
                  <q-input outlined dense v-model="doc.nomor" bg-color="white" />
                </div>
              </div>

              <div class="row items-center q-mb-xs">
                <div class="col-3 text-caption text-grey-9 text-weight-medium">Tanggal :</div>
                <div class="col-9">
                  <q-input outlined dense v-model="doc.tanggal" type="date" bg-color="white" />
                </div>
              </div>

              <div class="row items-center q-mb-xs">
                <div class="col-3 text-caption text-grey-9 text-weight-medium">File :</div>
                <div class="col-9">
                  <q-file outlined dense v-model="doc.file" label="Choose File" bg-color="white">
                    <template v-slot:prepend><q-icon name="attach_file" /></template>
                  </q-file>
                </div>
              </div>

              <div class="row items-start">
                <div class="col-3 text-caption text-grey-9 text-weight-medium q-mt-sm">
                  Keterangan :
                </div>
                <div class="col-9">
                  <q-input
                    outlined
                    dense
                    v-model="doc.keterangan"
                    type="textarea"
                    rows="2"
                    bg-color="white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row justify-center q-mt-lg">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Tambah Arsip"
            no-caps
            class="q-px-xl shadow-2"
            @click="addArsipField"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md q-gutter-x-sm bg-grey-1">
        <q-btn
          unelevated
          label="Batal"
          color="negative"
          no-caps
          class="q-px-lg"
          @click="showArsipForm = false"
        />
        <q-btn
          unelevated
          label="Simpan"
          color="positive"
          no-caps
          class="q-px-lg"
          @click="saveArsip"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const filter = ref('') // State untuk pencarian
const showArsipForm = ref(false)
const selectedProyek = ref(null)

const columns = [
  { name: 'nomor', align: 'left', label: 'Nomor', field: 'nomor', sortable: true },
  { name: 'nama', align: 'left', label: 'Nama', field: 'nama', sortable: true },
  { name: 'kota', align: 'left', label: 'Kota', field: 'kota', sortable: true },
  { name: 'hp', align: 'left', label: 'No. HP', field: 'hp' },
  {
    name: 'tanah',
    align: 'center',
    label: 'Luas Tanah Total',
    field: 'luas_tanah',
    sortable: true,
  },
  {
    name: 'bangunan',
    align: 'center',
    label: 'Total Luas Bangunan',
    field: 'luas_bangunan',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'Aksi', field: 'aksi' },
]

const rows = ref([
  {
    nomor: 'PRJ2025110001',
    nama: 'Proyek Percontohan',
    kota: 'Kab. Bogor',
    hp: '+6289872827221',
    luas_tanah: '9215',
    luas_bangunan: '9115',
  },
  {
    nomor: 'PRJ2026040002',
    nama: 'Agra Town House Phase 1',
    kota: 'Bekasi',
    hp: '+628123456789',
    luas_tanah: '5000',
    luas_bangunan: '4500',
  },
])

// Daftar arsip default
const arsipList = ref([
  { nama: 'IMB', nomor: '', tanggal: '', file: null, keterangan: '' },
  { nama: 'SHM', nomor: '', tanggal: '', file: null, keterangan: '' },
  { nama: 'SHGB', nomor: '', tanggal: '', file: null, keterangan: '' },
  { nama: 'PBB', nomor: '', tanggal: '', file: null, keterangan: '' },
  { nama: 'CoverLaporanMingguan', nomor: '', tanggal: '', file: null, keterangan: '' },
])

const openArsip = (proyek) => {
  selectedProyek.value = proyek
  showArsipForm.value = true
}

const addArsipField = () => {
  arsipList.value.push({ nama: '', nomor: '', tanggal: '', file: null, keterangan: '' })
}

const removeArsip = (index) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Hapus baris arsip ini?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    arsipList.value.splice(index, 1)
  })
}

const saveArsip = () => {
  $q.loading.show({ message: 'Menyimpan arsip...' })
  setTimeout(() => {
    $q.loading.hide()
    $q.notify({
      color: 'positive',
      message: `Arsip Proyek ${selectedProyek.value.nama} Berhasil Disimpan`,
      icon: 'check',
      position: 'top',
    })
    showArsipForm.value = false
  }, 1000)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
.arsip-item-box {
  border: 1px solid #dee2e6;
  transition: all 0.3s;
}
.arsip-item-box:hover {
  border-color: var(--q-primary);
  background-color: #fcfcfc;
}
.text-weight-medium {
  font-weight: 500;
}
.scroll {
  overflow-y: auto;
}
</style>
