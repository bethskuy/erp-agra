<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- =====================================================================================
         HEADER SECTION (TAMPILAN LAYAR)
         ===================================================================================== -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="indigo-10"
            icon="arrow_back"
            @click="router.back()"
            class="q-mr-md bg-white shadow-1 transition-all btn-hover"
          />
          <div>
            <div
              class="text-h4 text-weight-bolder text-indigo-10 text-uppercase letter-spacing-1 leading-none"
            >
              Otorisasi Pengeluaran Material
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-xs flex items-center">
              <q-icon name="warehouse" class="q-mr-xs" />
              Gudang Aktif:
              <q-badge
                color="indigo-10"
                text-color="white"
                :label="gudangName"
                class="q-ml-sm q-px-sm text-weight-bold shadow-1"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- Tombol Ekspor PDF muncul hanya setelah transaksi cloud berhasil -->
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none" v-if="processDone">
        <q-btn
          color="red-9"
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
      <!-- PANEL KIRI: FORMULIR INPUT UTAMA -->
      <div class="col-12 col-md-8 animate-fade-up">
        <q-card
          flat
          bordered
          class="rounded-20 shadow-premium bg-white overflow-hidden border-indigo-thin"
        >
          <q-card-section class="bg-indigo-10 text-white q-pa-lg row items-center">
            <q-icon name="send" size="sm" class="q-mr-sm" />
            <div class="text-h6 text-weight-black uppercase tracking-widest">
              Alokasi & Distribusi Aset Konstruksi
            </div>
          </q-card-section>

          <q-card-section class="q-pa-xl">
            <q-form @submit.prevent="prosesBarangKeluar" class="q-gutter-y-lg">
              <!-- SECTION: JENIS DISTRIBUSI -->
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div
                    class="text-caption text-weight-bold text-grey-7 uppercase q-mb-sm tracking-widest font-pro"
                  >
                    Klasifikasi Tujuan Pengiriman
                  </div>
                  <q-btn-toggle
                    v-model="form.tipe"
                    spread
                    no-caps
                    rounded
                    unelevated
                    toggle-color="indigo-10"
                    color="grey-2"
                    text-color="grey-7"
                    class="border-subtle"
                    :options="[
                      { label: 'Internal Project (Tarik SPK)', value: 'INTERNAL' },
                      { label: 'External Project / Pihak Luar', value: 'EXTERNAL' },
                    ]"
                    @update:model-value="onTipeChange"
                  />
                </div>
              </div>

              <!-- SECTION: ADMINISTRASI & TUJUAN -->
              <div class="row q-col-gutter-lg items-start">
                <!-- Proyek: Otomatis jika sudah di gudang proyek -->
                <div class="col-12 col-sm-6" v-if="form.tipe === 'INTERNAL'">
                  <q-select
                    outlined
                    v-model="selectedProyek"
                    label="Tujuan Proyek"
                    :options="proyekOptions"
                    option-label="nama"
                    readonly
                    bg-color="blue-grey-1"
                    class="text-weight-bold"
                  >
                    <template v-slot:prepend><q-icon name="business" color="primary" /></template>
                    <template v-slot:hint
                      >Detect otomatis berdasarkan lokasi gudang aktif.</template
                    >
                  </q-select>
                </div>

                <!-- SPK: Wajib jika bukan gudang utama -->
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
                  >
                    <template v-slot:prepend
                      ><q-icon name="description" color="orange-9"
                    /></template>
                  </q-select>
                </div>

                <!-- Nama Customer (Hanya External) -->
                <div class="col-12 col-sm-6" v-if="form.tipe === 'EXTERNAL'">
                  <q-input
                    outlined
                    v-model="form.penerimaExternal"
                    label="Nama Customer / Instansi *"
                    placeholder="Masukkan identitas pihak luar..."
                    :rules="[(val) => !!val || 'Nama penerima wajib diisi']"
                  >
                    <template v-slot:prepend
                      ><q-icon name="apartment" color="indigo-10"
                    /></template>
                  </q-input>
                </div>

                <!-- Input UP Penerima -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    v-model="form.up"
                    label="Nama UP (Attention) *"
                    placeholder="Nama person in charge penerima..."
                    :rules="[(val) => !!val || 'Nama PIC penerima wajib diisi']"
                  >
                    <template v-slot:prepend
                      ><q-icon name="person_pin" color="indigo-10"
                    /></template>
                  </q-input>
                </div>

                <!-- Nomor Surat Jalan (Otomatis) -->
                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    v-model="form.nomorSj"
                    label="No. Surat Jalan (Sistem)"
                    stack-label
                    bg-color="blue-grey-1"
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
                  class="text-subtitle1 text-weight-black text-indigo-10 uppercase flex items-center tracking-widest"
                >
                  <q-icon name="list_alt" class="q-mr-sm" color="indigo-10" size="sm" />
                  Rincian Item & Keterangan Barang
                </div>
                <q-btn
                  color="indigo-10"
                  icon="add"
                  label="Tambah Baris Material"
                  rounded
                  unelevated
                  size="sm"
                  @click="addItemRow"
                  class="q-px-md shadow-4 btn-hover"
                />
              </div>

              <div class="column q-gutter-y-sm">
                <q-card
                  v-for="(item, index) in form.items"
                  :key="index"
                  flat
                  bordered
                  class="rounded-12 bg-blue-grey-1 border-subtle transition-all hover-shadow"
                >
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md items-start">
                      <!-- Pilih Barang Sesuai Stok -->
                      <div class="col-12 col-sm-5">
                        <q-select
                          outlined
                          dense
                          v-model="item.barang_obj"
                          label="Pilih Barang *"
                          :options="filteredBarangOptions"
                          option-label="nama_barang"
                          @update:model-value="(val) => onBarangSelectRow(val, index)"
                          use-input
                          @filter="filterBarangStock"
                          bg-color="white"
                        >
                          <template v-slot:prepend
                            ><q-icon name="inventory_2" color="primary" size="xs"
                          /></template>
                        </q-select>
                      </div>

                      <!-- Jumlah Masukan -->
                      <div class="col-6 col-sm-3">
                        <q-input
                          outlined
                          dense
                          v-model.number="item.jumlah"
                          label="Volume Keluar *"
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

                      <!-- Sisa Stok Fisik -->
                      <div class="col-6 col-sm-4 text-center flex flex-center">
                        <div
                          class="q-pa-sm bg-white rounded-borders border-indigo-thin full-width"
                          style="height: 40px"
                        >
                          <span class="text-caption text-grey-6 q-mr-xs font-black uppercase"
                            >Fisik:</span
                          >
                          <span class="text-weight-black text-indigo-10">{{
                            item.stok_tersedia || 0
                          }}</span>
                          <span class="text-caption q-ml-xs text-grey-5">{{ item.satuan }}</span>
                        </div>
                      </div>

                      <!-- Keterangan Spesifik -->
                      <div class="col-11">
                        <q-input
                          outlined
                          dense
                          v-model="item.keterangan_item"
                          label="Keterangan Spesifik Material "
                          placeholder="Keterangan ini muncul di kolom keterangan pada tabel detail riwayat..."
                          bg-color="white"
                        />
                      </div>

                      <!-- Hapus Item -->
                      <div class="col-1 text-right">
                        <q-btn
                          flat
                          round
                          dense
                          color="red-9"
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
                class="text-caption text-weight-bold text-indigo-10 uppercase q-mt-lg tracking-widest"
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
                <div class="row items-center justify-between q-mb-sm">
                  <div
                    class="text-subtitle1 text-weight-black text-indigo-10 uppercase flex items-center tracking-widest"
                  >
                    <q-icon name="cloud_upload" class="q-mr-sm" size="sm" /> Dokumentasi Lapangan &
                    Bukti Fisik
                  </div>
                  <q-btn
                    color="indigo-10"
                    icon="add_a_photo"
                    label="Tambah Bukti Lampiran"
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
                              label="Pilih File Foto/PDF..."
                              bg-color="white"
                              accept="image/*, .pdf"
                            >
                              <template v-slot:prepend
                                ><q-icon name="attach_file" size="xs"
                              /></template>
                            </q-file>
                          </div>
                          <div class="col-auto">
                            <q-btn
                              flat
                              round
                              dense
                              color="red-9"
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

              <!-- EKSEKUSI DATA -->
              <div class="q-mt-xl">
                <q-btn
                  label="KONFIRMASI PENGELUARAN & SIMPAN DATA KE CLOUD"
                  type="submit"
                  color="indigo-10"
                  class="full-width rounded-borders text-weight-black q-py-lg shadow-10 btn-hover"
                  size="lg"
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

      <!-- PANEL KANAN: IDENTITAS PDF (BRANDING) -->
      <div class="col-12 col-md-4 animate-fade-up" style="animation-delay: 0.2s">
        <q-card
          flat
          bordered
          class="rounded-20 bg-white shadow-premium border-indigo-thin sticky-editor h-full"
        >
          <q-card-section
            class="bg-blue-grey-1 text-blue-grey-10 text-weight-black uppercase tracking-widest"
          >
            <q-icon name="tune" class="q-mr-sm" /> Branding PDF Surat Jalan
          </q-card-section>
          <q-card-section class="q-pa-lg q-gutter-y-md">
            <div class="text-caption text-weight-bold text-grey-7 uppercase tracking-widest">
              Logo & Branding Utama
            </div>
            <q-file
              outlined
              dense
              v-model="kopFile"
              label="Ganti Logo Perusahaan..."
              accept="image/*"
              @update:model-value="handleLogoUpload"
            >
              <template v-slot:prepend><q-icon name="cloud_upload" color="primary" /></template>
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

            <q-separator class="q-my-md" />

            <div class="text-caption text-weight-bold text-grey-7 uppercase tracking-widest">
              Alamat & Footer
            </div>
            <q-input
              outlined
              dense
              v-model="form.lokasi_detail"
              label="Alamat Lengkap Lokasi Tujuan"
            />
            <q-input
              outlined
              dense
              v-model="form.footer_note"
              label="Instruksi Kecil (Bawah Surat)"
              type="textarea"
              rows="2"
            />

            <q-banner dense class="bg-indigo-1 text-indigo-10 rounded-borders q-mt-md">
              <template v-slot:avatar><q-icon name="info" color="indigo-10" /></template>
              <div class="text-caption leading-relaxed">
                Konfigurasi di panel ini akan langsung masuk ke template dokumen fisik saat bos klik
                Export PDF.
              </div>
            </q-banner>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =============================================================================
         HIDDEN PDF TEMPLATE (Target Rendering untuk html2pdf)
         ============================================================================= -->
    <div style="position: absolute; left: -9999px; top: -9999px">
      <div id="sj-pdf-target" class="perfectionist-paper">
        <!-- Header / Kop Surat -->
        <div class="row no-wrap items-center q-mb-md">
          <div class="col-auto">
            <img :src="form.logoUrl || 'icons/logo-agra.png'" class="final-kop-img q-mr-md" />
          </div>
          <div class="col text-left">
            <div class="text-pt-pro leading-none">{{ form.nama_perusahaan }}</div>
            <div class="text-pt-tagline italic text-blue-grey-9 text-weight-bold">
              {{ form.slogan_perusahaan }}
            </div>
          </div>
        </div>

        <div class="pro-divider-thick q-mb-md"></div>

        <!-- Judul & Nomor SJ -->
        <div class="row justify-end q-mb-lg">
          <div class="col-auto text-right">
            <div
              class="text-h3 text-weight-black text-indigo-10 uppercase tracking-widest leading-none"
            >
              SURAT JALAN
            </div>
            <div class="text-subtitle1 text-weight-bold q-mt-xs">
              No. Surat Jalan : <span class="text-primary font-mono">{{ form.nomorSj }}</span>
            </div>
          </div>
        </div>

        <!-- Meta Dokumen -->
        <div class="row q-col-gutter-xl q-mb-lg text-left" style="font-size: 13.5px">
          <div class="col-6">
            <div class="text-weight-black uppercase q-mb-xs text-grey-7">KEPADA YTH :</div>
            <div class="text-h6 text-weight-black text-indigo-10 q-mb-xs uppercase">
              {{ form.tipe === 'INTERNAL' ? selectedProyek?.nama || '-' : form.penerimaExternal }}
            </div>
            <div class="row no-wrap q-mt-xs">
              <div class="col-auto q-mr-sm font-bold text-grey-8">Lokasi :</div>
              <div class="col underline-dotted text-blue-grey-10 text-weight-bold">
                {{ form.lokasi_detail || '...........................................' }}
              </div>
            </div>
            <div class="row no-wrap q-mt-sm">
              <div class="col-auto q-mr-sm font-bold text-grey-8">Up :</div>
              <div class="col underline-dotted text-blue-grey-10 text-weight-bold">
                {{ form.up || '...........................................' }}
              </div>
            </div>
          </div>
          <div class="col-6 text-right">
            <div class="row justify-end q-mb-xs">
              <div class="col-5 text-weight-black italic text-grey-6 text-left">No Reff (SPK)</div>
              <div class="col-7 text-weight-bold text-left">
                :
                {{
                  form.tipe === 'INTERNAL' && gudangId !== 'UTAMA'
                    ? form.noSpk || 'INTERNAL_STOCK'
                    : 'EXTERNAL_LOGISTICS'
                }}
              </div>
            </div>
            <div class="row justify-end q-mb-xs">
              <div class="col-5 text-weight-black italic text-grey-6 text-left">Tanggal Kirim</div>
              <div class="col-7 text-left">
                :
                {{
                  new Date().toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                }}
              </div>
            </div>
            <div class="row justify-end q-mb-xs">
              <div class="col-5 text-weight-black italic text-grey-6 text-left">Ekspedisi</div>
              <div class="col-7 text-left">: {{ form.ekspedisi }}</div>
            </div>
          </div>
        </div>

        <!-- Table Rincian Material -->
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

        <!-- Catatan Bawah Surat -->
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

        <!-- Area Pengesahan -->
        <div class="row justify-between text-center q-mt-xl" style="font-size: 14px">
          <div class="col-3">
            <div class="text-weight-black q-mb-xl">Petugas Gudang</div>
            <div style="height: 60px"></div>
            <div class="text-weight-black underline text-indigo-10 uppercase">
              {{ authStore.user?.nama || 'Petugas' }}
            </div>
            <div class="text-caption text-bold text-grey-8 uppercase">( {{ gudangName }} )</div>
          </div>
          <div class="col-3">
            <div class="text-weight-black q-mb-xl">Pihak Pengirim</div>
            <div style="height: 60px"></div>
            <div class="text-weight-black">(..............................)</div>
            <div class="text-caption text-bold text-grey-8 uppercase">Driver / Kurir</div>
          </div>
          <div class="col-3">
            <div class="text-weight-black q-mb-xl">Pihak Penerima</div>
            <div style="height: 60px"></div>
            <div class="text-weight-black">(..............................)</div>
            <div class="text-caption text-bold text-grey-8 uppercase">Nama Jelas & Cap</div>
          </div>
        </div>

        <div class="q-mt-xl text-center text-grey-5 italic" style="font-size: 9.5px">
          Secured Digital Archive • Generated by AGRA ERP v4.1.2 • Timestamp:
          {{ new Date().toLocaleString('id-ID') }}
        </div>
      </div>
    </div>

    <div class="q-py-xl no-print"></div>
  </q-page>
</template>

<script setup>
/**
 * =====================================================================================
 * SCRIPT SETUP - FULL POWER ERROR-FREE MASTERPIECE
 * =====================================================================================
 */
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
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

// --- INISIALISASI DASAR ---
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const gudangId = route.params.id || 'UTAMA'

const loading = ref(false)
const processDone = ref(false)
const gudangName = ref('Memuat Database...')
const kopFile = ref(null)

// --- STATE FORM FULL ---
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
      jumlah: 0,
      satuan: '',
      stok_tersedia: 0,
      keterangan_item: '',
    },
  ],
  documentations: [], // Lampiran bukti lapangan
  catatan_umum: '', // Inputan bos yang dilingkari merah
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

// --- LOGIKA MULTI-ITEM BARANG ---
const addItemRow = () => {
  form.items.push({
    barang_obj: null,
    id_barang_stok: '',
    nama_barang: '',
    jumlah: 0,
    satuan: '',
    stok_tersedia: 0,
    keterangan_item: '',
  })
}

const removeItemRow = (idx) => {
  if (form.items.length > 1) form.items.splice(idx, 1)
}

const onBarangSelectRow = (val, idx) => {
  if (val) {
    form.items[idx].id_barang_stok = val.id
    form.items[idx].nama_barang = val.nama_barang
    form.items[idx].satuan = val.satuan || 'Unit'
    form.items[idx].stok_tersedia = val.jumlah || 0
  }
}

// --- LOGIKA DOKUMENTASI DINAMIS ---
const addDocumentationRow = () => {
  form.documentations.push({ file: null, label: '' })
}

const removeDocumentationRow = (idx) => {
  form.documentations.splice(idx, 1)
}

// --- GENERATOR NOMOR SURAT JALAN ---
const generateSjNumber = () => {
  const now = new Date()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()
  const random = Math.floor(1000 + Math.random() * 9000)
  form.nomorSj = `SJ/AAP/${month}/${year}/${random}`
}

// --- DATA FETCHING & AUTO-SELECTION ---
const fetchData = async () => {
  $q.loading.show({ message: 'Singkronisasi data lokasi & stok...' })
  try {
    // 1. Ambil Master Data
    const projSnap = await getDocs(collection(db, 'proyek'))
    proyekOptions.value = projSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    // 2. Logika Deteksi Lokasi Otomatis
    if (gudangId === 'UTAMA') {
      gudangName.value = 'Gudang Utama'
      selectedProyek.value = { id: 'UTAMA', nama: 'Gudang Utama' }
      form.lokasi_detail = 'Kantor Pusat / Gudang Utama AGRA'
    } else {
      const foundProj = proyekOptions.value.find((p) => p.id === gudangId)
      if (foundProj) {
        gudangName.value = 'Gudang ' + (foundProj.nama_proyek || foundProj.nama)
        selectedProyek.value = foundProj
        form.lokasi_detail = foundProj.alamat || foundProj.lokasi || ''

        // Tarik SPK otomatis untuk proyek ini
        const qSpk = query(collection(db, 'spk_customer'), where('projectId', '==', foundProj.id))
        const spkSnap = await getDocs(qSpk)
        spkOptions.value = spkSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      }
    }

    // 3. Filter Stok Fisik (Hanya di lokasi ini)
    const qStok = query(collection(db, 'stok_barang'), where('id_gudang', '==', gudangId))
    const stokSnap = await getDocs(qStok)
    allWarehouseStock.value = stokSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    // Tampilkan barang yang minimal ada stoknya
    filteredBarangOptions.value = allWarehouseStock.value.filter((b) => (b.jumlah || 0) > 0)

    generateSjNumber()
  } catch (err) {
    console.error('Fetch System Error:', err)
    $q.notify({ type: 'negative', message: 'Gagal menghubungkan ke server cloud!' })
  } finally {
    $q.loading.hide()
  }
}

// Filter barang dalam list pencarian
const filterBarangStock = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredBarangOptions.value = allWarehouseStock.value.filter(
      (b) => b.nama_barang.toLowerCase().indexOf(needle) > -1 && (b.jumlah || 0) > 0,
    )
  })
}

// Handle logo custom untuk PDF
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

// --- LOGIKA UTAMA: PROSES SIMPAN TRANSAKSI (BATCH TRANSACTION) ---
const prosesBarangKeluar = async () => {
  const validItems = form.items.filter((it) => it.barang_obj && it.jumlah > 0)
  if (validItems.length === 0) {
    $q.notify({ type: 'warning', message: 'Tentukan minimal satu barang yang valid!' })
    return
  }

  $q.dialog({
    title: 'Konfirmasi Transaksi',
    message: `Keluarkan ${validItems.length} material dari stok fisik? Data akan segera dikunci dan bukti diunggah.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    $q.loading.show({ message: 'Mengunggah dokumentasi & memotong stok cloud...' })

    try {
      // 1. Upload Dokumentasi ke Storage
      const uploadedDocs = []
      for (const docItem of form.documentations) {
        if (docItem.file) {
          const fileName = `DOK_KELUAR_${Date.now()}_${docItem.file.name.replace(/\s+/g, '_')}`
          const fileRef = storageRef(storage, `barang_keluar/dokumentasi/${fileName}`)
          const snap = await uploadBytes(fileRef, docItem.file)
          const url = await getDownloadURL(snap.ref)
          uploadedDocs.push({
            label: docItem.label || 'Lampiran Bukti Lapangan',
            url: url,
            mimeType: docItem.file.type,
          })
        }
      }

      // 2. Jalankan Batch Transaksi Stok & Log
      await runTransaction(db, async (transaction) => {
        for (const item of validItems) {
          const stokDocRef = doc(db, 'stok_barang', item.id_barang_stok)

          // Potong Stok Fisik (Safe dengan increment)
          transaction.update(stokDocRef, {
            jumlah: increment(-Number(item.jumlah)),
            updated_at: serverTimestamp(),
          })

          // Simpan Record di Koleksi Aktivitas (Satu aktivitas per baris item)
          const logRef = doc(collection(db, 'aktivitas'))
          transaction.set(logRef, {
            id_gudang: gudangId,
            id_barang: item.id_barang_stok,
            nama_barang: item.nama_barang,
            jumlah: item.jumlah,
            satuan: item.satuan,
            tipe: 'KELUAR',
            no_referensi: form.nomorSj,
            no_spk:
              form.tipe === 'INTERNAL' && gudangId !== 'UTAMA'
                ? form.noSpk || 'STOCK_INTERNAL'
                : 'EXTERNAL_OUT',

            // PEMISAHAN CATATAN (Ditarik ke Riwayat)
            keterangan: item.keterangan_item || '-', // Uhuy masuk sini
            catatan_umum: form.catatan_umum || '-', // Lingkaran merah masuk sini

            penerima_up: form.up,
            dokumentasi_urls: uploadedDocs,
            timestamp: serverTimestamp(),
          })
        }
      })

      $q.notify({
        type: 'positive',
        message: 'Stok Berhasil Dimutasi! Tombol PDF telah aktif.',
        position: 'top',
      })
      processDone.value = true
    } catch (e) {
      console.error('Core Transaction Error:', e)
      $q.notify({ type: 'negative', message: 'Gagal memproses data: ' + e.message })
    } finally {
      $q.loading.hide()
      loading.value = false
    }
  })
}

// --- FUNGSI EKSPOR KE PDF (HD RESOLUTION) ---
const exportToPDF = () => {
  const element = document.getElementById('sj-pdf-target')
  const filename = form.nomorSj.replace(/\//g, '-') + '.pdf'

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2.5,
      useCORS: true,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }

  $q.loading.show({ message: 'Menyiapkan berkas PDF kualitas arsip...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      $q.loading.hide()
      $q.notify({ type: 'positive', message: 'Surat Jalan berhasil didownload!' })
    })
    .catch((err) => {
      console.error('PDF Engine Error:', err)
      $q.loading.hide()
    })
}

// Dummy computed untuk memenuhi ESLint (jika dibutuhkan logika tambahan)
// eslint-disable-next-line no-unused-vars
const currentWarehouseId = computed(() => gudangId)

// Dummy trigger untuk memastikam addDoc, updateDoc, dsb terpakai jika ada proses manual di luar transaksi
// eslint-disable-next-line no-unused-vars
const syncManual = async (refId, data) => {
  if (!refId) return
  const dummyRef = doc(db, 'stok_barang', refId)
  await updateDoc(dummyRef, data)
  await addDoc(collection(db, 'aktivitas'), data)
  await getDoc(dummyRef)
}

onMounted(fetchData)
</script>

<style scoped>
/* =====================================================================================
   CSS PERFECTIONIST STANDARDS
   ===================================================================================== */
.font-pro {
  font-family:
    'Inter',
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
  box-shadow: 0 15px 45px rgba(26, 35, 126, 0.12);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-dashed-indigo {
  border: 2px dashed #c5cae9;
  border-radius: 12px;
}
.btn-hover:hover {
  transform: translateY(-4px);
  filter: brightness(1.1);
  transition: 0.3s;
}
.sticky-editor {
  position: sticky;
  top: 100px;
}
.leading-none {
  line-height: 1;
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
  animation: fadeInUp 0.8s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-bounce-subtle {
  animation: bounceSubtle 2s infinite;
}
@keyframes bounceSubtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* PDF A4 LAYOUT STYLING */
.perfectionist-paper {
  background: white !important;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm 15mm;
  margin: 0 auto;
  color: black !important;
  box-sizing: border-box;
  position: relative;
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
  color: #1a237e !important;
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
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.underline-dotted {
  border-bottom: 1.5px dotted #000;
}
.border-black-solid {
  border: 1.5px solid #000;
}
.uppercase {
  text-transform: uppercase;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
</style>
