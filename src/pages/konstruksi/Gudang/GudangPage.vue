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
            <q-item-label caption>Pusat logistik material & stock opname</q-item-label>
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
            <q-item-label caption>Proyek: {{ p.lokasi || 'Lokasi tidak tersedia' }}</q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <div v-else>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-card class="bg-primary text-white shadow-2"
            ><q-card-section
              ><div class="text-subtitle2">Total Item</div>
              <div class="text-h4 text-weight-bold">{{ stokBarang.length }}</div></q-card-section
            ></q-card
          >
        </div>
        <div class="col-12 col-md-4">
          <q-card class="bg-orange-8 text-white shadow-2"
            ><q-card-section
              ><div class="text-subtitle2">Stok Kritis</div>
              <div class="text-h4 text-weight-bold">
                {{ stokBarang.filter((i) => i.jumlah < 10).length }}
              </div></q-card-section
            ></q-card
          >
        </div>
        <div class="col-12 col-md-4">
          <q-card class="bg-indigo-8 text-white shadow-2"
            ><q-card-section
              ><div class="text-subtitle2">Total Nilai Aset</div>
              <div class="text-h4 text-weight-bold">
                Rp
                {{
                  stokBarang
                    .reduce((acc, curr) => acc + curr.jumlah * curr.harga, 0)
                    .toLocaleString()
                }}
              </div></q-card-section
            ></q-card
          >
        </div>
      </div>

      <q-card flat bordered class="rounded-borders shadow-1">
        <q-table
          :title="'Material di ' + selectedGudang.nama"
          :rows="stokBarang"
          :columns="columns"
          row-key="id"
          :filter="filter"
          flat
        >
          <template v-slot:top-right>
            <q-input outlined dense v-model="filter" placeholder="Cari Barang..."
              ><template v-slot:append><q-icon name="search" /></template
            ></q-input>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                icon="add_circle"
                color="positive"
                size="sm"
                @click="openMutasiDialog(props.row, 'MASUK')"
                ><q-tooltip>Barang Masuk</q-tooltip></q-btn
              >
              <q-btn
                flat
                round
                icon="remove_circle"
                color="orange"
                size="sm"
                @click="openMutasiDialog(props.row, 'KELUAR')"
                ><q-tooltip>Barang Keluar</q-tooltip></q-btn
              >
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-dialog v-model="showMutasiDialog">
      <q-card style="width: 400px">
        <q-card-section class="bg-primary text-white"
          ><div class="text-h6">Mutasi {{ tipeMutasi }}</div></q-card-section
        >
        <q-card-section class="q-pt-md">
          <div class="text-weight-bold q-mb-sm">{{ activeItem.nama_barang }}</div>
          <q-input v-model.number="jumlahMutasi" type="number" label="Jumlah" outlined dense />
          <q-input
            v-model="keteranganMutasi"
            label="Keterangan (No PO / Proyek)"
            outlined
            dense
            class="q-mt-md"
          />
        </q-card-section>
        <q-card-actions align="right"
          ><q-btn flat label="Batal" v-close-popup /><q-btn
            color="primary"
            label="Simpan"
            @click="prosesMutasi"
        /></q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore'

const listProyek = ref([])
const selectedGudang = ref(null)
const stokBarang = ref([])
const filter = ref('')
const showMutasiDialog = ref(false)
const tipeMutasi = ref('')
const activeItem = ref({})
const jumlahMutasi = ref(0)
const keteranganMutasi = ref('')
let unsubscribe = null

const columns = [
  { name: 'nama', label: 'NAMA BARANG', field: 'nama_barang', align: 'left', sortable: true },
  { name: 'stok', label: 'STOK FISIK', field: 'jumlah', align: 'center' },
  { name: 'satuan', label: 'SATUAN', field: 'satuan', align: 'center' },
  { name: 'aksi', label: 'AKSI', field: 'id', align: 'center' },
]

const selectGudang = (gudang) => {
  selectedGudang.value = gudang
}

const openMutasiDialog = (item, type) => {
  activeItem.value = item
  tipeMutasi.value = type
  showMutasiDialog.value = true
}

// Fungsi Integrasi (Proses ke Firestore)
const prosesMutasi = async () => {
  const refDoc = doc(db, 'stok_barang', activeItem.value.id)
  const nilai = tipeMutasi.value === 'MASUK' ? jumlahMutasi.value : -jumlahMutasi.value
  await updateDoc(refDoc, { jumlah: increment(nilai) })
  showMutasiDialog.value = false
  jumlahMutasi.value = 0
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
