<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro text-left">
    <!-- HEADER SECTION -->
    <div class="row items-center q-col-gutter-md q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-6">
        <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
          Otorisasi Penawaran (ACC)
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Persetujuan & Histori Quotation Manufaktur</span
          >
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="row q-col-gutter-sm justify-end items-center">
          <div class="col-12 col-sm-7">
            <q-input
              v-model="filter"
              placeholder="Cari No. Penawaran atau Customer..."
              outlined
              dense
              bg-color="white"
              color="teal-10"
              class="rounded-10 shadow-sm"
            >
              <template v-slot:append>
                <q-icon name="search" color="teal-10" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-auto text-right">
            <div class="text-caption text-grey-6 q-mb-xs uppercase text-weight-bold">
              Total Dokumen
            </div>
            <q-badge color="teal-10" class="q-px-md q-py-xs text-weight-bold shadow-1">
              {{ allRows.length }} Dokumen Terdata
            </q-badge>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE LIST -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="allRows"
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
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="openApproval(props.row)"
          >
            <q-td key="nomor" class="text-weight-bolder text-teal-10">{{ props.row.nomor }}</q-td>
            <q-td key="nama_customer" class="text-weight-bold uppercase">{{
              props.row.nama_customer
            }}</q-td>
            <q-td key="total_harga" class="text-right text-weight-bolder">
              IDR {{ calculateRowTotal(props.row).toLocaleString() }}
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                text-color="white"
                size="sm"
                class="text-weight-bold"
                :color="getStatusColor(props.row.status)"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                flat
                round
                color="teal-10"
                icon="visibility"
                size="sm"
                @click="openApproval(props.row)"
              >
                <q-tooltip>Lihat Detail & ACC</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- PREVIEW & APPROVAL DIALOG -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-teal-10 q-py-sm no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold">OTORISASI DOKUMEN</q-toolbar-title>

          <!-- PDF & PRINT -->
          <q-btn-group unelevated rounded class="q-mr-md shadow-1">
            <q-btn color="teal-10" icon="print" label="Cetak" @click="printNow" />
            <q-btn color="red-9" icon="picture_as_pdf" label="PDF" @click="exportToPDF" />
          </q-btn-group>

          <!-- TANDA TANGAN OPTIONS -->
          <q-btn-dropdown
            v-if="selectedData?.status === 'Pending'"
            color="teal-10"
            icon="draw"
            label="Tanda Tangan"
            unelevated
            rounded
            class="q-mr-md"
          >
            <q-list class="q-pa-sm" style="min-width: 200px">
              <q-item clickable v-ripple v-close-popup @click="showPad = true">
                <q-item-section avatar><q-icon name="gesture" color="teal-10" /></q-item-section>
                <q-item-section>Gurat Digital</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <template v-if="selectedData?.status === 'Pending'">
            <q-btn
              unelevated
              color="negative"
              label="REJECT"
              @click="updateStatus(selectedData, 'Rejected')"
              rounded
              class="q-mr-sm"
            />
            <q-btn
              unelevated
              color="positive"
              icon="verified"
              label="APPROVE SEKARANG"
              @click="updateStatus(selectedData, 'Approved')"
              rounded
            />
          </template>
        </q-toolbar>

        <q-card-section class="col scroll flex flex-center q-pa-md preview-container">
          <div id="quotation-print" class="letter-paper shadow-24" v-if="selectedData">
            <!-- Kop Surat -->
            <div class="row no-wrap items-center">
              <div class="col-auto q-mr-md">
                <q-icon name="factory" color="teal-10" size="55px" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase text-teal-10">{{ selectedData.nama_pt }}</div>
                <div class="final-pt-tagline italic text-grey-8">
                  GENERAL CONSTRUCTION AND GENERAL SUPPLY
                </div>
              </div>
              <div class="col-auto text-right">
                <div class="quotation-title-pro text-teal-10 uppercase">Quotation</div>
                <div class="text-weight-bold">{{ selectedData.nomor }}</div>
                <div class="text-grey-8">
                  {{ selectedData.lokasi }}, {{ formatDateIndo(selectedData.tanggal) }}
                </div>
              </div>
            </div>
            <div class="final-divider bg-teal-10"></div>

            <div class="text-left q-mt-lg">
              <div class="label-grey-pro uppercase">KEPADA YTH :</div>
              <div class="client-name-pro uppercase text-teal-10">
                {{ selectedData.nama_customer }}
              </div>
              <div class="text-body2">Di Tempat</div>
            </div>

            <div class="text-left q-my-md">
              Bersama surat ini kami mengajukan penawaran harga sebagai berikut:
            </div>

            <table class="final-pro-table">
              <thead>
                <tr class="bg-teal-10 text-white">
                  <th width="40">NO</th>
                  <th class="text-left">DESCRIPTION OF WORKS</th>
                  <th width="60">QTY</th>
                  <th width="60">UNIT</th>
                  <th width="120">UNIT PRICE</th>
                  <th width="140">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in selectedData.items" :key="i">
                  <td class="text-center">{{ i + 1 }}</td>
                  <td class="text-left uppercase">{{ it.deskripsi }}</td>
                  <td class="text-center">{{ it.qty }}</td>
                  <td class="text-center uppercase">{{ it.satuan }}</td>
                  <td class="text-right">{{ (it.harga || 0).toLocaleString() }}</td>
                  <td class="text-right text-weight-bolder text-teal-10">
                    {{ (Number(it.qty || 0) * Number(it.harga || 0)).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="row-calculation">
                  <td colspan="5" class="text-right text-bold uppercase">Subtotal Pekerjaan</td>
                  <td class="text-right text-bold text-teal-10">
                    IDR {{ calculateRowTotal(selectedData, 'subtotal').toLocaleString() }}
                  </td>
                </tr>
                <tr class="row-grand-total bg-teal-10 text-white">
                  <td colspan="5" class="text-right text-bold uppercase">Grand Total Amount</td>
                  <td class="text-right text-bold text-h6">
                    IDR {{ calculateRowTotal(selectedData, 'grand').toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div class="terms-container text-left q-mt-lg border-teal">
              <div class="terms-header bg-teal-10 text-white">Syarat & Kondisi Pembayaran :</div>
              <div class="terms-content-box" v-html="selectedData.syarat"></div>
            </div>

            <div class="text-left q-mt-md">
              Demikian penawaran ini kami sampaikan, terima kasih.
            </div>

            <div class="signature-container text-right q-mt-xl">
              <div class="text-body2 uppercase">Hormat Kami,</div>
              <div class="text-weight-bold text-teal-10 uppercase q-mb-xs">
                {{ selectedData.nama_pt }}
              </div>
              <div class="final-sign-space flex flex-center">
                <img
                  v-if="selectedData.signatureUrl"
                  :src="selectedData.signatureUrl"
                  class="img-signature"
                />
                <div v-else class="text-caption text-grey-4 italic">Belum ditandatangani</div>
              </div>
              <div class="text-signer-final text-weight-bolder text-teal-10 uppercase">
                <u>{{ selectedData.ttd_nama || '( ........................ )' }}</u>
              </div>
              <div class="text-role-final uppercase text-grey-8 text-caption font-bold">
                {{ selectedData.ttd_jabatan }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- SIGNATURE PAD -->
    <q-dialog v-model="showPad" persistent>
      <q-card style="width: 500px; max-width: 95vw" class="rounded-20">
        <q-card-section class="bg-teal-10 text-white q-pa-md">
          <div class="text-h6 uppercase text-weight-bold">Gurat Tanda Tangan</div>
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="signature-pad-wrapper border-teal">
            <canvas ref="signatureCanvas" class="signature-canvas"></canvas>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Reset" color="grey-7" @click="clearPad" />
          <q-btn unelevated label="Simpan & Pasang" color="teal-10" @click="saveManualSignature" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import SignaturePad from 'signature_pad'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const allRows = ref([])
const loading = ref(true)
const filter = ref('')
const showPreview = ref(false)
const showPad = ref(false)
const selectedData = ref(null)
const signatureCanvas = ref(null)

let unsubApproval = null
let signaturePad = null

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
    field: (row) => calculateRowTotal(row),
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'ACTION' },
]

// --- HELPER FUNCTIONS ---
const calculateRowTotal = (row, type = 'grand') => {
  if (!row || !row.items) return 0
  const sub = row.items.reduce((acc, it) => acc + Number(it.qty || 0) * Number(it.harga || 0), 0)
  if (type === 'subtotal') return sub
  const tax = sub * (Number(row.tax_rate || 0) / 100)
  return sub + tax + Number(row.biaya_lain || 0)
}

const formatDateIndo = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
const getStatusColor = (s) =>
  s === 'Approved' ? 'positive' : s === 'Rejected' ? 'negative' : 'orange-9'

// --- SIGNATURE PAD LOGIC ---
watch(showPad, async (val) => {
  if (val) {
    await nextTick()
    const canvas = signatureCanvas.value
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    canvas.getContext('2d').scale(ratio, ratio)
    signaturePad = new SignaturePad(canvas)
  }
})

const clearPad = () => signaturePad?.clear()

const saveManualSignature = async () => {
  if (!signaturePad || signaturePad.isEmpty()) return
  const base64 = signaturePad.toDataURL('image/png')
  try {
    $q.loading.show()
    await updateDoc(doc(db, 'penawaran_manufaktur', selectedData.value.id), {
      signatureUrl: base64,
      updatedAt: serverTimestamp(),
    })
    selectedData.value.signatureUrl = base64
    showPad.value = false
    $q.notify({ type: 'positive', message: 'Tanda tangan berhasil dipasang!' })
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

// --- APPROVAL & EXPORT LOGIC ---
const updateStatus = (row, status) => {
  $q.dialog({
    title: 'Konfirmasi Otorisasi',
    message: `Ubah status menjadi ${status}?`,
    cancel: true,
    ok: { color: status === 'Approved' ? 'positive' : 'negative', label: 'Ya, Proses' },
  }).onOk(async () => {
    try {
      $q.loading.show()
      await updateDoc(doc(db, 'penawaran_manufaktur', row.id), {
        status: status,
        updatedAt: serverTimestamp(),
        approvedAt: status === 'Approved' ? serverTimestamp() : null,
      })
      showPreview.value = false
      $q.notify({ type: 'positive', message: `Status diperbarui menjadi ${status}` })
    } catch (e) {
      console.error(e)
    } finally {
      $q.loading.hide()
    }
  })
}

const exportToPDF = () => {
  const element = document.getElementById('quotation-print')
  const opt = {
    margin: 0,
    filename: `Quotation_${selectedData.value.nomor.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Generating PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

const printNow = () => window.print()
const openApproval = (row) => {
  selectedData.value = row
  showPreview.value = true
}

onMounted(() => {
  const q = query(collection(db, 'penawaran_manufaktur'), orderBy('updatedAt', 'desc'))
  unsubApproval = onSnapshot(q, (snap) => {
    allRows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
})

onUnmounted(() => {
  if (unsubApproval) unsubApproval()
})
</script>

<style scoped>
.font-pro {
  font-family: 'Inter', sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-10 {
  border-radius: 10px;
}
.border-teal {
  border: 1px solid #004d40;
}
.letter-paper {
  background: white;
  width: 210mm;
  min-height: 296mm;
  padding: 15mm;
  margin: 0 auto;
  color: #1a1a1a;
}
.final-divider {
  height: 3px;
  margin-top: 15px;
}
.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.final-pro-table th,
.final-pro-table td {
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 11px;
}
.signature-pad-wrapper {
  height: 250px;
  background: #fcfdff;
  border-radius: 8px;
}
.signature-canvas {
  width: 100%;
  height: 100%;
}
.final-sign-space {
  height: 100px;
}
.img-signature {
  max-height: 100px;
  mix-blend-mode: multiply;
}

@media print {
  .no-print {
    display: none !important;
  }
  .letter-paper {
    box-shadow: none !important;
    margin: 0;
    padding: 10mm;
  }
}
</style>
