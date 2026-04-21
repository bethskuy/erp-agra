<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Production Result</div>
        <div class="text-subtitle2 text-grey-6">
          Pencatatan hasil jadi dan pemotongan stok otomatis
        </div>
      </div>
      <q-btn color="teal-10" icon="add" label="Tambah Hasil" @click="openDialog" />
    </div>

    <q-card flat class="rounded-borders shadow-sm">
      <q-table :rows="rows" :columns="columns" row-key="id" flat bordered>
        <template v-slot:no-data>
          <div class="full-width text-center q-pa-md text-grey">Belum ada hasil produksi 🚧</div>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn dense flat icon="delete" color="negative" @click="hapusData(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 450px" class="rounded-borders">
        <q-card-section class="bg-teal-10 text-white">
          <div class="text-h6">Input Hasil Produksi</div>
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <q-select
            outlined
            v-model="selectedWO"
            :options="woOptions"
            option-label="productName"
            label="Pilih Work Order"
            behavior="menu"
            @update:model-value="fetchBOMForWO"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.productName }}</q-item-label>
                  <q-item-label caption
                    >Kode: {{ scope.opt.kode || scope.opt.id.substring(0, 5) }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            outlined
            v-model.number="form.jumlah_hasil"
            type="number"
            label="Jumlah Hasil Jadi"
            suffix="Unit"
          />

          <q-input
            outlined
            v-model="form.keterangan"
            type="textarea"
            label="Keterangan / Catatan QC"
            placeholder="Contoh: Produksi lancar, kualitas oke"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn unelevated color="teal-10" label="Simpan & Potong Stok" @click="simpanData" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'

const $q = useQuasar()

// ================= STATE =================
const dialog = ref(false)
const rows = ref([])
const woOptions = ref([])
const selectedWO = ref(null)
const currentBOM = ref(null)

const form = ref({
  work_order_id: '',
  jumlah_hasil: 0,
  keterangan: '',
})

// ================= TABLE COLUMNS =================
const columns = [
  {
    name: 'tanggal',
    label: 'TANGGAL',
    field: (row) => (row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : '-'),
    align: 'left',
  },
  { name: 'wo', label: 'WORK ORDER', field: 'productName', align: 'left' },
  { name: 'jumlah_hasil', label: 'JUMLAH', field: 'jumlah_hasil', align: 'center' },
  { name: 'keterangan', label: 'KETERANGAN', field: 'keterangan', align: 'left' },
  { name: 'actions', label: 'AKSI', align: 'center' },
]

// ================= FETCH DATA =================
const getWO = async () => {
  const snapshot = await getDocs(collection(db, 'work_orders'))
  woOptions.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

const getData = () => {
  onSnapshot(collection(db, 'production_results'), (snapshot) => {
    rows.value = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
  })
}

// AMBIL BOM BERDASARKAN PRODUK DI WO
const fetchBOMForWO = async (val) => {
  if (!val) return
  form.value.work_order_id = val.id

  const q = query(collection(db, 'boms'), where('productName', '==', val.productName))
  const bomSnap = await getDocs(q)

  if (!bomSnap.empty) {
    currentBOM.value = bomSnap.docs[0].data()
  } else {
    $q.notify({ type: 'negative', message: 'BOM (Resep) tidak ditemukan untuk produk ini!' })
    currentBOM.value = null
  }
}

// ================= LOGIKA SIMPAN & POTONG STOK =================
const simpanData = async () => {
  if (!form.value.work_order_id || form.value.jumlah_hasil <= 0) {
    $q.notify({ type: 'warning', message: 'Lengkapi data produksi!' })
    return
  }

  if (!currentBOM.value) {
    $q.notify({ type: 'negative', message: 'Gagal: Resep BOM tidak ditemukan!' })
    return
  }

  try {
    $q.loading.show({ message: 'Menghitung pemakaian stok...' })

    // 1. Simpan ke Production Results
    await addDoc(collection(db, 'production_results'), {
      ...form.value,
      productName: selectedWO.value.productName,
      createdAt: new Date(),
    })

    // 2. LOGIKA POTONG STOK (ERP Standard)
    for (const item of currentBOM.value.materials) {
      const materialRef = doc(db, 'materials', item.materialId)
      // Hitung total pemakaian: (jumlah unit diproduksi) * (kebutuhan per unit di BOM)
      const totalPemakaian = item.qty * form.value.jumlah_hasil

      await updateDoc(materialRef, {
        stok: increment(-totalPemakaian), // Mengurangi stok otomatis
      })
    }

    $q.notify({ color: 'positive', message: 'Hasil dicatat & Stok material telah berkurang! ✅' })
    dialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal memproses data' })
  } finally {
    $q.loading.hide()
  }
}

const openDialog = () => {
  form.value = { work_order_id: '', jumlah_hasil: 0, keterangan: '' }
  selectedWO.value = null
  currentBOM.value = null
  dialog.value = true
}

const hapusData = async (id) => {
  $q.dialog({
    title: 'Hapus Data?',
    message: 'Data hasil produksi akan dihapus.',
    cancel: true,
  }).onOk(async () => {
    await deleteDoc(doc(db, 'production_results', id))
  })
}

onMounted(async () => {
  await getWO()
  getData()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.shadow-sm {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
</style>
