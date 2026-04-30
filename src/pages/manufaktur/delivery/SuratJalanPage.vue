<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-teal-10">Delivery / Surat Jalan</div>
        <div class="text-subtitle2 text-grey-6">Pengiriman Barang ke Customer</div>
      </div>
      <q-space />
      <q-btn color="teal-10" icon="print" label="Buat Surat Jalan Baru" @click="showForm = true" />
    </div>

    <q-table :rows="deliveryLogs" :columns="columns" flat bordered class="bg-white shadow-sm">
      <template v-slot:body-cell-aksi="props">
        <q-td :props="props">
          <q-btn flat round dense color="primary" icon="visibility" />
          <q-btn flat round dense color="teal" icon="download" />
        </q-td>
      </template>
    </q-table>

    <!-- Dialog Input Surat Jalan -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="bg-teal-10 text-white text-h6">Input Data Pengiriman</q-card-section>
        <q-card-section class="q-gutter-md q-pt-md">
          <q-select
            v-model="selectedOQC"
            :options="oqcOptions"
            label="Pilih Data Barang (Lolos OQC)"
            outlined dense emit-value map-options
          />
          <q-input v-model="form.noSuratJalan" label="Nomor Surat Jalan" outlined dense placeholder="SJ/AGRA/2026/001" />
          <div class="row q-col-gutter-sm">
            <q-input v-model="form.driver" label="Nama Driver" class="col-6" outlined dense />
            <q-input v-model="form.nopol" label="No. Polisi Kendaraan" class="col-6" outlined dense />
          </div>
          <q-input v-model.number="form.qtyKirim" type="number" label="Total QTY Dikirim" outlined dense color="teal" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="teal-10" label="Cetak & Kirim" @click="saveDelivery" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const showForm = ref(false)
const deliveryLogs = ref([])
const oqcOptions = ref([])

const form = ref({ noSuratJalan: '', driver: '', nopol: '', qtyKirim: 0 })

const columns = [
  { name: 'tgl', label: 'Tgl Kirim', field: 'created_at', align: 'left' },
  { name: 'sj', label: 'No. Surat Jalan', field: 'noSuratJalan', align: 'left' },
  { name: 'qty', label: 'QTY', field: 'qtyKirim', align: 'center' },
  { name: 'driver', label: 'Driver', field: 'driver', align: 'left' },
  { name: 'aksi', label: 'Aksi', align: 'center' }
]

const saveDelivery = async () => {
  await addDoc(collection(db, 'delivery_orders'), { ...form.value, created_at: new Date() })
  showForm.value = false
  $q.notify({ type: 'positive', message: 'Surat Jalan Berhasil Dibuat!' })
}
</script>

