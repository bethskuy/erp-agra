<template>
  <q-page class="bg-page q-pa-md q-pa-md-lg font-pro relative-position" @click="spawnIcon($event)">
    <!-- EFEK ANIMASI KLIK (SPAWN ICONS) -->
    <div class="click-spawn-container">
      <transition-group name="spawn">
        <div
          v-for="icon in spawnedIcons"
          :key="icon.id"
          class="spawned-icon"
          :style="{
            left: icon.x + 'px',
            top: icon.y + 'px',
            '--rand-rotate': icon.rotate + 'deg',
            '--rand-color': icon.color,
            fontSize: icon.size + 'px',
          }"
        >
          <q-icon :name="icon.name" />
        </div>
      </transition-group>
    </div>

    <!-- EFEK LATAR BELAKANG ANIMASI MENGAMBANG (Warna-Warni Tosca, Kebureman Tipis & Elegan) -->
    <div class="bg-animation-container">
      <q-icon name="engineering" class="floating-icon i-1" />
      <q-icon name="construction" class="floating-icon i-2" />
      <q-icon name="architecture" class="floating-icon i-3" />
      <q-icon name="location_city" class="floating-icon i-4" />
      <q-icon name="handyman" class="floating-icon i-5" />
      <q-icon name="apartment" class="floating-icon i-6" />
      <q-icon name="engineering" class="floating-icon i-7" />
      <q-icon name="hardware" class="floating-icon i-8" />
    </div>

    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print content-relative">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
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
    <q-card
      flat
      bordered
      class="q-mb-lg shadow-1 rounded-20 bg-white no-print content-relative border-subtle"
    >
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
                <q-icon name="search" color="brand-primary" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space />
          <q-btn flat round icon="refresh" color="brand-primary" @click="fetchApprovalData" />
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE LIST SECTION -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print content-relative border-subtle"
    >
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
          <q-tr :props="props" class="bg-brand-primary text-white">
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
            <q-td key="nomor" class="text-weight-bolder text-brand-primary">
              {{ props.row.nomor }}
            </q-td>
            <q-td key="nama_customer" class="text-weight-bold text-blue-grey-9 uppercase">
              {{ props.row.nama_customer }}
            </q-td>
            <q-td key="total_harga" class="text-right text-weight-bolder text-brand-primary">
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
      <q-card class="column no-wrap bg-grey-4 relative-position">
        <!-- Background Animation di dalam Preview Dialog -->
        <div class="bg-animation-container">
          <q-icon name="engineering" class="floating-icon i-1" />
          <q-icon name="construction" class="floating-icon i-2" />
          <q-icon name="architecture" class="floating-icon i-3" />
          <q-icon name="location_city" class="floating-icon i-4" />
        </div>

        <!-- TOOLBAR: RESPONSIVE DESIGN -->
        <q-toolbar
          class="bg-white text-brand-primary q-py-sm no-print shadow-2 shrink content-relative"
        >
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold gt-xs">OTORISASI DOKUMEN</q-toolbar-title>

          <q-space class="lt-sm" />

          <!-- TOMBOL LIHAT DOKUMEN ANALISA (BISA PDF, WORD, EXCEL) -->
          <q-btn
            v-if="selectedData?.analisa_harga_url"
            color="brand-primary"
            icon="description"
            :label="$q.screen.gt.xs ? 'Lihat Dokumen Analisa' : ''"
            unelevated
            rounded
            class="q-mr-md shadow-2 text-white"
            @click="openAnalisaFile(selectedData.analisa_harga_url)"
          >
            <q-tooltip>Unduh/Buka Berkas Analisa Pendukung (PDF/Word/Excel)</q-tooltip>
          </q-btn>

          <!-- GROUP TOMBOL PDF (Cetak dihilangkan, hanya Export PDF) -->
          <q-btn-group unelevated rounded class="q-mr-xs q-mr-md-md shadow-1">
            <q-btn
              color="red-9"
              icon="picture_as_pdf"
              :label="$q.screen.gt.sm ? 'PDF' : ''"
              @click="exportToPDF"
              class="text-white"
            >
              <q-tooltip v-if="!$q.screen.gt.sm">Export PDF</q-tooltip>
            </q-btn>
          </q-btn-group>

          <!-- Action Approve -->
          <template v-if="selectedData?.status === 'Pending'">
            <q-btn
              v-if="canAction('approve')"
              unelevated
              color="positive"
              icon="check"
              :label="$q.screen.gt.sm ? 'APPROVE SEKARANG' : $q.screen.gt.xs ? 'APPROVE' : ''"
              @click="handleApproval(selectedData, 'Approved')"
              rounded
              class="text-weight-bold text-white"
            >
              <q-tooltip v-if="!$q.screen.gt.xs">Approve Penawaran</q-tooltip>
            </q-btn>
          </template>
        </q-toolbar>

        <!-- CONTAINER SURAT (WARNA TULISAN INDIGO TIDAK DIGANGGU GUGAT SESUAI REQUEST) -->
        <q-card-section
          class="col scroll q-pa-none q-pa-md-md flex flex-center preview-container content-relative"
        >
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
                  <td class="text-right text-weight-bold text-indigo-10">
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
                  <td class="text-right text-weight-bold text-indigo-10">
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

                  <!-- Area Signature menggunakan absolute positioning fix bug HTML2CANVAS -->
                  <div class="final-sign-space">
                    <img
                      v-if="selectedData.stempelUrl"
                      :src="selectedData.stempelUrl"
                      class="img-stempel"
                    />
                    <img
                      v-if="selectedData.signatureUrl"
                      :src="selectedData.signatureUrl"
                      class="img-signature"
                    />
                    <div
                      v-if="!selectedData.signatureUrl"
                      class="text-caption text-grey-4 italic w-full text-center"
                      style="padding-top: 40px"
                    >
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

    <div class="q-py-xl no-print"></div>
  </q-page>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
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
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const loading = ref(true)
const filter = ref('')
const showPreview = ref(false)
const selectedData = ref(null)
const config = ref({ kopUrl: '' })
const userData = ref(null)

let unsubUser = null
let unsubApproval = null

// ==========================================
// ANIMASI KLIK & MENGAMBANG (SAMA SEPERTI MASTER BARANG)
// ==========================================
const spawnedIcons = ref([])
let spawnIdCounter = 0
const clickIcons = [
  'construction',
  'engineering',
  'handyman',
  'architecture',
  'foundation',
  'precision_manufacturing',
  'carpenter',
  'plumbing',
  'electrical_services',
  'hardware',
]

const spawnIcon = (e) => {
  const target = e.target
  if (
    target.closest('button') ||
    target.closest('.q-btn') ||
    target.closest('input') ||
    target.closest('.q-field') ||
    target.closest('.q-dialog') ||
    target.closest('.q-table') ||
    target.closest('.q-card')
  ) {
    return
  }

  const iconName = clickIcons[Math.floor(Math.random() * clickIcons.length)]
  const colors = ['#36ada3', '#2a8b83', '#56c2b9', '#f29c1f', '#e67e22', '#e74c3c']
  const randColor = colors[Math.floor(Math.random() * colors.length)]
  const randRotate = Math.floor(Math.random() * 90) - 45
  const randSize = Math.floor(Math.random() * 25) + 35

  const newIcon = {
    id: spawnIdCounter++,
    x: e.clientX,
    y: e.clientY,
    name: iconName,
    color: randColor,
    rotate: randRotate,
    size: randSize,
  }

  spawnedIcons.value.push(newIcon)

  setTimeout(() => {
    spawnedIcons.value = spawnedIcons.value.filter((i) => i.id !== newIcon.id)
  }, 1400)
}
// ==========================================

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

const handleApproval = (row, status, alasan = null) => {
  // MEMPERBAIKI DIALOG BUTTONS AGAR ELEGAN, RAPI, TIDAK SALING TABRAKAN ATAU INVISIBLE
  $q.dialog({
    title:
      '<div class="text-h5 text-weight-bolder text-brand-primary q-mb-sm">Konfirmasi Otorisasi</div>',
    message: `Apakah Anda yakin ingin memperbarui status dokumen ini menjadi <b class="${status === 'Approved' ? 'text-positive' : 'text-negative'}">${status}</b>?`,
    html: true,
    cancel: {
      label: 'Batal',
      color: 'grey-7',
      outline: true,
      rounded: true,
      unelevated: true,
      class: 'q-px-lg text-weight-bold text-uppercase',
    },
    ok: {
      label: 'Ya, Proses',
      color: status === 'Approved' ? 'positive' : 'negative',
      unelevated: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold text-uppercase shadow-2',
    },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk(async () => {
    try {
      $q.loading.show()
      const data = {
        status: status,
        updatedAt: serverTimestamp(),
        processedAt: serverTimestamp(),
        marketing_read: false, // Mengaktifkan notifikasi Tanda Terima Baca (Read Receipt) untuk marketing
      }
      if (status === 'Rejected' && alasan) data.alasan_reject = alasan
      await updateDoc(doc(db, 'penawaran', row.id), data)
      showPreview.value = false

      // SINKRONISASI NOTIFIKASI OTORISASI PREMIUM (HIJAU UNTUK APPROVED, MERAH UNTUK REJECTED DI BAGIAN ATAS DENGAN PROGRESS BAR & CLOSE BUTTON)
      $q.notify({
        html: true,
        message: `<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Otorisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Status dokumen penawaran diperbarui menjadi <b>${status}</b>.</div>`,
        color: status === 'Approved' ? 'positive' : 'negative',
        icon: status === 'Approved' ? 'verified' : 'cancel',
        position: 'top', // Penempatan digeser ke bagian atas layar
        timeout: 4000,
        progress: true,
        classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
      })
    } catch (e) {
      console.error(e)
    } finally {
      $q.loading.hide()
    }
  })
}

const promptReject = (row) => {
  $q.dialog({
    title:
      '<div class="text-h5 text-weight-bolder text-negative q-mb-sm">Penolakan Penawaran</div>',
    message: 'Berikan alasan singkat atau instruksi revisi untuk marketing:',
    html: true,
    prompt: {
      model: '',
      type: 'textarea',
      placeholder: 'Contoh: Harga material terlalu tinggi, sesuaikan dengan budget...',
    },
    cancel: {
      label: 'Batal',
      color: 'grey-7',
      outline: true,
      rounded: true,
      unelevated: true,
      class: 'q-px-lg text-weight-bold text-uppercase',
    },
    ok: {
      label: 'Reject Dokumen',
      color: 'negative',
      unelevated: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold text-uppercase shadow-2',
    },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk((a) => handleApproval(row, 'Rejected', a))
}

const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
}

const openAnalisaFile = (url) => {
  if (url) window.open(url, '_blank')
}

const formatDateIndo = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

const exportToPDF = () => {
  $q.loading.show({ message: 'Menyiapkan Dokumen PDF...' })

  // Memberi jeda 1 detik agar canvas merender gambar dengan sempurna
  setTimeout(() => {
    const element = document.getElementById('quotation-print')
    const opt = {
      margin: 0,
      filename: `Quotation_${selectedData.value?.nomor?.replace(/\//g, '-') || 'Doc'}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        $q.loading.hide()
        $q.notify({ type: 'positive', message: 'PDF Berhasil Diekspor!' })
      })
  }, 1000)
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

<style>
/* =======================================================================
   ANIMASI BACKGROUND GLOBAL STYLES (Mencegah Typo & Kegagalan Scoped CSS)
   ======================================================================= */
.bg-animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.floating-icon {
  position: absolute;
  bottom: -150px;
  animation: floatUp linear infinite;
  opacity: 0.15;
  filter: blur(1.5px);
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* Posisi dan durasi masing-masing ikon mengambang */
.i-1 {
  left: 10%;
  font-size: 100px;
  animation-duration: 25s;
  animation-delay: 0s;
  color: #36ada3;
}
.i-2 {
  left: 30%;
  font-size: 70px;
  animation-duration: 35s;
  animation-delay: 5s;
  color: #f29c1f;
}
.i-3 {
  left: 60%;
  font-size: 120px;
  animation-duration: 40s;
  animation-delay: 12s;
  color: #e74c3c;
}
.i-4 {
  left: 80%;
  font-size: 85px;
  animation-duration: 30s;
  animation-delay: 2s;
  color: #56c2b9;
}
.i-5 {
  left: 15%;
  font-size: 90px;
  animation-duration: 28s;
  animation-delay: 15s;
  color: #e67e22;
}
.i-6 {
  left: 45%;
  font-size: 110px;
  animation-duration: 45s;
  animation-delay: 8s;
  color: #2a8b83;
}
.i-7 {
  left: 75%;
  font-size: 60px;
  animation-duration: 22s;
  animation-delay: 20s;
  color: #f29c1f;
}
.i-8 {
  left: 25%;
  font-size: 95px;
  animation-duration: 32s;
  animation-delay: 25s;
  color: #e74c3c;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.15;
  }
  90% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
}
</style>

<style scoped>
/* ===== LOCAL STYLES SCOPED ===== */
.bg-page {
  background-color: #f8fcfb;
}

.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.15);
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}

/* OVERRIDE WARNA LAMA (INDIGO) MENJADI BRAND COLOR BARU (TEAL) */
.bg-brand-primary,
:deep(.bg-brand-primary) {
  background-color: #36ada3 !important;
}
.text-brand-primary,
:deep(.text-brand-primary) {
  color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e6f5f4 !important;
}
.text-brand-secondary {
  color: #2a8b83 !important;
}
.border-brand-thin {
  border: 2px solid #b2e5e2 !important;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}

/* QUASAR COMPONENT OVERRIDES */
:deep(.q-btn.bg-brand-primary) {
  background-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}
:deep(.q-icon[color='brand-primary']),
:deep(.q-field__prepend .q-icon) {
  color: #36ada3 !important;
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
  background-color: #e6f5f4 !important;
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

/* Signature Area Styles - MATCH WITH PenawaranPage for Safe PDF Export */
.signature-container {
  margin-top: auto;
  padding-top: 20px;
}
.final-sign-space {
  position: relative;
  height: 120px;
  width: 250px;
  margin-left: auto;
  margin-bottom: 10px;
}
.img-stempel {
  position: absolute;
  width: 110px;
  height: auto;
  right: 70px; /* Geser sedikit ke kiri menimpa TTD */
  bottom: 5px;
  z-index: 2;
}
.img-signature {
  position: absolute;
  width: 160px;
  height: auto;
  right: 0;
  bottom: 0;
  z-index: 1;
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
.content-relative {
  position: relative;
  z-index: 1;
}

/* ===== CLICK SPAWN ICONS ===== */
.click-spawn-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.spawned-icon {
  position: absolute;
  color: var(--rand-color);
  transform-origin: center;
  pointer-events: none;
  animation: spawnBurst 1.4s ease-out forwards;
}

@keyframes spawnBurst {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  40% {
    transform: translate(-50%, -100%) scale(1.2) rotate(var(--rand-rotate));
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -180%) scale(0.5) rotate(calc(var(--rand-rotate) * 1.5));
    opacity: 0;
  }
}

.spawn-enter-active,
.spawn-leave-active {
  transition: all 1.4s ease;
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
