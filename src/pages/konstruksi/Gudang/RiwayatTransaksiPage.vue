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
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Log Mutasi & Aktivitas Gudang</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Pantau seluruh rekam jejak keluar masuknya material secara real-time.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUMMARY & FILTER CARD -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari Barang, No. Referensi, atau No. SPK..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space />
          <div class="col-12 col-md-auto">
            <div class="row q-gutter-sm items-center">
              <div class="text-caption text-grey-6 italic">
                Klik baris untuk melihat rincian bukti
              </div>
              <q-badge color="indigo-10" class="q-px-md q-py-xs text-weight-bold shadow-2">
                {{ riwayatList.length }} Record
              </q-badge>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE SECTION -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="riwayatList"
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
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
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

            <q-td key="nama_barang">
              <div class="text-weight-bold text-blue-grey-10 text-subtitle2 uppercase">
                {{ props.row.nama_barang }}
              </div>
              <div class="text-caption text-grey-6 flex items-center" v-if="props.row.id_gudang">
                <q-icon name="warehouse" size="10px" class="q-mr-xs" />
                Gudang: {{ props.row.id_gudang }}
              </div>
            </q-td>

            <q-td key="jumlah" class="text-center">
              <div class="text-weight-black text-h6" :class="getAmountColor(props.row.tipe)">
                {{ props.row.tipe === 'KELUAR' ? '-' : props.row.tipe === 'MASUK' ? '+' : ''
                }}{{ props.row.jumlah }}
              </div>
              <div class="text-caption text-grey-5 uppercase text-weight-bold">
                {{ props.row.satuan || 'UNIT' }}
              </div>
            </q-td>

            <q-td key="timestamp">
              <div class="text-weight-medium text-blue-grey-9">
                {{ formatDate(props.row.timestamp) }}
              </div>
              <div class="text-caption text-grey-5 italic">
                Pukul {{ formatTime(props.row.timestamp) }}
              </div>
            </q-td>

            <q-td key="ref">
              <div class="row items-center no-wrap">
                <q-icon
                  :name="props.row.no_referensi ? 'receipt' : 'foundation'"
                  color="indigo-10"
                  class="q-mr-xs shadow-sm"
                />
                <span class="text-weight-bold text-indigo-9">{{
                  props.row.no_referensi || props.row.no_spk || '-'
                }}</span>
              </div>
              <div class="text-caption text-grey-6 ellipsis" style="max-width: 150px">
                {{ props.row.keterangan || props.row.catatan || 'Tanpa catatan' }}
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="history" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center italic">
              Belum ada riwayat aktivitas gudang
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- MODERN DETAIL DIALOG (MAXIMIZED VIEW) -->
    <q-dialog
      v-model="showDetailDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(4px)"
    >
      <q-card class="column no-wrap overflow-hidden bg-grey-2" v-if="selectedItem">
        <!-- Header Toolbar (Fixed at Top) -->
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink">
          <q-icon name="info" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold uppercase letter-spacing-1"
            >Lembar Detail Transaksi</q-toolbar-title
          >
          <q-btn icon="close" flat round dense v-close-popup />
        </q-toolbar>

        <!-- Main Content Area (Scrollable) -->
        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-10 col-lg-8">
              <!-- Header Info: Tipe & Waktu -->
              <div class="row justify-between items-center q-mb-xl animate-fade">
                <div class="column">
                  <div
                    class="text-overline text-grey-6 leading-none q-mb-sm uppercase tracking-widest"
                  >
                    Klasifikasi Aktivitas
                  </div>
                  <q-chip
                    :color="getTipeColor(selectedItem.tipe)"
                    text-color="white"
                    class="text-weight-black q-px-xl q-py-md shadow-2"
                  >
                    <q-icon :name="getTipeIcon(selectedItem.tipe)" class="q-mr-sm" />
                    {{ selectedItem.tipe }}
                  </q-chip>
                </div>
                <div class="text-right">
                  <div
                    class="text-overline text-grey-6 leading-none q-mb-xs uppercase tracking-widest"
                  >
                    Waktu Tercatat
                  </div>
                  <div class="text-h6 text-weight-bold text-blue-grey-10">
                    {{ formatDate(selectedItem.timestamp) }}
                  </div>
                  <div class="text-subtitle2 text-primary font-bold">
                    Pukul {{ formatTime(selectedItem.timestamp) }} WIB
                  </div>
                </div>
              </div>

              <!-- Main Material Card -->
              <q-card
                flat
                bordered
                class="rounded-20 bg-white shadow-premium q-mb-xl border-indigo-thin overflow-hidden"
              >
                <q-card-section class="q-pa-xl">
                  <div class="row q-col-gutter-xl items-center">
                    <div class="col-12 col-md-7">
                      <div
                        class="text-overline text-grey-6 leading-none q-mb-sm uppercase font-bold tracking-widest"
                      >
                        Identitas Material
                      </div>
                      <div class="text-h3 text-weight-black text-indigo-10 uppercase leading-tight">
                        {{ selectedItem.nama_barang }}
                      </div>
                      <div
                        class="text-subtitle1 text-grey-6 q-mt-sm flex items-center uppercase font-bold"
                      >
                        <q-icon name="warehouse" color="primary" class="q-mr-xs" />
                        Lokasi: {{ selectedItem.id_gudang || 'Gudang Utama' }}
                      </div>
                    </div>

                    <div class="col-12 col-md-5 text-center text-md-right border-left-gt-sm">
                      <div
                        class="text-overline text-grey-6 leading-none q-mb-sm uppercase font-bold tracking-widest"
                      >
                        Volume Transaksi
                      </div>
                      <div
                        class="text-h2 text-weight-black"
                        :class="getAmountColor(selectedItem.tipe)"
                      >
                        {{
                          selectedItem.tipe === 'KELUAR'
                            ? '-'
                            : selectedItem.tipe === 'MASUK'
                              ? '+'
                              : ''
                        }}{{ selectedItem.jumlah }}
                      </div>
                      <q-badge
                        color="blue-grey-1"
                        text-color="blue-grey-10"
                        class="q-px-lg q-py-xs text-h6 text-weight-bold uppercase"
                      >
                        {{ selectedItem.satuan || 'UNIT' }}
                      </q-badge>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Opname Details (Special) -->
              <q-card
                flat
                bordered
                class="bg-indigo-1 rounded-20 q-mb-xl border-indigo-thin shadow-sm"
                v-if="selectedItem.tipe === 'OPNAME'"
              >
                <q-card-section class="row q-col-gutter-lg text-center q-pa-xl">
                  <div class="col-12 col-sm-4">
                    <div class="text-overline text-grey-7 font-bold uppercase">Stok Sistem</div>
                    <div class="text-h4 text-weight-black text-dark">
                      {{ selectedItem.stok_sebelum }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4 border-left-dashed">
                    <div class="text-overline text-grey-7 font-bold uppercase">Stok Fisik</div>
                    <div class="text-h4 text-weight-black text-primary">
                      {{ selectedItem.stok_sesudah }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4 border-left-dashed">
                    <div class="text-overline text-grey-7 font-bold uppercase">Selisih (GAP)</div>
                    <div
                      class="text-h4 text-weight-black"
                      :class="selectedItem.selisih < 0 ? 'text-negative' : 'text-positive'"
                    >
                      {{ selectedItem.selisih > 0 ? '+' : '' }}{{ selectedItem.selisih }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Metadata Section -->
              <div class="row q-col-gutter-lg q-mb-xl">
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-borders bg-white h-full shadow-sm">
                    <q-card-section class="q-pa-lg">
                      <div class="text-overline text-grey-6 uppercase font-bold q-mb-sm">
                        Dokumen Referensi
                      </div>
                      <div class="row items-center no-wrap bg-blue-grey-1 q-pa-md rounded-borders">
                        <q-icon name="tag" color="indigo-10" size="sm" class="q-mr-md" />
                        <div class="text-h6 text-weight-black text-indigo-10">
                          {{ selectedItem.no_referensi || selectedItem.no_spk || 'NON-REFERENSI' }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-borders bg-white h-full shadow-sm">
                    <q-card-section class="q-pa-lg">
                      <div class="text-overline text-grey-6 uppercase font-bold q-mb-sm">
                        Catatan / Justifikasi
                      </div>
                      <div class="text-body1 text-blue-grey-9 italic leading-relaxed">
                        "{{
                          selectedItem.keterangan ||
                          selectedItem.catatan ||
                          'Tidak ada catatan tambahan untuk transaksi ini.'
                        }}"
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Evidence Section (Digital Attachments) -->
              <div
                class="q-mb-xl"
                v-if="
                  (selectedItem.bukti_urls && selectedItem.bukti_urls.length) ||
                  (selectedItem.bukti_terima_urls && selectedItem.bukti_terima_urls.length)
                "
              >
                <div
                  class="text-h6 text-indigo-10 text-weight-black uppercase q-mb-md flex items-center letter-spacing-1"
                >
                  <q-icon name="attach_file" class="q-mr-sm" /> Bukti Lampiran Digital
                </div>
                <div class="row q-col-gutter-md">
                  <div
                    class="col-12 col-sm-6 col-md-4"
                    v-for="(url, uIdx) in selectedItem.bukti_urls || selectedItem.bukti_terima_urls"
                    :key="uIdx"
                  >
                    <q-card
                      flat
                      bordered
                      class="rounded-borders bg-white shadow-sm hover-shadow transition-all overflow-hidden"
                    >
                      <q-card-section class="q-pa-sm text-center">
                        <q-icon
                          name="description"
                          size="xl"
                          color="grey-4"
                          v-if="url.includes('.pdf')"
                        />
                        <q-img
                          :src="url"
                          v-else
                          class="rounded-borders"
                          style="height: 120px"
                          fit="cover"
                        />
                        <q-btn
                          unelevated
                          color="indigo-10"
                          class="full-width q-mt-sm rounded-borders text-weight-bold"
                          icon="open_in_new"
                          label="Lihat Berkas"
                          @click="openLink(url)"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <div class="q-py-xl"></div>
            </div>
          </div>
        </q-card-section>

        <!-- Footer Fixed Caption -->
        <q-separator />
        <div
          class="bg-white q-pa-md text-center text-grey-6 text-caption uppercase letter-spacing-1 font-bold"
        >
          © 2026 PT AGRA ABHINAYA PERKASA • Internal ERP System Transaction Protocol
        </div>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { useQuasar } from 'quasar'

// eslint-disable-next-line no-unused-vars
const $q = useQuasar()
const riwayatList = ref([])
const filter = ref('')
const loading = ref(true)

// State Detail
const showDetailDialog = ref(false)
const selectedItem = ref(null)

const columns = [
  { name: 'tipe', label: 'JENIS TRANSAKSI', field: 'tipe', align: 'center', sortable: true },
  {
    name: 'nama_barang',
    label: 'IDENTITAS MATERIAL',
    field: 'nama_barang',
    align: 'left',
    sortable: true,
  },
  { name: 'jumlah', label: 'VOL', field: 'jumlah', align: 'center', sortable: true },
  { name: 'timestamp', label: 'WAKTU KEJADIAN', field: 'timestamp', align: 'left', sortable: true },
  {
    name: 'ref',
    label: 'DOKUMEN REFERENSI',
    field: (row) => row.no_referensi || row.no_spk || '-',
    align: 'left',
  },
]

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
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
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

// Fetch data secara real-time
onMounted(() => {
  loading.value = true
  const q = query(collection(db, 'aktivitas'), orderBy('timestamp', 'desc'))
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
.shadow-premium {
  box-shadow: 0 10px 40px rgba(25, 118, 210, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-left-dashed {
  border-left: 1px dashed rgba(0, 0, 0, 0.1);
}

.history-table :deep(thead tr th) {
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
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
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

.comparison-card {
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

@media (min-width: 600px) {
  .border-left-gt-sm {
    border-left: 2px solid #e8eaf6;
  }
}
</style>
