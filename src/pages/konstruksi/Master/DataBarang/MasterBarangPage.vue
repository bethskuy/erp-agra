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

    <!-- EFEK LATAR BELAKANG ANIMASI MENGAMBANG (Warna-Warni, Kebureman Tipis & Elegan Sesuai Contoh) -->
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
    <div class="row items-center justify-between q-mb-xl no-print content-relative">
      <div class="col-12 col-sm-8">
        <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
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
      <div class="col-12 col-sm-auto q-mt-md q-mt-sm-none flex">
        <!-- Tambah class 'btn-tambah-responsive' untuk full-width di HP -->
        <q-btn
          v-if="canAction('buat')"
          color="brand-primary"
          icon="add_box"
          label="Tambah Barang Baru"
          unelevated
          rounded
          no-caps
          class="q-px-lg q-py-sm shadow-premium btn-hover btn-tambah-responsive"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- SEARCH & SUMMARY CARD -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print content-relative">
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
                <q-icon name="search" color="brand-primary" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space />
          <div class="col-12 col-md-auto text-caption text-grey-6">
            Total Katalog:
            <span class="text-weight-bold text-brand-primary"
              >{{ rows.length }} Item Terdaftar</span
            >
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE SECTION -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print content-relative"
    >
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
            @click="openDetailView(null, props.row)"
          >
            <q-td key="kode" class="text-weight-medium text-grey-7">{{ props.row.kode }}</q-td>

            <q-td key="foto" class="text-center">
              <q-avatar size="40px" rounded color="grey-2" class="shadow-sm border-brand-thin">
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
                <div class="text-caption text-brand-primary text-weight-medium">
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
                <div class="text-weight-bolder text-brand-primary">
                  Rp {{ getMinPrice(props.row.vendor_prices).toLocaleString() }}
                </div>
                <div class="text-caption text-grey-6" style="font-size: 10px">Harga Terendah</div>
              </div>
              <div v-else class="text-grey-4">-</div>
            </q-td>
            <q-td key="kategori">
              <q-chip
                dense
                color="brand-light"
                text-color="brand-primary"
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
                  color="brand-primary"
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

    <!-- ============================================== -->
    <!-- VIEW: DETAIL BARANG ( DIALOG ORIGINAL )        -->
    <!-- ============================================== -->
    <q-dialog
      v-model="showDetail"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card
        class="bg-grey-2 column no-wrap print-fixed-card relative-position"
        v-if="selectedItem"
      >
        <!-- Background Animation di dalam Detail Dialog -->
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

        <q-toolbar
          class="bg-brand-primary text-white q-py-md shadow-2 shrink no-print content-relative"
        >
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest"
            >Profil Detail Material</q-toolbar-title
          >

          <q-btn
            unelevated
            color="white"
            text-color="brand-primary"
            icon="edit"
            label="Edit Data"
            @click="editFromDetail"
            v-if="canAction('ubah')"
            rounded
            class="q-px-md shadow-3 q-ml-md"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl print-content-area content-relative">
          <div id="material-detail-print" class="row justify-center print-container">
            <div class="col-12 col-lg-10">
              <div class="row q-col-gutter-xl print-row-fix">
                <!-- Visual & Info Utama -->
                <div class="col-12 col-md-4">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 overflow-hidden shadow-premium bg-white border-brand-thin"
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
                    <q-card-section class="bg-brand-primary text-white text-center print-brand-bg">
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
                        <q-icon name="category" color="brand-primary" size="sm" class="q-mr-sm" />
                        <div class="text-subtitle1 text-weight-bold uppercase text-brand-primary">
                          {{ selectedItem.kategori }}
                        </div>
                      </div>
                      <q-separator class="q-my-md" />
                      <div class="text-overline text-grey-6 uppercase">Satuan Ukur</div>
                      <div class="row items-center q-mt-sm text-brand-primary text-weight-bolder">
                        <q-icon name="straighten" color="brand-primary" size="sm" class="q-mr-sm" />
                        <div class="text-h6 uppercase">{{ selectedItem.unit }}</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Spesifikasi & Perbandingan Harga -->
                <div class="col-12 col-md-8">
                  <div
                    class="text-h3 text-weight-black text-brand-primary text-uppercase leading-tight q-mb-xs print-text-brand"
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
                            <div class="text-weight-bold text-brand-primary text-uppercase">
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
                            </div>
                          </td>
                          <td class="text-center no-print">
                            <q-btn
                              v-if="v.quotation_url || v.quotation_base64"
                              flat
                              round
                              color="brand-primary"
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
                        class="rounded-20 bg-brand-light text-brand-primary shadow-sm border-brand-thin"
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

    <!-- ============================================== -->
    <!-- VIEW 3: DIALOG FORM (TAMBAH/EDIT)              -->
    <!-- ============================================== -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(4px)"
    >
      <q-card class="bg-grey-2 column no-wrap relative-position">
        <!-- Background Animation di dalam Form Dialog -->
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

        <q-toolbar class="bg-white text-brand-primary q-py-md shadow-2 shrink content-relative">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest">
            {{ isEditMode ? 'Pembaruan Data Barang' : 'Registrasi Barang Baru' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="brand-primary"
            label="SIMPAN ITEM"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="simpanBarang"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg q-pa-md-xl content-relative">
          <div class="row justify-center">
            <div class="col-12 col-lg-11">
              <div class="row q-col-gutter-xl">
                <!-- FORM LEFT: IDENTITAS & FOTO -->
                <div class="col-12 col-md-5">
                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                    <div
                      class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-lg flex items-center"
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
                            class="shadow-2 border-brand-thin q-mb-sm overflow-hidden"
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
                              ><q-icon name="photo_camera" color="brand-primary"
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
                              color="brand-primary"
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
                              color="brand-primary"
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
                        class="text-subtitle1 text-brand-primary text-weight-bolder flex items-center"
                      >
                        <q-icon name="payments" class="q-mr-sm" /> PERBANDINGAN HARGA VENDOR
                      </div>
                      <q-btn
                        color="brand-primary"
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
                                ><q-icon name="cloud_upload" size="xs" color="brand-primary"
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
                                  color="brand-primary"
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
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- VIEW: DOCUMENT VIEWER -->
    <q-dialog v-model="showDocViewer" maximized transition-show="scale" transition-hide="scale">
      <q-card class="bg-grey-10">
        <q-toolbar class="bg-brand-primary text-white shadow-2">
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

const $q = useQuasar()
const authStore = useAuthStore()

// State Data Master
const filter = ref('')
// eslint-disable-next-line no-unused-vars
const activeView = ref('list')
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

// ==========================================
// ANIMASI KLIK & MENGAMBANG
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
  // Cegah animasi muncul bila yang diklik adalah komponen interaktif
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

  // Mengubah ukuran ikon spawn untuk di kurangi lagi (35px - 60px)
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
    ok: { color: 'brand-primary' },
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
    ok: { color: 'brand-primary' },
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

    // NOTIFIKASI SIMPAN BARANG SESUAI GAMBAR PERTAMA (HIJAU PREMIUM DENGAN CLOSE BUTTON & PROGRESS BAR)
    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Sinkronisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Data katalog barang telah tersimpan di database.</div>',
      color: 'positive',
      icon: 'task_alt',
      position: 'top',
      timeout: 4000,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })
  } catch (e) {
    console.error(e)
    $q.notify({ color: 'negative', message: 'Gagal Simpan: ' + e.message })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const hapusBarang = (data) => {
  // DIALOG KONFIRMASI HAPUS DIPERBAGUS SESUAI GAMBAR KETIGA (BATAL - OUTLINED GREY, YA, HAPUS - RED FILLED SHADOW)
  $q.dialog({
    title: '<div class="text-h5 text-weight-bolder text-negative q-mb-sm">Konfirmasi Hapus</div>',
    message: `Apakah Anda yakin ingin menghapus <b>${data.nama}</b>?<br/><span class="text-grey-7 text-caption block q-mt-xs">Data yang dihapus tidak dapat dikembalikan lagi.</span>`,
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
      label: 'Ya, Hapus',
      color: 'negative',
      unelevated: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold text-uppercase shadow-2',
    },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'master_barang', data.id))

      // NOTIFIKASI HAPUS BARANG SESUAI GAMBAR KEDUA (MERAH PREMIUM DENGAN CLOSE BUTTON & PROGRESS BAR)
      $q.notify({
        html: true,
        message:
          '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Data Terhapus!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Informasi barang telah ditarik secara permanen dari sistem.</div>',
        color: 'negative',
        icon: 'delete_forever',
        position: 'top',
        timeout: 4000,
        progress: true,
        classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
      })
    } catch (e) {
      console.error(e)
      $q.notify({ color: 'negative', message: 'Terjadi kesalahan saat menghapus.' })
    }
  })
}
</script>

<style scoped>
/* ===== GLOBAL THEME OVERRIDES (DARI CUSTOMER PAGE) ===== */
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
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.15); /* Disesuaikan dengan brand color (Teal) */
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
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
  background-color: #e6f5f4 !important; /* Soft Teal */
}
.text-brand-secondary {
  color: #2a8b83 !important;
}
.border-brand-thin {
  border: 2px solid #b2e5e2 !important; /* Soft Teal border */
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

/* Tombol Responsive Untuk Layar HP (Mobile) */
@media (max-width: 599px) {
  .btn-tambah-responsive {
    width: 100%;
  }
}

/* ===== ANIMASI BACKGROUND (FLOATING DARI BAWAH KE ATAS) ===== */
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
  bottom: -150px; /* Memulai posisi dari bawah layar */
  animation: floatUp linear infinite;
  opacity: 0.15; /* Sesuai contoh visual image_e62dcf.png */
  filter: blur(1.5px); /* Kebureman dikurangi dari 4px menjadi 1.5px (Tipis, tajam tapi lembut) */
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* Memberikan Warna-Warni pada masing-masing Ikon Melayang */
.i-1 {
  left: 10%;
  font-size: 100px;
  animation-duration: 25s;
  animation-delay: 0s;
  color: #36ada3;
} /* Teal */
.i-2 {
  left: 30%;
  font-size: 70px;
  animation-duration: 35s;
  animation-delay: 5s;
  color: #f29c1f;
} /* Yellow-Orange */
.i-3 {
  left: 60%;
  font-size: 120px;
  animation-duration: 40s;
  animation-delay: 12s;
  color: #e74c3c;
} /* Red */
.i-4 {
  left: 80%;
  font-size: 85px;
  animation-duration: 30s;
  animation-delay: 2s;
  color: #56c2b9;
} /* Light Teal */
.i-5 {
  left: 15%;
  font-size: 90px;
  animation-duration: 28s;
  animation-delay: 15s;
  color: #e67e22;
} /* Orange */
.i-6 {
  left: 45%;
  font-size: 110px;
  animation-duration: 45s;
  animation-delay: 8s;
  color: #2a8b83;
} /* Dark Teal */
.i-7 {
  left: 75%;
  font-size: 60px;
  animation-duration: 22s;
  animation-delay: 20s;
  color: #f29c1f;
} /* Yellow-Orange */
.i-8 {
  left: 25%;
  font-size: 95px;
  animation-duration: 32s;
  animation-delay: 25s;
  color: #e74c3c;
} /* Red */

/* Mengatur Animasi Bawah Ke Atas (Bottom to Top) */
@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.15; /* Sesuai dengan setelan opacity di floating-icon */
  }
  90% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
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

/* ===== EXISTING UTILITIES ===== */
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
  background-color: rgba(54, 173, 163, 0.05) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.animate-fade {
  animation: fadeIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
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
  background: #e6f5f4; /* Teal muda */
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
.content-relative {
  position: relative;
  z-index: 1;
}
</style>
