<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
          Approval Penawaran
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Otorisasi & Histori Quotation</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Tinjau rincian biaya dan berikan otorisasi digital untuk penawaran harga klien.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
        <div class="text-caption text-grey-6 q-mb-xs">Menunggu Persetujuan</div>
        <q-badge color="orange-9" class="q-px-md q-py-xs text-weight-bold shadow-1">
          {{ rows.filter((r) => r.status === 'Pending').length }} Dokumen
        </q-badge>
      </div>
    </div>

    <!-- SEARCH & SUMMARY CARD -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari No. Quotation atau Nama Klien..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space />
          <q-btn flat round icon="refresh" color="primary" @click="fetchApprovalData" />
        </div>
      </q-card-section>
    </q-card>

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
        <!-- Custom Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-indigo-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom Body -->
        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="openPreview(props.row)"
          >
            <q-td key="nomor" class="text-weight-bolder text-indigo-10">
              {{ props.row.nomor }}
            </q-td>
            <q-td key="nama_customer" class="text-weight-bold text-blue-grey-9 uppercase">
              {{ props.row.nama_customer }}
            </q-td>
            <q-td key="total_harga" class="text-right text-weight-bolder">
              <span class="text-caption text-grey-6 q-mr-xs">IDR</span>
              {{ (props.row.total_harga || 0).toLocaleString() }}
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                text-color="white"
                size="sm"
                class="text-weight-bold shadow-sm"
                :color="getStatusColor(props.row.status)"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-xs">
                <template v-if="props.row.status === 'Pending'">
                  <q-btn
                    v-if="canAction('approve')"
                    unelevated
                    rounded
                    color="positive"
                    icon="check"
                    :label="$q.screen.gt.xs ? 'Approve' : ''"
                    size="sm"
                    class="q-px-sm"
                    @click="handleApproval(props.row, 'Approved')"
                  />
                  <q-btn
                    v-if="canAction('approve') || canAction('ubah')"
                    outline
                    rounded
                    color="negative"
                    icon="close"
                    :label="$q.screen.gt.xs ? 'Reject' : ''"
                    size="sm"
                    class="q-px-sm"
                    @click="promptReject(props.row)"
                  />
                </template>
                <q-btn
                  flat
                  round
                  color="grey-6"
                  icon="visibility"
                  size="sm"
                  @click="openPreview(props.row)"
                />
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- PREVIEW & APPROVAL DIALOG -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <!-- TOOLBAR: RESPONSIVE DESIGN -->
        <q-toolbar class="bg-white text-indigo-10 q-py-sm no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold gt-xs">OTORISASI DOKUMEN</q-toolbar-title>

          <q-space class="lt-sm" />

          <!-- TOMBOL LIHAT DOKUMEN ANALISA (BISA PDF, WORD, EXCEL) -->
          <q-btn
            v-if="selectedData?.analisa_harga_url"
            color="indigo-10"
            icon="description"
            :label="$q.screen.gt.xs ? 'Lihat Dokumen Analisa' : ''"
            unelevated
            rounded
            class="q-mr-md shadow-2"
            @click="openAnalisaFile(selectedData.analisa_harga_url)"
          >
            <q-tooltip>Unduh/Buka Berkas Analisa Pendukung (PDF/Word/Excel)</q-tooltip>
          </q-btn>

          <!-- GROUP TOMBOL CETAK & PDF (RESPONSIVE) -->
          <q-btn-group unelevated rounded class="q-mr-xs q-mr-md-md shadow-1">
            <q-btn
              color="primary"
              icon="print"
              :label="$q.screen.gt.sm ? 'Cetak' : ''"
              @click="printPage"
            >
              <q-tooltip v-if="!$q.screen.gt.sm">Cetak Dokumen</q-tooltip>
            </q-btn>
            <q-btn
              color="red-9"
              icon="picture_as_pdf"
              :label="$q.screen.gt.sm ? 'PDF' : ''"
              @click="exportToPDF"
            >
              <q-tooltip v-if="!$q.screen.gt.sm">Export PDF</q-tooltip>
            </q-btn>
          </q-btn-group>

          <!-- Signature Options -->
          <q-btn-dropdown
            v-if="selectedData?.status === 'Pending' && (canAction('approve') || canAction('ubah'))"
            color="indigo-10"
            icon="draw"
            :label="$q.screen.gt.xs ? 'Tanda Tangan' : ''"
            unelevated
            rounded
            class="q-mr-xs q-mr-md-md"
          >
            <q-list class="q-pa-sm" style="min-width: 220px">
              <q-item
                clickable
                v-ripple
                v-close-popup
                @click="showPad = true"
                class="rounded-borders"
              >
                <q-item-section avatar><q-icon name="gesture" color="primary" /></q-item-section>
                <q-item-section class="text-weight-medium">Gurat Digital</q-item-section>
              </q-item>
              <q-item clickable v-ripple class="rounded-borders relative-position">
                <q-item-section avatar><q-icon name="upload" color="primary" /></q-item-section>
                <q-item-section class="text-weight-medium">Upload File</q-item-section>
                <q-file
                  v-model="tempFile"
                  borderless
                  dense
                  class="absolute-full opacity-0 cursor-pointer"
                  accept="image/*"
                  @update:model-value="uploadSignatureFile"
                />
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <template v-if="selectedData?.status === 'Pending'">
            <q-btn
              v-if="canAction('approve')"
              unelevated
              color="positive"
              :icon="selectedData.signatureUrl ? 'verified' : 'check'"
              :label="$q.screen.gt.sm ? 'APPROVE SEKARANG' : $q.screen.gt.xs ? 'APPROVE' : ''"
              @click="handleApproval(selectedData, 'Approved')"
              rounded
              class="text-weight-bold"
            >
              <q-tooltip v-if="!$q.screen.gt.xs">Approve Penawaran</q-tooltip>
            </q-btn>
          </template>
        </q-toolbar>

        <!-- CONTAINER SURAT -->
        <q-card-section class="col scroll q-pa-none q-pa-md-md flex flex-center preview-container">
          <div id="quotation-print" class="letter-paper shadow-24" v-if="selectedData">
            <!-- Kop Surat -->
            <div class="row no-wrap items-center">
              <div v-if="config.kopUrl" class="col-auto q-mr-md q-mr-md-xl">
                <img :src="config.kopUrl" class="final-kop-img" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase">{{ selectedData.nama_pt }}</div>
                <div class="final-pt-tagline italic text-grey-8">{{ selectedData.tagline_pt }}</div>
              </div>
            </div>
            <div class="final-divider"></div>

            <!-- Meta Dokumen -->
            <div class="row justify-between items-start q-mt-lg q-mb-md text-left">
              <div class="col-7">
                <div class="label-grey-pro uppercase">KEPADA YTH :</div>
                <div class="client-name-pro uppercase">{{ selectedData.nama_customer }}</div>
                <div class="text-body2 text-weight-medium">Di Tempat</div>
              </div>
              <div class="col-5 text-right">
                <div class="quotation-title-pro uppercase">Quotation</div>
                <div class="quotation-no-pro text-indigo-10">{{ selectedData.nomor }}</div>
                <div class="text-date-pro">
                  {{ selectedData.kota }}, {{ formatDateIndo(selectedData.tanggal) }}
                </div>
              </div>
            </div>

            <!-- Content -->
            <div
              class="text-body2 q-mb-md text-left leading-relaxed"
              v-html="selectedData.introduction"
            ></div>

            <table class="final-pro-table">
              <thead>
                <tr>
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
                  <td class="text-center font-bold text-grey-7">{{ i + 1 }}</td>
                  <td class="text-left uppercase text-weight-medium">{{ it.deskripsi }}</td>
                  <td class="text-center">{{ it.qty }}</td>
                  <td class="text-center uppercase text-caption">{{ it.satuan }}</td>
                  <td class="text-right">{{ it.harga.toLocaleString() }}</td>
                  <td class="text-right text-weight-bolder text-indigo-10">
                    {{ it.total.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="final-table-footer">
                <tr class="row-calculation">
                  <td colspan="5" class="text-right text-bold uppercase">Subtotal Pekerjaan</td>
                  <td class="text-right text-bold text-indigo-10">
                    IDR
                    {{
                      selectedData.items.reduce((a, b) => a + (b.total || 0), 0).toLocaleString()
                    }}
                  </td>
                </tr>
                <tr class="row-calculation" v-if="selectedData.tax_rate > 0">
                  <td colspan="5" class="text-right text-bold uppercase italic text-grey-7">
                    Tax ({{ selectedData.tax_rate }}%)
                  </td>
                  <td class="text-right text-weight-bold">
                    IDR
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
                  <td colspan="5" class="text-right text-bold uppercase text-grey-7">
                    {{ selectedData.biaya_lain_label || 'BIAYA LAIN' }}
                  </td>
                  <td class="text-right text-weight-bold">
                    IDR {{ (selectedData.biaya_lain || 0).toLocaleString() }}
                  </td>
                </tr>
                <tr class="row-grand-total">
                  <td
                    colspan="5"
                    class="text-right text-bold text-h6 uppercase tracking-extra-wide"
                  >
                    Grand Total Amount
                  </td>
                  <td class="text-right text-white text-bold text-h5">
                    IDR {{ (selectedData.total_harga || 0).toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Terms -->
            <div class="terms-container text-left q-mt-lg">
              <div class="terms-header uppercase">Syarat & Kondisi Pembayaran :</div>
              <div class="terms-content-box leading-relaxed" v-html="selectedData.terms"></div>
            </div>

            <!-- Signature Area -->
            <div class="signature-container text-left q-mt-xl">
              <div class="text-closing-final q-mb-sm" v-html="selectedData.closing"></div>
              <div class="row q-mt-md">
                <div class="col-5 gt-xs"></div>
                <div class="col-12 col-sm-7 text-right">
                  <div class="q-mb-xs text-body2 uppercase">Hormat Kami,</div>
                  <div class="text-weight-bold text-indigo-10 uppercase q-mb-xs">
                    {{ selectedData.nama_pt }}
                  </div>
                  <div class="final-sign-space">
                    <img
                      v-if="selectedData.signatureUrl"
                      :src="selectedData.signatureUrl"
                      class="img-signature"
                      alt="Tanda Tangan Digital"
                    />
                    <div v-else class="text-caption text-grey-4 q-pt-xl italic">
                      Belum ditandatangani
                    </div>
                  </div>
                  <div
                    class="text-signer-final text-weight-bolder underline uppercase text-indigo-10"
                  >
                    {{ selectedData.ttd_nama }}
                  </div>
                  <div class="text-role-final uppercase text-grey-8 text-caption font-bold block">
                    {{ selectedData.ttd_jabatan }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-xl no-print"></div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- SIGNATURE PAD DIALOG -->
    <q-dialog v-model="showPad" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 95vw" class="rounded-20 shadow-24">
        <q-card-section class="row items-center q-pb-none bg-indigo-10 text-white q-pa-md">
          <div class="text-h6 text-weight-bold uppercase">Gurat Tanda Tangan</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="signature-pad-wrapper shadow-inner">
            <canvas ref="signatureCanvas" class="signature-canvas"></canvas>
          </div>
          <div class="text-caption text-grey-7 q-mt-md text-center italic flex flex-center">
            <q-icon name="touch_app" class="q-mr-xs" /> Gunakan jari atau pen Anda pada area di
            atas.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Reset" color="grey-7" @click="clearPad" rounded class="q-px-md" />
          <q-btn
            unelevated
            label="Simpan & Pasang"
            color="indigo-10"
            @click="saveManualSignature"
            rounded
            class="q-px-xl text-weight-bold"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="q-py-xl no-print"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import SignaturePad from 'signature_pad'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const loading = ref(true)
const filter = ref('')
const showPreview = ref(false)
const showPad = ref(false)
const selectedData = ref(null)
const tempFile = ref(null)
const signatureCanvas = ref(null)
const config = ref({ kopUrl: '' })
const userData = ref(null)

let unsubUser = null
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
    field: 'total_harga',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'ACTIONS', field: 'id' },
]

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'positive'
    case 'Rejected':
      return 'negative'
    case 'Pending':
      return 'orange-9'
    default:
      return 'blue-grey-6'
  }
}

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_marketing_approval-penawaran'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const fetchApprovalData = () => {
  loading.value = true
  try {
    getDoc(doc(db, 'config', 'perusahaan')).then((confSnap) => {
      if (confSnap.exists()) config.value = confSnap.data()
    })

    const q = query(
      collection(db, 'penawaran'),
      where('status', 'in', ['Pending', 'Approved', 'Rejected']),
    )
    unsubApproval = onSnapshot(
      q,
      (snap) => {
        rows.value = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
        loading.value = false
      },
      (err) => {
        console.error(err)
        loading.value = false
      },
    )
  } catch (e) {
    console.error(e)
  }
}

watch(showPad, async (val) => {
  if (val) {
    await nextTick()
    const canvas = signatureCanvas.value
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    canvas.getContext('2d').scale(ratio, ratio)

    signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      penColor: '#000000',
    })
  }
})

const saveManualSignature = async () => {
  if (!signaturePad || signaturePad.isEmpty()) {
    $q.notify({ type: 'warning', message: 'Silakan goreskan tanda tangan!' })
    return
  }
  try {
    $q.loading.show({ message: 'Menyimpan tanda tangan digital...' })
    const base64 = signaturePad.toDataURL('image/png')
    await updateDoc(doc(db, 'penawaran', selectedData.value.id), {
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

const uploadSignatureFile = (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = async () => {
    try {
      $q.loading.show()
      await updateDoc(doc(db, 'penawaran', selectedData.value.id), {
        signatureUrl: reader.result,
        updatedAt: serverTimestamp(),
      })
      selectedData.value.signatureUrl = reader.result
      $q.notify({ type: 'positive', message: 'File tanda tangan berhasil diunggah!' })
    } catch (e) {
      console.error(e)
    } finally {
      $q.loading.hide()
    }
  }
}

const handleApproval = (row, status, alasan = null) => {
  $q.dialog({
    title: 'Konfirmasi Approval',
    message: `Apakah Anda yakin ingin memproses dokumen ini ke status ${status}?`,
    cancel: true,
    ok: {
      color: status === 'Approved' ? 'positive' : 'negative',
      unelevated: true,
      rounded: true,
      label: 'Ya, Proses',
    },
  }).onOk(async () => {
    try {
      $q.loading.show()
      const data = {
        status: status,
        updatedAt: serverTimestamp(),
        processedAt: serverTimestamp(),
      }
      if (status === 'Rejected' && alasan) data.alasan_reject = alasan
      await updateDoc(doc(db, 'penawaran', row.id), data)
      showPreview.value = false
      $q.notify({ type: 'positive', message: `Status penawaran diperbarui menjadi ${status}` })
    } catch (e) {
      console.error(e)
    } finally {
      $q.loading.hide()
    }
  })
}

const promptReject = (row) => {
  $q.dialog({
    title: 'Penolakan Penawaran (Reject)',
    message: 'Berikan alasan singkat atau instruksi revisi untuk marketing:',
    prompt: {
      model: '',
      type: 'textarea',
      placeholder: 'Contoh: Harga material terlalu tinggi, sesuaikan dengan budget...',
    },
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Reject Dokumen' },
  }).onOk((a) => handleApproval(row, 'Rejected', a))
}

const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
  tempFile.value = null
}

const openAnalisaFile = (url) => {
  if (url) window.open(url, '_blank')
}

const formatDateIndo = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
const printPage = () => window.print()
const clearPad = () => signaturePad?.clear()

const exportToPDF = () => {
  const element = document.getElementById('quotation-print')
  const opt = {
    margin: 0,
    filename: `Quotation_${selectedData.value.nomor.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Generating High-Resolution PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }
  fetchApprovalData()
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubApproval) unsubApproval()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.opacity-0 {
  opacity: 0;
}

/* Table Styling */
.approval-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Document Preview Paper - optimized for A4 */
.letter-paper {
  background: white;
  width: 210mm;
  min-height: 296mm;
  padding: 15mm 15mm;
  margin: 0 auto;
  color: #1a1a1a;
  line-height: 1.4;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Scaling surat untuk mobile agar pas di layar */
@media (max-width: 600px) {
  .preview-container {
    padding: 10px !important;
    align-items: flex-start !important;
  }
  .letter-paper {
    transform: scale(0.42); /* Menyesuaikan agar pas di lebar HP */
    transform-origin: top center;
    margin-bottom: -150mm; /* Menarik konten bawah agar tidak banyak sisa ruang */
  }
}

.final-kop-img {
  height: 80px;
  width: auto;
  object-fit: contain;
}
.final-pt-name {
  font-size: 26px;
  font-weight: 800;
  color: #1a237e;
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.final-pt-tagline {
  font-size: 11px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.final-divider {
  height: 3px;
  background: #1a237e;
  margin-top: 15px;
  border-bottom: 1px solid #1a237e;
}

.client-name-pro {
  font-size: 18px;
  font-weight: 800;
  color: #1a237e;
  margin: 2px 0;
}
.quotation-title-pro {
  font-size: 28px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: 6px;
  border-bottom: 1.5px solid #eee;
  margin-bottom: 5px;
}
.quotation-no-pro {
  font-size: 13px;
  font-weight: 800;
  margin: 2px 0;
}
.label-grey-pro {
  color: #888;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}
.text-date-pro {
  font-size: 12px;
  color: #444;
  font-weight: 600;
}

.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
}
.final-pro-table th {
  background: #1a237e !important;
  color: white !important;
  padding: 10px 8px;
  font-size: 10px;
  font-weight: 800;
  border: 1px solid #1a237e;
  text-align: center;
}
.final-pro-table td {
  padding: 8px 8px;
  border: 1px solid #ddd;
  font-size: 11px;
  color: #222;
}

.row-calculation {
  background: #f8f9fa !important;
}
.row-calculation td {
  padding: 6px 12px !important;
  border: 1px solid #ddd !important;
  font-size: 10px;
}
.row-grand-total {
  background: #1a237e !important;
}
.row-grand-total td {
  padding: 10px 12px !important;
  color: white !important;
  border: 1px solid #1a237e !important;
}

.terms-container {
  border: 1px solid #1a237e;
  margin-top: 15px;
  border-radius: 2px;
  overflow: hidden;
}
.terms-header {
  background: #1a237e;
  padding: 5px 10px;
  font-weight: 800;
  color: white;
  font-size: 10px;
  letter-spacing: 0.5px;
}
.terms-content-box {
  padding: 8px 12px;
  font-size: 10.5px;
  color: #333;
  line-height: 1.5;
}

/* Signature Area Styles */
.signature-pad-wrapper {
  border: 2px dashed #1a237e;
  background: #fcfdff;
  border-radius: 12px;
  height: 250px;
}
.signature-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.signature-container {
  margin-top: auto;
  padding-top: 20px;
}
.final-sign-space {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}
.img-signature {
  max-height: 100px;
  max-width: 250px;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.text-signer-final {
  font-size: 14px;
  font-weight: 800;
  color: #1a237e;
  border-bottom: 2px solid #1a237e;
  display: inline-block;
  padding: 0 5px;
}
.text-role-final {
  font-size: 11px;
  margin-top: 4px;
}

.shrink {
  flex: 0 0 auto;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    background: white !important;
    overflow: visible !important;
  }
  ::-webkit-scrollbar {
    display: none !important;
  }
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  .no-print {
    display: none !important;
  }
  .q-dialog__inner--maximized {
    padding: 0 !important;
    overflow: visible !important;
  }
  .q-card.column.no-wrap {
    height: auto !important;
    overflow: visible !important;
    display: block !important;
    box-shadow: none !important;
  }
  .preview-container {
    padding: 0 !important;
    overflow: visible !important;
    display: block !important;
  }
  .letter-paper {
    transform: scale(1) !important;
    margin: 0 !important;
    width: 210mm !important;
    height: 297mm !important;
    padding: 15mm !important;
    page-break-after: always;
    overflow: visible !important;
  }
  .final-pro-table th,
  .row-grand-total,
  .terms-header {
    background-color: #1a237e !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .row-calculation {
    background-color: #f8f9fa !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
