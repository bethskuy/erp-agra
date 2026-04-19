<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Work Order</div>
        <div class="text-subtitle2 text-grey-6">Manajemen perintah produksi</div>
      </div>

      <!-- ✅ TOMBOL -->
      <q-btn color="primary" icon="add" label="Tambah WO" @click="openDialog = true" />
    </div>

    <!-- TABLE -->
    <q-card flat class="rounded-borders shadow-sm">
      <q-table :rows="rows" :columns="columns" row-key="kode" flat bordered>
        <!-- STATUS BADGE -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.value)">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <!-- PROGRESS -->
        <template v-slot:body-cell-progress="props">
          <q-td :props="props">
            <q-linear-progress :value="props.value / 100" color="teal" size="10px" rounded />
            <div class="text-caption q-mt-xs">{{ props.value }}%</div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ✅ DIALOG TAMBAH WO -->
    <q-dialog v-model="openDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Tambah Work Order</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.kode" label="Kode WO" />
          <q-input v-model="form.produk" label="Produk" />
          <q-input v-model.number="form.jumlah" type="number" label="Jumlah" />
          <q-input v-model="form.tanggal" type="date" label="Tanggal" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn label="Simpan" color="primary" @click="simpanWO" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

/* =========================
   TABLE CONFIG
========================= */
const columns = [
  { name: 'kode', label: 'Kode WO', field: 'kode', align: 'left' },
  { name: 'produk', label: 'Produk', field: 'produk' },
  { name: 'jumlah', label: 'Jumlah', field: 'jumlah' },
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal' },
  { name: 'status', label: 'Status', field: 'status' },
  { name: 'progress', label: 'Progress', field: 'progress' },
]

/* =========================
   DATA DUMMY
========================= */
const rows = ref([
  {
    kode: 'WO001',
    produk: 'Rangka Besi',
    jumlah: 50,
    tanggal: '2026-05-01',
    status: 'Pending',
    progress: 0,
  },
  {
    kode: 'WO002',
    produk: 'Tiang Baja',
    jumlah: 20,
    tanggal: '2026-05-02',
    status: 'Proses',
    progress: 60,
  },
  {
    kode: 'WO003',
    produk: 'Plat Besi',
    jumlah: 100,
    tanggal: '2026-05-03',
    status: 'Selesai',
    progress: 100,
  },
])

/* =========================
   STATUS COLOR
========================= */
const getStatusColor = (status) => {
  if (status === 'Pending') return 'grey'
  if (status === 'Proses') return 'orange'
  if (status === 'Selesai') return 'positive'
}

/* =========================
   DIALOG STATE
========================= */
const openDialog = ref(false)

/* =========================
   FORM
========================= */
const form = ref({
  kode: '',
  produk: '',
  jumlah: 0,
  tanggal: '',
})

/* =========================
   SIMPAN DATA
========================= */
const simpanWO = () => {
  rows.value.push({
    kode: form.value.kode,
    produk: form.value.produk,
    jumlah: form.value.jumlah,
    tanggal: form.value.tanggal,
    status: 'Pending',
    progress: 0,
  })

  // reset form
  form.value = {
    kode: '',
    produk: '',
    jumlah: 0,
    tanggal: '',
  }

  openDialog.value = false
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
