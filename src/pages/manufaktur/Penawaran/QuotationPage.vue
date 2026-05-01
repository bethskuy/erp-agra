<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
          Approval Penawaran Manufaktur
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Otorisasi & Histori Quotation Manufaktur</span
          >
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none row q-gutter-sm items-center justify-end">
        <q-input
          v-model="filter"
          placeholder="Cari nomor atau klien..."
          outlined
          dense
          rounded
          bg-color="white"
          class="q-mr-sm shadow-sm"
          style="min-width: 280px"
          color="teal-10"
        >
          <template v-slot:append>
            <q-icon name="search" color="teal-10" />
          </template>
        </q-input>

        <q-btn
          color="teal-10"
          icon="add"
          label="BUAT PENAWARAN BARU"
          unelevated
          rounded
          class="q-px-lg shadow-premium btn-hover"
          @click="openAddDialog"
        />

        <div class="text-right relative-position q-ml-md">
          <transition
            appear
            enter-active-class="animated bounceInUp"
            leave-active-class="animated fadeOutUp"
          >
            <q-badge
              v-if="showIncrement"
              color="green-14"
              :label="'+' + lastAddedCount"
              class="text-weight-bold shadow-5"
              style="position: absolute; right: 0; top: -15px; z-index: 10"
            />
          </transition>
          <q-badge color="orange-9" class="q-px-md q-py-xs text-weight-bold shadow-1">
            {{ pendingCount }} Dokumen
          </q-badge>
        </div>
      </div>
    </div>

    <!-- TABLE LIST SECTION -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="approval-table"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-teal-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase"
              >{{ col.label }}</q-th
            >
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg cursor-pointer transition-all"
            @click="openPreview(props.row)"
          >
            <q-td key="nomor" class="text-weight-bolder text-teal-10">{{ props.row.nomor }}</q-td>
            <q-td key="nama_customer" class="text-weight-bold uppercase">{{
              props.row.nama_customer
            }}</q-td>
            <q-td key="total_harga" class="text-right text-weight-bolder"
              >IDR {{ (props.row.total_harga || 0).toLocaleString() }}</q-td
            >
            <q-td key="status" class="text-center">
              <q-chip
                text-color="white"
                size="sm"
                class="text-weight-bold shadow-sm"
                :color="getStatusColor(props.row.status)"
                >{{ props.row.status }}</q-chip
              >
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="q-gutter-xs">
                <q-btn
                  flat
                  round
                  color="teal-10"
                  icon="visibility"
                  size="sm"
                  @click="openPreview(props.row)"
                />
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="deleteQuotation(props.row.id)"
                />
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG ENTRY (Layout Presisi per image_3c3bdf.jpg) -->
    <q-dialog
      v-model="showCreateDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column bg-grey-2">
        <!-- TOOLBAR UTAMA -->
        <q-toolbar class="bg-white text-teal-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest"
            >Entry Penawaran Harga Manufaktur</q-toolbar-title
          >
          <q-btn
            unelevated
            color="teal-10"
            label="SIMPAN PENAWARAN"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="saveQuotation"
          />
        </q-toolbar>

        <!-- AREA KONTEN INPUT -->
        <q-card-section class="col scroll q-pa-lg">
          <div class="row justify-center">
            <div class="col-12">
              <!-- SECTION 1: IDENTITAS DOKUMEN & KLIEN -->
              <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                <q-card-section
                  class="bg-teal-1 q-pa-sm text-teal-10 text-weight-bold q-px-md flex items-center"
                >
                  <q-icon name="description" class="q-mr-sm" /> IDENTITAS DOKUMEN & KLIEN
                </q-card-section>
                <q-card-section class="q-pa-lg">
                  <div class="row q-col-gutter-lg items-center">
                    <!-- Area Logo -->
                    <div class="col-12 col-md-2 text-center">
                      <q-img src="logo-agra.png" style="height: 100px; width: 160px" fit="contain">
                        <template v-slot:error
                          ><div class="text-grey-6 text-caption text-weight-bold italic">
                            LOGO AGRA
                          </div></template
                        >
                      </q-img>
                    </div>

                    <!-- Area Input Identitas -->
                    <div class="col-12 col-md-10 row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-input
                          outlined
                          dense
                          v-model="form.nama_pt"
                          label="Nama Perusahaan (Pengirim)"
                          color="teal-10"
                          stack-label
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          outlined
                          dense
                          v-model="form.nomor"
                          label="Nomor Referensi Dokumen"
                          color="teal-10"
                          stack-label
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-select
                          outlined
                          dense
                          v-model="form.nama_customer"
                          :options="customerOptions"
                          label="Pilih Customer / Klien *"
                          color="teal-10"
                          stack-label
                        />
                      </div>
                      <div class="col-12 col-md-3">
                        <q-input
                          outlined
                          dense
                          v-model="form.kota"
                          label="Lokasi Terbit"
                          color="teal-10"
                          stack-label
                        />
                      </div>
                      <div class="col-12 col-md-3">
                        <q-input
                          outlined
                          dense
                          v-model="form.tanggal"
                          type="date"
                          label="Tanggal Penawaran"
                          color="teal-10"
                          stack-label
                        />
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- SECTION 2: RINCIAN PEKERJAAN & MATERIAL (TABEL LEBAR) -->
              <q-card flat bordered class="rounded-20 shadow-1 bg-white overflow-hidden q-mb-lg">
                <q-card-section
                  class="bg-teal-1 q-pa-sm row justify-between items-center text-teal-10 text-weight-bold q-px-md"
                >
                  <div class="row items-center">
                    <q-icon name="list_alt" class="q-mr-sm" />
                    <span>RINCIAN PEKERJAAN & MATERIAL PRODUKSI</span>
                  </div>
                  <q-btn
                    unelevated
                    color="teal-10"
                    icon="add"
                    label="Tambah Baris Item"
                    @click="addItem"
                    class="text-weight-bold q-px-md"
                    dense
                    rounded
                    size="sm"
                  />
                </q-card-section>

                <q-markup-table flat separator="cell" class="entry-table-pro">
                  <thead class="bg-teal-10 text-white">
                    <tr>
                      <th width="50" class="text-center">NO</th>
                      <th class="text-left">DESKRIPSI PEKERJAAN / MATERIAL PRODUKSI</th>
                      <th width="100" class="text-center">QTY</th>
                      <th width="100" class="text-center">UNIT</th>
                      <th width="200" class="text-right">HARGA SATUAN</th>
                      <th width="220" class="text-right">TOTAL AMOUNT</th>
                      <th width="50"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index" class="hover-row">
                      <td class="text-center text-weight-bold text-grey-7 bg-grey-1">
                        {{ index + 1 }}
                      </td>
                      <td>
                        <q-input
                          borderless
                          dense
                          v-model="item.deskripsi"
                          placeholder="Tulis rincian item di sini..."
                          class="full-width"
                        />
                      </td>
                      <td>
                        <q-input
                          borderless
                          dense
                          type="number"
                          v-model.number="item.qty"
                          input-class="text-center text-weight-bold"
                          @update:model-value="calculateTotals"
                        />
                      </td>
                      <td>
                        <q-input
                          borderless
                          dense
                          v-model="item.satuan"
                          input-class="text-center"
                          placeholder="Unit"
                        />
                      </td>
                      <td>
                        <q-input
                          borderless
                          dense
                          type="number"
                          v-model.number="item.harga"
                          prefix="Rp"
                          input-class="text-right text-weight-bold"
                          @update:model-value="calculateTotals"
                        />
                      </td>
                      <td class="text-right text-teal-10 text-weight-bolder bg-teal-1">
                        Rp {{ (item.total || 0).toLocaleString() }}
                      </td>
                      <td class="text-center">
                        <q-btn
                          flat
                          round
                          dense
                          icon="remove_circle"
                          color="red-5"
                          size="sm"
                          @click="removeItem(index)"
                          v-if="form.items.length > 1"
                        />
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-card>

              <!-- SECTION 3: SYARAT, TTD & SUMMARY (LAYOUT BAWAH PRESISI) -->
              <div class="row q-col-gutter-lg">
                <!-- Kolom 1: Syarat & Kondisi -->
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="rounded-20 shadow-1 bg-white h-full overflow-hidden">
                    <q-card-section
                      class="bg-teal-10 text-white q-pa-sm text-weight-bold q-px-md flex items-center"
                    >
                      <q-icon name="gavel" class="q-mr-sm" /> SYARAT & KONDISI
                    </q-card-section>
                    <q-card-section class="q-pa-md">
                      <q-editor
                        v-model="form.syarat"
                        min-height="12rem"
                        flat
                        bordered
                        class="rounded-borders shadow-sm bg-grey-1"
                      />
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Kolom 2: Pengesahan (TTD) -->
                <div class="col-12 col-md-3">
                  <q-card flat bordered class="rounded-20 shadow-1 bg-white h-full overflow-hidden">
                    <q-card-section
                      class="bg-teal-10 text-white q-pa-sm text-weight-bold q-px-md flex items-center"
                    >
                      <q-icon name="draw" class="q-mr-sm" /> PENGESAHAN (TTD)
                    </q-card-section>
                    <q-card-section class="q-pa-md q-gutter-y-lg">
                      <div class="q-mt-sm">
                        <div
                          class="text-caption text-grey-8 q-mb-xs font-bold uppercase tracking-tight"
                        >
                          Nama Penandatangan:
                        </div>
                        <q-input
                          outlined
                          dense
                          v-model="form.ttd_nama"
                          color="teal-10"
                          bg-color="white"
                          placeholder="Nama Lengkap Penanggung Jawab"
                          class="shadow-sm"
                        />
                      </div>
                      <div>
                        <div
                          class="text-caption text-grey-8 q-mb-xs font-bold uppercase tracking-tight"
                        >
                          Jabatan Resmi:
                        </div>
                        <q-input
                          outlined
                          dense
                          v-model="form.ttd_jabatan"
                          color="teal-10"
                          bg-color="white"
                          placeholder="Contoh: Direktur Operasional"
                          class="shadow-sm"
                        />
                      </div>
                      <div class="text-center q-pt-md opacity-20">
                        <q-icon name="drive_file_rename_outline" size="100px" color="grey-7" />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Kolom 3: Summary Biaya (Boxy Style) -->
                <div class="col-12 col-md-5">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 shadow-2 bg-white overflow-hidden h-full flex column"
                  >
                    <div class="q-pa-lg col">
                      <div class="row items-center justify-between q-mb-md">
                        <div
                          class="text-weight-bold text-grey-7 uppercase tracking-widest text-subtitle2"
                        >
                          Biaya Tambahan / Lain-lain
                        </div>
                        <div class="row items-center border-bottom q-pb-xs" style="width: 240px">
                          <span class="q-mr-sm text-grey-6 text-weight-bold text-h6">Rp</span>
                          <q-input
                            borderless
                            dense
                            type="number"
                            v-model.number="form.biaya_lain"
                            input-class="text-right text-weight-bolder text-h5 text-teal-10"
                            @update:model-value="calculateTotals"
                            full-width
                          />
                        </div>
                      </div>
                      <div class="text-caption text-grey-6 italic q-mt-sm">
                        * Input biaya tambahan (ongkir, packing, dll) yang tidak masuk rincian.
                      </div>
                    </div>

                    <!-- Blok Grand Total (Blok Solid Teal) -->
                    <div class="bg-teal-10 text-white q-pa-xl relative-position">
                      <div class="absolute-top-right q-pa-md opacity-20">
                        <q-icon name="payments" size="110px" />
                      </div>
                      <div
                        class="text-subtitle1 text-weight-medium uppercase tracking-widest opacity-80 q-mb-xs"
                      >
                        Grand Total Amount
                      </div>
                      <div
                        class="text-h2 text-weight-bolder row items-baseline no-wrap leading-none"
                      >
                        <span class="text-h5 text-weight-light q-mr-sm opacity-70">IDR</span>
                        {{ (form.total_harga || 0).toLocaleString() }}
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>

              <!-- Footer Penjelasan -->
              <div class="q-mt-xl text-center text-grey-6 text-caption italic">
                <q-icon name="verified_user" color="teal-10" class="q-mr-xs" />
                Sistem Penawaran Manufaktur Agra ERP - Seluruh data tersimpan aman di Cloud
                Firestore.
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- PREVIEW DIALOG (LAYOUT A4) -->
    <q-dialog v-model="showPreview" maximized transition-show="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-teal-10 shadow-2 shrink no-print">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold uppercase"
            >Detail Penawaran Resmi</q-toolbar-title
          >
          <q-btn flat round icon="print" color="teal-10" @click="printNow" />
        </q-toolbar>
        <q-card-section class="col scroll flex flex-center q-pa-md">
          <div
            class="bg-white q-pa-xl shadow-2 text-left"
            style="width: 210mm; min-height: 297mm; color: #111"
          >
            <!-- Header Surat -->
            <div class="row no-wrap items-center">
              <div class="col-auto q-mr-md">
                <q-img src="logo-agra.png" style="height: 70px; width: 140px" fit="contain" />
              </div>
              <div class="col text-left">
                <div class="text-h5 text-weight-bolder text-teal-10 uppercase leading-none">
                  {{ selectedData?.nama_pt }}
                </div>
                <div class="text-caption text-grey-8 italic uppercase">
                  Industrial Fabrication & Manufacturing
                </div>
              </div>
              <div class="col-auto text-right">
                <div class="text-h4 text-weight-thin text-teal-10 tracking-widest uppercase">
                  Quotation
                </div>
              </div>
            </div>
            <div style="height: 3px; background: #004d40; margin-top: 15px"></div>

            <!-- Informasi Klien & Referensi -->
            <div class="row justify-between q-mt-lg text-left">
              <div class="col-7">
                <div class="text-weight-bold text-teal-10 uppercase q-mb-xs">Kepada Yth:</div>
                <div class="text-h6 text-weight-bolder uppercase">
                  {{ selectedData?.nama_customer }}
                </div>
                <div class="text-body2">Di Tempat</div>
              </div>
              <div class="col-5 text-right">
                <div class="row q-mb-xs">
                  <div class="col-5 text-grey-7">No. Ref</div>
                  <div class="col-7 text-weight-bold">: {{ selectedData?.nomor }}</div>
                </div>
                <div class="row">
                  <div class="col-5 text-grey-7">Tanggal</div>
                  <div class="col-7 text-weight-bold">: {{ selectedData?.tanggal }}</div>
                </div>
              </div>
            </div>

            <!-- Tabel Rincian Final -->
            <q-markup-table flat bordered class="q-mt-xl">
              <thead class="bg-teal-10 text-white">
                <tr>
                  <th class="text-left">DESKRIPSI PEKERJAAN</th>
                  <th class="text-center" width="100">QTY</th>
                  <th class="text-right" width="180">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="it in selectedData?.items" :key="it.deskripsi">
                  <td class="text-left uppercase">{{ it.deskripsi }}</td>
                  <td class="text-center">{{ it.qty }} {{ it.satuan }}</td>
                  <td class="text-right text-weight-bold">
                    Rp {{ (it.total || 0).toLocaleString() }}
                  </td>
                </tr>
                <tr class="bg-teal-1 text-teal-10 text-weight-bolder">
                  <td colspan="2" class="text-right uppercase q-pa-md">Grand Total Amount</td>
                  <td class="text-right q-pa-md">
                    Rp {{ (selectedData?.total_harga || 0).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>

            <!-- Bagian TTD Final -->
            <div class="row q-mt-xl justify-end">
              <div class="col-5 text-center">
                <div class="text-weight-bold uppercase q-mb-xl">
                  Hormat Kami,<br />{{ selectedData?.nama_pt }}
                </div>
                <div class="q-mt-xl">
                  <div class="text-h6 text-weight-bolder text-teal-10">
                    <u>{{ selectedData?.ttd_nama }}</u>
                  </div>
                  <div class="text-caption text-grey-7">{{ selectedData?.ttd_jabatan }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const filter = ref('')
const pendingCount = ref(0)
const lastAddedCount = ref(0)
const showIncrement = ref(false)
const showCreateDialog = ref(false)
const showPreview = ref(false)
const selectedData = ref(null)

const customerOptions = ['Obeth', 'PT BRANTAS ABIPRAYA', 'DINDIN NAZMUDIN AKHMAD']

const formDefault = {
  nama_pt: 'PT AGRA ABHINAYA PERKASA',
  nomor: '',
  nama_customer: '',
  kota: 'Bekasi',
  tanggal: new Date().toISOString().substr(0, 10),
  items: [{ deskripsi: '', qty: 1, satuan: 'ls', harga: 0, total: 0 }],
  biaya_lain: 0,
  total_harga: 0,
  syarat: '<ul><li>Uang Muka : 30%</li><li>Berlaku 14 Hari</li></ul>',
  ttd_nama: 'DINDIN NAZMUDIN AKHMAD',
  ttd_jabatan: 'Project Director',
  status: 'Pending',
}
const form = ref({ ...formDefault })

const calculateTotals = () => {
  let subtotal = 0
  form.value.items.forEach((item) => {
    item.total = (item.qty || 0) * (item.harga || 0)
    subtotal += item.total
  })
  form.value.total_harga = subtotal + (form.value.biaya_lain || 0)
}

const addItem = () => {
  form.value.items.push({ deskripsi: '', qty: 1, satuan: 'ls', harga: 0, total: 0 })
}

const removeItem = (i) => {
  form.value.items.splice(i, 1)
  calculateTotals()
}

const openAddDialog = () => {
  form.value = JSON.parse(JSON.stringify(formDefault))
  showCreateDialog.value = true
}

const saveQuotation = async () => {
  if (!form.value.nomor || !form.value.nama_customer) {
    $q.notify({ type: 'negative', message: 'Nomor Ref & Customer wajib diisi!' })
    return
  }
  submitting.value = true
  try {
    await addDoc(collection(db, 'penawaran_manufaktur'), {
      ...form.value,
      updatedAt: serverTimestamp(),
    })
    showCreateDialog.value = false
    $q.notify({ type: 'positive', message: 'Data Berhasil Disimpan!' })
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const deleteQuotation = (id) => {
  $q.dialog({
    title: 'Hapus Data',
    message: 'Yakin ingin menghapus dokumen ini?',
    cancel: true,
    ok: { color: 'negative', label: 'Hapus' },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'penawaran_manufaktur', id))
    $q.notify({ type: 'positive', message: 'Dihapus!' })
  })
}

let unsub = null
const fetchData = () => {
  const q = query(
    collection(db, 'penawaran_manufaktur'),
    where('status', 'in', ['Pending', 'Approved', 'Rejected']),
  )
  unsub = onSnapshot(q, (snap) => {
    const allData = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    rows.value = allData.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
    pendingCount.value = allData.filter((r) => r.status === 'Pending').length
    loading.value = false
  })
}

const getStatusColor = (s) =>
  s === 'Approved' ? 'positive' : s === 'Rejected' ? 'negative' : 'orange-9'

onMounted(() => fetchData())
onUnmounted(() => {
  if (unsub) unsub()
})

const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
}
const printNow = () => window.print()

const columns = [
  { name: 'nomor', align: 'left', label: 'REFERENCE NO', field: 'nomor', sortable: true },
  {
    name: 'nama_customer',
    align: 'left',
    label: 'CLIENT NAME',
    field: 'nama_customer',
    sortable: true,
  },
  {
    name: 'total_harga',
    align: 'right',
    label: 'AMOUNT (IDR)',
    field: 'total_harga',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'ACTIONS' },
]
</script>

<style scoped>
.text-teal-10 {
  color: #004d40;
}
.bg-teal-10 {
  background-color: #004d40 !important;
}
.bg-teal-1 {
  background-color: #e0f2f1;
}
.rounded-20 {
  border-radius: 20px;
}
.font-pro {
  font-family: 'Inter', sans-serif;
}
.entry-table-pro th {
  font-size: 11px;
  font-weight: 800;
  border: 1px solid #004d40;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.border-bottom {
  border-bottom: 2px solid #e0f2f1;
}
.shrink {
  flex: 0 0 auto;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(0, 77, 64, 0.1);
}
.opacity-80 {
  opacity: 0.8;
}
.opacity-30 {
  opacity: 0.3;
}
.opacity-20 {
  opacity: 0.2;
}
.uppercase {
  text-transform: uppercase;
}
.leading-none {
  line-height: 1;
}
.hover-row:hover {
  background-color: #f1f8f7;
}
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
