<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade">
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
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white">
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
              <div class="text-caption text-grey-6">Total Aktivitas:</div>
              <q-badge color="indigo-10" class="q-px-md q-py-xs text-weight-bold">
                {{ riwayatList.length }} Record
              </q-badge>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE SECTION -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white">
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
        <!-- Custom Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-indigo-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom Body -->
        <template v-slot:body="props">
          <q-tr :props="props" class="hover-bg transition-all">
            <!-- Tipe Cell -->
            <q-td key="tipe" class="text-center">
              <q-chip
                :color="getTipeColor(props.row.tipe)"
                text-color="white"
                size="sm"
                class="text-weight-bold uppercase"
                :icon="getTipeIcon(props.row.tipe)"
              >
                {{ props.row.tipe }}
              </q-chip>
            </q-td>

            <!-- Nama Barang Cell -->
            <q-td key="nama_barang">
              <div class="text-weight-bold text-blue-grey-10 text-subtitle2">
                {{ props.row.nama_barang }}
              </div>
              <div class="text-caption text-grey-6" v-if="props.row.tipe === 'OPNAME'">
                Selisih: {{ props.row.stok_sesudah - props.row.stok_sebelum }} Unit
              </div>
            </q-td>

            <!-- Jumlah Cell -->
            <q-td key="jumlah" class="text-center">
              <div class="text-weight-black text-h6" :class="getAmountColor(props.row.tipe)">
                {{ props.row.tipe === 'KELUAR' ? '-' : props.row.tipe === 'MASUK' ? '+' : ''
                }}{{ props.row.jumlah }}
              </div>
              <div class="text-caption text-grey-5 uppercase text-weight-bold">
                {{ props.row.satuan || 'UNIT' }}
              </div>
            </q-td>

            <!-- Waktu Cell -->
            <q-td key="timestamp">
              <div class="text-weight-medium text-blue-grey-9">
                {{
                  props.row.timestamp
                    ? props.row.timestamp
                        .toDate()
                        .toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                    : '-'
                }}
              </div>
              <div class="text-caption text-grey-5 italic">
                Pukul
                {{
                  props.row.timestamp
                    ? props.row.timestamp
                        .toDate()
                        .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    : '-'
                }}
              </div>
            </q-td>

            <!-- Referensi Cell -->
            <q-td key="ref">
              <div class="row items-center no-wrap">
                <q-icon
                  :name="props.row.no_referensi ? 'receipt' : 'foundation'"
                  color="grey-6"
                  class="q-mr-xs"
                />
                <span class="text-weight-bold text-indigo-9">{{
                  props.row.no_referensi || props.row.no_spk || '-'
                }}</span>
              </div>
              <div class="text-caption text-grey-6 ellipsis" style="max-width: 150px">
                Ket: {{ props.row.keterangan || props.row.catatan || 'Tanpa keterangan' }}
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- No Data State -->
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

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

const riwayatList = ref([])
const filter = ref('')
const loading = ref(true)

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
      console.error(err)
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
.shadow-premium {
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
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
</style>
