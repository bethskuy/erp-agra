<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="viewMode === 'LIST'">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle1 text-weight-bold text-grey-9 uppercase">
          Penerimaan Barang (Masuk Gudang)
        </div>
        <q-btn
          color="indigo-10"
          icon="add"
          label="Terima Barang Baru"
          no-caps
          size="sm"
          unelevated
          @click="openForm"
        />
      </div>

      <q-card flat bordered class="rounded-borders bg-white shadow-1">
        <q-table :rows="rowsPenerimaan" :columns="colsPenerimaan" flat class="header-blue-grey">
          <template v-slot:body-cell-metode="props">
            <q-td :props="props" class="text-center">
              <q-chip
                :color="props.row.metode === 'Kredit' ? 'orange-2' : 'green-2'"
                :text-color="props.row.metode === 'Kredit' ? 'orange-9' : 'green-9'"
                dense
                square
                class="text-weight-bold"
                size="sm"
              >
                {{ props.row.metode }}
              </q-chip>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'FORM'">
      <q-card flat bordered class="rounded-borders bg-white shadow-1">
        <q-card-section class="q-py-sm q-px-md bg-grey-1 text-indigo-10 text-weight-bold uppercase">
          Form Penerimaan Barang Masuk
        </q-card-section>
        <q-separator />

        <q-card-section class="q-pa-md q-gutter-y-md">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6 q-gutter-y-sm">
              <q-input v-model="form.no_faktur" label="No. Faktur / Surat Jalan" outlined dense />
              <q-input v-model="form.tanggal" label="Tanggal Terima" outlined dense type="date" />
              <q-select
                v-model="form.supplier"
                :options="['PT. Tiga Roda', 'Toko Besi Abadi', 'PT. Semen Padang']"
                label="Supplier"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-6 q-gutter-y-sm">
              <q-select
                v-model="form.metode"
                :options="['Tunai', 'Kredit']"
                label="Metode Pembayaran"
                outlined
                dense
                bg-color="orange-1"
              />
              <q-input
                v-if="form.metode === 'Kredit'"
                v-model.number="form.tempo"
                label="Jatuh Tempo (Hari)"
                outlined
                dense
                type="number"
                suffix="Hari"
              />
              <q-input
                v-model="form.keterangan"
                label="Catatan"
                outlined
                dense
                type="textarea"
                rows="2"
              />
            </div>
          </div>

          <div class="text-weight-bold q-mt-lg">Detail Barang yang Diterima:</div>
          <q-table
            :rows="form.items"
            :columns="itemCols"
            flat
            bordered
            hide-bottom
            separator="cell"
            class="header-blue-grey"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td class="text-center">{{ props.rowIndex + 1 }}</q-td>
                <q-td>
                  <q-select
                    v-model="props.row.barang"
                    :options="['Semen', 'Besi', 'Pasir']"
                    dense
                    borderless
                  />
                </q-td>
                <q-td>
                  <q-input
                    v-model.number="props.row.qty"
                    dense
                    borderless
                    type="number"
                    class="text-center"
                  />
                </q-td>
                <q-td>
                  <q-input
                    v-model.number="props.row.harga"
                    dense
                    borderless
                    type="number"
                    class="text-right"
                  />
                </q-td>
                <q-td class="text-right text-weight-bold">
                  {{ (props.row.qty * props.row.harga).toLocaleString() }}
                </q-td>
              </q-tr>
            </template>
          </q-table>

          <div class="row justify-end q-mt-md">
            <div class="col-12 col-md-4 bg-indigo-1 q-pa-md rounded-borders text-right">
              <div class="text-caption text-grey-7">Total Nilai Barang:</div>
              <div class="text-h6 text-indigo-10">Rp {{ calculateTotal().toLocaleString() }}</div>
            </div>
          </div>

          <div class="row justify-end q-gutter-x-sm q-mt-xl">
            <q-btn label="Batal" color="grey-7" outline @click="viewMode = 'LIST'" no-caps />
            <q-btn
              label="Simpan Penerimaan"
              color="indigo-10"
              unelevated
              @click="savePenerimaan"
              no-caps
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const viewMode = ref('LIST')

const form = ref({
  no_faktur: '',
  tanggal: '2026-04-09',
  supplier: '',
  metode: 'Kredit',
  tempo: 14,
  keterangan: '',
  items: [{ barang: '', qty: 0, harga: 0 }],
})

const colsPenerimaan = [
  { name: 'no', align: 'left', label: 'No. Faktur', field: 'no_faktur' },
  { name: 'tgl', align: 'left', label: 'Tanggal', field: 'tanggal' },
  { name: 'supplier', align: 'left', label: 'Supplier', field: 'supplier' },
  { name: 'metode', align: 'center', label: 'Metode Bayar', field: 'metode' },
]

const itemCols = [
  { name: 'no', label: '#', align: 'center' },
  { name: 'barang', label: 'Nama Barang', align: 'left' },
  { name: 'qty', label: 'Qty', align: 'center' },
  { name: 'harga', label: 'Harga Satuan', align: 'right' },
  { name: 'subtotal', label: 'Subtotal', align: 'right' },
]

const rowsPenerimaan = ref([
  { no_faktur: 'INV-9901', tanggal: '2026-04-08', supplier: 'PT. Tiga Roda', metode: 'Kredit' },
])

const calculateTotal = () => {
  return form.value.items.reduce((acc, item) => acc + item.qty * item.harga, 0)
}

const openForm = () => {
  form.value = {
    no_faktur: 'INV-' + Math.floor(Math.random() * 10000),
    tanggal: '2026-04-09',
    supplier: '',
    metode: 'Kredit',
    tempo: 14,
    items: [{ barang: '', qty: 0, harga: 0 }],
  }
  viewMode.value = 'FORM'
}

const savePenerimaan = () => {
  if (!form.value.supplier || calculateTotal() === 0) {
    $q.notify({ color: 'negative', message: 'Supplier dan Barang wajib diisi!' })
    return
  }

  // --- LOGIC TEMBAK DATA ---
  if (form.value.metode === 'Kredit') {
    // Di sini sistem lo harusnya nge-Push data ke tabel HUTANG
    $q.notify({
      color: 'orange-9',
      message: 'Barang diterima & Hutang baru telah dicatat!',
      icon: 'account_balance_wallet',
    })
  } else {
    $q.notify({ color: 'positive', message: 'Penerimaan Tunai Berhasil!' })
  }

  rowsPenerimaan.value.unshift({ ...form.value })
  viewMode.value = 'LIST'
}
</script>

<style scoped>
.header-blue-grey :deep(thead tr th) {
  background-color: #f1f4f7;
  color: #333;
  font-weight: bold;
}
</style>
