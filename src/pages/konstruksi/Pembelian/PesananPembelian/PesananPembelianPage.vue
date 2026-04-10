<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="viewMode === 'LIST'">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle1 text-weight-bold text-grey-9">Data Purchase Order</div>
        <div class="row q-gutter-x-xs">
          <q-btn color="orange-9" icon="filter_alt" unelevated size="sm" class="q-px-sm" />
          <q-btn
            color="blue-grey-4"
            icon="print"
            label="Cetak Rekap PO"
            no-caps
            size="sm"
            unelevated
          />
          <q-btn
            color="indigo-10"
            icon="add"
            label="Tambah Purchase Order"
            no-caps
            size="sm"
            unelevated
            @click="openForm"
          />
        </div>
      </div>

      <q-card flat bordered class="rounded-borders bg-white shadow-1">
        <q-card-section class="q-pa-none">
          <div class="row q-pa-md justify-end items-center">
            <div class="row items-center q-gutter-x-sm">
              <div class="text-caption text-grey-7">Search:</div>
              <q-input outlined dense v-model="filter" bg-color="white" style="width: 250px" />
            </div>
          </div>

          <q-table
            :rows="rowsPo"
            :columns="colsPo"
            flat
            :filter="filter"
            class="header-blue-grey"
            no-data-label="No data available in table"
          >
            <template v-slot:body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-chip color="orange-9" text-color="white" dense size="sm">
                  {{ props.row.status }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-aksi="props">
              <q-td :props="props" class="text-center">
                <q-btn flat round icon="more_horiz" size="sm" color="grey-7">
                  <q-menu auto-close>
                    <q-list style="min-width: 100px">
                      <q-item clickable @click="viewDetail(props.row)"
                        ><q-item-section>Detail</q-item-section></q-item
                      >
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'FORM'">
      <q-card flat bordered class="rounded-borders bg-white shadow-1">
        <q-card-section class="q-py-sm q-px-md bg-grey-1">
          <div class="text-subtitle2 text-grey-8">Tambah Pesanan Pembelian</div>
        </q-card-section>
        <q-separator />

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6 q-gutter-y-sm">
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 120px">No. PO</div>
                <q-input
                  v-model="form.no_po"
                  dense
                  outlined
                  class="col"
                  placeholder="nomor akan digenerate otomatis"
                  readonly
                  bg-color="white"
                />
              </div>
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 120px">
                  Tanggal Transaksi*
                </div>
                <q-input
                  v-model="form.tanggal"
                  dense
                  outlined
                  class="col"
                  type="date"
                  bg-color="white"
                />
              </div>
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 120px">
                  No. Pengajuan
                </div>
                <q-select
                  v-model="form.no_pengajuan"
                  :options="pengajuanOptions"
                  dense
                  outlined
                  class="col"
                  placeholder="- Pilih No. Pengajuan Bahan -"
                  bg-color="white"
                />
              </div>
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 120px">Proyek</div>
                <q-select
                  v-model="form.proyek"
                  :options="proyekOptions"
                  dense
                  outlined
                  class="col"
                  placeholder="- Pilih Proyek -"
                  bg-color="white"
                />
              </div>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-sm">
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 120px">BOQ</div>
                <q-select
                  v-model="form.boq"
                  :options="boqOptions"
                  dense
                  outlined
                  class="col"
                  placeholder="- Pilih BOQ -"
                  bg-color="white"
                />
              </div>
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 120px">
                  Supplier*
                </div>
                <q-select
                  v-model="form.supplier"
                  :options="supplierOptions"
                  dense
                  outlined
                  class="col"
                  placeholder="Pilih Supplier"
                  bg-color="white"
                />
              </div>
              <div class="row items-center no-wrap">
                <div class="text-caption text-grey-8 q-mr-md" style="min-width: 120px">
                  Tipe Permintaan
                </div>
                <div class="q-gutter-sm">
                  <q-radio v-model="form.tipe" val="RAP" label="RAP" color="orange-9" dense />
                  <q-radio
                    v-model="form.tipe"
                    val="Non RAP"
                    label="Non RAP"
                    color="orange-9"
                    dense
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="text-center q-my-xl">
            <div class="text-h5 text-grey-9 font-weight-bold">Item Purchase Order</div>
            <div class="text-caption text-grey-6 italic">
              Silahkan masukkan item - item purchase order
            </div>
          </div>

          <q-table
            :rows="form.items"
            :columns="itemCols"
            flat
            bordered
            hide-bottom
            separator="cell"
            class="header-blue-grey q-mb-md"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td class="text-center">{{ props.rowIndex + 1 }}</q-td>
                <q-td
                  ><q-select v-model="props.row.item" :options="barangOptions" dense borderless
                /></q-td>
                <q-td class="text-center bg-grey-1 text-grey-7">{{ props.row.kuota }}</q-td>
                <q-td class="text-center bg-grey-1 text-grey-7">{{ props.row.stok }}</q-td>
                <q-td
                  ><q-input
                    v-model.number="props.row.qty"
                    dense
                    borderless
                    type="number"
                    class="text-center text-weight-bold text-primary"
                /></q-td>
                <q-td>
                  <q-select
                    v-model="props.row.satuan"
                    :options="satuanOptions"
                    dense
                    borderless
                    class="text-center"
                  />
                </q-td>
                <q-td
                  ><q-input v-model="props.row.merek" dense borderless class="text-center"
                /></q-td>
                <q-td
                  ><q-input
                    v-model.number="props.row.harga"
                    dense
                    borderless
                    type="number"
                    class="text-right"
                /></q-td>
                <q-td class="text-right text-weight-bold">{{
                  (props.row.qty * props.row.harga).toLocaleString()
                }}</q-td>
                <q-td class="text-center">
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeItem(props.rowIndex)"
                  />
                </q-td>
              </q-tr>
            </template>
            <template v-slot:header-cell-aksi="props">
              <q-th :props="props">
                <q-btn color="indigo-10" icon="add" size="xs" square @click="addItem" />
              </q-th>
            </template>
          </q-table>

          <div class="row q-col-gutter-lg q-mt-md">
            <div class="col-12 col-md-7">
              <div class="text-caption text-grey-8 q-mb-xs">Keterangan</div>
              <q-input
                v-model="form.keterangan"
                type="textarea"
                outlined
                dense
                placeholder="Keterangan"
                rows="6"
                bg-color="white"
              />
            </div>
            <div class="col-12 col-md-5">
              <div class="q-gutter-y-xs">
                <div class="row justify-between items-center bg-grey-1 q-pa-sm">
                  <div class="text-caption text-grey-7 uppercase">Subtotal</div>
                  <div class="text-weight-bold">{{ calculateSubtotal().toLocaleString() }}</div>
                </div>
                <div class="row no-wrap items-center q-gutter-x-sm">
                  <div class="col-4 text-caption text-grey-7 uppercase">Diskon</div>
                  <q-input
                    v-model.number="form.diskon_p"
                    dense
                    outlined
                    class="col-3"
                    suffix="(%)"
                  />
                  <q-input
                    v-model.number="form.diskon_v"
                    dense
                    outlined
                    class="col"
                    readonly
                    bg-color="grey-1"
                  />
                </div>
                <div class="row no-wrap items-center q-gutter-x-sm">
                  <div class="col-4 text-caption text-grey-7 uppercase">Pajak</div>
                  <q-input
                    v-model.number="form.pajak_p"
                    dense
                    outlined
                    class="col-3"
                    suffix="(%)"
                  />
                  <q-input
                    v-model.number="form.pajak_v"
                    dense
                    outlined
                    class="col"
                    readonly
                    bg-color="grey-1"
                  />
                </div>
                <div class="row no-wrap items-center q-gutter-x-sm">
                  <div class="col-4 text-caption text-grey-7 uppercase">Pengiriman</div>
                  <q-input v-model.number="form.biaya_kirim" dense outlined class="col" />
                </div>
                <div class="row no-wrap items-center q-gutter-x-sm">
                  <div class="col-4 text-caption text-grey-7 uppercase">Lain - Lain</div>
                  <q-input v-model.number="form.biaya_lain" dense outlined class="col" />
                </div>
                <div class="q-mt-md">
                  <div class="text-caption text-grey-7 uppercase text-weight-bold">TOTAL</div>
                  <div class="text-h4 text-green-7 text-weight-bolder">
                    {{ calculateTotal().toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row justify-end q-mt-xl q-gutter-x-sm">
            <q-btn
              unelevated
              label="Batal"
              color="negative"
              @click="viewMode = 'LIST'"
              no-caps
              class="q-px-md"
            />
            <q-btn
              unelevated
              label="Simpan"
              color="positive"
              @click="savePo"
              no-caps
              class="q-px-md"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'

const viewMode = ref('LIST')
const filter = ref('')
const satuanOptions = ['Zak', 'Btg', 'M3', 'Kg', 'Pcs', 'Roll', 'Unit']

const form = ref({
  no_po: '',
  tanggal: '2026-04-09',
  no_pengajuan: null,
  proyek: null,
  boq: null,
  supplier: null,
  tipe: 'RAP',
  keterangan: '',
  diskon_p: 0,
  diskon_v: 0,
  pajak_p: 0,
  pajak_v: 0,
  biaya_kirim: 0,
  biaya_lain: 0,
  items: [{ item: '', kuota: 100, stok: 50, qty: 0, satuan: 'Zak', merek: '', harga: 0 }],
})

const colsPo = [
  { name: 'no_po', align: 'left', label: 'No. PO', field: 'no_po' },
  { name: 'no_pengajuan', align: 'left', label: 'No. Pengajuan', field: 'no_p' },
  { name: 'proyek', align: 'left', label: 'Proyek', field: 'proyek' },
  { name: 'supplier', align: 'left', label: 'Supplier', field: 'sup' },
  { name: 'tanggal', align: 'left', label: 'Tanggal', field: 'tgl' },
  { name: 'total', align: 'left', label: 'Total', field: 'total' },
  { name: 'status', align: 'left', label: 'Status', field: 'status' },
  { name: 'user', align: 'left', label: 'Disetujui Oleh', field: 'user' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const itemCols = [
  { name: 'no', label: '#', align: 'center' },
  { name: 'item', label: 'Item', align: 'left' },
  { name: 'kuota', label: 'Kuota', align: 'center' },
  { name: 'stok', label: 'Stok', align: 'center' },
  { name: 'qty', label: 'Qty', align: 'center' },
  { name: 'satuan', label: 'Satuan', align: 'center' },
  { name: 'merek', label: 'Merek', align: 'center' },
  { name: 'harga', label: 'Harga', align: 'right' },
  { name: 'total', label: 'Total', align: 'right' },
  { name: 'aksi', label: '', align: 'center' },
]

const rowsPo = ref([
  {
    id: 1,
    no_po: 'PO/AGRA/2026/001',
    no_p: 'PR-001',
    proyek: 'Villa Seminyak',
    sup: 'PT. Semen Jaya',
    tgl: '2026-04-09',
    total: '5.000.000',
    status: 'Pending',
    user: 'Admin',
  },
])

const pengajuanOptions = ['PR/AGRA/2026/001']
const proyekOptions = ['Villa Seminyak', 'Agra B2']
const boqOptions = ['BOQ-001']
const supplierOptions = ['PT. Semen Indonesia', 'Toko Besi Jaya']
const barangOptions = ['Semen Tiga Roda', 'Besi 10mm']

const addItem = () =>
  form.value.items.push({ item: '', kuota: 0, stok: 0, qty: 0, satuan: 'Pcs', merek: '', harga: 0 })
const removeItem = (idx) => form.value.items.splice(idx, 1)

const calculateSubtotal = () => form.value.items.reduce((sum, i) => sum + i.qty * i.harga, 0)

watch(
  () => [form.value.diskon_p, form.value.pajak_p, form.value.items],
  () => {
    const sub = calculateSubtotal()
    form.value.diskon_v = sub * (form.value.diskon_p / 100)
    form.value.pajak_v = (sub - form.value.diskon_v) * (form.value.pajak_p / 100)
  },
  { deep: true },
)

const calculateTotal = () => {
  const sub = calculateSubtotal()
  return (
    sub -
    form.value.diskon_v +
    form.value.pajak_v +
    (Number(form.value.biaya_kirim) || 0) +
    (Number(form.value.biaya_lain) || 0)
  )
}

const openForm = () => {
  viewMode.value = 'FORM'
}
const savePo = () => {
  viewMode.value = 'LIST'
}
const viewDetail = (row) => {
  console.log(row)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
.header-blue-grey :deep(thead tr th) {
  background-color: #f1f4f7;
  color: #333;
  font-weight: bold;
  font-size: 12px;
}
.bg-grey-1 {
  background-color: #f8f9fa;
}
.uppercase {
  text-transform: uppercase;
}
</style>
