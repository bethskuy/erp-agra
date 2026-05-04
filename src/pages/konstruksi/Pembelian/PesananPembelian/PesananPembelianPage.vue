<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-lg-lg font-pro">
    <!-- VIEW MODE: LIST -->
    <div v-if="viewMode === 'LIST'" class="animate-fade">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bolder text-indigo-10">Purchase Order</div>
          <div class="text-subtitle2 text-grey-7">
            Manajemen pesanan pembelian material terintegrasi real-time
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            color="indigo-10"
            icon="add"
            label="Buat PO Baru"
            no-caps
            rounded
            unelevated
            class="shadow-3"
            @click="openForm"
          />
        </div>
      </div>

      <!-- STATS SUMMARY -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-4">
          <q-card flat class="rounded-16 bg-white shadow-sm border-left-blue">
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 text-uppercase tracking-widest text-weight-bold">
                Total Transaksi
              </div>
              <div class="text-h5 text-weight-bolder text-indigo-10">
                Rp {{ formatMoney(totalVolume) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-4">
          <q-card flat class="rounded-16 bg-white shadow-sm border-left-orange">
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 text-uppercase tracking-widest text-weight-bold">
                PO Pending
              </div>
              <div class="text-h5 text-weight-bolder text-orange-9">
                {{ rowsPo.filter((x) => x.status === 'Pending').length }} Transaksi
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-4">
          <q-card flat class="rounded-16 bg-white shadow-sm border-left-green">
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 text-uppercase tracking-widest text-weight-bold">
                PO Approved
              </div>
              <div class="text-h5 text-weight-bolder text-green-8">
                {{ rowsPo.filter((x) => x.status === 'Approved').length }} Transaksi
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- TABLE AREA -->
      <q-card flat class="rounded-16 shadow-2 overflow-hidden bg-white">
        <q-table
          :rows="rowsPo"
          :columns="colsPo"
          flat
          :filter="filter"
          :loading="loading"
          class="po-table"
        >
          <template v-slot:top-right>
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari PO..."
              class="bg-white"
              style="width: 250px"
            >
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
            </q-input>
          </template>
          <template v-slot:body-cell-total="props">
            <q-td :props="props" class="text-right text-weight-bold text-indigo-10">
              Rp {{ formatMoney(props.row.grand_total) }}
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props" class="text-center">
              <q-chip
                :color="props.row.status === 'Pending' ? 'orange-1' : 'green-1'"
                :text-color="props.row.status === 'Pending' ? 'orange-9' : 'green-9'"
                class="text-weight-bold"
                dense
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" auto-width>
              <q-btn
                flat
                round
                icon="visibility"
                color="indigo-10"
                size="sm"
                @click="viewDetail(props.row)"
              />
              <q-btn
                flat
                round
                icon="delete_outline"
                color="negative"
                size="sm"
                @click="hapusPo(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- VIEW MODE: FORM -->
    <div v-else-if="viewMode === 'FORM'" class="animate-fade-up">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="indigo-10"
          @click="viewMode = 'LIST'"
          class="q-mr-md bg-white shadow-1"
        />
        <div>
          <div class="text-h5 text-weight-bolder text-indigo-10 uppercase">
            Input Purchase Order
          </div>
          <div class="text-caption text-grey-7">
            Tarik data dari Purchase Request (PR) atau input manual
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- LEFT PANEL -->
        <div class="col-12 col-lg-8">
          <q-card flat class="rounded-16 shadow-2 q-mb-lg bg-white border-indigo-thin">
            <q-card-section class="q-pa-lg">
              <div class="text-subtitle1 text-weight-bold text-indigo-10 q-mb-lg flex items-center">
                <q-icon name="fact_check" color="primary" class="q-mr-sm" /> 1. SUMBER DOKUMEN &
                TUJUAN
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="label-req">Tarik Data Purchase Request (PR)</div>
                  <q-select
                    v-model="selectedPr"
                    :options="optPr"
                    option-label="nomor"
                    outlined
                    dense
                    rounded
                    bg-color="indigo-1"
                    placeholder="Pilih PR untuk narik data..."
                    @update:model-value="onPrChange"
                  >
                    <template v-slot:prepend
                      ><q-icon name="auto_fix_high" color="primary"
                    /></template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>{{ scope.opt.nomor }}</q-item-label>
                          <q-item-label caption
                            >{{ scope.opt.dari_gudang?.nama }} -
                            {{ scope.opt.status }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-6">
                  <div class="label-req">Tanggal Transaksi</div>
                  <q-input
                    v-model="form.tanggal"
                    type="date"
                    outlined
                    dense
                    rounded
                    bg-color="white"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <div class="label-req">Proyek / Warehouse Tujuan</div>
                  <q-select
                    v-model="form.proyek_obj"
                    :options="optProyek"
                    option-label="nama"
                    outlined
                    dense
                    rounded
                    bg-color="white"
                    placeholder="Pilih proyek..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <div class="label-req">Supplier Material</div>
                  <q-select
                    v-model="form.supplier_obj"
                    :options="optSupplier"
                    option-label="nama"
                    outlined
                    dense
                    rounded
                    bg-color="white"
                    placeholder="Cari vendor/supplier..."
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- ITEMS TABLE -->
          <q-card flat class="rounded-16 shadow-2 bg-white overflow-hidden">
            <q-card-section class="q-pa-lg">
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle1 text-weight-bold text-indigo-10 flex items-center">
                  <q-icon name="shopping_basket" color="primary" class="q-mr-sm" /> 2. RINCIAN ITEM
                  BARANG
                </div>
                <q-btn
                  label="Tambah Baris"
                  icon="add"
                  color="indigo-10"
                  rounded
                  unelevated
                  size="sm"
                  @click="addItem"
                />
              </div>

              <q-table
                :rows="form.items"
                :columns="itemCols"
                flat
                bordered
                hide-bottom
                separator="cell"
                class="po-items-table rounded-12"
              >
                <template v-slot:body="props">
                  <q-tr :props="props" class="hover-row">
                    <td class="text-center text-weight-bold text-grey-6">
                      {{ props.rowIndex + 1 }}
                    </td>
                    <td style="min-width: 250px">
                      <q-select
                        v-model="props.row.barang_obj"
                        :options="optBarang"
                        option-label="nama"
                        dense
                        borderless
                        @update:model-value="(v) => onBarangSelect(v, props.rowIndex)"
                        placeholder="Pilih material..."
                      />
                    </td>
                    <td>
                      <q-input
                        v-model.number="props.row.qty"
                        dense
                        borderless
                        type="number"
                        class="text-center text-weight-bold text-indigo-10"
                      />
                    </td>
                    <td class="text-center uppercase text-caption text-bold text-grey-7">
                      {{ props.row.satuan || '-' }}
                    </td>
                    <td>
                      <q-input
                        v-model.number="props.row.harga"
                        dense
                        borderless
                        type="number"
                        class="text-right text-weight-bold"
                        prefix="Rp"
                      />
                    </td>
                    <td class="text-right text-weight-bolder text-indigo-10">
                      {{ (props.row.qty * props.row.harga).toLocaleString() }}
                    </td>
                    <td class="text-center">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="close"
                        size="xs"
                        @click="removeItem(props.rowIndex)"
                      />
                    </td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>

        <!-- RIGHT PANEL (CALCULATION) -->
        <div class="col-12 col-lg-4">
          <q-card flat class="rounded-16 shadow-3 bg-indigo-10 text-white sticky-top">
            <q-card-section class="q-pa-xl">
              <div class="text-overline tracking-widest opacity-70">VALUASI PEMBAYARAN</div>
              <div class="text-h6 text-weight-bold q-mb-xl">Ringkasan Biaya PO</div>

              <div class="q-gutter-y-md">
                <div class="row justify-between items-center">
                  <div class="opacity-70 uppercase font-10">Subtotal Belanja</div>
                  <div class="text-weight-bold text-subtitle1">
                    Rp {{ calculateSubtotal().toLocaleString() }}
                  </div>
                </div>

                <div class="row no-wrap items-center q-gutter-x-sm">
                  <div class="col-5 opacity-70 uppercase font-10">Diskon (%)</div>
                  <q-input
                    v-model.number="form.diskon_p"
                    dense
                    dark
                    outlined
                    rounded
                    class="col"
                    bg-color="white-1"
                    type="number"
                  />
                </div>

                <div class="row no-wrap items-center q-gutter-x-sm">
                  <div class="col-5 opacity-70 uppercase font-10">Pajak PPN (%)</div>
                  <q-input
                    v-model.number="form.pajak_p"
                    dense
                    dark
                    outlined
                    rounded
                    class="col"
                    bg-color="white-1"
                    type="number"
                  />
                </div>

                <div class="row no-wrap items-center q-gutter-x-sm">
                  <div class="col-5 opacity-70 uppercase font-10">Ongkir</div>
                  <q-input
                    v-model.number="form.biaya_kirim"
                    dense
                    dark
                    outlined
                    rounded
                    class="col"
                    bg-color="white-1"
                    type="number"
                  />
                </div>

                <q-separator dark class="q-my-md opacity-20" />

                <div class="text-center q-py-lg">
                  <div class="text-caption opacity-70 uppercase tracking-widest font-10">
                    GRAND TOTAL PO
                  </div>
                  <div class="text-h3 text-weight-black">
                    Rp {{ calculateTotal().toLocaleString() }}
                  </div>
                </div>

                <q-btn
                  label="PROSES TERBITKAN PO"
                  color="white"
                  text-color="indigo-10"
                  class="full-width q-py-md text-weight-black rounded-12 shadow-8"
                  unelevated
                  :loading="submitting"
                  @click="savePo"
                />
                <q-btn
                  label="Batal"
                  flat
                  color="white"
                  class="full-width q-mt-sm opacity-60"
                  @click="viewMode = 'LIST'"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()
const viewMode = ref('LIST')
const loading = ref(true)
const submitting = ref(false)
const filter = ref('')

// --- DATA SOURCE ---
const rowsPo = ref([])
const optProyek = ref([])
const optSupplier = ref([])
const optBarang = ref([])
const optPr = ref([])
const totalVolume = ref(0)

// --- FORM STATE ---
const selectedPr = ref(null)
const form = ref({
  no_po: '',
  tanggal: new Date().toISOString().substr(0, 10),
  pr_id: null,
  proyek_obj: null,
  supplier_obj: null,
  diskon_p: 0,
  pajak_p: 0,
  biaya_kirim: 0,
  items: [],
  keterangan: '',
})

let unsubPo = null
let unsubPr = null

// --- LOGIKA FETCHING ---
const fetchDropdowns = async () => {
  try {
    // Ambil Proyek & Supplier (Static Fetch)
    const projSnap = await getDocs(collection(db, 'proyek'))
    optProyek.value = projSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const supSnap = await getDocs(collection(db, 'suppliers'))
    optSupplier.value = supSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    // Ambil Master Barang
    const barSnap = await getDocs(query(collection(db, 'master_barang'), orderBy('nama', 'asc')))
    optBarang.value = barSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error(e)
  }
}

const listenPR = () => {
  // Listener Real-time untuk Purchase Request
  // FIX: Kita ambil status 'Approved' DAN 'Pending' (untuk kemudahan bos saat ngetest)
  const q = query(collection(db, 'permintaan_barang'), where('tipe', '==', 'PURCHASE_REQUEST'))
  unsubPr = onSnapshot(q, (snap) => {
    // Filter manual di JS agar lebih fleksibel (Firestore filter index-heavy)
    optPr.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => d.status === 'Approved' || d.status === 'Pending')
  })
}

const listenPo = () => {
  loading.value = true
  const q = query(collection(db, 'purchase_orders'), orderBy('createdAt', 'desc'))
  unsubPo = onSnapshot(q, (snap) => {
    rowsPo.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    totalVolume.value = rowsPo.value.reduce((acc, curr) => acc + (curr.grand_total || 0), 0)
    loading.value = false
  })
}

// --- LOGIKA FORM ---
const openForm = () => {
  form.value = {
    no_po: 'PO/AAP/' + (new Date().getMonth() + 1) + '/' + Date.now().toString().slice(-4),
    tanggal: new Date().toISOString().substr(0, 10),
    items: [{ barang_obj: null, id_barang: '', nama_barang: '', qty: 1, satuan: '', harga: 0 }],
    diskon_p: 0,
    pajak_p: 0,
    biaya_kirim: 0,
    keterangan: '',
  }
  selectedPr.value = null
  viewMode.value = 'FORM'
}

// LOGIKA KRUSIAL: Menarik data PR ke form PO
const onPrChange = (pr) => {
  if (pr && pr.items) {
    $q.notify({ icon: 'auto_fix_high', color: 'indigo-10', message: 'Sinkronisasi PR Berhasil!' })

    // Mapping Items PR ke PO
    form.value.items = pr.items.map((it) => ({
      // Cari objek barang di optBarang agar dropdown ter-select otomatis
      barang_obj: optBarang.value.find((b) => b.id === it.id_barang) || {
        id: it.id_barang,
        nama: it.nama_barang,
        unit: it.satuan,
      },
      id_barang: it.id_barang,
      nama_barang: it.nama_barang,
      qty: it.qty,
      satuan: it.satuan,
      harga: it.estimasi_harga || 0,
    }))

    form.value.pr_id = pr.id
    form.value.keterangan = pr.catatan || ''

    // Auto Select Proyek/Warehouse Asal PR
    const foundProj = optProyek.value.find((p) => p.id === pr.dari_gudang?.id)
    if (foundProj) form.value.proyek_obj = foundProj
  }
}

const onBarangSelect = (barang, idx) => {
  if (barang) {
    form.value.items[idx].id_barang = barang.id
    form.value.items[idx].nama_barang = barang.nama
    form.value.items[idx].satuan = barang.unit || barang.satuan
  }
}

const addItem = () =>
  form.value.items.push({
    barang_obj: null,
    id_barang: '',
    nama_barang: '',
    qty: 1,
    satuan: '',
    harga: 0,
  })
const removeItem = (idx) => {
  if (form.value.items.length > 1) form.value.items.splice(idx, 1)
}

const calculateSubtotal = () => form.value.items.reduce((sum, i) => sum + (i.qty * i.harga || 0), 0)
const calculateTotal = () => {
  const sub = calculateSubtotal()
  const diskonVal = sub * (form.value.diskon_p / 100)
  const pajakVal = (sub - diskonVal) * (form.value.pajak_p / 100)
  return sub - diskonVal + pajakVal + (Number(form.value.biaya_kirim) || 0)
}

// --- SUBMIT ---
const savePo = async () => {
  if (!form.value.proyek_obj || !form.value.supplier_obj) {
    $q.notify({ type: 'warning', message: 'Lengkapi Proyek & Supplier!' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      ...form.value,
      grand_total: calculateTotal(),
      status: 'Pending',
      issuer: { id: authStore.user?.uid, nama: authStore.user?.nama },
      proyek_id: form.value.proyek_obj.id,
      proyek_nama: form.value.proyek_obj.nama,
      supplier_id: form.value.supplier_obj.id,
      supplier_nama: form.value.supplier_obj.nama,
      createdAt: serverTimestamp(),
    }

    // Clean up proxy objects
    delete payload.proyek_obj
    delete payload.supplier_obj
    payload.items.forEach((it) => delete it.barang_obj)

    await addDoc(collection(db, 'purchase_orders'), payload)

    // Update status PR asli jadi 'Ordered' (Agar tidak diproses double)
    if (form.value.pr_id) {
      await updateDoc(doc(db, 'permintaan_barang', form.value.pr_id), { status: 'Ordered' })
    }

    $q.notify({ type: 'positive', message: 'PO Berhasil Diterbitkan!' })
    viewMode.value = 'LIST'
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal Simpan: ' + e.message })
  } finally {
    submitting.value = false
  }
}

const hapusPo = (row) => {
  $q.dialog({ title: 'Hapus PO?', message: 'Tindakan ini permanen.', cancel: true }).onOk(
    async () => {
      await deleteDoc(doc(db, 'purchase_orders', row.id))
    },
  )
}

const formatMoney = (v) => v.toLocaleString('id-ID')

const viewDetail = (row) => {
  $q.dialog({
    title: `<span class="text-indigo-10 text-weight-bold">PO: ${row.no_po}</span>`,
    message: `Supplier: ${row.supplier_nama}<br>Proyek: ${row.proyek_nama}<br><b>Total: Rp ${formatMoney(row.grand_total)}</b>`,
    html: true,
    ok: { unelevated: true, color: 'indigo-10', label: 'Tutup' },
  })
}

onMounted(() => {
  fetchDropdowns()
  listenPR()
  listenPo()
})

onUnmounted(() => {
  if (unsubPo) unsubPo()
  if (unsubPr) unsubPr()
})

const colsPo = [
  { name: 'no_po', align: 'left', label: 'NOMOR PO', field: 'no_po', sortable: true },
  { name: 'proyek', align: 'left', label: 'PROYEK', field: 'proyek_nama' },
  { name: 'supplier', align: 'left', label: 'SUPPLIER', field: 'supplier_nama' },
  { name: 'tanggal', align: 'left', label: 'TGL', field: 'tanggal' },
  { name: 'total', align: 'right', label: 'TOTAL (RP)', field: 'grand_total' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: '' },
]

const itemCols = [
  { name: 'no', label: '#', align: 'center' },
  { name: 'item', label: 'Pilih Material', align: 'left' },
  { name: 'qty', label: 'Vol', align: 'center' },
  { name: 'satuan', label: 'Unit', align: 'center' },
  { name: 'harga', label: 'Hrg Satuan', align: 'right' },
  { name: 'total', label: 'Total', align: 'right' },
  { name: 'aksi', label: '', align: 'center' },
]
</script>

<style lang="scss" scoped>
.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-16 {
  border-radius: 16px;
}
.po-table {
  :deep(thead tr th) {
    background-color: #f8fafd;
    color: #546e7a;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 16px;
  }
  :deep(tbody tr td) {
    font-size: 13px;
    color: #37474f;
  }
}
.po-items-table :deep(thead tr th) {
  background-color: #1a237e;
  color: white;
  font-weight: 700;
}
.border-left-blue {
  border-left: 6px solid #1a237e;
}
.border-left-orange {
  border-left: 6px solid #e65100;
}
.border-left-green {
  border-left: 6px solid #2e7d32;
}
.sticky-top {
  position: sticky;
  top: 20px;
}
.white-1 {
  background-color: rgba(255, 255, 255, 0.15) !important;
}
.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  margin-bottom: 5px;
  text-transform: uppercase;
}
.font-10 {
  font-size: 10px;
}
.border-indigo-thin {
  border: 1px solid #e8eaf6;
}
.animate-fade {
  animation: fadeIn 0.5s ease-out;
}
.animate-fade-up {
  animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
