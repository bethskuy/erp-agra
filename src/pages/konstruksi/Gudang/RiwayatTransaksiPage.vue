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
              Riwayat Transaksi
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
                Gudang:
                {{ warehouseId === 'UTAMA' ? 'Pusat (Utama)' : warehouseId || 'Lokasi Terpilih' }}
              </span>
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Memantau log aktivitas spesifik pada lokasi gudang ini secara real-time.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUMMARY & FILTER CARD -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <!-- Search Bar -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari Barang, Ref, atau SPK..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Type Filter Toggle -->
          <div class="col-12 col-md-auto">
            <q-btn-toggle
              v-model="typeFilter"
              flat
              rounded
              toggle-color="indigo-10"
              color="grey-7"
              :options="[
                { label: 'Semua', value: 'ALL' },
                { label: 'Masuk', value: 'MASUK' },
                { label: 'Keluar', value: 'KELUAR' },
                { label: 'Opname', value: 'OPNAME' },
              ]"
            />
          </div>

          <q-space />

          <div class="col-12 col-md-auto text-right">
            <q-badge color="indigo-10" class="q-px-md q-py-xs text-weight-bold shadow-2">
              {{ filteredRows.length }} Record Log
            </q-badge>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE SECTION -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="history-table"
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
            @click="openDetail(props.row)"
          >
            <!-- Kolom Tipe -->
            <q-td key="tipe" class="text-center">
              <q-chip
                :color="getTipeColor(props.row.tipe)"
                text-color="white"
                size="sm"
                class="text-weight-bold uppercase shadow-sm"
                :icon="getTipeIcon(props.row.tipe)"
              >
                {{ props.row.tipe }}
              </q-chip>
            </q-td>

            <!-- Kolom Barang -->
            <q-td key="nama_barang">
              <div
                class="text-weight-black text-blue-grey-10 text-subtitle2 uppercase leading-none"
              >
                {{ props.row.nama_barang }}
              </div>
              <div class="text-caption text-grey-5 q-mt-xs">
                ID: {{ props.row.id_barang || 'MATERIAL' }}
              </div>
            </q-td>

            <!-- Kolom Jumlah -->
            <q-td key="jumlah" class="text-center">
              <div class="text-weight-black text-h6" :class="getAmountColor(props.row.tipe)">
                {{ props.row.tipe === 'KELUAR' ? '-' : props.row.tipe === 'MASUK' ? '+' : ''
                }}{{ props.row.jumlah }}
              </div>
              <div class="text-caption text-grey-5 uppercase text-weight-bold">
                {{ props.row.satuan || 'UNIT' }}
              </div>
            </q-td>

            <!-- Kolom Waktu -->
            <q-td key="timestamp">
              <div class="text-weight-medium text-blue-grey-9">
                {{ formatDate(props.row.timestamp) }}
              </div>
              <div class="text-caption text-grey-5 italic">
                Pukul {{ formatTime(props.row.timestamp) }}
              </div>
            </q-td>

            <!-- Kolom Referensi -->
            <q-td key="ref" class="text-indigo-9 text-weight-bold">
              {{ props.row.no_referensi || '-' }}
            </q-td>

            <!-- Kolom No SPK -->
            <q-td key="no_spk" class="text-primary text-weight-bolder">
              {{ props.row.no_spk || '-' }}
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="history_toggle_off" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center italic">
              Belum ada riwayat aktivitas di gudang ini
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- MODERN DETAIL DIALOG -->
    <q-dialog
      v-model="showDetailDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(8px)"
    >
      <q-card class="column no-wrap overflow-hidden bg-grey-2" v-if="selectedItem">
        <!-- Header Toolbar -->
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink">
          <q-icon name="assignment" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold uppercase letter-spacing-1"
            >Arsip Detail Transaksi Digital</q-toolbar-title
          >
          <q-btn icon="close" flat round dense v-close-popup />
        </q-toolbar>

        <!-- Main Content Area -->
        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-11 col-lg-10">
              <!-- 1. STATUS & TIME HEADER -->
              <div class="row justify-between items-end q-mb-xl animate-fade">
                <div class="column">
                  <div
                    class="text-overline text-grey-6 leading-none q-mb-sm uppercase tracking-widest font-black"
                  >
                    Status Klasifikasi
                  </div>
                  <q-chip
                    :color="getTipeColor(selectedItem.tipe)"
                    text-color="white"
                    class="text-weight-black q-px-xl q-py-lg shadow-5"
                  >
                    <q-icon :name="getTipeIcon(selectedItem.tipe)" class="q-mr-md" size="sm" />
                    {{ selectedItem.tipe }} MATERIAL
                  </q-chip>
                </div>
                <div class="text-right">
                  <div
                    class="text-overline text-grey-6 leading-none q-mb-xs uppercase tracking-widest font-black"
                  >
                    Waktu Sinkronisasi
                  </div>
                  <div class="text-h4 text-weight-black text-blue-grey-10">
                    {{ formatDate(selectedItem.timestamp) }}
                  </div>
                  <div class="text-subtitle1 text-primary text-weight-bold">
                    Pukul {{ formatTime(selectedItem.timestamp) }} WIB
                  </div>
                </div>
              </div>

              <!-- 2. METADATA CONTEXT -->
              <div class="row q-col-gutter-lg q-mb-xl">
                <div class="col-12">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 bg-white shadow-premium border-indigo-thin overflow-hidden"
                  >
                    <q-card-section
                      class="bg-indigo-1 q-pa-md text-weight-black text-indigo-10 uppercase tracking-widest flex items-center"
                    >
                      <q-icon name="folder_shared" class="q-mr-sm" /> Rincian Administrasi Transaksi
                    </q-card-section>
                    <q-card-section class="q-pa-lg">
                      <div class="row q-col-gutter-xl">
                        <div class="col-12 col-sm-4">
                          <div class="text-overline text-grey-5 leading-none q-mb-xs font-bold">
                            No. Surat Jalan / Ref
                          </div>
                          <div class="text-h6 text-weight-black text-indigo-10">
                            {{ selectedItem.no_referensi || '-' }}
                          </div>
                        </div>
                        <div class="col-12 col-sm-4 border-left-gt-xs">
                          <div class="text-overline text-grey-5 leading-none q-mb-xs font-bold">
                            No. SPK Terkait
                          </div>
                          <div class="text-h6 text-weight-bold text-primary">
                            {{ selectedItem.no_spk || '-' }}
                          </div>
                        </div>
                        <div class="col-12 col-sm-4 border-left-gt-xs">
                          <div class="text-overline text-grey-5 leading-none q-mb-xs font-bold">
                            Penerima UP (Attention)
                          </div>
                          <div class="text-h6 text-weight-bold text-blue-grey-10 uppercase">
                            {{ selectedItem.penerima_up || '-' }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- 3. MAIN ITEM TABLE -->
              <div class="q-mb-md">
                <div
                  class="text-h6 text-weight-black text-indigo-10 uppercase q-mb-md flex items-center letter-spacing-1"
                >
                  <q-icon name="list_alt" class="q-mr-sm" size="md" color="indigo-10" />
                  Rincian Material & Keterangan Item
                </div>
                <q-card
                  flat
                  bordered
                  class="rounded-20 overflow-hidden shadow-sm bg-white border-subtle"
                >
                  <q-markup-table flat separator="cell" class="perfectionist-table">
                    <thead>
                      <tr class="bg-blue-grey-10 text-white text-bold uppercase font-11">
                        <th width="60">NO</th>
                        <th class="text-left" width="180">KODE BARANG</th>
                        <th class="text-left">NAMA MATERIAL / ITEM</th>
                        <th width="100">QTY</th>
                        <th width="100">SATUAN</th>
                        <th class="text-left">KETERANGAN (NOTE)</th>
                      </tr>
                    </thead>
                    <tbody class="text-blue-grey-10">
                      <tr>
                        <td class="text-center font-black">1</td>
                        <td class="text-weight-medium text-grey-7 font-mono">
                          {{
                            selectedItem.id_barang ||
                            'SKU-' + selectedItem.id?.slice(0, 6).toUpperCase()
                          }}
                        </td>
                        <td class="text-weight-black uppercase text-subtitle2">
                          {{ selectedItem.nama_barang }}
                        </td>
                        <td
                          class="text-center text-weight-black text-h5"
                          :class="getAmountColor(selectedItem.tipe)"
                        >
                          {{ selectedItem.jumlah }}
                        </td>
                        <td class="text-center text-weight-bold uppercase text-caption">
                          {{ selectedItem.satuan || 'UNIT' }}
                        </td>
                        <td class="italic text-weight-bolder text-primary bg-blue-grey-1">
                          {{ selectedItem.keterangan || selectedItem.catatan || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-card>
              </div>

              <!-- 4. CATATAN UMUM (DIPINDAHKAN KE BAWAH TABEL SESUAI PERMINTAAN BOS) -->
              <div class="q-mb-xl">
                <q-card flat bordered class="rounded-20 bg-white shadow-sm border-subtle">
                  <q-card-section
                    class="bg-grey-1 q-pa-sm text-weight-bold text-blue-grey-8 uppercase text-caption q-px-md tracking-widest"
                  >
                    <q-icon name="comment" class="q-mr-xs" /> Catatan / Justifikasi Transaksi
                  </q-card-section>
                  <q-card-section class="q-pa-lg">
                    <div class="text-body1 text-blue-grey-9 italic leading-relaxed">
                      "{{
                        selectedItem.catatan_umum ||
                        selectedItem.keterangan ||
                        'Tidak ada catatan tambahan.'
                      }}"
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- 5. OPNAME DASHBOARD (Jika tipe OPNAME) -->
              <q-card
                flat
                bordered
                class="bg-blue-1 rounded-20 q-mb-xl border-indigo-thin shadow-sm"
                v-if="selectedItem.tipe === 'OPNAME'"
              >
                <q-card-section
                  class="q-pa-lg bg-white border-bottom text-weight-bold text-indigo-10 uppercase tracking-widest flex items-center"
                >
                  <q-icon name="balance" class="q-mr-sm" color="primary" /> Dashboard Rekonsiliasi
                  Stok Fisik
                </q-card-section>
                <q-card-section class="row q-col-gutter-lg text-center q-pa-xl">
                  <div class="col-12 col-sm-4">
                    <div class="text-overline text-grey-7 font-black uppercase">Data Sistem</div>
                    <div class="text-h3 text-weight-black text-dark">
                      {{ selectedItem.stok_sebelum }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4 border-left-dashed">
                    <div class="text-overline text-grey-7 font-black uppercase">
                      Hasil Audit Fisik
                    </div>
                    <div class="text-h3 text-weight-black text-primary">
                      {{ selectedItem.stok_sesudah }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4 border-left-dashed">
                    <div class="text-overline text-grey-7 font-black uppercase">Selisih (GAP)</div>
                    <div
                      class="text-h3 text-weight-black"
                      :class="selectedItem.selisih < 0 ? 'text-negative' : 'text-positive'"
                    >
                      {{ selectedItem.selisih > 0 ? '+' : '' }}{{ selectedItem.selisih }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- 6. DOCUMENTATION GALLERY -->
              <div
                class="q-mb-xl"
                v-if="
                  (selectedItem.dokumentasi_urls && selectedItem.dokumentasi_urls.length) ||
                  (selectedItem.bukti_urls && selectedItem.bukti_urls.length)
                "
              >
                <div
                  class="text-h6 text-weight-black text-indigo-10 uppercase q-mb-md flex items-center letter-spacing-1"
                >
                  <q-icon name="camera_alt" class="q-mr-sm" size="md" /> Dokumentasi Lampiran
                  Digital
                </div>
                <div class="row q-col-gutter-lg">
                  <div
                    class="col-12 col-sm-6 col-md-4"
                    v-for="(doc, uIdx) in selectedItem.dokumentasi_urls || selectedItem.bukti_urls"
                    :key="uIdx"
                  >
                    <q-card
                      flat
                      bordered
                      class="rounded-20 bg-white shadow-premium hover-shadow transition-all overflow-hidden border-subtle"
                    >
                      <q-card-section class="q-pa-sm">
                        <template v-if="typeof doc === 'object'">
                          <div
                            v-if="doc.mimeType?.includes('image')"
                            class="q-mb-sm overflow-hidden rounded-borders"
                          >
                            <q-img
                              :src="doc.url"
                              class="cursor-pointer"
                              style="height: 200px"
                              fit="cover"
                              @click="openLink(doc.url)"
                            />
                          </div>
                          <div
                            v-else
                            class="flex flex-center q-pa-lg bg-grey-2 rounded-borders q-mb-sm"
                            style="height: 200px"
                          >
                            <q-icon name="description" size="80px" color="blue-grey-4" />
                          </div>
                          <div
                            class="text-center text-weight-bold text-blue-grey-9 q-mt-sm ellipsis q-px-md"
                          >
                            {{ doc.label || 'Berkas Lampiran' }}
                          </div>
                          <q-btn
                            unelevated
                            color="indigo-10"
                            class="full-width q-mt-md rounded-borders text-weight-black shadow-2"
                            icon="open_in_new"
                            label="LIHAT BERKAS"
                            @click="openLink(doc.url)"
                          />
                        </template>
                        <template v-else>
                          <q-img
                            :src="doc"
                            class="rounded-borders q-mb-sm cursor-pointer"
                            style="height: 200px"
                            fit="cover"
                            @click="openLink(doc)"
                          />
                          <q-btn
                            unelevated
                            color="indigo-10"
                            class="full-width rounded-borders text-weight-black"
                            icon="open_in_new"
                            label="BUKA FOTO"
                            @click="openLink(doc)"
                          />
                        </template>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <div class="q-py-xl"></div>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <div
          class="bg-white q-pa-md text-center text-grey-5 text-caption uppercase letter-spacing-1 font-black"
        >
          Sistem Logistik Agra ERP • Internal Transaction Audit Log
        </div>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { db } from 'src/boot/firebase'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { useQuasar } from 'quasar'

// eslint-disable-next-line no-unused-vars
const $q = useQuasar()
const route = useRoute()
const riwayatList = ref([])
const filter = ref('')
const loading = ref(true)
const typeFilter = ref('ALL')

// State Detail
const showDetailDialog = ref(false)
const selectedItem = ref(null)

// TANGKAP POSISI GUDANG SAAT INI DARI URL (?warehouseId=...)
const warehouseId = computed(() => route.query.warehouseId || null)

// Definisi Kolom Tabel Utama (LOKASI GUDANG DIHAPUS)
const columns = [
  { name: 'tipe', label: 'TRANSAKSI', field: 'tipe', align: 'center', sortable: true },
  {
    name: 'nama_barang',
    label: 'IDENTITAS MATERIAL',
    field: 'nama_barang',
    align: 'left',
    sortable: true,
  },
  { name: 'jumlah', label: 'VOL', field: 'jumlah', align: 'center', sortable: true },
  { name: 'timestamp', label: 'WAKTU', field: 'timestamp', align: 'left', sortable: true },
  { name: 'ref', label: 'DOK. REFERENSI', field: 'no_referensi', align: 'left', sortable: true },
  { name: 'no_spk', label: 'NO. SPK', field: 'no_spk', align: 'left', sortable: true },
]

// Computed Logic untuk Filter Tipe
const filteredRows = computed(() => {
  let data = riwayatList.value
  if (typeFilter.value !== 'ALL') {
    data = data.filter((it) => it.tipe === typeFilter.value)
  }
  return data
})

const getTipeColor = (tipe) => {
  switch (tipe) {
    case 'MASUK':
      return 'positive'
    case 'KELUAR':
      return 'orange-8'
    case 'OPNAME':
      return 'indigo-8'
    default:
      return 'grey-7'
  }
}

const getTipeIcon = (tipe) => {
  switch (tipe) {
    case 'MASUK':
      return 'download'
    case 'KELUAR':
      return 'upload'
    case 'OPNAME':
      return 'analytics'
    default:
      return 'history'
  }
}

const getAmountColor = (tipe) => {
  switch (tipe) {
    case 'MASUK':
      return 'text-green-9'
    case 'KELUAR':
      return 'text-orange-9'
    case 'OPNAME':
      return 'text-indigo-9'
    default:
      return 'text-grey-9'
  }
}

const formatDate = (ts) => {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const openDetail = (row) => {
  selectedItem.value = row
  showDetailDialog.value = true
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

// Fetch data secara real-time dengan filter ID GUDANG
onMounted(() => {
  loading.value = true

  // LOGIKA FILTER POSISI GUDANG: Hanya ambil aktivitas sesuai warehouseId
  let q = query(collection(db, 'aktivitas'), orderBy('timestamp', 'desc'))
  if (warehouseId.value) {
    q = query(
      collection(db, 'aktivitas'),
      where('id_gudang', '==', warehouseId.value),
      orderBy('timestamp', 'desc'),
    )
  }

  onSnapshot(
    q,
    (snapshot) => {
      riwayatList.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Firestore Error:', err)
      loading.value = false
    },
  )
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
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 15px 45px rgba(26, 35, 126, 0.12);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-left-dashed {
  border-left: 2px dashed rgba(0, 0, 0, 0.1);
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.history-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.perfectionist-table {
  border-collapse: collapse;
  width: 100%;
  border: 1px solid #e0e0e0;
}
.perfectionist-table th {
  font-size: 11px;
  letter-spacing: 0.1em;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.perfectionist-table td {
  padding: 15px;
  border: 1px solid #f0f0f0;
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

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.leading-none {
  line-height: 1;
}
.leading-relaxed {
  line-height: 1.6;
}
.shrink {
  flex: 0 0 auto;
}
.font-black {
  font-weight: 900;
}
.font-11 {
  font-size: 11px;
}

.underline {
  text-decoration: underline;
}

@media (min-width: 600px) {
  .border-left-gt-xs {
    border-left: 2px solid #e8eaf6;
  }
  .border-left-gt-sm {
    border-left: 2px solid #e8eaf6;
  }
}
</style>
