<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase letter-spacing-1">
          Manajemen Gudang
        </div>
        <div class="text-caption text-grey-7 uppercase">
          {{ selectedGudang ? 'Detail Stok: ' + selectedGudang.nama : 'Daftar Lokasi Gudang' }}
        </div>
      </div>
      <div class="col-auto" v-if="selectedGudang">
        <q-btn flat icon="arrow_back" label="Kembali" @click="selectedGudang = null" />
      </div>
    </div>

    <q-card v-if="!selectedGudang" flat bordered class="rounded-borders shadow-1">
      <q-list separator>
        <q-item clickable v-ripple @click="selectGudang({ id: 'UTAMA', nama: 'Gudang Utama' })">
          <q-item-section avatar><q-icon name="warehouse" color="indigo-10" /></q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">GUDANG UTAMA</q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>

        <q-item
          v-for="p in listProyek"
          :key="p.id"
          clickable
          v-ripple
          @click="selectGudang({ id: p.id, nama: 'Gudang ' + (p.nama_proyek || p.nama) })"
        >
          <q-item-section avatar><q-icon name="construction" color="primary" /></q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold"
              >GUDANG {{ p.nama_proyek || p.nama }}</q-item-label
            >
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <div v-else>
      <div class="row q-gutter-sm q-mb-md">
        <q-btn
          color="primary"
          label="Stok Opname"
          :to="`/konstruksi/gudang/opname/${selectedGudang.id}`"
        />

        <q-btn-dropdown color="primary" label="Transaksi">
          <q-list>
            <q-item clickable to="/konstruksi/gudang/transaksi">
              <q-item-section>Riwayat Transaksi</q-item-section>
            </q-item>
            <q-item clickable :to="`/konstruksi/gudang/masuk/${selectedGudang.id}`">
              <q-item-section>Barang Masuk</q-item-section>
            </q-item>
            <q-item clickable :to="`/konstruksi/gudang/keluar/${selectedGudang.id}`">
              <q-item-section>Barang Keluar</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn
          color="indigo-10"
          icon="add"
          label="Tambah Barang"
          to="/konstruksi/master/barang-list"
        />
      </div>

      <q-card flat bordered class="rounded-borders shadow-1">
        <q-table
          :title="'Stok Barang di ' + selectedGudang.nama"
          :rows="stokBarang"
          :columns="columns"
          row-key="id"
          :filter="filter"
          flat
        >
          <template v-slot:top-right>
            <q-input outlined dense v-model="filter" placeholder="Cari Barang...">
              <template v-slot:append><q-icon name="search" /></template>
            </q-input>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'

const listProyek = ref([])
const selectedGudang = ref(null)
const stokBarang = ref([])
const filter = ref('')
let unsubscribe = null

const columns = [
  { name: 'nama', label: 'NAMA BARANG', field: 'nama_barang', align: 'left', sortable: true },
  { name: 'stok', label: 'STOK FISIK', field: 'jumlah', align: 'center' },
  { name: 'satuan', label: 'SATUAN', field: 'satuan', align: 'center' },
]

const selectGudang = (gudang) => {
  selectedGudang.value = gudang
}

const fetchProyek = async () => {
  const snap = await getDocs(collection(db, 'proyek'))
  listProyek.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

watch(selectedGudang, (newVal) => {
  if (unsubscribe) unsubscribe()
  if (newVal) {
    const q = query(collection(db, 'stok_barang'), where('id_gudang', '==', newVal.id))
    unsubscribe = onSnapshot(q, (snapshot) => {
      stokBarang.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    })
  }
})

onMounted(fetchProyek)
</script>

<style scoped>
.font-pro {
  font-family: 'Inter', sans-serif;
}
.rounded-borders {
  border-radius: 12px;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
</style>
