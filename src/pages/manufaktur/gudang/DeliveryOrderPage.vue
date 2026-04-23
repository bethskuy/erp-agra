<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-icon name="local_shipping" size="md" color="green-8" class="q-mr-sm" />
        <div>
          <div class="text-h5 text-teal-10 text-weight-bold">Surat Jalan (Delivery Order)</div>
          <div class="text-caption text-grey-7">
            Pencatatan pengiriman barang jadi ke lokasi proyek site
          </div>
        </div>
      </div>
      <q-btn
        color="green-8"
        icon="add"
        label="Buat Surat Jalan"
        unelevated
        @click="formDO = true"
      />
    </div>

    <q-table
      flat
      bordered
      :rows="deliveryRows"
      :columns="columns"
      row-key="id"
      class="rounded-borders shadow-sm bg-white"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.value === 'Terkirim' ? 'green' : 'orange'" class="q-pa-xs">
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="q-gutter-sm">
          <q-btn flat round color="teal-10" icon="print" size="sm">
            <q-tooltip>Cetak Surat Jalan (PDF)</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="formDO" persistent>
      <q-card style="min-width: 700px; max-width: 90vw">
        <q-card-section class="bg-green-8 text-white row items-center">
          <div class="text-h6">Input Pengiriman Barang</div>
          <q-spacer />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6 q-gutter-y-sm">
              <q-input
                outlined
                dense
                v-model="newDO.no_do"
                label="Nomor Surat Jalan"
                readonly
                hint="Otomatis oleh sistem"
              />
              <q-select
                outlined
                dense
                v-model="newDO.project"
                :options="['Proyek Gedung A', 'Renovasi Jembatan C']"
                label="Tujuan Proyek"
              />
              <q-input outlined dense v-model="newDO.driver" label="Nama Sopir / Ekspedisi" />
            </div>
            <div class="col-12 col-md-6 q-gutter-y-sm">
              <q-input
                outlined
                dense
                v-model="newDO.date"
                label="Tanggal Kirim"
                type="date"
                stack-label
              />
              <q-input
                outlined
                dense
                v-model="newDO.vehicle_no"
                label="Nomor Kendaraan (Plat Nomor)"
              />
            </div>
          </div>

          <q-separator label="Barang yang Dikirim" />

          <div class="bg-grey-1 q-pa-md rounded-borders">
            <div class="row q-col-gutter-sm items-center q-mb-sm text-weight-bold text-grey-7">
              <div class="col-7">Nama Produk Jadi (Lulus QC)</div>
              <div class="col-3">Jumlah</div>
              <div class="col-2"></div>
            </div>
            <div
              class="row q-col-gutter-sm items-center q-mb-sm"
              v-for="(item, index) in newDO.items"
              :key="index"
            >
              <div class="col-7">
                <q-select
                  outlined
                  dense
                  v-model="item.product"
                  :options="['Tiang Pancang K-350', 'Beton Precast Type B']"
                  label="Pilih Produk"
                />
              </div>
              <div class="col-3">
                <q-input outlined dense v-model.number="item.qty" type="number" label="Qty" />
              </div>
              <div class="col-2">
                <q-btn
                  flat
                  round
                  color="red"
                  icon="remove_circle"
                  @click="removeItem(index)"
                  v-if="newDO.items.length > 1"
                />
              </div>
            </div>
            <q-btn
              flat
              color="green-8"
              icon="add"
              label="Tambah Baris"
              @click="addItem"
              class="full-width q-mt-sm"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-px-md">
          <q-btn v-close-popup flat label="Batal" color="grey" />
          <q-btn label="Simpan & Cetak" color="green-8" unelevated @click="saveDO" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const formDO = ref(false)

const columns = [
  { name: 'no_do', label: 'No. Surat Jalan', field: 'no_do', align: 'left', sortable: true },
  { name: 'date', label: 'Tanggal', field: 'date', align: 'left' },
  { name: 'project', label: 'Tujuan Proyek', field: 'project', align: 'left' },
  { name: 'driver', label: 'Sopir', field: 'driver', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'action', label: 'Opsi', field: 'action', align: 'center' },
]

const deliveryRows = ref([
  {
    id: 1,
    no_do: 'DO-2026-0001',
    date: '2026-04-23',
    project: 'Proyek Gedung A',
    driver: 'Budi (B 1234 ABC)',
    status: 'Proses',
  },
])

const newDO = ref({
  no_do: 'SJ-' + Date.now(),
  project: '',
  driver: '',
  vehicle_no: '',
  date: '',
  items: [{ product: '', qty: 1 }],
})

const addItem = () => {
  newDO.value.items.push({ product: '', qty: 1 })
}
const removeItem = (index) => {
  newDO.value.items.splice(index, 1)
}

const saveDO = () => {
  $q.notify({
    message: 'Surat Jalan berhasil diterbitkan!',
    color: 'green-8',
    icon: 'local_shipping',
  })
  formDO.value = false
}
</script>
