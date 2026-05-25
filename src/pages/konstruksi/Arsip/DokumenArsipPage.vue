<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro page-wrapper" @click.self="handlePageClick">
    <!-- FLOATING CONSTRUCTION ICONS CONTAINER (ANIMASI INDAH TEAL) -->
    <div class="floating-icons-container" aria-hidden="true">
      <span
        v-for="icon in floatingIcons"
        :key="icon.id"
        class="floating-icon"
        :style="icon.style"
        v-html="icon.svg"
      ></span>
    </div>

    <!-- CLICK EFFECT CONSTRUCTIONS ICONS -->
    <div class="click-icons-container" aria-hidden="true">
      <span
        v-for="ci in clickIcons"
        :key="ci.id"
        class="click-icon"
        :style="{
          left: ci.x + 'px',
          top: ci.y + 'px',
          '--tx': ci.tx + 'px',
          '--ty': ci.ty + 'px',
          width: ci.size + 'px',
          height: ci.size + 'px',
        }"
        v-html="ci.svg"
      ></span>
    </div>

    <!-- =====================================================================================
         HEADER UTAMA (TIDAK ADA TOMBOL KEMBALI)
         ===================================================================================== -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print content-relative">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
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
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
        <q-btn
          color="teal-10"
          icon="cloud_upload"
          label="Unggah Berkas Langsung"
          unelevated
          rounded
          no-caps
          class="q-px-lg q-py-sm shadow-premium btn-teal-main text-weight-bold"
          @click="openUploadDialog"
        />
      </div>
    </div>

    <!-- =====================================================================================
         BREADCRUMBS & NAVIGATION
         ===================================================================================== -->
    <div class="row items-center q-mb-lg no-print content-relative" v-if="activeFolder">
      <q-btn
        flat
        round
        dense
        color="teal-10"
        icon="arrow_back"
        class="bg-white shadow-1 q-mr-md hover-teal-btn"
        @click="activeFolder = null"
      />
      <div class="text-subtitle1 text-weight-bold text-blue-grey-9 flex items-center no-wrap">
        <span class="cursor-pointer text-teal-10" @click="activeFolder = null">Arsip Utama</span>
        <q-icon name="chevron_right" class="q-mx-xs" color="grey-6" />
        <span class="text-grey-7 uppercase">{{ activeFolder }}</span>
      </div>
    </div>

    <!-- =====================================================================================
         FOLDER GRID VIEW (KETIKA BELUM MEMILIH FOLDER)
         ===================================================================================== -->
    <div v-if="!activeFolder" class="row q-col-gutter-lg q-mb-xl animate-fade content-relative">
      <div v-for="folder in folders" :key="folder.name" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card
          flat
          bordered
          class="folder-card rounded-20 bg-white transition-all cursor-pointer shadow-sm"
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
            <div class="text-subtitle1 text-weight-bold text-blue-grey-9 line-clamp-1">
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
    <div v-else class="animate-fade content-relative">
      <!-- PANEL CARI & FILTER INTERNAL FOLDER -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-teal-thin">
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
                color="teal-10"
              >
                <template v-slot:prepend><q-icon name="search" color="teal-10" /></template>
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
        <div v-for="file in filteredFiles" :key="file.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card
            flat
            bordered
            class="file-card rounded-20 bg-white shadow-xs overflow-hidden transition-all hover-shadow"
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
                  <q-icon name="dataset" class="q-mr-xs text-teal-8" />
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
                color="teal-10"
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
                color="indigo-8"
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
        class="text-center q-pa-xl bg-white rounded-20 border-teal-thin q-mt-lg text-grey-5 animate-fade"
      >
        <q-icon name="folder_open" size="80px" class="q-mb-md opacity-50" color="teal-3" />
        <div class="text-h6 text-weight-bold text-teal-10">Folder Kosong</div>
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
        class="rounded-20 shadow-24 font-pro border-teal-thin"
      >
        <q-card-section class="row items-center q-pb-none q-pt-lg q-px-lg">
          <div class="row items-center">
            <q-avatar
              color="teal-1"
              text-color="teal-10"
              icon="cloud_upload"
              size="md"
              class="q-mr-md"
            />
            <div>
              <div class="text-h6 text-weight-bold text-blue-grey-10">Unggah Berkas Baru</div>
              <div class="text-caption text-grey-6">Simpan berkas pelengkap langsung ke server</div>
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
              color="teal-10"
            />
          </div>

          <div>
            <div class="label-req q-mb-xs">NAMA / JUDUL BERKAS *</div>
            <q-input
              outlined
              dense
              v-model="uploadForm.nama"
              placeholder="Contoh: Dokumen Legalitas Tanah Proyek A"
              color="teal-10"
            />
          </div>

          <div>
            <div class="label-req q-mb-xs">REFERENSI / KETERANGAN *</div>
            <q-input
              outlined
              dense
              v-model="uploadForm.deskripsi"
              placeholder="Contoh: Berkas pembebasan lahan"
              color="teal-10"
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
              color="teal-10"
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
            color="teal-10"
            label="UNGGAH DOKUMEN"
            class="rounded-12 text-weight-bold q-px-lg shadow-4 btn-teal-main"
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
      <q-card class="column no-wrap bg-grey-10">
        <q-toolbar class="bg-grey-9 text-white q-py-sm shrink">
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
              <q-icon name="description" size="80px" color="teal-4" class="q-mb-md" />
              <div class="text-h6">Format Dokumen Tidak Didukung untuk Preview Langsung</div>
              <div class="text-subtitle2 q-mt-xs opacity-75">
                Silakan unduh dokumen untuk membukanya secara lokal.
              </div>
              <q-btn
                unelevated
                color="teal-10"
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
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  // eslint-disable-next-line no-unused-vars
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  // eslint-disable-next-line no-unused-vars
  query,
  // eslint-disable-next-line no-unused-vars
  where,
  serverTimestamp,
} from 'firebase/firestore'
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
const rawKaryawan = ref([])
const rawTagihanSupplier = ref([])
const rawTagihanCustomer = ref([])
const rawArsipManual = ref([])

let unsubPermintaan = null
let unsubKaryawan = null
let unsubTagihanSupplier = null
let unsubTagihanCustomer = null
let unsubArsipManual = null

// ============================================================================
// VECTOR ICONS (CONSTRUCTION THEMED - TEAL & ORANGE)
// ============================================================================
const getConstructionSvg = (index) => {
  const svgs = [
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><path d="M25,45 C25,25 75,25 75,45 Z" fill="#009688" /><rect x="18" y="42" width="64" height="6" rx="3" fill="#f59e0b" /><path d="M47,20 L53,20 L53,32 L47,32 Z" fill="#f59e0b" /><circle cx="50" cy="58" r="15" fill="#e0f2f1" /><circle cx="76" cy="65" r="9" fill="none" stroke="#ff781e" stroke-width="2.5" stroke-dasharray="3,1.5" /><path d="M28,82 C28,70 72,70 72,82 L72,92 L28,92 Z" fill="#00796b" /></svg>`,
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><circle cx="50" cy="15" r="7" fill="#ff781e" /><line x1="50" y1="15" x2="32" y2="86" stroke="#ff781e" stroke-width="5.5" stroke-linecap="round" /><line x1="50" y1="15" x2="68" y2="86" stroke="#ff781e" stroke-width="5.5" stroke-linecap="round" /><line x1="38" y1="52" x2="62" y2="52" stroke="#009688" stroke-width="4.5" stroke-linecap="round" /></svg>`,
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><rect x="25" y="12" width="50" height="78" rx="6" fill="#0d9488" /><rect x="34" y="22" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="55" y="22" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="34" y="42" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="55" y="42" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="34" y="62" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="55" y="62" width="11" height="11" rx="2" fill="#e0f2f1" /></svg>`,
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><rect x="18" y="74" width="54" height="13" rx="4" fill="#ff781e" /><circle cx="26" cy="80.5" r="5.5" fill="#1e293b" /><circle cx="45" cy="80.5" r="5.5" fill="#1e293b" /><circle cx="64" cy="80.5" r="5.5" fill="#1e293b" /><path d="M23,48 L46,48 L54,74 L23,74 Z" fill="#009688" /><line x1="46" y1="56" x2="78" y2="26" stroke="#ff781e" stroke-width="6" stroke-linecap="round" /><line x1="78" y1="26" x2="88" y2="52" stroke="#ff781e" stroke-width="4.5" stroke-linecap="round" /><path d="M82,48 L92,48 L87,62 L77,58 Z" fill="#00796b" /></svg>`,
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><g transform="rotate(45, 50, 50)"><rect x="44" y="12" width="12" height="76" rx="4" fill="#009688" /><circle cx="50" cy="15" r="13" fill="#009688" /><polygon points="50,15 41,4 59,4 50,15" fill="#e0f2f1" /><circle cx="50" cy="85" r="9" fill="#00796b" /></g><g transform="rotate(-45, 50, 50)"><rect x="45" y="18" width="10" height="68" rx="2.5" fill="#ff781e" /><rect x="28" y="10" width="44" height="16" rx="3.5" fill="#78350f" /><path d="M66,13 C73,13 77,23 77,23 L66,23 Z" fill="#78350f" /></g></svg>`,
  ]
  return svgs[index % svgs.length]
}

const floatingIcons = ref([])
let iconIdCounter = 0

function spawnFloatingIcon() {
  const id = iconIdCounter++
  const left = Math.random() * 95 + '%'
  const duration = (5 + Math.random() * 6).toFixed(2) + 's'
  const delay = (Math.random() * 3).toFixed(2) + 's'
  const size = (24 + Math.random() * 22).toFixed(0)
  const svgContent = getConstructionSvg(id)

  floatingIcons.value.push({
    id,
    svg: svgContent,
    style: {
      left,
      width: size + 'px',
      height: size + 'px',
      animationDuration: duration,
      animationDelay: delay,
    },
  })
  setTimeout(
    () => {
      floatingIcons.value = floatingIcons.value.filter((i) => i.id !== id)
    },
    (parseFloat(duration) + parseFloat(delay) + 0.5) * 1000,
  )
}

let floatingIconInterval = null

const clickIcons = ref([])

function handlePageClick(e) {
  const count = 4 + Math.floor(Math.random() * 4)
  for (let i = 0; i < count; i++) {
    const id = iconIdCounter++
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = -(60 + Math.random() * 80)
    const size = 26 + Math.floor(Math.random() * 18)
    const svgContent = getConstructionSvg(id)

    const icon = {
      id,
      svg: svgContent,
      x: e.clientX - size / 2,
      y: e.clientY - size / 2,
      tx: offsetX,
      ty: offsetY,
      size,
    }
    clickIcons.value.push(icon)
    setTimeout(() => {
      clickIcons.value = clickIcons.value.filter((i) => i.id !== id)
    }, 1000)
  }
}

// ============================================================================
// DAFTAR VIRTUAL FOLDERS
// ============================================================================
const folders = [
  { name: 'Gudang & Logistik', icon: 'warehouse', bgColor: 'teal-1', textColor: 'teal-10' },
  { name: 'Kepegawaian / Karyawan', icon: 'groups', bgColor: 'blue-1', textColor: 'blue-8' },
  { name: 'Finance & Invoice', icon: 'payments', bgColor: 'green-1', textColor: 'green-9' },
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
      return { label: 'IMAGE', color: 'teal-10', icon: 'image' }
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

  // 2. SINKRONISASI BERKAS DARI MODUL KEPEGAWAIAN / KARYAWAN
  rawKaryawan.value.forEach((k) => {
    // Cek berbagai kemungkinan nama field dokumen
    const docsArr = k.docs || k.dokumen || k.lampiran || k.files || []
    if (Array.isArray(docsArr)) {
      docsArr.forEach((docItem, idx) => {
        const url =
          docItem?.url || docItem?.fileUrl || (typeof docItem === 'string' ? docItem : null)
        if (url) {
          list.push({
            id: `karyawan-legal-${k.id}-${idx}`,
            nama: docItem?.name || docItem?.nama || docItem?.label || `Arsip Legalitas - ${k.nama}`,
            url,
            folder: 'Kepegawaian / Karyawan',
            sumber: `NIK: ${k.nik || '-'} (${k.nama || '-'})`,
            tanggal: k.updatedAt || k.createdAt || null,
            tipe: detectFileType(url, docItem?.name || docItem?.nama),
            pembuat: k.nama || 'HRD',
            isManualUpload: false,
          })
        }
      })
    }

    // Foto Biometrik / Foto Registrasi Karyawan
    const fotoUrl = k.foto_registrasi || k.foto || k.photo || k.fotoUrl || null
    if (fotoUrl) {
      list.push({
        id: `karyawan-bio-${k.id}`,
        nama: `Biometrik Absensi Resmi - ${k.nama || '-'}`,
        url: fotoUrl,
        folder: 'Kepegawaian / Karyawan',
        sumber: `Master Face Database NIK: ${k.nik || '-'}`,
        tanggal: k.createdAt || k.updatedAt || null,
        tipe: 'image',
        pembuat: 'System AI Registrasi',
        isManualUpload: false,
      })
    }
  })

  // 3. SINKRONISASI BERKAS FINANCE & INVOICE (Tagihan Supplier & AP)
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

  // 4. BERKAS YANG DIUNGGAH MANUAL LANGSUNG DARI HALAMAN ARSIP INI
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

  // 2. Listen ke Database Karyawan (Modul HRD)
  unsubKaryawan = onSnapshot(collection(db, 'karyawan'), (snap) => {
    rawKaryawan.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 3. Listen ke Tagihan Supplier (AP)
  unsubTagihanSupplier = onSnapshot(collection(db, 'finance_tagihan'), (snap) => {
    rawTagihanSupplier.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 4. Listen ke Invoice Customer (AR)
  unsubTagihanCustomer = onSnapshot(collection(db, 'finance_invoice_customer'), (snap) => {
    rawTagihanCustomer.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 5. Listen ke Unggahan Manual khusus Arsip Page
  unsubArsipManual = onSnapshot(collection(db, 'monitoring_arsip_dokumen'), (snap) => {
    rawArsipManual.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
}

onMounted(() => {
  fetchData()
  floatingIconInterval = setInterval(spawnFloatingIcon, 1500)
  spawnFloatingIcon()
})

onUnmounted(() => {
  if (unsubPermintaan) unsubPermintaan()
  if (unsubKaryawan) unsubKaryawan()
  if (unsubTagihanSupplier) unsubTagihanSupplier()
  if (unsubTagihanCustomer) unsubTagihanCustomer()
  if (unsubArsipManual) unsubArsipManual()
  if (floatingIconInterval) clearInterval(floatingIconInterval)
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
.border-teal-thin {
  border: 1px solid rgba(0, 150, 136, 0.18) !important;
}
.border-top {
  border-top: 1px solid #f1f5f9;
}
.border-dashed-teal {
  border: 2px dashed #009688;
}

/* ── Teal tokens ── */
.text-teal-10 {
  color: #009688 !important;
}
.bg-teal-10 {
  background-color: #009688 !important;
}
.bg-teal-1 {
  background-color: #e0f2f1 !important;
}
.bg-teal-50 {
  background-color: #f2faf9 !important;
}
.btn-teal-main {
  background: linear-gradient(135deg, #009688 0%, #00acc1 100%) !important;
  color: #fff !important;
  box-shadow: 0 6px 20px rgba(0, 150, 136, 0.3) !important;
  transition: all 0.3s ease !important;
}
.btn-teal-main:hover {
  box-shadow: 0 10px 28px rgba(0, 150, 136, 0.45) !important;
  transform: translateY(-1.5px) !important;
}
.hover-teal-btn:hover {
  background-color: #e0f2f1 !important;
  color: #009688 !important;
}

/* ── Folder Card ── */
.folder-card {
  border: 1.5px solid rgba(0, 150, 136, 0.12);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.folder-card:hover {
  transform: translateY(-5px);
  border-color: #009688 !important;
  box-shadow: 0 15px 30px rgba(0, 150, 136, 0.15) !important;
}

/* ── File Card ── */
.file-card {
  transition: all 0.25s ease;
  border: 1px solid #e2e8f0;
}
.file-card:hover {
  border-color: #009688;
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

/* =======================================================================
   INTERACTIVE FLOATING & CLICK HIGH-FIDELITY VECTOR ICONS
   ======================================================================= */
.page-wrapper {
  position: relative;
  overflow: hidden;
}

.floating-icons-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.floating-icon {
  position: absolute;
  bottom: -60px;
  opacity: 0;
  animation: floatUpAnimation linear forwards;
  will-change: transform, opacity;
  user-select: none;
}

@keyframes floatUpAnimation {
  0% {
    transform: translateY(0) rotate(-15deg) scale(0.65);
    opacity: 0;
  }
  15% {
    opacity: 0.7;
  }
  70% {
    opacity: 0.45;
  }
  90% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-112vh) rotate(20deg) scale(1.15);
    opacity: 0;
  }
}

.click-icons-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: visible;
}

.click-icon {
  position: fixed;
  opacity: 1;
  animation: clickIconAnimation 0.9s ease-out forwards;
  will-change: transform, opacity;
  user-select: none;
}

@keyframes clickIconAnimation {
  0% {
    transform: translate(0, 0) scale(1.1);
    opacity: 1;
  }
  45% {
    transform: translate(var(--tx), var(--ty)) scale(1.35);
    opacity: 0.85;
  }
  100% {
    transform: translate(var(--tx), calc(var(--ty) - 35px)) scale(0.35);
    opacity: 0;
  }
}

.content-relative {
  position: relative;
  z-index: 1;
}

.shadow-premium {
  box-shadow: 0 4px 15px rgba(0, 150, 136, 0.2);
}
</style>
