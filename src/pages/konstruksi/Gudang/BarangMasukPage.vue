<template>
  <q-page class="bg-page q-pa-md q-pa-md-lg font-pro">
    <div class="page-content-wrapper">
      <!-- HEADER SECTION -->
    <div class="row items-center no-wrap q-mb-xl animate-fade">
      <q-btn
        flat
        round
        color="brand-primary"
        icon="arrow_back"
        @click="$router.back()"
        class="q-mr-md bg-white shadow-1 transition-all btn-hover"
      />
      <div>
        <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
          Penerimaan Barang Masuk
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Gudang Penerima: {{ gudangName || 'Loading...' }}
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Logistik & konfirmasi penerimaan material proyek secara real-time.
        </div>
      </div>
    </div>

    <div class="row justify-center">
      <div class="col-12 col-lg-10">
        <q-card flat bordered class="rounded-20 shadow-premium bg-white overflow-hidden">
          <!-- STEP 1: PILIH JENIS REFERENSI -->
          <q-card-section class="bg-brand-light q-pa-lg border-bottom">
            <div class="text-subtitle2 text-brand-primary text-weight-bolder uppercase q-mb-md">
              <q-icon name="assignment" class="q-mr-xs" /> 1. Tentukan Sumber Barang
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  outlined
                  v-model="receiveType"
                  :options="typeOptions"
                  label="Metode Penerimaan *"
                  emit-value
                  map-options
                  @update:model-value="resetForm"
                  bg-color="white"
                  behavior="menu"
                >
                  <template v-slot:prepend><q-icon name="merge_type" color="brand-primary" /></template>
                </q-select>
              </div>
              <div class="col-12 col-md-6" v-if="receiveType !== 'MANUAL'">
                <q-select
                  outlined
                  v-model="selectedRefDoc"
                  :options="referenceOptions"
                  :label="
                    receiveType === 'MUTASI'
                      ? 'Pilih Nomor Surat Jalan / Mutasi *'
                      : 'Pilih Nomor Purchase Request (PR) *'
                  "
                  option-label="nomor"
                  @update:model-value="onReferenceDocChange"
                  :loading="loadingRef"
                  bg-color="white"
                  behavior="menu"
                >
                  <template v-slot:prepend
                    ><q-icon name="find_in_page" color="brand-primary"
                  /></template>
                  <template v-slot:no-option>
                    <q-item
                      ><q-item-section class="text-grey italic"
                        >Tidak ada antrean dokumen untuk gudang ini</q-item-section
                      ></q-item
                    >
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>

          <!-- STEP 2: DETAIL PENERIMAAN -->
          <q-card-section class="q-pa-xl">
            <q-form @submit="simpanTransaksiMasuk" class="q-gutter-y-xl">
              <!-- INFO DOKUMEN -->
              <div class="row q-col-gutter-lg" v-if="selectedRefDoc">
                <div class="col-12 col-md-6">
                  <div class="label-req q-mb-sm">Nomor Referensi Vendor / Eksternal</div>
                  <q-input
                    outlined
                    v-model="form.noReferensi"
                    placeholder="Contoh: No. Invoice atau No. SJ Vendor..."
                    :rules="[(val) => !!val || 'Wajib diisi untuk pelacakan']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <div class="label-req q-mb-sm">Sumber Barang (Pemberi)</div>
                  <q-input
                    outlined
                    :model-value="
                      receiveType === 'MUTASI'
                        ? selectedRefDoc.ke_gudang?.nama
                        : 'Supplier / Vendor'
                    "
                    readonly
                    bg-color="grey-1"
                  >
                    <template v-slot:prepend
                      ><q-icon :name="receiveType === 'MUTASI' ? 'warehouse' : 'store'"
                    /></template>
                  </q-input>
                </div>
              </div>

              <!-- TABLE ITEM -->
              <div class="column" v-if="form.items.length > 0">
                <div
                  class="text-subtitle1 text-weight-bold text-brand-primary q-mb-md uppercase flex items-center"
                >
                  <q-icon name="list" class="q-mr-sm" color="brand-primary" /> Daftar Barang Yang Diterima
                </div>

                <q-markup-table flat bordered class="rounded-borders border-subtle">
                  <thead class="bg-brand-primary text-white">
                    <tr class="text-weight-bold uppercase font-11 tracking-widest text-white">
                      <th width="50" class="text-weight-bold">NO</th>
                      <th class="text-left text-weight-bold">NAMA MATERIAL</th>
                      <th width="150" class="text-weight-bold">JUMLAH TERIMA</th>
                      <th width="100" class="text-weight-bold">SATUAN</th>
                      <th width="150" class="no-print text-weight-bold">STOK DI GUDANG INI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index">
                      <td class="text-center">{{ index + 1 }}</td>
                      <td>
                        <div class="text-weight-bold text-brand-primary uppercase">
                          {{ item.nama_barang }}
                        </div>
                        <div class="text-caption text-grey-6">ID: {{ item.id_barang }}</div>
                      </td>
                      <td>
                        <q-input
                          dense
                          outlined
                          v-model.number="item.qty_diterima"
                          type="number"
                          input-class="text-center text-weight-bold"
                          :suffix="item.satuan"
                        />
                      </td>
                      <td class="text-center uppercase text-caption text-bold">
                        {{ item.satuan }}
                      </td>
                      <td class="text-center no-print">
                        <q-badge
                          :color="item.stok_sekarang > 0 ? 'brand-light' : 'grey-2'"
                          :text-color="item.stok_sekarang > 0 ? 'brand-primary' : 'grey-7'"
                          class="q-px-md text-weight-bold"
                        >
                          {{ item.stok_sekarang || 0 }} {{ item.satuan }}
                        </q-badge>
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>

              <div
                v-else-if="receiveType !== 'MANUAL'"
                class="q-pa-xl text-center text-grey-5 border-dashed rounded-20"
              >
                <q-icon name="find_in_page" size="64px" class="q-mb-md" />
                <div class="text-h6">
                  Pilih dokumen referensi di atas untuk memuat daftar barang
                </div>
              </div>

              <!-- UPLOAD BUKTI DINAMIS -->
              <div class="column q-gutter-y-md">
                <div class="row items-center justify-between q-col-gutter-y-sm q-mb-sm">
                  <div class="label-req">
                    Bukti Penerimaan (Foto/Dokumen Digital)
                    <span class="text-negative">* Wajib</span>
                  </div>
                  <q-btn
                    flat
                    rounded
                    dense
                    color="brand-primary"
                    icon="add_a_photo"
                    label="Tambah Lampiran"
                    no-caps
                    class="text-weight-bold"
                    @click="addBuktiRow"
                  />
                </div>

                <div class="row q-col-gutter-md">
                  <div
                    v-for="(bukti, bIdx) in buktiFiles"
                    :key="bIdx"
                    class="col-12 col-sm-6 col-md-4"
                  >
                    <q-card flat bordered class="rounded-borders bg-grey-1 relative-position">
                      <q-card-section class="q-pa-sm">
                        <q-file
                          v-model="bukti.file"
                          label="Pilih Berkas..."
                          accept="image/*, .pdf"
                          outlined
                          dense
                          bg-color="white"
                        >
                          <template v-slot:prepend>
                            <q-icon name="cloud_upload" color="brand-primary" />
                          </template>
                        </q-file>
                      </q-card-section>

                      <!-- Tombol Hapus Baris -->
                      <q-btn
                        v-if="buktiFiles.length > 1"
                        flat
                        round
                        dense
                        color="negative"
                        icon="cancel"
                        class="absolute-top-right q-mt-xs q-mr-xs z-top"
                        size="sm"
                        @click="removeBuktiRow(bIdx)"
                      />
                    </q-card>
                  </div>
                </div>
                <div class="text-caption text-grey-6 italic">
                  Format: JPG, PNG, atau PDF (Maks. 5MB per file) - Wajib menyertakan minimal 1
                  bukti.
                </div>
              </div>

              <!-- CATATAN -->
              <div class="column">
                <div class="label-req q-mb-sm">Keterangan Tambahan</div>
                <q-input
                  outlined
                  v-model="form.catatan"
                  label="Kondisi barang atau informasi pengiriman..."
                  type="textarea"
                  rows="3"
                  placeholder="Misal: Barang diterima dalam kondisi baik, segel utuh..."
                />
              </div>

              <!-- SUBMIT -->
              <div class="row justify-end q-mt-xl">
                <q-btn
                  label="Konfirmasi Penerimaan"
                  type="submit"
                  color="brand-primary"
                  class="rounded-20 q-px-lg text-weight-bold shadow-premium btn-hover"
                  unelevated
                  icon="check_circle"
                  :loading="submitting"
                  :disable="form.items.length === 0"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  // eslint-disable-next-line no-unused-vars
  addDoc,
  serverTimestamp,
  runTransaction,
  increment,
  getDoc,
  // eslint-disable-next-line no-unused-vars
  updateDoc,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'

// --- INITIALIZATION ---
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const gudangId = route.params.id

const gudangName = ref('')
const submitting = ref(false)
const loadingRef = ref(false)
const receiveType = ref('MUTASI')
const selectedRefDoc = ref(null)

// State Bukti Multi-file
const buktiFiles = ref([{ file: null }])

const typeOptions = [
  { label: 'Mutasi dari Gudang Lain', value: 'MUTASI' },
  { label: 'Pembelian Baru (Purchase Request)', value: 'PURCHASE' },
  { label: 'Input Manual (Penyesuaian)', value: 'MANUAL' },
]

const referenceOptions = ref([])
const form = ref({
  noReferensi: '',
  catatan: '',
  items: [],
})

// --- DATA FETCHING ---
const fetchGudangInfo = async () => {
  if (gudangId === 'UTAMA') {
    gudangName.value = 'Gudang Utama'
  } else {
    const d = await getDoc(doc(db, 'proyek', gudangId))
    gudangName.value = d.exists()
      ? 'Gudang ' + (d.data().nama_proyek || d.data().nama)
      : 'Lokasi Proyek'
  }
}

const fetchReferences = async () => {
  loadingRef.value = true
  referenceOptions.value = []
  try {
    // Cari permintaan yang sudah Approved
    const q = query(
      collection(db, 'permintaan_barang'),
      where('status', '==', 'Approved'),
      where('tipe', '==', receiveType.value === 'MUTASI' ? 'ANTAR_GUDANG' : 'PURCHASE_REQUEST'),
    )

    const snap = await getDocs(q)
    let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    // Filter di sisi Client: Gudang aktif harus sebagai PENERIMA (dari_gudang.id)
    referenceOptions.value = docs.filter((d) => d.dari_gudang?.id === gudangId)
  } catch (e) {
    console.error(e)
  } finally {
    loadingRef.value = false
  }
}

// --- LOGIKA FORM ---
const resetForm = () => {
  selectedRefDoc.value = null
  form.value.items = []
  form.value.noReferensi = ''
  buktiFiles.value = [{ file: null }]
  fetchReferences()
}

const addBuktiRow = () => {
  buktiFiles.value.push({ file: null })
}

const removeBuktiRow = (index) => {
  buktiFiles.value.splice(index, 1)
}

const onReferenceDocChange = async (docData) => {
  if (!docData) return

  $q.loading.show({ message: 'Mensinkronisasi data material...' })
  try {
    const itemsWithStock = []

    for (const it of docData.items) {
      // Cek stok saat ini di gudang penerima (untuk info UI)
      const qStok = query(
        collection(db, 'stok_barang'),
        where('id_gudang', '==', gudangId),
        where('id_barang', '==', it.id_barang),
      )
      const snapStok = await getDocs(qStok)

      itemsWithStock.push({
        ...it,
        qty_diterima: it.qty, // Default disamakan dengan jumlah permintaan
        stok_sekarang: snapStok.empty ? 0 : snapStok.docs[0].data().jumlah,
      })
    }

    form.value.items = itemsWithStock
    form.value.noReferensi = docData.nomor
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

// --- SUBMIT TRANSACTION: AUTOMATIC STOCK TRANSFER ---
const simpanTransaksiMasuk = async () => {
  if (form.value.items.length === 0) return

  // =========================================================================
  // FIX: VALIDASI WAJIB UPLOAD BUKTI PENERIMAAN (SOP ANTI-LUPA)
  // =========================================================================
  const hasBukti = buktiFiles.value.some((b) => b.file !== null)
  if (!hasBukti) {
    $q.notify({
      type: 'warning',
      color: 'orange-10',
      icon: 'warning',
      message:
        'PERINGATAN SOP: Harap upload bukti foto/dokumen penerimaan terlebih dahulu sebelum menyimpan data!',
      position: 'top',
      timeout: 3500,
    })
    return // Batalkan proses simpan
  }
  // =========================================================================

  $q.loading.show({ message: 'Memproses mutasi dan mengunggah bukti...' })
  submitting.value = true

  try {
    const refDoc = selectedRefDoc.value
    const buktiUrls = []

    // 1. UNGGAH SEMUA BUKTI SECARA DINAMIS
    for (const item of buktiFiles.value) {
      if (item.file) {
        const fileName = `BUKTI_${Date.now()}_${item.file.name.replace(/\s/g, '_')}`
        const fileRef = storageRef(storage, `penerimaan/bukti/${fileName}`)
        const uploadSnap = await uploadBytes(fileRef, item.file)
        const url = await getDownloadURL(uploadSnap.ref)
        buktiUrls.push(url)
      }
    }

    await runTransaction(db, async (transaction) => {
      for (const it of form.value.items) {
        const qty = Number(it.qty_diterima)
        if (qty <= 0) continue

        // 1. UPDATE STOK DI GUDANG PENERIMA (Gudang Aktif)
        const destStokQuery = query(
          collection(db, 'stok_barang'),
          where('id_gudang', '==', gudangId),
          where('id_barang', '==', it.id_barang),
        )
        const destSnap = await getDocs(destStokQuery)

        if (!destSnap.empty) {
          transaction.update(doc(db, 'stok_barang', destSnap.docs[0].id), {
            jumlah: increment(qty),
            updated_at: serverTimestamp(),
          })
        } else {
          const newDestRef = doc(collection(db, 'stok_barang'))
          transaction.set(newDestRef, {
            id_gudang: gudangId,
            id_barang: it.id_barang,
            nama_barang: it.nama_barang,
            jumlah: qty,
            satuan: it.satuan,
            created_at: serverTimestamp(),
          })
        }

        // 2. JIKA JENISNYA MUTASI, KURANGI STOK DI GUDANG SUMBER (Pemberi)
        if (receiveType.value === 'MUTASI' && refDoc) {
          const sourceGudangId = refDoc.ke_gudang.id
          const sourceStokQuery = query(
            collection(db, 'stok_barang'),
            where('id_gudang', '==', sourceGudangId),
            where('id_barang', '==', it.id_barang),
          )
          const sourceSnap = await getDocs(sourceStokQuery)

          if (!sourceSnap.empty) {
            transaction.update(doc(db, 'stok_barang', sourceSnap.docs[0].id), {
              jumlah: increment(-qty),
              updated_at: serverTimestamp(),
            })

            // Catat Aktivitas Barang Keluar di Gudang Sumber
            const outLogRef = doc(collection(db, 'aktivitas'))
            transaction.set(outLogRef, {
              id_gudang: sourceGudangId,
              nama_barang: it.nama_barang,
              jumlah: qty,
              tipe: 'KELUAR',
              no_referensi: form.value.noReferensi,
              keterangan: `Mutasi keluar ke ${gudangName.value}`,
              bukti_terima_urls: buktiUrls, // Simpan array URL
              timestamp: serverTimestamp(),
            })
          }
        }

        // 3. CATAT AKTIVITAS BARANG MASUK DI GUDANG PENERIMA
        const inLogRef = doc(collection(db, 'aktivitas'))
        transaction.set(inLogRef, {
          id_gudang: gudangId,
          nama_barang: it.nama_barang,
          jumlah: qty,
          tipe: 'MASUK',
          no_referensi: form.value.noReferensi,
          keterangan: `Penerimaan via ${receiveType.value} (${refDoc?.nomor || 'Manual'})`,
          bukti_urls: buktiUrls, // Simpan array URL
          timestamp: serverTimestamp(),
        })
      }

      // 4. UPDATE STATUS DOKUMEN ASLI MENJADI 'COMPLETED'
      if (refDoc) {
        transaction.update(doc(db, 'permintaan_barang', refDoc.id), {
          status: 'Completed',
          receivedAt: serverTimestamp(),
          bukti_penerimaan_urls: buktiUrls, // Simpan array URL di dokumen permintaan induk
        })
      }
    })

    $q.notify({
      type: 'positive',
      message: 'Stok berhasil dimutasi dan seluruh bukti telah disimpan!',
      position: 'top',
    })
    router.back()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal memproses mutasi: ' + err.message })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

onMounted(() => {
  fetchGudangInfo()
  fetchReferences()
})
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
.rounded-borders {
  border-radius: 12px;
}
/* Roomier Table Padding Override */
.material-table th,
.material-table td {
  padding: 16px 16px !important;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.2);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}

.label-req {
  font-size: 12px;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.uppercase {
  text-transform: uppercase;
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

.page-content-wrapper {
  padding: 0 16px;
}
@media (min-width: 768px) {
  .page-content-wrapper {
    padding: 0 24px;
  }
}
</style>
