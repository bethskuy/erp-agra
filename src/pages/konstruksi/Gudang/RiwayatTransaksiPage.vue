<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <div class="q-ml-sm">
        <div class="text-h6 text-weight-bold text-indigo-10">Riwayat Transaksi</div>
        <div class="text-caption text-grey-7">Log aktivitas barang masuk, keluar, dan opname</div>
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table
        :rows="riwayatList"
        :columns="columns"
        row-key="id"
        :filter="filter"
        flat
        rows-per-page-options="[10, 20, 50]"
      >
        <template v-slot:top-right>
          <q-input outlined dense v-model="filter" placeholder="Cari aktivitas...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-tipe="props">
          <q-td :props="props">
            <q-badge :color="getTipeColor(props.row.tipe)" class="q-pa-xs">
              {{ props.row.tipe }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

const riwayatList = ref([])
const filter = ref('')

const columns = [
  { name: 'tipe', label: 'TIPE', field: 'tipe', align: 'center', sortable: true },
  {
    name: 'nama_barang',
    label: 'NAMA BARANG',
    field: 'nama_barang',
    align: 'left',
    sortable: true,
  },
  { name: 'jumlah', label: 'JUMLAH', field: 'jumlah', align: 'center' },
  {
    name: 'timestamp',
    label: 'WAKTU',
    field: 'timestamp',
    align: 'left',
    sortable: true,
    format: (val) => (val ? val.toDate().toLocaleString('id-ID') : '-'),
  },
  {
    name: 'ref',
    label: 'REFERENSI',
    field: (row) => row.no_referensi || row.no_spk || '-',
    align: 'left',
  },
]

const getTipeColor = (tipe) => {
  switch (tipe) {
    case 'MASUK':
      return 'positive'
    case 'KELUAR':
      return 'orange'
    case 'OPNAME':
      return 'primary'
    default:
      return 'grey'
  }
}

// Fetch data secara real-time
onMounted(() => {
  const q = query(collection(db, 'aktivitas'), orderBy('timestamp', 'desc'))
  onSnapshot(q, (snapshot) => {
    riwayatList.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
