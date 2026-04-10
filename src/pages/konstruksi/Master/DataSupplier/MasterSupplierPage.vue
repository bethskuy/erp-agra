<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Supplier</div>
        <div class="text-caption text-grey-7">Daftar vendor dan database rekening pemasok.</div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Supplier"
          no-caps
          class="rounded-borders"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari supplier...">
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
              @click="hapusSupplier(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-1">
        <q-toolbar class="bg-white text-grey-9 q-py-sm bordered">
          <q-toolbar-title class="text-weight-bold">Data Supplier</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-separator />

        <q-card-section class="q-pa-lg scroll" style="max-height: 85vh">
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-6 q-gutter-y-md">
              <div>
                <div class="text-subtitle2 q-mb-xs">Nama Supplier</div>
                <q-input outlined dense v-model="form.nama" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Email Supplier</div>
                <q-input outlined dense v-model="form.email" type="email" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">No. HP Supplier</div>
                <q-input outlined dense v-model="form.hp" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">No. Rek Bank</div>
                <q-input outlined dense v-model="form.no_rek" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Bank</div>
                <q-input
                  outlined
                  dense
                  v-model="form.bank_name"
                  placeholder="Contoh: BCA, Mandiri, BRI"
                  bg-color="white"
                />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Atas Nama Rekening</div>
                <q-input outlined dense v-model="form.an_rekening" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Nama Penanggung Jawab (PIC)</div>
                <q-input outlined dense v-model="form.pic_name" bg-color="white" />
              </div>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-md">
              <div>
                <div class="text-subtitle2 q-mb-xs">No. Telp Penanggung Jawab</div>
                <q-input outlined dense v-model="form.pic_phone" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Provinsi</div>
                <q-select
                  outlined
                  dense
                  v-model="form.provinsi"
                  :options="['DKI Jakarta', 'Jawa Barat', 'Banten']"
                  label="Pilih Provinsi"
                  bg-color="white"
                />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Kota</div>
                <q-select
                  outlined
                  dense
                  v-model="form.kota"
                  :options="['Jakarta Selatan', 'Bandung', 'Tangerang']"
                  label="- Pilih Kota -"
                  bg-color="white"
                />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Kecamatan</div>
                <q-input outlined dense v-model="form.kecamatan" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Kelurahan</div>
                <q-input outlined dense v-model="form.kelurahan" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Alamat</div>
                <q-input
                  outlined
                  dense
                  v-model="form.alamat"
                  type="textarea"
                  rows="5"
                  bg-color="white"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="bg-white q-pa-md q-gutter-sm">
          <q-btn outline label="Tutup" color="negative" v-close-popup class="q-px-lg" no-caps />
          <q-btn
            unelevated
            label="Simpan"
            color="warning"
            text-color="white"
            class="q-px-lg"
            @click="simpanSupplier"
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

const formDefault = {
  id: null,
  nama: '',
  email: '',
  hp: '',
  no_rek: '',
  bank_name: '',
  an_rekening: '',
  pic_name: '',
  pic_phone: '',
  provinsi: null,
  kota: null,
  kecamatan: '',
  kelurahan: '',
  alamat: '',
}

const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA SUPPLIER', field: 'nama', sortable: true },
  { name: 'hp', align: 'left', label: 'NO. HP', field: 'hp' },
  { name: 'bank', align: 'left', label: 'BANK', field: 'bank_name' },
  { name: 'pic', align: 'left', label: 'PIC', field: 'pic_name' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  { id: 1, nama: 'Toko Material Abadi', hp: '0812334455', bank_name: 'BCA', pic_name: 'Bpk. Budi' },
  { id: 2, nama: 'PT. Beton Jaya', hp: '0822112233', bank_name: 'Mandiri', pic_name: 'Ibu Sari' },
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

const simpanSupplier = () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Supplier wajib diisi!' })
    return
  }

  if (isEditMode.value) {
    const index = rows.value.findIndex((r) => r.id === form.value.id)
    rows.value[index] = { ...form.value }
    $q.notify({ color: 'orange', message: 'Data Supplier diupdate!' })
  } else {
    rows.value.unshift({ ...form.value, id: Date.now() })
    $q.notify({ color: 'positive', message: 'Supplier baru berhasil ditambah!' })
  }
  showDialog.value = false
}

const hapusSupplier = (data) => {
  $q.dialog({
    title: 'Hapus',
    message: `Yakin hapus ${data.nama}?`,
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
  color: #555;
  font-weight: 600;
}
</style>
