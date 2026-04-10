<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Prospek</div>
        <div class="text-caption text-grey-7">Kelola calon konsumen baru untuk proyek Anda.</div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Prospek"
          no-caps
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari prospek...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="getStatusColor(props.value)" class="q-px-sm q-py-xs text-weight-bold">
              {{ props.value.toUpperCase() }}
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
              @click="confirmHapus(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="fade" transition-hide="fade">
      <q-card style="width: 1000px; max-width: 95vw; border-radius: 4px">
        <q-card-section class="row items-center q-pb-none bg-white">
          <div class="text-h6 text-grey-8">
            {{ isEditMode ? 'Edit Prospek' : 'Tambah Prospek' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-mt-md" />

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6 q-gutter-y-md">
              <div>
                <div class="text-subtitle2 q-mb-xs">Nama Proyek</div>
                <q-select
                  outlined
                  dense
                  v-model="form.proyek"
                  :options="optProyek"
                  bg-color="white"
                />
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">Nama</div>
                <q-input outlined dense v-model="form.nama" bg-color="white" />
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">Email</div>
                <q-input outlined dense v-model="form.email" bg-color="white" />
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">No. HP</div>
                <q-input outlined dense v-model="form.kontak" bg-color="white" />
              </div>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-md">
              <div>
                <div class="text-subtitle2 q-mb-xs">Ditugaskan Ke</div>
                <q-select
                  outlined
                  dense
                  v-model="form.assigned_to"
                  :options="optUser"
                  bg-color="white"
                />
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">Sumber Prospek</div>
                <div class="row no-wrap q-gutter-x-sm">
                  <q-select
                    outlined
                    dense
                    v-model="form.sumber"
                    :options="optSumber"
                    bg-color="white"
                    class="col"
                  />
                  <q-btn
                    unelevated
                    color="primary"
                    icon="add"
                    label="Tambah Sumber"
                    no-caps
                    class="col-auto"
                    @click="openSumberDialog"
                  />
                </div>
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">Warm Meter</div>
                <q-select
                  outlined
                  dense
                  v-model="form.status"
                  :options="optWarm"
                  bg-color="white"
                />
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">Tags</div>
                <q-input
                  outlined
                  dense
                  v-model="form.tags"
                  placeholder="priority, follow-up"
                  bg-color="white"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md q-gutter-x-sm">
          <q-btn unelevated label="Tutup" color="negative" v-close-popup no-caps class="q-px-lg" />
          <q-btn
            unelevated
            label="Simpan"
            color="positive"
            @click="simpanProspek"
            no-caps
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showSumberDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px; border-radius: 4px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-grey-8">Tambah Sumber</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-my-md" />

        <q-card-section class="q-pa-md">
          <div class="text-subtitle2 q-mb-xs">Nama</div>
          <q-input
            outlined
            dense
            v-model="newSumberName"
            placeholder="Masukkan nama sumber"
            bg-color="white"
            autofocus
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md q-gutter-x-sm">
          <q-btn outline label="Tutup" color="negative" v-close-popup no-caps class="q-px-lg" />
          <q-btn
            unelevated
            label="Simpan"
            color="warning"
            @click="saveNewSumber"
            no-caps
            class="q-px-lg text-white"
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
const showSumberDialog = ref(false)
const newSumberName = ref('')

const optProyek = ref(['- Pilih Proyek -', 'Agra Town', 'Green Valley'])
const optUser = ref(['Pilih User', 'Admin Marketing', 'Sales 1'])
const optSumber = ref(['- Pilih Sumber -', 'FB Ads', 'Instagram', 'Walk-in'])
const optWarm = ref(['- Pilih Warm Meter -', 'Hot', 'Warm', 'Cold'])

const formDefault = {
  id: null,
  proyek: '- Pilih Proyek -',
  nama: '',
  email: '',
  kontak: '',
  assigned_to: 'Pilih User',
  sumber: '- Pilih Sumber -',
  status: '- Pilih Warm Meter -',
  tags: '',
}

const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA', field: 'nama', sortable: true },
  { name: 'proyek', align: 'left', label: 'PROYEK', field: 'proyek' },
  { name: 'sumber', align: 'left', label: 'SUMBER', field: 'sumber' },
  { name: 'status', align: 'center', label: 'WARM METER', field: 'status' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  {
    id: 1,
    nama: 'Budi Santoso',
    proyek: 'Agra Town',
    status: 'Hot',
    sumber: 'FB Ads',
    email: 'budi@mail.com',
    kontak: '08123',
    assigned_to: 'Sales 1',
    tags: 'priority',
  },
])

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = { ...row }
  showDialog.value = true
}

const simpanProspek = () => {
  if (isEditMode.value) {
    const idx = rows.value.findIndex((r) => r.id === form.value.id)
    rows.value[idx] = { ...form.value }
  } else {
    rows.value.unshift({ ...form.value, id: Date.now() })
  }
  showDialog.value = false
  $q.notify({ color: 'positive', message: 'Data Berhasil Disimpan' })
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus Prospek',
    message: `Yakin hapus ${row.nama}?`,
    cancel: true,
  }).onOk(() => {
    rows.value = rows.value.filter((r) => r.id !== row.id)
  })
}

const openSumberDialog = () => {
  newSumberName.value = ''
  showSumberDialog.value = true
}

const saveNewSumber = () => {
  if (newSumberName.value) {
    optSumber.value.push(newSumberName.value)
    form.value.sumber = newSumberName.value
    showSumberDialog.value = false
  }
}

const getStatusColor = (status) => {
  if (status === 'Hot') return 'negative'
  if (status === 'Warm') return 'orange'
  return 'blue-grey'
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
.text-subtitle2 {
  font-weight: 500;
  color: #555;
}
</style>
