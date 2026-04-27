<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center q-mb-xl animate-fade">
      <q-btn
        flat
        round
        color="indigo-10"
        icon="arrow_back"
        @click="$router.back()"
        class="q-mr-md bg-white shadow-1"
      />
      <div>
        <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
          Purchase Request (PR)
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Pengajuan Pengadaan Material Baru</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Formulir resmi permintaan pembelian stok untuk kebutuhan proyek PT AGRA.
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg justify-center">
      <!-- FORM KIRI: IDENTITAS & DOKUMEN -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
          <div class="text-subtitle1 text-indigo-10 text-weight-bolder q-mb-lg flex items-center">
            <q-icon name="info" class="q-mr-sm" /> INFORMASI PENGAJUAN
          </div>

          <div class="q-gutter-y-md">
            <!-- Gudang Pemohon -->
            <q-input
              filled
              v-model="originWarehouseName"
              label="Gudang Pemohon (Lokasi Penerima)"
              readonly
              bg-color="indigo-1"
              class="text-weight-bold"
              stack-label
            >
              <template v-slot:prepend><q-icon name="local_shipping" color="indigo-10" /></template>
            </q-input>

            <q-input
              outlined
              v-model="form.nomor"
              label="Nomor Dokumen PR"
              readonly
              stack-label
              bg-color="grey-1"
            >
              <template v-slot:prepend><q-icon name="tag" color="grey-6" /></template>
            </q-input>

            <q-separator class="q-my-md" />

            <!-- UPLOAD ANALISA (SUPPORT MULTI FORMAT) -->
            <div
              class="label-req q-mb-xs text-caption text-indigo-10 font-bold uppercase tracking-widest"
            >
              Berkas Analisa Harga / Justifikasi
            </div>
            <q-file
              outlined
              dense
              v-model="analisaFile"
              label="Lampirkan Dokumen (PDF, Word, Excel)"
              accept=".pdf, .doc, .docx, .xls, .xlsx"
              bg-color="blue-grey-1"
            >
              <template v-slot:prepend><q-icon name="attach_file" color="primary" /></template>
              <template v-slot:hint
                >Acuan bagi pimpinan untuk mengevaluasi urgensi pembelian.</template
              >
            </q-file>

            <q-input
              outlined
              v-model="form.catatan"
              type="textarea"
              label="Catatan / Alasan Pembelian"
              placeholder="Jelaskan mengapa barang ini perlu dibeli sekarang..."
              rows="4"
            />
          </div>
        </q-card>

        <div class="q-mt-lg q-pa-lg bg-blue-1 rounded-20 border-dashed-blue text-center">
          <q-icon name="shield" color="primary" size="md" class="q-mb-sm" />
          <div class="text-overline text-primary text-bold">Alur Otorisasi</div>
          <div class="text-body2 text-grey-8">
            Permintaan ini akan diteruskan ke <b>Manajer Logistik</b> & <b>Direktur</b> untuk
            divalidasi.
          </div>
        </div>
      </div>

      <!-- FORM KANAN: DAFTAR BARANG BELANJA -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="rounded-20 bg-white shadow-1 overflow-hidden">
          <q-toolbar class="bg-indigo-10 text-white q-py-sm">
            <q-icon name="shopping_cart" class="q-mr-sm" />
            <q-toolbar-title class="text-weight-bold text-subtitle1"
              >DAFTAR KEBUTUHAN MATERIAL</q-toolbar-title
            >
            <q-btn flat round dense icon="add_circle" @click="addItemRow">
              <q-tooltip>Tambah Baris Barang</q-tooltip>
            </q-btn>
          </q-toolbar>

          <q-card-section class="q-pa-none">
            <q-markup-table flat separator="horizontal" class="permintaan-table">
              <thead>
                <tr class="bg-grey-1 text-indigo-10">
                  <th width="50">NO</th>
                  <th class="text-left">NAMA MATERIAL</th>
                  <th width="100">QTY</th>
                  <th width="100">UNIT</th>
                  <th width="150">EST. HARGA</th>
                  <th width="50"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.items" :key="index">
                  <td class="text-center text-grey-6">{{ index + 1 }}</td>
                  <td>
                    <q-select
                      dense
                      borderless
                      v-model="item.barang"
                      :options="masterBarang"
                      option-label="nama"
                      placeholder="Cari material..."
                      use-input
                      @filter="filterMasterBarang"
                      @update:model-value="(val) => onBarangSelect(val, index)"
                    />
                  </td>
                  <td>
                    <q-input
                      dense
                      borderless
                      v-model.number="item.qty"
                      type="number"
                      input-class="text-center text-weight-bold"
                    />
                  </td>
                  <td class="text-center">
                    <q-badge outline color="blue-grey-4" class="uppercase text-weight-bold">
                      {{ item.satuan || '-' }}
                    </q-badge>
                  </td>
                  <td>
                    <q-input
                      dense
                      borderless
                      v-model.number="item.estimasi_harga"
                      type="number"
                      prefix="Rp"
                      input-class="text-right"
                    />
                  </td>
                  <td class="text-center">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete_outline"
                      size="sm"
                      @click="removeItemRow(index)"
                      :disable="form.items.length === 1"
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>

            <div v-if="form.items.length === 0" class="q-pa-xl text-center text-grey-5">
              Tekan tombol tambah di header untuk menginput barang.
            </div>

            <!-- Footer Summary -->
            <q-separator />
            <div class="q-pa-lg row items-center justify-between bg-grey-1">
              <div class="column">
                <div class="text-overline text-grey-6">Estimasi Total Biaya</div>
                <div class="text-h5 text-weight-black text-indigo-10">
                  Rp {{ calculateTotalPR().toLocaleString() }}
                </div>
              </div>
              <q-btn
                unelevated
                color="indigo-10"
                label="PROSES PURCHASE REQUEST"
                icon="check_circle"
                class="q-px-xl text-weight-bold rounded-20 shadow-4"
                :loading="submitting"
                @click="submitPurchaseRequest"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

// --- INISIALISASI ---
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const originWarehouseId = route.params.id
const originWarehouseName = ref('Memuat...')
const submitting = ref(false)
const analisaFile = ref(null)
const masterBarang = ref([])
const allBarang = ref([])

const form = ref({
  nomor: 'PR/' + Date.now().toString().slice(-6),
  catatan: '',
  items: [{ barang: null, id_barang: '', nama_barang: '', qty: 1, satuan: '', estimasi_harga: 0 }],
})

let unsubUser = null
const userData = ref(null)

// --- FETCH DATA UTAMA ---
const fetchData = async () => {
  try {
    // 1. Ambil Nama Gudang Pemohon
    const qProyek = query(collection(db, 'proyek'))
    const snapProyek = await getDocs(qProyek)
    const listGudang = [
      { id: 'UTAMA', nama: 'Gudang Utama' },
      ...snapProyek.docs.map((d) => ({
        id: d.id,
        nama: 'Gudang ' + (d.data().nama_proyek || d.data().nama),
      })),
    ]

    const found = listGudang.find((g) => g.id === originWarehouseId)
    originWarehouseName.value = found ? found.nama : 'Gudang Lokal Proyek'

    // 2. Ambil Master Barang untuk dropdown
    const qBarang = query(collection(db, 'master_barang'), orderBy('nama', 'asc'))
    const snapBarang = await getDocs(qBarang)
    allBarang.value = snapBarang.docs.map((d) => ({
      id: d.id,
      nama: d.data().nama,
      satuan: d.data().unit,
    }))
    masterBarang.value = [...allBarang.value]
  } catch (error) {
    console.error('Fetch Data Error:', error)
    $q.notify({ type: 'negative', message: 'Gagal sinkronisasi master data' })
  }
}

const fetchCurrentUser = () => {
  const email = authStore.user?.email
  if (!email) return
  const q = query(collection(db, 'karyawan'), where('email', '==', email))
  unsubUser = onSnapshot(q, (snap) => {
    if (!snap.empty) userData.value = snap.docs[0].data()
  })
}

// --- LOGIKA FORM & TABEL ---
const addItemRow = () => {
  form.value.items.push({
    barang: null,
    id_barang: '',
    nama_barang: '',
    qty: 1,
    satuan: '',
    estimasi_harga: 0,
  })
}

const removeItemRow = (idx) => {
  form.value.items.splice(idx, 1)
}

const onBarangSelect = (val, idx) => {
  if (val) {
    form.value.items[idx].id_barang = val.id
    form.value.items[idx].nama_barang = val.nama
    form.value.items[idx].satuan = val.satuan
  }
}

const filterMasterBarang = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    masterBarang.value = allBarang.value.filter((v) => v.nama.toLowerCase().indexOf(needle) > -1)
  })
}

const calculateTotalPR = () => {
  return form.value.items.reduce((sum, it) => sum + (it.qty || 0) * (it.estimasi_harga || 0), 0)
}

// --- SUBMISSION LOGIC ---
const submitPurchaseRequest = async () => {
  // Validasi Dasar
  const validItems = form.value.items.filter((it) => it.id_barang && it.qty > 0)
  if (validItems.length === 0) {
    $q.notify({ type: 'warning', message: 'Tambahkan minimal satu material belanja!' })
    return
  }

  submitting.value = true
  $q.loading.show({ message: 'Memproses pengajuan PR...' })

  try {
    let docUrl = ''

    // 1. Upload File Analisa jika ada
    if (analisaFile.value) {
      const fileName = `pr_analisa_${Date.now()}_${analisaFile.value.name}`
      const fileRef = storageRef(storage, `gudang/purchase_requests/${fileName}`)
      const uploadSnap = await uploadBytes(fileRef, analisaFile.value)
      docUrl = await getDownloadURL(uploadSnap.ref)
    }

    // 2. Siapkan Payload
    const payload = {
      nomor: form.value.nomor,
      tipe: 'PURCHASE_REQUEST',
      status: 'Pending',
      dari_gudang: {
        id: originWarehouseId,
        nama: originWarehouseName.value,
      },
      ke_gudang: { id: 'PROCUREMENT', nama: 'Procurement Center' }, // Default target
      items: validItems.map((it) => ({
        id_barang: it.id_barang,
        nama_barang: it.nama_barang,
        qty: it.qty,
        satuan: it.satuan,
        estimasi_harga: it.estimasi_harga,
      })),
      total_estimasi: calculateTotalPR(),
      catatan: form.value.catatan,
      analisa_harga_url: docUrl,
      pemohon: {
        id: authStore.user?.uid || 'system',
        nama: userData.value?.nama || authStore.user?.nama || 'Petugas Logistik',
      },
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // 3. Simpan ke Firestore
    await addDoc(collection(db, 'permintaan_barang'), payload)

    $q.notify({
      type: 'positive',
      message: 'Purchase Request berhasil dikirim ke antrean pengadaan!',
      position: 'top',
      icon: 'shopping_cart',
    })

    router.back()
  } catch (err) {
    console.error('Submit Error:', err)
    $q.notify({ type: 'negative', message: 'Gagal mengirim pengajuan: ' + err.message })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

// --- LIFECYCLE ---
onMounted(() => {
  fetchData()
  fetchCurrentUser()
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
})
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
.border-dashed-blue {
  border: 2px dashed #90caf9;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}

.permintaan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
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

.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
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

/* Custom file btn style */
.btn-file-custom :deep(.q-field__control) {
  border-radius: 12px;
}
</style>
