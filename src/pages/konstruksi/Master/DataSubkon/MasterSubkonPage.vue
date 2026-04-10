<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Subkon / Tukang</div>
        <div class="text-caption text-grey-7">Daftar tenaga ahli dan sub-kontraktor proyek.</div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Subkon"
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

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'green' : 'grey-7'">
              {{ props.value ? 'Aktif' : 'Tidak Aktif' }}
            </q-badge>
          </q-td>
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
              @click="hapusSubkon(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-grey-8">
            <q-icon name="person_add" color="orange" class="q-mr-sm" />
            {{ isEditMode ? 'Edit Subkon/Tukang' : 'Tambah Subkon/Tukang' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-my-md" />

        <q-card-section class="q-pa-md q-gutter-y-md">
          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Kode</div>
            <q-input
              outlined
              dense
              v-model="form.kode"
              placeholder="SK - 001"
              bg-color="white"
              readonly
            />
            <div class="text-caption text-grey-6 q-mt-xs italic">
              Kode dihasilkan secara otomatis oleh sistem
            </div>
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Nama</div>
            <q-input
              outlined
              dense
              v-model="form.nama"
              placeholder="Masukkan Nama Sub Contractor / Perusahaan"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">No Telepon</div>
            <q-input
              outlined
              dense
              v-model="form.telepon"
              placeholder="Masukkan No Telepon"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Alamat</div>
            <q-input
              outlined
              dense
              v-model="form.alamat"
              type="textarea"
              rows="4"
              bg-color="white"
            />
          </div>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-sm">Status</div>
            <div class="row items-center">
              <q-toggle v-model="form.isActive" color="orange" keep-color />
              <span class="q-ml-sm text-grey-9">{{ form.isActive ? 'Aktif' : 'Tidak Aktif' }}</span>
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
            @click="simpanSubkon"
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
  kode: 'SK - 001', // Simulasi auto generate
  nama: '',
  telepon: '',
  alamat: '',
  isActive: false,
}

const form = ref({ ...formDefault })

const columns = [
  { name: 'kode', align: 'left', label: 'KODE', field: 'kode', sortable: true },
  { name: 'nama', align: 'left', label: 'NAMA', field: 'nama', sortable: true },
  { name: 'telepon', align: 'left', label: 'NO TELP', field: 'telepon' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'isActive' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  {
    id: 1,
    kode: 'SK - 001',
    nama: 'Mandor Jajang',
    telepon: '0812334455',
    alamat: 'Bandung',
    isActive: true,
  },
  {
    id: 2,
    kode: 'SK - 002',
    nama: 'CV. Bangun Jaya',
    telepon: '0855667788',
    alamat: 'Jakarta',
    isActive: false,
  },
])

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault, kode: 'SK - 00' + (rows.value.length + 1) }
  showDialog.value = true
}

const openEditDialog = (data) => {
  isEditMode.value = true
  form.value = { ...data }
  showDialog.value = true
}

const simpanSubkon = () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama harus diisi!' })
    return
  }

  if (isEditMode.value) {
    const index = rows.value.findIndex((r) => r.id === form.value.id)
    rows.value[index] = { ...form.value }
    $q.notify({ color: 'orange', message: 'Data diupdate!' })
  } else {
    rows.value.unshift({ ...form.value, id: Date.now() })
    $q.notify({ color: 'positive', message: 'Data disimpan!' })
  }
  showDialog.value = false
}

const hapusSubkon = (data) => {
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
  font-size: 14px;
  font-weight: 600;
}
.italic {
  font-style: italic;
}
</style>
