<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <div class="row items-center q-mb-md no-print">
      <div class="col">
        <div class="text-h5 text-weight-bolder text-primary uppercase">Data Penawaran</div>
        <div class="text-caption text-grey-7">Daftar penawaran yang telah dibuat</div>
      </div>
      <div class="col-auto">
        <!-- Tombol Tambah: Hanya muncul jika punya izin 'buat' -->
        <q-btn
          v-if="canAction('buat')"
          unelevated
          color="primary"
          icon="add"
          label="Tambah Penawaran"
          @click="openAddDialog"
          class="btn-radius shadow-2"
        />
      </div>
    </div>

    <q-card flat bordered class="no-print shadow-1">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        @row-click="(evt, row) => openPreview(row)"
        class="cursor-pointer"
      >
        <template v-slot:top-right>
          <q-input outlined dense v-model="filter" placeholder="Cari data...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>
        <template v-slot:body-cell-nama_customer="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.value }}</div>
            <div
              v-if="props.row.status === 'Rejected' && props.row.alasan_reject"
              class="text-negative text-caption row items-center q-gutter-xs q-mt-xs"
            >
              <q-icon name="error_outline" size="14px" />
              <span class="text-italic text-weight-medium">Ket: {{ props.row.alasan_reject }}</span>
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              inline
              text-color="white"
              size="sm"
              class="text-weight-bold"
              :color="
                props.value === 'Approved'
                  ? 'positive'
                  : props.value === 'Rejected'
                    ? 'negative'
                    : props.value === 'Pending'
                      ? 'orange'
                      : 'grey-7'
              "
            >
              {{ props.value || 'Draft' }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-total_harga="props">
          <q-td :props="props" class="text-right text-weight-bold text-primary"
            >Rp {{ (props.value || 0).toLocaleString() }}</q-td
          >
        </template>

        <!-- KOLOM AKSI: Proteksi izin 'ubah' dan 'hapus' -->
        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center" @click.stop>
            <!-- Tombol Ajukan: Biasanya butuh izin 'ubah' karena merubah status ke Pending -->
            <q-btn
              v-if="
                canAction('ubah') &&
                props.row.is_revised &&
                props.row.status !== 'Pending' &&
                props.row.status !== 'Approved'
              "
              flat
              round
              color="orange-9"
              icon="send"
              size="sm"
              @click="ajukanPenawaran(props.row)"
            />
            <!-- Tombol Edit: Muncul jika status belum Approved DAN punya izin 'ubah' -->
            <q-btn
              v-if="props.row.status !== 'Approved' && canAction('ubah')"
              flat
              round
              color="blue"
              icon="edit"
              size="sm"
              @click="openEditDialog(props.row)"
            />
            <!-- Tombol Delete: Muncul jika punya izin 'hapus' -->
            <q-btn
              v-if="canAction('hapus')"
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmHapus(props.row)"
            />
            <!-- Indikator jika tidak ada izin aksi -->
            <q-badge
              v-if="!canAction('ubah') && !canAction('hapus')"
              color="grey-2"
              text-color="grey-7"
              label="No Action"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent maximized transition-show="slide-up">
      <q-card class="column bg-grey-1">
        <q-toolbar class="bg-white text-grey-9 q-py-md bordered-bottom">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase">Entry Penawaran</q-toolbar-title>
          <q-btn
            unelevated
            color="primary"
            label="Simpan Data"
            :loading="submitting"
            @click="simpanPenawaran"
            class="q-px-xl"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md">
          <div class="row q-col-gutter-md justify-center">
            <div class="col-12 col-lg-10">
              <q-card flat bordered class="q-mb-md">
                <q-card-section class="bg-blue-1 text-primary text-bold uppercase"
                  >1. Identitas Dokumen</q-card-section
                >
                <q-card-section class="row q-col-gutter-sm">
                  <div class="col-12 col-md-4">
                    <q-file
                      outlined
                      dense
                      v-model="tempKopFile"
                      label="Logo"
                      accept="image/*"
                      @update:model-value="uploadKopPermanen"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input outlined dense v-model="form.nama_pt" label="Nama Perusahaan" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input outlined dense v-model="form.tagline_pt" label="Tagline" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input outlined dense v-model="form.nomor" label="Nomor Penawaran" />
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="row q-col-gutter-xs">
                      <div class="col-6"><q-input outlined dense v-model="form.kota" /></div>
                      <div class="col-6">
                        <q-input outlined dense v-model="form.tanggal" type="date" />
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      outlined
                      dense
                      v-model="selectedCustomer"
                      :options="optCustomer"
                      option-label="nama"
                      label="Customer"
                      @update:model-value="onCustomerChange"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="q-mb-md">
                <q-card-section class="row items-center bg-grey-2">
                  <div class="text-bold text-subtitle2 uppercase">2. Rincian Pekerjaan</div>
                  <q-space />
                  <q-btn
                    flat
                    dense
                    icon="add"
                    color="primary"
                    label="Tambah"
                    @click="addDetailItem"
                  />
                </q-card-section>
                <q-markup-table flat separator="cell">
                  <thead>
                    <tr class="bg-grey-1 text-primary text-weight-bold">
                      <th width="50">NO</th>
                      <th>DESKRIPSI</th>
                      <th width="80">QTY</th>
                      <th width="80">UNIT</th>
                      <th width="150">HARGA</th>
                      <th width="150">TOTAL</th>
                      <th width="50"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td><q-input v-model="item.deskripsi" dense borderless /></td>
                      <td>
                        <q-input
                          v-model.number="item.qty"
                          type="number"
                          dense
                          borderless
                          @update:model-value="calcRow(index)"
                        />
                      </td>
                      <td><q-input v-model="item.satuan" dense borderless /></td>
                      <td>
                        <q-input
                          v-model.number="item.harga"
                          type="number"
                          dense
                          borderless
                          @update:model-value="calcRow(index)"
                        />
                      </td>
                      <td class="text-right text-bold">
                        Rp {{ (item.total || 0).toLocaleString() }}
                      </td>
                      <td>
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="delete"
                          size="xs"
                          @click="removeDetailItem(index)"
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-grey-1">
                    <tr>
                      <td colspan="5" class="text-right text-bold uppercase">Subtotal</td>
                      <td class="text-right text-bold text-primary">
                        Rp {{ subtotal.toLocaleString() }}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colspan="4"></td>
                      <td class="text-right text-bold uppercase">Tax (%)</td>
                      <td class="text-right">
                        <q-input
                          v-model.number="form.tax_rate"
                          type="number"
                          dense
                          borderless
                          input-class="text-right"
                          style="width: 100%"
                          @update:model-value="updateGrandTotal"
                        />
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colspan="4"></td>
                      <td class="text-right text-bold uppercase">
                        <q-input
                          v-model="form.biaya_lain_label"
                          dense
                          borderless
                          input-class="text-right text-bold uppercase"
                          placeholder="BIAYA LAIN"
                        />
                      </td>
                      <td class="text-right">
                        <q-input
                          v-model.number="form.biaya_lain"
                          type="number"
                          dense
                          borderless
                          input-class="text-right"
                          style="width: 100%"
                          @update:model-value="updateGrandTotal"
                        />
                      </td>
                      <td></td>
                    </tr>
                    <tr class="bg-blue-1 text-primary">
                      <td colspan="5" class="text-right text-bold text-h6 uppercase">
                        Grand Total
                      </td>
                      <td class="text-right text-h6 text-bold">
                        Rp {{ (form.total_harga || 0).toLocaleString() }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </q-markup-table>
              </q-card>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="q-pa-sm"
                    ><q-editor v-model="form.terms" min-height="10rem"
                  /></q-card>
                </div>
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="q-pa-sm">
                    <q-editor v-model="form.closing" class="q-mb-sm" />
                    <q-input
                      outlined
                      dense
                      v-model="form.ttd_nama"
                      label="Nama TTD"
                      class="q-mb-xs"
                    />
                    <q-input outlined dense v-model="form.ttd_jabatan" label="Jabatan" />
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showPreview" maximized transition-show="fade">
      <q-card class="column no-wrap bg-grey-3">
        <q-toolbar class="bg-white text-grey-9 q-py-md no-print bordered-bottom shadow-2">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase text-primary"
            >Preview Dokumen</q-toolbar-title
          >
          <q-btn-group unelevated class="q-ml-md">
            <q-btn color="primary" icon="print" label="Print" @click="printPage" />
            <q-btn color="red-8" icon="picture_as_pdf" label="Export PDF" @click="exportToPDF" />
            <q-btn color="green-8" icon="table_chart" label="Excel" @click="exportToExcel" />
          </q-btn-group>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg flex flex-center">
          <div id="quotation-print" class="letter-paper shadow-24" v-if="selectedData">
            <div class="row no-wrap items-center">
              <div v-if="config.kopUrl" class="col-auto q-mr-xl">
                <img :src="config.kopUrl" class="final-kop-img" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase">{{ selectedData.nama_pt }}</div>
                <div class="final-pt-tagline italic text-grey-8">{{ selectedData.tagline_pt }}</div>
              </div>
            </div>
            <div class="final-divider"></div>

            <div class="row justify-between items-start q-mt-lg q-mb-md text-left">
              <div class="col-6">
                <div class="label-grey-pro uppercase">KEPADA YTH :</div>
                <div class="client-name-pro uppercase">{{ selectedData.nama_customer }}</div>
                <div class="text-body2">Di Tempat</div>
              </div>
              <div class="col-5 text-right">
                <div class="quotation-title-pro uppercase">Quotation</div>
                <div class="quotation-no-pro">{{ selectedData.nomor }}</div>
                <div class="text-date-pro">
                  {{ selectedData.kota }}, {{ formatIndoDate(selectedData.tanggal) }}
                </div>
              </div>
            </div>

            <div class="text-body2 q-mb-sm text-left" v-html="selectedData.introduction"></div>

            <table class="final-pro-table q-mb-md">
              <thead>
                <tr>
                  <th width="40">NO</th>
                  <th class="text-left">DESCRIPTION</th>
                  <th width="60">QTY</th>
                  <th width="60">UNIT</th>
                  <th width="120">PRICE</th>
                  <th width="140">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in selectedData.items" :key="i">
                  <td class="text-center">{{ i + 1 }}</td>
                  <td class="text-left uppercase">{{ it.deskripsi }}</td>
                  <td class="text-center">{{ it.qty }}</td>
                  <td class="text-center uppercase text-caption">{{ it.satuan }}</td>
                  <td class="text-right">{{ it.harga.toLocaleString() }}</td>
                  <td class="text-right text-weight-bolder">{{ it.total.toLocaleString() }}</td>
                </tr>
              </tbody>
              <tfoot class="final-table-footer">
                <tr class="row-calculation">
                  <td colspan="5" class="text-right text-bold">SUBTOTAL</td>
                  <td class="text-right text-bold text-primary">
                    Rp
                    {{
                      selectedData.items.reduce((a, b) => a + (b.total || 0), 0).toLocaleString()
                    }}
                  </td>
                </tr>
                <tr class="row-calculation" v-if="selectedData.tax_rate > 0">
                  <td colspan="5" class="text-right text-bold uppercase italic">
                    Tax ({{ selectedData.tax_rate }}%)
                  </td>
                  <td class="text-right">
                    Rp
                    {{
                      (
                        (selectedData.items.reduce((a, b) => a + (b.total || 0), 0) *
                          selectedData.tax_rate) /
                        100
                      ).toLocaleString()
                    }}
                  </td>
                </tr>
                <tr class="row-calculation" v-if="selectedData.biaya_lain > 0">
                  <td colspan="5" class="text-right text-bold uppercase">
                    {{ selectedData.biaya_lain_label || 'BIAYA LAIN' }}
                  </td>
                  <td class="text-right">
                    Rp {{ (selectedData.biaya_lain || 0).toLocaleString() }}
                  </td>
                </tr>
                <tr class="row-grand-total">
                  <td colspan="5" class="text-right text-bold text-h6 uppercase">Grand Total</td>
                  <td class="text-right text-white text-bold text-h6">
                    Rp {{ (selectedData.total_harga || 0).toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div class="terms-container text-left">
              <div class="terms-header">SYARAT DAN KONDISI :</div>
              <div class="terms-content-box" v-html="selectedData.terms"></div>
            </div>

            <div class="signature-container text-left">
              <div class="text-closing-final q-mb-sm" v-html="selectedData.closing"></div>
              <br />
              <br />
              <div class="q-mb-xs text-body2 uppercase">Hormat Kami,</div>
              <div class="text-weight-bold text-primary uppercase q-mb-xs">
                {{ selectedData.nama_pt }}
              </div>
              <div class="final-sign-space"></div>
              <div class="text-signer-final text-weight-bolder underline uppercase">
                {{ selectedData.ttd_nama }}
              </div>
              <div class="text-role-final uppercase text-grey-8">
                {{ selectedData.ttd_jabatan }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
// eslint-disable-next-line no-unused-vars
import { db, auth } from 'src/boot/firebase'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'
import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const isEditMode = ref(false)
const filter = ref('')
const showPreview = ref(false)
const selectedData = ref(null)
const optCustomer = ref([])
const selectedCustomer = ref(null)
const tempKopFile = ref(null)
const config = ref({ kopUrl: '' })
const userData = ref(null)
let unsubscribeUser = null

const formDefault = {
  nomor: '',
  kota: 'Bekasi',
  tanggal: new Date().toISOString().substr(0, 10),
  nama_pt: 'PT AGRA ABHINAYA PERKASA',
  tagline_pt: 'General Construction and General Supply',
  customer_id: '',
  nama_customer: '',
  introduction: 'Bersama surat ini kami mengajukan penawaran harga sebagai berikut:',
  items: [{ deskripsi: '', qty: 1, satuan: 'ls', harga: 0, total: 0 }],
  terms: '<ul><li>Uang Muka : 30%</li><li>Berlaku 14 Hari</li></ul>',
  closing: 'Demikian penawaran ini kami sampaikan, terima kasih.',
  ttd_nama: 'DINDIN NAZMUDIN AKHMAD',
  ttd_jabatan: 'Project Director',
  status: 'Draft',
  is_revised: true,
  tax_rate: 0,
  biaya_lain: 0,
  biaya_lain_label: 'BIAYA LAIN',
  total_harga: 0,
}
const form = ref({ ...formDefault })

const subtotal = computed(() => form.value.items.reduce((sum, item) => sum + (item.total || 0), 0))
const updateGrandTotal = () => {
  const taxAmount = subtotal.value * (form.value.tax_rate / 100)
  form.value.total_harga = subtotal.value + taxAmount + (form.value.biaya_lain || 0)
}

const columns = [
  { name: 'nomor', align: 'left', label: 'REFERENCE NO', field: 'nomor', sortable: true },
  { name: 'nama_customer', align: 'left', label: 'CLIENT', field: 'nama_customer' },
  { name: 'total_harga', align: 'right', label: 'AMOUNT', field: 'total_harga' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

/**
 * LOGIKA SATPAM: Mengecek izin aksi granular (buat, ubah, hapus, approve)
 * ID Target untuk Penawaran: _konstruksi_marketing_penawaran
 */
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false

  // ID Menu disesuaikan dengan generator rute: _konstruksi_marketing_penawaran
  const targetId = '_konstruksi_marketing_penawaran'
  const menu = modulePerm.menus.find((m) => m.id === targetId)

  if (!menu) return false
  return menu[actionType] || false
}

const fetchData = async () => {
  loading.value = true
  try {
    const configSnap = await getDoc(doc(db, 'config', 'perusahaan'))
    if (configSnap.exists()) config.value = configSnap.data()
    const snapP = await getDocs(collection(db, 'penawaran'))
    rows.value = snapP.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    const snapC = await getDocs(collection(db, 'customer'))
    optCustomer.value = snapC.docs.map((d) => ({ id: d.id, nama: d.data().nama }))
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

onMounted(() => {
  // 1. Pantau Hak Akses User secara Real-time
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
      }
    })
  }

  fetchData()
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
})

const calcRow = (idx) => {
  const it = form.value.items[idx]
  it.total = (it.qty || 0) * (it.harga || 0)
  updateGrandTotal()
}

const simpanPenawaran = async () => {
  if (!form.value.customer_id) return $q.notify({ message: 'Pilih Customer!', color: 'negative' })
  updateGrandTotal()
  submitting.value = true
  try {
    const payload = {
      ...form.value,
      updatedAt: serverTimestamp(),
      is_revised: true,
      status: 'Draft',
      alasan_reject: '',
    }
    const docId = payload.id
    delete payload.id
    if (isEditMode.value && docId) await updateDoc(doc(db, 'penawaran', docId), payload)
    else await addDoc(collection(db, 'penawaran'), payload)
    showDialog.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  }
  submitting.value = false
}

const ajukanPenawaran = (row) => {
  $q.dialog({ title: 'Ajukan', message: 'Kirim penawaran?', cancel: true }).onOk(async () => {
    await updateDoc(doc(db, 'penawaran', row.id), {
      status: 'Pending',
      is_revised: false,
      updatedAt: serverTimestamp(),
    })
    fetchData()
  })
}
const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  selectedCustomer.value = { id: row.customer_id, nama: row.nama_customer }
  showDialog.value = true
}
const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.nomor = `${(rows.value.length + 1).toString().padStart(3, '0')}/AAP-QUOT/IV/2026`
  selectedCustomer.value = null
  showDialog.value = true
}
const addDetailItem = () => {
  form.value.items.push({ deskripsi: '', qty: 1, satuan: 'ls', harga: 0, total: 0 })
  updateGrandTotal()
}
const removeDetailItem = (idx) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(idx, 1)
    updateGrandTotal()
  }
}
const onCustomerChange = (val) => {
  if (val) {
    form.value.customer_id = val.id
    form.value.nama_customer = val.nama
  }
}
const confirmHapus = (row) => {
  $q.dialog({ title: 'Hapus Data', message: 'Yakin hapus data?', cancel: true }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'penawaran', row.id))
      fetchData()
    } catch (e) {
      console.error(e)
    }
  })
}
const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
}
const formatIndoDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
const printPage = () => window.print()
const exportToPDF = () => {
  const element = document.getElementById('quotation-print')
  const originalHeight = element.style.height
  element.style.height = '296mm'
  const opt = {
    margin: 0,
    filename: `Quotation_${selectedData.value.nomor.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true, letterRendering: true, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: 'avoid-all' },
  }
  $q.loading.show({ message: 'Generating PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .toPdf()
    .get('pdf')
    .then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages()
      if (totalPages > 1) {
        pdf.deletePage(totalPages)
      }
    })
    .save()
    .then(() => {
      element.style.height = originalHeight
      $q.loading.hide()
    })
}
const exportToExcel = () => {
  const dataExcel = selectedData.value.items.map((item, index) => ({
    No: index + 1,
    Desc: item.deskripsi,
    Qty: item.qty,
    Unit: item.satuan,
    Price: item.harga,
    Total: item.total,
  }))
  const ws = XLSX.utils.json_to_sheet(dataExcel)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Quotation')
  XLSX.writeFile(wb, `Quotation_${selectedData.value.nomor.replace(/\//g, '-')}.xlsx`)
}
const uploadKopPermanen = async (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = async () => {
    try {
      await setDoc(doc(db, 'config', 'perusahaan'), { kopUrl: reader.result }, { merge: true })
      config.value.kopUrl = reader.result
      $q.notify({ color: 'positive', message: 'Logo Disimpan!' })
    } catch (e) {
      console.error(e)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.font-pro {
  font-family: 'Inter', sans-serif !important;
}

.letter-paper {
  background: white;
  width: 210mm;
  min-height: 297mm;
  height: auto;
  padding: 15mm 20mm;
  margin: 20px auto;
  color: #1a1a1a;
  line-height: 1.3;
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.final-kop-img {
  height: 75px;
  width: auto;
  object-fit: contain;
}
.final-pt-name {
  font-size: 32px;
  font-weight: 800;
  color: #0d47a1;
  letter-spacing: -1px;
  line-height: 1;
}
.final-pt-tagline {
  font-size: 14px;
  color: #555;
}
.final-divider {
  height: 5px;
  background: #0d47a1;
  margin-top: 10px;
}

.client-name-pro {
  font-size: 22px;
  font-weight: 800;
  color: #0d47a1;
  line-height: 1.1;
  margin: 2px 0;
}
.quotation-title-pro {
  font-size: 26px;
  font-weight: 900;
  color: #222;
  line-height: 1;
  letter-spacing: 2px;
}
.quotation-no-pro {
  font-size: 15px;
  font-weight: 700;
  color: #0d47a1;
  margin: 4px 0;
}

.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.final-pro-table th {
  background: #0d47a1;
  color: white;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #0d47a1;
}
.final-pro-table td {
  padding: 8px;
  border: 1px solid #eee;
  font-size: 13px;
}

/* CSS UNTUK FOOTER PERHITUNGAN */
.row-calculation {
  background: #e3f2fd;
} /* */
.row-calculation td {
  padding: 4px 8px !important;
  border: 1px solid #bbdefb !important;
  font-size: 12px;
} /* */

/* GRAND TOTAL MENGIKUTI WARNA HEADER (BIRU TUA) & TEKS PUTIH */
.row-grand-total {
  background: #0d47a1;
} /* Warna Header (Biru Tua) */
.row-grand-total td {
  padding: 8px 8px !important;
  color: white !important;
  border: 1px solid #0d47a1 !important;
}

.terms-container {
  border: 1px solid #0d47a1;
  margin-top: 15px;
}
.terms-header {
  background: #f8f9fa;
  border-bottom: 1px solid #0d47a1;
  padding: 5px 10px;
  font-weight: 800;
  color: #0d47a1;
  font-size: 13px;
}
.terms-content-box {
  padding: 10px;
  font-size: 12px;
  color: #333;
  line-height: 1.4;
}

.signature-container {
  margin-top: 20px;
}
.final-sign-space {
  height: 60px;
}
.text-signer-final {
  font-size: 16px;
  font-weight: 800;
  color: #0d47a1;
}

@media print {
  .no-print {
    display: none !important;
  }
  .letter-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 100% !important;
    height: auto !important;
    padding: 10mm !important;
  }
  .final-pro-table th {
    background-color: #0d47a1 !important;
    color: white !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .row-calculation {
    background-color: #e3f2fd !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  /* Pastikan warna grand total tetap muncul di cetakan */
  .row-grand-total {
    background-color: #0d47a1 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .row-grand-total td {
    color: white !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
