<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
          Master Barang & Material
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Inventaris & Logistik Proyek</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Kelola katalog material dengan visualisasi produk dan perbandingan harga vendor secara
          terpadu.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          v-if="canAction('buat')"
          color="indigo-10"
          icon="add_box"
          label="Tambah Barang Baru"
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
              placeholder="Cari Nama Barang, Kode, atau Merk..."
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
            Total Katalog:
            <span class="text-weight-bold text-indigo-10">{{ rows.length }} Item Terdaftar</span>
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
        class="barang-table"
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
            @click="openDetailView(null, props.row)"
          >
            <q-td key="kode" class="text-weight-medium text-grey-7">{{ props.row.kode }}</q-td>

            <!-- KOLOM FOTO TERPISAH -->
            <q-td key="foto" class="text-center">
              <q-avatar size="40px" rounded color="grey-2" class="shadow-sm border-indigo-thin">
                <q-img
                  :src="
                    props.row.foto_url ||
                    props.row.foto_base64 ||
                    'https://cdn.quasar.dev/img/avatar.png'
                  "
                >
                  <template v-slot:error>
                    <q-icon name="inventory_2" color="grey-4" />
                  </template>
                </q-img>
              </q-avatar>
            </q-td>

            <q-td key="nama">
              <div class="column">
                <div class="text-weight-bold text-subtitle2 text-blue-grey-10 text-uppercase">
                  {{ props.row.nama }}
                </div>
                <div class="text-caption text-primary text-weight-medium">
                  {{ props.row.merk || 'No Brand' }}
                </div>
              </div>
            </q-td>

            <q-td key="unit" class="text-center">
              <q-badge outline color="blue-grey-4" class="text-weight-bold q-px-sm uppercase">
                {{ props.row.unit }}
              </q-badge>
            </q-td>
            <q-td key="harga" class="text-right">
              <div v-if="props.row.vendor_prices && props.row.vendor_prices.length">
                <div class="text-weight-bolder text-indigo-10">
                  Rp {{ getMinPrice(props.row.vendor_prices).toLocaleString() }}
                </div>
                <div class="text-caption text-grey-6" style="font-size: 10px">Harga Terendah</div>
              </div>
              <div v-else class="text-grey-4">-</div>
            </q-td>
            <q-td key="kategori">
              <q-chip
                dense
                color="indigo-1"
                text-color="indigo-10"
                icon="category"
                class="text-weight-bold uppercase"
                size="sm"
              >
                {{ props.row.kategori }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-sm">
                <q-btn
                  v-if="canAction('ubah')"
                  flat
                  round
                  color="blue-8"
                  icon="edit"
                  size="sm"
                  @click.stop="openEditDialog(props.row)"
                  ><q-tooltip>Edit</q-tooltip></q-btn
                >
                <q-btn
                  v-if="canAction('hapus')"
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click.stop="hapusBarang(props.row)"
                  ><q-tooltip>Hapus</q-tooltip></q-btn
                >
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- VIEW 1: DETAIL BARANG ( Luxury Viewer ) -->
    <q-dialog
      v-model="showDetail"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap print-fixed-card" v-if="selectedItem">
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-2 shrink no-print">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest"
            >Profil Detail Material</q-toolbar-title
          >

          <q-btn-group unelevated rounded class="q-mr-md shadow-2 gt-xs">
            <q-btn color="primary" icon="print" label="Cetak" @click="printDetail" />
            <q-btn color="red-9" icon="picture_as_pdf" label="PDF" @click="exportDetailPDF" />
          </q-btn-group>

          <q-btn
            unelevated
            color="white"
            text-color="indigo-10"
            icon="edit"
            label="Edit Data"
            @click="editFromDetail"
            v-if="canAction('ubah')"
            rounded
            class="q-px-md shadow-3"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl print-content-area">
          <div id="material-detail-print" class="row justify-center print-container">
            <div class="col-12 col-lg-10">
              <!-- Judul untuk Print (Hanya muncul saat cetak) -->
              <div class="print-only q-mb-xl text-center">
                <div class="text-h4 text-weight-black text-indigo-10 uppercase tracking-widest">
                  Profil Material Aset
                </div>
                <div class="text-subtitle1 text-grey-7 italic">
                  Laporan Katalog Barang & Vendor PT AGRA
                </div>
                <div
                  class="q-mt-md"
                  style="height: 2px; background: #1a237e; width: 100px; margin: 15px auto"
                ></div>
              </div>

              <div class="row q-col-gutter-xl print-row-fix">
                <!-- Visual & Info Utama -->
                <div class="col-12 col-md-4">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 overflow-hidden shadow-premium bg-white border-indigo-thin"
                  >
                    <q-img
                      :src="
                        selectedItem.foto_url ||
                        selectedItem.foto_base64 ||
                        'https://cdn.quasar.dev/img/avatar.png'
                      "
                      :ratio="1"
                      class="bg-grey-1"
                    />
                    <q-card-section class="bg-indigo-10 text-white text-center print-indigo-bg">
                      <div class="text-overline opacity-80 uppercase tracking-widest">
                        Katalog Produk
                      </div>
                      <div class="text-h5 text-weight-black">{{ selectedItem.kode }}</div>
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="rounded-20 q-mt-lg bg-white shadow-1">
                    <q-card-section>
                      <div class="text-overline text-grey-6 uppercase">Kategori Barang</div>
                      <div class="row items-center q-mt-sm">
                        <q-icon name="category" color="primary" size="sm" class="q-mr-sm" />
                        <div class="text-subtitle1 text-weight-bold uppercase text-indigo-10">
                          {{ selectedItem.kategori }}
                        </div>
                      </div>
                      <q-separator class="q-my-md" />
                      <div class="text-overline text-grey-6 uppercase">Satuan Ukur</div>
                      <div class="row items-center q-mt-sm text-indigo-10 text-weight-bolder">
                        <q-icon name="straighten" color="indigo-10" size="sm" class="q-mr-sm" />
                        <div class="text-h6 uppercase">{{ selectedItem.unit }}</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Spesifikasi & Perbandingan Harga -->
                <div class="col-12 col-md-8">
                  <div
                    class="text-h3 text-weight-black text-indigo-10 text-uppercase leading-tight q-mb-xs print-text-indigo"
                  >
                    {{ selectedItem.nama }}
                  </div>
                  <div class="text-h5 text-grey-6 text-weight-medium q-mb-xl">
                    {{ selectedItem.merk || 'Tanpa Merk' }}
                  </div>

                  <q-card flat bordered class="rounded-20 bg-white shadow-sm overflow-hidden">
                    <q-card-section
                      class="bg-blue-grey-1 text-blue-grey-10 text-weight-bold uppercase letter-spacing-1 no-print-bg"
                    >
                      <q-icon name="payments" class="q-mr-sm" /> Perbandingan Harga Vendor
                    </q-card-section>
                    <q-markup-table flat separator="horizontal" class="detail-vendor-table">
                      <thead>
                        <tr class="bg-grey-1">
                          <th class="text-left">NAMA VENDOR</th>
                          <th class="text-left">NO. QUOTATION</th>
                          <th class="text-right">HARGA (Rp)</th>
                          <th class="text-center no-print">BERKAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(v, i) in selectedItem.vendor_prices" :key="i">
                          <td class="text-left">
                            <div class="text-weight-bold text-indigo-9 text-uppercase">
                              {{ v.vendor?.nama || 'Unknown' }}
                            </div>
                          </td>
                          <td class="text-left text-grey-7">{{ v.no_quotation || '-' }}</td>
                          <td class="text-right">
                            <div
                              class="text-weight-black text-subtitle2"
                              :class="
                                v.harga === getMinPrice(selectedItem.vendor_prices)
                                  ? 'text-positive'
                                  : 'text-dark'
                              "
                            >
                              Rp {{ (v.harga || 0).toLocaleString() }}
                              <q-badge
                                v-if="v.harga === getMinPrice(selectedItem.vendor_prices)"
                                color="green-1"
                                text-color="positive"
                                label="Termurah"
                                class="q-ml-xs shadow-sm no-print"
                              />
                              <span
                                v-if="v.harga === getMinPrice(selectedItem.vendor_prices)"
                                class="print-only text-positive q-ml-sm"
                                style="font-size: 10px"
                                >(TERENDAH)</span
                              >
                            </div>
                          </td>
                          <td class="text-center no-print">
                            <q-btn
                              v-if="v.quotation_url || v.quotation_base64"
                              flat
                              round
                              color="primary"
                              icon="description"
                              size="sm"
                              @click="openDoc(v.quotation_url || v.quotation_base64)"
                            >
                              <q-tooltip>Lihat File</q-tooltip>
                            </q-btn>
                            <span v-else class="text-caption text-grey-4 italic">Kosong</span>
                          </td>
                        </tr>
                        <tr v-if="!selectedItem.vendor_prices?.length">
                          <td colspan="4" class="text-center q-pa-xl text-grey-5 italic">
                            <q-icon name="info" size="md" class="q-mb-sm" /><br />
                            Belum ada riwayat penawaran untuk item ini.
                          </td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </q-card>

                  <div class="q-mt-lg row q-col-gutter-md">
                    <div class="col-12">
                      <q-card
                        flat
                        bordered
                        class="rounded-20 bg-indigo-1 text-indigo-10 shadow-sm border-indigo-thin"
                      >
                        <q-card-section class="row items-center no-wrap">
                          <q-icon name="update" size="md" class="q-mr-md opacity-50" />
                          <div>
                            <div class="text-overline uppercase">Update Terakhir di Sistem</div>
                            <div class="text-weight-bold">
                              {{
                                selectedItem.updatedAt
                                  ? selectedItem.updatedAt.toDate().toLocaleString('id-ID')
                                  : 'Data Baru'
                              }}
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- VIEW 2: FORM DIALOG (TAMBAH/EDIT) -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(4px)"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest">
            {{ isEditMode ? 'Pembaruan Data Barang' : 'Registrasi Barang Baru' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN ITEM"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="simpanBarang"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-11">
              <div class="row q-col-gutter-xl">
                <!-- FORM LEFT: IDENTITAS & FOTO -->
                <div class="col-12 col-md-5">
                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                    <div
                      class="text-subtitle1 text-indigo-10 text-weight-bolder q-mb-lg flex items-center"
                    >
                      <q-icon name="branding_watermark" class="q-mr-sm" /> IDENTITAS & SPESIFIKASI
                    </div>
                    <div class="q-gutter-y-md">
                      <!-- Input Foto Barang -->
                      <div class="row justify-center q-mb-lg">
                        <div class="column items-center">
                          <q-avatar
                            size="160px"
                            rounded
                            color="grey-1"
                            class="shadow-2 border-indigo-thin q-mb-sm overflow-hidden"
                          >
                            <q-img
                              v-if="form.foto_url || form.foto_base64"
                              :src="form.foto_url || form.foto_base64"
                            />
                            <q-icon v-else name="add_a_photo" size="64px" color="grey-4" />
                          </q-avatar>
                          <q-file
                            borderless
                            dense
                            v-model="itemPhotoFile"
                            accept="image/*"
                            label="Ganti Foto Utama"
                            @update:model-value="handleItemPhoto"
                            class="btn-file-custom"
                          >
                            <template v-slot:prepend
                              ><q-icon name="photo_camera" color="indigo-10"
                            /></template>
                          </q-file>
                        </div>
                      </div>

                      <div class="row q-col-gutter-md">
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.kode"
                          label="Kode Internal"
                          placeholder="Auto-generate"
                          :readonly="isEditMode"
                          stack-label
                        />
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.merk"
                          label="Merk / Brand"
                          placeholder="Contoh: Garuda, Holcim"
                          stack-label
                        />
                      </div>

                      <q-input
                        outlined
                        v-model="form.nama"
                        label="Nama Barang / Material *"
                        placeholder="Contoh: Semen Portland 50Kg"
                        stack-label
                        autofocus
                        class="text-uppercase font-bold"
                      />

                      <div class="row q-col-gutter-md q-mt-sm">
                        <div class="col-12 col-sm-6">
                          <div class="row items-center no-wrap">
                            <q-select
                              class="col"
                              outlined
                              v-model="form.unit"
                              :options="optionsSatuan"
                              label="Satuan (Unit)"
                              stack-label
                            />
                            <q-btn
                              flat
                              round
                              color="primary"
                              icon="add_circle"
                              class="q-ml-xs"
                              @click="quickAddSatuan"
                            />
                          </div>
                        </div>
                        <div class="col-12 col-sm-6">
                          <div class="row items-center no-wrap">
                            <q-select
                              class="col"
                              outlined
                              v-model="form.kategori"
                              :options="optionsKategori"
                              label="Kategori Barang"
                              stack-label
                            />
                            <q-btn
                              flat
                              round
                              color="primary"
                              icon="add_circle"
                              class="q-ml-xs"
                              @click="quickAddKategori"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>

                <!-- FORM RIGHT: MULTI VENDOR PRICES -->
                <div class="col-12 col-md-7">
                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1 h-full">
                    <div class="row items-center justify-between q-mb-lg">
                      <div
                        class="text-subtitle1 text-indigo-10 text-weight-bolder flex items-center"
                      >
                        <q-icon name="payments" class="q-mr-sm" /> PERBANDINGAN HARGA VENDOR
                      </div>
                      <q-btn
                        color="indigo-10"
                        icon="add"
                        label="Tambah Harga"
                        rounded
                        size="sm"
                        unelevated
                        @click="addVendorPrice"
                      />
                    </div>

                    <div
                      v-if="form.vendor_prices.length === 0"
                      class="text-center q-pa-xl bg-grey-1 rounded-borders border-dashed"
                    >
                      <q-icon name="receipt_long" size="48px" color="grey-4" />
                      <div class="text-caption text-grey-6 q-mt-sm">
                        Belum ada data penawaran harga
                      </div>
                    </div>

                    <div
                      v-for="(vp, index) in form.vendor_prices"
                      :key="index"
                      class="q-mb-md q-pa-md bg-grey-1 rounded-borders relative-position border-subtle"
                    >
                      <div class="q-gutter-y-sm">
                        <div class="row q-col-gutter-sm items-center">
                          <div class="col-12 col-sm-7">
                            <q-select
                              outlined
                              dense
                              v-model="vp.vendor"
                              :options="optionsVendor"
                              option-label="nama"
                              label="Pilih Vendor *"
                              bg-color="white"
                            />
                          </div>
                          <div class="col-12 col-sm-4">
                            <q-input
                              outlined
                              dense
                              v-model.number="vp.harga"
                              type="number"
                              label="Harga Beli (Rp)"
                              prefix="Rp "
                              bg-color="white"
                              class="text-weight-bold"
                            />
                          </div>
                          <div class="col-12 col-sm-1 text-right">
                            <q-btn
                              flat
                              round
                              dense
                              color="negative"
                              icon="delete_outline"
                              size="sm"
                              @click="removeVendorPrice(index)"
                            />
                          </div>
                        </div>

                        <div class="row q-col-gutter-sm items-center">
                          <div class="col-12 col-sm-7">
                            <q-input
                              outlined
                              dense
                              v-model="vp.no_quotation"
                              label="Nomor Quotation"
                              bg-color="white"
                              placeholder="Nomor Surat Penawaran"
                            />
                          </div>
                          <div class="col-12 col-sm-5">
                            <q-file
                              outlined
                              dense
                              v-model="vp.docFile"
                              label="Upload Dokumen"
                              bg-color="white"
                              accept=".pdf,image/*"
                              @update:model-value="(val) => handleQuotationFile(val, index)"
                            >
                              <template v-slot:prepend
                                ><q-icon name="cloud_upload" size="xs" color="indigo-7"
                              /></template>
                              <template
                                v-slot:append
                                v-if="vp.quotation_url || vp.quotation_base64"
                              >
                                <q-btn
                                  flat
                                  round
                                  dense
                                  icon="visibility"
                                  color="primary"
                                  size="xs"
                                  @click.stop="openDoc(vp.quotation_url || vp.quotation_base64)"
                                />
                              </template>
                            </q-file>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-xl"></div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- VIEW: DOCUMENT VIEWER -->
    <q-dialog v-model="showDocViewer" maximized transition-show="scale" transition-hide="scale">
      <q-card class="bg-grey-10">
        <q-toolbar class="bg-indigo-10 text-white shadow-2">
          <q-toolbar-title>Peninjauan Dokumen</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="no-padding full-height" style="height: calc(100vh - 64px)">
          <iframe :src="currentDocUrl" width="100%" height="100%" style="border: none"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from 'src/boot/firebase'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()
const filter = ref('')
const showDialog = ref(false)
const showDetail = ref(false)
const isEditMode = ref(false)
const loading = ref(true)
const submitting = ref(false)
const userData = ref(null)
const selectedItem = ref(null)
const showDocViewer = ref(false)
const currentDocUrl = ref('')
const itemPhotoFile = ref(null)
let unsubscribeUser = null
let unsubscribeBarang = null

const formDefault = {
  kode: '',
  nama: '',
  unit: null,
  kategori: null,
  merk: '',
  foto_url: '',
  foto_base64: '',
  vendor_prices: [],
}
const form = ref({ ...formDefault })
const rows = ref([])
const optionsSatuan = ref([])
const optionsKategori = ref([])
const optionsVendor = ref([])

const columns = [
  { name: 'kode', align: 'left', label: 'KODE ITEM', field: 'kode', sortable: true },
  { name: 'foto', align: 'center', label: 'FOTO', field: 'id' },
  { name: 'nama', align: 'left', label: 'NAMA & MERK', field: 'nama', sortable: true },
  { name: 'unit', align: 'center', label: 'SATUAN', field: 'unit' },
  { name: 'harga', align: 'right', label: 'HARGA TERENDAH', field: 'id', sortable: true },
  { name: 'kategori', align: 'left', label: 'KATEGORI', field: 'kategori', sortable: true },
  { name: 'aksi', align: 'center', label: 'KELOLA', field: 'id' },
]

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  const targetId = '_konstruksi_master_barang-list'
  const menu = modulePerm?.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const getMinPrice = (prices) => {
  if (!prices || !prices.length) return 0
  return Math.min(...prices.map((p) => p.harga || 0))
}

const openDetailView = (evt, row) => {
  selectedItem.value = row
  showDetail.value = true
}

const editFromDetail = () => {
  openEditDialog(selectedItem.value)
  showDetail.value = false
}

const printDetail = () => window.print()

const exportDetailPDF = () => {
  const element = document.getElementById('material-detail-print')
  const opt = {
    margin: 0,
    filename: `Material_${selectedItem.value.kode}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Sedang memproses PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

const handleItemPhoto = (file) => {
  if (!file) return
  if (file.size <= 512000) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      form.value.foto_base64 = reader.result
      form.value.foto_url = ''
    }
  } else {
    form.value.foto_base64 = ''
  }
}

const handleQuotationFile = (file, index) => {
  if (!file) return
  if (file.size <= 512000) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      form.value.vendor_prices[index].quotation_base64 = reader.result
      form.value.vendor_prices[index].quotation_url = ''
    }
  } else {
    form.value.vendor_prices[index].quotation_base64 = ''
  }
}

const addVendorPrice = () => {
  form.value.vendor_prices.push({
    vendor: null,
    harga: 0,
    no_quotation: '',
    quotation_url: '',
    quotation_base64: '',
    docFile: null,
  })
}

const removeVendorPrice = (index) => form.value.vendor_prices.splice(index, 1)

const openDoc = (url) => {
  currentDocUrl.value = url
  showDocViewer.value = true
}

const fetchReferences = async () => {
  try {
    const [satSnap, catSnap, venSnap] = await Promise.all([
      getDocs(query(collection(db, 'master_satuan'), orderBy('nama', 'asc'))),
      getDocs(query(collection(db, 'kategori_barang'), orderBy('nama', 'asc'))),
      getDocs(query(collection(db, 'suppliers'), orderBy('nama', 'asc'))),
    ])
    optionsSatuan.value = satSnap.docs.map((d) => d.data().nama)
    optionsKategori.value = catSnap.docs.map((d) => d.data().nama)
    optionsVendor.value = venSnap.docs.map((d) => ({ id: d.id, nama: d.data().nama }))
  } catch (e) {
    console.error(e)
  }
}

const quickAddSatuan = () => {
  $q.dialog({
    title: 'Satuan Baru',
    message: 'Contoh: Kg, Pcs, m3',
    prompt: { vModel: '', type: 'text' },
    cancel: true,
    ok: { color: 'indigo-10' },
  }).onOk(async (data) => {
    if (!data) return
    await addDoc(collection(db, 'master_satuan'), { nama: data, createdAt: serverTimestamp() })
    await fetchReferences()
    form.value.unit = data
  })
}

const quickAddKategori = () => {
  $q.dialog({
    title: 'Kategori Baru',
    message: 'Contoh: Semen, Besi',
    prompt: { vModel: '', type: 'text' },
    cancel: true,
    ok: { color: 'indigo-10' },
  }).onOk(async (data) => {
    if (!data) return
    await addDoc(collection(db, 'kategori_barang'), { nama: data, createdAt: serverTimestamp() })
    await fetchReferences()
    form.value.kategori = data
  })
}

const fetchBarang = () => {
  loading.value = true
  const q = query(collection(db, 'master_barang'), orderBy('nama', 'asc'))
  unsubscribeBarang = onSnapshot(q, (snap) => {
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snap) => {
      if (!snap.empty) userData.value = snap.docs[0].data()
    })
  }
  fetchBarang()
  fetchReferences()
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
  if (unsubscribeBarang) unsubscribeBarang()
})

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  itemPhotoFile.value = null
  showDialog.value = true
}

const openEditDialog = (data) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(data))
  if (!form.value.vendor_prices) form.value.vendor_prices = []
  itemPhotoFile.value = null
  showDialog.value = true
}

const simpanBarang = async () => {
  if (!form.value.nama) return $q.notify({ color: 'negative', message: 'Nama Wajib Diisi' })

  $q.loading.show({ message: 'Sedang mengunggah aset...' })
  submitting.value = true

  try {
    if (itemPhotoFile.value && !form.value.foto_base64) {
      const pRef = storageRef(storage, `barang/photos/${Date.now()}_ITEM`)
      const snap = await uploadBytes(pRef, itemPhotoFile.value)
      form.value.foto_url = await getDownloadURL(snap.ref)
    }

    for (let vp of form.value.vendor_prices) {
      if (vp.docFile && !vp.quotation_base64) {
        const sRef = storageRef(storage, `barang/quotations/${Date.now()}_QUOT`)
        const snap = await uploadBytes(sRef, vp.docFile)
        vp.quotation_url = await getDownloadURL(snap.ref)
      }
      delete vp.docFile
    }

    const payload = JSON.parse(JSON.stringify(form.value))
    payload.updatedAt = serverTimestamp()

    if (isEditMode.value) {
      const docRef = doc(db, 'master_barang', form.value.id)
      delete payload.id
      await updateDoc(docRef, payload)
    } else {
      if (!payload.kode) payload.kode = 'BRG-' + Date.now().toString().slice(-6)
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'master_barang'), payload)
    }

    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Data katalog berhasil disimpan' })
  } catch (e) {
    console.error(e)
    $q.notify({ color: 'negative', message: 'Gagal Simpan: ' + e.message })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const hapusBarang = (data) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Hapus ${data.nama}?`,
    cancel: true,
    ok: { color: 'negative', unelevated: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'master_barang', data.id))
    $q.notify({ icon: 'delete', message: 'Item telah dihapus' })
  })
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
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 2px solid #e8eaf6;
}

.barang-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
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

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.block {
  display: block;
}
.leading-tight {
  line-height: 1.1;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.no-padding {
  padding: 0 !important;
}
.btn-file-custom :deep(.q-field__control) {
  background: #e8eaf6;
  border-radius: 50px;
  padding: 0 15px;
  min-height: 32px;
  font-size: 11px;
  font-weight: 700;
}

.detail-vendor-table thead th {
  font-weight: 800;
  text-transform: uppercase;
  font-size: 11px;
  color: #444;
  padding: 12px 16px;
}
.detail-vendor-table tbody td {
  padding: 12px 16px;
}

.shrink {
  flex: 0 0 auto;
}

.print-only {
  display: none;
}

/* PERBAIKAN TOTAL UNTUK PRINT */
@media print {
  @page {
    size: A4;
    margin: 15mm !important;
  }

  /* Hilangkan Scrollbar & fixed height Quasar */
  html,
  body,
  .q-layout,
  .q-page-container,
  .q-page,
  .q-dialog,
  .q-dialog__inner,
  .print-fixed-card {
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    position: static !important;
    background: white !important;
  }

  ::-webkit-scrollbar {
    display: none !important;
  }
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  /* Sembunyikan SEMUA elemen no-print secara agresif */
  .no-print,
  .q-toolbar.no-print,
  .q-header,
  .q-footer,
  .q-btn,
  .q-btn-group {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .q-dialog__inner--maximized {
    padding: 0 !important;
    display: block !important;
  }

  .q-card {
    box-shadow: none !important;
    border: none !important;
    display: block !important;
  }

  /* RESET GRID UNTUK A4 (Memaksa agar tetap 2 kolom) */
  .print-row-fix {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: flex-start !important;
  }
  .col-md-4 {
    width: 32% !important;
    flex: 0 0 32% !important;
  }
  .col-md-8 {
    width: 68% !important;
    flex: 0 0 68% !important;
  }

  .print-container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Pastikan warna latar belakang muncul di kertas */
  .border-indigo-thin {
    border: 1.5px solid #1a237e !important;
  }
  .bg-indigo-10,
  .print-indigo-bg {
    background-color: #1a237e !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-text-indigo {
    color: #1a237e !important;
    -webkit-print-color-adjust: exact;
  }

  .no-print-bg {
    background-color: #f5f5f5 !important;
    color: #1a237e !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    border-bottom: 2px solid #1a237e !important;
  }

  .q-img {
    max-width: 100% !important;
    height: auto !important;
    border-radius: 12px !important;
  }
}
</style>
