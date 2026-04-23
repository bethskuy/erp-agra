<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-icon name="payments" size="md" color="red-8" class="q-mr-sm" />
        <div>
          <div class="text-h5 text-teal-10 text-weight-bold">Analisis HPP Produksi</div>
          <div class="text-caption text-grey-7">Kalkulasi biaya riil per satuan produk jadi</div>
        </div>
      </div>
      <q-btn color="red-8" icon="download" label="Export Laporan" unelevated />
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="bg-white q-pa-sm">
          <div class="text-caption text-grey-7">Rata-rata HPP / Unit</div>
          <div class="text-h6 text-weight-bold">Rp 450.000</div>
        </q-card>
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="hppRows"
      :columns="columns"
      row-key="id"
      class="rounded-borders shadow-sm bg-white"
    >
      <template v-slot:header="props">
        <q-tr :props="props" class="bg-teal-1 text-teal-10">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-hpp="props">
        <q-td :props="props" class="text-weight-bold text-red-8">
          Rp {{ props.value.toLocaleString() }}
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            color="teal-10"
            icon="list_alt"
            size="sm"
            @click="showDetail(props.row)"
          >
            <q-tooltip>Lihat Breakdown Biaya</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="detailDialog">
      <q-card style="width: 500px">
        <q-card-section class="bg-teal-10 text-white">
          <div class="text-h6">Breakdown Biaya: {{ selectedHPP.product }}</div>
        </q-card-section>

        <q-card-section>
          <q-list separator>
            <q-item>
              <q-item-section>Biaya Bahan Baku (Raw Material)</q-item-section>
              <q-item-section side class="text-weight-bold text-black"
                >Rp {{ selectedHPP.raw_material.toLocaleString() }}</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section>Biaya Tenaga Kerja (Labor)</q-item-section>
              <q-item-section side class="text-weight-bold text-black"
                >Rp {{ selectedHPP.labor.toLocaleString() }}</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section>Biaya Sewa Alat & Listrik (Overhead)</q-item-section>
              <q-item-section side class="text-weight-bold text-black"
                >Rp {{ selectedHPP.overhead.toLocaleString() }}</q-item-section
              >
            </q-item>
            <q-separator />
            <q-item class="bg-red-1">
              <q-item-section class="text-weight-bold">TOTAL HPP PER UNIT</q-item-section>
              <q-item-section side class="text-weight-bold text-red-9 text-h6"
                >Rp {{ selectedHPP.total.toLocaleString() }}</q-item-section
              >
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Tutup" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const detailDialog = ref(false)
const selectedHPP = ref({ raw_material: 0, labor: 0, overhead: 0, total: 0 })

const columns = [
  { name: 'kode', label: 'Kode Produk', field: 'kode', align: 'left', sortable: true },
  { name: 'product', label: 'Nama Produk', field: 'product', align: 'left' },
  { name: 'project', label: 'Referensi Proyek', field: 'project', align: 'left' },
  { name: 'hpp', label: 'HPP Satuan', field: 'total', align: 'right', sortable: true },
  { name: 'action', label: 'Detail', field: 'action', align: 'center' },
]

const hppRows = ref([
  {
    id: 1,
    kode: 'CONC-K350',
    product: 'Beton K-350 /m3',
    project: 'Gedung A',
    raw_material: 850000,
    labor: 150000,
    overhead: 50000,
    total: 1050000,
  },
  {
    id: 2,
    kode: 'ST-D16',
    product: 'Besi Tulangan D16',
    project: 'Jembatan C',
    raw_material: 120000,
    labor: 20000,
    overhead: 5000,
    total: 145000,
  },
])

const showDetail = (row) => {
  selectedHPP.value = row
  detailDialog.value = true
}
</script>
