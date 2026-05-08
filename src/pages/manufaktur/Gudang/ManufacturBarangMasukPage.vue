<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center q-mb-xl animate-fade">
      <q-btn
        flat
        round
        color="grey-7"
        icon="arrow_back"
        @click="$router.back()"
        class="q-mr-md bg-white shadow-1"
      />
      <div>
        <div class="text-h5 text-weight-bold text-green-10 text-uppercase letter-spacing-1">
          Penerimaan Barang Masuk
        </div>
        <div class="text-caption text-grey-7">
          Logistik & Penerimaan Material - Gudang Penerima:
          <q-badge color="green-10" text-color="white" class="q-px-sm text-weight-bold">
            {{ gudangName || 'Loading...' }}
          </q-badge>
        </div>
      </div>
    </div>

    <div class="row justify-center">
      <div class="col-12 col-lg-10">
        <q-card flat bordered class="rounded-20 shadow-premium bg-white overflow-hidden">
          <!-- STEP 1: PILIH JENIS REFERENSI -->
          <q-card-section class="bg-green-1 q-pa-lg border-bottom">
            <div class="text-subtitle2 text-green-10 text-weight-bold uppercase q-mb-md">
              <q-icon name="assignment" class="q-mr-xs" /> 1. Tentukan Sumber Barang
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  filled
                  v-model="receiveType"
                  :options="typeOptions"
                  label="Metode Penerimaan *"
                  emit-value
                  map-options
                  @update:model-value="resetForm"
                  bg-color="white"
                >
                  <template v-slot:prepend><q-icon name="merge_type" color="green-10" /></template>
                </q-select>
              </div>
              <div class="col-12 col-md-6" v-if="receiveType !== 'MANUAL'">
                <q-select
                  filled
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
                >
                  <template v-slot:prepend
                    ><q-icon name="find_in_page" color="green-9"
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
                    filled
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
                  class="text-subtitle1 text-weight-bold text-green-10 q-mb-md uppercase flex items-center"
                >
                  <q-icon name="list" class="q-mr-sm" color="green-10" /> Daftar Barang Yang Diterima
                </div>

                <q-markup-table flat bordered class="rounded-borders border-subtle">
                  <thead class="bg-green-1 text-green-10">
                    <tr>
                      <th width="50">NO</th>
                      <th class="text-left">NAMA MATERIAL</th>
                      <th width="150">JUMLAH TERIMA</th>
                      <th width="100">SATUAN</th>
                      <th width="150" class="no-print">STOK DI GUDANG INI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index">
                      <td class="text-center">{{ index + 1 }}</td>
                      <td>
                        <div class="text-weight-bold text-green-10 uppercase">
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
                          :color="item.stok_sekarang > 0 ? 'green-1' : 'grey-2'"
                          :text-color="item.stok_sekarang > 0 ? 'green-10' : 'grey-7'"
                          class="q-px-md"
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
                <div class="row items-center justify-between">
                  <div class="label-req">Bukti Penerimaan (Foto/Dokumen Digital)</div>
                  <q-btn
                    flat
                    rounded
                    dense
                    color="green-10"
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
                            <q-icon name="cloud_upload" color="green-10" />
                          </template>
                        </q-file>
                      </q-card-section>

                      <!-- Tombol Hapus Baris -->
                      <q-btn
                        v-if="buktiFiles.length > 1"
                        flat
                        round
                        dense
                        color="green-10"
                        icon="cancel"
                        class="absolute-top-right q-mt-xs q-mr-xs z-top"
                        size="sm"
                        @click="removeBuktiRow(bIdx)"
                      />
                    </q-card>
                  </div>
                </div>
                <div class="text-caption text-grey-6 italic">
                  Format: JPG, PNG, atau PDF (Maks. 5MB per file)
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
                  label="KONFIRMASI PENERIMAAN & UPDATE STOK"
                  type="submit"
                  color="green-10"
                  class="rounded-20 q-px-xl text-weight-black shadow-8 btn-hover"
                  size="lg"
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
    const d = await getDoc(doc(db, 'proyek_manufaktur', gudangId))
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
      collection(db, 'permintaan_barang_manufaktur'),
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
        collection(db, 'stok_barang_manufaktur'),
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

  $q.loading.show({ message: 'Memproses mutasi dan mengunggah bukti...' })
  submitting.value = true

  try {
    const refDoc = selectedRefDoc.value
    const buktiUrls = []

    // 1. UNGGAH SEMUA BUKTI SECARA DINAMIS
    for (const item of buktiFiles.value) {
      if (item.file) {
        const fileName = `BUKTI_${Date.now()}_${item.file.name.replace(/\s/g, '_')}`
        const fileRef = storageRef(storage, `manufaktur/penerimaan/bukti/${fileName}`)
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
          collection(db, 'stok_barang_manufaktur'),
          where('id_gudang', '==', gudangId),
          where('id_barang', '==', it.id_barang),
        )
        const destSnap = await getDocs(destStokQuery)

        if (!destSnap.empty) {
          transaction.update(doc(db, 'stok_barang_manufaktur', destSnap.docs[0].id), {
            jumlah: increment(qty),
            updated_at: serverTimestamp(),
          })
        } else {
          const newDestRef = doc(collection(db, 'stok_barang_manufaktur'))
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
            collection(db, 'stok_barang_manufaktur'),
            where('id_gudang', '==', sourceGudangId),
            where('id_barang', '==', it.id_barang),
          )
          const sourceSnap = await getDocs(sourceStokQuery)

          if (!sourceSnap.empty) {
            transaction.update(doc(db, 'stok_barang_manufaktur', sourceSnap.docs[0].id), {
              jumlah: increment(-qty),
              updated_at: serverTimestamp(),
            })

            // Catat Aktivitas Barang Keluar di Gudang Sumber
            const outLogRef = doc(collection(db, 'aktivitas_manufaktur'))
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
        const inLogRef = doc(collection(db, 'aktivitas_manufaktur'))
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
        transaction.update(doc(db, 'permintaan_barang_manufaktur', refDoc.id), {
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
.font-pro {
  font-family: 'Inter', sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.1);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
.shrink {
  flex: 0 0 auto;
}
</style>
