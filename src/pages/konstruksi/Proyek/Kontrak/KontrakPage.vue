<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="viewMode === 'LIST'">
      <div class="q-mb-xl">
        <div class="text-subtitle2 text-grey-8 q-mb-sm text-weight-bold uppercase">
          Data Proyek Sudah Kontrak
        </div>
        <q-card flat bordered class="rounded-borders bg-white shadow-1">
          <q-card-section class="q-pa-none">
            <div class="row q-pa-md justify-end">
              <div class="row items-center q-gutter-x-sm">
                <div class="text-caption text-grey-7">Search:</div>
                <q-input
                  outlined
                  dense
                  v-model="filterSudah"
                  bg-color="white"
                  style="width: 250px"
                />
              </div>
            </div>

            <q-table
              :rows="rowsSudah"
              :columns="colsSudah"
              flat
              :filter="filterSudah"
              class="text-grey-9 header-blue-grey"
            >
              <template v-slot:body-cell-aksi="props">
                <q-td :props="props" class="text-center">
                  <q-btn flat round icon="more_horiz" size="sm" color="grey-7">
                    <q-menu auto-close>
                      <q-list style="min-width: 120px">
                        <q-item clickable @click="editContract(props.row)">
                          <q-item-section avatar
                            ><q-icon name="edit" color="primary" size="xs"
                          /></q-item-section>
                          <q-item-section>Edit Kontrak</q-item-section>
                        </q-item>
                        <q-item clickable @click="printContract(props.row)">
                          <q-item-section avatar
                            ><q-icon name="print" color="grey-7" size="xs"
                          /></q-item-section>
                          <q-item-section>Cetak SPK</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div>
        <div class="text-subtitle2 text-grey-8 q-mb-sm text-weight-bold uppercase">
          Data Proyek Belum Kontrak
        </div>
        <q-card flat bordered class="rounded-borders bg-white shadow-1">
          <q-card-section class="q-pa-none">
            <div class="row q-pa-md justify-end">
              <div class="row items-center q-gutter-x-sm">
                <div class="text-caption text-grey-7">Search:</div>
                <q-input
                  outlined
                  dense
                  v-model="filterBelum"
                  bg-color="white"
                  style="width: 250px"
                />
              </div>
            </div>

            <q-table
              :rows="rowsBelum"
              :columns="colsBelum"
              flat
              :filter="filterBelum"
              class="text-grey-9 header-blue-grey"
            >
              <template v-slot:body-cell-aksi="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    color="primary"
                    label="Buat Kontrak"
                    no-caps
                    size="sm"
                    unelevated
                    icon="description"
                    @click="openContractForm(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else-if="viewMode === 'FORM'">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-indigo-10 text-weight-bold uppercase">Contract Information</div>
        <q-btn
          flat
          color="grey-7"
          icon="arrow_back"
          label="KEMBALI KE LIST"
          @click="viewMode = 'LIST'"
          no-caps
        />
      </div>

      <q-card flat bordered class="q-mb-md rounded-borders shadow-1 bg-white">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="form.nomor"
              label="Nomor Kontrak"
              outlined
              dense
              placeholder="Auto-generate"
              readonly
              bg-color="grey-1"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="form.tanggal" label="Tanggal Kontrak" outlined dense type="date" />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="form.quotation"
              label="Sales Quotation"
              outlined
              dense
              :options="['SQ-2026-001/AGRA']"
              placeholder="- Pilih Sales Quotation -"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-input
              v-model="form.proyek_nama"
              label="Nama Proyek"
              outlined
              dense
              readonly
              bg-color="grey-1"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-input
              v-model="form.kustomer"
              label="Kustomer"
              outlined
              dense
              readonly
              bg-color="grey-1"
            />
          </div>
        </q-card-section>
      </q-card>

      <div class="text-subtitle2 text-grey-8 q-mb-xs uppercase">Contract Payments</div>
      <q-card flat bordered class="q-mb-md rounded-borders shadow-1 bg-white">
        <q-card-section class="q-pa-none">
          <q-table
            :rows="form.payments"
            :columns="paymentCols"
            flat
            hide-bottom
            separator="cell"
            :pagination="{ rowsPerPage: 0 }"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td class="text-center">{{ props.rowIndex + 1 }}</q-td>
                <q-td
                  ><q-input
                    v-model="props.row.term_name"
                    dense
                    borderless
                    placeholder="Contoh: DP 30%..."
                /></q-td>
                <q-td
                  ><q-input
                    v-model.number="props.row.progress_p"
                    dense
                    borderless
                    suffix="%"
                    class="text-center"
                    type="number"
                /></q-td>
                <q-td
                  ><q-input
                    v-model.number="props.row.payment_p"
                    dense
                    borderless
                    suffix="%"
                    class="text-center"
                    type="number"
                /></q-td>
                <q-td
                  ><q-input
                    v-model.number="props.row.amount"
                    dense
                    borderless
                    prefix="Rp."
                    type="number"
                /></q-td>
                <q-td class="text-center"
                  ><q-checkbox v-model="props.row.retensi" color="orange"
                /></q-td>
                <q-td class="text-center">
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removePayment(props.rowIndex)"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <div class="q-pa-xs row justify-end">
            <q-btn color="orange" icon="add" round size="xs" @click="addPayment" />
          </div>
        </q-card-section>
      </q-card>

      <div class="text-subtitle2 text-grey-8 q-mb-xs uppercase">BOQs</div>
      <q-card
        flat
        bordered
        class="q-mb-md rounded-borders shadow-1 bg-white"
        style="min-height: 50px"
      >
        <q-card-section class="text-center text-grey-6 text-caption italic">
          Data Bill of Quantity (BOQ) akan terlampir otomatis berdasarkan Sales Quotation yang
          dipilih.
        </q-card-section>
      </q-card>

      <div class="text-subtitle2 text-grey-8 q-mb-xs uppercase">Terms</div>
      <q-card flat bordered class="q-mb-md rounded-borders shadow-1 bg-white">
        <q-card-section class="q-pa-sm bg-grey-1 overflow-auto">
          <div class="row q-gutter-xs" style="max-height: 80px">
            <q-badge
              v-for="tag in tags"
              :key="tag"
              color="orange-9"
              text-color="white"
              class="q-pa-xs cursor-pointer"
            >
              [{{ tag }}]
            </q-badge>
          </div>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-editor
            v-model="form.terms_content"
            min-height="500px"
            flat
            square
            :toolbar="[
              ['bold', 'italic', 'underline', 'strike'],
              ['quote', 'unordered', 'ordered'],
              ['left', 'center', 'right', 'justify'],
              ['print', 'fullscreen'],
              ['undo', 'redo'],
            ]"
          />
        </q-card-section>
      </q-card>

      <div class="row justify-end q-mt-md">
        <div class="col-12 col-md-5">
          <q-card flat bordered class="q-pa-md shadow-1">
            <div class="row justify-between items-center q-mb-sm">
              <div class="text-grey-7">Subtotal</div>
              <div class="text-weight-bold text-subtitle1">Rp 0</div>
            </div>
            <div class="row justify-between items-center q-mb-sm">
              <div class="text-grey-7">Diskon</div>
              <div class="row q-gutter-x-sm items-center">
                <q-input
                  v-model.number="form.disc_p"
                  dense
                  outlined
                  suffix="%"
                  style="width: 80px"
                  type="number"
                />
                <q-input
                  v-model.number="form.disc_v"
                  dense
                  outlined
                  prefix="Rp"
                  style="width: 150px"
                  type="number"
                />
              </div>
            </div>
            <div class="row justify-between items-center q-mb-sm">
              <div class="text-grey-7">PPN (11%)</div>
              <div class="row q-gutter-x-sm items-center">
                <q-input
                  v-model.number="form.ppn_p"
                  dense
                  outlined
                  suffix="%"
                  style="width: 80px"
                  type="number"
                />
                <q-input
                  v-model.number="form.ppn_v"
                  dense
                  outlined
                  prefix="Rp"
                  style="width: 150px"
                  type="number"
                />
              </div>
            </div>
            <q-separator class="q-my-md" />
            <div class="row justify-between items-center">
              <div class="text-subtitle1 text-weight-bold uppercase text-primary">
                Total Nilai Kontrak
              </div>
              <div class="text-h5 text-weight-bolder text-positive">Rp 0</div>
            </div>
          </q-card>

          <div class="row justify-end q-mt-lg q-gutter-x-sm">
            <q-btn
              unelevated
              label="BATAL"
              color="negative"
              @click="viewMode = 'LIST'"
              no-caps
              class="q-px-md"
            />
            <q-btn
              unelevated
              label="SIMPAN KONTRAK"
              color="positive"
              @click="saveContract"
              no-caps
              class="q-px-lg"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const viewMode = ref('LIST')
const isEdit = ref(false)
const filterSudah = ref('')
const filterBelum = ref('')

const form = ref({
  id: null,
  nomor: '',
  tanggal: new Date().toISOString().split('T')[0],
  quotation: null,
  proyek_nama: '',
  kustomer: '',
  terms_content: '',
  payments: [
    { term_name: 'DP 1 / Tanda Jadi', progress_p: 0, payment_p: 10, amount: 0, retensi: false },
  ],
  disc_p: 0,
  disc_v: 0,
  ppn_p: 11,
  ppn_v: 0,
})

const tags = [
  'tanggal_kontrak',
  'nama_perusahaan',
  'alamat_perusahaan',
  'pemilik_perusahaan',
  'nama_proyek',
  'alamat_proyek',
  'nama_kustomer',
  'alamat_kustomer',
  'nik_kustomer',
  'tahun_proyek',
  'lama_proyek',
  'harga_proyek',
  'no_rekening_perusahaan',
  'nama_bank_rekening',
  'rincian_termin_pembayaran',
  'tabel_termin_pembayaran',
]

const paymentCols = [
  { name: 'no', label: 'No', align: 'center' },
  { name: 'term', label: 'Term Name', align: 'left' },
  { name: 'progress', label: 'Progress %', align: 'center' },
  { name: 'payment', label: 'Payment %', align: 'center' },
  { name: 'amount', label: 'Payment Amount', align: 'left' },
  { name: 'retensi', label: 'Retensi', align: 'center' },
  { name: 'aksi', label: '', align: 'center' },
]

const colsSudah = [
  { name: 'no', align: 'left', label: 'No. Kontrak', field: 'nomor' },
  { name: 'tgl', align: 'left', label: 'Tgl. Kontrak', field: 'tanggal' },
  { name: 'nama', align: 'left', label: 'Nama Proyek', field: 'nama' },
  { name: 'kustomer', align: 'left', label: 'Kustomer', field: 'kustomer' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const colsBelum = [
  { name: 'no', align: 'left', label: 'No. Proyek', field: 'nomor' },
  { name: 'nama', align: 'left', label: 'Nama Proyek', field: 'nama' },
  { name: 'kustomer', align: 'left', label: 'Kustomer', field: 'kustomer' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const rowsSudah = ref([
  {
    id: 101,
    nomor: 'CTR/AGRA/2026/001',
    tanggal: '2026-04-01',
    nama: 'Villa Modern Seminyak',
    kustomer: 'Bpk. Andre',
  },
])

const rowsBelum = ref([
  { id: 1, nomor: 'PRJ/2026/1101', nama: 'Agra Town House - Unit A1', kustomer: 'Ibu Ratna' },
])

const openContractForm = (proyek) => {
  isEdit.value = false
  form.value = {
    id: null,
    nomor: `CTR/AGRA/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`,
    tanggal: new Date().toISOString().split('T')[0],
    quotation: null,
    proyek_nama: proyek.nama,
    kustomer: proyek.kustomer,
    payments: [
      { term_name: 'DP 1 / Tanda Jadi', progress_p: 0, payment_p: 10, amount: 0, retensi: false },
    ],
    terms_content: `
      <div style="text-align:center; font-family:'Times New Roman', serif;">
        <span style="font-size:16px"><strong><u>SURAT PERJANJIAN KERJA</u></strong></span><br />
        <span style="font-size:14px"><strong>{nama_proyek}</strong></span>
      </div>
      <br/>
      <p>Pada hari ini, {tanggal_kontrak} di Bandung, telah disepakati perjanjian antara...</p>
    `,
    disc_p: 0,
    disc_v: 0,
    ppn_p: 11,
    ppn_v: 0,
  }
  viewMode.value = 'FORM'
}

const addPayment = () => {
  form.value.payments.push({
    term_name: '',
    progress_p: 0,
    payment_p: 0,
    amount: 0,
    retensi: false,
  })
}

const removePayment = (index) => {
  form.value.payments.splice(index, 1)
}

const editContract = (row) => {
  isEdit.value = true
  // Simulasi load data
  form.value = {
    ...row,
    proyek_nama: row.nama,
    terms_content: 'Kontrak sudah ada...',
    payments: [
      { term_name: 'DP 1', progress_p: 0, payment_p: 10, amount: 50000000, retensi: false },
    ],
  }
  viewMode.value = 'FORM'
}

const saveContract = () => {
  $q.notify({ color: 'positive', message: 'Kontrak Proyek Berhasil Disimpan!', icon: 'check' })
  viewMode.value = 'LIST'
}

const printContract = (row) => {
  $q.notify({ message: `Mencetak SPK untuk ${row.nomor}...`, color: 'info' })
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
}
.text-indigo-10 {
  color: #1a237e !important;
}
.uppercase {
  text-transform: uppercase;
}
</style>
