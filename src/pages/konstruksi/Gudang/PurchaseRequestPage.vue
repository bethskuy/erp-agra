<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-lg font-pro">
    <!-- VIEW MODE: LIST -->
    <div v-if="viewMode === 'LIST'" class="animate-fade no-print">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
            Purchase Request (PR)
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
              >Permintaan Pengadaan Material Proyek</span
            >
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Kelola dan pantau seluruh pengajuan belanja material secara profesional.
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
          <q-btn
            color="indigo-10"
            icon="add_circle"
            label="Buat Pengajuan Baru"
            unelevated
            rounded
            no-caps
            class="q-px-lg q-py-sm shadow-premium btn-hover"
            @click="openAddDialog"
          />
        </div>
      </div>

      <!-- SEARCH & SUMMARY CARD -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white">
        <q-card-section class="q-py-md">
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari nomor PR atau pemohon..."
                bg-color="white"
              >
                <template v-slot:prepend><q-icon name="search" color="primary" /></template>
              </q-input>
            </div>
            <q-space />
            <div class="col-12 col-md-auto">
              <q-badge
                color="indigo-1"
                text-color="indigo-10"
                class="q-pa-sm rounded-12 text-weight-bold"
              >
                {{ rows.length }} DOKUMEN TERCATAT
              </q-badge>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE SECTION -->
      <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :filter="filter"
          class="pr-table"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-indigo-10 text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold uppercase font-10"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="hover-bg transition-all cursor-pointer"
              @click="openPreview(props.row)"
            >
              <q-td key="nomor" class="text-weight-bolder text-indigo-10">{{
                props.row.nomor
              }}</q-td>
              <q-td key="gudang">
                <div class="text-weight-bold text-blue-grey-9 uppercase">
                  {{ props.row.proyek_nama || props.row.dari_gudang?.nama }}
                </div>
                <div class="text-caption text-grey-6">{{ props.row.pemohon?.nama }}</div>
              </q-td>
              <q-td key="total" class="text-right text-weight-bold">
                Rp {{ (props.row.total_estimasi || 0).toLocaleString() }}
              </q-td>
              <q-td key="status" class="text-center">
                <q-chip
                  :color="getStatusColor(props.row.status)"
                  text-color="white"
                  size="sm"
                  class="text-weight-bold shadow-sm"
                >
                  {{ props.row.status }}
                </q-chip>
              </q-td>
              <q-td key="aksi" class="text-center" @click.stop>
                <q-btn
                  flat
                  round
                  color="indigo-10"
                  icon="visibility"
                  size="sm"
                  @click="openPreview(props.row)"
                />
                <q-btn
                  v-if="props.row.status === 'Pending'"
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="confirmHapus(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- ENTRY FORM DIALOG (Sesuai Referensi image_aa7e97.png) -->
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
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest"
            >Entry Penawaran Harga / PR</q-toolbar-title
          >
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN PENAWARAN"
            :loading="submitting"
            @click="submitPurchaseRequest"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12">
              <!-- SECTION 1: IDENTITAS DOKUMEN & KLIEN -->
              <q-card flat bordered class="rounded-12 q-mb-lg bg-white shadow-1">
                <q-card-section
                  class="bg-indigo-1 q-py-xs text-indigo-10 text-weight-bold flex items-center"
                >
                  <q-icon name="description" class="q-mr-xs" size="xs" /> IDENTITAS DOKUMEN & KLIEN
                </q-card-section>
                <q-card-section class="q-pa-md">
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-4">
                      <div
                        class="text-caption text-weight-bold text-grey-7 uppercase font-8 q-mb-xs"
                      >
                        LOGO PENAWARAN
                      </div>
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
                      <div
                        class="text-caption text-weight-bold text-grey-7 uppercase font-8 q-mb-xs"
                      >
                        Nama Perusahaan (Pengirim)
                      </div>
                      <q-input outlined dense v-model="form.nama_pt" bg-color="white" />
                    </div>
                    <div class="col-12 col-md-4">
                      <div
                        class="text-caption text-weight-bold text-grey-7 uppercase font-8 q-mb-xs"
                      >
                        Nomor Referensi
                      </div>
                      <q-input outlined dense v-model="form.nomor" bg-color="white" />
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        outlined
                        dense
                        v-model="selectedWarehouse"
                        :options="optGudang"
                        option-label="nama"
                        label="Pilih Customer / Klien *"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-md-3">
                      <q-input
                        outlined
                        dense
                        v-model="form.kota"
                        label="Lokasi Terbit"
                        bg-color="white"
                        placeholder="Contoh: Bekasi"
                      />
                    </div>
                    <div class="col-12 col-md-3">
                      <q-input
                        outlined
                        dense
                        v-model="form.tanggal"
                        type="date"
                        label="Tanggal Dokumen"
                        bg-color="white"
                      />
                    </div>

                    <!-- ANALISA HARGA MULTI FORMAT -->
                    <div class="col-12">
                      <div
                        class="text-caption text-weight-bold text-indigo-10 uppercase font-8 q-mb-xs q-mt-sm"
                      >
                        DOKUMEN ANALISA HARGA (REFERENSI APPROVAL)
                      </div>
                      <q-file
                        outlined
                        dense
                        v-model="analisaFile"
                        label="Upload Dokumen Analisa (PDF, Word, Excel)"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        bg-color="indigo-0"
                      >
                        <template v-slot:prepend
                          ><q-icon name="attach_file" color="primary"
                        /></template>
                      </q-file>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- SECTION 2: RINCIAN PEKERJAAN & MATERIAL -->
              <q-card flat bordered class="rounded-12 q-mb-lg bg-white shadow-1 overflow-hidden">
                <q-card-section class="bg-blue-grey-1 q-py-xs row items-center">
                  <q-icon name="list_alt" class="q-mr-xs" size="xs" />
                  <div class="text-weight-bold text-blue-grey-10 uppercase font-8">
                    RINCIAN PEKERJAAN & MATERIAL
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    dense
                    icon="add_circle"
                    color="primary"
                    label="Tambah Baris"
                    @click="addItemRow"
                    no-caps
                    class="text-weight-bold"
                  />
                </q-card-section>

                <q-markup-table flat separator="cell" class="item-entry-table">
                  <thead>
                    <tr class="bg-indigo-1 text-indigo-10">
                      <th width="50">NO</th>
                      <th class="text-left">DESKRIPSI PEKERJAAN</th>
                      <th width="80">QTY</th>
                      <th width="80">UNIT</th>
                      <th width="150">HARGA SATUAN</th>
                      <th width="180">TOTAL AMOUNT</th>
                      <th width="40"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index">
                      <td class="text-center text-grey-6 text-bold">{{ index + 1 }}</td>
                      <td>
                        <q-select
                          dense
                          borderless
                          v-model="item.barang"
                          :options="masterBarang"
                          option-label="nama"
                          placeholder="Tulis rincian..."
                          use-input
                          @filter="filterMasterBarang"
                          @update:model-value="(val) => onBarangSelect(val, index)"
                        />
                      </td>
                      <td>
                        <q-input
                          v-model.number="item.qty"
                          type="number"
                          dense
                          borderless
                          input-class="text-center text-bold"
                          @update:model-value="calcRow(index)"
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
                          v-model.number="item.estimasi_harga"
                          type="number"
                          dense
                          borderless
                          input-class="text-right"
                          prefix="Rp"
                          @update:model-value="calcRow(index)"
                        />
                      </td>
                      <td class="text-right text-weight-black text-indigo-10 bg-indigo-0">
                        Rp {{ (item.total || 0).toLocaleString() }}
                      </td>
                      <td class="text-center">
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="remove_circle"
                          size="xs"
                          @click="removeItemRow(index)"
                          :disable="form.items.length === 1"
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-grey-1">
                    <tr>
                      <td colspan="5" class="text-right text-weight-bold uppercase font-10">
                        Subtotal Pekerjaan
                      </td>
                      <td class="text-right text-weight-bolder text-indigo-10">
                        Rp {{ calculateTotalPR().toLocaleString() }}
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
                        />
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colspan="4"></td>
                      <td class="text-right text-weight-bold text-caption uppercase text-grey-7">
                        Biaya Lain
                      </td>
                      <td class="text-right">
                        <q-input
                          v-model.number="form.biaya_lain"
                          type="number"
                          dense
                          borderless
                          input-class="text-right text-weight-bold text-primary"
                          prefix="Rp"
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
                        Rp {{ calculateGrandTotalPR().toLocaleString() }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </q-markup-table>
              </q-card>

              <!-- SECTION 3: TERMS & SIGNATURE -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-12 bg-white shadow-1 h-full">
                    <q-card-section
                      class="bg-grey-1 q-py-xs text-indigo-10 text-weight-bold uppercase font-8"
                    >
                      <q-icon name="gavel" class="q-mr-xs" /> Syarat & Kondisi
                    </q-card-section>
                    <q-editor v-model="form.terms" min-height="12rem" flat />
                  </q-card>
                </div>
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-12 bg-white shadow-1">
                    <q-card-section
                      class="bg-grey-1 q-py-xs text-indigo-10 text-weight-bold uppercase font-8"
                    >
                      <q-icon name="draw" class="q-mr-xs" /> Pengesahan (TTD)
                    </q-card-section>
                    <q-card-section class="q-pa-md">
                      <q-editor v-model="form.closing" class="q-mb-md" flat bordered dense />
                      <div class="q-gutter-y-sm">
                        <q-input
                          outlined
                          dense
                          v-model="form.ttd_nama"
                          label="Nama Penandatangan"
                          stack-label
                          bg-color="white"
                        />
                        <q-input
                          outlined
                          dense
                          v-model="form.ttd_jabatan"
                          label="Jabatan Resmi"
                          stack-label
                          bg-color="white"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- PREVIEW DIALOG (Identik dengan Gambar Surat Fisik) -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-indigo-10 q-py-md no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold"
            >PREVIEW DOKUMEN PURCHASE REQUEST</q-toolbar-title
          >
          <q-btn-group unelevated rounded class="shadow-2">
            <q-btn
              color="primary"
              icon="print"
              label="Cetak Surat"
              @click="printPage"
              class="q-px-md"
            />
            <q-btn color="red-9" icon="picture_as_pdf" label="Unduh PDF" @click="exportToPDF" />
          </q-btn-group>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center">
          <div id="pr-print-area" class="letter-paper shadow-24" v-if="selectedData">
            <!-- HEADER -->
            <div class="row no-wrap items-center">
              <div class="col-auto q-mr-lg">
                <img :src="config.kopUrl || 'icons/logo-agra.png'" class="pr-logo-img" />
              </div>
              <div class="col text-left">
                <div class="pr-company-name">
                  {{ selectedData.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                </div>
                <div class="pr-company-tagline">General Contruction And General Supply</div>
              </div>
              <div class="col-auto text-right">
                <div class="pr-doc-title">PURCHASE REQUEST</div>
                <div class="pr-doc-no">{{ selectedData.nomor }}</div>
              </div>
            </div>
            <div class="pr-header-line"></div>

            <!-- META INFO -->
            <div class="row justify-between q-mt-md q-mb-lg text-left text-body2">
              <div class="col-6">
                <div class="row no-wrap">
                  <div class="text-bold" style="width: 100px">Kepada Yth</div>
                  <div>: Divisi Purchasing</div>
                </div>
                <div class="row no-wrap q-mt-xs">
                  <div class="text-bold" style="width: 100px">To</div>
                  <div>: {{ selectedData.proyek_nama }}</div>
                </div>
                <div class="row no-wrap q-mt-sm">
                  <div class="text-bold" style="width: 100px">Requestor</div>
                  <div>: {{ selectedData.pemohon?.nama }} (Logistik)</div>
                </div>
                <div class="row no-wrap q-mt-xs">
                  <div class="text-bold" style="width: 100px">Project</div>
                  <div>: {{ selectedData.proyek_nama }}</div>
                </div>
              </div>
              <div class="col-4 text-right">
                <div class="row no-wrap justify-end">
                  <div class="text-bold q-mr-md">Date</div>
                  <div>
                    : {{ selectedData.kota || 'Bekasi' }},
                    {{ formatIndoDate(selectedData.tanggal) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- PURCHASE DETAIL TABLE -->
            <div class="text-bold text-italic q-mb-xs">Purchase Detail :</div>
            <table class="pr-final-table">
              <thead>
                <tr>
                  <th width="40">NO</th>
                  <th class="text-left">ITEM DESCRIPTION</th>
                  <th width="60">QTY</th>
                  <th width="80">SATUAN</th>
                  <th width="130">est UNIT PRICE</th>
                  <th width="150">est AMOUNT</th>
                  <th width="100">Desc</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in selectedData.items" :key="i">
                  <td class="text-center">{{ i + 1 }}</td>
                  <td class="text-left uppercase">{{ it.nama_barang }}</td>
                  <td class="text-center">{{ it.qty }}</td>
                  <td class="text-center uppercase">{{ it.satuan }}</td>
                  <td class="text-right">{{ (it.estimasi_harga || 0).toLocaleString() }}</td>
                  <td class="text-right text-bold">{{ (it.total || 0).toLocaleString() }}</td>
                  <td></td>
                </tr>
                <!-- Padding rows agar tabel penuh ke bawah sesuai gambar -->
                <tr v-for="n in Math.max(0, 10 - selectedData.items.length)" :key="'blank-' + n">
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="pr-grand-total-row">
                  <td colspan="5" class="text-right text-bold">Grand Total</td>
                  <td class="text-right text-bold text-white bg-indigo-10">
                    Rp {{ (selectedData.total_estimasi || 0).toLocaleString() }}
                  </td>
                  <td class="bg-indigo-10"></td>
                </tr>
              </tfoot>
            </table>

            <!-- SYARAT & SISTEM PEMBAYARAN -->
            <div class="q-mt-md">
              <div class="pr-section-title">Syarat Dan Kondisi</div>
              <div class="pr-section-content" v-html="selectedData.terms || '-'"></div>

              <div class="pr-section-title q-mt-sm">Sistem Pembayaran</div>
              <div class="pr-section-content" v-html="selectedData.payment_system || '-'"></div>
            </div>

            <div class="q-mt-md text-body2 text-italic leading-tight">
              Kami berharap Purchase Order ini dapat memenuhi kebutuhan Kami. Jika ada pertanyaan
              atau klarifikasi lebih lanjut, jangan ragu untuk menghubungi kami.<br />
              Terima kasih atas perhatiannya
            </div>

            <!-- SIGNATURE AREA -->
            <div class="row q-mt-xl text-center pr-sign-container">
              <div class="col-4">
                <div class="text-bold q-mb-xl">Approved By</div>
                <div class="q-mt-xl">
                  <div class="text-bold underline">Wartono</div>
                  <div class="text-caption">Manager Operasional</div>
                </div>
              </div>
              <div class="col-4">
                <div class="text-bold q-mb-xl">Prepared By</div>
                <div class="q-mt-xl">
                  <div class="text-bold underline">{{ selectedData.pemohon?.nama }}</div>
                  <div class="text-caption">Logistik</div>
                </div>
              </div>
              <div class="col-4">
                <div class="text-bold q-mb-xl">Approved Supplier</div>
                <div class="q-mt-xl">
                  <div class="text-bold">(..............................................)</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, onMounted, onUnmounted } from 'vue'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()
const viewMode = ref('LIST')
const showDialog = ref(false)
const showPreview = ref(false)
const loading = ref(true)
const submitting = ref(false)
const filter = ref('')
const rows = ref([])

const optGudang = ref([])
const selectedWarehouse = ref(null)
const masterBarang = ref([])
const allBarang = ref([])
const selectedData = ref(null)
const tempKopFile = ref(null)
const analisaFile = ref(null)
const config = ref({ kopUrl: '' })

const formDefault = {
  nomor: '',
  kota: 'Bekasi',
  tanggal: new Date().toISOString().substr(0, 10),
  nama_pt: 'PT AGRA ABHINAYA PERKASA',
  terms: '<ul><li>Harga sudah termasuk pajak dan ongkos kirim.</li><li>Berlaku 14 Hari</li></ul>',
  payment_system: 'Termin sesuai progres pengiriman barang di lapangan.',
  closing: 'Demikian penawaran ini kami sampaikan, terima kasih.',
  ttd_nama: 'DINDIN NAZMUDIN AKHMAD',
  ttd_jabatan: 'Project Director',
  tax_rate: 0,
  biaya_lain: 0,
  items: [
    {
      barang: null,
      id_barang: '',
      nama_barang: '',
      qty: 1,
      satuan: '',
      estimasi_harga: 0,
      total: 0,
    },
  ],
}
const form = ref({ ...formDefault })

// --- FETCH DATA ---
const fetchData = async () => {
  loading.value = true
  const configSnap = await getDoc(doc(db, 'config', 'perusahaan'))
  if (configSnap.exists()) config.value = configSnap.data()

  onSnapshot(
    query(
      collection(db, 'permintaan_barang'),
      where('tipe', '==', 'PURCHASE_REQUEST'),
      orderBy('timestamp', 'desc'),
    ),
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
  )

  getDocs(collection(db, 'proyek')).then((snap) => {
    optGudang.value = [
      { id: 'UTAMA', nama: 'Gudang Utama Center' },
      ...snap.docs.map((d) => ({
        id: d.id,
        nama: 'Gudang ' + (d.data().nama_proyek || d.data().nama),
      })),
    ]
  })
  getDocs(query(collection(db, 'master_barang'), orderBy('nama', 'asc'))).then((snap) => {
    allBarang.value = snap.docs.map((d) => ({ id: d.id, nama: d.data().nama, unit: d.data().unit }))
    masterBarang.value = [...allBarang.value]
  })
}

// --- ACTIONS ---
const openAddDialog = () => {
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.nomor = 'PR-' + Date.now().toString().slice(-4) + '(OTOMATIS)/AAP/II/26'
  selectedWarehouse.value = null
  analisaFile.value = null
  showDialog.value = true
}

const calcRow = (idx) => {
  const it = form.value.items[idx]
  it.total = (it.qty || 0) * (it.estimasi_harga || 0)
}

const calculateTotalPR = () => form.value.items.reduce((sum, it) => sum + (it.total || 0), 0)
const calculateGrandTotalPR = () => {
  const sub = calculateTotalPR()
  const tax = sub * (form.value.tax_rate / 100)
  return sub + tax + (form.value.biaya_lain || 0)
}

const submitPurchaseRequest = async () => {
  if (!selectedWarehouse.value)
    return $q.notify({ type: 'negative', message: 'Pilih Customer/Gudang!' })

  submitting.value = true
  try {
    let docUrl = ''
    if (analisaFile.value) {
      const aRef = storageRef(
        storage,
        `quotations/analysis/${Date.now()}_${analisaFile.value.name}`,
      )
      const snap = await uploadBytes(aRef, analisaFile.value)
      docUrl = await getDownloadURL(snap.ref)
    }

    const payload = {
      ...form.value,
      tipe: 'PURCHASE_REQUEST',
      status: 'Pending',
      proyek_id: selectedWarehouse.value.id,
      proyek_nama: selectedWarehouse.value.nama,
      analisa_harga_url: docUrl,
      total_estimasi: calculateGrandTotalPR(),
      pemohon: { id: authStore.user?.uid, nama: authStore.user?.nama },
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    payload.items = payload.items.map((it) => ({
      id_barang: it.id_barang,
      nama_barang: it.nama_barang,
      qty: it.qty,
      satuan: it.satuan,
      estimasi_harga: it.estimasi_harga,
      total: it.qty * it.estimasi_harga,
    }))

    await addDoc(collection(db, 'permintaan_barang'), payload)
    showDialog.value = false
    $q.notify({ type: 'positive', message: 'PR Berhasil Diajukan!' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    submitting.value = false
  }
}

const addItemRow = () =>
  form.value.items.push({
    barang: null,
    id_barang: '',
    nama_barang: '',
    qty: 1,
    satuan: '',
    estimasi_harga: 0,
    total: 0,
  })
const removeItemRow = (idx) => form.value.items.splice(idx, 1)

const onBarangSelect = (val, idx) => {
  if (val) {
    form.value.items[idx].id_barang = val.id
    form.value.items[idx].nama_barang = val.nama
    form.value.items[idx].satuan = val.unit
    calcRow(idx)
  }
}

const filterMasterBarang = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    masterBarang.value = allBarang.value.filter((v) => v.nama.toLowerCase().includes(needle))
  })
}

const getStatusColor = (s) => {
  if (s === 'Approved') return 'positive'
  if (s === 'Rejected') return 'negative'
  if (s === 'Ordered') return 'indigo-10'
  return 'orange-8'
}

const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
}

const printPage = () => window.print()
const exportToPDF = () => {
  const element = document.getElementById('pr-print-area')
  const opt = {
    margin: 0,
    filename: `PR_${selectedData.value.nomor.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  html2pdf().set(opt).from(element).save()
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

const confirmHapus = (row) => {
  $q.dialog({ title: 'Hapus?', message: 'Tindakan permanen.', cancel: true }).onOk(async () => {
    await deleteDoc(doc(db, 'permintaan_barang', row.id))
  })
}

const formatIndoDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

onMounted(fetchData)

const columns = [
  { name: 'nomor', align: 'left', label: 'PR NUMBER', field: 'nomor', sortable: true },
  { name: 'gudang', align: 'left', label: 'PROJECT / REQUESTOR', field: 'proyek_nama' },
  {
    name: 'total',
    align: 'right',
    label: 'EST. AMOUNT (RP)',
    field: 'total_estimasi',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: '' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
}
.uppercase {
  text-transform: uppercase;
}
.font-8 {
  font-size: 9px;
}
.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
}

/* PR FINAL TABLE (Identik Gambar) */
.pr-final-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #1a237e;
}
.pr-final-table th {
  background: #1a237e !important;
  color: white !important;
  font-size: 10px;
  padding: 10px 5px;
  border: 1px solid #1a237e;
}
.pr-final-table td {
  border: 1px solid #999;
  padding: 6px;
  font-size: 11px;
  color: #111;
}
.pr-grand-total-row td {
  padding: 10px;
  border-top: 2px solid #1a237e;
}

/* DOC PREVIEW PAPER */
.letter-paper {
  background: white;
  width: 210mm;
  min-height: 296mm;
  padding: 10mm 15mm;
  margin: 0 auto;
  color: #1a1a1a;
  line-height: 1.3;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.pr-logo-img {
  height: 60px;
  width: auto;
  object-fit: contain;
}
.pr-company-name {
  font-size: 24px;
  font-weight: 800;
  color: #111;
}
.pr-company-tagline {
  font-size: 12px;
  color: #444;
  margin-top: -5px;
}
.pr-doc-title {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 1px;
  color: #111;
}
.pr-doc-no {
  font-size: 12px;
  font-style: italic;
  color: #444;
}
.pr-header-line {
  height: 3px;
  background: #1a237e;
  margin-top: 10px;
  border-bottom: 1px solid #1a237e;
}

.pr-section-title {
  font-weight: 800;
  border: 1px solid #1a237e;
  background: #eee;
  padding: 2px 8px;
  font-size: 11px;
  font-style: italic;
}
.pr-section-content {
  border: 1px solid #999;
  padding: 8px;
  font-size: 11px;
  min-height: 30px;
  margin-bottom: 5px;
}

.underline {
  text-decoration: underline;
}
.bg-indigo-0 {
  background-color: rgba(26, 35, 126, 0.02);
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
  .letter-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
  }
  .pr-final-table th {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background-color: #1a237e !important;
  }
}
</style>
