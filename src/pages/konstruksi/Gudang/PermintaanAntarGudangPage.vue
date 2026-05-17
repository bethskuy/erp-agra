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
          Permintaan Antar Gudang
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Internal Stock Transfer Request</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Ajukan mutasi material dari gudang pendukung ke lokasi gudang Anda.
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg justify-center">
      <!-- FORM KIRI: IDENTITAS & RUTE -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
          <div class="text-subtitle1 text-indigo-10 text-weight-bolder q-mb-lg flex items-center">
            <q-icon name="swap_horiz" class="q-mr-sm" /> KONFIGURASI RUTE MUTASI
          </div>

          <div class="q-gutter-y-md">
            <!-- Gudang Sumber (Pilih Gudang yang akan dikurangi stoknya) -->
            <q-select
              outlined
              v-model="targetWarehouse"
              :options="warehouseOptions"
              option-label="nama"
              label="Pilih Gudang Sumber (Pemberi Stok) *"
              stack-label
              :rules="[(val) => !!val || 'Pilih gudang sumber barang']"
            >
              <template v-slot:prepend><q-icon name="warehouse" color="orange-9" /></template>
              <template v-slot:hint>Gudang yang stoknya akan dipotong saat disetujui.</template>
            </q-select>

            <div class="row justify-center q-my-sm">
              <q-icon name="south" color="primary" size="md" class="animate-bounce" />
            </div>

            <!-- Gudang Pemohon (Locked: Gudang Aktif/Tujuan Akhir) -->
            <q-input
              filled
              v-model="originWarehouseName"
              label="Gudang Penerima (Tujuan Akhir)"
              readonly
              bg-color="indigo-1"
              class="text-weight-bold"
              stack-label
            >
              <template v-slot:prepend><q-icon name="input" color="indigo-10" /></template>
              <template v-slot:hint>Stok akan bertambah di gudang ini.</template>
            </q-input>

            <q-separator class="q-my-md" />

            <q-input
              outlined
              v-model="form.nomor"
              label="Nomor Dokumen Request"
              readonly
              stack-label
              bg-color="grey-1"
            />

            <q-input
              outlined
              v-model="form.catatan"
              type="textarea"
              label="Justifikasi / Keperluan Permintaan"
              placeholder="Contoh: Percepatan struktur lantai 2 atau stok kritis..."
              rows="3"
            />
          </div>
        </q-card>

        <!-- Preview Status -->
        <div class="q-mt-lg q-pa-lg bg-blue-1 rounded-20 border-dashed-blue text-center">
          <div class="text-overline text-primary uppercase tracking-widest">Status Dokumen</div>
          <div class="text-h5 text-weight-bolder text-indigo-10 uppercase">Waiting Approval</div>
          <div class="text-caption text-grey-7">
            Data akan diverifikasi oleh Manajer Logistik sebelum stok berpindah.
          </div>
        </div>
      </div>

      <!-- FORM KANAN: DAFTAR BARANG -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="rounded-20 bg-white shadow-1 overflow-hidden">
          <q-toolbar class="bg-indigo-10 text-white q-py-sm">
            <q-icon name="list" class="q-mr-sm" />
            <q-toolbar-title class="text-weight-bold text-subtitle1"
              >DAFTAR MATERIAL YANG DIMINTA</q-toolbar-title
            >
            <q-btn flat round dense icon="add_circle" @click="addItemRow">
              <q-tooltip>Tambah Baris</q-tooltip>
            </q-btn>
          </q-toolbar>

          <q-card-section class="q-pa-none">
            <q-markup-table flat separator="horizontal" class="permintaan-table">
              <thead>
                <tr class="bg-grey-1 text-indigo-10">
                  <th width="50">NO</th>
                  <th class="text-left">NAMA BARANG / MATERIAL</th>
                  <th width="100">QTY</th>
                  <th width="100">UNIT</th>
                  <th width="50"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.items" :key="index">
                  <td class="text-center text-grey-6">{{ index + 1 }}</td>
                  <td>
                    <!-- FIX: Menggunakan Placeholder Dinamis agar hilang ketika barang sudah terpilih -->
                    <q-select
                      dense
                      borderless
                      v-model="item.barang"
                      :options="masterBarang"
                      option-label="nama"
                      :placeholder="item.barang ? '' : 'Pilih material...'"
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
                    <q-badge outline color="grey-7" class="uppercase text-weight-bold">
                      {{ item.satuan || '-' }}
                    </q-badge>
                  </td>
                  <td class="text-center">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="remove_circle_outline"
                      size="sm"
                      @click="removeItemRow(index)"
                      :disable="form.items.length === 1"
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>

            <div v-if="form.items.length === 0" class="q-pa-xl text-center text-grey-5">
              Klik ikon plus di pojok kanan atas untuk menambah item.
            </div>

            <q-card-actions align="right" class="q-pa-lg bg-grey-1 border-top">
              <q-btn
                unelevated
                color="indigo-10"
                label="KIRIM PERMINTAAN MUTASI"
                icon="send"
                class="q-px-xl text-weight-bold rounded-20 shadow-4"
                :loading="submitting"
                @click="submitRequest"
              />
            </q-card-actions>
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
import { db } from 'src/boot/firebase'
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
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

// --- INISIALISASI ---
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const originWarehouseId = route.params.id // ID Gudang Kamu (Penerima)
const originWarehouseName = ref('Memuat...')
const submitting = ref(false)
const warehouseOptions = ref([])
const targetWarehouse = ref(null) // Gudang Sumber yang dipilih
const masterBarang = ref([])
const allBarang = ref([])

const form = ref({
  nomor: 'REQ/' + Date.now().toString().slice(-6),
  catatan: '',
  items: [{ barang: null, id_barang: '', nama_barang: '', qty: 1, satuan: '' }],
})

let unsubUser = null
const userData = ref(null)

// --- FETCH DATA ---
const fetchData = async () => {
  try {
    // 1. Ambil Nama Gudang Penerima (Pemohon - Current Page)
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
    originWarehouseName.value = found ? found.nama : 'Gudang Lokal'

    // 2. Opsi Gudang Sumber (Filter agar tidak bisa pilih diri sendiri)
    warehouseOptions.value = listGudang.filter((g) => g.id !== originWarehouseId)

    // 3. Ambil Master Barang
    const qBarang = query(collection(db, 'master_barang'), orderBy('nama', 'asc'))
    const snapBarang = await getDocs(qBarang)
    allBarang.value = snapBarang.docs.map((d) => ({
      id: d.id,
      nama: d.data().nama,
      satuan: d.data().unit,
    }))
    masterBarang.value = [...allBarang.value]
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal memuat database material' })
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

// --- LOGIKA FORM ---
const addItemRow = () => {
  form.value.items.push({ barang: null, id_barang: '', nama_barang: '', qty: 1, satuan: '' })
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

const submitRequest = async () => {
  // Validasi Dasar
  if (!targetWarehouse.value) {
    $q.notify({ type: 'warning', message: 'Silakan tentukan gudang sumber pengirim!' })
    return
  }

  const validItems = form.value.items.filter((it) => it.id_barang && it.qty > 0)
  if (validItems.length === 0) {
    $q.notify({ type: 'warning', message: 'Input minimal satu material yang valid!' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      nomor: form.value.nomor,
      tipe: 'ANTAR_GUDANG',
      status: 'Pending',

      dari_gudang: {
        id: targetWarehouse.value.id,
        nama: targetWarehouse.value.nama,
      },
      ke_gudang: {
        id: originWarehouseId,
        nama: originWarehouseName.value,
      },

      items: validItems.map((it) => ({
        id_barang: it.id_barang,
        nama_barang: it.nama_barang,
        qty: it.qty,
        satuan: it.satuan,
      })),
      catatan: form.value.catatan,
      pemohon: {
        id: authStore.user?.uid || 'unknown',
        nama: userData.value?.nama || authStore.user?.nama || 'Petugas Gudang',
      },
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await addDoc(collection(db, 'permintaan_barang'), payload)

    $q.notify({
      type: 'positive',
      message: 'Permintaan mutasi berhasil dikirim ke antrean logistik!',
      position: 'top',
      icon: 'check_circle',
    })

    router.back()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal sinkronisasi data: ' + err.message })
  } finally {
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
  border: 2px dashed #bbdefb;
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-top {
  border-top: 1px solid #eee;
}

.permintaan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s ease;
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
  font-size: 12px;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.tracking-widest {
  letter-spacing: 0.2em;
}
.no-padding {
  padding: 0 !important;
}
</style>
