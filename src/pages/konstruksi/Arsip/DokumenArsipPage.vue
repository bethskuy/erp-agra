<template>
  <q-page class="bg-page q-pa-md font-pro">
    <div class="page-content-wrapper">
      <!-- =====================================================================================
           HEADER UTAMA (TIDAK ADA TOMBOL KEMBALI)
           ===================================================================================== -->
      <div class="row items-center justify-between q-mb-lg animate-fade no-print">
        <div class="col-12 col-md-8">
          <div class="row items-center no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
                Arsip Dokumen Digital
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                  >Pusat Sinkronisasi & Penyimpanan Berkas Agra ERP</span
                >
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Pusat penyimpanan berkas otomatis yang tersinkronisasi dari aktivitas modul Gudang,
                Finance, Kepegawaian, dan Pembelian.
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-center text-md-right">
          <q-btn
            color="brand-primary"
            icon="cloud_upload"
            label="Unggah Berkas Langsung"
            unelevated
            rounded
            no-caps
            class="q-px-lg q-py-sm shadow-premium text-weight-bold"
            @click="openUploadDialog"
          />
        </div>
      </div>

      <!-- =====================================================================================
           BREADCRUMBS & NAVIGATION
           ===================================================================================== -->
      <div class="row items-center q-mb-lg no-print" v-if="activeFolder">
        <q-btn
          flat
          round
          dense
          color="brand-primary"
          icon="arrow_back"
          class="bg-white shadow-1 q-mr-md"
          @click="activeFolder = null"
        />
        <div class="text-subtitle1 text-weight-bold text-blue-grey-9 flex items-center no-wrap">
          <span class="cursor-pointer text-brand-primary" @click="activeFolder = null"
            >Arsip Utama</span
          >
          <q-icon name="chevron_right" class="q-mx-xs" color="grey-6" />
          <span class="text-grey-7 uppercase">{{ activeFolder }}</span>
        </div>
      </div>

      <!-- =====================================================================================
           FOLDER GRID VIEW (KETIKA BELUM MEMILIH FOLDER)
           ===================================================================================== -->
      <div v-if="!activeFolder" class="row q-col-gutter-lg q-mb-xl animate-fade">
        <div v-for="folder in folders" :key="folder.name" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card
            flat
            bordered
            class="folder-card rounded-20 bg-white transition-all cursor-pointer shadow-sm border-subtle"
            @click="activeFolder = folder.name"
          >
            <q-card-section class="q-pa-lg text-center column items-center">
              <!-- Ikon Folder Berwarna Warni Sesuai Kategori -->
              <q-avatar
                size="72px"
                :color="folder.bgColor"
                :text-color="folder.textColor"
                :icon="folder.icon"
                class="q-mb-md shadow-sm rounded-16"
              />
              <div class="text-subtitle1 text-weight-bold text-blue-grey-10 line-clamp-1">
                {{ folder.name }}
              </div>
              <div class="text-caption text-grey-6 text-weight-medium q-mt-xs">
                {{ getFileCountInFolder(folder.name) }} Berkas Digital
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- =====================================================================================
           FILE LIST EXPLORER (KETIKA FOLDER AKTIF)
           ===================================================================================== -->
      <div v-else class="animate-fade">
        <!-- PANEL CARI & FILTER INTERNAL FOLDER -->
        <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-subtle">
          <q-card-section class="q-py-md">
            <div class="row items-center q-col-gutter-md">
              <div class="col-12 col-md-5">
                <q-input
                  v-model="searchQuery"
                  outlined
                  dense
                  rounded
                  placeholder="Cari nama berkas, nomor referensi, atau pengunggah..."
                  bg-color="white"
                  color="brand-primary"
                  class="search-input"
                >
                  <template v-slot:prepend><q-icon name="search" color="brand-primary" /></template>
                  <template v-slot:append v-if="searchQuery">
                    <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
                  </template>
                </q-input>
              </div>
              <q-space />
              <div class="col-12 col-md-auto text-caption text-grey-6 text-weight-bold uppercase">
                Menampilkan {{ filteredFiles.length }} Berkas di {{ activeFolder }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- DATA CARDS BERKAS / FILE GRID -->
        <div class="row q-col-gutter-lg" v-if="filteredFiles.length > 0">
          <div
            v-for="file in filteredFiles"
            :key="file.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card
              flat
              bordered
              class="file-card rounded-20 bg-white shadow-xs overflow-hidden transition-all hover-shadow border-subtle"
            >
              <q-card-section class="q-pa-md relative-position">
                <!-- Format Badge -->
                <q-badge
                  :color="getFileTypeBadge(file.tipe).color"
                  class="absolute-top-right q-ma-md q-px-sm q-py-xs text-weight-bold"
                  rounded
                >
                  {{ getFileTypeBadge(file.tipe).label }}
                </q-badge>

                <!-- Ilustrasi / Thumbnail berdasarkan tipe file -->
                <div
                  class="file-preview-thumbnail flex flex-center rounded-12 bg-grey-1 q-mb-md cursor-pointer"
                  @click="viewFile(file)"
                >
                  <q-icon
                    :name="getFileTypeBadge(file.tipe).icon"
                    size="54px"
                    :color="getFileTypeBadge(file.tipe).color"
                    v-if="file.tipe !== 'image'"
                  />
                  <img v-else :src="file.url" class="image-thumbnail" />
                </div>

                <!-- Info Berkas -->
                <div
                  class="text-subtitle2 text-weight-bold text-blue-grey-10 line-clamp-2 leading-tight cursor-pointer"
                  style="min-height: 2.8em"
                  @click="viewFile(file)"
                >
                  {{ file.nama }}
                </div>
                <q-separator class="q-my-sm" />

                <div class="text-caption text-grey-7">
                  <div class="row items-center no-wrap q-mb-xs">
                    <q-icon name="dataset" class="q-mr-xs text-brand-primary" />
                    <span class="ellipsis text-weight-bold">Ref: {{ file.sumber }}</span>
                  </div>
                  <div class="row items-center no-wrap q-mb-xs">
                    <q-icon name="person" class="q-mr-xs" />
                    <span class="ellipsis">Oleh: {{ file.pembuat }}</span>
                  </div>
                  <div class="row items-center no-wrap">
                    <q-icon name="event" class="q-mr-xs" />
                    <span>{{ formatDateIndo(file.tanggal) }}</span>
                  </div>
                </div>
              </q-card-section>

              <!-- Aksi Tombol -->
              <q-card-actions align="right" class="bg-grey-1 q-px-md q-py-sm border-top">
                <q-btn
                  flat
                  round
                  dense
                  color="brand-primary"
                  icon="visibility"
                  size="sm"
                  @click="viewFile(file)"
                >
                  <q-tooltip>Buka Berkas</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="blue-8"
                  icon="download"
                  size="sm"
                  @click="downloadFile(file)"
                >
                  <q-tooltip>Unduh Berkas</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="file.isManualUpload"
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="deleteManualFile(file)"
                >
                  <q-tooltip>Hapus Berkas</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Jika folder kosong -->
        <div
          v-else
          class="text-center q-pa-xl bg-white rounded-20 border-subtle q-mt-lg text-grey-5 animate-fade"
        >
          <q-icon name="folder_open" size="80px" class="q-mb-md opacity-50" color="brand-primary" />
          <div class="text-h6 text-weight-bold text-brand-primary">Folder Kosong</div>
          <div class="text-subtitle2 q-mt-xs">
            Belum ada berkas digital yang tersimpan di folder ini.
          </div>
        </div>
      </div>

      <!-- =====================================================================================
           DIALOG UNGGAL MANUAL BERKAS DARI ARSIP
           ===================================================================================== -->
      <q-dialog v-model="showUploadDialog" persistent backdrop-filter="blur(4px)">
        <q-card
          style="width: 450px; max-width: 90vw"
          class="rounded-20 shadow-24 font-pro border-subtle"
        >
          <q-card-section class="row items-center q-pb-none q-pt-lg q-px-lg">
            <div class="row items-center">
              <q-avatar
                color="brand-light"
                text-color="brand-primary"
                icon="cloud_upload"
                size="md"
                class="q-mr-md"
              />
              <div>
                <div class="text-h6 text-weight-bold text-blue-grey-10">Unggah Berkas Baru</div>
                <div class="text-caption text-grey-6">
                  Simpan berkas pelengkap langsung ke server
                </div>
              </div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
          </q-card-section>

          <q-card-section class="q-pa-lg q-gutter-y-md">
            <div>
              <div class="label-req q-mb-xs">PILIH FOLDER TUJUAN *</div>
              <q-select
                outlined
                dense
                v-model="uploadForm.folder"
                :options="folders.map((f) => f.name)"
                placeholder="Tentukan folder arsip..."
                color="brand-primary"
              />
            </div>

            <div>
              <div class="label-req q-mb-xs">NAMA / JUDUL BERKAS *</div>
              <q-input
                outlined
                dense
                v-model="uploadForm.nama"
                placeholder="Contoh: Dokumen Legalitas Tanah Proyek A"
                color="brand-primary"
              />
            </div>

            <div>
              <div class="label-req q-mb-xs">REFERENSI / KETERANGAN *</div>
              <q-input
                outlined
                dense
                v-model="uploadForm.deskripsi"
                placeholder="Contoh: Berkas pembebasan lahan"
                color="brand-primary"
              />
            </div>

            <div>
              <div class="label-req q-mb-xs">UNGGAH FILE DOKUMEN *</div>
              <q-file
                outlined
                dense
                v-model="uploadForm.fileRaw"
                label="Pilih Berkas (PDF / Image)"
                accept="image/*, .pdf"
                color="brand-primary"
              >
                <template v-slot:prepend><q-icon name="attach_file" /></template>
              </q-file>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-1 q-pa-md border-top">
            <q-btn
              flat
              label="Batal"
              color="grey-7"
              v-close-popup
              class="rounded-8 text-weight-bold"
            />
            <q-btn
              unelevated
              color="brand-primary"
              label="UNGGAH DOKUMEN"
              class="rounded-12 text-weight-bold q-px-lg shadow-4"
              @click="uploadManualDoc"
              :loading="uploading"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- =====================================================================================
           PREVIEW DIALOG FILE (MODAL VIEW)
           ===================================================================================== -->
      <q-dialog v-model="showPreviewDialog" maximized transition-show="fade" transition-hide="fade">
        <q-card class="column no-wrap bg-page">
          <q-toolbar class="bg-brand-primary text-white q-py-sm shrink">
            <q-btn flat round dense icon="arrow_back" v-close-popup color="white" />
            <q-toolbar-title class="text-weight-bold text-subtitle1 uppercase ellipsis">
              {{ activeFile?.nama }}
            </q-toolbar-title>
            <q-space />
            <q-btn flat round icon="download" color="white" @click="downloadFile(activeFile)">
              <q-tooltip>Unduh Dokumen</q-tooltip>
            </q-btn>
          </q-toolbar>

          <q-card-section class="col scroll flex flex-center q-pa-none">
            <div v-if="activeFile" class="full-width full-height flex flex-center">
              <!-- Jika PDF -->
              <iframe
                v-if="activeFile.tipe === 'pdf'"
                :src="activeFile.url"
                style="width: 100%; height: 100%; border: none"
              ></iframe>

              <!-- Jika Image -->
              <img
                v-else-if="activeFile.tipe === 'image'"
                :src="activeFile.url"
                style="max-width: 95%; max-height: 90vh; object-fit: contain"
              />

              <!-- Jika tipe lain -->
              <div v-else class="text-center text-white q-pa-xl">
                <q-icon name="description" size="80px" color="brand-light" class="q-mb-md" />
                <div class="text-h6">Format Dokumen Tidak Didukung untuk Preview Langsung</div>
                <div class="text-subtitle2 q-mt-xs opacity-75">
                  Silakan unduh dokumen untuk membukanya secara lokal.
                </div>
                <q-btn
                  unelevated
                  color="brand-primary"
                  icon="download"
                  label="Unduh Sekarang"
                  class="q-mt-lg rounded-12"
                  @click="downloadFile(activeFile)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db, storage } from 'src/boot/firebase'
import { collection, onSnapshot, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

// ============================================================================
// STATE KELOLA BERKAS SINKRONISASI & DOKUMEN MANUAL
// ============================================================================
const activeFolder = ref(null)
const searchQuery = ref('')
const loading = ref(true)

const showUploadDialog = ref(false)
const uploading = ref(false)
const uploadForm = ref({
  folder: 'Arsip Umum',
  nama: '',
  deskripsi: '',
  fileRaw: null,
})

const showPreviewDialog = ref(false)
const activeFile = ref(null)

// State data mentah database acuan (real-time listeners)
const rawPermintaan = ref([])
const rawTagihanSupplier = ref([])
const rawTagihanCustomer = ref([])
const rawArsipManual = ref([])
const rawPurchaseOrder = ref([])
const rawPenawaran = ref([])
const rawProyek = ref([])
const rawSpkCustomer = ref([])
const rawSuppliers = ref([])

let unsubPermintaan = null
let unsubTagihanSupplier = null
let unsubTagihanCustomer = null
let unsubArsipManual = null
let unsubPurchaseOrder = null
let unsubPenawaran = null
let unsubProyek = null
let unsubSpkCustomer = null
let unsubSuppliers = null

// ============================================================================
// DAFTAR VIRTUAL FOLDERS
// ============================================================================
const folders = [
  {
    name: 'Gudang & Logistik',
    icon: 'warehouse',
    bgColor: 'brand-light',
    textColor: 'brand-primary',
  },
  { name: 'Finance & Invoice', icon: 'payments', bgColor: 'green-1', textColor: 'green-9' },
  { name: 'Pembelian & PO', icon: 'shopping_cart', bgColor: 'purple-1', textColor: 'purple-9' },
  { name: 'Marketing & Penawaran', icon: 'local_offer', bgColor: 'pink-1', textColor: 'pink-9' },
  { name: 'Proyek & SPK', icon: 'work', bgColor: 'teal-1', textColor: 'teal-9' },
  { name: 'Supplier', icon: 'business', bgColor: 'deep-orange-1', textColor: 'deep-orange-9' },
  { name: 'Arsip Umum', icon: 'folder_shared', bgColor: 'orange-1', textColor: 'orange-9' },
]

// ============================================================================
// DETEKSI EKSTENSI & FORMALISASI FORMAT BADGE FILE
// ============================================================================
const detectFileType = (url, name) => {
  if (!url) return 'other'
  const str = (url + (name || '')).toLowerCase()
  if (str.includes('.pdf') || str.includes('pdf')) return 'pdf'
  if (
    str.includes('.jpg') ||
    str.includes('.jpeg') ||
    str.includes('.png') ||
    str.includes('.webp') ||
    str.includes('image') ||
    str.startsWith('data:image')
  ) {
    return 'image'
  }
  if (
    str.includes('.xls') ||
    str.includes('.xlsx') ||
    str.includes('excel') ||
    str.includes('spreadsheet')
  ) {
    return 'excel'
  }
  if (str.includes('.doc') || str.includes('.docx') || str.includes('document')) return 'doc'
  return 'other'
}

const getFileTypeBadge = (type) => {
  switch (type) {
    case 'pdf':
      return { label: 'PDF', color: 'red-9', icon: 'picture_as_pdf' }
    case 'image':
      return { label: 'IMAGE', color: 'brand-primary', icon: 'image' }
    case 'excel':
      return { label: 'EXCEL', color: 'green-9', icon: 'table_view' }
    case 'doc':
      return { label: 'WORD', color: 'blue-9', icon: 'description' }
    default:
      return { label: 'FILE', color: 'blue-grey-6', icon: 'insert_drive_file' }
  }
}

// ============================================================================
// HELPER: SAFE CONVERT TANGGAL KE MILLISECONDS (FIX UTAMA)
// Menangani semua kemungkinan tipe: Firestore Timestamp, seconds object, string, Date
// ============================================================================
const toMs = (t) => {
  if (!t) return 0
  // Firestore Timestamp object dengan method toDate()
  if (typeof t?.toDate === 'function') {
    try {
      return t.toDate().getTime()
    } catch {
      return 0
    }
  }
  // Plain object dengan field seconds (Firestore Timestamp serialized)
  if (t?.seconds) return t.seconds * 1000
  // String atau number
  const d = new Date(t)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

// ============================================================================
// HELPER: FORMAT TANGGAL INDONESIA (SAFE VERSION)
// ============================================================================
const formatDateIndo = (d) => {
  if (!d) return '-'
  const ms = toMs(d)
  if (!ms) return '-'
  const dateObj = new Date(ms)
  if (isNaN(dateObj.getTime())) return '-'
  return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ============================================================================
// REAL-TIME SINKRONISASI SEMUA BERKAS DARI MASTER & TRANSACTIONAL ERP
// ============================================================================
const allFiles = computed(() => {
  const list = []

  // 1. SINKRONISASI BERKAS DARI MODUL GUDANG & LOGISTIK (permintaan_barang)
  rawPermintaan.value.forEach((p) => {
    // Cek berbagai kemungkinan nama field lampiran
    const lampiranArr = p.dokumen_lampiran || p.lampiran || p.files || p.attachments || []
    if (Array.isArray(lampiranArr)) {
      lampiranArr.forEach((docItem, idx) => {
        const url =
          docItem?.url ||
          docItem?.fileUrl ||
          docItem?.link ||
          (typeof docItem === 'string' ? docItem : null)
        if (url) {
          list.push({
            id: `gudang-pr-${p.id}-${idx}`,
            nama:
              docItem?.label ||
              docItem?.name ||
              docItem?.nama ||
              `Lampiran PR ${p.nomor || p.kode_tagihan || ''}`,
            url,
            folder: 'Gudang & Logistik',
            sumber: `PR No: ${p.nomor || p.kode_tagihan || p.id || '-'}`,
            tanggal: p.updatedAt || p.createdAt || null,
            tipe: detectFileType(url, docItem?.label || docItem?.name),
            pembuat: p.requestor_nama || p.pemohon?.nama || p.dibuat_oleh || 'Logistik',
            isManualUpload: false,
          })
        }
      })
    }
  })

  // 2. SINKRONISASI BERKAS FINANCE & INVOICE (Tagihan Supplier & AP)
  rawTagihanSupplier.value.forEach((t) => {
    const lampiranArr = t.lampiran || t.dokumen_lampiran || t.files || []
    if (Array.isArray(lampiranArr)) {
      lampiranArr.forEach((docItem, idx) => {
        const url =
          docItem?.url ||
          docItem?.base64 ||
          docItem?.fileUrl ||
          (typeof docItem === 'string' ? docItem : null)
        if (url) {
          list.push({
            id: `finance-ap-${t.id}-${idx}`,
            nama: docItem?.label || docItem?.name || `Lampiran AP No: ${t.nomor_invoice || ''}`,
            url,
            folder: 'Finance & Invoice',
            sumber: `Vendor: ${t.supplier_nama || t.vendor || '-'} (Inv: ${t.nomor_invoice || '-'})`,
            tanggal: t.updatedAt || t.createdAt || null,
            tipe: detectFileType(url, docItem?.label || docItem?.name),
            pembuat: t.pembuat || t.dibuat_oleh || 'Finance',
            isManualUpload: false,
          })
        }
      })
    }

    // Riwayat Pembayaran / Bukti Bayar
    const riwayatArr = t.riwayat_pembayaran || t.pembayaran || []
    if (Array.isArray(riwayatArr)) {
      riwayatArr.forEach((h) => {
        const buktiUrl = h?.bukti_url || h?.bukti || h?.url || null
        if (buktiUrl) {
          list.push({
            id: `finance-pay-ap-${t.id}-${h.id || Math.random()}`,
            nama: h.catatan || h.keterangan || `Bukti Bayar AP - ${t.supplier_nama || '-'}`,
            url: buktiUrl,
            folder: 'Finance & Invoice',
            sumber: `Pencairan AP (Inv: ${t.nomor_invoice || '-'})`,
            tanggal: h.tanggal || t.updatedAt || null,
            tipe: detectFileType(buktiUrl, h.catatan),
            pembuat: h.kasir || 'Kasir Utama',
            isManualUpload: false,
          })
        }
      })
    }
  })

  // SINKRONISASI BERKAS AR INVOICE CUSTOMER
  rawTagihanCustomer.value.forEach((c) => {
    const lampiranArr = c.lampiran || c.dokumen_lampiran || c.files || []
    if (Array.isArray(lampiranArr)) {
      lampiranArr.forEach((docItem, idx) => {
        const url =
          docItem?.url || docItem?.fileUrl || (typeof docItem === 'string' ? docItem : null)
        if (url) {
          list.push({
            id: `finance-ar-${c.id}-${idx}`,
            nama: docItem?.label || docItem?.name || `Lampiran Invoice AR ${c.nomor_invoice || ''}`,
            url,
            folder: 'Finance & Invoice',
            sumber: `Client: ${c.customer_nama || c.pelanggan || '-'} (Inv: ${c.nomor_invoice || '-'})`,
            tanggal: c.updatedAt || c.createdAt || null,
            tipe: detectFileType(url, docItem?.label || docItem?.name),
            pembuat: c.pembuat || 'Billing Coordinator',
            isManualUpload: false,
          })
        }
      })
    }
  })

  // 3. SINKRONISASI BERKAS PEMBELIAN & PO
  rawPurchaseOrder.value.forEach((po) => {
    const lampiranArr = po.lampiran || po.dokumen_lampiran || po.files || po.attachments || []
    if (Array.isArray(lampiranArr)) {
      lampiranArr.forEach((docItem, idx) => {
        const url =
          docItem?.url ||
          docItem?.fileUrl ||
          docItem?.link ||
          (typeof docItem === 'string' ? docItem : null)
        if (url) {
          list.push({
            id: `pembelian-po-${po.id}-${idx}`,
            nama:
              docItem?.label ||
              docItem?.name ||
              docItem?.nama ||
              `Lampiran PO ${po.nomor || po.nomor_po || ''}`,
            url,
            folder: 'Pembelian & PO',
            sumber: `PO No: ${po.nomor || po.nomor_po || po.id || '-'}`,
            tanggal: po.updatedAt || po.createdAt || null,
            tipe: detectFileType(url, docItem?.label || docItem?.name),
            pembuat: po.pembuat || po.dibuat_oleh || 'Logistik',
            isManualUpload: false,
          })
        }
      })
    }
  })

  // 4. SINKRONISASI BERKAS MARKETING & PENAWARAN
  rawPenawaran.value.forEach((pnw) => {
    const lampiranArr = pnw.lampiran || pnw.dokumen_lampiran || pnw.files || pnw.attachments || []
    if (Array.isArray(lampiranArr)) {
      lampiranArr.forEach((docItem, idx) => {
        const url =
          docItem?.url ||
          docItem?.fileUrl ||
          docItem?.link ||
          (typeof docItem === 'string' ? docItem : null)
        if (url) {
          list.push({
            id: `marketing-penawaran-${pnw.id}-${idx}`,
            nama:
              docItem?.label ||
              docItem?.name ||
              docItem?.nama ||
              `Lampiran Penawaran ${pnw.nomor || ''}`,
            url,
            folder: 'Marketing & Penawaran',
            sumber: `Penawaran No: ${pnw.nomor || pnw.id || '-'}`,
            tanggal: pnw.updatedAt || pnw.createdAt || null,
            tipe: detectFileType(url, docItem?.label || docItem?.name),
            pembuat: pnw.pembuat || pnw.dibuat_oleh || 'Marketing',
            isManualUpload: false,
          })
        }
      })
    }
  })

  // 5. SINKRONISASI BERKAS PROYEK & SPK
  rawProyek.value.forEach((proyek) => {
    const lampiranArr =
      proyek.lampiran || proyek.dokumen_lampiran || proyek.files || proyek.dokumen || []
    if (Array.isArray(lampiranArr)) {
      lampiranArr.forEach((docItem, idx) => {
        const url =
          docItem?.url ||
          docItem?.fileUrl ||
          docItem?.link ||
          (typeof docItem === 'string' ? docItem : null)
        if (url) {
          list.push({
            id: `proyek-dokumen-${proyek.id}-${idx}`,
            nama:
              docItem?.label ||
              docItem?.name ||
              docItem?.nama ||
              `Dokumen Proyek ${proyek.nama || ''}`,
            url,
            folder: 'Proyek & SPK',
            sumber: `Proyek: ${proyek.nama || proyek.id || '-'}`,
            tanggal: proyek.updatedAt || proyek.createdAt || null,
            tipe: detectFileType(url, docItem?.label || docItem?.name),
            pembuat: proyek.pembuat || proyek.dibuat_oleh || 'PM',
            isManualUpload: false,
          })
        }
      })
    }
  })

  rawSpkCustomer.value.forEach((spk) => {
    const lampiranArr = spk.lampiran || spk.dokumen_lampiran || spk.files || spk.attachments || []
    if (Array.isArray(lampiranArr)) {
      lampiranArr.forEach((docItem, idx) => {
        const url =
          docItem?.url ||
          docItem?.fileUrl ||
          docItem?.link ||
          (typeof docItem === 'string' ? docItem : null)
        if (url) {
          list.push({
            id: `spk-dokumen-${spk.id}-${idx}`,
            nama:
              docItem?.label || docItem?.name || docItem?.nama || `Dokumen SPK ${spk.nomor || ''}`,
            url,
            folder: 'Proyek & SPK',
            sumber: `SPK No: ${spk.nomor || spk.id || '-'}`,
            tanggal: spk.updatedAt || spk.createdAt || null,
            tipe: detectFileType(url, docItem?.label || docItem?.name),
            pembuat: spk.pembuat || spk.dibuat_oleh || 'PM',
            isManualUpload: false,
          })
        }
      })
    }
  })

  // 6. SINKRONISASI BERKAS SUPPLIER
  rawSuppliers.value.forEach((supplier) => {
    const docsArr =
      supplier.docs ||
      supplier.dokumen ||
      supplier.lampiran ||
      supplier.files ||
      supplier.dokumen_legalitas ||
      []
    if (Array.isArray(docsArr)) {
      docsArr.forEach((docItem, idx) => {
        const url =
          docItem?.url || docItem?.fileUrl || (typeof docItem === 'string' ? docItem : null)
        if (url) {
          list.push({
            id: `supplier-legal-${supplier.id}-${idx}`,
            nama:
              docItem?.name ||
              docItem?.nama ||
              docItem?.label ||
              `Dokumen Legalitas - ${supplier.nama || ''}`,
            url,
            folder: 'Supplier',
            sumber: `Supplier: ${supplier.nama || supplier.id || '-'}`,
            tanggal: supplier.updatedAt || supplier.createdAt || null,
            tipe: detectFileType(url, docItem?.name || docItem?.nama),
            pembuat: 'Admin',
            isManualUpload: false,
          })
        }
      })
    }
  })

  // 7. BERKAS YANG DIUNGGAH MANUAL LANGSUNG DARI HALAMAN ARSIP INI
  rawArsipManual.value.forEach((m) => {
    list.push({
      ...m,
      isManualUpload: true,
    })
  })

  return list
})

const getFileCountInFolder = (folderName) => {
  return allFiles.value.filter((f) => f.folder === folderName).length
}

const filteredFiles = computed(() => {
  let list = allFiles.value.filter((f) => f.folder === activeFolder.value)

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (f) =>
        (f.nama || '').toLowerCase().includes(q) ||
        (f.sumber || '').toLowerCase().includes(q) ||
        (f.pembuat || '').toLowerCase().includes(q),
    )
  }

  // ============================================================
  // SORTING AMAN — FIX UTAMA: tidak pakai .toDate() langsung
  // Menggunakan helper toMs() yang menangani semua tipe tanggal
  // ============================================================
  return list.sort((a, b) => toMs(b.tanggal) - toMs(a.tanggal))
})

// ============================================================================
// DYNAMIC FILE DOWNLOAD HELPER
// ============================================================================
const downloadFile = (file) => {
  if (!file?.url) return
  const link = document.createElement('a')
  link.href = file.url
  link.target = '_blank'
  link.download = file.nama
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ============================================================================
// ACTIONS MANUAL UPLOADS (DIRECTLY ON ARCHIVE PAGE)
// ============================================================================
const openUploadDialog = () => {
  uploadForm.value = {
    folder: activeFolder.value || 'Arsip Umum',
    nama: '',
    deskripsi: '',
    fileRaw: null,
  }
  showUploadDialog.value = true
}

const uploadManualDoc = async () => {
  if (!uploadForm.value.nama || !uploadForm.value.fileRaw) {
    $q.notify({ type: 'warning', position: 'top', message: 'Nama berkas dan file wajib diisi!' })
    return
  }

  uploading.value = true
  $q.loading.show({ message: 'Mengunggah dokumen ke server Agra...' })

  try {
    const file = uploadForm.value.fileRaw
    const storagePath = `monitoring_arsip_digital/${Date.now()}_${file.name}`
    const fileRef = storageRef(storage, storagePath)

    await uploadBytes(fileRef, file)
    const downloadUrl = await getDownloadURL(fileRef)

    const payload = {
      nama: uploadForm.value.nama,
      deskripsi: uploadForm.value.deskripsi || 'Unggah Manual via Dashboard Arsip',
      folder: uploadForm.value.folder,
      url: downloadUrl,
      sumber: `Direct Upload: ${uploadForm.value.folder}`,
      pembuat: authStore.user?.nama || 'Admin',
      tipe: detectFileType(downloadUrl, file.name),
      createdAt: serverTimestamp(),
    }

    await addDoc(collection(db, 'monitoring_arsip_dokumen'), payload)

    showUploadDialog.value = false
    $q.notify({
      type: 'positive',
      position: 'top',
      message: 'Berkas berhasil diarsipkan!',
      caption: `Tersimpan aman di folder: ${uploadForm.value.folder}`,
    })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', position: 'top', message: 'Gagal mengarsipkan: ' + err.message })
  } finally {
    $q.loading.hide()
    uploading.value = false
  }
}

const deleteManualFile = (file) => {
  $q.dialog({
    title: 'Hapus Berkas?',
    message: `Hapus berkas <b>${file.nama}</b> dari arsip manual secara permanen?`,
    html: true,
    cancel: true,
    ok: { color: 'negative', label: 'Ya, Hapus', unelevated: true, rounded: true },
  }).onOk(async () => {
    $q.loading.show({ message: 'Menghapus berkas...' })
    try {
      await deleteDoc(doc(db, 'monitoring_arsip_dokumen', file.id))
      $q.notify({ type: 'positive', position: 'top', message: 'Berkas dihapus dari arsip manual.' })
    } catch (e) {
      $q.notify({ type: 'negative', position: 'top', message: 'Gagal menghapus: ' + e.message })
    } finally {
      $q.loading.hide()
    }
  })
}

const viewFile = (file) => {
  activeFile.value = file
  showPreviewDialog.value = true
}

// ============================================================================
// FIREBASE LISTENERS DATA DISPATCHING
// ============================================================================
const fetchData = () => {
  loading.value = true

  // 1. Listen ke Permintaan Barang (Modul Gudang)
  unsubPermintaan = onSnapshot(collection(db, 'permintaan_barang'), (snap) => {
    rawPermintaan.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 2. Listen ke Tagihan Supplier (AP)
  unsubTagihanSupplier = onSnapshot(collection(db, 'finance_tagihan'), (snap) => {
    rawTagihanSupplier.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 3. Listen ke Invoice Customer (AR)
  unsubTagihanCustomer = onSnapshot(collection(db, 'finance_invoice_customer'), (snap) => {
    rawTagihanCustomer.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 4. Listen ke Purchase Order
  unsubPurchaseOrder = onSnapshot(collection(db, 'purchase_order'), (snap) => {
    rawPurchaseOrder.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 5. Listen ke Penawaran
  unsubPenawaran = onSnapshot(collection(db, 'penawaran'), (snap) => {
    rawPenawaran.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 6. Listen ke Proyek
  unsubProyek = onSnapshot(collection(db, 'proyek'), (snap) => {
    rawProyek.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 7. Listen ke SPK Customer
  unsubSpkCustomer = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    rawSpkCustomer.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 8. Listen ke Supplier
  unsubSuppliers = onSnapshot(collection(db, 'suppliers'), (snap) => {
    rawSuppliers.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 9. Listen ke Unggahan Manual khusus Arsip Page
  unsubArsipManual = onSnapshot(collection(db, 'monitoring_arsip_dokumen'), (snap) => {
    rawArsipManual.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (unsubPermintaan) unsubPermintaan()
  if (unsubTagihanSupplier) unsubTagihanSupplier()
  if (unsubTagihanCustomer) unsubTagihanCustomer()
  if (unsubPurchaseOrder) unsubPurchaseOrder()
  if (unsubPenawaran) unsubPenawaran()
  if (unsubProyek) unsubProyek()
  if (unsubSpkCustomer) unsubSpkCustomer()
  if (unsubSuppliers) unsubSuppliers()
  if (unsubArsipManual) unsubArsipManual()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.uppercase {
  text-transform: uppercase;
}
.font-10 {
  font-size: 10px;
}
.tracking-widest {
  letter-spacing: 0.12em;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}
.border-top {
  border-top: 1px solid #f1f5f9;
}

/* ── Brand tokens ── */
.btn-teal-main {
  background: linear-gradient(135deg, #36ada3 0%, #1e6e69 100%) !important;
  color: #fff !important;
  box-shadow: 0 6px 20px rgba(54, 173, 163, 0.3) !important;
  transition: all 0.3s ease !important;
}
.btn-teal-main:hover {
  box-shadow: 0 10px 28px rgba(54, 173, 163, 0.45) !important;
  transform: translateY(-1.5px) !important;
}

/* ── Folder Card ── */
.folder-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.folder-card:hover {
  transform: translateY(-5px);
  border-color: #36ada3 !important;
  box-shadow: 0 15px 30px rgba(54, 173, 163, 0.15) !important;
}

/* ── File Card ── */
.file-card {
  transition: all 0.25s ease;
}
.file-card:hover {
  border-color: #36ada3;
}
.file-preview-thumbnail {
  height: 140px;
  width: 100%;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}
.image-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.file-preview-thumbnail:hover .image-thumbnail {
  transform: scale(1.06);
}

/* Line clamping */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Animations ── */
.animate-fade {
  animation: fadeIn 0.5s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.6s ease-out both;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.15);
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
</style>
