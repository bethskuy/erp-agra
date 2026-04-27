<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap">
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
              Daftar Permintaan
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Antrean Request & Otorisasi Material</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Pantau dan proses seluruh permintaan mutasi stok atau pengadaan material baru secara
              real-time.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in summaryStats" :key="stat.label">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none">{{ stat.label }}</div>
              <div class="text-h4 text-weight-bolder q-mt-xs" :class="'text-' + stat.color">
                {{ stat.value }}
              </div>
            </div>
            <div
              :class="'bg-' + stat.color + '-1 q-pa-md rounded-borders'"
              style="min-width: 56px; text-align: center"
            >
              <q-icon :name="stat.icon" :color="stat.color" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- SEARCH & FILTER -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari No. Request, Nama Barang, atau Pemohon..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>
          <q-space />
          <div class="col-12 col-md-auto">
            <q-select
              v-model="statusFilter"
              :options="['Semua Status', 'Pending', 'Approved', 'Rejected']"
              outlined
              dense
              rounded
              bg-color="white"
              style="min-width: 180px"
              label="Filter Status"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- REQUEST TABLE -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="permintaan-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-indigo-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase font-11"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="viewDetail(props.row)"
          >
            <q-td key="nomor" class="text-weight-bolder text-indigo-10">
              {{ props.row.nomor || 'REQ-SYS-' + props.row.id.slice(0, 5) }}
            </q-td>
            <q-td key="tipe">
              <q-badge
                :color="props.row.tipe === 'ANTAR_GUDANG' ? 'orange-2' : 'blue-2'"
                :text-color="props.row.tipe === 'ANTAR_GUDANG' ? 'orange-10' : 'blue-10'"
                class="text-weight-bold"
              >
                {{ props.row.tipe === 'ANTAR_GUDANG' ? 'MUTASI' : 'PURCHASE' }}
              </q-badge>
            </q-td>
            <q-td key="pemohon">
              <div class="text-weight-bold text-blue-grey-9 uppercase font-12">
                {{ props.row.pemohon?.nama || 'Petugas Gudang' }}
              </div>
              <div class="text-caption text-grey-6 italic">
                {{ formatDate(props.row.timestamp) }}
              </div>
            </q-td>
            <q-td key="item">
              <div class="text-weight-medium">
                {{ props.row.items?.[0]?.nama_barang || 'Multiple Items' }}
                <q-badge
                  v-if="props.row.items?.length > 1"
                  color="grey-3"
                  text-color="grey-8"
                  class="q-ml-xs"
                >
                  +{{ props.row.items.length - 1 }} Item
                </q-badge>
              </div>
            </q-td>
            <q-td key="gudang_asal">
              <div class="row items-center no-wrap">
                <q-icon name="warehouse" color="grey-5" class="q-mr-xs" size="xs" />
                <span class="text-weight-bold">{{ props.row.dari_gudang?.nama || '-' }}</span>
              </div>
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                size="sm"
                class="text-weight-bold uppercase"
              >
                {{ props.row.status || 'Pending' }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-sm">
                <q-btn
                  flat
                  round
                  color="indigo-10"
                  icon="visibility"
                  size="sm"
                  @click="viewDetail(props.row)"
                >
                  <q-tooltip>Lihat Detail</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.status === 'Pending'"
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="deleteRequest(props.row)"
                >
                  <q-tooltip>Batalkan Request</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- MODERN & LUXURY DETAIL MODAL -->
    <q-dialog
      v-model="showDetail"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(8px)"
    >
      <q-card class="column no-wrap overflow-hidden bg-grey-2" v-if="selectedRequest">
        <!-- HEADER (FIXED) -->
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink no-print">
          <q-icon name="assignment" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold uppercase letter-spacing-1"
            >Lembar Otorisasi Barang</q-toolbar-title
          >

          <!-- TOMBOL CETAK SURAT JALAN -->
          <q-btn
            v-if="selectedRequest.status === 'Approved' && selectedRequest.tipe === 'ANTAR_GUDANG'"
            unelevated
            color="white"
            text-color="indigo-10"
            icon="print"
            label="CETAK SURAT JALAN"
            class="q-mr-md text-weight-bold rounded-20 shadow-2"
            @click="printSuratJalan"
          />

          <q-btn icon="close" flat round dense v-close-popup />
        </q-toolbar>

        <!-- AREA KONTEN (SCROLLABLE) -->
        <q-card-section class="col scroll q-pa-md q-pa-md-xl print-container">
          <div class="row justify-center">
            <div class="col-12 col-md-10 col-lg-8">
              <!-- INFO DOKUMEN HEADER -->
              <div class="row q-col-gutter-lg q-mb-xl no-print">
                <div class="col-12 col-sm-6">
                  <q-card
                    flat
                    bordered
                    class="rounded-borders q-pa-md bg-white border-indigo-thin shadow-sm"
                  >
                    <div
                      class="text-overline text-grey-6 uppercase tracking-widest leading-none q-mb-xs"
                    >
                      No. Dokumen Permintaan
                    </div>
                    <div class="text-h5 text-indigo-10 text-weight-black">
                      {{ selectedRequest.nomor || 'N/A' }}
                    </div>
                  </q-card>
                </div>
                <div class="col-12 col-sm-6">
                  <q-card
                    flat
                    bordered
                    class="rounded-borders q-pa-md bg-white border-indigo-thin shadow-sm"
                  >
                    <div
                      class="text-overline text-grey-6 uppercase tracking-widest leading-none q-mb-xs"
                    >
                      Kategori Alur Stok
                    </div>
                    <div class="text-h6 text-weight-bold text-uppercase text-primary">
                      {{
                        selectedRequest.tipe === 'ANTAR_GUDANG'
                          ? 'Internal Transfer (Mutasi)'
                          : 'Purchase Request (Beli)'
                      }}
                    </div>
                  </q-card>
                </div>
              </div>

              <!-- ALUR LOGISTIK VISUAL -->
              <div
                class="row items-center justify-center q-mb-xl q-pa-xl bg-white rounded-20 shadow-sm border-subtle no-print"
              >
                <!-- SUMBER / PEMBERI -->
                <div class="col-12 col-md-5 text-center">
                  <q-avatar
                    size="80px"
                    color="orange-1"
                    text-color="orange-10"
                    icon="warehouse"
                    class="shadow-2"
                  />
                  <div class="text-h6 q-mt-sm text-weight-bold text-orange-10">
                    {{ selectedRequest.dari_gudang?.nama || 'Gudang Sumber' }}
                  </div>
                  <div class="text-overline text-grey-7 text-weight-bold uppercase q-mt-xs">
                    (SUMBER / PENGIRIM STOK)
                  </div>
                </div>

                <!-- PANAH INDIKATOR -->
                <div class="col-12 col-md-2 column items-center q-py-md">
                  <q-icon
                    name="double_arrow"
                    size="lg"
                    color="indigo-10"
                    class="animate-bounce-h"
                  />
                  <q-badge
                    color="grey-3"
                    text-color="indigo-10"
                    class="q-mt-sm text-weight-bold q-px-md shadow-sm"
                  >
                    {{ selectedRequest.items?.length || 0 }} Items
                  </q-badge>
                </div>

                <!-- TUJUAN / PENERIMA -->
                <div class="col-12 col-md-5 text-center">
                  <q-avatar
                    size="80px"
                    color="green-1"
                    text-color="green-10"
                    icon="domain_verification"
                    class="shadow-2"
                  />
                  <div class="text-h6 q-mt-sm text-weight-bold text-green-10">
                    {{ selectedRequest.ke_gudang?.nama || 'Gudang Tujuan' }}
                  </div>
                  <div class="text-overline text-grey-7 text-weight-bold uppercase q-mt-xs">
                    (TUJUAN AKHIR / PENERIMA)
                  </div>
                </div>
              </div>

              <!-- TABEL RINCIAN -->
              <div
                class="text-h6 text-weight-bold text-blue-grey-10 q-mb-md uppercase flex items-center"
              >
                <q-icon name="list_alt" class="q-mr-sm" color="indigo-10" /> Rincian Material
                Pekerjaan
              </div>
              <q-markup-table
                flat
                bordered
                separator="horizontal"
                class="rounded-20 q-mb-xl border-subtle bg-white shadow-sm overflow-hidden"
              >
                <thead class="bg-indigo-1">
                  <tr class="text-weight-bold text-indigo-10">
                    <th class="text-left q-pa-md">DESKRIPSI MATERIAL</th>
                    <th class="text-center" width="120">QTY REQUEST</th>
                    <th class="text-center" width="120">UNIT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in selectedRequest.items" :key="i">
                    <td class="text-left q-pa-md">
                      <div class="text-weight-bold text-blue-grey-9 uppercase">
                        {{ item.nama_barang }}
                      </div>
                      <div class="text-caption text-grey-6 italic">
                        {{ item.kategori_nama || 'General Material' }}
                      </div>
                    </td>
                    <td class="text-center text-h6 text-weight-black text-indigo-10">
                      {{ item.qty }}
                    </td>
                    <td class="text-center uppercase text-caption text-weight-bold text-grey-7">
                      {{ item.satuan }}
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>

              <!-- CATATAN -->
              <div
                v-if="selectedRequest.catatan"
                class="bg-white q-pa-xl rounded-20 q-mb-xl border-left-indigo shadow-sm no-print"
              >
                <div class="text-caption text-indigo-10 text-weight-bold uppercase q-mb-sm">
                  Justifikasi / Catatan Pemohon:
                </div>
                <div class="text-h6 text-grey-8 italic text-weight-light leading-relaxed">
                  "{{ selectedRequest.catatan }}"
                </div>
              </div>

              <div class="q-py-xl"></div>
            </div>
          </div>
        </q-card-section>

        <!-- FOOTER ACTION (FIXED) -->
        <q-separator class="no-print" />
        <q-card-actions class="bg-white q-pa-lg q-px-xl shrink no-print">
          <template v-if="selectedRequest.status === 'Pending' || !selectedRequest.status">
            <!-- TAMPILKAN TOMBOL JIKA USER PUNYA OTORITAS (GUDANG SUMBER) -->
            <div v-if="canApproveThisRequest" class="row full-width q-col-gutter-lg justify-center">
              <div class="col-12 col-md-4">
                <q-btn
                  color="positive"
                  class="full-width text-weight-black rounded-20 q-py-lg shadow-8 btn-hover"
                  icon="verified"
                  label="SETUJUI & MUTASI STOK"
                  unelevated
                  @click="processApproval('Approved')"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-btn
                  outline
                  color="negative"
                  class="full-width text-weight-bold rounded-20 q-py-lg bg-white"
                  icon="block"
                  label="TOLAK PERMINTAAN"
                  @click="processApproval('Rejected')"
                />
              </div>
            </div>

            <!-- TAMPILKAN PESAN JIKA USER TIDAK PUNYA OTORITAS (SI PEMOHON) -->
            <div v-else class="row full-width flex-center">
              <q-banner
                dense
                class="bg-orange-1 text-orange-10 rounded-20 q-pa-md border-dashed-orange"
              >
                <template v-slot:avatar>
                  <q-icon name="lock_person" color="orange-9" />
                </template>
                <div class="text-weight-bold">Otoritas Otorisasi Terbatas</div>
                <div class="text-caption">
                  Permintaan ini hanya dapat diproses oleh petugas di
                  <b>{{ selectedRequest.dari_gudang?.nama }}</b
                  >. Gudang penerima tidak diizinkan menyetujui mutasi stok sendiri.
                </div>
              </q-banner>
            </div>
          </template>

          <!-- JIKA SUDAH DIPROSES -->
          <div
            v-else
            class="row full-width items-center justify-between q-pa-md rounded-20 border-subtle"
            :class="'bg-' + getStatusColor(selectedRequest.status) + '-1'"
          >
            <div class="row items-center">
              <q-icon
                :name="selectedRequest.status === 'Approved' ? 'verified' : 'cancel'"
                :color="getStatusColor(selectedRequest.status)"
                size="lg"
                class="q-mr-md"
              />
              <div>
                <div
                  class="text-h5 text-weight-black uppercase"
                  :class="'text-' + getStatusColor(selectedRequest.status)"
                >
                  DOKUMEN {{ selectedRequest.status }}
                </div>
                <div class="text-caption text-grey-7 uppercase text-weight-bold">
                  Proses Otorisasi Selesai
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-subtitle2 text-grey-8">
                Divalidasi oleh: <b>{{ selectedRequest.processedBy || 'Sistem Otoritas' }}</b>
              </div>
              <div class="text-caption text-grey-6 italic">
                {{ formatDate(selectedRequest.updatedAt) }}
              </div>
            </div>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="q-py-xl no-print"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
  runTransaction,
  increment,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

// --- INITIALIZATION ---
const $q = useQuasar()
const authStore = useAuthStore()

const rows = ref([])
const loading = ref(true)
const filter = ref('')
const statusFilter = ref('Semua Status')
const showDetail = ref(false)
const selectedRequest = ref(null)
const userData = ref(null)

let unsubPermintaan = null
let unsubUser = null

// --- LOGIKA OTORISASI: SIAPA YANG BOLEH APPROVE? ---
const canApproveThisRequest = computed(() => {
  if (!selectedRequest.value || !userData.value) return false

  // 1. Super Admin selalu punya akses (Master Override)
  if (authStore.user?.role === 'Super Admin') return true

  // 2. Jika mutasi antar gudang, hanya petugas di GUDANG SUMBER (Pemberi) yang boleh approve
  if (selectedRequest.value.tipe === 'ANTAR_GUDANG') {
    // Si Pemohon (Tujuan) dilarang keras approve sendiri
    if (userData.value.id_gudang === selectedRequest.value.ke_gudang?.id) return false

    // Hanya boleh jika user bertugas di Gudang Pengirim
    return userData.value.id_gudang === selectedRequest.value.dari_gudang?.id
  }

  // 3. Untuk Purchase Request (PR), asumsikan petugas logistik pusat/admin boleh
  return true
})

// --- TABLE COLUMNS ---
const columns = [
  { name: 'nomor', align: 'left', label: 'NO. REQUEST', field: 'nomor', sortable: true },
  { name: 'tipe', align: 'left', label: 'JENIS', field: 'tipe', sortable: true },
  { name: 'pemohon', align: 'left', label: 'PEMOHON / WAKTU', field: 'pemohon' },
  { name: 'item', align: 'left', label: 'ITEM UTAMA', field: 'items' },
  { name: 'gudang_asal', align: 'left', label: 'SUMBER (PEMBERI)', field: 'dari_gudang' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'KELOLA', field: 'id' },
]

const filteredRows = computed(() => {
  let list = rows.value
  if (statusFilter.value !== 'Semua Status') {
    list = list.filter((r) => (r.status || 'Pending') === statusFilter.value)
  }
  return list
})

const summaryStats = computed(() => {
  return [
    { label: 'Total Permintaan', value: rows.value.length, icon: 'list_alt', color: 'indigo' },
    {
      label: 'Pending Approval',
      value: rows.value.filter((r) => r.status === 'Pending' || !r.status).length,
      icon: 'pending',
      color: 'orange-9',
    },
    {
      label: 'Approved',
      value: rows.value.filter((r) => r.status === 'Approved').length,
      icon: 'check_circle',
      color: 'positive',
    },
    {
      label: 'Rejected',
      value: rows.value.filter((r) => r.status === 'Rejected').length,
      icon: 'cancel',
      color: 'negative',
    },
  ]
})

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'positive'
    case 'Rejected':
      return 'negative'
    case 'Pending':
      return 'orange-9'
    default:
      return 'grey-7'
  }
}

const formatDate = (ts) => {
  if (!ts) return '-'
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (err) {
    console.error('Format Date Error:', err)
    return '-'
  }
}

const fetchRequests = () => {
  loading.value = true
  const q = query(collection(db, 'permintaan_barang'), orderBy('timestamp', 'desc'))
  unsubPermintaan = onSnapshot(q, (snap) => {
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
}

const fetchCurrentUser = () => {
  const email = authStore.user?.email
  if (!email) return
  const q = query(collection(db, 'karyawan'), where('email', '==', email))
  unsubUser = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) userData.value = snapshot.docs[0].data()
  })
}

const viewDetail = (row) => {
  selectedRequest.value = { ...row }
  showDetail.value = true
}

const printSuratJalan = () => {
  window.print()
}

// LOGIKA UTAMA: APPROVAL & MUTASI STOK OTOMATIS
const processApproval = async (status) => {
  if (!selectedRequest.value?.id) return

  $q.dialog({
    title: 'Konfirmasi Otorisasi',
    message:
      'Apakah Anda yakin ingin memberi status "' +
      status +
      '" pada permintaan ' +
      (selectedRequest.value.nomor || 'ini') +
      '?',
    cancel: { flat: true, color: 'grey-7', label: 'Batal' },
    ok: {
      color: status === 'Approved' ? 'positive' : 'negative',
      unelevated: true,
      rounded: true,
      label: status === 'Approved' ? 'Ya, Setujui & Mutasi' : 'Ya, Tolak',
    },
    persistent: true,
  }).onOk(async () => {
    $q.loading.show({ message: 'Memproses pemindahan stok aman...' })

    try {
      const req = selectedRequest.value

      // JIKA APPROVED & MUTASI ANTAR GUDANG -> JALANKAN LOGIKA PEMINDAHAN STOK
      if (status === 'Approved' && req.tipe === 'ANTAR_GUDANG') {
        await runTransaction(db, async (transaction) => {
          for (const item of req.items) {
            const idBarang = item.id_barang
            const qty = Number(item.qty)

            // GUDANG SUMBER (PENGIRIM/PEMBERI)
            const sourceGudangId = req.dari_gudang.id
            // GUDANG PENERIMA (TUJUAN/PEMOHON)
            const destGudangId = req.ke_gudang.id

            // 1. CEK STOK DI GUDANG SUMBER
            const sourceRefQuery = query(
              collection(db, 'stok_barang'),
              where('id_gudang', '==', sourceGudangId),
              where('id_barang', '==', idBarang),
            )
            const sourceSnap = await getDocs(sourceRefQuery)

            if (sourceSnap.empty)
              throw new Error('Material ' + item.nama_barang + ' tidak tersedia di gudang sumber!')

            const sourceDoc = sourceSnap.docs[0]
            const sourceStock = sourceDoc.data().jumlah || 0

            if (sourceStock < qty)
              throw new Error(
                'Stok ' +
                  item.nama_barang +
                  ' di gudang sumber kurang (Tersedia: ' +
                  sourceStock +
                  ')',
              )

            // 2. CEK/BUAT STOK DI GUDANG PENERIMA
            const destRefQuery = query(
              collection(db, 'stok_barang'),
              where('id_gudang', '==', destGudangId),
              where('id_barang', '==', idBarang),
            )
            const destSnap = await getDocs(destRefQuery)

            // UPDATE STOK SUMBER (KURANGI)
            transaction.update(doc(db, 'stok_barang', sourceDoc.id), {
              jumlah: increment(-qty),
              updated_at: serverTimestamp(),
            })

            // UPDATE STOK PENERIMA (TAMBAH)
            if (!destSnap.empty) {
              transaction.update(doc(db, 'stok_barang', destSnap.docs[0].id), {
                jumlah: increment(qty),
                updated_at: serverTimestamp(),
              })
            } else {
              const newStokRef = doc(collection(db, 'stok_barang'))
              transaction.set(newStokRef, {
                id_gudang: destGudangId,
                id_barang: idBarang,
                nama_barang: item.nama_barang,
                jumlah: qty,
                satuan: item.satuan,
                created_at: serverTimestamp(),
              })
            }

            // 3. CATAT AKTIVITAS HISTORY
            const logOutRef = doc(collection(db, 'aktivitas'))
            transaction.set(logOutRef, {
              id_gudang: sourceGudangId,
              nama_barang: item.nama_barang,
              tipe: 'KELUAR',
              jumlah: qty,
              satuan: item.satuan,
              no_referensi: req.nomor,
              keterangan: 'Mutasi keluar ke ' + req.ke_gudang.nama,
              timestamp: serverTimestamp(),
            })

            const logInRef = doc(collection(db, 'aktivitas'))
            transaction.set(logInRef, {
              id_gudang: destGudangId,
              nama_barang: item.nama_barang,
              tipe: 'MASUK',
              jumlah: qty,
              satuan: item.satuan,
              no_referensi: req.nomor,
              keterangan: 'Penerimaan mutasi dari ' + req.dari_gudang.nama,
              timestamp: serverTimestamp(),
            })
          }

          // Update Status Permintaan Barang
          transaction.update(doc(db, 'permintaan_barang', req.id), {
            status: 'Approved',
            updatedAt: serverTimestamp(),
            processedBy: userData.value?.nama || 'Administrator',
          })
        })
      } else {
        await updateDoc(doc(db, 'permintaan_barang', req.id), {
          status: status,
          updatedAt: serverTimestamp(),
          processedBy: userData.value?.nama || 'Administrator',
        })
      }

      $q.notify({
        type: 'positive',
        message: 'Permintaan ' + req.nomor + ' berhasil di-' + status + '!',
        position: 'top',
      })
      showDetail.value = false
    } catch (err) {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Gagal: ' + err.message })
    } finally {
      $q.loading.hide()
    }
  })
}

const deleteRequest = (row) => {
  if (!row.id) return
  $q.dialog({
    title: 'Hapus Draft?',
    message: 'Hapus permanen permintaan nomor ' + row.nomor + '?',
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Hapus' },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'permintaan_barang', row.id))
      $q.notify({ icon: 'delete', message: 'Draf telah dihapus' })
    } catch (err) {
      console.error(err)
    }
  })
}

onMounted(() => {
  fetchRequests()
  fetchCurrentUser()
})

onUnmounted(() => {
  if (unsubPermintaan) unsubPermintaan()
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
.rounded-borders {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 40px rgba(25, 118, 210, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-left-indigo {
  border-left: 6px solid #1a237e;
}
.border-dashed-orange {
  border: 2px dashed #ff9800;
}

.permintaan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.btn-hover:hover {
  transform: translateY(-4px);
  filter: brightness(1.1);
  transition: 0.3s;
}

.animate-bounce-h {
  animation: bounceHorizontal 2s infinite;
}
@keyframes bounceHorizontal {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
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
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.shrink {
  flex: 0 0 auto;
}

/* PRINT STYLES */
.print-only {
  display: none;
}
@media print {
  @page {
    size: A4;
    margin: 15mm;
  }
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
  .q-card {
    box-shadow: none !important;
    border: none !important;
    max-height: none !important;
  }
  .scroll {
    overflow: visible !important;
    height: auto !important;
  }
  body {
    background: white !important;
  }
}
</style>
