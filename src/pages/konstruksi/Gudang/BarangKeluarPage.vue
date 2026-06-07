<template>
  <q-page class="bg-page q-pa-md q-pa-md-lg font-pro">
    <div class="page-content-wrapper">
      <!-- =====================================================================================
           HEADER SECTION (UI LAYAR)
           ===================================================================================== -->
      <div class="row items-center justify-between no-wrap q-mb-xl animate-fade no-print">
        <div class="col-12 col-md-8">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="brand-primary"
              icon="arrow_back"
              @click="router.back()"
              class="q-mr-md bg-white shadow-1 transition-all btn-hover"
            />
            <div>
              <div
                class="text-h4 text-weight-bolder text-brand-primary leading-tight"
              >
                Otorisasi Pengeluaran Material
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
                  Gudang Aktif: {{ gudangName || 'Loading...' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none" v-if="processDone">
          <q-btn
            color="brand-danger"
            icon="picture_as_pdf"
            label="DOWNLOAD SURAT JALAN (PDF)"
            unelevated
            rounded
            class="q-px-xl q-py-md text-weight-black shadow-10 animate-bounce-subtle"
            @click="exportToPDF"
          />
        </div>
      </div>

      <!-- =====================================================================================
           MAIN FORM AREA (NO-PRINT)
           ===================================================================================== -->
      <div class="row q-col-gutter-lg justify-center no-print">
        <div class="col-12 col-md-8 animate-fade-up">
          <q-card
            flat
            bordered
            class="rounded-20 shadow-premium bg-white overflow-hidden border-subtle"
          >
            <q-card-section class="bg-brand-primary text-white q-pa-lg row items-center">
              <q-icon name="send" size="sm" class="q-mr-sm" />
              <div class="text-h6 text-weight-black uppercase tracking-widest">
                Formulir Alokasi & Distribusi
              </div>
            </q-card-section>

            <q-card-section class="q-pa-xl">
              <q-form @submit.prevent="prosesBarangKeluar" class="q-gutter-y-lg">
                <!-- JENIS DISTRIBUSI -->
                <div class="row q-col-gutter-md q-mb-lg">
                  <div class="col-12">
                    <div
                      class="text-caption text-weight-bold text-grey-7 uppercase q-mb-sm tracking-widest font-pro"
                    >
                      Klasifikasi Tujuan Pengiriman
                    </div>
                    <q-btn-toggle
                      v-model="form.tipe"
                      spread
                      spread-mobile
                      no-caps
                      rounded
                      unelevated
                      toggle-color="primary"
                      color="grey-2"
                      text-color="grey-7"
                      class="border-subtle barang-keluar-toggle"
                      :options="[
                        { label: 'Internal Project (Tarik SPK)', value: 'INTERNAL' },
                        { label: 'External Project / Pihak Luar', value: 'EXTERNAL' },
                      ]"
                      @update:model-value="onTipeChange"
                    />
                  </div>
                </div>

                <!-- ADMINISTRASI & TUJUAN -->
                <div class="row q-col-gutter-lg items-start">
                  <div class="col-12 col-sm-6" v-if="form.tipe === 'INTERNAL'">
                    <q-select
                      outlined
                      v-model="selectedProyek"
                      label="Tujuan Proyek"
                      :options="proyekOptions"
                      option-label="nama"
                      readonly
                      bg-color="grey-1"
                      class="text-weight-bold"
                      behavior="menu"
                    >
                      <template v-slot:prepend><q-icon name="business" color="brand-primary" /></template>
                    </q-select>
                  </div>

                  <div
                    class="col-12 col-sm-6"
                    v-if="form.tipe === 'INTERNAL' && gudangId !== 'UTAMA'"
                  >
                    <q-select
                      outlined
                      v-model="form.noSpk"
                      label="Pilih No. SPK (Referensi Kontrak) *"
                      :options="spkOptions"
                      option-label="nomor_spk"
                      option-value="nomor_spk"
                      emit-value
                      map-options
                      :rules="[(val) => !!val || 'Nomor SPK wajib dilampirkan']"
                      behavior="menu"
                    >
                      <template v-slot:prepend
                        ><q-icon name="description" color="brand-primary"
                      /></template>
                    </q-select>
                  </div>

                  <div class="col-12 col-sm-6" v-if="form.tipe === 'EXTERNAL'">
                    <q-input
                      outlined
                      v-model="form.penerimaExternal"
                      label="Nama Customer / Instansi *"
                      placeholder="Masukkan identitas pihak luar..."
                      :rules="[(val) => !!val || 'Nama penerima wajib diisi']"
                    >
                      <template v-slot:prepend
                        ><q-icon name="apartment" color="brand-primary"
                      /></template>
                    </q-input>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      outlined
                      v-model="form.up"
                      label="Nama UP (Attention) *"
                      placeholder="Nama person in charge penerima..."
                      :rules="[(val) => !!val || 'Nama PIC penerima wajib diisi']"
                    >
                      <template v-slot:prepend
                        ><q-icon name="person_pin" color="brand-primary"
                      /></template>
                    </q-input>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      outlined
                      v-model="form.nomorSj"
                      label="No. Surat Jalan (Sistem)"
                      stack-label
                      bg-color="grey-1"
                      class="text-weight-bolder"
                    >
                      <template v-slot:prepend><q-icon name="tag" color="grey-7" /></template>
                    </q-input>
                  </div>
                </div>

                <q-separator inset class="q-my-md" />

                <!-- SEKSI MATERIAL (MULTI-ITEM) -->
                <div class="row items-center justify-between q-mb-sm">
                  <div
                    class="text-subtitle1 text-weight-black text-brand-primary uppercase flex items-center tracking-widest"
                  >
                    <q-icon name="list_alt" class="q-mr-sm" color="brand-primary" size="sm" />
                    Rincian Material & Keterangan Item
                  </div>
                  <q-btn
                    color="brand-primary"
                    icon="add"
                    label="Tambah Baris"
                    rounded
                    unelevated
                    size="sm"
                    @click="addItemRow"
                    class="q-px-md shadow-2 btn-hover"
                  />
                </div>

                <div class="column q-gutter-y-sm">
                  <q-card
                    v-for="(item, index) in form.items"
                    :key="index"
                    flat
                    bordered
                    class="rounded-12 bg-grey-1 border-subtle transition-all hover-shadow"
                  >
                    <q-card-section class="q-pa-md">
                      <div class="row q-col-gutter-md items-start">
                        <div class="col-12 col-sm-5">
                          <q-select
                            outlined
                            dense
                            v-model="item.barang_obj"
                            label="Pilih Material *"
                            :options="filteredBarangOptions"
                            option-label="nama_barang"
                            @update:model-value="(val) => onBarangSelectRow(val, index)"
                            use-input
                            @filter="filterBarangStock"
                            bg-color="white"
                            behavior="menu"
                          >
                            <template v-slot:prepend
                              ><q-icon name="inventory_2" color="brand-primary" size="xs"
                            /></template>
                          </q-select>
                        </div>

                        <div class="col-6 col-sm-3">
                          <q-input
                            outlined
                            dense
                            v-model.number="item.jumlah"
                            label="Volume *"
                            type="number"
                            bg-color="white"
                            :rules="[
                              (val) => val > 0 || 'Min 1',
                              (val) => val <= (item.stok_tersedia || 0) || 'Stok Kurang!',
                            ]"
                          >
                            <template v-slot:append>
                              <span class="text-caption text-weight-bold uppercase text-grey-7">{{
                                item.satuan || '-'
                              }}</span>
                            </template>
                          </q-input>
                        </div>

                        <div class="col-6 col-sm-4 text-center flex flex-center">
                          <div
                            class="q-pa-sm bg-white rounded-borders border-subtle full-width"
                            style="height: 40px"
                          >
                            <span class="text-caption text-grey-6 q-mr-xs font-black uppercase"
                              >Fisik:</span
                            >
                            <span class="text-weight-black text-brand-primary">{{
                              item.stok_tersedia || 0
                            }}</span>
                          </div>
                        </div>

                        <div class="col-11">
                          <q-input
                            outlined
                            dense
                            v-model="item.keterangan_item"
                            label="Keterangan Spesifik Barang"
                            placeholder="Keterangan per baris barang..."
                            bg-color="white"
                          />
                        </div>

                        <div class="col-1 text-right">
                          <q-btn
                            flat
                            round
                            dense
                            color="brand-danger"
                            icon="delete_outline"
                            size="sm"
                            @click="removeItemRow(index)"
                            :disable="form.items.length === 1"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- CATATAN UMUM (LINGKARAN MERAH BOS) -->
                <div
                  class="text-caption text-weight-bold text-brand-primary uppercase q-mt-lg tracking-widest"
                >
                  Catatan Umum / Instruksi Pengiriman
                </div>
                <q-input
                  outlined
                  v-model="form.catatan_umum"
                  label="Tuliskan catatan umum atau instruksi pengiriman di sini..."
                  type="textarea"
                  rows="4"
                  placeholder="Catatan ini akan tampil tepat di bawah tabel rincian pada detail riwayat transaksi."
                />

                <!-- LAMPIRAN DOKUMENTASI -->
                <div class="q-mt-lg">
                  <div class="row items-center justify-between q-col-gutter-y-sm q-mb-md">
                    <div
                      class="text-subtitle1 text-weight-black text-brand-primary uppercase flex items-center tracking-widest"
                    >
                      <q-icon name="cloud_upload" class="q-mr-sm" size="sm" /> Dokumentasi Lapangan &
                      Bukti Fisik
                    </div>
                    <q-btn
                      color="brand-primary"
                      icon="add_a_photo"
                      label="Tambah Bukti"
                      rounded
                      unelevated
                      size="sm"
                      @click="addDocumentationRow"
                      class="q-px-md shadow-2"
                    />
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div
                      v-for="(doc, dIdx) in form.documentations"
                      :key="dIdx"
                      class="col-12 col-sm-6"
                    >
                      <q-card flat bordered class="rounded-12 bg-grey-1 border-subtle">
                        <q-card-section class="q-pa-sm">
                          <div class="row q-col-gutter-xs items-center no-wrap">
                            <div class="col">
                              <q-file
                                outlined
                                dense
                                v-model="doc.file"
                                label="Pilih File..."
                                bg-color="white"
                                accept="image/*, .pdf"
                              />
                            </div>
                            <div class="col-auto">
                              <q-btn
                                flat
                                round
                                dense
                                color="brand-danger"
                                icon="cancel"
                                size="sm"
                                @click="removeDocumentationRow(dIdx)"
                              />
                            </div>
                          </div>
                          <q-input
                            outlined
                            dense
                            v-model="doc.label"
                            label="Nama Lampiran"
                            class="q-mt-xs"
                            bg-color="white"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <div class="row justify-end q-mt-xl">
                <q-btn
                  label="Konfirmasi Pengeluaran"
                  type="submit"
                  color="brand-primary"
                  class="rounded-20 q-px-lg text-weight-bold shadow-premium btn-hover"
                  unelevated
                  icon="rocket_launch"
                  :loading="loading"
                  :disable="processDone"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- PANEL KANAN: BRANDING PDF -->
      <div class="col-12 col-md-4 animate-fade-up" style="animation-delay: 0.2s">
        <q-card
          flat
          bordered
          class="rounded-20 bg-white shadow-premium border-subtle sticky-editor h-full"
        >
          <q-card-section
            class="bg-brand-light text-brand-primary text-weight-bolder uppercase tracking-widest"
          >
            <q-icon name="tune" class="q-mr-sm" /> Branding PDF Surat Jalan
          </q-card-section>
          <q-card-section class="q-pa-lg q-gutter-y-md">
            <q-file
              outlined
              dense
              v-model="kopFile"
              label="Ganti Logo Perusahaan..."
              accept="image/*"
              @update:model-value="handleLogoUpload"
            >
              <template v-slot:prepend><q-icon name="cloud_upload" color="brand-primary" /></template>
            </q-file>
            <q-input
              outlined
              dense
              v-model="form.nama_perusahaan"
              label="Nama Perusahaan (Header)"
            />
            <q-input
              outlined
              dense
              v-model="form.slogan_perusahaan"
              label="Slogan / Bidang Usaha"
            />
            <q-input
              outlined
              dense
              v-model="form.lokasi_detail"
              label="Alamat Detail Lokasi Tujuan"
            />
            <q-input
              outlined
              dense
              v-model="form.footer_note"
              label="Instruksi Kecil (Bawah Surat)"
              type="textarea"
              rows="2"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>

    <!-- HIDDEN PDF TEMPLATE -->
    <div style="position: absolute; left: -9999px; top: -9999px">
      <div id="sj-pdf-target" class="perfectionist-paper">
        <div class="row no-wrap items-center q-mb-md">
          <div class="col-auto">
            <img :src="form.logoUrl || '/icons/logo-agra.png'" class="final-kop-img q-mr-md" />
          </div>
          <div class="col text-left">
            <div class="text-pt-pro leading-none">{{ form.nama_perusahaan }}</div>
            <div class="text-pt-tagline italic text-blue-grey-9 text-weight-bold">
              {{ form.slogan_perusahaan }}
            </div>
          </div>
        </div>
        <div class="pro-divider-thick q-mb-md"></div>
        <!-- Metadata Tujuan & Reff (Side-by-Side dengan SURAT JALAN) -->
        <div class="row q-col-gutter-lg q-mb-lg items-start text-left">
          <!-- Sisi Kiri: Kepada Yth, Lokasi, Up -->
          <div class="col-7">
            <div class="row no-wrap items-start" style="font-size: 12px;">
              <div class="text-weight-bold text-grey-7" style="width: 80px;">Kepada Yth</div>
              <div class="q-mr-sm text-grey-7">:</div>
              <div class="col text-weight-black text-indigo-10 uppercase font-bold font-pro" style="font-size: 13.5px; line-height: 1.2;">
                {{ form.tipe === 'INTERNAL' ? selectedProyek?.nama || '-' : form.penerimaExternal }}
              </div>
            </div>
            <div class="row no-wrap items-start q-mt-sm" style="font-size: 12px;">
              <div class="text-weight-bold text-grey-7" style="width: 80px;">Lokasi</div>
              <div class="q-mr-sm text-grey-7">:</div>
              <div class="col underline-dotted text-blue-grey-10 text-weight-bold">
                {{ form.lokasi_detail || '...................' }}
              </div>
            </div>
            <div class="row no-wrap items-start q-mt-sm" style="font-size: 12px;">
              <div class="text-weight-bold text-grey-7" style="width: 80px;">Up</div>
              <div class="q-mr-sm text-grey-7">:</div>
              <div class="col underline-dotted text-blue-grey-10 text-weight-bold">
                {{ form.up || '...................' }}
              </div>
            </div>
          </div>

          <!-- Sisi Kanan: SURAT JALAN & Metadata Surat (No. SJ, No. Reff, Tanggal) -->
          <div class="col-5 text-right font-pro">
            <div class="text-weight-black text-indigo-10 uppercase tracking-widest leading-none" style="font-size: 18px; margin-top: 0px; margin-bottom: 8px; line-height: 1.2;">
              SURAT JALAN
            </div>
            
            <div class="row justify-end">
              <div style="width: 245px; text-align: left;">
                <div class="row no-wrap items-center q-mb-xs" style="font-size: 12px; line-height: 1.2;">
                  <div class="text-weight-bold text-indigo-10" style="width: 80px;">No. SJ</div>
                  <div class="text-weight-bold text-indigo-10 q-mr-xs">:</div>
                  <div class="col text-weight-bold text-indigo-10 font-mono">{{ form.nomorSj }}</div>
                </div>
                <div class="row no-wrap items-center q-mb-xs" style="font-size: 12px; line-height: 1.2;">
                  <div class="text-weight-bold text-grey-7" style="width: 80px;">No Reff</div>
                  <div class="text-weight-bold text-grey-7 q-mr-xs">:</div>
                  <div class="col text-weight-bold text-grey-9 font-mono">
                    {{
                      form.tipe === 'INTERNAL' && gudangId !== 'UTAMA'
                        ? form.noSpk || 'INTERNAL'
                        : 'EXTERNAL'
                    }}
                  </div>
                </div>
                <div class="row no-wrap items-center q-mb-xs" style="font-size: 12px; line-height: 1.2;">
                  <div class="text-weight-bold text-grey-7" style="width: 80px;">Tanggal</div>
                  <div class="text-weight-bold text-grey-7 q-mr-xs">:</div>
                  <div class="col text-weight-bold text-grey-9">
                    {{
                      new Date().toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table class="perfectionist-table full-width">
          <thead>
            <tr>
              <th width="45">NO</th>
              <th class="text-left">ITEM DESCRIPTION / MATERIAL NAME</th>
              <th width="80">QTY</th>
              <th width="90">SATUAN</th>
              <th class="text-left">KETERANGAN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in form.items" :key="i">
              <td class="text-center font-bold">{{ i + 1 }}</td>
              <td class="text-weight-black uppercase text-left">{{ item.nama_barang }}</td>
              <td class="text-center text-weight-black">{{ item.jumlah }}</td>
              <td class="text-center uppercase font-bold">{{ item.satuan }}</td>
              <td class="text-left text-blue-grey-8 italic">{{ item.keterangan_item || '-' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-grey-1">
              <td colspan="2" class="text-right text-weight-black uppercase">
                TOTAL ITEM TERKIRIM
              </td>
              <td class="text-center text-weight-black text-h6">{{ form.items.length }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
        <div class="q-mt-md q-mb-xl text-left">
          <div class="text-weight-black italic q-mb-xs">Instruksi Khusus :</div>
          <div
            class="q-pa-md border-black-solid"
            style="min-height: 80px; font-size: 12.5px; white-space: pre-wrap; line-height: 1.6"
          >
            {{
              form.catatan_umum ||
              'Barang dikirim dalam kondisi baik, tersegel, dan sesuai rincian di atas.'
            }}
          </div>
        </div>
        <!-- Footer Signature Grid -->
        <div class="q-mt-xl text-center" style="font-size: 14px">
          <!-- Baris 1: Jabatan / Peran -->
          <div class="row justify-between text-weight-black">
            <div class="col-3">Petugas Gudang</div>
            <div class="col-3">Pihak Pengirim</div>
            <div class="col-3">Pihak Penerima</div>
          </div>
          
          <!-- Baris 2: Nama / Tanda Tangan (Disejajarkan pada baseline bawah agar rapi jika ada nama yang turun 2 baris) -->
          <div class="row justify-between items-end" style="margin-top: 60px;">
            <div class="col-3 text-weight-black underline text-indigo-10 uppercase" style="line-height: 1.2;">
              {{ authStore.user?.nama || 'Petugas' }}
            </div>
            <div class="col-3 text-weight-black">
              (..............................)
            </div>
            <div class="col-3 text-weight-black">
              (..............................)
            </div>
          </div>
          
          <!-- Baris 3: Sub-Keterangan / Cap -->
          <div class="row justify-between items-start q-mt-xs text-caption text-bold text-grey-8 uppercase">
            <div class="col-3">( {{ gudangName }} )</div>
            <div class="col-3">Driver / Kurir</div>
            <div class="col-3">Nama Jelas & Cap</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  // eslint-disable-next-line no-unused-vars
  updateDoc,
  increment,
  // eslint-disable-next-line no-unused-vars
  addDoc,
  serverTimestamp,
  // eslint-disable-next-line no-unused-vars
  orderBy,
  getDoc,
  runTransaction,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const gudangId = route.params.id || 'UTAMA'

const loading = ref(false)
const processDone = ref(false)
const gudangName = ref('Memuat...')
const kopFile = ref(null)

const form = reactive({
  tipe: 'INTERNAL',
  idProyek: null,
  noSpk: '',
  up: '',
  penerimaExternal: '',
  nomorSj: '',
  items: [
    {
      barang_obj: null,
      id_barang_stok: '',
      nama_barang: '',
      kode_barang: '',
      jumlah: 0,
      satuan: '',
      stok_tersedia: 0,
      keterangan_item: '',
    },
  ],
  documentations: [],
  catatan_umum: '',
  ekspedisi: 'Driver Internal',
  nama_perusahaan: 'PT AGRA ABHINAYA PERKASA',
  slogan_perusahaan: 'General Construction & General Supplier',
  lokasi_detail: '',
  logoUrl: '',
  footer_note: '',
})

const selectedProyek = ref(null)
const proyekOptions = ref([])
const spkOptions = ref([])
const allWarehouseStock = ref([])
const filteredBarangOptions = ref([])

const addItemRow = () => {
  form.items.push({
    barang_obj: null,
    id_barang_stok: '',
    nama_barang: '',
    kode_barang: '',
    jumlah: 0,
    satuan: '',
    stok_tersedia: 0,
    keterangan_item: '',
  })
}
const removeItemRow = (idx) => {
  if (form.items.length > 1) form.items.splice(idx, 1)
}

// --- FIX: SAKLEK NARIK KODE BARANG ASLI ---
const onBarangSelectRow = async (val, idx) => {
  if (val) {
    form.items[idx].id_barang_stok = val.id
    form.items[idx].nama_barang = val.nama_barang
    form.items[idx].satuan = val.satuan || 'Unit'
    form.items[idx].stok_tersedia = val.jumlah || 0

    // TARIK KODE ASLI DARI MASTER
    try {
      const bSnap = await getDoc(doc(db, 'master_barang', val.id_barang))
      if (bSnap.exists()) form.items[idx].kode_barang = bSnap.data().kode || 'NO-CODE'
    } catch (e) {
      console.error(e)
    }
  }
}

const generateSjNumber = () => {
  const now = new Date()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()
  const random = Math.floor(1000 + Math.random() * 9000)
  form.nomorSj = `SJ/AAP/${month}/${year}/${random}`
}

const fetchData = async () => {
  $q.loading.show()
  try {
    const projSnap = await getDocs(collection(db, 'proyek'))
    proyekOptions.value = projSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    if (gudangId === 'UTAMA') {
      gudangName.value = 'Gudang Utama'
      selectedProyek.value = { id: 'UTAMA', nama: 'Gudang Utama' }
      form.lokasi_detail = 'Kantor Pusat AGRA'
    } else {
      const foundProj = proyekOptions.value.find((p) => p.id === gudangId)
      if (foundProj) {
        gudangName.value = 'Gudang ' + foundProj.nama
        selectedProyek.value = foundProj
        form.lokasi_detail = foundProj.alamat || ''
        const qSpk = query(collection(db, 'spk_customer'), where('projectId', '==', foundProj.id))
        const spkSnap = await getDocs(qSpk)
        spkOptions.value = spkSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      }
    }
    const stokSnap = await getDocs(
      query(collection(db, 'stok_barang'), where('id_gudang', '==', gudangId)),
    )
    allWarehouseStock.value = stokSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    filteredBarangOptions.value = allWarehouseStock.value.filter((b) => (b.jumlah || 0) > 0)
    generateSjNumber()
  } catch (err) {
    console.error(err)
  } finally {
    $q.loading.hide()
  }
}

const filterBarangStock = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredBarangOptions.value = allWarehouseStock.value.filter(
      (b) => b.nama_barang.toLowerCase().indexOf(needle) > -1 && (b.jumlah || 0) > 0,
    )
  })
}
const handleLogoUpload = (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    form.logoUrl = reader.result
  }
}
const onTipeChange = () => {
  generateSjNumber()
}

const prosesBarangKeluar = async () => {
  const validItems = form.items.filter((it) => it.barang_obj && it.jumlah > 0)
  if (validItems.length === 0) return $q.notify({ type: 'warning', message: 'Input barang!' })
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Keluarkan material?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    $q.loading.show({ message: 'Syncing Cloud...' })
    try {
      const uploadedDocs = []
      for (const docItem of form.documentations) {
        if (docItem.file) {
          const fileName = `DOK_KELUAR_${Date.now()}_${docItem.file.name.replace(/\s+/g, '_')}`
          const snap = await uploadBytes(
            storageRef(storage, `barang_keluar/dokumentasi/${fileName}`),
            docItem.file,
          )
          const url = await getDownloadURL(snap.ref)
          uploadedDocs.push({
            label: docItem.label || 'Lampiran',
            url: url,
            mimeType: docItem.file.type,
          })
        }
      }
      await runTransaction(db, async (transaction) => {
        for (const item of validItems) {
          const stokRef = doc(db, 'stok_barang', item.id_barang_stok)
          transaction.update(stokRef, {
            jumlah: increment(-Number(item.jumlah)),
            updated_at: serverTimestamp(),
          })
          const logRef = doc(collection(db, 'aktivitas'))
          transaction.set(logRef, {
            id_gudang: gudangId,
            id_barang: item.id_barang_stok,
            nama_barang: item.nama_barang,
            kode_barang: item.kode_barang, // SAKLEK! Simpan Kode asli
            jumlah: item.jumlah,
            satuan: item.satuan,
            tipe: 'KELUAR',
            no_referensi: form.nomorSj,
            no_spk:
              form.tipe === 'INTERNAL' && gudangId !== 'UTAMA'
                ? form.noSpk || 'INTERNAL'
                : 'EXTERNAL',
            keterangan: item.keterangan_item || '-',
            catatan_umum: form.catatan_umum || '-',
            penerima_up: form.up,
            tujuan_nama:
              form.tipe === 'INTERNAL' ? selectedProyek.value?.nama || '-' : form.penerimaExternal,
            tujuan_alamat: form.lokasi_detail,
            dokumentasi_urls: uploadedDocs,
            timestamp: serverTimestamp(),
          })
        }
      })
      $q.notify({ type: 'positive', message: 'Berhasil!' })
      processDone.value = true
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Gagal: ' + e.message })
    } finally {
      $q.loading.hide()
      loading.value = false
    }
  })
}

const exportToPDF = () => {
  const element = document.getElementById('sj-pdf-target')
  const filename = form.nomorSj.replace(/\//g, '-') + '.pdf'
  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show()
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

const addDocumentationRow = () => {
  form.documentations.push({ file: null, label: '' })
}
const removeDocumentationRow = (idx) => {
  form.documentations.splice(idx, 1)
}

onMounted(fetchData)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

/* ===== BRAND COLOR PALETTE ===== */
:root {
  --brand-primary: #36ada3;
  --brand-primary-dark: #1e6e69;
  --brand-primary-light: #e0f5f4;
  --brand-primary-mid: #b2e5e2;
  --brand-danger: #ad3640;
  --brand-danger-dark: #7a2028;
  --brand-danger-light: #f7e0e1;
  --page-bg: #f0fafa;
}

/* Quasar color overrides via CSS */
.bg-brand-primary {
  background-color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e0f5f4 !important;
}
.bg-brand-danger {
  background-color: #ad3640 !important;
}
.text-brand-primary {
  color: #36ada3 !important;
}
.text-brand-teal {
  color: #36ada3 !important;
}
.text-brand-danger {
  color: #ad3640 !important;
}
.bg-page {
  background-color: #f0fafa !important;
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
.rounded-borders {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.2);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}

.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.shrink {
  flex: 0 0 auto;
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
.animate-fade-up {
  animation: fadeInUp 0.8s ease-out both;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-content-wrapper {
  padding: 0 16px;
}
@media (min-width: 768px) {
  .page-content-wrapper {
    padding: 0 24px;
  }
}

/* ===== QUASAR COMPONENT DEEP OVERRIDES ===== */
:deep(.q-btn[color='brand-primary']) {
  background: #36ada3 !important;
  color: white !important;
}
:deep(.q-btn--unelevated.q-btn[color='brand-primary']) {
  background: #36ada3 !important;
}
:deep(.q-avatar[color='brand-primary']) {
  background-color: #36ada3 !important;
  color: white !important;
}
:deep(.q-avatar[color='brand-light']) {
  background-color: #e0f5f4 !important;
  color: #1e6e69 !important;
}
:deep(.q-btn[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--flat[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--flat[color='brand-primary']) {
  color: #36ada3 !important;
}
:deep(.q-icon[color='brand-primary']),
:deep(.q-field__prepend .q-icon) {
  color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}

/* Toggle Active Button styling inside scope */
:deep(.barang-keluar-toggle .q-btn.text-primary),
:deep(.barang-keluar-toggle .q-btn.bg-primary) {
  background-color: #219b8f !important;
  color: white !important;
  font-weight: 800 !important;
  box-shadow: 0 4px 12px rgba(33, 155, 143, 0.3) !important;
}
:deep(.barang-keluar-toggle .q-btn.text-primary .q-btn__content),
:deep(.barang-keluar-toggle .q-btn.text-primary .q-btn__content *),
:deep(.barang-keluar-toggle .q-btn.bg-primary .q-btn__content),
:deep(.barang-keluar-toggle .q-btn.bg-primary .q-btn__content *) {
  color: white !important;
}

/* =======================================================================
   PDF SURAT JALAN PRINT STYLES
   ======================================================================= */
.perfectionist-paper {
  background: white !important;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm 15mm;
  margin: 0 auto;
  color: black !important;
  position: relative;
  box-sizing: border-box;
}
.final-kop-img {
  height: 80px;
  width: auto;
  max-width: 280px;
  display: block;
  object-fit: contain;
}
.text-pt-pro {
  font-size: 26px;
  font-weight: 900;
  color: #36ada3 !important;
  letter-spacing: -1.5px;
}
.text-pt-tagline {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #444 !important;
}
.pro-divider-thick {
  height: 4px;
  background: #000 !important;
  border-bottom: 1.5px solid #000 !important;
}
.perfectionist-table {
  width: 100%;
  border-collapse: collapse;
  border: 2.5px solid #000 !important;
  margin-top: 10px;
}
.perfectionist-table th,
.perfectionist-table td {
  border: 1.5px solid #000 !important;
  padding: 12px 10px;
  font-size: 13px;
  color: black !important;
}
.perfectionist-table th {
  background: #f2f2f2 !important;
  font-weight: 900;
}
.underline-dotted {
  border-bottom: 1.5px dotted #000;
}
.border-black-solid {
  border: 1.5px solid #000;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
</style>

<style>
/* Global override for Barang Keluar active option to persist background color */
.barang-keluar-toggle .q-btn.text-primary,
.barang-keluar-toggle .q-btn.bg-primary {
  background-color: #219b8f !important;
  color: white !important;
  font-weight: 800 !important;
  box-shadow: 0 4px 12px rgba(33, 155, 143, 0.3) !important;
}
.barang-keluar-toggle .q-btn.text-primary .q-btn__content,
.barang-keluar-toggle .q-btn.text-primary .q-btn__content *,
.barang-keluar-toggle .q-btn.bg-primary .q-btn__content,
.barang-keluar-toggle .q-btn.bg-primary .q-btn__content * {
  color: white !important;
}
</style>
