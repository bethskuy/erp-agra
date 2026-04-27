<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
          Manajemen Penawaran
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Quotation & Commercial Bidding</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Kelola seluruh dokumen penawaran harga kepada klien secara terstruktur dan profesional.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          v-if="canAction('buat')"
          color="indigo-10"
          icon="add_circle"
          label="Buat Penawaran Baru"
          unelevated
          rounded
          no-caps
          class="q-px-lg q-py-sm shadow-premium btn-hover"
          @click="openAddDialog"
        />
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
              placeholder="Cari No. Referensi atau Nama Klien..."
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
          <div class="col-12 col-md-auto text-caption text-grey-6">
            Total Dokumen:
            <span class="text-weight-bold text-indigo-10">{{ rows.length }} Record</span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE SECTION -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="penawaran-table"
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
            <q-td key="nama_customer">
              <div class="text-weight-bold text-blue-grey-9 uppercase">
                {{ props.row.nama_customer }}
              </div>
              <div
                v-if="props.row.status === 'Rejected' && props.row.alasan_reject"
                class="text-negative text-caption row items-center q-gutter-xs"
              >
                <q-icon name="info" size="12px" />
                <span class="text-italic">{{ props.row.alasan_reject }}</span>
              </div>
            </q-td>
            <q-td key="total_harga" class="text-right text-weight-bold">
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
                {{ props.row.status || 'Draft' }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-xs">
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
                >
                  <q-tooltip>Ajukan Approval</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.status !== 'Approved' && canAction('ubah')"
                  flat
                  round
                  color="blue-8"
                  icon="edit_note"
                  size="sm"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>Edit Draft</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canAction('hapus')"
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="confirmHapus(props.row)"
                >
                  <q-tooltip>Hapus</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- FORM ENTRY DIALOG -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column bg-grey-2">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center"
            >ENTRY PENAWARAN HARGA</q-toolbar-title
          >
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN PENAWARAN"
            :loading="submitting"
            @click="simpanPenawaran"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
              <!-- SECTION 1: HEADER & CUSTOMER -->
              <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                <q-card-section
                  class="bg-indigo-1 text-indigo-10 text-weight-bolder flex items-center"
                >
                  <q-icon name="description" class="q-mr-sm" /> IDENTITAS DOKUMEN & KLIEN
                </q-card-section>
                <q-card-section class="row q-col-gutter-lg q-pa-lg">
                  <div class="col-12 col-md-4">
                    <div class="label-req q-mb-xs text-caption">LOGO PENAWARAN</div>
                    <q-file
                      outlined
                      dense
                      v-model="tempKopFile"
                      label="Upload Kop/Logo"
                      accept="image/*"
                      @update:model-value="uploadKopPermanen"
                      bg-color="white"
                    >
                      <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                    </q-file>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      outlined
                      dense
                      v-model="form.nama_pt"
                      label="Nama Perusahaan (Pengirim)"
                      stack-label
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      outlined
                      dense
                      v-model="form.nomor"
                      label="Nomor Referensi"
                      stack-label
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select
                      outlined
                      dense
                      v-model="selectedCustomer"
                      :options="optCustomer"
                      option-label="nama"
                      label="Pilih Customer / Klien *"
                      @update:model-value="onCustomerChange"
                      stack-label
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input outlined dense v-model="form.kota" label="Lokasi Terbit" stack-label />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      outlined
                      dense
                      v-model="form.tanggal"
                      type="date"
                      label="Tanggal Dokumen"
                      stack-label
                    />
                  </div>
                  <!-- TAMBAHAN: FIELD UPLOAD ANALISA HARGA MULTI-FORMAT -->
                  <div class="col-12">
                    <q-separator class="q-my-sm" />
                    <div class="label-req q-mb-xs text-caption text-indigo-10 font-bold">
                      DOKUMEN ANALISA HARGA (REFERENSI APPROVAL)
                    </div>
                    <q-file
                      outlined
                      dense
                      v-model="analisaFile"
                      label="Upload Dokumen Analisa (PDF, Word, Excel)"
                      accept=".pdf, .doc, .docx, .xls, .xlsx"
                      bg-color="indigo-1"
                    >
                      <template v-slot:prepend
                        ><q-icon name="attach_file" color="primary"
                      /></template>
                      <template v-slot:append v-if="form.analisa_harga_url">
                        <q-icon name="check_circle" color="positive" />
                      </template>
                      <template v-slot:hint
                        >Dukung format PDF, Word, atau Excel sebagai acuan persetujuan
                        margin.</template
                      >
                    </q-file>
                  </div>
                </q-card-section>
              </q-card>

              <!-- SECTION 2: ITEMS TABLE -->
              <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 overflow-hidden">
                <q-card-section class="row items-center bg-blue-grey-1">
                  <div class="text-weight-bolder text-blue-grey-10 flex items-center">
                    <q-icon name="list_alt" class="q-mr-sm" /> RINCIAN PEKERJAAN & MATERIAL
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    dense
                    icon="add_circle"
                    color="primary"
                    label="Tambah Baris"
                    @click="addDetailItem"
                    no-caps
                    class="text-weight-bold"
                  />
                </q-card-section>

                <q-markup-table flat separator="cell" class="entry-table">
                  <thead>
                    <tr class="bg-indigo-1 text-indigo-10">
                      <th width="50">NO</th>
                      <th>DESKRIPSI PEKERJAAN</th>
                      <th width="100">QTY</th>
                      <th width="100">UNIT</th>
                      <th width="180">HARGA SATUAN</th>
                      <th width="180">TOTAL AMOUNT</th>
                      <th width="50"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index">
                      <td class="text-center">{{ index + 1 }}</td>
                      <td>
                        <q-input
                          v-model="item.deskripsi"
                          dense
                          borderless
                          placeholder="Tulis rincian..."
                        />
                      </td>
                      <td>
                        <q-input
                          v-model.number="item.qty"
                          type="number"
                          dense
                          borderless
                          @update:model-value="calcRow(index)"
                          input-class="text-center"
                        />
                      </td>
                      <td>
                        <q-input
                          v-model="item.satuan"
                          dense
                          borderless
                          input-class="text-center uppercase"
                        />
                      </td>
                      <td>
                        <q-input
                          v-model.number="item.harga"
                          type="number"
                          dense
                          borderless
                          @update:model-value="calcRow(index)"
                          prefix="Rp"
                          input-class="text-right"
                        />
                      </td>
                      <td class="text-right text-weight-bolder text-indigo-10 bg-indigo-1">
                        Rp {{ (item.total || 0).toLocaleString() }}
                      </td>
                      <td class="text-center">
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="remove_circle"
                          size="xs"
                          @click="removeDetailItem(index)"
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-grey-1">
                    <tr>
                      <td colspan="5" class="text-right text-weight-bold uppercase">
                        Subtotal Pekerjaan
                      </td>
                      <td class="text-right text-weight-bolder text-indigo-10">
                        Rp {{ subtotal.toLocaleString() }}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colspan="4"></td>
                      <td
                        class="text-right text-weight-bold text-caption uppercase italic text-grey-7"
                      >
                        Tax Rate (%)
                      </td>
                      <td class="text-right">
                        <q-input
                          v-model.number="form.tax_rate"
                          type="number"
                          dense
                          borderless
                          input-class="text-right text-weight-bold"
                          suffix="%"
                          @update:model-value="updateGrandTotal"
                        />
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colspan="4"></td>
                      <td>
                        <q-input
                          v-model="form.biaya_lain_label"
                          dense
                          borderless
                          input-class="text-right text-weight-bold uppercase text-caption"
                          placeholder="BIAYA LAIN"
                        />
                      </td>
                      <td class="text-right">
                        <q-input
                          v-model.number="form.biaya_lain"
                          type="number"
                          dense
                          borderless
                          input-class="text-right text-weight-bold text-primary"
                          prefix="Rp"
                          @update:model-value="updateGrandTotal"
                        />
                      </td>
                      <td></td>
                    </tr>
                    <tr class="bg-indigo-10 text-white">
                      <td
                        colspan="5"
                        class="text-right text-weight-bolder text-h6 uppercase tracking-widest"
                      >
                        Grand Total Amount
                      </td>
                      <td class="text-right text-h6 text-weight-bolder">
                        Rp {{ (form.total_harga || 0).toLocaleString() }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </q-markup-table>
              </q-card>

              <!-- SECTION 3: TERMS & SIGNATURE -->
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 bg-white shadow-1 h-full">
                    <q-card-section class="text-weight-bold text-indigo-10 uppercase"
                      ><q-icon name="gavel" class="q-mr-xs" /> Syarat & Kondisi</q-card-section
                    >
                    <q-separator />
                    <q-editor v-model="form.terms" min-height="12rem" flat />
                  </q-card>
                </div>
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 bg-white shadow-1">
                    <q-card-section class="text-weight-bold text-indigo-10 uppercase"
                      ><q-icon name="draw" class="q-mr-xs" /> Pengesahan (TTD)</q-card-section
                    >
                    <q-separator />
                    <q-card-section>
                      <q-editor v-model="form.closing" class="q-mb-md" flat dense />
                      <div class="q-gutter-y-sm">
                        <q-input
                          outlined
                          dense
                          v-model="form.ttd_nama"
                          label="Nama Penandatangan"
                          stack-label
                        />
                        <q-input
                          outlined
                          dense
                          v-model="form.ttd_jabatan"
                          label="Jabatan Resmi"
                          stack-label
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-xl"></div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- PREVIEW DIALOG -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-indigo-10 q-py-md no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold">PREVIEW DOKUMEN RESMI</q-toolbar-title>
          <q-btn-group unelevated rounded class="shadow-2">
            <!-- TOMBOL LIHAT ANALISA (Muncul jika ada URL lampiran) -->
            <q-btn
              v-if="selectedData?.analisa_harga_url"
              color="indigo-10"
              icon="description"
              label="Lihat Analisa"
              class="q-px-md"
              @click="openAnalisaLink(selectedData.analisa_harga_url)"
            >
              <q-tooltip>Unduh/Buka Berkas Analisa Pendukung (PDF/Word/Excel)</q-tooltip>
            </q-btn>

            <q-btn color="primary" icon="print" label="Cetak" @click="printPage" class="q-px-md" />
            <q-btn color="red-9" icon="picture_as_pdf" label="PDF" @click="exportToPDF" />
            <q-btn color="green-8" icon="description" label="Excel" @click="exportToExcel" />
          </q-btn-group>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center preview-container">
          <div id="quotation-print" class="letter-paper shadow-24" v-if="selectedData">
            <!-- Kop Surat -->
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
                  {{ selectedData.kota }}, {{ formatIndoDate(selectedData.tanggal) }}
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
                  <td colspan="5" class="text-right text-bold uppercase">Subtotal Amount</td>
                  <td class="text-right text-bold text-indigo-10">
                    IDR
                    {{
                      selectedData.items.reduce((a, b) => a + (b.total || 0), 0).toLocaleString()
                    }}
                  </td>
                </tr>
                <tr class="row-calculation" v-if="selectedData.tax_rate > 0">
                  <td colspan="5" class="text-right text-bold uppercase italic text-grey-7">
                    Value Added Tax ({{ selectedData.tax_rate }}%)
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

            <!-- Signature Area (Menampilkan Tanda Tangan Digital yang Diambil dari Proses Approval) -->
            <div class="signature-container text-left q-mt-xl">
              <div class="text-closing-final q-mb-sm" v-html="selectedData.closing"></div>
              <div class="row q-mt-md">
                <div class="col-7"></div>
                <div class="col-5 text-right">
                  <div class="q-mb-xs text-body2 uppercase">Hormat Kami,</div>
                  <div class="text-weight-bold text-indigo-10 uppercase q-mb-xs">
                    {{ selectedData.nama_pt }}
                  </div>
                  <!-- Menampilkan Gambar Tanda Tangan jika Statusnya sudah Approved -->
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
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
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
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from 'src/stores/auth'
import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const showDialog = ref(false)
const isEditMode = ref(false)
const filter = ref('')
const showPreview = ref(false)
const selectedData = ref(null)
const optCustomer = ref([])
const selectedCustomer = ref(null)
const tempKopFile = ref(null)
const analisaFile = ref(null)
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
  analisa_harga_url: '',
}
const form = ref({ ...formDefault })

const subtotal = computed(() => form.value.items.reduce((sum, item) => sum + (item.total || 0), 0))
const updateGrandTotal = () => {
  const taxAmount = subtotal.value * (form.value.tax_rate / 100)
  form.value.total_harga = subtotal.value + taxAmount + (form.value.biaya_lain || 0)
}

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
  { name: 'aksi', align: 'center', label: 'ACTIONS', field: 'aksi' },
]

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'positive'
    case 'Rejected':
      return 'negative'
    case 'Pending':
      return 'orange-8'
    default:
      return 'blue-grey-6'
  }
}

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_marketing_penawaran'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const fetchData = async () => {
  loading.value = true
  try {
    const configSnap = await getDoc(doc(db, 'config', 'perusahaan'))
    if (configSnap.exists()) config.value = configSnap.data()

    onSnapshot(collection(db, 'penawaran'), (snap) => {
      rows.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
      loading.value = false
    })

    const snapC = await getDocs(collection(db, 'customer'))
    optCustomer.value = snapC.docs.map((d) => ({ id: d.id, nama: d.data().nama }))
  } catch (e) {
    console.error(e)
    loading.value = false
  }
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
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
  if (!form.value.customer_id)
    return $q.notify({ message: 'Pilih Customer!', color: 'negative', position: 'top' })
  updateGrandTotal()
  submitting.value = true
  try {
    // 1. Upload file analisa (PDF/Word/Excel) jika ada
    if (analisaFile.value) {
      const fileName = `analysis_${Date.now()}_${analisaFile.value.name}`
      const aRef = storageRef(storage, `quotations/analysis/${fileName}`)
      const uploadSnap = await uploadBytes(aRef, analisaFile.value)
      form.value.analisa_harga_url = await getDownloadURL(uploadSnap.ref)
    }

    const payload = {
      ...form.value,
      updatedAt: serverTimestamp(),
      is_revised: true,
      status: form.value.status || 'Draft',
      alasan_reject: '',
    }
    const docId = payload.id
    delete payload.id
    if (isEditMode.value && docId) await updateDoc(doc(db, 'penawaran', docId), payload)
    else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'penawaran'), payload)
    }
    showDialog.value = false
    analisaFile.value = null
    $q.notify({ type: 'positive', message: 'Data Penawaran Berhasil Disimpan!', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan data: ' + e.message })
  }
  submitting.value = false
}

const ajukanPenawaran = (row) => {
  $q.dialog({
    title: 'Konfirmasi Pengajuan',
    message: 'Ajukan penawaran ini ke pimpinan untuk diperiksa (Pending)?',
    cancel: true,
    ok: { color: 'indigo-10', unelevated: true, label: 'Ya, Ajukan' },
  }).onOk(async () => {
    await updateDoc(doc(db, 'penawaran', row.id), {
      status: 'Pending',
      is_revised: false,
      updatedAt: serverTimestamp(),
    })
    $q.notify({ type: 'info', message: 'Penawaran sedang menunggu persetujuan.' })
  })
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  selectedCustomer.value = { id: row.customer_id, nama: row.nama_customer }
  analisaFile.value = null
  showDialog.value = true
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.nomor = `${(rows.value.length + 1).toString().padStart(3, '0')}/AAP-QUOT/IV/2026`
  selectedCustomer.value = null
  analisaFile.value = null
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
  $q.dialog({
    title: 'Hapus Penawaran',
    message: `Hapus dokumen ${row.nomor}? Tindakan ini permanen.`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Hapus Data' },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'penawaran', row.id))
      $q.notify({ icon: 'delete', message: 'Dokumen telah dihapus.' })
    } catch (e) {
      console.error(e)
    }
  })
}

const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
}

const openAnalisaLink = (url) => {
  if (url) window.open(url, '_blank')
}

const formatIndoDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
const printPage = () => window.print()

const exportToPDF = () => {
  const element = document.getElementById('quotation-print')
  const opt = {
    margin: 0,
    filename: `Quotation_${selectedData.value.nomor.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Generating Professional PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

const exportToExcel = () => {
  const dataExcel = selectedData.value.items.map((item, index) => ({
    No: index + 1,
    Description: item.deskripsi,
    Quantity: item.qty,
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
      $q.notify({ color: 'positive', message: 'Logo Perusahaan Diperbarui!', position: 'top' })
    } catch (e) {
      console.error(e)
    }
  }
}
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
.tracking-widest {
  letter-spacing: 0.15em;
}
.tracking-extra-wide {
  letter-spacing: 0.25em;
}

/* Table Styling */
.penawaran-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.entry-table :deep(thead th) {
  padding: 12px;
}
.entry-table :deep(tbody td) {
  padding: 0 8px;
  height: 48px;
  border-bottom: 1px solid #f0f0f0;
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
    height: auto !important;
    min-height: auto !important;
  }
  /* Sembunyikan Scrollbar secara total untuk semua elemen */
  ::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  /* Hilangkan elemen UI sistem */
  .no-print {
    display: none !important;
  }
  .q-dialog__inner--maximized {
    padding: 0 !important;
    overflow: visible !important;
    position: relative !important;
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
    min-height: auto !important;
  }

  .letter-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
    height: 297mm !important;
    padding: 15mm !important;
    page-break-after: always;
    overflow: visible !important;
    position: relative !important;
  }
  /* Force colors to show in print */
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
  .text-indigo-10 {
    color: #1a237e !important;
  }
}
</style>
