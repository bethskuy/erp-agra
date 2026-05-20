<template>
  <q-page class="bg-page q-pa-md q-pa-md-lg font-pro relative-position" @click="spawnIcon($event)">
    <!-- CLICK SPAWN ICONS CONTAINER -->
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

    <!-- BACKGROUND ANIMATION (ICONS) -->
    <div class="bg-animation-container">
      <q-icon name="engineering" class="floating-icon i-1" />
      <q-icon name="construction" class="floating-icon i-2" />
      <q-icon name="architecture" class="floating-icon i-3" />
      <q-icon name="location_city" class="floating-icon i-4" />
      <q-icon name="handyman" class="floating-icon i-5" />
      <q-icon name="apartment" class="floating-icon i-6" />
      <q-icon name="engineering" class="floating-icon i-7" />
      <q-icon name="carpenter" class="floating-icon i-8" />
      <q-icon name="domain" class="floating-icon i-9" />
      <q-icon name="foundation" class="floating-icon i-10" />
    </div>

    <!-- VIEW 1: DAFTAR SUPPLIER -->
    <template v-if="!showDetail">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl animate-fade content-relative">
        <div class="col-12 col-md-8 q-mb-md q-mb-md-none">
          <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
            Database Supplier
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
              >Vendor & Rantai Pasok</span
            >
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Kelola data mitra penyedia material dan jasa PT AGRA secara terintegrasi dan real-time.
          </div>
        </div>

        <!-- RESPONSIVE BUTTONS AREA -->
        <div class="col-12 col-md-4">
          <div class="row justify-end">
            <div class="col-12 col-sm-auto" v-if="canAction('buat')">
              <q-btn
                color="brand-primary"
                icon="add_business"
                label="Registrasi Supplier"
                unelevated
                rounded
                no-caps
                class="full-width q-px-lg q-py-sm shadow-premium btn-hover text-weight-bold"
                @click="openAddDialog"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SEARCH & STATS CARD -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white content-relative">
        <q-card-section class="q-py-md">
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari Nama Supplier atau PIC..."
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
            <div class="col-12 col-md-auto text-caption text-grey-6 sm-text-left text-right">
              Total Vendor:
              <span class="text-weight-bold text-brand-primary">{{ rows.length }} Perusahaan</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE SECTION -->
      <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white content-relative">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :filter="filter"
          binary-state-sort
          class="supplier-table"
        >
          <!-- Custom Header -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-brand-primary text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold uppercase font-11 tracking-widest"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Custom Body -->
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="hover-bg transition-all cursor-pointer"
              @click="onRowClick(null, props.row)"
            >
              <q-td key="nama">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="brand-light"
                    text-color="brand-primary"
                    class="q-mr-md text-weight-bold shadow-sm"
                  >
                    {{ props.row.nama?.charAt(0) }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-bold text-subtitle1 text-blue-grey-10">
                      {{ props.row.nama }}
                    </div>
                    <div class="text-caption text-grey-6">{{ props.row.kontak || 'No Phone' }}</div>
                  </div>
                </div>
              </q-td>
              <q-td key="email">
                <div class="text-weight-medium text-blue-grey-9">{{ props.row.email }}</div>
              </q-td>
              <q-td key="pic_nama">
                <div class="row items-center">
                  <q-icon name="person_pin" color="brand-primary" class="q-mr-xs" size="xs" />
                  <span class="text-weight-medium">{{ props.row.pic_nama || '-' }}</span>
                </div>
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
                    @click="openEditDialog(props.row)"
                  >
                    <q-tooltip>Perbarui Data</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="canAction('hapus')"
                    flat
                    round
                    color="brand-danger"
                    icon="delete_outline"
                    size="sm"
                    @click="confirmHapus(props.row)"
                  >
                    <q-tooltip>Hapus Data</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="brand-primary"
                    icon="chevron_right"
                    size="sm"
                    @click="onRowClick(null, props.row)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="business_center" size="64px" class="q-mb-md" />
              <div class="text-h6 full-width text-center">Data supplier tidak ditemukan</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- VIEW 2: DETAIL PROFIL LENGKAP -->
    <q-dialog
      v-model="showDetail"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-page column no-wrap" v-if="currentSupplier">
        <q-toolbar class="bg-brand-primary text-white q-py-md">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold">INFORMASI VENDOR</q-toolbar-title>
          <q-btn
            flat
            icon="edit"
            label="Edit Profil"
            @click="openEditFromDetail"
            v-if="canAction('ubah')"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
              <!-- Profil Header Card -->
              <q-card
                flat
                bordered
                class="rounded-20 shadow-premium q-mb-xl bg-white overflow-hidden"
              >
                <div class="row items-center">
                  <div
                    class="col-12 col-md-4 bg-brand-light flex flex-center q-pa-xl"
                    style="min-height: 250px"
                  >
                    <q-avatar
                      size="150px"
                      color="brand-primary"
                      text-color="white"
                      class="shadow-10 border-white-5"
                    >
                      <div class="text-h2">{{ currentSupplier.nama?.charAt(0) }}</div>
                    </q-avatar>
                  </div>
                  <div class="col-12 col-md-8 q-pa-xl">
                    <div class="text-h3 text-weight-bolder text-brand-primary q-mb-xs uppercase">
                      {{ currentSupplier.nama }}
                    </div>
                    <div class="text-h6 text-grey-7 q-mb-lg flex items-center">
                      <q-icon name="stars" color="orange-9" class="q-mr-sm" /> Verified Supplier
                    </div>

                    <div class="row q-col-gutter-lg">
                      <div class="col-12 col-sm-6">
                        <div class="text-overline text-grey-6 tracking-widest">Alamat Email</div>
                        <div class="text-subtitle1 text-weight-bold">
                          {{ currentSupplier.email }}
                        </div>
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="text-overline text-grey-6 tracking-widest">
                          Saluran Komunikasi
                        </div>
                        <div class="text-subtitle1 text-weight-bold text-brand-primary">
                          {{ currentSupplier.kontak }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card>

              <!-- Grid Informasi Detail -->
              <div class="row q-col-gutter-xl">
                <!-- Identitas & Alamat -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 shadow-sm bg-white full-height">
                    <q-card-section
                      class="bg-brand-light text-brand-dark text-weight-bold uppercase letter-spacing-1"
                    >
                      <q-icon name="fact_check" class="q-mr-sm" /> Legalitas & Domisili
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-lg">
                      <div class="q-gutter-y-lg">
                        <div class="row border-bottom-subtle q-pb-sm">
                          <div class="col-4 text-grey-7 text-weight-medium">Nomor NPWP</div>
                          <div class="col-8 text-weight-bolder text-brand-primary">
                            {{ currentSupplier.npwp || 'Tidak Terlampir' }}
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-4 text-grey-7 text-weight-medium">Lokasi Kantor</div>
                          <div class="col-8 text-grey-9 leading-relaxed">
                            {{ currentSupplier.alamat || '-' }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- PIC & Payment -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 shadow-sm bg-white full-height">
                    <q-card-section
                      class="bg-brand-light text-brand-dark text-weight-bold uppercase letter-spacing-1"
                    >
                      <q-icon name="payments" class="q-mr-sm" /> PIC & Informasi Bank
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-lg">
                      <div class="q-gutter-y-md">
                        <div class="row items-center border-bottom-subtle q-pb-sm">
                          <div class="col-4 text-grey-7 text-weight-medium">Nama PIC</div>
                          <div class="col-8 text-weight-bold">
                            {{ currentSupplier.pic_nama || '-' }}
                          </div>
                        </div>
                        <div class="row items-center border-bottom-subtle q-pb-sm">
                          <div class="col-4 text-grey-7 text-weight-medium">Kontak PIC</div>
                          <div class="col-8">{{ currentSupplier.pic_kontak || '-' }}</div>
                        </div>
                        <div class="row items-center">
                          <div class="col-4 text-grey-7 text-weight-medium">Instansi Bank</div>
                          <div class="col-8 text-weight-bold text-brand-primary uppercase">
                            {{ currentSupplier.rek_bank || '-' }}
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-4 text-grey-7 text-weight-medium">No. Rekening</div>
                          <div class="col-8 text-weight-bold text-brand-primary text-subtitle1">
                            {{ currentSupplier.rek_nomor || '-' }}
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-4 text-grey-7 text-weight-medium">Nama Pemilik</div>
                          <div class="col-8 text-caption uppercase">
                            {{ currentSupplier.rek_nama || '-' }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Arsip Dokumen -->
                <div class="col-12">
                  <q-card flat bordered class="rounded-20 shadow-sm bg-white overflow-hidden">
                    <q-card-section class="bg-brand-primary text-white text-weight-bold uppercase">
                      <q-icon name="folder_shared" class="q-mr-sm" /> Berkas Digital Terlampir
                    </q-card-section>
                    <q-list separator>
                      <q-expansion-item
                        v-for="(docItem, i) in currentSupplier.additional_docs"
                        :key="i"
                        icon="description"
                        :label="docItem.label"
                        header-class="text-weight-bold text-blue-grey-10"
                      >
                        <div class="q-pa-md bg-grey-3">
                          <iframe
                            :src="docItem.url || docItem.base64"
                            frameborder="0"
                            style="width: 100%; height: 550px; border-radius: 15px"
                            class="shadow-5 bg-white"
                          ></iframe>
                        </div>
                      </q-expansion-item>
                      <q-item v-if="!currentSupplier.additional_docs?.length">
                        <q-item-section class="text-center q-pa-xl text-grey-5 italic">
                          Tidak ada dokumen legalitas yang diunggah untuk vendor ini.
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-xl"></div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- VIEW 3: DIALOG FORM (TAMBAH/UPDATE) -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(4px)"
    >
      <q-card class="bg-page column no-wrap relative-position">
        <q-toolbar class="bg-white text-brand-primary q-py-md shadow-2 content-relative">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center">
            {{ isEditMode ? 'PEMBARUAN DATA VENDOR' : 'REGISTRASI VENDOR BARU' }}
          </q-toolbar-title>

          <!-- Tombol Simpan (Akan sembunyi di HP dan pindah ke bawah) -->
          <q-btn
            unelevated
            color="brand-primary"
            label="SIMPAN DATA"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-3 gt-sm"
            @click="simpanSupplier"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-lg-xl content-relative">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
              <!-- Tombol Simpan untuk versi Mobile (Membentang Penuh) -->
              <div class="lt-md q-mb-md">
                <q-btn
                  unelevated
                  color="brand-primary"
                  label="SIMPAN DATA"
                  :loading="submitting"
                  rounded
                  class="full-width q-py-sm text-weight-bold shadow-3"
                  @click="simpanSupplier"
                />
              </div>

              <div class="row q-col-gutter-xl">
                <!-- FORM BAGIAN KIRI: PROFIL & PIC -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                    <div
                      class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-lg flex items-center"
                    >
                      <q-icon name="storefront" class="q-mr-sm" /> INFORMASI UTAMA VENDOR
                    </div>
                    <div class="q-gutter-y-md">
                      <q-input
                        outlined
                        v-model="form.nama"
                        label="Nama Supplier / Vendor *"
                        stack-label
                        placeholder="Masukkan nama resmi perusahaan"
                      />
                      <div class="row q-col-gutter-md">
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.email"
                          label="Email Korespondensi *"
                          stack-label
                        />
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.kontak"
                          label="Telepon Kantor"
                          stack-label
                        />
                      </div>
                      <q-input
                        outlined
                        v-model="form.npwp"
                        label="Nomor NPWP"
                        mask="##.###.###.#-###.###"
                        stack-label
                      />
                      <q-input
                        outlined
                        v-model="form.alamat"
                        type="textarea"
                        label="Alamat Kantor Pusat"
                        rows="2"
                        autogrow
                        stack-label
                      />
                    </div>
                  </q-card>

                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1 q-mt-lg">
                    <div
                      class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-md flex items-center"
                    >
                      <q-icon name="person_search" class="q-mr-sm" /> PERSON IN CHARGE (PIC)
                    </div>
                    <div class="row q-col-gutter-md">
                      <q-input
                        class="col-12 col-sm-6"
                        outlined
                        v-model="form.pic_nama"
                        label="Nama Lengkap"
                        dense
                      />
                      <q-input
                        class="col-12 col-sm-6"
                        outlined
                        v-model="form.pic_kontak"
                        label="HP / WhatsApp"
                        dense
                      />
                    </div>
                  </q-card>
                </div>

                <!-- FORM BAGIAN KANAN: FINANSIAL & BERKAS -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                    <div
                      class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-lg flex items-center"
                    >
                      <q-icon name="account_balance_wallet" class="q-mr-sm" /> INFORMASI PEMBAYARAN
                    </div>
                    <div class="q-gutter-y-md">
                      <q-input
                        outlined
                        v-model="form.rek_nomor"
                        label="Nomor Rekening"
                        stack-label
                      />
                      <div class="row q-col-gutter-md">
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.rek_bank"
                          label="Nama Bank"
                          dense
                        />
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.rek_nama"
                          label="Atas Nama"
                          dense
                        />
                      </div>
                    </div>
                  </q-card>

                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1 q-mt-lg">
                    <div class="row items-center justify-between q-mb-lg">
                      <div
                        class="text-subtitle1 text-brand-primary text-weight-bolder flex items-center"
                      >
                        <q-icon name="upload_file" class="q-mr-sm" /> BERKAS LEGALITAS
                      </div>
                      <q-btn
                        round
                        unelevated
                        color="brand-primary"
                        icon="add"
                        size="sm"
                        @click="addDocRow"
                      />
                    </div>

                    <div
                      v-for="(item, index) in form.additional_docs"
                      :key="index"
                      class="q-mb-md q-pa-sm bg-grey-1 rounded-borders border-dashed"
                    >
                      <div class="row q-col-gutter-sm items-center">
                        <div class="col-12 col-sm-5">
                          <q-input
                            outlined
                            dense
                            v-model="item.label"
                            placeholder="ex: SIUP / NIB"
                            bg-color="white"
                          />
                        </div>
                        <div class="col-10 col-sm-5">
                          <q-file
                            outlined
                            dense
                            v-model="item.fileObj"
                            label="Pilih File"
                            bg-color="white"
                          >
                            <template v-slot:prepend
                              ><q-icon name="attach_file" size="xs"
                            /></template>
                            <template v-slot:append v-if="item.url || item.base64">
                              <q-icon name="check_circle" color="positive" size="xs" />
                            </template>
                          </q-file>
                        </div>
                        <div class="col-2 text-right">
                          <q-btn
                            flat
                            round
                            dense
                            color="brand-danger"
                            icon="delete_sweep"
                            size="sm"
                            @click="removeDocRow(index)"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="!form.additional_docs.length"
                      class="text-center q-pa-lg text-grey-5 dashed-box"
                    >
                      Lampirkan dokumen legalitas supplier di sini
                    </div>
                  </q-card>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const showDialog = ref(false)
const showDetail = ref(false)
const isEditMode = ref(false)
const filter = ref('')
const currentSupplier = ref(null)

// === CLICK SPAWN ICONS ===
const constructionIcons = [
  'engineering',
  'construction',
  'architecture',
  'handyman',
  'carpenter',
  'foundation',
  'domain',
  'apartment',
  'location_city',
  'build',
  'hardware',
  'home_repair_service',
  'plumbing',
  'bolt',
  'roofing',
  'fence',
]
const spawnColors = ['#36ada3', '#2a8b83', '#56c2b9', '#f29c1f', '#e67e22', '#e74c3c', '#ad3640']
const spawnedIcons = ref([])
let spawnIdCounter = 0

const spawnIcon = (event) => {
  const isInteractive = event.target.closest(
    'button, a, input, select, textarea, .q-btn, .q-table, .q-card, .q-input, .q-select, .q-dialog',
  )
  if (isInteractive) return
  const page = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - page.left
  const y = event.clientY - page.top
  const icon = {
    id: ++spawnIdCounter,
    name: constructionIcons[Math.floor(Math.random() * constructionIcons.length)],
    x: x - 20,
    y: y - 20,
    rotate: Math.floor(Math.random() * 360),
    color: spawnColors[Math.floor(Math.random() * spawnColors.length)],
    size: 28 + Math.floor(Math.random() * 28),
  }
  spawnedIcons.value.push(icon)
  setTimeout(() => {
    spawnedIcons.value = spawnedIcons.value.filter((i) => i.id !== icon.id)
  }, 1400)
}
const userData = ref(null)

let unsubUser = null
let unsubSupplier = null

const formDefault = {
  id: null,
  nama: '',
  email: '',
  kontak: '',
  npwp: '',
  alamat: '',
  pic_nama: '',
  pic_kontak: '',
  rek_nomor: '',
  rek_bank: '',
  rek_nama: '',
  additional_docs: [],
}
const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'IDENTITAS VENDOR', field: 'nama', sortable: true },
  { name: 'email', align: 'left', label: 'EMAIL RESMI', field: 'email', sortable: true },
  { name: 'pic_nama', align: 'left', label: 'PENANGGUNG JAWAB', field: 'pic_nama' },
  { name: 'aksi', align: 'center', label: 'AKSI KELOLA', field: 'aksi' },
]

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_master_supplier'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const processHybridUpload = async (file, pathName) => {
  if (!file) return null
  if (file.size <= 512000) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
    })
  } else {
    const sRef = storageRef(storage, `suppliers/legal/${Date.now()}_${pathName}`)
    const snap = await uploadBytes(sRef, file)
    return await getDownloadURL(snap.ref)
  }
}

const addDocRow = () =>
  form.value.additional_docs.push({ label: '', url: '', base64: '', fileObj: null })
const removeDocRow = (i) => form.value.additional_docs.splice(i, 1)

const simpanSupplier = async () => {
  if (!form.value.nama) {
    $q.notify({ type: 'warning', message: 'Nama Supplier wajib diisi' })
    return
  }
  $q.loading.show({ message: 'Menyimpan data vendor...' })
  submitting.value = true
  try {
    for (let item of form.value.additional_docs) {
      if (item.fileObj) {
        const result = await processHybridUpload(item.fileObj, item.label || 'Doc')
        if (result.startsWith('http')) {
          item.url = result
          item.base64 = ''
        } else {
          item.base64 = result
          item.url = ''
        }
        delete item.fileObj
      }
    }
    const payload = JSON.parse(JSON.stringify(form.value))
    payload.updatedAt = serverTimestamp()
    const docId = payload.id
    delete payload.id
    if (isEditMode.value) {
      await updateDoc(doc(db, 'suppliers', docId), payload)
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'suppliers'), payload)
    }
    showDialog.value = false

    // NOTIFIKASI MODERN HTML (Sama seperti Customer Page)
    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Sinkronisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Data profil vendor telah tersimpan di database.</div>',
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
    $q.notify({ color: 'negative', message: 'Gagal sinkronisasi data.' })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const onRowClick = (e, row) => {
  currentSupplier.value = row
  showDetail.value = true
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  showDialog.value = true
}

const openEditFromDetail = () => {
  form.value = JSON.parse(JSON.stringify(currentSupplier.value))
  isEditMode.value = true
  showDetail.value = false
  showDialog.value = true
}

const confirmHapus = (r) => {
  $q.dialog({
    title: '<span class="text-weight-bold text-red">Konfirmasi Hapus</span>',
    message: `Anda akan menghapus data vendor <b>${r.nama}</b> secara permanen dari sistem. Lanjutkan?`,
    html: true,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Ya, Hapus', color: 'negative', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'suppliers', r.id))
      // NOTIFIKASI MODERN HTML
      $q.notify({
        html: true,
        message:
          '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Data Terhapus!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Informasi vendor telah ditarik secara permanen dari sistem.</div>',
        color: 'negative',
        icon: 'delete_forever',
        position: 'top',
        timeout: 4000,
        progress: true,
        classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
      })
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal menghapus data.' })
    }
  })
}

onMounted(() => {
  // 1. Pantau Hak Akses User
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }

  // 2. Pantau Data Supplier secara Real-time
  const qSupplier = query(collection(db, 'suppliers'), orderBy('createdAt', 'desc'))
  unsubSupplier = onSnapshot(
    qSupplier,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Firestore Listen Error:', err)
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubSupplier) unsubSupplier()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

/* ===== BRAND COLOR PALETTE ===== */
.bg-brand-primary {
  background-color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e0f5f4 !important;
}
.bg-page {
  background-color: #f0fafa !important;
}
.text-brand-primary {
  color: #1e6e69 !important;
}
.text-brand-dark {
  color: #1e4a47 !important;
}
.text-brand-teal {
  color: #36ada3 !important;
}

:deep(.q-btn[color='brand-primary']) {
  background-color: #36ada3 !important;
  color: white !important;
}
:deep(.q-btn--flat[color='brand-primary']) {
  color: #36ada3 !important;
  background: transparent !important;
}
:deep(.q-btn--flat[color='brand-danger']) {
  color: #ad3640 !important;
  background: transparent !important;
}
:deep(.q-avatar[color='brand-primary']) {
  background-color: #36ada3 !important;
  color: white !important;
}
:deep(.q-avatar[color='brand-light']) {
  background-color: #e0f5f4 !important;
  color: #1e6e69 !important;
}
:deep(.q-icon[color='brand-primary']) {
  color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}
:deep(.q-field__prepend .q-icon) {
  color: #36ada3 !important;
}

.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.relative-position {
  position: relative;
}
.content-relative {
  position: relative;
  z-index: 1;
}

/* =======================================================================
   BACKGROUND ANIMATION CSS (Diambil dari CustomerPage)
   ======================================================================= */
.bg-animation-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  bottom: -150px;
  animation: floatUp infinite linear;
}

.i-1 {
  left: 10%;
  font-size: 80px;
  animation-duration: 25s;
  animation-delay: 0s;
  color: #36ada3; /* Teal */
}
.i-2 {
  left: 25%;
  font-size: 120px;
  animation-duration: 30s;
  animation-delay: 5s;
  color: #f29c1f; /* Yellow-Orange */
}
.i-3 {
  left: 45%;
  font-size: 60px;
  animation-duration: 22s;
  animation-delay: 2s;
  color: #e74c3c; /* Red */
}
.i-4 {
  left: 60%;
  font-size: 100px;
  animation-duration: 28s;
  animation-delay: 8s;
  color: #56c2b9; /* Light Teal */
}
.i-5 {
  left: 80%;
  font-size: 70px;
  animation-duration: 26s;
  animation-delay: 4s;
  color: #e67e22; /* Orange */
}
.i-6 {
  left: 90%;
  font-size: 150px;
  animation-duration: 35s;
  animation-delay: 1s;
  color: #2a8b83; /* Dark Teal */
}
.i-7 {
  left: 5%;
  font-size: 90px;
  animation-duration: 20s;
  animation-delay: 12s;
  color: #f29c1f; /* Yellow-Orange */
}
.i-8 {
  left: 75%;
  font-size: 110px;
  animation-duration: 32s;
  animation-delay: 10s;
  color: #e74c3c; /* Red */
}
.i-9 {
  left: 35%;
  font-size: 130px;
  animation-duration: 27s;
  animation-delay: 15s;
  color: #36ada3; /* Teal */
}
.i-10 {
  left: 50%;
  font-size: 85px;
  animation-duration: 24s;
  animation-delay: 7s;
  color: #ad3640; /* Dark Red / Brand Danger */
}

/* Mengatur opacity animasi agar warnanya lebih soft (watermark) dan tidak menghalangi teks */
@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.2; /* Dibuat sedikit memudar layaknya watermark */
  }
  90% {
    opacity: 0.2; /* Dibuat sedikit memudar layaknya watermark */
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
}

.rounded-20 {
  border-radius: 20px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.2);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.dashed-box {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.supplier-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}
.hover-bg:hover {
  background-color: rgba(54, 173, 163, 0.06) !important;
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

.font-11 {
  font-size: 11px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.border-white-5 {
  border: 5px solid white;
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}

/* Responsivitas untuk teks jumlah di HP */
@media (max-width: 599px) {
  .sm-text-left {
    text-align: left !important;
    margin-top: 8px;
  }
}

/* ===== CLICK SPAWN ICONS ===== */
.click-spawn-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
}
.spawned-icon {
  position: absolute;
  color: var(--rand-color);
  pointer-events: none;
  animation: spawnBurst 1.4s ease-out forwards;
}
@keyframes spawnBurst {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.4) rotate(calc(var(--rand-rotate) * 0.5));
    opacity: 1;
  }
  60% {
    transform: translate(-50%, calc(-50% - 40px)) scale(1.1) rotate(var(--rand-rotate));
    opacity: 0.85;
  }
  100% {
    transform: translate(-50%, calc(-50% - 80px)) scale(0.6) rotate(calc(var(--rand-rotate) * 1.5));
    opacity: 0;
  }
}
.spawn-enter-active {
  animation: spawnBurst 1.4s ease-out forwards;
}
.spawn-leave-active {
  display: none;
}
</style>
