<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-lg-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8 text-center text-md-left">
        <div
          class="text-h4 text-md-h3 text-weight-bolder text-indigo-10 leading-tight"
          style="letter-spacing: -1px"
        >
          Analisa Harga Satuan (AHSP)
          <span
            class="text-subtitle1 text-md-h5 text-weight-medium text-grey-6 block q-mt-sm"
            style="letter-spacing: normal"
          >
            Manajemen Uraian & Detail Pekerjaan
          </span>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none flex flex-center">
        <q-btn
          color="indigo-10"
          icon="add_circle"
          label="Buat Uraian Pekerjaan"
          unelevated
          rounded
          no-caps
          class="q-px-md q-px-md-lg q-py-sm shadow-premium btn-hover text-weight-bold full-width-xs"
          @click="openMasterDialog(null)"
        />
      </div>
    </div>

    <!-- DAFTAR URAIAN UTAMA (PROFESSIONAL CLEAN LIST - RESPONSIVE) -->
    <div class="column q-gutter-y-md animate-fade-up no-print">
      <div v-for="item in rows" :key="item.id" class="col-12">
        <q-card
          flat
          bordered
          class="list-card bg-white cursor-pointer transition-all"
          @click="openDetailDialog(item)"
        >
          <q-card-section class="row items-center q-px-md q-px-sm-lg q-py-md">
            <!-- Area Kiri: Avatar & Judul -->
            <div class="col-12 col-sm-6 col-md-7 row items-center no-wrap q-mb-md q-mb-sm-none">
              <q-avatar
                color="indigo-1"
                text-color="indigo-10"
                icon="folder"
                size="48px"
                class="q-mr-md rounded-12 shadow-sm shrink"
              />
              <div class="col">
                <div
                  class="text-subtitle1 text-sm-h6 text-weight-bolder text-indigo-10 leading-none"
                  style="letter-spacing: -0.5px"
                >
                  {{ item.nama_uraian }}
                </div>
                <div class="text-caption text-grey-6 text-weight-medium q-mt-xs">
                  {{ item.details?.length || 0 }} Baris tercatat
                </div>
              </div>
            </div>

            <!-- Area Kanan: Harga & Aksi -->
            <div
              class="col-12 col-sm-6 col-md-5 row items-center justify-between justify-sm-end no-wrap"
            >
              <div class="col text-left text-sm-right q-mr-sm-lg">
                <div
                  class="text-caption text-grey-5 text-weight-bold tracking-widest uppercase font-10 q-mb-xs"
                >
                  Harga Satuan
                </div>
                <div
                  class="text-subtitle1 text-sm-h6 text-weight-black text-primary leading-none"
                  style="letter-spacing: -0.5px"
                >
                  Rp
                  {{
                    hitungTotalUraian(item).toLocaleString('id-ID', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })
                  }}
                  <span v-if="item.satuan" class="text-subtitle2 text-grey-6 text-weight-medium">
                    / {{ item.satuan }}</span
                  >
                </div>
              </div>

              <!-- Tombol Aksi Lengkap -->
              <div class="row q-gutter-xs shrink">
                <q-btn
                  flat
                  round
                  color="indigo-10"
                  icon="visibility"
                  size="sm"
                  class="hover-blue-btn bg-indigo-1"
                  @click.stop="openPreview(item)"
                >
                  <q-tooltip class="bg-indigo">Preview Dokumen</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="blue-8"
                  icon="edit"
                  size="sm"
                  class="hover-blue-btn bg-blue-1"
                  @click.stop="openMasterDialog(item)"
                >
                  <q-tooltip class="bg-blue">Edit Informasi</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="red-7"
                  icon="delete"
                  size="sm"
                  class="hover-red-btn bg-red-1"
                  @click.stop="confirmHapus(item)"
                >
                  <q-tooltip class="bg-red">Hapus Uraian</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-if="rows.length === 0 && !loading" class="col-12 text-center q-pa-xl text-grey-5">
        <q-icon name="folder_off" size="80px" class="q-mb-md opacity-50" />
        <div class="text-h6 text-weight-medium">Belum ada uraian pekerjaan.</div>
        <div class="text-body2 q-mt-sm">Klik "Buat Uraian Pekerjaan" untuk memulai.</div>
      </div>
    </div>

    <!-- DIALOG 1: BUAT / EDIT URAIAN MASTER -->
    <q-dialog v-model="showMasterDialog">
      <q-card style="width: 500px; max-width: 95vw" class="rounded-20 shadow-24">
        <q-card-section class="bg-indigo-10 text-white q-py-md row items-center">
          <div class="text-subtitle1 text-sm-h6 text-weight-bold uppercase font-10 tracking-widest">
            {{ isEditMaster ? 'Edit Uraian Pekerjaan' : 'Buat Uraian Baru' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="scroll q-pa-md q-pa-sm-lg">
          <div class="text-subtitle2 text-weight-black text-indigo-10 q-mb-md flex items-center">
            <q-icon name="info" class="q-mr-sm" size="sm" /> INFORMASI DASAR
          </div>
          <div class="row q-col-gutter-md q-mb-sm">
            <div class="col-12">
              <div
                class="text-caption text-weight-bold text-grey-7 q-mb-xs uppercase tracking-widest font-10"
              >
                Nama Uraian Utama *
              </div>
              <q-input
                v-model="masterForm.nama_uraian"
                outlined
                dense
                placeholder="Contoh: Pekerjaan Tanah / Struktur"
                autofocus
                class="text-weight-bold"
              />
            </div>
            <div class="col-12 col-sm-6">
              <div
                class="text-caption text-weight-bold text-grey-7 q-mb-xs uppercase tracking-widest font-10"
              >
                Nomor / Kode Dokumen
              </div>
              <q-input
                v-model="masterForm.kode"
                outlined
                dense
                placeholder="A.2.2.1"
                class="text-weight-medium"
              />
            </div>
            <div class="col-12 col-sm-6">
              <div
                class="text-caption text-weight-bold text-grey-7 q-mb-xs uppercase tracking-widest font-10"
              >
                Satuan Pekerjaan
              </div>
              <q-input
                v-model="masterForm.satuan"
                outlined
                dense
                placeholder="m2, ls, unit..."
                class="text-weight-medium"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions
          align="right"
          class="q-px-md q-px-sm-lg q-pb-md q-pb-sm-lg bg-grey-1 border-top-subtle"
        >
          <q-btn flat label="Batal" v-close-popup color="grey-7" no-caps class="text-weight-bold" />
          <q-btn
            unelevated
            label="Simpan Uraian"
            color="indigo-10"
            rounded
            class="q-px-md q-px-sm-xl text-weight-bold shadow-3"
            @click="saveMaster"
            :loading="submitting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG 2: DETAIL DINAMIS SUB-URAIAN -->
    <q-dialog
      v-model="showDetailDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column bg-grey-2">
        <q-toolbar class="bg-white text-indigo-10 q-py-sm q-py-md-md shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title
            class="text-weight-bold uppercase tracking-widest font-10 text-subtitle2 text-sm-subtitle1"
          >
            <span class="gt-xs">Detail Uraian: </span>{{ selectedItem?.nama_uraian }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            :label="$q.screen.gt.xs ? 'Simpan Analisa' : 'Simpan'"
            @click="saveDetailChanges"
            rounded
            class="q-px-md q-px-sm-xl text-weight-bold shadow-3"
            :loading="submitting"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-sm q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <q-card flat bordered class="rounded-16 bg-white overflow-hidden shadow-1">
                <q-card-section class="bg-indigo-1 row items-center q-pa-md q-pa-sm-lg">
                  <div
                    class="col-12 col-md-auto text-weight-black text-indigo-10 text-subtitle1 text-sm-h6 uppercase tracking-widest q-mb-md q-mb-md-none"
                  >
                    {{ selectedItem?.nama_uraian }}
                    <span v-if="selectedItem?.satuan" class="text-grey-6 text-subtitle2"
                      >/ {{ selectedItem.satuan }}</span
                    >
                  </div>
                  <q-space class="gt-sm" />
                  <div class="col-12 col-md-auto row q-gutter-sm">
                    <q-btn
                      color="indigo-10"
                      icon="title"
                      :label="$q.screen.gt.xs ? 'Tambah Judul Kategori' : 'Judul'"
                      @click="addTitleRow"
                      no-caps
                      outline
                      rounded
                      class="col col-sm-auto bg-white text-weight-bold"
                    />
                    <q-btn
                      color="primary"
                      icon="add"
                      :label="$q.screen.gt.xs ? 'Tambah Sub-Uraian' : 'Sub-Uraian'"
                      @click="addSubRow"
                      no-caps
                      outline
                      rounded
                      class="col col-sm-auto bg-white text-weight-bold"
                    />
                  </div>
                </q-card-section>

                <q-markup-table flat separator="cell" class="ahsp-table" wrap-cells="false">
                  <thead>
                    <tr class="bg-blue-grey-10 text-white">
                      <th style="min-width: 50px" class="text-center">NO</th>
                      <th style="min-width: 250px" class="text-left">URAIAN PEKERJAAN</th>
                      <th style="min-width: 100px" class="text-center">KODE</th>
                      <th style="min-width: 100px" class="text-center">SATUAN</th>
                      <th style="min-width: 100px" class="text-center">KOEFISIEN</th>
                      <th style="min-width: 150px" class="text-right">HARGA SATUAN</th>
                      <th style="min-width: 160px" class="text-right">JUMLAH HARGA</th>
                      <th style="min-width: 50px"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(sub, idx) in detailList" :key="idx">
                      <tr :class="sub.isTitle ? 'bg-indigo-50 border-title' : 'hover-row'">
                        <template v-if="sub.isTitle">
                          <td class="text-center text-weight-black text-subtitle1 text-indigo-10">
                            {{ getTitleIndex(idx) }}
                          </td>
                          <td colspan="6">
                            <q-input
                              v-model="sub.uraian"
                              dense
                              borderless
                              class="text-weight-black text-subtitle2 text-sm-subtitle1 text-indigo-10 uppercase"
                              placeholder="Ketik Judul Kategori (misal: Tenaga Kerja)..."
                            />
                          </td>
                          <td class="text-center">
                            <q-btn
                              flat
                              round
                              color="negative"
                              icon="delete"
                              size="xs"
                              @click="removeSubRow(idx)"
                            />
                          </td>
                        </template>
                        <template v-else>
                          <td class="text-center text-weight-bold text-grey-7">
                            {{ getSubIndex(idx) }}
                          </td>
                          <td>
                            <q-input
                              v-model="sub.uraian"
                              dense
                              borderless
                              placeholder="Nama pekerjaan..."
                              class="text-weight-medium"
                            />
                          </td>
                          <td>
                            <q-input
                              v-model="sub.kode"
                              dense
                              borderless
                              input-class="text-center text-grey-8 uppercase"
                              placeholder="-"
                            />
                          </td>
                          <td>
                            <q-input
                              v-model="sub.satuan"
                              dense
                              borderless
                              input-class="text-center text-weight-bold uppercase text-primary"
                              placeholder="m2/OH/.."
                            />
                          </td>
                          <td>
                            <q-input
                              v-model.number="sub.koef"
                              type="number"
                              dense
                              borderless
                              input-class="text-center text-weight-bold"
                            />
                          </td>
                          <td>
                            <q-input
                              v-model.number="sub.harga"
                              type="number"
                              dense
                              borderless
                              input-class="text-right"
                              prefix="Rp"
                            />
                          </td>
                          <td class="text-right text-weight-bold text-indigo-10 bg-indigo-0">
                            Rp
                            {{
                              ((sub.koef || 0) * (sub.harga || 0)).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            }}
                          </td>
                          <td class="text-center">
                            <q-btn
                              flat
                              round
                              color="grey-5"
                              icon="close"
                              size="xs"
                              @click="removeSubRow(idx)"
                              class="hover-red-btn"
                            />
                          </td>
                        </template>
                      </tr>
                      <tr
                        v-if="
                          !sub.isTitle &&
                          (idx === detailList.length - 1 || detailList[idx + 1].isTitle)
                        "
                        class="bg-grey-1"
                      >
                        <td colspan="6" class="text-right text-weight-bold text-blue-grey-9">
                          Jumlah {{ getGroupName(idx) }} ({{ getTitleIndexForSubtotal(idx) }}) Rp.
                        </td>
                        <td class="text-right text-weight-black text-indigo-10">
                          Rp
                          {{
                            getGroupSubtotal(idx).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }}
                        </td>
                        <td></td>
                      </tr>
                    </template>
                    <tr v-if="detailList.length === 0">
                      <td colspan="8" class="text-center q-pa-xl text-grey-5 italic">
                        <q-icon name="post_add" size="48px" class="q-mb-sm opacity-50" /><br />Belum
                        ada rincian data.
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="detailList.length > 0">
                    <tr class="bg-indigo-10 text-white">
                      <td
                        colspan="6"
                        class="text-right text-weight-bolder text-uppercase tracking-widest text-caption text-sm-subtitle2"
                      >
                        TOTAL HARGA SATUAN PEKERJAAN
                      </td>
                      <td class="text-right text-weight-black text-subtitle1 text-sm-h5">
                        Rp
                        {{
                          totalCurrentDetail.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </q-markup-table>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- DIALOG 3: PREVIEW DOKUMEN CETAK (MENGIKUTI REFERENSI GAMBAR PERTAMA) -->
    <q-dialog v-model="showPreviewDialog" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-indigo-10 q-py-md no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold">PREVIEW DOKUMEN AHSP</q-toolbar-title>
          <q-btn-group unelevated rounded class="shadow-2">
            <q-btn color="primary" icon="print" label="Cetak" @click="printPage" class="q-px-md" />
            <q-btn color="red-9" icon="picture_as_pdf" label="Export PDF" @click="exportToPDF" />
          </q-btn-group>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center">
          <!-- WADAH DOKUMEN AHSP (STYLE EXCEL) -->
          <div id="ahsp-print-area" class="ahsp-excel-paper shadow-24" v-if="previewItem">
            <div class="text-center text-h5 text-weight-bold q-mt-md q-mb-xl tracking-widest">
              ANALISA HARGA SATUAN PEKERJAAN
            </div>

            <!-- Sub Header -->
            <div class="row q-mb-lg text-weight-bold" style="font-size: 14px">
              <div class="col-2 q-pl-sm">AHSP {{ previewItem.kode }}</div>
              <div class="col-10 uppercase">
                HARGA SATUAN PEKERJAAN {{ previewItem.nama_uraian }}
              </div>
            </div>

            <!-- Tabel Info -->
            <table
              class="excel-info-table full-width text-weight-bold q-mb-md"
              style="font-size: 13px"
            >
              <tr>
                <td width="100" class="q-pl-sm">Analisa</td>
                <td width="20" class="text-center">:</td>
                <td>{{ previewItem.kode ? 'AHSP ' + previewItem.kode : '-' }}</td>
              </tr>
              <tr>
                <td class="q-pl-sm">Item</td>
                <td class="text-center">:</td>
                <td class="uppercase">{{ previewItem.nama_uraian }}</td>
              </tr>
              <tr>
                <td class="q-pl-sm">Satuan</td>
                <td class="text-center">:</td>
                <td>{{ previewItem.satuan }}</td>
              </tr>
            </table>

            <!-- Tabel Data Utama -->
            <table class="excel-data-table full-width">
              <thead>
                <tr>
                  <th width="60" class="text-center">No.</th>
                  <th class="text-center">Uraian</th>
                  <th width="80" class="text-center">Kode</th>
                  <th width="80" class="text-center">Satuan</th>
                  <th width="100" class="text-center">Koefisien</th>
                  <th width="140" class="text-center">Harga Satuan<br />(Rp.)</th>
                  <th width="140" class="text-center">Jumlah Harga<br />(Rp.)</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(sub, idx) in previewItem.details" :key="idx">
                  <!-- JIKA BARIS ADALAH JUDUL KATEGORI -->
                  <tr v-if="sub.isTitle" class="text-weight-bold">
                    <td class="text-center">{{ getTitleIndex(idx, previewItem.details) }}</td>
                    <td colspan="6" class="uppercase">{{ sub.uraian }}</td>
                  </tr>

                  <!-- JIKA BARIS ADALAH ITEM -->
                  <tr v-else>
                    <td class="text-center"></td>
                    <td class="q-pl-md">{{ sub.uraian }}</td>
                    <td class="text-center">{{ sub.kode || '-' }}</td>
                    <td class="text-center">{{ sub.satuan || '-' }}</td>
                    <td class="text-right">
                      {{
                        (sub.koef || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 3,
                          maximumFractionDigits: 3,
                        })
                      }}
                    </td>
                    <td>
                      <div class="row justify-between no-wrap">
                        <span class="q-pl-xs">Rp.</span>
                        <span class="text-right">{{
                          (sub.harga || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="row justify-between no-wrap">
                        <span class="q-pl-xs">Rp.</span>
                        <span class="text-right">{{
                          ((sub.koef || 0) * (sub.harga || 0)).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        }}</span>
                      </div>
                    </td>
                  </tr>

                  <!-- SUBTOTAL ROW -->
                  <tr
                    v-if="
                      !sub.isTitle &&
                      (idx === previewItem.details.length - 1 ||
                        previewItem.details[idx + 1].isTitle)
                    "
                    class="text-weight-bold"
                  >
                    <td colspan="5"></td>
                    <td class="text-right q-pr-sm">
                      Jumlah {{ getGroupName(idx, previewItem.details) }} ({{
                        getTitleIndexForSubtotal(idx, previewItem.details)
                      }}) Rp.
                    </td>
                    <td>
                      <div class="row justify-between no-wrap">
                        <span class="q-pl-xs">Rp.</span>
                        <span class="text-right">{{
                          getGroupSubtotal(idx, previewItem.details).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        }}</span>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)

const showMasterDialog = ref(false)
const showDetailDialog = ref(false)
const showPreviewDialog = ref(false)

const isEditMaster = ref(false)

const masterFormDefault = {
  id: null,
  nama_uraian: '',
  satuan: '',
  kode: '',
}

const masterForm = ref({ ...masterFormDefault })
const selectedItem = ref(null)
const detailList = ref([])
const previewItem = ref(null)

const fetchData = () => {
  onSnapshot(query(collection(db, 'master_ahsp_v2'), orderBy('createdAt', 'desc')), (snap) => {
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
}

// --- LOGIC MASTER (BUAT/EDIT) ---
const openMasterDialog = (item) => {
  if (item) {
    isEditMaster.value = true
    masterForm.value = { ...masterFormDefault, ...item }
  } else {
    isEditMaster.value = false
    masterForm.value = { ...masterFormDefault }
  }
  showMasterDialog.value = true
}

const saveMaster = async () => {
  if (!masterForm.value.nama_uraian) {
    $q.notify({ type: 'warning', message: 'Nama Uraian Utama wajib diisi!', position: 'top' })
    return
  }
  submitting.value = true
  try {
    const payload = {
      nama_uraian: masterForm.value.nama_uraian,
      satuan: masterForm.value.satuan || '',
      kode: masterForm.value.kode || '',
      updatedAt: serverTimestamp(),
    }

    if (isEditMaster.value && masterForm.value.id) {
      await updateDoc(doc(db, 'master_ahsp_v2', masterForm.value.id), payload)
      $q.notify({ type: 'positive', message: 'Data Uraian berhasil diperbarui!', position: 'top' })
    } else {
      payload.details = []
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'master_ahsp_v2'), payload)
      $q.notify({ type: 'positive', message: 'Uraian baru berhasil dibuat!', position: 'top' })
    }
    showMasterDialog.value = false
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan: ' + e.message })
  } finally {
    submitting.value = false
  }
}

// --- LOGIC DETAIL ---
const openDetailDialog = (item) => {
  selectedItem.value = item
  detailList.value = item.details ? JSON.parse(JSON.stringify(item.details)) : []
  showDetailDialog.value = true
}

const addTitleRow = () => {
  detailList.value.push({ isTitle: true, uraian: '', kode: '', satuan: '', koef: 0, harga: 0 })
}

const addSubRow = () => {
  detailList.value.push({ isTitle: false, uraian: '', kode: '', satuan: '', koef: 0, harga: 0 })
}

const removeSubRow = (idx) => {
  detailList.value.splice(idx, 1)
}

const saveDetailChanges = async () => {
  submitting.value = true
  try {
    await updateDoc(doc(db, 'master_ahsp_v2', selectedItem.value.id), {
      details: detailList.value,
      updatedAt: serverTimestamp(),
    })
    showDetailDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Rincian Analisa berhasil diperbarui!',
      position: 'top',
    })
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

// --- PREVIEW LOGIC (Excel Style) ---
const openPreview = (item) => {
  previewItem.value = item
  showPreviewDialog.value = true
}

const printPage = () => window.print()

const exportToPDF = () => {
  const element = document.getElementById('ahsp-print-area')
  const opt = {
    margin: 0,
    filename: `AHSP_${previewItem.value.kode || previewItem.value.nama_uraian}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Membuat dokumen PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

// --- SMART CALCULATIONS ---
const totalCurrentDetail = computed(() => {
  return detailList.value.reduce((sum, item) => {
    if (item.isTitle) return sum
    return sum + (item.koef || 0) * (item.harga || 0)
  }, 0)
})

const hitungTotalUraian = (item) => {
  if (!item.details) return 0
  return item.details.reduce((sum, sub) => {
    if (sub.isTitle) return sum
    return sum + (sub.koef || 0) * (sub.harga || 0)
  }, 0)
}

const getTitleIndex = (idx, list = detailList.value) => {
  let count = 0
  for (let i = 0; i <= idx; i++) {
    if (list[i].isTitle) count++
  }
  return String.fromCharCode(64 + count) // 65 = 'A'
}

const getTitleIndexForSubtotal = (idx, list = detailList.value) => {
  let count = 0
  for (let i = 0; i <= idx; i++) {
    if (list[i].isTitle) count++
  }
  return String.fromCharCode(64 + count) // 65 = 'A'
}

const getSubIndex = (idx, list = detailList.value) => {
  let count = 0
  for (let i = idx; i >= 0; i--) {
    if (list[i].isTitle) break
    count++
  }
  return count
}

const getGroupName = (idx, list = detailList.value) => {
  for (let i = idx; i >= 0; i--) {
    if (list[i].isTitle) return list[i].uraian || 'Kategori'
  }
  return 'Pekerjaan'
}

const getGroupSubtotal = (idx, list = detailList.value) => {
  let total = 0
  for (let i = idx; i >= 0; i--) {
    if (list[i].isTitle) break
    total += (list[i].koef || 0) * (list[i].harga || 0)
  }
  return total
}

const confirmHapus = (item) => {
  $q.dialog({
    title: '<span class="text-negative text-weight-bold">Konfirmasi Hapus</span>',
    message: `Apakah Anda yakin ingin menghapus uraian <b>${item.nama_uraian}</b> secara permanen?`,
    html: true,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    persistent: true,
    ok: { label: 'Ya, Hapus', color: 'negative', unelevated: true, rounded: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'master_ahsp_v2', item.id))
  })
}

onMounted(fetchData)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-20 {
  border-radius: 20px;
}

.shadow-premium {
  box-shadow: 0 10px 25px rgba(26, 35, 126, 0.2);
}

/* LIST CARD DESIGN */
.list-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}
.list-card:hover {
  border-color: #1a237e;
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.12);
  transform: translateY(-3px);
}

/* INNER TABLE */
.ahsp-table :deep(thead tr th) {
  background-color: #e8f0fe;
  color: #004d40;
  font-weight: 800;
  font-size: 13px;
  padding: 16px 12px;
  border-bottom: 2px solid #cfd8dc;
}
.ahsp-table :deep(tbody tr td) {
  padding: 4px 12px;
  font-size: 13.5px;
  border-bottom: 1px solid #f0f0f0;
}
.border-title {
  border-top: 2px solid #1a237e !important;
  border-bottom: 2px solid #1a237e !important;
}
.hover-row:hover {
  background-color: #f8faff !important;
}

/* BUTTONS & UTILS */
.btn-hover:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
.hover-blue-btn {
  transition: 0.3s;
}
.hover-blue-btn:hover {
  background-color: #e8eaf6 !important;
  color: #1a237e !important;
}
.hover-red-btn {
  transition: 0.3s;
}
.hover-red-btn:hover {
  background-color: #ffebee !important;
  color: #d32f2f !important;
}

.bg-indigo-0 {
  background-color: rgba(26, 35, 126, 0.02);
}
.font-10 {
  font-size: 10px;
}
.font-11 {
  font-size: 11px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.opacity-50 {
  opacity: 0.5;
}
.border-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.border-top-subtle {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* --- EXCEL PAPER STYLING (PREVIEW & PDF) --- */
.ahsp-excel-paper {
  background: white !important;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm;
  margin: 0 auto;
  color: black !important;
  box-sizing: border-box;
  position: relative;
  border: 3px solid #0000ff; /* Bingkai Biru ala Excel */
  font-family: Arial, sans-serif; /* Standard Report Font */
}

.excel-info-table {
  border-collapse: collapse;
}
.excel-info-table td {
  padding: 3px 0;
  vertical-align: top;
}

.excel-data-table {
  border-collapse: collapse;
  border: 1.5px solid #000 !important;
  margin-top: 10px;
}
.excel-data-table th,
.excel-data-table td {
  border: 1px solid #000 !important;
  padding: 6px 8px;
  font-size: 13px;
  color: black !important;
}
.excel-data-table th {
  font-weight: bold;
  text-align: center;
}

.animate-fade {
  animation: fadeIn 0.6s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.6s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  .ahsp-excel-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
  }
}
</style>
