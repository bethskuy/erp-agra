<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <div class="row items-center q-mb-md no-print">
      <div class="col">
        <div class="text-h5 text-weight-bolder text-indigo-10 uppercase">
          Approval & Histori Penawaran
        </div>
        <div class="text-caption text-grey-7">
          Otorisasi penawaran dan rekam jejak keputusan manajemen
        </div>
      </div>
      <div class="col-auto">
        <q-btn flat round icon="refresh" color="primary" @click="fetchApprovalData" />
      </div>
    </div>

    <q-card flat bordered class="no-print shadow-1 border-radius-lg">
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
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari penawaran...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              text-color="white"
              size="sm"
              class="text-weight-bold"
              :color="
                props.value === 'Approved'
                  ? 'positive'
                  : props.value === 'Pending'
                    ? 'orange-9'
                    : 'negative'
              "
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-total_harga="props">
          <q-td :props="props" class="text-right text-weight-bold text-primary">
            Rp {{ (props.value || 0).toLocaleString() }}
          </q-td>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center" @click.stop>
            <template v-if="props.row.status === 'Pending'">
              <q-btn
                unelevated
                color="positive"
                icon="check"
                label="Approve"
                size="sm"
                @click="handleApproval(props.row, 'Approved')"
              />
              <q-btn
                outline
                color="negative"
                icon="close"
                label="Reject"
                size="sm"
                @click="promptReject(props.row)"
              />
            </template>
            <q-badge
              v-else
              outline
              :color="props.row.status === 'Approved' ? 'positive' : 'negative'"
            >
              Processed ({{ props.row.status }})
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showPreview" maximized transition-show="slide-up">
      <q-card class="column no-wrap bg-grey-3">
        <q-toolbar class="bg-white text-grey-9 q-py-md no-print bordered-bottom shadow-2">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase text-primary"
            >Detail Review Quotation</q-toolbar-title
          >

          <q-btn-group unelevated class="q-mr-md">
            <q-btn color="primary" icon="print" label="Print" @click="printPage" />
            <q-btn color="red-8" icon="picture_as_pdf" label="PDF" @click="exportToPDF" />
          </q-btn-group>

          <q-btn-dropdown
            color="indigo-10"
            icon="draw"
            label="Tanda Tangan"
            unelevated
            class="q-mr-md"
          >
            <q-list>
              <q-item clickable v-close-popup @click="showPad = true">
                <q-item-section avatar><q-icon name="gesture" /></q-item-section>
                <q-item-section>Tanda Tangan Manual</q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section avatar><q-icon name="upload" /></q-item-section>
                <q-item-section>
                  <q-file
                    v-model="tempFile"
                    borderless
                    dense
                    label="Upload Gambar"
                    accept="image/*"
                    @update:model-value="uploadSignatureFile"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <template v-if="selectedData?.status === 'Pending'">
            <q-btn
              outline
              color="negative"
              label="Reject"
              icon="close"
              @click="promptReject(selectedData)"
              class="q-mr-sm"
            />
            <q-btn
              unelevated
              color="positive"
              label="Approve"
              icon="check"
              @click="handleApproval(selectedData, 'Approved')"
            />
          </template>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg flex flex-center">
          <div id="quotation-print" class="letter-paper shadow-24" v-if="selectedData">
            <div class="row items-center no-wrap">
              <div v-if="config.kopUrl" class="col-auto q-mr-xl">
                <img :src="config.kopUrl" class="final-kop-img" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase">{{ selectedData.nama_pt }}</div>
                <div class="final-pt-tagline italic">{{ selectedData.tagline_pt }}</div>
              </div>
            </div>
            <div class="final-divider"></div>

            <div class="row justify-between q-mt-lg text-left">
              <div class="col-6">
                <div class="label-grey-pro uppercase">KEPADA YTH :</div>
                <div class="client-name-pro uppercase">{{ selectedData.nama_customer }}</div>
                <div class="text-body2">Di Tempat</div>
              </div>
              <div class="col-5 text-right">
                <div class="quotation-title-pro">QUOTATION</div>
                <div class="quotation-no-pro text-indigo-10 text-weight-bolder">
                  {{ selectedData.nomor }}
                </div>
                <div class="text-grey-8">
                  {{ selectedData.kota }}, {{ formatDateIndo(selectedData.tanggal) }}
                </div>
              </div>
            </div>

            <div
              class="text-body2 q-mb-sm text-left q-mt-md"
              v-html="selectedData.introduction"
            ></div>

            <table class="final-pro-table q-mt-md">
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
                  <td class="text-center uppercase">{{ it.satuan }}</td>
                  <td class="text-right">{{ it.harga.toLocaleString() }}</td>
                  <td class="text-right text-weight-bolder">{{ it.total.toLocaleString() }}</td>
                </tr>
              </tbody>
              <tfoot class="final-table-footer">
                <tr class="row-calculation">
                  <td colspan="5" class="text-right text-bold">SUBTOTAL</td>
                  <td class="text-right text-bold">
                    Rp
                    {{
                      selectedData.items.reduce((a, b) => a + (b.total || 0), 0).toLocaleString()
                    }}
                  </td>
                </tr>
                <tr class="row-calculation" v-if="selectedData.tax_rate > 0">
                  <td colspan="5" class="text-right text-bold italic">
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
                  <td colspan="5" class="text-right text-bold">
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

            <div class="terms-container text-left q-mt-md">
              <div class="terms-header uppercase">SYARAT DAN KONDISI :</div>
              <div class="terms-content-box" v-html="selectedData.terms"></div>
            </div>

            <div class="signature-container text-left q-mt-xl">
              <div class="text-body1 q-mb-sm" v-html="selectedData.closing"></div>
              <div class="q-mb-xs text-body2">Hormat Kami,</div>
              <div class="text-weight-bold text-indigo-10 uppercase q-mb-xs">
                {{ selectedData.nama_pt }}
              </div>
              <div class="final-sign-space">
                <img
                  v-if="selectedData.signatureUrl"
                  :src="selectedData.signatureUrl"
                  class="img-signature"
                  alt="Tanda Tangan"
                />
              </div>
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

    <q-dialog v-model="showPad" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary text-bold uppercase">Tanda Tangan Digital</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="signature-pad-wrapper">
            <canvas ref="signatureCanvas" class="signature-canvas"></canvas>
          </div>
          <div class="text-caption text-grey-7 q-mt-sm italic text-center">
            Gunakan kursor atau jari Anda. Tinta diatur menjadi hitam.
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Reset" color="grey-7" @click="clearPad" />
          <q-btn
            unelevated
            label="Simpan"
            color="primary"
            @click="saveManualSignature"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import SignaturePad from 'signature_pad'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const filter = ref('')
const showPreview = ref(false)
const showPad = ref(false)
const selectedData = ref(null)
const tempFile = ref(null)
const signatureCanvas = ref(null)
const config = ref({ kopUrl: '' })
let signaturePad = null

const columns = [
  { name: 'nomor', align: 'left', label: 'REFERENCE NO', field: 'nomor', sortable: true },
  { name: 'nama_customer', align: 'left', label: 'CLIENT', field: 'nama_customer' },
  { name: 'total_harga', align: 'right', label: 'AMOUNT', field: 'total_harga' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'ACTION', field: 'aksi' },
]

const fetchApprovalData = async () => {
  loading.value = true
  try {
    const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
    if (confSnap.exists()) config.value = confSnap.data()
    const q = query(
      collection(db, 'penawaran'),
      where('status', 'in', ['Pending', 'Approved', 'Rejected']),
    )
    const snap = await getDocs(q)
    rows.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

watch(showPad, async (val) => {
  if (val) {
    await nextTick()
    const canvas = signatureCanvas.value
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    canvas.getContext('2d').scale(ratio, ratio)

    // PERUBAHAN: Warna pulpen diatur menjadi Hitam
    signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      penColor: '#000000',
    })
  }
})

const saveManualSignature = async () => {
  if (signaturePad.isEmpty()) return
  try {
    $q.loading.show()
    const base64 = signaturePad.toDataURL('image/png')
    await updateDoc(doc(db, 'penawaran', selectedData.value.id), {
      signatureUrl: base64,
      updatedAt: serverTimestamp(),
    })
    selectedData.value.signatureUrl = base64
    showPad.value = false
    $q.notify({ type: 'positive', message: 'Tanda tangan manual disimpan!' })
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

const uploadSignatureFile = (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = async () => {
    await updateDoc(doc(db, 'penawaran', selectedData.value.id), {
      signatureUrl: reader.result,
      updatedAt: serverTimestamp(),
    })
    selectedData.value.signatureUrl = reader.result
    $q.notify({ type: 'positive', message: 'File tanda tangan terpasang!' })
  }
}

const handleApproval = (row, status, alasan = null) => {
  $q.dialog({ title: 'Konfirmasi', message: `Update ke ${status}?`, cancel: true }).onOk(
    async () => {
      try {
        const data = {
          status: status,
          updatedAt: serverTimestamp(),
          processedAt: serverTimestamp(),
        }
        if (status === 'Rejected' && alasan) data.alasan_reject = alasan
        await updateDoc(doc(db, 'penawaran', row.id), data)
        showPreview.value = false
        fetchApprovalData()
      } catch (e) {
        console.error(e)
      }
    },
  )
}

const promptReject = (row) => {
  $q.dialog({
    title: 'Reject',
    message: 'Alasan:',
    prompt: { model: '', type: 'textarea' },
    cancel: true,
  }).onOk((a) => handleApproval(row, 'Rejected', a))
}

const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
  tempFile.value = null
}
const formatDateIndo = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
const printPage = () => window.print()
const clearPad = () => signaturePad.clear()

const exportToPDF = () => {
  const element = document.getElementById('quotation-print')
  const originalHeight = element.style.height
  element.style.height = '296mm'
  const opt = {
    margin: 0,
    filename: `Quotation_${selectedData.value.nomor.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show()
  html2pdf()
    .set(opt)
    .from(element)
    .toPdf()
    .get('pdf')
    .then((pdf) => {
      if (pdf.internal.getNumberOfPages() > 1) pdf.deletePage(pdf.internal.getNumberOfPages())
    })
    .save()
    .then(() => {
      element.style.height = originalHeight
      $q.loading.hide()
    })
}

onMounted(fetchApprovalData)
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
  padding: 15mm 20mm;
  margin: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  color: #1a1a1a;
  line-height: 1.35;
  box-sizing: border-box;
}
.final-kop-img {
  height: 75px;
  width: auto;
  object-fit: contain;
}
.final-pt-name {
  font-size: 30px;
  font-weight: 800;
  color: #0d47a1;
  letter-spacing: -1px;
  line-height: 1;
}
.final-divider {
  height: 5px;
  background: #0d47a1;
  margin-top: 10px;
}
.final-pro-table {
  width: 100%;
  border-collapse: collapse;
}
.final-pro-table th {
  background: #0d47a1;
  color: white;
  padding: 8px;
  font-size: 12px;
  border: 1px solid #0d47a1;
}
.final-pro-table td {
  padding: 8px;
  border: 1px solid #eee;
  font-size: 13px;
}
.row-calculation {
  background: #e3f2fd;
}
.row-calculation td {
  padding: 4px 10px !important;
  border: 1px solid #bbdefb !important;
}
.row-grand-total {
  background: #0d47a1;
  color: white;
}
.row-grand-total td {
  border: 1px solid #0d47a1 !important;
}
.signature-pad-wrapper {
  border: 2px dashed #0d47a1;
  background: #f9f9f9;
  border-radius: 8px;
  height: 250px;
}
.signature-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.final-sign-space {
  height: 100px;
  width: 250px;
  display: flex;
  align-items: center;
  position: relative;
}
.img-signature {
  max-height: 100px;
  max-width: 250px;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.terms-container {
  border: 1px solid #0d47a1;
  border-radius: 4px;
  overflow: hidden;
}
.terms-header {
  background: #f8f9fa;
  border-bottom: 1px solid #0d47a1;
  padding: 6px 12px;
  font-weight: 800;
  color: #0d47a1;
  font-size: 13px;
}
@media print {
  .no-print {
    display: none !important;
  }
  .letter-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 100% !important;
    padding: 10mm !important;
  }
  .final-pro-table th {
    background-color: #0d47a1 !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
  }
  .row-calculation {
    background-color: #e3f2fd !important;
    -webkit-print-color-adjust: exact;
  }
  .row-grand-total {
    background-color: #0d47a1 !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
  }
}
</style>
