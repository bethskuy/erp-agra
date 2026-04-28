<template>
  <q-page class="bg-grey-2 q-pa-lg font-pro">
    <!-- HEADER SECTION (NO-PRINT) -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="grey-7"
            icon="arrow_back"
            @click="$router.back()"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-h5 text-weight-bold text-indigo-10 text-uppercase letter-spacing-1">
              Otorisasi Pengeluaran Material
            </div>
            <div class="text-caption text-grey-7">
              Gudang Aktif:
              <q-badge
                color="indigo-10"
                text-color="white"
                :label="gudangName"
                class="q-px-sm text-weight-bold"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none" v-if="processDone">
        <q-btn
          color="red-9"
          icon="picture_as_pdf"
          label="EXPORT SURAT JALAN (PDF)"
          unelevated
          rounded
          class="q-px-xl text-weight-black shadow-8 animate-bounce-subtle"
          @click="exportToPDF"
        />
      </div>
    </div>

    <!-- FORM SECTION (NO-PRINT) -->
    <div class="row q-col-gutter-lg justify-center no-print">
      <!-- LEFT: DISTRIBUSI FORM -->
      <div class="col-12 col-md-8 animate-fade-up">
        <q-card flat bordered class="rounded-20 shadow-premium bg-white overflow-hidden">
          <q-card-section class="bg-indigo-1 q-pa-md row items-center">
            <q-icon name="send" color="indigo-10" size="sm" class="q-mr-sm" />
            <div class="text-weight-bold text-indigo-10 uppercase tracking-widest">
              Dashboard Alokasi Barang
            </div>
          </q-card-section>

          <q-card-section class="q-pa-xl">
            <q-form @submit="prosesBarangKeluar" class="q-gutter-y-lg">
              <!-- JENIS DISTRIBUSI -->
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-btn-toggle
                    v-model="form.tipe"
                    spread
                    no-caps
                    rounded
                    unelevated
                    toggle-color="indigo-10"
                    color="grey-2"
                    text-color="grey-7"
                    :options="[
                      { label: 'Internal Project (Tarik SPK)', value: 'INTERNAL' },
                      { label: 'External Project / Pihak Luar', value: 'EXTERNAL' },
                    ]"
                    @update:model-value="onTipeChange"
                  />
                </div>
              </div>

              <!-- TARGET & SURAT JALAN -->
              <div class="row q-col-gutter-md items-start">
                <!-- Proyek Aktif -->
                <div class="col-12 col-sm-6" v-if="form.tipe === 'INTERNAL'">
                  <q-select
                    outlined
                    v-model="selectedProyek"
                    label="Pilih Proyek Aktif"
                    :options="proyekOptions"
                    option-label="nama"
                    readonly
                    bg-color="grey-1"
                  >
                    <template v-slot:prepend><q-icon name="business" color="primary" /></template>
                    <template v-slot:hint>Otomatis terkunci berdasarkan lokasi gudang.</template>
                  </q-select>
                </div>

                <!-- SPK -->
                <div
                  class="col-12 col-sm-6"
                  v-if="form.tipe === 'INTERNAL' && gudangId !== 'UTAMA'"
                >
                  <q-select
                    outlined
                    v-model="form.noSpk"
                    label="Pilih No. SPK (Kontrak)"
                    :options="spkOptions"
                    option-label="nomor_spk"
                    option-value="nomor_spk"
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Wajib pilih SPK']"
                  >
                    <template v-slot:prepend
                      ><q-icon name="description" color="orange-9"
                    /></template>
                  </q-select>
                </div>

                <div class="col-12 col-sm-6" v-if="form.tipe === 'EXTERNAL'">
                  <q-input
                    outlined
                    v-model="form.penerimaExternal"
                    label="Nama Penerima / Customer"
                    placeholder="Contoh: PT. Maju Jaya"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  >
                    <template v-slot:prepend><q-icon name="business" color="indigo-10" /></template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    v-model="form.up"
                    label="Nama UP (Attention)"
                    placeholder="Contoh: Bpk. Junaidi"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  >
                    <template v-slot:prepend
                      ><q-icon name="person_pin" color="indigo-10"
                    /></template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <q-input
                    outlined
                    v-model="form.nomorSj"
                    label="No. Surat Jalan (Auto/Edit)"
                    stack-label
                    bg-color="blue-grey-1"
                    class="text-weight-bold"
                  >
                    <template v-slot:prepend><q-icon name="tag" color="grey-7" /></template>
                  </q-input>
                </div>
              </div>

              <q-separator inset class="q-my-md" />

              <!-- MULTI-ITEM SECTION -->
              <div class="row items-center justify-between q-mb-sm">
                <div
                  class="text-subtitle1 text-weight-bolder text-indigo-10 uppercase flex items-center"
                >
                  <q-icon name="list" class="q-mr-sm" /> Daftar Material Yang Dikeluarkan
                </div>
                <q-btn
                  color="primary"
                  icon="add"
                  label="Tambah Barang"
                  rounded
                  unelevated
                  size="sm"
                  @click="addItemRow"
                  class="q-px-md shadow-2"
                />
              </div>

              <div class="column q-gutter-y-sm">
                <q-card
                  v-for="(item, index) in form.items"
                  :key="index"
                  flat
                  bordered
                  class="rounded-12 bg-blue-grey-1 border-subtle relative-position transition-all"
                >
                  <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md items-start">
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
                          <template v-slot:no-option>
                            <q-item
                              ><q-item-section class="text-grey italic"
                                >Tidak ada stok</q-item-section
                              ></q-item
                            >
                          </template>
                        </q-select>
                      </div>

                      <div class="col-6 col-sm-3">
                        <q-input
                          outlined
                          dense
                          v-model.number="item.jumlah"
                          label="Qty Keluar *"
                          type="number"
                          bg-color="white"
                          :rules="[
                            (val) => val > 0 || 'Min 1',
                            (val) => val <= (item.stok_tersedia || 0) || 'Stok Kurang',
                          ]"
                        >
                          <template v-slot:append>
                            <span class="text-caption text-weight-bold uppercase">{{
                              item.satuan || '-'
                            }}</span>
                          </template>
                        </q-input>
                      </div>

                      <div class="col-6 col-sm-4">
                        <div
                          class="q-pa-sm bg-white rounded-borders border-indigo-thin text-center"
                          style="
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          "
                        >
                          <span class="text-caption text-grey-7 q-mr-xs">Sisa:</span>
                          <span class="text-weight-black text-indigo-10">{{
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
                          placeholder="Misal: Batch A, Kondisi Segel, dll..."
                          bg-color="white"
                        />
                      </div>

                      <div class="col-1 text-right">
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
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

              <q-input
                outlined
                v-model="form.catatan"
                label="Catatan Umum / Instruksi Pengiriman"
                type="textarea"
                rows="3"
                placeholder="Tuliskan keterangan tambahan yang akan muncul di bawah surat jalan..."
              />

              <!-- =====================================================================
                   DOKUMENTASI PENGELUARAN (DYNAMICS UPLOAD)
                   ===================================================================== -->
              <div class="q-mt-lg">
                <div class="row items-center justify-between q-mb-sm">
                  <div
                    class="text-subtitle1 text-weight-bolder text-indigo-10 uppercase flex items-center"
                  >
                    <q-icon name="cloud_upload" class="q-mr-sm" /> Dokumentasi Lapangan / Berkas
                    Bukti
                  </div>
                  <q-btn
                    color="indigo-10"
                    icon="add_a_photo"
                    label="Tambah Lampiran"
                    rounded
                    unelevated
                    size="sm"
                    @click="addDocumentationRow"
                    class="q-px-md"
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
                              label="Pilih Foto/Berkas Bukti..."
                              bg-color="white"
                              accept="image/*, .pdf, .doc, .docx"
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
                              v-if="form.documentations.length > 0"
                            />
                          </div>
                        </div>
                        <q-input
                          outlined
                          dense
                          v-model="doc.label"
                          label="Nama Lampiran (Misal: Foto Truk)"
                          class="q-mt-xs"
                          bg-color="white"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                  <div
                    v-if="form.documentations.length === 0"
                    class="col-12 text-center q-pa-lg text-grey-5 border-dashed rounded-12"
                  >
                    Belum ada dokumentasi dilampirkan. Klik "Tambah Lampiran" jika diperlukan.
                  </div>
                </div>
              </div>

              <!-- TOMBOL PROSES UTAMA -->
              <div class="q-mt-xl">
                <q-btn
                  label="KONFIRMASI PENGELUARAN & SIMPAN DATA"
                  type="submit"
                  color="indigo-10"
                  class="full-width rounded-borders text-weight-black q-py-lg shadow-8 btn-hover"
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

      <!-- RIGHT: SJ EDITOR PANEL -->
      <div class="col-12 col-md-4 animate-fade-up" style="animation-delay: 0.2s">
        <q-card flat bordered class="rounded-20 bg-white shadow-premium border-indigo-thin h-full">
          <q-card-section
            class="bg-blue-grey-1 text-blue-grey-10 text-weight-black uppercase tracking-widest"
          >
            <q-icon name="tune" class="q-mr-sm" /> Konfigurasi Identitas PDF
          </q-card-section>
          <q-card-section class="q-pa-lg q-gutter-y-md">
            <div class="text-caption text-weight-bold text-grey-7 uppercase">Kop & Branding</div>
            <q-file
              outlined
              dense
              v-model="kopFile"
              label="Upload Logo Baru..."
              accept="image/*"
              @update:model-value="handleLogoUpload"
            >
              <template v-slot:prepend><q-icon name="cloud_upload" color="primary" /></template>
            </q-file>
            <q-input outlined dense v-model="form.nama_perusahaan" label="Nama Perusahaan" />
            <q-input outlined dense v-model="form.slogan_perusahaan" label="Slogan / Tagline" />

            <q-separator class="q-my-md" />

            <div class="text-caption text-weight-bold text-grey-7 uppercase">
              Informasi Tambahan
            </div>
            <q-input outlined dense v-model="form.lokasi_detail" label="Alamat Detail Tujuan" />
            <q-input
              outlined
              dense
              v-model="form.footer_note"
              label="Catatan Kecil di Bawah"
              type="textarea"
              rows="2"
            />

            <q-banner dense class="bg-indigo-1 text-indigo-10 rounded-borders q-mt-md">
              <template v-slot:avatar><q-icon name="info" color="indigo-10" /></template>
              Panel ini mengatur tampilan dokumen fisik saat dicetak.
            </q-banner>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =============================================================================
         HIDDEN PDF TEMPLATE (TARGET FOR HTML2PDF)
         ============================================================================= -->
    <div style="position: absolute; left: -9999px; top: -9999px">
      <div id="sj-pdf-target" class="perfectionist-paper">
        <!-- Kop Surat -->
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

        <!-- Judul & Nomor -->
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

        <!-- Meta Info -->
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
          <div class="col-6">
            <div class="row q-mb-xs">
              <div class="col-5 text-weight-black italic text-grey-6">No Reff</div>
              <div class="col-7 text-weight-bold">
                :
                {{
                  form.tipe === 'INTERNAL' && gudangId !== 'UTAMA'
                    ? form.noSpk
                    : 'INTERNAL LOGISTICS'
                }}
              </div>
            </div>
            <div class="row q-mb-xs">
              <div class="col-5 text-weight-black italic text-grey-6">Tanggal Kirim</div>
              <div class="col-7">
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
            <div class="row q-mb-xs">
              <div class="col-5 text-weight-black italic text-grey-6">Ekspedisi</div>
              <div class="col-7">: {{ form.ekspedisi }}</div>
            </div>
          </div>
        </div>

        <!-- Table Barang Dinamis -->
        <table class="perfectionist-table full-width">
          <thead>
            <tr>
              <th width="45">NO</th>
              <th class="text-left">ITEM DESCRIPTION</th>
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
              <td class="text-left text-blue-grey-8">{{ item.keterangan_item || '-' }}</td>
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

        <!-- Catatan -->
        <div class="q-mt-md q-mb-xl text-left">
          <div class="text-weight-black italic q-mb-xs">Catatan Khusus :</div>
          <div
            class="q-pa-md border-black-solid"
            style="min-height: 80px; font-size: 12px; white-space: pre-wrap"
          >
            {{ form.footer_note || 'Barang dikirim dalam kondisi baik dan tersegel.' }}
          </div>
        </div>

        <!-- Signatures -->
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
            <div class="text-weight-black q-mb-xl">Bagian Pengiriman</div>
            <div style="height: 60px"></div>
            <div class="text-weight-black">(..............................)</div>
            <div class="text-caption text-bold text-grey-8">Driver / Kurir</div>
          </div>
          <div class="col-3">
            <div class="text-weight-black q-mb-xl">Pihak Penerima</div>
            <div style="height: 60px"></div>
            <div class="text-weight-black">(..............................)</div>
            <div class="text-caption text-bold text-grey-8 uppercase">Nama Jelas & Cap</div>
          </div>
        </div>
      </div>
    </div>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, onMounted, reactive, watch } from 'vue'
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
  orderBy,
  // eslint-disable-next-line no-unused-vars
  getDoc,
  runTransaction,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

// --- INITIALIZATION ---
const $q = useQuasar()
const route = useRoute()
// eslint-disable-next-line no-unused-vars
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
      jumlah: 0,
      satuan: '',
      stok_tersedia: 0,
      keterangan_item: '',
    },
  ],
  documentations: [], // State untuk banyak dokumen
  catatan: '',
  ekspedisi: 'Driver Internal',
  nama_perusahaan: 'PT AGRA ABHINAYA PERKASA',
  slogan_perusahaan: 'General Construction & General Supplier',
  lokasi_detail: '',
  logoUrl: '',
  footer_note: '',
})

const selectedProyek = ref(null)
const kategoriOptions = ref([])
const proyekOptions = ref([])
const spkOptions = ref([])
const allWarehouseStock = ref([])
const filteredBarangOptions = ref([])

// --- LOGIKA MULTI ITEM ---
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
  form.items.splice(idx, 1)
}

const onBarangSelectRow = (val, idx) => {
  if (val) {
    form.items[idx].id_barang_stok = val.id
    form.items[idx].nama_barang = val.nama_barang
    form.items[idx].satuan = val.satuan || 'Unit'
    form.items[idx].stok_tersedia = val.jumlah || 0
  }
}

// --- LOGIKA MULTI DOKUMENTASI ---
const addDocumentationRow = () => {
  form.documentations.push({ file: null, label: '' })
}

const removeDocumentationRow = (idx) => {
  form.documentations.splice(idx, 1)
}

// --- GENERATOR NOMOR SJ ---
const generateSjNumber = () => {
  const now = new Date()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()
  const random = Math.floor(1000 + Math.random() * 9000)
  form.nomorSj = `SJ/AAP/${month}/${year}/${random}`
}

// --- DATA FETCHING ---
const fetchData = async () => {
  $q.loading.show({ message: 'Sinkronisasi stok gudang...' })
  try {
    const [catSnap, projSnap] = await Promise.all([
      getDocs(query(collection(db, 'kategori_barang'), orderBy('nama', 'asc'))),
      getDocs(collection(db, 'proyek')),
    ])

    kategoriOptions.value = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    proyekOptions.value = projSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    if (gudangId === 'UTAMA') {
      gudangName.value = 'Gudang Utama'
      selectedProyek.value = { id: 'UTAMA', nama: 'Gudang Utama' }
      form.lokasi_detail = 'Kantor Pusat / Gudang Utama'
    } else {
      const foundProj = proyekOptions.value.find((p) => p.id === gudangId)
      if (foundProj) {
        gudangName.value = 'Gudang ' + foundProj.nama
        selectedProyek.value = foundProj
        form.lokasi_detail = foundProj.alamat || foundProj.lokasi || ''
        await fetchSpkForProject(foundProj.id)
      }
    }

    const qStok = query(collection(db, 'stok_barang'), where('id_gudang', '==', gudangId))
    const stokSnap = await getDocs(qStok)
    allWarehouseStock.value = stokSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    filteredBarangOptions.value = allWarehouseStock.value.filter((b) => (b.jumlah || 0) > 0)

    generateSjNumber()
  } catch (err) {
    console.error(err)
  } finally {
    $q.loading.hide()
  }
}

const fetchSpkForProject = async (pid) => {
  spkOptions.value = []
  try {
    const qSpk = query(collection(db, 'spk_customer'), where('projectId', '==', pid))
    const spkSnap = await getDocs(qSpk)
    spkOptions.value = spkSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('Gagal tarik SPK:', err)
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

// --- PROSES SIMPAN (BATCH TRANSACTION + FILE UPLOADS) ---
const prosesBarangKeluar = async () => {
  const validItems = form.items.filter((it) => it.barang_obj && it.jumlah > 0)
  if (validItems.length === 0) {
    $q.notify({ type: 'warning', message: 'Input minimal satu barang yang valid!' })
    return
  }

  $q.dialog({
    title: 'Konfirmasi Pengeluaran',
    message: `Keluarkan ${validItems.length} item material dari stok gudang? Berkas bukti akan diunggah secara cloud.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    $q.loading.show({ message: 'Sedang mengunggah berkas dokumentasi...' })

    try {
      // 1. PROSES UPLOAD DOKUMENTASI TERLEBIH DAHULU
      const uploadedDocs = []
      for (const docItem of form.documentations) {
        if (docItem.file) {
          const fileName = `DOK_${Date.now()}_${docItem.file.name.replace(/\s+/g, '_')}`
          const fileRef = storageRef(storage, `barang_keluar/dokumentasi/${fileName}`)
          const snap = await uploadBytes(fileRef, docItem.file)
          const url = await getDownloadURL(snap.ref)
          uploadedDocs.push({
            label: docItem.label || 'Lampiran Tanpa Nama',
            url: url,
            mimeType: docItem.file.type,
          })
        }
      }

      $q.loading.show({ message: 'Memproses transaksi database...' })

      // 2. PROSES TRANSACTION FIRESTORE
      await runTransaction(db, async (transaction) => {
        for (const item of validItems) {
          const stokRef = doc(db, 'stok_barang', item.id_barang_stok)

          // Potong Stok
          transaction.update(stokRef, {
            jumlah: increment(-Number(item.jumlah)),
            updated_at: serverTimestamp(),
          })

          // Simpan Log Aktivitas per Item
          const logRef = doc(collection(db, 'aktivitas'))
          transaction.set(logRef, {
            id_gudang: gudangId,
            nama_barang: item.nama_barang,
            jumlah: item.jumlah,
            tipe: 'KELUAR',
            no_referensi: form.nomorSj,
            no_spk:
              form.tipe === 'INTERNAL' && gudangId !== 'UTAMA'
                ? form.noSpk
                : 'GUDANG_UTAMA_INTERNAL',
            keterangan: item.keterangan_item || form.catatan,
            dokumentasi_urls: uploadedDocs, // Simpan array dokumen yang diupload
            penerima_up: form.up,
            timestamp: serverTimestamp(),
          })
        }
      })

      $q.notify({
        type: 'positive',
        message: 'Material & Dokumentasi Berhasil Disimpan!',
        position: 'top',
      })
      processDone.value = true
    } catch (e) {
      console.error(e)
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
  $q.loading.show({ message: 'Menyiapkan berkas PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

onMounted(fetchData)
</script>

<style scoped>
.font-pro {
  font-family: 'Inter', sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 40px rgba(25, 118, 210, 0.15);
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

/* PERFECTIONIST PDF PAPER STYLING */
.perfectionist-paper {
  background: white !important;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm 15mm;
  margin: 0 auto;
  color: black !important;
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
}
.underline-dotted {
  border-bottom: 1.5px dotted #000;
}
.border-black-solid {
  border: 1.5px solid #000;
}
</style>
